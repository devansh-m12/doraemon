# 🔧 Environment Setup for Sepolia Deployment

## 📝 Create your .env file

Copy this content into your `.env` file:

```bash
# 1inch Fusion SDK Configuration
FUSION_API_URL=https://api.1inch.dev/fusion
DEV_PORTAL_API_TOKEN=your_1inch_api_token_here

# Ethereum Configuration (Sepolia Testnet)
ETHEREUM_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_sepolia_key
ETHEREUM_PRIVATE_KEY=your_ethereum_private_key_here
ETHEREUM_CONTRACT_ADDRESS=your_deployed_contract_address_here
ETHEREUM_WALLET_ADDRESS=your_ethereum_wallet_address_here

# ICP Configuration
ICP_CANISTER_ID=your_icp_canister_id_here
ICP_NETWORK_URL=https://ic0.app

# Bridge Configuration
BRIDGE_FEE_PERCENTAGE=10
MIN_SWAP_AMOUNT=1000000000000000
MAX_SWAP_AMOUNT=100000000000000000000

# Test Configuration (for development)
TEST_MODE=true
TEST_ETHEREUM_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_sepolia_key
TEST_ICP_CANISTER_ID=your_test_canister_id_here

# Sepolia Network Configuration
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_sepolia_key
SEPOLIA_PRIVATE_KEY=your_ethereum_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

## 🚀 Quick Setup Commands

```bash
# 1. Create .env file
cd eth-icp-bridge
cp env.example .env

# 2. Edit .env with your values
# Replace the placeholder values with your actual keys

# 3. Deploy Ethereum contract to Sepolia
cd ethereum-contracts
npx hardhat run scripts/deploy.js --network sepolia

# 4. Deploy ICP canister
cd ../icp-canisters/bridge_canister
./deploy.sh

# 5. Update .env with deployed addresses
# Copy the contract address and canister ID to your .env file
```

## 🔑 Required API Keys

### 1. Alchemy Sepolia API Key
1. Go to [Alchemy](https://www.alchemy.com/)
2. Create a new app
3. Select "Sepolia" network
4. Copy your API key
5. Replace `your_sepolia_key` in `.env`

### 2. 1inch API Token
1. Go to [1inch Developer Portal](https://portal.1inch.dev/)
2. Create a new project
3. Copy your API token
4. Replace `your_1inch_api_token_here` in `.env`

### 3. Ethereum Private Key
1. Export your wallet's private key (be careful!)
2. Replace `your_ethereum_private_key_here` in `.env`

### 4. Etherscan API Key (optional)
1. Go to [Etherscan](https://etherscan.io/)
2. Create an account and get API key
3. Replace `your_etherscan_api_key_here` in `.env`

## ⚠️ Security Notes

- **Never commit your .env file** - it's in .gitignore
- **Keep your private key secure** - never share it
- **Use Sepolia testnet only** - avoid mainnet for development
- **Backup your deployment addresses** - save them securely

## 📋 Next Steps

1. Get your API keys from the services above
2. Create the `.env` file with the content above
3. Replace placeholder values with your actual keys
4. Deploy the contracts
5. Update `.env` with the deployed addresses 