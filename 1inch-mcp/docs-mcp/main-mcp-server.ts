#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { config } from '@/config/index.js';
import { OneInchService } from '@/services/oneInchService.js';
import { logger } from '@/config/logger.js';

/**
 * 1inch MCP Server
 * 
 * This server provides Model Context Protocol access to all 1inch APIs:
 * - Swap API (token swapping with best rates)
 * - Fusion API (gasless transactions)
 * - Portfolio API (multi-chain portfolio tracking)
 * - Balance API (token balances and allowances)
 * - Spot Price API (real-time token prices)
 * - Token API (token information and metadata)
 * - Gas Price API (network gas prices)
 * - History API (transaction history)
 * - NFT API (NFT functionality)
 * - Transaction Gateway API (transaction broadcasting)
 * - Traces API (transaction tracing)
 * - Orderbook API (limit orders)
 * - Fusion Plus API (enhanced Fusion mode)
 */

class OneInchMCPServer {
  private server: Server;
  private oneInchService: OneInchService;

  constructor() {
    this.server = new Server(
      {
        name: '1inch-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
      }
    );

    this.oneInchService = new OneInchService();
    this.setupToolHandlers();
    this.setupResourceHandlers();
    this.setupPromptHandlers();
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          // Swap API Tools
          {
            name: 'get_swap_quote',
            description: 'Get a quote for token swap with best rates across DEXs',
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
            description: 'Get the actual swap transaction data to execute',
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
            description: 'Check if wallet has approved spending of a token',
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
            description: 'Get transaction data to approve token spending',
            inputSchema: {
              type: 'object',
              properties: {
                chainId: { type: 'number' },
                tokenAddress: { type: 'string' },
                amount: { type: 'string', description: 'Amount to approve (optional, defaults to unlimited)' }
              },
              required: ['chainId', 'tokenAddress']
            }
          },

          // Fusion API Tools
          {
            name: 'create_fusion_order',
            description: 'Create a gasless Fusion order with Dutch auction pricing',
            inputSchema: {
              type: 'object',
              properties: {
                chainId: { type: 'number' },
                makerAsset: { type: 'string', description: 'Token to sell' },
                takerAsset: { type: 'string', description: 'Token to buy' },
                makingAmount: { type: 'string', description: 'Amount to sell' },
                takingAmount: { type: 'string', description: 'Minimum amount to receive' },
                maker: { type: 'string', description: 'Maker wallet address' }
              },
              required: ['chainId', 'makerAsset', 'takerAsset', 'makingAmount', 'takingAmount', 'maker']
            }
          },
          {
            name: 'get_fusion_order_status',
            description: 'Get the status of a Fusion order',
            inputSchema: {
              type: 'object',
              properties: {
                chainId: { type: 'number' },
                orderHash: { type: 'string', description: 'Order hash' }
              },
              required: ['chainId', 'orderHash']
            }
          },

          // Portfolio API Tools
          {
            name: 'get_portfolio_overview',
            description: 'Get portfolio overview across multiple chains',
            inputSchema: {
              type: 'object',
              properties: {
                address: { type: 'string', description: 'Wallet address' },
                chains: { type: 'array', items: { type: 'number' }, description: 'Chain IDs to include' }
              },
              required: ['address']
            }
          },
          {
            name: 'get_portfolio_tokens',
            description: 'Get detailed token holdings in portfolio',
            inputSchema: {
              type: 'object',
              properties: {
                address: { type: 'string' },
                chainId: { type: 'number', description: 'Specific chain ID (optional)' }
              },
              required: ['address']
            }
          },

          // Balance API Tools
          {
            name: 'get_token_balances',
            description: 'Get token balances for a wallet',
            inputSchema: {
              type: 'object',
              properties: {
                chainId: { type: 'number' },
                address: { type: 'string', description: 'Wallet address' },
                tokens: { type: 'array', items: { type: 'string' }, description: 'Token addresses (optional)' }
              },
              required: ['chainId', 'address']
            }
          },

          // Price API Tools
          {
            name: 'get_token_price',
            description: 'Get current price of a token',
            inputSchema: {
              type: 'object',
              properties: {
                chainId: { type: 'number' },
                tokenAddress: { type: 'string' },
                currency: { type: 'string', description: 'Price currency (USD, ETH, etc.)', default: 'USD' }
              },
              required: ['chainId', 'tokenAddress']
            }
          },
          {
            name: 'get_price_history',
            description: 'Get historical price data for a token',
            inputSchema: {
              type: 'object',
              properties: {
                chainId: { type: 'number' },
                tokenAddress: { type: 'string' },
                period: { type: 'string', enum: ['1h', '1d', '7d', '30d'], default: '1d' }
              },
              required: ['chainId', 'tokenAddress']
            }
          },

          // Token API Tools
          {
            name: 'search_tokens',
            description: 'Search for tokens by name or symbol',
            inputSchema: {
              type: 'object',
              properties: {
                chainId: { type: 'number' },
                query: { type: 'string', description: 'Search query (name or symbol)' },
                limit: { type: 'number', default: 10 }
              },
              required: ['chainId', 'query']
            }
          },
          {
            name: 'get_token_info',
            description: 'Get detailed information about a token',
            inputSchema: {
              type: 'object',
              properties: {
                chainId: { type: 'number' },
                tokenAddress: { type: 'string' }
              },
              required: ['chainId', 'tokenAddress']
            }
          },

          // Gas Price API Tools
          {
            name: 'get_gas_prices',
            description: 'Get current gas prices for a network',
            inputSchema: {
              type: 'object',
              properties: {
                chainId: { type: 'number' }
              },
              required: ['chainId']
            }
          },

          // History API Tools
          {
            name: 'get_swap_history',
            description: 'Get swap transaction history for a wallet',
            inputSchema: {
              type: 'object',
              properties: {
                chainId: { type: 'number' },
                address: { type: 'string' },
                limit: { type: 'number', default: 10 },
                offset: { type: 'number', default: 0 }
              },
              required: ['chainId', 'address']
            }
          },

          // Transaction Gateway API Tools
          {
            name: 'broadcast_transaction',
            description: 'Broadcast a signed transaction to the network',
            inputSchema: {
              type: 'object',
              properties: {
                chainId: { type: 'number' },
                signedTx: { type: 'string', description: 'Signed transaction hex' },
                private: { type: 'boolean', description: 'Use private mempool', default: false }
              },
              required: ['chainId', 'signedTx']
            }
          },
          {
            name: 'get_transaction_status',
            description: 'Get the status of a broadcasted transaction',
            inputSchema: {
              type: 'object',
              properties: {
                chainId: { type: 'number' },
                txHash: { type: 'string' }
              },
              required: ['chainId', 'txHash']
            }
          },

          // Orderbook API Tools
          {
            name: 'create_limit_order',
            description: 'Create a limit order on the orderbook',
            inputSchema: {
              type: 'object',
              properties: {
                chainId: { type: 'number' },
                makerAsset: { type: 'string' },
                takerAsset: { type: 'string' },
                makingAmount: { type: 'string' },
                takingAmount: { type: 'string' },
                maker: { type: 'string' }
              },
              required: ['chainId', 'makerAsset', 'takerAsset', 'makingAmount', 'takingAmount', 'maker']
            }
          },

          // Utility Tools
          {
            name: 'get_supported_chains',
            description: 'Get list of all supported blockchain networks',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'health_check',
            description: 'Check the health status of 1inch APIs',
            inputSchema: {
              type: 'object',
              properties: {
                chainId: { type: 'number', description: 'Chain ID to check (optional)' }
              }
            }
          }
        ]
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          // Swap API implementations
          case 'get_swap_quote':
            return await this.handleSwapQuote(args);
          case 'get_swap_transaction':
            return await this.handleSwapTransaction(args);
          case 'get_token_allowance':
            return await this.handleTokenAllowance(args);
          case 'get_approve_transaction':
            return await this.handleApproveTransaction(args);

