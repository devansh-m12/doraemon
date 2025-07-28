const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
  console.log("🔧 Setting up authorization for bridge testing...");

  // Load deployment info
  let deploymentInfo;
  try {
    deploymentInfo = JSON.parse(fs.readFileSync('deployment-localhost.json', 'utf8'));
  } catch (error) {
    console.error("❌ Could not load deployment info. Please run deploy-local.js first.");
    process.exit(1);
  }

  const contractAddress = deploymentInfo.contractAddress;
  console.log("📋 Contract Address:", contractAddress);

  // Get the contract instance
  const bridge = await ethers.getContractAt("EthereumICPBridge", contractAddress);
  
  // Get the deployer (owner)
  const [owner] = await ethers.getSigners();
  console.log("👤 Owner Address:", owner.address);

  // Get the wallet address from environment or use a default
  const walletAddress = process.env.WALLET_ADDRESS || "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  console.log("🔑 Wallet Address to authorize:", walletAddress);

  try {
    // Authorize the wallet address
    console.log("🔐 Authorizing wallet address...");
    const tx = await bridge.connect(owner).setAuthorizedResolver(walletAddress, true);
    await tx.wait();
    
    console.log("✅ Wallet address authorized successfully!");
    console.log("Transaction Hash:", tx.hash);
    
    // Verify authorization
    const isAuthorized = await bridge.authorizedResolvers(walletAddress);
    console.log("🔍 Authorization status:", isAuthorized);
    
  } catch (error) {
    console.error("❌ Failed to authorize wallet:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  }); 