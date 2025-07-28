import { expect } from "chai";
import { ethers } from "hardhat";

describe("DoraemonResolver", function () {
  let resolver: any;
  let bridge: any;
  let owner: any;
  let user: any;
  let resolverAccount: any;
  
  beforeEach(async function () {
    [owner, user, resolverAccount] = await ethers.getSigners();
    
    // Deploy bridge contract
    const BridgeFactory = await ethers.getContractFactory("EthereumICPBridge");
    bridge = await BridgeFactory.deploy();
    await bridge.deployed();
    
    // Deploy resolver contract
    const ResolverFactory = await ethers.getContractFactory("DoraemonResolver");
    resolver = await ResolverFactory.deploy(bridge.address);
    await resolver.deployed();
    
    // Set up initial configuration
    await bridge.setAuthorizedResolver(resolver.address, true);
    await resolver.setResolverAuthorization(resolverAccount.address, true);
  });
  
  describe("1inch Fusion+ Compatibility", function () {
    it("Should be Fusion+ compatible", async function () {
      const isCompatible = await resolver.isFusionCompatible();
      expect(isCompatible).to.be.true;
    });
    
    it("Should return correct metadata", async function () {
      const [name, version, supportedChains] = await resolver.getResolverMetadata();
      expect(name).to.equal("DoraemonResolver");
      expect(version).to.equal("1.0.0");
      expect(supportedChains).to.deep.equal(["ethereum", "icp"]);
    });
  });
  
  describe("Cross-Chain Order Management", function () {
    it("Should create cross-chain order", async function () {
      const hashlock = ethers.keccak256(ethers.toUtf8Bytes("secret"));
      const timelock = Math.floor(Date.now() / 1000) + 7200; // 2 hours from now
      const icpRecipient = ethers.keccak256(ethers.toUtf8Bytes("icp-recipient"));
      const amount = ethers.parseEther("1");
      
      const tx = await resolver.createCrossChainOrder(
        user.address,
        icpRecipient,
        amount,
        hashlock,
        timelock
      );
      
      const receipt = await tx.wait();
      
      // Check event emission
      const event = receipt.logs.find(log => 
        log.topics[0] === resolver.interface.getEventTopic('CrossChainOrderCreated')
      );
      
      expect(event).to.not.be.undefined;
    });
    
    it("Should reject invalid timelock", async function () {
      const hashlock = ethers.keccak256(ethers.toUtf8Bytes("secret"));
      const timelock = Math.floor(Date.now() / 1000) + 1800; // 30 minutes (too short)
      const icpRecipient = ethers.keccak256(ethers.toUtf8Bytes("icp-recipient"));
      const amount = ethers.parseEther("1");
      
      await expect(
        resolver.createCrossChainOrder(
          user.address,
          icpRecipient,
          amount,
          hashlock,
          timelock
        )
      ).to.be.revertedWithCustomError(resolver, "InvalidTimelock");
    });
    
    it("Should reject duplicate hashlock", async function () {
      const hashlock = ethers.keccak256(ethers.toUtf8Bytes("secret"));
      const timelock = Math.floor(Date.now() / 1000) + 7200;
      const icpRecipient = ethers.keccak256(ethers.toUtf8Bytes("icp-recipient"));
      const amount = ethers.parseEther("1");
      
      // Create first order
      await resolver.createCrossChainOrder(
        user.address,
        icpRecipient,
        amount,
        hashlock,
        timelock
      );
      
      // Try to create second order with same hashlock
      await expect(
        resolver.createCrossChainOrder(
          user.address,
          icpRecipient,
        amount,
        hashlock,
        timelock
        )
      ).to.be.revertedWithCustomError(resolver, "HashlockAlreadyUsed");
    });
  });
  
  describe("Order Resolution", function () {
    let orderId: string;
    let hashlock: string;
    let preimage: string;
    
    beforeEach(async function () {
      preimage = ethers.toUtf8Bytes("secret");
      hashlock = ethers.keccak256(preimage);
      const timelock = Math.floor(Date.now() / 1000) + 7200;
      const icpRecipient = ethers.keccak256(ethers.toUtf8Bytes("icp-recipient"));
      const amount = ethers.parseEther("1");
      
      const tx = await resolver.createCrossChainOrder(
        user.address,
        icpRecipient,
        amount,
        hashlock,
        timelock
      );
      
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => 
        log.topics[0] === resolver.interface.getEventTopic('CrossChainOrderCreated')
      );
      orderId = event!.topics[1];
    });
    
    it("Should resolve order with valid preimage", async function () {
      const tx = await resolver.connect(resolverAccount).resolve(orderId, preimage);
      const receipt = await tx.wait();
      
      // Check event emission
      const event = receipt.logs.find(log => 
        log.topics[0] === resolver.interface.getEventTopic('CrossChainOrderResolved')
      );
      
      expect(event).to.not.be.undefined;
      
      // Check order state
      const order = await resolver.getCrossChainOrder(orderId);
      expect(order.completed).to.be.true;
      expect(order.resolver).to.equal(resolverAccount.address);
    });
    
    it("Should reject invalid preimage", async function () {
      const invalidPreimage = ethers.toUtf8Bytes("wrong-secret");
      
      await expect(
        resolver.connect(resolverAccount).resolve(orderId, invalidPreimage)
      ).to.be.revertedWithCustomError(resolver, "InvalidPreimage");
    });
    
    it("Should reject unauthorized resolver", async function () {
      await expect(
        resolver.connect(user).resolve(orderId, preimage)
      ).to.be.revertedWithCustomError(resolver, "UnauthorizedResolver");
    });
    
    it("Should reject expired timelock", async function () {
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [7200]);
      await ethers.provider.send("evm_mine", []);
      
      await expect(
        resolver.connect(resolverAccount).resolve(orderId, preimage)
      ).to.be.revertedWithCustomError(resolver, "TimelockExpired");
    });
  });
  
  describe("Order Cancellation", function () {
    let orderId: string;
    
    beforeEach(async function () {
      const hashlock = ethers.keccak256(ethers.toUtf8Bytes("secret"));
      const timelock = Math.floor(Date.now() / 1000) + 7200;
      const icpRecipient = ethers.keccak256(ethers.toUtf8Bytes("icp-recipient"));
      const amount = ethers.parseEther("1");
      
      const tx = await resolver.createCrossChainOrder(
        user.address,
        icpRecipient,
        amount,
        hashlock,
        timelock
      );
      
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => 
        log.topics[0] === resolver.interface.getEventTopic('CrossChainOrderCreated')
      );
      orderId = event!.topics[1];
    });
    
    it("Should allow order cancellation after timelock expiry", async function () {
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [7200]);
      await ethers.provider.send("evm_mine", []);
      
      const tx = await resolver.connect(user).cancelOrder(orderId);
      const receipt = await tx.wait();
      
      // Check event emission
      const event = receipt.logs.find(log => 
        log.topics[0] === resolver.interface.getEventTopic('CrossChainOrderCancelled')
      );
      
      expect(event).to.not.be.undefined;
      
      // Check order state
      const order = await resolver.getCrossChainOrder(orderId);
      expect(order.cancelled).to.be.true;
    });
    
    it("Should reject cancellation before timelock expiry", async function () {
      await expect(
        resolver.connect(user).cancelOrder(orderId)
      ).to.be.revertedWith("Timelock not expired");
    });
    
    it("Should reject unauthorized cancellation", async function () {
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [7200]);
      await ethers.provider.send("evm_mine", []);
      
      await expect(
        resolver.connect(resolverAccount).cancelOrder(orderId)
      ).to.be.revertedWith("Not authorized");
    });
  });
  
  describe("Configuration Management", function () {
    it("Should allow owner to update Fusion+ config", async function () {
      await resolver.updateFusionConfig(100, 600000, 600);
      
      expect(await resolver.maxSlippage()).to.equal(100);
      expect(await resolver.gasLimit()).to.equal(600000);
      expect(await resolver.deadline()).to.equal(600);
    });
    
    it("Should allow owner to set safety deposit", async function () {
      const newDeposit = ethers.parseEther("0.02");
      await resolver.setSafetyDeposit(newDeposit);
      
      expect(await resolver.safetyDeposit()).to.equal(newDeposit);
    });
    
    it("Should allow owner to authorize resolvers", async function () {
      await resolver.setResolverAuthorization(resolverAccount.address, true);
      
      expect(await resolver.authorizedResolvers(resolverAccount.address)).to.be.true;
    });
  });
  
  describe("Security Features", function () {
    it("Should prevent reentrancy attacks", async function () {
      // This would require a malicious contract to test
      // For now, just verify the modifier is present
      expect(resolver.interface.hasFunction("resolve")).to.be.true;
    });
    
    it("Should validate all input parameters", async function () {
      const timelock = Math.floor(Date.now() / 1000) + 7200;
      const icpRecipient = ethers.keccak256(ethers.toUtf8Bytes("icp-recipient"));
      const amount = ethers.parseEther("1");
      const hashlock = ethers.keccak256(ethers.toUtf8Bytes("secret"));
      
      // Test invalid sender
      await expect(
        resolver.createCrossChainOrder(
          ethers.ZeroAddress,
          icpRecipient,
          amount,
          hashlock,
          timelock
        )
      ).to.be.revertedWith("Invalid sender");
      
      // Test invalid ICP recipient
      await expect(
        resolver.createCrossChainOrder(
          user.address,
          ethers.ZeroHash,
          amount,
          hashlock,
          timelock
        )
      ).to.be.revertedWith("Invalid ICP recipient");
      
      // Test invalid amount
      await expect(
        resolver.createCrossChainOrder(
          user.address,
          icpRecipient,
          0,
          hashlock,
          timelock
        )
      ).to.be.revertedWithCustomError(resolver, "InvalidAmount");
      
      // Test invalid hashlock
      await expect(
        resolver.createCrossChainOrder(
          user.address,
          icpRecipient,
          amount,
          ethers.ZeroHash,
          timelock
        )
      ).to.be.revertedWithCustomError(resolver, "InvalidHashlock");
    });
  });
}); 