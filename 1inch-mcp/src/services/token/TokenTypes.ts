export interface TokenSearchRequest {
  chainId: number;
  query: string;
  ignore_listed?: boolean;
  only_positive_rating?: boolean;
  limit?: number;
  country?: object;
}

export interface TokenSearchResponse {
  // Array of TokenDto objects
  [key: number]: TokenDto;
}

export interface TokenDto {
  chainId: number;
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoURI?: string;
  rating?: number;
  eip2612?: boolean;
  isFoT?: boolean;
  tags?: TagDto[];
  providers?: string[];
}

export interface TagDto {
  name: string;
  description?: string;
}

export interface TokenInfoRequest {
  chainId: number;
  addresses: string[];
}

export interface TokenInfoMapResponse {
  [address: string]: ProviderTokenDto;
}

export interface ProviderTokenDto {
  chainId: number;
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logo?: string;
  tags?: string[];
  providers?: string[];
}

export interface AllTokensInfoRequest {
  chainId: number;
  provider?: string;
  country?: string;
}

export interface AllTokensInfoResponse {
  // Map of token address to ProviderTokenDto
  [address: string]: ProviderTokenDto;
}

export interface TokenListRequest {
  chainId: number;
  provider?: string;
  country?: string;
}

export interface TokenListResponse {
  keywords: string[];
  logoURI: string;
  name: string;
  tags: object;
  tags_order: string[];
  timestamp: string;
  tokens: TokenInfoDto[];
  version: {
    major: number;
    minor: number;
    patch: number;
  };
}

export interface TokenInfoDto {
  address: string;
  chainId: number;
  decimals: number;
  extensions?: object;
  logoURI?: string;
  name: string;
  symbol: string;
  tags?: string[];
}

// Multi-chain endpoints
export interface MultiChainTokensRequest {
  provider?: string;
  country?: string;
}

export interface MultiChainTokensResponse {
  // Map of chainId to map of token address to token info
  [chainId: string]: {
    [address: string]: ProviderTokenDto;
  };
}

export interface SupportedChainsResponse {
  // Array of chain IDs
  [key: number]: number;
}

export interface TokenCustomRequest {
  chainId: number;
  addresses: string;
  provider?: string;
  country?: string;
}

export interface TokenCustomResponse {
  // Map of address to TokenInfoDto
  [address: string]: TokenInfoDto;
}

export interface SingleTokenRequest {
  chainId: number;
  address: string;
  provider?: string;
  country?: string;
}

export interface SingleTokenResponse {
  chainId: number;
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logo?: string;
  rating?: number;
  tags?: string[];
  providers?: string[];
}

export interface MultiChainSearchRequest {
  query: string;
  ignore_listed?: boolean;
  only_positive_rating?: boolean;
  limit?: number;
  country?: object;
}

export interface MultiChainSearchResponse {
  // Array of TokenDto objects
  [key: number]: TokenDto;
} 