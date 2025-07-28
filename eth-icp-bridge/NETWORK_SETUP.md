# Network Setup Guide

This guide explains how to use both **Local Hardhat Network** and **Sepolia Testnet** for the ETH-ICP Bridge.

## 🏗️ Network Overview

### Local Network (Hardhat)
- **Chain ID**: 1337
- **RPC URL**: http://127.0.0.1:8545
- **Use Case**: Development, testing, debugging
- **Advantages**: Fast, free, no external dependencies
- **Disadvantages**: Not persistent, requires local node

### Sepolia Testnet
- **Chain ID**: 11155111
- **RPC URL**: https://eth-sepolia.g.alchemy.com/v2/your_key
- **Use Case**: Testing with real network conditions
- **Advantages**: Realistic testing environment, persistent
- **Disadvantages**: Requires testnet ETH, external dependencies

## 🚀 Quick Start

### 1. Environment Setup

Copy the environment template:
```bash
cp env.example .env
```

Configure your `.env` file with the appropriate values for your target network.

### 2. Network Configuration

Use the network configuration helper:
```bash
# Show current network configuration
node scripts/network-config.js show

# Switch to local network
node scripts/network-config.js switch local

# Switch to Sepolia network
node scripts/network-config.js switch sepolia

# Validate configuration
node scripts/network-config.js validate
```

## 📋 Available Scripts

### Contract Deployment
```bash
# Deploy to local network
npm run deploy:local

# Deploy to Sepolia network
npm run deploy:sepolia
```

### Bridge Operations
```bash
# Start bridge on local network
npm run start:local

# Start bridge on Sepolia network
npm run start:sepolia
```

### Testing
```bash
# Test bridge on local network
npm run test:bridge:local

# Test bridge on Sepolia network
npm run test:bridge:sepolia
```

### Contract State Checks
```bash
# Check contract state on local network
npm run check:local

# Check contract state on Sepolia network
npm run check:sepolia
```

### Development Tools
```bash
# Start local Hardhat node
npm run node:start

# Compile contracts
npm run compile

# Clean build artifacts
npm run clean
```

## 🔧 Detailed Setup Instructions

### Local Network Setup

1. **Start Local Node**:
   ```bash
   npm run node:start
   ```
   This starts a local Hardhat node with pre-funded accounts.

2. **Deploy Contract**:
   ```bash
   npm run deploy:local
   ```
   This deploys the bridge contract to your local network.

3. **Update Environment**:
   Copy the deployed contract address to your `.env` file:
   ```
   LOCAL_CONTRACT_ADDRESS=your_deployed_address
   LOCAL_PRIVATE_KEY=your_private_key
   LOCAL_WALLET_ADDRESS=your_wallet_address
   ```

4. **Test Bridge**:
   ```bash
   npm run test:bridge:local
   ```

### Sepolia Network Setup

1. **Get Testnet ETH**:
   - Visit [Sepolia Faucet](https://sepoliafaucet.com/)
   - Get testnet ETH for your wallet

2. **Configure Environment**:
   Update your `.env` file with Sepolia credentials:
   ```
   SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_key
   SEPOLIA_PRIVATE_KEY=your_private_key
   SEPOLIA_WALLET_ADDRESS=your_wallet_address
   ```

3. **Deploy Contract**:
   ```bash
   npm run deploy:sepolia
   ```

4. **Update Contract Address**:
   ```
   SEPOLIA_CONTRACT_ADDRESS=your_deployed_address
   ```

5. **Test Bridge**:
   ```bash
   npm run test:bridge:sepolia
   ```

## 🔄 Switching Between Networks

### Using Network Config Helper
```bash
# Switch to local network
node scripts/network-config.js switch local

# Switch to Sepolia network
node scripts/network-config.js switch sepolia

# Verify current configuration
node scripts/network-config.js show
```

### Manual Environment Update
Edit your `.env` file and change:
```
NETWORK=local    # or NETWORK=sepolia
```

## 📊 Network Comparison

| Feature | Local Network | Sepolia Testnet |
|---------|---------------|-----------------|
| **Speed** | Instant | ~15 seconds |
| **Cost** | Free | Requires testnet ETH |
| **Persistence** | No (resets on restart) | Yes |
| **Realism** | Basic | High |
| **External Dependencies** | None | RPC provider, faucet |
| **Best For** | Development, debugging | Integration testing |

## 🛠️ Troubleshooting

### Local Network Issues

1. **Node not starting**:
   ```bash
   # Kill existing processes
   pkill -f hardhat
   # Start fresh
   npm run node:start
   ```

2. **Contract deployment fails**:
   ```bash
   # Clean and recompile
   npm run clean
   npm run compile
   npm run deploy:local
   ```

### Sepolia Network Issues

1. **Insufficient testnet ETH**:
   - Visit [Sepolia Faucet](https://sepoliafaucet.com/)
   - Request testnet ETH

2. **RPC connection issues**:
   - Check your Alchemy API key
   - Verify RPC URL format
   - Check network connectivity

3. **Contract verification fails**:
   - Ensure ETHERSCAN_API_KEY is set
   - Wait 30-60 seconds after deployment
   - Check if contract is already verified

## 🔍 Monitoring and Debugging

### Check Network Status
```bash
# Show current network configuration
node scripts/network-config.js show

# Validate configuration
node scripts/network-config.js validate

# Show deployment info
node scripts/network-config.js deployment
```

### Check Contract State
```bash
# Local network
npm run check:local

# Sepolia network
npm run check:sepolia
```

## 📝 Environment Variables Reference

### Local Network Variables
```
NETWORK=local
LOCAL_RPC_URL=http://127.0.0.1:8545
LOCAL_PRIVATE_KEY=your_private_key
LOCAL_CONTRACT_ADDRESS=your_contract_address
LOCAL_WALLET_ADDRESS=your_wallet_address
```

### Sepolia Network Variables
```
NETWORK=sepolia
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_key
SEPOLIA_PRIVATE_KEY=your_private_key
SEPOLIA_CONTRACT_ADDRESS=your_contract_address
SEPOLIA_WALLET_ADDRESS=your_wallet_address
ETHERSCAN_API_KEY=your_etherscan_key
```

### Common Variables (Both Networks)
```
FUSION_API_URL=https://api.1inch.dev/fusion
DEV_PORTAL_API_TOKEN=your_1inch_token
ICP_CANISTER_ID=your_icp_canister_id
ICP_NETWORK_URL=https://ic0.app
BRIDGE_FEE_PERCENTAGE=10
MIN_SWAP_AMOUNT=1000000000000000
MAX_SWAP_AMOUNT=100000000000000000000
TEST_MODE=true
```

## 🎯 Best Practices

1. **Development Workflow**:
   - Use local network for initial development
   - Switch to Sepolia for integration testing
   - Use network config helper for easy switching

2. **Testing Strategy**:
   - Unit tests on local network
   - Integration tests on Sepolia
   - Performance tests on both networks

3. **Configuration Management**:
   - Keep both network configs in `.env`
   - Use network config helper for validation
   - Document deployment addresses

4. **Security**:
   - Never commit private keys
   - Use testnet keys only
   - Validate configurations before deployment 