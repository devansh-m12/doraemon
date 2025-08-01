export interface SwapQuoteRequest {
  chainId: number;
  src: string;
  dst: string;
  amount: string;
  from: string;
  slippage?: number;
  disableEstimate?: boolean;
}

export interface SwapQuoteResponse {
  toTokenAmount: string;
  fromTokenAmount: string;
  protocols: any[];
  tx: {
    from: string;
    to: string;
    data: string;
    value: string;
    gas: number;
    gasPrice: string;
  };
}

export interface TokenAllowanceRequest {
  chainId: number;
  tokenAddress: string;
  walletAddress: string;
}

export interface TokenAllowanceResponse {
  allowance: string;
  tokenAddress: string;
  walletAddress: string;
}

export interface ApproveTransactionRequest {
  chainId: number;
  tokenAddress: string;
  amount?: string;
}

export interface ApproveTransactionResponse {
  data: string;
  to: string;
  value: string;
  gas: number;
  gasPrice: string;
} 