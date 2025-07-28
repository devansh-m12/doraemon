#!/bin/bash

# ICP Transaction Explorer - Complete Setup Script
# This script sets up the entire environment including Hardhat, ICP local node, and frontend

set -e  # Exit on any error

echo "🚀 Starting ICP Transaction Explorer Setup..."
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    # Check dfx
    if ! command -v dfx &> /dev/null; then
        print_error "dfx is not installed. Please install dfx first."
        print_status "Install dfx: sh -ci \"\$(curl -fsSL https://internetcomputer.org/install.sh)\""
        exit 1
    fi
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        print_error "Please run this script from the project root directory."
        exit 1
    fi
    
    print_success "All dependencies are installed."
}

# Setup environment variables
setup_environment() {
    print_status "Setting up environment variables..."
    
    # Check if .env exists
    if [ ! -f ".env" ]; then
        print_error ".env file not found!"
        print_status "Creating .env file from template..."
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_success "Created .env file from template."
            print_warning "Please edit .env with your configuration before continuing."
            exit 1
        else
            print_error ".env.example not found. Please create .env manually."
            exit 1
        fi
    fi
    
    # Copy .env to frontend directory
    print_status "Copying .env to frontend directory..."
    cp .env frontend/.env.local
    print_success "Environment variables copied to frontend."
}

# Start Hardhat local network
start_hardhat() {
    print_status "Starting Hardhat local network..."
    
    cd eth-icp-bridge/ethereum-contracts
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_status "Installing Hardhat dependencies..."
        if ! npm install; then
            print_error "Failed to install Hardhat dependencies"
            cd ../..
            return 1
        fi
    fi
    
    # Start Hardhat node in background
    print_status "Starting Hardhat node..."
    npx hardhat node > ../../hardhat.log 2>&1 &
    HARDHAT_PID=$!
    echo $HARDHAT_PID > ../../hardhat.pid
    
    # Wait for Hardhat to start
    sleep 5
    
    # Deploy contracts to localhost only
    print_status "Deploying contracts to local network..."
    if npx hardhat run scripts/deploy-local.js --network localhost; then
        cd ../..
        print_success "Hardhat local network is running."
        return 0
    else
        print_error "Failed to deploy contracts"
        cd ../..
        return 1
    fi
}

# Start ICP local network
start_icp_local() {
    print_status "Starting ICP local network..."
    
    # Check if dfx is already running
    if dfx ping 2>/dev/null | grep -q "ic0.app"; then
        print_warning "ICP network is already running."
    else
        # Start local network
        print_status "Starting dfx local network..."
        dfx start --clean --background > dfx.log 2>&1 &
        DFX_PID=$!
        echo $DFX_PID > dfx.pid
        
        # Wait for network to start
        print_status "Waiting for ICP network to start..."
        sleep 15
        
        # Verify network is running
        if ! dfx ping 2>/dev/null | grep -q "healthy"; then
            print_error "ICP network failed to start properly"
            return 1
        fi
        print_success "ICP network is running"
    fi
    
    # Deploy bridge canister
    cd eth-icp-bridge/icp-canisters/bridge_canister
    
    print_status "Deploying bridge canister..."
    if dfx deploy --network=local > ../../../bridge-deploy.log 2>&1; then
        print_success "Bridge canister deployed successfully"
    else
        print_error "Failed to deploy bridge canister"
        print_status "Check bridge-deploy.log for details"
        return 1
    fi
    
    cd ../../..
    print_success "ICP local network is running."
}

# Install frontend dependencies and start
start_frontend() {
    print_status "Setting up frontend..."
    
    cd frontend
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_status "Installing frontend dependencies..."
        if ! npm install; then
            print_error "Failed to install frontend dependencies"
            cd ..
            return 1
        fi
    fi
    
    # Kill any existing frontend processes
    print_status "Cleaning up existing frontend processes..."
    pkill -f "npm run dev" 2>/dev/null || true
    pkill -f "next-server" 2>/dev/null || true
    
    # Start frontend development server
    print_status "Starting frontend development server..."
    npm run dev > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../frontend.pid
    
    # Wait for frontend to start and get the actual port
    print_status "Waiting for frontend to start..."
    sleep 8
    
    # Check which port the frontend is actually running on
    FRONTEND_PORT=$(lsof -i -P | grep "node.*LISTEN" | grep -E ":(300[0-9])" | head -1 | awk '{print $9}' | cut -d: -f2)
    if [ -z "$FRONTEND_PORT" ]; then
        FRONTEND_PORT="3000"
    fi
    
    cd ..
    print_success "Frontend is starting on http://localhost:$FRONTEND_PORT"
    return 0
}

# Create stop script
create_stop_script() {
    print_status "Creating stop script..."
    
    cat > stop.sh << 'EOF'
#!/bin/bash

echo "🛑 Stopping ICP Transaction Explorer..."

# Stop frontend
if [ -f "frontend.pid" ]; then
    FRONTEND_PID=$(cat frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "Stopping frontend..."
        kill $FRONTEND_PID
        rm frontend.pid
    fi
fi

# Stop Hardhat
if [ -f "hardhat.pid" ]; then
    HARDHAT_PID=$(cat hardhat.pid)
    if kill -0 $HARDHAT_PID 2>/dev/null; then
        echo "Stopping Hardhat..."
        kill $HARDHAT_PID
        rm hardhat.pid
    fi
fi

# Stop dfx
if [ -f "dfx.pid" ]; then
    DFX_PID=$(cat dfx.pid)
    if kill -0 $DFX_PID 2>/dev/null; then
        echo "Stopping ICP local network..."
        kill $DFX_PID
        rm dfx.pid
    fi
fi

# Stop dfx processes
pkill -f "dfx start" 2>/dev/null || true

echo "✅ All services stopped."
EOF

    chmod +x stop.sh
    print_success "Created stop.sh script"
}

# Main execution
main() {
    echo "🚀 ICP Transaction Explorer - Complete Setup"
    echo "=============================================="
    
    # Check dependencies
    check_dependencies
    
    # Setup environment
    setup_environment
    
    # Start services with error handling
    if start_hardhat; then
        print_success "Hardhat started successfully"
    else
        print_error "Failed to start Hardhat"
    fi
    
    if start_icp_local; then
        print_success "ICP network started successfully"
    else
        print_error "Failed to start ICP network"
    fi
    
    if start_frontend; then
        print_success "Frontend started successfully"
    else
        print_error "Failed to start frontend"
    fi
    
    # Create stop script
    create_stop_script
    
    echo ""
    echo "🎉 Setup Complete!"
    echo "=================="
    echo "✅ Hardhat local network: http://localhost:8545"
    echo "✅ ICP local network: http://localhost:4943"
    echo "✅ Frontend: http://localhost:$FRONTEND_PORT"
    echo ""
    echo "📝 To stop all services, run: ./stop.sh"
    echo "📝 To view logs:"
    echo "   - Hardhat: tail -f hardhat.log"
    echo "   - ICP: tail -f dfx.log"
    echo "   - Bridge: tail -f bridge-deploy.log"
    echo ""
    echo "🌐 Open http://localhost:$FRONTEND_PORT to access the explorer"
}

# Run main function
main "$@" 