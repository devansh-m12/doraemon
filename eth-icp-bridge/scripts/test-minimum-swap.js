const { ethers } = require('ethers');
const path = require('path');
const NetworkConfig = require('./network-config');

/**
 * Test minimum amount swap with Etherscan tracking
 */
class MinimumSwapTest {
    constructor() {
        // Setup network configuration
        const networkConfig = new NetworkConfig();
        networkConfig.setupEnvironment();
        
        this.provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
        this.wallet = new ethers.Wallet(process.env.ETHEREUM_PRIVATE_KEY, this.provider);
        this.contractAddress = process.env.ETHEREUM_CONTRACT_ADDRESS;
        this.icpCanisterId = process.env.ICP_CANISTER_ID;
        
        // Load contract ABI
        const contractABI = require('../ethereum-contracts/artifacts/contracts/EthereumICPBridge.sol/EthereumICPBridge.json').abi;
        this.contract = new ethers.Contract(this.contractAddress, contractABI, this.wallet);
        
        // Minimum amount in wei (0.001 ETH - exact minimum from contract)
        this.minAmount = ethers.parseEther('0.001');
        
        console.log('🔧 Test Configuration:');
        console.log('Contract Address:', this.contractAddress);
        console.log('Wallet Address:', this.wallet.address);
        console.log('Minimum Amount:', ethers.formatEther(this.minAmount), 'ETH');
        console.log('ICP Canister ID:', this.icpCanisterId);
        console.log('');
    }

    async checkBalance() {
        const balance = await this.provider.getBalance(this.wallet.address);
        console.log('💰 Wallet Balance:', ethers.formatEther(balance), 'ETH');
        
        if (balance < this.minAmount) {
            throw new Error(`Insufficient balance. Need at least ${ethers.formatEther(this.minAmount)} ETH`);
        }
        
        return balance;
    }

    async createMinimumSwap() {
        console.log('🔄 Creating minimum amount swap...');
        
        // Generate cryptographic materials
        const preimage = ethers.randomBytes(32);
        const hashlock = ethers.keccak256(preimage);
        const timelock = Math.floor(Date.now() / 1000) + 3600; // 1 hour
        
        // Create swap parameters
        const icpRecipient = ethers.keccak256(ethers.toUtf8Bytes('test_icp_recipient'));
        
        console.log('📋 Swap Parameters:');
        console.log('Amount:', ethers.formatEther(this.minAmount), 'ETH');
        console.log('Hashlock:', hashlock);
        console.log('Timelock:', new Date(timelock * 1000).toISOString());
        console.log('ICP Recipient:', icpRecipient);
        console.log('');
        
        // Estimate gas
        const gasEstimate = await this.contract.createSwap.estimateGas(
            icpRecipient,
            hashlock,
            timelock,
            { value: this.minAmount }
        );
        
        console.log('⛽ Estimated Gas:', gasEstimate.toString());
        
        // Get current gas price
        const gasPrice = await this.provider.getFeeData();
        const gasCost = gasEstimate * gasPrice.gasPrice;
        console.log('💸 Estimated Gas Cost:', ethers.formatEther(gasCost), 'ETH');
        console.log('💸 Total Cost (swap + gas):', ethers.formatEther(this.minAmount + gasCost), 'ETH');
        console.log('');
        
        // Create the swap transaction with proper ETH value
        const tx = await this.contract.createSwap(
            icpRecipient,
            hashlock,
            timelock,
            { 
                value: this.minAmount,
                gasLimit: gasEstimate * 120n / 100n // Add 20% buffer
            }
        );
        
        console.log('📤 Transaction sent!');
        console.log('Transaction Hash:', tx.hash);
        
        // Show appropriate explorer URL based on network
        const networkName = process.env.NETWORK_NAME || 'Local';
        if (networkName.includes('Local')) {
            console.log('🔍 Local Network - Check Hardhat node logs');
        } else {
            console.log('Etherscan URL:', `https://sepolia.etherscan.io/tx/${tx.hash}`);
        }
        console.log('');
        
        // Wait for transaction confirmation
        console.log('⏳ Waiting for confirmation...');
        const receipt = await tx.wait();
        
        console.log('✅ Transaction confirmed!');
        console.log('Block Number:', receipt.blockNumber);
        console.log('Gas Used:', receipt.gasUsed.toString());
        console.log('Effective Gas Price:', ethers.formatUnits(receipt.gasPrice, 'gwei'), 'gwei');
        console.log('');
        
        // Find the SwapCreated event
        const event = receipt.logs.find(log => {
            try {
                const parsed = this.contract.interface.parseLog(log);
                return parsed.name === 'SwapCreated';
            } catch {
                return false;
            }
        });
        
        if (event) {
            const parsedEvent = this.contract.interface.parseLog(event);
            const orderId = parsedEvent.args.orderId;
            console.log('🎉 Swap Created Successfully!');
            console.log('Order ID:', orderId);
            console.log('Preimage:', preimage);
            console.log('');
            
            return {
                success: true,
                orderId: orderId,
                preimage: preimage,
                hashlock: hashlock,
                timelock: timelock,
                txHash: tx.hash,
                gasUsed: receipt.gasUsed.toString(),
                effectiveGasPrice: ethers.formatUnits(receipt.gasPrice, 'gwei')
            };
        } else {
            console.log('⚠️ No SwapCreated event found');
            return {
                success: false,
                txHash: tx.hash
            };
        }
    }

    async testSwap() {
        try {
            console.log('🧪 Testing Minimum Amount Swap');
            console.log('================================');
            console.log('');
            
            // Check balance
            await this.checkBalance();
            
            // Create swap
            const result = await this.createMinimumSwap();
            
            if (result.success) {
                console.log('📊 Test Results:');
                console.log('✅ Swap created successfully');
                console.log('📋 Order ID:', result.orderId);
                console.log('⛽ Gas Used:', result.gasUsed);
                console.log('💰 Gas Price:', result.effectiveGasPrice, 'gwei');
                console.log('');
                console.log('🎯 Next Steps:');
                console.log('1. Monitor swap status on the contract');
                console.log('2. Complete the swap with preimage when ready');
            } else {
                console.log('❌ Swap creation failed');
            }
            
            return result;
            
        } catch (error) {
            console.error('❌ Test failed:', error.message);
            return { success: false, error: error.message };
        }
    }
}

// Run test
async function main() {
    const test = new MinimumSwapTest();
    await test.testSwap();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = MinimumSwapTest; 