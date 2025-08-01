# ICP Fusion+ 1inch Extension Protocol

A revolutionary cross-chain atomic swap protocol built on the Internet Computer (ICP) that extends 1inch Fusion+ capabilities to the ICP ecosystem. This protocol enables secure, trustless token swaps between ICP and EVM chains with advanced features like Dutch auctions, hashlock/timelock mechanisms, and resolver-based execution.

## 🚀 What We've Built

### Core Innovation
- **ICP-EVM Bridge**: First-of-its-kind atomic swap protocol connecting Internet Computer to Ethereum/BSC
- **1inch Fusion+ Extension**: Extends 1inch's Fusion+ protocol to ICP ecosystem
- **Dutch Auction System**: Dynamic pricing with time-based auction mechanics
- **Atomic Swaps**: Trustless cross-chain token exchanges with cryptographic guarantees

### Key Features
- ✅ **Hashlock/Timelock Security**: Cryptographic protection against front-running
- ✅ **Dutch Auction Pricing**: Dynamic pricing based on time and demand
- ✅ **Partial Fill Support**: Incremental order fulfillment
- ✅ **Resolver Network**: Decentralized execution network
- ✅ **Cross-chain Escrow**: Secure asset locking across chains
- ✅ **ICRC-2 Integration**: Native ICP token standard support

## 🏗️ Architecture Overview

### Protocol Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    ICP Fusion+ Protocol                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Order     │  │   Dutch     │  │   Hashlock  │          │
│  │ Management  │  │   Auction   │  │   System    │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Timelock  │  │   Escrow    │  │   Resolver  │          │
│  │   System    │  │   Contract  │  │   Network   │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   ICRC-2    │  │   Cross-    │  │   Safety    │          │
│  │   Tokens    │  │   Chain     │  │   Deposit   │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### Smart Contract Architecture

```rust
// Core Data Structures
#[derive(CandidType, Deserialize, Clone)]
pub struct OrderConfig {
    pub id: u64,
    pub src_mint: Principal,        // Source token (ICP)
    pub dst_mint: Principal,        // Destination token (EVM)
    pub maker: Principal,           // Order creator
    pub src_amount: Amount,         // Amount to swap
    pub min_dst_amount: Amount,     // Minimum received
    pub estimated_dst_amount: Amount, // Expected received
    pub expiration_time: u64,       // Order expiry
    pub fee: FeeConfig,             // Fee structure
    pub auction: AuctionData,       // Dutch auction data
    pub hashlock: HashLock,         // Cryptographic lock
    pub timelock: TimeLock,         // Time-based locks
    pub status: OrderStatus,        // Order state
}

#[derive(CandidType, Deserialize, Clone)]
pub struct HashLock {
    pub secret_hash: [u8; 32],     // SHA-256 hash
    pub revealed: bool,             // Secret revealed
    pub reveal_time: Option<u64>,   // When revealed
}

#[derive(CandidType, Deserialize, Clone)]
pub struct TimeLock {
    pub finality_lock_duration: u64,    // Chain finality
    pub exclusive_withdraw_duration: u64, // Resolver exclusive
    pub cancellation_timeout: u64,       // Recovery timeout
    pub created_at: u64,                // Creation timestamp
}
```

## 🔄 Protocol Flow

### 1. Order Creation Flow

```mermaid
sequenceDiagram
    participant Maker as Order Maker
    participant Contract as ICP Contract
    participant Ledger as ICRC Ledger
    
    Maker->>Contract: create_order(order_config)
    Contract->>Contract: Validate parameters
    Contract->>Contract: Check reentrancy
    Contract->>Ledger: icrc2_transfer_from()
    Ledger-->>Contract: Transfer successful
    Contract->>Contract: Store order in state
    Contract-->>Maker: Order created successfully
```

### 2. Order Filling Flow

```mermaid
sequenceDiagram
    participant Taker as Order Taker
    participant Contract as ICP Contract
    participant Ledger as ICRC Ledger
    participant Resolver as Resolver Network
    
    Taker->>Contract: fill_order(order_id, amount, secret)
    Contract->>Contract: Validate hashlock secret
    Contract->>Contract: Calculate Dutch auction price
    Contract->>Contract: Validate timelock
    Contract->>Ledger: Transfer dst tokens (taker→maker)
    Contract->>Ledger: Transfer src tokens (escrow→taker)
    Contract->>Contract: Update order state
    Contract-->>Taker: Order filled successfully
```

### 3. Cross-Chain Atomic Swap Flow

```mermaid
sequenceDiagram
    participant ICP_User as ICP User
    participant ICP_Contract as ICP Contract
    participant Bridge as Cross-Chain Bridge
    participant EVM_Contract as EVM Contract
    participant EVM_User as EVM User
    
    ICP_User->>ICP_Contract: Create order with hashlock
    ICP_Contract->>ICP_Contract: Lock ICP tokens
    ICP_Contract-->>ICP_User: Order created
    
    EVM_User->>EVM_Contract: Fill order with secret
    EVM_Contract->>EVM_Contract: Validate hashlock
    EVM_Contract->>EVM_Contract: Lock EVM tokens
    EVM_Contract->>Bridge: Initiate cross-chain transfer
    Bridge->>ICP_Contract: Complete ICP side
    ICP_Contract->>ICP_User: Release ICP tokens
    EVM_Contract->>EVM_User: Release EVM tokens
```

