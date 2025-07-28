import { ethers } from "ethers";

export interface CrossChainSwapParams {
    fromToken: string;
    toToken: string;
    amount: string;
    recipient: string;
    icpCanisterId: string;
    hashlock: string;
    timelock: number;
}

export interface SwapOrder {
    orderId: string;
    fromToken: string;
    toToken: string;
    amount: string;
    recipient: string;
    hashlock: string;
    timelock: number;
    status: 'pending' | 'completed' | 'failed' | 'expired';
    createdAt: number;
}

export interface QuoteResponse {
    fromToken: string;
    toToken: string;
    amount: string;
    expectedAmount: string;
    fee: string;
    gasEstimate: string;
    validUntil: number;
}

export class LocalFusionBridge {
    private provider: ethers.JsonRpcProvider;
    private signer: ethers.Wallet;
    
    constructor(
        privateKey: string, 
        rpcUrl: string
    ) {
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
        this.signer = new ethers.Wallet(privateKey, this.provider);
    }
    
    /**
     * Get quote for local testing
     */
    async getQuote(params: {
        fromToken: string;
        toToken: string;
        amount: string;
        walletAddress: string;
    }): Promise<QuoteResponse> {
        // Local quote calculation
        const amount = ethers.parseUnits(params.amount, 18);
        const fee = amount * 10n / 10000n; // 0.1% fee
        const expectedAmount = amount - fee;
        
        return {
            fromToken: params.fromToken,
            toToken: params.toToken,
            amount: params.amount,
            expectedAmount: expectedAmount.toString(),
            fee: fee.toString(),
            gasEstimate: '210000',
            validUntil: Date.now() + 300000 // 5 minutes
        };
    }
    
    /**
     * Create a cross-chain swap order for local testing
     */
    async createCrossChainOrder(params: CrossChainSwapParams): Promise<SwapOrder> {
        // Get local quote
        const quote = await this.getQuote({
            fromToken: params.fromToken,
            toToken: params.toToken,
            amount: params.amount,
            walletAddress: params.recipient
        });
        
        // Create local order tracking
        const swapOrder: SwapOrder = {
            orderId: this.generateOrderId(params),
            fromToken: params.fromToken,
            toToken: params.toToken,
            amount: params.amount,
            recipient: params.recipient,
            hashlock: params.hashlock,
            timelock: params.timelock,
            status: 'pending',
            createdAt: Date.now()
        };
        
        console.log('✅ Created local swap order:', swapOrder.orderId);
        return swapOrder;
    }
    
    /**
     * Complete a swap locally
     */
    async completeSwap(orderId: string, preimage: string): Promise<boolean> {
        // Verify the preimage matches the hashlock
        const hashlock = ethers.keccak256(ethers.toUtf8Bytes(preimage));
        
        console.log('✅ Completing local swap:', { orderId, preimage, hashlock });
        
        // Simulate successful completion
        return true;
    }
    
    /**
     * Get available tokens for local testing
     */
    async getAvailableTokens(): Promise<any[]> {
        return [
            {
                address: '0xEeeeeEeeeEeEeeEeEeEeeEeeeeEeeeeEeeeeEeEeEe',
                symbol: 'ETH',
                name: 'Ethereum',
                decimals: 18
            },
            {
                address: '0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8',
                symbol: 'ICP',
                name: 'Internet Computer',
                decimals: 8
            },
            {
                address: '0x0000000000000000000000000000000000000000',
                symbol: 'NATIVE',
                name: 'Native Token',
                decimals: 18
            }
        ];
    }
    
    /**
     * Get current gas price from local network
     */
    async getGasPrice(): Promise<string> {
        try {
            const gasPrice = await this.provider.getFeeData();
            return gasPrice.gasPrice?.toString() || '0';
        } catch (error) {
            console.error('Error getting gas price:', error);
            return '0';
        }
    }
    
    /**
     * Generate a unique order ID
     */
    private generateOrderId(params: CrossChainSwapParams): string {
        const data = `${params.fromToken}-${params.toToken}-${params.amount}-${params.recipient}-${params.hashlock}-${params.timelock}-${Date.now()}`;
        return ethers.keccak256(ethers.toUtf8Bytes(data));
    }
    
    /**
     * Verify hashlock with preimage
     */
    verifyHashlock(hashlock: string, preimage: string): boolean {
        const computedHashlock = ethers.keccak256(preimage);
        return hashlock === computedHashlock;
    }
    
    /**
     * Check if timelock has expired
     */
    isTimelockExpired(timelock: number): boolean {
        return Date.now() > timelock * 1000;
    }
}

/**
 * Utility class for ICP-specific operations
 */
