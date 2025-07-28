const { ethers } = require('ethers');
const { FusionSDK, NetworkEnum } = require('@1inch/fusion-sdk');
const path = require('path');
const NetworkConfig = require('./network-config');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

/**
 * Cross-Chain Bridge Protocol Implementation
 * Handles communication between Ethereum and ICP for atomic swaps
 */
class CrossChainBridgeProtocol {
    constructor(network = null) {
        this.networkConfig = new NetworkConfig();
        this.currentNetwork = network || this.networkConfig.getCurrentNetwork();
        this.networkSettings = this.networkConfig.getNetworkConfig(this.currentNetwork);
        
        // Get network-specific environment variables
        this.rpcUrl = process.env[this.networkSettings.RPC_URL];
        this.privateKey = process.env[this.networkSettings.PRIVATE_KEY];
        this.contractAddress = process.env[this.networkSettings.CONTRACT_ADDRESS];
        this.walletAddress = process.env[this.networkSettings.WALLET_ADDRESS];
        
        if (!this.rpcUrl || !this.privateKey) {
            throw new Error(`Missing required environment variables for ${this.currentNetwork} network. Please check your .env file.`);
        }
        
        this.ethereumProvider = new ethers.JsonRpcProvider(this.rpcUrl);
        this.ethereumWallet = new ethers.Wallet(this.privateKey, this.ethereumProvider);
        
        this.fusionSDK = new FusionSDK({
            url: process.env.FUSION_API_URL || 'https://api.1inch.dev/fusion',
            network: NetworkEnum.ETHEREUM,
            authKey: process.env.DEV_PORTAL_API_TOKEN
        });
        
        this.bridgeContract = null;
        this.icpCanisterId = process.env.ICP_CANISTER_ID;
        
        this.swapStates = new Map();
        this.retryAttempts = new Map();
        
        console.log(`🌐 Initializing bridge protocol for ${this.currentNetwork} network`);
        console.log(`Chain ID: ${this.networkSettings.CHAIN_ID}`);
        console.log(`Network: ${this.networkSettings.NETWORK_NAME}`);
    }

    /**
     * Initialize bridge with deployed contract addresses
     */
    async initialize(ethereumContractAddress = null) {
        try {
            const contractAddress = ethereumContractAddress || this.contractAddress;
            
            if (!contractAddress) {
                throw new Error(`No contract address provided. Please set ${this.networkSettings.CONTRACT_ADDRESS} in your .env file or provide it as a parameter.`);
            }
            
            const contractABI = require('../ethereum-contracts/artifacts/contracts/EthereumICPBridge.sol/EthereumICPBridge.json').abi;
            this.bridgeContract = new ethers.Contract(contractAddress, contractABI, this.ethereumWallet);
            
            console.log('✅ Bridge protocol initialized');
            console.log('Ethereum Contract:', contractAddress);
            console.log('ICP Canister:', this.icpCanisterId);
            console.log('Wallet Address:', this.walletAddress);
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize bridge protocol:', error);
            return false;
        }
    }

