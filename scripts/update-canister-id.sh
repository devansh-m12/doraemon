#!/bin/bash

# Script to update canister ID when it changes on deployment
# Usage: ./scripts/update-canister-id.sh [canister_id]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Function to update canister ID in all configuration files
update_canister_id() {
    local canister_id=$1
    
    if [ -z "$canister_id" ]; then
        print_error "No canister ID provided"
        echo "Usage: $0 [canister_id]"
        echo "Example: $0 2tvx6-uqaaa-aaaab-qaclq-cai"
        exit 1
    fi
    
    print_status "Updating canister ID to: $canister_id"
    
    # Update root .env file
    if [ -f ".env" ]; then
        sed -i.bak "s/NEXT_PUBLIC_BRIDGE_CANISTER_ID=.*/NEXT_PUBLIC_BRIDGE_CANISTER_ID=$canister_id/" .env
        print_success "Updated root .env file"
    fi
    
    # Update frontend .env.local file
    if [ -f "frontend/.env.local" ]; then
        sed -i.bak "s/NEXT_PUBLIC_BRIDGE_CANISTER_ID=.*/NEXT_PUBLIC_BRIDGE_CANISTER_ID=$canister_id/" frontend/.env.local
        print_success "Updated frontend .env.local file"
    fi
    
    # Create frontend .env.local if it doesn't exist
    if [ ! -f "frontend/.env.local" ]; then
        echo "NEXT_PUBLIC_BRIDGE_CANISTER_ID=$canister_id" > frontend/.env.local
        print_success "Created frontend .env.local file"
    fi
    
    # Update ICP utilities TypeScript file
    update_icp_utilities "$canister_id"
    
    print_success "Canister ID updated successfully in all configuration files"
}

# Function to update ICP utilities with new canister ID
update_icp_utilities() {
    local canister_id=$1
    print_status "Updating ICP utilities with new canister ID: $canister_id"
    
    # Create a temporary script to update the ICP utilities
    cat > update_icp_config_temp.js << EOF
const fs = require('fs');
const path = require('path');

const icpUtilsPath = path.join(__dirname, 'frontend/src/utils/icp.ts');

try {
    let icpUtils = fs.readFileSync(icpUtilsPath, 'utf8');
    
    // Update the local canister ID in the BRIDGE_CANISTER configuration
    icpUtils = icpUtils.replace(
        /local: process\.env\.NEXT_PUBLIC_BRIDGE_CANISTER_ID \|\| '[^']*'/g,
        \`local: process.env.NEXT_PUBLIC_BRIDGE_CANISTER_ID || '\${canister_id}'\`
    );
    
    // Also update the fallback canister ID in the BRIDGE_CANISTER object
    icpUtils = icpUtils.replace(
        /mainnet: '[^']*',\s*testnet: '[^']*',\s*local: process\.env\.NEXT_PUBLIC_BRIDGE_CANISTER_ID \|\| '[^']*'/g,
        \`mainnet: '2tvx6-uqaaa-aaaab-qaclq-cai',
  testnet: '2tvx6-uqaaa-aaaab-qaclq-cai',
  local: process.env.NEXT_PUBLIC_BRIDGE_CANISTER_ID || '\${canister_id}'\`
    );
    
    fs.writeFileSync(icpUtilsPath, icpUtils);
    console.log('Updated ICP utilities with new canister ID:', '${canister_id}');
} catch (error) {
    console.error('Error updating ICP utilities:', error.message);
    process.exit(1);
}
EOF

    # Run the update script
    node update_icp_config_temp.js
    rm update_icp_config_temp.js
    
    print_success "ICP utilities updated with new canister ID"
}

# Function to get current canister ID from dfx
get_current_canister_id() {
    print_status "Getting current canister ID from dfx..."
    
    # Check if we're in the right directory
    if [ ! -d "eth-icp-bridge/icp-canisters/bridge_canister" ]; then
        print_error "Please run this script from the project root directory"
        exit 1
    fi
    
    cd eth-icp-bridge/icp-canisters/bridge_canister
    
    # Get canister ID
    CANISTER_ID=$(dfx canister --network=local id bridge_canister_backend 2>/dev/null)
    
    if [ -z "$CANISTER_ID" ]; then
        print_error "Could not get canister ID from dfx"
        print_warning "Make sure dfx is running and the canister is deployed"
        cd ../../..
        exit 1
    fi
    
    print_success "Current canister ID: $CANISTER_ID"
    cd ../../..
    
    # Update with the current canister ID
    update_canister_id "$CANISTER_ID"
}

# Main execution
main() {
    echo "🔄 Canister ID Update Script"
    echo "============================"
    
    if [ $# -eq 0 ]; then
        # No arguments provided, get current canister ID from dfx
        get_current_canister_id
    else
        # Canister ID provided as argument
        update_canister_id "$1"
    fi
}

# Run main function
main "$@" 