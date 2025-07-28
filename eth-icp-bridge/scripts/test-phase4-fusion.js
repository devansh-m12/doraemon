const { ethers } = require('ethers');
const path = require('path');
const NetworkConfig = require('./network-config');
const FusionIntegration = require('./fusion-integration');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

/**
 * Phase 4: 1inch Fusion+ Integration Test Suite
 * Tests Fusion+ integration, custom resolver, and cross-chain order management
 */
class Phase4FusionTest {
    constructor() {
        this.networkConfig = new NetworkConfig();
        this.currentNetwork = this.networkConfig.getCurrentNetwork();
        this.networkSettings = this.networkConfig.getNetworkConfig(this.currentNetwork);
        
        this.fusionIntegration = new FusionIntegration(this.currentNetwork);
        this.testResults = [];
        this.testOrderIds = [];
    }

    /**
     * Run comprehensive Phase 4 tests
     */
    async runAllTests() {
        console.log('🚀 Starting Phase 4: 1inch Fusion+ Integration Tests');
        console.log('=' .repeat(60));
        
        try {
            // Initialize Fusion+ integration
            await this.initializeFusionIntegration();
            
            // Test 1: Fusion+ SDK Integration
            await this.testFusionSDKIntegration();
            
            // Test 2: Cross-Chain Order Creation
            await this.testCrossChainOrderCreation();
            
            // Test 3: Custom Resolver Logic
            await this.testCustomResolverLogic();
            
            // Test 4: MEV Protection
            await this.testMEVProtection();
            
            // Test 5: Order Monitoring and Resolution
            await this.testOrderMonitoring();
            
            // Test 6: Quote Generation
            await this.testQuoteGeneration();
            
            // Test 7: Order Cancellation
            await this.testOrderCancellation();
            
            // Test 8: Performance and Reliability
            await this.testPerformanceAndReliability();
            
            // Print test summary
            this.printTestSummary();
            
        } catch (error) {
            console.error('❌ Phase 4 test suite failed:', error);
        }
    }

    /**
     * Initialize Fusion+ integration
     */
    async initializeFusionIntegration() {
        console.log('\n🔧 Initializing Fusion+ Integration...');
        
        const success = await this.fusionIntegration.initialize();
        if (!success) {
            throw new Error('Failed to initialize Fusion+ integration');
        }
        
        this.recordTestResult('Fusion+ Initialization', true, 'Fusion+ integration initialized successfully');
    }

    /**
     * Test Fusion+ SDK integration
     */
    async testFusionSDKIntegration() {
        console.log('\n🔗 Testing Fusion+ SDK Integration...');
        
        try {
            // Test Fusion API connection
            const connectionTest = await this.fusionIntegration.testFusionConnection();
            this.recordTestResult('Fusion API Connection', connectionTest, 
                connectionTest ? 'Fusion API connection successful' : 'Fusion API connection failed');
            
            // Test SDK configuration
            const configValid = this.fusionIntegration.fusionConfig.enableMEVProtection;
            this.recordTestResult('MEV Protection Configuration', configValid,
                configValid ? 'MEV protection enabled' : 'MEV protection disabled');
            
            // Test cross-chain configuration
            const crossChainEnabled = this.fusionIntegration.fusionConfig.crossChainEnabled;
            this.recordTestResult('Cross-Chain Configuration', crossChainEnabled,
                crossChainEnabled ? 'Cross-chain enabled' : 'Cross-chain disabled');
            
        } catch (error) {
            this.recordTestResult('Fusion SDK Integration', false, error.message);
        }
    }

    /**
     * Test cross-chain order creation
     */
    async testCrossChainOrderCreation() {
        console.log('\n🔄 Testing Cross-Chain Order Creation...');
        
        try {
            const orderParams = {
                sourceChain: 'ethereum',
                targetChain: 'icp',
                sourceToken: '0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8', // ETH
                amount: '1000000000000000', // 0.001 ETH (reduced amount)
                sender: this.fusionIntegration.bridgeProtocol.walletAddress,
                icpRecipient: ethers.keccak256(ethers.toUtf8Bytes('fusion-test-recipient'))
            };
            
            const order = await this.fusionIntegration.createCrossChainOrder(orderParams);
            
            if (order && order.fusionOrderId) {
                this.testOrderIds.push(order.fusionOrderId);
                this.recordTestResult('Cross-Chain Order Creation', true, 
                    `Order created - Fusion: ${order.fusionOrderId}, Bridge: ${order.bridgeOrderId || 'N/A'}`);
            } else {
                this.recordTestResult('Cross-Chain Order Creation', false, 'Failed to create order');
            }
            
        } catch (error) {
            this.recordTestResult('Cross-Chain Order Creation', false, error.message);
        }
    }

