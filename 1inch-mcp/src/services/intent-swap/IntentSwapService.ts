import { BaseService, ServiceConfig, ToolDefinition, ResourceDefinition, PromptDefinition } from '../base/BaseService';
import {
  GetTokensRequest,
  GetTokensResponse,
  GetLiquiditySourcesRequest,
  GetLiquiditySourcesResponse,
  GetQuoteRequest,
  GetQuoteResponse,
  GetSwapRequest,
  GetSwapResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  GetOrderStatusRequest,
  GetOrderStatusResponse,
  CancelOrderRequest,
  CancelOrderResponse
} from './IntentSwapTypes';

export class IntentSwapService extends BaseService {
  constructor(serviceConfig: ServiceConfig) {
    super(serviceConfig);
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'get_active_orders',
        description: 'Get gasless swap active orders (Fusion API)',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID of the network' },
            page: { type: 'number', description: 'Page number for pagination' },
            limit: { type: 'number', description: 'Number of items per page' },
            version: { type: 'string', description: 'API version (2.0 or 2.1)' }
          },
          required: ['chain']
        }
      },
      {
        name: 'get_settlement_address',
        description: 'Get actual settlement contract address for Fusion orders',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID of the network' }
          },
          required: ['chain']
        }
      },
      {
        name: 'get_order_by_hash',
        description: 'Get order status by order hash',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID of the network' },
            orderHash: { type: 'string', description: 'Order hash to check status for' }
          },
          required: ['chain', 'orderHash']
        }
      },
      {
        name: 'get_orders_by_hashes',
        description: 'Get orders by multiple hashes',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID of the network' },
            orderHashes: { type: 'array', items: { type: 'string' }, description: 'Array of order hashes' }
          },
          required: ['chain', 'orderHashes']
        }
      },
      {
        name: 'get_orders_by_maker',
        description: 'Get orders by maker address',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID of the network' },
            address: { type: 'string', description: 'Maker address' },
            page: { type: 'number', description: 'Page number for pagination' },
            limit: { type: 'number', description: 'Number of items per page' },
            version: { type: 'string', description: 'API version (2.0 or 2.1)' }
          },
          required: ['chain', 'address']
        }
      },
      {
        name: 'get_quote',
        description: 'Get quote details for Fusion swap (intent-based)',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID of the network' },
            fromTokenAddress: { type: 'string', description: 'Address of the token to swap from' },
            toTokenAddress: { type: 'string', description: 'Address of the token to swap to' },
            amount: { type: 'string', description: 'Amount to swap (in token decimals)' },
            walletAddress: { type: 'string', description: 'Wallet address performing the swap' },
            enableEstimate: { type: 'boolean', description: 'Enable gas estimation' },
            fee: { type: 'number', description: 'Fee percentage' },
            surplus: { type: 'boolean', description: 'Include surplus in calculation' }
          },
          required: ['chain', 'fromTokenAddress', 'toTokenAddress', 'amount', 'walletAddress']
        }
      },
      {
        name: 'get_quote_with_custom_preset',
        description: 'Get quote with custom preset for Fusion swap',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID of the network' },
            fromTokenAddress: { type: 'string', description: 'Address of the token to swap from' },
            toTokenAddress: { type: 'string', description: 'Address of the token to swap to' },
            amount: { type: 'string', description: 'Amount to swap (in token decimals)' },
            walletAddress: { type: 'string', description: 'Wallet address performing the swap' },
            customPreset: { type: 'object', description: 'Custom preset configuration' }
          },
          required: ['chain', 'fromTokenAddress', 'toTokenAddress', 'amount', 'walletAddress', 'customPreset']
        }
      },
      {
        name: 'submit_order',
        description: 'Submit a limit order for Fusion (intent-based swap)',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID of the network' },
            order: { type: 'object', description: 'Signed order object' }
          },
          required: ['chain', 'order']
        }
      },
      {
        name: 'submit_multiple_orders',
        description: 'Submit multiple limit orders for Fusion',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID of the network' },
            orders: { type: 'array', items: { type: 'object' }, description: 'Array of signed order objects' }
          },
          required: ['chain', 'orders']
        }
      }
    ];
  }

  getResources(): ResourceDefinition[] {
    return [
      {
        uri: '1inch://fusion/documentation',
        name: 'Fusion API Documentation',
        description: 'Complete documentation for 1inch Fusion API (intent-based swaps)',
        mimeType: 'text/markdown'
      },
      {
        uri: '1inch://fusion/supported-chains',
        name: 'Supported Chains for Fusion',
        description: 'List of supported blockchain chains for Fusion intent-based swaps',
        mimeType: 'application/json'
      },
      {
        uri: '1inch://fusion/vs-classic',
        name: 'Fusion vs Classic Swap Comparison',
        description: 'Comparison between Fusion intent-based and classic swap modes',
        mimeType: 'text/markdown'
      }
    ];
  }

  getPrompts(): PromptDefinition[] {
    return [
      {
        name: 'analyze_fusion_opportunity',
        description: 'Analyze Fusion swap opportunity with intent-based routing',
        arguments: [
          { name: 'chain', description: 'Chain ID', required: true },
          { name: 'fromTokenAddress', description: 'Token to swap from', required: true },
          { name: 'toTokenAddress', description: 'Token to swap to', required: true },
          { name: 'amount', description: 'Amount to swap', required: true },
          { name: 'walletAddress', description: 'Wallet address', required: true }
        ]
      },
      {
        name: 'create_fusion_order',
        description: 'Create optimal Fusion intent-based swap order',
        arguments: [
          { name: 'chain', description: 'Chain ID', required: true },
          { name: 'fromTokenAddress', description: 'Token to swap from', required: true },
          { name: 'toTokenAddress', description: 'Token to swap to', required: true },
          { name: 'amount', description: 'Amount to swap', required: true },
          { name: 'walletAddress', description: 'Wallet address', required: true },
          { name: 'customPreset', description: 'Custom preset configuration', required: false }
        ]
      }
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    switch (name) {
      case 'get_active_orders':
        return await this.getActiveOrders(args);
      case 'get_settlement_address':
        return await this.getSettlementAddress(args);
      case 'get_order_by_hash':
        return await this.getOrderByHash(args);
      case 'get_orders_by_hashes':
        return await this.getOrdersByHashes(args);
      case 'get_orders_by_maker':
        return await this.getOrdersByMaker(args);
      case 'get_quote':
        return await this.getQuote(args);
      case 'get_quote_with_custom_preset':
        return await this.getQuoteWithCustomPreset(args);
      case 'submit_order':
        return await this.submitOrder(args);
      case 'submit_multiple_orders':
        return await this.submitMultipleOrders(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  async handleResourceRead(uri: string): Promise<any> {
    switch (uri) {
      case '1inch://fusion/documentation':
        return await this.getFusionDocumentation();
      case '1inch://fusion/supported-chains':
        return await this.getSupportedChains();
      case '1inch://fusion/vs-classic':
        return await this.getFusionVsClassicComparison();
      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
  }

  async handlePromptRequest(name: string, args: any): Promise<any> {
    switch (name) {
      case 'analyze_fusion_opportunity':
        return await this.analyzeFusionOpportunity(args);
      case 'create_fusion_order':
        return await this.createFusionOrder(args);
      default:
        throw new Error(`Unknown prompt: ${name}`);
    }
  }

  // Fusion Orders API methods
  async getActiveOrders(params: any): Promise<any> {
    const url = `${this.baseUrl}/fusion/orders/v2.0/${params.chain}/order/active`;
    const queryParams = new URLSearchParams();
    
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params.version !== undefined) queryParams.append('version', params.version);

    const response = await this.makeRequest<any>(`${url}?${queryParams.toString()}`);
    return response;
  }

  async getSettlementAddress(params: any): Promise<any> {
    const url = `${this.baseUrl}/fusion/orders/v2.0/${params.chain}/order/settlement`;
    const response = await this.makeRequest<any>(url);
    return response;
  }

  async getOrderByHash(params: any): Promise<any> {
    const url = `${this.baseUrl}/fusion/orders/v2.0/${params.chain}/order/status/${params.orderHash}`;
    const response = await this.makeRequest<any>(url);
    return response;
  }

  async getOrdersByHashes(params: any): Promise<any> {
    const url = `${this.baseUrl}/fusion/orders/v2.0/${params.chain}/order/status`;
    const body = {
      orderHashes: params.orderHashes
    };
    const response = await this.makePostRequest<any>(url, body);
    return response;
  }

  async getOrdersByMaker(params: any): Promise<any> {
    const url = `${this.baseUrl}/fusion/orders/v2.0/${params.chain}/order/maker/${params.address}`;
    const queryParams = new URLSearchParams();
    
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params.timestampFrom !== undefined) queryParams.append('timestampFrom', params.timestampFrom.toString());
    if (params.timestampTo !== undefined) queryParams.append('timestampTo', params.timestampTo.toString());
    if (params.makerToken !== undefined) queryParams.append('makerToken', params.makerToken);
    if (params.takerToken !== undefined) queryParams.append('takerToken', params.takerToken);
    if (params.withToken !== undefined) queryParams.append('withToken', params.withToken);
    if (params.version !== undefined) queryParams.append('version', params.version);

    const response = await this.makeRequest<any>(`${url}?${queryParams.toString()}`);
    return response;
  }

  // Fusion Quoter API methods
  async getQuote(params: any): Promise<any> {
    const url = `${this.baseUrl}/fusion/quoter/v2.0/${params.chain}/quote/receive`;
    const queryParams = new URLSearchParams({
      fromTokenAddress: params.fromTokenAddress,
      toTokenAddress: params.toTokenAddress,
      amount: params.amount,
      walletAddress: params.walletAddress
    });

    // Add optional parameters
    if (params.enableEstimate !== undefined) queryParams.append('enableEstimate', params.enableEstimate.toString());
    if (params.fee !== undefined) queryParams.append('fee', params.fee.toString());
    if (params.showDestAmountMinusFee !== undefined) queryParams.append('showDestAmountMinusFee', JSON.stringify(params.showDestAmountMinusFee));
    if (params.isPermit2 !== undefined) queryParams.append('isPermit2', params.isPermit2);
    if (params.surplus !== undefined) queryParams.append('surplus', params.surplus.toString());
    if (params.permit !== undefined) queryParams.append('permit', params.permit);
    if (params.slippage !== undefined) queryParams.append('slippage', JSON.stringify(params.slippage));
    if (params.source !== undefined) queryParams.append('source', JSON.stringify(params.source));

    const response = await this.makeRequest<any>(`${url}?${queryParams.toString()}`);
    return response;
  }

  async getQuoteWithCustomPreset(params: any): Promise<any> {
    const url = `${this.baseUrl}/fusion/quoter/v2.0/${params.chain}/quote/receive`;
    const queryParams = new URLSearchParams({
      fromTokenAddress: params.fromTokenAddress,
      toTokenAddress: params.toTokenAddress,
      amount: params.amount,
      walletAddress: params.walletAddress
    });

    // Add optional parameters
    if (params.enableEstimate !== undefined) queryParams.append('enableEstimate', params.enableEstimate.toString());
    if (params.fee !== undefined) queryParams.append('fee', params.fee.toString());
    if (params.showDestAmountMinusFee !== undefined) queryParams.append('showDestAmountMinusFee', JSON.stringify(params.showDestAmountMinusFee));
    if (params.isPermit2 !== undefined) queryParams.append('isPermit2', params.isPermit2);
    if (params.surplus !== undefined) queryParams.append('surplus', params.surplus.toString());
    if (params.permit !== undefined) queryParams.append('permit', params.permit);
    if (params.source !== undefined) queryParams.append('source', JSON.stringify(params.source));

    const response = await this.makePostRequest<any>(`${url}?${queryParams.toString()}`, params.customPreset);
    return response;
  }

  // Fusion Relayer API methods
  async submitOrder(params: any): Promise<any> {
    const url = `${this.baseUrl}/fusion/relayer/v2.0/${params.chain}/order/submit`;
    const response = await this.makePostRequest<any>(url, params.order);
    return response;
  }

  async submitMultipleOrders(params: any): Promise<any> {
    const url = `${this.baseUrl}/fusion/relayer/v2.0/${params.chain}/order/submit/many`;
    const response = await this.makePostRequest<any>(url, params.orders);
    return response;
  }

  // Legacy methods for backward compatibility (deprecated)
  async getTokens(params: GetTokensRequest): Promise<GetTokensResponse> {
    console.warn('getTokens is deprecated. Use Fusion API endpoints instead.');
    const url = `${this.baseUrl}/v6.0/${params.chain}/tokens`;
    const response = await this.makeRequest<GetTokensResponse>(url);
    return response;
  }

  async getLiquiditySources(params: GetLiquiditySourcesRequest): Promise<GetLiquiditySourcesResponse> {
    console.warn('getLiquiditySources is deprecated. Use Fusion API endpoints instead.');
    const url = `${this.baseUrl}/v6.0/${params.chain}/liquidity-sources`;
    const response = await this.makeRequest<GetLiquiditySourcesResponse>(url);
    return response;
  }

  async createOrder(params: CreateOrderRequest): Promise<CreateOrderResponse> {
    console.warn('createOrder is deprecated. Use submitOrder for Fusion API instead.');
    const url = `${this.baseUrl}/v6.0/${params.chain}/order`;
    const body: any = {
      fromTokenAddress: params.fromTokenAddress,
      toTokenAddress: params.toTokenAddress,
      amount: params.amount,
      fromAddress: params.fromAddress
    };

    Object.keys(params).forEach(key => {
      if (!['chain', 'fromTokenAddress', 'toTokenAddress', 'amount', 'fromAddress'].includes(key)) {
        body[key] = params[key];
      }
    });

    const response = await this.makePostRequest<CreateOrderResponse>(url, body);
    return response;
  }

  async getOrderStatus(params: GetOrderStatusRequest): Promise<GetOrderStatusResponse> {
    console.warn('getOrderStatus is deprecated. Use getOrderByHash for Fusion API instead.');
    const url = `${this.baseUrl}/v6.0/${params.chain}/order/${params.orderId}`;
    const response = await this.makeRequest<GetOrderStatusResponse>(url);
    return response;
  }

  async cancelOrder(params: CancelOrderRequest): Promise<CancelOrderResponse> {
    console.warn('cancelOrder is deprecated. Use Fusion API endpoints instead.');
    const url = `${this.baseUrl}/v6.0/${params.chain}/order/${params.orderId}/cancel`;
    const body: any = {
      fromAddress: params.fromAddress
    };

    Object.keys(params).forEach(key => {
      if (!['chain', 'orderId', 'fromAddress'].includes(key)) {
        body[key] = params[key];
      }
    });

    const response = await this.makePostRequest<CancelOrderResponse>(url, body);
    return response;
  }

  private async getFusionDocumentation(): Promise<string> {
    return `# 1inch Fusion API Documentation

## Overview
The Fusion API provides intent-based swap functionality using 1inch's Fusion mode, which offers better pricing and MEV protection compared to classic swaps.

## Key Features
- **Intent-based**: Orders are submitted as intents rather than immediate transactions
- **Better pricing**: Aggregators compete to fill your order
- **MEV protection**: Reduces front-running and sandwich attacks
- **Gasless**: No gas fees for failed transactions
- **Partial fills**: Orders can be filled partially over time

## API Endpoints

### Orders API (v2.0)
1. **GET /fusion/orders/v2.0/{chain}/order/active** - Get active orders
2. **GET /fusion/orders/v2.0/{chain}/order/settlement** - Get settlement address
3. **GET /fusion/orders/v2.0/{chain}/order/status/{orderHash}** - Get order by hash
4. **POST /fusion/orders/v2.0/{chain}/order/status** - Get orders by hashes
5. **GET /fusion/orders/v2.0/{chain}/order/maker/{address}** - Get orders by maker

### Quoter API (v2.0)
1. **GET /fusion/quoter/v2.0/{chain}/quote/receive** - Get quote
2. **POST /fusion/quoter/v2.0/{chain}/quote/receive** - Get quote with custom preset

### Relayer API (v2.0)
1. **POST /fusion/relayer/v2.0/{chain}/order/submit** - Submit single order
2. **POST /fusion/relayer/v2.0/{chain}/order/submit/many** - Submit multiple orders

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
      description: 'Supported blockchain chains for Fusion intent-based swaps'
    });
  }

  private async getFusionVsClassicComparison(): Promise<string> {
    return `# Fusion vs Classic Swap Comparison

## Classic Swap
- **Immediate execution**: Transaction is sent directly to blockchain
- **Gas fees**: User pays gas for every transaction attempt
- **MEV risk**: Vulnerable to front-running and sandwich attacks
- **Single route**: Uses one optimal route at execution time
- **No partial fills**: All-or-nothing execution

## Fusion Intent-based Swap
- **Intent submission**: Order is submitted as an intent
- **Gasless**: No gas fees for failed transactions
- **MEV protection**: Aggregators compete to fill orders
- **Multi-route**: Can be filled across multiple routes
- **Partial fills**: Orders can be filled partially over time
- **Better pricing**: Aggregators compete for best execution

## When to Use Each

### Use Classic Swap When:
- You need immediate execution
- You're comfortable with gas fees
- You're swapping small amounts
- You need guaranteed execution

### Use Fusion Intent-based Swap When:
- You want better pricing
- You're swapping large amounts
- You want MEV protection
- You're okay with potential delays
- You want gasless failed transactions`;
  }

  private async analyzeFusionOpportunity(args: any): Promise<string> {
    const { chain, fromTokenAddress, toTokenAddress, amount, walletAddress } = args;
    
    // Get quote for the Fusion swap
    const quote = await this.getQuote({ chain, fromTokenAddress, toTokenAddress, amount, walletAddress });
    
    let analysis = `Fusion Swap Opportunity Analysis for Chain ${chain}:

From: ${quote.fromTokenAmount} tokens
To: ${quote.toTokenAmount} tokens
Quote ID: ${quote.quoteId}

Presets Available:
- Fast: ${quote.presets.fast.auctionDuration}s duration
- Medium: ${quote.presets.medium.auctionDuration}s duration  
- Slow: ${quote.presets.slow.auctionDuration}s duration

Recommended Preset: ${quote.recommended_preset}
Settlement Address: ${quote.settlementAddress}

This Fusion swap can be executed via intent-based routing for better pricing and MEV protection.`;

    return analysis;
  }

  private async createFusionOrder(args: any): Promise<string> {
    const { chain, fromTokenAddress, toTokenAddress, amount, walletAddress, customPreset } = args;
    
    // Get quote first
    const quote = await this.getQuote({ chain, fromTokenAddress, toTokenAddress, amount, walletAddress });
    
    let result = `Fusion Order Created for Chain ${chain}:

From: ${quote.fromTokenAmount} tokens
To: ${quote.toTokenAmount} tokens
Quote ID: ${quote.quoteId}
Settlement Address: ${quote.settlementAddress}

Preset Used: ${customPreset ? 'Custom' : quote.recommended_preset}

This Fusion order is ready to be submitted to the relayer for intent-based execution.`;

    return result;
  }
}