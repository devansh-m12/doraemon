// Request Types
export interface QuoteRequest {
  chain: number;
  src: string;
  dst: string;
  amount: string;
  protocols?: string;
  fee?: number;
  gasPrice?: string;
  complexityLevel?: number;
  parts?: number;
  mainRouteParts?: number;
  gasLimit?: number;
  connectorTokens?: string;
  excludedProtocols?: string;
  includeTokensInfo?: boolean;
  includeProtocols?: boolean;
  includeGas?: boolean;
}

export interface SwapRequest extends QuoteRequest {
  from: string;
  origin: string;
  slippage: number;
  disableEstimate?: boolean;
  allowPartialFill?: boolean;
  permit?: string;
  receiver?: string;
  referrer?: string;
  compatibility?: boolean;
  usePermit2?: boolean;
}

export interface RouterRequest {
  chain: number;
}

export interface ApproveTransactionRequest {
  chain: number;
  tokenAddress: string;
  amount?: string;
}

export interface AllowanceRequest {
  chain: number;
  tokenAddress: string;
  walletAddress: string;
}

export interface LiquiditySourcesRequest {
  chain: number;
}

export interface TokensRequest {
  chain: number;
}

// Response Types
export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  tags?: string[];
}

export interface ProtocolInfo {
  name: string;
  part: number;
  fromTokenAddress: string;
  toTokenAddress: string;
}

export interface QuoteResponse {
  srcToken: TokenInfo;
  dstToken: TokenInfo;
  srcAmount: string;
  dstAmount: string;
  protocols: ProtocolInfo[][];
  gasCost: string;
  gasCostUsd: string;
  allowanceTarget: string;
  routerAddress: string;
  tokensInfo?: Record<string, TokenInfo>;
  protocolsInfo?: Record<string, any>;
  gas?: {
    gasPrice: string;
    gasLimit: string;
  };
}

export interface SwapResponse {
  tx: {
    to: string;
    data: string;
    value: string;
    gas: string;
    gasPrice: string;
    gasLimit: string;
  };
  srcToken: TokenInfo;
  dstToken: TokenInfo;
  srcAmount: string;
  dstAmount: string;
  protocols: ProtocolInfo[][];
  allowanceTarget: string;
  routerAddress: string;
}

export interface RouterResponse {
  address: string;
}

export interface ApproveTransactionResponse {
  to: string;
  data: string;
  value: string;
  gas?: string;
}

export interface AllowanceResponse {
  allowance: string;
}

export interface LiquiditySourcesResponse {
  protocols: Array<{
    id: string;
    title: string;
    img: string;
    img_color: string;
  }>;
}

export interface TokensResponse {
  tokens: Record<string, TokenInfo>;
} 