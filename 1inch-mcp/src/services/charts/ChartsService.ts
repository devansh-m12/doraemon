import { BaseService, ServiceConfig, ToolDefinition, ResourceDefinition, PromptDefinition } from '../base/BaseService';
import {
  LineChartRequest,
  LineChartResponse,
  CandleChartRequest,
  CandleChartResponse,
  ChartPeriod,
  CandleSeconds
} from './ChartTypes';

export class ChartsService extends BaseService {
  constructor(serviceConfig: ServiceConfig) {
    super(serviceConfig);
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'get_line_chart_data',
        description: 'Get historical line chart data for a specific token pair and period',
        inputSchema: {
          type: 'object',
          properties: {
            token0: { type: 'string', description: 'Base token address' },
            token1: { type: 'string', description: 'Quote token address' },
            period: { 
              type: 'string', 
              enum: ['24H', '1W', '1M', '1Y', 'AllTime'] as ChartPeriod[],
              description: 'Time period for the chart data'
            },
            chainId: { type: 'number', description: 'Chain ID of the network' }
          },
          required: ['token0', 'token1', 'period', 'chainId']
        }
      },
      {
        name: 'get_candle_chart_data',
        description: 'Get historical candle (OHLC) chart data for a specific token pair and time interval',
        inputSchema: {
          type: 'object',
          properties: {
            token0: { type: 'string', description: 'Base token address' },
            token1: { type: 'string', description: 'Quote token address' },
            seconds: { 
              type: 'number', 
              enum: [300, 900, 3600, 14400, 86400, 604800] as CandleSeconds[],
              description: 'Time interval in seconds for the candle data'
            },
            chainId: { type: 'number', description: 'Chain ID of the network' }
          },
          required: ['token0', 'token1', 'seconds', 'chainId']
        }
      }
    ];
  }

  getResources(): ResourceDefinition[] {
    return [
      {
        uri: '1inch://charts/documentation',
        name: 'Charts API Documentation',
        description: 'Complete documentation for 1inch Charts API',
        mimeType: 'text/markdown'
      },
      {
        uri: '1inch://charts/supported-chains',
        name: 'Supported Chains',
        description: 'List of supported blockchain chains for chart data',
        mimeType: 'application/json'
      },
      {
        uri: '1inch://charts/supported-periods',
        name: 'Supported Periods',
        description: 'List of supported time periods for chart data',
        mimeType: 'application/json'
      }
    ];
  }

  getPrompts(): PromptDefinition[] {
    return [
      {
        name: 'analyze_token_pair_chart',
        description: 'Analyze chart data for a token pair',
        arguments: [
          { name: 'token0', description: 'Base token address', required: true },
          { name: 'token1', description: 'Quote token address', required: true },
          { name: 'period', description: 'Time period for analysis', required: true },
          { name: 'chainId', description: 'Chain ID', required: true },
          { name: 'chartType', description: 'Type of chart (line or candle)', required: false }
        ]
      }
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    switch (name) {
      case 'get_line_chart_data':
        return await this.getLineChartData(args);
      case 'get_candle_chart_data':
        return await this.getCandleChartData(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  async handleResourceRead(uri: string): Promise<any> {
    switch (uri) {
      case '1inch://charts/documentation':
        return await this.getChartsDocumentation();
      case '1inch://charts/supported-chains':
        return await this.getSupportedChains();
      case '1inch://charts/supported-periods':
        return await this.getSupportedPeriods();
      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
  }

  async handlePromptRequest(name: string, args: any): Promise<any> {
    switch (name) {
      case 'analyze_token_pair_chart':
        return await this.analyzeTokenPairChart(args);
      default:
        throw new Error(`Unknown prompt: ${name}`);
    }
  }

  async getLineChartData(params: LineChartRequest): Promise<LineChartResponse> {
    const url = `${this.baseUrl}/charts/v1.0/chart/line/${params.token0}/${params.token1}/${params.period}/${params.chainId}`;
    const response = await this.makeRequest<LineChartResponse>(url);
    return response;
  }

  async getCandleChartData(params: CandleChartRequest): Promise<CandleChartResponse> {
    const url = `${this.baseUrl}/charts/v1.0/chart/aggregated/candle/${params.token0}/${params.token1}/${params.seconds}/${params.chainId}`;
    const response = await this.makeRequest<CandleChartResponse>(url);
    return response;
  }

  private async getChartsDocumentation(): Promise<string> {
    return `# 1inch Charts API Documentation

## Overview
The Charts API provides historical price data for token pairs across multiple blockchain networks, supporting both line charts and candlestick (OHLC) data.

## Available Endpoints

### 1. GET /charts/v1.0/chart/line/{token0}/{token1}/{period}/{chainId}
Returns historical line chart data for a specific token pair and time period.

**Parameters:**
- token0 (path): Base token address
- token1 (path): Quote token address  
- period (path): Time period (24H, 1W, 1M, 1Y, AllTime)
- chainId (path): Chain ID of the network

**Response Format:**
\`\`\`json
{
  "data": [
    {
      "time": 1234567890,
      "value": 1234.56
    }
    // ... repeated for each time point
  ]
}
\`\`\`

### 2. GET /charts/v1.0/chart/aggregated/candle/{token0}/{token1}/{seconds}/{chainId}
Returns historical candlestick (OHLC) chart data for a specific token pair and time interval.

**Parameters:**
- token0 (path): Base token address
- token1 (path): Quote token address
- seconds (path): Time interval in seconds (300, 900, 3600, 14400, 86400, 604800)
- chainId (path): Chain ID of the network

**Response Format:**
\`\`\`json
{
  "data": [
    {
      "time": 1234567890,
      "open": 123.45,
      "high": 135.67,
      "low": 120.00,
      "close": 130.00,
      "volume": 1000.50
    }
    // ... repeated for each time point
  ]
}
\`\`\`

## Supported Time Periods

- **24H**: Last 24 hours of data
- **1W**: Last week of data
- **1M**: Last month of data
- **1Y**: Last year of data
- **AllTime**: All available historical data

## Data Points

### Line Chart Data Points
- **time**: Unix timestamp of the data point
- **value**: Price value at that time

### Candlestick Data Points
- **time**: Unix timestamp of the data point
- **open**: Opening price for the period
- **high**: Highest price during the period
- **low**: Lowest price during the period
- **close**: Closing price for the period
- **volume**: Trading volume for the period

## Authentication
All endpoints require API Key authentication via the Authorization header.

## Rate Limits
- Standard API rate limits apply
- Consider data granularity when requesting large time periods
- Monitor API usage to avoid hitting limits

## Best Practices

### Data Granularity
- Use appropriate time periods for your analysis needs
- Consider the granularity of data points for different periods
- Balance between data detail and API usage

### Error Handling
- Handle cases where token pairs may not have sufficient data
- Validate token addresses before making requests
- Check for supported chains and periods

### Performance Considerations
- Cache frequently requested chart data
- Use appropriate time periods to minimize data transfer
- Consider implementing client-side data aggregation for longer periods`;
  }

  private async getSupportedChains(): Promise<string> {
    return JSON.stringify({
      chains: [
        { id: 1, name: 'Ethereum' },
        { id: 56, name: 'BNB Smart Chain' },
        { id: 137, name: 'Polygon' },
        { id: 42161, name: 'Arbitrum One' },
        { id: 43114, name: 'Avalanche C-Chain' },
        { id: 100, name: 'Gnosis Chain' },
        { id: 10, name: 'Optimism' },
        { id: 8453, name: 'Base' },
        { id: 324, name: 'zkSync Era' },
        { id: 59144, name: 'Linea' },
        { id: 146, name: 'Polygon zkEVM' },
        { id: 130, name: 'Polygon zkEVM Testnet' }
      ],
      description: 'Supported blockchain chains for chart data queries'
    });
  }

  private async getSupportedPeriods(): Promise<string> {
    return JSON.stringify({
      periods: [
        { value: '24H', name: '24 Hours', description: 'Last 24 hours of data' },
        { value: '1W', name: '1 Week', description: 'Last week of data' },
        { value: '1M', name: '1 Month', description: 'Last month of data' },
        { value: '1Y', name: '1 Year', description: 'Last year of data' },
        { value: 'AllTime', name: 'All Time', description: 'All available historical data' }
      ],
      description: 'Supported time periods for chart data queries'
    });
  }

  private async analyzeTokenPairChart(args: any): Promise<string> {
    const { token0, token1, period, chainId, chartType = 'line' } = args;
    
    let chartData;
    let analysis = `Token Pair Chart Analysis:

Token Pair: ${token0} / ${token1}
Chain ID: ${chainId}
Period: ${period}
Chart Type: ${chartType}

`;

    try {
      if (chartType === 'candle') {
        // For candle charts, we need to use seconds instead of period
        // Default to 1 hour (3600 seconds) if not specified
        const seconds = 3600;
        chartData = await this.getCandleChartData({ token0, token1, seconds, chainId });
      } else {
        chartData = await this.getLineChartData({ token0, token1, period, chainId });
      }

      const dataPoints = chartData.data;
      
      if (dataPoints.length === 0) {
        analysis += 'No data available for this token pair and period.';
        return analysis;
      }

      analysis += `Data Points: ${dataPoints.length}

`;

      if (chartType === 'candle') {
        // Analyze OHLC data
        const candleData = chartData.data as any[];
        const prices = candleData.map(point => point.close).filter(price => price > 0);
        if (prices.length > 0) {
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);
          const currentPrice = prices[prices.length - 1];
          const firstPrice = prices[0];
          const priceChange = currentPrice - firstPrice;
          const priceChangePercent = ((priceChange / firstPrice) * 100);

          analysis += `Price Analysis:
- Current Price: ${currentPrice}
- Price Range: ${minPrice} - ${maxPrice}
- Price Change: ${priceChange > 0 ? '+' : ''}${priceChange.toFixed(6)} (${priceChangePercent > 0 ? '+' : ''}${priceChangePercent.toFixed(2)}%)
- Data Points: ${dataPoints.length}
`;
        }
      } else {
        // Analyze line chart data
        const lineData = chartData.data as any[];
        const values = lineData.map(point => point.value).filter(value => value > 0);
        if (values.length > 0) {
          const minValue = Math.min(...values);
          const maxValue = Math.max(...values);
          const currentValue = values[values.length - 1];
          const firstValue = values[0];
          const valueChange = currentValue - firstValue;
          const valueChangePercent = ((valueChange / firstValue) * 100);

          analysis += `Value Analysis:
- Current Value: ${currentValue}
- Value Range: ${minValue} - ${maxValue}
- Value Change: ${valueChange > 0 ? '+' : ''}${valueChange.toFixed(6)} (${valueChangePercent > 0 ? '+' : ''}${valueChangePercent.toFixed(2)}%)
- Data Points: ${dataPoints.length}
`;
        }
      }

      // Time range analysis
      if (dataPoints.length > 1) {
        const firstDataPoint = dataPoints[0];
        const lastDataPoint = dataPoints[dataPoints.length - 1];
        
        if (firstDataPoint && lastDataPoint) {
          const firstTime = firstDataPoint.time;
          const lastTime = lastDataPoint.time;
          const timeSpan = lastTime - firstTime;
          const daysSpan = timeSpan / (24 * 60 * 60 * 1000);

          analysis += `
Time Range:
- Start: ${new Date(firstTime).toISOString()}
- End: ${new Date(lastTime).toISOString()}
- Duration: ${daysSpan.toFixed(1)} days
`;

          if (dataPoints.length > 1) {
            const avgInterval = timeSpan / (dataPoints.length - 1);
            const avgIntervalMinutes = avgInterval / (60 * 1000);
            analysis += `- Average Interval: ${avgIntervalMinutes.toFixed(1)} minutes between data points
`;
          }
        }
      }

    } catch (error: any) {
      analysis += `Error retrieving chart data: ${error.message}`;
    }

    return analysis;
  }
} 