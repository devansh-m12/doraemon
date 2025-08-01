import { BaseService, ServiceConfig, ToolDefinition, ResourceDefinition, PromptDefinition } from '../base/BaseService';
import {
  QuoteRequest,
  QuoteResponse,
  SwapRequest,
  SwapResponse,
  RouterRequest,
  RouterResponse,
  ApproveTransactionRequest,
  ApproveTransactionResponse,
  AllowanceRequest,
  AllowanceResponse,
  LiquiditySourcesRequest,
  LiquiditySourcesResponse,
  TokensRequest,
  TokensResponse
} from './SwapTypes';

export class SwapService extends BaseService {
  constructor(serviceConfig: ServiceConfig) {
    super(serviceConfig);
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'get_quote',
        description: 'Find the best quote to swap with 1inch Router',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID of the network' },
            src: { type: 'string', description: 'Source token address' },
            dst: { type: 'string', description: 'Destination token address' },
            amount: { type: 'string', description: 'Amount to swap (in token smallest units)' },
            protocols: { type: 'string', description: 'Filter by supported liquidity sources' },
            fee: { type: 'number', description: 'Partner fee (0-3)' },
            gasPrice: { type: 'string', description: 'Gas price in wei' },
            complexityLevel: { type: 'number', description: 'Complexity level for routing' },
            parts: { type: 'number', description: 'Number of parts for split' },
            mainRouteParts: { type: 'number', description: 'Number of main route parts' },
            gasLimit: { type: 'number', description: 'Gas limit' },
            connectorTokens: { type: 'string', description: 'Connector tokens' },
            excludedProtocols: { type: 'string', description: 'Excluded protocols' },
            includeTokensInfo: { type: 'boolean', description: 'Include tokens info in response' },
            includeProtocols: { type: 'boolean', description: 'Include protocols info in response' },
            includeGas: { type: 'boolean', description: 'Include gas info in response' }
          },
          required: ['chain', 'src', 'dst', 'amount']
        }
      },
      {
        name: 'get_swap',
        description: 'Generate calldata to swap on 1inch Router',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID of the network' },
            src: { type: 'string', description: 'Source token address' },
            dst: { type: 'string', description: 'Destination token address' },
            amount: { type: 'string', description: 'Amount to swap (in token smallest units)' },
            from: { type: 'string', description: 'Wallet address initiating the swap' },
            origin: { type: 'string', description: 'Origin address for the swap' },
            slippage: { type: 'number', description: 'Allowed slippage in percentage (e.g. 1 means 1%)' },
            protocols: { type: 'string', description: 'Filter by supported liquidity sources' },
            fee: { type: 'number', description: 'Partner fee (0-3)' },
            gasPrice: { type: 'string', description: 'Gas price in wei' },
            complexityLevel: { type: 'number', description: 'Complexity level for routing' },
            parts: { type: 'number', description: 'Number of parts for split' },
            mainRouteParts: { type: 'number', description: 'Number of main route parts' },
            gasLimit: { type: 'number', description: 'Gas limit' },
            connectorTokens: { type: 'string', description: 'Connector tokens' },
            excludedProtocols: { type: 'string', description: 'Excluded protocols' },
            includeTokensInfo: { type: 'boolean', description: 'Include tokens info in response' },
            includeProtocols: { type: 'boolean', description: 'Include protocols info in response' },
            includeGas: { type: 'boolean', description: 'Include gas info in response' },
            disableEstimate: { type: 'boolean', description: 'Disable estimate' },
            allowPartialFill: { type: 'boolean', description: 'Allow partial fill' },
            permit: { type: 'string', description: 'Permit data' },
            receiver: { type: 'string', description: 'Receiver address' },
            referrer: { type: 'string', description: 'Referrer address' },
            compatibility: { type: 'boolean', description: 'Compatibility mode' },
            usePermit2: { type: 'boolean', description: 'Use Permit2' }
          },
          required: ['chain', 'src', 'dst', 'amount', 'from', 'origin', 'slippage']
        }
      },
      {
        name: 'get_router',
        description: 'Get address of the 1inch Router',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID of the network' }
          },
          required: ['chain']
        }
      },
      {
        name: 'get_approve_transaction',
        description: 'Generate approve calldata',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID of the network' },
            tokenAddress: { type: 'string', description: 'Token address to approve' },
            amount: { type: 'string', description: 'Max approval amount' }
          },
          required: ['chain', 'tokenAddress']
        }
      },
      {
        name: 'get_allowance',
        description: 'Get approved token allowance',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID of the network' },
            tokenAddress: { type: 'string', description: 'Token address' },
            walletAddress: { type: 'string', description: 'Wallet address' }
          },
          required: ['chain', 'tokenAddress', 'walletAddress']
        }
      },
      {
        name: 'get_liquidity_sources',
        description: 'Get list of available liquidity sources',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID of the network' }
          },
          required: ['chain']
        }
      },
      {
        name: 'get_tokens',
        description: 'Get list of available tokens',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID of the network' }
          },
          required: ['chain']
        }
      },
      {
        name: 'get_spender',
        description: 'Get address of the spender contract',
        inputSchema: {
          type: 'object',
          properties: {
            chain: { type: 'number', description: 'Chain ID of the network' }
          },
          required: ['chain']
        }
      }
    ];
  }

  getResources(): ResourceDefinition[] {
    return [
      {
        uri: '1inch://swap/documentation',
        name: 'Swap API Documentation',
        description: 'Complete documentation for 1inch Classic Swap API',
        mimeType: 'text/markdown'
      },
      {
        uri: '1inch://swap/supported-chains',
        name: 'Supported Chains',
        description: 'List of supported blockchain chains for swap operations',
        mimeType: 'application/json'
      },
      {
        uri: '1inch://swap/common-tokens',
        name: 'Common Tokens',
        description: 'List of commonly used tokens for swapping',
        mimeType: 'application/json'
      }
    ];
  }

  getPrompts(): PromptDefinition[] {
    return [
      {
        name: 'analyze_swap_quote',
        description: 'Analyze swap quote and provide detailed breakdown',
        arguments: [
          { name: 'chain', description: 'Chain ID', required: true },
          { name: 'src', description: 'Source token address', required: true },
          { name: 'dst', description: 'Destination token address', required: true },
          { name: 'amount', description: 'Amount to swap', required: true }
        ]
      },
      {
        name: 'prepare_swap_transaction',
        description: 'Prepare complete swap transaction with approval if needed',
        arguments: [
          { name: 'chain', description: 'Chain ID', required: true },
          { name: 'src', description: 'Source token address', required: true },
          { name: 'dst', description: 'Destination token address', required: true },
          { name: 'amount', description: 'Amount to swap', required: true },
          { name: 'from', description: 'Wallet address', required: true },
          { name: 'origin', description: 'Origin address', required: true },
          { name: 'slippage', description: 'Slippage tolerance', required: true }
        ]
      }
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    switch (name) {
      case 'get_quote':
        return await this.getQuote(args);
      case 'get_swap':
        return await this.getSwap(args);
      case 'get_router':
        return await this.getRouter(args);
      case 'get_approve_transaction':
        return await this.getApproveTransaction(args);
      case 'get_allowance':
        return await this.getAllowance(args);
      case 'get_liquidity_sources':
        return await this.getLiquiditySources(args);
      case 'get_tokens':
        return await this.getTokens(args);
      case 'get_spender':
        return await this.getSpender(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  async handleResourceRead(uri: string): Promise<any> {
    switch (uri) {
      case '1inch://swap/documentation':
        return await this.getSwapDocumentation();
      case '1inch://swap/supported-chains':
        return await this.getSupportedChains();
      case '1inch://swap/common-tokens':
        return await this.getCommonTokens();
      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
  }

  async handlePromptRequest(name: string, args: any): Promise<any> {
    switch (name) {
      case 'analyze_swap_quote':
        return await this.analyzeSwapQuote(args);
      case 'prepare_swap_transaction':
        return await this.prepareSwapTransaction(args);
      default:
        throw new Error(`Unknown prompt: ${name}`);
    }
  }

  async getQuote(params: QuoteRequest): Promise<QuoteResponse> {
    const url = `${this.baseUrl}/swap/v6.1/${params.chain}/quote`;
    const queryParams = new URLSearchParams();
    
    queryParams.append('src', params.src);
    queryParams.append('dst', params.dst);
    queryParams.append('amount', params.amount);
    
    if (params.protocols) queryParams.append('protocols', params.protocols);
    if (params.fee !== undefined) queryParams.append('fee', params.fee.toString());
    if (params.gasPrice) queryParams.append('gasPrice', params.gasPrice);
    if (params.complexityLevel !== undefined) queryParams.append('complexityLevel', params.complexityLevel.toString());
    if (params.parts !== undefined) queryParams.append('parts', params.parts.toString());
    if (params.mainRouteParts !== undefined) queryParams.append('mainRouteParts', params.mainRouteParts.toString());
    if (params.gasLimit !== undefined) queryParams.append('gasLimit', params.gasLimit.toString());
    if (params.connectorTokens) queryParams.append('connectorTokens', params.connectorTokens);
    if (params.excludedProtocols) queryParams.append('excludedProtocols', params.excludedProtocols);
    if (params.includeTokensInfo !== undefined) queryParams.append('includeTokensInfo', params.includeTokensInfo.toString());
    if (params.includeProtocols !== undefined) queryParams.append('includeProtocols', params.includeProtocols.toString());
    if (params.includeGas !== undefined) queryParams.append('includeGas', params.includeGas.toString());

    const response = await this.makeRequest<QuoteResponse>(`${url}?${queryParams.toString()}`);
    return response;
  }

  async getSwap(params: SwapRequest): Promise<SwapResponse> {
    const url = `${this.baseUrl}/swap/v6.1/${params.chain}/swap`;
    const queryParams = new URLSearchParams();
    
    queryParams.append('src', params.src);
    queryParams.append('dst', params.dst);
    queryParams.append('amount', params.amount);
    queryParams.append('from', params.from);
    queryParams.append('origin', params.origin);
    queryParams.append('slippage', params.slippage.toString());
    
    if (params.protocols) queryParams.append('protocols', params.protocols);
    if (params.fee !== undefined) queryParams.append('fee', params.fee.toString());
    if (params.gasPrice) queryParams.append('gasPrice', params.gasPrice);
    if (params.complexityLevel !== undefined) queryParams.append('complexityLevel', params.complexityLevel.toString());
    if (params.parts !== undefined) queryParams.append('parts', params.parts.toString());
    if (params.mainRouteParts !== undefined) queryParams.append('mainRouteParts', params.mainRouteParts.toString());
    if (params.gasLimit !== undefined) queryParams.append('gasLimit', params.gasLimit.toString());
    if (params.connectorTokens) queryParams.append('connectorTokens', params.connectorTokens);
    if (params.excludedProtocols) queryParams.append('excludedProtocols', params.excludedProtocols);
    if (params.includeTokensInfo !== undefined) queryParams.append('includeTokensInfo', params.includeTokensInfo.toString());
    if (params.includeProtocols !== undefined) queryParams.append('includeProtocols', params.includeProtocols.toString());
    if (params.includeGas !== undefined) queryParams.append('includeGas', params.includeGas.toString());
    if (params.disableEstimate !== undefined) queryParams.append('disableEstimate', params.disableEstimate.toString());
    if (params.allowPartialFill !== undefined) queryParams.append('allowPartialFill', params.allowPartialFill.toString());
    if (params.permit) queryParams.append('permit', params.permit);
    if (params.receiver) queryParams.append('receiver', params.receiver);
    if (params.referrer) queryParams.append('referrer', params.referrer);
    if (params.compatibility !== undefined) queryParams.append('compatibility', params.compatibility.toString());
    if (params.usePermit2 !== undefined) queryParams.append('usePermit2', params.usePermit2.toString());

    const response = await this.makeRequest<SwapResponse>(`${url}?${queryParams.toString()}`);
    return response;
  }

  async getRouter(params: RouterRequest): Promise<RouterResponse> {
    const url = `${this.baseUrl}/swap/v6.1/${params.chain}/router`;
    const response = await this.makeRequest<RouterResponse>(url);
    return response;
  }

  async getApproveTransaction(params: ApproveTransactionRequest): Promise<ApproveTransactionResponse> {
    const url = `${this.baseUrl}/swap/v6.1/${params.chain}/approve/transaction`;
    const queryParams = new URLSearchParams();
    
    queryParams.append('tokenAddress', params.tokenAddress);
    if (params.amount) queryParams.append('amount', params.amount);

    const response = await this.makeRequest<ApproveTransactionResponse>(`${url}?${queryParams.toString()}`);
    return response;
  }

  async getAllowance(params: AllowanceRequest): Promise<AllowanceResponse> {
    const url = `${this.baseUrl}/swap/v6.1/${params.chain}/approve/allowance`;
    const queryParams = new URLSearchParams();
    
    queryParams.append('tokenAddress', params.tokenAddress);
    queryParams.append('walletAddress', params.walletAddress);

    const response = await this.makeRequest<AllowanceResponse>(`${url}?${queryParams.toString()}`);
    return response;
  }

  async getLiquiditySources(params: LiquiditySourcesRequest): Promise<LiquiditySourcesResponse> {
    const url = `${this.baseUrl}/swap/v6.1/${params.chain}/liquidity-sources`;
    const response = await this.makeRequest<LiquiditySourcesResponse>(url);
    return response;
  }

  async getTokens(params: TokensRequest): Promise<TokensResponse> {
    const url = `${this.baseUrl}/swap/v6.1/${params.chain}/tokens`;
    const response = await this.makeRequest<TokensResponse>(url);
    return response;
  }

  async getSpender(params: { chain: number }): Promise<{ address: string }> {
    const url = `${this.baseUrl}/swap/v6.1/${params.chain}/approve/spender`;
    const response = await this.makeRequest<{ address: string }>(url);
    return response;
  }

  private async getSwapDocumentation(): Promise<string> {
    return `# 1inch Classic Swap API Documentation

## Overview
The Classic Swap API provides comprehensive token swapping functionality across multiple blockchain networks with optimal routing and best execution.

## Endpoints

### 1. GET /swap/v6.1/{chain}/quote
Find the best quote to swap with 1inch Router.

**Parameters:**
- chain (path): Chain ID
- src (query): Source token address
- dst (query): Destination token address
- amount (query): Amount to swap (in token smallest units)
- protocols (query, optional): Filter by supported liquidity sources
- fee (query, optional): Partner fee (0-3)
- gasPrice (query, optional): Gas price in wei
- complexityLevel, parts, mainRouteParts, gasLimit, connectorTokens, excludedProtocols (optional)
- includeTokensInfo, includeProtocols, includeGas (boolean, optional)

**Response:**
- srcToken, dstToken: Token information
- srcAmount, dstAmount: Swap amounts
- protocols: Execution route details
- gasCost, gasCostUsd: Gas estimation
- allowanceTarget, routerAddress: Contract addresses

### 2. GET /swap/v6.1/{chain}/swap
Generate calldata to swap on 1inch Router.

**Parameters:**
- All quote parameters plus:
- from (query): Wallet address initiating the swap
- slippage (query): Allowed slippage in percentage
- disableEstimate, allowPartialFill (boolean, optional)

**Response:**
- tx: Transaction call data (to, data, value, gas, etc.)
- Plus standard swap details

### 3. GET /swap/v6.1/{chain}/router
Get address of the 1inch Router.

**Parameters:**
- chain (path): Chain ID

**Response:**
- address: Router contract address

### 4. GET /swap/v6.1/{chain}/approve/spender
Get address of the spender contract.

**Parameters:**
- chain (path): Chain ID

**Response:**
- address: Spender contract address

### 5. GET /swap/v6.1/{chain}/approve/transaction
Generate approve calldata.

**Parameters:**
- chain (path): Chain ID
- tokenAddress (query): Token to approve
- amount (query, optional): Max approval amount

**Response:**
- to, data, value, gas: Transaction data

### 6. GET /swap/v6.1/{chain}/approve/allowance
Get approved token allowance.

**Parameters:**
- chain (path): Chain ID
- tokenAddress (query): Token address
- walletAddress (query): Wallet address

**Response:**
- allowance: Approved amount

### 7. GET /swap/v6.1/{chain}/liquidity-sources
Get list of available liquidity sources.

**Parameters:**
- chain (path): Chain ID

**Response:**
- protocols: Array of available protocols

### 8. GET /swap/v6.1/{chain}/tokens
Get list of available tokens.

**Parameters:**
- chain (path): Chain ID

**Response:**
- tokens: Object with token addresses as keys and token info as values

## Authentication
All endpoints require API Key authentication via Authorization header.

## Error Handling
All endpoints return standardized error responses with:
- error: Error code
- description: Error description
- statusCode: HTTP status code
- requestId: Request identifier
- meta: Additional error metadata`;
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
      description: 'Supported blockchain chains for swap operations'
    });
  }

  private async getCommonTokens(): Promise<string> {
    return JSON.stringify({
      tokens: {
        '0x111111111117dC0aa78b770fA6A738034120C302': {
          address: '0x111111111117dC0aa78b770fA6A738034120C302',
          symbol: '1INCH',
          name: '1inch Network',
          decimals: 18
        },
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          symbol: 'WETH',
          name: 'Wrapped Ether',
          decimals: 18
        },
        '0xdAC17F958D2ee523a2206206994597C13D831ec7': {
          address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          symbol: 'USDT',
          name: 'Tether USD',
          decimals: 6
        },
        '0xA0b86a33E6441b8c4C8C1C1B0B82B2Dc3F82eB6': {
          address: '0xA0b86a33E6441b8c4C8C1C1B0B82B2Dc3F82eB6',
          symbol: 'USDC',
          name: 'USD Coin',
          decimals: 6
        },
        '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599': {
          address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
          symbol: 'WBTC',
          name: 'Wrapped Bitcoin',
          decimals: 8
        }
      },
      description: 'Common tokens used for swapping on Ethereum mainnet'
    });
  }

  private async analyzeSwapQuote(args: any): Promise<string> {
    const { chain, src, dst, amount } = args;
    
    const quote = await this.getQuote({ chain, src, dst, amount });
    
    let analysis = `Swap Quote Analysis:
    
Source Token: ${quote.srcToken.symbol} (${quote.srcToken.name})
Destination Token: ${quote.dstToken.symbol} (${quote.dstToken.name})

Amounts:
- Input: ${quote.srcAmount} ${quote.srcToken.symbol}
- Output: ${quote.dstAmount} ${quote.dstToken.symbol}

Gas Information:
- Gas Cost: ${quote.gasCost} wei
- Gas Cost USD: $${quote.gasCostUsd}

Route Information:
- Number of Protocols: ${quote.protocols.length}
- Router Address: ${quote.routerAddress}
- Allowance Target: ${quote.allowanceTarget}

Protocol Route:`;
    
    quote.protocols.forEach((protocolGroup, index) => {
      analysis += `\nStep ${index + 1}:`;
      protocolGroup.forEach(protocol => {
        analysis += `\n  - ${protocol.name} (${protocol.part}%)`;
      });
    });

    return analysis;
  }

  private async prepareSwapTransaction(args: any): Promise<string> {
    const { chain, src, dst, amount, from, origin, slippage } = args;
    
    // Get swap transaction data
    const swapData = await this.getSwap({ chain, src, dst, amount, from, origin, slippage });
    
    // Check if approval is needed
    const allowance = await this.getAllowance({ chain, tokenAddress: src, walletAddress: from });
    const approveData = await this.getApproveTransaction({ chain, tokenAddress: src });
    
    let preparation = `Swap Transaction Preparation:

Transaction Data:
- To: ${swapData.tx.to}
- Value: ${swapData.tx.value} wei
- Gas Limit: ${swapData.tx.gasLimit}
- Gas Price: ${swapData.tx.gasPrice}

Token Information:
- Source: ${swapData.srcToken.symbol} (${swapData.srcAmount})
- Destination: ${swapData.dstToken.symbol} (${swapData.dstAmount})

Route: ${swapData.protocols.length} protocol steps

Allowance Check:
- Current Allowance: ${allowance.allowance}
- Required Amount: ${swapData.srcAmount}`;

    if (BigInt(allowance.allowance) < BigInt(swapData.srcAmount)) {
      preparation += `

APPROVAL REQUIRED:
- Approval To: ${approveData.to}
- Approval Data: ${approveData.data}
- Approval Value: ${approveData.value} wei`;
    } else {
      preparation += `

No approval needed - sufficient allowance exists.`;
    }

    return preparation;
  }
} 