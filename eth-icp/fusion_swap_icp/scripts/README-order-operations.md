# Order Operations with DFX CLI

This document describes how to create and manage orders using dfx CLI commands for the Fusion Swap ICP backend.

## Overview

The Fusion Swap system allows users to create, fill, and cancel orders using the Internet Computer (ICP) blockchain. All operations are performed using `dfx` CLI commands.

## Prerequisites

1. **DFX installed and configured**
2. **Local Internet Computer node running** (`dfx start`)
3. **Test identities created** (`dfx identity new test-maker`, `dfx identity new test-taker`)
4. **Canisters deployed** (`dfx deploy`)

## Available Scripts

### 1. Simple Order Creation
```bash
./scripts/create-order-simple.sh
```
Creates a basic order with default parameters.

### 2. Comprehensive Order Operations
```bash
./scripts/order-operations-dfx.sh
```
Demonstrates all order operations including create, fill, cancel, and query operations.

## Manual DFX Commands

### Creating an Order

```bash
# Switch to maker identity
dfx identity use test-maker

# Approve tokens for the contract
dfx canister call bd3sg-teaaa-aaaaa-qaaba-cai icrc2_approve "(record { 
    from_subaccount = null; 
    spender = record { owner = principal \"bkyz2-fmaaa-aaaaa-qaaaq-cai\"; subaccount = null }; 
    amount = 10000000000 : nat; 
    expires_at = null 
})"

# Create order
dfx canister call bkyz2-fmaaa-aaaaa-qaaaq-cai create_order "(record { 
    id = 9 : nat64; 
    src_mint = principal \"bd3sg-teaaa-aaaaa-qaaba-cai\"; 
    dst_mint = principal \"bkyz2-fmaaa-aaaaa-qaaaq-cai\"; 
    maker = principal \"cjobn-a4566-qzwux-yg5b5-z2vqh-huolu-nhxd6-6xrto-zunsj-zuwdd-qae\"; 
    src_amount = 1000000000 : nat; 
    min_dst_amount = 900000000 : nat; 
    estimated_dst_amount = 1000000000 : nat; 
    expiration_time = 1735689600 : nat64; 
    fee = record { 
        protocol_fee_bps = 30 : nat16; 
        integrator_fee_bps = 20 : nat16; 
        surplus_bps = 10 : nat8; 
        max_cancel_premium = 100000000 : nat 
    }; 
    auction = record { 
        start_time = 1735689600 : nat64; 
        end_time = 1735776000 : nat64; 
        start_price = 1000000000 : nat; 
        end_price = 900000000 : nat; 
        current_price = 1000000000 : nat 
    }; 
    cancellation_auction_secs = 3600 : nat32; 
    hashlock = record { 
        secret_hash = vec { 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0 } : vec nat8; 
        revealed = false; 
        reveal_time = null : opt nat64 
    }; 
    timelock = record { 
        finality_lock_duration = 0 : nat64; 
        exclusive_withdraw_duration = 0 : nat64; 
        cancellation_timeout = 0 : nat64; 
        created_at = 0 : nat64 
    }; 
    status = variant { Announced }; 
    created_at = 0 : nat64 
})"
```

### Querying Orders

```bash
# Get a specific order
dfx canister call bkyz2-fmaaa-aaaaa-qaaaq-cai get_order "(9 : nat64)"

# Get all orders
dfx canister call bkyz2-fmaaa-aaaaa-qaaaq-cai get_all_orders

# Get orders by maker
dfx canister call bkyz2-fmaaa-aaaaa-qaaaq-cai get_orders_by_maker "(principal \"cjobn-a4566-qzwux-yg5b5-z2vqh-huolu-nhxd6-6xrto-zunsj-zuwdd-qae\")"
```

### Filling an Order

```bash
# Switch to taker identity
dfx identity use test-taker

# Approve tokens for the contract
dfx canister call bd3sg-teaaa-aaaaa-qaaba-cai icrc2_approve "(record { 
    from_subaccount = null; 
    spender = record { owner = principal \"bkyz2-fmaaa-aaaaa-qaaaq-cai\"; subaccount = null }; 
    amount = 10000000000 : nat; 
    expires_at = null 
})"

# Fill order
dfx canister call bkyz2-fmaaa-aaaaa-qaaaq-cai fill_order "(9 : nat64, 1000000000 : nat, null : opt vec nat8)"
```

### Cancelling an Order

```bash
# Switch to maker identity
dfx identity use test-maker

# Cancel order
dfx canister call bkyz2-fmaaa-aaaaa-qaaaq-cai cancel_order "(9 : nat64)"
```

## Order Configuration Fields

### Required Fields
- `id`: Unique order identifier (nat64)
- `src_mint`: Source token canister principal
- `dst_mint`: Destination token canister principal
- `maker`: Maker's principal
- `src_amount`: Amount of source tokens (nat)
- `min_dst_amount`: Minimum destination amount (nat)
- `estimated_dst_amount`: Estimated destination amount (nat)
- `expiration_time`: Order expiration timestamp (nat64)

### Fee Configuration
- `protocol_fee_bps`: Protocol fee in basis points (nat16)
- `integrator_fee_bps`: Integrator fee in basis points (nat16)
- `surplus_bps`: Surplus fee in basis points (nat8)
- `max_cancel_premium`: Maximum cancellation premium (nat)

### Auction Configuration
- `start_time`: Auction start time (nat64)
- `end_time`: Auction end time (nat64)
- `start_price`: Starting price (nat)
- `end_price`: Ending price (nat)
- `current_price`: Current price (nat)

### Hashlock Configuration
- `secret_hash`: 32-byte secret hash (vec nat8)
- `revealed`: Whether secret is revealed (bool)
- `reveal_time`: Time when secret was revealed (opt nat64)

### Timelock Configuration
- `finality_lock_duration`: Finality lock duration (nat64)
- `exclusive_withdraw_duration`: Exclusive withdraw duration (nat64)
- `cancellation_timeout`: Cancellation timeout (nat64)
- `created_at`: Creation timestamp (nat64)

## Order Status Values

- `Announced`: Order is announced but not yet active
- `Active`: Order is active and can be filled
- `Completed`: Order has been fully filled
- `Cancelled`: Order has been cancelled
- `Failed`: Order failed with error message

## Error Handling

The system returns `Result` types for all operations:
- `Ok`: Operation successful
- `Err`: Operation failed with error message

Common errors:
- `InvalidAmount`: Invalid amount specified
- `OrderNotFound`: Order does not exist
- `OrderAlreadyExists`: Order ID already exists
- `OrderExpired`: Order has expired
- `UnauthorizedCaller`: Caller is not authorized
- `InsufficientFunds`: Insufficient token balance

## Testing

Run the test suite to verify all operations:

```bash
npm test
```

This will run the Jest tests that use the token-utils.ts file to interact with the canister. 