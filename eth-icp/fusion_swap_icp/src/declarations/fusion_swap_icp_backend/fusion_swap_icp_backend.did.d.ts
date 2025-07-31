import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type Amount = bigint;
export interface AuctionData {
  'start_price' : Amount,
  'end_time' : bigint,
  'current_price' : Amount,
  'start_time' : bigint,
  'end_price' : Amount,
}
export interface FeeConfig {
  'max_cancel_premium' : Amount,
  'integrator_fee_bps' : number,
  'surplus_bps' : number,
  'protocol_fee_bps' : number,
}
export type FusionError = { 'InvalidAmount' : null } |
  { 'ReentrancyDetected' : null } |
  { 'InsufficientSafetyDeposit' : null } |
  { 'OrderNotFound' : null } |
  { 'OrderExpired' : null } |
  { 'UnauthorizedCaller' : null } |
  { 'InvalidSecret' : null } |
  { 'TimelockViolation' : null } |
  { 'InvalidOrderState' : null } |
  { 'OrderAlreadyExists' : null } |
  { 'TransferFailed' : string } |
  { 'InvalidTimeRange' : null };
export interface HashLock {
  'revealed' : boolean,
  'secret_hash' : Uint8Array | number[],
  'reveal_time' : [] | [bigint],
}
export interface OrderConfig {
  'id' : bigint,
  'fee' : FeeConfig,
  'maker' : Principal,
  'status' : OrderStatus,
  'hashlock' : HashLock,
  'estimated_dst_amount' : Amount,
  'dst_mint' : Principal,
  'created_at' : bigint,
  'cancellation_auction_secs' : number,
  'min_dst_amount' : Amount,
  'src_amount' : Amount,
  'src_mint' : Principal,
  'expiration_time' : bigint,
  'auction' : AuctionData,
  'timelock' : TimeLock,
}
export type OrderStatus = { 'Announced' : null } |
  { 'Failed' : string } |
  { 'Active' : null } |
  { 'Cancelled' : null } |
  { 'Completed' : null };
export type Principal = Principal;
export type Result = { 'Ok' : null } |
  { 'Err' : FusionError };
export interface TimeLock {
  'finality_lock_duration' : bigint,
  'created_at' : bigint,
  'exclusive_withdraw_duration' : bigint,
  'cancellation_timeout' : bigint,
}
export interface _SERVICE {
  'cancel_order' : ActorMethod<[bigint], Result>,
  'create_order' : ActorMethod<[OrderConfig], Result>,
  'fill_order' : ActorMethod<
    [bigint, Amount, [] | [Uint8Array | number[]]],
    Result
  >,
  'get_all_orders' : ActorMethod<[], Array<OrderConfig>>,
  'get_order' : ActorMethod<[bigint], [] | [OrderConfig]>,
  'get_orders_by_maker' : ActorMethod<[Principal], Array<OrderConfig>>,
  'greet' : ActorMethod<[string], string>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
