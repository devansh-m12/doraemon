import { BaseService, ServiceConfig, ToolDefinition, ResourceDefinition, PromptDefinition } from '../base/BaseService';
import {
  GetAllPricesRequest,
  GetAllPricesResponse,
  GetCustomTokensPricesRequest,
  GetCustomTokensPricesResponse,
  GetSupportedCurrenciesRequest,
  GetSupportedCurrenciesResponse,
  GetSpecificTokensPricesRequest,
  GetSpecificTokensPricesResponse
} from './SpotPriceTypes';

export class SpotPriceService extends BaseService {
  constructor(serviceConfig: ServiceConfig) {
    super(serviceConfig);
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'get_all_prices',
        description: 'Get prices for all whitelisted tokens on the specified blockchain network',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID of the network' },
            currency: { type: 'string', description: 'Currency for price conversion (e.g., USD, EUR). If omitted, returns price in native Wei' }
          },
          required: ['chain']
        }
      },
      {
        name: 'get_custom_tokens_prices',
        description: 'Get prices for specific tokens as requested',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID of the network' },
            tokens: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'List of token addresses'
            },
            currency: { type: 'string', description: 'Currency for price conversion (e.g., USD, EUR). If omitted, returns price in native Wei' }
          },
          required: ['chain', 'tokens']
        }
      },
      {
        name: 'get_supported_currencies',
        description: 'Get list of all supported custom currencies for price conversion',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID of the network' }
          },
          required: ['chain']
        }
      },
      {
        name: 'get_specific_tokens_prices',
        description: 'Get prices for specific token addresses via path parameter',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID of the network' },
            addresses: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'List of token addresses'
            },
            currency: { type: 'string', description: 'Currency for price conversion (e.g., USD, EUR). If omitted, returns price in native Wei' }
          },
          required: ['chain', 'addresses']
        }
      }
    ];
  }

  getResources(): ResourceDefinition[] {
    return [
      {
        uri: '1inch://spot-price/documentation',
        name: 'Spot Price API Documentation',
        description: 'Complete documentation for 1inch Spot Price API',
        mimeType: 'text/markdown'
      },
      {
        uri: '1inch://spot-price/supported-chains',
        name: 'Supported Chains',
        description: 'List of supported blockchain chains for spot price queries',
        mimeType: 'application/json'
      }
    ];
  }

  getPrompts(): PromptDefinition[] {
    return [
      {
        name: 'analyze_token_prices',
        description: 'Analyze token prices and market data',
        arguments: [
          { name: 'chain', description: 'Chain ID', required: true },
          { name: 'tokens', description: 'List of token addresses to analyze', required: true },
          { name: 'currency', description: 'Currency for price conversion', required: false }
        ]
      }
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    switch (name) {
      case 'get_all_prices':
        return await this.getAllPrices(args);
      case 'get_custom_tokens_prices':
        return await this.getCustomTokensPrices(args);
      case 'get_supported_currencies':
        return await this.getSupportedCurrencies(args);
      case 'get_specific_tokens_prices':
        return await this.getSpecificTokensPrices(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  async handleResourceRead(uri: string): Promise<any> {
    switch (uri) {
      case '1inch://spot-price/documentation':
        return await this.getSpotPriceDocumentation();
      case '1inch://spot-price/supported-chains':
        return await this.getSupportedChains();
      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
  }

  async handlePromptRequest(name: string, args: any): Promise<any> {
    switch (name) {
      case 'analyze_token_prices':
        return await this.analyzeTokenPrices(args);
      default:
        throw new Error(`Unknown prompt: ${name}`);
    }
  }

  async getAllPrices(params: GetAllPricesRequest): Promise<GetAllPricesResponse> {
    const url = `${this.baseUrl}/price/v1.1/${params.chain}`;
    const queryParams = new URLSearchParams();
    
    if (params.currency) {
      queryParams.append('currency', params.currency);
    }

    const response = await this.makeRequest<GetAllPricesResponse>(`${url}?${queryParams.toString()}`);
    return response;
  }

  async getCustomTokensPrices(params: GetCustomTokensPricesRequest): Promise<GetCustomTokensPricesResponse> {
    const url = `${this.baseUrl}/price/v1.1/${params.chain}`;
    const body: any = {
      tokens: params.tokens
    };
    
    if (params.currency) {
      body.currency = params.currency;
    }

    const response = await this.makePostRequest<GetCustomTokensPricesResponse>(url, body);
    return response;
  }

  async getSupportedCurrencies(params: GetSupportedCurrenciesRequest): Promise<GetSupportedCurrenciesResponse> {
    const url = `${this.baseUrl}/price/v1.1/${params.chain}/currencies`;
    const response = await this.makeRequest<GetSupportedCurrenciesResponse>(url);
    return response;
  }

  async getSpecificTokensPrices(params: GetSpecificTokensPricesRequest): Promise<GetSpecificTokensPricesResponse> {
    const addresses = params.addresses.join(',');
    const url = `${this.baseUrl}/price/v1.1/${params.chain}/${addresses}`;
    const queryParams = new URLSearchParams();
    
    if (params.currency) {
      queryParams.append('currency', params.currency);
    }

    const response = await this.makeRequest<GetSpecificTokensPricesResponse>(`${url}?${queryParams.toString()}`);
    return response;
  }

  private async getSpotPriceDocumentation(): Promise<string> {
    return `# 1inch Spot Price API Documentation

## Overview
The Spot Price API provides real-time token price information across multiple blockchain networks with support for various currencies.

## Endpoints

### 1. GET /price/v1.1/{chain}
Returns prices for all whitelisted tokens on the specified blockchain network.

**Parameters:**
- chain (path, required): Chain ID
- currency (query, optional): Currency for price conversion (e.g., USD, EUR). If omitted, returns price in native Wei

**Example:**
\`\`\`
GET /price/v1.1/1?currency=USD
\`\`\`

### 2. POST /price/v1.1/{chain}
Returns prices for specific tokens as requested.

**Parameters:**
- chain (path, required): Chain ID

**Body:**
\`\`\`json
{
  "tokens": ["0x111111111117dc0aa78b770fa6a738034120c302"],
  "currency": "USD"
}
\`\`\`

### 3. GET /price/v1.1/{chain}/currencies
Returns a list of all supported custom currencies for price conversion.

**Parameters:**
- chain (path, required): Chain ID

**Response:**
\`\`\`json
{
  "codes": ["USD", "EUR", "ETH", ...]
}
\`\`\`

### 4. GET /price/v1.1/{chain}/{addresses}
Returns prices for specific token addresses requested via the path, supports multiple addresses separated by a comma.

**Parameters:**
- chain (path, required): Chain ID
- addresses (path, required): One or many token contract addresses, separated by commas
- currency (query, optional): Currency for price conversion

**Example:**
\`\`\`
GET /price/v1.1/1/0xAddress1,0xAddress2?currency=USD
\`\`\`

## Response Format
All endpoints return JSON responses with token price information including:
- Token addresses as keys
- Price amounts (as strings for precision)
- Optional token metadata (symbol, name, decimals, logoURI, tags)

## Authentication
All endpoints require API Key authentication via header.

## Supported Currencies
The API supports various fiat and crypto currencies for price conversion including:
- USD, EUR, GBP, JPY, and other major fiat currencies
- ETH, BTC, and other major cryptocurrencies`;
  }

  private async getSupportedChains(): Promise<string> {
    return JSON.stringify({
      chains: [
        { id: 1, name: 'Ethereum' },
        { id: 10, name: 'Optimism' },
        { id: 56, name: 'BNB Smart Chain' },
        { id: 137, name: 'Polygon' },
        { id: 42161, name: 'Arbitrum One' },
        { id: 43114, name: 'Avalanche C-Chain' },
        { id: 8453, name: 'Base' },
        { id: 250, name: 'Fantom Opera' },
        { id: 1101, name: 'Polygon zkEVM' },
        { id: 324, name: 'zkSync Era' },
        { id: 59144, name: 'Linea' },
        { id: 7777777, name: 'Zora' },
        { id: 534352, name: 'Scroll' },
        { id: 81457, name: 'Blast' },
        { id: 424, name: 'PulseChain' },
        { id: 369, name: 'PulseChain Testnet' },
        { id: 11155420, name: 'Optimism Sepolia' },
        { id: 80001, name: 'Mumbai' },
        { id: 421614, name: 'Arbitrum Sepolia' },
        { id: 43113, name: 'Fuji' },
        { id: 84532, name: 'Base Sepolia' },
        { id: 4002, name: 'Fantom Testnet' },
        { id: 1442, name: 'Polygon zkEVM Testnet' },
        { id: 280, name: 'zkSync Era Testnet' },
        { id: 59140, name: 'Linea Testnet' },
        { id: 999999999, name: 'Zora Testnet' },
        { id: 534351, name: 'Scroll Sepolia' },
        { id: 168587773, name: 'Blast Sepolia' }
      ],
      description: 'Supported blockchain chains for spot price queries'
    });
  }

  private async analyzeTokenPrices(args: any): Promise<string> {
    const { chain, tokens, currency = 'USD' } = args;
    
    // Get prices for the specified tokens
    const tokenPrices = await this.getCustomTokensPrices({ 
      chain, 
      tokens, 
      currency 
    });
    
    // Get supported currencies for reference
    const supportedCurrencies = await this.getSupportedCurrencies({ chain });
    
    let analysis = `Token Price Analysis for Chain ${chain} in ${currency}:

Total Tokens Analyzed: ${Object.keys(tokenPrices).length}

Token Prices:`;
    
    Object.entries(tokenPrices).forEach(([tokenAddress, tokenData]) => {
      analysis += `\n- ${tokenData.symbol || tokenAddress}: ${tokenData.price} ${currency}`;
      if (tokenData.name) {
        analysis += ` (${tokenData.name})`;
      }
    });

    analysis += `\n\nSupported Currencies: ${supportedCurrencies.codes.join(', ')}`;

    return analysis;
  }
} 