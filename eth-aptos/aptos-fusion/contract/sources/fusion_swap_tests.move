module fusion_swap_addr::fusion_swap_tests {
    use fusion_swap_addr::fusion_swap;

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
}