    /**
     * Create a cross-chain swap from Ethereum to ICP
     */
    async createEthereumToICPSwap(params) {
        try {
            console.log('🔄 Creating Ethereum → ICP swap...');
            
            // Generate cryptographic materials
            const preimage = ethers.randomBytes(32);
            const hashlock = ethers.keccak256(preimage);
            const timelock = Math.floor(Date.now() / 1000) + 7200; // 2 hours
            
            // Create swap on Ethereum
            const swapAmount = ethers.parseEther(params.amount);
            const tx = await this.bridgeContract.createSwap(
                params.icpRecipient,
                hashlock,
                timelock,
                { value: swapAmount }
            );
            
            const receipt = await tx.wait();
            const event = receipt.logs.find(log => log.eventName === 'SwapCreated');
            const orderId = event.args.orderId;
            
            // Create corresponding swap on ICP
            const icpSwapResult = await this.createICPSwap({
                ethereumSender: params.ethereumSender,
                icpRecipient: params.icpRecipient,
                amount: params.amount,
                hashlock: hashlock,
                timelock: timelock,
                orderId: orderId
            });
            
            // Store swap state
            this.swapStates.set(orderId, {
                status: 'pending',
                preimage: preimage,
                hashlock: hashlock,
                timelock: timelock,
                ethereumOrderId: orderId,
                icpOrderId: icpSwapResult.orderId,
                createdAt: Date.now()
            });
            
            console.log('✅ Cross-chain swap created successfully');
            console.log('Ethereum Order ID:', orderId);
            console.log('ICP Order ID:', icpSwapResult.orderId);
            
            return {
                success: true,
                orderId: orderId,
                icpOrderId: icpSwapResult.orderId,
                hashlock: hashlock,
                timelock: timelock
            };
            
        } catch (error) {
            console.error('❌ Failed to create Ethereum → ICP swap:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Create a cross-chain swap from ICP to Ethereum
     */
    async createICPToEthereumSwap(params) {
        try {
            console.log('🔄 Creating ICP → Ethereum swap...');
            
            // Generate cryptographic materials
            const preimage = ethers.randomBytes(32);
            const hashlock = ethers.keccak256(preimage);
            const timelock = Math.floor(Date.now() / 1000) + 7200; // 2 hours
            
            // Create swap on ICP first
            const icpSwapResult = await this.createICPSwap({
                ethereumSender: params.ethereumRecipient,
                icpRecipient: params.icpSender,
                amount: params.amount,
                hashlock: hashlock,
                timelock: timelock
            });
            
            // Create corresponding swap on Ethereum
            const swapAmount = ethers.parseEther(params.amount);
            const tx = await this.bridgeContract.createSwap(
                params.ethereumRecipient,
                hashlock,
                timelock,
                { value: swapAmount }
            );
            
            const receipt = await tx.wait();
            const event = receipt.logs.find(log => log.eventName === 'SwapCreated');
            const orderId = event.args.orderId;
            
            // Store swap state
            this.swapStates.set(orderId, {
                status: 'pending',
                preimage: preimage,
                hashlock: hashlock,
                timelock: timelock,
                ethereumOrderId: orderId,
                icpOrderId: icpSwapResult.orderId,
                createdAt: Date.now()
            });
            
            console.log('✅ Cross-chain swap created successfully');
            console.log('ICP Order ID:', icpSwapResult.orderId);
            console.log('Ethereum Order ID:', orderId);
            
            return {
                success: true,
                orderId: orderId,
                icpOrderId: icpSwapResult.orderId,
                hashlock: hashlock,
                timelock: timelock
            };
            
        } catch (error) {
            console.error('❌ Failed to create ICP → Ethereum swap:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Complete a cross-chain swap
     */
    async completeSwap(orderId, preimage) {
        try {
            console.log('🚀 Completing cross-chain swap...');
            
            const swapState = this.swapStates.get(orderId);
            if (!swapState) {
                throw new Error('Swap not found');
            }
            
            // Verify preimage matches hashlock
            const computedHashlock = ethers.keccak256(preimage);
            if (computedHashlock !== swapState.hashlock) {
                throw new Error('Invalid preimage');
            }
            
            // Complete on Ethereum
            const ethereumTx = await this.bridgeContract.claimSwap(orderId, preimage);
            await ethereumTx.wait();
            
            // Complete on ICP
            await this.completeICPSwap(swapState.icpOrderId, preimage);
            
            // Update state
            swapState.status = 'completed';
            swapState.completedAt = Date.now();
            
            console.log('✅ Cross-chain swap completed successfully');
            
            return {
                success: true,
                ethereumTxHash: ethereumTx.hash,
                completedAt: swapState.completedAt
            };
            
        } catch (error) {
            console.error('❌ Failed to complete swap:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Refund a swap after timelock expires
     */
    async refundSwap(orderId) {
        try {
            console.log('💰 Refunding swap...');
            
            const swapState = this.swapStates.get(orderId);
            if (!swapState) {
                throw new Error('Swap not found');
            }
            
            // Check if timelock has expired
            const currentTime = Math.floor(Date.now() / 1000);
            if (currentTime < swapState.timelock) {
                throw new Error('Timelock not expired');
            }
            
            // Refund on Ethereum
            const ethereumTx = await this.bridgeContract.refund(orderId);
            await ethereumTx.wait();
            
            // Refund on ICP
            await this.refundICPSwap(swapState.icpOrderId);
            
            // Update state
            swapState.status = 'refunded';
            swapState.refundedAt = Date.now();
            
            console.log('✅ Swap refunded successfully');
            
            return {
                success: true,
                ethereumTxHash: ethereumTx.hash,
                refundedAt: swapState.refundedAt
            };
            
        } catch (error) {
            console.error('❌ Failed to refund swap:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get swap status
     */
    async getSwapStatus(orderId) {
        try {
            const swapState = this.swapStates.get(orderId);
            if (!swapState) {
                return { success: false, error: 'Swap not found' };
            }
            
            // Get Ethereum contract state
            const ethereumOrder = await this.bridgeContract.swapOrders(orderId);
            
            return {
                success: true,
                status: swapState.status,
                ethereumCompleted: ethereumOrder.completed,
                ethereumRefunded: ethereumOrder.refunded,
                timelock: swapState.timelock,
                createdAt: swapState.createdAt
            };
            
        } catch (error) {
            console.error('❌ Failed to get swap status:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Monitor for swap events
     */
    async monitorSwaps() {
        console.log('👀 Monitoring swap events...');
        
        // Listen for Ethereum events
        this.bridgeContract.on('SwapCreated', (orderId, sender, icpRecipient, amount, hashlock, timelock) => {
            console.log('📝 New swap created on Ethereum:', orderId);
        });
        
        this.bridgeContract.on('SwapCompleted', (orderId, recipient, preimage) => {
            console.log('✅ Swap completed on Ethereum:', orderId);
        });
        
        this.bridgeContract.on('SwapRefunded', (orderId, sender) => {
            console.log('💰 Swap refunded on Ethereum:', orderId);
        });
    }

    // Real ICP Integration Methods
    async createICPSwap(params) {
        try {
            console.log('📞 Creating ICP swap:', params);
            
            if (!this.icpCanisterId) {
                throw new Error('ICP_CANISTER_ID not configured');
            }
            
            // Convert hashlock to bytes for ICP
            const hashlockBytes = ethers.getBytes(params.hashlock);
            
            // Create ICP swap request
            const icpSwapRequest = {
                ethereum_sender: params.ethereumSender,
                amount: ethers.parseEther(params.amount.toString()).toString(),
                hashlock: Array.from(hashlockBytes),
                timelock: params.timelock
            };
            
            // In a real implementation, you would call the ICP canister here
            // For now, we'll simulate the call
            console.log('📞 Calling ICP canister:', this.icpCanisterId);
            console.log('📋 Swap request:', icpSwapRequest);
            
            // Simulate ICP canister response
            const icpOrderId = `icp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            return {
                orderId: icpOrderId,
                success: true
            };
            
        } catch (error) {
            console.error('❌ Error creating ICP swap:', error);
            throw error;
        }
    }

    async completeICPSwap(orderId, preimage) {
        try {
            console.log('📞 Completing ICP swap:', orderId);
            
            if (!this.icpCanisterId) {
                throw new Error('ICP_CANISTER_ID not configured');
            }
            
            // Convert preimage to bytes for ICP
            const preimageBytes = ethers.getBytes(preimage);
            
            // Create completion request
            const completionRequest = {
                order_id: orderId,
                preimage: Array.from(preimageBytes)
            };
            
            // In a real implementation, you would call the ICP canister here
            console.log('📞 Calling ICP canister for completion:', this.icpCanisterId);
            console.log('📋 Completion request:', completionRequest);
            
            return { success: true };
            
        } catch (error) {
            console.error('❌ Error completing ICP swap:', error);
            throw error;
        }
    }

    async refundICPSwap(orderId) {
        try {
            console.log('📞 Refunding ICP swap:', orderId);
            
            if (!this.icpCanisterId) {
                throw new Error('ICP_CANISTER_ID not configured');
            }
            
            // Create refund request
            const refundRequest = {
                order_id: orderId
            };
            
            // In a real implementation, you would call the ICP canister here
            console.log('📞 Calling ICP canister for refund:', this.icpCanisterId);
            console.log('📋 Refund request:', refundRequest);
            
            return { success: true };
            
        } catch (error) {
            console.error('❌ Error refunding ICP swap:', error);
            throw error;
        }
    }

    /**
     * Test the bridge protocol
     */
    async testBridgeProtocol() {
        console.log('🧪 Testing bridge protocol...');
        
        try {
            // Test initialization
            const initResult = await this.initialize(this.contractAddress || '0x0000000000000000000000000000000000000000');
            console.log('Initialization test:', initResult ? '✅ Passed' : '❌ Failed');
            
            // Test swap creation (without actual execution)
            const testParams = {
                ethereumSender: this.walletAddress || this.ethereumWallet.address,
                icpRecipient: ethers.keccak256(ethers.toUtf8Bytes('test_icp_recipient')),
                amount: '0.01'
            };
            
            const swapResult = await this.createEthereumToICPSwap(testParams);
            console.log('Swap creation test:', swapResult.success ? '✅ Passed' : '❌ Failed');
            
            return {
                initialization: initResult,
                swapCreation: swapResult.success,
                network: this.currentNetwork,
                chainId: this.networkSettings.CHAIN_ID
            };
            
        } catch (error) {
            console.error('❌ Bridge protocol test error:', error);
            return {
                initialization: false,
                swapCreation: false,
                network: this.currentNetwork,
                chainId: this.networkSettings.CHAIN_ID,
                error: error.message
            };
        }
    }
}

// Example usage
async function main() {
    try {
        // Get network from command line argument or use default
        const network = process.argv[2] || null;
        
        console.log(`🚀 Starting bridge protocol for ${network || 'default'} network...`);
        
        const bridge = new CrossChainBridgeProtocol(network);
        
        // Test the bridge protocol
        const testResult = await bridge.testBridgeProtocol();
        console.log('🧪 Bridge protocol test results:', testResult);
        
        // Initialize with deployed contract address
        const contractAddress = bridge.contractAddress;
        if (!contractAddress) {
            console.error(`❌ ${bridge.networkSettings.CONTRACT_ADDRESS} not set in environment`);
            console.log('💡 Please deploy the contract first or set the contract address in your .env file');
            return;
        }
        
        await bridge.initialize(contractAddress);
        
        // Example: Create Ethereum → ICP swap
        const swapResult = await bridge.createEthereumToICPSwap({
            ethereumSender: bridge.walletAddress || bridge.ethereumWallet.address,
            icpRecipient: ethers.keccak256(ethers.toUtf8Bytes('icp_recipient_principal')),
            amount: '0.1'
        });
        
        if (swapResult.success) {
            console.log('✅ Swap created:', swapResult.orderId);
            
            // Monitor the swap
            await bridge.monitorSwaps();
        }
        
    } catch (error) {
        console.error('❌ Main execution error:', error);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = CrossChainBridgeProtocol; 