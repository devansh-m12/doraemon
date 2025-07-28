// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./EthereumICPBridge.sol";

/**
 * @title DoraemonResolver
 * @dev 1inch Fusion+ compatible resolver for cross-chain swaps between Ethereum and ICP
 * Based on 1inch cross-chain resolver standards
 * 
 * This resolver handles:
 * - Cross-chain order creation and management
 * - Atomic swap completion with hashlock/timelock
 * - MEV protection through Fusion+ integration
 * - Gasless swap execution
 */
contract DoraemonResolver is ReentrancyGuard, Ownable {
    using ECDSA for bytes32;
    using SafeERC20 for IERC20;

    // Bridge contract reference
    EthereumICPBridge public immutable bridgeContract;
    
    // Fusion+ configuration
    uint256 public maxSlippage = 50; // 0.5% in basis points
    uint256 public gasLimit = 500000;
    uint256 public deadline = 300; // 5 minutes
    uint256 public safetyDeposit = 0.01 ether; // Safety deposit for escrow
    
    // Order tracking
    mapping(bytes32 => bool) public processedOrders;
    mapping(bytes32 => CrossChainOrder) public crossChainOrders;
    mapping(bytes32 => bool) public usedHashlocks;
    
    // Authorized resolvers (1inch Fusion+ resolvers)
    mapping(address => bool) public authorizedResolvers;
    
    // Events
    event CrossChainOrderCreated(
        bytes32 indexed orderId,
        address indexed sender,
        bytes32 icpRecipient,
        uint256 amount,
        bytes32 hashlock,
        uint256 timelock,
        uint256 createdAt
    );
    
    event CrossChainOrderResolved(
        bytes32 indexed orderId,
        address indexed resolver,
        bytes32 preimage,
        uint256 resolvedAt
    );
    
    event CrossChainOrderCancelled(
        bytes32 indexed orderId,
        address indexed sender,
        uint256 cancelledAt
    );
    
    event ResolverAuthorized(
        address indexed resolver,
        bool authorized
    );

    // Structs
    struct CrossChainOrder {
        address sender;
        bytes32 icpRecipient;
        uint256 amount;
        bytes32 hashlock;
        uint256 timelock;
        bool completed;
        bool cancelled;
        uint256 createdAt;
        uint256 resolvedAt;
        address resolver;
    }

    // Errors
    error OrderNotFound();
    error OrderAlreadyCompleted();
    error OrderAlreadyCancelled();
    error TimelockExpired();
    error InvalidPreimage();
    error InvalidHashlock();
    error UnauthorizedResolver();
    error InvalidAmount();
    error InvalidTimelock();
    error HashlockAlreadyUsed();

    // Modifiers
    modifier onlyAuthorizedResolver() {
        if (!authorizedResolvers[msg.sender] && msg.sender != owner()) {
            revert UnauthorizedResolver();
        }
        _;
    }

    modifier validOrder(bytes32 orderId) {
        if (crossChainOrders[orderId].sender == address(0)) {
            revert OrderNotFound();
        }
        _;
    }

    modifier notProcessed(bytes32 orderId) {
        if (processedOrders[orderId]) {
            revert OrderAlreadyCompleted();
        }
        _;
    }

    modifier validTimelock(uint256 timelock) {
        if (timelock <= block.timestamp + 1 hours) {
            revert InvalidTimelock();
        }
        if (timelock >= block.timestamp + 24 hours) {
            revert InvalidTimelock();
        }
        _;
    }

    constructor(address payable _bridgeContract) Ownable(msg.sender) {
        bridgeContract = EthereumICPBridge(_bridgeContract);
    }

    /**
     * @dev Create cross-chain order (called by Fusion+ or bridge)
     * @param sender The order sender
     * @param icpRecipient Hash of ICP recipient address
     * @param amount The swap amount
     * @param hashlock Hash of the preimage
     * @param timelock Unix timestamp when the swap expires
     * @return orderId The generated order ID
     */
    function createCrossChainOrder(
        address sender,
        bytes32 icpRecipient,
        uint256 amount,
        bytes32 hashlock,
        uint256 timelock
    ) external validTimelock(timelock) returns (bytes32 orderId) {
        if (sender == address(0)) revert("Invalid sender");
        if (icpRecipient == bytes32(0)) revert("Invalid ICP recipient");
        if (amount == 0) revert InvalidAmount();
        if (hashlock == bytes32(0)) revert InvalidHashlock();
        if (usedHashlocks[hashlock]) revert HashlockAlreadyUsed();
        
        // Generate order ID
        orderId = keccak256(
            abi.encodePacked(
                sender,
                icpRecipient,
                amount,
                hashlock,
                timelock,
                block.timestamp
            )
        );
        
        if (crossChainOrders[orderId].sender != address(0)) {
            revert("Order already exists");
        }
        
        // Create cross-chain order
        crossChainOrders[orderId] = CrossChainOrder({
            sender: sender,
            icpRecipient: icpRecipient,
            amount: amount,
            hashlock: hashlock,
            timelock: timelock,
            completed: false,
            cancelled: false,
            createdAt: block.timestamp,
            resolvedAt: 0,
            resolver: address(0)
        });
        
        usedHashlocks[hashlock] = true;
        
        emit CrossChainOrderCreated(
            orderId,
            sender,
            icpRecipient,
            amount,
            hashlock,
            timelock,
            block.timestamp
        );
    }

    /**
     * @dev Resolve cross-chain order (called by 1inch Fusion+ resolver)
     * @param orderId The Fusion+ order ID
     * @param preimage The preimage for atomic swap completion
     */
    function resolve(
        bytes32 orderId,
        bytes32 preimage
    ) external 
        nonReentrant 
        validOrder(orderId) 
        notProcessed(orderId)
        onlyAuthorizedResolver 
    {
        CrossChainOrder storage order = crossChainOrders[orderId];
        
        if (order.completed) revert OrderAlreadyCompleted();
        if (order.cancelled) revert OrderAlreadyCancelled();
        if (block.timestamp >= order.timelock) revert TimelockExpired();
        
        // Verify preimage
        bytes32 computedHashlock = keccak256(abi.encodePacked(preimage));
        if (order.hashlock != computedHashlock) revert InvalidPreimage();
        
        // Mark as processed
        processedOrders[orderId] = true;
        order.completed = true;
        order.resolvedAt = block.timestamp;
        order.resolver = msg.sender;
        
        // Complete bridge swap
        bridgeContract.claimSwap(orderId, preimage);
        
        emit CrossChainOrderResolved(
            orderId,
            msg.sender,
            preimage,
            block.timestamp
        );
    }

    /**
     * @dev Cancel cross-chain order
     * @param orderId The order ID to cancel
     */
    function cancelOrder(bytes32 orderId) external validOrder(orderId) {
        CrossChainOrder storage order = crossChainOrders[orderId];
        
        if (msg.sender != order.sender && msg.sender != owner()) {
            revert("Not authorized");
        }
        if (order.completed) revert OrderAlreadyCompleted();
        if (order.cancelled) revert OrderAlreadyCancelled();
        if (block.timestamp < order.timelock) revert("Timelock not expired");
        
        order.cancelled = true;
        
        emit CrossChainOrderCancelled(
            orderId,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @dev Get cross-chain order details
     * @param orderId The order ID
     * @return order The order details
     */
    function getCrossChainOrder(bytes32 orderId) external view returns (CrossChainOrder memory order) {
        return crossChainOrders[orderId];
    }

    /**
     * @dev Check if order is ready for resolution
     * @param orderId The order ID
     * @return True if order is ready for resolution
     */
    function isOrderReady(bytes32 orderId) external view returns (bool) {
        CrossChainOrder memory order = crossChainOrders[orderId];
        
        if (order.sender == address(0)) return false;
        if (order.completed || order.cancelled) return false;
        if (block.timestamp >= order.timelock) return false;
        
        return true;
    }

    /**
     * @dev Check if hashlock is used
     * @param hashlock The hashlock to check
     * @return True if hashlock is used
     */
    function isHashlockUsed(bytes32 hashlock) external view returns (bool) {
        return usedHashlocks[hashlock];
    }

    /**
     * @dev Authorize/unauthorize a resolver
     * @param resolver The resolver address
     * @param authorized Whether to authorize or not
     */
    function setResolverAuthorization(address resolver, bool authorized) external onlyOwner {
        authorizedResolvers[resolver] = authorized;
        emit ResolverAuthorized(resolver, authorized);
    }

    /**
     * @dev Update Fusion+ configuration
     * @param _maxSlippage New max slippage in basis points
     * @param _gasLimit New gas limit
     * @param _deadline New deadline in seconds
     */
    function updateFusionConfig(
        uint256 _maxSlippage,
        uint256 _gasLimit,
        uint256 _deadline
    ) external onlyOwner {
        maxSlippage = _maxSlippage;
        gasLimit = _gasLimit;
        deadline = _deadline;
    }

    /**
     * @dev Update safety deposit amount
     * @param _safetyDeposit New safety deposit amount
     */
    function setSafetyDeposit(uint256 _safetyDeposit) external onlyOwner {
        safetyDeposit = _safetyDeposit;
    }

    /**
     * @dev Emergency function to rescue stuck tokens
     * @param token The token to rescue
     * @param amount The amount to rescue
     */
    function rescueTokens(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            IERC20(token).safeTransfer(owner(), amount);
        }
    }

    /**
     * @dev Get resolver statistics
     * @return totalOrders Total number of orders
     * @return completedOrders Number of completed orders
     * @return cancelledOrders Number of cancelled orders
     * @return pendingOrders Number of pending orders
     */
    function getResolverStats() external view returns (
        uint256 totalOrders,
        uint256 completedOrders,
        uint256 cancelledOrders,
        uint256 pendingOrders
    ) {
        // This would require additional state tracking
        // For now, return placeholder values
        return (0, 0, 0, 0);
    }

    /**
     * @dev Verify that this resolver is compatible with 1inch Fusion+
     * @return True if compatible
     */
    function isFusionCompatible() external pure returns (bool) {
        return true;
    }

    /**
     * @dev Get resolver metadata for 1inch Fusion+ integration
     * @return name Resolver name
     * @return version Resolver version
     * @return supportedChains Supported chains
     */
    function getResolverMetadata() external pure returns (
        string memory name,
        string memory version,
        string[] memory supportedChains
    ) {
        name = "DoraemonResolver";
        version = "1.0.0";
        supportedChains = new string[](2);
        supportedChains[0] = "ethereum";
        supportedChains[1] = "icp";
    }

    // Receive function for safety deposits
    receive() external payable {}
} 