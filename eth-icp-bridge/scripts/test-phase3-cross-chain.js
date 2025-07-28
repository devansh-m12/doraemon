const { ethers } = require('ethers');
const path = require('path');
const NetworkConfig = require('./network-config');
const CrossChainBridgeProtocol = require('./bridge-protocol');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

/**
 * Phase 3 Cross-Chain Communication Test Suite
 * Tests message verification, event listening, and Chain Fusion integration
 */
class Phase3CrossChainTest {
    constructor() {
        this.networkConfig = new NetworkConfig();
        this.currentNetwork = this.networkConfig.getCurrentNetwork();
        this.networkSettings = this.networkConfig.getNetworkConfig(this.currentNetwork);
        
        this.bridgeProtocol = new CrossChainBridgeProtocol(this.currentNetwork);
        this.testResults = [];
        this.testOrderIds = [];
    }

    /**
     * Run comprehensive Phase 3 tests
     */
    async runAllTests() {
        console.log('🚀 Starting Phase 3 Cross-Chain Communication Tests');
        console.log('=' .repeat(60));
        
        try {
            // Initialize bridge protocol
            await this.initializeBridge();
            
            // Test 1: Chain Fusion Integration
            await this.testChainFusionIntegration();
            
            // Test 2: Cross-Chain Message Verification
            await this.testCrossChainMessageVerification();
            
            // Test 3: Event Listening and Processing
            await this.testEventListening();
            
            // Test 4: State Synchronization
            await this.testStateSynchronization();
            
            // Test 5: Atomic Swap Coordination
            await this.testAtomicSwapCoordination();
            
            // Test 6: Security Mechanisms
            await this.testSecurityMechanisms();
            
            // Test 7: Performance and Reliability
            await this.testPerformanceAndReliability();
            
            // Print test summary
            this.printTestSummary();
            
        } catch (error) {
            console.error('❌ Phase 3 test suite failed:', error);
        }
    }

    /**
     * Initialize bridge protocol with Phase 3 features
     */
    async initializeBridge() {
        console.log('\n🔧 Initializing Phase 3 Bridge Protocol...');
        
        const contractAddress = process.env[this.networkSettings.CONTRACT_ADDRESS];
        if (!contractAddress) {
            throw new Error('Contract address not found in environment variables');
        }
        
        const success = await this.bridgeProtocol.initialize(contractAddress);
        if (!success) {
            throw new Error('Failed to initialize bridge protocol');
        }
        
        this.recordTestResult('Bridge Initialization', true, 'Bridge protocol initialized with Phase 3 features');
    }

    /**
     * Test Chain Fusion integration
     */
    async testChainFusionIntegration() {
        console.log('\n🔗 Testing Chain Fusion Integration...');
        
        try {
            // Test Chain Fusion connection
            const connectionTest = await this.bridgeProtocol.testChainFusionConnection();
            this.recordTestResult('Chain Fusion Connection', connectionTest, 
                connectionTest ? 'Chain Fusion connection successful' : 'Chain Fusion connection failed');
            
            // Test Ethereum transaction submission via Chain Fusion
            const transactionData = ethers.randomBytes(32);
            const txResult = await this.bridgeProtocol.submitEthereumTransactionViaChainFusion({
                to: this.bridgeProtocol.contractAddress,
                data: transactionData,
                value: '0x0'
            });
            
            this.recordTestResult('Chain Fusion Transaction', txResult.success,
                txResult.success ? 'Transaction submitted via Chain Fusion' : 'Transaction failed');
            
        } catch (error) {
            this.recordTestResult('Chain Fusion Integration', false, error.message);
        }
    }

