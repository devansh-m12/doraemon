#!/usr/bin/env ts-node

import { tokenUtils, OrderConfig } from '../tests/token-utils';

async function main() {
  console.log('🚀 Starting DFX Order Creation Example...\n');

  // Example 1: Create a custom order
  console.log('📝 Example 1: Creating a custom order...');
  
  const customOrderConfig: OrderConfig = {
    id: 6,
    src_mint: 'b77ix-eeaaa-aaaaa-qaada-cai',
    dst_mint: 'b77ix-eeaaa-aaaaa-qaada-cai',
    maker: 'cjobn-a4566-qzwux-yg5b5-z2vqh-huolu-nhxd6-6xrto-zunsj-zuwdd-qae',
    src_amount: 2000000000, // 2 billion tokens
    min_dst_amount: 1800000000, // 1.8 billion tokens
    estimated_dst_amount: 2000000000, // 2 billion tokens
    expiration_time: 1735689600, // January 1, 2025
    fee: {
      protocol_fee_bps: 35,
      integrator_fee_bps: 25,
      surplus_bps: 15,
      max_cancel_premium: 200000000
    },
    auction: {
      start_time: 1735689600,
      end_time: 1735776000,
      start_price: 2000000000,
      end_price: 1800000000,
      current_price: 2000000000
    },
    cancellation_auction_secs: 7200
  };

  const customResult = await tokenUtils.createOrderWithDfx(customOrderConfig, 'test-maker');
  
  if (customResult.success) {
    console.log(`✅ Custom order ${customResult.orderId} created successfully!`);
  } else {
    console.log(`❌ Custom order creation failed: ${customResult.error}`);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Example 2: Create a test order with default parameters
  console.log('📝 Example 2: Creating a test order with default parameters...');
  
  const testResult = await tokenUtils.createTestOrder(7, 'test-taker');
  
  if (testResult.success) {
    console.log(`✅ Test order ${testResult.orderId} created successfully!`);
  } else {
    console.log(`❌ Test order creation failed: ${testResult.error}`);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Example 3: Transfer tokens
  console.log('📝 Example 3: Transferring tokens...');
  
  const transferResult = await tokenUtils.transferTokens(
    'default',
    'fhrni-ukyxj-tns4p-l7f32-txwvg-anu57-55dcm-gzhue-22yg2-qokvv-mqe', // test-taker
    30000000000 // 30 billion tokens
  );
  
  if (transferResult) {
    console.log('✅ Token transfer successful!');
  } else {
    console.log('❌ Token transfer failed');
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Example 4: Approve tokens
  console.log('📝 Example 4: Approving tokens for contract...');
  
  const approveResult = await tokenUtils.approveTokens(
    'test-taker',
    'br5f7-7uaaa-aaaaa-qaaca-cai', // fusion swap contract
    50000000000 // 50 billion tokens
  );
  
  if (approveResult) {
    console.log('✅ Token approval successful!');
  } else {
    console.log('❌ Token approval failed');
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Example 5: Verify orders
  console.log('📝 Example 5: Verifying orders...');
  
  const order6Exists = await tokenUtils.verifyOrder(6);
  const order7Exists = await tokenUtils.verifyOrder(7);
  
  console.log(`Order 6 exists: ${order6Exists}`);
  console.log(`Order 7 exists: ${order7Exists}`);

  // Get all orders
  const allOrders = await tokenUtils.getAllOrders();
  console.log('\nAll orders:');
  console.log(allOrders);

  console.log('\n🎉 DFX Order Creation Example completed!');
}

// Run the example
main().catch(console.error); 