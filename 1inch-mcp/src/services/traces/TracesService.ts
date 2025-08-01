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
            chain: { type: 'string', description: 'Chain name (e.g., ethereum, arbitrum, etc.)' }
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
            chain: { type: 'string', description: 'Chain name (e.g., ethereum, arbitrum, etc.)' },
            blockNumber: { type: 'number', description: 'The block number to trace' }
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
            chain: { type: 'string', description: 'Chain name (e.g., ethereum, arbitrum, etc.)' },
            blockNumber: { type: 'number', description: 'The block number' },
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
            chain: { type: 'string', description: 'Chain name (e.g., ethereum, arbitrum, etc.)' },
            blockNumber: { type: 'number', description: 'The block number' },
            txOffset: { type: 'number', description: 'Index (offset) of the transaction in the block (e.g. first transaction is 0)' }
          },
          required: ['chain', 'blockNumber', 'txOffset']
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
          { name: 'chain', description: 'Chain name', required: true },
          { name: 'blockNumber', description: 'Block number', required: true }
        ]
      },
      {
        name: 'analyze_transaction_trace',
        description: 'Analyze trace for a specific transaction',
        arguments: [
          { name: 'chain', description: 'Chain name', required: true },
          { name: 'blockNumber', description: 'Block number', required: true },
          { name: 'txHash', description: 'Transaction hash', required: true }
        ]
      }
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
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

  async getSyncedInterval(params: SyncedIntervalRequest): Promise<SyncedIntervalResponse> {
    const url = `${this.baseUrl}/traces/v1.0/chain/${params.chain}/synced-interval`;
    const response = await this.makeRequest<SyncedIntervalResponse>(url);
    return response;
  }

  async getBlockTrace(params: BlockTraceRequest): Promise<BlockTraceResponse> {
    const url = `${this.baseUrl}/traces/v1.0/chain/${params.chain}/block/${params.blockNumber}`;
    const response = await this.makeRequest<BlockTraceResponse>(url);
    return response;
  }

  async getTransactionTraceByHash(params: TransactionTraceByHashRequest): Promise<TransactionTraceByHashResponse> {
    const url = `${this.baseUrl}/traces/v1.0/chain/${params.chain}/block/${params.blockNumber}/tx/${params.txHash}`;
    const response = await this.makeRequest<TransactionTraceByHashResponse>(url);
    return response;
  }

  async getTransactionTraceByOffset(params: TransactionTraceByOffsetRequest): Promise<TransactionTraceByOffsetResponse> {
    const url = `${this.baseUrl}/traces/v1.0/chain/${params.chain}/block/${params.blockNumber}/tx-offset/${params.txOffset}`;
    const response = await this.makeRequest<TransactionTraceByOffsetResponse>(url);
    return response;
  }

  private async getTracesDocumentation(): Promise<string> {
    return `# 1inch Traces API Documentation

## Overview
The Traces API provides comprehensive transaction tracing capabilities across multiple blockchain networks, allowing you to analyze transaction execution step-by-step.

## Endpoints

### 1. GET /traces/v1.0/chain/{chain}/synced-interval
Returns the range of blocks for which transaction traces are currently indexed and available for the specified chain.

**Parameters:**
- chain (path): Chain name (e.g., ethereum, arbitrum, etc.)

**Response:**
- fromBlock: Starting block number
- toBlock: Ending block number
- chain: Chain name

### 2. GET /traces/v1.0/chain/{chain}/block/{block_number}
Fetches the full trace of all transactions and contract operations for an entire block.

**Parameters:**
- chain (path): Chain name (e.g., ethereum, arbitrum, etc.)
- block_number (path): The block number to trace

**Response:**
- blockNumber: The traced block number
- chain: Chain name
- traces: Array of transaction traces

### 3. GET /traces/v1.0/chain/{chain}/block/{block_number}/tx/{tx_hash}
Returns step-by-step trace for a specific transaction identified by its hash within the specified block.

**Parameters:**
- chain (path): Chain name (e.g., ethereum, arbitrum, etc.)
- block_number (path): The block number
- tx_hash (path): The transaction hash

**Response:**
- txHash: Transaction hash
- blockNumber: Block number
- chain: Chain name
- trace: Array of trace steps

### 4. GET /traces/v1.0/chain/{chain}/block/{block_number}/tx-offset/{tx_offset}
Returns the trace for the transaction at the specified index within the block.

**Parameters:**
- chain (path): Chain name (e.g., ethereum, arbitrum, etc.)
- block_number (path): The block number
- tx_offset (path): Index (offset) of the transaction in the block (e.g. first transaction is 0)

**Response:**
- txHash: Transaction hash
- blockNumber: Block number
- chain: Chain name
- trace: Array of trace steps

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
        { name: 'ethereum', description: 'Ethereum Mainnet' },
        { name: 'arbitrum', description: 'Arbitrum One' },
        { name: 'polygon', description: 'Polygon' },
        { name: 'bsc', description: 'BNB Smart Chain' },
        { name: 'avalanche', description: 'Avalanche C-Chain' },
        { name: 'optimism', description: 'Optimism' },
        { name: 'base', description: 'Base' },
        { name: 'fantom', description: 'Fantom Opera' },
        { name: 'zksync', description: 'zkSync Era' },
        { name: 'linea', description: 'Linea' },
        { name: 'scroll', description: 'Scroll' },
        { name: 'blast', description: 'Blast' }
      ],
      description: 'Supported blockchain chains for traces queries'
    });
  }

  private async analyzeBlockTraces(args: any): Promise<string> {
    const { chain, blockNumber } = args;
    
    // Get synced interval first
    const syncedInterval = await this.getSyncedInterval({ chain });
    
    if (blockNumber < syncedInterval.fromBlock || blockNumber > syncedInterval.toBlock) {
      return `Block ${blockNumber} is not available for tracing on ${chain}. Available range: ${syncedInterval.fromBlock} to ${syncedInterval.toBlock}`;
    }
    
    // Get block trace
    const blockTrace = await this.getBlockTrace({ chain, blockNumber });
    
    let analysis = `Block Trace Analysis for Block ${blockNumber} on ${chain}:

Total Transactions: ${blockTrace.traces.length}

Transaction Details:`;
    
    blockTrace.traces.forEach((tx, index) => {
      analysis += `\n${index + 1}. Transaction ${tx.txHash} (Offset: ${tx.txOffset})`;
      analysis += `\n   - Trace Steps: ${tx.trace.length}`;
      
      // Count different types of operations
      const operationTypes = tx.trace.reduce((acc, step) => {
        acc[step.type] = (acc[step.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      Object.entries(operationTypes).forEach(([type, count]) => {
        analysis += `\n   - ${type}: ${count}`;
      });
    });

    return analysis;
  }

  private async analyzeTransactionTrace(args: any): Promise<string> {
    const { chain, blockNumber, txHash } = args;
    
    // Get synced interval first
    const syncedInterval = await this.getSyncedInterval({ chain });
    
    if (blockNumber < syncedInterval.fromBlock || blockNumber > syncedInterval.toBlock) {
      return `Block ${blockNumber} is not available for tracing on ${chain}. Available range: ${syncedInterval.fromBlock} to ${syncedInterval.toBlock}`;
    }
    
    // Get transaction trace
    const txTrace = await this.getTransactionTraceByHash({ chain, blockNumber, txHash });
    
    let analysis = `Transaction Trace Analysis for ${txHash} on ${chain}:

Block Number: ${txTrace.blockNumber}
Total Trace Steps: ${txTrace.trace.length}

Trace Step Analysis:`;
    
    // Count different types of operations
    const operationTypes = txTrace.trace.reduce((acc, step) => {
      acc[step.type] = (acc[step.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(operationTypes).forEach(([type, count]) => {
      analysis += `\n- ${type}: ${count}`;
    });
    
    // Check for errors
    const errorSteps = txTrace.trace.filter(step => step.error);
    if (errorSteps.length > 0) {
      analysis += `\n\nErrors Found: ${errorSteps.length}`;
      errorSteps.forEach((step, index) => {
        analysis += `\n${index + 1}. ${step.error}`;
      });
    }

    return analysis;
  }
} 