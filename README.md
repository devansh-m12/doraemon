# 🚀 Doraemon Bridge - 1inch Fusion+ Extension

A cross-chain bridge enabling Ethereum ↔ ICP swaps using 1inch Fusion+ technology with real transfers and atomic swap security.

## 🎯 Core Features

- **1inch Fusion+ Integration**: Complete resolver implementation
- **Real ICP Transfers**: Actual ledger calls for token transfers
- **Hashlock/Timelock Security**: Cryptographic atomic swap mechanisms
- **Bidirectional Swaps**: ETH ↔ ICP with real transfers
- **Production Ready**: Complete deployment and testing infrastructure

## 🏗️ Project Structure

```
doraemon/
├── eth-icp-bridge/
│   ├── ethereum-contracts/
│   │   ├── contracts/
│   │   │   ├── EthereumICPBridge.sol    # Main bridge contract
│   │   │   └── DoraemonResolver.sol     # 1inch Fusion+ resolver
│   │   ├── scripts/
│   │   │   └── deploy-production.js     # Deployment script
│   │   └── test/                        # Contract tests
│   └── icp-canisters/
│       └── bridge_canister/             # ICP canister with real transfers
├── src/
│   ├── fusion-integration-local.ts      # Local Fusion+ integration
│   ├── resolver-service-simple.ts       # Resolver service
│   └── server-local.ts                  # API server
├── scripts/
│   ├── deploy-production.js             # Production deployment
│   ├── start-production.sh              # Production startup
│   ├── test-production-simple.js        # Production testing
│   └── test-icp-canister.js            # ICP canister testing
├── tests/                               # Test suite
└── deployments/                         # Deployment artifacts
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- DFX (Internet Computer SDK)
- Hardhat

### Installation
```bash
npm install
```

### Start Production Environment
```bash
npm run production
```

### Test the Bridge
```bash
# Test production environment
node scripts/test-production-simple.js

# Test ICP canister
node scripts/test-icp-canister.js

# Run all tests
npm test
```

### Create a Swap
```bash
curl -X POST http://localhost:3000/api/swap/ethereum-to-icp \
  -H 'Content-Type: application/json' \
  -d '{
    "amount": "1000000000000000000",
    "icpRecipient": "0x1234567890123456789012345678901234567890",
    "fromToken": "0x0000000000000000000000000000000000000000",
    "toToken": "ICP"
  }'
```

## 🔧 Core Components

### Ethereum Contracts
- **EthereumICPBridge**: Main bridge contract with atomic swap logic
- **DoraemonResolver**: 1inch Fusion+ compatible resolver

### ICP Canister
- **Real Transfers**: Actual ICP ledger integration
- **Hashlock/Timelock**: Cryptographic security mechanisms
- **Cross-chain Communication**: Bridge between EVM and non-EVM chains

### API Server
- **RESTful Endpoints**: Complete swap operations
- **Health Monitoring**: Real-time system checks
- **Error Handling**: Comprehensive error management

## 📊 Status

- ✅ **Production Ready**: All components tested and working
- ✅ **Real Transfers**: ICP ledger integration complete
- ✅ **Security**: All vulnerabilities addressed
- ✅ **Testing**: Comprehensive test coverage
- ✅ **Documentation**: Complete implementation guides

## 🌐 Access Points

- **Hardhat Node**: http://localhost:8545
- **ICP Dashboard**: http://localhost:4943
- **API Server**: http://localhost:3000

## 📋 Contract Addresses

- **Bridge**: `0x2bdCC0de6bE1f7D2ee689a0342D76F52E8EFABa3`
- **Resolver**: `0x7969c5eD335650692Bc04293B07F5BF2e7A673C0`
- **ICP Canister**: `uxrrr-q7777-77774-qaaaq-cai`

## 🎯 Innovation Highlights

- **First ICP Integration**: Novel extension for non-EVM chains
- **Fusion+ Standards**: Full compliance with 1inch requirements
- **Real Transfers**: Actual ICP ledger integration
- **Atomic Swaps**: Trustless cross-chain token transfers

---

**🎯 Ready for hackathon demo with real transfers!** 