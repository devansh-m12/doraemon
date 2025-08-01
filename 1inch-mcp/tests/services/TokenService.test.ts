import { TokenService } from '../../src/services/token/TokenService';
import { TokenInfoRequest, TokenSearchRequest, TokenPriceRequest, TokenBalanceRequest } from '../../src/services/token/TokenTypes';

describe('TokenService', () => {
  let tokenService: TokenService;
  const mockConfig = {
    baseUrl: 'https://api.1inch.dev',
    apiKey: process.env.ONEINCH_API_KEY || '',
    timeout: 30000
  };

  beforeEach(() => {
    tokenService = new TokenService(mockConfig);
  });

  describe('getTools', () => {
    it('should return all token tools', () => {
      const tools = tokenService.getTools();
      
      expect(tools).toHaveLength(4);
      expect(tools.map(tool => tool.name)).toEqual([
        'get_token_info',
        'search_tokens',
        'get_token_price',
        'get_token_balances'
      ]);
    });

    it('should have correct tool schemas', () => {
      const tools = tokenService.getTools();
      const tokenInfoTool = tools.find(tool => tool.name === 'get_token_info');
      
      expect(tokenInfoTool).toBeDefined();
      expect(tokenInfoTool?.inputSchema.type).toBe('object');
      expect(tokenInfoTool?.inputSchema.required).toEqual(['chainId', 'tokenAddress']);
    });
  });

  describe('getResources', () => {
    it('should return token resources', () => {
      const resources = tokenService.getResources();
      
      expect(resources).toHaveLength(2);
      expect(resources.map(resource => resource.uri)).toEqual([
        '1inch://token/documentation',
        '1inch://token/popular-tokens'
      ]);
    });
  });

  describe('getPrompts', () => {
    it('should return token prompts', () => {
      const prompts = tokenService.getPrompts();
      
      expect(prompts).toHaveLength(1);
      expect(prompts[0]?.name).toBe('token_analysis');
    });
  });

  describe('handleToolCall', () => {
    it('should handle get_token_info tool call', async () => {
      const mockArgs: TokenInfoRequest = {
        chainId: 1,
        tokenAddress: '0xA0b86a33E6E4B8b5f8c1e9d6b2a8c3e7f9d5c8a7'
      };

      jest.spyOn(tokenService as any, 'makeRequest').mockResolvedValue({
        address: '0xA0b86a33E6E4B8b5f8c1e9d6b2a8c3e7f9d5c8a7',
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        logoURI: 'https://example.com/usdc.png'
      });

      const result = await tokenService.handleToolCall('get_token_info', mockArgs);
      
      expect(result).toBeDefined();
      expect(result.symbol).toBe('USDC');
      expect(result.name).toBe('USD Coin');
    });

    it('should handle search_tokens tool call', async () => {
      const mockArgs: TokenSearchRequest = {
        chainId: 1,
        query: 'USDC',
        limit: 5
      };

      jest.spyOn(tokenService as any, 'makeRequest').mockResolvedValue({
        tokens: [
          {
            address: '0xA0b86a33E6E4B8b5f8c1e9d6b2a8c3e7f9d5c8a7',
            symbol: 'USDC',
            name: 'USD Coin',
            decimals: 6
          }
        ]
      });

      const result = await tokenService.handleToolCall('search_tokens', mockArgs);
      
      expect(result).toBeDefined();
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].symbol).toBe('USDC');
    });

    it('should handle get_token_price tool call', async () => {
      const mockArgs: TokenPriceRequest = {
        chainId: 1,
        tokenAddress: '0xA0b86a33E6E4B8b5f8c1e9d6b2a8c3e7f9d5c8a7',
        currency: 'USD'
      };

      jest.spyOn(tokenService as any, 'makeRequest').mockResolvedValue({
        price: '1.00',
        currency: 'USD',
        timestamp: 1640995200000
      });

      const result = await tokenService.handleToolCall('get_token_price', mockArgs);
      
      expect(result).toBeDefined();
      expect(result.price).toBe('1.00');
      expect(result.currency).toBe('USD');
    });

    it('should handle get_token_balances tool call', async () => {
      const mockArgs: TokenBalanceRequest = {
        chainId: 1,
        address: '0x1234567890123456789012345678901234567890'
      };

      jest.spyOn(tokenService as any, 'makeRequest').mockResolvedValue({
        tokens: [
          {
            address: '0xA0b86a33E6E4B8b5f8c1e9d6b2a8c3e7f9d5c8a7',
            symbol: 'USDC',
            name: 'USD Coin',
            decimals: 6,
            balance: '1000000',
            value: '1.00',
            price: '1.00'
          }
        ]
      });

      const result = await tokenService.handleToolCall('get_token_balances', mockArgs);
      
      expect(result).toBeDefined();
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].symbol).toBe('USDC');
    });

    it('should throw error for unknown tool', async () => {
      await expect(
        tokenService.handleToolCall('unknown_tool', {})
      ).rejects.toThrow('Unknown tool: unknown_tool');
    });
  });

  describe('handleResourceRead', () => {
    it('should handle token documentation resource', async () => {
      const result = await tokenService.handleResourceRead('1inch://token/documentation');
      
      expect(result).toBeDefined();
      expect(result.contents).toHaveLength(1);
      expect(result.contents[0].mimeType).toBe('text/markdown');
      expect(result.contents[0].text).toContain('# 1inch Token API Documentation');
    });

    it('should handle popular tokens resource', async () => {
      const result = await tokenService.handleResourceRead('1inch://token/popular-tokens');
      
      expect(result).toBeDefined();
      expect(result.contents).toHaveLength(1);
      expect(result.contents[0].mimeType).toBe('application/json');
      
      const data = JSON.parse(result.contents[0].text);
      expect(data.tokens).toBeDefined();
      expect(data.tokens.length).toBeGreaterThan(0);
      expect(data.tokens[0].symbol).toBe('ETH');
    });

    it('should throw error for unknown resource', async () => {
      await expect(
        tokenService.handleResourceRead('1inch://unknown/resource')
      ).rejects.toThrow('Unknown resource: 1inch://unknown/resource');
    });
  });

  describe('handlePromptRequest', () => {
    it('should handle token_analysis prompt', async () => {
      const args = {
        token_address: '0xA0b86a33E6E4B8b5f8c1e9d6b2a8c3e7f9d5c8a7',
        chain_id: 1
      };

      const result = await tokenService.handlePromptRequest('token_analysis', args);
      
      expect(result).toBeDefined();
      expect(result.description).toBe('Token analysis assistant');
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].content.text).toContain('Analyze the token');
    });

    it('should throw error for unknown prompt', async () => {
      await expect(
        tokenService.handlePromptRequest('unknown_prompt', {})
      ).rejects.toThrow('Unknown prompt: unknown_prompt');
    });
  });

  describe('validation', () => {
    it('should validate required parameters for token info', async () => {
      const invalidArgs = {
        chainId: 1
        // Missing tokenAddress
      };

      jest.spyOn(tokenService as any, 'makeRequest').mockResolvedValue({});

      await expect(
        tokenService.handleToolCall('get_token_info', invalidArgs)
      ).rejects.toThrow('Missing required parameters: tokenAddress');
    });

    it('should validate required parameters for token search', async () => {
      const invalidArgs = {
        chainId: 1
        // Missing query
      };

      jest.spyOn(tokenService as any, 'makeRequest').mockResolvedValue({});

      await expect(
        tokenService.handleToolCall('search_tokens', invalidArgs)
      ).rejects.toThrow('Missing required parameters: query');
    });
  });
}); 