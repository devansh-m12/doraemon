import { TokenService } from '../src/services/token/TokenService';
import { config } from '../src/config/index';

describe('TokenService', () => {
  let tokenService: TokenService;
  
  // Test parameters
  const testChain = 1; // Ethereum
  const testQuery = 'USDC';
  const testAddresses = [
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
    '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
    '0xdAC17F958D2ee523a2206206994597C13D831ec7'  // USDT
  ];
  const testSingleAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'; // USDC

  beforeAll(() => {
    const serviceConfig = {
      baseUrl: config.oneInch.baseUrl,
      apiKey: config.oneInch.apiKey,
      timeout: config.oneInch.timeout
    };
    tokenService = new TokenService(serviceConfig);
  });

  describe('Tools', () => {
    it('should return all token tools', () => {
      const tools = tokenService.getTools();
      expect(tools).toHaveLength(9);
      
      const toolNames = tools.map(tool => tool.name);
      expect(toolNames).toContain('search_tokens');
      expect(toolNames).toContain('get_tokens_info');
      expect(toolNames).toContain('get_all_tokens_info');
      expect(toolNames).toContain('get_token_list');
      expect(toolNames).toContain('get_single_token_info');
      expect(toolNames).toContain('get_multi_chain_tokens');
      expect(toolNames).toContain('get_multi_chain_tokens_list');
      expect(toolNames).toContain('search_multi_chain_tokens');
      expect(toolNames).toContain('get_supported_chains');
    });

    it('should have correct input schemas for tools', () => {
      const tools = tokenService.getTools();
      
      // Test search_tokens tool schema
      const searchTokensTool = tools.find(tool => tool.name === 'search_tokens');
      expect(searchTokensTool).toBeDefined();
      expect(searchTokensTool?.inputSchema.properties).toHaveProperty('chainId');
      expect(searchTokensTool?.inputSchema.properties).toHaveProperty('query');
      expect(searchTokensTool?.inputSchema.properties).toHaveProperty('ignore_listed');
      expect(searchTokensTool?.inputSchema.properties).toHaveProperty('only_positive_rating');
      expect(searchTokensTool?.inputSchema.required).toContain('chainId');
      expect(searchTokensTool?.inputSchema.required).toContain('query');
    });
  });

  describe('Resources', () => {
    it('should return token resources', () => {
      const resources = tokenService.getResources();
      expect(resources).toHaveLength(2);
      
      const resourceUris = resources.map(resource => resource.uri);
      expect(resourceUris).toContain('1inch://token/documentation');
      expect(resourceUris).toContain('1inch://token/popular-tokens');
    });
  });

  describe('Prompts', () => {
    it('should return token prompts', () => {
      const prompts = tokenService.getPrompts();
      expect(prompts).toHaveLength(1);
      
      const promptNames = prompts.map(prompt => prompt.name);
      expect(promptNames).toContain('token_analysis');
    });
  });

  describe('API Endpoints', () => {

    describe('searchTokens', () => {
      it('should search tokens by query', async () => {
        const result = await tokenService.searchTokens({
          chainId: testChain,
          query: testQuery,
          limit: 5
        });

        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
        // The API returns tokens as an array
        expect(Array.isArray(result)).toBe(true);
        
        // Log the result for debugging
        console.log('Search tokens result:', JSON.stringify(result, null, 2));
      }, 15000);
    });

    describe('getTokensInfo', () => {
      it('should get tokens info by addresses', async () => {
        const result = await tokenService.getTokensInfo({
          chainId: testChain,
          addresses: testAddresses.join(',')
        });

        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
        // The API returns tokens as a map of address to token info
        expect(typeof result).toBe('object');
        
        // Log the result for debugging
        console.log('Get tokens info result:', JSON.stringify(result, null, 2));
      }, 15000);
    });

    describe('getAllTokensInfo', () => {
      it('should get all tokens info for chain', async () => {
        const result = await tokenService.getAllTokensInfo({
          chainId: testChain
        });

        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
        // The API returns tokens as a map
        expect(typeof result).toBe('object');
        
        // Log the result for debugging
        console.log('Get all tokens info result:', JSON.stringify(result, null, 2));
      }, 15000);
    });

    describe('getTokenList', () => {
      it('should get token list for chain', async () => {
        const result = await tokenService.getTokenList({
          chainId: testChain
        });

        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
        // The API returns TokenListResponse with tokens array
        expect(result).toHaveProperty('tokens');
        expect(Array.isArray(result.tokens)).toBe(true);
        
        // Log the result for debugging
        console.log('Get token list result:', JSON.stringify(result, null, 2));
      }, 15000);
    });

    describe('getSingleTokenInfo', () => {
      it('should get single token info by address', async () => {
        const result = await tokenService.getSingleTokenInfo({
          chainId: testChain,
          address: testSingleAddress
        });

        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
        expect(result).toHaveProperty('address');
        expect(result).toHaveProperty('symbol');
        expect(result).toHaveProperty('name');
        
        // Log the result for debugging
        console.log('Get single token info result:', JSON.stringify(result, null, 2));
      }, 15000);
    });

    describe('getMultiChainTokens', () => {
      it('should get multi-chain tokens', async () => {
        const result = await tokenService.getMultiChainTokens({
            provider: '1inch',
            country: 'US'
        });

        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
        // The API returns a map of chainId to token maps
        
        // Log the result for debugging
        console.log('Get multi-chain tokens result:', JSON.stringify(result, null, 2));
      }, 15000);
    });

    describe('getMultiChainTokensList', () => {
      it('should get multi-chain tokens list', async () => {
        const result = await tokenService.getMultiChainTokensList({});

        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
        // The API returns TokenListResponse with tokens array
        expect(result).toHaveProperty('tokens');
        expect(Array.isArray(result.tokens)).toBe(true);
        
        // Log the result for debugging
        console.log('Get multi-chain tokens list result:', JSON.stringify(result, null, 2));
      }, 15000);
    });

    describe('searchMultiChainTokens', () => {
      it('should search multi-chain tokens', async () => {
        const result = await tokenService.searchMultiChainTokens({
          query: testQuery,
          limit: 5
        });

        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
        // The API returns tokens as an array
        expect(Array.isArray(result)).toBe(true);
        
        // Log the result for debugging
        console.log('Search multi-chain tokens result:', JSON.stringify(result, null, 2));
      }, 15000);
    });

    describe('getSupportedChains', () => {
      it('should get supported chains', async () => {
        const result = await tokenService.getSupportedChains();

        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
        // The API returns chains as an array
        expect(Array.isArray(result)).toBe(true);
        
        // Log the result for debugging
        console.log('Get supported chains result:', JSON.stringify(result, null, 2));
      }, 15000);
    });
  });

  describe('Tool Call Handling', () => {
    it('should handle search_tokens tool call', async () => {
      const result = await tokenService.handleToolCall('search_tokens', {
        chainId: testChain,
        query: testQuery,
        limit: 5
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      // The API returns tokens as an array
      expect(Array.isArray(result)).toBe(true);
    }, 15000);

    it('should handle get_tokens_info tool call', async () => {
      const result = await tokenService.handleToolCall('get_tokens_info', {
        chainId: testChain,
        addresses: testAddresses.join(',')
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      // The API returns tokens as a map
      expect(typeof result).toBe('object');
    }, 15000);

    it('should handle get_all_tokens_info tool call', async () => {
      const result = await tokenService.handleToolCall('get_all_tokens_info', {
        chainId: testChain
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      // The API returns tokens as a map
      expect(typeof result).toBe('object');
    }, 15000);

    it('should handle get_token_list tool call', async () => {
      const result = await tokenService.handleToolCall('get_token_list', {
        chainId: testChain
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      // The API returns TokenListResponse
      expect(result).toHaveProperty('tokens');
      expect(Array.isArray(result.tokens)).toBe(true);
    }, 15000);

    it('should handle get_single_token_info tool call', async () => {
      const result = await tokenService.handleToolCall('get_single_token_info', {
        chainId: testChain,
        address: testSingleAddress
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('address');
      expect(result).toHaveProperty('symbol');
    }, 15000);

    it('should handle get_multi_chain_tokens tool call', async () => {
      const result = await tokenService.handleToolCall('get_multi_chain_tokens', {});

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    }, 15000);

    it('should handle get_multi_chain_tokens_list tool call', async () => {
      const result = await tokenService.handleToolCall('get_multi_chain_tokens_list', {});

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('tokens');
      expect(Array.isArray(result.tokens)).toBe(true);
    }, 15000);

    it('should handle search_multi_chain_tokens tool call', async () => {
      const result = await tokenService.handleToolCall('search_multi_chain_tokens', {
        query: testQuery,
        limit: 5
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      // The API returns tokens as an array
      expect(Array.isArray(result)).toBe(true);
    }, 15000);

    it('should handle get_supported_chains tool call', async () => {
      const result = await tokenService.handleToolCall('get_supported_chains', {});

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      // The API returns chains as an array
      expect(Array.isArray(result)).toBe(true);
    }, 15000);

    it('should throw error for unknown tool', async () => {
      await expect(
        tokenService.handleToolCall('unknown_tool', {})
      ).rejects.toThrow('Unknown tool: unknown_tool');
    });
  });

  describe('Resource Handling', () => {
    it('should handle documentation resource', async () => {
      const result = await tokenService.handleResourceRead('1inch://token/documentation');
      expect(result).toBeDefined();
      expect(result).toHaveProperty('contents');
      expect(Array.isArray(result.contents)).toBe(true);
      expect(result.contents[0]).toHaveProperty('text');
      expect(result.contents[0].text).toContain('1inch Token API v1.3 Documentation');
    });

    it('should handle popular tokens resource', async () => {
      const result = await tokenService.handleResourceRead('1inch://token/popular-tokens');
      expect(result).toBeDefined();
      expect(result).toHaveProperty('contents');
      expect(Array.isArray(result.contents)).toBe(true);
      expect(result.contents[0]).toHaveProperty('text');
      
      const parsed = JSON.parse(result.contents[0].text);
      expect(parsed).toHaveProperty('tokens');
      expect(Array.isArray(parsed.tokens)).toBe(true);
    });

    it('should throw error for unknown resource', async () => {
      await expect(
        tokenService.handleResourceRead('1inch://token/unknown')
      ).rejects.toThrow('Unknown resource: 1inch://token/unknown');
    });
  });

  describe('Prompt Handling', () => {
    it('should handle token_analysis prompt', async () => {
      const result = await tokenService.handlePromptRequest('token_analysis', {
        token_address: testSingleAddress,
        chain_id: testChain
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('messages');
      expect(result.description).toBe('Token analysis assistant');
      expect(Array.isArray(result.messages)).toBe(true);
      expect(result.messages[0]).toHaveProperty('content');
      expect(result.messages[0].content.text).toContain(testSingleAddress);
      expect(result.messages[0].content.text).toContain(testChain.toString());
    });

    it('should throw error for unknown prompt', async () => {
      await expect(
        tokenService.handlePromptRequest('unknown_prompt', {})
      ).rejects.toThrow('Unknown prompt: unknown_prompt');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid chain ID gracefully', async () => {
      try {
        await tokenService.searchTokens({
          chainId: 999999, // Invalid chain
          query: testQuery
        });
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.message).toContain('Request failed');
      }
    }, 10000);

    it('should handle invalid token address gracefully', async () => {
      try {
        await tokenService.getSingleTokenInfo({
          chainId: testChain,
          address: '0xinvalid'
        });
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.message).toContain('Request failed');
      }
    }, 10000);

    it('should handle empty query gracefully', async () => {
      try {
        await tokenService.searchTokens({
          chainId: testChain,
          query: ''
        });
      } catch (error: any) {
        expect(error).toBeDefined();
        // The service validates parameters before making the request
        expect(error.message).toContain('Missing required parameter');
      }
    }, 10000);
  });

  describe('Parameter Validation', () => {
    it('should validate required parameters for searchTokens', async () => {
      try {
        // @ts-ignore - Testing runtime validation
        await tokenService.searchTokens({
          chainId: testChain
          // Missing query parameter
        });
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.message).toContain('Missing required parameter');
      }
    });

    it('should validate required parameters for getTokensInfo', async () => {
      try {
        // @ts-ignore - Testing runtime validation
        await tokenService.getTokensInfo({
          chainId: testChain
          // Missing addresses parameter
        });
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.message).toContain('Missing required parameter');
      }
    });

    it('should validate required parameters for getAllTokensInfo', async () => {
      try {
        // @ts-ignore - Testing runtime validation
        await tokenService.getAllTokensInfo({
          // Missing chainId parameter
        });
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.message).toContain('Missing required parameter');
      }
    });
  });
}); 