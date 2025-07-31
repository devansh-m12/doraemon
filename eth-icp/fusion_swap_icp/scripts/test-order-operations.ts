#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const FUSION_SWAP_CANISTER = process.env.FUSION_SWAP_CANISTER_ID || "bkyz2-fmaaa-aaaaa-qaaaq-cai";
const ICRC1_CANISTER = process.env.ICRC1_CANISTER_ID || "br5f7-7uaaa-aaaaa-qaaca-cai";
const MAKER_PRINCIPAL = process.env.TEST_MAKER_PRINCIPAL || "cjobn-a4566-qzwux-yg5b5-z2vqh-huolu-nhxd6-6xrto-zunsj-zuwdd-qae";
const TAKER_PRINCIPAL = process.env.TEST_TAKER_PRINCIPAL || "fhrni-ukyxj-tns4p-l7f32-txwvg-anu57-55dcm-gzhue-22yg2-qokvv-mqe";

function runCommand(command: string): string {
  try {
    return execSync(command, { encoding: 'utf8' });
  } catch (error: any) {
    console.error(`Command failed: ${command}`);
    console.error(`Error: ${error.message}`);
    return '';
  }
}

function testOrderOperations() {
  console.log('🚀 Testing Order Operations');
  console.log('==========================');

  // Test 1: Check maker balance
  console.log('\n1. Checking maker balance...');
  const balanceCmd = `dfx canister call ${ICRC1_CANISTER} icrc1_balance_of "(record { owner = principal \"${MAKER_PRINCIPAL}\"; subaccount = null })"`;
  const balanceResult = runCommand(balanceCmd);
  console.log('Balance result:', balanceResult);

  // Test 2: Create order
  console.log('\n2. Creating order...');
  const createOrderCmd = `dfx canister call ${FUSION_SWAP_CANISTER} create_order "(record { 
    id = 9 : nat64; 
    src_mint = principal \"${ICRC1_CANISTER}\"; 
    dst_mint = principal \"${FUSION_SWAP_CANISTER}\"; 
    maker = principal \"${MAKER_PRINCIPAL}\"; 
    src_amount = 1000000000 : nat; 
    min_dst_amount = 900000000 : nat; 
    estimated_dst_amount = 1000000000 : nat; 
    expiration_time = 1735689600 : nat64; 
    fee = record { 
      protocol_fee_bps = 25 : nat16; 
      integrator_fee_bps = 15 : nat16; 
      surplus_bps = 5 : nat8; 
      max_cancel_premium = 100000000 : nat 
    }; 
    auction = record { 
      start_time = 1735689600 : nat64; 
      end_time = 1735776000 : nat64; 
      start_price = 1000000000 : nat; 
      end_price = 900000000 : nat; 
      current_price = 1000000000 : nat 
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
  })"`;
  const createResult = runCommand(createOrderCmd);
  console.log('Create order result:', createResult);

  // Test 3: Get order details
  console.log('\n3. Getting order details...');
  const getOrderCmd = `dfx canister call ${FUSION_SWAP_CANISTER} get_order "(9 : nat64)"`;
  const getOrderResult = runCommand(getOrderCmd);
  console.log('Get order result:', getOrderResult);

  // Test 4: Get all orders
  console.log('\n4. Getting all orders...');
  const getAllOrdersCmd = `dfx canister call ${FUSION_SWAP_CANISTER} get_all_orders`;
  const getAllOrdersResult = runCommand(getAllOrdersCmd);
  console.log('Get all orders result:', getAllOrdersResult);

  // Test 5: Try to fill order
  console.log('\n5. Attempting to fill order...');
  const fillOrderCmd = `dfx canister call ${FUSION_SWAP_CANISTER} fill_order "(9 : nat64, 500000000 : nat, null : opt vec nat8)"`;
  const fillOrderResult = runCommand(fillOrderCmd);
  console.log('Fill order result:', fillOrderResult);

  console.log('\n✅ Order operations test completed!');
}

// Run the test
testOrderOperations(); 