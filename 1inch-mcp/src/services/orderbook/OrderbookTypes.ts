// Order data structure
export interface OrderData {
  makerAsset: string;
  takerAsset: string;
  maker: string;
  receiver: string;
  makingAmount: string;
  takingAmount: string;
  salt: string;
  extension: string;
  makerTraits: string;
}

// Add limit order request
export interface AddLimitOrderRequest {
  chain: number;
  orderHash: string;
  signature: string;
  data: OrderData;
}

export interface AddLimitOrderResponse {
  success: boolean;
}

// Get orders by address
export interface GetOrdersByAddressRequest {
  chain: number;
  address: string;
  page?: number;
  limit?: number;
  statuses?: string;
  sortBy?: string;
  takerAsset?: string;
  makerAsset?: string;
}

export interface GetOrdersByAddressResponse {
  signature: string;
  orderHash: string;
  createDateTime: string;
  remainingMakerAmount: string;
  makerBalance: string;
  makerAllowance: string;
  data: OrderData;
  makerRate: string;
  takerRate: string;
  isMakerContract: boolean;
  orderInvalidReason: string;
}

// Get order by hash
export interface GetOrderByHashRequest {
  chain: number;
  orderHash: string;
}

export interface GetOrderByHashResponse {
  orderHash: string;
  signature: string;
  data: OrderData;
  status?: string;
  createdAt?: string;
  filledAmount?: string;
  cancelledAt?: string;
}

// Get all orders
export interface GetAllOrdersRequest {
  chain: number;
  page?: number;
  limit?: number;
  statuses?: string;
  sortBy?: string;
  takerAsset?: string;
  makerAsset?: string;
}

export interface GetAllOrdersResponse {
  signature: string;
  orderHash: string;
  createDateTime: string;
  remainingMakerAmount: string;
  makerBalance: string;
  makerAllowance: string;
  data: OrderData;
  makerRate: string;
  takerRate: string;
  isMakerContract: boolean;
  orderInvalidReason: string;
}

// Get orders count
export interface GetOrdersCountRequest {
  chain: number;
  makerAsset?: string;
  takerAsset?: string;
  maker?: string;
  status?: string;
}

export interface GetOrdersCountResponse {
  count: number;
}

// Get events for specific order
export interface GetOrderEventsRequest {
  chain: number;
  orderHash: string;
}

export interface OrderEvent {
  eventType: 'fill' | 'cancel';
  orderHash: string;
  timestamp: string;
  blockNumber: number;
  transactionHash: string;
  filledAmount?: string;
  cancelledAmount?: string;
  taker?: string;
}

export interface GetOrderEventsResponse {
  events: OrderEvent[];
}

// Get all events
export interface GetAllEventsRequest {
  chain: number;
  limit?: number;
  offset?: number;
  orderHash?: string;
  eventType?: 'fill' | 'cancel';
  fromTimestamp?: string;
  toTimestamp?: string;
}

export interface GetAllEventsResponse {
  events: OrderEvent[];
  total: number;
  limit: number;
  offset: number;
}

// Get active orders for permit
export interface GetActiveOrdersForPermitRequest {
  chain: number;
  walletAddress: string;
  token: string;
}

export interface GetActiveOrdersForPermitResponse {
  orders: Array<{
    orderHash: string;
    signature: string;
    data: OrderData;
    status: string;
    createdAt: string;
  }>;
}

// Get unique active pairs
export interface GetActivePairsRequest {
  chain: number;
  page?: number;
  limit?: number;
}

export interface Meta {
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface UniquePairs {
  makerAsset: string;
  takerAsset: string;
}

export interface GetActivePairsResponse {
  meta: Meta;
  items: UniquePairs[];
}

// Get making amount (fee info)
export interface GetMakingAmountRequest {
  chain: number;
  makerAsset: string;
  takerAsset: string;
  takingAmount?: string;
  maker?: string;
}

export interface FeeInfoResponse {
  whitelist: any;
  feeBps: number;
  whitelistDiscountPercent: number;
  protocolFeeReceiver: any;
  extensionAddress: any;
}

export interface GetMakingAmountResponse extends FeeInfoResponse {} 