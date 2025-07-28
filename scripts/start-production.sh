#!/bin/bash

# Production startup script for Doraemon Bridge
# This script starts all components needed for production

set -e

echo "🚀 Starting Doraemon Bridge Production Environment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please copy env.example to .env and configure it."
    exit 1
fi

# Load environment variables
source .env

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️ Port $port is already in use"
        return 1
    else
        echo "✅ Port $port is available"
        return 0
    fi
}

# Function to start Hardhat node
start_hardhat() {
    echo "🔧 Starting Hardhat local node..."
    if check_port 8545; then
        npx hardhat node --hostname 0.0.0.0 &
        HARDHAT_PID=$!
        echo "✅ Hardhat node started (PID: $HARDHAT_PID)"
        sleep 5
    else
        echo "⚠️ Using existing Hardhat node"
    fi
}

# Function to start ICP local replica
start_icp() {
    echo "🔧 Starting ICP local replica..."
    if check_port 4943; then
        dfx start --clean --background
        echo "✅ ICP local replica started"
        sleep 10
    else
        echo "⚠️ Using existing ICP replica"
    fi
}

# Function to deploy contracts
deploy_contracts() {
    echo "📦 Deploying contracts..."
    
    # Deploy to local Hardhat network
    npx hardhat run scripts/deploy-production.js --network localhost
    
    # Get contract addresses from deployment file
    if [ -f "deployments/deployment-localhost.json" ]; then
        BRIDGE_ADDRESS=$(node -e "console.log(require('./deployments/deployment-localhost.json').contracts.bridge)")
        RESOLVER_ADDRESS=$(node -e "console.log(require('./deployments/deployment-localhost.json').contracts.resolver)")
        
        echo "✅ Contracts deployed:"
        echo "   Bridge: $BRIDGE_ADDRESS"
        echo "   Resolver: $RESOLVER_ADDRESS"
        
        # Update .env with contract addresses
        sed -i.bak "s/BRIDGE_CONTRACT_ADDRESS=/BRIDGE_CONTRACT_ADDRESS=$BRIDGE_ADDRESS/" .env
        sed -i.bak "s/RESOLVER_CONTRACT_ADDRESS=/RESOLVER_CONTRACT_ADDRESS=$RESOLVER_ADDRESS/" .env
        echo "✅ Updated .env with contract addresses"
    fi
}

# Function to deploy ICP canister
deploy_icp_canister() {
    echo "📦 Deploying ICP canister..."
    cd eth-icp-bridge/icp-canisters/bridge_canister
    
    # Start dfx if not running
    if ! dfx ping 2>/dev/null; then
        dfx start --clean --background
        sleep 10
    fi
    
    # Deploy canister
    dfx deploy --network local
    
    # Get canister ID
    CANISTER_ID=$(dfx canister id bridge_canister_backend --network local)
    echo "✅ ICP canister deployed: $CANISTER_ID"
    
    # Update .env with canister ID
    cd ../../..
    sed -i.bak "s/CANISTER_ID=/CANISTER_ID=$CANISTER_ID/" .env
    echo "✅ Updated .env with canister ID"
}

# Function to start API server
start_api() {
    echo "🔧 Starting API server..."
    if check_port 3000; then
        npm run build
        npm run start:local &
        API_PID=$!
        echo "✅ API server started (PID: $API_PID)"
        sleep 3
    else
        echo "⚠️ API server already running on port 3000"
    fi
}

# Function to run tests
run_tests() {
    echo "🧪 Running tests..."
    
    # Run TypeScript tests
    echo "📋 Running TypeScript tests..."
    npm test
    
    # Run Hardhat tests
    echo "📋 Running Hardhat tests..."
    npx hardhat test
    
    echo "✅ All tests passed!"
}

# Function to show status
show_status() {
    echo ""
    echo "📊 Production Environment Status:"
    echo "=================================="
    
    # Check Hardhat
    if curl -s http://localhost:8545 >/dev/null 2>&1; then
        echo "✅ Hardhat node: Running on http://localhost:8545"
    else
        echo "❌ Hardhat node: Not running"
    fi
    
    # Check ICP
    if dfx ping 2>/dev/null; then
        echo "✅ ICP replica: Running"
    else
        echo "❌ ICP replica: Not running"
    fi
    
    # Check API server
    if curl -s http://localhost:3000/health >/dev/null 2>&1; then
        echo "✅ API server: Running on http://localhost:3000"
    else
        echo "❌ API server: Not running"
    fi
    
    # Show contract addresses
    if [ -f "deployments/deployment-localhost.json" ]; then
        echo ""
        echo "📋 Contract Addresses:"
        echo "   Bridge: $(node -e "console.log(require('./deployments/deployment-localhost.json').contracts.bridge)")"
        echo "   Resolver: $(node -e "console.log(require('./deployments/deployment-localhost.json').contracts.resolver)")"
    fi
    
    echo ""
    echo "🌐 Access Points:"
    echo "   Hardhat Node: http://localhost:8545"
    echo "   ICP Dashboard: http://localhost:4943"
    echo "   API Server: http://localhost:3000"
    echo "   Frontend: http://localhost:3001 (if running)"
}

# Main execution
main() {
    echo "🔧 Setting up production environment..."
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing dependencies..."
        npm install
    fi
    
    # Start infrastructure
    start_hardhat
    start_icp
    
    # Deploy contracts
    deploy_contracts
    deploy_icp_canister
    
    # Run tests
    run_tests
    
    # Start API server
    start_api
    
    # Show status
    show_status
    
    echo ""
    echo "🎉 Production environment is ready!"
    echo "📋 Next steps:"
    echo "   1. Configure your .env file with real API keys"
    echo "   2. Test the bridge functionality"
    echo "   3. Deploy to testnet/mainnet when ready"
    echo ""
    echo "💡 Use 'npm run status' to check system status"
    echo "💡 Use 'npm run stop' to stop all services"
}

# Handle script arguments
case "${1:-}" in
    "status")
        show_status
        ;;
    "stop")
        echo "🛑 Stopping all services..."
        pkill -f "hardhat node" || true
        pkill -f "dfx" || true
        pkill -f "node.*server" || true
        echo "✅ All services stopped"
        ;;
    "test")
        run_tests
        ;;
    "deploy")
        deploy_contracts
        deploy_icp_canister
        ;;
    *)
        main
        ;;
esac 