export interface SyncedIntervalRequest {
  chain: string;
}

export interface SyncedIntervalResponse {
  fromBlock: number;
  toBlock: number;
  chain: string;
}

export interface BlockTraceRequest {
  chain: string;
  blockNumber: number;
}

export interface BlockTraceResponse {
  blockNumber: number;
  chain: string;
  traces: TransactionTrace[];
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
  txHash: string;
  blockNumber: number;
  chain: string;
  trace: TraceStep[];
}

export interface TransactionTraceByOffsetRequest {
  chain: string;
  blockNumber: number;
  txOffset: number;
}

export interface TransactionTraceByOffsetResponse {
  txHash: string;
  blockNumber: number;
  chain: string;
  trace: TraceStep[];
} 