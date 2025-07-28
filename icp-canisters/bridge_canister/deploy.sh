#!/bin/bash

echo "🚀 Deploying ICP Bridge Canister..."

# Check if dfx is available
if ! command -v dfx &> /dev/null; then
    echo "❌ dfx not found. Please install the Internet Computer SDK first."
    echo "Run: sh -ci \"\$(curl -fsSL https://internetcomputer.org/install.sh)\""
    exit 1
fi

# Start local replica if not running
echo "🔧 Starting local replica..."
dfx start --background --clean

# Wait for replica to be ready
echo "⏳ Waiting for replica to be ready..."
sleep 10

# Deploy the canister
echo "📦 Deploying bridge canister..."
dfx deploy

# Get canister ID
CANISTER_ID=$(dfx canister id bridge_canister_backend)
echo "✅ Bridge canister deployed with ID: $CANISTER_ID"

# Test the canister
echo "🧪 Testing canister..."
dfx canister call bridge_canister_backend greet '("World")'

# Show canister status
echo "📊 Canister status:"
dfx canister status bridge_canister_backend

echo "🎉 Deployment complete!"
echo "Canister ID: $CANISTER_ID"
echo "Local replica URL: http://localhost:4943" 