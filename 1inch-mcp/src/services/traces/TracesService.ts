import { BaseService, ServiceConfig, ToolDefinition, ResourceDefinition, PromptDefinition } from '../base/BaseService';
import {
  SyncedIntervalRequest,
  SyncedIntervalResponse,
  BlockTraceRequest,
  BlockTraceResponse,
  TransactionTraceByHashRequest,
  TransactionTraceByHashResponse,
  TransactionTraceByOffsetRequest,
  TransactionTraceByOffsetResponse
} from './TracesTypes';

export class TracesService extends BaseService {
  constructor(serviceConfig: ServiceConfig) {
    super(serviceConfig);
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'get_synced_interval',
        description: 'Get the range of blocks for which transaction traces are currently indexed and available',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID (e.g., 1 for Ethereum, 137 for Polygon, etc.)' }
          },
          required: ['chain']
        }
      },
      {
        name: 'get_block_trace',
        description: 'Get the full trace of all transactions and contract operations for an entire block',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID (e.g., 1 for Ethereum, 137 for Polygon, etc.)' },
            blockNumber: { type: 'string', description: 'The block number to trace' }
          },
          required: ['chain', 'blockNumber']
        }
      },
      {
        name: 'get_transaction_trace_by_hash',
        description: 'Get step-by-step trace for a specific transaction identified by its hash within the specified block',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID (e.g., 1 for Ethereum, 137 for Polygon, etc.)' },
            blockNumber: { type: 'string', description: 'The block number' },
            txHash: { type: 'string', description: 'The transaction hash' }
          },
          required: ['chain', 'blockNumber', 'txHash']
        }
      },
      {
        name: 'get_transaction_trace_by_offset',
        description: 'Get trace for the transaction at the specified index within the block',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID (e.g., 1 for Ethereum, 137 for Polygon, etc.)' },
            blockNumber: { type: 'string', description: 'The block number' },
            offset: { type: 'number', description: 'Index (offset) of the transaction in the block (e.g. first transaction is 0)' }
          },
          required: ['chain', 'blockNumber', 'offset']
        }
      }
    ];
  }

  getResources(): ResourceDefinition[] {
    return [
      {
        uri: '1inch://traces/documentation',
        name: 'Traces API Documentation',
        description: 'Complete documentation for 1inch Traces API',
        mimeType: 'text/markdown'
      },
      {
        uri: '1inch://traces/supported-chains',
        name: 'Supported Chains',
        description: 'List of supported blockchain chains for traces queries',
        mimeType: 'application/json'
      }
    ];
  }

  getPrompts(): PromptDefinition[] {
    return [
      {
        name: 'analyze_block_traces',
        description: 'Analyze traces for a specific block',
        arguments: [
          { name: 'chain', description: 'Chain ID', required: true },
          { name: 'blockNumber', description: 'Block number', required: true }
        ]
      },
      {
        name: 'analyze_transaction_trace',
        description: 'Analyze trace for a specific transaction',
        arguments: [
          { name: 'chain', description: 'Chain ID', required: true },
          { name: 'blockNumber', description: 'Block number', required: true },
          { name: 'txHash', description: 'Transaction hash', required: true }
        ]
      }
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    try {
      switch (name) {
        case 'get_synced_interval':
          return await this.getSyncedInterval(args);
        case 'get_block_trace':
          return await this.getBlockTrace(args);
        case 'get_transaction_trace_by_hash':
          return await this.getTransactionTraceByHash(args);
        case 'get_transaction_trace_by_offset':
          return await this.getTransactionTraceByOffset(args);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      throw new Error(`Traces API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async handleResourceRead(uri: string): Promise<any> {
    switch (uri) {
      case '1inch://traces/documentation':
        return await this.getTracesDocumentation();
      case '1inch://traces/supported-chains':
        return await this.getSupportedChains();
      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
  }

  async handlePromptRequest(name: string, args: any): Promise<any> {
    switch (name) {
      case 'analyze_block_traces':
        return await this.analyzeBlockTraces(args);
      case 'analyze_transaction_trace':
        return await this.analyzeTransactionTrace(args);
      default:
        throw new Error(`Unknown prompt: ${name}`);
    }
  }

  async getSyncedInterval(params: { chain: number }): Promise<SyncedIntervalResponse> {
    // Validate required parameters
    if (!params.chain) {
      throw new Error('chain parameter is required. Use 1 for Ethereum, 137 for Polygon, etc.');
    }

    const url = `${this.baseUrl}/traces/v1.0/chain/${params.chain}/synced-interval`;
    
    const response = await this.makeRequest<SyncedIntervalResponse>(url);
    return response;
  }

  async getBlockTrace(params: { chain: number; blockNumber: string }): Promise<BlockTraceResponse> {
    // Validate required parameters
    if (!params.chain) {
      throw new Error('chain parameter is required. Use 1 for Ethereum, 137 for Polygon, etc.');
    }
    if (!params.blockNumber) {
      throw new Error('blockNumber is required for getBlockTrace endpoint');
    }

    const url = `${this.baseUrl}/traces/v1.0/chain/${params.chain}/block-trace/${params.blockNumber}`;
    
    const response = await this.makeRequest<BlockTraceResponse>(url);
    return response;
  }

  async getTransactionTraceByHash(params: { chain: number; blockNumber: string; txHash: string }): Promise<TransactionTraceByHashResponse> {
    // Validate required parameters
    if (!params.chain) {
      throw new Error('chain parameter is required. Use 1 for Ethereum, 137 for Polygon, etc.');
    }
    if (!params.blockNumber || !params.txHash) {
      throw new Error('blockNumber and txHash are required for getTransactionTraceByHash endpoint');
    }

    const url = `${this.baseUrl}/traces/v1.0/chain/${params.chain}/block-trace/${params.blockNumber}/tx-hash/${params.txHash}`;
    
    const response = await this.makeRequest<TransactionTraceByHashResponse>(url);
    return response;
  }

  async getTransactionTraceByOffset(params: { chain: number; blockNumber: string; offset: number }): Promise<TransactionTraceByOffsetResponse> {
    // Validate required parameters
    if (!params.chain) {
      throw new Error('chain parameter is required. Use 1 for Ethereum, 137 for Polygon, etc.');
    }
    if (!params.blockNumber || params.offset === undefined) {
      throw new Error('blockNumber and offset are required for getTransactionTraceByOffset endpoint');
    }

    const url = `${this.baseUrl}/traces/v1.0/chain/${params.chain}/block-trace/${params.blockNumber}/offset/${params.offset}`;
    
    const response = await this.makeRequest<TransactionTraceByOffsetResponse>(url);
    return response;
  }

  // Main tracesAPI function for backward compatibility
  async tracesAPI(params: {
    endpoint?: 'getSyncedInterval' | 'getBlockTraceByNumber' | 'getTransactionTraceByHash' | 'getTransactionTraceByOffset';
    chain?: number;
    blockNumber?: string;
    txHash?: string;
    offset?: number;
  }): Promise<any> {
    try {
      // If no parameters provided, default to getSyncedInterval for Ethereum
      if (!params.endpoint && !params.chain) {
        return await this.getSyncedInterval({ chain: 1 });
      }
      
      // Validate required parameters
      if (!params.endpoint) {
        throw new Error('endpoint parameter is required. Must be one of: getSyncedInterval, getBlockTraceByNumber, getTransactionTraceByHash, getTransactionTraceByOffset');
      }
      
      if (!params.chain) {
        throw new Error('chain parameter is required. Use 1 for Ethereum, 137 for Polygon, etc.');
      }

      switch (params.endpoint) {
        case 'getSyncedInterval':
          return await this.getSyncedInterval({ chain: params.chain });

        case 'getBlockTraceByNumber':
          if (!params.blockNumber) {
            throw new Error('blockNumber is required for getBlockTraceByNumber endpoint');
          }
          return await this.getBlockTrace({ 
            chain: params.chain, 
            blockNumber: params.blockNumber 
          });

        case 'getTransactionTraceByHash':
          if (!params.blockNumber || !params.txHash) {
            throw new Error('blockNumber and txHash are required for getTransactionTraceByHash endpoint');
          }
          return await this.getTransactionTraceByHash({ 
            chain: params.chain, 
            blockNumber: params.blockNumber, 
            txHash: params.txHash 
          });

        case 'getTransactionTraceByOffset':
          if (!params.blockNumber || params.offset === undefined) {
            throw new Error('blockNumber and offset are required for getTransactionTraceByOffset endpoint');
          }
          return await this.getTransactionTraceByOffset({ 
            chain: params.chain, 
            blockNumber: params.blockNumber, 
            offset: params.offset 
          });

        default:
          throw new Error(`Unknown endpoint: ${params.endpoint}. Must be one of: getSyncedInterval, getBlockTraceByNumber, getTransactionTraceByHash, getTransactionTraceByOffset`);
      }
    } catch (error) {
      throw new Error(`Traces API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async getTracesDocumentation(): Promise<string> {
    return `# 1inch Traces API Documentation

## Overview
The Traces API provides comprehensive transaction tracing capabilities across multiple blockchain networks, allowing you to analyze transaction execution step-by-step.

## Endpoints

### 1. GET /traces/v1.0/chain/{chain}/synced-interval
Returns the range of blocks for which transaction traces are currently indexed and available for the specified chain.

**Parameters:**
- chain (path): Chain ID (e.g., 1 for Ethereum, 137 for Polygon, etc.)

**Response:**
- from: Starting block number
- to: Ending block number

### 2. GET /traces/v1.0/chain/{chain}/block-trace/{block_number}
Fetches the full trace of all transactions and contract operations for an entire block.

**Parameters:**
- chain (path): Chain ID (e.g., 1 for Ethereum, 137 for Polygon, etc.)
- block_number (path): The block number to trace

**Response:**
- type: Response type
- version: API version
- number: The traced block number
- blockHash: Block hash
- blockTimestamp: Block timestamp
- traces: Array of transaction traces

### 3. GET /traces/v1.0/chain/{chain}/block-trace/{block_number}/tx-hash/{tx_hash}
Returns step-by-step trace for a specific transaction identified by its hash within the specified block.

**Parameters:**
- chain (path): Chain ID (e.g., 1 for Ethereum, 137 for Polygon, etc.)
- block_number (path): The block number
- tx_hash (path): The transaction hash

**Response:**
- transactionTrace: Array of trace steps
- type: Response type

### 4. GET /traces/v1.0/chain/{chain}/block-trace/{block_number}/offset/{tx_offset}
Returns the trace for the transaction at the specified index within the block.

**Parameters:**
- chain (path): Chain ID (e.g., 1 for Ethereum, 137 for Polygon, etc.)
- block_number (path): The block number
- tx_offset (path): Index (offset) of the transaction in the block (e.g. first transaction is 0)

**Response:**
- transactionTrace: Array of trace steps
- type: Response type

## Trace Step Structure
Each trace step contains:
- type: Type of operation (call, create, etc.)
- action: Details of the action performed
- result: Result of the action (if successful)
- subtraces: Number of sub-traces
- traceAddress: Array representing the trace path
- error: Error message (if failed)

## Authentication
All endpoints require API Key authentication via header.

## Use Cases
- Debugging smart contract interactions
- Analyzing transaction execution flow
- Understanding complex DeFi transactions
- Auditing transaction behavior`;
  }

  private async getSupportedChains(): Promise<string> {
    return JSON.stringify({
      chains: [
        { id: 1, name: 'ethereum', description: 'Ethereum Mainnet' },
        { id: 137, name: 'polygon', description: 'Polygon' },
        { id: 56, name: 'bsc', description: 'BNB Smart Chain' },
        { id: 42161, name: 'arbitrum', description: 'Arbitrum One' },
        { id: 10, name: 'optimism', description: 'Optimism' },
        { id: 8453, name: 'base', description: 'Base' },
        { id: 43114, name: 'avalanche', description: 'Avalanche C-Chain' },
        { id: 250, name: 'fantom', description: 'Fantom Opera' },
        { id: 324, name: 'zksync', description: 'zkSync Era' },
        { id: 59144, name: 'linea', description: 'Linea' },
        { id: 534352, name: 'scroll', description: 'Scroll' },
        { id: 81457, name: 'blast', description: 'Blast' }
      ],
      description: 'Supported blockchain chains for traces queries'
    });
  }

  private async analyzeBlockTraces(args: any): Promise<string> {
    const { chain, blockNumber } = args;
    
    // Get synced interval first
    const syncedInterval = await this.getSyncedInterval({ chain });
    
    if (blockNumber < syncedInterval.from || blockNumber > syncedInterval.to) {
      return `Block ${blockNumber} is not available for tracing on chain ${chain}. Available range: ${syncedInterval.from} to ${syncedInterval.to}`;
    }
    
    // Get block trace
    const blockTrace = await this.getBlockTrace({ chain, blockNumber });
    
    let analysis = `Block Trace Analysis for Block ${blockNumber} on chain ${chain}:

Total Transactions: ${blockTrace.traces.length}

Transaction Details:`;
    
    blockTrace.traces.forEach((tx: any, index) => {
      analysis += `\n${index + 1}. Transaction ${tx.txHash} (Offset: ${tx.txOffset})`;
      analysis += `\n   - Trace Steps: ${tx.trace ? tx.trace.length : 0}`;
      
      if (tx.trace) {
        // Count different types of operations
        const operationTypes = tx.trace.reduce((acc: Record<string, number>, step: any) => {
          acc[step.type] = (acc[step.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        Object.entries(operationTypes).forEach(([type, count]) => {
          analysis += `\n   - ${type}: ${count}`;
        });
      }
    });

    return analysis;
  }

  private async analyzeTransactionTrace(args: any): Promise<string> {
    const { chain, blockNumber, txHash } = args;
    
    // Get synced interval first
    const syncedInterval = await this.getSyncedInterval({ chain });
    
    if (blockNumber < syncedInterval.from || blockNumber > syncedInterval.to) {
      return `Block ${blockNumber} is not available for tracing on chain ${chain}. Available range: ${syncedInterval.from} to ${syncedInterval.to}`;
    }
    
    // Get transaction trace
    const txTrace = await this.getTransactionTraceByHash({ chain, blockNumber, txHash });
    
    let analysis = `Transaction Trace Analysis for ${txHash} on chain ${chain}:

Total Trace Steps: ${txTrace.transactionTrace ? txTrace.transactionTrace.length : 0}

Trace Step Analysis:`;
    
    if (txTrace.transactionTrace) {
      // Count different types of operations
      const operationTypes = txTrace.transactionTrace.reduce((acc: Record<string, number>, step: any) => {
        acc[step.type] = (acc[step.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      Object.entries(operationTypes).forEach(([type, count]) => {
        analysis += `\n- ${type}: ${count}`;
      });
      
      // Check for errors
      const errorSteps = txTrace.transactionTrace.filter((step: any) => step.error);
      if (errorSteps.length > 0) {
        analysis += `\n\nErrors Found: ${errorSteps.length}`;
        errorSteps.forEach((step: any, index) => {
          analysis += `\n${index + 1}. ${step.error}`;
        });
      }
    }

    return analysis;
  }
} 