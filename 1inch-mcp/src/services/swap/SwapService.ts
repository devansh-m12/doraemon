import { BaseService, ServiceConfig, ToolDefinition, ResourceDefinition, PromptDefinition } from '../base/BaseService';
import { 
  SwapQuoteRequest, 
  SwapQuoteResponse,
  TokenAllowanceRequest,
  TokenAllowanceResponse,
  ApproveTransactionRequest,
  ApproveTransactionResponse
} from './SwapTypes';

export class SwapService extends BaseService {
  constructor(serviceConfig: ServiceConfig) {
    super(serviceConfig);
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'get_swap_quote',
        description: 'Get a quote for token swap with best rates across DEXs (v6.0)',
        inputSchema: {
          type: 'object',
          properties: {
            chainId: { type: 'number', description: 'Chain ID (1 for Ethereum, 56 for BSC, etc.)' },
            src: { type: 'string', description: 'Source token address' },
            dst: { type: 'string', description: 'Destination token address' },
            amount: { type: 'string', description: 'Amount to swap in wei' },
            from: { type: 'string', description: 'Wallet address' },
            slippage: { type: 'number', description: 'Slippage tolerance (1-50)', default: 1 },
            disableEstimate: { type: 'boolean', description: 'Disable gas estimation', default: false }
          },
          required: ['chainId', 'src', 'dst', 'amount', 'from']
        }
      },
      {
        name: 'get_swap_transaction',
        description: 'Get the actual swap transaction data to execute (v6.0)',
        inputSchema: {
          type: 'object',
          properties: {
            chainId: { type: 'number' },
            src: { type: 'string' },
            dst: { type: 'string' },
            amount: { type: 'string' },
            from: { type: 'string' },
            slippage: { type: 'number', default: 1 }
          },
          required: ['chainId', 'src', 'dst', 'amount', 'from']
        }
      },
      {
        name: 'get_token_allowance',
        description: 'Check if wallet has approved spending of a token (v6.0)',
        inputSchema: {
          type: 'object',
          properties: {
            chainId: { type: 'number' },
            tokenAddress: { type: 'string' },
            walletAddress: { type: 'string' }
          },
          required: ['chainId', 'tokenAddress', 'walletAddress']
        }
      },
      {
        name: 'get_approve_transaction',
        description: 'Get transaction data to approve token spending (v6.0)',
        inputSchema: {
          type: 'object',
          properties: {
            chainId: { type: 'number' },
            tokenAddress: { type: 'string' },
            amount: { type: 'string', description: 'Amount to approve (optional, defaults to unlimited)' }
          },
          required: ['chainId', 'tokenAddress']
        }
      }
    ];
  }

  getResources(): ResourceDefinition[] {
    return [
      {
        uri: '1inch://swap/documentation',
        name: 'Swap API Documentation',
        description: 'Complete documentation for 1inch Swap API',
        mimeType: 'text/markdown'
      },
      {
        uri: '1inch://swap/supported-chains',
        name: 'Supported Chains for Swap',
        description: 'List of supported blockchain networks for swapping',
        mimeType: 'application/json'
      }
    ];
  }

  getPrompts(): PromptDefinition[] {
    return [
      {
        name: 'swap_tokens',
        description: 'Interactive prompt to help users swap tokens with best rates',
        arguments: [
          {
            name: 'from_token',
            description: 'Token to swap from',
            required: true
          },
          {
            name: 'to_token',
            description: 'Token to swap to',
            required: true
          },
          {
            name: 'amount',
            description: 'Amount to swap',
            required: true
          }
        ]
      }
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    switch (name) {
      case 'get_swap_quote':
        return await this.getSwapQuote(args);
      case 'get_swap_transaction':
        return await this.getSwapTransaction(args);
      case 'get_token_allowance':
        return await this.getTokenAllowance(args);
      case 'get_approve_transaction':
        return await this.getApproveTransaction(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  async handleResourceRead(uri: string): Promise<any> {
    switch (uri) {
      case '1inch://swap/documentation':
        return {
          contents: [
            {
              uri,
              mimeType: 'text/markdown',
              text: await this.getSwapDocumentation()
            }
          ]
        };
      case '1inch://swap/supported-chains':
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify({
                chains: [
                  { chainId: 1, name: 'Ethereum' },
                  { chainId: 56, name: 'BSC' },
                  { chainId: 137, name: 'Polygon' },
                  { chainId: 42161, name: 'Arbitrum' },
                  { chainId: 10, name: 'Optimism' }
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
      case 'swap_tokens':
        return {
          description: 'Token swap assistant',
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `Help me swap ${args?.amount} ${args?.from_token} to ${args?.to_token} using 1inch. Find the best rate and explain the process.`
              }
            }
          ]
        };
      default:
        throw new Error(`Unknown prompt: ${name}`);
    }
  }

  // Implementation methods
  async getSwapQuote(params: SwapQuoteRequest): Promise<SwapQuoteResponse> {
    this.validateRequiredParams(params, ['chainId', 'src', 'dst', 'amount', 'from']);
    
    const { chainId, src, dst, amount, from, slippage = 1, disableEstimate = false } = params;
    
    return await this.makeRequest<SwapQuoteResponse>(`/swap/v6.0/${chainId}/quote`, {
      src,
      dst,
      amount,
      from,
      slippage,
      disableEstimate
    });
  }

  async getSwapTransaction(params: SwapQuoteRequest): Promise<SwapQuoteResponse> {
    this.validateRequiredParams(params, ['chainId', 'src', 'dst', 'amount', 'from']);
    
    const { chainId, src, dst, amount, from, slippage = 1 } = params;
    
    return await this.makeRequest<SwapQuoteResponse>(`/swap/v6.0/${chainId}/swap`, {
      src,
      dst,
      amount,
      from,
      slippage
    });
  }

  async getTokenAllowance(params: TokenAllowanceRequest): Promise<TokenAllowanceResponse> {
    this.validateRequiredParams(params, ['chainId', 'tokenAddress', 'walletAddress']);
    
    const { chainId, tokenAddress, walletAddress } = params;
    
    return await this.makeRequest<TokenAllowanceResponse>(`/swap/v6.0/${chainId}/approve/allowance`, {
      tokenAddress,
      walletAddress
    });
  }

  async getApproveTransaction(params: ApproveTransactionRequest): Promise<ApproveTransactionResponse> {
    this.validateRequiredParams(params, ['chainId', 'tokenAddress']);
    
    const { chainId, tokenAddress, amount } = params;
    
    return await this.makeRequest<ApproveTransactionResponse>(`/swap/v6.0/${chainId}/approve/transaction`, {
      tokenAddress,
      amount
    });
  }

  private async getSwapDocumentation(): Promise<string> {
    return `
# 1inch Swap API Documentation

## Overview
The 1inch Swap API allows you to find the best swap routes across multiple DEXs and get transaction data for execution.

## Available Endpoints

### GET /swap/v6.0/{chainId}/quote
Get a quote for token swap with best rates across DEXs.

**Parameters:**
- chainId: Chain ID (1 for Ethereum, 56 for BSC, etc.)
- src: Source token address
- dst: Destination token address
- amount: Amount to swap in wei
- from: Wallet address
- slippage: Slippage tolerance (1-50), default: 1
- disableEstimate: Disable gas estimation, default: false

### GET /swap/v6.0/{chainId}/swap
Get the actual swap transaction data to execute.

**Parameters:**
- chainId: Chain ID
- src: Source token address
- dst: Destination token address
- amount: Amount to swap in wei
- from: Wallet address
- slippage: Slippage tolerance, default: 1

### GET /swap/v6.0/{chainId}/approve/allowance
Check if wallet has approved spending of a token.

**Parameters:**
- chainId: Chain ID
- tokenAddress: Token address
- walletAddress: Wallet address

### GET /swap/v6.0/{chainId}/approve/transaction
Get transaction data to approve token spending.

**Parameters:**
- chainId: Chain ID
- tokenAddress: Token address
- amount: Amount to approve (optional, defaults to unlimited)

## Supported Chains
- Ethereum (1)
- BSC (56)
- Polygon (137)
- Arbitrum (42161)
- Optimism (10)
- Avalanche (43114)
- Fantom (250)
- Gnosis (100)
    `;
  }
} 