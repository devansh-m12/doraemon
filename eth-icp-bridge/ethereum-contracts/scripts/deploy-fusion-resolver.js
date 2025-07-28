const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Deploy FusionResolver contract for 1inch Fusion+ integration
 */
async function main() {
    console.log("🚀 Deploying FusionResolver for 1inch Fusion+ Integration");
    
    // Get the contract factory
    const FusionResolver = await ethers.getContractFactory("FusionResolver");
    
    // Get the bridge contract address from deployment
    const deploymentPath = path.join(__dirname, "..", "deployment-localhost.json");
    const deploymentData = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
    const bridgeContractAddress = deploymentData.contractAddress;
    
    console.log("Bridge Contract Address:", bridgeContractAddress);
    
    // Deploy the FusionResolver
    console.log("📦 Deploying FusionResolver...");
    const fusionResolver = await FusionResolver.deploy(bridgeContractAddress);
    
    await fusionResolver.waitForDeployment();
    const fusionResolverAddress = await fusionResolver.getAddress();
    
    console.log("✅ FusionResolver deployed successfully!");
    console.log("FusionResolver Address:", fusionResolverAddress);
    
    // Save deployment information
    const fusionDeploymentData = {
        contractAddress: fusionResolverAddress,
        bridgeContractAddress: bridgeContractAddress,
        network: "localhost",
        deployer: (await ethers.getSigners())[0].address,
        deploymentTime: new Date().toISOString(),
        constructorArgs: [bridgeContractAddress]
    };
    
    const fusionDeploymentPath = path.join(__dirname, "..", "deployment-fusion-resolver-localhost.json");
    fs.writeFileSync(fusionDeploymentPath, JSON.stringify(fusionDeploymentData, null, 2));
    
    console.log("📄 Deployment data saved to:", fusionDeploymentPath);
    
    // Verify deployment
    console.log("🔍 Verifying deployment...");
    
    const deployedResolver = FusionResolver.attach(fusionResolverAddress);
    const bridgeContract = await deployedResolver.bridgeContract();
    
    if (bridgeContract === bridgeContractAddress) {
        console.log("✅ Bridge contract reference verified");
    } else {
        console.log("❌ Bridge contract reference verification failed");
    }
    
    // Test basic functionality
    console.log("🧪 Testing basic functionality...");
    
    const maxSlippage = await deployedResolver.maxSlippage();
    const gasLimit = await deployedResolver.gasLimit();
    const deadline = await deployedResolver.deadline();
    
    console.log("Max Slippage:", maxSlippage.toString(), "basis points");
    console.log("Gas Limit:", gasLimit.toString());
    console.log("Deadline:", deadline.toString(), "seconds");
    
    console.log("🎉 FusionResolver deployment completed successfully!");
    
    return {
        fusionResolverAddress,
        bridgeContractAddress,
        deploymentData: fusionDeploymentData
    };
}

// Run deployment
main()
    .then((result) => {
        console.log("Deployment Result:", result);
        process.exit(0);
    })
    .catch((error) => {
        console.error("Deployment failed:", error);
        process.exit(1);
    }); 