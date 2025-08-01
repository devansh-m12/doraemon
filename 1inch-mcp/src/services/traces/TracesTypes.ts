export interface SyncedIntervalRequest {
  chain: string;
}

export interface SyncedIntervalResponse {
  from: number;
  to: number;
}

export interface BlockTraceRequest {
  chain: string;
  blockNumber: number;
}

export interface BlockTraceResponse {
  type: string;
  version: string;
  number: number;
  blockHash: string;
  blockTimestamp: string;
  traces: any[];
}

export interface TransactionTrace {
  txHash: string;
  txOffset: number;
  trace: TraceStep[];
}

export interface TraceStep {
  type: string;
  action: any;
  result?: any;
  subtraces: number;
  traceAddress: number[];
  error?: string;
}

export interface TransactionTraceByHashRequest {
  chain: string;
  blockNumber: number;
  txHash: string;
}

export interface TransactionTraceByHashResponse {
  transactionTrace: any[];
  type: string;
}

export interface TransactionTraceByOffsetRequest {
  chain: string;
  blockNumber: number;
  txOffset: number;
}

export interface TransactionTraceByOffsetResponse {
  transactionTrace: any[];
  type: string;
} 