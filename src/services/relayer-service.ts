import { ethers } from 'ethers';

export interface RelayerConfig {
    ethereumRpcUrl: string;
    privateKey: string;
    resolverAddress: string;
    icpClient: any;
    gasLimit?: number;
    maxRetries?: number;
    retryDelay?: number;
}

export interface OrderData {
    orderId: string;
    user: string;
    amount: string;
    hashlock: string;
    icpRecipient: string;
}

export class RelayerService {
    private provider: ethers.Provider;
    private signer: ethers.Signer;
    private resolverContract: any;
    private icpClient: any;
    private config: RelayerConfig;
    private isListening: boolean = false;
    private processingOrders: Set<string> = new Set();

    constructor(config: RelayerConfig) {
        this.config = config;
        this.provider = new ethers.JsonRpcProvider(config.ethereumRpcUrl);
        this.signer = new ethers.Wallet(config.privateKey, this.provider);
        // Note: Contract factory will be imported when contracts are compiled
        this.resolverContract = null; // Will be set after contract compilation
        this.icpClient = config.icpClient;
    }

    /**
     * Set the resolver contract after compilation
     */
    setResolverContract(contract: any): void {
        this.resolverContract = contract;
    }

    /**
     * Start listening for resolver contract events
     */
    async startListening(): Promise<void> {
        if (this.isListening) {
            console.log('⚠️ Relayer service is already listening');
            return;
        }

        if (!this.resolverContract) {
            console.error('❌ Resolver contract not set');
            return;
        }

        console.log('🔍 Starting relayer service...');
        console.log('📋 Resolver contract:', this.config.resolverAddress);
        console.log('🔗 Ethereum RPC:', this.config.ethereumRpcUrl);

        // Listen for OrderCreated events
        this.resolverContract.on('OrderCreated', async (orderId: string, user: string, amount: bigint, hashlock: string, icpRecipient: string, event: any) => {
            console.log('📋 New order created:', { 
                orderId, 
                user, 
                amount: amount.toString(), 
                hashlock,
                icpRecipient 
            });
            await this.processOrder({
                orderId,
                user,
                amount: amount.toString(),
                hashlock,
                icpRecipient
            });
        });

        // Listen for OrderResolved events
        this.resolverContract.on('OrderResolved', async (orderId: string, hashlock: string, preimage: string, event: any) => {
            console.log('✅ Order resolved:', { orderId, hashlock });
            await this.handleOrderResolution(orderId, hashlock, preimage);
        });

        // Listen for OrderCancelled events
        this.resolverContract.on('OrderCancelled', async (orderId: string, event: any) => {
            console.log('❌ Order cancelled:', { orderId });
            await this.handleOrderCancellation(orderId);
        });

        this.isListening = true;
        console.log('✅ Relayer service started successfully');
    }

    /**
     * Stop listening for events
     */
    async stopListening(): Promise<void> {
        if (!this.isListening) {
            console.log('⚠️ Relayer service is not listening');
            return;
        }

        console.log('🛑 Stopping relayer service...');
        
        // Remove all listeners
        if (this.resolverContract) {
            this.resolverContract.removeAllListeners();
        }
        this.isListening = false;
        this.processingOrders.clear();
        
        console.log('✅ Relayer service stopped');
    }

    /**
     * Process a new order
     */
    private async processOrder(orderData: OrderData): Promise<void> {
        if (this.processingOrders.has(orderData.orderId)) {
            console.log('⚠️ Order already being processed:', orderData.orderId);
            return;
        }

        this.processingOrders.add(orderData.orderId);

        try {
            console.log('🔄 Processing order:', orderData.orderId);
            
            // Submit transaction to ICP via Chain Fusion
            const success = await this.submitToICP(orderData);
            
            if (success) {
                console.log('✅ Order processed successfully:', orderData.orderId);
            } else {
                console.log('❌ Order processing failed:', orderData.orderId);
            }
        } catch (error) {
            console.error('❌ Error processing order:', orderData.orderId, error);
        } finally {
            this.processingOrders.delete(orderData.orderId);
        }
    }

