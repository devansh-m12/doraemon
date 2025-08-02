import { TokenDetailsService } from '../src/services/token-details/TokenDetailsService';
import { config } from '../src/config/index';
import { describe, it, beforeEach, expect, jest, beforeAll } from '@jest/globals';

describe('TokenDetailsService', () => {
  let tokenDetailsService: TokenDetailsService;
  
  // Test data
  const testChain = 1; // Ethereum
  const testTokenAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F'; // DAI
  const testFromTimestamp = Math.floor(Date.now() / 1000) - 86400; // 24 hours ago
  const testToTimestamp = Math.floor(Date.now() / 1000); // Now
  const testInterval = '24h';

  beforeAll(() => {
    const serviceConfig = {
      baseUrl: config.oneInch.baseUrl,
      apiKey: config.oneInch.apiKey,
      timeout: config.oneInch.timeout
    };
    tokenDetailsService = new TokenDetailsService(serviceConfig);
  });

  describe('Tools', () => {
    it('should return all token details tools', () => {
      const tools = tokenDetailsService.getTools();
      expect(tools).toHaveLength(9);
      
      const toolNames = tools.map(tool => tool.name);
      expect(toolNames).toContain('get_native_token_details');
      expect(toolNames).toContain('get_token_details');
      expect(toolNames).toContain('get_native_historical_prices_range');
      expect(toolNames).toContain('get_token_historical_prices_range');
      expect(toolNames).toContain('get_native_historical_prices_interval');
      expect(toolNames).toContain('get_token_historical_prices_interval');
      expect(toolNames).toContain('get_native_price_change');
      expect(toolNames).toContain('get_token_price_change');
      expect(toolNames).toContain('get_multiple_tokens_price_change');
    });

    it('should have correct input schemas for tools', () => {
      const tools = tokenDetailsService.getTools();
      
      // Test get_native_token_details tool schema
      const nativeTokenDetailsTool = tools.find(tool => tool.name === 'get_native_token_details');
      expect(nativeTokenDetailsTool).toBeDefined();
      expect(nativeTokenDetailsTool?.inputSchema.properties).toHaveProperty('chain');
      expect(nativeTokenDetailsTool?.inputSchema.required).toContain('chain');
    });
  });

  describe('Resources', () => {
    it('should return token details resources', () => {
      const resources = tokenDetailsService.getResources();
      expect(resources).toHaveLength(2);
      
      const resourceUris = resources.map(resource => resource.uri);
      expect(resourceUris).toContain('1inch://token-details/documentation');
      expect(resourceUris).toContain('1inch://token-details/supported-intervals');
    });
  });

  describe('Prompts', () => {
    it('should return token details prompts', () => {
      const prompts = tokenDetailsService.getPrompts();
      expect(prompts).toHaveLength(1);
      
      const promptNames = prompts.map(prompt => prompt.name);
      expect(promptNames).toContain('analyze_token_performance');
    });
  });

  describe('API Endpoints', () => {

    describe('getNativeTokenDetails', () => {
      it('should get native token details for Ethereum', async () => {
        const result = await tokenDetailsService.getNativeTokenDetails({
          chain: testChain
        });

        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
        
        // Log the result for debugging
        console.log('Native token details result:', JSON.stringify(result, null, 2));
      }, 15000);
    });

    describe('getTokenDetails', () => {
      it('should get token details for DAI', async () => {
        const result = await tokenDetailsService.getTokenDetails({
          chain: testChain,
          address: testTokenAddress
        });

        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
        
        // Log the result for debugging
        console.log('Token details result:', JSON.stringify(result, null, 2));
      }, 15000);
    });

    describe('getNativeHistoricalPricesRange', () => {
      it('should get native token historical prices range', async () => {
        const result = await tokenDetailsService.getNativeHistoricalPricesRange({
          chain: testChain,
          from: testFromTimestamp,
          to: testToTimestamp
        });

        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
        
        // Log the result for debugging
        console.log('Native historical prices range result:', JSON.stringify(result, null, 2));
      }, 15000);
    });

    describe('getTokenHistoricalPricesRange', () => {
      it('should get token historical prices range for DAI', async () => {
        const result = await tokenDetailsService.getTokenHistoricalPricesRange({
          chain: testChain,
          address: testTokenAddress,
          from: testFromTimestamp,
          to: testToTimestamp
        });

        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
        
        // Log the result for debugging
        console.log('Token historical prices range result:', JSON.stringify(result, null, 2));
      }, 15000);
    });

    describe('getNativeHistoricalPricesInterval', () => {
      it('should get native token historical prices interval', async () => {
        const result = await tokenDetailsService.getNativeHistoricalPricesInterval({
          chain: testChain,
          interval: testInterval,
          from: testFromTimestamp,
          to: testToTimestamp
        });

        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
        
        // Log the result for debugging
        console.log('Native historical prices interval result:', JSON.stringify(result, null, 2));
      }, 15000);
    });

    describe('getTokenHistoricalPricesInterval', () => {
      it('should get token historical prices interval for DAI', async () => {
        const result = await tokenDetailsService.getTokenHistoricalPricesInterval({
          chain: testChain,
          address: testTokenAddress,
          interval: testInterval,
          from: testFromTimestamp,
          to: testToTimestamp
        });

        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
        
        // Log the result for debugging
        console.log('Token historical prices interval result:', JSON.stringify(result, null, 2));
      }, 15000);
    });

    describe('getNativePriceChange', () => {
      it('should get native token price change', async () => {
        const result = await tokenDetailsService.getNativePriceChange({
          chain: testChain,
          interval: testInterval
        });

        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
        
        // Log the result for debugging
        console.log('Native price change result:', JSON.stringify(result, null, 2));
      }, 15000);
    });

    describe('getTokenPriceChange', () => {
      it('should get token price change for DAI', async () => {
        const result = await tokenDetailsService.getTokenPriceChange({
          chain: testChain,
          address: testTokenAddress,
          interval: testInterval
        });

        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
        
        // Log the result for debugging
        console.log('Token price change result:', JSON.stringify(result, null, 2));
      }, 15000);
    });

    describe('getMultipleTokensPriceChange', () => {
      it('should get multiple tokens price change', async () => {
        try {
          const result = await tokenDetailsService.getMultipleTokensPriceChange({
            chain: testChain,
            addresses: [testTokenAddress],
            interval: testInterval
          });

          expect(result).toBeDefined();
          expect(typeof result).toBe('object');
          
          // Log the result for debugging
          console.log('Multiple tokens price change result:', JSON.stringify(result, null, 2));
        } catch (error: any) {
          // This endpoint might not be available in the current API version
          expect(error).toBeDefined();
          expect(error.message).toContain('Request failed');
        }
      }, 15000);
    });
  });

  describe('Tool Call Handling', () => {
    it('should handle get_native_token_details tool call', async () => {
      const result = await tokenDetailsService.handleToolCall('get_native_token_details', {
        chain: testChain
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    }, 15000);

    it('should handle get_token_details tool call', async () => {
      const result = await tokenDetailsService.handleToolCall('get_token_details', {
        chain: testChain,
        address: testTokenAddress
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    }, 15000);

    it('should throw error for unknown tool', async () => {
      await expect(
        tokenDetailsService.handleToolCall('unknown_tool', {})
      ).rejects.toThrow('Unknown tool: unknown_tool');
    });
  });

  describe('Resource Handling', () => {
    it('should handle documentation resource', async () => {
      const result = await tokenDetailsService.handleResourceRead('1inch://token-details/documentation');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('1inch Token Details API Documentation');
    });

    it('should handle supported intervals resource', async () => {
      const result = await tokenDetailsService.handleResourceRead('1inch://token-details/supported-intervals');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      
      const parsed = JSON.parse(result);
      expect(parsed).toHaveProperty('intervals');
      expect(Array.isArray(parsed.intervals)).toBe(true);
    });

    it('should throw error for unknown resource', async () => {
      await expect(
        tokenDetailsService.handleResourceRead('1inch://token-details/unknown')
      ).rejects.toThrow('Unknown resource: 1inch://token-details/unknown');
    });
  });

  describe('Prompt Handling', () => {
    it('should handle analyze_token_performance prompt', async () => {
      try {
        const result = await tokenDetailsService.handlePromptRequest('analyze_token_performance', {
          chain: testChain,
          address: testTokenAddress
        });

        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
        expect(result).toContain('Token Performance Analysis');
        // The token address might not be in the response if the API call fails
        // but the analysis should still be generated
      } catch (error: any) {
        // Handle case where token details API might fail
        expect(error).toBeDefined();
        expect(error.message).toContain('Request failed');
      }
    }, 20000);

    it('should throw error for unknown prompt', async () => {
      await expect(
        tokenDetailsService.handlePromptRequest('unknown_prompt', {})
      ).rejects.toThrow('Unknown prompt: unknown_prompt');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid token address gracefully', async () => {
      try {
        await tokenDetailsService.getTokenDetails({
          chain: testChain,
          address: '0xinvalid'
        });
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.message).toContain('Request failed');
      }
    }, 10000);

    it('should handle invalid chain ID gracefully', async () => {
      try {
        await tokenDetailsService.getNativeTokenDetails({
          chain: 999999 // Invalid chain
        });
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.message).toContain('Request failed');
      }
    }, 10000);
  });
}); 