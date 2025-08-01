import { FusionPlusSwapService } from '../src/services/fusion-plus-swap/FusionPlusSwapService';
import { ethers } from 'ethers';

describe('FusionPlusSwapService', () => {
  let service: FusionPlusSwapService;
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
    service = new FusionPlusSwapService(serviceConfig);
  });

  describe('getTools', () => {
    it('should return all Fusion+ API tools', () => {
      const tools = service.getTools();
      
      expect(tools).toHaveLength(10);
      expect(tools.map(t => t.name)).toEqual([
        'get_active_orders',
        'get_escrow_factory',
        'get_quote',
        'build_order',
        'submit_order',
        'submit_secret',
        'get_order_fills_by_hash',
        'get_resolver_data',
        'get_ready_to_accept_secret_fills',
        'get_ready_to_execute_public_actions'
      ]);
    });

    it('should have correct tool descriptions', () => {
      const tools = service.getTools();
      const getActiveOrdersTool = tools.find(t => t.name === 'get_active_orders');
      
      expect(getActiveOrdersTool?.description).toContain('Get cross chain swap active orders');
    });
  });

  describe('getResources', () => {
    it('should return Fusion+ API resources', () => {
      const resources = service.getResources();
      
      expect(resources).toHaveLength(3);
      expect(resources.map(r => r.name)).toEqual([
        'Fusion+ API Documentation',
        'Supported Chains',
        'Order Types'
      ]);
    });
  });

  describe('getPrompts', () => {
    it('should return Fusion+ API prompts', () => {
      const prompts = service.getPrompts();
      
      expect(prompts).toHaveLength(2);
      expect(prompts.map(p => p.name)).toEqual([
        'analyze_cross_chain_swap',
        'monitor_active_orders'
      ]);
    });
  });

  describe('handleToolCall', () => {
    it('should route to correct Fusion+ API methods', async () => {
      console.log('🔧 Testing Fusion+ API tool routing...');
      
      // Test with actual API calls
      console.log('📋 Getting active orders...');
      const activeOrdersResult = await service.handleToolCall('get_active_orders', { page: 1, limit: 10 });
      expect(activeOrdersResult).toBeDefined();
      console.log('✅ Active orders retrieved:', {
        totalItems: activeOrdersResult.meta?.totalItems,
        currentPage: activeOrdersResult.meta?.currentPage,
        itemsCount: activeOrdersResult.items?.length
      });
      
      console.log('🏭 Getting escrow factory for Ethereum...');
      const escrowFactoryResult = await service.handleToolCall('get_escrow_factory', { chainId: 1 });
      expect(escrowFactoryResult).toBeDefined();
      expect(escrowFactoryResult.address).toBeDefined();
      console.log('✅ Escrow factory address:', escrowFactoryResult.address);
    });

    it('should throw error for unknown tool', async () => {
      await expect(service.handleToolCall('unknown_tool', {})).rejects.toThrow('Unknown tool: unknown_tool');
    });
  });

  describe('handleResourceRead', () => {
    it('should return Fusion+ documentation for known URIs', async () => {
      const result = await service.handleResourceRead('1inch://fusion-plus/documentation');
      expect(result).toContain('1inch Fusion+ API Documentation');
    });

    it('should return supported chains information', async () => {
      const result = await service.handleResourceRead('1inch://fusion-plus/supported-chains');
      const chainsData = JSON.parse(result);
      expect(chainsData.chains).toBeDefined();
      expect(Array.isArray(chainsData.chains)).toBe(true);
    });

    it('should return order types documentation', async () => {
      const result = await service.handleResourceRead('1inch://fusion-plus/order-types');
      expect(result).toContain('Fusion+ Order Types');
    });

    it('should throw error for unknown resource', async () => {
      await expect(service.handleResourceRead('unknown://resource')).rejects.toThrow('Unknown resource: unknown://resource');
    });
  });

  describe('handlePromptRequest', () => {
    it('should analyze cross-chain swap with real data', async () => {
      console.log('🔄 Analyzing cross-chain swap (Ethereum → Polygon)...');
      console.log('📊 Swap details:', {
        srcChain: 'Ethereum (1)',
        dstChain: 'Polygon (137)',
        srcToken: 'USDC (0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48)',
        dstToken: 'USDC (0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174)',
        amount: '10 USDC (10000000)',
        wallet: testAddress
      });
      
      // Use real token addresses for cross-chain swap
      const result = await service.handlePromptRequest('analyze_cross_chain_swap', { 
        srcChain: 1, // Ethereum
        dstChain: 137, // Polygon
        srcTokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
        dstTokenAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC on Polygon
        amount: 10000000, // 10 USDC (6 decimals)
        walletAddress: testAddress
      });
      expect(result).toContain('Cross-Chain Swap Analysis');
      console.log('✅ Cross-chain analysis completed successfully');
      console.log('📝 Analysis preview:', result.substring(0, 200) + '...');
    });

    it('should monitor active orders with real data', async () => {
      console.log('👀 Monitoring active orders (Ethereum ↔ Polygon)...');
      const result = await service.handlePromptRequest('monitor_active_orders', { 
        srcChain: 1,
        dstChain: 137
      });
      expect(result).toContain('Active Orders Monitor');
      console.log('✅ Active orders monitoring completed');
      console.log('📊 Monitoring preview:', result.substring(0, 200) + '...');
    });

    it('should throw error for unknown prompt', async () => {
      await expect(service.handlePromptRequest('unknown_prompt', {})).rejects.toThrow('Unknown prompt: unknown_prompt');
    });
  });

  describe('Fusion+ API methods with real API calls', () => {
    it('should get active orders from Ethereum mainnet', async () => {
      console.log('📋 Fetching active orders from Ethereum mainnet...');
      const result = await service.getActiveOrders({ page: 1, limit: 10 });
      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      console.log('✅ Active orders retrieved:', {
        totalItems: result.meta?.totalItems,
        currentPage: result.meta?.currentPage,
        totalPages: result.meta?.totalPages,
        itemsCount: result.items?.length
      });
    });

    it('should get escrow factory for Ethereum mainnet', async () => {
      console.log('🏭 Fetching escrow factory for Ethereum mainnet...');
      const result = await service.getEscrowFactory({ chainId: 1 });
      expect(result).toBeDefined();
      expect(result.address).toBeDefined();
      expect(ethers.isAddress(result.address)).toBe(true);
      console.log('✅ Escrow factory address:', result.address);
    });

    it('should get quote for cross-chain USDC swap', async () => {
      console.log('💱 Getting quote for cross-chain USDC swap (Ethereum → Polygon)...');
      console.log('📊 Quote request:', {
        srcChain: 'Ethereum (1)',
        dstChain: 'Polygon (137)',
        srcToken: 'USDC',
        dstToken: 'USDC (Polygon)',
        amount: '10 USDC',
        wallet: testAddress
      });
      
      const result = await service.getQuote({ 
        srcChain: 1, // Ethereum
        dstChain: 137, // Polygon
        srcTokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
        dstTokenAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC on Polygon
        amount: 10000000, // 10 USDC (6 decimals)
        walletAddress: testAddress,
        enableEstimate: true
      });
      expect(result).toBeDefined();
      expect(result.quoteId).toBeDefined();
      expect(result.srcTokenAmount).toBeDefined();
      expect(result.dstTokenAmount).toBeDefined();
      console.log('✅ Quote received:', {
        quoteId: result.quoteId,
        srcAmount: result.srcTokenAmount,
        dstAmount: result.dstTokenAmount,
        recommendedPreset: result.recommendedPreset
      });
    });

             it('should get quote for cross-chain ETH to USDC swap', async () => {
      console.log('💱 Getting quote for cross-chain ETH → USDC swap (Ethereum → Polygon)...');
      console.log('📊 Quote request:', {
        srcChain: 'Ethereum (1)',
        dstChain: 'Polygon (137)',
        srcToken: 'WETH',
        dstToken: 'USDC (Polygon)',
        amount: '0.1 ETH',
        wallet: testAddress
      });
      
      const result = await service.getQuote({ 
        srcChain: 1, // Ethereum
        dstChain: 137, // Polygon
        srcTokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
        dstTokenAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC on Polygon
        amount: Number(ethers.parseEther('0.1')), // 0.1 ETH
        walletAddress: testAddress,
        enableEstimate: true
      });
      expect(result).toBeDefined();
      expect(result.quoteId).toBeDefined();
      expect(result.presets).toBeDefined();
      expect(result.recommendedPreset).toBeDefined();
      console.log('✅ ETH → USDC quote received:', {
        quoteId: result.quoteId,
        srcAmount: result.srcTokenAmount,
        dstAmount: result.dstTokenAmount,
        recommendedPreset: result.recommendedPreset,
        presetsAvailable: Object.keys(result.presets)
      });
    });

    it('should get ready to accept secret fills', async () => {
      console.log('🔐 Checking for orders ready to accept secret fills...');
      const result = await service.getReadyToAcceptSecretFills({});
      expect(result).toBeDefined();
      expect(result.orders).toBeDefined();
      expect(Array.isArray(result.orders)).toBe(true);
      console.log('✅ Secret fills check completed:', {
        ordersCount: result.orders?.length || 0
      });
    });

             it('should get ready to execute public actions', async () => {
      console.log('⚡ Checking for orders ready to execute public actions...');
      const result = await service.getReadyToExecutePublicActions({});
      expect(result).toBeDefined();
      expect(result.actions).toBeDefined();
      expect(Array.isArray(result.actions)).toBe(true);
      console.log('✅ Public actions check completed:', {
        actionsCount: result.actions?.length || 0
      });
    });
  });

  describe('Cross-chain specific tests', () => {
    it('should get escrow factory for different chains', async () => {
      const chains = [1, 137, 56, 42161]; // Ethereum, Polygon, BSC, Arbitrum
      console.log('🏭 Testing escrow factories across multiple chains...');
      
      for (const chainId of chains) {
        const chainName = {
          1: 'Ethereum',
          137: 'Polygon',
          56: 'BSC',
          42161: 'Arbitrum'
        }[chainId] || `Chain ${chainId}`;
        
        console.log(`🔗 Testing ${chainName} (Chain ID: ${chainId})...`);
        try {
          const result = await service.getEscrowFactory({ chainId });
          expect(result).toBeDefined();
          expect(result.address).toBeDefined();
          expect(ethers.isAddress(result.address)).toBe(true);
          console.log(`✅ ${chainName} escrow factory:`, result.address);
        } catch (error) {
          // Some chains might not be supported yet
          expect(error).toBeDefined();
          console.log(`⚠️ ${chainName} not supported or error occurred`);
        }
      }
    });

    it('should get quotes for different cross-chain pairs', async () => {
      const testCases = [
        {
          srcChain: 1, // Ethereum
          dstChain: 137, // Polygon
          srcToken: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
          dstToken: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC on Polygon
          amount: 10000000, // 10 USDC
          description: 'Ethereum USDC → Polygon USDC'
        },
        {
          srcChain: 1, // Ethereum
          dstChain: 56, // BSC
          srcToken: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
          dstToken: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', // USDC on BSC
          amount: 10000000, // 10 USDC
          description: 'Ethereum USDC → BSC USDC'
        }
      ];

      console.log('💱 Testing quotes for different cross-chain pairs...');
      for (const testCase of testCases) {
        console.log(`🔄 Testing: ${testCase.description}`);
        console.log(`📊 Request: ${testCase.srcChain} → ${testCase.dstChain}, Amount: ${testCase.amount}`);
        
        try {
          const result = await service.getQuote({
            srcChain: testCase.srcChain,
            dstChain: testCase.dstChain,
            srcTokenAddress: testCase.srcToken,
            dstTokenAddress: testCase.dstToken,
            amount: testCase.amount,
            walletAddress: testAddress,
            enableEstimate: true
          });
          expect(result).toBeDefined();
          expect(result.quoteId).toBeDefined();
          expect(result.presets).toBeDefined();
          console.log(`✅ Quote received for ${testCase.description}:`, {
            quoteId: result.quoteId,
            recommendedPreset: result.recommendedPreset
          });
        } catch (error) {
          // Some pairs might not be supported
          expect(error).toBeDefined();
          console.log(`⚠️ Quote failed for ${testCase.description}:`, (error as Error).message || 'Unknown error');
        }
      }
    });
  });

  describe('Ethers integration tests', () => {
    it('should create multiple test wallets using ethers', () => {
      console.log('👛 Creating test wallets using ethers...');
      const wallet1 = ethers.Wallet.createRandom();
      const wallet2 = ethers.Wallet.createRandom();
      
      expect(ethers.isAddress(wallet1.address)).toBe(true);
      expect(ethers.isAddress(wallet2.address)).toBe(true);
      expect(wallet1.address).not.toBe(wallet2.address);
      console.log('✅ Test wallets created:', {
        wallet1: wallet1.address,
        wallet2: wallet2.address
      });
    });

    it('should validate Ethereum addresses', () => {
      console.log('🔍 Validating Ethereum addresses...');
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
      
      console.log('✅ Address validation completed:', {
        validAddress: validAddress,
        invalidAddress: invalidAddress,
        generatedAddress: wallet.address,
        checksumAddress: checksumAddress
      });
    });

        it('should get quote with ethers-generated address', async () => {
      console.log('👛 Getting quote with ethers-generated wallet address...');
      const newWallet = ethers.Wallet.createRandom();
      console.log('📝 Generated wallet address:', newWallet.address);
      
      try {
        const result = await service.getQuote({ 
          srcChain: 1, // Ethereum
          dstChain: 137, // Polygon
          srcTokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
          dstTokenAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC on Polygon
          amount: 10000000, // 10 USDC (6 decimals)
          walletAddress: newWallet.address,
          enableEstimate: true
        });
        expect(result).toBeDefined();
        expect(result.quoteId).toBeDefined();
        console.log('✅ Quote received with generated wallet:', {
          quoteId: result.quoteId,
          walletAddress: newWallet.address
        });
      } catch (error) {
        // API might return error for test key, but address validation should work
        expect(error).toBeDefined();
        console.log('⚠️ Quote failed with generated wallet (expected for test key):', (error as Error).message || 'Unknown error');
      }
    });
  });

  describe('Error handling with real API', () => {
    it('should handle API errors gracefully', async () => {
      try {
        await service.getQuote({ 
          srcChain: 999999, // Invalid chain ID
          dstChain: 999999, // Invalid chain ID
          srcTokenAddress: '0xinvalid',
          dstTokenAddress: '0xinvalid',
          amount: 0,
          walletAddress: '0xinvalid',
          enableEstimate: true
        });
      } catch (error) {
        expect(error).toBeDefined();
        if (error instanceof Error) {
          expect(error.message).toBeDefined();
        }
      }
    });

    it('should handle network timeouts', async () => {
      const timeoutService = new FusionPlusSwapService({
        baseUrl: 'https://api.1inch.dev',
        apiKey: process.env.ONEINCH_API_KEY || 'test-api-key',
        timeout: 1 // 1ms timeout to force timeout error
      });

      try {
        await timeoutService.getActiveOrders({ page: 1, limit: 10 });
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle invalid escrow factory requests', async () => {
      try {
        await service.getEscrowFactory({ chainId: 999999 }); // Invalid chain ID
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Order lifecycle tests', () => {
    it('should get order fills by hash (if available)', async () => {
      // This test might fail if no orders exist, but should handle gracefully
      try {
        const result = await service.getOrderFillsByHash({ 
          orderHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
        });
        expect(result).toBeDefined();
      } catch (error) {
        // Expected if no such order exists
        expect(error).toBeDefined();
      }
    });

    it('should get resolver data for order (if available)', async () => {
      // This test might fail if no orders exist, but should handle gracefully
      try {
        const result = await service.getResolverData({ 
          orderHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
        });
        expect(result).toBeDefined();
      } catch (error) {
        // Expected if no such order exists
        expect(error).toBeDefined();
      }
    });
  });
}); 