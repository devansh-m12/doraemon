// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./EthereumICPBridge.sol";

/**
 * @title FusionResolver
 * @dev Custom resolver for 1inch Fusion+ that handles cross-chain order fulfillment
 * Integrates with EthereumICPBridge for atomic swaps between Ethereum and ICP
 */
contract FusionResolver is ReentrancyGuard, Ownable {
    using ECDSA for bytes32;

    // Bridge contract reference
    EthereumICPBridge public bridgeContract;
    
    // Fusion+ configuration
    uint256 public maxSlippage = 50; // 0.5% in basis points
    uint256 public gasLimit = 500000;
    uint256 public deadline = 300; // 5 minutes
    
    // Order tracking
    mapping(bytes32 => bool) public processedOrders;
    mapping(bytes32 => CrossChainOrder) public crossChainOrders;
    
    // Events
    event CrossChainOrderCreated(
        bytes32 indexed orderId,
        address indexed sender,
        bytes32 icpRecipient,
        uint256 amount,
        bytes32 hashlock,
        uint256 timelock
    );
    
    event CrossChainOrderResolved(
        bytes32 indexed orderId,
        address indexed resolver,
        bytes32 preimage
    );
    
    event CrossChainOrderCancelled(
        bytes32 indexed orderId,
        address indexed sender
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
    }

    // Modifiers
    modifier onlyBridge() {
        require(msg.sender == address(bridgeContract), "Only bridge can call");
        _;
    }

    modifier validOrder(bytes32 orderId) {
        require(crossChainOrders[orderId].sender != address(0), "Order does not exist");
        _;
    }

    modifier notProcessed(bytes32 orderId) {
        require(!processedOrders[orderId], "Order already processed");
        _;
    }

    constructor(address payable _bridgeContract) Ownable(msg.sender) {
        bridgeContract = EthereumICPBridge(_bridgeContract);
    }

    /**
     * @dev Resolve cross-chain order (called by Fusion+ resolver)
     * @param orderId The Fusion+ order ID
     * @param preimage The preimage for atomic swap completion
     */
    function resolve(
        bytes32 orderId,
        bytes32 preimage
    ) external nonReentrant validOrder(orderId) notProcessed(orderId) {
        CrossChainOrder storage order = crossChainOrders[orderId];
        
        require(!order.completed, "Order already completed");
        require(!order.cancelled, "Order already cancelled");
        require(block.timestamp < order.timelock, "Timelock expired");
        
        // Verify preimage
        bytes32 computedHashlock = keccak256(abi.encodePacked(preimage));
        require(order.hashlock == computedHashlock, "Invalid preimage");
        
        // Mark as processed
        processedOrders[orderId] = true;
        order.completed = true;
        
        // Complete bridge swap
        bridgeContract.claimSwap(orderId, preimage);
        
        emit CrossChainOrderResolved(orderId, msg.sender, preimage);
    }

    /**
     * @dev Create cross-chain order (called by Fusion+)
     * @param sender The order sender
     * @param icpRecipient Hash of ICP recipient address
     * @param amount The swap amount
     * @param hashlock Hash of the preimage
     * @param timelock Unix timestamp when the swap expires
     */
    function createCrossChainOrder(
        address sender,
        bytes32 icpRecipient,
        uint256 amount,
        bytes32 hashlock,
        uint256 timelock
    ) external onlyOwner returns (bytes32 orderId) {
        require(sender != address(0), "Invalid sender");
        require(icpRecipient != bytes32(0), "Invalid ICP recipient");
        require(amount > 0, "Invalid amount");
        require(hashlock != bytes32(0), "Invalid hashlock");
        require(timelock > block.timestamp + 3600, "Timelock too short");
        require(timelock < block.timestamp + 86400, "Timelock too long");
        
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
        
        require(crossChainOrders[orderId].sender == address(0), "Order already exists");
        
        // Create cross-chain order
        crossChainOrders[orderId] = CrossChainOrder({
            sender: sender,
            icpRecipient: icpRecipient,
            amount: amount,
            hashlock: hashlock,
            timelock: timelock,
            completed: false,
            cancelled: false,
            createdAt: block.timestamp
        });
        
        emit CrossChainOrderCreated(
            orderId,
            sender,
            icpRecipient,
            amount,
            hashlock,
            timelock
        );
        
        return orderId;
    }

    /**
     * @dev Cancel cross-chain order
     * @param orderId The order ID to cancel
     */
    function cancelCrossChainOrder(bytes32 orderId) external validOrder(orderId) {
        CrossChainOrder storage order = crossChainOrders[orderId];
        
        require(msg.sender == order.sender || msg.sender == owner(), "Not authorized");
        require(!order.completed, "Order already completed");
        require(!order.cancelled, "Order already cancelled");
        require(block.timestamp >= order.timelock, "Timelock not expired");
        
        order.cancelled = true;
        
        emit CrossChainOrderCancelled(orderId, msg.sender);
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
     * @dev Update bridge contract address
     * @param _bridgeContract New bridge contract address
     */
    function setBridgeContract(address payable _bridgeContract) external onlyOwner {
        require(_bridgeContract != address(0), "Invalid bridge contract");
        bridgeContract = EthereumICPBridge(_bridgeContract);
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
        require(_maxSlippage <= 100, "Slippage too high"); // Max 1%
        require(_gasLimit > 0, "Invalid gas limit");
        require(_deadline > 0, "Invalid deadline");
        
        maxSlippage = _maxSlippage;
        gasLimit = _gasLimit;
        deadline = _deadline;
    }

    /**
     * @dev Emergency function to recover stuck funds
     */
    function emergencyWithdraw() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Emergency withdrawal failed");
    }

    // Receive function to accept ETH
    receive() external payable {}
} 