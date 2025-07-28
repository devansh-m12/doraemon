const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function deployResolverV2() {
    console.log("🚀 Deploying ICP Fusion Resolver V2...\n");

    try {
        const [deployer] = await ethers.getSigners();
        console.log("Deploying contracts with account:", deployer.address);
        console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

        // Deploy ICP Fusion Resolver V2
        console.log("\n1️⃣ Deploying ICP Fusion Resolver V2...");
        const ICPFusionResolverV2 = await ethers.getContractFactory("ICPFusionResolverV2");
        const resolver = await ICPFusionResolverV2.deploy();
        await resolver.waitForDeployment();
        const resolverAddress = await resolver.getAddress();
        console.log("✅ ICP Fusion Resolver V2 deployed to:", resolverAddress);

        // Get contract info
        const network = await ethers.provider.getNetwork();
        const deploymentInfo = {
            network: network.name || network.chainId.toString(),
            chainId: network.chainId.toString(), // Convert BigInt to string
            deployer: deployer.address,
            contracts: {
                ICPFusionResolverV2: {
                    address: resolverAddress,
                    constructorArgs: [],
                    deployedAt: new Date().toISOString(),
                    transactionHash: resolver.deploymentTransaction().hash
                }
            },
            deploymentTime: new Date().toISOString()
        };

        // Save deployment info
        const deploymentPath = path.join(__dirname, '..', 'deployment-resolver-v2.json');
        fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
        console.log("📄 Deployment info saved to:", deploymentPath);

        // Update environment variables
        const envPath = path.join(__dirname, '..', '..', '..', '.env');
        if (fs.existsSync(envPath)) {
            let envContent = fs.readFileSync(envPath, 'utf8');
            
            // Update or add resolver address
            if (envContent.includes('RESOLVER_V2_ADDRESS=')) {
                envContent = envContent.replace(
                    /RESOLVER_V2_ADDRESS=.*/,
                    `RESOLVER_V2_ADDRESS=${resolverAddress}`
                );
            } else {
                envContent += `\nRESOLVER_V2_ADDRESS=${resolverAddress}`;
            }
            
            fs.writeFileSync(envPath, envContent);
            console.log("🔧 Environment variables updated");
        }

        // Verify deployment
        console.log("\n2️⃣ Verifying deployment...");
        const deployedResolver = await ethers.getContractAt("ICPFusionResolverV2", resolverAddress);
        const owner = await deployedResolver.owner();
        console.log("✅ Owner address:", owner);
        console.log("✅ Deployer is owner:", owner === deployer.address);

        // Test basic functionality
        console.log("\n3️⃣ Testing basic functionality...");
        
        // Test relayer authorization
        const isAuthorized = await deployedResolver.isAuthorizedRelayer(deployer.address);
        console.log("✅ Deployer is authorized relayer:", isAuthorized);

        // Test order status for non-existent order
        const nonExistentStatus = await deployedResolver.getOrderStatus("0x0000000000000000000000000000000000000000000000000000000000000000");
        console.log("✅ Non-existent order status:", nonExistentStatus.toString());

        console.log("\n🎉 ICP Fusion Resolver V2 deployment completed successfully!");
        console.log("📋 Contract Address:", resolverAddress);
        console.log("🔗 Network:", network.name || `Chain ID ${network.chainId}`);
        console.log("👤 Owner:", owner);

        return {
            resolverAddress,
            deploymentInfo
        };

    } catch (error) {
        console.error("❌ Deployment failed:", error);
        throw error;
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { deployResolverV2 };
}

// Run if called directly
if (require.main === module) {
    deployResolverV2()
        .then(() => {
            console.log("\n✅ Deployment script completed");
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Deployment script failed:", error);
            process.exit(1);
        });
} 