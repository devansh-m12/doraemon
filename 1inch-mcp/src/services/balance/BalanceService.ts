import { BaseService, ServiceConfig, ToolDefinition, ResourceDefinition, PromptDefinition } from '../base/BaseService';
import {
  AggregatedBalancesAndAllowancesRequest,
  AggregatedBalancesAndAllowancesResponse,
  WalletBalancesRequest,
  WalletBalancesResponse,
  CustomTokensBalancesRequest,
  CustomTokensBalancesResponse,
  AggregatedCustomTokensBalancesRequest,
  AggregatedCustomTokensBalancesResponse,
  BalancesAndAllowancesRequest,
  BalancesAndAllowancesResponse,
  CustomTokensBalancesAndAllowancesRequest,
  CustomTokensBalancesAndAllowancesResponse,
  AllowancesRequest,
  AllowancesResponse,
  CustomTokensAllowancesRequest,
  CustomTokensAllowancesResponse
} from './BalanceTypes';

export class BalanceService extends BaseService {
  constructor(serviceConfig: ServiceConfig) {
    super(serviceConfig);
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'get_aggregated_balances_and_allowances',
        description: 'Get balances and allowances by spender for list of wallet addresses',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID of the network' },
            spender: { type: 'string', description: 'Spender address' },
            wallets: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'List of wallet addresses'
            },
            filterEmpty: { type: 'boolean', description: 'Filter out empty balances and allowances', default: false }
          },
          required: ['chain', 'spender', 'wallets']
        }
      },
      {
        name: 'get_wallet_balances',
        description: 'Get balances of tokens for a single wallet address',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID of the network' },
            walletAddress: { type: 'string', description: 'Wallet address' }
          },
          required: ['chain', 'walletAddress']
        }
      },
      {
        name: 'get_custom_tokens_balances',
        description: 'Get balances of custom tokens for a wallet',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID of the network' },
            walletAddress: { type: 'string', description: 'Wallet address' },
            customTokens: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'List of custom token addresses'
            }
          },
          required: ['chain', 'walletAddress', 'customTokens']
        }
      },
      {
        name: 'get_aggregated_custom_tokens_balances',
        description: 'Get balances of custom tokens for list of wallets',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID of the network' },
            wallets: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'List of wallet addresses'
            },
            customTokens: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'List of custom token addresses'
            }
          },
          required: ['chain', 'wallets', 'customTokens']
        }
      },
      {
        name: 'get_balances_and_allowances',
        description: 'Get balances and allowances of tokens by spender for wallet',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID of the network' },
            spender: { type: 'string', description: 'Spender address' },
            walletAddress: { type: 'string', description: 'Wallet address' }
          },
          required: ['chain', 'spender', 'walletAddress']
        }
      },
      {
        name: 'get_custom_tokens_balances_and_allowances',
        description: 'Get balances and allowances of custom tokens by spender for wallet',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID of the network' },
            spender: { type: 'string', description: 'Spender address' },
            walletAddress: { type: 'string', description: 'Wallet address' },
            customTokens: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'List of custom token addresses'
            }
          },
          required: ['chain', 'spender', 'walletAddress', 'customTokens']
        }
      },
      {
        name: 'get_allowances',
        description: 'Get allowances of tokens by spender for wallet',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID of the network' },
            spender: { type: 'string', description: 'Spender address' },
            walletAddress: { type: 'string', description: 'Wallet address' }
          },
          required: ['chain', 'spender', 'walletAddress']
        }
      },
      {
        name: 'get_custom_tokens_allowances',
        description: 'Get allowances of custom tokens by spender for wallet',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID of the network' },
            spender: { type: 'string', description: 'Spender address' },
            walletAddress: { type: 'string', description: 'Wallet address' },
            customTokens: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'List of custom token addresses'
            }
          },
          required: ['chain', 'spender', 'walletAddress', 'customTokens']
        }
      }
    ];
  }

  getResources(): ResourceDefinition[] {
    return [
      {
        uri: '1inch://balance/documentation',
        name: 'Balance API Documentation',
        description: 'Complete documentation for 1inch Balance API',
        mimeType: 'text/markdown'
      },
      {
        uri: '1inch://balance/supported-chains',
        name: 'Supported Chains',
        description: 'List of supported blockchain chains for balance queries',
        mimeType: 'application/json'
      }
    ];
  }

  getPrompts(): PromptDefinition[] {
    return [
      {
        name: 'analyze_wallet_portfolio',
        description: 'Analyze wallet portfolio with balances and allowances',
        arguments: [
          { name: 'chain', description: 'Chain ID', required: true },
          { name: 'walletAddress', description: 'Wallet address', required: true },
          { name: 'spender', description: 'Spender address for allowance analysis', required: false }
        ]
      }
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    switch (name) {
      case 'get_aggregated_balances_and_allowances':
        return await this.getAggregatedBalancesAndAllowances(args);
      case 'get_wallet_balances':
        return await this.getWalletBalances(args);
      case 'get_custom_tokens_balances':
        return await this.getCustomTokensBalances(args);
      case 'get_aggregated_custom_tokens_balances':
        return await this.getAggregatedCustomTokensBalances(args);
      case 'get_balances_and_allowances':
        return await this.getBalancesAndAllowances(args);
      case 'get_custom_tokens_balances_and_allowances':
        return await this.getCustomTokensBalancesAndAllowances(args);
      case 'get_allowances':
        return await this.getAllowances(args);
      case 'get_custom_tokens_allowances':
        return await this.getCustomTokensAllowances(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  async handleResourceRead(uri: string): Promise<any> {
    switch (uri) {
      case '1inch://balance/documentation':
        return await this.getBalanceDocumentation();
      case '1inch://balance/supported-chains':
        return await this.getSupportedChains();
      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
  }

  async handlePromptRequest(name: string, args: any): Promise<any> {
    switch (name) {
      case 'analyze_wallet_portfolio':
        return await this.analyzeWalletPortfolio(args);
      default:
        throw new Error(`Unknown prompt: ${name}`);
    }
  }

  async getAggregatedBalancesAndAllowances(params: AggregatedBalancesAndAllowancesRequest): Promise<AggregatedBalancesAndAllowancesResponse> {
    const url = `${this.baseUrl}/balance/v1.2/${params.chain}/aggregatedBalancesAndAllowances/${params.spender}`;
    const queryParams = new URLSearchParams();
    
    params.wallets.forEach(wallet => {
      queryParams.append('wallets', wallet);
    });
    
    if (params.filterEmpty !== undefined) {
      queryParams.append('filterEmpty', params.filterEmpty.toString());
    }

    const response = await this.makeRequest<AggregatedBalancesAndAllowancesResponse>(`${url}?${queryParams.toString()}`);
    return response;
  }

  async getWalletBalances(params: WalletBalancesRequest): Promise<WalletBalancesResponse> {
    const url = `${this.baseUrl}/balance/v1.2/${params.chain}/balances/${params.walletAddress}`;
    const response = await this.makeRequest<WalletBalancesResponse>(url);
    return response;
  }

  async getCustomTokensBalances(params: CustomTokensBalancesRequest): Promise<CustomTokensBalancesResponse> {
    const url = `${this.baseUrl}/balance/v1.2/${params.chain}/balances/${params.walletAddress}`;
    const body = {
      tokens: params.customTokens
    };

    const response = await this.makePostRequest<CustomTokensBalancesResponse>(url, body);
    return response;
  }

  async getAggregatedCustomTokensBalances(params: AggregatedCustomTokensBalancesRequest): Promise<AggregatedCustomTokensBalancesResponse> {
    const url = `${this.baseUrl}/balance/v1.2/${params.chain}/balances/multiple/walletsAndTokens`;
    const body = {
      tokens: params.customTokens,
      wallets: params.wallets
    };

    const response = await this.makePostRequest<AggregatedCustomTokensBalancesResponse>(url, body);
    return response;
  }

  async getBalancesAndAllowances(params: BalancesAndAllowancesRequest): Promise<BalancesAndAllowancesResponse> {
    const url = `${this.baseUrl}/balance/v1.2/${params.chain}/allowancesAndBalances/${params.spender}/${params.walletAddress}`;
    const response = await this.makeRequest<BalancesAndAllowancesResponse>(url);
    return response;
  }

  async getCustomTokensBalancesAndAllowances(params: CustomTokensBalancesAndAllowancesRequest): Promise<CustomTokensBalancesAndAllowancesResponse> {
    const url = `${this.baseUrl}/balance/v1.2/${params.chain}/allowancesAndBalances/${params.spender}/${params.walletAddress}`;
    const body = {
      tokens: params.customTokens
    };

    const response = await this.makePostRequest<CustomTokensBalancesAndAllowancesResponse>(url, body);
    return response;
  }

  async getAllowances(params: AllowancesRequest): Promise<AllowancesResponse> {
    const url = `${this.baseUrl}/balance/v1.2/${params.chain}/allowances/${params.spender}/${params.walletAddress}`;
    const response = await this.makeRequest<AllowancesResponse>(url);
    return response;
  }

  async getCustomTokensAllowances(params: CustomTokensAllowancesRequest): Promise<CustomTokensAllowancesResponse> {
    const url = `${this.baseUrl}/balance/v1.2/${params.chain}/allowances/${params.spender}/${params.walletAddress}`;
    const body = {
      tokens: params.customTokens
    };

    const response = await this.makePostRequest<CustomTokensAllowancesResponse>(url, body);
    return response;
  }

  private async getBalanceDocumentation(): Promise<string> {
    return `# 1inch Balance API Documentation

## Overview
The Balance API provides comprehensive wallet balance and token allowance information across multiple blockchain networks.

## Endpoints

### 1. GET /balance/v1.2/{chain}/aggregatedBalancesAndAllowances/{spender}
Returns aggregated balances and token allowances for a list of wallets associated with the given spender.

**Parameters:**
- chain (path): Chain ID
- spender (path): Spender address
- wallets (query): List of wallet addresses
- filterEmpty (query, optional): Filter out empty balances and allowances

### 2. GET /balance/v1.2/{chain}/balances/{walletAddress}
Retrieves balances of tokens for a single wallet address.

**Parameters:**
- chain (path): Chain ID
- walletAddress (path): Wallet address

### 3. POST /balance/v1.2/{chain}/balances/{walletAddress}
Returns balances for a specific set of custom tokens for a given wallet.

**Parameters:**
- chain (path): Chain ID
- walletAddress (path): Wallet address
- tokens (body): List of custom token addresses

### 4. POST /balance/v1.2/{chain}/balances/multiple/walletsAndTokens
Aggregates balances of custom tokens for multiple wallet addresses.

**Parameters:**
- chain (path): Chain ID
- tokens (body): List of custom token addresses
- wallets (body): List of wallet addresses

### 5. GET /balance/v1.2/{chain}/allowancesAndBalances/{spender}/{walletAddress}
Gets balances and allowances of tokens for a specific wallet and spender.

**Parameters:**
- chain (path): Chain ID
- spender (path): Spender address
- walletAddress (path): Wallet address

### 6. POST /balance/v1.2/{chain}/allowancesAndBalances/{spender}/{walletAddress}
Gets balances and allowances of custom tokens for a specific wallet and spender.

**Parameters:**
- chain (path): Chain ID
- spender (path): Spender address
- walletAddress (path): Wallet address
- tokens (body): List of custom token addresses

### 7. GET /balance/v1.2/{chain}/allowances/{spender}/{walletAddress}
Gets allowances of tokens for a wallet and spender.

**Parameters:**
- chain (path): Chain ID
- spender (path): Spender address
- walletAddress (path): Wallet address

### 8. POST /balance/v1.2/{chain}/allowances/{spender}/{walletAddress}
Gets allowances of custom tokens for a wallet and spender.

**Parameters:**
- chain (path): Chain ID
- spender (path): Spender address
- walletAddress (path): Wallet address
- tokens (body): List of custom token addresses

## Response Format
All endpoints return JSON responses with token balance and allowance information including:
- Token addresses as keys
- Balance amounts (as strings for precision)
- Allowance amounts (as strings for precision)
- Optional token metadata (symbol, name, decimals)

## Authentication
All endpoints require API Key authentication via header.`;
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
      description: 'Supported blockchain chains for balance queries'
    });
  }

  private async analyzeWalletPortfolio(args: any): Promise<string> {
    const { chain, walletAddress, spender } = args;
    
    // Get wallet balances
    const walletBalances = await this.getWalletBalances({ chain, walletAddress });
    
    let analysis = `Wallet Portfolio Analysis for ${walletAddress} on Chain ${chain}:

Total Tokens: ${Object.keys(walletBalances).length}

Token Balances:`;
    
    Object.entries(walletBalances).forEach(([tokenAddress, tokenData]) => {
      analysis += `\n- ${tokenData.symbol || tokenAddress}: ${tokenData.balance}`;
    });

    if (spender) {
      // Get balances and allowances if spender is provided
      const balancesAndAllowances = await this.getBalancesAndAllowances({ 
        chain, 
        spender, 
        walletAddress 
      });
      
      analysis += `\n\nAllowances for Spender ${spender}:`;
      Object.entries(balancesAndAllowances).forEach(([tokenAddress, tokenData]) => {
        analysis += `\n- ${tokenData.symbol || tokenAddress}: ${tokenData.allowance}`;
      });
    }

    return analysis;
  }
} 