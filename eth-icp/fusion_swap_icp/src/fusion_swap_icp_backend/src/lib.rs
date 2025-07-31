use candid::{CandidType, Deserialize};
use ic_cdk::api::call::call;
use ic_cdk_macros::*;
use icrc_ledger_types::icrc1::{account::Account, transfer::TransferArg};
use icrc_ledger_types::icrc2::transfer_from::TransferFromArgs;
use std::{cell::RefCell, collections::BTreeMap};

type Amount = u128;
const FEE: Amount = 10_000;           // example fixed fee (e8s)

// Define Principal type for compatibility
type Principal = candid::Principal;

// Error handling
#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum FusionError {
    OrderNotFound,
    OrderAlreadyExists,
    InvalidOrderState,
    OrderExpired,
    UnauthorizedCaller,
    InvalidAmount,
    InvalidTimeRange,
    InvalidSecret,
    ReentrancyDetected,
    InsufficientSafetyDeposit,
    TimelockViolation,
    TransferFailed(String),
}

// Hashlock system
#[derive(CandidType, Deserialize, Clone)]
pub struct HashLock {
    pub secret_hash: [u8; 32],        // SHA-256 hash of secret
    pub revealed: bool,
    pub reveal_time: Option<u64>,
}

// Timelock system
#[derive(CandidType, Deserialize, Clone)]
pub struct TimeLock {
    pub finality_lock_duration: u64,   // Chain finality protection
    pub exclusive_withdraw_duration: u64, // Resolver exclusive period  
    pub cancellation_timeout: u64,     // Recovery timeout
    pub created_at: u64,
}

#[derive(CandidType, Deserialize, Clone)]
pub struct FeeConfig {
    pub protocol_fee_bps: u16,
    pub integrator_fee_bps: u16,
    pub surplus_bps: u8,
    pub max_cancel_premium: Amount,
}

#[derive(CandidType, Deserialize, Clone)]
pub struct AuctionData {
    pub start_time: u64,
    pub end_time: u64,
    pub start_price: Amount,
    pub end_price: Amount,
    pub current_price: Amount,
}

#[derive(CandidType, Deserialize, Clone)]
pub enum OrderStatus {
    Announced,
    Active,
    Completed,
    Cancelled,
    Failed(String),
}

#[derive(CandidType, Deserialize, Clone)]
pub struct OrderConfig {
    pub id: u64,
    pub src_mint: Principal,
    pub dst_mint: Principal,
    pub maker: Principal,
    pub src_amount: Amount,
    pub min_dst_amount: Amount,
    pub estimated_dst_amount: Amount,
    pub expiration_time: u64,
    pub fee: FeeConfig,
    pub auction: AuctionData,
    pub cancellation_auction_secs: u32,
    pub hashlock: HashLock,
    pub timelock: TimeLock,
    pub status: OrderStatus,
    pub created_at: u64,
}

// Basic storage using thread_local (will be replaced with stable memory later)
thread_local! {
    static ORDERS: RefCell<BTreeMap<u64, OrderConfig>> = RefCell::new(BTreeMap::new());
}

// Reentrancy protection
thread_local! {
    static REENTRANCY_GUARD: RefCell<bool> = RefCell::new(false);
}

/// Transfer tokens from this canister to another account
async fn icrc2_transfer(
    mint: Principal,
    amount: Amount,
    to: Account,
) -> Result<u128, FusionError> {
    let transfer_arg = TransferArg {
        from_subaccount: None,
        to,
        amount: amount.into(),
        fee: Some(FEE.into()),
        memo: None,
        created_at_time: None,
    };

    let (result,): (Result<u128, String>,) =
        call(mint, "icrc1_transfer", (transfer_arg,))
        .await
        .map_err(|(_, msg)| FusionError::TransferFailed(msg))?;

    result.map_err(|msg| FusionError::TransferFailed(msg))
}

/// Transfer tokens from another account to this canister
async fn icrc2_transfer_from(
    mint: Principal,
    args: TransferFromArgs,
) -> Result<u128, FusionError> {
    let (result,): (Result<u128, String>,) =
        call(mint, "icrc2_transfer_from", (args,))
            .await
            .map_err(|(_, msg)| FusionError::TransferFailed(msg))?;

    result.map_err(|msg| FusionError::TransferFailed(msg))
}

