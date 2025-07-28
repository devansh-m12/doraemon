import { ethers } from 'ethers';

/**
 * Test Setup Configuration
 * Configures test environment with real blockchain interactions
 */
export const testConfig = {
    // Test network configuration
    ethereumRpcUrl: process.env['TEST_ETHEREUM_RPC_URL'] || 'http://localhost:8545',
    privateKey: process.env['TEST_PRIVATE_KEY'] || ethers.Wallet.createRandom().privateKey,
    
    // Test contract addresses (will be set after deployment)
    bridgeContractAddress: process.env['TEST_BRIDGE_CONTRACT_ADDRESS'] || '',
    resolverContractAddress: process.env['TEST_RESOLVER_CONTRACT_ADDRESS'] || '',
    
    // API configuration
    oneInchApiKey: process.env['TEST_ONEINCH_API_KEY'] || '',
    fusionApiUrl: process.env['TEST_FUSION_API_URL'] || 'https://api.1inch.dev/fusion',
    
    // Test parameters
    maxSlippage: 50,
    gasLimit: 500000,
    deadline: 300,
    
    // Test amounts
    testAmount: '1000000000000000000', // 1 ETH
    minTestAmount: '100000000000000000', // 0.1 ETH
    maxTestAmount: '10000000000000000000' // 10 ETH
};

/**
 * Generate test wallet for testing
 */
export function generateTestWallet(): ethers.HDNodeWallet {
    return ethers.Wallet.createRandom();
}

/**
 * Generate test hashlock and preimage
 */
export function generateTestHashlock(): { hashlock: string; preimage: string } {
    const preimage = ethers.randomBytes(32);
    const hashlock = ethers.keccak256(preimage);
    return {
        hashlock: hashlock,
        preimage: ethers.hexlify(preimage)
    };
}

/**
 * Generate test ICP recipient address
 */
export function generateTestICPRecipient(): string {
    const testAddress = ethers.Wallet.createRandom().address;
    return `icp-${testAddress.toLowerCase()}`;
}

/**
 * Validate test configuration
 */
export function validateTestConfig(): boolean {
    const requiredVars = [
        'TEST_ETHEREUM_RPC_URL',
        'TEST_PRIVATE_KEY'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        console.warn('⚠️ Missing test environment variables:', missingVars.join(', '));
        console.warn('Using generated test values instead');
    }

    return true;
}

/**
 * Setup test provider
 */
export function createTestProvider(): ethers.JsonRpcProvider {
    return new ethers.JsonRpcProvider(testConfig.ethereumRpcUrl);
}

/**
 * Setup test wallet with provider
 */
export function createTestWalletWithProvider(): ethers.Wallet {
    const provider = createTestProvider();
    return new ethers.Wallet(testConfig.privateKey, provider);
}

/**
 * Generate test order parameters
 */
export function generateTestOrderParams() {
    const testWallet = createTestWalletWithProvider();
    const { hashlock, preimage } = generateTestHashlock();
    const icpRecipient = generateTestICPRecipient();
    
    return {
        sender: testWallet.address,
        icpRecipient: icpRecipient,
        amount: testConfig.testAmount,
        hashlock: hashlock,
        preimage: preimage,
        timelock: Math.floor(Date.now() / 1000) + 7200 // 2 hours from now
    };
}

/**
 * Initialize test environment
 */
export async function initializeTestEnvironment() {
    console.log('🧪 Initializing test environment...');
    
    // Validate configuration
    validateTestConfig();
    
    // Test provider connection
    const provider = createTestProvider();
    try {
        const network = await provider.getNetwork();
        console.log('✅ Test provider connected to network:', network.name);
    } catch (error) {
        console.error('❌ Test provider connection failed:', error);
        throw error;
    }
    
    // Test wallet setup
    const wallet = createTestWalletWithProvider();
    console.log('✅ Test wallet created:', wallet.address);
    
    // Test basic operations
    const { hashlock, preimage } = generateTestHashlock();
    console.log('✅ Test hashlock generated:', hashlock);
    
    const icpRecipient = generateTestICPRecipient();
    console.log('✅ Test ICP recipient generated:', icpRecipient);
    
    console.log('✅ Test environment initialized successfully');
}

export default {
    testConfig,
    generateTestWallet,
    createTestWalletWithProvider,
    generateTestHashlock,
    generateTestICPRecipient,
    validateTestConfig,
    createTestProvider,
    generateTestOrderParams,
    initializeTestEnvironment
}; 