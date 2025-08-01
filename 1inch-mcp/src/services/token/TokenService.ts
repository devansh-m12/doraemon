import { BaseService, ServiceConfig, ToolDefinition, ResourceDefinition, PromptDefinition } from '../base/BaseService';
import { 
  TokenInfoRequest,
  TokenInfoResponse,
  TokenSearchRequest,
  TokenSearchResponse,
  TokenPriceRequest,
  TokenPriceResponse,
  TokenBalanceRequest,
  TokenBalanceResponse
} from './TokenTypes';

export class TokenService extends BaseService {
  constructor(serviceConfig: ServiceConfig) {
    super(serviceConfig);
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'get_token_info',
        description: 'Get detailed information about a token',
        inputSchema: {
          type: 'object',
          properties: {
            chainId: { type: 'number', description: 'Chain ID' },
            tokenAddress: { type: 'string', description: 'Token address' }
          },
          required: ['chainId', 'tokenAddress']
        }
      },
      {
        name: 'search_tokens',
        description: 'Search tokens by name or symbol',
        inputSchema: {
          type: 'object',
          properties: {
            chainId: { type: 'number', description: 'Chain ID' },
            query: { type: 'string', description: 'Search query' },
            limit: { type: 'number', description: 'Maximum number of results', default: 10 }
          },
          required: ['chainId', 'query']
        }
      },
      {
        name: 'get_token_price',
        description: 'Get current token price',
        inputSchema: {
          type: 'object',
          properties: {
            chainId: { type: 'number', description: 'Chain ID' },
            tokenAddress: { type: 'string', description: 'Token address' },
            currency: { type: 'string', description: 'Currency (default: USD)', default: 'USD' }
          },
          required: ['chainId', 'tokenAddress']
        }
      },
      {
        name: 'get_token_balances',
        description: 'Get token balances for a wallet address',
        inputSchema: {
          type: 'object',
          properties: {
            chainId: { type: 'number', description: 'Chain ID' },
            address: { type: 'string', description: 'Wallet address' },
            tokens: { type: 'array', description: 'Specific token addresses to check (optional)' }
          },
          required: ['chainId', 'address']
        }
      }
    ];
  }

  getResources(): ResourceDefinition[] {
    return [
      {
        uri: '1inch://token/documentation',
        name: 'Token API Documentation',
        description: 'Complete documentation for 1inch Token API',
        mimeType: 'text/markdown'
      },
      {
        uri: '1inch://token/popular-tokens',
        name: 'Popular Tokens',
        description: 'List of popular tokens across all chains',
        mimeType: 'application/json'
      }
    ];
  }

  getPrompts(): PromptDefinition[] {
    return [
      {
        name: 'token_analysis',
        description: 'Analyze token information and provide insights',
        arguments: [
          {
            name: 'token_address',
            description: 'Token address to analyze',
            required: true
          },
          {
            name: 'chain_id',
            description: 'Chain ID',
            required: true
          }
        ]
      }
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    switch (name) {
      case 'get_token_info':
        return await this.getTokenInfo(args);
      case 'search_tokens':
        return await this.searchTokens(args);
      case 'get_token_price':
        return await this.getTokenPrice(args);
      case 'get_token_balances':
        return await this.getTokenBalances(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  async handleResourceRead(uri: string): Promise<any> {
    switch (uri) {
      case '1inch://token/documentation':
        return {
          contents: [
            {
              uri,
              mimeType: 'text/markdown',
              text: await this.getTokenDocumentation()
            }
          ]
        };
      case '1inch://token/popular-tokens':
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify({
                tokens: [
                  {
                    chainId: 1,
                    address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
                    symbol: 'ETH',
                    name: 'Ethereum',
                    decimals: 18
                  },
                  {
                    chainId: 1,
                    address: '0xA0b86a33E6E4B8b5f8c1e9d6b2a8c3e7f9d5c8a7',
                    symbol: 'USDC',
                    name: 'USD Coin',
                    decimals: 6
                  },
                  {
                    chainId: 1,
                    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
                    symbol: 'USDT',
                    name: 'Tether USD',
                    decimals: 6
                  }
                ]
              }, null, 2)
            }
          ]
        };
      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
  }

  async handlePromptRequest(name: string, args: any): Promise<any> {
    switch (name) {
      case 'token_analysis':
        return {
          description: 'Token analysis assistant',
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `Analyze the token ${args?.token_address} on chain ${args?.chain_id}. Provide information about its price, market cap, trading volume, and any notable characteristics.`
              }
            }
          ]
        };
      default:
        throw new Error(`Unknown prompt: ${name}`);
    }
  }

  // Implementation methods
  async getTokenInfo(params: TokenInfoRequest): Promise<TokenInfoResponse> {
    this.validateRequiredParams(params, ['chainId', 'tokenAddress']);
    
    const { chainId, tokenAddress } = params;
    
    return await this.makeRequest<TokenInfoResponse>(`/token/v1.3/${chainId}/info`, {
      tokenAddress
    });
  }

  async searchTokens(params: TokenSearchRequest): Promise<TokenSearchResponse> {
    this.validateRequiredParams(params, ['chainId', 'query']);
    
    const { chainId, query, limit = 10 } = params;
    
    return await this.makeRequest<TokenSearchResponse>(`/token/v1.3/search`, {
      query,
      limit,
      only_positive_rating: true
    });
  }

  async getTokenPrice(params: TokenPriceRequest): Promise<TokenPriceResponse> {
    this.validateRequiredParams(params, ['chainId', 'tokenAddress']);
    
    const { chainId, tokenAddress, currency = 'USD' } = params;
    
    return await this.makeRequest<TokenPriceResponse>(`/price/v1.3/${chainId}/price`, {
      tokenAddress,
      currency
    });
  }

  async getTokenBalances(params: TokenBalanceRequest): Promise<TokenBalanceResponse> {
    this.validateRequiredParams(params, ['chainId', 'address']);
    
    const { chainId, address, tokens } = params;
    
    return await this.makeRequest<TokenBalanceResponse>(`/balance/v1.3/${chainId}/balances`, {
      address,
      tokens
    });
  }

  private async getTokenDocumentation(): Promise<string> {
    return `
# 1inch Token API Documentation

## Overview
The 1inch Token API provides access to token information, search functionality, and balance checking across multiple blockchain networks.

## Available Endpoints

### GET /token/v1.0/{chainId}/info
Get detailed information about a specific token.

**Parameters:**
- chainId: Chain ID
- tokenAddress: Token address

**Response:**
- address: Token address
- symbol: Token symbol
- name: Token name
- decimals: Token decimals
- logoURI: Token logo URL (optional)
- tags: Token tags (optional)

### GET /token/v1.0/{chainId}/search
Search tokens by name or symbol.

**Parameters:**
- chainId: Chain ID
- query: Search query
- limit: Maximum number of results (default: 10)

### GET /price/v1.0/{chainId}/price
Get current token price.

**Parameters:**
- chainId: Chain ID
- tokenAddress: Token address
- currency: Currency (default: USD)

**Response:**
- price: Token price
- currency: Currency
- timestamp: Price timestamp

### GET /balance/v1.0/{chainId}/balances
Get token balances for a wallet address.

**Parameters:**
- chainId: Chain ID
- address: Wallet address
- tokens: Specific token addresses to check (optional)

**Response:**
- tokens: Array of token balances with address, symbol, name, decimals, balance, value, and price

## Supported Chains
- Ethereum (1)
- BSC (56)
- Polygon (137)
- Arbitrum (42161)
- Optimism (10)
- Avalanche (43114)
- Fantom (250)
- Gnosis (100)

## Popular Tokens
- ETH (Ethereum)
- USDC (USD Coin)
- USDT (Tether USD)
- DAI (Dai Stablecoin)
- WETH (Wrapped Ethereum)
    `;
  }
} 