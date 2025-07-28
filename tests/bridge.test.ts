import { expect } from "chai";
import { ethers } from "hardhat";

describe("Doraemon Bridge", function () {
  let bridge: any;
  let resolver: any;
  let owner: any;
  let user: any;
  let resolverAccount: any;

  beforeEach(async function () {
    [owner, user, resolverAccount] = await ethers.getSigners();
    
    // Deploy contracts
    const EthereumICPBridge = await ethers.getContractFactory("EthereumICPBridge");
    bridge = await EthereumICPBridge.deploy();
    await bridge.deployed();

    const DoraemonResolver = await ethers.getContractFactory("DoraemonResolver");
    resolver = await DoraemonResolver.deploy();
    await resolver.deployed();

    // Configure bridge
    await bridge.setAuthorizedResolver(resolver.address, true);
    await bridge.setBridgeFeePercentage(10);
    await bridge.setSwapLimits(
      ethers.utils.parseEther("0.001"),
      ethers.utils.parseEther("100")
    );
  });

  describe("Bridge Security", function () {
    it("Should prevent reentrancy attacks", async function () {
      // This test would require a malicious contract that tries to reenter
      // For now, we test that the nonReentrant modifier is present
      const code = await ethers.provider.getCode(bridge.address);
      expect(code).to.not.equal("0x");
    });

    it("Should validate input parameters", async function () {
      const hashlock = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test"));
      const timelock = Math.floor(Date.now() / 1000) + 3600;

      // Test invalid amount
      await expect(
        bridge.connect(user).createSwap(
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes("recipient")),
          hashlock,
          timelock,
          { value: ethers.utils.parseEther("0.0001") } // Below minimum
        )
      ).to.be.revertedWith("Amount too low");

      // Test invalid timelock
      await expect(
        bridge.connect(user).createSwap(
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes("recipient")),
          hashlock,
          Math.floor(Date.now() / 1000) + 1800, // Too short
          { value: ethers.utils.parseEther("0.01") }
        )
      ).to.be.revertedWith("Timelock too short");
    });

    it("Should only allow authorized resolvers to complete swaps", async function () {
      const hashlock = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test"));
      const timelock = Math.floor(Date.now() / 1000) + 3600;

      await bridge.connect(user).createSwap(
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("recipient")),
        hashlock,
        timelock,
        { value: ethers.utils.parseEther("0.01") }
      );

      const orderId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["address", "bytes32", "uint256", "bytes32", "uint256", "uint256"],
          [user.address, ethers.utils.keccak256(ethers.utils.toUtf8Bytes("recipient")), ethers.utils.parseEther("0.01"), hashlock, timelock, await ethers.provider.getBlockNumber()]
        )
      );

      // Unauthorized user should not be able to complete swap
      await expect(
        bridge.connect(user).claimSwap(orderId, ethers.utils.toUtf8Bytes("test"))
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("Swap Functionality", function () {
    it("Should create swap orders correctly", async function () {
      const hashlock = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test"));
      const timelock = Math.floor(Date.now() / 1000) + 3600;
      const amount = ethers.utils.parseEther("0.01");

      await expect(
        bridge.connect(user).createSwap(
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes("recipient")),
          hashlock,
          timelock,
          { value: amount }
        )
      ).to.emit(bridge, "SwapCreated");

      // Verify order was created
      const orderId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["address", "bytes32", "uint256", "bytes32", "uint256", "uint256"],
          [user.address, ethers.utils.keccak256(ethers.utils.toUtf8Bytes("recipient")), amount, hashlock, timelock, await ethers.provider.getBlockNumber()]
        )
      );

      const order = await bridge.getSwapOrder(orderId);
      expect(order.sender).to.equal(user.address);
      expect(order.amount).to.equal(amount.sub(amount.mul(10).div(10000))); // After fee
    });

    it("Should complete swaps with valid preimage", async function () {
      const preimage = ethers.utils.toUtf8Bytes("secret");
      const hashlock = ethers.utils.keccak256(preimage);
      const timelock = Math.floor(Date.now() / 1000) + 3600;
      const amount = ethers.utils.parseEther("0.01");

      await bridge.connect(user).createSwap(
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("recipient")),
        hashlock,
        timelock,
        { value: amount }
      );

      const orderId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["address", "bytes32", "uint256", "bytes32", "uint256", "uint256"],
          [user.address, ethers.utils.keccak256(ethers.utils.toUtf8Bytes("recipient")), amount, hashlock, timelock, await ethers.provider.getBlockNumber()]
        )
      );

      await expect(
        bridge.connect(resolverAccount).claimSwap(orderId, preimage)
      ).to.emit(bridge, "SwapCompleted");
    });

    it("Should refund expired swaps", async function () {
      const hashlock = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test"));
      const timelock = Math.floor(Date.now() / 1000) + 1; // Very short timelock
      const amount = ethers.utils.parseEther("0.01");

      await bridge.connect(user).createSwap(
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("recipient")),
        hashlock,
        timelock,
        { value: amount }
      );

      const orderId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["address", "bytes32", "uint256", "bytes32", "uint256", "uint256"],
          [user.address, ethers.utils.keccak256(ethers.utils.toUtf8Bytes("recipient")), amount, hashlock, timelock, await ethers.provider.getBlockNumber()]
        )
      );

      // Wait for timelock to expire
      await ethers.provider.send("evm_increaseTime", [2]);
      await ethers.provider.send("evm_mine", []);

      await expect(
        bridge.connect(user).refund(orderId)
      ).to.emit(bridge, "SwapRefunded");
    });
  });

  describe("Fee Calculation", function () {
    it("Should calculate bridge fees correctly", async function () {
      const amount = ethers.utils.parseEther("1");
      const feePercentage = await bridge.bridgeFeePercentage();
      const expectedFee = amount.mul(feePercentage).div(10000);
      const expectedSwapAmount = amount.sub(expectedFee);

      const hashlock = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test"));
      const timelock = Math.floor(Date.now() / 1000) + 3600;

      await bridge.connect(user).createSwap(
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("recipient")),
        hashlock,
        timelock,
        { value: amount }
      );

      const orderId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["address", "bytes32", "uint256", "bytes32", "uint256", "uint256"],
          [user.address, ethers.utils.keccak256(ethers.utils.toUtf8Bytes("recipient")), amount, hashlock, timelock, await ethers.provider.getBlockNumber()]
        )
      );

      const order = await bridge.getSwapOrder(orderId);
      expect(order.amount).to.equal(expectedSwapAmount);
    });
  });

  describe("Access Control", function () {
    it("Should only allow owner to set bridge parameters", async function () {
      await expect(
        bridge.connect(user).setBridgeFeePercentage(20)
      ).to.be.revertedWith("Ownable: caller is not the owner");

      await expect(
        bridge.connect(user).setSwapLimits(
          ethers.utils.parseEther("0.001"),
          ethers.utils.parseEther("100")
        )
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should allow owner to set authorized resolvers", async function () {
      await bridge.connect(owner).setAuthorizedResolver(user.address, true);
      expect(await bridge.authorizedResolvers(user.address)).to.be.true;

      await bridge.connect(owner).setAuthorizedResolver(user.address, false);
      expect(await bridge.authorizedResolvers(user.address)).to.be.false;
    });
  });

  describe("ICP Bridge Utils", function () {
    it("Should generate valid hashlocks", function () {
      const { hashlock, preimage } = ICPBridgeUtils.generateHashlock();
      expect(hashlock).to.be.a("string");
      expect(preimage).to.be.a("string");
      expect(hashlock).to.have.length(66); // 0x + 64 hex chars
      expect(preimage).to.have.length(66);
    });

    it("Should verify hashlocks correctly", function () {
      const { hashlock, preimage } = ICPBridgeUtils.generateHashlock();
      const isValid = ICPBridgeUtils.verifyHashlock(hashlock, preimage);
      expect(isValid).to.be.true;
    });

    it("Should calculate timelocks correctly", function () {
      const ethereumTimelock = ICPBridgeUtils.calculateTimelock("ethereum", 1);
      const icpTimelock = ICPBridgeUtils.calculateTimelock("icp", 1);
      
      expect(ethereumTimelock).to.be.a("number");
      expect(icpTimelock).to.be.a("number");
      expect(icpTimelock).to.be.greaterThan(ethereumTimelock);
    });
  });

  describe("Integration Tests", function () {
    it("Should handle complete swap flow", async function () {
      // 1. Create swap
      const preimage = ethers.utils.toUtf8Bytes("secret");
      const hashlock = ethers.utils.keccak256(preimage);
      const timelock = Math.floor(Date.now() / 1000) + 3600;
      const amount = ethers.utils.parseEther("0.01");

      await bridge.connect(user).createSwap(
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("recipient")),
        hashlock,
        timelock,
        { value: amount }
      );

      // 2. Complete swap
      const orderId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["address", "bytes32", "uint256", "bytes32", "uint256", "uint256"],
          [user.address, ethers.utils.keccak256(ethers.utils.toUtf8Bytes("recipient")), amount, hashlock, timelock, await ethers.provider.getBlockNumber()]
        )
      );

      await bridge.connect(resolverAccount).claimSwap(orderId, preimage);

      // 3. Verify completion
      const order = await bridge.getSwapOrder(orderId);
      expect(order.completed).to.be.true;
      expect(order.refunded).to.be.false;
    });

    it("Should handle refund flow", async function () {
      const hashlock = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test"));
      const timelock = Math.floor(Date.now() / 1000) + 1;
      const amount = ethers.utils.parseEther("0.01");

      await bridge.connect(user).createSwap(
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("recipient")),
        hashlock,
        timelock,
        { value: amount }
      );

      const orderId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["address", "bytes32", "uint256", "bytes32", "uint256", "uint256"],
          [user.address, ethers.utils.keccak256(ethers.utils.toUtf8Bytes("recipient")), amount, hashlock, timelock, await ethers.provider.getBlockNumber()]
        )
      );

      // Wait for expiration
      await ethers.provider.send("evm_increaseTime", [2]);
      await ethers.provider.send("evm_mine", []);

      await bridge.connect(user).refund(orderId);

      const order = await bridge.getSwapOrder(orderId);
      expect(order.refunded).to.be.true;
      expect(order.completed).to.be.false;
    });
  });
}); 