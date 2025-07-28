# 🔄 Fusion Swap Testing Guide

This guide explains how to test the 1inch Fusion swap functionality using the local network and ICP integration.

## 🎯 Overview

The fusion swap test validates the complete flow from Ethereum to ICP using 1inch Fusion SDK, including:
- Local network connectivity
- Fusion SDK integration
- Bridge contract interaction
- ICP canister simulation
- Complete swap flow validation

## 🚀 Quick Start

### 1. Setup Local Environment
```bash
# Switch to local network
node scripts/network-config.js switch local

# Start local Hardhat node
npm run node:start

# Deploy contracts (in new terminal)
npm run deploy:local
```

### 2. Run Fusion Tests
```bash
# Run comprehensive fusion swap tests
npm run test:fusion:local

# Or run the test directly
node scripts/test-fusion-local.js
```

## 📋 Test Components

### Test 1: Fusion SDK Connection
- Validates 1inch Fusion SDK initialization
- Tests API connectivity (with fallback to test mode)
- Verifies SDK configuration

### Test 2: Local Network Connection
- Tests local Hardhat network connectivity
- Validates provider connection
- Checks wallet balance (if configured)

### Test 3: Bridge Contract Integration
- Tests bridge contract initialization
- Validates contract ABI loading
- Checks contract deployment status

### Test 4: Mock Fusion Swap Creation
- Creates mock fusion orders
- Generates cryptographic materials (hashlock/preimage)
- Simulates order creation process

### Test 5: ICP Canister Integration
- Simulates ICP canister calls
- Tests cross-chain communication
- Validates ICP order creation

### Test 6: Complete Swap Flow
- Tests end-to-end swap process
- Validates order completion
- Simulates successful swap execution

### Test 7: Environment Validation
- Validates environment configuration
- Checks required variables
- Displays current network settings

## 🔧 Configuration Requirements

### Required Environment Variables
```bash
# Network Configuration
NETWORK=local
LOCAL_RPC_URL=http://127.0.0.1:8545
LOCAL_PRIVATE_KEY=your_private_key_here
LOCAL_CONTRACT_ADDRESS=your_deployed_contract_address
LOCAL_WALLET_ADDRESS=your_wallet_address

# Fusion SDK Configuration
FUSION_API_URL=https://api.1inch.dev/fusion
DEV_PORTAL_API_TOKEN=your_1inch_api_token_here

# ICP Configuration
ICP_CANISTER_ID=your_icp_canister_id_here
ICP_NETWORK_URL=https://ic0.app
```

### Optional Configuration
```bash
# For enhanced testing
TEST_MODE=true
BRIDGE_FEE_PERCENTAGE=10
MIN_SWAP_AMOUNT=1000000000000000
MAX_SWAP_AMOUNT=100000000000000000000
```

## 🧪 Test Modes

### Test Mode (Default)
- Uses mock fusion orders
- Simulates ICP canister calls
- No real API calls to 1inch
- Safe for development and testing

### Live Mode
- Requires valid 1inch API token
- Makes real API calls to Fusion SDK
- Requires configured ICP canister
- For production testing

## 📊 Expected Test Results

### Successful Test Run
```
🚀 Starting Fusion Swap Local Network Tests
==================================================

🔌 Test 1: Fusion SDK Connection
========================================
✅ Fusion SDK connection successful

🌐 Test 2: Local Network Connection
========================================
✅ Local network connected, Block: 12345
✅ Wallet balance: 1000.0 ETH

📋 Test 3: Bridge Contract Integration
========================================
✅ Bridge contract integration successful

🔄 Test 4: Mock Fusion Swap Creation
========================================
✅ Mock fusion order created: fusion_1234567890_abc123
✅ Bridge order created with hashlock: 0x...

🔗 Test 5: ICP Canister Integration Simulation
========================================
✅ ICP canister integration simulation successful
✅ ICP Order ID: icp_1234567890_def456

🔄 Test 6: Complete Swap Flow Simulation
========================================
✅ Complete swap flow simulation successful

🔍 Test 7: Environment Validation
========================================
✅ Environment validation passed

📊 Test Results Summary
==============================
fusionConnection: ✅ PASS
localNetwork: ✅ PASS
bridgeContract: ✅ PASS
mockFusionSwap: ✅ PASS
icpCanister: ✅ PASS
completeFlow: ✅ PASS
environment: ✅ PASS

🎯 Overall Result: 7/7 tests passed
🎉 All tests passed! Fusion swap is ready for local development.
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Local Node Not Running
```bash
# Start local node
npm run node:start

