import { BaseService, ServiceConfig, ToolDefinition, ResourceDefinition, PromptDefinition } from '../base/BaseService';
import {
  SupportedChainsRequest,
  SupportedChainsResponse,
  GetNftsByAddressRequest,
  AssetsResponse,
  GetNftByIdRequest,
  SingleNft,
  NftV2Model
} from './NFTTypes';

export class NFTService extends BaseService {
  constructor(serviceConfig: ServiceConfig) {
    super(serviceConfig);
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'get_supported_chains',
        description: 'Get list of supported chains for NFT API',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'get_nfts_by_address',
        description: 'Get NFTs owned by a specific address across multiple chains',
        inputSchema: {
          type: 'object',
          properties: {
            chainIds: { 
              type: 'array', 
              items: { type: 'number' },
              description: 'Array of chain IDs to search on' 
            },
            address: { type: 'string', description: 'Owner wallet address' },
            limit: { type: 'number', description: 'Number of NFTs to return', default: 20 },
            offset: { type: 'number', description: 'Pagination offset', default: 0 },
            openseaNextToken: { type: 'string', description: 'OpenSea pagination token' }
          },
          required: ['chainIds', 'address']
        }
      },
      {
        name: 'get_nft_by_id',
        description: 'Get detailed info about a specific NFT by contract address and token ID',
        inputSchema: {
          type: 'object',
          properties: {
            chainId: { type: 'number', description: 'Chain ID of the network' },
            contract: { type: 'string', description: 'NFT contract address' },
            id: { type: 'string', description: 'NFT token ID' },
            provider: { type: 'string', description: 'NFT provider (OPENSEA, RARIBLE, POAP)' }
          },
          required: ['chainId', 'contract', 'id', 'provider']
        }
      }
    ];
  }

  getResources(): ResourceDefinition[] {
    return [
      {
        uri: '1inch://nft/documentation',
        name: 'NFT API Documentation',
        description: 'Complete documentation for 1inch NFT API',
        mimeType: 'text/markdown'
      },
      {
        uri: '1inch://nft/supported-chains',
        name: 'Supported Chains',
        description: 'List of supported blockchain chains for NFT queries',
        mimeType: 'application/json'
      }
    ];
  }

  getPrompts(): PromptDefinition[] {
    return [
      {
        name: 'analyze_wallet_nfts',
        description: 'Analyze NFT portfolio for a wallet address across multiple chains',
        arguments: [
          { name: 'chainIds', description: 'Array of chain IDs', required: true },
          { name: 'address', description: 'Wallet address', required: true },
          { name: 'limit', description: 'Number of NFTs to analyze', required: false }
        ]
      }
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    switch (name) {
      case 'get_supported_chains':
        return await this.getSupportedChains(args);
      case 'get_nfts_by_address':
        return await this.getNftsByAddress(args);
      case 'get_nft_by_id':
        return await this.getNftById(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  async handleResourceRead(uri: string): Promise<any> {
    switch (uri) {
      case '1inch://nft/documentation':
        return await this.getNFTDocumentation();
      case '1inch://nft/supported-chains':
        return await this.getSupportedChainsResource();
      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
  }

  async handlePromptRequest(name: string, args: any): Promise<any> {
    switch (name) {
      case 'analyze_wallet_nfts':
        return await this.analyzeWalletNFTs(args);
      default:
        throw new Error(`Unknown prompt: ${name}`);
    }
  }

  async getSupportedChains(params: SupportedChainsRequest): Promise<SupportedChainsResponse> {
    const url = `${this.baseUrl}/nft/v2/supportedchains`;
    const response = await this.makeRequest<number[]>(url);
    return { chains: response };
  }

  async getNftsByAddress(params: GetNftsByAddressRequest): Promise<AssetsResponse> {
    const url = `${this.baseUrl}/nft/v2/byaddress`;
    const queryParams = new URLSearchParams();
    
    queryParams.append('chainIds', params.chainIds.join(','));
    queryParams.append('address', params.address);
    
    if (params.limit !== undefined) {
      queryParams.append('limit', params.limit.toString());
    }
    
    if (params.offset !== undefined) {
      queryParams.append('offset', params.offset.toString());
    }

    if (params.openseaNextToken !== undefined) {
      queryParams.append('openseaNextToken', params.openseaNextToken);
    }

    try {
      const response = await this.makeRequest<AssetsResponse>(`${url}?${queryParams.toString()}`);
      return response;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('NFT API endpoints are not available in the current API subscription. Please check your 1inch API plan.');
      }
      throw error;
    }
  }

  async getNftById(params: GetNftByIdRequest): Promise<SingleNft> {
    const url = `${this.baseUrl}/nft/v2/contract`;
    const queryParams = new URLSearchParams();
    
    queryParams.append('chainId', params.chainId.toString());
    queryParams.append('contract', params.contract);
    queryParams.append('id', params.id);
    queryParams.append('provider', params.provider);

    try {
      const response = await this.makeRequest<SingleNft>(`${url}?${queryParams.toString()}`);
      return response;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('NFT API endpoints are not available in the current API subscription. Please check your 1inch API plan.');
      }
      throw error;
    }
  }

  private async getNFTDocumentation(): Promise<string> {
    return `# 1inch NFT API Documentation

## Overview
The NFT API provides comprehensive NFT (Non-Fungible Token) information across multiple blockchain networks.

## Available Endpoints

### 1. GET /nft/v2/supportedchains ✅
Returns a list of supported chains for the NFT API.

**Parameters:**
- None (GET request)

**Response:**
- Returns an array of supported chain IDs
- Example: [1, 137, 8453, 42161, 8217, 43114, 10]

### 2. GET /nft/v2/byaddress
Returns a list of NFTs owned by a specific address across multiple chains.

**Required Parameters:**
- chainIds (query): Comma-separated list of chain IDs to search on
- address (query): The owner's wallet address

**Optional Parameters:**
- limit (query): Number of NFTs to return (default: 20)
- offset (query): Pagination offset (default: 0)
- openseaNextToken (query): OpenSea pagination token for next page

**Response:**
- Returns an object with assets array and openseaNextToken for pagination
- Each NFT includes: id, token_id, provider, name, chainId, priority, asset_contract

### 3. GET /nft/v2/contract
Get detailed info about a specific NFT by contract address and token ID.

**Required Parameters:**
- chainId (query): The blockchain to query on (e.g., 1 for Ethereum)
- contract (query): The NFT contract address
- id (query): The NFT's token ID
- provider (query): NFT provider (OPENSEA, RARIBLE, POAP)

**Response:**
- Returns detailed NFT information including metadata, collection info, traits, and marketplace links

## NFT Data Structure

### NftV2Model (for getNftsByAddress)
- id: Unique NFT identifier
- token_id: The token ID within the contract
- provider: NFT marketplace provider (OPENSEA, RARIBLE, POAP)
- name: NFT name/title
- chainId: Blockchain network ID
- priority: Priority ranking
- asset_contract: Contract information

### SingleNft (for getNftById)
- id: Unique NFT identifier
- token_id: The token ID within the contract
- name: NFT name/title
- image_url: NFT image data
- chainId: Blockchain network ID
- provider: NFT marketplace provider
- description: NFT description
- permalink: Direct link to NFT
- collection: Collection information
- traits: Array of NFT attributes/traits
- asset_contract: Contract information

### AssetContract
- address: Contract address
- schema_name: Contract schema type
- image_url: Contract image URL

### Collection
- image_url: Collection image URL
- name: Collection name
- description: Collection description
- creator: Creator information
- user: User information

## Supported Chains
The NFT API supports major blockchain networks including:
- Ethereum (1)
- Polygon (137)
- Base (8453)
- Arbitrum (42161)
- Klaytn (8217)
- Avalanche (43114)
- Optimism (10)

## Authentication
All endpoints require API Key authentication via header.

## Subscription Requirements
- Basic Plan: Only supported chains endpoint available
- Higher Plans: Full NFT API access including byaddress and contract endpoints`;
  }

  private async getSupportedChainsResource(): Promise<string> {
    return JSON.stringify({
      chains: [
        { id: 1, name: 'Ethereum' },
        { id: 137, name: 'Polygon' },
        { id: 42161, name: 'Arbitrum' },
        { id: 43114, name: 'Avalanche' },
        { id: 100, name: 'Gnosis' },
        { id: 10, name: 'Optimism' },
        { id: 8217, name: 'Klaytn' },
        { id: 8453, name: 'Base' }
      ],
      description: 'Supported blockchain chains for NFT queries'
    });
  }

  private async analyzeWalletNFTs(args: any): Promise<string> {
    const { chainIds, address, limit = 50 } = args;
    
    // Get NFTs for the wallet across specified chains
    const nfts = await this.getNftsByAddress({ chainIds, address, limit });
    
    let analysis = `NFT Portfolio Analysis for ${address} across chains ${chainIds.join(', ')}:

Total NFTs Found: ${nfts.assets.length}
OpenSea Next Token: ${nfts.openseaNextToken || 'None'}

NFT Collections by Chain:`;
    
    // Group NFTs by chain and contract address
    const collectionsByChain = new Map<number, Map<string, NftV2Model[]>>();
    nfts.assets.forEach(nft => {
      if (!collectionsByChain.has(nft.chainId)) {
        collectionsByChain.set(nft.chainId, new Map());
      }
      const chainCollections = collectionsByChain.get(nft.chainId)!;
      if (!chainCollections.has(nft.asset_contract.address)) {
        chainCollections.set(nft.asset_contract.address, []);
      }
      chainCollections.get(nft.asset_contract.address)!.push(nft);
    });
    
    collectionsByChain.forEach((chainCollections, chainId) => {
      analysis += `\n\nChain ${chainId}:`;
      chainCollections.forEach((nftsInCollection, contractAddress) => {
        analysis += `\n\nCollection: ${contractAddress}`;
        analysis += `\nNFTs in collection: ${nftsInCollection.length}`;
        
        nftsInCollection.forEach(nft => {
          analysis += `\n- ${nft.name} (ID: ${nft.token_id}, Provider: ${nft.provider})`;
        });
      });
    });

    return analysis;
  }
} 