## 🛠️ Setup & Installation

### Prerequisites

```bash
# Install DFX (Internet Computer SDK)
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"

# Install Foundry (for EVM contracts)
curl -L https://foundry.paradigm.xyz | bash

# Install Node.js dependencies
npm install -g pnpm
```

### Local Development Setup

```bash
# Clone the repository
git clone https://github.com/devansh-m12/doraemon.git
cd eth-icp

# Install dependencies
pnpm install

# Start local Internet Computer replica
dfx start --background

# Deploy the canister
dfx deploy --network local

# Run tests
pnpm test
```

### Environment Configuration

Create a `.env` file:

```bash
# ICP Configuration
ICP_NETWORK=local
ICP_CANISTER_ID=br5f7-7uaaa-aaaaa-qaaca-cai

# EVM Configuration
ETH_FORK_URL=https://eth.merkle.io
BSC_FORK_URL=wss://bsc-rpc.publicnode.com

# Test Accounts
MAKER_PRINCIPAL=your_maker_principal
TAKER_PRINCIPAL=your_taker_principal
RESOLVER_PRINCIPAL=your_resolver_principal
```

## 📊 Dutch Auction Mechanism

### Price Calculation

The protocol implements a sophisticated Dutch auction system:

```rust
// Dutch auction price calculation
let current_time = ic_cdk::api::time() / 1_000_000_000;
let dst_amount = if current_time >= order.auction.start_time && 
                    current_time <= order.auction.end_time {
    // Linear interpolation for price
    let total_duration = order.auction.end_time - order.auction.start_time;
    let current_price = (order.auction.start_price * (order.auction.end_time - current_time) as u128 + 
                        order.auction.end_price * (current_time - order.auction.start_time) as u128) / 
                        total_duration as u128;
    
    // Calculate dst amount based on current price
    (taker_amount * current_price) / order.auction.start_price
} else {
    // Use estimated amount if outside auction window
    (taker_amount * order.estimated_dst_amount) / order.src_amount
};
```

### Auction Parameters

```rust
#[derive(CandidType, Deserialize, Clone)]
pub struct AuctionData {
    pub start_time: u64,        // Auction start timestamp
    pub end_time: u64,          // Auction end timestamp
    pub start_price: Amount,     // Starting price (highest)
    pub end_price: Amount,       // Ending price (lowest)
    pub current_price: Amount,   // Current calculated price
}
```

## 🔐 Security Features

### Hashlock System
- **Secret Generation**: 32-byte random secret
- **Hash Storage**: SHA-256 hash of secret
- **Preimage Validation**: Secret verification on fill
- **Merkle Tree Support**: For partial fills

### Timelock System
- **Finality Protection**: Chain reorganization protection
- **Exclusive Periods**: Resolver-only withdrawal windows
- **Cancellation Timeout**: Recovery mechanisms
- **Cross-chain Coordination**: Synchronized timelocks

### Reentrancy Protection
```rust
thread_local! {
    static REENTRANCY_GUARD: RefCell<bool> = RefCell::new(false);
}

// Usage in functions
REENTRANCY_GUARD.with(|guard| {
    if *guard.borrow() {
        return Err(FusionError::ReentrancyDetected);
    }
    *guard.borrow_mut() = true;
    Ok(())
})?;
```

## 🧪 Testing

The project includes comprehensive testing across multiple scenarios, focusing on **hybrid cross-chain operations** since 1inch doesn't currently support ICP natively.

### Test Structure

#### 1. **Cross-Chain Hybrid Tests** (`eth-icp/tests/`)
These tests simulate cross-chain operations between Ethereum and ICP using a hybrid approach:

- **ETH-to-ICP Hybrid Tests** (`eth-to-icp-hybrid.spec.ts`): 
  - Creates orders on Ethereum using 1inch SDK
  - Simulates corresponding ICP operations using real ICP contracts
  - Tests token transfers from ETH to ICP with hashlock verification
  - Validates cross-chain secret sharing and withdrawal mechanisms

- **ICP-to-ETH Hybrid Tests** (`icp-to-eth-hybrid.spec.ts`):
  - Creates orders on ICP using Fusion+ protocol
  - Simulates corresponding Ethereum operations using 1inch SDK
  - Tests token transfers from ICP to ETH with atomic swap validation
  - Tests cancellation scenarios and timelock mechanisms

- **Supporting Infrastructure**:
  - `escrow-factory.ts`: Manages escrow contract deployment and events
  - `resolver.ts`: Handles cross-chain resolver operations
  - `wallet.ts`: Provides wallet utilities for both chains
  - `icp-destination-resolver.ts`: Bridges ICP operations with test framework

#### 2. **ICP Fusion+ Protocol Tests** (`eth-icp/fusion_swap_icp/tests/`)
These tests validate the core ICP Fusion+ protocol implementation:

