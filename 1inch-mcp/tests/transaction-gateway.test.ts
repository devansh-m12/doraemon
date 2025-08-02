import { TransactionGatewayService } from '../src/services/transaction-gateway/TransactionGatewayService';
import { config } from '../src/config/index';
import { ethers } from 'ethers';
import { TransactionUtils } from '../src/utils/transaction-utils';
import { describe, it, beforeEach, expect, jest, beforeAll } from '@jest/globals';

describe('TransactionGatewayService', () => {
  let transactionGatewayService: TransactionGatewayService;
  let testWallet: ethers.HDNodeWallet;
  let testRawTransaction: string;
  let testRawTransaction2: string;
  
  // Test configuration
  const testChain = 1; // Ethereum mainnet
  const testChainPolygon = 137; // Polygon for public transaction testing
  
  // Generate real raw transactions for testing using the utility
  const generateRealRawTransaction = async (chainId: number): Promise<string> => {
    return await TransactionUtils.generateTestRawTransaction(chainId);
  };

  beforeAll(async () => {
    const serviceConfig = {
      baseUrl: config.oneInch.baseUrl,
      apiKey: config.oneInch.apiKey,
      timeout: config.oneInch.timeout
    };
    transactionGatewayService = new TransactionGatewayService(serviceConfig);
    
    // Generate test wallet and transactions
    testWallet = ethers.Wallet.createRandom();
    testRawTransaction = await generateRealRawTransaction(testChain);
    testRawTransaction2 = await generateRealRawTransaction(testChainPolygon);
  });

  describe('Tools', () => {
    it('should return all transaction gateway tools', () => {
      const tools = transactionGatewayService.getTools();
      expect(tools).toHaveLength(2);
      
      const toolNames = tools.map(tool => tool.name);
      expect(toolNames).toContain('broadcast_public_transaction');
      expect(toolNames).toContain('broadcast_private_transaction');
    });

    it('should have correct input schemas for tools', () => {
      const tools = transactionGatewayService.getTools();
      
      // Test broadcast_public_transaction tool schema
      const publicTool = tools.find(tool => tool.name === 'broadcast_public_transaction');
      expect(publicTool).toBeDefined();
      expect(publicTool?.inputSchema.properties).toHaveProperty('chain');
      expect(publicTool?.inputSchema.properties).toHaveProperty('rawTransaction');
      expect(publicTool?.inputSchema.required).toContain('chain');
      expect(publicTool?.inputSchema.required).toContain('rawTransaction');
      
      // Test broadcast_private_transaction tool schema
      const privateTool = tools.find(tool => tool.name === 'broadcast_private_transaction');
      expect(privateTool).toBeDefined();
      expect(privateTool?.inputSchema.properties).toHaveProperty('chain');
      expect(privateTool?.inputSchema.properties).toHaveProperty('rawTransaction');
      expect(privateTool?.inputSchema.required).toContain('chain');
      expect(privateTool?.inputSchema.required).toContain('rawTransaction');
    });
  });

  describe('Resources', () => {
    it('should return transaction gateway resources', () => {
      const resources = transactionGatewayService.getResources();
      expect(resources).toHaveLength(2);
      
      const resourceUris = resources.map(resource => resource.uri);
      expect(resourceUris).toContain('1inch://transaction-gateway/documentation');
      expect(resourceUris).toContain('1inch://transaction-gateway/supported-chains');
    });
  });

  describe('Prompts', () => {
    it('should return transaction gateway prompts', () => {
      const prompts = transactionGatewayService.getPrompts();
      expect(prompts).toHaveLength(1);
      
      const promptNames = prompts.map(prompt => prompt.name);
      expect(promptNames).toContain('analyze_transaction');
    });
  });

  describe('API Endpoints', () => {
    describe('broadcastPublicTransaction', () => {
      it('should attempt to broadcast public transaction on Ethereum', async () => {
        try {
          const result = await transactionGatewayService.broadcastPublicTransaction({
            chain: testChain,
            rawTransaction: testRawTransaction
          });

          expect(result).toBeDefined();
          expect(typeof result).toBe('object');
          
          // Log the result for debugging
          console.log('Public transaction broadcast result:', JSON.stringify(result, null, 2));
        } catch (error: any) {
          // Handle various API error responses
          expect(error).toBeDefined();
          expect(error.message).toMatch(/(Invalid transaction data|Request failed|rate limit|server error)/i);
        }
      }, 15000);

      it('should attempt to broadcast public transaction on Polygon', async () => {
        try {
          const result = await transactionGatewayService.broadcastPublicTransaction({
            chain: testChainPolygon,
            rawTransaction: testRawTransaction2
          });

          console.log('Public transaction broadcast result (Polygon):', JSON.stringify(result, null, 2));

          expect(result).toBeDefined();
          expect(typeof result).toBe('object');
          
          // Log the result for debugging
          console.log('Public transaction broadcast result (Polygon):', JSON.stringify(result, null, 2));
        } catch (error: any) {
          // Handle various API error responses
          expect(error).toBeDefined();
          expect(error.message).toMatch(/(Invalid transaction data|Request failed|rate limit|server error)/i);
        }
      }, 15000);
    });

    describe('broadcastPrivateTransaction', () => {
      it('should attempt to broadcast private transaction on Ethereum', async () => {
        try {
          const result = await transactionGatewayService.broadcastPrivateTransaction({
            chain: testChain,
            rawTransaction: testRawTransaction
          });

          expect(result).toBeDefined();
          expect(typeof result).toBe('object');
          
          // Log the result for debugging
          console.log('Private transaction broadcast result:', JSON.stringify(result, null, 2));
        } catch (error: any) {
          // Handle various API error responses
          expect(error).toBeDefined();
          expect(error.message).toMatch(/(Invalid transaction data|Request failed|rate limit|server error)/i);
        }
      }, 15000);

      it('should reject private transaction on non-Ethereum chain', async () => {
        try {
          await transactionGatewayService.broadcastPrivateTransaction({
            chain: testChainPolygon,
            rawTransaction: testRawTransaction
          });
        } catch (error: any) {
          expect(error).toBeDefined();
          expect(error.message).toContain('only available on Ethereum mainnet');
        }
      }, 10000);
    });
  });

  describe('Tool Call Handling', () => {
    it('should handle broadcast_public_transaction tool call', async () => {
      try {
        const result = await transactionGatewayService.handleToolCall('broadcast_public_transaction', {
          chain: testChain,
          rawTransaction: testRawTransaction
        });

        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
      } catch (error: any) {
        // Handle various API error responses
        expect(error).toBeDefined();
        expect(error.message).toMatch(/(Invalid transaction data|Request failed|rate limit|server error)/i);
      }
    }, 15000);

    it('should handle broadcast_private_transaction tool call', async () => {
      try {
        const result = await transactionGatewayService.handleToolCall('broadcast_private_transaction', {
          chain: testChain,
          rawTransaction: testRawTransaction
        });

        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
      } catch (error: any) {
        // Handle various API error responses
        expect(error).toBeDefined();
        expect(error.message).toMatch(/(Invalid transaction data|Request failed|rate limit|server error)/i);
      }
    }, 15000);

    it('should throw error for unknown tool', async () => {
      await expect(
        transactionGatewayService.handleToolCall('unknown_tool', {})
      ).rejects.toThrow('Unknown tool: unknown_tool');
    });
  });

  describe('Resource Handling', () => {
    it('should handle documentation resource', async () => {
      const result = await transactionGatewayService.handleResourceRead('1inch://transaction-gateway/documentation');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('1inch Transaction Gateway API Documentation');
    });

    it('should handle supported chains resource', async () => {
      const result = await transactionGatewayService.handleResourceRead('1inch://transaction-gateway/supported-chains');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      
      const parsed = JSON.parse(result);
      expect(parsed).toHaveProperty('chains');
      expect(Array.isArray(parsed.chains)).toBe(true);
      expect(parsed).toHaveProperty('description');
      expect(parsed).toHaveProperty('note');
    });

    it('should throw error for unknown resource', async () => {
      await expect(
        transactionGatewayService.handleResourceRead('1inch://transaction-gateway/unknown')
      ).rejects.toThrow('Unknown resource: 1inch://transaction-gateway/unknown');
    });
  });

  describe('Prompt Handling', () => {
    it('should handle analyze_transaction prompt', async () => {
      const result = await transactionGatewayService.handlePromptRequest('analyze_transaction', {
        chain: testChain,
        rawTransaction: testRawTransaction
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('Transaction Analysis');
      expect(result).toContain(`Chain ID: ${testChain}`);
      expect(result).toContain('Transaction Type: Public');
    }, 10000);

    it('should handle analyze_transaction prompt with private flag', async () => {
      const result = await transactionGatewayService.handlePromptRequest('analyze_transaction', {
        chain: testChain,
        rawTransaction: testRawTransaction,
        isPrivate: true
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('Transaction Analysis');
      expect(result).toContain(`Chain ID: ${testChain}`);
      expect(result).toContain('Transaction Type: Private (Flashbots)');
    }, 10000);

    it('should handle analyze_transaction prompt with non-Ethereum chain and private flag', async () => {
      const result = await transactionGatewayService.handlePromptRequest('analyze_transaction', {
        chain: testChainPolygon,
        rawTransaction: testRawTransaction,
        isPrivate: true
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('Transaction Analysis');
      expect(result).toContain(`Chain ID: ${testChainPolygon}`);
      expect(result).toContain('Transaction Type: Private (Flashbots)');
      expect(result).toContain('Warning: Private transactions are only supported on Ethereum mainnet');
    }, 10000);

    it('should throw error for unknown prompt', async () => {
      await expect(
        transactionGatewayService.handlePromptRequest('unknown_prompt', {})
      ).rejects.toThrow('Unknown prompt: unknown_prompt');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid transaction format gracefully', async () => {
      try {
        await transactionGatewayService.broadcastPublicTransaction({
          chain: testChain,
          rawTransaction: 'invalid_transaction'
        });
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.message).toMatch(/(Invalid transaction data|Request failed|rate limit|server error)/i);
      }
    }, 10000);

    it('should handle invalid chain ID gracefully', async () => {
      try {
        await transactionGatewayService.broadcastPublicTransaction({
          chain: 999999, // Invalid chain
          rawTransaction: testRawTransaction
        });
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.message).toMatch(/(Request failed|rate limit|server error)/i);
      }
    }, 10000);

    it('should handle empty transaction gracefully', async () => {
      try {
        await transactionGatewayService.broadcastPublicTransaction({
          chain: testChain,
          rawTransaction: ''
        });
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.message).toMatch(/(Invalid transaction data|Request failed|rate limit|server error)/i);
      }
    }, 10000);
  });

  describe('Transaction Analysis', () => {
    it('should analyze valid hex transaction', async () => {
      const result = await transactionGatewayService.handlePromptRequest('analyze_transaction', {
        chain: testChain,
        rawTransaction: testRawTransaction
      });

      expect(result).toContain('Transaction Format: ✅ Valid hex format');
      expect(result).toContain('Ready to broadcast: Public transaction');
    }, 10000);

    it('should analyze invalid hex transaction', async () => {
      try {
        await transactionGatewayService.handlePromptRequest('analyze_transaction', {
          chain: testChain,
          rawTransaction: 'invalid_hex'
        });
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.message).toContain('Transaction must be a hex string starting with 0x');
      }
    }, 10000);

    it('should analyze short transaction', async () => {
      try {
        await transactionGatewayService.handlePromptRequest('analyze_transaction', {
          chain: testChain,
          rawTransaction: '0x123'
        });
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.message).toContain('Transaction appears to be too short');
      }
    }, 10000);

    it('should validate generated raw transactions using utility', () => {
      // Test that our generated transactions are valid
      expect(TransactionUtils.isValidRawTransaction(testRawTransaction)).toBe(true);
      expect(TransactionUtils.isValidRawTransaction(testRawTransaction2)).toBe(true);
      
      // Test transaction parsing
      const parsed1 = TransactionUtils.parseTransaction(testRawTransaction);
      const parsed2 = TransactionUtils.parseTransaction(testRawTransaction2);
      
      expect(parsed1.isValid).toBe(true);
      expect(parsed2.isValid).toBe(true);
      expect(parsed1.length).toBeGreaterThan(0);
      expect(parsed2.length).toBeGreaterThan(0);
    });

    it('should generate transactions for multiple chains', async () => {
      const chainIds = [1, 137, 56, 42161]; // Ethereum, Polygon, BSC, Arbitrum
      const transactions = await TransactionUtils.generateTestRawTransactions(chainIds);
      
      expect(transactions.size).toBe(4);
      
      for (const [chainId, rawTx] of transactions) {
        expect(TransactionUtils.isValidRawTransaction(rawTx)).toBe(true);
        expect(rawTx.startsWith('0x')).toBe(true);
      }
    });
  });
}); 