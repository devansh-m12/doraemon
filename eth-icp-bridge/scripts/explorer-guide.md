# Transaction Explorer Guide

## 🔍 How to Verify Transactions

### For Local Hardhat Network (Current Setup)

Since you're using the local Hardhat network, there's no public explorer, but you can verify transactions using:

#### 1. Built-in Transaction Checker
```bash
# Check specific transaction
node scripts/check-transaction.js check 0x7a5f5d70cb3615fdb01984d4c048a36bc9096fdeca8df38732499a17af69505b

# Check contract state
node scripts/check-transaction.js state

# List recent transactions
node scripts/check-transaction.js recent 10
```

#### 2. Hardhat Console
```bash
cd ethereum-contracts
npx hardhat console
```

Then in the console:
```javascript
// Get transaction details
const tx = await ethers.provider.getTransaction("0x7a5f5d70cb3615fdb01984d4c048a36bc9096fdeca8df38732499a17af69505b")
console.log(tx)

// Get transaction receipt
const receipt = await ethers.provider.getTransactionReceipt("0x7a5f5d70cb3615fdb01984d4c048a36bc9096fdeca8df38732499a17af69505b")
console.log(receipt)
```

### For Sepolia Testnet

When you deploy to Sepolia testnet, you can use:

#### 1. Etherscan Sepolia
- **URL**: https://sepolia.etherscan.io/
- **Example**: https://sepolia.etherscan.io/tx/YOUR_TX_HASH

#### 2. Sepolia Block Explorer
- **URL**: https://sepolia.etherscan.io/
- **Features**: 
  - Transaction details
  - Contract interactions
  - Event logs
  - Gas usage analysis

### For Ethereum Mainnet

When you deploy to mainnet:

#### 1. Etherscan
- **URL**: https://etherscan.io/
- **Example**: https://etherscan.io/tx/YOUR_TX_HASH

#### 2. Alternative Explorers
- **Etherscan**: https://etherscan.io/
- **Ethplorer**: https://ethplorer.io/
- **Blockchair**: https://blockchair.com/ethereum

## 🌐 ICP Transaction Verification

### For Local ICP Network

#### 1. dfx Commands
```bash
# Check canister status
dfx canister status bridge_canister_backend

# Call canister methods
dfx canister call bridge_canister_backend greet '("test")'

# View canister logs
dfx canister call bridge_canister_backend --query
```

#### 2. Local ICP Dashboard
- **URL**: http://localhost:4943/
- **Features**: Canister management and monitoring

### For ICP Mainnet

#### 1. Internet Computer Dashboard
- **URL**: https://dashboard.internetcomputer.org/
- **Features**: 
  - Canister monitoring
  - Network statistics
  - Transaction history

#### 2. ICP Block Explorer
- **URL**: https://dashboard.internetcomputer.org/canister
- **Example**: https://dashboard.internetcomputer.org/canister/YOUR_CANISTER_ID

## 📊 Transaction Verification Steps

### 1. Verify Transaction Hash
```bash
# For local Hardhat
node scripts/check-transaction.js check 0x7a5f5d70cb3615fdb01984d4c048a36bc9096fdeca8df38732499a17af69505b

# For Sepolia (replace with your tx hash)
# Visit: https://sepolia.etherscan.io/tx/YOUR_TX_HASH
```

### 2. Check Contract State
```bash
# Local contract state
node scripts/check-transaction.js state

# For deployed contracts
# Visit: https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS
```

### 3. Verify Events
The bridge contract emits these events:
- `SwapCreated`: When a new swap is created
- `SwapCompleted`: When a swap is completed
- `SwapRefunded`: When a swap is refunded

### 4. Check ICP Canister
```bash
# Local canister
dfx canister status bridge_canister_backend

# Mainnet canister (when deployed)
# Visit: https://dashboard.internetcomputer.org/canister/YOUR_CANISTER_ID
```

## 🔧 Current Transaction Verification

Based on your recent test, here's what we can verify:

### Transaction Details
- **Hash**: `0x7a5f5d70cb3615fdb01984d4c048a36bc9096fdeca8df38732499a17af69505b`
- **Status**: ✅ Success
- **Block**: 7
- **Gas Used**: 193,155
- **Value**: 0.001 ETH
- **From**: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- **To**: `0x5FbDB2315678afecb367f032d93F642f64180aa3` (Contract)

### Contract State
- **Bridge Fee**: 10 basis points (0.1%)
- **Min Swap**: 0.001 ETH
- **Max Swap**: 100 ETH
- **Contract Balance**: 0.015 ETH
- **Owner**: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`

## 🎯 Next Steps for Production

### 1. Deploy to Sepolia Testnet
```bash
# Configure .env for Sepolia
NETWORK=sepolia
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
SEPOLIA_PRIVATE_KEY=your_private_key

# Deploy contract
cd ethereum-contracts
npx hardhat run scripts/deploy.js --network sepolia
```

### 2. Deploy to ICP Mainnet
```bash
# Use secure identity
dfx identity use bridge-identity

# Deploy canister
cd icp-canisters/bridge_canister
dfx deploy --network ic
```

### 3. Verify on Public Explorers
- **Ethereum**: https://sepolia.etherscan.io/
- **ICP**: https://dashboard.internetcomputer.org/

## 📱 Mobile Explorers

### Ethereum
- **Etherscan Mobile**: Available on App Store/Google Play
- **MetaMask**: Built-in transaction history
- **Trust Wallet**: Transaction tracking

### ICP
- **Internet Computer App**: Official mobile app
- **Plug Wallet**: ICP wallet with transaction history

## 🔍 Advanced Verification

### 1. Event Logs
```javascript
// Get all SwapCreated events
const filter = contract.filters.SwapCreated();
const events = await contract.queryFilter(filter);
console.log(events);
```

### 2. Transaction History
```javascript
// Get all transactions for an address
const history = await provider.getHistory("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
console.log(history);
```

### 3. Contract Interactions
```javascript
// Get all contract calls
const contractHistory = await provider.getHistory("0x5fbdb2315678afecb367f032d93f642f64180aa3");
console.log(contractHistory);
```

---

**Your transactions are working perfectly!** ✅

The bridge is successfully creating swaps and all transactions are being confirmed on the local network. When you deploy to mainnet networks, you'll be able to verify transactions on the public explorers listed above. 