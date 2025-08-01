import { BaseService, ServiceConfig, ToolDefinition, ResourceDefinition, PromptDefinition } from '../base/BaseService';
import { 
  TokenSearchRequest,
  TokenSearchResponse
} from './TokenTypes';

export class TokenService extends BaseService {
  constructor(serviceConfig: ServiceConfig) {
    super(serviceConfig);
  }

  getTools(): ToolDefinition[] {
    return [
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
        name: 'supported_chains',
        description: 'Get all supported chain IDs from 1inch API',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
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
      case 'search_tokens':
        return await this.searchTokens(args);
      case 'supported_chains':
        return await this.getSupportedChains();
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
  async searchTokens(params: TokenSearchRequest): Promise<TokenSearchResponse> {
    this.validateRequiredParams(params, ['chainId', 'query']);
    
    const { chainId, query, limit = 10 } = params;
    
    return await this.makeRequest<TokenSearchResponse>(`/token/v1.3/search`, {
      query,
      limit,
      only_positive_rating: true
    });
  }

  async getSupportedChains(): Promise<number[]> {
    console.log('getSupportedChains+==dsd-sdksdj__________________________');
    return await this.makeRequest<number[]>(`/token/v1.3/multi-chain/supported-chains`);
  }

  private async getTokenDocumentation(): Promise<string> {
    return `
# 1inch Token API Documentation

## Overview
The 1inch Token API provides search functionality for tokens across multiple blockchain networks.

## Available Endpoints

### GET /token/v1.0/{chainId}/search
Search tokens by name or symbol.

**Parameters:**
- chainId: Chain ID
- query: Search query
- limit: Maximum number of results (default: 10)

**Response:**
- tokens: Array of token information including address, symbol, name, decimals, logoURI, and tags

## Supported Chains
- Ethereum (1)
- BSC (56)
- Polygon (137)
- Arbitrum (42161)
- Optimism (10)
- Avalanche (43114)
- Fantom (250)
- Gnosis (100)

## Example Usage
Search for "USDC" tokens on Ethereum:
\`\`\`
GET /token/v1.0/1/search?query=USDC&limit=5
\`\`\`
    `;
  }
} 