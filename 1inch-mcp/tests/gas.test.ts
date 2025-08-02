import { GasService } from '../src/services/gas/GasService';
import { config } from '../src/config/index';
import { describe, it, beforeEach, expect, jest, beforeAll } from '@jest/globals';

describe('GasService', () => {
  let gasService: GasService;

  beforeAll(() => {
    const serviceConfig = {
      baseUrl: config.oneInch.baseUrl,
      apiKey: config.oneInch.apiKey,
      timeout: config.oneInch.timeout
    };
    gasService = new GasService(serviceConfig);
  });

  describe('getTools', () => {
    it('should return gas-related tools', () => {
      const tools = gasService.getTools();
      
      expect(tools).toHaveLength(2);
      expect(tools[0]?.name).toBe('get_gas_price');
      expect(tools[1]?.name).toBe('analyze_gas_price');
      
      // Check input schemas
      expect(tools[0]?.inputSchema.properties.chain).toBeDefined();
      expect(tools[1]?.inputSchema.properties.chain).toBeDefined();
      expect(tools[1]?.inputSchema.properties.priority).toBeDefined();
    });
  });

  describe('getResources', () => {
    it('should return gas-related resources', () => {
      const resources = gasService.getResources();
      
      expect(resources).toHaveLength(2);
      expect(resources[0]?.uri).toBe('1inch://gas/documentation');
      expect(resources[1]?.uri).toBe('1inch://gas/supported-chains');
    });
  });

  describe('getPrompts', () => {
    it('should return gas-related prompts', () => {
      const prompts = gasService.getPrompts();
      
      expect(prompts).toHaveLength(1);
      expect(prompts[0]?.name).toBe('get_gas_recommendation');
    });
  });

  describe('handleToolCall', () => {
    it('should handle get_gas_price tool call', async () => {
      const result = await gasService.handleToolCall('get_gas_price', { chain: 1 });
      console.log(result);
      
      expect(result).toBeDefined();
      expect(result.baseFee).toBeDefined();
      expect(result.low).toBeDefined();
      expect(result.medium).toBeDefined();
      expect(result.high).toBeDefined();
      expect(result.instant).toBeDefined();
    });

    it('should throw error for unknown tool', async () => {
      await expect(
        gasService.handleToolCall('unknown_tool', {})
      ).rejects.toThrow('Unknown tool: unknown_tool');
    });
  });

  describe('handleResourceRead', () => {
    it('should return gas documentation', async () => {
      const result = await gasService.handleResourceRead('1inch://gas/documentation');
      
      expect(typeof result).toBe('string');
      expect(result).toContain('# 1inch Gas Price API Documentation');
      expect(result).toContain('EIP-1559 Gas Model');
    });

    it('should return supported chains', async () => {
      const result = await gasService.handleResourceRead('1inch://gas/supported-chains');
      
      const parsed = JSON.parse(result);
      expect(parsed.chains).toBeDefined();
      expect(Array.isArray(parsed.chains)).toBe(true);
      expect(parsed.chains.some((chain: any) => chain.id === 1)).toBe(true);
    });

    it('should throw error for unknown resource', async () => {
      await expect(
        gasService.handleResourceRead('1inch://gas/unknown')
      ).rejects.toThrow('Unknown resource: 1inch://gas/unknown');
    });
  });

  describe('handlePromptRequest', () => {
    it('should throw error for unknown prompt', async () => {
      await expect(
        gasService.handlePromptRequest('unknown_prompt', {})
      ).rejects.toThrow('Unknown prompt: unknown_prompt');
    });
  });
}); 