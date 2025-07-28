# Real Transactions Setup Guide

This guide explains how to configure the frontend to use real transactions instead of simulations.

## 🎯 Overview

The frontend now supports real blockchain transactions using the Ethereum-ICP bridge. When properly configured, it will:

1. **Make real Ethereum transactions** to the bridge contract
2. **Use actual cryptographic materials** (hashlock, preimage, timelock)
3. **Track real transaction status** from the blockchain
4. **Fall back to simulation** if real transactions are not configured

## 🚀 Quick Setup

### 1. Copy Environment Template

```bash
cp env.example .env.local
```

### 2. Configure for Local Network (Recommended for Development)

Edit `.env.local` and set:

```bash
# Network Configuration
NEXT_PUBLIC_NETWORK=local

# Local Network Settings
NEXT_PUBLIC_LOCAL_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_LOCAL_PRIVATE_KEY=your_private_key_here
NEXT_PUBLIC_LOCAL_CONTRACT_ADDRESS=your_deployed_contract_address
NEXT_PUBLIC_LOCAL_WALLET_ADDRESS=your_wallet_address
```

### 3. Configure for Sepolia Testnet (For Testing)

```bash
# Network Configuration
NEXT_PUBLIC_NETWORK=sepolia

# Sepolia Network Settings
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_key
NEXT_PUBLIC_SEPOLIA_PRIVATE_KEY=your_private_key_here
NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS=your_deployed_contract_address
NEXT_PUBLIC_SEPOLIA_WALLET_ADDRESS=your_wallet_address
```

## 🔧 Detailed Configuration

### Step 1: Deploy the Bridge Contract

First, deploy the Ethereum bridge contract:

```bash
# For local network
cd ../eth-icp-bridge
npm run deploy:local

# For Sepolia network
npm run deploy:sepolia
```

### Step 2: Get Contract Address

After deployment, copy the contract address to your `.env.local`:

```bash
# For local network
NEXT_PUBLIC_LOCAL_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# For Sepolia network
NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS=0x2F880DB4c7A0C71BF23F0Ee523650766c801C5ab
```

### Step 3: Configure Wallet

You need a wallet with ETH for transactions:

```bash
# For local network (use Hardhat default accounts)
NEXT_PUBLIC_LOCAL_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
NEXT_PUBLIC_LOCAL_WALLET_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

# For Sepolia network (use your own wallet)
NEXT_PUBLIC_SEPOLIA_PRIVATE_KEY=your_private_key_here
NEXT_PUBLIC_SEPOLIA_WALLET_ADDRESS=your_wallet_address_here
```

### Step 4: Start Local Network (if using local)

```bash
# Terminal 1: Start Hardhat node
cd ../eth-icp-bridge/ethereum-contracts
npx hardhat node

# Terminal 2: Start frontend
cd frontend
npm run dev
```

## 🧪 Testing Real Transactions

### 1. Check Bridge Status

The frontend will show a "Bridge Status" section indicating:
- ✅ **Ready for Real Transactions** - Real transactions enabled
- ⚠️ **Simulation Mode** - Using fallback simulation

### 2. Create a Test Swap

1. Select an Ethereum account
2. Enter an ICP Principal ID
3. Enter an amount (minimum 0.001 ETH)
4. Click "Create Real Swap"

### 3. Monitor Transaction

The frontend will show:
- Real transaction hash
- Gas usage
- Block number
- Swap order ID from contract

## 🔍 Troubleshooting

### Common Issues

#### 1. "Bridge service not initialized"
**Solution**: Check your `.env.local` configuration
```bash
# Verify all required variables are set
NEXT_PUBLIC_NETWORK=local
NEXT_PUBLIC_LOCAL_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_LOCAL_PRIVATE_KEY=your_key
NEXT_PUBLIC_LOCAL_CONTRACT_ADDRESS=your_address
```

#### 2. "Transaction failed"
**Solution**: Check wallet balance and network
```bash
# For local network, ensure Hardhat node is running
npx hardhat node

# For Sepolia, ensure you have testnet ETH
# Visit: https://sepoliafaucet.com/
```

#### 3. "Contract not deployed"
**Solution**: Deploy the contract first
```bash
cd ../eth-icp-bridge
npm run deploy:local  # or deploy:sepolia
```

#### 4. "Insufficient balance"
**Solution**: Add more ETH to your wallet
```bash
# For local network, use Hardhat accounts
# For Sepolia, get testnet ETH from faucet
```

### Debug Commands

```bash
# Check if local node is running
curl http://127.0.0.1:8545

# Check contract deployment
cd ../eth-icp-bridge
node scripts/check-contract-state.js

# Test bridge functionality
node scripts/test-minimum-swap.js
```

## 🔒 Security Notes

### Private Keys
- ⚠️ **Never commit private keys** to version control
- ⚠️ **Use testnet keys only** for development
- ⚠️ **Keep mainnet keys secure** and separate

### Environment Variables
- ✅ Use `.env.local` for local development
- ✅ Use environment variables in production
- ✅ Never expose private keys in client-side code

### Network Security
- ✅ Use HTTPS for production RPC URLs
- ✅ Validate contract addresses
- ✅ Check network chain IDs

## 📊 Network Comparison

| Feature | Local Network | Sepolia Testnet |
|---------|---------------|-----------------|
| **Speed** | Instant | ~15 seconds |
| **Cost** | Free | Requires testnet ETH |
| **Persistence** | No (resets on restart) | Yes |
| **Realism** | Basic | High |
| **Best For** | Development, debugging | Integration testing |

## 🎯 Next Steps

### For Development
1. ✅ Set up local network configuration
2. ✅ Deploy contract locally
3. ✅ Test with real transactions
4. ✅ Debug any issues

### For Production
1. 🔄 Deploy to mainnet networks
2. 🔄 Configure production environment
3. 🔄 Implement security measures
4. 🔄 Add monitoring and alerts

## 📝 Example Configuration

### Local Network (.env.local)
```bash
NEXT_PUBLIC_NETWORK=local
NEXT_PUBLIC_LOCAL_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_LOCAL_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
NEXT_PUBLIC_LOCAL_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_LOCAL_WALLET_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

### Sepolia Network (.env.local)
```bash
NEXT_PUBLIC_NETWORK=sepolia
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_key
NEXT_PUBLIC_SEPOLIA_PRIVATE_KEY=your_private_key_here
NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS=0x2F880DB4c7A0C71BF23F0Ee523650766c801C5ab
NEXT_PUBLIC_SEPOLIA_WALLET_ADDRESS=your_wallet_address_here
```

---

**Happy swapping! 🚀**

The frontend is now ready to handle real transactions when properly configured, with automatic fallback to simulation mode for development and testing. 