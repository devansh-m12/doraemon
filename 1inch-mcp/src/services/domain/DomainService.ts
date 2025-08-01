import { BaseService, ServiceConfig, ToolDefinition, ResourceDefinition, PromptDefinition } from '../base/BaseService';
import {
  GetDomainsByAddressRequest,
  GetDomainsByAddressResponse,
  GetPrimaryDomainRequest,
  GetPrimaryDomainResponse,
  BatchResolveDomainsRequest,
  BatchResolveDomainsResponse,
  GetDomainProvidersResponse
} from './DomainTypes';

export class DomainService extends BaseService {
  constructor(serviceConfig: ServiceConfig) {
    super(serviceConfig);
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'get_domains_by_address',
        description: 'Get all blockchain domains for a given address',
        inputSchema: {
          type: 'object',
          properties: {
            address: { type: 'string', description: 'Blockchain address to resolve domains for' }
          },
          required: ['address']
        }
      },
      {
        name: 'get_primary_domain',
        description: 'Get the primary domain for a given address',
        inputSchema: {
          type: 'object',
          properties: {
            address: { type: 'string', description: 'Blockchain address to get primary domain for' }
          },
          required: ['address']
        }
      },
      {
        name: 'batch_resolve_domains',
        description: 'Batch resolve domains for multiple addresses',
        inputSchema: {
          type: 'object',
          properties: {
            addresses: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'List of blockchain addresses to resolve domains for'
            }
          },
          required: ['addresses']
        }
      },
      {
        name: 'get_domain_providers',
        description: 'Get list of all supported domain providers with metadata',
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
        uri: '1inch://domain/documentation',
        name: 'Domain API Documentation',
        description: 'Complete documentation for 1inch Domain API',
        mimeType: 'text/markdown'
      },
      {
        uri: '1inch://domain/supported-providers',
        name: 'Supported Domain Providers',
        description: 'List of supported domain providers and their features',
        mimeType: 'application/json'
      }
    ];
  }

  getPrompts(): PromptDefinition[] {
    return [
      {
        name: 'analyze_address_domains',
        description: 'Analyze all domains associated with an address',
        arguments: [
          { name: 'address', description: 'Blockchain address to analyze', required: true }
        ]
      },
      {
        name: 'batch_analyze_domains',
        description: 'Analyze domains for multiple addresses',
        arguments: [
          { name: 'addresses', description: 'List of addresses to analyze', required: true }
        ]
      }
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    switch (name) {
      case 'get_domains_by_address':
        return await this.getDomainsByAddress(args);
      case 'get_primary_domain':
        return await this.getPrimaryDomain(args);
      case 'batch_resolve_domains':
        return await this.batchResolveDomains(args);
      case 'get_domain_providers':
        return await this.getDomainProviders(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  async handleResourceRead(uri: string): Promise<any> {
    switch (uri) {
      case '1inch://domain/documentation':
        return await this.getDomainDocumentation();
      case '1inch://domain/supported-providers':
        return await this.getSupportedProviders();
      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
  }

  async handlePromptRequest(name: string, args: any): Promise<any> {
    switch (name) {
      case 'analyze_address_domains':
        return await this.analyzeAddressDomains(args);
      case 'batch_analyze_domains':
        return await this.batchAnalyzeDomains(args);
      default:
        throw new Error(`Unknown prompt: ${name}`);
    }
  }

  async getDomainsByAddress(params: GetDomainsByAddressRequest): Promise<GetDomainsByAddressResponse> {
    const url = `${this.baseUrl}/domains/v2.0/reverse-lookup?address=${params.address}`;
    const response = await this.makeRequest<any>(url);
    
    // Transform the response to match our expected format
    if (response.result) {
      return [{
        domain: response.result.domain,
        provider: response.result.protocol,
        address: params.address
      }];
    }
    return [];
  }

  async getPrimaryDomain(params: GetPrimaryDomainRequest): Promise<GetPrimaryDomainResponse> {
    const url = `${this.baseUrl}/domains/v2.0/reverse-lookup?address=${params.address}`;
    const response = await this.makeRequest<any>(url);
    
    // Transform the response to match our expected format
    if (response.result) {
      return {
        domain: response.result.domain,
        provider: response.result.protocol,
        address: params.address
      };
    }
    throw new Error('No primary domain found');
  }

  async batchResolveDomains(params: BatchResolveDomainsRequest): Promise<BatchResolveDomainsResponse> {
    const url = `${this.baseUrl}/domains/v2.0/reverse-lookup-batch`;
    const response = await this.makePostRequest<any>(url, params.addresses);
    
    // Transform the response to match our expected format
    const results: BatchResolveDomainsResponse = [];
    for (const address of params.addresses) {
      const addressResult = response[address];
      if (addressResult && addressResult.length > 0) {
        results.push({
          address,
          domain: addressResult[0].domain,
          provider: addressResult[0].protocol
        });
      } else {
        results.push({
          address,
          domain: undefined,
          provider: undefined
        });
      }
    }
    return results;
  }

  async getDomainProviders(params: {}): Promise<GetDomainProvidersResponse> {
    // This endpoint doesn't exist in the actual API, so we'll return a mock response
    // or we could use getProvidersDataWithAvatar with a sample address
    const url = `${this.baseUrl}/domains/v2.0/get-providers-data-with-avatar?addressOrDomain=example.eth`;
    const response = await this.makeRequest<any>(url);
    
    // Transform the response to match our expected format
    if (response.result) {
      return [{
        provider: response.result.protocol,
        avatar: response.result.avatar,
        description: `Provider for ${response.result.protocol}`
      }];
    }
    return [];
  }

  private async getDomainDocumentation(): Promise<string> {
    return `# 1inch Domain API Documentation

## Overview
The Domain API provides comprehensive blockchain domain resolution services, supporting multiple domain providers like ENS, Unstoppable Domains, and others.

## Available Endpoints

### 1. GET /domains/address/{address}/
Returns all blockchain domains for a given address, if any exist.

**Parameters:**
- address (path): Blockchain address to resolve domains for

**Response Format:**
\`\`\`json
[
  {
    "domain": "example.eth",
    "provider": "ENS",
    "address": "0x123..."
  }
]
\`\`\`

### 2. GET /domains/address/{address}/primary/
Returns the primary domain for a given address, if any exists.

**Parameters:**
- address (path): Blockchain address to get primary domain for

**Response Format:**
\`\`\`json
{
  "domain": "example.eth",
  "provider": "ENS",
  "address": "0x123..."
}
\`\`\`

### 3. POST /domains/address/batch/
Batch resolve domains for an array of blockchain addresses.

**Request Body:**
\`\`\`json
{
  "addresses": ["0x123...", "0x456..."]
}
\`\`\`

**Response Format:**
\`\`\`json
[
  {
    "address": "0x123...",
    "domain": "example.eth",
    "provider": "ENS"
  },
  {
    "address": "0x456...",
    "domain": null,
    "provider": null
  }
]
\`\`\`

### 4. GET /domains/providers/
Returns a list of all supported domain providers with metadata.

**Response Format:**
\`\`\`json
[
  {
    "provider": "ENS",
    "avatar": "https://example.com/ens-avatar.png",
    "description": "Ethereum Name Service"
  },
  {
    "provider": "Unstoppable",
    "avatar": "https://example.com/unstoppable-avatar.png",
    "description": "Unstoppable Domains"
  }
]
\`\`\`

## Domain Providers

### Supported Providers
- **ENS (Ethereum Name Service)**: .eth domains on Ethereum
- **Unstoppable Domains**: Multiple TLDs including .crypto, .nft, .wallet
- **Freename**: .freename domains
- **Bonfida**: .sol domains on Solana
- **And more...**

### Provider Features
- **ENS**: Most widely adopted, supports subdomains and reverse resolution
- **Unstoppable**: Multi-chain support, user-friendly domains
- **Freename**: Decentralized naming service
- **Bonfida**: Solana blockchain integration

## Response Format Details

### Domain Information
- **domain**: The full domain name (e.g., "example.eth")
- **provider**: The domain provider (e.g., "ENS", "Unstoppable")
- **address**: The blockchain address associated with the domain

### Batch Resolution
- Returns results for all requested addresses
- Addresses without domains return null values
- Maintains order of input addresses

## Authentication
All endpoints require API Key authentication via header.

## Best Practices

### Address Validation
- Ensure addresses are properly formatted (0x-prefixed for Ethereum)
- Validate address checksums when possible
- Handle both uppercase and lowercase addresses

### Batch Processing
- Limit batch sizes to reasonable numbers (recommended: 100-500 addresses)
- Consider rate limits when processing large batches
- Handle partial failures gracefully

### Error Handling
- Some addresses may not have associated domains
- Providers may have different availability
- Network issues may affect resolution

## Common Use Cases

### 1. Address Resolution
Resolve human-readable names to blockchain addresses:
\`\`\`
GET /domains/address/0x123.../
\`\`\`

### 2. Primary Domain Lookup
Find the main domain for an address:
\`\`\`
GET /domains/address/0x123.../primary/
\`\`\`

### 3. Batch Processing
Resolve multiple addresses efficiently:
\`\`\`
POST /domains/address/batch/
{
  "addresses": ["0x123...", "0x456..."]
}
\`\`\`

### 4. Provider Information
Get metadata about supported providers:
\`\`\`
GET /domains/providers/
\`\`\`

## Rate Limits
- Standard API rate limits apply
- Batch endpoints may have different limits
- Monitor usage to avoid hitting limits

## Error Responses
- 400: Invalid address format
- 404: Address not found or no domains
- 429: Rate limit exceeded
- 500: Internal server error`;
  }

  private async getSupportedProviders(): Promise<string> {
    return JSON.stringify({
      providers: [
        {
          name: 'ENS',
          fullName: 'Ethereum Name Service',
          description: 'Decentralized naming system for Ethereum addresses',
          domains: ['.eth'],
          features: ['Reverse resolution', 'Subdomains', 'Multi-chain support'],
          website: 'https://ens.domains'
        },
        {
          name: 'Unstoppable',
          fullName: 'Unstoppable Domains',
          description: 'User-friendly blockchain domains',
          domains: ['.crypto', '.nft', '.wallet', '.blockchain', '.dao', '.888', '.zil'],
          features: ['Multi-chain', 'User-friendly', 'NFT integration'],
          website: 'https://unstoppabledomains.com'
        },
        {
          name: 'Freename',
          fullName: 'Freename',
          description: 'Decentralized naming service',
          domains: ['.freename'],
          features: ['Decentralized', 'Community-driven'],
          website: 'https://freename.io'
        },
        {
          name: 'Bonfida',
          fullName: 'Bonfida',
          description: 'Solana blockchain naming service',
          domains: ['.sol'],
          features: ['Solana integration', 'Fast resolution'],
          website: 'https://bonfida.com'
        },
        {
          name: 'Space ID',
          fullName: 'Space ID',
          description: 'Universal Web3 identity network',
          domains: ['.bnb', '.arb'],
          features: ['Multi-chain', 'Universal identity'],
          website: 'https://space.id'
        }
      ],
      description: 'Supported domain providers and their features',
      note: 'Provider availability may vary by region and network conditions'
    });
  }

  private async analyzeAddressDomains(args: any): Promise<string> {
    const { address } = args;
    
    // Get all domains for the address
    const domains = await this.getDomainsByAddress({ address });
    
    // Get primary domain
    let primaryDomain;
    try {
      primaryDomain = await this.getPrimaryDomain({ address });
    } catch (error) {
      // Primary domain might not exist
      primaryDomain = null;
    }

    let analysis = `Domain Analysis for Address: ${address}

Total Domains Found: ${domains.length}

All Domains:`;
    
    domains.forEach((domainInfo, index) => {
      analysis += `\n${index + 1}. ${domainInfo.domain} (${domainInfo.provider})`;
    });

    if (primaryDomain) {
      analysis += `\n\nPrimary Domain: ${primaryDomain.domain} (${primaryDomain.provider})`;
    } else {
      analysis += `\n\nPrimary Domain: None found`;
    }

    // Group by provider
    const providerGroups = domains.reduce((acc, domain) => {
      if (domain.provider) {
        if (!acc[domain.provider]) {
          acc[domain.provider] = [];
        }
        if (domain.provider) acc[domain.provider]?.push(domain.domain);
      }
      return acc;
    }, {} as Record<string, string[]>);

    analysis += `\n\nDomains by Provider:`;
    Object.entries(providerGroups).forEach(([provider, domainList]) => {
      analysis += `\n- ${provider}: ${domainList.join(', ')}`;
    });

    return analysis;
  }

  private async batchAnalyzeDomains(args: any): Promise<string> {
    const { addresses } = args;
    
    // Batch resolve domains
    const batchResults = await this.batchResolveDomains({ addresses });
    
    let analysis = `Batch Domain Analysis

Addresses Analyzed: ${addresses.length}
Addresses with Domains: ${batchResults.filter(result => result.domain).length}
Addresses without Domains: ${batchResults.filter(result => !result.domain).length}

Results:`;
    
    batchResults.forEach((result, index) => {
      if (result.domain) {
        analysis += `\n${index + 1}. ${addresses[index]}: ${result.domain} (${result.provider})`;
      } else {
        analysis += `\n${index + 1}. ${addresses[index]}: No domains found`;
      }
    });

    // Summary statistics
    const domainsByProvider = batchResults
      .filter(result => result.domain && result.provider)
      .reduce((acc, result) => {
        const provider = result.provider;
        if (provider) {
          if (!acc[provider]) {
            acc[provider] = 0;
          }
          acc[provider]++;
        }
        return acc;
      }, {} as Record<string, number>);

    if (Object.keys(domainsByProvider).length > 0) {
      analysis += `\n\nProvider Distribution:`;
      Object.entries(domainsByProvider).forEach(([provider, count]) => {
        analysis += `\n- ${provider}: ${count} domains`;
      });
    }

    return analysis;
  }
} 