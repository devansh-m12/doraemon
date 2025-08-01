import { ChartsService } from '../src/services/charts/ChartsService';
import { config } from '../src/config/index';

describe('ChartsService', () => {
  let chartsService: ChartsService;

  beforeEach(() => {
    const serviceConfig = {
      baseUrl: config.oneInch.baseUrl,
      apiKey: config.oneInch.apiKey,
      timeout: config.oneInch.timeout
    };
    chartsService = new ChartsService(serviceConfig);
  });

  describe('getTools', () => {
    it('should return the correct tools', () => {
      const tools = chartsService.getTools();
      
      expect(tools).toHaveLength(2);
      
      const lineChartTool = tools.find(tool => tool.name === 'get_line_chart_data');
      expect(lineChartTool).toBeDefined();
      expect(lineChartTool?.description).toContain('historical line chart data');
      
      const candleChartTool = tools.find(tool => tool.name === 'get_candle_chart_data');
      expect(candleChartTool).toBeDefined();
      expect(candleChartTool?.description).toContain('candle (OHLC) chart data');
    });

    it('should have correct input schemas', () => {
      const tools = chartsService.getTools();
      
      tools.forEach(tool => {
        expect(tool.inputSchema).toBeDefined();
        expect(tool.inputSchema.type).toBe('object');
        expect(tool.inputSchema.properties).toBeDefined();
        expect(tool.inputSchema.required).toBeDefined();
        
        // Check required fields
        expect(tool.inputSchema.required).toContain('token0');
        expect(tool.inputSchema.required).toContain('token1');
        expect(tool.inputSchema.required).toContain('chainId');
        
        if (tool.name === 'get_line_chart_data') {
          expect(tool.inputSchema.required).toContain('period');
          const periodProperty = tool.inputSchema.properties.period;
          expect(periodProperty.enum).toEqual(['24H', '1W', '1M', '1Y', 'AllTime']);
        } else if (tool.name === 'get_candle_chart_data') {
          expect(tool.inputSchema.required).toContain('seconds');
          const secondsProperty = tool.inputSchema.properties.seconds;
          expect(secondsProperty.enum).toEqual([300, 900, 3600, 14400, 86400, 604800]);
        }
      });
    });
  });

  describe('getResources', () => {
    it('should return the correct resources', () => {
      const resources = chartsService.getResources();
      
      expect(resources).toHaveLength(3);
      
      const documentation = resources.find(r => r.uri === '1inch://charts/documentation');
      expect(documentation).toBeDefined();
      expect(documentation?.name).toBe('Charts API Documentation');
      
      const chains = resources.find(r => r.uri === '1inch://charts/supported-chains');
      expect(chains).toBeDefined();
      expect(chains?.name).toBe('Supported Chains');
      
      const periods = resources.find(r => r.uri === '1inch://charts/supported-periods');
      expect(periods).toBeDefined();
      expect(periods?.name).toBe('Supported Periods');
    });
  });

  describe('getPrompts', () => {
    it('should return the correct prompts', () => {
      const prompts = chartsService.getPrompts();
      
      expect(prompts).toHaveLength(1);
      
      const analyzePrompt = prompts[0];
      expect(analyzePrompt).toBeDefined();
      expect(analyzePrompt!.name).toBe('analyze_token_pair_chart');
      expect(analyzePrompt!.description).toContain('Analyze chart data');
      expect(analyzePrompt!.arguments).toHaveLength(5);
      
      const requiredArgs = analyzePrompt!.arguments.filter(arg => arg.required);
      expect(requiredArgs).toHaveLength(4);
    });
  });

  describe('handleToolCall', () => {
    it('should handle get_line_chart_data with real API call', async () => {
      const result = await chartsService.handleToolCall('get_line_chart_data', {
        token0: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
        token1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
        period: '24H',
        chainId: 1
      });
      
      console.log('get_line_chart_data result:', JSON.stringify(result, null, 2));
      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      
      if (result.data.length > 0) {
        const firstDataPoint = result.data[0];
        expect(firstDataPoint).toBeDefined();
        expect(firstDataPoint).toHaveProperty('time');
        expect(firstDataPoint).toHaveProperty('value');
        expect(typeof firstDataPoint!.time).toBe('number');
        expect(typeof firstDataPoint!.value).toBe('number');
      }
    }, 30000);

    it('should handle get_candle_chart_data with real API call', async () => {
      const result = await chartsService.handleToolCall('get_candle_chart_data', {
        token0: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
        token1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
        seconds: 3600,
        chainId: 1
      });
      
      console.log('get_candle_chart_data result:', JSON.stringify(result, null, 2));
      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      
      if (result.data.length > 0) {
        const firstDataPoint = result.data[0];
        expect(firstDataPoint).toBeDefined();
        expect(firstDataPoint).toHaveProperty('time');
        expect(firstDataPoint).toHaveProperty('open');
        expect(firstDataPoint).toHaveProperty('high');
        expect(firstDataPoint).toHaveProperty('low');
        expect(firstDataPoint).toHaveProperty('close');
        expect(typeof firstDataPoint!.time).toBe('number');
        expect(typeof firstDataPoint!.open).toBe('number');
        expect(typeof firstDataPoint!.high).toBe('number');
        expect(typeof firstDataPoint!.low).toBe('number');
        expect(typeof firstDataPoint!.close).toBe('number');
      }
    }, 30000);

    it('should throw error for unknown tool', async () => {
      await expect(
        chartsService.handleToolCall('unknown_tool', {})
      ).rejects.toThrow('Unknown tool: unknown_tool');
    });
  });

  describe('handleResourceRead', () => {
    it('should handle documentation resource', async () => {
      const result = await chartsService.handleResourceRead('1inch://charts/documentation');
      expect(result).toContain('# 1inch Charts API Documentation');
      expect(result).toContain('Overview');
    });

    it('should handle supported chains resource', async () => {
      const result = await chartsService.handleResourceRead('1inch://charts/supported-chains');
      const parsed = JSON.parse(result);
      expect(parsed.chains).toBeDefined();
      expect(Array.isArray(parsed.chains)).toBe(true);
    });

    it('should handle supported periods resource', async () => {
      const result = await chartsService.handleResourceRead('1inch://charts/supported-periods');
      const parsed = JSON.parse(result);
      expect(parsed.periods).toBeDefined();
      expect(Array.isArray(parsed.periods)).toBe(true);
    });

    it('should throw error for unknown resource', async () => {
      await expect(
        chartsService.handleResourceRead('1inch://charts/unknown')
      ).rejects.toThrow('Unknown resource: 1inch://charts/unknown');
    });
  });

  describe('handlePromptRequest', () => {
    it('should handle analyze_token_pair_chart with real API call', async () => {
      const result = await chartsService.handlePromptRequest('analyze_token_pair_chart', {
        token0: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
        token1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
        period: '24H',
        chainId: 1,
        chartType: 'line'
      });
      
      console.log('analyze_token_pair_chart result:', result);
      expect(result).toContain('Token Pair Chart Analysis');
      expect(result).toContain('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 / 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2');
      expect(result).toContain('Chain ID: 1');
      expect(result).toContain('Period: 24H');
    }, 30000);

    it('should throw error for unknown prompt', async () => {
      await expect(
        chartsService.handlePromptRequest('unknown_prompt', {})
      ).rejects.toThrow('Unknown prompt: unknown_prompt');
    });
  });

  describe('API methods', () => {
    it('should call getLineChartData with real API call', async () => {
      const result = await chartsService.getLineChartData({
        token0: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
        token1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
        period: '24H',
        chainId: 1
      });
      
      console.log('getLineChartData result:', JSON.stringify(result, null, 2));
      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      
      if (result.data.length > 0) {
        const firstDataPoint = result.data[0];
        expect(firstDataPoint).toBeDefined();
        expect(firstDataPoint).toHaveProperty('time');
        expect(firstDataPoint).toHaveProperty('value');
        expect(typeof firstDataPoint!.time).toBe('number');
        expect(typeof firstDataPoint!.value).toBe('number');
      }
    }, 30000);

    it('should call getCandleChartData with real API call', async () => {
      const result = await chartsService.getCandleChartData({
        token0: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
        token1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
        seconds: 3600,
        chainId: 1
      });
      
      console.log('getCandleChartData result:', JSON.stringify(result, null, 2));
      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      
      if (result.data.length > 0) {
        const firstDataPoint = result.data[0];
        expect(firstDataPoint).toBeDefined();
        expect(firstDataPoint).toHaveProperty('time');
        expect(firstDataPoint).toHaveProperty('open');
        expect(firstDataPoint).toHaveProperty('high');
        expect(firstDataPoint).toHaveProperty('low');
        expect(firstDataPoint).toHaveProperty('close');
        expect(typeof firstDataPoint!.time).toBe('number');
        expect(typeof firstDataPoint!.open).toBe('number');
        expect(typeof firstDataPoint!.high).toBe('number');
        expect(typeof firstDataPoint!.low).toBe('number');
        expect(typeof firstDataPoint!.close).toBe('number');
      }
    }, 30000);
  });
}); 