- **Fusion+ Protocol Tests** (`fusion-plus.test.ts`):
  - Tests hashlock system with secret generation and verification
  - Validates Dutch auction pricing mechanisms
  - Tests timelock functionality and cancellation scenarios
  - Verifies order creation, filling, and withdrawal flows

- **ICRC Token Tests** (`icrc-utils.test.ts`, `icrc1-token-transfer.test.ts`):
  - Tests ICRC-1 and ICRC-2 token operations
  - Validates balance checking, transfers, and approvals
  - Tests batch operations and transaction history

- **Order Management Tests** (`dfx-order-creation.test.ts`, `fill-order.test.ts`):
  - Tests order creation using DFX commands
  - Validates order filling with secret verification
  - Tests order cancellation and recovery mechanisms

### What's Actually Being Tested

#### Cross-Chain Simulation
Since 1inch doesn't natively support ICP, the tests simulate cross-chain operations:

1. **ETH → ICP Flow**:
   - Create order on Ethereum using 1inch SDK
   - Generate cross-chain secret and hashlock
   - Create corresponding ICP order with same secret
   - Verify withdrawal using shared secret on both chains

2. **ICP → ETH Flow**:
   - Create order on ICP using Fusion+ protocol
   - Generate cross-chain secret and hashlock
   - Create corresponding Ethereum order with same secret
   - Verify withdrawal using shared secret on both chains

#### Real ICP Operations
The tests use actual ICP canisters and DFX commands:

- **Real Token Transfers**: Using ICRC-1 ledger canister
- **Real Order Creation**: Using Fusion+ backend canister
- **Real Balance Checks**: Querying actual ICP token balances
- **Real Secret Verification**: Using actual hashlock validation

### Running Tests

```bash
# Run all cross-chain hybrid tests
cd eth-icp
pnpm test

# Run specific test suites
pnpm test -- --testNamePattern="ETH to ICP"
pnpm test -- --testNamePattern="ICP to ETH"

# Run ICP Fusion+ protocol tests
cd fusion_swap_icp
pnpm test

# Run specific ICP test suites
pnpm test -- --testNamePattern="Fusion+"
pnpm test -- --testNamePattern="ICRC"
pnpm test -- --testNamePattern="Order"

# Run with specific network configuration
SRC_CHAIN_RPC=ETH_FORK_URL DST_CHAIN_RPC=BNB_FORK_URL pnpm test
```

### Test Examples

#### Cross-Chain Hybrid Transfer Test
```typescript
describe('ETH to ICP Hybrid Cross-Chain Transfer', () => {
  it('should transfer ETH USDC tokens to ICP tokens via hybrid cross-chain swap', async () => {
    // Step 1: Create cross-chain order on Ethereum (using SDK)
    const secret = uint8ArrayToHex(randomBytes(32))
    const order = Sdk.CrossChainOrder.new(/* order config */)
    
    // Step 2: Resolver fills order on Ethereum
    const {txHash: orderFillHash, blockHash: srcDeployBlock} = await srcChainResolver.send(
      resolverContract.deploySrc(/* order params */)
    )
    
    // Step 3: Create corresponding ICP order using real fusion implementation
    const icpOrderConfig = icpResolver.createTestOrderConfig(icpOrderId, icpSrcAmount, icpDstAmount, secret)
    const createResult = await icpResolver.createOrder(icpOrderConfig, 'test-maker')
    
    // Step 4: Withdraw from both chains using shared secret
    const withdrawalSuccess = await icpResolver.withdrawFromOrder(icpOrderId, secret, 'test-taker')
    const {txHash: resolverWithdrawHash} = await srcChainResolver.send(
      resolverContract.withdraw('src', srcEscrowAddress, secret, srcEscrowEvent[0])
    )
  })
})
```

#### ICP Fusion+ Protocol Test
```typescript
describe('Fusion+ Protocol Tests', () => {
  it('should create order with hashlock', async () => {
    const { secret, secretHash } = generateSecretAndHash()
    const order = createFusionOrder(100, 'test-maker', 1000000000, 900000000, secret)
    
    const result = await tokenUtils.createOrderWithDfx(order, 'test-maker')
    expect(result.success).toBe(true)
    
    // Verify hashlock was properly set
    const createdOrder = await tokenUtils.getOrder(order.id)
    expect(createdOrder?.hashlock.secret_hash).toEqual(secretHash.slice(0, 32))
  })
})
```

### Test Coverage

```bash
# Generate coverage report for cross-chain tests
cd eth-icp
pnpm test:coverage

# Generate coverage report for ICP contract tests
cd fusion_swap_icp
pnpm test:coverage

# View coverage in browser
open coverage/lcov-report/index.html
```





## 📚 Documentation

- [Technical Documentation](doc.md)
- [API Reference](API.md)
- [Security Audit](SECURITY.md)
- [Deployment Guide](DEPLOYMENT.md)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **1inch Network** for the Fusion+ protocol inspiration
- **Internet Computer Foundation** for the ICP platform
- **OpenZeppelin** for security best practices
- **Foundry** for smart contract development tools
