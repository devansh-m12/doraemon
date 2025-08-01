import { BaseService, ServiceConfig, ToolDefinition, ResourceDefinition, PromptDefinition } from '../base/BaseService';
import {
  BroadcastPublicTransactionRequest,
  BroadcastPrivateTransactionRequest,
  BroadcastTransactionResponse,
  TransactionGatewayError
} from './TransactionGatewayTypes';

export class TransactionGatewayService extends BaseService {
  constructor(serviceConfig: ServiceConfig) {
    super(serviceConfig);
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'broadcast_public_transaction',
        description: 'Broadcast a public on-chain transaction to the specified chain',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID of the target network' },
            rawTransaction: { type: 'string', description: 'Raw hex string of the signed transaction' }
          },
          required: ['chain', 'rawTransaction']
        }
      },
      {
        name: 'broadcast_private_transaction',
        description: 'Broadcast a private transaction to Flashbots (Ethereum mainnet only)',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID (typically 1 for Ethereum mainnet)' },
            rawTransaction: { type: 'string', description: 'Raw hex string of the signed transaction' }
          },
          required: ['chain', 'rawTransaction']
        }
      }
    ];
  }

  getResources(): ResourceDefinition[] {
    return [
      {
        uri: '1inch://transaction-gateway/documentation',
        name: 'Transaction Gateway API Documentation',
        description: 'Complete documentation for 1inch Transaction Gateway API',
        mimeType: 'text/markdown'
      },
      {
        uri: '1inch://transaction-gateway/supported-chains',
        name: 'Supported Chains',
        description: 'List of supported blockchain chains for transaction broadcasting',
        mimeType: 'application/json'
      }
    ];
  }

  getPrompts(): PromptDefinition[] {
    return [
      {
        name: 'analyze_transaction',
        description: 'Analyze a transaction before broadcasting',
        arguments: [
          { name: 'chain', description: 'Chain ID', required: true },
          { name: 'rawTransaction', description: 'Raw transaction hex', required: true },
          { name: 'isPrivate', description: 'Whether to broadcast privately', required: false }
        ]
      }
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    switch (name) {
      case 'broadcast_public_transaction':
        return await this.broadcastPublicTransaction(args);
      case 'broadcast_private_transaction':
        return await this.broadcastPrivateTransaction(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  async handleResourceRead(uri: string): Promise<any> {
    switch (uri) {
      case '1inch://transaction-gateway/documentation':
        return await this.getTransactionGatewayDocumentation();
      case '1inch://transaction-gateway/supported-chains':
        return await this.getSupportedChains();
      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
  }

  async handlePromptRequest(name: string, args: any): Promise<any> {
    switch (name) {
      case 'analyze_transaction':
        return await this.analyzeTransaction(args);
      default:
        throw new Error(`Unknown prompt: ${name}`);
    }
  }

  async broadcastPublicTransaction(params: BroadcastPublicTransactionRequest): Promise<BroadcastTransactionResponse> {
    const url = `${this.baseUrl}/tx-gateway/v1.1/${params.chain}/broadcast`;
    const body = {
      rawTransaction: params.rawTransaction
    };

    try {
      const response = await this.makePostRequest<BroadcastTransactionResponse>(url, body);
      return response;
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error('Invalid transaction data. Please check the transaction encoding and ensure it is properly signed.');
      }
      throw error;
    }
  }

  async broadcastPrivateTransaction(params: BroadcastPrivateTransactionRequest): Promise<BroadcastTransactionResponse> {
    // Check if this is Ethereum mainnet (chain ID 1)
    if (params.chain !== 1) {
      throw new Error('Private transaction broadcasting (Flashbots) is only available on Ethereum mainnet (chain ID 1)');
    }

    const url = `${this.baseUrl}/tx-gateway/v1.1/${params.chain}/flashbots`;
    const body = {
      rawTransaction: params.rawTransaction
    };

    try {
      const response = await this.makePostRequest<BroadcastTransactionResponse>(url, body);
      return response;
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error('Invalid transaction data. Please check the transaction encoding and ensure it is properly signed.');
      }
      throw error;
    }
  }

  private async getTransactionGatewayDocumentation(): Promise<string> {
    return `# 1inch Transaction Gateway API Documentation

## Overview
The Transaction Gateway API provides secure and reliable transaction broadcasting services across multiple blockchain networks, including support for private transactions via Flashbots.

## Available Endpoints

### 1. POST /tx-gateway/v1.1/{chain}/broadcast
Broadcasts a public on-chain transaction to the specified blockchain network.

**Parameters:**
- chain (path): Chain ID of the target network
- rawTransaction (body): Raw hex string of the signed transaction

**Request Body:**
\`\`\`json
{
  "rawTransaction": "0x123..."  // Raw hex string of the transaction
}
\`\`\`

**Response (Success/200):**
\`\`\`json
{
  "transactionHash": "0xabc123..." // The hash of the broadcasted transaction
}
\`\`\`

**Error Response (400):**
- Invalid transaction data (check transaction encoding)

### 2. POST /tx-gateway/v1.1/{chain}/flashbots
Broadcasts a private transaction to the Ethereum Flashbots network (private mempool).

**Important:** This endpoint is only available for Ethereum mainnet (chain ID 1).

**Parameters:**
- chain (path): Chain ID (must be 1 for Ethereum mainnet)
- rawTransaction (body): Raw hex string of the signed transaction

**Request Body:**
\`\`\`json
{
  "rawTransaction": "0x123..."  // Raw hex string of the transaction
}
\`\`\`

**Response (Success/200):**
\`\`\`json
{
  "transactionHash": "0xdef456..." // The hash of the broadcasted private transaction
}
\`\`\`

**Error Response (400):**
- Invalid transaction data (check transaction encoding)

## Transaction Requirements

### Public Transactions
- Must be properly signed with the correct private key
- Must include valid nonce, gas price, and gas limit
- Must have sufficient balance for gas fees
- Raw transaction must be in hex format (0x-prefixed)

### Private Transactions (Flashbots)
- Only available on Ethereum mainnet
- Provides protection against front-running
- Transactions are not visible in the public mempool
- Useful for MEV protection and arbitrage transactions
- Must be properly signed and formatted

## Supported Chains

### Public Broadcasting
- Ethereum (1)
- Polygon (137)
- BSC (56)
- Arbitrum (42161)
- Optimism (10)
- Avalanche (43114)
- Base (8453)
- And many more...

### Private Broadcasting (Flashbots)
- Ethereum mainnet only (1)

## Authentication
All endpoints require API Key authentication via the Authorization header.

## Best Practices

### Transaction Preparation
1. Ensure the transaction is properly signed with the correct private key
2. Verify the nonce is correct for the sender address
3. Set appropriate gas price and gas limit
4. Ensure sufficient balance for transaction fees

### Error Handling
- Always validate transaction data before broadcasting
- Handle 400 errors for invalid transaction format
- Check transaction status after broadcasting
- Monitor for transaction confirmation on the blockchain

### Security Considerations
- Never expose private keys in API calls
- Use secure environments for transaction signing
- Validate all transaction parameters before broadcasting
- Consider using private transactions for sensitive operations

## Response Format
All endpoints return JSON responses with:
- transactionHash: The unique identifier of the broadcasted transaction
- Error responses include detailed error messages for debugging

## Rate Limits
- Standard API rate limits apply
- Consider transaction volume when planning broadcasts
- Monitor API usage to avoid hitting limits`;
  }

  private async getSupportedChains(): Promise<string> {
    return JSON.stringify({
      chains: [
        { id: 1, name: 'Ethereum', supportsPrivate: true },
        { id: 10, name: 'Optimism', supportsPrivate: false },
        { id: 56, name: 'BNB Smart Chain', supportsPrivate: false },
        { id: 137, name: 'Polygon', supportsPrivate: false },
        { id: 42161, name: 'Arbitrum One', supportsPrivate: false },
        { id: 43114, name: 'Avalanche C-Chain', supportsPrivate: false },
        { id: 8453, name: 'Base', supportsPrivate: false },
        { id: 250, name: 'Fantom Opera', supportsPrivate: false },
        { id: 1101, name: 'Polygon zkEVM', supportsPrivate: false },
        { id: 324, name: 'zkSync Era', supportsPrivate: false },
        { id: 59144, name: 'Linea', supportsPrivate: false },
        { id: 7777777, name: 'Zora', supportsPrivate: false },
        { id: 534352, name: 'Scroll', supportsPrivate: false },
        { id: 81457, name: 'Blast', supportsPrivate: false },
        { id: 424, name: 'PulseChain', supportsPrivate: false },
        { id: 369, name: 'PulseChain Testnet', supportsPrivate: false },
        { id: 11155420, name: 'Optimism Sepolia', supportsPrivate: false },
        { id: 80001, name: 'Mumbai', supportsPrivate: false },
        { id: 421614, name: 'Arbitrum Sepolia', supportsPrivate: false },
        { id: 43113, name: 'Fuji', supportsPrivate: false },
        { id: 84532, name: 'Base Sepolia', supportsPrivate: false },
        { id: 4002, name: 'Fantom Testnet', supportsPrivate: false },
        { id: 1442, name: 'Polygon zkEVM Testnet', supportsPrivate: false },
        { id: 280, name: 'zkSync Era Testnet', supportsPrivate: false },
        { id: 59140, name: 'Linea Testnet', supportsPrivate: false },
        { id: 999999999, name: 'Zora Testnet', supportsPrivate: false },
        { id: 534351, name: 'Scroll Sepolia', supportsPrivate: false },
        { id: 168587773, name: 'Blast Sepolia', supportsPrivate: false }
      ],
      description: 'Supported blockchain chains for transaction broadcasting. Only Ethereum mainnet supports private transactions via Flashbots.',
      note: 'Private transactions (Flashbots) are only available on Ethereum mainnet (chain ID 1)'
    });
  }

  private async analyzeTransaction(args: any): Promise<string> {
    const { chain, rawTransaction, isPrivate = false } = args;
    
    // Basic transaction validation
    if (!rawTransaction.startsWith('0x')) {
      throw new Error('Transaction must be a hex string starting with 0x');
    }

    if (rawTransaction.length < 10) {
      throw new Error('Transaction appears to be too short for a valid transaction');
    }

    let analysis = `Transaction Analysis:

Chain ID: ${chain}
Transaction Type: ${isPrivate ? 'Private (Flashbots)' : 'Public'}
Raw Transaction Length: ${rawTransaction.length} characters

Transaction Format: ✅ Valid hex format
`;

    // Check if private transaction is on supported chain
    if (isPrivate && chain !== 1) {
      analysis += `\n⚠️  Warning: Private transactions are only supported on Ethereum mainnet (chain ID 1)`;
    }

    // Basic transaction structure analysis
    const txLength = rawTransaction.length - 2; // Remove 0x prefix
    analysis += `\nTransaction Size: ${txLength} hex characters (${Math.ceil(txLength / 2)} bytes)`;

    // Estimate transaction type based on length
    if (txLength === 130) {
      analysis += `\nEstimated Type: Legacy transaction (EIP-155)`;
    } else if (txLength > 130) {
      analysis += `\nEstimated Type: EIP-1559 transaction (with access list or other extensions)`;
    } else {
      analysis += `\nEstimated Type: Unknown format`;
    }

    analysis += `\n\nReady to broadcast: ${isPrivate ? 'Private' : 'Public'} transaction to chain ${chain}`;

    return analysis;
  }
} 