    /**
     * Test custom resolver logic
     */
    async testCustomResolverLogic() {
        console.log('\n🔧 Testing Custom Resolver Logic...');
        
        try {
            if (this.testOrderIds.length === 0) {
                // Create a test order for resolver testing
                const testOrderParams = {
                    sourceChain: 'ethereum',
                    targetChain: 'icp',
                    sourceToken: '0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8',
                    amount: '1000000000000000', // 0.001 ETH
                    sender: this.fusionIntegration.bridgeProtocol.walletAddress,
                    icpRecipient: ethers.keccak256(ethers.toUtf8Bytes('resolver-test-recipient'))
                };
                
                const testOrder = await this.fusionIntegration.createCrossChainOrder(testOrderParams);
                if (testOrder && testOrder.fusionOrderId) {
                    this.testOrderIds.push(testOrder.fusionOrderId);
                }
            }
            
            if (this.testOrderIds.length === 0) {
                this.recordTestResult('Custom Resolver Logic', false, 'No test orders available');
                return;
            }
            
            const orderId = this.testOrderIds[0];
            const order = this.fusionIntegration.fusionOrders.get(orderId);
            
            if (!order) {
                this.recordTestResult('Custom Resolver Logic', false, 'Order not found');
                return;
            }
            
            // Test resolver data encoding
            const resolverData = this.fusionIntegration.encodeCrossChainResolverData(
                order.hashlock,
                order.timelock
            );
            
            const dataValid = resolverData && resolverData.length > 0;
            this.recordTestResult('Resolver Data Encoding', dataValid,
                dataValid ? 'Resolver data encoded successfully' : 'Resolver data encoding failed');
            
            // Test order readiness check
            const isReady = await this.fusionIntegration.checkOrderReadiness(orderId);
            this.recordTestResult('Order Readiness Check', typeof isReady === 'boolean',
                `Order readiness check completed: ${isReady}`);
            
        } catch (error) {
            this.recordTestResult('Custom Resolver Logic', false, error.message);
        }
    }

    /**
     * Test MEV protection
     */
    async testMEVProtection() {
        console.log('\n🛡️ Testing MEV Protection...');
        
        try {
            // Test MEV protection configuration
            const mevEnabled = this.fusionIntegration.fusionConfig.enableMEVProtection;
            this.recordTestResult('MEV Protection Enabled', mevEnabled,
                mevEnabled ? 'MEV protection is enabled' : 'MEV protection is disabled');
            
            // Test gas limit configuration
            const gasLimit = this.fusionIntegration.fusionConfig.gasLimit;
            const gasLimitValid = gasLimit > 0 && gasLimit <= 1000000;
            this.recordTestResult('Gas Limit Configuration', gasLimitValid,
                `Gas limit: ${gasLimit} (${gasLimitValid ? 'valid' : 'invalid'})`);
            
            // Test deadline configuration
            const deadline = this.fusionIntegration.fusionConfig.deadline;
            const deadlineValid = deadline > 0 && deadline <= 3600;
            this.recordTestResult('Deadline Configuration', deadlineValid,
                `Deadline: ${deadline}s (${deadlineValid ? 'valid' : 'invalid'})`);
            
        } catch (error) {
            this.recordTestResult('MEV Protection', false, error.message);
        }
    }

    /**
     * Test order monitoring and resolution
     */
    async testOrderMonitoring() {
        console.log('\n👀 Testing Order Monitoring...');
        
        try {
            // Test order monitoring
            await this.fusionIntegration.monitorFusionOrders();
            this.recordTestResult('Order Monitoring', true, 'Order monitoring executed successfully');
            
            // Test active orders retrieval
            const activeOrders = this.fusionIntegration.getActiveOrders();
            const ordersRetrieved = Array.isArray(activeOrders);
            this.recordTestResult('Active Orders Retrieval', ordersRetrieved,
                `Retrieved ${activeOrders.length} active orders`);
            
        } catch (error) {
            this.recordTestResult('Order Monitoring', false, error.message);
        }
    }

    /**
     * Test quote generation
     */
    async testQuoteGeneration() {
        console.log('\n💰 Testing Quote Generation...');
        
        try {
            const quoteParams = {
                sourceToken: '0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8', // ETH
                amount: '1000000000000000000', // 1 ETH
                sender: this.fusionIntegration.bridgeProtocol.walletAddress
            };
            
            const quote = await this.fusionIntegration.getCrossChainQuote(quoteParams);
            
            if (quote && quote.fusionQuote && quote.bridgeFee) {
                this.recordTestResult('Cross-Chain Quote Generation', true,
                    `Quote generated - Bridge Fee: ${ethers.formatEther(quote.bridgeFee)} ETH`);
            } else {
                this.recordTestResult('Cross-Chain Quote Generation', false, 'Failed to generate quote');
            }
            
        } catch (error) {
            this.recordTestResult('Quote Generation', false, error.message);
        }
    }

