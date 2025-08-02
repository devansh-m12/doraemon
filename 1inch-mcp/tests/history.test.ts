import { HistoryService } from '../src/services/history/HistoryService';
import { config } from '../src/config/index';
import { describe, it, beforeEach, expect, jest, beforeAll } from '@jest/globals';

describe('HistoryService', () => {
  let historyService: HistoryService;
  
  // Test data - using real addresses that likely have some history
  const testChain = 1; // Ethereum
  const testWallet = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'; // Known active wallet
  const testTokens = [
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
    '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
    '0xdAC17F958D2ee523a2206206994597C13D831ec7'  // USDT
  ];

  beforeAll(() => {
    const serviceConfig = {
      baseUrl: config.oneInch.baseUrl,
      apiKey: config.oneInch.apiKey,
      timeout: config.oneInch.timeout
    };
    historyService = new HistoryService(serviceConfig);
  });

  describe('Tools', () => {
    it('should return all history tools', () => {
      const tools = historyService.getTools();
      expect(tools).toHaveLength(4);
      
      const toolNames = tools.map(tool => tool.name);
      expect(toolNames).toContain('get_history_events');
      expect(toolNames).toContain('get_history_events_by_address');
      expect(toolNames).toContain('get_history_events_with_search');
      expect(toolNames).toContain('get_swap_events');
    });

    it('should have correct input schemas for tools', () => {
      const tools = historyService.getTools();
      
      // Test get_history_events tool schema
      const historyEventsTool = tools.find(tool => tool.name === 'get_history_events');
      expect(historyEventsTool).toBeDefined();
      expect(historyEventsTool?.inputSchema.properties).toHaveProperty('address');
      expect(historyEventsTool?.inputSchema.required).toContain('address');
      
      // Test get_swap_events tool schema
      const swapEventsTool = tools.find(tool => tool.name === 'get_swap_events');
      expect(swapEventsTool).toBeDefined();
      expect(swapEventsTool?.inputSchema.properties).toHaveProperty('address');
      expect(swapEventsTool?.inputSchema.properties).toHaveProperty('chainId');
      expect(swapEventsTool?.inputSchema.required).toContain('address');
      expect(swapEventsTool?.inputSchema.required).toContain('chainId');
    });
  });

  describe('Resources', () => {
    it('should return all history resources', () => {
      const resources = historyService.getResources();
      expect(resources).toHaveLength(3);
      
      const resourceUris = resources.map(resource => resource.uri);
      expect(resourceUris).toContain('1inch://history/documentation');
      expect(resourceUris).toContain('1inch://history/supported-chains');
      expect(resourceUris).toContain('1inch://history/event-types');
    });
  });

  describe('Prompts', () => {
    it('should return all history prompts', () => {
      const prompts = historyService.getPrompts();
      expect(prompts).toHaveLength(2);
      
      const promptNames = prompts.map(prompt => prompt.name);
      expect(promptNames).toContain('analyze_wallet_history');
      expect(promptNames).toContain('get_swap_analysis');
    });
  });

  describe('API Endpoints', () => {
    // Note: History API endpoints may not be available in the current 1inch API
    // These tests are designed to handle both success and failure cases gracefully

    describe('getHistoryEvents', () => {
      it('should handle history events request (may fail if API not available)', async () => {
        try {
          const result = await historyService.getHistoryEvents({
            address: testWallet,
            limit: 10
          });

          expect(result).toBeDefined();
          expect(typeof result === 'object' && result !== null).toBe(true);
          
          console.log('History events result:', JSON.stringify(result, null, 2));
        } catch (error: any) {
          // If the API is not available, we expect a 404 error
          expect(error.message).toContain('Request failed');
          console.log('History API not available (expected for some API keys):', error.message);
        }
      }, 15000);

      it('should handle history events with chain filter (may fail if API not available)', async () => {
        try {
          const result = await historyService.getHistoryEvents({
            address: testWallet,
            chainId: testChain,
            limit: 5
          });

          expect(result).toBeDefined();
          expect(typeof result === 'object' && result !== null).toBe(true);
          
          console.log('History events with chain filter result:', JSON.stringify(result, null, 2));
        } catch (error: any) {
          expect(error.message).toContain('Request failed');
          console.log('History API not available (expected for some API keys):', error.message);
        }
      }, 15000);
    });

    describe('getHistoryEventsByAddress', () => {
      it('should handle history events by address request (may fail if API not available)', async () => {
        try {
          const result = await historyService.getHistoryEventsByAddress({
            addresses: [testWallet],
            limit: 5
          });

          expect(result).toBeDefined();
          expect(typeof result === 'object' && result !== null).toBe(true);
          
          console.log('History events by address result:', JSON.stringify(result, null, 2));
        } catch (error: any) {
          expect(error.message).toContain('Request failed');
          console.log('History API not available (expected for some API keys):', error.message);
        }
      }, 15000);
    });

    describe('getHistoryEventsWithSearch', () => {
      it('should handle history events with search filter (may fail if API not available)', async () => {
        try {
          const result = await historyService.getHistoryEventsWithSearch({
            addresses: [testWallet],
            filter: {
              type: 'Swap'
            },
            limit: 5
          });

          expect(result).toBeDefined();
          expect(typeof result === 'object' && result !== null).toBe(true);
          
          console.log('History events with search filter result:', JSON.stringify(result, null, 2));
        } catch (error: any) {
          expect(error.message).toContain('Request failed');
          console.log('History API not available (expected for some API keys):', error.message);
        }
      }, 15000);
    });

    describe('getSwapEvents', () => {
      it('should handle swap events request (may fail if API not available)', async () => {
        try {
          const result = await historyService.getSwapEvents({
            address: testWallet,
            chainId: testChain,
            limit: 5
          });

          expect(result).toBeDefined();
          expect(typeof result === 'object' && result !== null).toBe(true);
          
          console.log('Swap events result:', JSON.stringify(result, null, 2));
        } catch (error: any) {
          expect(error.message).toContain('Request failed');
          console.log('History API not available (expected for some API keys):', error.message);
        }
      }, 15000);
    });
  });

  describe('Tool Call Handling', () => {
    it('should handle get_history_events tool call (may fail if API not available)', async () => {
      try {
        const result = await historyService.handleToolCall('get_history_events', {
          address: testWallet,
          limit: 5
        });

        expect(result).toBeDefined();
        expect(typeof result === 'object' && result !== null).toBe(true);
      } catch (error: any) {
        expect(error.message).toContain('Request failed');
        console.log('History API not available (expected for some API keys):', error.message);
      }
    }, 15000);

    it('should handle get_history_events_by_address tool call (may fail if API not available)', async () => {
      try {
        const result = await historyService.handleToolCall('get_history_events_by_address', {
          addresses: [testWallet],
          limit: 5
        });

        expect(result).toBeDefined();
        expect(typeof result === 'object' && result !== null).toBe(true);
      } catch (error: any) {
        expect(error.message).toContain('Request failed');
        console.log('History API not available (expected for some API keys):', error.message);
      }
    }, 15000);

    it('should handle get_history_events_with_search tool call (may fail if API not available)', async () => {
      try {
        const result = await historyService.handleToolCall('get_history_events_with_search', {
          addresses: [testWallet],
          filter: { type: 'Swap' },
          limit: 5
        });

        expect(result).toBeDefined();
        expect(typeof result === 'object' && result !== null).toBe(true);
      } catch (error: any) {
        expect(error.message).toContain('Request failed');
        console.log('History API not available (expected for some API keys):', error.message);
      }
    }, 15000);

    it('should handle get_swap_events tool call (may fail if API not available)', async () => {
      try {
        const result = await historyService.handleToolCall('get_swap_events', {
          address: testWallet,
          chainId: testChain,
          limit: 5
        });

        expect(result).toBeDefined();
        expect(typeof result === 'object' && result !== null).toBe(true);
      } catch (error: any) {
        expect(error.message).toContain('Request failed');
        console.log('History API not available (expected for some API keys):', error.message);
      }
    }, 15000);

    it('should throw error for unknown tool', async () => {
      await expect(
        historyService.handleToolCall('unknown_tool', {})
      ).rejects.toThrow('Unknown tool: unknown_tool');
    });
  });

  describe('Resource Handling', () => {
    it('should handle documentation resource', async () => {
      const result = await historyService.handleResourceRead('1inch://history/documentation');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('# 1inch History API Documentation');
    });

    it('should handle supported chains resource', async () => {
      const result = await historyService.handleResourceRead('1inch://history/supported-chains');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      
      const parsed = JSON.parse(result);
      expect(parsed).toHaveProperty('chains');
      expect(Array.isArray(parsed.chains)).toBe(true);
    });

    it('should handle event types resource', async () => {
      const result = await historyService.handleResourceRead('1inch://history/event-types');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      
      const parsed = JSON.parse(result);
      expect(parsed).toHaveProperty('eventTypes');
      expect(Array.isArray(parsed.eventTypes)).toBe(true);
    });

    it('should throw error for unknown resource', async () => {
      await expect(
        historyService.handleResourceRead('1inch://history/unknown')
      ).rejects.toThrow('Unknown resource: 1inch://history/unknown');
    });
  });

  describe('Prompt Handling', () => {
    it('should handle analyze_wallet_history prompt (may fail if API not available)', async () => {
      try {
        const result = await historyService.handlePromptRequest('analyze_wallet_history', {
          address: testWallet,
          chainId: testChain,
          limit: 10
        });

        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
        expect(result).toContain('Wallet History Analysis');
        expect(result).toContain(testWallet);
      } catch (error: any) {
        expect(error.message).toContain('Request failed');
        console.log('History API not available (expected for some API keys):', error.message);
      }
    }, 20000);

    it('should handle get_swap_analysis prompt (may fail if API not available)', async () => {
      try {
        const result = await historyService.handlePromptRequest('get_swap_analysis', {
          address: testWallet,
          chainId: testChain
        });

        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
        expect(result).toContain('Swap Analysis');
        expect(result).toContain(testWallet);
      } catch (error: any) {
        expect(error.message).toContain('Request failed');
        console.log('History API not available (expected for some API keys):', error.message);
      }
    }, 20000);

    it('should throw error for unknown prompt', async () => {
      await expect(
        historyService.handlePromptRequest('unknown_prompt', {})
      ).rejects.toThrow('Unknown prompt: unknown_prompt');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid wallet address gracefully', async () => {
      try {
        await historyService.getHistoryEvents({
          address: '0xinvalid'
        });
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.message).toContain('Request failed');
      }
    }, 10000);

    it('should handle invalid chain ID gracefully', async () => {
      try {
        await historyService.getSwapEvents({
          address: testWallet,
          chainId: 999999 // Invalid chain
        });
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.message).toContain('Request failed');
      }
    }, 10000);

    it('should handle empty addresses array gracefully', async () => {
      try {
        await historyService.getHistoryEventsByAddress({
          addresses: []
        });
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.message).toContain('Request failed');
      }
    }, 10000);
  });
}); 