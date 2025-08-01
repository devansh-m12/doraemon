export interface TokenInfoRequest {
  chainId: number;
  tokenAddress: string;
}

export interface TokenInfoResponse {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  tags?: string[];
}

export interface TokenSearchRequest {
  chainId: number;
  query: string;
  limit?: number;
}

export interface TokenSearchResponse {
  tokens: TokenInfoResponse[];
}

export interface TokenPriceRequest {
  chainId: number;
  tokenAddress: string;
  currency?: string;
}

export interface TokenPriceResponse {
  price: string;
  currency: string;
  timestamp: number;
}

export interface TokenBalanceRequest {
  chainId: number;
  address: string;
  tokens?: string[];
}

export interface TokenBalance {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  value: string;
  price: string;
}

export interface TokenBalanceResponse {
  tokens: TokenBalance[];
} 