export const idlFactory = ({ IDL }) => {
  const FusionError = IDL.Variant({
    'InvalidAmount' : IDL.Null,
    'ReentrancyDetected' : IDL.Null,
    'InsufficientSafetyDeposit' : IDL.Null,
    'OrderNotFound' : IDL.Null,
    'OrderExpired' : IDL.Null,
    'UnauthorizedCaller' : IDL.Null,
    'InvalidSecret' : IDL.Null,
    'TimelockViolation' : IDL.Null,
    'InvalidOrderState' : IDL.Null,
    'OrderAlreadyExists' : IDL.Null,
    'TransferFailed' : IDL.Text,
    'InvalidTimeRange' : IDL.Null,
  });
  const Result = IDL.Variant({ 'Ok' : IDL.Null, 'Err' : FusionError });
  const Amount = IDL.Nat;
  const FeeConfig = IDL.Record({
    'max_cancel_premium' : Amount,
    'integrator_fee_bps' : IDL.Nat16,
    'surplus_bps' : IDL.Nat8,
    'protocol_fee_bps' : IDL.Nat16,
  });
  const Principal = IDL.Principal;
  const OrderStatus = IDL.Variant({
    'Announced' : IDL.Null,
    'Failed' : IDL.Text,
    'Active' : IDL.Null,
    'Cancelled' : IDL.Null,
    'Completed' : IDL.Null,
  });
  const HashLock = IDL.Record({
    'revealed' : IDL.Bool,
    'secret_hash' : IDL.Vec(IDL.Nat8),
    'reveal_time' : IDL.Opt(IDL.Nat64),
  });
  const AuctionData = IDL.Record({
    'start_price' : Amount,
    'end_time' : IDL.Nat64,
    'current_price' : Amount,
    'start_time' : IDL.Nat64,
    'end_price' : Amount,
  });
  const TimeLock = IDL.Record({
    'finality_lock_duration' : IDL.Nat64,
    'created_at' : IDL.Nat64,
    'exclusive_withdraw_duration' : IDL.Nat64,
    'cancellation_timeout' : IDL.Nat64,
  });
  const OrderConfig = IDL.Record({
    'id' : IDL.Nat64,
    'fee' : FeeConfig,
    'maker' : Principal,
    'status' : OrderStatus,
    'hashlock' : HashLock,
    'estimated_dst_amount' : Amount,
    'dst_mint' : Principal,
    'created_at' : IDL.Nat64,
    'cancellation_auction_secs' : IDL.Nat32,
    'min_dst_amount' : Amount,
    'src_amount' : Amount,
    'src_mint' : Principal,
    'expiration_time' : IDL.Nat64,
    'auction' : AuctionData,
    'timelock' : TimeLock,
  });
  return IDL.Service({
    'cancel_order' : IDL.Func([IDL.Nat64], [Result], []),
    'create_order' : IDL.Func([OrderConfig], [Result], []),
    'fill_order' : IDL.Func(
        [IDL.Nat64, Amount, IDL.Opt(IDL.Vec(IDL.Nat8))],
        [Result],
        [],
      ),
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
