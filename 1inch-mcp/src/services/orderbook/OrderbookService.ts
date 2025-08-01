import { BaseService, ServiceConfig, ToolDefinition, ResourceDefinition, PromptDefinition } from '../base/BaseService';
import {
  AddLimitOrderRequest,
  AddLimitOrderResponse,
  GetOrdersByAddressRequest,
  GetOrdersByAddressResponse,
  GetOrderByHashRequest,
  GetOrderByHashResponse,
  GetAllOrdersRequest,
  GetAllOrdersResponse,
  GetOrdersCountRequest,
  GetOrdersCountResponse,
  GetOrderEventsRequest,
  GetOrderEventsResponse,
  GetAllEventsRequest,
  GetAllEventsResponse,
  GetActiveOrdersForPermitRequest,
  GetActiveOrdersForPermitResponse,
  GetActivePairsRequest,
  GetActivePairsResponse,
  GetMakingAmountRequest,
  GetMakingAmountResponse
} from './OrderbookTypes';

export class OrderbookService extends BaseService {
  constructor(serviceConfig: ServiceConfig) {
    super(serviceConfig);
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'add_limit_order',
        description: 'Include a limit order to the 1inch limit orders database',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID of the network' },
            orderHash: { type: 'string', description: 'Order hash' },
            signature: { type: 'string', description: 'Order signature' },
            data: {
              type: 'object',
              properties: {
                makerAsset: { type: 'string', description: 'Maker asset address' },
                takerAsset: { type: 'string', description: 'Taker asset address' },
                maker: { type: 'string', description: 'Maker address' },
                receiver: { type: 'string', description: 'Receiver address' },
                makingAmount: { type: 'string', description: 'Making amount' },
                takingAmount: { type: 'string', description: 'Taking amount' },
                salt: { type: 'string', description: 'Order salt' },
                extension: { type: 'string', description: 'Order extension' },
                makerTraits: { type: 'string', description: 'Maker traits' }
              },
              required: ['makerAsset', 'takerAsset', 'maker', 'receiver', 'makingAmount', 'takingAmount', 'salt', 'extension', 'makerTraits']
            }
          },
          required: ['chain', 'orderHash', 'signature', 'data']
        }
      },
      {
        name: 'get_orders_by_address',
        description: 'Get limit orders belonging to the specified address',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID of the network' },
            address: { type: 'string', description: 'Wallet address' }
          },
          required: ['chain', 'address']
        }
      },
      {
        name: 'get_order_by_hash',
        description: 'Get the order details by the specified order hash',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID of the network' },
            orderHash: { type: 'string', description: 'Order hash' }
          },
          required: ['chain', 'orderHash']
        }
      },
      {
        name: 'get_all_orders',
        description: 'Get all limit orders on the 1inch orderbook for a chain',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID of the network' },
            limit: { type: 'number', description: 'Number of orders to return', default: 100 },
            offset: { type: 'number', description: 'Number of orders to skip', default: 0 },
            makerAsset: { type: 'string', description: 'Filter by maker asset address' },
            takerAsset: { type: 'string', description: 'Filter by taker asset address' },
            maker: { type: 'string', description: 'Filter by maker address' }
          },
          required: ['chain']
        }
      },
      {
        name: 'get_orders_count',
        description: 'Get the total count of orders by specified filters',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID of the network' },
            makerAsset: { type: 'string', description: 'Filter by maker asset address' },
            takerAsset: { type: 'string', description: 'Filter by taker asset address' },
            maker: { type: 'string', description: 'Filter by maker address' },
            status: { type: 'string', description: 'Filter by order status' }
          },
          required: ['chain']
        }
      },
      {
        name: 'get_order_events',
        description: 'Get fill/cancel events related to a specific order',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID of the network' },
            orderHash: { type: 'string', description: 'Order hash' }
          },
          required: ['chain', 'orderHash']
        }
      },
      {
        name: 'get_all_events',
        description: 'Get all order fill/cancel events',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID of the network' },
            limit: { type: 'number', description: 'Number of events to return', default: 100 },
            offset: { type: 'number', description: 'Number of events to skip', default: 0 },
            orderHash: { type: 'string', description: 'Filter by order hash' },
            eventType: { type: 'string', enum: ['fill', 'cancel'], description: 'Filter by event type' },
            fromTimestamp: { type: 'string', description: 'Filter events from timestamp' },
            toTimestamp: { type: 'string', description: 'Filter events to timestamp' }
          },
          required: ['chain']
        }
      },
      {
        name: 'get_active_orders_for_permit',
        description: 'Get all active orders that have permit for the specified wallet address and token',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID of the network' },
            walletAddress: { type: 'string', description: 'Wallet address' },
            token: { type: 'string', description: 'Token address' }
          },
          required: ['chain', 'walletAddress', 'token']
        }
      },
      {
        name: 'get_active_pairs',
        description: 'Get all unique active token pairs on the orderbook',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID of the network' }
          },
          required: ['chain']
        }
      },
      {
        name: 'get_making_amount',
        description: 'Get the calculated making amount on a trading pair by the provided taking amount',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID of the network' },
            makerAsset: { type: 'string', description: 'Maker asset address' },
            takerAsset: { type: 'string', description: 'Taker asset address' },
            takingAmount: { type: 'string', description: 'Taking amount' },
            maker: { type: 'string', description: 'Maker address (optional)' }
          },
          required: ['chain', 'makerAsset', 'takerAsset', 'takingAmount']
        }
      }
    ];
  }

  getResources(): ResourceDefinition[] {
    return [
      {
        uri: '1inch://orderbook/documentation',
        name: 'Orderbook API Documentation',
        description: 'Complete documentation for 1inch Orderbook API',
        mimeType: 'text/markdown'
      },
      {
        uri: '1inch://orderbook/supported-chains',
        name: 'Supported Chains',
        description: 'List of supported blockchain chains for orderbook operations',
        mimeType: 'application/json'
      },
      {
        uri: '1inch://orderbook/order-format',
        name: 'Order Format Specification',
        description: 'Detailed specification for limit order format and structure',
        mimeType: 'text/markdown'
      }
    ];
  }

  getPrompts(): PromptDefinition[] {
    return [
      {
        name: 'analyze_orderbook_activity',
        description: 'Analyze orderbook activity and market trends',
        arguments: [
          { name: 'chain', description: 'Chain ID', required: true },
          { name: 'makerAsset', description: 'Maker asset address for analysis', required: false },
          { name: 'takerAsset', description: 'Taker asset address for analysis', required: false },
          { name: 'timeframe', description: 'Timeframe for analysis (24h, 7d, 30d)', required: false }
        ]
      },
      {
        name: 'monitor_user_orders',
        description: 'Monitor and analyze user orders and their status',
        arguments: [
          { name: 'chain', description: 'Chain ID', required: true },
          { name: 'address', description: 'User wallet address', required: true }
        ]
      }
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    switch (name) {
      case 'add_limit_order':
        return await this.addLimitOrder(args);
      case 'get_orders_by_address':
        return await this.getOrdersByAddress(args);
      case 'get_order_by_hash':
        return await this.getOrderByHash(args);
      case 'get_all_orders':
        return await this.getAllOrders(args);
      case 'get_orders_count':
        return await this.getOrdersCount(args);
      case 'get_order_events':
        return await this.getOrderEvents(args);
      case 'get_all_events':
        return await this.getAllEvents(args);
      case 'get_active_orders_for_permit':
        return await this.getActiveOrdersForPermit(args);
      case 'get_active_pairs':
        return await this.getActivePairs(args);
      case 'get_making_amount':
        return await this.getMakingAmount(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  async handleResourceRead(uri: string): Promise<any> {
    switch (uri) {
      case '1inch://orderbook/documentation':
        return await this.getOrderbookDocumentation();
      case '1inch://orderbook/supported-chains':
        return await this.getSupportedChains();
      case '1inch://orderbook/order-format':
        return await this.getOrderFormatSpecification();
      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
  }

  async handlePromptRequest(name: string, args: any): Promise<any> {
    switch (name) {
      case 'analyze_orderbook_activity':
        return await this.analyzeOrderbookActivity(args);
      case 'monitor_user_orders':
        return await this.monitorUserOrders(args);
      default:
        throw new Error(`Unknown prompt: ${name}`);
    }
  }

  async addLimitOrder(params: AddLimitOrderRequest): Promise<AddLimitOrderResponse> {
    const url = `${this.baseUrl}/orderbook/v4.0/${params.chain}`;
    const body = {
      orderHash: params.orderHash,
      signature: params.signature,
      data: params.data
    };

    const response = await this.makePostRequest<AddLimitOrderResponse>(url, body);
    return response;
  }

  async getOrdersByAddress(params: GetOrdersByAddressRequest): Promise<GetOrdersByAddressResponse[]> {
    const url = `${this.baseUrl}/orderbook/v4.0/${params.chain}/address/${params.address}`;
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.statuses) queryParams.append('statuses', params.statuses);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.takerAsset) queryParams.append('takerAsset', params.takerAsset);
    if (params.makerAsset) queryParams.append('makerAsset', params.makerAsset);

    const response = await this.makeRequest<GetOrdersByAddressResponse[]>(`${url}?${queryParams.toString()}`);
    return response;
  }

  async getOrderByHash(params: GetOrderByHashRequest): Promise<GetOrderByHashResponse> {
    const url = `${this.baseUrl}/orderbook/v4.0/${params.chain}/order/${params.orderHash}`;
    const response = await this.makeRequest<GetOrderByHashResponse>(url);
    return response;
  }

  async getAllOrders(params: GetAllOrdersRequest): Promise<GetAllOrdersResponse[]> {
    const url = `${this.baseUrl}/orderbook/v4.0/${params.chain}/all`;
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.statuses) queryParams.append('statuses', params.statuses);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.takerAsset) queryParams.append('takerAsset', params.takerAsset);
    if (params.makerAsset) queryParams.append('makerAsset', params.makerAsset);

    const response = await this.makeRequest<GetAllOrdersResponse[]>(`${url}?${queryParams.toString()}`);
    return response;
  }

  async getOrdersCount(params: GetOrdersCountRequest): Promise<GetOrdersCountResponse> {
    const url = `${this.baseUrl}/orderbook/v4.0/${params.chain}/count`;
    const queryParams = new URLSearchParams();
    
    if (params.makerAsset) queryParams.append('makerAsset', params.makerAsset);
    if (params.takerAsset) queryParams.append('takerAsset', params.takerAsset);
    if (params.status) queryParams.append('statuses', params.status);

    const response = await this.makeRequest<GetOrdersCountResponse>(`${url}?${queryParams.toString()}`);
    return response;
  }

  async getOrderEvents(params: GetOrderEventsRequest): Promise<GetOrderEventsResponse> {
    const url = `${this.baseUrl}/orderbook/v4.0/${params.chain}/events/${params.orderHash}`;
    const response = await this.makeRequest<GetOrderEventsResponse>(url);
    return response;
  }

  async getAllEvents(params: GetAllEventsRequest): Promise<GetAllEventsResponse> {
    const url = `${this.baseUrl}/orderbook/v4.0/${params.chain}/events`;
    const queryParams = new URLSearchParams();
    
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());
    if (params.orderHash) queryParams.append('orderHash', params.orderHash);
    if (params.eventType) queryParams.append('eventType', params.eventType);
    if (params.fromTimestamp) queryParams.append('fromTimestamp', params.fromTimestamp);
    if (params.toTimestamp) queryParams.append('toTimestamp', params.toTimestamp);

    const response = await this.makeRequest<GetAllEventsResponse>(`${url}?${queryParams.toString()}`);
    return response;
  }

  async getActiveOrdersForPermit(params: GetActiveOrdersForPermitRequest): Promise<GetActiveOrdersForPermitResponse> {
    const url = `${this.baseUrl}/orderbook/v4.0/${params.chain}/has-active-orders-with-permit/${params.walletAddress}/${params.token}`;
    const response = await this.makeRequest<GetActiveOrdersForPermitResponse>(url);
    return response;
  }

  async getActivePairs(params: GetActivePairsRequest): Promise<GetActivePairsResponse> {
    const url = `${this.baseUrl}/orderbook/v4.0/${params.chain}/unique-active-pairs`;
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await this.makeRequest<GetActivePairsResponse>(`${url}?${queryParams.toString()}`);
    return response;
  }

  async getMakingAmount(params: GetMakingAmountRequest): Promise<GetMakingAmountResponse> {
    const url = `${this.baseUrl}/orderbook/v4.0/${params.chain}/fee-info`;
    const queryParams = new URLSearchParams();
    
    queryParams.append('makerAsset', params.makerAsset);
    queryParams.append('takerAsset', params.takerAsset);
    if (params.takingAmount) queryParams.append('takerAmount', params.takingAmount);
    if (params.maker) queryParams.append('makerAmount', params.maker);

    const response = await this.makeRequest<GetMakingAmountResponse>(`${url}?${queryParams.toString()}`);
    return response;
  }

  private async getOrderbookDocumentation(): Promise<string> {
    return `# 1inch Orderbook API Documentation

## Overview
The Orderbook API provides comprehensive access to 1inch's limit order functionality, allowing users to create, manage, and query limit orders across multiple blockchain networks.

## Endpoints

### 1. POST /orderbook/v4.0/{chain}
Include a limit order to the 1inch limit orders database.

**Parameters:**
- chain (path): Chain ID
- orderHash (body): Order hash
- signature (body): Order signature
- data (body): Order data object containing:
  - makerAsset: Maker asset address
  - takerAsset: Taker asset address
  - maker: Maker address
  - receiver: Receiver address
  - makingAmount: Making amount
  - takingAmount: Taking amount
  - salt: Order salt
  - extension: Order extension
  - makerTraits: Maker traits

**Response:** { "success": true }

### 2. GET /orderbook/v4.0/{chain}/address/{address}
Get limit orders belonging to the specified address.

**Parameters:**
- chain (path): Chain ID
- address (path): Wallet address

**Response:** Array of user's limit orders

### 3. GET /orderbook/v4.0/{chain}/order/{orderHash}
Get the order details by the specified order hash.

**Parameters:**
- chain (path): Chain ID
- orderHash (path): Order hash

**Response:** Order object with details

### 4. GET /orderbook/v4.0/{chain}/all
Get all limit orders on the 1inch orderbook for a chain.

**Parameters:**
- chain (path): Chain ID
- limit (query, optional): Number of orders to return
- offset (query, optional): Number of orders to skip
- makerAsset (query, optional): Filter by maker asset
- takerAsset (query, optional): Filter by taker asset
- maker (query, optional): Filter by maker address

**Response:** Array of orders with pagination info

### 5. GET /orderbook/v4.0/{chain}/count
Get the total count of orders by specified filters.

**Parameters:**
- chain (path): Chain ID
- makerAsset (query, optional): Filter by maker asset
- takerAsset (query, optional): Filter by taker asset
- maker (query, optional): Filter by maker address
- status (query, optional): Filter by order status

**Response:** { "count": number }

### 6. GET /orderbook/v4.0/{chain}/events/{orderHash}
Get fill/cancel events related to a specific order.

**Parameters:**
- chain (path): Chain ID
- orderHash (path): Order hash

**Response:** Array of events for the order

### 7. GET /orderbook/v4.0/{chain}/events
Get all order fill/cancel events.

**Parameters:**
- chain (path): Chain ID
- limit (query, optional): Number of events to return
- offset (query, optional): Number of events to skip
- orderHash (query, optional): Filter by order hash
- eventType (query, optional): Filter by event type (fill/cancel)
- fromTimestamp (query, optional): Filter events from timestamp
- toTimestamp (query, optional): Filter events to timestamp

**Response:** Array of events with pagination info

### 8. GET /orderbook/v4.0/{chain}/permit/{walletAddress}/{token}
Get all active orders that have permit for the specified wallet address and token.

**Parameters:**
- chain (path): Chain ID
- walletAddress (path): Wallet address
- token (path): Token address

**Response:** Array of active orders for the permit

### 9. GET /orderbook/v4.0/{chain}/pairs
Get all unique active token pairs on the orderbook.

**Parameters:**
- chain (path): Chain ID

**Response:** Array of token pairs with trading activity

### 10. GET /orderbook/v4.0/{chain}/making-amount
Get the calculated making amount on a trading pair by the provided taking amount.

**Parameters:**
- chain (path): Chain ID
- makerAsset (query): Maker asset address
- takerAsset (query): Taker asset address
- takingAmount (query): Taking amount
- maker (query, optional): Maker address

**Response:** { "makingAmount": string, "rate": string, "priceImpact": string }

## Authentication
All endpoints require API Key authentication via header.

## Rate Limits
Please refer to the official documentation for current rate limits and usage guidelines.`;
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
      description: 'Supported blockchain chains for orderbook operations'
    });
  }

  private async getOrderFormatSpecification(): Promise<string> {
    return `# 1inch Limit Order Format Specification

## Order Structure

### Order Data Object
\`\`\`json
{
  "makerAsset": "string",      // Address of the token being offered
  "takerAsset": "string",      // Address of the token being requested
  "maker": "string",           // Address of the order maker
  "receiver": "string",        // Address that will receive the tokens
  "makingAmount": "string",    // Amount of maker asset (in wei)
  "takingAmount": "string",    // Amount of taker asset (in wei)
  "salt": "string",            // Unique identifier for the order
  "extension": "string",       // Additional order data (usually "0x")
  "makerTraits": "string"      // Maker-specific traits (usually "0")
}
\`\`\`

### Order Hash
The order hash is a unique identifier generated from the order data using a deterministic algorithm.

### Signature
The signature is a cryptographic signature of the order hash, proving that the maker authorized the order.

## Order States

- **Active**: Order is available for matching
- **Filled**: Order has been completely filled
- **Cancelled**: Order has been cancelled by the maker
- **Expired**: Order has passed its expiration time

## Event Types

- **Fill**: Order was partially or completely filled
- **Cancel**: Order was cancelled by the maker

## Best Practices

1. **Salt Generation**: Use a cryptographically secure random number for the salt
2. **Amount Precision**: Use string representation for amounts to avoid precision loss
3. **Signature**: Ensure the signature is valid and corresponds to the order hash
4. **Expiration**: Consider setting appropriate expiration times for orders
5. **Gas Estimation**: Account for gas costs when creating orders

## Error Handling

- **400**: Invalid input parameters
- **403**: Too many orders (rate limit exceeded)
- **404**: Order not found
- **500**: Internal server error

## Rate Limits

- Maximum orders per address: Varies by chain
- Request frequency: Check official documentation for current limits
- Batch operations: Not supported, submit orders individually`;
  }

  private async analyzeOrderbookActivity(args: any): Promise<string> {
    const { chain, makerAsset, takerAsset, timeframe = '24h' } = args;
    
    // Get all orders for analysis
    const allOrders = await this.getAllOrders({ chain, limit: 1000 });
    
    // Get active pairs for context
    const activePairs = await this.getActivePairs({ chain });
    
    let analysis = `Orderbook Activity Analysis for Chain ${chain} (${timeframe}):\n\n`;
    
    // Basic statistics
    analysis += `Total Orders: ${allOrders.length}\n`;
    analysis += `Active Pairs: ${activePairs.items.length}\n\n`;
    
    // Filter by specific assets if provided
    if (makerAsset || takerAsset) {
      const filteredOrders = allOrders.filter((order: any) => {
        if (makerAsset && order.data.makerAsset !== makerAsset) return false;
        if (takerAsset && order.data.takerAsset !== takerAsset) return false;
        return true;
      });
      
      analysis += `Filtered Orders (${makerAsset || 'any'} → ${takerAsset || 'any'}): ${filteredOrders.length}\n\n`;
      
      // Analyze filtered orders
      if (filteredOrders.length > 0) {
        const totalMakingAmount = filteredOrders.reduce((sum: bigint, order: any) => 
          sum + BigInt(order.data.makingAmount), BigInt(0));
        const totalTakingAmount = filteredOrders.reduce((sum: bigint, order: any) => 
          sum + BigInt(order.data.takingAmount), BigInt(0));
        
        analysis += `Total Making Amount: ${totalMakingAmount.toString()}\n`;
        analysis += `Total Taking Amount: ${totalTakingAmount.toString()}\n`;
      }
    }
    
    // Top active pairs
    analysis += `\nTop Active Trading Pairs:\n`;
    activePairs.items.slice(0, 5).forEach((pair: any, index: number) => {
      analysis += `${index + 1}. ${pair.makerAsset} → ${pair.takerAsset}\n`;
    });
    
    return analysis;
  }

  private async monitorUserOrders(args: any): Promise<string> {
    const { chain, address } = args;
    
    // Get user's orders
    const userOrders = await this.getOrdersByAddress({ chain, address });
    
    let analysis = `User Order Monitor for ${address} on Chain ${chain}:\n\n`;
    analysis += `Total Orders: ${userOrders.length}\n\n`;
    
    if (userOrders.length === 0) {
      analysis += `No orders found for this address.\n`;
      return analysis;
    }
    
    // Analyze orders by status (using orderInvalidReason as status indicator)
    const activeOrders = userOrders.filter((order: any) => !order.orderInvalidReason);
    const invalidOrders = userOrders.filter((order: any) => order.orderInvalidReason);
    
    analysis += `Active Orders: ${activeOrders.length}\n`;
    analysis += `Invalid Orders: ${invalidOrders.length}\n\n`;
    
    // Show recent active orders
    if (activeOrders.length > 0) {
      analysis += `Recent Active Orders:\n`;
      activeOrders.slice(0, 5).forEach((order: any, index: number) => {
        analysis += `${index + 1}. ${order.data.makerAsset} → ${order.data.takerAsset}\n`;
        analysis += `   Making: ${order.data.makingAmount}\n`;
        analysis += `   Taking: ${order.data.takingAmount}\n`;
        analysis += `   Created: ${order.createDateTime}\n\n`;
      });
    }
    
    return analysis;
  }
} 