// Input validation
fn validate_order_params(order: &OrderConfig) -> Result<(), FusionError> {
    if order.src_amount == 0 || order.min_dst_amount == 0 {
        return Err(FusionError::InvalidAmount);
    }
    
    if order.auction.start_time >= order.auction.end_time {
        return Err(FusionError::InvalidTimeRange);
    }
    
    if order.src_mint == order.dst_mint {
        return Err(FusionError::InvalidAmount);
    }
    
    Ok(())
}

// Hashlock validation
fn validate_secret(hashlock: &HashLock, secret: &[u8]) -> Result<(), FusionError> {
    use sha2::{Sha256, Digest};
    
    let mut hasher = Sha256::new();
    hasher.update(secret);
    let computed_hash: [u8; 32] = hasher.finalize().into();
    
    if computed_hash != hashlock.secret_hash {
        return Err(FusionError::InvalidSecret);
    }
    
    Ok(())
}

// Timelock validation
fn validate_timelock(timelock: &TimeLock) -> Result<(), FusionError> {
    let current_time = ic_cdk::api::time() / 1_000_000_000;
    
    if current_time < timelock.created_at + timelock.finality_lock_duration {
        return Err(FusionError::TimelockViolation);
    }
    
    Ok(())
}

/// Create order – maker must have *approved* `src_amount + FEE` for this canister.
#[ic_cdk::update]
async fn create_order(order: OrderConfig) -> Result<(), FusionError> {
    // Reentrancy protection
    REENTRANCY_GUARD.with(|guard| {
        if *guard.borrow() {
            return Err(FusionError::ReentrancyDetected);
        }
        *guard.borrow_mut() = true;
        Ok(())
    })?;
    
    // Cleanup guard on exit
    let _guard_cleanup = scopeguard::guard((), |_| {
        REENTRANCY_GUARD.with(|guard| *guard.borrow_mut() = false);
    });

    let caller = ic_cdk::caller();
    if caller != order.maker { 
        return Err(FusionError::UnauthorizedCaller); 
    }

    // Validate order parameters
    validate_order_params(&order)?;

    // Check if order already exists
    if ORDERS.with(|map| map.borrow().contains_key(&order.id)) {
        return Err(FusionError::OrderAlreadyExists);
    }

    // Pull tokens into escrow
    let _txid: u128 = icrc2_transfer_from(
        order.src_mint,
        TransferFromArgs {
            spender_subaccount: None,
            from: Account { owner: caller, subaccount: None },
            to: Account { owner: ic_cdk::id(), subaccount: None },
            amount: order.src_amount.into(),
            fee: Some(FEE.into()),
            memo: None,
            created_at_time: None,
        }
    ).await?;

    // Record order
    ORDERS.with(|map| map.borrow_mut().insert(order.id, order));
    Ok(())
}

/// Fill – taker must have approved `dst_amount + FEE`
#[ic_cdk::update]
async fn fill_order(order_id: u64, taker_amount: Amount, secret: Option<Vec<u8>>) -> Result<(), FusionError> {
    // Reentrancy protection
    REENTRANCY_GUARD.with(|guard| {
        if *guard.borrow() {
            return Err(FusionError::ReentrancyDetected);
        }
        *guard.borrow_mut() = true;
        Ok(())
    })?;
    
    // Cleanup guard on exit
    let _guard_cleanup = scopeguard::guard((), |_| {
        REENTRANCY_GUARD.with(|guard| *guard.borrow_mut() = false);
    });

    // Load order
    let mut order = ORDERS.with(|map| {
        map.borrow()
            .get(&order_id)
            .cloned()
            .ok_or(FusionError::OrderNotFound)
    })?;
    
    if ic_cdk::api::time() / 1_000_000_000 >= order.expiration_time {
        return Err(FusionError::OrderExpired);
    }
    
    if taker_amount == 0 || taker_amount > order.src_amount {
        return Err(FusionError::InvalidAmount);
    }

    // Validate secret if provided (for hashlock mechanism)
    if let Some(secret_data) = secret {
        validate_secret(&order.hashlock, &secret_data)?;
        // Mark hashlock as revealed
        order.hashlock.revealed = true;
        order.hashlock.reveal_time = Some(ic_cdk::api::time() / 1_000_000_000);
    }

    // Validate timelock
    validate_timelock(&order.timelock)?;

    // Calculate dst amount based on Dutch auction
    let current_time = ic_cdk::api::time() / 1_000_000_000;
    let dst_amount = if current_time >= order.auction.start_time && current_time <= order.auction.end_time {
        // Dutch auction calculation using linear interpolation formula
        // Calculate the current price based on time interpolation
        let total_duration = order.auction.end_time - order.auction.start_time;
        if total_duration > 0 {
            let current_price = (order.auction.start_price * (order.auction.end_time - current_time) as u128 + 
                               order.auction.end_price * (current_time - order.auction.start_time) as u128) / total_duration as u128;
            // Calculate dst amount based on current price
            (taker_amount * current_price) / order.auction.start_price
        } else {
            // If no duration, use start price
            (taker_amount * order.auction.start_price) / order.auction.start_price
        }
    } else {
        // Use estimated amount if outside auction window
        (taker_amount * order.estimated_dst_amount) / order.src_amount
    };

    if dst_amount < order.min_dst_amount {
        return Err(FusionError::InvalidAmount);
    }

    let caller = ic_cdk::caller();

    // Pull dst tokens from taker → maker
    let _dst_txid: u128 = icrc2_transfer_from(
        order.dst_mint,
        TransferFromArgs {
            spender_subaccount: None,
            from: Account { owner: caller, subaccount: None },
            to: Account { owner: order.maker, subaccount: None },
            amount: dst_amount.into(),
            fee: Some(FEE.into()),
            memo: None,
            created_at_time: None,
        }
    ).await?;

    // Push src tokens from escrow → taker
    let _src_txid: u128 = icrc2_transfer(
        order.src_mint,
        taker_amount,
        Account { owner: caller, subaccount: None }
    ).await?;

    // Update or delete order
    if taker_amount == order.src_amount {
        order.status = OrderStatus::Completed;
        ORDERS.with(|map| map.borrow_mut().remove(&order_id));
    } else {
        order.src_amount -= taker_amount;
        order.status = OrderStatus::Active;
        ORDERS.with(|map| map.borrow_mut().insert(order_id, order));
    }
    
    Ok(())
}

