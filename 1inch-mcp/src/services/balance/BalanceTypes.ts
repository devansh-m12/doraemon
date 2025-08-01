export interface AggregatedBalancesAndAllowancesRequest {
  chain: number;
  spender: string;
  wallets: string[];
  filterEmpty?: boolean;
}

export interface AggregatedBalancesAndAllowancesResponse {
  [walletAddress: string]: {
    [tokenAddress: string]: {
      balance: string;
      allowance: string;
    };
  };
}

export interface WalletBalancesRequest {
  chain: number;
  walletAddress: string;
}

export interface WalletBalancesResponse {
  [tokenAddress: string]: {
    balance: string;
    symbol?: string;
    name?: string;
    decimals?: number;
  };
}

export interface CustomTokensBalancesRequest {
  chain: number;
  walletAddress: string;
  customTokens: string[];
}

export interface CustomTokensBalancesResponse {
  [tokenAddress: string]: {
    balance: string;
    symbol?: string;
    name?: string;
    decimals?: number;
  };
}

export interface AggregatedCustomTokensBalancesRequest {
  chain: number;
  wallets: string[];
  customTokens: string[];
}

export interface AggregatedCustomTokensBalancesResponse {
  [walletAddress: string]: {
    [tokenAddress: string]: {
      balance: string;
      symbol?: string;
      name?: string;
      decimals?: number;
    };
  };
}

export interface BalancesAndAllowancesRequest {
  chain: number;
  spender: string;
  walletAddress: string;
}

export interface BalancesAndAllowancesResponse {
  [tokenAddress: string]: {
    balance: string;
    allowance: string;
    symbol?: string;
    name?: string;
    decimals?: number;
  };
}

export interface CustomTokensBalancesAndAllowancesRequest {
  chain: number;
  spender: string;
  walletAddress: string;
  customTokens: string[];
}

export interface CustomTokensBalancesAndAllowancesResponse {
  [tokenAddress: string]: {
    balance: string;
    allowance: string;
    symbol?: string;
    name?: string;
    decimals?: number;
  };
}

export interface AllowancesRequest {
  chain: number;
  spender: string;
  walletAddress: string;
}

export interface AllowancesResponse {
  [tokenAddress: string]: {
    allowance: string;
    symbol?: string;
    name?: string;
    decimals?: number;
  };
}

export interface CustomTokensAllowancesRequest {
  chain: number;
  spender: string;
  walletAddress: string;
  customTokens: string[];
}

export interface CustomTokensAllowancesResponse {
  [tokenAddress: string]: {
    allowance: string;
    symbol?: string;
    name?: string;
    decimals?: number;
  };
} 