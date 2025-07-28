// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title EthereumICPBridge
 * @dev Implements Hash Time-Locked Contracts (HTLC) for cross-chain swaps between Ethereum and ICP
 * This contract handles the Ethereum side of the atomic swap process
 */
contract EthereumICPBridge is ReentrancyGuard, Ownable {
    using ECDSA for bytes32;

    // Structs
    struct SwapOrder {
        address sender;
        bytes32 icpRecipient; // Hash of ICP recipient address
        uint256 amount;
        bytes32 hashlock;
        uint256 timelock;
        bool completed;
        bool refunded;
        uint256 createdAt;
    }

    // Events
    event SwapCreated(
        bytes32 indexed orderId,
        address indexed sender,
        bytes32 icpRecipient,
        uint256 amount,
        bytes32 hashlock,
        uint256 timelock
    );

    event SwapCompleted(
        bytes32 indexed orderId,
        address indexed recipient,
        bytes32 preimage
    );

    event SwapRefunded(
        bytes32 indexed orderId,
        address indexed sender
    );

    // State variables
    mapping(bytes32 => SwapOrder) public swapOrders;
    mapping(bytes32 => bool) public usedHashlocks;
    
    uint256 public bridgeFeePercentage = 10; // 0.1% in basis points
    uint256 public minSwapAmount = 0.001 ether;
    uint256 public maxSwapAmount = 100 ether;
    
    // ICP canister verification
    address public icpVerifier;
    mapping(address => bool) public authorizedResolvers;

    // Modifiers
    modifier onlyAuthorized() {
        require(authorizedResolvers[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    modifier validAmount(uint256 amount) {
        require(amount >= minSwapAmount, "Amount too low");
        require(amount <= maxSwapAmount, "Amount too high");
        _;
    }

    modifier validTimelock(uint256 timelock) {
        require(timelock > block.timestamp + 1 hours, "Timelock too short");
        require(timelock < block.timestamp + 24 hours, "Timelock too long");
        _;
    }

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Creates a new cross-chain swap order
     * @param icpRecipient Hash of the ICP recipient address
     * @param hashlock Hash of the preimage for atomic swap
     * @param timelock Unix timestamp when the swap expires
     */
    function createSwap(
        bytes32 icpRecipient,
        bytes32 hashlock,
        uint256 timelock
    ) external payable validAmount(msg.value) validTimelock(timelock) nonReentrant {
        require(icpRecipient != bytes32(0), "Invalid ICP recipient");
        require(hashlock != bytes32(0), "Invalid hashlock");
        require(!usedHashlocks[hashlock], "Hashlock already used");

        bytes32 orderId = keccak256(
            abi.encodePacked(
                msg.sender,
                icpRecipient,
                msg.value,
                hashlock,
                timelock,
                block.timestamp
            )
        );

        require(swapOrders[orderId].sender == address(0), "Order already exists");

        // Calculate bridge fee
        uint256 bridgeFee = (msg.value * bridgeFeePercentage) / 10000;
        uint256 swapAmount = msg.value - bridgeFee;

        swapOrders[orderId] = SwapOrder({
            sender: msg.sender,
            icpRecipient: icpRecipient,
            amount: swapAmount,
            hashlock: hashlock,
            timelock: timelock,
            completed: false,
            refunded: false,
            createdAt: block.timestamp
        });

        usedHashlocks[hashlock] = true;

        emit SwapCreated(
            orderId,
            msg.sender,
            icpRecipient,
            swapAmount,
            hashlock,
            timelock
        );
    }

    /**
     * @dev Completes a swap by providing the preimage
     * @param orderId The unique identifier of the swap order
     * @param preimage The preimage that matches the hashlock
     */
    function claimSwap(
        bytes32 orderId,
        bytes32 preimage
    ) external onlyAuthorized nonReentrant {
        SwapOrder storage order = swapOrders[orderId];
        require(order.sender != address(0), "Order does not exist");
        require(!order.completed, "Order already completed");
        require(!order.refunded, "Order already refunded");
        require(block.timestamp < order.timelock, "Timelock expired");

        bytes32 computedHashlock = keccak256(abi.encodePacked(preimage));
        require(order.hashlock == computedHashlock, "Invalid preimage");

        order.completed = true;

        // Transfer funds to the authorized resolver (ICP bridge)
        (bool success, ) = msg.sender.call{value: order.amount}("");
        require(success, "Transfer failed");

        emit SwapCompleted(orderId, msg.sender, preimage);
    }

    /**
     * @dev Refunds a swap if the timelock has expired
     * @param orderId The unique identifier of the swap order
     */
    function refund(bytes32 orderId) external nonReentrant {
        SwapOrder storage order = swapOrders[orderId];
        require(order.sender != address(0), "Order does not exist");
        require(!order.completed, "Order already completed");
        require(!order.refunded, "Order already refunded");
        require(block.timestamp >= order.timelock, "Timelock not expired");

        order.refunded = true;

        // Calculate total amount to refund (including bridge fee)
        uint256 totalAmount = order.amount + ((order.amount * bridgeFeePercentage) / (10000 - bridgeFeePercentage));

        (bool success, ) = order.sender.call{value: totalAmount}("");
        require(success, "Refund failed");

        emit SwapRefunded(orderId, order.sender);
    }

    /**
     * @dev Emergency function to recover stuck funds (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Emergency withdrawal failed");
    }

    /**
     * @dev Sets the ICP verifier address
     * @param _icpVerifier The address of the ICP verifier contract
     */
    function setICPVerifier(address _icpVerifier) external onlyOwner {
        icpVerifier = _icpVerifier;
    }

    /**
     * @dev Adds or removes an authorized resolver
     * @param resolver The address to authorize/unauthorize
     * @param authorized Whether the address should be authorized
     */
    function setAuthorizedResolver(address resolver, bool authorized) external onlyOwner {
        authorizedResolvers[resolver] = authorized;
    }

    /**
     * @dev Updates bridge fee percentage
     * @param newFeePercentage New fee percentage in basis points
     */
    function setBridgeFeePercentage(uint256 newFeePercentage) external onlyOwner {
        require(newFeePercentage <= 100, "Fee too high"); // Max 1%
        bridgeFeePercentage = newFeePercentage;
    }

    /**
     * @dev Updates minimum and maximum swap amounts
     * @param _minAmount New minimum amount in wei
     * @param _maxAmount New maximum amount in wei
     */
    function setSwapLimits(uint256 _minAmount, uint256 _maxAmount) external onlyOwner {
        require(_minAmount < _maxAmount, "Invalid limits");
        minSwapAmount = _minAmount;
        maxSwapAmount = _maxAmount;
    }

    /**
     * @dev Gets swap order details
     * @param orderId The unique identifier of the swap order
     * @return order The swap order details
     */
    function getSwapOrder(bytes32 orderId) external view returns (SwapOrder memory order) {
        return swapOrders[orderId];
    }

    /**
     * @dev Checks if a hashlock has been used
     * @param hashlock The hashlock to check
     * @return True if the hashlock has been used
     */
    function isHashlockUsed(bytes32 hashlock) external view returns (bool) {
        return usedHashlocks[hashlock];
    }

    // Receive function to accept ETH
    receive() external payable {}
} 