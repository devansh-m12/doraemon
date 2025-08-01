export interface TokenSearchRequest {
  chainId: number;
  query: string;
  limit?: number;
}

export interface TokenSearchResponse {
  tokens: TokenInfoResponse[];
}

export interface TokenInfoResponse {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  tags?: string[];
} 