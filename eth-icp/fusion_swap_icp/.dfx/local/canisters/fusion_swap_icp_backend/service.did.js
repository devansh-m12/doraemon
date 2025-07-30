export const idlFactory = ({ IDL }) => {
  const Amount = IDL.Nat;
  const FeeConfig = IDL.Record({
    'max_cancel_premium' : Amount,
    'integrator_fee_bps' : IDL.Nat16,
    'surplus_bps' : IDL.Nat8,
    'protocol_fee_bps' : IDL.Nat16,
  });
  const Principal = IDL.Principal;
  const AuctionData = IDL.Record({
    'start_price' : Amount,
    'end_time' : IDL.Nat64,
    'current_price' : Amount,
    'start_time' : IDL.Nat64,
    'end_price' : Amount,
  });
  const OrderConfig = IDL.Record({
    'id' : IDL.Nat64,
    'fee' : FeeConfig,
    'maker' : Principal,
    'estimated_dst_amount' : Amount,
    'dst_mint' : Principal,
    'cancellation_auction_secs' : IDL.Nat32,
    'min_dst_amount' : Amount,
    'src_amount' : Amount,
    'src_mint' : Principal,
    'expiration_time' : IDL.Nat64,
    'auction' : AuctionData,
  });
  return IDL.Service({
    'cancel_order' : IDL.Func([IDL.Nat64], [], ['oneway']),
    'create_order' : IDL.Func([OrderConfig], [], ['oneway']),
    'fill_order' : IDL.Func([IDL.Nat64, Amount], [], ['oneway']),
    'get_all_orders' : IDL.Func([], [IDL.Vec(OrderConfig)], ['query']),
    'get_order' : IDL.Func([IDL.Nat64], [IDL.Opt(OrderConfig)], ['query']),
    'get_orders_by_maker' : IDL.Func(
        [Principal],
        [IDL.Vec(OrderConfig)],
        ['query'],
      ),
    'greet' : IDL.Func([IDL.Text], [IDL.Text], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