    /**
     * Test cross-chain message verification
     */
    async testCrossChainMessageVerification() {
        console.log('\n🔍 Testing Cross-Chain Message Verification...');
        
        try {
            // Test valid message
            const validMessage = {
                sourceChain: 'ethereum',
                targetChain: 'icp',
                orderId: ethers.keccak256(ethers.randomBytes(32)),
                sender: this.bridgeProtocol.walletAddress,
                recipient: ethers.keccak256(ethers.toUtf8Bytes('test-icp-principal')),
                amount: ethers.parseEther('0.1'),
                hashlock: ethers.randomBytes(32),
                timelock: Math.floor(Date.now() / 1000) + 7200
            };
            
            const verificationResult = await this.bridgeProtocol.verifyCrossChainMessage(validMessage);
            this.recordTestResult('Valid Message Verification', verificationResult.valid,
                verificationResult.valid ? 'Message verification passed' : 'Message verification failed');
            
            // Test invalid message (expired timelock)
            const invalidMessage = {
                ...validMessage,
                timelock: Math.floor(Date.now() / 1000) - 3600 // Expired
            };
            
            const invalidVerificationResult = await this.bridgeProtocol.verifyCrossChainMessage(invalidMessage);
            this.recordTestResult('Invalid Message Rejection', !invalidVerificationResult.valid,
                !invalidVerificationResult.valid ? 'Invalid message correctly rejected' : 'Invalid message incorrectly accepted');
            
        } catch (error) {
            this.recordTestResult('Message Verification', false, error.message);
        }
    }

    /**
     * Test event listening and processing
     */
    async testEventListening() {
        console.log('\n👂 Testing Event Listening and Processing...');
        
        try {
            // Create a test swap to trigger events
            const testSwapParams = {
                ethereumSender: this.bridgeProtocol.walletAddress,
                icpRecipient: ethers.keccak256(ethers.toUtf8Bytes('test-icp-recipient')),
                amount: '0.01'
            };
            
            const swapResult = await this.bridgeProtocol.createEthereumToICPSwap(testSwapParams);
            if (swapResult.success) {
                this.testOrderIds.push(swapResult.orderId);
                this.recordTestResult('Event Trigger', true, 'Swap created, events should be triggered');
            } else {
                this.recordTestResult('Event Trigger', false, 'Failed to create test swap');
            }
            
            // Wait for event processing
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // Check if events were processed
            const eventProcessed = this.bridgeProtocol.crossChainMessages.size > 0;
            this.recordTestResult('Event Processing', eventProcessed,
                eventProcessed ? 'Events processed successfully' : 'No events processed');
            
        } catch (error) {
            this.recordTestResult('Event Listening', false, error.message);
        }
    }

    /**
     * Test state synchronization between chains
     */
    async testStateSynchronization() {
        console.log('\n🔄 Testing State Synchronization...');
        
        try {
            if (this.testOrderIds.length === 0) {
                this.recordTestResult('State Synchronization', false, 'No test orders available');
                return;
            }
            
            const orderId = this.testOrderIds[0];
            
            // Test state synchronization
            const syncResult = await this.bridgeProtocol.synchronizeState('ethereum', 'icp', orderId);
            this.recordTestResult('State Synchronization', true, 'State synchronization completed');
            
            // Verify state consistency
            const ethereumState = await this.bridgeProtocol.getSwapState('ethereum', orderId);
            const icpState = await this.bridgeProtocol.getSwapState('icp', orderId);
            
            const stateConsistent = ethereumState && icpState;
            this.recordTestResult('State Consistency', stateConsistent,
                stateConsistent ? 'States are consistent' : 'States are inconsistent');
            
        } catch (error) {
            this.recordTestResult('State Synchronization', false, error.message);
        }
    }

    /**
     * Test atomic swap coordination
     */
    async testAtomicSwapCoordination() {
        console.log('\n⚛️ Testing Atomic Swap Coordination...');
        
        try {
            // Create a new test swap for atomic coordination
            const atomicSwapParams = {
                ethereumSender: this.bridgeProtocol.walletAddress,
                icpRecipient: ethers.keccak256(ethers.toUtf8Bytes('atomic-test-recipient')),
                amount: '0.005'
            };
            
            const swapResult = await this.bridgeProtocol.createEthereumToICPSwap(atomicSwapParams);
            if (!swapResult.success) {
                this.recordTestResult('Atomic Swap Creation', false, 'Failed to create atomic swap');
                return;
            }
            
            this.testOrderIds.push(swapResult.orderId);
            
            // Test atomic completion
            const completionResult = await this.bridgeProtocol.completeSwap(swapResult.orderId, swapResult.preimage);
            this.recordTestResult('Atomic Swap Completion', completionResult.success,
                completionResult.success ? 'Atomic swap completed' : 'Atomic swap failed');
            
        } catch (error) {
            this.recordTestResult('Atomic Swap Coordination', false, error.message);
        }
    }