    /**
     * Test order cancellation
     */
    async testOrderCancellation() {
        console.log('\n❌ Testing Order Cancellation...');
        
        try {
            if (this.testOrderIds.length === 0) {
                // Create a test order for cancellation testing
                const testOrderParams = {
                    sourceChain: 'ethereum',
                    targetChain: 'icp',
                    sourceToken: '0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8',
                    amount: '1000000000000000', // 0.001 ETH
                    sender: this.fusionIntegration.bridgeProtocol.walletAddress,
                    icpRecipient: ethers.keccak256(ethers.toUtf8Bytes('cancel-test-recipient'))
                };
                
                const testOrder = await this.fusionIntegration.createCrossChainOrder(testOrderParams);
                if (testOrder && testOrder.fusionOrderId) {
                    this.testOrderIds.push(testOrder.fusionOrderId);
                }
            }
            
            if (this.testOrderIds.length === 0) {
                this.recordTestResult('Order Cancellation', false, 'No test orders available');
                return;
            }
            
            const orderId = this.testOrderIds[0];
            
            // Test cancellation logic (without actually cancelling)
            const order = this.fusionIntegration.fusionOrders.get(orderId);
            const canCancel = order && order.status === 'pending';
            
            this.recordTestResult('Order Cancellation Logic', canCancel,
                canCancel ? 'Order can be cancelled' : 'Order cannot be cancelled');
            
        } catch (error) {
            this.recordTestResult('Order Cancellation', false, error.message);
        }
    }

    /**
     * Test performance and reliability
     */
    async testPerformanceAndReliability() {
        console.log('\n⚡ Testing Performance and Reliability...');
        
        try {
            // Test concurrent order creation
            const startTime = Date.now();
            const concurrentPromises = [];
            
            for (let i = 0; i < 3; i++) {
                const orderParams = {
                    sourceChain: 'ethereum',
                    targetChain: 'icp',
                    sourceToken: '0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8',
                    amount: '100000000000000', // 0.0001 ETH (very small amount)
                    sender: this.fusionIntegration.bridgeProtocol.walletAddress,
                    icpRecipient: ethers.keccak256(ethers.toUtf8Bytes(`perf-test-${i}`))
                };
                
                concurrentPromises.push(this.fusionIntegration.createCrossChainOrder(orderParams));
            }
            
            const results = await Promise.allSettled(concurrentPromises);
            const endTime = Date.now();
            const processingTime = endTime - startTime;
            
            const successfulOrders = results.filter(result => result.status === 'fulfilled').length;
            this.recordTestResult('Concurrent Order Creation', successfulOrders > 0,
                `${successfulOrders}/3 orders created in ${processingTime}ms`);
            
            // Test order tracking
            const totalOrders = this.fusionIntegration.fusionOrders.size;
            this.recordTestResult('Order Tracking', totalOrders > 0,
                `Tracking ${totalOrders} orders`);
            
        } catch (error) {
            this.recordTestResult('Performance and Reliability', false, error.message);
        }
    }

    /**
     * Record test result
     */
    recordTestResult(testName, passed, details) {
        const result = {
            test: testName,
            passed: passed,
            details: details,
            timestamp: new Date().toISOString()
        };
        
        this.testResults.push(result);
        
        const status = passed ? '✅' : '❌';
        console.log(`${status} ${testName}: ${details}`);
    }

    /**
     * Print test summary
     */
    printTestSummary() {
        console.log('\n' + '=' .repeat(60));
        console.log('📊 Phase 4: 1inch Fusion+ Integration Test Summary');
        console.log('=' .repeat(60));
        
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.passed).length;
        const failedTests = totalTests - passedTests;
        
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${passedTests} ✅`);
        console.log(`Failed: ${failedTests} ❌`);
        console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
        
        console.log('\n📋 Detailed Results:');
        this.testResults.forEach(result => {
            const status = result.passed ? '✅' : '❌';
            console.log(`${status} ${result.test}: ${result.details}`);
        });
        
        if (failedTests === 0) {
            console.log('\n🎉 All Phase 4 tests passed! Fusion+ integration is working correctly.');
        } else {
            console.log('\n⚠️ Some tests failed. Please review the implementation.');
        }
    }
}

/**
 * Main test execution
 */
async function main() {
    console.log('🚀 Phase 4: 1inch Fusion+ Integration Test Suite');
    console.log('Testing Fusion+ integration, custom resolver, and cross-chain order management');
    
    const tester = new Phase4FusionTest();
    await tester.runAllTests();
}

// Run tests if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = Phase4FusionTest; 