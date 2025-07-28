const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Deploy ICPFusionResolver contract for real 1inch Fusion+ integration
 */
async function main() {
    console.log("🚀 Deploying ICPFusionResolver for Real 1inch Fusion+ Integration");
    
    // Get the contract factory
    const ICPFusionResolver = await ethers.getContractFactory("ICPFusionResolver");
    
    console.log("📦 Deploying ICPFusionResolver...");
    const icpResolver = await ICPFusionResolver.deploy();
    
    await icpResolver.waitForDeployment();
    const icpResolverAddress = await icpResolver.getAddress();
    
    console.log("✅ ICPFusionResolver deployed successfully!");
    console.log("Resolver Address:", icpResolverAddress);
    
    // Save deployment information
    const deploymentData = {
        contractAddress: icpResolverAddress,
        contractName: "ICPFusionResolver",
        network: "localhost",
        deployer: (await ethers.getSigners())[0].address,
        deploymentTime: new Date().toISOString(),
        constructorArgs: []
    };
    
    const deploymentPath = path.join(__dirname, "..", "deployment-icp-resolver-localhost.json");
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentData, null, 2));
    
    console.log("📄 Deployment data saved to:", deploymentPath);
    
    // Verify deployment
    console.log("🔍 Verifying deployment...");
    
    const deployedResolver = ICPFusionResolver.attach(icpResolverAddress);
    
    // Test basic functionality
    const isFusionCompatible = await deployedResolver.isFusionCompatible();
    console.log("Fusion Compatible:", isFusionCompatible);
    
    const metadata = await deployedResolver.getResolverMetadata();
    console.log("Resolver Metadata:", metadata);
    
    // Get initial stats
    const stats = await deployedResolver.getResolverStats();
    console.log("Initial Stats:", {
        totalOrders: stats.totalOrders.toString(),
        completedOrders: stats.completedOrders.toString(),
        cancelledOrders: stats.cancelledOrders.toString(),
        pendingOrders: stats.pendingOrders.toString(),
        totalVolume: stats.totalVolume.toString()
    });
    
    console.log("✅ ICPFusionResolver deployment verified successfully!");
    
    // Save ABI for frontend integration
    const abiPath = path.join(__dirname, "..", "artifacts", "contracts", "ICPFusionResolver.sol", "ICPFusionResolver.json");
    if (fs.existsSync(abiPath)) {
        const artifact = JSON.parse(fs.readFileSync(abiPath, "utf8"));
        const abiData = {
            address: icpResolverAddress,
            abi: artifact.abi,
            network: "localhost"
        };
        
        const abiOutputPath = path.join(__dirname, "..", "ICPFusionResolver-abi.json");
        fs.writeFileSync(abiOutputPath, JSON.stringify(abiData, null, 2));
        console.log("📄 ABI saved to:", abiOutputPath);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    }); 