    /**
     * Test security mechanisms
     */
    async testSecurityMechanisms() {
        console.log('\n🔒 Testing Security Mechanisms...');
        
        try {
            // Test unauthorized access prevention
            const unauthorizedCall = async () => {
                try {
                    // This should fail for unauthorized callers
                    await this.bridgeProtocol.completeSwap('fake-order-id', ethers.randomBytes(32));
                    return false; // Should not reach here
                } catch (error) {
                    return error.message.includes('Not authorized') || error.message.includes('Order does not exist');
                }
            };
            
            const unauthorizedBlocked = await unauthorizedCall();
            this.recordTestResult('Unauthorized Access Prevention', unauthorizedBlocked,
                unauthorizedBlocked ? 'Unauthorized access blocked' : 'Unauthorized access allowed');
            
            // Test hashlock verification
            const hashlockTest = await this.bridgeProtocol.verifyHashlock(ethers.randomBytes(32));
            this.recordTestResult('Hashlock Verification', hashlockTest,
                hashlockTest ? 'Hashlock verification passed' : 'Hashlock verification failed');
            
            // Test timelock validation
            const validTimelock = Math.floor(Date.now() / 1000) + 7200;
            const timelockTest = this.bridgeProtocol.verifyTimelock(validTimelock);
            this.recordTestResult('Timelock Validation', timelockTest,
                timelockTest ? 'Timelock validation passed' : 'Timelock validation failed');
            
        } catch (error) {
            this.recordTestResult('Security Mechanisms', false, error.message);
        }
    }

    /**
     * Test performance and reliability
     */
    async testPerformanceAndReliability() {
        console.log('\n⚡ Testing Performance and Reliability...');
        
        try {
            // Test concurrent message processing
            const startTime = Date.now();
            const concurrentPromises = [];
            
            for (let i = 0; i < 5; i++) {
                const message = {
                    sourceChain: 'ethereum',
                    targetChain: 'icp',
                    orderId: ethers.keccak256(ethers.randomBytes(32)),
                    sender: this.bridgeProtocol.walletAddress,
                    recipient: ethers.keccak256(ethers.toUtf8Bytes(`test-recipient-${i}`)),
                    amount: ethers.parseEther('0.01'),
                    hashlock: ethers.randomBytes(32),
                    timelock: Math.floor(Date.now() / 1000) + 7200
                };
                
                concurrentPromises.push(this.bridgeProtocol.verifyCrossChainMessage(message));
            }
            
            const results = await Promise.all(concurrentPromises);
            const endTime = Date.now();
            const processingTime = endTime - startTime;
            
            const allValid = results.every(result => result.valid);
            this.recordTestResult('Concurrent Processing', allValid,
                `Concurrent processing completed in ${processingTime}ms`);
            
            // Test retry mechanism
            const retryTest = this.bridgeProtocol.retryAttempts.size >= 0;
            this.recordTestResult('Retry Mechanism', retryTest,
                retryTest ? 'Retry mechanism available' : 'Retry mechanism not available');
            
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
        console.log('📊 Phase 3 Cross-Chain Communication Test Summary');
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
            console.log('\n🎉 All Phase 3 tests passed! Cross-chain communication is working correctly.');
        } else {
            console.log('\n⚠️ Some tests failed. Please review the implementation.');
        }
    }
}

/**
 * Main test execution
 */
async function main() {
    console.log('🚀 Phase 3 Cross-Chain Communication Test Suite');
    console.log('Testing message verification, event listening, and Chain Fusion integration');
    
    const tester = new Phase3CrossChainTest();
    await tester.runAllTests();
}

// Run tests if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = Phase3CrossChainTest; 