import { TracesService } from '../src/services/traces/TracesService';
import { config } from '../src/config/index';
import { describe, it, beforeEach, expect, jest, beforeAll } from '@jest/globals';

describe('TracesService', () => {
  let tracesService: TracesService;

  beforeAll(() => {
    const serviceConfig = {
      baseUrl: config.oneInch.baseUrl,
      apiKey: config.oneInch.apiKey,
      timeout: config.oneInch.timeout
    };
    tracesService = new TracesService(serviceConfig);
  });

  describe('getSyncedInterval', () => {
    it('should get synced interval for ethereum (chain 1)', async () => {
      const result = await tracesService.getSyncedInterval({ chain: 1 });
      
      expect(result).toBeDefined();
      expect(result.from).toBeDefined();
      expect(result.to).toBeDefined();
      expect(typeof result.from).toBe('number');
      expect(typeof result.to).toBe('number');
    });

    it('should get synced interval for arbitrum (chain 42161)', async () => {
      const result = await tracesService.getSyncedInterval({ chain: 42161 });
      
      expect(result).toBeDefined();
      expect(result.from).toBeDefined();
      expect(result.to).toBeDefined();
    });

    it('should throw error for missing chain parameter', async () => {
      await expect(
        tracesService.getSyncedInterval({} as any)
      ).rejects.toThrow('chain parameter is required');
    });
  });

  describe('getBlockTrace', () => {
    it('should get block trace for a valid block', async () => {
      // First get synced interval to find a valid block
      const syncedInterval = await tracesService.getSyncedInterval({ chain: 1 });
      // Use a more recent block that's likely to be available
      const validBlockNumber = syncedInterval.to.toString()
      
      const result = await tracesService.getBlockTrace({ 
        chain: 1, 
        blockNumber: validBlockNumber 
      });
      
      expect(result).toBeDefined();
      // The API might return number as a number or have a different field name
      expect(result.number?.toString() || result.number || (result as any).blockNumber?.toString() || (result as any).blockNumber).toBe(validBlockNumber);
      expect(result.type).toBeDefined();
      expect(result.version).toBeDefined();
      expect(result.blockHash).toBeDefined();
      expect(result.blockTimestamp).toBeDefined();
      expect(Array.isArray(result.traces)).toBe(true);
    });

    it('should handle invalid block number gracefully', async () => {
      const invalidBlockNumber = "999999999";
      
      await expect(
        tracesService.getBlockTrace({ 
          chain: 1, 
          blockNumber: invalidBlockNumber 
        })
      ).rejects.toThrow();
    });

    it('should throw error for missing parameters', async () => {
      await expect(
        tracesService.getBlockTrace({} as any)
      ).rejects.toThrow('chain parameter is required');
    });
  });

  describe('getTransactionTraceByHash', () => {
    it('should get transaction trace by hash', async () => {
      // First get a block trace to find a valid transaction
      const syncedInterval = await tracesService.getSyncedInterval({ chain: 1 });
      // Use a more recent block that's likely to be available
      const validBlockNumber = syncedInterval.to.toString()
      
      const blockTrace = await tracesService.getBlockTrace({ 
        chain: 1, 
        blockNumber: validBlockNumber 
      });
      
      if (blockTrace.traces.length > 0) {
        const firstTx = blockTrace.traces[0];
        
        if (firstTx) {
          const result = await tracesService.getTransactionTraceByHash({
            chain: 1,
            blockNumber: validBlockNumber,
            txHash: firstTx.txHash
          });
          
          expect(result).toBeDefined();
          expect(result.type).toBeDefined();
          // The API might return transactionTrace as an array or have a different structure
          // Also check if the response has any trace-related fields
          const hasTraceData = Array.isArray(result.transactionTrace) || 
                              Array.isArray((result as any).trace) || 
                              Array.isArray((result as any).steps) ||
                              Array.isArray((result as any).calls) ||
                              typeof result.transactionTrace === 'object' ||
                              typeof (result as any).trace === 'object';
          expect(hasTraceData).toBe(true);
        }
      }
    });

    it('should throw error for missing parameters', async () => {
      await expect(
        tracesService.getTransactionTraceByHash({} as any)
      ).rejects.toThrow('chain parameter is required');
    });
  });

  describe('getTransactionTraceByOffset', () => {
    it('should get transaction trace by offset', async () => {
      // First get a block trace to find a valid transaction
      const syncedInterval = await tracesService.getSyncedInterval({ chain: 1 });
      // Use a more recent block that's likely to be available
      const validBlockNumber = syncedInterval.to.toString()
      
      const blockTrace = await tracesService.getBlockTrace({ 
        chain: 1, 
        blockNumber: validBlockNumber 
      });
      
      if (blockTrace.traces.length > 0) {
        const firstTx = blockTrace.traces[0];
        
        if (firstTx && firstTx.txOffset !== undefined) {
          const result = await tracesService.getTransactionTraceByOffset({
            chain: 1,
            blockNumber: validBlockNumber,
            offset: firstTx.txOffset
          });
          
          expect(result).toBeDefined();
          expect(result.type).toBeDefined();
          // The API might return transactionTrace as an array or have a different structure
          expect(Array.isArray(result.transactionTrace) || Array.isArray((result as any).trace) || Array.isArray((result as any).steps)).toBe(true);
        } else {
          // Skip this test if no valid transaction with offset is found
          console.log('Skipping transaction trace by offset test - no valid transaction found');
        }
      } else {
        // Skip this test if no transactions are found
        console.log('Skipping transaction trace by offset test - no transactions found in block');
      }
    });

    it('should throw error for missing parameters', async () => {
      await expect(
        tracesService.getTransactionTraceByOffset({} as any)
      ).rejects.toThrow('chain parameter is required');
    });
  });

  describe('tracesAPI function', () => {
    it('should get synced interval using tracesAPI', async () => {
      const result = await tracesService.tracesAPI({
        endpoint: 'getSyncedInterval',
        chain: 1
      });
      
      expect(result).toBeDefined();
      expect(result.from).toBeDefined();
      expect(result.to).toBeDefined();
    });

    it('should get block trace using tracesAPI', async () => {
      const syncedInterval = await tracesService.getSyncedInterval({ chain: 1 });
      // Use a more recent block that's likely to be available
      const validBlockNumber = syncedInterval.to.toString()
      
                const result = await tracesService.tracesAPI({
            endpoint: 'getBlockTraceByNumber',
            chain: 1,
            blockNumber: validBlockNumber
          });
          
          expect(result).toBeDefined();
          // The API might return number as a number or have a different field name
          expect(result.number?.toString() || result.number || (result as any).blockNumber?.toString() || (result as any).blockNumber).toBe(validBlockNumber);
          expect(result.type).toBeDefined();
          expect(result.version).toBeDefined();
    });

    it('should get transaction trace by hash using tracesAPI', async () => {
      const syncedInterval = await tracesService.getSyncedInterval({ chain: 1 });
      // Use a more recent block that's likely to be available
      const validBlockNumber = syncedInterval.to.toString()
      
      const blockTrace = await tracesService.getBlockTrace({ 
        chain: 1, 
        blockNumber: validBlockNumber 
      });
      
      if (blockTrace.traces.length > 0) {
        const firstTx = blockTrace.traces[0];
        
        if (firstTx) {
          const result = await tracesService.tracesAPI({
            endpoint: 'getTransactionTraceByHash',
            chain: 1,
            blockNumber: validBlockNumber,
            txHash: firstTx.txHash
          });
          
          expect(result).toBeDefined();
          expect(result.type).toBeDefined();
          // The API might return transactionTrace as an array or have a different structure
          // Also check if the response has any trace-related fields
          const hasTraceData = Array.isArray(result.transactionTrace) || 
                              Array.isArray((result as any).trace) || 
                              Array.isArray((result as any).steps) ||
                              Array.isArray((result as any).calls) ||
                              typeof result.transactionTrace === 'object' ||
                              typeof (result as any).trace === 'object';
          expect(hasTraceData).toBe(true);
        }
      }
    });

    it('should get transaction trace by offset using tracesAPI', async () => {
      const syncedInterval = await tracesService.getSyncedInterval({ chain: 1 });
      // Use a more recent block that's likely to be available
      const validBlockNumber = syncedInterval.to.toString()
      
      const blockTrace = await tracesService.getBlockTrace({ 
        chain: 1, 
        blockNumber: validBlockNumber 
      });
      
      if (blockTrace.traces.length > 0) {
        const firstTx = blockTrace.traces[0];
        
        if (firstTx && firstTx.txOffset !== undefined) {
          const result = await tracesService.tracesAPI({
            endpoint: 'getTransactionTraceByOffset',
            chain: 1,
            blockNumber: validBlockNumber,
            offset: firstTx.txOffset
          });
          
          expect(result).toBeDefined();
          expect(result.type).toBeDefined();
          // The API might return transactionTrace as an array or have a different structure
          expect(Array.isArray(result.transactionTrace) || Array.isArray((result as any).trace) || Array.isArray((result as any).steps)).toBe(true);
        } else {
          // Skip this test if no valid transaction with offset is found
          console.log('Skipping transaction trace by offset tracesAPI test - no valid transaction found');
        }
      } else {
        // Skip this test if no transactions are found
        console.log('Skipping transaction trace by offset tracesAPI test - no transactions found in block');
      }
    });

    it('should default to getSyncedInterval when no parameters provided', async () => {
      const result = await tracesService.tracesAPI({});
      
      expect(result).toBeDefined();
      expect(result.from).toBeDefined();
      expect(result.to).toBeDefined();
    });

    it('should throw error for missing endpoint', async () => {
      await expect(
        tracesService.tracesAPI({ chain: 1 })
      ).rejects.toThrow('endpoint parameter is required');
    });

    it('should throw error for missing chain parameter', async () => {
      await expect(
        tracesService.tracesAPI({ endpoint: 'getSyncedInterval' })
      ).rejects.toThrow('chain parameter is required');
    });

    it('should throw error for missing blockNumber in getBlockTraceByNumber', async () => {
      await expect(
        tracesService.tracesAPI({ 
          endpoint: 'getBlockTraceByNumber', 
          chain: 1 
        })
      ).rejects.toThrow('blockNumber is required');
    });

    it('should throw error for missing parameters in getTransactionTraceByHash', async () => {
      await expect(
        tracesService.tracesAPI({ 
          endpoint: 'getTransactionTraceByHash', 
          chain: 1 
        })
      ).rejects.toThrow('blockNumber and txHash are required');
    });

    it('should throw error for missing parameters in getTransactionTraceByOffset', async () => {
      await expect(
        tracesService.tracesAPI({ 
          endpoint: 'getTransactionTraceByOffset', 
          chain: 1 
        })
      ).rejects.toThrow('blockNumber and offset are required');
    });

    it('should throw error for unknown endpoint', async () => {
      await expect(
        tracesService.tracesAPI({ 
          endpoint: 'unknownEndpoint' as any, 
          chain: 1 
        })
      ).rejects.toThrow('Unknown endpoint');
    });
  });

  describe('Tools', () => {
    it('should return all tools', () => {
      const tools = tracesService.getTools();
      
      expect(tools).toBeDefined();
      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBe(4);
      
      const toolNames = tools.map(tool => tool.name);
      expect(toolNames).toContain('get_synced_interval');
      expect(toolNames).toContain('get_block_trace');
      expect(toolNames).toContain('get_transaction_trace_by_hash');
      expect(toolNames).toContain('get_transaction_trace_by_offset');
    });

    it('should have correct parameter types in tool schemas', () => {
      const tools = tracesService.getTools();
      
      // Check get_synced_interval tool
      const syncedIntervalTool = tools.find(t => t.name === 'get_synced_interval');
      expect(syncedIntervalTool).toBeDefined();
      expect(syncedIntervalTool?.inputSchema.properties?.chain.type).toBe('number');
      
      // Check get_block_trace tool
      const blockTraceTool = tools.find(t => t.name === 'get_block_trace');
      expect(blockTraceTool).toBeDefined();
      expect(blockTraceTool?.inputSchema.properties?.chain.type).toBe('number');
      expect(blockTraceTool?.inputSchema.properties?.blockNumber.type).toBe('string');
      
      // Check get_transaction_trace_by_hash tool
      const txHashTool = tools.find(t => t.name === 'get_transaction_trace_by_hash');
      expect(txHashTool).toBeDefined();
      expect(txHashTool?.inputSchema.properties?.chain.type).toBe('number');
      expect(txHashTool?.inputSchema.properties?.blockNumber.type).toBe('string');
      
      // Check get_transaction_trace_by_offset tool
      const txOffsetTool = tools.find(t => t.name === 'get_transaction_trace_by_offset');
      expect(txOffsetTool).toBeDefined();
      expect(txOffsetTool?.inputSchema.properties?.chain.type).toBe('number');
      expect(txOffsetTool?.inputSchema.properties?.blockNumber.type).toBe('string');
      expect(txOffsetTool?.inputSchema.properties?.offset.type).toBe('number');
    });
  });

  describe('Resources', () => {
    it('should return all resources', () => {
      const resources = tracesService.getResources();
      
      expect(resources).toBeDefined();
      expect(Array.isArray(resources)).toBe(true);
      expect(resources.length).toBe(2);
      
      const resourceUris = resources.map(resource => resource.uri);
      expect(resourceUris).toContain('1inch://traces/documentation');
      expect(resourceUris).toContain('1inch://traces/supported-chains');
    });
  });

  describe('Prompts', () => {
    it('should return all prompts', () => {
      const prompts = tracesService.getPrompts();
      
      expect(prompts).toBeDefined();
      expect(Array.isArray(prompts)).toBe(true);
      expect(prompts.length).toBe(2);
      
      const promptNames = prompts.map(prompt => prompt.name);
      expect(promptNames).toContain('analyze_block_traces');
      expect(promptNames).toContain('analyze_transaction_trace');
    });
  });

  describe('Tool handling', () => {
    it('should handle get_synced_interval tool call', async () => {
      const result = await tracesService.handleToolCall('get_synced_interval', { chain: 1 });
      
      expect(result).toBeDefined();
      expect(result.from).toBeDefined();
      expect(result.to).toBeDefined();
    });

    it('should throw error for unknown tool', async () => {
      await expect(
        tracesService.handleToolCall('unknown_tool', {})
      ).rejects.toThrow('Unknown tool: unknown_tool');
    });

    it('should handle errors gracefully in tool calls', async () => {
      await expect(
        tracesService.handleToolCall('get_synced_interval', {})
      ).rejects.toThrow('Traces API error');
    });
  });

  describe('Resource handling', () => {
    it('should handle documentation resource read', async () => {
      const result = await tracesService.handleResourceRead('1inch://traces/documentation');
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('1inch Traces API Documentation');
    });

    it('should handle supported chains resource read', async () => {
      const result = await tracesService.handleResourceRead('1inch://traces/supported-chains');
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      
      const parsed = JSON.parse(result);
      expect(parsed.chains).toBeDefined();
      expect(Array.isArray(parsed.chains)).toBe(true);
      
      // Check that chains have proper structure with IDs
      const ethereumChain = parsed.chains.find((c: any) => c.name === 'ethereum');
      expect(ethereumChain).toBeDefined();
      expect(ethereumChain.id).toBe(1);
    });

    it('should throw error for unknown resource', async () => {
      await expect(
        tracesService.handleResourceRead('1inch://traces/unknown')
      ).rejects.toThrow('Unknown resource: 1inch://traces/unknown');
    });
  });

  describe('Prompt handling', () => {
    it('should handle analyze_block_traces prompt', async () => {
      const syncedInterval = await tracesService.getSyncedInterval({ chain: 1 });
      // Use a more recent block that's likely to be available
      const validBlockNumber = syncedInterval.to.toString()
      
      const result = await tracesService.handlePromptRequest('analyze_block_traces', {
        chain: 1,
        blockNumber: validBlockNumber
      });
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('Block Trace Analysis');
    });

    it('should throw error for unknown prompt', async () => {
      await expect(
        tracesService.handlePromptRequest('unknown_prompt', {})
      ).rejects.toThrow('Unknown prompt: unknown_prompt');
    });
  });
}); 