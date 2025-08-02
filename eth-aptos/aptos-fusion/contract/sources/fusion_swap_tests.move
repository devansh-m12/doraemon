module fusion_swap_addr::fusion_swap_tests {
    use fusion_swap_addr::fusion_swap;
    use std::vector;
    use std::option;

    #[test]
    fun test_error_codes_exist() {
        assert!(fusion_swap::get_enot_authorized() == 1000, 0);
        assert!(fusion_swap::get_eorder_not_found() == 1001, 0);
        assert!(fusion_swap::get_eorder_expired() == 1002, 0);
        assert!(fusion_swap::get_einvalid_amount() == 1003, 0);
        assert!(fusion_swap::get_einvalid_price() == 1004, 0);
        assert!(fusion_swap::get_einvalid_hashlock() == 1005, 0);
        assert!(fusion_swap::get_etimelock_not_expired() == 1006, 0);
        assert!(fusion_swap::get_ereentrancy_guard() == 1007, 0);
    }

    #[test]
    fun test_order_status_creation() {
        let status = fusion_swap::create_order_status(0, 123);
        assert!(fusion_swap::get_status_state(&status) == 0, 0);
        assert!(fusion_swap::get_status_last_updated(&status) == 123, 0);
    }

    #[test]
    fun test_fee_config_creation() {
        let fee = fusion_swap::create_fee_config(100, 200, 50, 25);
        assert!(fusion_swap::get_fee_maker(&fee) == 100, 0);
        assert!(fusion_swap::get_fee_taker(&fee) == 200, 0);
        assert!(fusion_swap::get_fee_resolver(&fee) == 50, 0);
        assert!(fusion_swap::get_fee_platform(&fee) == 25, 0);
    }

    #[test]
    fun test_auction_data_creation() {
        let auction = fusion_swap::create_auction_data(1000, 900, 0, 600, 950, 10, 1000);
        assert!(fusion_swap::get_auction_start_price(&auction) == 1000, 0);
        assert!(fusion_swap::get_auction_end_price(&auction) == 900, 0);
        assert!(fusion_swap::get_auction_start_time(&auction) == 0, 0);
        assert!(fusion_swap::get_auction_duration(&auction) == 600, 0);
        assert!(fusion_swap::get_auction_current_price(&auction) == 950, 0);
        assert!(fusion_swap::get_auction_min_fill(&auction) == 10, 0);
        assert!(fusion_swap::get_auction_max_fill(&auction) == 1000, 0);
    }

    #[test]
    fun test_hashlock_creation() {
        let hash_vec = vector::empty<u8>();
        let secret_opt = option::none<vector<u8>>();
        let lock = fusion_swap::create_hash_lock(hash_vec, secret_opt, false);
        assert!(fusion_swap::get_hashlock_hash(&lock) == hash_vec, 0);
        assert!(option::is_none(&fusion_swap::get_hashlock_secret(&lock)), 0);
        assert!(fusion_swap::get_hashlock_is_revealed(&lock) == false, 0);
    }

    #[test]
    fun test_timelock_creation() {
        let lock = fusion_swap::create_time_lock(300, 600, 3600);
        assert!(fusion_swap::get_timelock_finality(&lock) == 300, 0);
        assert!(fusion_swap::get_timelock_exclusive(&lock) == 600, 0);
        assert!(fusion_swap::get_timelock_cancellation(&lock) == 3600, 0);
    }
}
