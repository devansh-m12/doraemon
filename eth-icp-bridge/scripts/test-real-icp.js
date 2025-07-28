#!/usr/bin/env node

const ICPCanisterClient = require('./icp-canister-client');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

/**
 * Simple test to verify real ICP canister integration
 */
async function testRealICP() {
    console.log('🧪 Testing Real ICP Canister Integration');
    console.log('=' .repeat(50));
    
    try {
        // Get canister ID from environment
        const canisterId = process.env.ICP_CANISTER_ID || 'uxrrr-q7777-77774-qaaaq-cai';
        console.log('📋 ICP Canister ID:', canisterId);
        
        // Initialize ICP client
        console.log('🔧 Initializing ICP client...');
        const icpClient = new ICPCanisterClient(canisterId, 'local');
        
        // Test 1: Connectivity
        console.log('\n📞 Test 1: Testing Connectivity');
        console.log('-' .repeat(30));
        const connectivityTest = await icpClient.testConnectivity();
        console.log('Connectivity Result:', connectivityTest);
        
        if (!connectivityTest.success) {
            console.log('❌ Connectivity test failed, stopping');
            return;
        }
        
        // Test 2: Get Bridge Config
        console.log('\n📞 Test 2: Getting Bridge Configuration');
        console.log('-' .repeat(30));
        const bridgeConfig = await icpClient.getBridgeConfig();
        console.log('Bridge Config:', bridgeConfig);
        
        // Test 3: Check Hashlock Usage
        console.log('\n📞 Test 3: Checking Hashlock Usage');
        console.log('-' .repeat(30));
        const testHashlock = new Uint8Array(32);
        for (let i = 0; i < 32; i++) {
            testHashlock[i] = i;
        }
        const hashlockUsage = await icpClient.isHashlockUsed(testHashlock);
        console.log('Hashlock Usage Check:', hashlockUsage);
        
        // Test 4: Get Canister Status
        console.log('\n📞 Test 4: Getting Canister Status');
        console.log('-' .repeat(30));
        const canisterStatus = await icpClient.getCanisterStatus();
        console.log('Canister Status:', canisterStatus);
        
        console.log('\n✅ All real ICP tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Real ICP test failed:', error);
    }
}

// Run the test
testRealICP().catch(console.error); 