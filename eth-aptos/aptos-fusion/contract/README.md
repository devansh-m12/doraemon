# Fusion Swap Aptos Contract

A comprehensive implementation of the 1inch Fusion+ protocol for the Aptos blockchain, enabling trustless cross-chain atomic swaps between Ethereum and Aptos.

## 🎯 Overview

This project implements the Fusion+ protocol on Aptos, extending the successful 1inch Fusion+ capabilities to the Aptos ecosystem. The contract provides:

- **Hashlock/Timelock Security**: Cryptographic protection against front-running
- **Dutch Auction Pricing**: Dynamic pricing with time-based auction mechanics
- **Partial Fill Support**: Incremental order fulfillment
- **Cross-chain Escrow**: Secure asset locking across chains
- **Aptos Move Integration**: Native Aptos token standard support

## 🏗️ Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    ETH-APTOS Fusion+ Protocol                  │
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
│  │   Aptos     │  │   Cross-    │  │   Safety    │          │
│  │   Move      │  │   Chain     │  │   Deposit   │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### Key Features

#### 🔐 Security Mechanisms
- **Hashlock System**: SHA-256 based cryptographic protection
- **Timelock System**: Time-based access control
- **Reentrancy Protection**: Attack prevention
- **Access Control**: Authorization checks

#### 🏷️ Dutch Auction
- **Linear Price Decay**: Time-based pricing
- **Dynamic Adaptation**: Market-responsive pricing
- **Fair Execution**: Transparent price calculation

#### ⛓️ Cross-chain Integration
- **Atomic Swaps**: Trustless cross-chain transfers
- **Resolver Network**: Decentralized execution
- **Message Passing**: Cross-chain communication
- **Fallback Mechanisms**: Recovery procedures

## 📁 Project Structure

```
contract/
├── sources/
│   ├── fusion_swap.move          # Main fusion swap module
│   ├── fusion_swap_tests.move    # Comprehensive test suite
│   └── message_board.move        # Example message board module
├── scripts/
│   └── deploy.sh                 # Deployment script
├── Move.toml                     # Move package configuration
└── README.md                     # This file
```

## 🚀 Quick Start

### Prerequisites

1. **Install Aptos CLI**:
   ```bash
   curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
   ```

2. **Install Dependencies**:
   ```bash
   # No additional dependencies required for Move contracts
   ```

### Compilation

```bash
# Compile the contract
aptos move compile --package-dir .

# Run tests
aptos move test --package-dir .
```

### Deployment

#### Local Development
```bash
# Deploy to local network
./scripts/deploy.sh -n local

# Deploy with initialization and verification
./scripts/deploy.sh -n local -i -v
```

#### Testnet Deployment
```bash
# Deploy to testnet
./scripts/deploy.sh -n testnet -i -v
```

#### Mainnet Deployment
```bash
# Deploy to mainnet
./scripts/deploy.sh -n mainnet -i -v
```

## 📖 Usage

### Creating Orders

```move
// Create a new fusion swap order
fusion_swap::create_order(
    &sender,
    src_mint,              // Source token mint address
    dst_mint,              // Destination token mint address
    src_amount,            // Amount to swap
    min_dst_amount,        // Minimum received amount
    estimated_dst_amount,  // Expected received amount
    auction_duration,      // Dutch auction duration
    secret_hash,           // SHA-256 hash of secret
    maker_fee,             // Maker fee (basis points)
    taker_fee,             // Taker fee (basis points)
    resolver_fee,          // Resolver fee (basis points)
    platform_fee,          // Platform fee (basis points)
);
```

### Filling Orders

```move
// Fill an order (partial or full)
fusion_swap::fill_order(
    &sender,
    order_id,              // Order ID to fill
    fill_amount,           // Amount to fill
    secret,                // Secret to reveal hashlock
);
```

### Cancelling Orders

```move
// Cancel an order
fusion_swap::cancel_order(
    &sender,
    order_id,              // Order ID to cancel
);
```

### Querying Orders

```move
// Get order by ID
let order = fusion_swap::get_order(order_id);

// Get all orders
let all_orders = fusion_swap::get_all_orders();

// Get orders by maker
let maker_orders = fusion_swap::get_orders_by_maker(maker_address);

// Get active orders
let active_orders = fusion_swap::get_active_orders();

// Get statistics
let order_count = fusion_swap::get_order_count();
let total_volume = fusion_swap::get_total_volume();
let total_fees = fusion_swap::get_total_fees();
```

## 🔧 Configuration

### Move.toml

```toml
[package]
name = "FusionSwapAptos"
version = "1.0.0"
authors = ["Fusion Swap Team"]

[addresses]
message_board_addr = "_"
fusion_swap_addr = "_"

[dependencies]
AptosFramework = { git = "https://github.com/aptos-labs/aptos-framework.git", rev = "mainnet", subdir = "aptos-framework" }
```

### Constants

