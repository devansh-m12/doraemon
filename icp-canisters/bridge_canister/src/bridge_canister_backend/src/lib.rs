use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::management_canister::ecdsa::{
    sign_with_ecdsa, EcdsaKeyId, EcdsaPublicKeyArgument, SignWithEcdsaArgument,
};
use ic_cdk::api::management_canister::main::{
    canister_status, CanisterIdRecord, CanisterStatusResponse,
};
use ic_cdk::{init, query, update};
use std::collections::HashMap;
use std::time::{SystemTime, UNIX_EPOCH};

// Types for cross-chain swap
#[derive(CandidType, Deserialize, Clone)]
pub struct SwapOrder {
    pub ethereum_sender: String,
    pub icp_recipient: Principal,
    pub amount: u64,
    pub hashlock: Vec<u8>,
    pub timelock: u64,
    pub completed: bool,
    pub refunded: bool,
    pub created_at: u64,
}

#[derive(CandidType, Deserialize)]
pub struct CreateSwapRequest {
    pub ethereum_sender: String,
    pub amount: u64,
    pub hashlock: Vec<u8>,
    pub timelock: u64,
}

#[derive(CandidType, Deserialize)]
pub struct CompleteSwapRequest {
    pub order_id: String,
    pub preimage: Vec<u8>,
}

#[derive(CandidType, Deserialize)]
pub struct RefundSwapRequest {
    pub order_id: String,
}

// State
static mut SWAP_ORDERS: Option<HashMap<String, SwapOrder>> = None;
static mut USED_HASHLOCKS: Option<HashMap<Vec<u8>, bool>> = None;
static mut BRIDGE_CONFIG: Option<BridgeConfig> = None;

#[derive(CandidType, Deserialize, Clone)]
pub struct BridgeConfig {
    pub bridge_fee_percentage: u64, // in basis points (0.1% = 10)
    pub min_swap_amount: u64,
    pub max_swap_amount: u64,
    pub authorized_resolvers: Vec<Principal>,
}

impl Default for BridgeConfig {
    fn default() -> Self {
        Self {
            bridge_fee_percentage: 10, // 0.1%
            min_swap_amount: 1_000_000_000_000_000, // 0.001 ICP in e8s
            max_swap_amount: 1_000_000_000_000_000_000, // 1 ICP in e8s (reduced from 100)
            authorized_resolvers: vec![],
        }
    }
}

// Helper functions
fn get_swap_orders() -> &'static mut HashMap<String, SwapOrder> {
    unsafe {
        if SWAP_ORDERS.is_none() {
            SWAP_ORDERS = Some(HashMap::new());
        }
        SWAP_ORDERS.as_mut().unwrap()
    }
}

fn get_used_hashlocks() -> &'static mut HashMap<Vec<u8>, bool> {
    unsafe {
        if USED_HASHLOCKS.is_none() {
            USED_HASHLOCKS = Some(HashMap::new());
        }
        USED_HASHLOCKS.as_mut().unwrap()
    }
}

fn get_bridge_config() -> &'static mut BridgeConfig {
    unsafe {
        if BRIDGE_CONFIG.is_none() {
            BRIDGE_CONFIG = Some(BridgeConfig::default());
        }
        BRIDGE_CONFIG.as_mut().unwrap()
    }
}

fn current_timestamp() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
}

fn generate_order_id(
    ethereum_sender: &str,
    icp_recipient: &Principal,
    amount: u64,
    hashlock: &[u8],
    timelock: u64,
) -> String {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};
    
    let mut hasher = DefaultHasher::new();
    ethereum_sender.hash(&mut hasher);
    icp_recipient.hash(&mut hasher);
    amount.hash(&mut hasher);
    hashlock.hash(&mut hasher);
    timelock.hash(&mut hasher);
    current_timestamp().hash(&mut hasher);
    
    format!("{:x}", hasher.finish())
}

fn compute_hashlock(preimage: &[u8]) -> Vec<u8> {
    use sha2::{Digest, Sha256};
    let mut hasher = Sha256::new();
    hasher.update(preimage);
    hasher.finalize().to_vec()
}

fn is_authorized_resolver(caller: &Principal) -> bool {
    let config = get_bridge_config();
    config.authorized_resolvers.contains(caller)
}

// Canister methods
#[update]
pub async fn create_icp_swap(request: CreateSwapRequest) -> Result<String, String> {
    let caller = ic_cdk::caller();
    
    // Validate amount
    let config = get_bridge_config();
    if request.amount < config.min_swap_amount {
        return Err("Amount too low".to_string());
    }
    if request.amount > config.max_swap_amount {
        return Err("Amount too high".to_string());
    }
    
    // Validate timelock
    let current_time = current_timestamp();
    if request.timelock <= current_time + 3600 {
        return Err("Timelock too short".to_string());
    }
    if request.timelock > current_time + 86400 {
        return Err("Timelock too long".to_string());
    }
    
    // Check if hashlock is already used
    let used_hashlocks = get_used_hashlocks();
    if used_hashlocks.contains_key(&request.hashlock) {
        return Err("Hashlock already used".to_string());
    }
    
    // Calculate bridge fee
    let bridge_fee = (request.amount * config.bridge_fee_percentage) / 10000;
    let swap_amount = request.amount - bridge_fee;
    
    // Create swap order
    let order = SwapOrder {
        ethereum_sender: request.ethereum_sender.clone(),
        icp_recipient: caller,
        amount: swap_amount,
        hashlock: request.hashlock.clone(),
        timelock: request.timelock,
        completed: false,
        refunded: false,
        created_at: current_time,
    };
    
    let order_id = generate_order_id(
        &request.ethereum_sender,
        &caller,
        request.amount,
        &request.hashlock,
        request.timelock,
    );
    
    // Store the order
    let swap_orders = get_swap_orders();
    swap_orders.insert(order_id.clone(), order);
    used_hashlocks.insert(request.hashlock, true);
    
    Ok(order_id)
}

