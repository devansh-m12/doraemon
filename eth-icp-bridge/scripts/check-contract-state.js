const { ethers } = require('ethers');
const path = require('path');
const NetworkConfig = require('./network-config');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

/**
 * Check contract state and configuration
 */
class ContractStateChecker {
    constructor() {
        // Setup network configuration
        const networkConfig = new NetworkConfig();
        networkConfig.setupEnvironment();
        
        this.provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
        this.contractAddress = process.env.ETHEREUM_CONTRACT_ADDRESS;
        
        // Load contract ABI
        const contractABI = require('../ethereum-contracts/artifacts/contracts/EthereumICPBridge.sol/EthereumICPBridge.json').abi;
        this.contract = new ethers.Contract(this.contractAddress, contractABI, this.provider);
    }

    async checkContractState() {
        console.log('🔍 Checking Contract State');
        console.log('==========================');
        console.log('');
        
        try {
            // Get contract owner
            const owner = await this.contract.owner();
            console.log('👑 Contract Owner:', owner);
            
            // Get minimum swap amount
            const minSwapAmount = await this.contract.minSwapAmount();
            console.log('💰 Minimum Swap Amount:', ethers.formatEther(minSwapAmount), 'ETH');
            
            // Get maximum swap amount
            const maxSwapAmount = await this.contract.maxSwapAmount();
            console.log('💰 Maximum Swap Amount:', ethers.formatEther(maxSwapAmount), 'ETH');
            
            // Get bridge fee percentage
            const bridgeFeePercentage = await this.contract.bridgeFeePercentage();
            console.log('💸 Bridge Fee Percentage:', bridgeFeePercentage.toString(), 'basis points (0.1%)');
            
            // Check wallet balance
            const walletAddress = process.env.ETHEREUM_WALLET_ADDRESS;
            const balance = await this.provider.getBalance(walletAddress);
            console.log('💳 Wallet Balance:', ethers.formatEther(balance), 'ETH');
            console.log('💳 Wallet Address:', walletAddress);
            
            // Calculate if we can afford minimum swap + gas
            const gasEstimate = await this.contract.createSwap.estimateGas(
                ethers.keccak256(ethers.toUtf8Bytes('test')),
                ethers.keccak256(ethers.randomBytes(32)),
                Math.floor(Date.now() / 1000) + 3600,
                { value: minSwapAmount }
            );
            
            const gasPrice = await this.provider.getFeeData();
            const estimatedGasCost = gasEstimate * gasPrice.gasPrice;
            const totalCost = minSwapAmount + estimatedGasCost;
            
            console.log('');
            console.log('📊 Cost Analysis:');
            console.log('⛽ Estimated Gas:', gasEstimate.toString());
            console.log('💸 Estimated Gas Cost:', ethers.formatEther(estimatedGasCost), 'ETH');
            console.log('💸 Total Cost (swap + gas):', ethers.formatEther(totalCost), 'ETH');
            console.log('💳 Available Balance:', ethers.formatEther(balance), 'ETH');
            
            if (balance >= totalCost) {
                console.log('✅ Sufficient balance for minimum swap');
            } else {
                console.log('❌ Insufficient balance for minimum swap');
                console.log('💡 Need additional:', ethers.formatEther(totalCost - balance), 'ETH');
            }
            
            console.log('');
            console.log('🔗 Contract Links:');
            console.log('Contract Address:', this.contractAddress);
            
        } catch (error) {
            console.error('❌ Error checking contract state:', error.message);
        }
    }
}

// Run check
async function main() {
    const checker = new ContractStateChecker();
    await checker.checkContractState();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = ContractStateChecker; 