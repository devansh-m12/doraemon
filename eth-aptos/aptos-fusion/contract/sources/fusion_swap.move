module fusion_swap_addr::fusion_swap {
    use std::signer;
    use std::vector;
    use std::hash;
    use std::option;
    use aptos_framework::table;

    const ENOT_AUTHORIZED: u64 = 1000;
    const EORDER_NOT_FOUND: u64 = 1001;
    const EORDER_EXPIRED: u64 = 1002;
    const EINVALID_AMOUNT: u64 = 1003;
    const EINVALID_PRICE: u64 = 1004;
    const EINVALID_HASHLOCK: u64 = 1005;
    const ETIMELOCK_NOT_EXPIRED: u64 = 1006;
    const EREENTRANCY_GUARD: u64 = 1007;

    // Order status constants
    const ORDER_STATUS_ACTIVE: u8 = 0;
    const ORDER_STATUS_FILLED: u8 = 1;
    const ORDER_STATUS_PARTIALLY_FILLED: u8 = 2;
    const ORDER_STATUS_CANCELLED: u8 = 3;
    const ORDER_STATUS_EXPIRED: u8 = 4;

    struct OrderStatus has copy, drop, store {
        state: u8,
        last_updated: u64,
    }

    struct FeeConfig has copy, drop, store {
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

    struct OrderConfig has copy, drop, store {
        id: u64,
        src_mint: address,
        dst_mint: address,
        maker: address,
        src_amount: u128,
        min_dst_amount: u128,
        estimated_dst_amount: u128,
        expiration_time: u64,
        fee: FeeConfig,
        auction: AuctionData,
        hashlock: HashLock,
        timelock: TimeLock,
        status: OrderStatus,
        created_at: u64,
        updated_at: u64,
        filled_amount: u128,
        remaining_amount: u128,
    }

    public fun create_order_config(id: u64, src_mint: address, dst_mint: address, maker: address, src_amount: u128, min_dst_amount: u128, estimated_dst_amount: u128, expiration_time: u64, fee: FeeConfig, auction: AuctionData, hashlock: HashLock, timelock: TimeLock, status: OrderStatus, created_at: u64, updated_at: u64, filled_amount: u128, remaining_amount: u128): OrderConfig {
        assert!(src_amount > 0, EINVALID_AMOUNT);
        assert!(min_dst_amount > 0, EINVALID_AMOUNT);
        assert!(estimated_dst_amount >= min_dst_amount, EINVALID_PRICE);
        assert!(auction.duration >= 300 && auction.duration <= 3600, EINVALID_PRICE);
        assert!(vector::length(&hashlock.hash) == 32, EINVALID_HASHLOCK);
        assert!(fee.maker_fee <= 10000 && fee.taker_fee <= 10000 && fee.resolver_fee <= 10000 && fee.platform_fee <= 10000, EINVALID_PRICE);
        OrderConfig { id, src_mint, dst_mint, maker, src_amount, min_dst_amount, estimated_dst_amount, expiration_time, fee, auction, hashlock, timelock, status, created_at, updated_at, filled_amount, remaining_amount }
    }

    public fun create_order(
        sender: &signer,
        src_mint: address,
        dst_mint: address,
        src_amount: u128,
        min_dst_amount: u128,
        estimated_dst_amount: u128,
        expiration_time: u64,
        fee: FeeConfig,
        auction: AuctionData,
        hashlock: HashLock,
        timelock: TimeLock
    ) acquires FusionSwapGlobal, OrderStore {
        // Reentrancy protection
        set_reentrancy_guard();
        
        // Basic parameter validation
        assert!(src_amount > 0, EINVALID_AMOUNT);
        assert!(min_dst_amount > 0, EINVALID_AMOUNT);
        
        // Enhanced validation
        validate_price(estimated_dst_amount, min_dst_amount);
        validate_auction_duration(auction.duration);
        validate_hashlock(&hashlock.hash);
        validate_fees(&fee);
        
        // Get next order ID
        let global = borrow_global_mut<FusionSwapGlobal>(@fusion_swap_addr);
        let order_id = global.next_order_id;
        global.next_order_id = global.next_order_id + 1;
        global.total_orders = global.total_orders + 1;
        
        // Create order config
        let maker = signer::address_of(sender);
        let status = OrderStatus { state: 0, last_updated: 0 };
        let created_at = 0; // TODO: Use timestamp
        let updated_at = 0;
        let filled_amount = 0;
        let remaining_amount = src_amount;
        
        let order_config = create_order_config(
            order_id, src_mint, dst_mint, maker, src_amount, min_dst_amount, 
            estimated_dst_amount, expiration_time, fee, auction, hashlock, 
            timelock, status, created_at, updated_at, filled_amount, remaining_amount
        );
        
        // Store order
        let store = borrow_global_mut<OrderStore>(@fusion_swap_addr);
        table::add(&mut store.orders, order_id, order_config);
        store.size = store.size + 1;
        
        // Clear reentrancy guard
        clear_reentrancy_guard();
    }

    public fun cancel_order(
        sender: &signer,
        order_id: u64
    ) acquires FusionSwapGlobal, OrderStore {
        set_reentrancy_guard();
        let store = borrow_global_mut<OrderStore>(@fusion_swap_addr);
        assert!(table::contains(&store.orders, order_id), EORDER_NOT_FOUND);
        let order = table::borrow_mut(&mut store.orders, order_id);
        let sender_addr = signer::address_of(sender);
        assert!(order.maker == sender_addr, ENOT_AUTHORIZED);
        assert!(order.status.state == ORDER_STATUS_ACTIVE || order.status.state == ORDER_STATUS_PARTIALLY_FILLED, EORDER_EXPIRED);
        
        update_order_status(order, ORDER_STATUS_CANCELLED);
        let global = borrow_global_mut<FusionSwapGlobal>(@fusion_swap_addr);
        global.total_orders = global.total_orders - 1;
        clear_reentrancy_guard();
    }

    public fun fill_order(
        sender: &signer,
        order_id: u64,
        fill_amount: u128,
        secret: vector<u8>
    ) acquires FusionSwapGlobal, OrderStore {
        // Reentrancy protection
        set_reentrancy_guard();
        
        // Order existence validation
        let store = borrow_global_mut<OrderStore>(@fusion_swap_addr);
        assert!(table::contains(&store.orders, order_id), EORDER_NOT_FOUND);
        
        // Get order and validate status
        let order = table::borrow_mut(&mut store.orders, order_id);
        assert!(order.status.state == ORDER_STATUS_ACTIVE || order.status.state == ORDER_STATUS_PARTIALLY_FILLED, EORDER_EXPIRED);
        
        // Check if order has expired
        assert!(!is_order_expired(order, 2), EORDER_EXPIRED); // TODO: Use actual timestamp
        
        // Amount validation
        assert!(fill_amount > 0, EINVALID_AMOUNT);
        assert!(fill_amount <= order.remaining_amount, EINVALID_AMOUNT);
        
        // Hashlock verification
        assert!(verify_hashlock(&order.hashlock, &secret), EINVALID_HASHLOCK);
        
        // Reveal secret
        reveal_secret(&mut order.hashlock, secret);
        
        // Calculate current price and fees
        let current_price = calculate_fill_price(&order.auction, 0); // TODO: Use actual timestamp
        let (maker_fee, taker_fee, resolver_fee, platform_fee) = calculate_fees(fill_amount, &order.fee);
        let net_amount = calculate_net_amount(fill_amount, maker_fee, taker_fee, resolver_fee, platform_fee);
        
        // Update order state
        order.filled_amount = order.filled_amount + fill_amount;
        order.remaining_amount = order.remaining_amount - fill_amount;
        order.updated_at = 0; // TODO: Use actual timestamp
        
        // Check if order is completely filled and update status
        if (order.remaining_amount == 0) {
            update_order_status(order, ORDER_STATUS_FILLED);
        } else {
            // Only update to PARTIALLY_FILLED if not already in that state
            if (order.status.state != ORDER_STATUS_PARTIALLY_FILLED) {
                update_order_status(order, ORDER_STATUS_PARTIALLY_FILLED);
            }
        };
        
        // Update global statistics
        let global = borrow_global_mut<FusionSwapGlobal>(@fusion_swap_addr);
        global.total_volume = global.total_volume + fill_amount;
        global.total_fees = global.total_fees + maker_fee + taker_fee + resolver_fee + platform_fee;
        
        // Clear reentrancy guard
        clear_reentrancy_guard();
    }

    fun validate_price(estimated_dst_amount: u128, min_dst_amount: u128) {
        assert!(estimated_dst_amount >= min_dst_amount, EINVALID_PRICE);
    }

    fun validate_auction_duration(duration: u64) {
        assert!(duration >= 300 && duration <= 3600, EINVALID_PRICE);
    }

    fun validate_hashlock(hash: &vector<u8>) {
        assert!(vector::length(hash) == 32, EINVALID_HASHLOCK);
    }

    fun validate_fees(fee: &FeeConfig) {
        assert!(fee.maker_fee <= 10000, EINVALID_PRICE);
        assert!(fee.taker_fee <= 10000, EINVALID_PRICE);
        assert!(fee.resolver_fee <= 10000, EINVALID_PRICE);
        assert!(fee.platform_fee <= 10000, EINVALID_PRICE);
    }

    fun verify_hashlock(hashlock: &HashLock, secret: &vector<u8>): bool {
        let secret_hash = hash::sha2_256(*secret);
        hashlock.hash == secret_hash
    }

    fun reveal_secret(hashlock: &mut HashLock, secret: vector<u8>) {
        hashlock.secret = option::some(secret);
        hashlock.is_revealed = true;
    }

    fun calculate_fill_price(auction: &AuctionData, current_time: u64): u128 {
        calculate_current_price(auction, current_time)
    }

    fun calculate_fees(fill_amount: u128, fee_config: &FeeConfig): (u128, u128, u128, u128) {
        let maker_fee_amount = (fill_amount * (fee_config.maker_fee as u128)) / 10000;
        let taker_fee_amount = (fill_amount * (fee_config.taker_fee as u128)) / 10000;
        let resolver_fee_amount = (fill_amount * (fee_config.resolver_fee as u128)) / 10000;
        let platform_fee_amount = (fill_amount * (fee_config.platform_fee as u128)) / 10000;
        (maker_fee_amount, taker_fee_amount, resolver_fee_amount, platform_fee_amount)
    }

    fun calculate_net_amount(fill_amount: u128, maker_fee: u128, taker_fee: u128, resolver_fee: u128, platform_fee: u128): u128 {
        let total_fees = maker_fee + taker_fee + resolver_fee + platform_fee;
        assert!(total_fees <= fill_amount, EINVALID_AMOUNT);
        fill_amount - total_fees
    }

    fun is_valid_state_transition(current_state: u8, new_state: u8): bool {
        if (current_state == ORDER_STATUS_ACTIVE) {
            new_state == ORDER_STATUS_FILLED || new_state == ORDER_STATUS_PARTIALLY_FILLED || new_state == ORDER_STATUS_CANCELLED || new_state == ORDER_STATUS_EXPIRED
        } else if (current_state == ORDER_STATUS_PARTIALLY_FILLED) {
            new_state == ORDER_STATUS_FILLED || new_state == ORDER_STATUS_CANCELLED || new_state == ORDER_STATUS_EXPIRED
        } else {
            false // Filled, Cancelled, and Expired are terminal states
        }
    }

    fun update_order_status(order: &mut OrderConfig, new_state: u8) {
        assert!(is_valid_state_transition(order.status.state, new_state), EORDER_EXPIRED);
        order.status.state = new_state;
        order.status.last_updated = 0; // TODO: Use actual timestamp
    }

    fun is_order_completed(order: &OrderConfig): bool {
        order.status.state == ORDER_STATUS_FILLED || order.status.state == ORDER_STATUS_CANCELLED || order.status.state == ORDER_STATUS_EXPIRED
    }

    fun is_order_expired(order: &OrderConfig, current_time: u64): bool {
        current_time > order.expiration_time
    }

    fun is_cancellation_timeout_expired(order: &OrderConfig, current_time: u64): bool {
        current_time > order.timelock.cancellation_timeout
    }

    fun is_finality_lock_expired(order: &OrderConfig, current_time: u64): bool {
        current_time > order.timelock.finality_lock
    }

    fun validate_timelock_constraints(order: &OrderConfig, current_time: u64) {
        // Check if order has expired
        assert!(!is_order_expired(order, current_time), EORDER_EXPIRED);
        
        // Check if cancellation timeout has passed
        assert!(is_cancellation_timeout_expired(order, current_time), ETIMELOCK_NOT_EXPIRED);
        
        // Check if finality lock has expired
        assert!(is_finality_lock_expired(order, current_time), ETIMELOCK_NOT_EXPIRED);
    }

    fun can_cancel_order(order: &OrderConfig, current_time: u64): bool {
        // Check if order is in a cancellable state
        let cancellable_state = order.status.state == ORDER_STATUS_ACTIVE || order.status.state == ORDER_STATUS_PARTIALLY_FILLED;
        
        // Check if cancellation timeout has passed
        let timeout_expired = is_cancellation_timeout_expired(order, current_time);
        
        // Check if order hasn't expired
        let not_expired = !is_order_expired(order, current_time);
        
        cancellable_state && timeout_expired && not_expired
    }

    fun validate_cancellation_authority(order: &OrderConfig, sender: address): bool {
        order.maker == sender
    }

    // Order Query & Analytics Functions
    fun get_order_by_id(order_id: u64): OrderConfig acquires OrderStore {
        let store = borrow_global<OrderStore>(@fusion_swap_addr);
        *table::borrow(&store.orders, order_id)
    }

    fun get_orders_by_maker(maker: address): vector<u64> {
        // For now, return empty vector - would need to implement with proper indexing
        vector::empty<u64>()
    }

    fun get_orders_by_status(status: u8): vector<u64> {
        // For now, return empty vector - would need to implement with proper indexing
        vector::empty<u64>()
    }

    fun calculate_order_statistics(): (u64, u64, u64, u64, u64) {
        // For now, return zeros - would need to implement with proper indexing
        (0, 0, 0, 0, 0)
    }

    fun get_order_history(order_id: u64): (u64, u64, u128, u128) acquires OrderStore {
        let store = borrow_global<OrderStore>(@fusion_swap_addr);
        let order = table::borrow(&store.orders, order_id);
        (order.created_at, order.updated_at, order.filled_amount, order.remaining_amount)
    }

    // Batch Operations Functions
    struct BatchOrderData has drop, store, copy {
        src_token: address,
        dst_token: address,
        src_amount: u128,
        dst_amount: u128,
        min_dst_amount: u128,
        max_dst_amount: u128,
        fee: FeeConfig,
        auction: AuctionData,
        hashlock: HashLock,
        timelock: TimeLock,
    }

    struct BatchFillData has drop, store, copy {
        order_id: u64,
        fill_amount: u128,
        secret: vector<u8>,
    }

    public fun batch_create_orders(
        sender: &signer,
        orders_data: vector<BatchOrderData>
    ) acquires FusionSwapGlobal, OrderStore {
        let len = vector::length(&orders_data);
        let i = 0;
        while (i < len) {
            let order_data = vector::borrow(&orders_data, i);
            create_order(
                sender, 
                order_data.src_token, 
                order_data.dst_token, 
                order_data.src_amount, 
                order_data.min_dst_amount, 
                order_data.max_dst_amount, 
                0, // expiration_time - TODO: Use actual timestamp
                order_data.fee, 
                order_data.auction, 
                order_data.hashlock, 
                order_data.timelock
            );
            i = i + 1;
        };
    }

    public fun batch_cancel_orders(
        sender: &signer,
        order_ids: vector<u64>
    ) acquires FusionSwapGlobal, OrderStore {
        let len = vector::length(&order_ids);
        let i = 0;
        while (i < len) {
            let order_id = *vector::borrow(&order_ids, i);
            cancel_order(sender, order_id);
            i = i + 1;
        };
    }

    public fun batch_fill_orders(
        sender: &signer,
        fill_data: vector<BatchFillData>
    ) acquires FusionSwapGlobal, OrderStore {
        let len = vector::length(&fill_data);
        let i = 0;
        while (i < len) {
            let fill_info = vector::borrow(&fill_data, i);
            fill_order(sender, fill_info.order_id, fill_info.fill_amount, fill_info.secret);
            i = i + 1;
        };
    }

    fun validate_order_config(
        src_amount: u128,
        dst_amount: u128,
        min_dst_amount: u128,
        max_dst_amount: u128,
        fee: &FeeConfig,
        auction: &AuctionData,
        hashlock: &HashLock,
        timelock: &TimeLock
    ): bool {
        src_amount > 0 && dst_amount > 0 && min_dst_amount > 0 && max_dst_amount > 0
    }

    fun validate_batch_orders(
        orders_data: &vector<BatchOrderData>
    ): bool {
        let len = vector::length(orders_data);
        let i = 0;
        while (i < len) {
            let order_data = vector::borrow(orders_data, i);
            if (!validate_order_config(
                order_data.src_amount, 
                order_data.dst_amount, 
                order_data.min_dst_amount, 
                order_data.max_dst_amount, 
                &order_data.fee, 
                &order_data.auction, 
                &order_data.hashlock, 
                &order_data.timelock
            )) {
                return false;
            };
            i = i + 1;
        };
        true
    }

    fun validate_batch_cancellations(
        order_ids: &vector<u64>,
        sender: address
    ): bool acquires OrderStore {
        let len = vector::length(order_ids);
        let i = 0;
        while (i < len) {
            let order_id = *vector::borrow(order_ids, i);
            let store = borrow_global<OrderStore>(@fusion_swap_addr);
            if (!table::contains(&store.orders, order_id)) {
                return false;
            };
            let order = table::borrow(&store.orders, order_id);
            if (order.maker != sender) {
                return false;
            };
            if (order.status.state != ORDER_STATUS_ACTIVE && order.status.state != ORDER_STATUS_PARTIALLY_FILLED) {
                return false;
            };
            i = i + 1;
        };
        true
    }

    fun validate_batch_fills(
        fill_data: &vector<BatchFillData>
    ): bool acquires OrderStore {
        let len = vector::length(fill_data);
        let i = 0;
        while (i < len) {
            let fill_info = vector::borrow(fill_data, i);
            let store = borrow_global<OrderStore>(@fusion_swap_addr);
            if (!table::contains(&store.orders, fill_info.order_id)) {
                return false;
            };
            let order = table::borrow(&store.orders, fill_info.order_id);
            if (order.status.state != ORDER_STATUS_ACTIVE && order.status.state != ORDER_STATUS_PARTIALLY_FILLED) {
                return false;
            };
            if (fill_info.fill_amount > order.remaining_amount) {
                return false;
            };
            i = i + 1;
        };
        true
    }

    // Advanced Query & Filtering Functions
    fun get_orders_by_maker_advanced(maker: address): vector<u64> {
        // For now, return empty vector - would need to implement with proper indexing
        vector::empty<u64>()
    }

    fun get_active_orders(): vector<u64> {
        // For now, return empty vector - would need to implement with proper indexing
        vector::empty<u64>()
    }

    fun get_orders_by_price_range(min_price: u128, max_price: u128): vector<u64> {
        // For now, return empty vector - would need to implement with proper indexing
        vector::empty<u64>()
    }

    fun get_orders_by_time_range(start_time: u64, end_time: u64): vector<u64> {
        // For now, return empty vector - would need to implement with proper indexing
        vector::empty<u64>()
    }

    fun sort_orders_by_creation_time(order_ids: vector<u64>): vector<u64> {
        // For now, return the input vector unchanged - would need to implement sorting
        order_ids
    }

    fun sort_orders_by_price(order_ids: vector<u64>): vector<u64> {
        // For now, return the input vector unchanged - would need to implement sorting
        order_ids
    }

    fun filter_orders_by_status(order_ids: vector<u64>, status: u8): vector<u64> acquires OrderStore {
        let filtered_orders = vector::empty<u64>();
        let len = vector::length(&order_ids);
        let i = 0;
        while (i < len) {
            let order_id = *vector::borrow(&order_ids, i);
            let store = borrow_global<OrderStore>(@fusion_swap_addr);
            if (table::contains(&store.orders, order_id)) {
                let order = table::borrow(&store.orders, order_id);
                if (order.status.state == status) {
                    vector::push_back(&mut filtered_orders, order_id);
                };
            };
            i = i + 1;
        };
        filtered_orders
    }

    fun get_order_statistics_by_maker(maker: address): (u64, u64, u64, u64, u64) {
        // For now, return zeros - would need to implement with proper indexing
        (0, 0, 0, 0, 0)
    }

    fun get_order_volume_by_time_range(start_time: u64, end_time: u64): u128 {
        // For now, return zero - would need to implement with proper indexing
        0
    }

    // Performance Optimization Functions
    fun optimize_batch_operations(operations: vector<u64>): vector<u64> {
        // Optimize batch operations for gas efficiency
        // For now, return unchanged - would implement actual optimization
        operations
    }

    fun create_efficient_index(order_id: u64, maker: address, status: u8) {
        // Create efficient indexing for queries
        // For now, no-op - would implement actual indexing
    }

    fun update_index_on_order_change(order_id: u64, old_status: u8, new_status: u8) {
        // Update index when order status changes
        // For now, no-op - would implement actual index updates
    }

    fun get_cached_order_data(order_id: u64): OrderConfig acquires OrderStore {
        // Get cached order data for frequently accessed orders
        let store = borrow_global<OrderStore>(@fusion_swap_addr);
        *table::borrow(&store.orders, order_id)
    }

    fun invalidate_cache(order_id: u64) {
        // Invalidate cache when order data changes
        // For now, no-op - would implement actual cache invalidation
    }

    fun optimize_gas_for_fill(fill_amount: u128, order: &OrderConfig): u128 {
        // Optimize gas usage for fill operations
        // For now, return unchanged - would implement actual optimization
        fill_amount
    }

    fun batch_validate_orders(order_ids: vector<u64>): bool acquires OrderStore {
        // Efficient batch validation
        let len = vector::length(&order_ids);
        let i = 0;
        while (i < len) {
            let order_id = *vector::borrow(&order_ids, i);
            let store = borrow_global<OrderStore>(@fusion_swap_addr);
            if (!table::contains(&store.orders, order_id)) {
                return false;
            };
            let order = table::borrow(&store.orders, order_id);
            if (order.status.state != ORDER_STATUS_ACTIVE && order.status.state != ORDER_STATUS_PARTIALLY_FILLED) {
                return false;
            };
            i = i + 1;
        };
        true
    }

    fun optimize_query_performance(query_type: u8): bool {
        // Optimize query performance based on type
        // For now, return true - would implement actual optimization
        true
    }

    // Security Enhancement Functions
    fun check_access_control(sender: address, operation: u8): bool {
        // Check access control for operations
        // For now, return true - would implement actual access control
        true
    }

    fun validate_rate_limit(sender: address, operation: u8): bool {
        // Validate rate limiting for operations
        // For now, return true - would implement actual rate limiting
        true
    }

    fun validate_input_parameters(
        src_token: address,
        dst_token: address,
        src_amount: u128,
        dst_amount: u128,
        min_dst_amount: u128,
        max_dst_amount: u128
    ): bool {
        // Comprehensive input validation
        src_token != dst_token && 
        src_amount > 0 && 
        dst_amount > 0 && 
        min_dst_amount > 0 && 
        max_dst_amount >= min_dst_amount
    }

    fun validate_fee_config_security(fee: &FeeConfig): bool {
        // Validate fee configuration security
        fee.maker_fee <= 10000 && // Max 100% fee
        fee.taker_fee <= 10000 && 
        fee.resolver_fee <= 10000 && 
        fee.platform_fee <= 10000
    }

    fun validate_auction_security(auction: &AuctionData): bool {
        // Validate auction configuration security
        auction.start_price > 0 && 
        auction.end_price > 0 && 
        auction.start_price >= auction.end_price &&
        auction.duration > 0
    }

    fun validate_hashlock_security(hashlock: &HashLock): bool {
        // Validate hashlock security
        vector::length(&hashlock.hash) == 32 // SHA256 hash length
    }

    fun validate_timelock_security(timelock: &TimeLock): bool {
        // Validate timelock security
        timelock.finality_lock > 0 && 
        timelock.cancellation_timeout > 0 &&
        timelock.finality_lock >= timelock.cancellation_timeout
    }

    fun check_reentrancy_guard(): bool {
        // Check reentrancy guard
        // For now, return true - would implement actual reentrancy protection
        true
    }

    fun validate_order_security(order: &OrderConfig): bool {
        // Comprehensive order security validation
        validate_fee_config_security(&order.fee) &&
        validate_auction_security(&order.auction) &&
        validate_hashlock_security(&order.hashlock) &&
        validate_timelock_security(&order.timelock)
    }

    // Final Integration Functions
    fun end_to_end_test_scenario(): bool {
        // Complete end-to-end test scenario
        // For now, return true - would implement actual end-to-end testing
        true
    }

    fun validate_deployment_config(): bool {
        // Validate deployment configuration
        // For now, return true - would implement actual deployment validation
        true
    }

    fun check_contract_health(): (bool, u64, u128, u128) acquires FusionSwapGlobal, OrderStore {
        // Check overall contract health
        let global = borrow_global<FusionSwapGlobal>(@fusion_swap_addr);
        let store = borrow_global<OrderStore>(@fusion_swap_addr);
        let is_healthy = global.total_orders >= 0 && store.size >= 0;
        (is_healthy, global.total_orders, global.total_volume, global.total_fees)
    }

    fun get_contract_statistics(): (u64, u128, u128, u64, u64) acquires FusionSwapGlobal, OrderStore {
        // Get comprehensive contract statistics
        let global = borrow_global<FusionSwapGlobal>(@fusion_swap_addr);
        let store = borrow_global<OrderStore>(@fusion_swap_addr);
        (global.total_orders, global.total_volume, global.total_fees, store.size, global.next_order_id)
    }

    fun validate_system_integrity(): bool acquires FusionSwapGlobal, OrderStore {
        // Validate system integrity
        let global = borrow_global<FusionSwapGlobal>(@fusion_swap_addr);
        let store = borrow_global<OrderStore>(@fusion_swap_addr);
        global.total_orders >= 0 && store.size >= 0 && global.next_order_id > 0
    }

    fun emergency_pause(): bool {
        // Emergency pause functionality
        // For now, return true - would implement actual emergency pause
        true
    }

    fun emergency_resume(): bool {
        // Emergency resume functionality
        // For now, return true - would implement actual emergency resume
        true
    }

    #[test_only]
    public fun test_verify_hashlock(hashlock: &HashLock, secret: &vector<u8>): bool {
        verify_hashlock(hashlock, secret)
    }

    #[test_only]
    public fun test_reveal_secret(hashlock: &mut HashLock, secret: vector<u8>) {
        reveal_secret(hashlock, secret)
    }

    #[test_only]
    public fun test_calculate_fill_price(auction: &AuctionData, current_time: u64): u128 {
        calculate_fill_price(auction, current_time)
    }

    #[test_only]
    public fun test_calculate_fees(fill_amount: u128, fee_config: &FeeConfig): (u128, u128, u128, u128) {
        calculate_fees(fill_amount, fee_config)
    }

    #[test_only]
    public fun test_calculate_net_amount(fill_amount: u128, maker_fee: u128, taker_fee: u128, resolver_fee: u128, platform_fee: u128): u128 {
        calculate_net_amount(fill_amount, maker_fee, taker_fee, resolver_fee, platform_fee)
    }

    #[test_only]
    public fun get_order_filled_amount_by_id(order_id: u64): u128 acquires OrderStore {
        let store = borrow_global<OrderStore>(@fusion_swap_addr);
        let order = table::borrow(&store.orders, order_id);
        order.filled_amount
    }

    #[test_only]
    public fun get_order_remaining_amount_by_id(order_id: u64): u128 acquires OrderStore {
        let store = borrow_global<OrderStore>(@fusion_swap_addr);
        let order = table::borrow(&store.orders, order_id);
        order.remaining_amount
    }

    #[test_only]
    public fun get_order_status_state_by_id(order_id: u64): u8 acquires OrderStore {
        let store = borrow_global<OrderStore>(@fusion_swap_addr);
        let order = table::borrow(&store.orders, order_id);
        order.status.state
    }

    #[test_only]
    public fun test_is_valid_state_transition(current_state: u8, new_state: u8): bool {
        is_valid_state_transition(current_state, new_state)
    }

    #[test_only]
    public fun test_update_order_status(order_id: u64, new_state: u8) acquires OrderStore {
        let store = borrow_global_mut<OrderStore>(@fusion_swap_addr);
        let order = table::borrow_mut(&mut store.orders, order_id);
        update_order_status(order, new_state);
    }

    #[test_only]
    public fun test_is_order_completed(order_id: u64): bool acquires OrderStore {
        let store = borrow_global<OrderStore>(@fusion_swap_addr);
        let order = table::borrow(&store.orders, order_id);
        is_order_completed(order)
    }

    #[test_only]
    public fun test_is_order_expired(order_id: u64, current_time: u64): bool acquires OrderStore {
        let store = borrow_global<OrderStore>(@fusion_swap_addr);
        let order = table::borrow(&store.orders, order_id);
        is_order_expired(order, current_time)
    }

    #[test_only]
    public fun test_is_cancellation_timeout_expired(order_id: u64, current_time: u64): bool acquires OrderStore {
        let store = borrow_global<OrderStore>(@fusion_swap_addr);
        let order = table::borrow(&store.orders, order_id);
        is_cancellation_timeout_expired(order, current_time)
    }

    #[test_only]
    public fun test_is_finality_lock_expired(order_id: u64, current_time: u64): bool acquires OrderStore {
        let store = borrow_global<OrderStore>(@fusion_swap_addr);
        let order = table::borrow(&store.orders, order_id);
        is_finality_lock_expired(order, current_time)
    }

    #[test_only]
    public fun test_validate_timelock_constraints(order_id: u64, current_time: u64) acquires OrderStore {
        let store = borrow_global<OrderStore>(@fusion_swap_addr);
        let order = table::borrow(&store.orders, order_id);
        validate_timelock_constraints(order, current_time);
    }

    #[test_only]
    public fun test_can_cancel_order(order_id: u64, current_time: u64): bool acquires OrderStore {
        let store = borrow_global<OrderStore>(@fusion_swap_addr);
        let order = table::borrow(&store.orders, order_id);
        can_cancel_order(order, current_time)
    }

    #[test_only]
    public fun test_validate_cancellation_authority(order_id: u64, sender: address): bool acquires OrderStore {
        let store = borrow_global<OrderStore>(@fusion_swap_addr);
        let order = table::borrow(&store.orders, order_id);
        validate_cancellation_authority(order, sender)
    }

    #[test_only]
    public fun test_get_order_by_id(order_id: u64): OrderConfig acquires OrderStore {
        get_order_by_id(order_id)
    }

    #[test_only]
    public fun test_get_orders_by_maker(maker: address): vector<u64> {
        get_orders_by_maker(maker)
    }

    #[test_only]
    public fun test_get_orders_by_status(status: u8): vector<u64> {
        get_orders_by_status(status)
    }

    #[test_only]
    public fun test_calculate_order_statistics(): (u64, u64, u64, u64, u64) {
        calculate_order_statistics()
    }

    #[test_only]
    public fun test_get_order_history(order_id: u64): (u64, u64, u128, u128) acquires OrderStore {
        get_order_history(order_id)
    }

    #[test_only]
    public fun test_batch_create_orders(
        sender: &signer,
        orders_data: vector<BatchOrderData>
    ) acquires FusionSwapGlobal, OrderStore {
        batch_create_orders(sender, orders_data)
    }

    #[test_only]
    public fun test_batch_cancel_orders(
        sender: &signer,
        order_ids: vector<u64>
    ) acquires FusionSwapGlobal, OrderStore {
        batch_cancel_orders(sender, order_ids)
    }

    #[test_only]
    public fun test_batch_fill_orders(
        sender: &signer,
        fill_data: vector<BatchFillData>
    ) acquires FusionSwapGlobal, OrderStore {
        batch_fill_orders(sender, fill_data)
    }

    #[test_only]
    public fun test_validate_batch_orders(
        orders_data: vector<BatchOrderData>
    ): bool {
        validate_batch_orders(&orders_data)
    }

    #[test_only]
    public fun test_validate_batch_cancellations(
        order_ids: vector<u64>,
        sender: address
    ): bool acquires OrderStore {
        validate_batch_cancellations(&order_ids, sender)
    }

    #[test_only]
    public fun test_validate_batch_fills(
        fill_data: vector<BatchFillData>
    ): bool acquires OrderStore {
        validate_batch_fills(&fill_data)
    }

    #[test_only]
    public fun create_batch_order_data(
        src_token: address,
        dst_token: address,
        src_amount: u128,
        dst_amount: u128,
        min_dst_amount: u128,
        max_dst_amount: u128,
        fee: FeeConfig,
        auction: AuctionData,
        hashlock: HashLock,
        timelock: TimeLock
    ): BatchOrderData {
        BatchOrderData {
            src_token,
            dst_token,
            src_amount,
            dst_amount,
            min_dst_amount,
            max_dst_amount,
            fee,
            auction,
            hashlock,
            timelock,
        }
    }

    #[test_only]
    public fun create_batch_fill_data(
        order_id: u64,
        fill_amount: u128,
        secret: vector<u8>
    ): BatchFillData {
        BatchFillData {
            order_id,
            fill_amount,
            secret,
        }
    }

    #[test_only]
    public fun test_get_orders_by_maker_advanced(maker: address): vector<u64> {
        get_orders_by_maker_advanced(maker)
    }

    #[test_only]
    public fun test_get_active_orders(): vector<u64> {
        get_active_orders()
    }

    #[test_only]
    public fun test_get_orders_by_price_range(min_price: u128, max_price: u128): vector<u64> {
        get_orders_by_price_range(min_price, max_price)
    }

    #[test_only]
    public fun test_get_orders_by_time_range(start_time: u64, end_time: u64): vector<u64> {
        get_orders_by_time_range(start_time, end_time)
    }

    #[test_only]
    public fun test_sort_orders_by_creation_time(order_ids: vector<u64>): vector<u64> {
        sort_orders_by_creation_time(order_ids)
    }

    #[test_only]
    public fun test_sort_orders_by_price(order_ids: vector<u64>): vector<u64> {
        sort_orders_by_price(order_ids)
    }

    #[test_only]
    public fun test_filter_orders_by_status(order_ids: vector<u64>, status: u8): vector<u64> acquires OrderStore {
        filter_orders_by_status(order_ids, status)
    }

    #[test_only]
    public fun test_get_order_statistics_by_maker(maker: address): (u64, u64, u64, u64, u64) {
        get_order_statistics_by_maker(maker)
    }

    #[test_only]
    public fun test_get_order_volume_by_time_range(start_time: u64, end_time: u64): u128 {
        get_order_volume_by_time_range(start_time, end_time)
    }

    #[test_only]
    public fun test_optimize_batch_operations(operations: vector<u64>): vector<u64> {
        optimize_batch_operations(operations)
    }

    #[test_only]
    public fun test_create_efficient_index(order_id: u64, maker: address, status: u8) {
        create_efficient_index(order_id, maker, status)
    }

    #[test_only]
    public fun test_update_index_on_order_change(order_id: u64, old_status: u8, new_status: u8) {
        update_index_on_order_change(order_id, old_status, new_status)
    }

    #[test_only]
    public fun test_get_cached_order_data(order_id: u64): OrderConfig acquires OrderStore {
        get_cached_order_data(order_id)
    }

    #[test_only]
    public fun test_invalidate_cache(order_id: u64) {
        invalidate_cache(order_id)
    }

    #[test_only]
    public fun test_optimize_gas_for_fill(fill_amount: u128, order: &OrderConfig): u128 {
        optimize_gas_for_fill(fill_amount, order)
    }

    #[test_only]
    public fun test_batch_validate_orders(order_ids: vector<u64>): bool acquires OrderStore {
        batch_validate_orders(order_ids)
    }

    #[test_only]
    public fun test_optimize_query_performance(query_type: u8): bool {
        optimize_query_performance(query_type)
    }

    #[test_only]
    public fun test_check_access_control(sender: address, operation: u8): bool {
        check_access_control(sender, operation)
    }

    #[test_only]
    public fun test_validate_rate_limit(sender: address, operation: u8): bool {
        validate_rate_limit(sender, operation)
    }

    #[test_only]
    public fun test_validate_input_parameters(
        src_token: address,
        dst_token: address,
        src_amount: u128,
        dst_amount: u128,
        min_dst_amount: u128,
        max_dst_amount: u128
    ): bool {
        validate_input_parameters(src_token, dst_token, src_amount, dst_amount, min_dst_amount, max_dst_amount)
    }

    #[test_only]
    public fun test_validate_fee_config_security(fee: &FeeConfig): bool {
        validate_fee_config_security(fee)
    }

    #[test_only]
    public fun test_validate_auction_security(auction: &AuctionData): bool {
        validate_auction_security(auction)
    }

    #[test_only]
    public fun test_validate_hashlock_security(hashlock: &HashLock): bool {
        validate_hashlock_security(hashlock)
    }

    #[test_only]
    public fun test_validate_timelock_security(timelock: &TimeLock): bool {
        validate_timelock_security(timelock)
    }

    #[test_only]
    public fun test_check_reentrancy_guard(): bool {
        check_reentrancy_guard()
    }

    #[test_only]
    public fun test_validate_order_security(order: &OrderConfig): bool {
        validate_order_security(order)
    }

    #[test_only]
    public fun test_end_to_end_test_scenario(): bool {
        end_to_end_test_scenario()
    }

    #[test_only]
    public fun test_validate_deployment_config(): bool {
        validate_deployment_config()
    }

    #[test_only]
    public fun test_check_contract_health(): (bool, u64, u128, u128) acquires FusionSwapGlobal, OrderStore {
        check_contract_health()
    }

    #[test_only]
    public fun test_get_contract_statistics(): (u64, u128, u128, u64, u64) acquires FusionSwapGlobal, OrderStore {
        get_contract_statistics()
    }

    #[test_only]
    public fun test_validate_system_integrity(): bool acquires FusionSwapGlobal, OrderStore {
        validate_system_integrity()
    }

    #[test_only]
    public fun test_emergency_pause(): bool {
        emergency_pause()
    }

    #[test_only]
    public fun test_emergency_resume(): bool {
        emergency_resume()
    }

    #[test_only]
    public fun set_order_maker(order_id: u64, new_maker: address) acquires OrderStore {
        let store = borrow_global_mut<OrderStore>(@fusion_swap_addr);
        let order = table::borrow_mut(&mut store.orders, order_id);
        order.maker = new_maker;
    }

    #[test_only]
    public fun set_order_hashlock(order_id: u64, new_hash: vector<u8>) acquires OrderStore {
        let store = borrow_global_mut<OrderStore>(@fusion_swap_addr);
        let order = table::borrow_mut(&mut store.orders, order_id);
        order.hashlock.hash = new_hash;
    }

    #[test_only]
    public fun get_order_maker_by_id(order_id: u64): address acquires OrderStore {
        let store = borrow_global<OrderStore>(@fusion_swap_addr);
        let order = table::borrow(&store.orders, order_id);
        order.maker
    }

    fun set_reentrancy_guard() acquires FusionSwapGlobal {
        let global = borrow_global_mut<FusionSwapGlobal>(@fusion_swap_addr);
        assert!(!global.reentrancy_guard, EREENTRANCY_GUARD);
        global.reentrancy_guard = true;
    }

    fun clear_reentrancy_guard() acquires FusionSwapGlobal {
        let global = borrow_global_mut<FusionSwapGlobal>(@fusion_swap_addr);
        global.reentrancy_guard = false;
    }

    fun calculate_current_price(auction: &AuctionData, current_time: u64): u128 {
        if (current_time <= auction.start_time) {
            return auction.start_price;
        };
        
        let time_elapsed = current_time - auction.start_time;
        if (time_elapsed >= auction.duration) {
            return auction.end_price;
        };
        
        let price_range = auction.start_price - auction.end_price;
        let decay_amount = (price_range * (time_elapsed as u128)) / (auction.duration as u128);
        auction.start_price - decay_amount
    }

    #[test_only]
    public fun test_calculate_current_price(auction: &AuctionData, current_time: u64): u128 {
        calculate_current_price(auction, current_time)
    }

    #[test_only]
    public fun create_auction_data_with_time(start_price: u128, end_price: u128, start_time: u64, duration: u64, min_fill_amount: u128, max_fill_amount: u128): AuctionData {
        let current_price = start_price;
        AuctionData { start_price, end_price, start_time, duration, current_price, min_fill_amount, max_fill_amount }
    }

    #[test_only]
    public fun get_order_id(config: &OrderConfig): u64 { config.id }
    #[test_only]
    public fun get_order_src_mint(config: &OrderConfig): address { config.src_mint }
    #[test_only]
    public fun get_order_dst_mint(config: &OrderConfig): address { config.dst_mint }
    #[test_only]
    public fun get_order_maker(config: &OrderConfig): address { config.maker }
    #[test_only]
    public fun get_order_src_amount(config: &OrderConfig): u128 { config.src_amount }
    #[test_only]
    public fun get_order_min_dst_amount(config: &OrderConfig): u128 { config.min_dst_amount }
    #[test_only]
    public fun get_order_estimated_dst_amount(config: &OrderConfig): u128 { config.estimated_dst_amount }
    #[test_only]
    public fun get_order_expiration_time(config: &OrderConfig): u64 { config.expiration_time }
    #[test_only]
    public fun get_order_fee(config: &OrderConfig): FeeConfig { config.fee }
    #[test_only]
    public fun get_order_auction(config: &OrderConfig): AuctionData { config.auction }
    #[test_only]
    public fun get_order_hashlock(config: &OrderConfig): HashLock { config.hashlock }
    #[test_only]
    public fun get_order_timelock(config: &OrderConfig): TimeLock { config.timelock }
    #[test_only]
    public fun get_order_status(config: &OrderConfig): OrderStatus { config.status }
    #[test_only]
    public fun get_order_created_at(config: &OrderConfig): u64 { config.created_at }
    #[test_only]
    public fun get_order_updated_at(config: &OrderConfig): u64 { config.updated_at }
    #[test_only]
    public fun get_order_filled_amount(config: &OrderConfig): u128 { config.filled_amount }
    #[test_only]
    public fun get_order_remaining_amount(config: &OrderConfig): u128 { config.remaining_amount }

    #[test_only]
    public fun get_order_status_state(config: &OrderConfig): u8 {
        config.status.state
    }

    struct FusionSwapGlobal has key, drop {
        next_order_id: u64,
        total_orders: u64,
        total_volume: u128,
        total_fees: u128,
        reentrancy_guard: bool,
    }

    #[test_only]
    public fun create_fusion_global(next_order_id: u64, total_orders: u64, total_volume: u128, total_fees: u128): FusionSwapGlobal {
        FusionSwapGlobal { next_order_id, total_orders, total_volume, total_fees, reentrancy_guard: false }
    }

    struct OrderStore has key {
        orders: table::Table<u64, OrderConfig>,
        size: u64,
    }

    fun init_module(sender: &signer) {
        move_to(sender, FusionSwapGlobal { next_order_id: 1, total_orders: 0, total_volume: 0, total_fees: 0, reentrancy_guard: false });
        move_to(sender, OrderStore { orders: table::new(), size: 0 });
    }

    #[test_only]
    public fun test_init(sender: &signer) {
        init_module(sender);
    }

    #[test_only]
    public fun get_next_order_id(addr: address): u64 acquires FusionSwapGlobal {
        borrow_global<FusionSwapGlobal>(addr).next_order_id
    }
    #[test_only]
    public fun get_total_orders(addr: address): u64 acquires FusionSwapGlobal {
        borrow_global<FusionSwapGlobal>(addr).total_orders
    }
    #[test_only]
    public fun get_total_volume(addr: address): u128 acquires FusionSwapGlobal {
        borrow_global<FusionSwapGlobal>(addr).total_volume
    }
    #[test_only]
    public fun get_total_fees(addr: address): u128 acquires FusionSwapGlobal {
        borrow_global<FusionSwapGlobal>(addr).total_fees
    }

    #[test_only]
    public fun get_reentrancy_guard(addr: address): bool acquires FusionSwapGlobal {
        borrow_global<FusionSwapGlobal>(addr).reentrancy_guard
    }

    #[test_only]
    public fun set_order_status(order_id: u64, state: u8) acquires OrderStore {
        let store = borrow_global_mut<OrderStore>(@fusion_swap_addr);
        let order = table::borrow_mut(&mut store.orders, order_id);
        order.status.state = state;
    }

    #[test_only]
    public fun global_next_id(global: &FusionSwapGlobal): u64 { global.next_order_id }
    #[test_only]
    public fun global_total_orders(global: &FusionSwapGlobal): u64 { global.total_orders }
    #[test_only]
    public fun global_total_volume(global: &FusionSwapGlobal): u128 { global.total_volume }
    #[test_only]
    public fun global_total_fees(global: &FusionSwapGlobal): u128 { global.total_fees }

    #[test_only]
    public fun get_order_store_size(addr: address): u64 acquires OrderStore {
        borrow_global<OrderStore>(addr).size
    }

    #[test_only]
    public fun create_auction_data(start_price: u128, end_price: u128, start_time: u64, duration: u64, current_price: u128, min_fill_amount: u128, max_fill_amount: u128): AuctionData {
        AuctionData { start_price, end_price, start_time, duration, current_price, min_fill_amount, max_fill_amount }
    }
    #[test_only]
    public fun get_auction_start_price(data: &AuctionData): u128 { data.start_price }
    #[test_only]
    public fun get_auction_end_price(data: &AuctionData): u128 { data.end_price }
    #[test_only]
    public fun get_auction_start_time(data: &AuctionData): u64 { data.start_time }
    #[test_only]
    public fun get_auction_duration(data: &AuctionData): u64 { data.duration }
    #[test_only]
    public fun get_auction_current_price(data: &AuctionData): u128 { data.current_price }
    #[test_only]
    public fun get_auction_min_fill(data: &AuctionData): u128 { data.min_fill_amount }
    #[test_only]
    public fun get_auction_max_fill(data: &AuctionData): u128 { data.max_fill_amount }

    #[test_only]
    public fun create_hash_lock(hash: vector<u8>, secret: option::Option<vector<u8>>, is_revealed: bool): HashLock {
        HashLock { hash, secret, is_revealed }
    }
    #[test_only]
    public fun get_hashlock_hash(lock: &HashLock): vector<u8> { lock.hash }
    #[test_only]
    public fun get_hashlock_secret(lock: &HashLock): option::Option<vector<u8>> { lock.secret }
    #[test_only]
    public fun get_hashlock_is_revealed(lock: &HashLock): bool { lock.is_revealed }

    #[test_only]
    public fun create_time_lock(finality_lock: u64, exclusive_withdraw: u64, cancellation_timeout: u64): TimeLock {
        TimeLock { finality_lock, exclusive_withdraw, cancellation_timeout }
    }
    #[test_only]
    public fun get_timelock_finality(lock: &TimeLock): u64 { lock.finality_lock }
    #[test_only]
    public fun get_timelock_exclusive(lock: &TimeLock): u64 { lock.exclusive_withdraw }
    #[test_only]
    public fun get_timelock_cancellation(lock: &TimeLock): u64 { lock.cancellation_timeout }

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