/// Cancel – callable by maker after expiry or by resolver with premium
#[ic_cdk::update]
async fn cancel_order(order_id: u64) -> Result<(), FusionError> {
    // Reentrancy protection
    REENTRANCY_GUARD.with(|guard| {
        if *guard.borrow() {
            return Err(FusionError::ReentrancyDetected);
        }
        *guard.borrow_mut() = true;
        Ok(())
    })?;
    
    // Cleanup guard on exit
    let _guard_cleanup = scopeguard::guard((), |_| {
        REENTRANCY_GUARD.with(|guard| *guard.borrow_mut() = false);
    });

    let caller = ic_cdk::caller();
    let order = ORDERS.with(|map| {
        map.borrow()
            .get(&order_id)
            .cloned()
            .ok_or(FusionError::OrderNotFound)
    })?;

    let current_time = ic_cdk::api::time() / 1_000_000_000;
    let is_expired = current_time >= order.expiration_time;
    let is_maker = caller == order.maker;

    // Check permissions
    if !is_maker && !is_expired {
        return Err(FusionError::UnauthorizedCaller);
    }

    // Calculate refund amount (with potential premium for non-maker cancellations)
    let refund_amount = if is_maker || is_expired {
        order.src_amount
    } else {
        // Non-maker cancellation with premium
        let premium = std::cmp::min(
            order.fee.max_cancel_premium,
            order.src_amount / 10 // 10% premium max
        );
        order.src_amount - premium
    };

    // Refund tokens to maker
    if refund_amount > 0 {
        let _refund_txid: u128 = icrc2_transfer(
            order.src_mint,
            refund_amount,
            Account { owner: order.maker, subaccount: None }
        ).await?;
    }

    // Remove order
    ORDERS.with(|map| map.borrow_mut().remove(&order_id));

    Ok(())
}

/// Get a specific order by ID
#[ic_cdk::query]
fn get_order(id: u64) -> Option<OrderConfig> {
    ORDERS.with(|map| map.borrow().get(&id).cloned())
}

/// Get all orders (for debugging/testing)
#[ic_cdk::query]
fn get_all_orders() -> Vec<OrderConfig> {
    ORDERS.with(|map| map.borrow().values().cloned().collect())
}

/// Get orders by maker
#[ic_cdk::query]
fn get_orders_by_maker(maker: Principal) -> Vec<OrderConfig> {
    ORDERS.with(|map| {
        map.borrow()
            .values()
            .filter(|order| order.maker == maker)
            .cloned()
            .collect()
    })
}

#[ic_cdk::query]
fn greet(name: String) -> String {
    format!("Hello, {}!", name)
}

candid::export_service!();
