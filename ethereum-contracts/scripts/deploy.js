const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Ethereum ICP Bridge...");

  // Get the contract factory
  const EthereumICPBridge = await ethers.getContractFactory("EthereumICPBridge");
  
  // Deploy the contract
  const bridge = await EthereumICPBridge.deploy();
  
  // Wait for deployment to complete
  await bridge.waitForDeployment();
  
  const bridgeAddress = await bridge.getAddress();
  
  console.log("✅ Ethereum ICP Bridge deployed to:", bridgeAddress);
  
  // Log deployment information
  console.log("\n📋 Deployment Summary:");
  console.log("Contract Address:", bridgeAddress);
  console.log("Network:", network.name);
  console.log("Deployer:", (await ethers.getSigners())[0].address);
  
  // Verify contract on Etherscan (if not on localhost)
  if (network.name !== "localhost" && network.name !== "hardhat") {
    console.log("\n🔍 Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: bridgeAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on Etherscan");
    } catch (error) {
      console.log("⚠️ Verification failed:", error.message);
    }
  }
  
  // Save deployment info
  const deploymentInfo = {
    contract: "EthereumICPBridge",
    address: bridgeAddress,
    network: network.name,
    deployer: (await ethers.getSigners())[0].address,
    timestamp: new Date().toISOString(),
  };
  
  const fs = require("fs");
  const path = require("path");
  
  // Create deployment directory if it doesn't exist
  const deploymentDir = path.join(__dirname, "../deployment");
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }
  
  // Save deployment info
  const deploymentFile = path.join(deploymentDir, `${network.name}-deployment.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("📁 Deployment info saved to:", deploymentFile);
  
  return bridgeAddress;
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 