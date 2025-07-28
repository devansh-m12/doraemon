# 🚀 ETH-ICP Bridge - Local Development Guide

This guide will walk you through setting up and running the ETH-ICP Bridge project locally for development and testing.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Detailed Setup](#detailed-setup)
4. [Network Configuration](#network-configuration)
5. [Contract Deployment](#contract-deployment)
6. [Bridge Testing](#bridge-testing)
7. [Development Workflow](#development-workflow)
8. [Troubleshooting](#troubleshooting)
9. [Next Steps](#next-steps)

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **DFX (Internet Computer SDK)** - [Installation guide](https://internetcomputer.org/docs/current/developer-docs/setup/install/)

### Verify Installation
```bash
# Check Node.js version
node --version  # Should be 18.0.0 or higher

# Check npm version
npm --version

# Check Git version
git --version

# Check DFX version
dfx --version
```

## 🚀 Quick Start

### 1. Clone and Setup
```bash
# Clone the repository
git clone <repository-url>
cd doraemon/eth-icp-bridge

# Install dependencies
npm install
cd ethereum-contracts && npm install && cd ..
```

### 2. Environment Setup
```bash
# Copy environment template
cp env.example .env

# Edit environment file with your configuration
# (See detailed setup below)
```

### 3. Start Local Development
```bash
# Start local Hardhat node
npm run node:start

# In a new terminal, deploy contracts
npm run deploy:local

# Test the bridge
npm run test:bridge:local
```

## 🔧 Detailed Setup

### Step 1: Environment Configuration

Copy the environment template and configure it:

```bash
cp env.example .env
```

Edit your `.env` file with the following configuration:

```bash
# =============================================================================
# NETWORK CONFIGURATION
# =============================================================================
NETWORK=local

# =============================================================================
# LOCAL NETWORK CONFIGURATION
# =============================================================================
LOCAL_RPC_URL=http://127.0.0.1:8545
LOCAL_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
LOCAL_CONTRACT_ADDRESS=your_deployed_contract_address_here
LOCAL_WALLET_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

# =============================================================================
# 1INCH FUSION SDK CONFIGURATION
# =============================================================================
FUSION_API_URL=https://api.1inch.dev/fusion
DEV_PORTAL_API_TOKEN=your_1inch_api_token_here

# =============================================================================
# ICP CONFIGURATION
# =============================================================================
ICP_CANISTER_ID=your_icp_canister_id_here
ICP_NETWORK_URL=https://ic0.app

# =============================================================================
# BRIDGE CONFIGURATION
# =============================================================================
BRIDGE_FEE_PERCENTAGE=10
MIN_SWAP_AMOUNT=1000000000000000
MAX_SWAP_AMOUNT=100000000000000000000

# =============================================================================
# DEVELOPMENT CONFIGURATION
# =============================================================================
TEST_MODE=true
TEST_ICP_CANISTER_ID=your_test_canister_id_here
```

### Step 2: Get Required API Keys

#### 1inch Fusion API Token
1. Visit [1inch Developer Portal](https://portal.1inch.dev/)
2. Create an account and get your API token
3. Add it to your `.env` file as `DEV_PORTAL_API_TOKEN`

#### ICP Canister ID (Optional for Local Testing)
For local development, you can use a placeholder canister ID:
```
ICP_CANISTER_ID=rrkah-fqaaa-aaaaa-aaaaq-cai
```

### Step 3: Verify Setup
```bash
# Check network configuration
node scripts/network-config.js show

# Validate configuration
node scripts/network-config.js validate
```

## 🌐 Network Configuration

The project supports both local and Sepolia networks. For local development, we'll use the local Hardhat network.

### Network Options

| Network | Chain ID | Use Case | Setup Required |
|---------|----------|----------|----------------|
| **Local** | 1337 | Development, testing | None (automatic) |
| **Sepolia** | 11155111 | Integration testing | Testnet ETH, API keys |

### Switch Networks
```bash
# Switch to local network (default for development)
node scripts/network-config.js switch local

# Switch to Sepolia network (for integration testing)
node scripts/network-config.js switch sepolia

# Show current configuration
node scripts/network-config.js show
```

## 📦 Contract Deployment

### Local Network Deployment

1. **Start Local Node**
   ```bash
   npm run node:start
   ```
   This starts a local Hardhat node with pre-funded accounts.

2. **Deploy Contracts**
   ```bash
   npm run deploy:local
   ```
   This will deploy the bridge contract and save the address.

3. **Update Environment**
   Copy the deployed contract address to your `.env` file:
   ```bash
   LOCAL_CONTRACT_ADDRESS=0x...  # Address from deployment output
   ```

### Verify Deployment
```bash
# Check deployment info
node scripts/network-config.js deployment

# Check contract state
npm run check:local
```

## 🧪 Bridge Testing

### Basic Testing
```bash
# Test bridge protocol
npm run test:bridge:local

# Run network demo
node scripts/demo-networks.js demo
```

### Advanced Testing
```bash
# Test specific functionality
node scripts/test-implementations.js local

# Check available amounts
node scripts/test-available-amount.js

# Test minimum swap amounts
node scripts/test-minimum-swap.js
```

### Manual Testing
```bash
# Start bridge protocol
npm run start:local

# In another terminal, test specific functions
node scripts/check-contract-state.js local
```

## 🔄 Development Workflow

### Recommended Local Development Workflow

1. **Start Development Environment**
   ```bash
   # Terminal 1: Start local node
   npm run node:start
   
   # Terminal 2: Deploy contracts
   npm run deploy:local
   ```

2. **Configure Environment**
   ```bash
   # Update .env with deployed contract address
   # Edit LOCAL_CONTRACT_ADDRESS in your .env file
   ```

3. **Test Bridge**
   ```bash
   # Test basic functionality
   npm run test:bridge:local
   
   # Test specific features
   node scripts/test-implementations.js local
   ```

4. **Iterate and Develop**
   ```bash
   # Make changes to contracts
   cd ethereum-contracts
   npm run compile
   npm run deploy:local
   
   # Test changes
   npm run test:bridge:local
   ```

### Network Switching During Development
```bash
# Switch to local for fast development
node scripts/network-config.js switch local
npm run test:bridge:local

# Switch to Sepolia for integration testing
node scripts/network-config.js switch sepolia
npm run test:bridge:sepolia
```

## 🛠️ Available Scripts

### Contract Management
```bash
npm run compile           # Compile contracts
npm run deploy:local      # Deploy to local network
npm run deploy:sepolia    # Deploy to Sepolia network
npm run clean             # Clean build artifacts
```

### Bridge Operations
```bash
npm run start:local       # Start bridge on local network
npm run start:sepolia     # Start bridge on Sepolia network
npm run test:bridge:local # Test bridge on local network
npm run test:bridge:sepolia # Test bridge on Sepolia network
```

### Network Management
```bash
npm run node:start        # Start local Hardhat node
npm run check:local       # Check contract state on local
npm run check:sepolia     # Check contract state on Sepolia
```

### Utility Scripts
```bash
node scripts/network-config.js show      # Show current config
node scripts/network-config.js switch local  # Switch network
node scripts/network-config.js validate  # Validate config
node scripts/demo-networks.js demo       # Run network demo
```

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

### Debug Common Issues
```bash
# Check if local node is running
curl http://127.0.0.1:8545

# Check contract compilation
cd ethereum-contracts && npm run compile

# Check environment variables
node scripts/network-config.js validate
```

## 🚨 Troubleshooting

### Common Issues and Solutions

#### 1. Local Node Not Starting
```bash
# Kill existing processes
pkill -f hardhat

# Start fresh
npm run node:start
```

#### 2. Contract Deployment Fails
```bash
# Clean and recompile
npm run clean
npm run compile
npm run deploy:local
```

#### 3. Environment Configuration Issues
```bash
# Validate configuration
node scripts/network-config.js validate

# Check specific network
node scripts/network-config.js validate local
```

#### 4. Bridge Protocol Errors
```bash
# Check contract address
node scripts/network-config.js deployment

# Verify environment variables
node scripts/network-config.js show
```

#### 5. Network Connection Issues
```bash
# Test local connection
curl http://127.0.0.1:8545

# Check if port is in use
lsof -i :8545
```

### Error Messages and Solutions

| Error | Solution |
|-------|----------|
| `Missing required environment variables` | Run `node scripts/network-config.js validate` and fix missing variables |
| `Contract not deployed` | Run `npm run deploy:local` and update contract address |
| `Network not configured` | Run `node scripts/network-config.js switch local` |
| `RPC connection failed` | Start local node with `npm run node:start` |

## 📚 Additional Resources

### Documentation Files
- `NETWORK_SETUP.md` - Detailed network configuration guide
- `DUAL_NETWORK_SUMMARY.md` - Implementation summary
- `eth-icp-bridge/README.md` - Project overview
- `eth-icp-bridge/docs/` - Additional documentation

### Useful Commands Reference
```bash
# Network management
node scripts/network-config.js show
node scripts/network-config.js switch local
node scripts/network-config.js validate

# Contract operations
npm run compile
npm run deploy:local
npm run clean

# Bridge testing
npm run test:bridge:local
node scripts/demo-networks.js demo

# Development tools
npm run node:start
npm run check:local
```

## 🎯 Next Steps

After successfully setting up the local environment:

1. **Explore the Codebase**
   - Review `eth-icp-bridge/ethereum-contracts/contracts/` for smart contracts
   - Check `eth-icp-bridge/scripts/` for utility scripts
   - Examine `eth-icp-bridge/icp-canisters/` for ICP implementation

2. **Test Different Scenarios**
   - Test bridge protocol with different amounts
   - Experiment with different network configurations
   - Try switching between local and Sepolia networks

3. **Contribute to Development**
   - Add new features to the bridge protocol
   - Improve error handling and validation
   - Enhance testing coverage

4. **Deploy to Testnet**
   - Switch to Sepolia network for integration testing
   - Deploy contracts to Sepolia testnet
   - Test with real network conditions

## 🆘 Getting Help

If you encounter issues:

1. **Check the troubleshooting section** above
2. **Validate your configuration** with `node scripts/network-config.js validate`
3. **Review the documentation** in the `docs/` folder
4. **Check the project status** in `STATUS_SUMMARY.md`

For additional support, refer to the project documentation or create an issue in the repository.

---

**Happy coding! 🚀**

This guide should get you up and running with the ETH-ICP Bridge project locally. The setup provides a robust development environment with both local and testnet capabilities. 