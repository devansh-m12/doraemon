export interface TokenDetailsRequest {
  chain: number;
  provider?: string;
}

export interface TokenDetailsByAddressRequest {
  chain: number;
  address: string;
  provider?: string;
}

export interface TokenDetailsResponse {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  tags?: string[];
  website?: string;
  description?: string;
  shortDescription?: string;
  explorer?: string;
  social?: {
    twitter?: string;
    telegram?: string;
    discord?: string;
    reddit?: string;
  };
  marketCap?: number;
  supply?: number;
  sourceCode?: string;
  whitePaper?: string;
  research?: string;
  assets?: string[];
  provider?: string;
}

export interface HistoricalPricesRangeRequest {
  chain: number;
  from: number;
  to: number;
  provider?: string;
  from_time?: number;
}

export interface HistoricalPricesRangeByAddressRequest {
  chain: number;
  address: string;
  from: number;
  to: number;
  provider?: string;
  from_time?: number;
}

export interface HistoricalPricesIntervalRequest {
  chain: number;
  interval: string;
  from: number;
  to: number;
  provider?: string;
  from_time?: number;
}

export interface HistoricalPricesIntervalByAddressRequest {
  chain: number;
  address: string;
  interval: string;
  from: number;
  to: number;
  provider?: string;
  from_time?: number;
}

// Supported intervals matching the reference implementation
export type SupportedInterval = 
  | "5m" | "10m" | "15m" | "30m" | "50m" 
  | "1h" | "2h" | "3h" | "4h" | "6h" | "12h" | "24h" 
  | "2d" | "3d" | "7d" | "14d" | "15d" | "30d" | "60d" | "90d" | "365d" | "max";

export interface HistoricalPricesResponse {
  d: Array<{
    t: number; // timestamp
    v: number; // value/price
    p: string; // price string
  }>;
}

export interface PriceChangeRequest {
  chain: number;
  interval: string;
  provider?: string;
}

export interface PriceChangeByAddressRequest {
  chain: number;
  address: string;
  interval: string;
  provider?: string;
}

export interface PriceChangeMultipleRequest {
  chain: number;
  addresses: string[];
  interval: string;
  provider?: string;
}

export interface PriceChangeResponse {
  inUSD: number;
  inPercent: number;
}

export interface PriceChangeMultipleResponse {
  [address: string]: {
    inUSD: number;
    inPercent: number;
  };
} 