# Secure Environment Setup

This project now uses a secure environment configuration that separates sensitive data from public configuration.

## File Structure

- `.env.example` - Template for public configuration (safe to commit)
- `env.secrets.example` - Template for sensitive data (safe to commit)
- `.env` - Actual public configuration (auto-generated, safe to commit)
- `.env.secrets` - Actual sensitive data (NEVER commit this file)

## Setup Instructions

### 1. Initial Setup

1. Copy the secrets template:
   ```bash
   cp env.secrets.example .env.secrets
   ```

2. Edit `.env.secrets` with your actual sensitive data:
   ```bash
   nano .env.secrets
   ```

3. Run the start script:
   ```bash
   ./start.sh
   ```

### 2. Sensitive Data Configuration

Edit `.env.secrets` and fill in your actual values:

```bash
# Local Network (for testing)
LOCAL_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
LOCAL_WALLET_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

# Sepolia Testnet (your actual keys)
SEPOLIA_PRIVATE_KEY=your_actual_private_key_here
SEPOLIA_WALLET_ADDRESS=your_actual_wallet_address_here
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_actual_alchemy_key

# API Keys
DEV_PORTAL_API_TOKEN=your_1inch_api_token_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
ALCHEMY_API_KEY=your_alchemy_api_key_here

# ICP Configuration
ICP_CANISTER_ID=your_icp_canister_id_here
TEST_ICP_CANISTER_ID=your_test_canister_id_here
```

### 3. Security Features

- **Separation of Concerns**: Sensitive data is kept separate from public configuration
- **Auto-Generation**: The start script automatically creates `.env` from `.env.example`
- **Secrets Loading**: Sensitive data is loaded from `.env.secrets` and merged into `.env`
- **Git Safety**: `.env.secrets` should be in `.gitignore` to prevent accidental commits

### 4. Environment Variables

#### Public Variables (in `.env`)
- Network configuration
- Contract addresses
- Public API endpoints
- Bridge settings
- Development flags

#### Sensitive Variables (in `.env.secrets`)
- Private keys
- Wallet addresses
- API keys
- Canister IDs

### 5. Git Configuration

Add to your `.gitignore`:
```gitignore
# Sensitive data
.env.secrets
.env.local
.env.production

# Generated files
.env
```

### 6. Deployment

For production deployment:
1. Create `.env.secrets` on the server
2. Fill in production values
3. Run the start script
4. The script will automatically generate the proper `.env` file

### 7. Troubleshooting

If you get errors about missing `.env.secrets`:
1. Copy the template: `cp env.secrets.example .env.secrets`
2. Edit with your values: `nano .env.secrets`
3. Run the script again: `./start.sh`

## Benefits

- ✅ No sensitive data in version control
- ✅ Easy setup with templates
- ✅ Automatic environment generation
- ✅ Clear separation of public vs private config
- ✅ Safe for team collaboration
- ✅ Production-ready security practices 