          // Fusion API implementations
          case 'create_fusion_order':
            return await this.handleCreateFusionOrder(args);
          case 'get_fusion_order_status':
            return await this.handleFusionOrderStatus(args);

          // Portfolio API implementations
          case 'get_portfolio_overview':
            return await this.handlePortfolioOverview(args);
          case 'get_portfolio_tokens':
            return await this.handlePortfolioTokens(args);

          // Balance API implementations
          case 'get_token_balances':
            return await this.handleTokenBalances(args);

          // Price API implementations
          case 'get_token_price':
            return await this.handleTokenPrice(args);
          case 'get_price_history':
            return await this.handlePriceHistory(args);

          // Token API implementations
          case 'search_tokens':
            return await this.handleSearchTokens(args);
          case 'get_token_info':
            return await this.handleTokenInfo(args);

          // Gas Price API implementations
          case 'get_gas_prices':
            return await this.handleGasPrices(args);

          // History API implementations
          case 'get_swap_history':
            return await this.handleSwapHistory(args);

          // Transaction Gateway API implementations
          case 'broadcast_transaction':
            return await this.handleBroadcastTransaction(args);
          case 'get_transaction_status':
            return await this.handleTransactionStatus(args);

          // Orderbook API implementations
          case 'create_limit_order':
            return await this.handleCreateLimitOrder(args);

