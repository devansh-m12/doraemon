// Portfolio API Types for 1inch Portfolio API v5.0

// Base response structure
export interface PortfolioResponse<T> {
  result: T;
  meta?: {
    cached_at?: number;
    system?: {
      click_time?: number;
      node_time?: number;
      microservices_time?: number;
      redis_time?: number;
      total_time?: number;
    };
  };
}

// 1. Service Status
export interface ServiceStatusRequest {
  // No parameters needed
}

export interface ServiceStatusResponse {
  is_available: boolean;
}

// 2. Compliance Check
export interface ComplianceRequest {
  addresses: string[];
}

export interface ComplianceResponse {
  [address: string]: {
    is_compliant: boolean;
    reason?: string;
  };
}

// 3. Supported Chains
export interface SupportedChainsResponse {
  chains: Array<{
    id: number;
    name: string;
    is_testnet?: boolean;
  }>;
}

// 4. Supported Protocols
export interface SupportedProtocolsResponse {
  protocols: Array<{
    id: string;
    name: string;
    description?: string;
    category?: string;
  }>;
}

// 5. Current Portfolio Value
export interface CurrentValueRequest {
  addresses?: string[];
  chains?: number[];
  protocols?: string[];
}

export interface CurrentValueResponse {
  total_value: number;
  breakdown: {
    by_chain?: { [chainId: number]: number };
    by_protocol?: { [protocolId: string]: number };
    by_token?: { [tokenAddress: string]: number };
  };
  currencies: {
    [currency: string]: number;
  };
}

// 6. Value Chart
export interface ValueChartRequest {
  from: number; // timestamp
  to: number; // timestamp
  addresses?: string[];
  chains?: number[];
  protocols?: string[];
  interval?: 'hour' | 'day' | 'week' | 'month';
}

export interface ValueChartResponse {
  data: Array<{
    timestamp: number;
    value: number;
    breakdown?: {
      by_chain?: { [chainId: number]: number };
      by_protocol?: { [protocolId: string]: number };
    };
  }>;
}

// 7. Overview Report
export interface OverviewReportRequest {
  addresses?: string[];
  chains?: number[];
  protocols?: string[];
  from?: number; // timestamp for historical comparison
  to?: number; // timestamp for historical comparison
}

export interface OverviewReportResponse {
  summary: {
    total_value: number;
    total_value_change_24h: number;
    total_value_change_7d: number;
    total_value_change_30d: number;
    profit_loss_24h: number;
    profit_loss_7d: number;
    profit_loss_30d: number;
  };
  breakdown: {
    by_chain: Array<{
      chain_id: number;
      chain_name: string;
      value: number;
      percentage: number;
    }>;
    by_protocol: Array<{
      protocol_id: string;
      protocol_name: string;
      value: number;
      percentage: number;
    }>;
    by_token: Array<{
      token_address: string;
      token_symbol: string;
      token_name: string;
      value: number;
      percentage: number;
    }>;
  };
  metrics: {
    total_positions: number;
    active_protocols: number;
    total_tokens: number;
    average_apr?: number;
    total_fees_earned?: number;
  };
}

// 8. Protocols Snapshot
export interface ProtocolsSnapshotRequest {
  addresses?: string[];
  chains?: number[];
  protocols?: string[];
}

export interface ProtocolPosition {
  protocol_id: string;
  protocol_name: string;
  chain_id: number;
  chain_name: string;
  address: string;
  positions: Array<{
    token_address: string;
    token_symbol: string;
    token_name: string;
    balance: string;
    balance_usd: number;
    apr?: number;
    apy?: number;
    fees_earned?: number;
    fees_earned_usd?: number;
  }>;
  total_value: number;
  total_apr?: number;
  total_apy?: number;
}

export interface ProtocolsSnapshotResponse {
  protocols: ProtocolPosition[];
  summary: {
    total_value: number;
    total_positions: number;
    active_protocols: number;
  };
}

// 9. Protocols Metrics
export interface ProtocolsMetricsRequest {
  addresses?: string[];
  chains?: number[];
  protocols?: string[];
  from?: number; // timestamp
  to?: number; // timestamp
}

export interface ProtocolMetrics {
  protocol_id: string;
  protocol_name: string;
  chain_id: number;
  chain_name: string;
  address: string;
  metrics: {
    current_apr?: number;
    current_apy?: number;
    historical_apr?: number;
    historical_apy?: number;
    fees_earned_24h?: number;
    fees_earned_7d?: number;
    fees_earned_30d?: number;
    fees_earned_total?: number;
    value_change_24h?: number;
    value_change_7d?: number;
    value_change_30d?: number;
  };
}

export interface ProtocolsMetricsResponse {
  protocols: ProtocolMetrics[];
}

// 10. Tokens Snapshot
export interface TokensSnapshotRequest {
  addresses?: string[];
  chains?: number[];
  tokens?: string[];
}

export interface TokenSnapshot {
  token_address: string;
  token_symbol: string;
  token_name: string;
  token_decimals: number;
  chain_id: number;
  chain_name: string;
  address: string;
  balance: string;
  balance_usd: number;
  price_usd: number;
  price_change_24h?: number;
  market_cap?: number;
  volume_24h?: number;
}

export interface TokensSnapshotResponse {
  tokens: TokenSnapshot[];
  summary: {
    total_value: number;
    total_tokens: number;
    unique_tokens: number;
  };
}

// 11. Tokens Metrics
export interface TokensMetricsRequest {
  addresses?: string[];
  chains?: number[];
  tokens?: string[];
  from?: number; // timestamp
  to?: number; // timestamp
}

export interface TokenMetrics {
  token_address: string;
  token_symbol: string;
  token_name: string;
  chain_id: number;
  chain_name: string;
  address: string;
  metrics: {
    current_value: number;
    historical_value?: number;
    value_change_24h?: number;
    value_change_7d?: number;
    value_change_30d?: number;
    profit_loss_24h?: number;
    profit_loss_7d?: number;
    profit_loss_30d?: number;
    profit_loss_total?: number;
    price_change_24h?: number;
    price_change_7d?: number;
    price_change_30d?: number;
  };
}

export interface TokensMetricsResponse {
  tokens: TokenMetrics[];
} 