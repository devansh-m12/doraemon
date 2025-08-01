// Request Types
export interface LineChartRequest {
  token0: string;
  token1: string;
  period: '24H' | '1W' | '1M' | '1Y' | 'AllTime';
  chainId: number;
}

export interface CandleChartRequest {
  token0: string;
  token1: string;
  seconds: 300 | 900 | 3600 | 14400 | 86400 | 604800;
  chainId: number;
}

// Response Types
export interface LineDataPoint {
  time: number;
  value: number;
}

export interface CandleDataPoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface LineChartResponse {
  data: LineDataPoint[];
}

export interface CandleChartResponse {
  data: CandleDataPoint[];
}

// Type aliases for better compatibility
export type ChartPeriod = '24H' | '1W' | '1M' | '1Y' | 'AllTime';
export type CandleSeconds = 300 | 900 | 3600 | 14400 | 86400 | 604800;

// Error Response Types
export interface ChartError {
  error: string;
  message: string;
  statusCode: number;
} 