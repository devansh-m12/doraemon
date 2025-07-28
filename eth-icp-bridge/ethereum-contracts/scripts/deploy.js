const { ethers } = require("hardhat");

async function main() {
  console.log("�� Deploying EthereumICPBridge to Sepolia...");

  // Get the contract factory
  const EthereumICPBridge = await ethers.getContractFactory("EthereumICPBridge");
  
  // Deploy the contract
  const bridge = await EthereumICPBridge.deploy();
  
  // Wait for deployment to complete
  await bridge.waitForDeployment();
  
  const address = await bridge.getAddress();
  console.log("✅ EthereumICPBridge deployed to:", address);
  
  // Verify the deployment
  console.log("🔍 Verifying contract on Etherscan...");
  
  // Wait a bit for the deployment to be indexed
  console.log("⏳ Waiting for deployment to be indexed...");
  await new Promise(resolve => setTimeout(resolve, 30000));
  
  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: [],
    });
    console.log("✅ Contract verified on Etherscan!");
  } catch (error) {
    console.log("⚠️ Verification failed (this is normal if already verified):", error.message);
  }
  
  // Log deployment info
  console.log("\n📋 Deployment Summary:");
  console.log("Contract Address:", address);
  console.log("Network:", network.name);
  console.log("Deployer:", (await ethers.getSigners())[0].address);
  
  // Save deployment info to file
  const fs = require('fs');
  const deploymentInfo = {
    contractAddress: address,
    network: network.name,
    deployer: (await ethers.getSigners())[0].address,
    deploymentTime: new Date().toISOString(),
    constructorArgs: []
  };
  
  fs.writeFileSync(
    `deployment-${network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("💾 Deployment info saved to deployment-" + network.name + ".json");
  
  return address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 