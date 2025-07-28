const { ethers } = require('ethers');
const { FusionSDK, NetworkEnum } = require('@1inch/fusion-sdk');
require('dotenv').config();

/**
 * Cross-Chain Bridge Protocol Implementation
 * Handles communication between Ethereum and ICP for atomic swaps
 */
class CrossChainBridgeProtocol {
    constructor() {
        this.ethereumProvider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
        this.ethereumWallet = new ethers.Wallet(process.env.ETHEREUM_PRIVATE_KEY, this.ethereumProvider);
        
        this.fusionSDK = new FusionSDK({
            url: process.env.FUSION_API_URL || 'https://api.1inch.dev/fusion',
            network: NetworkEnum.ETHEREUM,
            authKey: process.env.DEV_PORTAL_API_TOKEN
        });
        
        this.bridgeContract = null;
        this.icpCanisterId = process.env.ICP_CANISTER_ID;
        
        this.swapStates = new Map();
        this.retryAttempts = new Map();
    }

    /**
     * Initialize bridge with deployed contract addresses
     */
    async initialize(ethereumContractAddress) {
        try {
            const contractABI = require('../ethereum-contracts/artifacts/contracts/EthereumICPBridge.sol/EthereumICPBridge.json').abi;
            this.bridgeContract = new ethers.Contract(ethereumContractAddress, contractABI, this.ethereumWallet);
            
            console.log('✅ Bridge protocol initialized');
            console.log('Ethereum Contract:', ethereumContractAddress);
            console.log('ICP Canister:', this.icpCanisterId);
            
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

    // ICP Integration Methods (placeholder implementations)
    async createICPSwap(params) {
        // TODO: Implement ICP canister call
        console.log('📞 Creating ICP swap:', params);
        return {
            orderId: 'icp_' + Date.now(),
            success: true
        };
    }

    async completeICPSwap(orderId, preimage) {
        // TODO: Implement ICP canister call
        console.log('📞 Completing ICP swap:', orderId);
        return { success: true };
    }

    async refundICPSwap(orderId) {
        // TODO: Implement ICP canister call
        console.log('📞 Refunding ICP swap:', orderId);
        return { success: true };
    }
}

// Example usage
async function main() {
    const bridge = new CrossChainBridgeProtocol();
    
    // Initialize with deployed contract address
    const contractAddress = process.env.ETHEREUM_CONTRACT_ADDRESS;
    if (!contractAddress) {
        console.error('❌ ETHEREUM_CONTRACT_ADDRESS not set in environment');
        return;
    }
    
    await bridge.initialize(contractAddress);
    
    // Example: Create Ethereum → ICP swap
    const swapResult = await bridge.createEthereumToICPSwap({
        ethereumSender: process.env.ETHEREUM_WALLET_ADDRESS,
        icpRecipient: 'icp_recipient_hash',
        amount: '0.1'
    });
    
    if (swapResult.success) {
        console.log('✅ Swap created:', swapResult.orderId);
        
        // Monitor the swap
        await bridge.monitorSwaps();
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = CrossChainBridgeProtocol; 