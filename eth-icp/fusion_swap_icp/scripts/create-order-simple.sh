#!/bin/bash

# Simple Order Creation using DFX CLI
# This script creates a basic order with proper validation

set -e

# Configuration
FUSION_SWAP_CANISTER="bkyz2-fmaaa-aaaaa-qaaaq-cai"
ICRC1_CANISTER="bd3sg-teaaa-aaaaa-qaaba-cai"
MAKER_PRINCIPAL="cjobn-a4566-qzwux-yg5b5-z2vqh-huolu-nhxd6-6xrto-zunsj-zuwdd-qae"
ORDER_ID=7

echo "🚀 Creating Simple Order using DFX CLI"
echo "======================================"

# Switch to test-maker identity
echo "📋 Switching to test-maker identity..."
dfx identity use test-maker

# Check balance
echo "💰 Checking balance..."
dfx canister call $ICRC1_CANISTER icrc1_balance_of "(record { owner = principal \"$MAKER_PRINCIPAL\"; subaccount = null })"

# Approve tokens for the contract (larger amount)
echo "✅ Approving tokens for contract..."
dfx canister call $ICRC1_CANISTER icrc2_approve "(record { from_subaccount = null; spender = record { owner = principal \"$FUSION_SWAP_CANISTER\"; subaccount = null }; amount = 10000000000 : nat; expires_at = null })"

# Create a simpler order with different src and dst mints
echo "📝 Creating order with ID: $ORDER_ID"

# Create the order using dfx with different src and dst mints
dfx canister call $FUSION_SWAP_CANISTER create_order "(record { 
    id = $ORDER_ID : nat64; 
    src_mint = principal \"$ICRC1_CANISTER\"; 
    dst_mint = principal \"$FUSION_SWAP_CANISTER\"; 
    maker = principal \"$MAKER_PRINCIPAL\"; 
    src_amount = 1000000000 : nat; 
    min_dst_amount = 900000000 : nat; 
    estimated_dst_amount = 1000000000 : nat; 
    expiration_time = 1735689600 : nat64; 
    fee = record { 
        protocol_fee_bps = 30 : nat16; 
        integrator_fee_bps = 20 : nat16; 
        surplus_bps = 10 : nat8; 
        max_cancel_premium = 100000000 : nat 
    }; 
    auction = record { 
        start_time = 1735689600 : nat64; 
        end_time = 1735776000 : nat64; 
        start_price = 1000000000 : nat; 
        end_price = 900000000 : nat; 
        current_price = 1000000000 : nat 
    }; 
    cancellation_auction_secs = 3600 : nat32; 
    hashlock = record { 
        secret_hash = vec { 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0; 0 } : vec nat8; 
        revealed = false; 
        reveal_time = null : opt nat64 
    }; 
    timelock = record { 
        finality_lock_duration = 0 : nat64; 
        exclusive_withdraw_duration = 0 : nat64; 
        cancellation_timeout = 0 : nat64; 
        created_at = 0 : nat64 
    }; 
    status = variant { Announced }; 
    created_at = 0 : nat64 
})"

echo "✅ Order creation command executed!"

# Verify the order was created
echo "🔍 Verifying order creation..."
dfx canister call $FUSION_SWAP_CANISTER get_order "($ORDER_ID : nat64)"

echo "🎉 Order creation process completed!"
echo "======================================" 