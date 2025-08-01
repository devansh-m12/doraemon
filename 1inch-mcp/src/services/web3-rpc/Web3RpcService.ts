import { BaseService, ServiceConfig, ToolDefinition, ResourceDefinition, PromptDefinition } from '../base/BaseService';
import {
  Web3RpcRequest,
  Web3RpcResponse,
  EthBlockNumberRequest,
  EthBlockNumberResponse,
  EthGetBalanceRequest,
  EthGetBalanceResponse,
  EthCallRequest,
  EthCallResponse,
  EthGetTransactionCountRequest,
  EthGetTransactionCountResponse,
  EthSendRawTransactionRequest,
  EthSendRawTransactionResponse,
  EthGetTransactionReceiptRequest,
  EthGetTransactionReceiptResponse,
  EthGetBlockByNumberRequest,
  EthGetBlockByNumberResponse
} from './Web3RpcTypes';

export class Web3RpcService extends BaseService {
  constructor(serviceConfig: ServiceConfig) {
    super(serviceConfig);
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'json_rpc_call',
        description: 'Make a generic JSON-RPC call to any supported blockchain',
        inputSchema: {
          type: 'object',
          properties: {
            chainId: { type: 'number', description: 'Chain ID of the target blockchain' },
            method: { type: 'string', description: 'JSON-RPC method name (e.g., eth_blockNumber, eth_call)' },
            params: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'Parameters for the JSON-RPC method'
            },
            id: { 
              type: ['number', 'string', 'null'], 
              description: 'Request ID for matching responses',
              default: 1
            }
          },
          required: ['chainId', 'method', 'params']
        }
      },
      {
        name: 'get_block_number',
        description: 'Get the latest block number from the blockchain',
        inputSchema: {
          type: 'object',
          properties: {
            chainId: { type: 'number', description: 'Chain ID of the target blockchain' }
          },
          required: ['chainId']
        }
      },
      {
        name: 'get_balance',
        description: 'Get the balance of an address in wei',
        inputSchema: {
          type: 'object',
          properties: {
            chainId: { type: 'number', description: 'Chain ID of the target blockchain' },
            address: { type: 'string', description: 'Address to get balance for' },
            block: { 
              type: 'string', 
              description: 'Block parameter (latest, earliest, pending, or hex)',
              default: 'latest'
            }
          },
          required: ['chainId', 'address']
        }
      },
      {
        name: 'call_contract',
        description: 'Execute a contract call without creating a transaction',
        inputSchema: {
          type: 'object',
          properties: {
            chainId: { type: 'number', description: 'Chain ID of the target blockchain' },
            to: { type: 'string', description: 'Contract address to call' },
            data: { type: 'string', description: 'Encoded function call data' },
            from: { type: 'string', description: 'Address making the call (optional)' },
            gas: { type: 'string', description: 'Gas limit for the call (optional)' },
            gasPrice: { type: 'string', description: 'Gas price for the call (optional)' },
            value: { type: 'string', description: 'Value to send with the call (optional)' },
            block: { 
              type: 'string', 
              description: 'Block parameter (latest, earliest, pending, or hex)',
              default: 'latest'
            }
          },
          required: ['chainId', 'to', 'data']
        }
      },
      {
        name: 'get_transaction_count',
        description: 'Get the nonce (transaction count) of an address',
        inputSchema: {
          type: 'object',
          properties: {
            chainId: { type: 'number', description: 'Chain ID of the target blockchain' },
            address: { type: 'string', description: 'Address to get nonce for' },
            block: { 
              type: 'string', 
              description: 'Block parameter (latest, earliest, pending, or hex)',
              default: 'latest'
            }
          },
          required: ['chainId', 'address']
        }
      },
      {
        name: 'send_raw_transaction',
        description: 'Send a signed raw transaction to the network',
        inputSchema: {
          type: 'object',
          properties: {
            chainId: { type: 'number', description: 'Chain ID of the target blockchain' },
            signedTransactionData: { type: 'string', description: 'Signed transaction hex string' }
          },
          required: ['chainId', 'signedTransactionData']
        }
      },
      {
        name: 'get_transaction_receipt',
        description: 'Get the receipt of a transaction by its hash',
        inputSchema: {
          type: 'object',
          properties: {
            chainId: { type: 'number', description: 'Chain ID of the target blockchain' },
            transactionHash: { type: 'string', description: 'Transaction hash to get receipt for' }
          },
          required: ['chainId', 'transactionHash']
        }
      },
      {
        name: 'get_block_by_number',
        description: 'Get block information by block number',
        inputSchema: {
          type: 'object',
          properties: {
            chainId: { type: 'number', description: 'Chain ID of the target blockchain' },
            blockNumber: { 
              type: 'string', 
              description: 'Block number (latest, earliest, pending, or hex)',
              default: 'latest'
            },
            fullTransactionObjects: { 
              type: 'boolean', 
              description: 'Whether to include full transaction objects',
              default: false
            }
          },
          required: ['chainId', 'blockNumber']
        }
      }
    ];
  }

  getResources(): ResourceDefinition[] {
    return [
      {
        uri: '1inch://web3-rpc/documentation',
        name: 'Web3 RPC API Documentation',
        description: 'Complete documentation for 1inch Web3 RPC API',
        mimeType: 'text/markdown'
      },
      {
        uri: '1inch://web3-rpc/supported-chains',
        name: 'Supported Chains',
        description: 'List of supported blockchain chains for Web3 RPC calls',
        mimeType: 'application/json'
      },
      {
        uri: '1inch://web3-rpc/json-rpc-methods',
        name: 'JSON-RPC Methods Reference',
        description: 'Common JSON-RPC methods and their usage',
        mimeType: 'text/markdown'
      }
    ];
  }

  getPrompts(): PromptDefinition[] {
    return [
      {
        name: 'analyze_blockchain_state',
        description: 'Analyze current blockchain state including latest block and gas info',
        arguments: [
          { name: 'chainId', description: 'Chain ID', required: true },
          { name: 'address', description: 'Address to analyze', required: false }
        ]
      },
      {
        name: 'validate_transaction',
        description: 'Validate a transaction before sending',
        arguments: [
          { name: 'chainId', description: 'Chain ID', required: true },
          { name: 'signedTransactionData', description: 'Signed transaction hex', required: true }
        ]
      }
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    switch (name) {
      case 'json_rpc_call':
        return await this.jsonRpcCall(args);
      case 'get_block_number':
        return await this.getBlockNumber(args);
      case 'get_balance':
        return await this.getBalance(args);
      case 'call_contract':
        return await this.callContract(args);
      case 'get_transaction_count':
        return await this.getTransactionCount(args);
      case 'send_raw_transaction':
        return await this.sendRawTransaction(args);
      case 'get_transaction_receipt':
        return await this.getTransactionReceipt(args);
      case 'get_block_by_number':
        return await this.getBlockByNumber(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  async handleResourceRead(uri: string): Promise<any> {
    switch (uri) {
      case '1inch://web3-rpc/documentation':
        return await this.getWeb3RpcDocumentation();
      case '1inch://web3-rpc/supported-chains':
        return await this.getSupportedChains();
      case '1inch://web3-rpc/json-rpc-methods':
        return await this.getJsonRpcMethodsReference();
      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
  }

  async handlePromptRequest(name: string, args: any): Promise<any> {
    switch (name) {
      case 'analyze_blockchain_state':
        return await this.analyzeBlockchainState(args);
      case 'validate_transaction':
        return await this.validateTransaction(args);
      default:
        throw new Error(`Unknown prompt: ${name}`);
    }
  }

  async jsonRpcCall(params: Web3RpcRequest): Promise<Web3RpcResponse> {
    const url = `${this.baseUrl}/web3/${params.chainId}`;
    const body = {
      jsonrpc: params.jsonrpc || '2.0',
      method: params.method,
      params: params.params,
      id: params.id || 1
    };

    const response = await this.makePostRequest<Web3RpcResponse>(url, body);
    return response;
  }

  async getBlockNumber(params: EthBlockNumberRequest): Promise<EthBlockNumberResponse> {
    const request: Web3RpcRequest = {
      chainId: params.chainId,
      jsonrpc: '2.0',
      method: 'eth_blockNumber',
      params: [],
      id: 1
    };

    return await this.jsonRpcCall(request);
  }

  async getBalance(params: EthGetBalanceRequest): Promise<EthGetBalanceResponse> {
    const requestParams = [params.address];
    if (params.block) {
      requestParams.push(params.block);
    }

    const request: Web3RpcRequest = {
      chainId: params.chainId,
      jsonrpc: '2.0',
      method: 'eth_getBalance',
      params: requestParams,
      id: 1
    };

    return await this.jsonRpcCall(request);
  }

  async callContract(params: EthCallRequest): Promise<EthCallResponse> {
    const callObject: any = {
      to: params.to,
      data: params.data
    };

    if (params.from) callObject.from = params.from;
    if (params.gas) callObject.gas = params.gas;
    if (params.gasPrice) callObject.gasPrice = params.gasPrice;
    if (params.value) callObject.value = params.value;

    const requestParams = [callObject];
    if (params.block) {
      requestParams.push(params.block);
    }

    const request: Web3RpcRequest = {
      chainId: params.chainId,
      jsonrpc: '2.0',
      method: 'eth_call',
      params: requestParams,
      id: 1
    };

    return await this.jsonRpcCall(request);
  }

  async getTransactionCount(params: EthGetTransactionCountRequest): Promise<EthGetTransactionCountResponse> {
    const requestParams = [params.address];
    if (params.block) {
      requestParams.push(params.block);
    }

    const request: Web3RpcRequest = {
      chainId: params.chainId,
      jsonrpc: '2.0',
      method: 'eth_getTransactionCount',
      params: requestParams,
      id: 1
    };

    return await this.jsonRpcCall(request);
  }

  async sendRawTransaction(params: EthSendRawTransactionRequest): Promise<EthSendRawTransactionResponse> {
    const request: Web3RpcRequest = {
      chainId: params.chainId,
      jsonrpc: '2.0',
      method: 'eth_sendRawTransaction',
      params: [params.signedTransactionData],
      id: 1
    };

    return await this.jsonRpcCall(request);
  }

  async getTransactionReceipt(params: EthGetTransactionReceiptRequest): Promise<EthGetTransactionReceiptResponse> {
    const request: Web3RpcRequest = {
      chainId: params.chainId,
      jsonrpc: '2.0',
      method: 'eth_getTransactionReceipt',
      params: [params.transactionHash],
      id: 1
    };

    return await this.jsonRpcCall(request);
  }

  async getBlockByNumber(params: EthGetBlockByNumberRequest): Promise<EthGetBlockByNumberResponse> {
    const requestParams: (string | boolean)[] = [params.blockNumber];
    if (params.fullTransactionObjects !== undefined) {
      requestParams.push(params.fullTransactionObjects);
    } else {
      // Default to false if not specified
      requestParams.push(false);
    }

    const request: Web3RpcRequest = {
      chainId: params.chainId,
      jsonrpc: '2.0',
      method: 'eth_getBlockByNumber',
      params: requestParams,
      id: 1
    };

    return await this.jsonRpcCall(request);
  }

  private async getWeb3RpcDocumentation(): Promise<string> {
    return `# 1inch Web3 RPC API Documentation

## Overview
The Web3 RPC API provides direct access to blockchain nodes through the JSON-RPC 2.0 protocol. This unified endpoint allows you to perform any standard Web3 JSON-RPC calls on supported blockchain networks.

## Endpoint
**POST** \`https://api.1inch.dev/web3/{chainId}\`

## Request Format
All requests follow the JSON-RPC 2.0 specification:

\`\`\`json
{
  "jsonrpc": "2.0",
  "method": "eth_blockNumber",
  "params": [],
  "id": 1
}
\`\`\`

### Parameters
- **jsonrpc**: *string* — Version of JSON-RPC protocol (must be "2.0")
- **method**: *string* — The JSON-RPC method to call
- **params**: *array* — Parameters required for the method
- **id**: *integer, string, or null* — Unique identifier for request/response matching

## Response Format
Standard JSON-RPC 2.0 response:

\`\`\`json
{
  "jsonrpc": "2.0",
  "result": "0x10d4f",
  "id": 1
}
\`\`\`

### Error Response
\`\`\`json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32600,
    "message": "Invalid Request"
  },
  "id": 1
}
\`\`\`

## Common Methods

### 1. eth_blockNumber
Get the latest block number.

**Request:**
\`\`\`json
{
  "jsonrpc": "2.0",
  "method": "eth_blockNumber",
  "params": [],
  "id": 1
}
\`\`\`

**Response:**
\`\`\`json
{
  "jsonrpc": "2.0",
  "result": "0x10d4f",
  "id": 1
}
\`\`\`

### 2. eth_getBalance
Get the balance of an address.

**Request:**
\`\`\`json
{
  "jsonrpc": "2.0",
  "method": "eth_getBalance",
  "params": ["0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6", "latest"],
  "id": 1
}
\`\`\`

**Response:**
\`\`\`json
{
  "jsonrpc": "2.0",
  "result": "0x0",
  "id": 1
}
\`\`\`

### 3. eth_call
Execute a contract call.

**Request:**
\`\`\`json
{
  "jsonrpc": "2.0",
  "method": "eth_call",
  "params": [
    {
      "to": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
      "data": "0x70a08231000000000000000000000000742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
    },
    "latest"
  ],
  "id": 1
}
\`\`\`

### 4. eth_getTransactionCount
Get the nonce of an address.

**Request:**
\`\`\`json
{
  "jsonrpc": "2.0",
  "method": "eth_getTransactionCount",
  "params": ["0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6", "latest"],
  "id": 1
}
\`\`\`

### 5. eth_sendRawTransaction
Send a signed transaction.

**Request:**
\`\`\`json
{
  "jsonrpc": "2.0",
  "method": "eth_sendRawTransaction",
  "params": ["0xd46e8dd67c5d32be8d46e8dd67c5d32be8058bb8eb970870f072445675058bb8eb970870f072445675"],
  "id": 1
}
\`\`\`

### 6. eth_getTransactionReceipt
Get transaction receipt.

**Request:**
\`\`\`json
{
  "jsonrpc": "2.0",
  "method": "eth_getTransactionReceipt",
  "params": ["0x85d995eba9763907fdf35cd2034144dd9d53ce32cbec21349d4b12823c6860c5"],
  "id": 1
}
\`\`\`

### 7. eth_getBlockByNumber
Get block information.

**Request:**
\`\`\`json
{
  "jsonrpc": "2.0",
  "method": "eth_getBlockByNumber",
  "params": ["latest", false],
  "id": 1
}
\`\`\`

## Block Parameters
- **"latest"**: The most recent block
- **"earliest"**: The first block
- **"pending"**: Pending transactions
- **Hex string**: Specific block number (e.g., "0x10d4f")

## Error Codes
- **-32600**: Invalid Request
- **-32601**: Method not found
- **-32602**: Invalid params
- **-32603**: Internal error
- **-32000**: Server error
- **-32001**: Unsupported method

## Authentication
All requests require API Key authentication via the Authorization header.

## Rate Limits
Standard API rate limits apply. Monitor usage to avoid hitting limits.

## Best Practices
1. Always validate input parameters
2. Handle errors gracefully
3. Use appropriate block parameters
4. Cache responses when possible
5. Monitor transaction status after sending`;
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
      description: 'Supported blockchain chains for Web3 RPC calls'
    });
  }

  private async getJsonRpcMethodsReference(): Promise<string> {
    return `# JSON-RPC Methods Reference

## Core Methods

### Blockchain Information
- **eth_blockNumber**: Get the latest block number
- **eth_getBlockByNumber**: Get block information by number
- **eth_getBlockByHash**: Get block information by hash
- **eth_getBlockTransactionCountByNumber**: Get transaction count in block
- **eth_getBlockTransactionCountByHash**: Get transaction count in block by hash

### Account Information
- **eth_getBalance**: Get account balance
- **eth_getTransactionCount**: Get account nonce
- **eth_getCode**: Get contract bytecode

### Transaction Information
- **eth_getTransactionByHash**: Get transaction by hash
- **eth_getTransactionByBlockNumberAndIndex**: Get transaction by block and index
- **eth_getTransactionByBlockHashAndIndex**: Get transaction by block hash and index
- **eth_getTransactionReceipt**: Get transaction receipt
- **eth_getUncleByBlockNumberAndIndex**: Get uncle block by number and index
- **eth_getUncleByBlockHashAndIndex**: Get uncle block by hash and index
- **eth_getUncleCountByBlockNumber**: Get uncle count by block number
- **eth_getUncleCountByBlockHash**: Get uncle count by block hash

### Transaction Execution
- **eth_call**: Execute contract call
- **eth_estimateGas**: Estimate gas for transaction
- **eth_sendRawTransaction**: Send signed transaction
- **eth_sendTransaction**: Send transaction (requires unlocked account)

### State and Storage
- **eth_getStorageAt**: Get storage value at position
- **eth_getLogs**: Get event logs
- **eth_getProof**: Get Merkle proof for account

### Network Information
- **net_version**: Get network ID
- **net_listening**: Check if client is listening
- **net_peerCount**: Get peer count

### Mining Information
- **eth_mining**: Check if client is mining
- **eth_hashrate**: Get hash rate
- **eth_getWork**: Get work package
- **eth_submitWork**: Submit proof of work
- **eth_submitHashrate**: Submit hash rate

### Gas Information
- **eth_gasPrice**: Get current gas price
- **eth_maxPriorityFeePerGas**: Get max priority fee per gas
- **eth_feeHistory**: Get fee history

### Filter Methods
- **eth_newFilter**: Create new filter
- **eth_newBlockFilter**: Create new block filter
- **eth_newPendingTransactionFilter**: Create new pending transaction filter
- **eth_uninstallFilter**: Uninstall filter
- **eth_getFilterChanges**: Get filter changes
- **eth_getFilterLogs**: Get filter logs

### Subscription Methods (WebSocket only)
- **eth_subscribe**: Subscribe to events
- **eth_unsubscribe**: Unsubscribe from events

## Parameter Types

### Block Parameters
- **"latest"**: Most recent block
- **"earliest"**: First block
- **"pending"**: Pending transactions
- **Hex string**: Specific block number

### Address Parameters
- **20-byte hex**: Account or contract address
- **Must be 0x-prefixed**

### Data Parameters
- **Hex string**: Function call data
- **Must be 0x-prefixed**
- **4-byte function selector + parameters**

### Quantity Parameters
- **Hex string**: Numeric values
- **Must be 0x-prefixed**
- **No leading zeros**

## Common Error Codes
- **-32600**: Invalid Request
- **-32601**: Method not found
- **-32602**: Invalid params
- **-32603**: Internal error
- **-32000**: Server error
- **-32001**: Unsupported method
- **-32002**: Invalid input
- **-32003**: Resource not found
- **-32004**: Method not available
- **-32005**: Limit exceeded`;
  }

  private async analyzeBlockchainState(args: any): Promise<string> {
    const { chainId, address } = args;
    
    // Get latest block number
    const blockNumberResponse = await this.getBlockNumber({ chainId });
    const blockNumber = parseInt(blockNumberResponse.result, 16);
    
    let analysis = `Blockchain State Analysis for Chain ${chainId}:

Latest Block Number: ${blockNumber} (0x${blockNumber.toString(16)})
Current Block Height: ${blockNumber.toLocaleString()}`;

    if (address) {
      // Get balance if address is provided
      const balanceResponse = await this.getBalance({ chainId, address });
      const balanceWei = parseInt(balanceResponse.result, 16);
      const balanceEth = balanceWei / Math.pow(10, 18);
      
      // Get transaction count (nonce)
      const nonceResponse = await this.getTransactionCount({ chainId, address });
      const nonce = parseInt(nonceResponse.result, 16);
      
      analysis += `\n\nAddress Analysis for ${address}:
Balance: ${balanceWei.toLocaleString()} wei (${balanceEth.toFixed(6)} ETH)
Transaction Count (Nonce): ${nonce}`;
    }

    // Get latest block info
    const blockResponse = await this.getBlockByNumber({ 
      chainId, 
      blockNumber: 'latest',
      fullTransactionObjects: false
    });
    
    if (blockResponse.result) {
      const block = blockResponse.result;
      const timestamp = new Date(parseInt(block.timestamp, 16) * 1000);
      const gasUsed = parseInt(block.gasUsed, 16);
      const gasLimit = parseInt(block.gasLimit, 16);
      const gasUtilization = ((gasUsed / gasLimit) * 100).toFixed(2);
      
      analysis += `\n\nLatest Block Information:
Block Hash: ${block.hash}
Timestamp: ${timestamp.toISOString()}
Gas Used: ${gasUsed.toLocaleString()} / ${gasLimit.toLocaleString()} (${gasUtilization}%)
Transactions: ${block.transactions.length}`;
    }

    return analysis;
  }

  private async validateTransaction(args: any): Promise<string> {
    const { chainId, signedTransactionData } = args;
    
    // Basic validation
    if (!signedTransactionData.startsWith('0x')) {
      throw new Error('Transaction must be a hex string starting with 0x');
    }

    if (signedTransactionData.length < 10) {
      throw new Error('Transaction appears to be too short for a valid transaction');
    }

    let validation = `Transaction Validation for Chain ${chainId}:

Transaction Format: ✅ Valid hex format
Transaction Length: ${signedTransactionData.length} characters
Transaction Size: ${signedTransactionData.length - 2} hex characters (${Math.ceil((signedTransactionData.length - 2) / 2)} bytes)`;

    // Estimate transaction type based on length
    const txLength = signedTransactionData.length - 2; // Remove 0x prefix
    if (txLength === 130) {
      validation += `\nEstimated Type: Legacy transaction (EIP-155)`;
    } else if (txLength > 130) {
      validation += `\nEstimated Type: EIP-1559 transaction (with access list or other extensions)`;
    } else {
      validation += `\nEstimated Type: Unknown format`;
    }

    // Check if transaction is already on chain
    try {
      const receiptResponse = await this.getTransactionReceipt({ 
        chainId, 
        transactionHash: signedTransactionData 
      });
      
      if (receiptResponse.result) {
        validation += `\n\n⚠️  Transaction already exists on chain:
Block Number: ${parseInt(receiptResponse.result.blockNumber, 16)}
Status: ${receiptResponse.result.status === '0x1' ? 'Success' : 'Failed'}
Gas Used: ${parseInt(receiptResponse.result.gasUsed, 16).toLocaleString()}`;
      }
    } catch (error) {
      // Transaction not found, which is expected for new transactions
      validation += `\n\nTransaction Status: Not yet broadcasted`;
    }

    validation += `\n\nReady to send: Transaction appears valid for chain ${chainId}`;

    return validation;
  }
} 