          // Utility implementations
          case 'get_supported_chains':
            return await this.handleSupportedChains(args);
          case 'health_check':
            return await this.handleHealthCheck(args);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        logger.error(`Error handling tool ${name}:`, error);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ]
        };
      }
    });
  }

  private setupResourceHandlers() {
    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: '1inch://api/documentation',
            name: '1inch API Documentation',
            description: 'Complete documentation for all 1inch APIs',
            mimeType: 'text/markdown'
          },
          {
            uri: '1inch://chains/supported',
            name: 'Supported Chains',
            description: 'List of all supported blockchain networks',
            mimeType: 'application/json'
          },
          {
            uri: '1inch://tokens/popular',
            name: 'Popular Tokens',
            description: 'List of popular tokens across all chains',
            mimeType: 'application/json'
          }
        ]
      };
    });

    // Handle resource reads
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      switch (uri) {
        case '1inch://api/documentation':
          return {
            contents: [
              {
                uri,
                mimeType: 'text/markdown',
                text: await this.getApiDocumentation()
              }
            ]
          };
        case '1inch://chains/supported':
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(await this.oneInchService.getSupportedChains(), null, 2)
              }
            ]
          };
        case '1inch://tokens/popular':
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(await this.oneInchService.getPopularTokens(), null, 2)
              }
            ]
          };
        default:
          throw new Error(`Unknown resource: ${uri}`);
      }
    });
  }

  private setupPromptHandlers() {
    // List available prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: [
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
          },
          {
            name: 'portfolio_analysis',
            description: 'Analyze a DeFi portfolio and provide insights',
            arguments: [
              {
                name: 'wallet_address',
                description: 'Wallet address to analyze',
                required: true
              }
            ]
          }
        ]
      };
    });

    // Handle prompt requests
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

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
        case 'portfolio_analysis':
          return {
            description: 'Portfolio analysis assistant',
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: `Analyze the DeFi portfolio for wallet ${args?.wallet_address}. Show token holdings, total value, and provide insights about diversification and potential optimizations.`
                }
              }
            ]
          };
        default:
          throw new Error(`Unknown prompt: ${name}`);
      }
    });
  }

  // Tool implementation methods would go here...
  private async handleSwapQuote(args: any) {
    const result = await this.oneInchService.getSwapQuote(args);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }

  // Additional handler methods would be implemented here...
  // (For brevity, showing just one example)

  private async getApiDocumentation(): Promise<string> {
    return `
# 1inch MCP Server API Documentation

This server provides access to all 1inch APIs through the Model Context Protocol.

## Available APIs

### Swap API
- **get_swap_quote**: Get optimal swap rates across DEXs
- **get_swap_transaction**: Get transaction data for execution
- **get_token_allowance**: Check token spending approvals
- **get_approve_transaction**: Generate approval transactions

### Fusion API
- **create_fusion_order**: Create gasless swap orders
- **get_fusion_order_status**: Check order status

### Portfolio API
- **get_portfolio_overview**: Multi-chain portfolio overview
- **get_portfolio_tokens**: Detailed token holdings

### Balance API
- **get_token_balances**: Get wallet token balances

### Price API
- **get_token_price**: Current token prices
- **get_price_history**: Historical price data

### Token API
- **search_tokens**: Search tokens by name/symbol
- **get_token_info**: Detailed token information

### Additional APIs
- Gas Price API for network fees
- History API for transaction tracking
- Transaction Gateway for broadcasting
- Orderbook API for limit orders
- NFT API for NFT functionality
- Traces API for transaction analysis

## Usage with Cursor

This server is optimized for use with Cursor IDE. Add this documentation URL to Cursor's @Docs feature for intelligent code suggestions.
    `;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    logger.info('1inch MCP Server running on stdio');
  }
}

// Start the server
const server = new OneInchMCPServer();
server.run().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});