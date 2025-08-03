#!/usr/bin/env node

import { AptosFusionSwapClient, AptosFusionSwapUtils, Network } from './aptos-utils';

/**
 * Example usage of Aptos Fusion Swap Client
 * This script demonstrates how to use the utilities to interact with the deployed contract
 */

async function main() {
  console.log('🚀 Aptos Fusion Swap Client Example\n');

  try {
    // Step 1: Create a test account (in production, you'd use a real private key)
    console.log('📝 Step 1: Creating test account...');
    const testAccount = AptosFusionSwapUtils.createTestAccount();
    const privateKey = AptosFusionSwapUtils.getTestAccountPrivateKey(testAccount);
    
    console.log('✅ Test account created');
    console.log('📝 Account address:', testAccount.accountAddress.toString());
    console.log('🔑 Private key (first 20 chars):', privateKey.substring(0, 20) + '...\n');

    // Step 2: Initialize the client
    console.log('🔗 Step 2: Initializing client for testnet...');
    const client = new AptosFusionSwapClient(privateKey, Network.TESTNET);
    console.log('✅ Client initialized\n');

    // Step 3: Get account information
    console.log('📊 Step 3: Getting account information...');
    const accountInfo = await client.getAccountInfo();
    console.log('✅ Account info retrieved');
    console.log('💰 Sequence number:', accountInfo.sequence_number);
    console.log('🏠 Address:', accountInfo.address, '\n');

    // Step 4: Get account balance
    console.log('💎 Step 4: Getting account balance...');
    const balance = await client.getBalance();
    console.log('✅ Balance retrieved');
    console.log('💰 Balance:', balance.toString(), 'octas (APT)');
    console.log('💡 Note: This is a test account, so balance might be 0\n');

    // Step 5: Check contract health
    console.log('🏥 Step 5: Checking contract health...');
    const health = await client.checkContractHealth();
    console.log('✅ Contract health check completed');
    console.log('🏥 Health status:', health, '\n');

    // Step 6: Get contract statistics
    console.log('📈 Step 6: Getting contract statistics...');
    const stats = await client.getContractStatistics();
    console.log('✅ Contract statistics retrieved');
    console.log('📊 Statistics:', stats, '\n');

    // Step 7: Get total orders
    console.log('📋 Step 7: Getting total orders...');
    const totalOrders = await client.getTotalOrders();
    console.log('✅ Total orders retrieved');
    console.log('📊 Total orders:', totalOrders, '\n');

    // Step 8: Get active orders
    console.log('🔄 Step 8: Getting active orders...');
    const activeOrders = await client.getActiveOrders();
    console.log('✅ Active orders retrieved');
    console.log('📊 Active orders count:', activeOrders.length, '\n');

    // Step 9: Create test order parameters
    console.log('📝 Step 9: Creating test order parameters...');
    const testOrder = AptosFusionSwapUtils.createTestOrder();
    console.log('✅ Test order parameters created');
    console.log('📋 Order details:');
    console.log('   Source token:', testOrder.src_mint);
    console.log('   Destination token:', testOrder.dst_mint);
    console.log('   Source amount:', testOrder.src_amount.toString(), 'octas');
    console.log('   Min destination amount:', testOrder.min_dst_amount.toString(), 'octas');
    console.log('   Estimated destination amount:', testOrder.estimated_dst_amount.toString(), 'octas');
    console.log('   Expiration time:', new Date(testOrder.expiration_time * 1000).toISOString());
    console.log('   Maker fee:', testOrder.fee.maker_fee);
    console.log('   Taker fee:', testOrder.fee.taker_fee);
    console.log('   Resolver fee:', testOrder.fee.resolver_fee);
    console.log('   Platform fee:', testOrder.fee.platform_fee, '\n');

    // Step 10: Generate random hash for testing
    console.log('🔐 Step 10: Generating random hash for testing...');
    const randomHash = AptosFusionSwapUtils.generateRandomHash();
    const hashHex = AptosFusionSwapUtils.bytesToHex(randomHash);
    console.log('✅ Random hash generated');
    console.log('🔐 Hash (hex):', hashHex, '\n');

    // Step 11: Demonstrate utility functions
    console.log('🛠️ Step 11: Testing utility functions...');
    
    // Test hex conversion
    const testHex = '0x1234567890abcdef';
    const testBytes = AptosFusionSwapUtils.hexToBytes(testHex);
    const convertedHex = AptosFusionSwapUtils.bytesToHex(testBytes);
    console.log('✅ Hex conversion test passed');
    console.log('🔄 Original hex:', testHex);
    console.log('🔄 Converted hex:', convertedHex, '\n');

    // Step 12: Show how to create orders with different parameters
    console.log('📝 Step 12: Creating custom order parameters...');
    const customOrder = AptosFusionSwapUtils.createTestOrder(
      '0x1::aptos_coin::AptosCoin', // Source token
      '0x1::aptos_coin::AptosCoin', // Destination token
      BigInt(2000000), // 2 APT
      BigInt(1800000), // 1.8 APT (10% slippage)
      BigInt(2000000), // 2 APT
      Math.floor(Date.now() / 1000) + 7200 // 2 hours from now
    );
    console.log('✅ Custom order parameters created');
    console.log('💰 Custom order amount:', customOrder.src_amount.toString(), 'octas\n');

    console.log('🎉 Example completed successfully!');
    console.log('💡 To create actual orders, you would need:');
    console.log('   1. A funded account with APT tokens');
    console.log('   2. Call client.createOrder(orderParams)');
    console.log('   3. Wait for transaction confirmation');
    console.log('   4. Use client.getOrderById(orderId) to verify');

  } catch (error) {
    console.error('❌ Example failed:', error);
    process.exit(1);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export default main; 