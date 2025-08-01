import { ServiceOrchestrator } from '../../src/services/ServiceOrchestrator';

// Mock the config module
jest.mock('../../src/config/index', () => ({
  config: {
    oneInch: {
      baseUrl: 'https://api.1inch.dev',
      apiKey: 'test-api-key',
      timeout: 30000
    },
    server: {
      logLevel: 'info'
    }
  }
}));

// Mock the logger module
jest.mock('../../src/config/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn()
  }
}));

describe('ServiceOrchestrator', () => {
  let orchestrator: ServiceOrchestrator;

  beforeEach(() => {
    orchestrator = new ServiceOrchestrator();
  });

  describe('initialization', () => {
    it('should initialize with swap and token services', () => {
      const serviceNames = orchestrator.getServiceNames();
      
      expect(serviceNames).toContain('swap');
      expect(serviceNames).toContain('token');
      expect(serviceNames).toHaveLength(2);
    });

    it('should get services by name', () => {
      const swapService = orchestrator.getService('swap');
      const tokenService = orchestrator.getService('token');
      const unknownService = orchestrator.getService('unknown');
      
      expect(swapService).toBeDefined();
      expect(tokenService).toBeDefined();
      expect(unknownService).toBeUndefined();
    });
  });

  describe('getAllTools', () => {
    it('should return tools from all services', () => {
      const tools = orchestrator.getAllTools();
      
      // Should have tools from both swap and token services
      expect(tools.length).toBeGreaterThan(0);
      
      const toolNames = tools.map(tool => tool.name);
      
      // Check for swap tools
      expect(toolNames).toContain('get_swap_quote');
      expect(toolNames).toContain('get_swap_transaction');
      expect(toolNames).toContain('get_token_allowance');
      expect(toolNames).toContain('get_approve_transaction');
      
      // Check for token tools
      expect(toolNames).toContain('get_token_info');
      expect(toolNames).toContain('search_tokens');
      expect(toolNames).toContain('get_token_price');
      expect(toolNames).toContain('get_token_balances');
    });
  });

  describe('getAllResources', () => {
    it('should return resources from all services', () => {
      const resources = orchestrator.getAllResources();
      
      expect(resources.length).toBeGreaterThan(0);
      
      const resourceUris = resources.map(resource => resource.uri);
      
      // Check for swap resources
      expect(resourceUris).toContain('1inch://swap/documentation');
      expect(resourceUris).toContain('1inch://swap/supported-chains');
      
      // Check for token resources
      expect(resourceUris).toContain('1inch://token/documentation');
      expect(resourceUris).toContain('1inch://token/popular-tokens');
    });
  });

  describe('getAllPrompts', () => {
    it('should return prompts from all services', () => {
      const prompts = orchestrator.getAllPrompts();
      
      expect(prompts.length).toBeGreaterThan(0);
      
      const promptNames = prompts.map(prompt => prompt.name);
      
      // Check for swap prompts
      expect(promptNames).toContain('swap_tokens');
      
      // Check for token prompts
      expect(promptNames).toContain('token_analysis');
    });
  });

  describe('handleToolCall', () => {
    it('should route swap tool calls to swap service', async () => {
      const mockArgs = {
        chainId: 1,
        src: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        dst: '0xA0b86a33E6E4B8b5f8c1e9d6b2a8c3e7f9d5c8a7',
        amount: '1000000000000000000',
        from: '0x1234567890123456789012345678901234567890'
      };

      // Mock the swap service's handleToolCall method
      const swapService = orchestrator.getService('swap');
      const mockHandleToolCall = jest.spyOn(swapService!, 'handleToolCall').mockResolvedValue({
        toTokenAmount: '1000000',
        fromTokenAmount: '1000000000000000000'
      });

      const result = await orchestrator.handleToolCall('get_swap_quote', mockArgs);
      
      expect(mockHandleToolCall).toHaveBeenCalledWith('get_swap_quote', mockArgs);
      expect(result).toBeDefined();
    });

    it('should route token tool calls to token service', async () => {
      const mockArgs = {
        chainId: 1,
        tokenAddress: '0xA0b86a33E6E4B8b5f8c1e9d6b2a8c3e7f9d5c8a7'
      };

      // Mock the token service's handleToolCall method
      const tokenService = orchestrator.getService('token');
      const mockHandleToolCall = jest.spyOn(tokenService!, 'handleToolCall').mockResolvedValue({
        symbol: 'USDC',
        name: 'USD Coin'
      });

      const result = await orchestrator.handleToolCall('get_token_info', mockArgs);
      
      expect(mockHandleToolCall).toHaveBeenCalledWith('get_token_info', mockArgs);
      expect(result).toBeDefined();
    });

    it('should throw error for unknown tool', async () => {
      await expect(
        orchestrator.handleToolCall('unknown_tool', {})
      ).rejects.toThrow('Unknown tool: unknown_tool');
    });
  });

  describe('handleResourceRead', () => {
    it('should route swap resources to swap service', async () => {
      const swapService = orchestrator.getService('swap');
      const mockHandleResourceRead = jest.spyOn(swapService!, 'handleResourceRead').mockResolvedValue({
        contents: [{ uri: '1inch://swap/documentation', mimeType: 'text/markdown', text: 'test' }]
      });

      const result = await orchestrator.handleResourceRead('1inch://swap/documentation');
      
      expect(mockHandleResourceRead).toHaveBeenCalledWith('1inch://swap/documentation');
      expect(result).toBeDefined();
    });

    it('should route token resources to token service', async () => {
      const tokenService = orchestrator.getService('token');
      const mockHandleResourceRead = jest.spyOn(tokenService!, 'handleResourceRead').mockResolvedValue({
        contents: [{ uri: '1inch://token/documentation', mimeType: 'text/markdown', text: 'test' }]
      });

      const result = await orchestrator.handleResourceRead('1inch://token/documentation');
      
      expect(mockHandleResourceRead).toHaveBeenCalledWith('1inch://token/documentation');
      expect(result).toBeDefined();
    });

    it('should throw error for unknown resource', async () => {
      await expect(
        orchestrator.handleResourceRead('1inch://unknown/resource')
      ).rejects.toThrow('Unknown resource: 1inch://unknown/resource');
    });
  });

  describe('handlePromptRequest', () => {
    it('should route swap prompts to swap service', async () => {
      const swapService = orchestrator.getService('swap');
      const mockHandlePromptRequest = jest.spyOn(swapService!, 'handlePromptRequest').mockResolvedValue({
        description: 'Token swap assistant',
        messages: []
      });

      const result = await orchestrator.handlePromptRequest('swap_tokens', {});
      
      expect(mockHandlePromptRequest).toHaveBeenCalledWith('swap_tokens', {});
      expect(result).toBeDefined();
    });

    it('should route token prompts to token service', async () => {
      const tokenService = orchestrator.getService('token');
      const mockHandlePromptRequest = jest.spyOn(tokenService!, 'handlePromptRequest').mockResolvedValue({
        description: 'Token analysis assistant',
        messages: []
      });

      const result = await orchestrator.handlePromptRequest('token_analysis', {});
      
      expect(mockHandlePromptRequest).toHaveBeenCalledWith('token_analysis', {});
      expect(result).toBeDefined();
    });

    it('should throw error for unknown prompt', async () => {
      await expect(
        orchestrator.handlePromptRequest('unknown_prompt', {})
      ).rejects.toThrow('Unknown prompt: unknown_prompt');
    });
  });

  describe('healthCheck', () => {
    it('should perform health check on all services', async () => {
      // Mock the makeRequest method for health checks
      const swapService = orchestrator.getService('swap');
      const tokenService = orchestrator.getService('token');
      
      jest.spyOn(swapService as any, 'makeRequest').mockResolvedValue({ status: 'ok' });
      jest.spyOn(tokenService as any, 'makeRequest').mockResolvedValue({ status: 'ok' });

      const healthStatus = await orchestrator.healthCheck();
      
      expect(healthStatus).toBeDefined();
      expect(healthStatus.status).toBe('healthy');
      expect(healthStatus.services).toHaveProperty('swap');
      expect(healthStatus.services).toHaveProperty('token');
      expect(healthStatus.timestamp).toBeDefined();
    });

    it('should handle service failures gracefully', async () => {
      const swapService = orchestrator.getService('swap');
      const tokenService = orchestrator.getService('token');
      
      jest.spyOn(swapService as any, 'makeRequest').mockRejectedValue(new Error('Service unavailable'));
      jest.spyOn(tokenService as any, 'makeRequest').mockResolvedValue({ status: 'ok' });

      const healthStatus = await orchestrator.healthCheck();
      
      expect(healthStatus.status).toBe('degraded');
      expect(healthStatus.services.swap.status).toBe('unhealthy');
      expect(healthStatus.services.token.status).toBe('healthy');
    });
  });
}); 