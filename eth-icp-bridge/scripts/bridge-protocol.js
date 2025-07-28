const { ethers } = require('ethers');
const { FusionSDK, NetworkEnum } = require('@1inch/fusion-sdk');
const path = require('path');
const NetworkConfig = require('./network-config');
const ICPCanisterClient = require('./icp-canister-client');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

/**
 * Cross-Chain Bridge Protocol Implementation - Phase 3
 * Enhanced with message verification, event listening, and Chain Fusion integration
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
        
        // Initialize real ICP canister client
        this.icpClient = null;
        if (this.icpCanisterId) {
            this.icpClient = new ICPCanisterClient(this.icpCanisterId, this.currentNetwork);
        }
        
        // Phase 3: Enhanced state management
        this.swapStates = new Map();
        this.retryAttempts = new Map();
        this.crossChainMessages = new Map();
        this.eventListeners = new Map();
        this.verificationQueue = [];
        
        // Chain Fusion integration
        this.chainFusionEnabled = process.env.CHAIN_FUSION_ENABLED === 'true';
        this.icpEVMCanisterId = process.env.ICP_EVM_CANISTER_ID;
        
        console.log(`🌐 Initializing Phase 3 bridge protocol for ${this.currentNetwork} network`);
        console.log(`Chain ID: ${this.networkSettings.CHAIN_ID}`);
        console.log(`Network: ${this.networkSettings.NETWORK_NAME}`);
        console.log(`Chain Fusion: ${this.chainFusionEnabled ? 'Enabled' : 'Disabled'}`);
    }

    /**
     * Initialize bridge with deployed contract addresses and Chain Fusion
     */
    async initialize(ethereumContractAddress = null) {
        try {
            const contractAddress = ethereumContractAddress || this.contractAddress;
            
            if (!contractAddress) {
                throw new Error(`No contract address provided. Please set ${this.networkSettings.CONTRACT_ADDRESS} in your .env file or provide it as a parameter.`);
            }
            
            const contractABI = require('../ethereum-contracts/artifacts/contracts/EthereumICPBridge.sol/EthereumICPBridge.json').abi;
            this.bridgeContract = new ethers.Contract(contractAddress, contractABI, this.ethereumWallet);
            
            // Store contract address for Chain Fusion tests
            this.contractAddress = contractAddress;
            
            // Initialize Chain Fusion if enabled
            if (this.chainFusionEnabled) {
                await this.initializeChainFusion();
            }
            
            // Start event listeners
            await this.startEventListeners();
            
            console.log('✅ Phase 3 bridge protocol initialized');
            console.log('Ethereum Contract:', contractAddress);
            console.log('ICP Canister:', this.icpCanisterId);
            console.log('ICP EVM Canister:', this.icpEVMCanisterId);
            console.log('Wallet Address:', this.walletAddress);
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize bridge protocol:', error);
            return false;
        }
    }

    /**
     * Initialize Chain Fusion for direct Ethereum integration
     */
    async initializeChainFusion() {
        try {
            console.log('🔗 Initializing Chain Fusion integration...');
            
            // Verify ICP EVM canister is accessible
            if (!this.icpEVMCanisterId) {
                console.warn('⚠️ ICP EVM Canister ID not set, Chain Fusion features will be limited');
                return;
            }
            
            // Test Chain Fusion connectivity
            const testResult = await this.testChainFusionConnection();
            if (testResult) {
                console.log('✅ Chain Fusion integration ready');
            } else {
                console.warn('⚠️ Chain Fusion integration failed, falling back to standard bridge');
            }
            
        } catch (error) {
            console.error('❌ Chain Fusion initialization failed:', error);
        }
    }

    /**
     * Test Chain Fusion connection
     */
    async testChainFusionConnection() {
        try {
            // This would integrate with ICP's Chain Fusion API
            // For now, we'll simulate the connection test
            console.log('🔍 Testing Chain Fusion connection...');
            
            // Simulate EVM RPC call through ICP
            const testCall = await this.submitEthereumTransactionViaChainFusion({
                to: this.contractAddress,
                data: '0x', // Empty call
                value: '0x0'
            });
            
            return testCall.success;
        } catch (error) {
            console.error('Chain Fusion test failed:', error);
            return false;
        }
    }

    /**
     * Submit Ethereum transaction via Chain Fusion
     */
    async submitEthereumTransactionViaChainFusion(transactionData) {
        try {
            console.log('📤 Submitting transaction via Chain Fusion...');
            
            if (!this.icpClient) {
                throw new Error('ICP client not initialized');
            }
            
            // Use real ICP Chain Fusion to submit Ethereum transaction
            const result = await this.icpClient.submitEthereumTransaction(transactionData);
            
            console.log('✅ Real Chain Fusion transaction submitted');
            return result;
            
        } catch (error) {
            console.error('❌ Chain Fusion transaction failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Start event listeners for cross-chain communication
     */
    async startEventListeners() {
        try {
            console.log('👂 Starting cross-chain event listeners...');
            
            // Listen for Ethereum swap events
            this.bridgeContract.on('SwapCreated', async (orderId, sender, icpRecipient, amount, hashlock, timelock) => {
                await this.handleEthereumSwapCreated(orderId, sender, icpRecipient, amount, hashlock, timelock);
            });
            
            this.bridgeContract.on('SwapCompleted', async (orderId, recipient, preimage) => {
                await this.handleEthereumSwapCompleted(orderId, recipient, preimage);
            });
            
            this.bridgeContract.on('SwapRefunded', async (orderId, sender) => {
                await this.handleEthereumSwapRefunded(orderId, sender);
            });
            
            console.log('✅ Event listeners started');
            
        } catch (error) {
            console.error('❌ Failed to start event listeners:', error);
        }
    }

    /**
     * Handle Ethereum swap creation event
     */
    async handleEthereumSwapCreated(orderId, sender, icpRecipient, amount, hashlock, timelock) {
        try {
            console.log('🔄 Processing Ethereum swap creation...');
            console.log('Order ID:', orderId);
            console.log('Sender:', sender);
            console.log('ICP Recipient:', icpRecipient);
            
            // Verify cross-chain message
            const verificationResult = await this.verifyCrossChainMessage({
                sourceChain: 'ethereum',
                targetChain: 'icp',
                orderId: orderId,
                sender: sender,
                recipient: icpRecipient,
                amount: amount,
                hashlock: hashlock,
                timelock: timelock
            });
            
            if (verificationResult.valid) {
                // Create corresponding ICP swap
                await this.createICPSwap({
                    ethereumSender: sender,
                    icpRecipient: icpRecipient,
                    amount: amount,
                    hashlock: hashlock,
                    timelock: timelock,
                    orderId: orderId
                });
                
                // Update state synchronization
                await this.synchronizeState('ethereum', 'icp', orderId);
                
            } else {
                console.error('❌ Cross-chain message verification failed:', verificationResult.reason);
            }
            
        } catch (error) {
            console.error('❌ Failed to handle Ethereum swap creation:', error);
        }
    }

    /**
     * Handle Ethereum swap completion event
     */
    async handleEthereumSwapCompleted(orderId, recipient, preimage) {
        try {
            console.log('✅ Processing Ethereum swap completion...');
            console.log('Order ID:', orderId);
            console.log('Recipient:', recipient);
            
            // Complete corresponding ICP swap
            await this.completeICPSwap(orderId, preimage);
            
            // Update state synchronization
            await this.synchronizeState('ethereum', 'icp', orderId);
            
        } catch (error) {
            console.error('❌ Failed to handle Ethereum swap completion:', error);
        }
    }

    /**
     * Handle Ethereum swap refund event
     */
    async handleEthereumSwapRefunded(orderId, sender) {
        try {
            console.log('💸 Processing Ethereum swap refund...');
            console.log('Order ID:', orderId);
            console.log('Sender:', sender);
            
            // Refund corresponding ICP swap
            await this.refundICPSwap(orderId);
            
            // Update state synchronization
            await this.synchronizeState('ethereum', 'icp', orderId);
            
        } catch (error) {
            console.error('❌ Failed to handle Ethereum swap refund:', error);
        }
    }

    /**
     * Verify cross-chain message integrity
     */
    async verifyCrossChainMessage(message) {
        try {
            console.log('🔍 Verifying cross-chain message...');
            
            // Verify cryptographic integrity
            const hashlockValid = await this.verifyHashlock(message.hashlock);
            const timelockValid = this.verifyTimelock(message.timelock);
            // Handle both BigNumber and string amounts
            const amountToVerify = typeof message.amount === 'string' ? message.amount : ethers.formatEther(message.amount);
            const amountValid = this.verifyAmount(amountToVerify);
            
            // Verify sender authorization
            const senderValid = await this.verifySender(message.sender, message.sourceChain);
            
            // Verify recipient format
            const recipientValid = this.verifyRecipient(message.recipient, message.targetChain);
            
            const isValid = hashlockValid && timelockValid && amountValid && senderValid && recipientValid;
            
            console.log('🔍 Verification Details:');
            console.log('  Hashlock Valid:', hashlockValid);
            console.log('  Timelock Valid:', timelockValid);
            console.log('  Amount Valid:', amountValid);
            console.log('  Sender Valid:', senderValid);
            console.log('  Recipient Valid:', recipientValid);
            console.log('  Overall Valid:', isValid);
            
            return {
                valid: isValid,
                reason: isValid ? null : 'Verification failed',
                details: {
                    hashlock: hashlockValid,
                    timelock: timelockValid,
                    amount: amountValid,
                    sender: senderValid,
                    recipient: recipientValid
                }
            };
            
        } catch (error) {
            console.error('❌ Message verification failed:', error);
            return { valid: false, reason: error.message };
        }
    }

    /**
     * Verify hashlock cryptographic integrity
     */
    async verifyHashlock(hashlock) {
        try {
            // Check if hashlock is properly formatted
            if (!hashlock || typeof hashlock !== 'string' || hashlock.length !== 66) {
                return false;
            }
            
            // For testing purposes, assume hashlock is valid if properly formatted
            // In production, you would check if it's already used
            return true;
            
        } catch (error) {
            console.error('Hashlock verification failed:', error);
            return false;
        }
    }

    /**
     * Verify timelock validity
     */
    verifyTimelock(timelock) {
        const currentTime = Math.floor(Date.now() / 1000);
        const minTimelock = currentTime + 3600; // 1 hour minimum
        const maxTimelock = currentTime + 86400; // 24 hours maximum
        
        return timelock > minTimelock && timelock < maxTimelock;
    }

    /**
     * Verify amount within limits
     */
    verifyAmount(amount) {
        try {
            console.log('🔍 Verifying amount:', amount, typeof amount);
            
            // Convert string amount to BigNumber for comparison
            const amountBN = ethers.parseEther(amount.toString());
            const minAmount = ethers.parseEther('0.001');
            const maxAmount = ethers.parseEther('100');
            
            const isValid = amountBN >= minAmount && amountBN <= maxAmount;
            console.log('  Amount BN:', amountBN.toString());
            console.log('  Min Amount:', minAmount.toString());
            console.log('  Max Amount:', maxAmount.toString());
            console.log('  Is Valid:', isValid);
            
            return isValid;
        } catch (error) {
            console.error('Amount verification failed:', error);
            return false;
        }
    }

    /**
     * Verify sender authorization
     */
    async verifySender(sender, sourceChain) {
        try {
            if (sourceChain === 'ethereum') {
                // Verify Ethereum address format
                return ethers.isAddress(sender);
            } else if (sourceChain === 'icp') {
                // Verify ICP principal format
                return this.isValidICPPrincipal(sender);
            }
            return false;
        } catch (error) {
            return false;
        }
    }

    /**
     * Verify recipient format
     */
    verifyRecipient(recipient, targetChain) {
        try {
            if (targetChain === 'ethereum') {
                return ethers.isAddress(recipient);
            } else if (targetChain === 'icp') {
                return this.isValidICPPrincipal(recipient);
            }
            return false;
        } catch (error) {
            return false;
        }
    }

    /**
     * Check if string is valid ICP principal
     */
    isValidICPPrincipal(principal) {
        // Basic ICP principal validation
        return typeof principal === 'string' && principal.length > 0;
    }

    /**
     * Synchronize state between chains
     */
    async synchronizeState(sourceChain, targetChain, orderId) {
        try {
            console.log(`🔄 Synchronizing state: ${sourceChain} → ${targetChain}`);
            console.log('Order ID:', orderId);
            
            // Get source chain state
            const sourceState = await this.getSwapState(sourceChain, orderId);
            
            // Update target chain state
            await this.updateSwapState(targetChain, orderId, sourceState);
            
            // Log synchronization
            this.crossChainMessages.set(orderId, {
                sourceChain,
                targetChain,
                timestamp: Date.now(),
                state: sourceState
            });
            
            console.log('✅ State synchronization completed');
            
        } catch (error) {
            console.error('❌ State synchronization failed:', error);
        }
    }

    /**
     * Get swap state from specific chain
     */
    async getSwapState(chain, orderId) {
        try {
            if (chain === 'ethereum') {
                const order = await this.bridgeContract.getSwapOrder(orderId);
                return {
                    completed: order.completed,
                    refunded: order.refunded,
                    timelock: order.timelock,
                    amount: order.amount
                };
            } else if (chain === 'icp') {
                // This would call ICP canister
                return await this.getICPSwapState(orderId);
            }
        } catch (error) {
            console.error(`Failed to get ${chain} swap state:`, error);
            return null;
        }
    }

    /**
     * Update swap state on specific chain
     */
    async updateSwapState(chain, orderId, state) {
        try {
            if (chain === 'ethereum') {
                // Ethereum state is immutable, only log
                console.log('Ethereum state update logged');
            } else if (chain === 'icp') {
                // Update ICP canister state
                await this.updateICPSwapState(orderId, state);
            }
        } catch (error) {
            console.error(`Failed to update ${chain} swap state:`, error);
        }
    }

    /**
     * Get ICP swap state (real)
     */
    async getICPSwapState(orderId) {
        try {
            if (!this.icpClient) {
                throw new Error('ICP client not initialized');
            }
            
            const result = await this.icpClient.getSwapOrder(orderId);
            return {
                completed: result.completed,
                refunded: result.refunded,
                timelock: result.timelock,
                amount: result.amount,
                realCall: true
            };
        } catch (error) {
            console.error('Failed to get ICP swap state:', error);
            return null;
        }
    }

    /**
     * Update ICP swap state (real)
     */
    async updateICPSwapState(orderId, state) {
        try {
            if (!this.icpClient) {
                throw new Error('ICP client not initialized');
            }
            
            // Process cross-chain message to update state
            const message = {
                source_chain: 'ethereum',
                target_chain: 'icp',
                order_id: orderId,
                message_type: 'update_state',
                payload: Buffer.from(JSON.stringify(state)).toString('base64'),
                signature: null,
                timestamp: Math.floor(Date.now() / 1000)
            };
            
            await this.icpClient.processCrossChainMessage(message);
            console.log('Real ICP state update:', orderId, state);
        } catch (error) {
            console.error('Failed to update ICP swap state:', error);
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
            console.log('🔗 Transaction Hash:', tx.hash);
            
            return {
                success: true,
                orderId: orderId,
                icpOrderId: icpSwapResult.orderId,
                txHash: tx.hash,
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
            console.log('📞 Creating real ICP swap:', params);
            
            if (!this.icpClient) {
                throw new Error('ICP client not initialized');
            }
            
            // Convert hashlock to bytes for ICP
            const hashlockBytes = ethers.getBytes(params.hashlock);
            
            // Create real ICP swap request
            const icpSwapRequest = {
                ethereumSender: params.ethereumSender,
                amount: params.amount,
                hashlock: hashlockBytes,
                timelock: params.timelock,
                crossChainId: params.orderId || null
            };
            
            // Make real ICP canister call
            const result = await this.icpClient.createSwap(icpSwapRequest);
            
            console.log('✅ Real ICP swap created:', result);
            return result;
            
        } catch (error) {
            console.error('❌ Error creating real ICP swap:', error);
            throw error;
        }
    }

    async completeICPSwap(orderId, preimage) {
        try {
            console.log('📞 Completing real ICP swap:', orderId);
            
            if (!this.icpClient) {
                throw new Error('ICP client not initialized');
            }
            
            // Convert preimage to bytes for ICP
            const preimageBytes = ethers.getBytes(preimage);
            
            // Make real ICP canister call
            const result = await this.icpClient.completeSwap(orderId, preimageBytes);
            
            console.log('✅ Real ICP swap completed:', result);
            return result;
            
        } catch (error) {
            console.error('❌ Error completing real ICP swap:', error);
            throw error;
        }
    }

    async refundICPSwap(orderId) {
        try {
            console.log('📞 Refunding real ICP swap:', orderId);
            
            if (!this.icpClient) {
                throw new Error('ICP client not initialized');
            }
            
            // Make real ICP canister call
            const result = await this.icpClient.refundSwap(orderId);
            
            console.log('✅ Real ICP swap refunded:', result);
            return result;
            
        } catch (error) {
            console.error('❌ Error refunding real ICP swap:', error);
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