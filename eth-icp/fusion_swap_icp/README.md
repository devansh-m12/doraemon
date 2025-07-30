# ICP Fusion Swap Canister

A Rust-based Internet Computer (ICP) canister that implements an escrow and Dutch auction swap system, similar to Solana's fusion-swap but built for the Internet Computer.

## Features

- **Escrow System**: Secure token escrow with ICRC-2 token standard support
- **Dutch Auction**: Dynamic pricing based on time-based auction mechanics
- **Partial Fills**: Support for partial order fills
- **Cancellation Logic**: Order cancellation with refund mechanisms
- **Security**: Caller validation, expiration checks, and reentrancy protection

## Architecture

### Core Components

1. **Order Management**: Thread-local storage using BTreeMap for order persistence
2. **Token Integration**: ICRC-2 standard for token transfers and approvals
3. **Dutch Auction**: Time-based price calculation for dynamic pricing
4. **Security**: Comprehensive validation and error handling

### Key Functions

- `create_order`: Create new escrow orders with token approval
- `fill_order`: Fill orders with Dutch auction pricing
- `cancel_order`: Cancel orders with refund logic
- `get_order`: Query specific order by ID
- `get_all_orders`: Get all orders (debug/testing)
- `get_orders_by_maker`: Get orders by maker

## Development Status

✅ **Phase 1**: Project Setup - Complete  
✅ **Phase 2**: Core Dependencies & Types - Complete  
✅ **Phase 3**: State Management - Complete  
✅ **Phase 4**: ICRC-2 Token Integration - Complete  
✅ **Phase 5**: Core Escrow Functions - Complete  
✅ **Phase 6**: Order Management - Complete  
✅ **Phase 7**: Cancellation & Cleanup - Complete  
✅ **Phase 8**: Query Functions - Complete  
✅ **Phase 9**: Security & Reentrancy - Complete  
✅ **Phase 10**: Testing & Validation - Complete  
✅ **Phase 11**: Deployment - Complete  
✅ **Phase 12**: Documentation & Final Checks - Complete  

## Deployment

### Local Development

```bash
# Start local replica
dfx start --background

# Deploy canister
dfx deploy --network local

# Test functions
dfx canister call fusion_swap_icp_backend greet '("World")'
dfx canister call fusion_swap_icp_backend get_all_orders
```

### Canister Information

- **Canister ID**: `br5f7-7uaaa-aaaaa-qaaca-cai`
- **Network**: Local
- **Candid Interface**: Available via dfx UI

## Usage Examples

### Creating an Order

```rust
let order = OrderConfig {
    id: 1,
    src_mint: src_token_principal,
    dst_mint: dst_token_principal,
    maker: caller_principal,
    src_amount: 1000000, // 1 token (assuming 6 decimals)
    min_dst_amount: 500000,
    estimated_dst_amount: 1000000,
    expiration_time: current_time + 3600, // 1 hour
    fee: FeeConfig { /* ... */ },
    auction: AuctionData { /* ... */ },
    cancellation_auction_secs: 300,
};

// Call create_order
dfx canister call fusion_swap_icp_backend create_order '(order)'
```

### Filling an Order

```bash
# Fill order with specific amount
dfx canister call fusion_swap_icp_backend fill_order '(1, 500000)'
```

### Cancelling an Order

```bash
# Cancel order (only maker or after expiry)
dfx canister call fusion_swap_icp_backend cancel_order '(1)'
```

## Security Features

- **Caller Validation**: Only authorized users can perform actions
- **Expiration Checks**: Orders automatically expire
- **Refund Logic**: Secure refund mechanisms for cancellations
- **Dutch Auction**: Fair pricing based on time
- **Partial Fills**: Support for incremental order fulfillment

## Dependencies

- `ic-cdk`: Internet Computer Development Kit
- `icrc-ledger-types`: ICRC token standard types
- `candid`: Interface definition language
- `serde`: Serialization/deserialization

## Future Enhancements

1. **Stable Memory**: Migrate to StableBTreeMap for persistent storage
2. **Price Oracles**: Integrate with external price feeds
3. **Cross-chain**: Add support for EVM and BTC legs
4. **SNS DAO**: Migrate ownership to SNS DAO
5. **Advanced Security**: Add journal-based state management

## Contributing

This project follows a phased development approach with comprehensive testing at each stage. All functions are tested and validated before proceeding to the next phase.

## License

This project is open source and available under the MIT License.
