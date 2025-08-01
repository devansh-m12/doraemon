import { TracesService } from '../src/services/traces/TracesService';
import { config } from '../src/config/index';

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
    it('should get synced interval for ethereum', async () => {
      const result = await tracesService.getSyncedInterval({ chain: 'ethereum' });
      
      expect(result).toBeDefined();
      expect(result.chain).toBe('ethereum');
      expect(result.fromBlock).toBeDefined();
      expect(result.toBlock).toBeDefined();
      expect(typeof result.fromBlock).toBe('number');
      expect(typeof result.toBlock).toBe('number');
    });

    it('should get synced interval for arbitrum', async () => {
      const result = await tracesService.getSyncedInterval({ chain: 'arbitrum' });
      
      expect(result).toBeDefined();
      expect(result.chain).toBe('arbitrum');
      expect(result.fromBlock).toBeDefined();
      expect(result.toBlock).toBeDefined();
    });
  });

  describe('getBlockTrace', () => {
    it('should get block trace for a valid block', async () => {
      // First get synced interval to find a valid block
      const syncedInterval = await tracesService.getSyncedInterval({ chain: 'ethereum' });
      const validBlockNumber = syncedInterval.fromBlock;
      
      const result = await tracesService.getBlockTrace({ 
        chain: 'ethereum', 
        blockNumber: validBlockNumber 
      });
      
      expect(result).toBeDefined();
      expect(result.blockNumber).toBe(validBlockNumber);
      expect(result.chain).toBe('ethereum');
      expect(Array.isArray(result.traces)).toBe(true);
    });

    it('should handle invalid block number gracefully', async () => {
      const invalidBlockNumber = 999999999;
      
      await expect(
        tracesService.getBlockTrace({ 
          chain: 'ethereum', 
          blockNumber: invalidBlockNumber 
        })
      ).rejects.toThrow();
    });
  });

  describe('getTransactionTraceByHash', () => {
    it('should get transaction trace by hash', async () => {
      // First get a block trace to find a valid transaction
      const syncedInterval = await tracesService.getSyncedInterval({ chain: 'ethereum' });
      const validBlockNumber = syncedInterval.fromBlock;
      
      const blockTrace = await tracesService.getBlockTrace({ 
        chain: 'ethereum', 
        blockNumber: validBlockNumber 
      });
      
      if (blockTrace.traces.length > 0) {
        const firstTx = blockTrace.traces[0];
        
        if (firstTx) {
          const result = await tracesService.getTransactionTraceByHash({
            chain: 'ethereum',
            blockNumber: validBlockNumber,
            txHash: firstTx.txHash
          });
          
          expect(result).toBeDefined();
          expect(result.txHash).toBe(firstTx.txHash);
          expect(result.blockNumber).toBe(validBlockNumber);
          expect(result.chain).toBe('ethereum');
          expect(Array.isArray(result.trace)).toBe(true);
        }
      }
    });
  });

  describe('getTransactionTraceByOffset', () => {
    it('should get transaction trace by offset', async () => {
      // First get a block trace to find a valid transaction
      const syncedInterval = await tracesService.getSyncedInterval({ chain: 'ethereum' });
      const validBlockNumber = syncedInterval.fromBlock;
      
      const blockTrace = await tracesService.getBlockTrace({ 
        chain: 'ethereum', 
        blockNumber: validBlockNumber 
      });
      
      if (blockTrace.traces.length > 0) {
        const firstTx = blockTrace.traces[0];
        
        if (firstTx) {
          const result = await tracesService.getTransactionTraceByOffset({
            chain: 'ethereum',
            blockNumber: validBlockNumber,
            txOffset: firstTx.txOffset
          });
          
          expect(result).toBeDefined();
          expect(result.txHash).toBe(firstTx.txHash);
          expect(result.blockNumber).toBe(validBlockNumber);
          expect(result.chain).toBe('ethereum');
          expect(Array.isArray(result.trace)).toBe(true);
        }
      }
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
      const result = await tracesService.handleToolCall('get_synced_interval', { chain: 'ethereum' });
      
      expect(result).toBeDefined();
      expect(result.chain).toBe('ethereum');
    });

    it('should throw error for unknown tool', async () => {
      await expect(
        tracesService.handleToolCall('unknown_tool', {})
      ).rejects.toThrow('Unknown tool: unknown_tool');
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
    });

    it('should throw error for unknown resource', async () => {
      await expect(
        tracesService.handleResourceRead('1inch://traces/unknown')
      ).rejects.toThrow('Unknown resource: 1inch://traces/unknown');
    });
  });

  describe('Prompt handling', () => {
    it('should handle analyze_block_traces prompt', async () => {
      const syncedInterval = await tracesService.getSyncedInterval({ chain: 'ethereum' });
      const validBlockNumber = syncedInterval.fromBlock;
      
      const result = await tracesService.handlePromptRequest('analyze_block_traces', {
        chain: 'ethereum',
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