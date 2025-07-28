#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function testBridgeConfiguration() {
  console.log('🔍 Testing Bridge Service Configuration');
  console.log('=====================================\n');

  const envPath = path.join(__dirname, '..', '.env');
  const frontendEnvPath = path.join(__dirname, '..', 'frontend', '.env.local');

  // Check if .env files exist
  if (!fs.existsSync(envPath)) {
    console.log('❌ Root .env file not found');
    return false;
  }

  if (!fs.existsSync(frontendEnvPath)) {
    console.log('❌ Frontend .env.local file not found');
    return false;
  }

  console.log('✅ Environment files found');

  // Read environment files
  const rootEnv = fs.readFileSync(envPath, 'utf8');
  const frontendEnv = fs.readFileSync(frontendEnvPath, 'utf8');

  // Required variables for bridge service
  const requiredVars = [
    'NEXT_PUBLIC_NETWORK',
    'NEXT_PUBLIC_LOCAL_RPC_URL',
    'NEXT_PUBLIC_LOCAL_PRIVATE_KEY',
    'NEXT_PUBLIC_LOCAL_CONTRACT_ADDRESS',
    'NEXT_PUBLIC_LOCAL_WALLET_ADDRESS',
    'NEXT_PUBLIC_SEPOLIA_RPC_URL',
    'NEXT_PUBLIC_SEPOLIA_PRIVATE_KEY',
    'NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS',
    'NEXT_PUBLIC_SEPOLIA_WALLET_ADDRESS',
    'NEXT_PUBLIC_BRIDGE_CANISTER_ID'
  ];

  console.log('\n📋 Checking required environment variables:');
  console.log('==========================================');

  let allGood = true;

  for (const varName of requiredVars) {
    const rootHasVar = rootEnv.includes(`${varName}=`);
    const frontendHasVar = frontendEnv.includes(`${varName}=`);

    if (rootHasVar && frontendHasVar) {
      console.log(`✅ ${varName}`);
    } else {
      console.log(`❌ ${varName} - Missing in ${!rootHasVar ? 'root' : ''}${!rootHasVar && !frontendHasVar ? ' and ' : ''}${!frontendHasVar ? 'frontend' : ''}`);
      allGood = false;
    }
  }

  // Check network configuration
  const networkMatch = rootEnv.match(/NEXT_PUBLIC_NETWORK=(\w+)/);
  if (networkMatch) {
    const network = networkMatch[1];
    console.log(`\n🌐 Network Configuration: ${network}`);
    
    if (network === 'local') {
      console.log('✅ Using local network configuration');
    } else if (network === 'sepolia') {
      console.log('✅ Using Sepolia testnet configuration');
    } else {
      console.log('❌ Invalid network configuration');
      allGood = false;
    }
  }

  // Check if private keys are properly configured
  const localPrivateKey = rootEnv.match(/NEXT_PUBLIC_LOCAL_PRIVATE_KEY=([^\s]+)/);
  const sepoliaPrivateKey = rootEnv.match(/NEXT_PUBLIC_SEPOLIA_PRIVATE_KEY=([^\s]+)/);

  console.log('\n🔐 Private Key Configuration:');
  if (localPrivateKey && localPrivateKey[1] !== 'your_local_private_key_here') {
    console.log('✅ Local private key configured');
  } else {
    console.log('⚠️  Local private key not configured (using default)');
  }

  if (sepoliaPrivateKey && sepoliaPrivateKey[1] !== 'your_ethereum_private_key_here') {
    console.log('✅ Sepolia private key configured');
  } else {
    console.log('⚠️  Sepolia private key not configured (using placeholder)');
  }

  // Check contract addresses
  const localContract = rootEnv.match(/NEXT_PUBLIC_LOCAL_CONTRACT_ADDRESS=([^\s]+)/);
  const sepoliaContract = rootEnv.match(/NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS=([^\s]+)/);

  console.log('\n📄 Contract Addresses:');
  if (localContract && localContract[1] !== 'your_local_contract_address_here') {
    console.log(`✅ Local contract: ${localContract[1]}`);
  } else {
    console.log('⚠️  Local contract address not configured');
  }

  if (sepoliaContract && sepoliaContract[1] !== 'your_deployed_contract_address_here') {
    console.log(`✅ Sepolia contract: ${sepoliaContract[1]}`);
  } else {
    console.log('⚠️  Sepolia contract address not configured');
  }

  // Check canister ID
  const canisterId = rootEnv.match(/NEXT_PUBLIC_BRIDGE_CANISTER_ID=([^\s]+)/);
  console.log('\n🏗️  ICP Canister:');
  if (canisterId && canisterId[1] !== 'your_icp_canister_id_here') {
    console.log(`✅ Canister ID: ${canisterId[1]}`);
  } else {
    console.log('⚠️  Canister ID not configured');
  }

  console.log('\n' + '='.repeat(50));
  
  if (allGood) {
    console.log('🎉 Bridge service configuration is ready!');
    console.log('You can now use the swap functionality.');
  } else {
    console.log('❌ Some configuration issues found.');
    console.log('Please run ./start.sh to fix the configuration.');
  }

  return allGood;
}

// Run the test
testBridgeConfiguration(); 