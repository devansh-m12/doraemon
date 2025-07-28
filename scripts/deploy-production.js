const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting production deployment...");
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📋 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy EthereumICPBridge
  console.log("📦 Deploying EthereumICPBridge...");
  const BridgeFactory = await ethers.getContractFactory("EthereumICPBridge");
  const bridge = await BridgeFactory.deploy();
  await bridge.waitForDeployment();
  const bridgeAddress = await bridge.getAddress();
  console.log("✅ EthereumICPBridge deployed to:", bridgeAddress);

  // Deploy DoraemonResolver
  console.log("📦 Deploying DoraemonResolver...");
  const ResolverFactory = await ethers.getContractFactory("DoraemonResolver");
  const resolver = await ResolverFactory.deploy(bridgeAddress);
  await resolver.waitForDeployment();
  const resolverAddress = await resolver.getAddress();
  console.log("✅ DoraemonResolver deployed to:", resolverAddress);

  // Configure contracts
  console.log("⚙️ Configuring contracts...");
  
  // Set resolver as authorized in bridge
  await bridge.setAuthorizedResolver(resolverAddress, true);
  console.log("✅ Resolver authorized in bridge");

  // Set initial resolver configuration
  await resolver.setResolverAuthorization(deployer.address, true);
  await resolver.updateFusionConfig(50, 500000, 300);
  await resolver.setSafetyDeposit(ethers.parseEther("0.01"));
  console.log("✅ Resolver configuration complete");

  // Save deployment info
  const network = await ethers.provider.getNetwork();
  const deploymentInfo = {
    network: {
      name: network.name,
      chainId: Number(network.chainId)
    },
    deployer: deployer.address,
    contracts: {
      bridge: bridgeAddress,
      resolver: resolverAddress
    },
    timestamp: new Date().toISOString(),
    blockNumber: Number(await ethers.provider.getBlockNumber())
  };

  const deploymentPath = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentPath)) {
    fs.mkdirSync(deploymentPath, { recursive: true });
  }

  const networkName = network.name;
  const deploymentFile = path.join(deploymentPath, `deployment-${networkName}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment info saved to:", deploymentFile);

  // Verify contracts on Etherscan (if not on localhost)
  if (networkName !== "localhost" && networkName !== "hardhat") {
    console.log("🔍 Verifying contracts on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: bridgeAddress,
        constructorArguments: []
      });
      console.log("✅ Bridge contract verified");

      await hre.run("verify:verify", {
        address: resolverAddress,
        constructorArguments: [bridgeAddress]
      });
      console.log("✅ Resolver contract verified");
    } catch (error) {
      console.log("⚠️ Contract verification failed:", error.message);
    }
  }

  console.log("🎉 Production deployment complete!");
  console.log("📋 Deployment Summary:");
  console.log("   Bridge:", bridgeAddress);
  console.log("   Resolver:", resolverAddress);
  console.log("   Network:", networkName);
  console.log("   Deployer:", deployer.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 