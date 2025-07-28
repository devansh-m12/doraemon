# ICP Transaction Explorer - Start Script

## 🚀 Quick Start

The `start.sh` script provides a complete setup for the ICP Transaction Explorer with real data integration.

### Prerequisites

Before running the start script, ensure you have the following installed:

1. **Node.js** (v16 or higher)
2. **npm** (comes with Node.js)
3. **dfx** (Internet Computer SDK)

### Install dfx (if not already installed)

```bash
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
```

### Run the Start Script

```bash
./start.sh
```

## 📋 What the Start Script Does

### 1. **Dependency Check**
- Verifies Node.js, npm, and dfx are installed
- Ensures you're in the correct project directory

### 2. **Environment Setup**
- Creates `.env` file with local network configuration
- Sets up environment variables for both Ethereum and ICP networks
- Configures the frontend to use real data instead of mock data

### 3. **Hardhat Local Network**
- Starts Hardhat local blockchain network
- Deploys bridge contracts automatically
- Updates environment with contract addresses

### 4. **ICP Local Network**
- Starts dfx local network
- Deploys bridge canister
- Updates environment with canister IDs

### 5. **Frontend Setup**
- Installs frontend dependencies
- Updates frontend to use real ICP data
- Starts Next.js development server

### 6. **Stop Script Creation**
- Creates `stop.sh` script for easy cleanup

## 🔧 Environment Configuration

The script creates the following environment variables:

```env
# ICP Network Configuration
NEXT_PUBLIC_ICP_NETWORK=local
NEXT_PUBLIC_ICP_HOST=http://localhost:4943
NEXT_PUBLIC_BRIDGE_CANISTER_ID=<deployed_canister_id>

# Ethereum Configuration
NEXT_PUBLIC_ETHEREUM_NETWORK=localhost
NEXT_PUBLIC_ETHEREUM_RPC_URL=http://localhost:8545
NEXT_PUBLIC_BRIDGE_CONTRACT_ADDRESS=<deployed_contract_address>

# Development Configuration
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_USE_LOCAL_NETWORKS=true

# Hardhat Configuration
HARDHAT_NETWORK=localhost
```

## 🌐 Services Started

After running the script, you'll have access to:

- **Hardhat Local Network**: http://localhost:8545
- **ICP Local Network**: http://localhost:4943
- **Frontend Application**: http://localhost:3000
- **Bridge Contract**: Automatically deployed and configured
- **Bridge Canister**: Automatically deployed and configured

## 📊 Real Data Integration

The frontend is now configured to use real data instead of mock data:

### **Balance Checking**
- Real ICP balance verification
- Actual transaction history
- Network status monitoring

### **Transaction Explorer**
- Real bridge transactions
- Live transaction data
- Network connectivity status

### **Network Status**
- Real-time network connectivity
- Automatic fallback handling
- Error reporting

## 🛑 Stopping Services

To stop all services, run:

```bash
./stop.sh
```

This will:
- Stop the frontend development server
- Stop the Hardhat local network
- Stop the ICP local network
- Clean up process IDs

## 📝 Log Files

The script creates several log files for debugging:

- **hardhat.log**: Hardhat network logs
- **dfx.log**: ICP local network logs
- **bridge-deploy.log**: Bridge canister deployment logs

To view logs in real-time:

```bash
# Hardhat logs
tail -f hardhat.log

# ICP network logs
tail -f dfx.log

# Bridge deployment logs
tail -f bridge-deploy.log
```

## 🔍 Troubleshooting

### Common Issues

#### 1. **dfx not found**
```bash
# Install dfx
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
```

#### 2. **Port already in use**
```bash
# Kill existing processes
pkill -f "dfx start"
pkill -f "hardhat node"
pkill -f "next dev"
```

#### 3. **Permission denied**
```bash
# Make script executable
chmod +x start.sh
chmod +x stop.sh
```

#### 4. **Network connection issues**
```bash
# Check if services are running
ps aux | grep dfx
ps aux | grep hardhat
ps aux | grep next
```

### Manual Setup

If the script fails, you can manually set up each component:

#### 1. **Start Hardhat**
```bash
cd eth-icp-bridge/ethereum-contracts
npm install
npx hardhat node &
npx hardhat run scripts/deploy-local.js --network localhost
```

#### 2. **Start ICP Network**
```bash
dfx start --clean --background
cd eth-icp-bridge/icp-canisters/bridge_canister
dfx deploy --network=local
```

#### 3. **Start Frontend**
```bash
cd frontend
npm install
npm run dev
```

## 🔄 Updating Configuration

### Change Network

To switch between networks, modify the `.env` file:

```env
# For local development
NEXT_PUBLIC_ICP_NETWORK=local
NEXT_PUBLIC_USE_MOCK_DATA=false

# For testnet
NEXT_PUBLIC_ICP_NETWORK=testnet
NEXT_PUBLIC_USE_MOCK_DATA=false

# For mainnet
NEXT_PUBLIC_ICP_NETWORK=mainnet
NEXT_PUBLIC_USE_MOCK_DATA=false
```

### Update Canister ID

If the bridge canister ID changes:

```bash
# Update in .env
sed -i 's/NEXT_PUBLIC_BRIDGE_CANISTER_ID=.*/NEXT_PUBLIC_BRIDGE_CANISTER_ID=new_canister_id/' .env

# Update in frontend
sed -i 's/NEXT_PUBLIC_BRIDGE_CANISTER_ID=.*/NEXT_PUBLIC_BRIDGE_CANISTER_ID=new_canister_id/' frontend/.env.local
```

## 📈 Performance Monitoring

### Check Service Status

```bash
# Check if all services are running
./check-status.sh
```

### Monitor Resources

```bash
# Check memory usage
ps aux | grep -E "(dfx|hardhat|next)" | awk '{print $2, $3, $4, $11}'

# Check disk usage
du -sh ./*/
```

## 🎯 Success Indicators

When the script runs successfully, you should see:

✅ **All dependencies are installed**  
✅ **Hardhat local network is running**  
✅ **ICP local network is running**  
✅ **Frontend is starting on http://localhost:3000**  
✅ **Bridge Contract deployed**  
✅ **Bridge Canister deployed**  

## 🚀 Next Steps

After successful setup:

1. **Open the frontend**: http://localhost:3000
2. **Test balance checking**: Enter a Principal ID
3. **Explore transactions**: View real bridge transactions
4. **Monitor networks**: Check network status indicators

## 📞 Support

If you encounter issues:

1. Check the log files for error messages
2. Ensure all prerequisites are installed
3. Try running the manual setup steps
4. Restart the script with `./stop.sh` then `./start.sh`

---

**Happy exploring! 🎉** 