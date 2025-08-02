// Removed unused import - OneInchFetcher not used in this file

// Basic types for Fusion+ API
export interface Meta {
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface CrossChainOrderDto {
  salt: string;
  maker: string;
  receiver: string;
  makerAsset: string;
  takerAsset: string;
  makingAmount: string;
  takingAmount: string;
  makerTraits: string;
  secretHashes: string[][];
  fills: string[];
}

export interface ActiveOrdersOutput {
  orderHash: string;
  signature: string;
  deadline: number;
  auctionStartDate: number;
  auctionEndDate: number;
  quoteId: string;
  remainingMakerAmount: string;
  makerBalance: string;
  makerAllowance: string;
  isMakerContract: boolean;
  extension: string;
  srcChainId: number;
  dstChainId: number;
  order: CrossChainOrderDto;
}

export interface GetActiveOrdersOutput {
  meta: Meta;
  items: ActiveOrdersOutput[];
}

export interface EscrowFactory {
  address: string;
}

export interface GetOrderByMakerOutput {
  meta: Meta;
  items: ActiveOrdersOutput[];
}

export interface PublicSecret {
  idx: number;
  secret: string;
}

export interface Immutables {
  orderHash: string;
  hashlock: string;
  maker: string;
  taker: string;
  token: string;
  amount: string;
  safetyDeposit: string;
  timelocks: string;
}

export interface ResolverDataOutput {
  orderType: 'SingleFill' | 'MultipleFills';
  secrets: PublicSecret[];
  srcImmutables: Immutables;
  dstImmutables: Immutables;
  secretHashes: string[][];
}

export interface ReadyToAcceptSecretFill {
  idx: number;
  srcEscrowDeployTxHash: string;
  dstEscrowDeployTxHash: string;
}

export interface ReadyToAcceptSecretFills {
  fills: ReadyToAcceptSecretFill[];
}

export interface ReadyToAcceptSecretFillsForOrder {
  orderHash: string;
  makerAddress: string;
  fills: ReadyToAcceptSecretFill[];
}

export interface ReadyToAcceptSecretFillsForAllOrders {
  orders: ReadyToAcceptSecretFillsForOrder[];
}

export interface ReadyToExecutePublicAction {
  action: 'withdraw' | 'cancel';
  immutables: Immutables;
  chainId: number;
  escrow: string;
  secret?: string;
}

export interface ReadyToExecutePublicActionsOutput {
  actions: ReadyToExecutePublicAction[];
}

export interface FillOutputDto {
  status: 'pending' | 'executed' | 'refunding' | 'refunded';
  txHash: string;
  filledMakerAmount: string;
  filledAuctionTakerAmount: string;
}

export interface EscrowEventDataOutput {
  transactionHash: string;
  escrow: string;
  side: 'src' | 'dst';
  action: 'src_escrow_created' | 'dst_escrow_created' | 'withdrawn' | 'funds_rescued' | 'escrow_cancelled';
  blockTimestamp: number;
}

export interface AuctionPointOutput {
  delay: number;
  coefficient: number;
  approximateTakingAmount: string;
  positiveSurplus: string;
}

export interface LimitOrderV4StructOutput {
  salt: string;
  maker: string;
  receiver: string;
  makerAsset: string;
  takerAsset: string;
  makingAmount: string;
  takingAmount: string;
  makerTraits: string;
  extension: string;
  points: AuctionPointOutput;
}

export interface GetOrderFillsByHashOutput {
  orderHash: string;
  status: 'pending' | 'executed' | 'expired' | 'cancelled' | 'refunding' | 'refunded';
  validation: 'valid' | 'order-predicate-returned-false' | 'not-enough-balance' | 'not-enough-allowance' | 'invalid-permit-signature' | 'invalid-permit-spender' | 'invalid-permit-signer' | 'invalid-signature' | 'failed-to-parse-permit-details' | 'unknown-permit-version' | 'wrong-epoch-manager-and-bit-invalidator' | 'failed-to-decode-remaining' | 'unknown-failure';
  order: LimitOrderV4StructOutput;
  fills: FillOutputDto[];
  escrowEvents: EscrowEventDataOutput[];
  auctionStartDate: number;
  auctionDuration: number;
  initialRateBump: number;
  createdAt: number;
  srcTokenPriceUsd: any;
  dstTokenPriceUsd: any;
  cancelTx: any;
  srcChainId: number;
  dstChainId: number;
  cancelable: boolean;
  takerAsset: string;
  timeLocks: string;
}

// Quoter types
export interface AuctionPoint {
  delay: number;
  coefficient: number;
}

export interface GasCostConfig {
  gasBumpEstimate: number;
  gasPriceEstimate: string;
}

export interface Preset {
  auctionDuration: number;
  startAuctionIn: number;
  initialRateBump: number;
  auctionStartAmount: string;
  startAmount: string;
  auctionEndAmount: string;
  exclusiveResolver: any;
  costInDstToken: string;
  points: AuctionPoint[];
  allowPartialFills: boolean;
  allowMultipleFills: boolean;
  gasCost: GasCostConfig;
  gasBumpEstimate: number;
  gasPriceEstimate: string;
  secretsCount: number;
}

export interface QuotePresets {
  fast: Preset;
  medium: Preset;
  slow: Preset;
  custom?: Preset;
}

export interface TimeLocks {
  srcWithdrawal: number;
  srcPublicWithdrawal: number;
  srcCancellation: number;
  srcPublicCancellation: number;
  dstWithdrawal: number;
  dstPublicWithdrawal: number;
  dstCancellation: number;
}

export interface TokenPair {
  srcToken: string;
  dstToken: string;
}

export interface PairCurrency {
  usd: TokenPair;
}

export interface GetQuoteOutput {
  quoteId: any;
  srcTokenAmount: string;
  dstTokenAmount: string;
  presets: QuotePresets;
  srcEscrowFactory: string;
  dstEscrowFactory: string;
  whitelist: string[];
  timeLocks: TimeLocks;
  srcSafetyDeposit: string;
  dstSafetyDeposit: string;
  recommendedPreset: 'fast' | 'slow' | 'medium' | 'custom';
  prices: PairCurrency;
  volume: PairCurrency;
}

export interface CustomPresetParams {
  // Add custom preset parameters as needed
}

export interface BuildOrderBody {
  quote: GetQuoteOutput;
  secretsHashList: string[];
}

export interface BuildOrderOutput {
  typedData: any;
  orderHash: string;
  extension: string;
}

// Relayer types
export interface OrderInput {
  salt: string;
  makerAsset: string;
  takerAsset: string;
  maker: string;
  receiver: string;
  makingAmount: string;
  takingAmount: string;
  makerTraits: string;
}

export interface SignedOrderInput {
  order: OrderInput;
  srcChainId: number;
  signature: string;
  extension: string;
  quoteId: string;
  secretHashes: string[];
}

export interface SecretInput {
  secret: string;
  orderHash: string;
}

// Request/Response types for the service
export interface GetActiveOrdersRequest {
  page?: number;
  limit?: number;
  srcChain?: number;
  dstChain?: number;
}

export interface GetEscrowFactoryRequest {
  chainId: number;
}

export interface GetQuoteRequest {
  srcChain: number;
  dstChain: number;
  srcTokenAddress: string;
  dstTokenAddress: string;
  amount: number;
  walletAddress: string;
  enableEstimate: boolean;
  fee?: number;
  isPermit2?: string;
  permit?: string;
}

export interface BuildOrderRequest {
  quote: GetQuoteOutput;
  secretsHashList: string[];
}

export interface SubmitOrderRequest {
  order: OrderInput;
  srcChainId: number;
  signature: string;
  extension: string;
  quoteId: string;
  secretHashes: string[];
}

export interface SubmitSecretRequest {
  secret: string;
  orderHash: string;
} 