const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

/**
 * Network Configuration Manager
 * Sets up environment variables based on network selection
 */
class NetworkConfig {
    constructor() {
        this.network = process.env.NETWORK || 'local';
        this.config = this.loadNetworkConfig();
    }

    loadNetworkConfig() {
        const configs = {
            local: {
                rpcUrl: process.env.LOCAL_RPC_URL,
                privateKey: process.env.LOCAL_PRIVATE_KEY,
                contractAddress: process.env.LOCAL_CONTRACT_ADDRESS,
                walletAddress: process.env.LOCAL_WALLET_ADDRESS,
                chainId: 1337,
                networkName: 'Local Hardhat Network',
                RPC_URL: 'LOCAL_RPC_URL',
                PRIVATE_KEY: 'LOCAL_PRIVATE_KEY',
                CONTRACT_ADDRESS: 'LOCAL_CONTRACT_ADDRESS',
                WALLET_ADDRESS: 'LOCAL_WALLET_ADDRESS',
                CHAIN_ID: 1337,
                NETWORK_NAME: 'Local Hardhat Network'
            },
            sepolia: {
                rpcUrl: process.env.SEPOLIA_RPC_URL,
                privateKey: process.env.SEPOLIA_PRIVATE_KEY,
                contractAddress: process.env.SEPOLIA_CONTRACT_ADDRESS,
                walletAddress: process.env.SEPOLIA_WALLET_ADDRESS,
                chainId: 11155111,
                networkName: 'Sepolia Testnet',
                RPC_URL: 'SEPOLIA_RPC_URL',
                PRIVATE_KEY: 'SEPOLIA_PRIVATE_KEY',
                CONTRACT_ADDRESS: 'SEPOLIA_CONTRACT_ADDRESS',
                WALLET_ADDRESS: 'SEPOLIA_WALLET_ADDRESS',
                CHAIN_ID: 11155111,
                NETWORK_NAME: 'Sepolia Testnet'
            }
        };

        return configs[this.network] || configs.local;
    }

    getCurrentNetwork() {
        return this.network;
    }

    getNetworkConfig(network) {
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

        return configs[network] || configs.local;
    }

    getEnvironmentVariables() {
        return {
            ETHEREUM_RPC_URL: this.config.rpcUrl,
            ETHEREUM_PRIVATE_KEY: this.config.privateKey,
            ETHEREUM_CONTRACT_ADDRESS: this.config.contractAddress,
            ETHEREUM_WALLET_ADDRESS: this.config.walletAddress,
            CHAIN_ID: this.config.chainId,
            NETWORK_NAME: this.config.networkName
        };
    }

    validateConfig() {
        const required = ['rpcUrl', 'privateKey', 'contractAddress', 'walletAddress'];
        const missing = required.filter(key => !this.config[key]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required configuration for ${this.network} network: ${missing.join(', ')}`);
        }

        return true;
    }

    printConfig() {
        console.log(`🔧 Network Configuration: ${this.config.networkName}`);
        console.log(`📍 Network: ${this.network.toUpperCase()}`);
        console.log(`🔗 RPC URL: ${this.config.rpcUrl}`);
        console.log(`📝 Contract: ${this.config.contractAddress}`);
        console.log(`👛 Wallet: ${this.config.walletAddress}`);
        console.log(`🆔 Chain ID: ${this.config.chainId}`);
        console.log('');
    }

    setupEnvironment() {
        this.validateConfig();
        
        // Set environment variables
        Object.entries(this.getEnvironmentVariables()).forEach(([key, value]) => {
            process.env[key] = value;
        });

        this.printConfig();
        return this.config;
    }
}

// Export for use in other scripts
module.exports = NetworkConfig;

// If run directly, setup and print configuration
if (require.main === module) {
    const config = new NetworkConfig();
    config.setupEnvironment();
} 