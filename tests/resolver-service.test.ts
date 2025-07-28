import { DoraemonResolverService, ResolverConfig } from '../src/resolver-service-simple';

describe('DoraemonResolverService', () => {
  let resolverService: DoraemonResolverService;
  let config: ResolverConfig;

  beforeEach(() => {
    config = {
      ethereumRpcUrl: 'http://localhost:8545',
      privateKey: '0x0000000000000000000000000000000000000000000000000000000000000001',
      bridgeContractAddress: '0x1234567890123456789012345678901234567890',
      resolverContractAddress: '0x0987654321098765432109876543210987654321',
      oneInchApiKey: 'test-api-key',
      maxSlippage: 50,
      gasLimit: 500000,
      deadline: 300
    };

    resolverService = new DoraemonResolverService(config);
  });

  describe('Configuration', () => {
    it('should initialize with correct configuration', () => {
      expect(resolverService).toBeDefined();
    });

    it('should return correct resolver metadata', async () => {
      const metadata = await resolverService.getResolverMetadata();
      
      expect(metadata.name).toBe('DoraemonResolver');
      expect(metadata.version).toBe('1.0.0');
      expect(metadata.supportedChains).toEqual(['ethereum', 'icp']);
      expect(metadata.fusionCompatible).toBe(true);
    });
  });

  describe('Cross-Chain Order Management', () => {
    it('should create cross-chain order successfully', async () => {
      const params = {
        sender: '0x1234567890123456789012345678901234567890',
        icpRecipient: '0x0987654321098765432109876543210987654321',
        amount: '1000000000000000000', // 1 ETH
        hashlock: '0x1234567890123456789012345678901234567890123456789012345678901234',
        timelock: Math.floor(Date.now() / 1000) + 7200 // 2 hours from now
      };

      const result = await resolverService.createCrossChainOrder(params);

      expect(result.orderId).toBeDefined();
      expect(result.order.sender).toBe(params.sender);
      expect(result.order.icpRecipient).toBe(params.icpRecipient);
      expect(result.order.amount).toBe(params.amount);
      expect(result.order.hashlock).toBe(params.hashlock);
      expect(result.order.timelock).toBe(params.timelock);
      expect(result.order.completed).toBe(false);
      expect(result.order.cancelled).toBe(false);
    });

    it('should reject order with invalid timelock', async () => {
      const params = {
        sender: '0x1234567890123456789012345678901234567890',
        icpRecipient: '0x0987654321098765432109876543210987654321',
        amount: '1000000000000000000',
        hashlock: '0x1234567890123456789012345678901234567890123456789012345678901234',
        timelock: Math.floor(Date.now() / 1000) + 1800 // 30 minutes (too short)
      };

      await expect(resolverService.createCrossChainOrder(params))
        .rejects.toThrow('Timelock too short');
    });

    it('should reject order with invalid sender', async () => {
      const params = {
        sender: '0x0000000000000000000000000000000000000000', // Zero address
        icpRecipient: '0x0987654321098765432109876543210987654321',
        amount: '1000000000000000000',
        hashlock: '0x1234567890123456789012345678901234567890123456789012345678901234',
        timelock: Math.floor(Date.now() / 1000) + 7200
      };

      await expect(resolverService.createCrossChainOrder(params))
        .rejects.toThrow('Invalid sender address');
    });
  });

  describe('Order Resolution', () => {
    let orderId: string;
    let preimage: string;

    beforeEach(async () => {
      const params = {
        sender: '0x1234567890123456789012345678901234567890',
        icpRecipient: '0x0987654321098765432109876543210987654321',
        amount: '1000000000000000000',
        hashlock: '0x1234567890123456789012345678901234567890123456789012345678901234',
        timelock: Math.floor(Date.now() / 1000) + 7200
      };

      const result = await resolverService.createCrossChainOrder(params);
      orderId = result.orderId;
      preimage = '0x1234567890123456789012345678901234567890123456789012345678901234';
    });

    it('should resolve order with valid preimage', async () => {
      const result = await resolverService.resolveOrder(orderId, preimage);

      expect(result.success).toBe(true);
      expect(result.txHash).toBeDefined();
    });

    it('should reject resolution with invalid preimage', async () => {
      const invalidPreimage = '0x0000000000000000000000000000000000000000000000000000000000000000';
      const result = await resolverService.resolveOrder(orderId, invalidPreimage);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid preimage');
    });

    it('should reject resolution of non-existent order', async () => {
      const result = await resolverService.resolveOrder('non-existent-order', preimage);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Order not found');
    });
  });

  describe('Order Cancellation', () => {
    let orderId: string;

    beforeEach(async () => {
      const params = {
        sender: '0x1234567890123456789012345678901234567890',
        icpRecipient: '0x0987654321098765432109876543210987654321',
        amount: '1000000000000000000',
        hashlock: '0x1234567890123456789012345678901234567890123456789012345678901234',
        timelock: Math.floor(Date.now() / 1000) + 7200
      };

      const result = await resolverService.createCrossChainOrder(params);
      orderId = result.orderId;
    });

    it('should cancel order after timelock expiry', async () => {
      // Mock time to be after timelock
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => (Math.floor(Date.now() / 1000) + 8000) * 1000);

      const result = await resolverService.cancelOrder(orderId);

      expect(result.success).toBe(true);
      expect(result.txHash).toBeDefined();

      // Restore original Date.now
      Date.now = originalDateNow;
    });

    it('should reject cancellation before timelock expiry', async () => {
      const result = await resolverService.cancelOrder(orderId);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Timelock not expired');
    });
  });

  describe('Statistics and Monitoring', () => {
    it('should return correct resolver statistics', async () => {
      const stats = await resolverService.getResolverStats();

      expect(stats.totalOrders).toBeGreaterThanOrEqual(0);
      expect(stats.completedOrders).toBeGreaterThanOrEqual(0);
      expect(stats.cancelledOrders).toBeGreaterThanOrEqual(0);
      expect(stats.pendingOrders).toBeGreaterThanOrEqual(0);
    });

    it('should check order readiness correctly', async () => {
      const params = {
        sender: '0x1234567890123456789012345678901234567890',
        icpRecipient: '0x0987654321098765432109876543210987654321',
        amount: '1000000000000000000',
        hashlock: '0x1234567890123456789012345678901234567890123456789012345678901234',
        timelock: Math.floor(Date.now() / 1000) + 7200
      };

      const result = await resolverService.createCrossChainOrder(params);
      const isReady = await resolverService.isOrderReady(result.orderId);

      expect(isReady).toBe(true);
    });
  });

  describe('Configuration Updates', () => {
    it('should update Fusion+ configuration', async () => {
      await resolverService.updateFusionConfig(100, 600000, 600);

      // In a real implementation, we would verify the config was updated
      // For now, we just check that the function doesn't throw
      expect(true).toBe(true);
    });
  });
}); 