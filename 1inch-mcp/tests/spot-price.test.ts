import { SpotPriceService } from '../src/services/spot-price/SpotPriceService';
import { config } from '../src/config/index';

describe('SpotPriceService', () => {
  let spotPriceService: SpotPriceService;

  beforeAll(() => {
    const serviceConfig = {
      baseUrl: config.oneInch.baseUrl,
      apiKey: config.oneInch.apiKey,
      timeout: config.oneInch.timeout
    };
    spotPriceService = new SpotPriceService(serviceConfig);
  });

  describe('Service Initialization', () => {
    it('should initialize with correct configuration', () => {
      expect(spotPriceService).toBeInstanceOf(SpotPriceService);
      expect(spotPriceService).toBeDefined();
    });

    it('should have required methods', () => {
      expect(typeof spotPriceService.getTools).toBe('function');
      expect(typeof spotPriceService.getResources).toBe('function');
      expect(typeof spotPriceService.getPrompts).toBe('function');
      expect(typeof spotPriceService.handleToolCall).toBe('function');
      expect(typeof spotPriceService.handleResourceRead).toBe('function');
      expect(typeof spotPriceService.handlePromptRequest).toBe('function');
    });
  });

  describe('getTools', () => {
    it('should return all spot price tools', () => {
      const tools = spotPriceService.getTools();
      expect(tools).toHaveLength(4);
      
      const toolNames = tools.map(tool => tool.name);
      expect(toolNames).toContain('get_all_prices');
      expect(toolNames).toContain('get_custom_tokens_prices');
      expect(toolNames).toContain('get_supported_currencies');
      expect(toolNames).toContain('get_specific_tokens_prices');
    });

    it('should have correct tool schemas', () => {
      const tools = spotPriceService.getTools();
      
      // Test get_all_prices schema
      const getAllPricesTool = tools.find(t => t.name === 'get_all_prices');
      expect(getAllPricesTool).toBeDefined();
      expect(getAllPricesTool?.inputSchema.type).toBe('object');
      expect(getAllPricesTool?.inputSchema.required).toContain('chain');
      expect(getAllPricesTool?.inputSchema.properties.chain.type).toBe('number');
      expect(getAllPricesTool?.inputSchema.properties.currency.type).toBe('string');

      // Test get_custom_tokens_prices schema
      const getCustomTokensTool = tools.find(t => t.name === 'get_custom_tokens_prices');
      expect(getCustomTokensTool).toBeDefined();
      expect(getCustomTokensTool?.inputSchema.required).toContain('chain');
      expect(getCustomTokensTool?.inputSchema.required).toContain('tokens');
      expect(getCustomTokensTool?.inputSchema.properties.tokens.type).toBe('array');

      // Test get_supported_currencies schema
      const getSupportedCurrenciesTool = tools.find(t => t.name === 'get_supported_currencies');
      expect(getSupportedCurrenciesTool).toBeDefined();
      expect(getSupportedCurrenciesTool?.inputSchema.required).toContain('chain');

      // Test get_specific_tokens_prices schema
      const getSpecificTokensTool = tools.find(t => t.name === 'get_specific_tokens_prices');
      expect(getSpecificTokensTool).toBeDefined();
      expect(getSpecificTokensTool?.inputSchema.required).toContain('chain');
      expect(getSpecificTokensTool?.inputSchema.required).toContain('addresses');
    });

    it('should have descriptive tool descriptions', () => {
      const tools = spotPriceService.getTools();
      
      tools.forEach(tool => {
        expect(tool.description).toBeDefined();
        expect(typeof tool.description).toBe('string');
        expect(tool.description.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getResources', () => {
    it('should return spot price resources', () => {
      const resources = spotPriceService.getResources();
      expect(resources).toHaveLength(2);
      
      const resourceUris = resources.map(resource => resource.uri);
      expect(resourceUris).toContain('1inch://spot-price/documentation');
      expect(resourceUris).toContain('1inch://spot-price/supported-chains');
    });

    it('should have correct resource properties', () => {
      const resources = spotPriceService.getResources();
      
      resources.forEach(resource => {
        expect(resource.uri).toBeDefined();
        expect(resource.name).toBeDefined();
        expect(resource.description).toBeDefined();
        expect(resource.mimeType).toBeDefined();
        expect(typeof resource.uri).toBe('string');
        expect(typeof resource.name).toBe('string');
        expect(typeof resource.description).toBe('string');
        expect(typeof resource.mimeType).toBe('string');
      });
    });

    it('should have valid MIME types', () => {
      const resources = spotPriceService.getResources();
      
      const documentationResource = resources.find(r => r.uri.includes('documentation'));
      expect(documentationResource?.mimeType).toBe('text/markdown');
      
      const chainsResource = resources.find(r => r.uri.includes('supported-chains'));
      expect(chainsResource?.mimeType).toBe('application/json');
    });
  });

  describe('getPrompts', () => {
    it('should return spot price prompts', () => {
      const prompts = spotPriceService.getPrompts();
      expect(prompts).toHaveLength(1);
      
      const promptNames = prompts.map(prompt => prompt.name);
      expect(promptNames).toContain('analyze_token_prices');
    });

    it('should have correct prompt structure', () => {
      const prompts = spotPriceService.getPrompts();
      const analyzePrompt = prompts.find(p => p.name === 'analyze_token_prices');
      
      expect(analyzePrompt).toBeDefined();
      expect(analyzePrompt?.description).toBeDefined();
      expect(analyzePrompt?.arguments).toBeInstanceOf(Array);
      expect(analyzePrompt?.arguments.length).toBeGreaterThan(0);
      
      // Check required arguments
      const requiredArgs = analyzePrompt?.arguments.filter(arg => arg.required);
      expect(requiredArgs?.length).toBeGreaterThan(0);
      
      // Check argument structure
      analyzePrompt?.arguments.forEach(arg => {
        expect(arg.name).toBeDefined();
        expect(arg.description).toBeDefined();
        expect(typeof arg.required).toBe('boolean');
      });
    });
  });

  describe('API Integration Tests', () => {
    describe('get_supported_currencies', () => {
      it('should get supported currencies for Ethereum', async () => {
        const result = await spotPriceService.handleToolCall('get_supported_currencies', {
          chain: 1
        });
        
        expect(result).toBeDefined();
        expect(result.codes).toBeInstanceOf(Array);
        expect(result.codes.length).toBeGreaterThan(0);
        expect(result.codes).toContain('USD');
        
        // Log the result for debugging
        console.log('Supported currencies result:', JSON.stringify(result, null, 2));
      }, 10000);

      it('should get supported currencies for Polygon', async () => {
        const result = await spotPriceService.handleToolCall('get_supported_currencies', {
          chain: 137
        });
        
        expect(result).toBeDefined();
        expect(result.codes).toBeInstanceOf(Array);
        expect(result.codes.length).toBeGreaterThan(0);
      }, 10000);

      it('should handle invalid chain ID gracefully', async () => {
        await expect(
          spotPriceService.handleToolCall('get_supported_currencies', {
            chain: 999999
          })
        ).rejects.toThrow();
      }, 10000);
    });

    describe('get_custom_tokens_prices', () => {
      it('should get custom tokens prices for 1INCH token', async () => {
        const result = await spotPriceService.handleToolCall('get_custom_tokens_prices', {
          chain: 1,
          tokens: ['0x111111111117dc0aa78b770fa6a738034120c302'], // 1INCH token
          currency: 'USD'
        });
        
        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
        expect(Object.keys(result).length).toBeGreaterThan(0);
        
        // Log the result for debugging
        console.log('Custom tokens prices result:', JSON.stringify(result, null, 2));
      }, 10000);

      it('should get custom tokens prices without currency', async () => {
        const result = await spotPriceService.handleToolCall('get_custom_tokens_prices', {
          chain: 1,
          tokens: ['0x111111111117dc0aa78b770fa6a738034120c302']
        });
        
        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
      }, 10000);

      it('should handle multiple tokens', async () => {
        const result = await spotPriceService.handleToolCall('get_custom_tokens_prices', {
          chain: 1,
          tokens: [
            '0x111111111117dc0aa78b770fa6a738034120c302', // 1INCH
            '0xA0b86a33E6441b8c4C8C3C8C3C8C3C8C3C8C3C8C' // Invalid token for testing
          ],
          currency: 'USD'
        });
        
        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
      }, 10000);
    });

    describe('get_specific_tokens_prices', () => {
      it('should get specific tokens prices via path parameter', async () => {
        const result = await spotPriceService.handleToolCall('get_specific_tokens_prices', {
          chain: 1,
          addresses: ['0x111111111117dc0aa78b770fa6a738034120c302'], // 1INCH token
          currency: 'USD'
        });
        
        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
      }, 10000);

      it('should get specific tokens prices without currency', async () => {
        const result = await spotPriceService.handleToolCall('get_specific_tokens_prices', {
          chain: 1,
          addresses: ['0x111111111117dc0aa78b770fa6a738034120c302']
        });
        
        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
      }, 10000);

      it('should handle multiple addresses', async () => {
        const result = await spotPriceService.handleToolCall('get_specific_tokens_prices', {
          chain: 1,
          addresses: [
            '0x111111111117dc0aa78b770fa6a738034120c302', // 1INCH
            '0xA0b86a33E6441b8c4C8C3C8C3C8C3C8C3C8C3C8C' // Invalid address for testing
          ],
          currency: 'USD'
        });
        
        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
      }, 10000);
    });

    describe('get_all_prices', () => {
      it('should get all prices for Ethereum', async () => {
        const result = await spotPriceService.handleToolCall('get_all_prices', {
          chain: 1,
          currency: 'USD'
        });
        
        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
        expect(Object.keys(result).length).toBeGreaterThan(0);
        
        // Log the result for debugging
        console.log('All prices result:', JSON.stringify(result, null, 2));
      }, 15000);

      it('should get all prices without currency', async () => {
        const result = await spotPriceService.handleToolCall('get_all_prices', {
          chain: 1
        });
        
        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
      }, 15000);
    });
  });

  describe('Resource Handling', () => {
    it('should handle resource read for documentation', async () => {
      const result = await spotPriceService.handleResourceRead('1inch://spot-price/documentation');
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('1inch Spot Price API Documentation');
      expect(result).toContain('## Overview');
      expect(result).toContain('## Endpoints');
    });

    it('should handle resource read for supported chains', async () => {
      const result = await spotPriceService.handleResourceRead('1inch://spot-price/supported-chains');
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      
      const parsed = JSON.parse(result);
      expect(parsed.chains).toBeInstanceOf(Array);
      expect(parsed.chains.length).toBeGreaterThan(0);
      expect(parsed.description).toBeDefined();
      
      // Check for specific chains
      const chainIds = parsed.chains.map((chain: any) => chain.id);
      expect(chainIds).toContain(1); // Ethereum
      expect(chainIds).toContain(137); // Polygon
    });

    it('should return valid JSON for supported chains', () => {
      return spotPriceService.handleResourceRead('1inch://spot-price/supported-chains')
        .then(result => {
          expect(() => JSON.parse(result)).not.toThrow();
        });
    });
  });

  describe('Prompt Handling', () => {
    it('should handle prompt request for analyze token prices', async () => {
      const result = await spotPriceService.handlePromptRequest('analyze_token_prices', {
        chain: 1,
        tokens: ['0x111111111117dc0aa78b770fa6a738034120c302'], // 1INCH token
        currency: 'USD'
      });
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('Token Price Analysis');
      expect(result).toContain('Chain 1');
      expect(result).toContain('USD');
    }, 15000);

    it('should handle prompt request without currency', async () => {
      const result = await spotPriceService.handlePromptRequest('analyze_token_prices', {
        chain: 1,
        tokens: ['0x111111111117dc0aa78b770fa6a738034120c302']
      });
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('Token Price Analysis');
    }, 15000);

    it('should include supported currencies in analysis', async () => {
      const result = await spotPriceService.handlePromptRequest('analyze_token_prices', {
        chain: 1,
        tokens: ['0x111111111117dc0aa78b770fa6a738034120c302'],
        currency: 'USD'
      });
      
      expect(result).toContain('Supported Currencies:');
    }, 15000);
  });

  describe('Error Handling', () => {
    it('should throw error for unknown tool', async () => {
      await expect(
        spotPriceService.handleToolCall('unknown_tool', {})
      ).rejects.toThrow('Unknown tool: unknown_tool');
    });

    it('should throw error for unknown resource', async () => {
      await expect(
        spotPriceService.handleResourceRead('unknown://resource')
      ).rejects.toThrow('Unknown resource: unknown://resource');
    });

    it('should throw error for unknown prompt', async () => {
      await expect(
        spotPriceService.handlePromptRequest('unknown_prompt', {})
      ).rejects.toThrow('Unknown prompt: unknown_prompt');
    });

    it('should handle missing required parameters gracefully', async () => {
      await expect(
        spotPriceService.handleToolCall('get_supported_currencies', {})
      ).rejects.toThrow();
    });

    it('should handle invalid chain ID', async () => {
      await expect(
        spotPriceService.handleToolCall('get_supported_currencies', {
          chain: 'invalid'
        })
      ).rejects.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty tokens array', async () => {
      await expect(
        spotPriceService.handleToolCall('get_custom_tokens_prices', {
          chain: 1,
          tokens: []
        })
      ).rejects.toThrow();
    }, 10000);

    it('should handle empty addresses array', async () => {
      const result = await spotPriceService.handleToolCall('get_specific_tokens_prices', {
        chain: 1,
        addresses: []
      });
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    }, 10000);

    it('should handle invalid token addresses', async () => {
      try {
        const result = await spotPriceService.handleToolCall('get_custom_tokens_prices', {
          chain: 1,
          tokens: ['invalid_address'],
          currency: 'USD'
        });
        
        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
      } catch (error) {
        // API might reject invalid addresses, which is also acceptable
        expect(error).toBeDefined();
      }
    }, 10000);

    it('should handle unsupported currency gracefully', async () => {
      try {
        const result = await spotPriceService.handleToolCall('get_custom_tokens_prices', {
          chain: 1,
          tokens: ['0x111111111117dc0aa78b770fa6a738034120c302'],
          currency: 'INVALID_CURRENCY'
        });
        
        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
      } catch (error) {
        // API might reject invalid currency, which is also acceptable
        expect(error).toBeDefined();
      }
    }, 10000);
  });

  describe('Performance Tests', () => {
    it('should complete supported currencies request within reasonable time', async () => {
      const startTime = Date.now();
      
      await spotPriceService.handleToolCall('get_supported_currencies', {
        chain: 1
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    }, 10000);

    it('should complete token prices request within reasonable time', async () => {
      const startTime = Date.now();
      
      await spotPriceService.handleToolCall('get_custom_tokens_prices', {
        chain: 1,
        tokens: ['0x111111111117dc0aa78b770fa6a738034120c302'],
        currency: 'USD'
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    }, 10000);
  });
}); 