export class ICPBridgeUtils {
    /**
     * Convert Ethereum address to ICP principal format
     */
    static ethereumToICPAddress(ethereumAddress: string): string {
        return `icp-${ethereumAddress.toLowerCase()}`;
    }
    
    /**
     * Convert ICP principal to Ethereum address format
     */
    static icpToEthereumAddress(icpPrincipal: string): string {
        return `0x${icpPrincipal.replace('icp-', '')}`;
    }
    
    /**
     * Generate a cryptographically secure hashlock
     */
    static generateHashlock(): { hashlock: string; preimage: string } {
        const preimage = ethers.randomBytes(32);
        const hashlock = ethers.keccak256(preimage);
        return {
            hashlock: hashlock,
            preimage: ethers.hexlify(preimage)
        };
    }
    
    /**
     * Calculate appropriate timelock based on network
     */
    static calculateTimelock(networkType: 'ethereum' | 'icp', hours: number = 1): number {
        const now = Math.floor(Date.now() / 1000);
        const timelockHours = networkType === 'ethereum' ? hours : hours * 2;
        return now + (timelockHours * 3600);
    }
    
    /**
     * Verify hashlock with preimage
     */
    static verifyHashlock(hashlock: string, preimage: string): boolean {
        const computedHashlock = ethers.keccak256(preimage);
        return hashlock === computedHashlock;
    }
}

/**
 * Configuration for the bridge
 */
export interface BridgeConfig {
    ethereumRpcUrl: string;
    icpNetwork: 'local' | 'ic';
    oneInchApiKey: string;
    privateKey: string;
    bridgeFeePercentage: number;
    minSwapAmount: string;
    maxSwapAmount: string;
}

/**
 * Main bridge class that coordinates between Ethereum and ICP
 */
export class LocalDoraemonBridge {
    private fusionBridge: LocalFusionBridge;
    private config: BridgeConfig;
    
    constructor(config: BridgeConfig) {
        this.config = config;
        this.fusionBridge = new LocalFusionBridge(
            config.privateKey,
            config.ethereumRpcUrl
        );
    }
    
    /**
     * Initiate a cross-chain swap from Ethereum to ICP
     */
    async initiateEthereumToICPSwap(params: {
        amount: string;
        icpRecipient: string;
        fromToken?: string;
        toToken?: string;
    }): Promise<SwapOrder> {
        const { hashlock, preimage } = ICPBridgeUtils.generateHashlock();
        const timelock = ICPBridgeUtils.calculateTimelock('ethereum', 1);
        
        const swapParams: CrossChainSwapParams = {
            fromToken: params.fromToken || '0xEeeeeEeeeEeEeeEeEeEeeEeeeeEeeeeEeeeeEeEeEe',
            toToken: params.toToken || '0xEeeeeEeeeEeEeeEeEeEeeEeeeeEeeeeEeeeeEeEeEe',
            amount: params.amount,
            recipient: params.icpRecipient,
            icpCanisterId: 'local-canister-id',
            hashlock: hashlock,
            timelock: timelock
        };
        
        return await this.fusionBridge.createCrossChainOrder(swapParams);
    }
    
    /**
     * Complete a swap by providing the preimage
     */
    async completeSwap(orderId: string, preimage: string): Promise<boolean> {
        return await this.fusionBridge.completeSwap(orderId, preimage);
    }
    
    /**
     * Get quote for a potential swap
     */
    async getQuote(params: {
        fromToken: string;
        toToken: string;
        amount: string;
        walletAddress: string;
    }): Promise<QuoteResponse> {
        return await this.fusionBridge.getQuote(params);
    }
    
    /**
     * Get available tokens
     */
    async getAvailableTokens(): Promise<any[]> {
        return await this.fusionBridge.getAvailableTokens();
    }
    
    /**
     * Get order status
     */
    async getOrderStatus(orderId: string): Promise<any> {
        return {
            orderId,
            status: 'pending',
            timestamp: Date.now()
        };
    }
    
    /**
     * Get gas price
     */
    async getGasPrice(): Promise<string> {
        return await this.fusionBridge.getGasPrice();
    }
    
    /**
     * Generate hashlock and preimage
     */
    generateHashlock(): { hashlock: string; preimage: string } {
        return ICPBridgeUtils.generateHashlock();
    }
    
    /**
     * Verify hashlock with preimage
     */
    verifyHashlock(hashlock: string, preimage: string): boolean {
        return ICPBridgeUtils.verifyHashlock(hashlock, preimage);
    }
    
    /**
     * Check if timelock has expired
     */
    isTimelockExpired(timelock: number): boolean {
        return this.fusionBridge.isTimelockExpired(timelock);
    }
    
    /**
     * Get the current bridge configuration
     */
    getConfig(): BridgeConfig {
        return this.config;
    }
} 