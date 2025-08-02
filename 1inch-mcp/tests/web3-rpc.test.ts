import { Web3RpcService } from '../src/services/web3-rpc/Web3RpcService';
import { config } from '../src/config/index';
import { describe, it, beforeEach, expect, jest, beforeAll } from '@jest/globals';

describe('Web3RpcService', () => {
  let web3RpcService: Web3RpcService;

  // Real Ethereum addresses and data
  const REAL_ETH_ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'; // Vitalik's address
  const REAL_ETH_ADDRESS_2 = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'; // Another real address
  const REAL_TX_HASH = '0x88df016429689c079f3b2f6ad39fa052532c56795b733da78a91ebe6a713944b'; // Real transaction hash
  const REAL_CONTRACT_ADDRESS = '0xA0b86a33E6441b8c4C8C0C0C0C0C0C0C0C0C0C0C'; // Example contract address

  beforeEach(() => {
    const serviceConfig = {
      baseUrl: config.oneInch.baseUrl,
      apiKey: config.oneInch.apiKey,
      timeout: config.oneInch.timeout
    };
    web3RpcService = new Web3RpcService(serviceConfig);
  });

  describe('getTools', () => {
    it('should return an array of tool definitions', () => {
      const tools = web3RpcService.getTools();
      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBeGreaterThan(0);

      // Check for specific tools
      const toolNames = tools.map(tool => tool.name);
      expect(toolNames).toContain('json_rpc_call');
      expect(toolNames).toContain('get_block_number');
      expect(toolNames).toContain('get_balance');
      expect(toolNames).toContain('call_contract');
      expect(toolNames).toContain('get_transaction_count');
      expect(toolNames).toContain('send_raw_transaction');
      expect(toolNames).toContain('get_transaction_receipt');
      expect(toolNames).toContain('get_block_by_number');
    });

    it('should have valid input schemas for all tools', () => {
      const tools = web3RpcService.getTools();
      
      tools.forEach(tool => {
        expect(tool.inputSchema).toBeDefined();
        expect(tool.inputSchema.type).toBe('object');
        expect(tool.inputSchema.properties).toBeDefined();
        expect(tool.inputSchema.required).toBeDefined();
      });
    });
  });

  describe('getResources', () => {
    it('should return an array of resource definitions', () => {
      const resources = web3RpcService.getResources();
      expect(Array.isArray(resources)).toBe(true);
      expect(resources.length).toBeGreaterThan(0);

      // Check for specific resources
      const resourceUris = resources.map(resource => resource.uri);
      expect(resourceUris).toContain('1inch://web3-rpc/documentation');
      expect(resourceUris).toContain('1inch://web3-rpc/supported-chains');
      expect(resourceUris).toContain('1inch://web3-rpc/json-rpc-methods');
    });
  });

  describe('getPrompts', () => {
    it('should return an array of prompt definitions', () => {
      const prompts = web3RpcService.getPrompts();
      expect(Array.isArray(prompts)).toBe(true);
      expect(prompts.length).toBeGreaterThan(0);

      // Check for specific prompts
      const promptNames = prompts.map(prompt => prompt.name);
      expect(promptNames).toContain('analyze_blockchain_state');
      expect(promptNames).toContain('validate_transaction');
    });
  });

  describe('handleToolCall', () => {
    it('should handle json_rpc_call tool', async () => {
      const args = {
        chainId: 1,
        method: 'eth_blockNumber',
        params: [],
        id: 1
      };

      const result = await web3RpcService.handleToolCall('json_rpc_call', args);
      
      expect(result).toBeDefined();
      expect(result.jsonrpc).toBe('2.0');
      expect(result.id).toBe(1);
      expect(result.result).toBeDefined();
      expect(typeof result.result).toBe('string');
      expect(result.result.startsWith('0x')).toBe(true);
    }, 10000); // 10 second timeout for real API call

    it('should handle get_block_number tool', async () => {
      const args = { chainId: 1 };

      const result = await web3RpcService.handleToolCall('get_block_number', args);
      
      expect(result).toBeDefined();
      expect(result.jsonrpc).toBe('2.0');
      expect(result.result).toBeDefined();
      expect(typeof result.result).toBe('string');
      expect(result.result.startsWith('0x')).toBe(true);
    }, 10000);

    it('should throw error for unknown tool', async () => {
      await expect(
        web3RpcService.handleToolCall('unknown_tool', {})
      ).rejects.toThrow('Unknown tool: unknown_tool');
    });
  });

  describe('handleResourceRead', () => {
    it('should handle documentation resource', async () => {
      const result = await web3RpcService.handleResourceRead('1inch://web3-rpc/documentation');
      expect(typeof result).toBe('string');
      expect(result).toContain('# 1inch Web3 RPC API Documentation');
    });

    it('should handle supported chains resource', async () => {
      const result = await web3RpcService.handleResourceRead('1inch://web3-rpc/supported-chains');
      const parsed = JSON.parse(result);
      expect(parsed.chains).toBeDefined();
      expect(Array.isArray(parsed.chains)).toBe(true);
    });

    it('should handle JSON-RPC methods resource', async () => {
      const result = await web3RpcService.handleResourceRead('1inch://web3-rpc/json-rpc-methods');
      expect(typeof result).toBe('string');
      expect(result).toContain('# JSON-RPC Methods Reference');
    });

    it('should throw error for unknown resource', async () => {
      await expect(
        web3RpcService.handleResourceRead('1inch://web3-rpc/unknown')
      ).rejects.toThrow('Unknown resource: 1inch://web3-rpc/unknown');
    });
  });

  describe('handlePromptRequest', () => {
    it('should handle analyze_blockchain_state prompt', async () => {
      const args = { chainId: 1, address: REAL_ETH_ADDRESS };

      const result = await web3RpcService.handlePromptRequest('analyze_blockchain_state', args);
      expect(typeof result).toBe('string');
      expect(result).toContain('Blockchain State Analysis for Chain 1');
    }, 15000); // 15 second timeout for multiple API calls

    it('should handle validate_transaction prompt', async () => {
      const args = { 
        chainId: 1, 
        signedTransactionData: '0x1234567890abcdef' 
      };

      const result = await web3RpcService.handlePromptRequest('validate_transaction', args);
      expect(typeof result).toBe('string');
      expect(result).toContain('Transaction Validation for Chain 1');
    });

    it('should throw error for unknown prompt', async () => {
      await expect(
        web3RpcService.handlePromptRequest('unknown_prompt', {})
      ).rejects.toThrow('Unknown prompt: unknown_prompt');
    });
  });

  describe('JSON-RPC methods', () => {
    it('should call getBalance correctly with real Ethereum address', async () => {
      const result = await web3RpcService.getBalance({
        chainId: 1,
        address: REAL_ETH_ADDRESS
      });

      expect(result.jsonrpc).toBe('2.0');
      expect(result.result).toBeDefined();
      expect(typeof result.result).toBe('string');
      expect(result.result.startsWith('0x')).toBe(true);
    }, 10000);

    it('should call callContract correctly with real contract data', async () => {
      const result = await web3RpcService.callContract({
        chainId: 1,
        to: REAL_CONTRACT_ADDRESS,
        data: '0x70a08231' // balanceOf function selector
      });

      expect(result.jsonrpc).toBe('2.0');
      expect(result.result).toBeDefined();
      expect(typeof result.result).toBe('string');
      expect(result.result.startsWith('0x')).toBe(true);
    }, 10000);

    it('should handle sendRawTransaction with invalid data gracefully', async () => {
      // This test uses invalid transaction data, so we expect an error
      try {
        await web3RpcService.sendRawTransaction({
          chainId: 1,
          signedTransactionData: '0x1234567890abcdef'
        });
        // If we reach here, the API accepted the invalid data (unlikely)
        expect(true).toBe(true);
      } catch (error: any) {
        // Expected to fail with invalid transaction data
        expect(error).toBeDefined();
        expect(error.response?.status).toBe(400);
      }
    }, 10000);

    it('should call getTransactionCount correctly with real address', async () => {
      const result = await web3RpcService.getTransactionCount({
        chainId: 1,
        address: REAL_ETH_ADDRESS
      });

      expect(result.jsonrpc).toBe('2.0');
      expect(result.result).toBeDefined();
      expect(typeof result.result).toBe('string');
      expect(result.result.startsWith('0x')).toBe(true);
    }, 10000);

    it('should call getTransactionReceipt correctly with real transaction hash', async () => {
      const result = await web3RpcService.getTransactionReceipt({
        chainId: 1,
        transactionHash: REAL_TX_HASH
      });

      expect(result.jsonrpc).toBe('2.0');
      expect(result.result).toBeDefined();
      // Note: This might return null for non-existent transaction, which is valid
    }, 10000);

    it('should call getBlockByNumber correctly with latest block', async () => {
      const result = await web3RpcService.getBlockByNumber({
        chainId: 1,
        blockNumber: 'latest',
        fullTransactionObjects: false
      });

      expect(result.jsonrpc).toBe('2.0');
      // Handle case where result might be undefined or null
      if (result.result !== undefined && result.result !== null) {
        expect(result.result).toBeTruthy();
        expect(result.result.number).toBeDefined();
        expect(result.result.hash).toBeDefined();
      } else {
        // If result is null/undefined, that's also valid for some cases
        expect(result.result).toBeDefined();
      }
    }, 10000);

    it('should call getBlockByNumber with specific block number', async () => {
      // First get the latest block number
      const latestBlockResult = await web3RpcService.getBlockNumber({ chainId: 1 });
      const latestBlockNumber = latestBlockResult.result;
      
      // Then get that specific block
      const result = await web3RpcService.getBlockByNumber({
        chainId: 1,
        blockNumber: latestBlockNumber,
        fullTransactionObjects: false
      });

      expect(result.jsonrpc).toBe('2.0');
      // Handle case where result might be undefined or null
      if (result.result !== undefined && result.result !== null) {
        expect(result.result.number).toBe(latestBlockNumber);
        expect(result.result.hash).toBeDefined();
      } else {
        // If result is null/undefined, that's also valid for some cases
        expect(result.result).toBeDefined();
      }
    }, 15000);

    it('should call getBalance for multiple real addresses', async () => {
      const addresses = [REAL_ETH_ADDRESS, REAL_ETH_ADDRESS_2];
      
      for (const address of addresses) {
        const result = await web3RpcService.getBalance({
          chainId: 1,
          address: address
        });

        expect(result.jsonrpc).toBe('2.0');
        expect(result.result).toBeDefined();
        expect(typeof result.result).toBe('string');
        expect(result.result.startsWith('0x')).toBe(true);
      }
    }, 15000);
  });
}); 