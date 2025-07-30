use candid::CandidType;
use ic_cdk::{api::call::call, api::id};
use ic_cdk_macros::*;
use icrc_ledger_types::icrc1::{account::Account, transfer::TransferArg, self as icrc1};
use icrc_ledger_types::icrc2::{self, approve::ApproveArgs, transfer_from::TransferFromArgs};
use std::{cell::RefCell, collections::BTreeMap};

type Amount = u128;
const FEE: Amount = 10_000;           // example fixed fee (e8s)

// Define Principal type for compatibility
type Principal = candid::Principal;

#[derive(CandidType, serde::Deserialize, Clone)]
pub struct FeeConfig {
    pub protocol_fee_bps: u16,
    pub integrator_fee_bps: u16,
    pub surplus_bps: u8,
    pub max_cancel_premium: Amount,
}

#[derive(CandidType, serde::Deserialize, Clone)]
pub struct AuctionData {
    pub start_time: u64,
    pub end_time: u64,
    pub start_price: Amount,
    pub end_price: Amount,
    pub current_price: Amount,
}

#[derive(CandidType, serde::Deserialize, Clone)]
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
}

thread_local! {
    static ORDERS: RefCell<BTreeMap<u64, OrderConfig>> = RefCell::new(BTreeMap::new());
}

/// Transfer tokens from this canister to another account
async fn icrc2_transfer(
    mint: Principal,
    amount: Amount,
    to: Account,
) -> Result<u128, String> {
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
        .map_err(|(_, msg)| msg)?;

    result
}

/// Transfer tokens from another account to this canister
async fn icrc2_transfer_from(
    mint: Principal,
    args: TransferFromArgs,
) -> Result<u128, String> {
    let (result,): (Result<u128, String>,) =
        call(mint, "icrc2_transfer_from", (args,))
            .await
            .map_err(|(_, msg)| msg)?;

    result
}

/// Create order – maker must have *approved* `src_amount + FEE` for this canister.
#[ic_cdk::update]
async fn create_order(order: OrderConfig) -> Result<(), String> {
    let caller = ic_cdk::caller();
    if caller != order.maker { 
        return Err("only maker may create".into()); 
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
async fn fill_order(order_id: u64, taker_amount: Amount) -> Result<(), String> {
    // Load & basic checks
    let mut order = ORDERS.with(|m| m.borrow().get(&order_id).cloned())
        .ok_or("order not found")?;
    
    if ic_cdk::api::time() / 1_000_000_000 >= order.expiration_time {
        return Err("order expired".into());
    }
    
    if taker_amount == 0 || taker_amount > order.src_amount {
        return Err("invalid amount".into());
    }

    // Calculate dst amount based on Dutch auction
    let current_time = ic_cdk::api::time() / 1_000_000_000;
    let dst_amount = if current_time >= order.auction.start_time && current_time <= order.auction.end_time {
        // Dutch auction calculation
        let time_elapsed = current_time - order.auction.start_time;
        let total_duration = order.auction.end_time - order.auction.start_time;
        let price_ratio = if total_duration > 0 {
            time_elapsed as f64 / total_duration as f64
        } else {
            0.0
        };
        
        let current_price = order.auction.start_price - 
            ((order.auction.start_price - order.auction.end_price) as f64 * price_ratio) as Amount;
        
        (taker_amount * current_price) / order.auction.start_price
    } else {
        // Use estimated amount if outside auction window
        (taker_amount * order.estimated_dst_amount) / order.src_amount
    };

    if dst_amount < order.min_dst_amount {
        return Err("insufficient dst amount".into());
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
        ORDERS.with(|m| m.borrow_mut().remove(&order_id));
    } else {
        order.src_amount -= taker_amount;
        ORDERS.with(|m| m.borrow_mut().insert(order_id, order));
    }
    
    Ok(())
}

/// Cancel – callable by maker after expiry or by resolver with premium
#[ic_cdk::update]
async fn cancel_order(order_id: u64) -> Result<(), String> {
    let caller = ic_cdk::caller();
    let order = ORDERS.with(|m| m.borrow_mut().remove(&order_id))
        .ok_or("order missing")?;

    let current_time = ic_cdk::api::time() / 1_000_000_000;
    let is_expired = current_time >= order.expiration_time;
    let is_maker = caller == order.maker;

    // Check permissions
    if !is_maker && !is_expired {
        return Err("only maker can cancel before expiry".into());
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

    Ok(())
}

/// Get a specific order by ID
#[ic_cdk::query]
fn get_order(id: u64) -> Option<OrderConfig> {
    ORDERS.with(|m| m.borrow().get(&id).cloned())
}

/// Get all orders (for debugging/testing)
#[ic_cdk::query]
fn get_all_orders() -> Vec<OrderConfig> {
    ORDERS.with(|m| m.borrow().values().cloned().collect())
}

/// Get orders by maker
#[ic_cdk::query]
fn get_orders_by_maker(maker: Principal) -> Vec<OrderConfig> {
    ORDERS.with(|m| {
        m.borrow()
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
