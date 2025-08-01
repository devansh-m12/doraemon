// Request Types
export interface Web3RpcRequest {
  chainId: number;
  jsonrpc: string;
  method: string;
  params: any[];
  id: number | string | null;
}

// Response Types
export interface Web3RpcResponse {
  jsonrpc: string;
  result: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  id: number | string | null;
}

// Common JSON-RPC Methods
export interface EthBlockNumberRequest {
  chainId: number;
}

export interface EthBlockNumberResponse {
  jsonrpc: string;
  result: string; // Block number in hex
  id: number | string | null;
}

export interface EthGetBalanceRequest {
  chainId: number;
  address: string;
  block?: string; // Optional block parameter (latest, earliest, pending, or hex)
}

export interface EthGetBalanceResponse {
  jsonrpc: string;
  result: string; // Balance in wei as hex
  id: number | string | null;
}

export interface EthCallRequest {
  chainId: number;
  to: string;
  data: string;
  from?: string;
  gas?: string;
  gasPrice?: string;
  value?: string;
  block?: string;
}

export interface EthCallResponse {
  jsonrpc: string;
  result: string; // Return data as hex
  id: number | string | null;
}

export interface EthGetTransactionCountRequest {
  chainId: number;
  address: string;
  block?: string;
}

export interface EthGetTransactionCountResponse {
  jsonrpc: string;
  result: string; // Nonce as hex
  id: number | string | null;
}

export interface EthSendRawTransactionRequest {
  chainId: number;
  signedTransactionData: string;
}

export interface EthSendRawTransactionResponse {
  jsonrpc: string;
  result: string; // Transaction hash
  id: number | string | null;
}

export interface EthGetTransactionReceiptRequest {
  chainId: number;
  transactionHash: string;
}

export interface EthGetTransactionReceiptResponse {
  jsonrpc: string;
  result: {
    transactionHash: string;
    transactionIndex: string;
    blockHash: string;
    blockNumber: string;
    from: string;
    to: string;
    cumulativeGasUsed: string;
    gasUsed: string;
    contractAddress?: string;
    logs: any[];
    status: string;
    logsBloom: string;
    effectiveGasPrice: string;
  } | null;
  id: number | string | null;
}

export interface EthGetBlockByNumberRequest {
  chainId: number;
  blockNumber: string; // "latest", "earliest", "pending", or hex
  fullTransactionObjects?: boolean;
}

export interface EthGetBlockByNumberResponse {
  jsonrpc: string;
  result: {
    number: string;
    hash: string;
    parentHash: string;
    nonce: string;
    sha3Uncles: string;
    logsBloom: string;
    transactionsRoot: string;
    stateRoot: string;
    receiptsRoot: string;
    miner: string;
    difficulty: string;
    totalDifficulty: string;
    extraData: string;
    size: string;
    gasLimit: string;
    gasUsed: string;
    timestamp: string;
    transactions: any[];
    uncles: string[];
  } | null;
  id: number | string | null;
}

// Error Response Types
export interface Web3RpcError {
  jsonrpc: string;
  error: {
    code: number;
    message: string;
    data?: any;
  };
  id: number | string | null;
} 