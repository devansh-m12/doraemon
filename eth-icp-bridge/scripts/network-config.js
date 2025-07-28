const fs = require('fs');
const path = require('path');

/**
 * Network Configuration Helper
 * Manages environment variables for different networks (local and Sepolia)
 */

class NetworkConfig {
  constructor() {
    this.envPath = path.join(__dirname, '..', '.env');
    this.envExamplePath = path.join(__dirname, '..', 'env.example');
  }

  /**
   * Get current network from environment
   */
  getCurrentNetwork() {
    if (fs.existsSync(this.envPath)) {
      const envContent = fs.readFileSync(this.envPath, 'utf8');
      const networkMatch = envContent.match(/NETWORK=(\w+)/);
      return networkMatch ? networkMatch[1] : 'sepolia';
    }
    return 'sepolia'; // default
  }

  /**
   * Get environment variables for a specific network
   */
  getNetworkConfig(network = 'sepolia') {
    const configs = {
      local: {
        RPC_URL: 'LOCAL_RPC_URL',
        PRIVATE_KEY: 'LOCAL_PRIVATE_KEY',
        CONTRACT_ADDRESS: 'LOCAL_CONTRACT_ADDRESS',
        WALLET_ADDRESS: 'LOCAL_WALLET_ADDRESS',
        CHAIN_ID: 1337,
        NETWORK_NAME: 'Local Hardhat Network'
      },
      sepolia: {
        RPC_URL: 'SEPOLIA_RPC_URL',
        PRIVATE_KEY: 'SEPOLIA_PRIVATE_KEY',
        CONTRACT_ADDRESS: 'SEPOLIA_CONTRACT_ADDRESS',
        WALLET_ADDRESS: 'SEPOLIA_WALLET_ADDRESS',
        CHAIN_ID: 11155111,
        NETWORK_NAME: 'Sepolia Testnet'
      }
    };

    return configs[network] || configs.sepolia;
  }

  /**
   * Switch to a different network
   */
  switchNetwork(targetNetwork) {
    const validNetworks = ['local', 'sepolia'];
    
    if (!validNetworks.includes(targetNetwork)) {
      throw new Error(`Invalid network: ${targetNetwork}. Valid networks: ${validNetworks.join(', ')}`);
    }

    console.log(`🔄 Switching to ${targetNetwork} network...`);

    if (!fs.existsSync(this.envPath)) {
      console.log('⚠️  No .env file found. Please copy env.example to .env and configure it.');
      return false;
    }

    let envContent = fs.readFileSync(this.envPath, 'utf8');
    
    // Update NETWORK variable
    envContent = envContent.replace(/NETWORK=\w+/, `NETWORK=${targetNetwork}`);
    
    fs.writeFileSync(this.envPath, envContent);
    
    console.log(`✅ Switched to ${targetNetwork} network`);
    return true;
  }

  /**
   * Display current network configuration
   */
  showCurrentConfig() {
    const currentNetwork = this.getCurrentNetwork();
    const config = this.getNetworkConfig(currentNetwork);
    
    console.log(`\n📋 Current Network Configuration:`);
    console.log(`Network: ${currentNetwork}`);
    console.log(`Chain ID: ${config.CHAIN_ID}`);
    console.log(`Network Name: ${config.NETWORK_NAME}`);
    
    if (fs.existsSync(this.envPath)) {
      const envContent = fs.readFileSync(this.envPath, 'utf8');
      
      // Show relevant environment variables
      const rpcUrl = envContent.match(new RegExp(`${config.RPC_URL}=(.+)`));
      const contractAddress = envContent.match(new RegExp(`${config.CONTRACT_ADDRESS}=(.+)`));
      const walletAddress = envContent.match(new RegExp(`${config.WALLET_ADDRESS}=(.+)`));
      
      console.log(`RPC URL: ${rpcUrl ? rpcUrl[1] : 'Not set'}`);
      console.log(`Contract Address: ${contractAddress ? contractAddress[1] : 'Not set'}`);
      console.log(`Wallet Address: ${walletAddress ? walletAddress[1] : 'Not set'}`);
    } else {
      console.log('⚠️  No .env file found');
    }
  }

  /**
   * Validate network configuration
   */
  validateConfig(network = null) {
    const targetNetwork = network || this.getCurrentNetwork();
    const config = this.getNetworkConfig(targetNetwork);
    
    if (!fs.existsSync(this.envPath)) {
      console.log('❌ No .env file found');
      return false;
    }

    const envContent = fs.readFileSync(this.envPath, 'utf8');
    const requiredVars = [
      config.RPC_URL,
      config.PRIVATE_KEY,
      config.CONTRACT_ADDRESS,
      config.WALLET_ADDRESS
    ];

    const missing = [];
    for (const varName of requiredVars) {
      if (!envContent.includes(`${varName}=`) || envContent.match(new RegExp(`${varName}=\\s*$`))) {
        missing.push(varName);
      }
    }

    if (missing.length > 0) {
      console.log(`❌ Missing required environment variables for ${targetNetwork}:`);
      missing.forEach(varName => console.log(`  - ${varName}`));
      return false;
    }

    console.log(`✅ ${targetNetwork} network configuration is valid`);
    return true;
  }

  /**
   * Get deployment info for current network
   */
  getDeploymentInfo(network = null) {
    const targetNetwork = network || this.getCurrentNetwork();
    const deploymentFile = path.join(__dirname, '..', 'ethereum-contracts', `deployment-${targetNetwork === 'local' ? 'localhost' : targetNetwork}.json`);
    
    if (fs.existsSync(deploymentFile)) {
      const deployment = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
      return deployment;
    }
    
    return null;
  }
}

// Export for use in other scripts
module.exports = NetworkConfig;

// CLI usage
if (require.main === module) {
  const config = new NetworkConfig();
  const command = process.argv[2];
  
  switch (command) {
    case 'show':
      config.showCurrentConfig();
      break;
    case 'switch':
      const network = process.argv[3];
      if (!network) {
        console.log('Usage: node network-config.js switch <local|sepolia>');
        process.exit(1);
      }
      config.switchNetwork(network);
      break;
    case 'validate':
      const targetNetwork = process.argv[3];
      config.validateConfig(targetNetwork);
      break;
    case 'deployment':
      const deployment = config.getDeploymentInfo();
      if (deployment) {
        console.log('📄 Deployment Info:', JSON.stringify(deployment, null, 2));
      } else {
        console.log('❌ No deployment info found');
      }
      break;
    default:
      console.log('Network Configuration Helper');
      console.log('Usage:');
      console.log('  node network-config.js show                    - Show current configuration');
      console.log('  node network-config.js switch <local|sepolia>  - Switch network');
      console.log('  node network-config.js validate [network]      - Validate configuration');
      console.log('  node network-config.js deployment              - Show deployment info');
  }
} 