import { BaseService, ServiceConfig, ToolDefinition, ResourceDefinition, PromptDefinition } from '../base/BaseService';
import {
  HistoryEventsRequest,
  HistoryEventsResponse,
  HistoryEventsByAddressRequest,
  HistoryEventsByAddressResponse,
  HistoryEventSearchRequest,
  HistoryEventSearchResponse,
  SwapEventsRequest,
  SwapEventsResponse,
  MultiFilterDto,
  PostMultiFilterDto,
  HistorySearchMultiFilterRootDto,
  HistorySwapFilterRootDto
} from './HistoryTypes';

export class HistoryService extends BaseService {
  constructor(serviceConfig: ServiceConfig) {
    super(serviceConfig);
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'get_history_events',
        description: 'Get all history events for a specific wallet address on supported networks',
        inputSchema: {
          type: 'object',
          properties: {
            address: { type: 'string', description: 'Wallet address' },
            limit: { type: 'number', description: 'Number of events (default 100, max 2048)', default: 100 },
            tokenAddress: { type: 'string', description: 'Filter by token address' },
            chainId: { type: 'number', description: 'Blockchain network ID' },
            toTimestampMs: { type: 'string', description: 'Latest timestamp in milliseconds' },
            fromTimestampMs: { type: 'string', description: 'Starting timestamp in milliseconds' }
          },
          required: ['address']
        }
      },
      {
        name: 'get_history_events_by_address',
        description: 'Retrieve events for multiple addresses or with advanced filters',
        inputSchema: {
          type: 'object',
          properties: {
            addresses: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'List of wallet addresses'
            },
            chainIds: { 
              type: 'array', 
              items: { type: 'number' },
              description: 'Array of chain IDs'
            },
            limit: { type: 'number', description: 'Number of events (default 100, max 2048)', default: 100 },
            fromTimestampMs: { type: 'string', description: 'Starting timestamp in milliseconds' },
            toTimestampMs: { type: 'string', description: 'Latest timestamp in milliseconds' },
            tokenAddress: { type: 'string', description: 'Filter by token address' }
          },
          required: ['addresses']
        }
      },
      {
        name: 'get_history_events_with_search',
        description: 'Get history events with enhanced search and filter options',
        inputSchema: {
          type: 'object',
          properties: {
            filter: {
              type: 'object',
              properties: {
                type: { type: 'string', description: 'Event type filter (swap, transfer, addLiquidity, etc.)' },
                from: { type: 'string', description: 'From address filter' },
                to: { type: 'string', description: 'To address filter' }
              }
            },
            addresses: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'List of wallet addresses'
            },
            chainIds: { 
              type: 'array', 
              items: { type: 'number' },
              description: 'Array of chain IDs'
            },
            limit: { type: 'number', description: 'Number of events (default 100, max 2048)', default: 100 }
          },
          required: ['addresses']
        }
      },
      {
        name: 'get_swap_events',
        description: 'Retrieve only swap-related events for a user',
        inputSchema: {
          type: 'object',
          properties: {
            address: { type: 'string', description: 'Wallet address' },
            chainId: { type: 'number', description: 'Blockchain network ID' },
            fromTimestampMs: { type: 'string', description: 'Starting timestamp in milliseconds' },
            toTimestampMs: { type: 'string', description: 'Latest timestamp in milliseconds' },
            limit: { type: 'number', description: 'Number of events (default 100, max 2048)', default: 100 }
          },
          required: ['address', 'chainId']
        }
      }
    ];
  }

  getResources(): ResourceDefinition[] {
    return [
      {
        uri: '1inch://history/documentation',
        name: 'History API Documentation',
        description: 'Complete documentation for 1inch History API',
        mimeType: 'text/markdown'
      },
      {
        uri: '1inch://history/supported-chains',
        name: 'Supported Chains',
        description: 'List of supported blockchain chains for history queries',
        mimeType: 'application/json'
      },
      {
        uri: '1inch://history/event-types',
        name: 'Event Types',
        description: 'List of supported event types for filtering',
        mimeType: 'application/json'
      }
    ];
  }

  getPrompts(): PromptDefinition[] {
    return [
      {
        name: 'analyze_wallet_history',
        description: 'Analyze wallet transaction history and patterns',
        arguments: [
          { name: 'address', description: 'Wallet address', required: true },
          { name: 'chainId', description: 'Chain ID for filtering', required: false },
          { name: 'limit', description: 'Number of events to analyze', required: false }
        ]
      },
      {
        name: 'get_swap_analysis',
        description: 'Analyze swap activities for a wallet',
        arguments: [
          { name: 'address', description: 'Wallet address', required: true },
          { name: 'chainId', description: 'Chain ID', required: true },
          { name: 'fromTimestampMs', description: 'Start timestamp', required: false },
          { name: 'toTimestampMs', description: 'End timestamp', required: false }
        ]
      }
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    switch (name) {
      case 'get_history_events':
        return await this.getHistoryEvents(args);
      case 'get_history_events_by_address':
        return await this.getHistoryEventsByAddress(args);
      case 'get_history_events_with_search':
        return await this.getHistoryEventsWithSearch(args);
      case 'get_swap_events':
        return await this.getSwapEvents(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  async handleResourceRead(uri: string): Promise<any> {
    switch (uri) {
      case '1inch://history/documentation':
        return await this.getHistoryDocumentation();
      case '1inch://history/supported-chains':
        return await this.getSupportedChains();
      case '1inch://history/event-types':
        return await this.getEventTypes();
      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
  }

  async handlePromptRequest(name: string, args: any): Promise<any> {
    switch (name) {
      case 'analyze_wallet_history':
        return await this.analyzeWalletHistory(args);
      case 'get_swap_analysis':
        return await this.getSwapAnalysis(args);
      default:
        throw new Error(`Unknown prompt: ${name}`);
    }
  }

  async getHistoryEvents(params: HistoryEventsRequest): Promise<HistoryEventsResponse> {
    const url = `${this.baseUrl}/history/v2.0/history/${params.address}/events`;
    const queryParams = new URLSearchParams();
    
    if (params.limit !== undefined) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params.tokenAddress) {
      queryParams.append('tokenAddress', params.tokenAddress);
    }
    if (params.chainId !== undefined) {
      queryParams.append('chainId', params.chainId.toString());
    }
    if (params.toTimestampMs) {
      queryParams.append('toTimestampMs', params.toTimestampMs);
    }
    if (params.fromTimestampMs) {
      queryParams.append('fromTimestampMs', params.fromTimestampMs);
    }

    const response = await this.makeRequest<HistoryEventsResponse>(`${url}?${queryParams.toString()}`);
    return response;
  }

  async getHistoryEventsByAddress(params: HistoryEventsByAddressRequest): Promise<HistoryEventsByAddressResponse> {
    const url = `${this.baseUrl}/history/v2.0/history/${params.addresses[0]}/events`;
    const filter: MultiFilterDto = {};
    
    if (params.chainIds) {
      filter.chain_ids = params.chainIds.map(id => id.toString());
    }
    if (params.limit) {
      filter.limit = params.limit;
    }
    if (params.fromTimestampMs) {
      filter.from_time_ms = parseInt(params.fromTimestampMs);
    }
    if (params.toTimestampMs) {
      filter.to_time_ms = parseInt(params.toTimestampMs);
    }
    if (params.tokenAddress) {
      filter.token_addresses = [params.tokenAddress];
    }

    const body: PostMultiFilterDto = { filter };
    const response = await this.makePostRequest<HistoryEventsByAddressResponse>(url, body);
    return response;
  }

  async getHistoryEventsWithSearch(params: HistoryEventSearchRequest): Promise<HistoryEventSearchResponse> {
    const url = `${this.baseUrl}/history/v2.0/history/${params.addresses[0]}/search/events`;
    
    const andConditions: any = {};
    if (params.chainIds) {
      andConditions.chain_ids = params.chainIds.map(id => id.toString());
    }
    if (params.filter?.type) {
      andConditions.transaction_types = [params.filter.type];
    }

    const orConditions: any = {};
    if (params.filter?.from) {
      orConditions.from_or_to_address = params.filter.from;
    }
    if (params.filter?.to) {
      orConditions.from_or_to_address = params.filter.to;
    }

    const body: HistorySearchMultiFilterRootDto = {
      filter: {
        and: {
          and: andConditions,
          or: orConditions
        },
        ...(params.limit && { limit: params.limit })
      }
    };

    const response = await this.makePostRequest<HistoryEventSearchResponse>(url, body);
    return response;
  }

  async getSwapEvents(params: SwapEventsRequest): Promise<SwapEventsResponse> {
    // Use the search endpoint with swap transaction type filter instead of dedicated swaps endpoint
    const url = `${this.baseUrl}/history/v2.0/history/${params.address}/search/events`;
    
    const andConditions: any = {
      chain_ids: [params.chainId.toString()],
      transaction_types: ['Swap', 'SwapExactInput', 'SwapExactOutput']
    };

    const body = {
      filter: {
        and: {
          and: andConditions,
          or: {}
        },
        ...(params.limit && { limit: params.limit }),
        ...(params.fromTimestampMs && { from_time_ms: parseInt(params.fromTimestampMs) }),
        ...(params.toTimestampMs && { to_time_ms: parseInt(params.toTimestampMs) })
      }
    };

    const response = await this.makePostRequest<SwapEventsResponse>(url, body);
    return response;
  }

  private async getHistoryDocumentation(): Promise<string> {
    return `# 1inch History API Documentation

## Overview
The History API provides comprehensive transaction history and event tracking across multiple blockchain networks.

## Endpoints

### 1. GET /history/v2.0/history/{address}/events
Returns all history events for a specific wallet address on supported networks.

**Parameters:**
- address (path): Wallet address
- limit (query, optional): Number of events (default 100, max 2048)
- tokenAddress (query, optional): Filter by token address
- chainId (query, optional): Blockchain network ID
- toTimestampMs (query, optional): Latest timestamp in milliseconds
- fromTimestampMs (query, optional): Starting timestamp in milliseconds

### 2. POST /history/v2.0/history/{address}/events
Retrieve events with advanced filters using POST method.

**Body Parameters:**
- filter (required): Object containing filter criteria
  - chain_ids (optional): Array of chain IDs as strings
  - limit (optional): Number of events (default 100, max 2048)
  - from_time_ms (optional): Starting timestamp in milliseconds
  - to_time_ms (optional): Latest timestamp in milliseconds
  - token_addresses (optional): Array of token addresses

### 3. POST /history/v2.0/history/{address}/search/events
Get history events with enhanced search and filter options.

**Body Parameters:**
- filter (required): Object containing search criteria
  - and: Object with AND conditions
    - chain_ids (optional): Array of chain IDs as strings
    - transaction_types (optional): Array of transaction types
  - or: Object with OR conditions
    - from_or_to_address (optional): Address to search for
  - limit (optional): Number of events

### 4. POST /history/v2.0/history/{address}/events/swaps
Retrieve only swap-related events for a user.

**Body Parameters:**
- filter (required): Object containing swap filter criteria
  - chain_ids (required): Array of chain IDs as strings
  - from_time_ms (optional): Starting timestamp in milliseconds
  - to_time_ms (optional): Latest timestamp in milliseconds
  - limit (optional): Number of events

## Response Format
All endpoints return an array of history event objects with the following structure:

\`\`\`json
{
  "id": "string",
  "address": "string",
  "type": "string",
  "rating": "number",
  "timeMs": "number",
  "details": {
    "orderInBlock": "number",
    "txHash": "string",
    "chainId": "number",
    "blockNumber": "number",
    "blockTimeSec": "number",
    "status": "string",
    "type": "string",
    "tokenActions": [
      {
        "address": "string",
        "standard": "string",
        "fromAddress": "string",
        "toAddress": "string",
        "tokenId": "string",
        "amount": "string",
        "direction": "string"
      }
    ],
    "meta": {
      "is1inchFusionSwap": "boolean",
      "is1inchCrossChainSwap": "boolean",
      "orderFillPercentage": "number",
      "ensDomainName": "string"
    }
  }
}
\`\`\`

## Event Types
Supported event types include: Swap, Transfer, Approve, AddLiquidity, RemoveLiquidity, and more.

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
      description: 'Supported blockchain chains for history queries'
    });
  }

  private async getEventTypes(): Promise<string> {
    return JSON.stringify({
      eventTypes: [
        'Swap',
        'Transfer',
        'Approve',
        'AddLiquidity',
        'RemoveLiquidity',
        'Stake',
        'Unstake',
        'Claim',
        'Mint',
        'Burn',
        'Bridge',
        'CrossChainSwap',
        'FusionSwap',
        'OrderFill',
        'OrderCancel',
        'OrderExpire'
      ],
      description: 'Supported event types for filtering history events'
    });
  }

  private async analyzeWalletHistory(args: any): Promise<string> {
    const { address, chainId, limit = 100 } = args;
    
    const params: HistoryEventsRequest = { address };
    if (chainId) params.chainId = chainId;
    if (limit) params.limit = limit;
    
    const response = await this.getHistoryEvents(params);
    const events = Array.isArray(response) ? response : (response as any)?.items || (response as any)?.data || response;
    
    let analysis = `Wallet History Analysis for ${address}${chainId ? ` on Chain ${chainId}` : ''}:

Total Events: ${events.length}

Event Type Breakdown:`;
    
    const eventTypeCount: Record<string, number> = {};
    events.forEach((event: any) => {
      eventTypeCount[event.type] = (eventTypeCount[event.type] || 0) + 1;
    });
    
    Object.entries(eventTypeCount).forEach(([type, count]) => {
      analysis += `\n- ${type}: ${count} events`;
    });

    if (events.length > 0) {
      const latestEvent = events[0];
      const oldestEvent = events[events.length - 1];
      
      analysis += `\n\nTime Range:`;
      analysis += `\n- Latest: ${new Date(latestEvent?.timeMs || 0).toISOString()}`;
      analysis += `\n- Oldest: ${new Date(oldestEvent?.timeMs || 0).toISOString()}`;
      
      analysis += `\n\nRecent Activity:`;
      events.slice(0, 5).forEach((event: any, index: number) => {
        analysis += `\n${index + 1}. ${event.type} - ${new Date(event.timeMs || 0).toISOString()}`;
        if (event.details?.txHash) {
          analysis += ` (Tx: ${event.details.txHash.substring(0, 10)}...)`;
        }
      });
    }

    return analysis;
  }

  private async getSwapAnalysis(args: any): Promise<string> {
    const { address, chainId, fromTimestampMs, toTimestampMs } = args;
    
    const params: SwapEventsRequest = { address, chainId };
    if (fromTimestampMs) params.fromTimestampMs = fromTimestampMs;
    if (toTimestampMs) params.toTimestampMs = toTimestampMs;
    
    const response = await this.getSwapEvents(params);
    const swapEvents = Array.isArray(response) ? response : (response as any)?.items || (response as any)?.data || response;
    
    let analysis = `Swap Analysis for ${address} on Chain ${chainId}:

Total Swap Events: ${swapEvents.length}`;

    if (swapEvents.length > 0) {
      const totalVolume = swapEvents.reduce((sum: number, event: any) => {
        return sum + event.tokenActions.reduce((actionSum: number, action: any) => {
          return actionSum + parseFloat(action.amount || '0');
        }, 0);
      }, 0);
      
      analysis += `\nTotal Volume: ${totalVolume.toFixed(6)}`;
      
      analysis += `\n\nSwap Details:`;
      swapEvents.slice(0, 10).forEach((event: any, index: number) => {
        analysis += `\n${index + 1}. ${event.type} - ${new Date(event.timeMs || 0).toISOString()}`;
        if (event.details?.txHash) {
          analysis += `\n   Tx: ${event.details.txHash}`;
        }
        if (event.tokenActions?.length > 0) {
          analysis += `\n   Actions: ${event.tokenActions.length} token actions`;
        }
      });
    }

    return analysis;
  }
} 