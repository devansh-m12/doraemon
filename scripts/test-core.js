#!/usr/bin/env node

const { ethers } = require("hardhat");

async function testCoreFunctionality() {
    console.log("🧪 Testing Core Doraemon Bridge Functionality...\n");

    try {
        // Test 1: Contract Deployment
        console.log("1️⃣ Testing Contract Deployment...");
        const [deployer] = await ethers.getSigners();
        
        const BridgeFactory = await ethers.getContractFactory("EthereumICPBridge");
        const bridge = await BridgeFactory.deploy();
        await bridge.waitForDeployment();
        const bridgeAddress = await bridge.getAddress();
        console.log("✅ Bridge deployed to:", bridgeAddress);

        const ResolverFactory = await ethers.getContractFactory("DoraemonResolver");
        const resolver = await ResolverFactory.deploy(bridgeAddress);
        await resolver.waitForDeployment();
        const resolverAddress = await resolver.getAddress();
        console.log("✅ Resolver deployed to:", resolverAddress);

        // Test 2: Bridge Configuration
        console.log("\n2️⃣ Testing Bridge Configuration...");
        await bridge.setAuthorizedResolver(resolverAddress, true);
        console.log("✅ Resolver authorized");

        await bridge.setBridgeFeePercentage(10);
        console.log("✅ Bridge fee set to 10%");

        await bridge.setSwapLimits(
            ethers.parseEther("0.001"),
            ethers.parseEther("100")
        );
        console.log("✅ Swap limits configured");

        // Test 3: Resolver Configuration
        console.log("\n3️⃣ Testing Resolver Configuration...");
        await resolver.setResolverAuthorization(bridgeAddress, true);
        console.log("✅ Bridge authorized in resolver");

        await resolver.updateFusionConfig(
            500, // 5% max slippage
            300000, // gas limit
            Math.floor(Date.now() / 1000) + 3600 // deadline
        );
        console.log("✅ Fusion+ config updated");

        await resolver.setSafetyDeposit(ethers.parseEther("0.01"));
        console.log("✅ Safety deposit set");

        // Test 4: Metadata Verification
        console.log("\n4️⃣ Testing Metadata...");
        const [name, version, supportedChains] = await resolver.getResolverMetadata();
        console.log("✅ Resolver metadata:", {
            name: name,
            version: version,
            supportedChains: supportedChains
        });

        // Test 5: Fusion+ Compatibility
        console.log("\n5️⃣ Testing Fusion+ Compatibility...");
        const isCompatible = await resolver.isFusionCompatible();
        console.log("✅ Fusion+ compatible:", isCompatible);

        // Test 6: Statistics
        console.log("\n6️⃣ Testing Statistics...");
        const [totalOrders, completedOrders, cancelledOrders, pendingOrders] = await resolver.getResolverStats();
        console.log("✅ Resolver stats:", {
            totalOrders: totalOrders.toString(),
            completedOrders: completedOrders.toString(),
            cancelledOrders: cancelledOrders.toString(),
            pendingOrders: pendingOrders.toString()
        });

        console.log("\n🎉 All core functionality tests passed!");
        console.log("\n📋 Contract Addresses:");
        console.log("   Bridge:", bridgeAddress);
        console.log("   Resolver:", resolverAddress);

        return true;

    } catch (error) {
        console.error("❌ Test failed:", error.message);
        return false;
    }
}

// Run the test
testCoreFunctionality()
    .then((success) => {
        if (success) {
            console.log("\n✅ Core functionality test completed successfully!");
            process.exit(0);
        } else {
            console.log("\n❌ Core functionality test failed!");
            process.exit(1);
        }
    })
    .catch((error) => {
        console.error("💥 Test error:", error);
        process.exit(1);
    }); 