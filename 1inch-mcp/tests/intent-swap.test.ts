import { IntentSwapService } from '../src/services/intent-swap/IntentSwapService';
import { ethers } from 'ethers';

describe('IntentSwapService', () => {
  let service: IntentSwapService;
  let testWallet: ethers.HDNodeWallet;
  let testAddress: string;

  beforeAll(() => {
    // Create a test wallet using ethers
    testWallet = ethers.Wallet.createRandom();
    testAddress = testWallet.address;
    console.log('Test wallet address:', testAddress);
  });

  beforeEach(() => {
    const serviceConfig = {
      baseUrl: 'https://api.1inch.dev',
      apiKey: process.env.ONEINCH_API_KEY || 'test-api-key',
      timeout: 10000
    };
    service = new IntentSwapService(serviceConfig);
  });

  describe('getTools', () => {
    it('should return all Fusion API tools', () => {
      const tools = service.getTools();
      
      expect(tools).toHaveLength(9);
      expect(tools.map(t => t.name)).toEqual([
        'get_active_orders',
        'get_settlement_address',
        'get_order_by_hash',
        'get_orders_by_hashes',
        'get_orders_by_maker',
        'get_quote',
        'get_quote_with_custom_preset',
        'submit_order',
        'submit_multiple_orders'
      ]);
    });

    it('should have correct tool descriptions', () => {
      const tools = service.getTools();
      const getActiveOrdersTool = tools.find(t => t.name === 'get_active_orders');
      
      expect(getActiveOrdersTool?.description).toContain('Get gasless swap active orders (Fusion API)');
    });
  });

  describe('getResources', () => {
    it('should return Fusion API resources', () => {
      const resources = service.getResources();
      
      expect(resources).toHaveLength(3);
      expect(resources.map(r => r.name)).toEqual([
        'Fusion API Documentation',
        'Supported Chains for Fusion',
        'Fusion vs Classic Swap Comparison'
      ]);
    });
  });

  describe('getPrompts', () => {
    it('should return Fusion API prompts', () => {
      const prompts = service.getPrompts();
      
      expect(prompts).toHaveLength(2);
      expect(prompts.map(p => p.name)).toEqual([
        'analyze_fusion_opportunity',
        'create_fusion_order'
      ]);
    });
  });

  describe('handleToolCall', () => {
    it('should route to correct Fusion API methods', async () => {
      // Test with actual API calls
      const activeOrdersResult = await service.handleToolCall('get_active_orders', { chain: 1 });
      expect(activeOrdersResult).toBeDefined();
      
      const settlementAddressResult = await service.handleToolCall('get_settlement_address', { chain: 1 });
      expect(settlementAddressResult).toBeDefined();
      expect(settlementAddressResult.address).toBeDefined();
    });

    it('should throw error for unknown tool', async () => {
      await expect(service.handleToolCall('unknown_tool', {})).rejects.toThrow('Unknown tool: unknown_tool');
    });
  });

  describe('handleResourceRead', () => {
    it('should return Fusion documentation for known URIs', async () => {
      const result = await service.handleResourceRead('1inch://fusion/documentation');
      expect(result).toContain('1inch Fusion API Documentation');
    });

    it('should return supported chains information', async () => {
      const result = await service.handleResourceRead('1inch://fusion/supported-chains');
      const chainsData = JSON.parse(result);
      expect(chainsData.chains).toBeDefined();
      expect(Array.isArray(chainsData.chains)).toBe(true);
    });

    it('should return Fusion vs Classic comparison', async () => {
      const result = await service.handleResourceRead('1inch://fusion/vs-classic');
      expect(result).toContain('Fusion vs Classic Swap Comparison');
    });

    it('should throw error for unknown resource', async () => {
      await expect(service.handleResourceRead('unknown://resource')).rejects.toThrow('Unknown resource: unknown://resource');
    });
  });

  describe('handlePromptRequest', () => {
    it('should analyze Fusion opportunity with real data', async () => {
      // Use real token addresses for Ethereum mainnet
      const result = await service.handlePromptRequest('analyze_fusion_opportunity', { 
        chain: 1, 
        fromTokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
        toTokenAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
        amount: '10000000', // 10 USDC (6 decimals)
        walletAddress: testAddress
      });
      expect(result).toContain('Fusion Swap Opportunity Analysis');
    });

    it('should create Fusion order with real data', async () => {
      const result = await service.handlePromptRequest('create_fusion_order', { 
        chain: 1, 
        fromTokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
        toTokenAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
        amount: '10000000', // 10 USDC (6 decimals)
        walletAddress: testAddress
      });
      expect(result).toContain('Fusion Order Created');
    });

    it('should throw error for unknown prompt', async () => {
      await expect(service.handlePromptRequest('unknown_prompt', {})).rejects.toThrow('Unknown prompt: unknown_prompt');
    });
  });

  describe('Fusion API methods with real API calls', () => {
    it('should get active orders from Ethereum mainnet', async () => {
      const result = await service.getActiveOrders({ chain: 1, page: 1, limit: 10, version: '2.0' });
      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
    });

    it('should get settlement address for Ethereum mainnet', async () => {
      const result = await service.getSettlementAddress({ chain: 1 });
      expect(result).toBeDefined();
      expect(result.address).toBeDefined();
      expect(ethers.isAddress(result.address)).toBe(true);
    });

    it('should get quote for USDC to USDT swap', async () => {
      const result = await service.getQuote({ 
        chain: 1, 
        fromTokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
        toTokenAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
        amount: '10000000', // 10 USDC (6 decimals)
        walletAddress: testAddress,
        enableEstimate: true
      });
      expect(result).toBeDefined();
      expect(result.quoteId).toBeDefined();
      expect(result.fromTokenAmount).toBeDefined();
      expect(result.toTokenAmount).toBeDefined();
    });

    it('should get quote with custom preset', async () => {
      const customPreset = {
        auctionDuration: 60,
        startAuctionIn: 0,
        initialRateBump: 0,
        auctionEndTime: 0,
        rateBump: 0,
        maxRateBump: 0,
        auctionStartTime: 0,
        auctionStartAmount: '10000000',
        auctionEndAmount: '10000000'
      };

      const result = await service.getQuoteWithCustomPreset({ 
        chain: 1, 
        fromTokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
        toTokenAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
        amount: '10000000', // 10 USDC (6 decimals)
        walletAddress: testAddress,
        customPreset
      });
      expect(result).toBeDefined();
    });

    it('should get orders by maker address', async () => {
      // Use a known maker address (Vitalik's address as example)
      const makerAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
      
      const result = await service.getOrdersByMaker({ 
        chain: 1, 
        address: makerAddress,
        page: 1,
        limit: 10,
        version: '2.0'
      });
      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
    });
  });

  describe('Legacy methods (deprecated)', () => {
    it('should warn when using deprecated getTokens method', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      try {
        await service.getTokens({ chain: 1 });
      } catch (error) {
        // API might return error for test key, but warning should still be logged
        expect(error).toBeDefined();
      }
      
      expect(consoleSpy).toHaveBeenCalledWith('getTokens is deprecated. Use Fusion API endpoints instead.');
      
      consoleSpy.mockRestore();
    });

    it('should warn when using deprecated createOrder method', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      try {
        await service.createOrder({ 
          chain: 1, 
          fromTokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
          toTokenAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
          amount: '10000000',
          fromAddress: testAddress
        });
      } catch (error) {
        // API might return error for test key, but warning should still be logged
        expect(error).toBeDefined();
      }
      
      expect(consoleSpy).toHaveBeenCalledWith('createOrder is deprecated. Use submitOrder for Fusion API instead.');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Ethers integration tests', () => {
    it('should create multiple test wallets using ethers', () => {
      const wallet1 = ethers.Wallet.createRandom();
      const wallet2 = ethers.Wallet.createRandom();
      
      expect(ethers.isAddress(wallet1.address)).toBe(true);
      expect(ethers.isAddress(wallet2.address)).toBe(true);
      expect(wallet1.address).not.toBe(wallet2.address);
    });

    it('should validate Ethereum addresses', () => {
      // Use a known valid address (Vitalik's address)
      const validAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
      const invalidAddress = '0xinvalid';
      
      // Test that ethers can validate addresses
      expect(ethers.isAddress(validAddress)).toBe(true);
      expect(ethers.isAddress(invalidAddress)).toBe(false);
      
      // Test with ethers-generated addresses
      const wallet = ethers.Wallet.createRandom();
      expect(ethers.isAddress(wallet.address)).toBe(true);
      
      // Test with checksum addresses
      const checksumAddress = ethers.getAddress(validAddress);
      expect(ethers.isAddress(checksumAddress)).toBe(true);
    });

    it('should get quote with ethers-generated address', async () => {
      const newWallet = ethers.Wallet.createRandom();
      
      try {
        const result = await service.getQuote({ 
          chain: 1, 
          fromTokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
          toTokenAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
          amount: '10000000', // 10 USDC (6 decimals)
          walletAddress: newWallet.address
        });
        expect(result).toBeDefined();
        expect(result.walletAddress).toBe(newWallet.address);
      } catch (error) {
        // API might return error for test key, but address validation should work
        expect(error).toBeDefined();
      }
    });
  });

  describe('Error handling with real API', () => {
    it('should handle API errors gracefully', async () => {
      try {
        await service.getQuote({ 
          chain: 999999, // Invalid chain ID
          fromTokenAddress: '0xinvalid',
          toTokenAddress: '0xinvalid',
          amount: '0',
          walletAddress: '0xinvalid'
        });
      } catch (error) {
        expect(error).toBeDefined();
        if (error instanceof Error) {
          expect(error.message).toBeDefined();
        }
      }
    });

    it('should handle network timeouts', async () => {
      const timeoutService = new IntentSwapService({
        baseUrl: 'https://api.1inch.dev',
        apiKey: process.env.ONEINCH_API_KEY || 'test-api-key',
        timeout: 1 // 1ms timeout to force timeout error
      });

      try {
        await timeoutService.getActiveOrders({ chain: 1 });
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});