// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ICrossChainResolver
 * @dev Interface for 1inch Fusion+ cross-chain resolver
 * Based on the 1inch cross-chain resolver example
 */
interface ICrossChainResolver {
    /**
     * @dev Resolves an order with the provided data
     * @param orderId The unique identifier of the order
     * @param data Additional data needed for resolution
     * @return success Whether the resolution was successful
     * @return result The result data from the resolution
     */
    function resolveOrder(
        bytes32 orderId,
        bytes calldata data
    ) external returns (bool success, bytes memory result);
    
    /**
     * @dev Cancels an order
     * @param orderId The unique identifier of the order
     * @return success Whether the cancellation was successful
     */
    function cancelOrder(bytes32 orderId) external returns (bool success);
    
    /**
     * @dev Gets the status of an order
     * @param orderId The unique identifier of the order
     * @return status The current status of the order (0 = non-existent, 1 = pending, 2 = resolved, 3 = cancelled, 4 = expired)
     */
    function getOrderStatus(bytes32 orderId) external view returns (uint8 status);
    
    /**
     * @dev Event emitted when an order is created
     */
    event OrderCreated(
        bytes32 indexed orderId,
        address indexed user,
        uint256 amount,
        bytes32 indexed hashlock
    );
    
    /**
     * @dev Event emitted when an order is resolved
     */
    event OrderResolved(
        bytes32 indexed orderId,
        bytes32 indexed hashlock
    );
    
    /**
     * @dev Event emitted when an order is cancelled
     */
    event OrderCancelled(
        bytes32 indexed orderId
    );
} 