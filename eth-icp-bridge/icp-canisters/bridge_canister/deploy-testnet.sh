#!/bin/bash

echo "🚀 Deploying ICP Bridge Canister to Testnet..."

# Check if dfx is available
if ! command -v dfx &> /dev/null; then
    echo "❌ dfx not found. Please install the Internet Computer SDK first."
    echo "Run: sh -ci \"\$(curl -fsSL https://internetcomputer.org/install.sh)\""
    exit 1
fi

# Check if authenticated
echo "🔐 Checking authentication..."
dfx identity whoami
dfx identity get-principal

# Build the canister
echo "🔨 Building canister..."
dfx build

# Deploy to testnet
echo "📦 Deploying to ICP testnet..."
dfx deploy --network ic_testnet

# Get canister ID
CANISTER_ID=$(dfx canister --network ic_testnet id bridge_canister_backend)
echo "✅ Bridge canister deployed with ID: $CANISTER_ID"

# Test the canister
echo "🧪 Testing canister..."
dfx canister --network ic_testnet call bridge_canister_backend greet '("World")'

# Show canister status
echo "📊 Canister status:"
dfx canister --network ic_testnet status bridge_canister_backend

echo "🎉 Deployment complete!"
echo "Canister ID: $CANISTER_ID"
echo "Testnet URL: https://ic0.app"
echo ""
echo "📝 Update your .env file with:"
echo "ICP_CANISTER_ID=$CANISTER_ID" 