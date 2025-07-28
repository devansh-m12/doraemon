const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EthereumICPBridge", function () {
  let bridge;
  let owner;
  let user1;
  let user2;
  let resolver;

  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

  beforeEach(async function () {
    [owner, user1, user2, resolver] = await ethers.getSigners();
    
    const EthereumICPBridge = await ethers.getContractFactory("EthereumICPBridge");
    bridge = await EthereumICPBridge.deploy();
    await bridge.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await bridge.owner()).to.equal(owner.address);
    });

    it("Should have correct initial values", async function () {
      expect(await bridge.bridgeFeePercentage()).to.equal(10); // 0.1%
      expect(await bridge.minSwapAmount()).to.equal(ethers.parseEther("0.001"));
      expect(await bridge.maxSwapAmount()).to.equal(ethers.parseEther("100"));
    });
  });

  describe("Swap Creation", function () {
    const icpRecipient = ethers.keccak256(ethers.toUtf8Bytes("icp_recipient"));
    const preimage = ethers.randomBytes(32);
    const hashlock = ethers.keccak256(preimage);
    const timelock = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

    it("Should create a swap successfully", async function () {
      const swapAmount = ethers.parseEther("0.1");
      
      await expect(
        bridge.connect(user1).createSwap(icpRecipient, hashlock, timelock, {
          value: swapAmount
        })
      ).to.emit(bridge, "SwapCreated");

      // Check that hashlock is marked as used
      expect(await bridge.isHashlockUsed(hashlock)).to.be.true;
    });

    it("Should fail with amount too low", async function () {
      const lowAmount = ethers.parseEther("0.0005"); // Below minimum
      
      await expect(
        bridge.connect(user1).createSwap(icpRecipient, hashlock, timelock, {
          value: lowAmount
        })
      ).to.be.revertedWith("Amount too low");
    });

    it("Should fail with amount too high", async function () {
      const highAmount = ethers.parseEther("200"); // Above maximum
      
      await expect(
        bridge.connect(user1).createSwap(icpRecipient, hashlock, timelock, {
          value: highAmount
        })
      ).to.be.revertedWith("Amount too high");
    });

    it("Should fail with invalid timelock", async function () {
      const shortTimelock = Math.floor(Date.now() / 1000) + 1800; // 30 minutes
      
      await expect(
        bridge.connect(user1).createSwap(icpRecipient, hashlock, shortTimelock, {
          value: ethers.parseEther("0.1")
        })
      ).to.be.revertedWith("Timelock too short");
    });

    it("Should fail with reused hashlock", async function () {
      const swapAmount = ethers.parseEther("0.1");
      
      // Create first swap
      await bridge.connect(user1).createSwap(icpRecipient, hashlock, timelock, {
        value: swapAmount
      });

      // Try to create second swap with same hashlock
      await expect(
        bridge.connect(user2).createSwap(icpRecipient, hashlock, timelock, {
          value: swapAmount
        })
      ).to.be.revertedWith("Hashlock already used");
    });
  });

  describe("Swap Completion", function () {
    let orderId;
    const icpRecipient = ethers.keccak256(ethers.toUtf8Bytes("icp_recipient"));
    const preimage = ethers.randomBytes(32);
    const hashlock = ethers.keccak256(preimage);
    const timelock = Math.floor(Date.now() / 1000) + 3600;

    beforeEach(async function () {
      // Create a swap
      const swapAmount = ethers.parseEther("0.1");
      const tx = await bridge.connect(user1).createSwap(icpRecipient, hashlock, timelock, {
        value: swapAmount
      });
      
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.eventName === "SwapCreated");
      orderId = event.args.orderId;
      
      // Authorize resolver
      await bridge.connect(owner).setAuthorizedResolver(resolver.address, true);
    });

    it("Should complete swap with valid preimage", async function () {
      const initialBalance = await ethers.provider.getBalance(resolver.address);
      
      await expect(
        bridge.connect(resolver).claimSwap(orderId, preimage)
      ).to.emit(bridge, "SwapCompleted");

      const finalBalance = await ethers.provider.getBalance(resolver.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should fail with invalid preimage", async function () {
      const invalidPreimage = ethers.randomBytes(32);
      
      await expect(
        bridge.connect(resolver).claimSwap(orderId, invalidPreimage)
      ).to.be.revertedWith("Invalid preimage");
    });

    it("Should fail when not authorized", async function () {
      await expect(
        bridge.connect(user2).claimSwap(orderId, preimage)
      ).to.be.revertedWith("Not authorized");
    });

    it("Should fail when timelock expired", async function () {
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [3601]);
      await ethers.provider.send("evm_mine");
      
      await expect(
        bridge.connect(resolver).claimSwap(orderId, preimage)
      ).to.be.revertedWith("Timelock expired");
    });
  });

  describe("Swap Refund", function () {
    let orderId;
    const icpRecipient = ethers.keccak256(ethers.toUtf8Bytes("icp_recipient"));
    const preimage = ethers.randomBytes(32);
    const hashlock = ethers.keccak256(preimage);
    const timelock = Math.floor(Date.now() / 1000) + 3600;

    beforeEach(async function () {
      // Create a swap
      const swapAmount = ethers.parseEther("0.1");
      const tx = await bridge.connect(user1).createSwap(icpRecipient, hashlock, timelock, {
        value: swapAmount
      });
      
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.eventName === "SwapCreated");
      orderId = event.args.orderId;
    });

    it("Should refund after timelock expires", async function () {
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [3601]);
      await ethers.provider.send("evm_mine");
      
      const initialBalance = await ethers.provider.getBalance(user1.address);
      
      await expect(
        bridge.connect(user1).refund(orderId)
      ).to.emit(bridge, "SwapRefunded");

      const finalBalance = await ethers.provider.getBalance(user1.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should fail refund before timelock expires", async function () {
      await expect(
        bridge.connect(user1).refund(orderId)
      ).to.be.revertedWith("Timelock not expired");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to set bridge fee", async function () {
      await bridge.connect(owner).setBridgeFeePercentage(50); // 0.5%
      expect(await bridge.bridgeFeePercentage()).to.equal(50);
    });

    it("Should prevent non-owner from setting bridge fee", async function () {
      await expect(
        bridge.connect(user1).setBridgeFeePercentage(50)
      ).to.be.revertedWithCustomError(bridge, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to set swap limits", async function () {
      const newMin = ethers.parseEther("0.01");
      const newMax = ethers.parseEther("50");
      
      await bridge.connect(owner).setSwapLimits(newMin, newMax);
      expect(await bridge.minSwapAmount()).to.equal(newMin);
      expect(await bridge.maxSwapAmount()).to.equal(newMax);
    });

    it("Should allow owner to set authorized resolver", async function () {
      await bridge.connect(owner).setAuthorizedResolver(resolver.address, true);
      expect(await bridge.authorizedResolvers(resolver.address)).to.be.true;
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow owner to emergency withdraw", async function () {
      // Send some ETH to contract
      await user1.sendTransaction({
        to: await bridge.getAddress(),
        value: ethers.parseEther("1")
      });

      const initialBalance = await ethers.provider.getBalance(owner.address);
      
      await bridge.connect(owner).emergencyWithdraw();
      
      const finalBalance = await ethers.provider.getBalance(owner.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should prevent non-owner from emergency withdraw", async function () {
      await expect(
        bridge.connect(user1).emergencyWithdraw()
      ).to.be.revertedWithCustomError(bridge, "OwnableUnauthorizedAccount");
    });
  });
}); 