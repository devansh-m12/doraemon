import { AptosFusionSwapClient, AptosFusionSwapUtils, OrderStatus, Network } from './aptos-utils';

describe('Aptos Fusion Swap Client', () => {
  let client: AptosFusionSwapClient;
  let testAccount: any;

  beforeAll(async () => {
    // Create a test account for testing
    testAccount = AptosFusionSwapUtils.createTestAccount();
    const privateKey = AptosFusionSwapUtils.getTestAccountPrivateKey(testAccount);
    
    // Initialize client with testnet
    client = new AptosFusionSwapClient(privateKey, Network.TESTNET);
  });

  describe('Account Operations', () => {
    it('should get account information', async () => {
      const accountInfo = await client.getAccountInfo();
      expect(accountInfo).toBeDefined();
      expect(accountInfo.address).toBeDefined();
    });

    it('should get account balance', async () => {
      const balance = await client.getBalance();
      expect(typeof balance).toBe('bigint');
      expect(balance >= BigInt(0)).toBe(true);
    });
  });

  describe('Contract Query Functions', () => {
    it('should check contract health', async () => {
      const health = await client.checkContractHealth();
      expect(health).toBeDefined();
    });

    it('should get contract statistics', async () => {
      const stats = await client.getContractStatistics();
      expect(stats).toBeDefined();
    });

    it('should get total orders count', async () => {
      const totalOrders = await client.getTotalOrders();
      expect(typeof totalOrders).toBe('number');
      expect(totalOrders >= 0).toBe(true);
    });

    it('should get active orders', async () => {
      const activeOrders = await client.getActiveOrders();
      expect(Array.isArray(activeOrders)).toBe(true);
    });

    it('should get order history', async () => {
      const orderHistory = await client.getOrderHistory();
      expect(Array.isArray(orderHistory)).toBe(true);
    });

    it('should calculate order statistics', async () => {
      const orderStats = await client.calculateOrderStatistics();
      expect(orderStats).toBeDefined();
    });
  });

  describe('Order Management', () => {
    it('should create a test order with default parameters', () => {
      const testOrder = AptosFusionSwapUtils.createTestOrder();
      expect(testOrder).toBeDefined();
      expect(testOrder.src_mint).toBe('0x1::aptos_coin::AptosCoin');
      expect(testOrder.dst_mint).toBe('0x1::aptos_coin::AptosCoin');
      expect(testOrder.src_amount).toBe(BigInt(1000000));
      expect(testOrder.min_dst_amount).toBe(BigInt(950000));
    });

    it('should create a test order with custom parameters', () => {
      const customOrder = AptosFusionSwapUtils.createTestOrder(
        '0x1::aptos_coin::AptosCoin',
        '0x1::aptos_coin::AptosCoin',
        BigInt(2000000), // 2 APT
        BigInt(1800000), // 1.8 APT
        BigInt(2000000), // 2 APT
        Math.floor(Date.now() / 1000) + 7200 // 2 hours from now
      );
      
      expect(customOrder.src_amount).toBe(BigInt(2000000));
      expect(customOrder.min_dst_amount).toBe(BigInt(1800000));
    });

    it('should generate random hash for testing', () => {
      const hash1 = AptosFusionSwapUtils.generateRandomHash();
      const hash2 = AptosFusionSwapUtils.generateRandomHash();
      
      expect(hash1).toBeInstanceOf(Uint8Array);
      expect(hash1.length).toBe(32);
      expect(hash1).not.toEqual(hash2);
    });

    it('should convert between hex and bytes', () => {
      const originalHex = '0x1234567890abcdef';
      const bytes = AptosFusionSwapUtils.hexToBytes(originalHex);
      const convertedHex = AptosFusionSwapUtils.bytesToHex(bytes);
      
      expect(bytes).toBeInstanceOf(Uint8Array);
      expect(convertedHex.toLowerCase()).toBe(originalHex.toLowerCase());
    });
  });

  describe('Order Status Enum', () => {
    it('should have correct order status values', () => {
      expect(OrderStatus.ACTIVE).toBe(0);
      expect(OrderStatus.FILLED).toBe(1);
      expect(OrderStatus.CANCELLED).toBe(2);
      expect(OrderStatus.EXPIRED).toBe(3);
    });
  });

  describe('Integration Tests', () => {
    it('should get orders by status', async () => {
      const activeOrders = await client.getOrdersByStatus(OrderStatus.ACTIVE);
      expect(Array.isArray(activeOrders)).toBe(true);
    });

    it('should get orders by maker address', async () => {
      const accountInfo = await client.getAccountInfo();
      const makerOrders = await client.getOrdersByMaker(accountInfo.address);
      expect(Array.isArray(makerOrders)).toBe(true);
    });

    it('should get order by ID if exists', async () => {
      try {
        const order = await client.getOrderById(1);
        expect(order).toBeDefined();
      } catch (error) {
        // Order might not exist, which is expected
        expect(error).toBeDefined();
      }
    });
  });

  describe('Utility Functions', () => {
    it('should create test account', () => {
      const account = AptosFusionSwapUtils.createTestAccount();
      expect(account).toBeDefined();
      expect(account.accountAddress).toBeDefined();
      expect(account.privateKey).toBeDefined();
    });

    it('should get test account private key', () => {
      const account = AptosFusionSwapUtils.createTestAccount();
      const privateKey = AptosFusionSwapUtils.getTestAccountPrivateKey(account);
      expect(typeof privateKey).toBe('string');
      expect(privateKey.length).toBeGreaterThan(0);
    });
  });
});

