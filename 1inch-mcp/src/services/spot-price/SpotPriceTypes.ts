// Request Types
export interface GetAllPricesRequest {
  chain: number;
  currency?: string;
}

export interface GetCustomTokensPricesRequest {
  chain: number;
  tokens: string[];
  currency?: string;
}

export interface GetSupportedCurrenciesRequest {
  chain: number;
}

export interface GetSpecificTokensPricesRequest {
  chain: number;
  addresses: string[];
  currency?: string;
}

// Response Types
export interface TokenPriceData {
  price: string;
  symbol?: string;
  name?: string;
  decimals?: number;
  logoURI?: string;
  tags?: string[];
}

export interface GetAllPricesResponse {
  [tokenAddress: string]: TokenPriceData;
}

export interface GetCustomTokensPricesResponse {
  [tokenAddress: string]: TokenPriceData;
}

export interface GetSupportedCurrenciesResponse {
  codes: string[];
}

export interface GetSpecificTokensPricesResponse {
  [tokenAddress: string]: TokenPriceData;
}

// Error Response Type
export interface SpotPriceErrorResponse {
  error: string;
  description: string;
  statusCode: number;
  meta?: Array<{
    type: string;
    value: string;
  }>;
} 