const { ethers } = require('ethers');
const NetworkConfig = require('./network-config');

/**
 * Transaction Verification Script
 * Checks and verifies transactions on the local network
 */
class TransactionChecker {
    constructor() {
        const networkConfig = new NetworkConfig();
        networkConfig.setupEnvironment();
        
        this.provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
        this.contractAddress = process.env.ETHEREUM_CONTRACT_ADDRESS;
        
        // Load contract ABI
        const contractABI = require('../ethereum-contracts/artifacts/contracts/EthereumICPBridge.sol/EthereumICPBridge.json').abi;
        this.contract = new ethers.Contract(this.contractAddress, contractABI, this.provider);
    }

    async checkTransaction(txHash) {
        console.log('🔍 Checking Transaction:', txHash);
        console.log('================================');
        
        try {
            // Get transaction details
            const tx = await this.provider.getTransaction(txHash);
            if (!tx) {
                console.log('❌ Transaction not found');
                return;
            }

            console.log('📋 Transaction Details:');
            console.log('From:', tx.from);
            console.log('To:', tx.to);
            console.log('Value:', ethers.formatEther(tx.value), 'ETH');
            console.log('Gas Price:', ethers.formatUnits(tx.gasPrice, 'gwei'), 'gwei');
            console.log('Nonce:', tx.nonce);
            console.log('');

            // Get transaction receipt
            const receipt = await this.provider.getTransactionReceipt(txHash);
            console.log('📊 Transaction Receipt:');
            console.log('Status:', receipt.status === 1 ? '✅ Success' : '❌ Failed');
            console.log('Block Number:', receipt.blockNumber);
            console.log('Gas Used:', receipt.gasUsed.toString());
            console.log('Effective Gas Price:', ethers.formatUnits(receipt.gasPrice, 'gwei'), 'gwei');
            console.log('');

            // Check if it's a contract interaction
            if (tx.to === this.contractAddress) {
                console.log('🏗️ Contract Interaction Detected');
                console.log('Contract Address:', this.contractAddress);
                
                // Try to decode the transaction
                try {
                    const decoded = this.contract.interface.parseTransaction({ data: tx.data, value: tx.value });
                    console.log('Function:', decoded.name);
                    console.log('Arguments:', decoded.args);
                    console.log('');
                } catch (error) {
                    console.log('⚠️ Could not decode transaction data');
                }

                // Check for events
                if (receipt.logs.length > 0) {
                    console.log('📢 Events Emitted:');
                    receipt.logs.forEach((log, index) => {
                        try {
                            const parsed = this.contract.interface.parseLog(log);
                            console.log(`Event ${index + 1}:`, parsed.name);
                            console.log('Arguments:', parsed.args);
                        } catch (error) {
                            console.log(`Event ${index + 1}: Unknown event`);
                        }
                    });
                }
            }

            // Get block details
            const block = await this.provider.getBlock(receipt.blockNumber);
            console.log('📦 Block Details:');
            console.log('Block Hash:', block.hash);
            console.log('Timestamp:', new Date(block.timestamp * 1000).toISOString());
            console.log('Gas Limit:', block.gasLimit.toString());
            console.log('Gas Used:', block.gasUsed.toString());
            console.log('');

        } catch (error) {
            console.error('❌ Error checking transaction:', error.message);
        }
    }

    async checkContractState() {
        console.log('🏗️ Contract State Check');
        console.log('======================');
        console.log('Contract Address:', this.contractAddress);
        console.log('');

        try {
            // Check contract code
            const code = await this.provider.getCode(this.contractAddress);
            if (code === '0x') {
                console.log('❌ No contract deployed at this address');
                return;
            }

            console.log('✅ Contract is deployed');
            console.log('');

            // Get contract state
            const bridgeFeePercentage = await this.contract.bridgeFeePercentage();
            const minSwapAmount = await this.contract.minSwapAmount();
            const maxSwapAmount = await this.contract.maxSwapAmount();
            const owner = await this.contract.owner();

            console.log('📊 Contract State:');
            console.log('Bridge Fee Percentage:', bridgeFeePercentage.toString(), 'basis points');
            console.log('Min Swap Amount:', ethers.formatEther(minSwapAmount), 'ETH');
            console.log('Max Swap Amount:', ethers.formatEther(maxSwapAmount), 'ETH');
            console.log('Owner:', owner);
            console.log('');

            // Get contract balance
            const balance = await this.provider.getBalance(this.contractAddress);
            console.log('💰 Contract Balance:', ethers.formatEther(balance), 'ETH');
            console.log('');

        } catch (error) {
            console.error('❌ Error checking contract state:', error.message);
        }
    }

    async listRecentTransactions(limit = 10) {
        console.log('📜 Recent Transactions');
        console.log('======================');
        console.log('');

        try {
            const latestBlock = await this.provider.getBlockNumber();
            console.log('Latest Block:', latestBlock);
            console.log('');

            for (let i = 0; i < limit; i++) {
                const blockNumber = latestBlock - i;
                const block = await this.provider.getBlock(blockNumber, true);
                
                if (block && block.transactions.length > 0) {
                    console.log(`📦 Block ${blockNumber}:`);
                    console.log('Timestamp:', new Date(block.timestamp * 1000).toISOString());
                    console.log('Transactions:', block.transactions.length);
                    
                    block.transactions.forEach((tx, index) => {
                        console.log(`  ${index + 1}. ${tx.hash}`);
                        console.log(`     From: ${tx.from}`);
                        console.log(`     To: ${tx.to || 'Contract Creation'}`);
                        console.log(`     Value: ${ethers.formatEther(tx.value)} ETH`);
                    });
                    console.log('');
                }
            }

        } catch (error) {
            console.error('❌ Error listing recent transactions:', error.message);
        }
    }
}

// CLI usage
async function main() {
    const checker = new TransactionChecker();
    const command = process.argv[2];
    const txHash = process.argv[3];

    switch (command) {
        case 'check':
            if (!txHash) {
                console.log('Usage: node check-transaction.js check <txHash>');
                process.exit(1);
            }
            await checker.checkTransaction(txHash);
            break;
            
        case 'state':
            await checker.checkContractState();
            break;
            
        case 'recent':
            const limit = process.argv[3] || 10;
            await checker.listRecentTransactions(parseInt(limit));
            break;
            
        default:
            console.log('Transaction Checker');
            console.log('Usage:');
            console.log('  node check-transaction.js check <txHash>  - Check specific transaction');
            console.log('  node check-transaction.js state           - Check contract state');
            console.log('  node check-transaction.js recent [limit]  - List recent transactions');
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = TransactionChecker; 