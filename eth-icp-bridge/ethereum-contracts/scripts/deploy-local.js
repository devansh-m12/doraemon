const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying EthereumICPBridge locally...");

  // Get the contract factory
  const EthereumICPBridge = await ethers.getContractFactory("EthereumICPBridge");
  
  // Deploy the contract
  const bridge = await EthereumICPBridge.deploy();
  
  // Wait for deployment to complete
  await bridge.waitForDeployment();
  
  const address = await bridge.getAddress();
  console.log("✅ EthereumICPBridge deployed to:", address);
  
  // Get deployer address
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployer address:", deployer.address);
  
  // Log deployment info
  console.log("\n📋 Deployment Summary:");
  console.log("Contract Address:", address);
  console.log("Deployer:", deployer.address);
  console.log("Network: Local Hardhat");
  
  // Save deployment info to file
  const fs = require('fs');
  const deploymentInfo = {
    contractAddress: address,
    network: "localhost",
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    constructorArgs: []
  };
  
  fs.writeFileSync(
    `deployment-localhost.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("💾 Deployment info saved to deployment-localhost.json");
  
  return address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 