#[update]
pub async fn complete_icp_swap(request: CompleteSwapRequest) -> Result<(), String> {
    let caller = ic_cdk::caller();
    
    // Check authorization
    if !is_authorized_resolver(&caller) {
        return Err("Not authorized".to_string());
    }
    
    let swap_orders = get_swap_orders();
    let order = swap_orders.get_mut(&request.order_id)
        .ok_or("Order does not exist")?;
    
    if order.completed {
        return Err("Order already completed".to_string());
    }
    
    if order.refunded {
        return Err("Order already refunded".to_string());
    }
    
    let current_time = current_timestamp();
    if current_time >= order.timelock {
        return Err("Timelock expired".to_string());
    }
    
    // Verify preimage
    let computed_hashlock = compute_hashlock(&request.preimage);
    if order.hashlock != computed_hashlock {
        return Err("Invalid preimage".to_string());
    }
    
    // Mark as completed
    order.completed = true;
    
    // Transfer ICP to recipient (simplified - in real implementation, you'd use ICP ledger)
    // For now, we just mark it as completed
    
    Ok(())
}

#[update]
pub async fn refund_icp_swap(request: RefundSwapRequest) -> Result<(), String> {
    let _caller = ic_cdk::caller();
    
    let swap_orders = get_swap_orders();
    let order = swap_orders.get_mut(&request.order_id)
        .ok_or("Order does not exist")?;
    
    if order.completed {
        return Err("Order already completed".to_string());
    }
    
    if order.refunded {
        return Err("Order already refunded".to_string());
    }
    
    let current_time = current_timestamp();
    if current_time < order.timelock {
        return Err("Timelock not expired".to_string());
    }
    
    // Mark as refunded
    order.refunded = true;
    
    // Refund ICP to caller (simplified - in real implementation, you'd use ICP ledger)
    
    Ok(())
}

#[query]
pub fn get_swap_order(order_id: String) -> Result<SwapOrder, String> {
    let swap_orders = get_swap_orders();
    swap_orders.get(&order_id)
        .cloned()
        .ok_or("Order not found".to_string())
}

#[query]
pub fn is_hashlock_used(hashlock: Vec<u8>) -> bool {
    let used_hashlocks = get_used_hashlocks();
    used_hashlocks.contains_key(&hashlock)
}

#[query]
pub fn get_bridge_config_query() -> BridgeConfig {
    get_bridge_config().clone()
}

// Admin functions
#[update]
pub fn set_bridge_fee_percentage(fee_percentage: u64) -> Result<(), String> {
    let caller = ic_cdk::caller();
    if caller != ic_cdk::id() {
        return Err("Only canister controller can call this".to_string());
    }
    
    if fee_percentage > 100 {
        return Err("Fee too high".to_string());
    }
    
    let config = get_bridge_config();
    config.bridge_fee_percentage = fee_percentage;
    
    Ok(())
}

#[update]
pub fn set_swap_limits(min_amount: u64, max_amount: u64) -> Result<(), String> {
    let caller = ic_cdk::caller();
    if caller != ic_cdk::id() {
        return Err("Only canister controller can call this".to_string());
    }
    
    if min_amount >= max_amount {
        return Err("Invalid limits".to_string());
    }
    
    let config = get_bridge_config();
    config.min_swap_amount = min_amount;
    config.max_swap_amount = max_amount;
    
    Ok(())
}

#[update]
pub fn set_authorized_resolver(resolver: Principal, authorized: bool) -> Result<(), String> {
    let caller = ic_cdk::caller();
    if caller != ic_cdk::id() {
        return Err("Only canister controller can call this".to_string());
    }
    
    let config = get_bridge_config();
    if authorized {
        if !config.authorized_resolvers.contains(&resolver) {
            config.authorized_resolvers.push(resolver);
        }
    } else {
        config.authorized_resolvers.retain(|&x| x != resolver);
    }
    
    Ok(())
}

// Chain Fusion integration for Ethereum interaction
#[update]
pub async fn submit_ethereum_transaction(_transaction_data: Vec<u8>) -> Result<String, String> {
    // This would integrate with ICP's Chain Fusion to submit Ethereum transactions
    // For now, we'll return a placeholder
    Ok("Transaction submitted via Chain Fusion".to_string())
}

// Health check and status
#[query]
pub fn greet(name: String) -> String {
    format!("Hello, {}! ICP Bridge is running.", name)
}

#[query]
pub fn get_canister_status() -> String {
    format!("ICP Bridge Canister - Active")
}

// Initialize canister
#[init]
fn init() {
    // Initialize with default configuration
    get_bridge_config();
    get_swap_orders();
    get_used_hashlocks();
}