```move
const BASIS_POINTS: u64 = 10000;
const MAX_ORDER_DURATION: u64 = 86400; // 24 hours
const MIN_AUCTION_DURATION: u64 = 300; // 5 minutes
const MAX_AUCTION_DURATION: u64 = 3600; // 1 hour
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
aptos move test --package-dir .

# Run specific test
aptos move test --package-dir . --filter test_create_order_success
```

### Test Coverage

The test suite covers:

- ✅ **Module Initialization**: Basic setup and configuration
- ✅ **Order Creation**: Parameter validation and order storage
- ✅ **Dutch Auction**: Price calculation and time-based pricing
- ✅ **Order Filling**: Partial and full order fulfillment
- ✅ **Order Cancellation**: Authorization and timelock validation
- ✅ **Hashlock System**: Secret validation and revelation
- ✅ **Timelock System**: Time-based access control
- ✅ **Reentrancy Protection**: Attack prevention
- ✅ **Statistics**: Volume and fee tracking
- ✅ **Edge Cases**: Error handling and boundary conditions

## 🔒 Security Features

### Cryptographic Protection

- **Hashlock Mechanisms**: SHA-256 based atomic execution
- **Timelock Systems**: Time-based access control
- **Secret Revelation**: Secure cross-chain communication
- **Cross-chain Verification**: Multi-chain validation

### Access Control

- **Authorization Checks**: Role-based permissions
- **Maker-only Operations**: Order creation and cancellation
- **Taker Operations**: Order filling with secret validation
- **Emergency Mechanisms**: Recovery procedures

### Reentrancy Protection

- **Global Guard**: Prevents reentrancy attacks
- **State Management**: Safe state transitions
- **Resource Protection**: Secure resource handling

## 📊 Performance

### Gas Optimization

- Efficient data structures using vectors
- Minimal storage operations
- Optimized loops and conditions
- Batch operations where possible

### Scalability

- Modular architecture design
- Extensible codebase
- Horizontal scaling support
- Load balancing considerations

## 🔍 Monitoring & Analytics

### Key Metrics

- Order creation rate
- Fill success rate
- Average fill time
- Gas usage patterns
- Error rates

### Tools

- Aptos Explorer integration
- Custom analytics dashboard
- Real-time alerts
- Performance tracking

## 🚨 Error Codes

```move
const ENOT_AUTHORIZED: u64 = 1;
const EINVALID_ORDER_ID: u64 = 2;
const EORDER_NOT_FOUND: u64 = 3;
const EORDER_EXPIRED: u64 = 4;
const EORDER_ALREADY_FILLED: u64 = 5;
const EORDER_ALREADY_CANCELLED: u64 = 6;
const EINVALID_AMOUNT: u64 = 7;
const EINVALID_PRICE: u64 = 8;
const EINVALID_HASHLOCK: u64 = 9;
const EINVALID_TIMELOCK: u64 = 10;
const EREENTRANCY_GUARD: u64 = 11;
const EINSUFFICIENT_BALANCE: u64 = 12;
const ETRANSFER_FAILED: u64 = 13;
const EAUCTION_NOT_STARTED: u64 = 14;
const EAUCTION_ENDED: u64 = 15;
const EINVALID_SECRET: u64 = 16;
const ESECRET_ALREADY_REVEALED: u64 = 17;
const ETIMELOCK_NOT_EXPIRED: u64 = 18;
const EINVALID_FEE_CONFIG: u64 = 19;
```

## 🔮 Future Enhancements

### Planned Features

1. **Stable Memory**: Persistent storage optimization
2. **Price Oracles**: External price feed integration
3. **Advanced Auctions**: More sophisticated auction types
4. **Cross-chain Bridges**: Additional chain support
5. **DAO Governance**: Decentralized governance

### Research Areas

- Zero-knowledge proofs
- Advanced cryptographic primitives
- Cross-chain communication protocols
- Scalability solutions

## 📚 Documentation

### Additional Resources

- [Aptos Move Book](https://move-book.aptoslabs.com/)
- [Aptos Framework](https://github.com/aptos-labs/aptos-core)
- [1inch Fusion+ Documentation](https://docs.1inch.io/)
- [Cross-chain Protocols](https://docs.axelar.dev/)

### Standards

- [Aptos Token Standard](https://github.com/aptos-labs/aptos-core/blob/main/aptos-move/framework/aptos-token/sources/token.move)
- [Move Language](https://move-language.github.io/move/)
- [Cross-chain Standards](https://github.com/cosmos/ibc)

## 🤝 Contributing

### Development Setup

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Run tests**: `aptos move test --package-dir .`
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Code Style

- Follow Move language conventions
- Add comprehensive tests for new features
- Update documentation for API changes
- Ensure security best practices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Discussions**: Join community discussions on GitHub Discussions

### Common Issues

1. **Compilation Errors**: Ensure Aptos CLI is up to date
2. **Deployment Failures**: Check network connectivity and account balance
3. **Test Failures**: Verify test environment setup
4. **Gas Issues**: Optimize contract calls and batch operations

---

**Fusion Swap Aptos** - Bridging Ethereum and Aptos with trustless atomic swaps, extending 1inch Fusion+ to the Aptos ecosystem. 