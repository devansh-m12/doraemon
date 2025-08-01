export interface Eip1559GasValueResponse {
  maxPriorityFeePerGas: string;
  maxFeePerGas: string;
}

export interface Eip1559GasPriceResponse {
  baseFee: string;
  low: Eip1559GasValueResponse;
  medium: Eip1559GasValueResponse;
  high: Eip1559GasValueResponse;
  instant: Eip1559GasValueResponse;
}

export interface GasPriceRequest {
  chain: number;
}

export interface GasPriceResponse extends Eip1559GasPriceResponse {}

export interface GasPriceAnalysisRequest {
  chain: number;
  priority?: 'low' | 'medium' | 'high' | 'instant';
}

export interface GasPriceAnalysisResponse {
  chain: number;
  baseFee: string;
  recommended: Eip1559GasValueResponse;
  allOptions: {
    low: Eip1559GasValueResponse;
    medium: Eip1559GasValueResponse;
    high: Eip1559GasValueResponse;
    instant: Eip1559GasValueResponse;
  };
  analysis: {
    currentNetworkLoad: string;
    recommendedFor: string;
    estimatedConfirmationTime: string;
  };
} 