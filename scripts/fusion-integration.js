const { FusionSDK, NetworkEnum } = require('@1inch/fusion-sdk');
const { ethers } = require('ethers');
require('dotenv').config();

/**
 * 1inch Fusion+ Integration for Ethereum-ICP Cross-Chain Swaps
 * This script demonstrates how to integrate with 1inch Fusion SDK
 * for cross-chain atomic swaps between Ethereum and ICP
 */
class EthereumICPFusionBridge {
    constructor() {
        this.fusionSDK = new FusionSDK({
            url: process.env.FUSION_API_URL || 'https://api.1inch.dev/fusion',
            network: NetworkEnum.ETHEREUM,
            authKey: process.env.DEV_PORTAL_API_TOKEN
        });
        
        this.provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
        this.wallet = new ethers.Wallet(process.env.ETHEREUM_PRIVATE_KEY, this.provider);
    }

    /**
     * Create a cross-chain swap order
     * @param {Object} params - Swap parameters
     * @returns {Promise<Object>} - Swap order details
     */
    async createCrossChainOrder(params) {
        try {
            console.log('🔄 Creating cross-chain swap order...');
            
            // Generate hashlock and preimage
            const preimage = ethers.randomBytes(32);
            const hashlock = ethers.keccak256(preimage);
            
            // Calculate timelock (1 hour from now)
            const timelock = Math.floor(Date.now() / 1000) + 3600;
            
            // Create 1inch Fusion order
            const fusionOrder = await this.fusionSDK.createOrder({
                fromTokenAddress: params.fromToken || '0xEeeeeEeeeEeEeeEeEeEeeEeeeeEeeeeEeeeeEeEeEe', // ETH
                toTokenAddress: '0x0000000000000000000000000000000000000001', // ICP Bridge marker
                amount: params.amount,
                walletAddress: params.sender,
                permit: params.permit,
                receiver: params.receiver,
                source: params.source || 'fusion-sdk'
            });
            
            console.log('✅ Fusion order created:', fusionOrder.orderHash);
            
            // Create bridge-specific order data
            const bridgeOrder = {
                fusionOrderHash: fusionOrder.orderHash,
                ethereumSender: params.sender,
                icpRecipient: params.icpRecipient,
                amount: params.amount,
                hashlock: hashlock,
                preimage: preimage,
                timelock: timelock,
                status: 'pending'
            };
            
            return {
                success: true,
                bridgeOrder,
                fusionOrder
            };
            
        } catch (error) {
            console.error('❌ Error creating cross-chain order:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Execute a cross-chain swap
     * @param {Object} orderData - Order data from createCrossChainOrder
     * @returns {Promise<Object>} - Execution result
     */
    async executeCrossChainSwap(orderData) {
        try {
            console.log('🚀 Executing cross-chain swap...');
            
            // Step 1: Execute 1inch Fusion order
            const fusionResult = await this.fusionSDK.executeOrder({
                order: orderData.fusionOrder,
                signature: orderData.fusionOrder.signature,
                permit: orderData.fusionOrder.permit
            });
            
            console.log('✅ Fusion order executed:', fusionResult.txHash);
            
            // Step 2: Trigger ICP canister interaction
            const icpResult = await this.triggerICPSwap(orderData.bridgeOrder);
            
            return {
                success: true,
                fusionTxHash: fusionResult.txHash,
                icpResult: icpResult
            };
            
        } catch (error) {
            console.error('❌ Error executing cross-chain swap:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Trigger ICP canister swap (placeholder for actual ICP integration)
     * @param {Object} bridgeOrder - Bridge order data
     * @returns {Promise<Object>} - ICP result
     */
    async triggerICPSwap(bridgeOrder) {
        // This would integrate with the ICP canister
        // For now, we'll return a placeholder
        console.log('🔗 Triggering ICP swap for order:', bridgeOrder.fusionOrderHash);
        
        return {
            icpCanisterId: process.env.ICP_CANISTER_ID || 'placeholder',
            orderId: bridgeOrder.fusionOrderHash,
            status: 'pending'
        };
    }

    /**
     * Get order status
     * @param {string} orderHash - Order hash
     * @returns {Promise<Object>} - Order status
     */
    async getOrderStatus(orderHash) {
        try {
            const order = await this.fusionSDK.getOrderStatus(orderHash);
            return {
                success: true,
                status: order.status,
                order: order
            };
        } catch (error) {
            console.error('❌ Error getting order status:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get quote for cross-chain swap
     * @param {Object} params - Quote parameters
     * @returns {Promise<Object>} - Quote details
     */
    async getQuote(params) {
        try {
            console.log('💰 Getting cross-chain swap quote...');
            
            const quote = await this.fusionSDK.getQuote({
                fromTokenAddress: params.fromToken || '0xEeeeeEeeeEeEeeEeEeEeeEeeeeEeeeeEeeeeEeEeEe',
                toTokenAddress: '0x0000000000000000000000000000000000000001', // ICP Bridge marker
                amount: params.amount
            });
            
            return {
                success: true,
                quote: quote
            };
            
        } catch (error) {
            console.error('❌ Error getting quote:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Complete a swap with preimage
     * @param {string} orderId - Order ID
     * @param {string} preimage - Preimage for hashlock
     * @returns {Promise<Object>} - Completion result
     */
    async completeSwap(orderId, preimage) {
        try {
            console.log('✅ Completing swap with preimage...');
            
            // This would call the Ethereum bridge contract
            // For now, we'll return a placeholder
            return {
                success: true,
                orderId: orderId,
                preimage: preimage,
                status: 'completed'
            };
            
        } catch (error) {
            console.error('❌ Error completing swap:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Example usage
async function main() {
    const bridge = new EthereumICPFusionBridge();
    
    // Example: Create a cross-chain swap
    const swapParams = {
        sender: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        icpRecipient: 'icp_recipient_principal_id',
        amount: ethers.parseEther('0.1'),
        fromToken: '0xEeeeeEeeeEeEeeEeEeEeeEeeeeEeeeeEeeeeEeEeEe' // ETH
    };
    
    console.log('🚀 Starting cross-chain swap example...');
    
    // Get quote
    const quote = await bridge.getQuote(swapParams);
    if (quote.success) {
        console.log('💰 Quote received:', quote.quote);
    }
    
    // Create order
    const orderResult = await bridge.createCrossChainOrder(swapParams);
    if (orderResult.success) {
        console.log('📋 Order created:', orderResult.bridgeOrder);
        
        // Execute swap
        const executionResult = await bridge.executeCrossChainSwap(orderResult);
        if (executionResult.success) {
            console.log('✅ Swap executed:', executionResult);
        }
    }
}

// Export for use in other modules
module.exports = {
    EthereumICPFusionBridge
};

// Run example if this file is executed directly
if (require.main === module) {
    main().catch(console.error);
} 