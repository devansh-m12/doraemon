export interface TokenSearchRequest {
  chainId: number;
  query: string;
  limit?: number;
  ignoreListed?: string;
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
}

export interface AllTokensInfoResponse {
  tokens: TokenInfoResponse[];
}

export interface TokenListRequest {
  chainId: number;
  provider?: string;
}

export interface TokenListResponse {
  tokens: TokenInfoResponse[];
} 