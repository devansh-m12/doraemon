import { BaseService, ServiceConfig, ToolDefinition, ResourceDefinition, PromptDefinition } from '../base/BaseService';
import {
  GetActiveOrdersRequest,
  GetActiveOrdersOutput,
  GetEscrowFactoryRequest,
  EscrowFactory,
  GetQuoteRequest,
  GetQuoteOutput,
  BuildOrderRequest,
  BuildOrderOutput,
  SubmitOrderRequest,
  SubmitSecretRequest,
  GetOrderFillsByHashOutput,
  ResolverDataOutput,
  ReadyToAcceptSecretFillsForAllOrders,
  ReadyToExecutePublicActionsOutput
} from './FusionPlusSwapTypes';

export class FusionPlusSwapService extends BaseService {
  constructor(serviceConfig: ServiceConfig) {
    super(serviceConfig);
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'get_active_orders',
        description: 'Get cross chain swap active orders with optional filtering',
        inputSchema: {
          type: 'object',
          properties: {
            page: { type: 'number', description: 'Page number for pagination' },
            limit: { type: 'number', description: 'Number of items per page' },
            srcChain: { type: 'number', description: 'Source chain ID' },
            dstChain: { type: 'number', description: 'Destination chain ID' }
          },
          required: []
        }
      },
      {
        name: 'get_escrow_factory',
        description: 'Get actual escrow factory contract address for a chain',
        inputSchema: {
          type: 'object',
          properties: {
            chainId: { type: 'number', description: 'Chain ID' }
          },
          required: ['chainId']
        }
      },
      {
        name: 'get_quote',
        description: 'Get quote details for cross-chain swap',
        inputSchema: {
          type: 'object',
          properties: {
            srcChain: { type: 'number', description: 'Source chain ID' },
            dstChain: { type: 'number', description: 'Destination chain ID' },
            srcTokenAddress: { type: 'string', description: 'Source token address' },
            dstTokenAddress: { type: 'string', description: 'Destination token address' },
            amount: { type: 'number', description: 'Amount to swap' },
            walletAddress: { type: 'string', description: 'Wallet address' },
            enableEstimate: { type: 'boolean', description: 'Enable estimate' },
            fee: { type: 'number', description: 'Fee amount' },
            isPermit2: { type: 'string', description: 'Permit2 flag' },
            permit: { type: 'string', description: 'Permit data' }
          },
          required: ['srcChain', 'dstChain', 'srcTokenAddress', 'dstTokenAddress', 'amount', 'walletAddress', 'enableEstimate']
        }
      },
      {
        name: 'build_order',
        description: 'Build order from quote and secrets hash list',
        inputSchema: {
          type: 'object',
          properties: {
            quote: { type: 'object', description: 'Quote object from get_quote' },
            secretsHashList: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'List of secret hashes'
            }
          },
          required: ['quote', 'secretsHashList']
        }
      },
      {
        name: 'submit_order',
        description: 'Submit signed order to the relayer',
        inputSchema: {
          type: 'object',
          properties: {
            order: { type: 'object', description: 'Order input object' },
            srcChainId: { type: 'number', description: 'Source chain ID' },
            signature: { type: 'string', description: 'Order signature' },
            extension: { type: 'string', description: 'Order extension' },
            quoteId: { type: 'string', description: 'Quote ID' },
            secretHashes: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'List of secret hashes'
            }
          },
          required: ['order', 'srcChainId', 'signature', 'extension', 'quoteId', 'secretHashes']
        }
      },
      {
        name: 'submit_secret',
        description: 'Submit secret for order execution',
        inputSchema: {
          type: 'object',
          properties: {
            secret: { type: 'string', description: 'Secret value' },
            orderHash: { type: 'string', description: 'Order hash' }
          },
          required: ['secret', 'orderHash']
        }
      },
      {
        name: 'get_order_fills_by_hash',
        description: 'Get order fills by order hash',
        inputSchema: {
          type: 'object',
          properties: {
            orderHash: { type: 'string', description: 'Order hash' }
          },
          required: ['orderHash']
        }
      },
      {
        name: 'get_resolver_data',
        description: 'Get resolver data for order',
        inputSchema: {
          type: 'object',
          properties: {
            orderHash: { type: 'string', description: 'Order hash' }
          },
          required: ['orderHash']
        }
      },
      {
        name: 'get_ready_to_accept_secret_fills',
        description: 'Get ready to accept secret fills for all orders',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'get_ready_to_execute_public_actions',
        description: 'Get ready to execute public actions',
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
        uri: '1inch://fusion-plus/documentation',
        name: 'Fusion+ API Documentation',
        description: 'Complete documentation for 1inch Fusion+ API',
        mimeType: 'text/markdown'
      },
      {
        uri: '1inch://fusion-plus/supported-chains',
        name: 'Supported Chains',
        description: 'List of supported blockchain chains for Fusion+ operations',
        mimeType: 'application/json'
      },
      {
        uri: '1inch://fusion-plus/order-types',
        name: 'Order Types',
        description: 'Documentation of different order types and their characteristics',
        mimeType: 'text/markdown'
      }
    ];
  }

  getPrompts(): PromptDefinition[] {
    return [
      {
        name: 'analyze_cross_chain_swap',
        description: 'Analyze cross-chain swap opportunities and get quotes',
        arguments: [
          { name: 'srcChain', description: 'Source chain ID', required: true },
          { name: 'dstChain', description: 'Destination chain ID', required: true },
          { name: 'srcTokenAddress', description: 'Source token address', required: true },
          { name: 'dstTokenAddress', description: 'Destination token address', required: true },
          { name: 'amount', description: 'Amount to swap', required: true },
          { name: 'walletAddress', description: 'Wallet address', required: true }
        ]
      },
      {
        name: 'monitor_active_orders',
        description: 'Monitor active orders across chains',
        arguments: [
          { name: 'srcChain', description: 'Source chain ID (optional)', required: false },
          { name: 'dstChain', description: 'Destination chain ID (optional)', required: false }
        ]
      }
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    switch (name) {
      case 'get_active_orders':
        return await this.getActiveOrders(args);
      case 'get_escrow_factory':
        return await this.getEscrowFactory(args);
      case 'get_quote':
        return await this.getQuote(args);
      case 'build_order':
        return await this.buildOrder(args);
      case 'submit_order':
        return await this.submitOrder(args);
      case 'submit_secret':
        return await this.submitSecret(args);
      case 'get_order_fills_by_hash':
        return await this.getOrderFillsByHash(args);
      case 'get_resolver_data':
        return await this.getResolverData(args);
      case 'get_ready_to_accept_secret_fills':
        return await this.getReadyToAcceptSecretFills(args);
      case 'get_ready_to_execute_public_actions':
        return await this.getReadyToExecutePublicActions(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  async handleResourceRead(uri: string): Promise<any> {
    switch (uri) {
      case '1inch://fusion-plus/documentation':
        return await this.getFusionPlusDocumentation();
      case '1inch://fusion-plus/supported-chains':
        return await this.getSupportedChains();
      case '1inch://fusion-plus/order-types':
        return await this.getOrderTypesDocumentation();
      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
  }

  async handlePromptRequest(name: string, args: any): Promise<any> {
    switch (name) {
      case 'analyze_cross_chain_swap':
        return await this.analyzeCrossChainSwap(args);
      case 'monitor_active_orders':
        return await this.monitorActiveOrders(args);
      default:
        throw new Error(`Unknown prompt: ${name}`);
    }
  }

  async getActiveOrders(params: GetActiveOrdersRequest): Promise<GetActiveOrdersOutput> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.srcChain) queryParams.append('srcChain', params.srcChain.toString());
    if (params.dstChain) queryParams.append('dstChain', params.dstChain.toString());

    const url = `/fusion-plus/orders/v1.0/order/active${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await this.makeRequest<GetActiveOrdersOutput>(url);
    return response;
  }

  async getEscrowFactory(params: GetEscrowFactoryRequest): Promise<EscrowFactory> {
    const url = `/fusion-plus/orders/v1.0/order/escrow?chainId=${params.chainId}`;
    const response = await this.makeRequest<EscrowFactory>(url);
    return response;
  }

  async getQuote(params: GetQuoteRequest): Promise<GetQuoteOutput> {
    const queryParams = new URLSearchParams();
    
    queryParams.append('srcChain', params.srcChain.toString());
    queryParams.append('dstChain', params.dstChain.toString());
    queryParams.append('srcTokenAddress', params.srcTokenAddress);
    queryParams.append('dstTokenAddress', params.dstTokenAddress);
    queryParams.append('amount', params.amount.toString());
    queryParams.append('walletAddress', params.walletAddress);
    queryParams.append('enableEstimate', params.enableEstimate.toString());
    if (params.fee !== undefined) queryParams.append('fee', params.fee.toString());
    if (params.isPermit2) queryParams.append('isPermit2', params.isPermit2);
    if (params.permit) queryParams.append('permit', params.permit);

    const url = `/fusion-plus/quoter/v1.0/quote/receive?${queryParams.toString()}`;
    const response = await this.makeRequest<GetQuoteOutput>(url);
    return response;
  }

  async buildOrder(params: BuildOrderRequest): Promise<BuildOrderOutput> {
    const url = `/fusion-plus/orders/v1.0/order/build`;
    const response = await this.makePostRequest<BuildOrderOutput>(url, params);
    return response;
  }

  async submitOrder(params: SubmitOrderRequest): Promise<any> {
    const url = `/fusion-plus/relayer/v1.0/order/submit`;
    const response = await this.makePostRequest<any>(url, params);
    return response;
  }

  async submitSecret(params: SubmitSecretRequest): Promise<any> {
    const url = `/fusion-plus/relayer/v1.0/secret/submit`;
    const response = await this.makePostRequest<any>(url, params);
    return response;
  }

  async getOrderFillsByHash(params: { orderHash: string }): Promise<GetOrderFillsByHashOutput> {
    const url = `/fusion-plus/orders/v1.0/order/fills/${params.orderHash}`;
    const response = await this.makeRequest<GetOrderFillsByHashOutput>(url);
    return response;
  }

  async getResolverData(params: { orderHash: string }): Promise<ResolverDataOutput> {
    const url = `/fusion-plus/orders/v1.0/order/resolver/${params.orderHash}`;
    const response = await this.makeRequest<ResolverDataOutput>(url);
    return response;
  }

  async getReadyToAcceptSecretFills(params: {}): Promise<ReadyToAcceptSecretFillsForAllOrders> {
    const url = `/fusion-plus/orders/v1.0/order/ready-to-accept-secret-fills`;
    const response = await this.makeRequest<ReadyToAcceptSecretFillsForAllOrders>(url);
    return response;
  }

  async getReadyToExecutePublicActions(params: {}): Promise<ReadyToExecutePublicActionsOutput> {
    const url = `/fusion-plus/orders/v1.0/order/ready-to-execute-public-actions`;
    const response = await this.makeRequest<ReadyToExecutePublicActionsOutput>(url);
    return response;
  }

  private async getFusionPlusDocumentation(): Promise<string> {
    return `# 1inch Fusion+ API Documentation

## Overview
Fusion+ is 1inch's cross-chain swap protocol that enables users to swap tokens across different blockchain networks with advanced order types and auction mechanisms.

## Key Features

### Cross-Chain Swaps
- Swap tokens between different blockchain networks
- Support for multiple chains including Ethereum, BSC, Polygon, Arbitrum, etc.
- Atomic cross-chain transactions

### Order Types
1. **Limit Orders**: Traditional limit orders with price and time constraints
2. **Auction Orders**: Orders that use auction mechanisms for better pricing
3. **Cross-Chain Orders**: Orders that span multiple blockchain networks

### Auction Mechanism
- Dynamic pricing based on time and demand
- Multiple presets: Fast, Medium, Slow
- Gas cost optimization
- Partial fills support

## Endpoints

### Orders
- **GET /fusion-plus/orders/v1.0/order/active**: Get active orders
- **GET /fusion-plus/orders/v1.0/order/escrow**: Get escrow factory address
- **POST /fusion-plus/orders/v1.0/order/build**: Build order from quote
- **GET /fusion-plus/orders/v1.0/order/fills/{orderHash}**: Get order fills
- **GET /fusion-plus/orders/v1.0/order/resolver/{orderHash}**: Get resolver data

### Quoter
- **GET /fusion-plus/quoter/v1.0/quote/receive**: Get quote for cross-chain swap

### Relayer
- **POST /fusion-plus/relayer/v1.0/order/submit**: Submit signed order
- **POST /fusion-plus/relayer/v1.0/secret/submit**: Submit secret for execution

## Order Lifecycle
1. **Quote Request**: Get pricing and presets
2. **Order Building**: Create order with signature
3. **Order Submission**: Submit to relayer
4. **Execution**: Order gets filled by takers
5. **Settlement**: Cross-chain settlement via escrows

## Security Features
- Escrow-based cross-chain settlement
- Time-locks for safety
- Secret-based execution
- Multi-signature support

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
      description: 'Supported blockchain chains for Fusion+ cross-chain operations'
    });
  }

  private async getOrderTypesDocumentation(): Promise<string> {
    return `# Fusion+ Order Types

## Overview
Fusion+ supports multiple order types to accommodate different trading strategies and requirements.

## Order Types

### 1. Limit Orders
Traditional limit orders with price and time constraints.

**Characteristics:**
- Fixed price execution
- Time-based expiration
- Immediate or future execution
- Partial fills support

### 2. Auction Orders
Orders that use auction mechanisms for dynamic pricing.

**Characteristics:**
- Dynamic pricing based on time and demand
- Multiple presets (Fast, Medium, Slow)
- Gas cost optimization
- Better execution prices through competition

### 3. Cross-Chain Orders
Orders that span multiple blockchain networks.

**Characteristics:**
- Atomic cross-chain execution
- Escrow-based settlement
- Time-locks for safety
- Secret-based execution mechanism

## Presets

### Fast Preset
- Short auction duration
- Higher gas costs
- Quick execution
- Best for urgent trades

### Medium Preset
- Balanced auction duration
- Moderate gas costs
- Good price/execution balance
- Recommended for most trades

### Slow Preset
- Longer auction duration
- Lower gas costs
- Best price discovery
- Best for non-urgent trades

## Order States

### Pending
Order is active and waiting for execution

### Executed
Order has been successfully filled

### Expired
Order has passed its deadline without execution

### Cancelled
Order has been cancelled by the maker

### Refunding
Order is in the process of being refunded

### Refunded
Order has been refunded to the maker

## Validation States

### Valid
Order is valid and ready for execution

### Order-predicate-returned-false
Order predicate validation failed

### Not-enough-balance
Insufficient balance for order execution

### Not-enough-allowance
Insufficient allowance for order execution

### Invalid-signature
Order signature is invalid

### Unknown-failure
Unknown validation failure`;
  }

  private async analyzeCrossChainSwap(args: any): Promise<string> {
    const { srcChain, dstChain, srcTokenAddress, dstTokenAddress, amount, walletAddress } = args;
    
    // Get quote for the swap
    const quote = await this.getQuote({
      srcChain,
      dstChain,
      srcTokenAddress,
      dstTokenAddress,
      amount,
      walletAddress,
      enableEstimate: true
    });
    
    let analysis = `Cross-Chain Swap Analysis:

Source Chain: ${srcChain}
Destination Chain: ${dstChain}
Source Token: ${srcTokenAddress}
Destination Token: ${dstTokenAddress}
Amount: ${amount}
Wallet: ${walletAddress}

Quote Details:
- Quote ID: ${quote.quoteId}
- Source Token Amount: ${quote.srcTokenAmount}
- Destination Token Amount: ${quote.dstTokenAmount}
- Recommended Preset: ${quote.recommendedPreset}

Available Presets:`;

    Object.entries(quote.presets).forEach(([presetName, preset]) => {
      analysis += `\n\n${presetName.toUpperCase()} Preset:
- Auction Duration: ${preset.auctionDuration} seconds
- Start Amount: ${preset.startAmount}
- End Amount: ${preset.auctionEndAmount}
- Gas Cost: ${preset.gasCost.gasPriceEstimate}
- Secrets Count: ${preset.secretsCount}
- Allow Partial Fills: ${preset.allowPartialFills}
- Allow Multiple Fills: ${preset.allowMultipleFills}`;
    });

    analysis += `\n\nEscrow Factories:
- Source: ${quote.srcEscrowFactory}
- Destination: ${quote.dstEscrowFactory}

Safety Deposits:
- Source: ${quote.srcSafetyDeposit}
- Destination: ${quote.dstSafetyDeposit}

Time Locks:
- Source Withdrawal: ${quote.timeLocks.srcWithdrawal}
- Source Cancellation: ${quote.timeLocks.srcCancellation}
- Destination Withdrawal: ${quote.timeLocks.dstWithdrawal}
- Destination Cancellation: ${quote.timeLocks.dstCancellation}`;

    return analysis;
  }

  private async monitorActiveOrders(args: any): Promise<string> {
    const { srcChain, dstChain } = args;
    
    // Get active orders
    const activeOrders = await this.getActiveOrders({
      srcChain,
      dstChain,
      limit: 10
    });
    
    let analysis = `Active Orders Monitor:

Total Orders: ${activeOrders.meta.totalItems}
Page: ${activeOrders.meta.currentPage} of ${activeOrders.meta.totalPages}
Items per page: ${activeOrders.meta.itemsPerPage}

Recent Orders:`;

    activeOrders.items.forEach((order, index) => {
      analysis += `\n\nOrder ${index + 1}:
- Order Hash: ${order.orderHash}
- Source Chain: ${order.srcChainId}
- Destination Chain: ${order.dstChainId}
- Status: ${order.remainingMakerAmount !== '0' ? 'Active' : 'Filled'}
- Remaining Amount: ${order.remainingMakerAmount}
- Maker Balance: ${order.makerBalance}
- Maker Allowance: ${order.makerAllowance}
- Auction Start: ${new Date(order.auctionStartDate * 1000).toISOString()}
- Auction End: ${new Date(order.auctionEndDate * 1000).toISOString()}
- Deadline: ${new Date(order.deadline * 1000).toISOString()}`;
    });

    return analysis;
  }
} 