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
}

export interface HistoricalPricesRangeByAddressRequest {
  chain: number;
  address: string;
  from: number;
  to: number;
  provider?: string;
}

export interface HistoricalPricesIntervalRequest {
  chain: number;
  interval: string;
  from: number;
  to: number;
  provider?: string;
}

export interface HistoricalPricesIntervalByAddressRequest {
  chain: number;
  address: string;
  interval: string;
  from: number;
  to: number;
  provider?: string;
}

export interface HistoricalPricesResponse {
  prices: Array<{
    timestamp: number;
    price: number;
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
  priceChange: {
    currentPrice: number;
    previousPrice: number;
    change: number;
    changePercent: number;
  };
}

export interface PriceChangeMultipleResponse {
  [address: string]: {
    currentPrice: number;
    previousPrice: number;
    change: number;
    changePercent: number;
  };
} 