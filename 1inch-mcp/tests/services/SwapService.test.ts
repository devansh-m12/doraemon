import { SwapService } from '../../src/services/swap/SwapService';
import { SwapQuoteRequest, TokenAllowanceRequest, ApproveTransactionRequest } from '../../src/services/swap/SwapTypes';

describe('SwapService', () => {
  let swapService: SwapService;
  const mockConfig = {
    baseUrl: 'https://api.1inch.dev',
    apiKey: 'test-api-key',
    timeout: 30000
  };

  beforeEach(() => {
    swapService = new SwapService(mockConfig);
  });

  describe('getTools', () => {
    it('should return all swap tools', () => {
      const tools = swapService.getTools();
      
      expect(tools).toHaveLength(4);
      expect(tools.map(tool => tool.name)).toEqual([
        'get_swap_quote',
        'get_swap_transaction',
        'get_token_allowance',
        'get_approve_transaction'
      ]);
    });

    it('should have correct tool schemas', () => {
      const tools = swapService.getTools();
      const swapQuoteTool = tools.find(tool => tool.name === 'get_swap_quote');
      
      expect(swapQuoteTool).toBeDefined();
      expect(swapQuoteTool?.inputSchema.type).toBe('object');
      expect(swapQuoteTool?.inputSchema.required).toEqual(['chainId', 'src', 'dst', 'amount', 'from']);
    });
  });

  describe('getResources', () => {
    it('should return swap resources', () => {
      const resources = swapService.getResources();
      
      expect(resources).toHaveLength(2);
      expect(resources.map(resource => resource.uri)).toEqual([
        '1inch://swap/documentation',
        '1inch://swap/supported-chains'
      ]);
    });
  });

  describe('getPrompts', () => {
    it('should return swap prompts', () => {
      const prompts = swapService.getPrompts();
      
      expect(prompts).toHaveLength(1);
      expect(prompts[0]?.name).toBe('swap_tokens');
    });
  });

  describe('handleToolCall', () => {
    it('should handle get_swap_quote tool call', async () => {
      const mockArgs: SwapQuoteRequest = {
        chainId: 1,
        src: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        dst: '0xA0b86a33E6E4B8b5f8c1e9d6b2a8c3e7f9d5c8a7',
        amount: '1000000000000000000',
        from: '0x1234567890123456789012345678901234567890',
        slippage: 1
      };

      // Mock the makeRequest method
      jest.spyOn(swapService as any, 'makeRequest').mockResolvedValue({
        toTokenAmount: '1000000',
        fromTokenAmount: '1000000000000000000',
        protocols: [],
        tx: {
          from: '0x1234567890123456789012345678901234567890',
          to: '0x1inch',
          data: '0x',
          value: '0',
          gas: 200000,
          gasPrice: '20000000000'
        }
      });

      const result = await swapService.handleToolCall('get_swap_quote', mockArgs);
      
      expect(result).toBeDefined();
      expect(result.toTokenAmount).toBe('1000000');
    });

    it('should handle get_token_allowance tool call', async () => {
      const mockArgs: TokenAllowanceRequest = {
        chainId: 1,
        tokenAddress: '0xA0b86a33E6E4B8b5f8c1e9d6b2a8c3e7f9d5c8a7',
        walletAddress: '0x1234567890123456789012345678901234567890'
      };

      jest.spyOn(swapService as any, 'makeRequest').mockResolvedValue({
        allowance: '1000000000000000000',
        tokenAddress: '0xA0b86a33E6E4B8b5f8c1e9d6b2a8c3e7f9d5c8a7',
        walletAddress: '0x1234567890123456789012345678901234567890'
      });

      const result = await swapService.handleToolCall('get_token_allowance', mockArgs);
      
      expect(result).toBeDefined();
      expect(result.allowance).toBe('1000000000000000000');
    });

    it('should throw error for unknown tool', async () => {
      await expect(
        swapService.handleToolCall('unknown_tool', {})
      ).rejects.toThrow('Unknown tool: unknown_tool');
    });
  });

  describe('handleResourceRead', () => {
    it('should handle swap documentation resource', async () => {
      const result = await swapService.handleResourceRead('1inch://swap/documentation');
      
      expect(result).toBeDefined();
      expect(result.contents).toHaveLength(1);
      expect(result.contents[0].mimeType).toBe('text/markdown');
      expect(result.contents[0].text).toContain('# 1inch Swap API Documentation');
    });

    it('should handle supported chains resource', async () => {
      const result = await swapService.handleResourceRead('1inch://swap/supported-chains');
      
      expect(result).toBeDefined();
      expect(result.contents).toHaveLength(1);
      expect(result.contents[0].mimeType).toBe('application/json');
      
      const data = JSON.parse(result.contents[0].text);
      expect(data.chains).toBeDefined();
      expect(data.chains.length).toBeGreaterThan(0);
    });

    it('should throw error for unknown resource', async () => {
      await expect(
        swapService.handleResourceRead('1inch://unknown/resource')
      ).rejects.toThrow('Unknown resource: 1inch://unknown/resource');
    });
  });

  describe('handlePromptRequest', () => {
    it('should handle swap_tokens prompt', async () => {
      const args = {
        from_token: 'ETH',
        to_token: 'USDC',
        amount: '1'
      };

      const result = await swapService.handlePromptRequest('swap_tokens', args);
      
      expect(result).toBeDefined();
      expect(result.description).toBe('Token swap assistant');
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].content.text).toContain('Help me swap 1 ETH to USDC');
    });

    it('should throw error for unknown prompt', async () => {
      await expect(
        swapService.handlePromptRequest('unknown_prompt', {})
      ).rejects.toThrow('Unknown prompt: unknown_prompt');
    });
  });

  describe('validation', () => {
    it('should validate required parameters for swap quote', async () => {
      const invalidArgs = {
        chainId: 1,
        src: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
        // Missing required parameters
      };

      jest.spyOn(swapService as any, 'makeRequest').mockResolvedValue({});

      await expect(
        swapService.handleToolCall('get_swap_quote', invalidArgs)
      ).rejects.toThrow('Missing required parameters: dst, amount, from');
    });
  });
}); 