#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupEnvironment() {
  console.log('🔧 Bridge Service Environment Setup');
  console.log('=====================================\n');

  const envPath = path.join(__dirname, '..', '.env');
  const frontendEnvPath = path.join(__dirname, '..', 'frontend', '.env.local');

  // Read existing .env file if it exists
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  console.log('This script will help you configure your environment variables for the bridge service.');
  console.log('You can choose between local development and Sepolia testnet.\n');

  // Ask for network preference
  const network = await question('Which network do you want to use? (local/sepolia): ');
  
  if (network.toLowerCase() !== 'local' && network.toLowerCase() !== 'sepolia') {
    console.log('❌ Invalid network choice. Please choose "local" or "sepolia".');
    rl.close();
    return;
  }

  // Update network configuration
  envContent = updateEnvVariable(envContent, 'NEXT_PUBLIC_NETWORK', network.toLowerCase());

  if (network.toLowerCase() === 'sepolia') {
    console.log('\n📝 Setting up Sepolia testnet configuration...\n');
    
    // Get Sepolia configuration
    const sepoliaRpcUrl = await question('Enter your Sepolia RPC URL (e.g., https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY): ');
    const sepoliaPrivateKey = await question('Enter your Ethereum private key (without 0x prefix): ');
    const sepoliaContractAddress = await question('Enter your deployed bridge contract address: ');
    const sepoliaWalletAddress = await question('Enter your Ethereum wallet address: ');
    const icpCanisterId = await question('Enter your ICP canister ID: ');

    // Update Sepolia variables
    envContent = updateEnvVariable(envContent, 'NEXT_PUBLIC_SEPOLIA_RPC_URL', sepoliaRpcUrl);
    envContent = updateEnvVariable(envContent, 'NEXT_PUBLIC_SEPOLIA_PRIVATE_KEY', `0x${sepoliaPrivateKey}`);
    envContent = updateEnvVariable(envContent, 'NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS', sepoliaContractAddress);
    envContent = updateEnvVariable(envContent, 'NEXT_PUBLIC_SEPOLIA_WALLET_ADDRESS', sepoliaWalletAddress);
    envContent = updateEnvVariable(envContent, 'NEXT_PUBLIC_ICP_CANISTER_ID', icpCanisterId);

    console.log('\n✅ Sepolia configuration updated!');
  } else {
    console.log('\n✅ Local network configuration is already set up in the .env file.');
  }

  // Write updated .env file
  fs.writeFileSync(envPath, envContent);
  console.log('\n📁 Updated .env file');

  // Copy to frontend
  fs.copyFileSync(envPath, frontendEnvPath);
  console.log('📁 Copied to frontend/.env.local');

  console.log('\n🎉 Environment setup complete!');
  console.log('You can now run ./start.sh to start the bridge service.');
  
  rl.close();
}

function updateEnvVariable(content, key, value) {
  const regex = new RegExp(`^${key}=.*`, 'm');
  const newLine = `${key}=${value}`;
  
  if (regex.test(content)) {
    return content.replace(regex, newLine);
  } else {
    return content + '\n' + newLine;
  }
}

setupEnvironment().catch(console.error); 