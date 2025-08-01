// Request Types
export interface BroadcastPublicTransactionRequest {
  chain: number;
  rawTransaction: string;
}

export interface BroadcastPrivateTransactionRequest {
  chain: number;
  rawTransaction: string;
}

// Response Types
export interface BroadcastTransactionResponse {
  transactionHash: string;
}

// Error Response Types
export interface TransactionGatewayError {
  error: string;
  message: string;
  statusCode: number;
} 