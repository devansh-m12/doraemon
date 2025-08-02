import { BalanceService } from '../src/services/balance/BalanceService';
import { config } from '../src/config/index';
import { describe, it, beforeEach, expect, jest, beforeAll } from '@jest/globals';

describe('BalanceService', () => {
  let balanceService: BalanceService;
  
  // Updated test wallet - newly generated for testing
  const testChain = 1; // Ethereum
  const testWallet = '0x0E062D7dd6353B9ECB80aC9d41e94DAc670a69Fd'; // New test wallet
  const testSpender = '0x1111111254fb6c44bAC0beD2854e76F90643097d'; // 1inch Router
  const testTokens = [
    '0xA0b86a33E6441b8C4C3C4C4C4C4C4C4C4C4C4C4C', // Test token 1
    '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'  // USDC
  ];

  beforeAll(() => {
    const serviceConfig = {
      baseUrl: config.oneInch.baseUrl,
      apiKey: config.oneInch.apiKey,
      timeout: config.oneInch.timeout
    };
    balanceService = new BalanceService(serviceConfig);
  });

  describe('Tools', () => {
    it('should return all balance tools', () => {
      const tools = balanceService.getTools();
      expect(tools).toHaveLength(8);
      
      const toolNames = tools.map(tool => tool.name);
      expect(toolNames).toContain('get_aggregated_balances_and_allowances');
      expect(toolNames).toContain('get_wallet_balances');
      expect(toolNames).toContain('get_custom_tokens_balances');
      expect(toolNames).toContain('get_aggregated_custom_tokens_balances');
      expect(toolNames).toContain('get_balances_and_allowances');
      expect(toolNames).toContain('get_custom_tokens_balances_and_allowances');
      expect(toolNames).toContain('get_allowances');
      expect(toolNames).toContain('get_custom_tokens_allowances');
    });

    it('should have correct input schemas for tools', () => {
      const tools = balanceService.getTools();
      
      // Test get_wallet_balances tool schema
      const walletBalancesTool = tools.find(tool => tool.name === 'get_wallet_balances');
      expect(walletBalancesTool).toBeDefined();
      expect(walletBalancesTool?.inputSchema.properties).toHaveProperty('chain');
      expect(walletBalancesTool?.inputSchema.properties).toHaveProperty('walletAddress');
      expect(walletBalancesTool?.inputSchema.required).toContain('chain');
      expect(walletBalancesTool?.inputSchema.required).toContain('walletAddress');
    });
  });

  describe('Resources', () => {
    it('should return balance resources', () => {
      const resources = balanceService.getResources();
      expect(resources).toHaveLength(2);
      
      const resourceUris = resources.map(resource => resource.uri);
      expect(resourceUris).toContain('1inch://balance/documentation');
      expect(resourceUris).toContain('1inch://balance/supported-chains');
    });
  });

  describe('Prompts', () => {
    it('should return balance prompts', () => {
      const prompts = balanceService.getPrompts();
      expect(prompts).toHaveLength(1);
      
      const promptNames = prompts.map(prompt => prompt.name);
      expect(promptNames).toContain('analyze_wallet_portfolio');
    });
  });

  describe('API Endpoints', () => {

    describe('getWalletBalances', () => {
      it('should get wallet balances for new test wallet', async () => {
        const result = await balanceService.getWalletBalances({
          chain: testChain,
          walletAddress: testWallet
        });

        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
        
        // Log the result for debugging
        console.log('Wallet balances result:', JSON.stringify(result, null, 2));
      }, 15000);
    });

    describe('getCustomTokensBalances', () => {
      it('should get custom tokens balances for new test wallet', async () => {
        const result = await balanceService.getCustomTokensBalances({
          chain: testChain,
          walletAddress: testWallet,
          customTokens: testTokens
        });

        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
        
        // Log the result for debugging
        console.log('Custom tokens balances result:', JSON.stringify(result, null, 2));
      }, 15000);
    });

    describe('getBalancesAndAllowances', () => {
      it('should get balances and allowances for new test wallet', async () => {
        const result = await balanceService.getBalancesAndAllowances({
          chain: testChain,
          spender: testSpender,
          walletAddress: testWallet
        });

        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
        
        // Log the result for debugging
        console.log('Balances and allowances result:', JSON.stringify(result, null, 2));
      }, 15000);
    });

    describe('getAllowances', () => {
      it('should get allowances for new test wallet', async () => {
        const result = await balanceService.getAllowances({
          chain: testChain,
          spender: testSpender,
          walletAddress: testWallet
        });

        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
        
        // Log the result for debugging
        console.log('Allowances result:', JSON.stringify(result, null, 2));
      }, 15000);
    });

    describe('getAggregatedBalancesAndAllowances', () => {
      it('should get aggregated balances and allowances for multiple wallets', async () => {
        const result = await balanceService.getAggregatedBalancesAndAllowances({
          chain: testChain,
          spender: testSpender,
          wallets: [testWallet],
          filterEmpty: false
        });

        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
        
        // Log the result for debugging
        console.log('Aggregated balances and allowances result:', JSON.stringify(result, null, 2));
      }, 15000);
    });

    describe('getAggregatedCustomTokensBalances', () => {
      it('should get aggregated custom tokens balances for multiple wallets', async () => {
        const result = await balanceService.getAggregatedCustomTokensBalances({
          chain: testChain,
          wallets: [testWallet],
          customTokens: testTokens
        });

        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
        
        // Log the result for debugging
        console.log('Aggregated custom tokens balances result:', JSON.stringify(result, null, 2));
      }, 15000);
    });

    describe('getCustomTokensBalancesAndAllowances', () => {
      it('should get custom tokens balances and allowances for new test wallet', async () => {
        const result = await balanceService.getCustomTokensBalancesAndAllowances({
          chain: testChain,
          spender: testSpender,
          walletAddress: testWallet,
          customTokens: testTokens
        });

        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
        
        // Log the result for debugging
        console.log('Custom tokens balances and allowances result:', JSON.stringify(result, null, 2));
      }, 15000);
    });

    describe('getCustomTokensAllowances', () => {
      it('should get custom tokens allowances for new test wallet', async () => {
        const result = await balanceService.getCustomTokensAllowances({
          chain: testChain,
          spender: testSpender,
          walletAddress: testWallet,
          customTokens: testTokens
        });

        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
        
        // Log the result for debugging
        console.log('Custom tokens allowances result:', JSON.stringify(result, null, 2));
      }, 15000);
    });
  });

  describe('Tool Call Handling', () => {
    it('should handle get_wallet_balances tool call with new test wallet', async () => {
      const result = await balanceService.handleToolCall('get_wallet_balances', {
        chain: testChain,
        walletAddress: testWallet
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    }, 15000);

    it('should throw error for unknown tool', async () => {
      await expect(
        balanceService.handleToolCall('unknown_tool', {})
      ).rejects.toThrow('Unknown tool: unknown_tool');
    });
  });

  describe('Resource Handling', () => {
    it('should handle documentation resource', async () => {
      const result = await balanceService.handleResourceRead('1inch://balance/documentation');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('1inch Balance API Documentation');
    });

    it('should handle supported chains resource', async () => {
      const result = await balanceService.handleResourceRead('1inch://balance/supported-chains');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      
      const parsed = JSON.parse(result);
      expect(parsed).toHaveProperty('chains');
      expect(Array.isArray(parsed.chains)).toBe(true);
    });

    it('should throw error for unknown resource', async () => {
      await expect(
        balanceService.handleResourceRead('1inch://balance/unknown')
      ).rejects.toThrow('Unknown resource: 1inch://balance/unknown');
    });
  });

  describe('Prompt Handling', () => {
    it('should handle analyze_wallet_portfolio prompt with new test wallet', async () => {
      const result = await balanceService.handlePromptRequest('analyze_wallet_portfolio', {
        chain: testChain,
        walletAddress: testWallet
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('Wallet Portfolio Analysis');
      expect(result).toContain(testWallet);
    }, 20000);

    it('should handle analyze_wallet_portfolio prompt with spender', async () => {
      const result = await balanceService.handlePromptRequest('analyze_wallet_portfolio', {
        chain: testChain,
        walletAddress: testWallet,
        spender: testSpender
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('Wallet Portfolio Analysis');
      expect(result).toContain(testWallet);
      expect(result).toContain(testSpender);
    }, 20000);

    it('should throw error for unknown prompt', async () => {
      await expect(
        balanceService.handlePromptRequest('unknown_prompt', {})
      ).rejects.toThrow('Unknown prompt: unknown_prompt');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid wallet address gracefully', async () => {
      try {
        await balanceService.getWalletBalances({
          chain: testChain,
          walletAddress: '0xinvalid'
        });
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.message).toContain('Request failed');
      }
    }, 10000);

    it('should handle invalid chain ID gracefully', async () => {
      try {
        await balanceService.getWalletBalances({
          chain: 999999, // Invalid chain
          walletAddress: testWallet
        });
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.message).toContain('Request failed');
      }
    }, 10000);
  });
}); 