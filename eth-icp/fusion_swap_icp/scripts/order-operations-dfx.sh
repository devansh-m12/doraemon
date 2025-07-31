#!/bin/bash

# Comprehensive Order Operations using DFX CLI
# This script demonstrates various order operations

set -e

# Configuration
FUSION_SWAP_CANISTER="bkyz2-fmaaa-aaaaa-qaaaq-cai"
ICRC1_CANISTER="br5f7-7uaaa-aaaaa-qaaca-cai"
MAKER_PRINCIPAL="cjobn-a4566-qzwux-yg5b5-z2vqh-huolu-nhxd6-6xrto-zunsj-zuwdd-qae"
TAKER_PRINCIPAL="fhrni-ukyxj-tns4p-l7f32-txwvg-anu57-55dcm-gzhue-22yg2-qokvv-mqe"
ORDER_ID=8

echo "🚀 Comprehensive Order Operations using DFX CLI"
echo "================================================"

# Function to create an order
create_order() {
    local order_id=$1
    echo "📝 Creating order with ID: $order_id"
    
    dfx canister call $FUSION_SWAP_CANISTER create_order "(record { 
        id = $order_id : nat64; 
        src_mint = principal \"$ICRC1_CANISTER\"; 
        dst_mint = principal \"$FUSION_SWAP_CANISTER\"; 
        maker = principal \"$MAKER_PRINCIPAL\"; 
        src_amount = 2000000000 : nat; 
        min_dst_amount = 1800000000 : nat; 
        estimated_dst_amount = 2000000000 : nat; 
        expiration_time = 1735689600 : nat64; 
        fee = record { 
            protocol_fee_bps = 25 : nat16; 
            integrator_fee_bps = 15 : nat16; 
            surplus_bps = 5 : nat8; 
            max_cancel_premium = 200000000 : nat 
        }; 
        auction = record { 
            start_time = 1735689600 : nat64; 
            end_time = 1735776000 : nat64; 
            start_price = 2000000000 : nat; 
            end_price = 1800000000 : nat; 
            current_price = 2000000000 : nat 
        }; 
        cancellation_auction_secs = 7200 : nat32; 
        hashlock = record { 
            secret_hash = vec { 1; 2; 3; 4; 5; 6; 7; 8; 9; 10; 11; 12; 13; 14; 15; 16; 17; 18; 19; 20; 21; 22; 23; 24; 25; 26; 27; 28; 29; 30; 31; 32 } : vec nat8; 
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
}

# Function to fill an order
fill_order() {
    local order_id=$1
    local amount=$2
    echo "🔄 Filling order $order_id with amount $amount"
    
    dfx canister call $FUSION_SWAP_CANISTER fill_order "($order_id : nat64, $amount : nat, null : opt vec nat8)"
}

# Function to cancel an order
cancel_order() {
    local order_id=$1
    echo "❌ Cancelling order $order_id"
    
    dfx canister call $FUSION_SWAP_CANISTER cancel_order "($order_id : nat64)"
}

# Function to get order details
get_order() {
    local order_id=$1
    echo "🔍 Getting order $order_id details"
    
    dfx canister call $FUSION_SWAP_CANISTER get_order "($order_id : nat64)"
}

# Function to get all orders
get_all_orders() {
    echo "📋 Getting all orders"
    
    dfx canister call $FUSION_SWAP_CANISTER get_all_orders
}

# Function to get orders by maker
get_orders_by_maker() {
    local maker=$1
    echo "👤 Getting orders by maker: $maker"
    
    dfx canister call $FUSION_SWAP_CANISTER get_orders_by_maker "(principal \"$maker\")"
}

# Switch to test-maker identity
echo "📋 Switching to test-maker identity..."
dfx identity use test-maker

# Check balance
echo "💰 Checking balance..."
dfx canister call $ICRC1_CANISTER icrc1_balance_of "(record { owner = principal \"$MAKER_PRINCIPAL\"; subaccount = null })"

# Approve tokens for the contract
echo "✅ Approving tokens for contract..."
dfx canister call $ICRC1_CANISTER icrc2_approve "(record { from_subaccount = null; spender = record { owner = principal \"$FUSION_SWAP_CANISTER\"; subaccount = null }; amount = 20000000000 : nat; expires_at = null })"

# Create order
create_order $ORDER_ID

# Get the created order
get_order $ORDER_ID

# Get all orders
get_all_orders

# Get orders by maker
get_orders_by_maker $MAKER_PRINCIPAL

echo "🎉 Order operations completed!"
echo "=============================="

# Optional: Switch to test-taker and try to fill the order
echo ""
echo "🔄 Switching to test-taker to fill order..."
dfx identity use test-taker

# Check taker balance
echo "💰 Checking taker balance..."
dfx canister call $ICRC1_CANISTER icrc1_balance_of "(record { owner = principal \"$TAKER_PRINCIPAL\"; subaccount = null })"

# Approve tokens for taker
echo "✅ Approving tokens for taker..."
dfx canister call $ICRC1_CANISTER icrc2_approve "(record { from_subaccount = null; spender = record { owner = principal \"$FUSION_SWAP_CANISTER\"; subaccount = null }; amount = 20000000000 : nat; expires_at = null })"

# Try to fill the order (this might fail if taker doesn't have enough balance)
echo "🔄 Attempting to fill order..."
fill_order $ORDER_ID 1000000000

echo "🎉 All operations completed!"
echo "============================" 