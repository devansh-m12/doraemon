import { PortfolioService } from '../src/services/portfolio/PortfolioService';
import { config } from '../src/config/index';
import { describe, it, beforeEach, expect, jest, beforeAll } from '@jest/globals';

describe('PortfolioService', () => {
  let portfolioService: PortfolioService;

  beforeEach(() => {
    const serviceConfig = {
      baseUrl: config.oneInch.baseUrl,
      apiKey: config.oneInch.apiKey,
      timeout: config.oneInch.timeout
    };
    portfolioService = new PortfolioService(serviceConfig);
  });

  describe('Service Status', () => {
    it('should check service status', async () => {
      const result = await portfolioService.handleToolCall('check_service_status', {});
      console.log('Service Status:', result);
      expect(result).toBeDefined();
    });
  });

  describe('Supported Chains', () => {
    it('should get supported chains', async () => {
      const result = await portfolioService.handleToolCall('get_supported_chains', {});
      console.log('Supported Chains:', result);
      expect(result).toBeDefined();
      expect(result.chains).toBeDefined();
      expect(Array.isArray(result.chains)).toBe(true);
    });
  });

  describe('Supported Protocols', () => {
    it('should get supported protocols', async () => {
      const result = await portfolioService.handleToolCall('get_supported_protocols', {});
      console.log('Supported Protocols:', result);
      expect(result).toBeDefined();
      expect(result.protocols).toBeDefined();
      expect(Array.isArray(result.protocols)).toBe(true);
    });
  });

  describe('Compliance Check', () => {
    it('should check compliance for addresses', async () => {
      const testAddresses = ['0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'];
      const result = await portfolioService.handleToolCall('check_compliance', {
        addresses: testAddresses
      });
      console.log('Compliance Check:', result);
      expect(result).toBeDefined();
    });
  });

  describe('Current Portfolio Value', () => {
    it('should get current portfolio value', async () => {
      const testAddresses = ['0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'];
      const result = await portfolioService.handleToolCall('get_current_portfolio_value', {
        addresses: testAddresses
      });
      console.log('Current Portfolio Value:', result);
      expect(result).toBeDefined();
    });

    it('should get current portfolio value with filters', async () => {
      const testAddresses = ['0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'];
      const result = await portfolioService.handleToolCall('get_current_portfolio_value', {
        addresses: testAddresses,
        chains: [1], // Ethereum
        protocols: ['uniswap_v3']
      });
      console.log('Current Portfolio Value (Filtered):', result);
      expect(result).toBeDefined();
    });
  });

  describe('Value Chart', () => {
    it('should get value chart data', async () => {
      const from = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60); // 7 days ago
      const to = Math.floor(Date.now() / 1000); // now
      const testAddresses = ['0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'];
      
      const result = await portfolioService.handleToolCall('get_value_chart', {
        from,
        to,
        addresses: testAddresses,
        interval: 'day'
      });
      console.log('Value Chart:', result);
      expect(result).toBeDefined();
    });
  });

  describe('Overview Report', () => {
    it('should get overview report', async () => {
      const testAddresses = ['0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'];
      const result = await portfolioService.handleToolCall('get_overview_report', {
        addresses: testAddresses
      });
      console.log('Overview Report:', result);
      expect(result).toBeDefined();
    });
  });

  describe('Protocols Snapshot', () => {
    it('should get protocols snapshot', async () => {
      const testAddresses = ['0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'];
      const result = await portfolioService.handleToolCall('get_protocols_snapshot', {
        addresses: testAddresses
      });
      console.log('Protocols Snapshot:', result);
      expect(result).toBeDefined();
    });
  });

  describe('Protocols Metrics', () => {
    it('should get protocols metrics', async () => {
      const testAddresses = ['0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'];
      const result = await portfolioService.handleToolCall('get_protocols_metrics', {
        addresses: testAddresses
      });
      console.log('Protocols Metrics:', result);
      expect(result).toBeDefined();
    });
  });

  describe('Tokens Snapshot', () => {
    it('should get tokens snapshot', async () => {
      const testAddresses = ['0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'];
      const result = await portfolioService.handleToolCall('get_tokens_snapshot', {
        addresses: testAddresses
      });
      console.log('Tokens Snapshot:', result);
      expect(result).toBeDefined();
    });
  });

  describe('Tokens Metrics', () => {
    it('should get tokens metrics', async () => {
      const testAddresses = ['0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'];
      const result = await portfolioService.handleToolCall('get_tokens_metrics', {
        addresses: testAddresses
      });
      console.log('Tokens Metrics:', result);
      expect(result).toBeDefined();
    });
  });

  describe('Resources', () => {
    it('should get portfolio documentation', async () => {
      const result = await portfolioService.handleResourceRead('1inch://portfolio/documentation');
      console.log('Portfolio Documentation Length:', result.length);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should get supported chains resource', async () => {
      const result = await portfolioService.handleResourceRead('1inch://portfolio/supported-chains');
      console.log('Supported Chains Resource:', result);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should get supported protocols resource', async () => {
      const result = await portfolioService.handleResourceRead('1inch://portfolio/supported-protocols');
      console.log('Supported Protocols Resource:', result);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('Prompts', () => {
    it('should analyze portfolio performance', async () => {
      const testAddresses = ['0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'];
      const result = await portfolioService.handlePromptRequest('analyze_portfolio_performance', {
        addresses: testAddresses,
        timeframe: '7d'
      });
      console.log('Portfolio Performance Analysis:', result);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should generate portfolio report', async () => {
      const testAddresses = ['0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'];
      const result = await portfolioService.handlePromptRequest('generate_portfolio_report', {
        addresses: testAddresses,
        include_historical: true
      });
      console.log('Portfolio Report:', result);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('Tools', () => {
    it('should return all tools', () => {
      const tools = portfolioService.getTools();
      console.log('Portfolio Tools:', tools.map(t => t.name));
      expect(tools).toBeDefined();
      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBeGreaterThan(0);
    });
  });

  describe('Resources', () => {
    it('should return all resources', () => {
      const resources = portfolioService.getResources();
      console.log('Portfolio Resources:', resources.map(r => r.name));
      expect(resources).toBeDefined();
      expect(Array.isArray(resources)).toBe(true);
      expect(resources.length).toBeGreaterThan(0);
    });
  });

  describe('Prompts', () => {
    it('should return all prompts', () => {
      const prompts = portfolioService.getPrompts();
      console.log('Portfolio Prompts:', prompts.map(p => p.name));
      expect(prompts).toBeDefined();
      expect(Array.isArray(prompts)).toBe(true);
      expect(prompts.length).toBeGreaterThan(0);
    });
  });
}); 