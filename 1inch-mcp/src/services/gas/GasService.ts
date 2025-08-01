import { BaseService, ServiceConfig, ToolDefinition, ResourceDefinition, PromptDefinition } from '../base/BaseService';
import {
  GasPriceRequest,
  GasPriceResponse,
  GasPriceAnalysisRequest,
  GasPriceAnalysisResponse
} from './GasTypes';

export class GasService extends BaseService {
  constructor(serviceConfig: ServiceConfig) {
    super(serviceConfig);
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'get_gas_price',
        description: 'Get current gas price data for a specific blockchain chain',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID of the network' }
          },
          required: ['chain']
        }
      },
      {
        name: 'analyze_gas_price',
        description: 'Analyze gas prices and get recommendations for transaction priority',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID of the network' },
            priority: { 
              type: 'string', 
              enum: ['low', 'medium', 'high', 'instant'],
              description: 'Preferred priority level for gas price recommendation'
            }
          },
          required: ['chain']
        }
      }
    ];
  }

  getResources(): ResourceDefinition[] {
    return [
      {
        uri: '1inch://gas/documentation',
        name: 'Gas Price API Documentation',
        description: 'Complete documentation for 1inch Gas Price API',
        mimeType: 'text/markdown'
      },
      {
        uri: '1inch://gas/supported-chains',
        name: 'Supported Chains for Gas Price',
        description: 'List of supported blockchain chains for gas price queries',
        mimeType: 'application/json'
      }
    ];
  }

  getPrompts(): PromptDefinition[] {
    return [
      {
        name: 'get_gas_recommendation',
        description: 'Get gas price recommendation for optimal transaction speed and cost',
        arguments: [
          { name: 'chain', description: 'Chain ID', required: true },
          { name: 'priority', description: 'Transaction priority (low/medium/high/instant)', required: false }
        ]
      }
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    switch (name) {
      case 'get_gas_price':
        return await this.getGasPrice(args);
      case 'analyze_gas_price':
        return await this.analyzeGasPrice(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  async handleResourceRead(uri: string): Promise<any> {
    switch (uri) {
      case '1inch://gas/documentation':
        return await this.getGasDocumentation();
      case '1inch://gas/supported-chains':
        return await this.getSupportedChains();
      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
  }

  async handlePromptRequest(name: string, args: any): Promise<any> {
    switch (name) {
      case 'get_gas_recommendation':
        return await this.getGasRecommendation(args);
      default:
        throw new Error(`Unknown prompt: ${name}`);
    }
  }

  async getGasPrice(params: GasPriceRequest): Promise<GasPriceResponse> {
    const url = `${this.baseUrl}/gas-price/v1.6/${params.chain}`;
    const response = await this.makeRequest<GasPriceResponse>(url);
    return response;
  }

  async analyzeGasPrice(params: GasPriceAnalysisRequest): Promise<GasPriceAnalysisResponse> {
    const gasPrice = await this.getGasPrice({ chain: params.chain });
    
    // Determine recommended priority based on user preference or default to medium
    const priority = params.priority || 'medium';
    const recommended = gasPrice[priority];
    
    // Analyze network conditions based on base fee
    const baseFee = parseFloat(gasPrice.baseFee);
    let networkLoad: string;
    let estimatedTime: string;
    
    if (baseFee < 20) {
      networkLoad = 'Low';
      estimatedTime = '1-2 minutes';
    } else if (baseFee < 50) {
      networkLoad = 'Medium';
      estimatedTime = '2-5 minutes';
    } else if (baseFee < 100) {
      networkLoad = 'High';
      estimatedTime = '5-10 minutes';
    } else {
      networkLoad = 'Very High';
      estimatedTime = '10+ minutes';
    }

    return {
      chain: params.chain,
      baseFee: gasPrice.baseFee,
      recommended,
      allOptions: {
        low: gasPrice.low,
        medium: gasPrice.medium,
        high: gasPrice.high,
        instant: gasPrice.instant
      },
      analysis: {
        currentNetworkLoad: networkLoad,
        recommendedFor: this.getPriorityDescription(priority),
        estimatedConfirmationTime: estimatedTime
      }
    };
  }

  private getPriorityDescription(priority: string): string {
    switch (priority) {
      case 'low':
        return 'Cost optimization - slowest confirmation';
      case 'medium':
        return 'Balanced speed and cost';
      case 'high':
        return 'Faster confirmation - higher cost';
      case 'instant':
        return 'Fastest confirmation - highest cost';
      default:
        return 'Balanced speed and cost';
    }
  }

  private async getGasDocumentation(): Promise<string> {
    return `# 1inch Gas Price API Documentation

## Overview
The Gas Price API provides real-time, accurate gas price data across various blockchain networks. It supports EIP-1559 gas pricing model with different priority levels.

## Endpoints

### GET /gas-price/v1.6/{chain}
Returns current gas price data for a specific blockchain chain.

**Parameters:**
- chain (path): Chain ID of the network

**Response Format:**
\`\`\`json
{
  "baseFee": "string",
  "low": {
    "maxPriorityFeePerGas": "string",
    "maxFeePerGas": "string"
  },
  "medium": {
    "maxPriorityFeePerGas": "string",
    "maxFeePerGas": "string"
  },
  "high": {
    "maxPriorityFeePerGas": "string",
    "maxFeePerGas": "string"
  },
  "instant": {
    "maxPriorityFeePerGas": "string",
    "maxFeePerGas": "string"
  }
}
\`\`\`

## Gas Price Levels

### Low Priority
- **Use case**: Non-urgent transactions, cost optimization
- **Confirmation time**: 10-30 minutes
- **Cost**: Lowest gas fees

### Medium Priority
- **Use case**: Standard transactions, balanced approach
- **Confirmation time**: 2-5 minutes
- **Cost**: Moderate gas fees

### High Priority
- **Use case**: Time-sensitive transactions
- **Confirmation time**: 1-2 minutes
- **Cost**: Higher gas fees

### Instant Priority
- **Use case**: Critical transactions requiring immediate confirmation
- **Confirmation time**: < 1 minute
- **Cost**: Highest gas fees

## EIP-1559 Gas Model
The API returns gas prices in EIP-1559 format with two components:
- **maxPriorityFeePerGas**: Tip to validators (formerly gas tip)
- **maxFeePerGas**: Maximum total fee willing to pay (base fee + priority fee)

## Supported Networks
- Ethereum (1)
- Arbitrum One (42161)
- Avalanche C-Chain (43114)
- BNB Smart Chain (56)
- Gnosis (100)
- Optimism (10)
- Polygon (137)
- zkSync Era (324)
- Base (8453)
- And many more...

## Authentication
All endpoints require API Key authentication via header.`;
  }

  private async getSupportedChains(): Promise<string> {
    return JSON.stringify({
      chains: [
        { id: 1, name: 'Ethereum', supportsEip1559: true },
        { id: 10, name: 'Optimism', supportsEip1559: true },
        { id: 56, name: 'BNB Smart Chain', supportsEip1559: false },
        { id: 137, name: 'Polygon', supportsEip1559: true },
        { id: 42161, name: 'Arbitrum One', supportsEip1559: true },
        { id: 43114, name: 'Avalanche C-Chain', supportsEip1559: true },
        { id: 8453, name: 'Base', supportsEip1559: true },
        { id: 100, name: 'Gnosis', supportsEip1559: true },
        { id: 324, name: 'zkSync Era', supportsEip1559: true },
        { id: 7565164, name: 'Solana', supportsEip1559: false },
        { id: 250, name: 'Fantom Opera', supportsEip1559: false },
        { id: 1101, name: 'Polygon zkEVM', supportsEip1559: true },
        { id: 59144, name: 'Linea', supportsEip1559: true },
        { id: 7777777, name: 'Zora', supportsEip1559: true },
        { id: 534352, name: 'Scroll', supportsEip1559: true },
        { id: 81457, name: 'Blast', supportsEip1559: true },
        { id: 424, name: 'PulseChain', supportsEip1559: false },
        { id: 11155420, name: 'Optimism Sepolia', supportsEip1559: true },
        { id: 80001, name: 'Mumbai', supportsEip1559: true },
        { id: 421614, name: 'Arbitrum Sepolia', supportsEip1559: true },
        { id: 43113, name: 'Fuji', supportsEip1559: true },
        { id: 84532, name: 'Base Sepolia', supportsEip1559: true },
        { id: 4002, name: 'Fantom Testnet', supportsEip1559: false },
        { id: 1442, name: 'Polygon zkEVM Testnet', supportsEip1559: true },
        { id: 280, name: 'zkSync Era Testnet', supportsEip1559: true },
        { id: 59140, name: 'Linea Testnet', supportsEip1559: true },
        { id: 999999999, name: 'Zora Testnet', supportsEip1559: true },
        { id: 534351, name: 'Scroll Sepolia', supportsEip1559: true },
        { id: 168587773, name: 'Blast Sepolia', supportsEip1559: true }
      ],
      description: 'Supported blockchain chains for gas price queries with EIP-1559 support status'
    });
  }

  private async getGasRecommendation(args: any): Promise<string> {
    const { chain, priority = 'medium' } = args;
    
    const analysis = await this.analyzeGasPrice({ chain, priority });
    
    return `Gas Price Recommendation for Chain ${chain}:

Network Load: ${analysis.analysis.currentNetworkLoad}
Base Fee: ${analysis.baseFee} wei

Recommended Gas Price (${priority.toUpperCase()} priority):
- Max Priority Fee: ${analysis.recommended.maxPriorityFeePerGas} wei
- Max Fee Per Gas: ${analysis.recommended.maxFeePerGas} wei
- Estimated Confirmation Time: ${analysis.analysis.estimatedConfirmationTime}
- Best for: ${analysis.analysis.recommendedFor}

All Available Options:
- LOW: ${analysis.allOptions.low.maxFeePerGas} wei (slowest, cheapest)
- MEDIUM: ${analysis.allOptions.medium.maxFeePerGas} wei (balanced)
- HIGH: ${analysis.allOptions.high.maxFeePerGas} wei (faster, costlier)
- INSTANT: ${analysis.allOptions.instant.maxFeePerGas} wei (fastest, most expensive)`;
  }
} 