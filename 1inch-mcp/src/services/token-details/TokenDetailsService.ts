import { BaseService, ServiceConfig, ToolDefinition, ResourceDefinition, PromptDefinition } from '../base/BaseService';
import {
  TokenDetailsRequest,
  TokenDetailsByAddressRequest,
  TokenDetailsResponse,
  HistoricalPricesRangeRequest,
  HistoricalPricesRangeByAddressRequest,
  HistoricalPricesIntervalRequest,
  HistoricalPricesIntervalByAddressRequest,
  HistoricalPricesResponse,
  PriceChangeRequest,
  PriceChangeByAddressRequest,
  PriceChangeMultipleRequest,
  PriceChangeResponse,
  PriceChangeMultipleResponse
} from './TokenDetailsTypes';

export class TokenDetailsService extends BaseService {
  constructor(serviceConfig: ServiceConfig) {
    super(serviceConfig);
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'get_native_token_details',
        description: 'Get details for the native token of a given chain',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID of the network (e.g., 1 for Ethereum)' },
            provider: { type: 'string', description: 'Name of chart provider', default: '1inch' }
          },
          required: ['chain']
        }
      },
      {
        name: 'get_token_details',
        description: 'Get details for a specific token by address on a given chain',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID' },
            address: { type: 'string', description: 'Token contract address' },
            provider: { type: 'string', description: 'Name of chart provider', default: '1inch' }
          },
          required: ['chain', 'address']
        }
      },
      {
        name: 'get_native_historical_prices_range',
        description: 'Get historical price data for the native token over a custom time range',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID' },
            from: { type: 'number', description: 'Start timestamp (UNIX)' },
            to: { type: 'number', description: 'End timestamp (UNIX)' },
            provider: { type: 'string', description: 'Name of chart provider', default: '1inch' }
          },
          required: ['chain', 'from', 'to']
        }
      },
      {
        name: 'get_token_historical_prices_range',
        description: 'Get historical price data for a specific token over a custom time range',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID' },
            address: { type: 'string', description: 'Token contract address' },
            from: { type: 'number', description: 'Start timestamp (UNIX)' },
            to: { type: 'number', description: 'End timestamp (UNIX)' },
            provider: { type: 'string', description: 'Name of chart provider', default: '1inch' }
          },
          required: ['chain', 'address', 'from', 'to']
        }
      },
      {
        name: 'get_native_historical_prices_interval',
        description: 'Get historical USD price data for the native token aggregated by interval',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID' },
            interval: { type: 'string', description: 'Interval (e.g., 1d, 1h, 1w)' },
            from: { type: 'number', description: 'Start timestamp (UNIX)' },
            to: { type: 'number', description: 'End timestamp (UNIX)' },
            provider: { type: 'string', description: 'Name of chart provider', default: '1inch' }
          },
          required: ['chain', 'interval', 'from', 'to']
        }
      },
      {
        name: 'get_token_historical_prices_interval',
        description: 'Get historical USD price data for a token aggregated by interval',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID' },
            address: { type: 'string', description: 'Token contract address' },
            interval: { type: 'string', description: 'Interval (e.g., 1d, 1h, 1w)' },
            from: { type: 'number', description: 'Start timestamp (UNIX)' },
            to: { type: 'number', description: 'End timestamp (UNIX)' },
            provider: { type: 'string', description: 'Name of chart provider', default: '1inch' }
          },
          required: ['chain', 'address', 'interval', 'from', 'to']
        }
      },
      {
        name: 'get_native_price_change',
        description: 'Get price change metric for the native token over a specific interval',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID' },
            interval: { type: 'string', description: 'Interval (e.g., 1d, 1h)' },
            provider: { type: 'string', description: 'Name of chart provider', default: '1inch' }
          },
          required: ['chain', 'interval']
        }
      },
      {
        name: 'get_token_price_change',
        description: 'Get price change metric for a particular token',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID' },
            address: { type: 'string', description: 'Token contract address' },
            interval: { type: 'string', description: 'Interval (e.g., 1d, 1h)' },
            provider: { type: 'string', description: 'Name of chart provider', default: '1inch' }
          },
          required: ['chain', 'address', 'interval']
        }
      },
      {
        name: 'get_multiple_tokens_price_change',
        description: 'Get price change for a list of token addresses over specific intervals',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID' },
            addresses: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'List of token addresses'
            },
            interval: { type: 'string', description: 'Interval (e.g., 1d, 1h)' },
            provider: { type: 'string', description: 'Name of chart provider', default: '1inch' }
          },
          required: ['chain', 'addresses', 'interval']
        }
      }
    ];
  }

  getResources(): ResourceDefinition[] {
    return [
      {
        uri: '1inch://token-details/documentation',
        name: 'Token Details API Documentation',
        description: 'Complete documentation for 1inch Token Details API',
        mimeType: 'text/markdown'
      },
      {
        uri: '1inch://token-details/supported-intervals',
        name: 'Supported Intervals',
        description: 'List of supported time intervals for historical data',
        mimeType: 'application/json'
      }
    ];
  }

  getPrompts(): PromptDefinition[] {
    return [
      {
        name: 'analyze_token_performance',
        description: 'Analyze token performance over time with historical data',
        arguments: [
          { name: 'chain', description: 'Chain ID', required: true },
          { name: 'address', description: 'Token address', required: true },
          { name: 'timeRange', description: 'Time range for analysis', required: true }
        ]
      }
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    switch (name) {
      case 'get_native_token_details':
        return await this.getNativeTokenDetails(args);
      case 'get_token_details':
        return await this.getTokenDetails(args);
      case 'get_native_historical_prices_range':
        return await this.getNativeHistoricalPricesRange(args);
      case 'get_token_historical_prices_range':
        return await this.getTokenHistoricalPricesRange(args);
      case 'get_native_historical_prices_interval':
        return await this.getNativeHistoricalPricesInterval(args);
      case 'get_token_historical_prices_interval':
        return await this.getTokenHistoricalPricesInterval(args);
      case 'get_native_price_change':
        return await this.getNativePriceChange(args);
      case 'get_token_price_change':
        return await this.getTokenPriceChange(args);
      case 'get_multiple_tokens_price_change':
        return await this.getMultipleTokensPriceChange(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  async handleResourceRead(uri: string): Promise<any> {
    switch (uri) {
      case '1inch://token-details/documentation':
        return await this.getTokenDetailsDocumentation();
      case '1inch://token-details/supported-intervals':
        return await this.getSupportedIntervals();
      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
  }

  async handlePromptRequest(name: string, args: any): Promise<any> {
    switch (name) {
      case 'analyze_token_performance':
        return await this.analyzeTokenPerformance(args);
      default:
        throw new Error(`Unknown prompt: ${name}`);
    }
  }

  async getNativeTokenDetails(params: TokenDetailsRequest): Promise<TokenDetailsResponse> {
    const url = `${this.baseUrl}/token-details/v1.0/details/${params.chain}`;
    const queryParams = new URLSearchParams();
    if (params.provider) {
      queryParams.append('provider', params.provider);
    }

    const response = await this.makeRequest<TokenDetailsResponse>(`${url}?${queryParams.toString()}`);
    return response;
  }

  async getTokenDetails(params: TokenDetailsByAddressRequest): Promise<TokenDetailsResponse> {
    const url = `${this.baseUrl}/token-details/v1.0/details/${params.chain}/${params.address}`;
    const queryParams = new URLSearchParams();
    if (params.provider) {
      queryParams.append('provider', params.provider);
    }

    const response = await this.makeRequest<TokenDetailsResponse>(`${url}?${queryParams.toString()}`);
    return response;
  }

  async getNativeHistoricalPricesRange(params: HistoricalPricesRangeRequest): Promise<HistoricalPricesResponse> {
    const url = `${this.baseUrl}/token-details/v1.0/historical-prices/range/${params.chain}`;
    const queryParams = new URLSearchParams({
      from: params.from.toString(),
      to: params.to.toString()
    });
    if (params.provider) {
      queryParams.append('provider', params.provider);
    }

    const response = await this.makeRequest<HistoricalPricesResponse>(`${url}?${queryParams.toString()}`);
    return response;
  }

  async getTokenHistoricalPricesRange(params: HistoricalPricesRangeByAddressRequest): Promise<HistoricalPricesResponse> {
    const url = `${this.baseUrl}/token-details/v1.0/historical-prices/range/${params.chain}/${params.address}`;
    const queryParams = new URLSearchParams({
      from: params.from.toString(),
      to: params.to.toString()
    });
    if (params.provider) {
      queryParams.append('provider', params.provider);
    }

    const response = await this.makeRequest<HistoricalPricesResponse>(`${url}?${queryParams.toString()}`);
    return response;
  }

  async getNativeHistoricalPricesInterval(params: HistoricalPricesIntervalRequest): Promise<HistoricalPricesResponse> {
    const url = `${this.baseUrl}/token-details/v1.0/historical-prices/interval/${params.chain}`;
    const queryParams = new URLSearchParams({
      interval: params.interval,
      from: params.from.toString(),
      to: params.to.toString()
    });
    if (params.provider) {
      queryParams.append('provider', params.provider);
    }

    const response = await this.makeRequest<HistoricalPricesResponse>(`${url}?${queryParams.toString()}`);
    return response;
  }

  async getTokenHistoricalPricesInterval(params: HistoricalPricesIntervalByAddressRequest): Promise<HistoricalPricesResponse> {
    const url = `${this.baseUrl}/token-details/v1.0/historical-prices/interval/${params.chain}/${params.address}`;
    const queryParams = new URLSearchParams({
      interval: params.interval,
      from: params.from.toString(),
      to: params.to.toString()
    });
    if (params.provider) {
      queryParams.append('provider', params.provider);
    }

    const response = await this.makeRequest<HistoricalPricesResponse>(`${url}?${queryParams.toString()}`);
    return response;
  }

  async getNativePriceChange(params: PriceChangeRequest): Promise<PriceChangeResponse> {
    const url = `${this.baseUrl}/token-details/v1.0/price-change/${params.chain}`;
    const queryParams = new URLSearchParams({
      interval: params.interval
    });
    if (params.provider) {
      queryParams.append('provider', params.provider);
    }

    const response = await this.makeRequest<PriceChangeResponse>(`${url}?${queryParams.toString()}`);
    return response;
  }

  async getTokenPriceChange(params: PriceChangeByAddressRequest): Promise<PriceChangeResponse> {
    const url = `${this.baseUrl}/token-details/v1.0/price-change/${params.chain}/${params.address}`;
    const queryParams = new URLSearchParams({
      interval: params.interval
    });
    if (params.provider) {
      queryParams.append('provider', params.provider);
    }

    const response = await this.makeRequest<PriceChangeResponse>(`${url}?${queryParams.toString()}`);
    return response;
  }

  async getMultipleTokensPriceChange(params: PriceChangeMultipleRequest): Promise<PriceChangeMultipleResponse> {
    const url = `${this.baseUrl}/token-details/v1.0/price-change/${params.chain}/tokens`;
    const queryParams = new URLSearchParams({
      interval: params.interval
    });
    if (params.provider) {
      queryParams.append('provider', params.provider);
    }

    const body = {
      addresses: params.addresses
    };

    const response = await this.makePostRequest<PriceChangeMultipleResponse>(`${url}?${queryParams.toString()}`, body);
    return response;
  }

  private async getTokenDetailsDocumentation(): Promise<string> {
    return `# 1inch Token Details API Documentation

## Overview
The Token Details API provides comprehensive information about tokens including metadata, historical prices, and price changes.

## Endpoints

### 1. GET /token-details/v1.0/details/{chain}
Returns details for the native token of a given chain.

### 2. GET /token-details/v1.0/details/{chain}/{address}
Returns details for a specific token by address on a given chain.

### 3. GET /token-details/v1.0/historical-prices/range/{chain}
Returns historical price data for the native token over a custom time range.

### 4. GET /token-details/v1.0/historical-prices/range/{chain}/{address}
Returns historical price data for a specific token over a custom time range.

### 5. GET /token-details/v1.0/historical-prices/interval/{chain}
Returns historical USD price data for the native token aggregated by interval.

### 6. GET /token-details/v1.0/historical-prices/interval/{chain}/{address}
Returns historical USD price data for a token aggregated by interval.

### 7. GET /token-details/v1.0/price-change/{chain}
Returns price change metric for the native token over a specific interval.

### 8. POST /token-details/v1.0/price-change/{chain}/tokens
Returns price change for a list of token addresses over specific intervals.

### 9. GET /token-details/v1.0/price-change/{chain}/{address}
Returns price change metric for a particular token.

## Common Parameters
- chain: Chain ID (required)
- address: Token contract address (required for specific token endpoints)
- provider: Chart provider name (optional)
- from/to: Unix timestamps for historical data (required for historical endpoints)
- interval: Time interval (1h, 1d, 1w, etc.) (required for interval endpoints)

## Response Format
All endpoints return JSON responses with comprehensive token information including:
- Basic token info (address, symbol, name, decimals)
- Metadata (website, description, social links)
- Market data (market cap, supply)
- Historical price arrays
- Price change metrics`;
  }

  private async getSupportedIntervals(): Promise<string> {
    return JSON.stringify({
      intervals: ['1h', '1d', '1w', '1m', '3m', '6m', '1y'],
      description: 'Supported time intervals for historical price data'
    });
  }

  private async analyzeTokenPerformance(args: any): Promise<string> {
    const { chain, address, timeRange } = args;
    
    // Get token details
    const tokenDetails = await this.getTokenDetails({ chain, address });
    
    // Get historical prices for analysis
    const now = Math.floor(Date.now() / 1000);
    const from = now - (timeRange === '1d' ? 86400 : timeRange === '1w' ? 604800 : 2592000); // 1d, 1w, or 1m
    
    const historicalData = await this.getTokenHistoricalPricesRange({
      chain,
      address,
      from,
      to: now
    });

    return `Token Performance Analysis for ${tokenDetails.name} (${tokenDetails.symbol}):

Token Details:
- Name: ${tokenDetails.name}
- Symbol: ${tokenDetails.symbol}
- Market Cap: ${tokenDetails.marketCap ? `$${tokenDetails.marketCap.toLocaleString()}` : 'N/A'}
- Supply: ${tokenDetails.supply ? tokenDetails.supply.toLocaleString() : 'N/A'}

Historical Data Points: ${historicalData.prices.length}
Time Range: ${new Date(from * 1000).toLocaleDateString()} to ${new Date(now * 1000).toLocaleDateString()}

Analysis complete. Use the historical_prices_range endpoint for detailed price data.`;
  }
} 