import { DomainService } from '../src/services/domain/DomainService';
import { config } from '../src/config/index';
import { BatchDomainResult } from '../src/services/domain/DomainTypes';
import { describe, it, beforeEach, expect, jest, beforeAll } from '@jest/globals';

describe('DomainService', () => {
  let domainService: DomainService;

  beforeEach(() => {
    const serviceConfig = {
      baseUrl: config.oneInch.baseUrl,
      apiKey: config.oneInch.apiKey,
      timeout: config.oneInch.timeout
    };
    domainService = new DomainService(serviceConfig);
  });

  describe('getTools', () => {
    it('should return all domain tools', () => {
      const tools = domainService.getTools();
      expect(tools).toHaveLength(4);
      
      const toolNames = tools.map(tool => tool.name);
      expect(toolNames).toContain('get_domains_by_address');
      expect(toolNames).toContain('get_primary_domain');
      expect(toolNames).toContain('batch_resolve_domains');
      expect(toolNames).toContain('get_domain_providers');
    });

    it('should have correct input schemas', () => {
      const tools = domainService.getTools();
      
      const getDomainsTool = tools.find(t => t.name === 'get_domains_by_address');
      expect(getDomainsTool?.inputSchema.properties).toHaveProperty('address');
      expect(getDomainsTool?.inputSchema.required).toContain('address');

      const batchTool = tools.find(t => t.name === 'batch_resolve_domains');
      expect(batchTool?.inputSchema.properties).toHaveProperty('addresses');
      expect(batchTool?.inputSchema.required).toContain('addresses');

      const providersTool = tools.find(t => t.name === 'get_domain_providers');
      expect(providersTool?.inputSchema.properties).toEqual({});
      expect(providersTool?.inputSchema.required).toEqual([]);
    });
  });

  describe('getResources', () => {
    it('should return domain resources', () => {
      const resources = domainService.getResources();
      expect(resources).toHaveLength(2);
      
      const resourceUris = resources.map(r => r.uri);
      expect(resourceUris).toContain('1inch://domain/documentation');
      expect(resourceUris).toContain('1inch://domain/supported-providers');
    });
  });

  describe('getPrompts', () => {
    it('should return domain prompts', () => {
      const prompts = domainService.getPrompts();
      expect(prompts).toHaveLength(2);
      
      const promptNames = prompts.map(p => p.name);
      expect(promptNames).toContain('analyze_address_domains');
      expect(promptNames).toContain('batch_analyze_domains');
    });
  });

  describe('handleToolCall', () => {
    it('should handle get_domains_by_address', async () => {
      const result = await domainService.handleToolCall('get_domains_by_address', {
        address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' // vitalik.eth
      });

      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('domain');
        expect(result[0]).toHaveProperty('provider');
        expect(result[0]).toHaveProperty('address');
      }
    });

    it('should handle get_primary_domain', async () => {
      const result = await domainService.handleToolCall('get_primary_domain', {
        address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' // vitalik.eth
      });

      console.log(result);

      expect(result).toHaveProperty('domain');
      expect(result).toHaveProperty('provider');
      expect(result).toHaveProperty('address');
    });

    it('should handle batch_resolve_domains', async () => {
      const result = await domainService.handleToolCall('batch_resolve_domains', {
        addresses: [
          '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // vitalik.eth
          '0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326' // rocketpool.eth
        ]
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      result.forEach((item: BatchDomainResult) => {
        expect(item).toHaveProperty('address');
        // domain and provider are optional
        if (item.domain) {
          expect(typeof item.domain).toBe('string');
        }
        if (item.provider) {
          expect(typeof item.provider).toBe('string');
        }
      });
    });

    it('should handle get_domain_providers', async () => {
      const result = await domainService.handleToolCall('get_domain_providers', {});

      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('provider');
      }
    });

    it('should throw error for unknown tool', async () => {
      await expect(
        domainService.handleToolCall('unknown_tool', {})
      ).rejects.toThrow('Unknown tool: unknown_tool');
    });
  });

  describe('handleResourceRead', () => {
    it('should handle domain documentation', async () => {
      const result = await domainService.handleResourceRead('1inch://domain/documentation');
      expect(typeof result).toBe('string');
      expect(result).toContain('# 1inch Domain API Documentation');
    });

    it('should handle supported providers', async () => {
      const result = await domainService.handleResourceRead('1inch://domain/supported-providers');
      const parsed = JSON.parse(result);
      expect(parsed).toHaveProperty('providers');
      expect(Array.isArray(parsed.providers)).toBe(true);
    });

    it('should throw error for unknown resource', async () => {
      await expect(
        domainService.handleResourceRead('1inch://unknown/resource')
      ).rejects.toThrow('Unknown resource: 1inch://unknown/resource');
    });
  });

  describe('handlePromptRequest', () => {
    it('should handle analyze_address_domains', async () => {
      const result = await domainService.handlePromptRequest('analyze_address_domains', {
        address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' // vitalik.eth
      });

      expect(typeof result).toBe('string');
      expect(result).toContain('Domain Analysis for Address');
    });

    it('should handle batch_analyze_domains', async () => {
      const result = await domainService.handlePromptRequest('batch_analyze_domains', {
        addresses: [
          '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // vitalik.eth
          '0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326' // rocketpool.eth
        ]
      });

      expect(typeof result).toBe('string');
      expect(result).toContain('Batch Domain Analysis');
    });

    it('should throw error for unknown prompt', async () => {
      await expect(
        domainService.handlePromptRequest('unknown_prompt', {})
      ).rejects.toThrow('Unknown prompt: unknown_prompt');
    });
  });

  describe('API methods', () => {
    it('should call getDomainsByAddress with correct URL', async () => {
      const result = await domainService.getDomainsByAddress({
        address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' // vitalik.eth
      });

      expect(Array.isArray(result)).toBe(true);
    });

    it('should call getPrimaryDomain with correct URL', async () => {
      const result = await domainService.getPrimaryDomain({
        address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' // vitalik.eth
      });

      expect(result).toHaveProperty('domain');
      expect(result).toHaveProperty('provider');
      expect(result).toHaveProperty('address');
    });

    it('should call batchResolveDomains with correct body', async () => {
      const addresses = [
        '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // vitalik.eth
        '0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326' // rocketpool.eth
      ];

      const result = await domainService.batchResolveDomains({ addresses });

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
    });

    it('should call getDomainProviders with correct URL', async () => {
      const result = await domainService.getDomainProviders({});

      expect(Array.isArray(result)).toBe(true);
    });
  });
}); 