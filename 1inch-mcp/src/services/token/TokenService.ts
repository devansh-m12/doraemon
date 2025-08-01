import { BaseService, ServiceConfig, ToolDefinition, ResourceDefinition, PromptDefinition } from '../base/BaseService';
import { 
  TokenSearchRequest,
  TokenSearchResponse,
  TokenInfoRequest,
  TokenInfoMapResponse,
  AllTokensInfoRequest,
  AllTokensInfoResponse,
  TokenListRequest,
  TokenListResponse,
  MultiChainTokensRequest,
  MultiChainTokensResponse,
  SupportedChainsResponse,
  TokenCustomRequest,
  TokenCustomResponse,
  SingleTokenRequest,
  SingleTokenResponse,
  MultiChainSearchRequest,
  MultiChainSearchResponse
} from './TokenTypes';

export class TokenService extends BaseService {
  constructor(serviceConfig: ServiceConfig) {
    super(serviceConfig);
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'search_tokens',
        description: 'Search tokens by name or symbol on a specific chain',
        inputSchema: {
          type: 'object',
          properties: {
            chainId: { type: 'number', description: 'Chain ID' },
            query: { type: 'string', description: 'Search query' },
            ignore_listed: { type: 'boolean', description: 'Ignore listed tokens' },
            only_positive_rating: { type: 'boolean', description: 'Only positive rating tokens' },
            limit: { type: 'number', description: 'Maximum number of results' },
            country: { type: 'object', description: 'Country object' }
          },
          required: ['chainId', 'query']
        }
      },
      {
        name: 'get_tokens_info',
        description: 'Get detailed information about specific tokens by addresses',
        inputSchema: {
          type: 'object',
          properties: {
            chainId: { type: 'number', description: 'Chain ID' },
            addresses: { 
              type: 'string', 
              description: 'Comma-separated token addresses'
            },
            provider: { type: 'string', description: 'Provider code', default: '1inch' },
            country: { type: 'string', description: 'Country code' }
          },
          required: ['chainId', 'addresses']
        }
      },
      {
        name: 'get_all_tokens_info',
        description: 'Get information about all tokens supported by 1inch on a specific network',
        inputSchema: {
          type: 'object',
          properties: {
            chainId: { type: 'number', description: 'Chain ID' },
            provider: { type: 'string', description: 'Provider code', default: '1inch' },
            country: { type: 'string', description: 'Country code' }
          },
          required: ['chainId']
        }
      },
      {
        name: 'get_token_list',
        description: 'Get the list of tokens on a specific chain',
        inputSchema: {
          type: 'object',
          properties: {
            chainId: { type: 'number', description: 'Chain ID' },
            provider: { type: 'string', description: 'Provider code', default: '1inch' },
            country: { type: 'string', description: 'Country code' }
          },
          required: ['chainId']
        }
      },
      {
        name: 'get_single_token_info',
        description: 'Get information for a single token by address',
        inputSchema: {
          type: 'object',
          properties: {
            chainId: { type: 'number', description: 'Chain ID' },
            address: { type: 'string', description: 'Token address' },
            provider: { type: 'string', description: 'Provider code', default: '1inch' },
            country: { type: 'string', description: 'Country code' }
          },
          required: ['chainId', 'address']
        }
      },
      {
        name: 'get_multi_chain_tokens',
        description: 'Get 1inch whitelisted multi-chain token info',
        inputSchema: {
          type: 'object',
          properties: {
            provider: { type: 'string', description: 'Provider code', default: '1inch' },
            country: { type: 'string', description: 'Country code' }
          },
          required: []
        }
      },
      {
        name: 'get_multi_chain_tokens_list',
        description: 'Get 1inch whitelisted multi-chain tokens as a list',
        inputSchema: {
          type: 'object',
          properties: {
            provider: { type: 'string', description: 'Provider code', default: '1inch' },
            country: { type: 'string', description: 'Country code' }
          },
          required: []
        }
      },
      {
        name: 'search_multi_chain_tokens',
        description: 'Search for whitelisted multi-chain tokens by name or symbol',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query' },
            ignore_listed: { type: 'boolean', description: 'Ignore listed tokens' },
            only_positive_rating: { type: 'boolean', description: 'Only positive rating tokens' },
            limit: { type: 'number', description: 'Maximum number of results' },
            country: { type: 'object', description: 'Country object' }
          },
          required: ['query']
        }
      },
      {
        name: 'get_supported_chains',
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
        description: 'Complete documentation for 1inch Token API v1.3',
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
      case 'get_tokens_info':
        return await this.getTokensInfo(args);
      case 'get_all_tokens_info':
        return await this.getAllTokensInfo(args);
      case 'get_token_list':
        return await this.getTokenList(args);
      case 'get_single_token_info':
        return await this.getSingleTokenInfo(args);
      case 'get_multi_chain_tokens':
        return await this.getMultiChainTokens(args);
      case 'get_multi_chain_tokens_list':
        return await this.getMultiChainTokensList(args);
      case 'search_multi_chain_tokens':
        return await this.searchMultiChainTokens(args);
      case 'get_supported_chains':
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

  // Implementation methods - Updated to match documented v1.3 API endpoints
  
  // GET /v1.3/{chainId}/search
  async searchTokens(params: TokenSearchRequest): Promise<TokenSearchResponse> {
    this.validateRequiredParams(params, ['chainId', 'query']);
    
    const { chainId, query, ignore_listed, only_positive_rating, limit, country } = params;
    
    const queryParams: any = { query };
    if (ignore_listed !== undefined) queryParams.ignore_listed = ignore_listed;
    if (only_positive_rating !== undefined) queryParams.only_positive_rating = only_positive_rating;
    if (limit) queryParams.limit = limit;
    if (country) queryParams.country = country;
    
    return await this.makeRequest<TokenSearchResponse>(`/token/v1.3/${chainId}/search`, queryParams);
  }

  // GET /v1.2/{chainId}/custom
  async getTokensInfo(params: TokenCustomRequest): Promise<TokenCustomResponse> {
    this.validateRequiredParams(params, ['chainId', 'addresses']);
    
    const { chainId, addresses, provider = '1inch', country } = params;
    
    const queryParams: any = { addresses, provider };
    if (country) queryParams.country = country;
    
    return await this.makeRequest<TokenCustomResponse>(`/token/v1.2/${chainId}/custom`, queryParams);
  }

  // GET /v1.3/{chainId}
  async getAllTokensInfo(params: AllTokensInfoRequest): Promise<AllTokensInfoResponse> {
    this.validateRequiredParams(params, ['chainId']);
    
    const { chainId, provider = '1inch', country } = params;
    
    const queryParams: any = { provider };
    if (country) queryParams.country = country;
    
    return await this.makeRequest<AllTokensInfoResponse>(`/token/v1.3/${chainId}`, queryParams);
  }

  // GET /v1.2/{chainId}/token-list
  async getTokenList(params: TokenListRequest): Promise<TokenListResponse> {
    this.validateRequiredParams(params, ['chainId']);
    
    const { chainId, provider = '1inch', country } = params;
    
    const queryParams: any = { provider };
    if (country) queryParams.country = country;
    
    return await this.makeRequest<TokenListResponse>(`/token/v1.2/${chainId}/token-list`, queryParams);
  }

  // GET /v1.2/{chainId}/custom/{address}
  async getSingleTokenInfo(params: SingleTokenRequest): Promise<SingleTokenResponse> {
    this.validateRequiredParams(params, ['chainId', 'address']);
    
    const { chainId, address, provider = '1inch', country } = params;
    
    const queryParams: any = { provider };
    if (country) queryParams.country = country;
    
    return await this.makeRequest<SingleTokenResponse>(`/token/v1.2/${chainId}/custom/${address}`, queryParams);
  }

  // GET /v1.3/multi-chain
  async getMultiChainTokens(params: MultiChainTokensRequest): Promise<MultiChainTokensResponse> {
    const { provider = '1inch', country } = params;
    
    const queryParams: any = { provider };
    if (country) queryParams.country = country;
    
    return await this.makeRequest<MultiChainTokensResponse>(`/token/v1.3/multi-chain`, queryParams);
  }

  // GET /v1.3/multi-chain/token-list
  async getMultiChainTokensList(params: MultiChainTokensRequest): Promise<TokenListResponse> {
    const { provider = '1inch', country } = params;
    
    const queryParams: any = { provider };
    if (country) queryParams.country = country;
    
    return await this.makeRequest<TokenListResponse>(`/token/v1.3/multi-chain/token-list`, queryParams);
  }

  // GET /v1.3/search
  async searchMultiChainTokens(params: MultiChainSearchRequest): Promise<MultiChainSearchResponse> {
    this.validateRequiredParams(params, ['query']);
    
    const { query, ignore_listed, only_positive_rating, limit, country } = params;
    
    const queryParams: any = { query };
    if (ignore_listed !== undefined) queryParams.ignore_listed = ignore_listed;
    if (only_positive_rating !== undefined) queryParams.only_positive_rating = only_positive_rating;
    if (limit) queryParams.limit = limit;
    if (country) queryParams.country = country;
    
    return await this.makeRequest<MultiChainSearchResponse>(`/token/v1.3/search`, queryParams);
  }

  // GET /v1.3/multi-chain/supported-chains
  async getSupportedChains(): Promise<SupportedChainsResponse> {
    return await this.makeRequest<SupportedChainsResponse>(`/token/v1.3/multi-chain/supported-chains`);
  }

  private async getTokenDocumentation(): Promise<string> {
    return `
# 1inch Token API v1.3 Documentation

## Overview
The 1inch Token API provides comprehensive token information across multiple blockchain networks.

## Available Endpoints

### GET /token/v1.3/multi-chain
Get 1inch whitelisted multi-chain token info.
**Parameters:** provider (optional), country (optional)

### GET /token/v1.3/multi-chain/token-list
Returns the tokens as a list, not as a map.
**Parameters:** provider (optional), country (optional)

### GET /token/v1.3/multi-chain/supported-chains
Lists all supported chain IDs.

### GET /token/v1.3/search
Search for whitelisted multi-chain tokens by name or symbol.
**Parameters:** query (required), ignore_listed (optional), only_positive_rating (optional), limit (optional), country (optional)

### GET /token/v1.3/{chainId}
Gets 1inch whitelisted tokens for a specific chain.
**Parameters:** chainId (required), provider (optional), country (optional)

### GET /token/v1.2/{chainId}/token-list
Returns tokens as a list for a specific chain.
**Parameters:** chainId (required), provider (optional), country (optional)

### GET /token/v1.2/{chainId}/search
Search whitelisted tokens on a given chain by name or symbol.
**Parameters:** chainId (required), query (required), ignore_listed (optional), only_positive_rating (optional), limit (optional), country (optional)

### GET /token/v1.2/{chainId}/custom
Get info on multiple specific tokens by addresses on a given chain.
**Parameters:** chainId (required), addresses (required), provider (optional), country (optional)

### GET /token/v1.2/{chainId}/custom/{address}
Get info for a single token/address on a given chain.
**Parameters:** chainId (required), address (required), provider (optional), country (optional)

## Authentication
All endpoints require an API key via Authorization: Bearer header.

## Supported Chains
- Ethereum (1)
- BSC (56)
- Polygon (137)
- Arbitrum (42161)
- Optimism (10)
- Avalanche (43114)
- Fantom (250)
- Gnosis (100)
- And many more...

## Example Usage
Search for "USDC" tokens on Ethereum:
\`\`\`
GET /token/v1.3/1/search?query=USDC&limit=5
\`\`\`
    `;
  }
} 