# Verify node is running
curl http://127.0.0.1:8545
```

#### 2. Contract Not Deployed
```bash
# Deploy contracts
npm run deploy:local

# Update environment with contract address
# Edit LOCAL_CONTRACT_ADDRESS in .env file
```

#### 3. Environment Configuration Issues
```bash
# Validate configuration
node scripts/network-config.js validate

# Show current config
node scripts/network-config.js show
```

#### 4. Fusion SDK Connection Issues
```bash
# Check API token
echo $DEV_PORTAL_API_TOKEN

# Test in test mode
TEST_MODE=true npm run test:fusion:local
```

### Error Messages and Solutions

| Error | Solution |
|-------|----------|
| `Missing RPC URL` | Set `LOCAL_RPC_URL` in `.env` file |
| `No contract address` | Deploy contracts and set `LOCAL_CONTRACT_ADDRESS` |
| `Fusion SDK connection failed` | Check API token or use test mode |
| `Local network connection failed` | Start local Hardhat node |
| `Environment validation failed` | Run `node scripts/network-config.js validate` |

## 🔄 Advanced Testing

### Custom Test Parameters
```bash
# Test with specific amounts
node scripts/test-fusion-local.js --amount 0.1

# Test with specific tokens
node scripts/test-fusion-local.js --from-token ETH --to-token ICP

# Test with custom timelock
node scripts/test-fusion-local.js --timelock 7200
```

### Integration with Real ICP Canister
```bash
# Set real ICP canister ID
ICP_CANISTER_ID=your_real_canister_id

# Run tests with real ICP integration
npm run test:fusion:local
```

### Live Fusion API Testing
```bash
# Set valid 1inch API token
DEV_PORTAL_API_TOKEN=your_real_api_token

# Disable test mode
TEST_MODE=false

# Run live tests
npm run test:fusion:local
```

## 📈 Performance Testing

### Load Testing
```bash
# Test multiple concurrent swaps
for i in {1..10}; do
  npm run test:fusion:local &
done
wait
```

### Stress Testing
```bash
# Test with large amounts
node scripts/test-fusion-local.js --amount 10.0

# Test with rapid succession
for i in {1..50}; do
  node scripts/test-fusion-local.js --quick
done
```

## 🔐 Security Testing

### Cryptographic Validation
- Hashlock generation and verification
- Preimage validation
- Timelock enforcement
- Signature verification

### Error Handling
- Network disconnection scenarios
- Invalid order handling
- Failed swap recovery
- Refund mechanisms

## 📝 Test Reports

### Generate Test Report
```bash
# Run tests with detailed output
npm run test:fusion:local > fusion-test-report.log

# Analyze results
grep "PASS\|FAIL" fusion-test-report.log
```

### Continuous Integration
```bash
# Run tests in CI environment
npm run test:fusion:local --ci

# Exit with error code on failure
npm run test:fusion:local --strict
```

## 🎯 Next Steps

After successful fusion swap testing:

1. **Deploy to Testnet**
   - Switch to Sepolia network
   - Deploy contracts to testnet
   - Test with real ETH amounts

2. **Integrate Real ICP Canister**
   - Deploy ICP canister to testnet
   - Configure real canister ID
   - Test cross-chain communication

3. **Production Testing**
   - Get production 1inch API token
   - Deploy to mainnet
   - Test with real funds

4. **Performance Optimization**
   - Optimize gas usage
   - Improve transaction speed
   - Enhance error handling

## 📚 Additional Resources

- [1inch Fusion SDK Documentation](https://docs.1inch.dev/)
- [Hardhat Network Guide](https://hardhat.org/hardhat-network/)
- [ICP Canister Development](https://internetcomputer.org/docs/current/developer-docs/)
- [Ethereum Development](https://ethereum.org/developers/)

---

**Happy testing! 🚀**

This guide provides comprehensive testing for the fusion swap functionality. The tests validate the complete flow from Ethereum to ICP using 1inch Fusion, ensuring reliable cross-chain swaps. 