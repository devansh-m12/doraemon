// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./ICrossChainResolver.sol";

/**
 * @title ICPFusionResolverV2
 * @dev Improved ICP Fusion+ resolver that properly implements the 1inch Fusion+ interface
 * Based on the 1inch cross-chain resolver example
 */
contract ICPFusionResolverV2 is ICrossChainResolver {
    enum OrderStatus { 
        NON_EXISTENT,  // 0
        PENDING,       // 1
        RESOLVED,      // 2
        CANCELLED,     // 3
        EXPIRED        // 4
    }
    
    struct Order {
        address user;
        uint256 amount;
        bytes32 hashlock;
        uint256 timelock;
        OrderStatus status;
        bool exists;
        string icpRecipient; // ICP recipient address
    }
    
    // State variables
    mapping(bytes32 => Order) public orders;
    mapping(bytes32 => bool) public hashlockUsed;
    mapping(address => bytes32[]) public userOrders;
    
    // Access control
    address public owner;
    mapping(address => bool) public authorizedRelayers;
    
    // Additional events (not in interface)
    event OrderCreated(
        bytes32 indexed orderId,
        address indexed user,
        uint256 amount,
        bytes32 indexed hashlock,
        string icpRecipient
    );
    
    event OrderResolved(
        bytes32 indexed orderId,
        bytes32 indexed hashlock,
        bytes preimage
    );
    
    event RelayerAuthorized(address indexed relayer);
    event RelayerRevoked(address indexed relayer);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier onlyAuthorizedRelayer() {
        require(authorizedRelayers[msg.sender] || msg.sender == owner, "Only authorized relayer");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        authorizedRelayers[msg.sender] = true;
    }
    
    /**
     * @dev Creates a new cross-chain order
     * @param user The user creating the order
     * @param amount The amount to swap
     * @param hashlock The hashlock for atomic swap
     * @param timelock The timelock deadline
     * @param icpRecipient The ICP recipient address
     * @return orderId The unique identifier of the created order
     */
    function createOrder(
        address user,
        uint256 amount,
        bytes32 hashlock,
        uint256 timelock,
        string memory icpRecipient
    ) external onlyAuthorizedRelayer returns (bytes32 orderId) {
        require(hashlock != bytes32(0), "Invalid hashlock");
        require(timelock > block.timestamp, "Invalid timelock");
        require(!hashlockUsed[hashlock], "Hashlock already used");
        require(bytes(icpRecipient).length > 0, "Invalid ICP recipient");
        
        orderId = keccak256(abi.encodePacked(
            user,
            amount,
            hashlock,
            timelock,
            icpRecipient,
            block.timestamp
        ));
        
        require(!orders[orderId].exists, "Order already exists");
        
        orders[orderId] = Order({
            user: user,
            amount: amount,
            hashlock: hashlock,
            timelock: timelock,
            status: OrderStatus.PENDING,
            exists: true,
            icpRecipient: icpRecipient
        });
        
        hashlockUsed[hashlock] = true;
        userOrders[user].push(orderId);
        
        emit OrderCreated(orderId, user, amount, hashlock, icpRecipient);
    }
    
    /**
     * @dev Resolves an order with the provided preimage
     * @param orderId The unique identifier of the order
     * @param data The preimage data
     * @return success Whether the resolution was successful
     * @return result The preimage data
     */
    function resolveOrder(
        bytes32 orderId,
        bytes calldata data
    ) external override onlyAuthorizedRelayer returns (bool success, bytes memory result) {
        Order storage order = orders[orderId];
        require(order.exists, "Order does not exist");
        require(order.status == OrderStatus.PENDING, "Order not pending");
        require(block.timestamp <= order.timelock, "Order expired");
        require(data.length > 0, "Invalid preimage");
        
        bytes32 computedHashlock = keccak256(data);
        require(computedHashlock == order.hashlock, "Invalid preimage");
        
        order.status = OrderStatus.RESOLVED;
        
        emit OrderResolved(orderId, order.hashlock, data);
        
        return (true, data);
    }
    
    /**
     * @dev Cancels an expired order
     * @param orderId The unique identifier of the order
     * @return success Whether the cancellation was successful
     */
    function cancelOrder(bytes32 orderId) external override onlyAuthorizedRelayer returns (bool success) {
        Order storage order = orders[orderId];
        require(order.exists, "Order does not exist");
        require(order.status == OrderStatus.PENDING, "Order not pending");
        require(block.timestamp > order.timelock, "Order not expired");
        
        order.status = OrderStatus.CANCELLED;
        
        emit OrderCancelled(orderId);
        
        return true;
    }
    
    /**
     * @dev Gets the status of an order
     * @param orderId The unique identifier of the order
     * @return status The current status of the order
     */
    function getOrderStatus(bytes32 orderId) external view override returns (uint8 status) {
        Order storage order = orders[orderId];
        if (!order.exists) return uint8(OrderStatus.NON_EXISTENT);
        
        if (order.status == OrderStatus.PENDING && block.timestamp > order.timelock) {
            return uint8(OrderStatus.EXPIRED);
        }
        
        return uint8(order.status);
    }
    
    /**
     * @dev Gets order details
     * @param orderId The unique identifier of the order
     * @return user The user who created the order
     * @return amount The order amount
     * @return hashlock The order hashlock
     * @return timelock The order timelock
     * @return status The order status
     * @return icpRecipient The ICP recipient address
     */
    function getOrder(bytes32 orderId) external view returns (
        address user,
        uint256 amount,
        bytes32 hashlock,
        uint256 timelock,
        OrderStatus status,
        string memory icpRecipient
    ) {
        Order storage order = orders[orderId];
        require(order.exists, "Order does not exist");
        
        return (
            order.user,
            order.amount,
            order.hashlock,
            order.timelock,
            order.status,
            order.icpRecipient
        );
    }
    
    /**
     * @dev Gets all orders for a user
     * @param user The user address
     * @return Array of order IDs
     */
    function getUserOrders(address user) external view returns (bytes32[] memory) {
        return userOrders[user];
    }
    
    /**
     * @dev Authorizes a relayer
     * @param relayer The relayer address to authorize
     */
    function authorizeRelayer(address relayer) external onlyOwner {
        require(relayer != address(0), "Invalid relayer address");
        authorizedRelayers[relayer] = true;
        emit RelayerAuthorized(relayer);
    }
    
    /**
     * @dev Revokes a relayer's authorization
     * @param relayer The relayer address to revoke
     */
    function revokeRelayer(address relayer) external onlyOwner {
        require(relayer != owner, "Cannot revoke owner");
        authorizedRelayers[relayer] = false;
        emit RelayerRevoked(relayer);
    }
    
    /**
     * @dev Checks if an address is an authorized relayer
     * @param relayer The address to check
     * @return Whether the address is authorized
     */
    function isAuthorizedRelayer(address relayer) external view returns (bool) {
        return authorizedRelayers[relayer] || relayer == owner;
    }
} 