    /**
     * Submit order to ICP via Chain Fusion
     */
    private async submitToICP(orderData: OrderData): Promise<boolean> {
        const maxRetries = this.config.maxRetries || 3;
        const retryDelay = this.config.retryDelay || 5000;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`🔄 Attempt ${attempt}/${maxRetries} to submit to ICP:`, orderData.orderId);

                // Encode order data for ICP bridge contract
                const encodedData = this.encodeOrderData(orderData);

                // Submit via Chain Fusion
                const result = await this.icpClient.submitEthereumTransactionViaChainFusion({
                    to: process.env['ICP_BRIDGE_ADDRESS'] || '0x0000000000000000000000000000000000000000',
                    data: encodedData,
                    value: '0x0',
                    gasLimit: this.config.gasLimit || 500000
                });

                if (result.success) {
                    console.log('✅ ICP submission successful:', orderData.orderId);
                    return true;
                } else {
                    console.log('❌ ICP submission failed:', orderData.orderId, result.error);
                }
            } catch (error) {
                console.error(`❌ ICP submission attempt ${attempt} failed:`, error);
            }

            if (attempt < maxRetries) {
                console.log(`⏳ Retrying in ${retryDelay}ms...`);
                await this.sleep(retryDelay);
            }
        }

        return false;
    }

    /**
     * Encode order data for ICP bridge contract
     */
    private encodeOrderData(orderData: OrderData): string {
        const abiCoder = new ethers.AbiCoder();
        return abiCoder.encode(
            ['bytes32', 'address', 'uint256', 'bytes32', 'string'],
            [
                orderData.orderId,
                orderData.user,
                orderData.amount,
                orderData.hashlock,
                orderData.icpRecipient
            ]
        );
    }

    /**
     * Handle successful order resolution
     */
    private async handleOrderResolution(orderId: string, hashlock: string, preimage: string): Promise<void> {
        try {
            console.log('🎉 Order resolved successfully:', orderId);
            console.log('🔓 Hashlock:', hashlock);
            console.log('🔑 Preimage length:', preimage.length);
            
            // Additional processing can be added here
            // For example, notify users, update databases, etc.
            
        } catch (error) {
            console.error('❌ Error handling order resolution:', error);
        }
    }

    /**
     * Handle order cancellation
     */
    private async handleOrderCancellation(orderId: string): Promise<void> {
        try {
            console.log('💔 Order cancelled:', orderId);
            
            // Additional processing can be added here
            // For example, refund users, update databases, etc.
            
        } catch (error) {
            console.error('❌ Error handling order cancellation:', error);
        }
    }

    /**
     * Get order status from contract
     */
    async getOrderStatus(orderId: string): Promise<number> {
        try {
            if (!this.resolverContract) {
                throw new Error('Resolver contract not set');
            }
            const status = await this.resolverContract.getOrderStatus(orderId);
            return Number(status);
        } catch (error) {
            console.error('❌ Error getting order status:', error);
            throw error;
        }
    }

    /**
     * Get order details from contract
     */
    async getOrderDetails(orderId: string): Promise<any> {
        try {
            if (!this.resolverContract) {
                throw new Error('Resolver contract not set');
            }
            const order = await this.resolverContract.getOrder(orderId);
            return {
                user: order[0],
                amount: order[1].toString(),
                hashlock: order[2],
                timelock: Number(order[3]),
                status: Number(order[4]),
                icpRecipient: order[5]
            };
        } catch (error) {
            console.error('❌ Error getting order details:', error);
            throw error;
        }
    }

    /**
     * Check if relayer is authorized
     */
    async isAuthorized(): Promise<boolean> {
        try {
            if (!this.resolverContract) {
                return false;
            }
            const isAuthorized = await this.resolverContract.isAuthorizedRelayer(await this.signer.getAddress());
            return isAuthorized;
        } catch (error) {
            console.error('❌ Error checking authorization:', error);
            return false;
        }
    }

    /**
     * Utility function to sleep
     */
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get service status
     */
    getStatus(): any {
        return {
            isListening: this.isListening,
            processingOrders: Array.from(this.processingOrders),
            config: {
                resolverAddress: this.config.resolverAddress,
                ethereumRpcUrl: this.config.ethereumRpcUrl,
                gasLimit: this.config.gasLimit,
                maxRetries: this.config.maxRetries,
                retryDelay: this.config.retryDelay
            }
        };
    }
} 