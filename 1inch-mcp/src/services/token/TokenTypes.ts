export interface TokenSearchRequest {
  chainId: number;
  query: string;
  limit?: number;
  provider?: string;
  country?: string;
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

export interface TokenInfoRequest {
  chainId: number;
  addresses: string[];
}

export interface TokenInfoMapResponse {
  [address: string]: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    logoURI?: string;
    tags?: string[];
  };
}

export interface AllTokensInfoRequest {
  chainId: number;
  provider?: string;
  country?: string;
}

export interface AllTokensInfoResponse {
  tokens: TokenInfoResponse[];
}

export interface TokenListRequest {
  chainId: number;
  provider?: string;
  country?: string;
}

export interface TokenListResponse {
  tokens: TokenInfoResponse[];
}

// New type definitions for v1.3 API endpoints
export interface MultiChainTokensRequest {
  provider?: string;
  country?: string;
}

export interface MultiChainTokensResponse {
  [chainId: string]: {
    [address: string]: TokenInfoResponse;
  };
}

export interface SupportedChainsResponse {
  chains: number[];
}

export interface TokenCustomRequest {
  chainId: number;
  addresses: string;
  provider?: string;
  country?: string;
}

export interface TokenCustomResponse {
  tokens: TokenInfoResponse[];
} 