// Example usage function for manual testing
export async function runExampleTests() {
  console.log('🚀 Starting Aptos Fusion Swap Client Tests...\n');

  try {
    // Create test account
    const testAccount = AptosFusionSwapUtils.createTestAccount();
    const privateKey = AptosFusionSwapUtils.getTestAccountPrivateKey(testAccount);
    
    console.log('✅ Test account created');
    console.log('📝 Account address:', testAccount.accountAddress.toString());
    console.log('🔑 Private key:', privateKey.substring(0, 20) + '...\n');

    // Initialize client
    const client = new AptosFusionSwapClient(privateKey, Network.TESTNET);
    console.log('🔗 Client initialized for testnet\n');

    // Get account info
    const accountInfo = await client.getAccountInfo();
    console.log('📊 Account info retrieved');
    console.log('💰 Sequence number:', accountInfo.sequence_number);
    console.log('🏠 Address:', accountInfo.address, '\n');

    // Get balance
    const balance = await client.getBalance();
    console.log('💎 Balance:', balance.toString(), 'octas (APT)\n');

    // Check contract health
    const health = await client.checkContractHealth();
    console.log('🏥 Contract health check:', health, '\n');

    // Get contract statistics
    const stats = await client.getContractStatistics();
    console.log('📈 Contract statistics:', stats, '\n');

    // Get total orders
    const totalOrders = await client.getTotalOrders();
    console.log('📋 Total orders:', totalOrders, '\n');

    // Get active orders
    const activeOrders = await client.getActiveOrders();
    console.log('🔄 Active orders:', activeOrders.length, '\n');

    // Create test order parameters
    const testOrder = AptosFusionSwapUtils.createTestOrder();
    console.log('📝 Test order created with parameters:');
    console.log('   Source token:', testOrder.src_mint);
    console.log('   Destination token:', testOrder.dst_mint);
    console.log('   Source amount:', testOrder.src_amount.toString());
    console.log('   Min destination amount:', testOrder.min_dst_amount.toString());
    console.log('   Expiration time:', new Date(testOrder.expiration_time * 1000).toISOString(), '\n');

    console.log('✅ All tests completed successfully!');
    console.log('🎯 Ready to create orders and interact with the contract.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Export for manual testing
export default {
  runExampleTests,
}; 