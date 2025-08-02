module fusion_swap_addr::fusion_swap {
    use std::signer;
    use std::vector;
    use std::hash;
    use std::option;

    const ENOT_AUTHORIZED: u64 = 1000;
    const EORDER_NOT_FOUND: u64 = 1001;
    const EORDER_EXPIRED: u64 = 1002;
    const EINVALID_AMOUNT: u64 = 1003;
    const EINVALID_PRICE: u64 = 1004;
    const EINVALID_HASHLOCK: u64 = 1005;
    const ETIMELOCK_NOT_EXPIRED: u64 = 1006;
    const EREENTRANCY_GUARD: u64 = 1007;

    struct OrderStatus has copy, drop, store {
        state: u8,
        last_updated: u64,
    }

    struct FeeConfig has copy, drop {
        maker_fee: u64,
        taker_fee: u64,
        resolver_fee: u64,
        platform_fee: u64,
    }

    struct AuctionData has copy, drop, store {
        start_price: u128,
        end_price: u128,
        start_time: u64,
        duration: u64,
        current_price: u128,
        min_fill_amount: u128,
        max_fill_amount: u128,
    }

    struct HashLock has copy, drop, store {
        hash: vector<u8>,
        secret: option::Option<vector<u8>>,
        is_revealed: bool,
    }

    struct TimeLock has copy, drop, store {
        finality_lock: u64,
        exclusive_withdraw: u64,
        cancellation_timeout: u64,
    }

    #[test_only]
    public fun create_order_status(state: u8, last_updated: u64): OrderStatus {
        OrderStatus { state, last_updated }
    }

    #[test_only]
    public fun create_fee_config(maker_fee: u64, taker_fee: u64, resolver_fee: u64, platform_fee: u64): FeeConfig {
        FeeConfig { maker_fee, taker_fee, resolver_fee, platform_fee }
    }

    #[test_only]
    public fun get_status_state(status: &OrderStatus): u8 { status.state }
    #[test_only]
    public fun get_status_last_updated(status: &OrderStatus): u64 { status.last_updated }

    #[test_only]
    public fun get_fee_maker(fee: &FeeConfig): u64 { fee.maker_fee }
    #[test_only]
    public fun get_fee_taker(fee: &FeeConfig): u64 { fee.taker_fee }
    #[test_only]
    public fun get_fee_resolver(fee: &FeeConfig): u64 { fee.resolver_fee }
    #[test_only]
    public fun get_fee_platform(fee: &FeeConfig): u64 { fee.platform_fee }

    #[test_only]
    public fun get_enot_authorized(): u64 { ENOT_AUTHORIZED }
    #[test_only]
    public fun get_eorder_not_found(): u64 { EORDER_NOT_FOUND }
    #[test_only]
    public fun get_eorder_expired(): u64 { EORDER_EXPIRED }
    #[test_only]
    public fun get_einvalid_amount(): u64 { EINVALID_AMOUNT }
    #[test_only]
    public fun get_einvalid_price(): u64 { EINVALID_PRICE }
    #[test_only]
    public fun get_einvalid_hashlock(): u64 { EINVALID_HASHLOCK }
    #[test_only]
    public fun get_etimelock_not_expired(): u64 { ETIMELOCK_NOT_EXPIRED }
    #[test_only]
    public fun get_ereentrancy_guard(): u64 { EREENTRANCY_GUARD }
}
