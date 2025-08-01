// Request Types
export interface HistoryEventsRequest {
  address: string;
  limit?: number;
  tokenAddress?: string;
  chainId?: number;
  toTimestampMs?: string;
  fromTimestampMs?: string;
}

export interface HistoryEventsByAddressRequest {
  addresses: string[];
  chainIds?: number[];
  limit?: number;
  fromTimestampMs?: string;
  toTimestampMs?: string;
  tokenAddress?: string;
}

export interface HistoryEventSearchRequest {
  filter?: {
    type?: string;
    from?: string;
    to?: string;
  };
  addresses: string[];
  chainIds?: number[];
  limit?: number;
}

export interface SwapEventsRequest {
  address: string;
  chainId: number;
  fromTimestampMs?: string;
  toTimestampMs?: string;
  limit?: number;
}

// Filter interfaces matching the reference code
export interface MultiFilterDto {
  from_time_ms?: number | null;
  to_time_ms?: number | null;
  chain_ids?: string[];
  transaction_types?: string[];
  token_addresses?: string[];
  chain_based_token_addresses?: string[];
  limit?: number;
}

export interface PostMultiFilterDto {
  filter: MultiFilterDto;
}

export interface SearchAndMultiFilterDto {
  from_time_ms?: number | null;
  to_time_ms?: number | null;
  chain_ids?: string[];
  transaction_types?: string[];
  token_addresses?: string[];
  chain_based_token_addresses?: string[];
}

export interface SearchOrMultiFilterDto {
  chain_ids?: string[];
  transaction_types?: string[];
  chain_based_token_addresses?: string[];
  transaction_hash?: any;
  from_or_to_address?: any;
}

export interface HistorySearchMultiFilterRootAndDto {
  and: SearchAndMultiFilterDto;
  or: SearchOrMultiFilterDto;
}

export interface HistorySearchMultiFilterRootFilterDto {
  and: HistorySearchMultiFilterRootAndDto;
  limit?: number;
}

export interface HistorySearchMultiFilterRootDto {
  filter: HistorySearchMultiFilterRootFilterDto;
}

export interface UnifiedTokenAddress {
  [key: string]: string;
}

export interface HistorySwapFilterDto {
  chain_ids: string[];
  from_time_ms?: number;
  to_time_ms?: number;
  limit?: number;
}

export interface HistorySwapFilterRootDto {
  filter: HistorySwapFilterDto;
}

// Supported transaction types
export type TransactionType = 
  | "Unknown" | "Approve" | "Wrap" | "Unwrap" | "Transfer" | "SwapExactInput" 
  | "SwapExactOutput" | "LimitOrderFill" | "LimitOrderCancel" | "LimitOrderCancelAll" 
  | "Multicall" | "AddLiquidity" | "RemoveLiquidity" | "Borrow" | "Repay" | "Stake" 
  | "Unstake" | "Vote" | "DelegateVotePower" | "UnDelegateVotePower" | "DiscardVote" 
  | "DeployPool" | "Claim" | "AbiDecoded" | "TraceDecoded" | "Action" | "Bridge" 
  | "BuyNft" | "BidNft" | "OfferSellNft" | "Burn" | "WrappedTx" | "RegisterENSDomain" 
  | "Revoke" | "CreateSafe" | "AddOwner" | "Send" | "Receive" | "MultiStage" 
  | "Swap" | "LimitOrderCreate";

// Response Types
export interface TokenAction {
  address: string;
  standard: string;
  fromAddress: string;
  toAddress: string;
  tokenId?: string;
  amount: string;
  direction: string;
}

export interface EventDetails {
  orderInBlock: number;
  txHash: string;
  chainId: number;
  blockNumber: number;
  blockTimeSec: number;
  status: string;
  type: string;
  tokenActions: TokenAction[];
  meta?: {
    is1inchFusionSwap?: boolean;
    is1inchCrossChainSwap?: boolean;
    orderFillPercentage?: number;
    ensDomainName?: string;
  };
}

export interface HistoryEvent {
  id: string;
  address: string;
  type: string;
  rating: number;
  timeMs: number;
  details: EventDetails;
  tokenActions: TokenAction[];
  meta?: Record<string, any>;
}

export type HistoryEventsResponse = HistoryEvent[];
export type HistoryEventsByAddressResponse = HistoryEvent[];
export type HistoryEventSearchResponse = HistoryEvent[];
export type SwapEventsResponse = HistoryEvent[]; 