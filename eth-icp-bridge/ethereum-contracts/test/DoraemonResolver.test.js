const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DoraemonResolver", function () {
  let resolver;
  let bridge;
  let owner;
  let user;
  let resolverAccount;
  
  beforeEach(async function () {
    [owner, user, resolverAccount] = await ethers.getSigners();
    
    // Deploy bridge contract
    const BridgeFactory = await ethers.getContractFactory("EthereumICPBridge");
    bridge = await BridgeFactory.deploy();
    await bridge.waitForDeployment();
    
    // Deploy resolver contract
    const ResolverFactory = await ethers.getContractFactory("DoraemonResolver");
    resolver = await ResolverFactory.deploy(await bridge.getAddress());
    await resolver.waitForDeployment();
    
    // Set up initial configuration
    await bridge.setAuthorizedResolver(await resolver.getAddress(), true);
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
        log.topics[0] === resolver.interface.getEvent('CrossChainOrderCreated').topicHash
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
}); 