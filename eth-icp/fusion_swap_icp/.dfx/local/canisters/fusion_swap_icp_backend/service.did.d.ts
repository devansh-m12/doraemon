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
export interface OrderConfig {
  'id' : bigint,
  'fee' : FeeConfig,
  'maker' : Principal,
  'estimated_dst_amount' : Amount,
  'dst_mint' : Principal,
  'cancellation_auction_secs' : number,
  'min_dst_amount' : Amount,
  'src_amount' : Amount,
  'src_mint' : Principal,
  'expiration_time' : bigint,
  'auction' : AuctionData,
}
export type Principal = Principal;
export interface _SERVICE {
  'cancel_order' : ActorMethod<[bigint], undefined>,
  'create_order' : ActorMethod<[OrderConfig], undefined>,
  'fill_order' : ActorMethod<[bigint, Amount], undefined>,
  'get_all_orders' : ActorMethod<[], Array<OrderConfig>>,
  'get_order' : ActorMethod<[bigint], [] | [OrderConfig]>,
  'get_orders_by_maker' : ActorMethod<[Principal], Array<OrderConfig>>,
  'greet' : ActorMethod<[string], string>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
