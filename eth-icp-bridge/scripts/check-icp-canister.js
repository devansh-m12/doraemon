const { exec } = require('child_process');
const path = require('path');
const NetworkConfig = require('./network-config');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

/**
 * Check ICP Canister State and Swap Data
 */
class ICPCanisterChecker {
    constructor() {
        // Setup network configuration
        const networkConfig = new NetworkConfig();
        networkConfig.setupEnvironment();
        
        this.canisterId = process.env.ICP_CANISTER_ID;
        this.network = process.env.NETWORK || 'local'; // Use local network
    }

    async checkCanisterStatus() {
        console.log('🔍 Checking ICP Canister Status');
        console.log('==============================');
        console.log('');
        
        console.log('📋 Canister Info:');
        console.log('Canister ID:', this.canisterId);
        console.log('Network:', this.network);
        console.log('');
        
        try {
            // Test basic functionality
            console.log('🧪 Testing Basic Functionality:');
            await this.runDFXCommand(`dfx canister --network=local call ${this.canisterId} greet '("Test")'`);
            
            // Check canister status
            console.log('');
            console.log('📊 Canister Status:');
            await this.runDFXCommand(`dfx canister --network=local call ${this.canisterId} get_canister_status`);
            
            // Check bridge configuration
            console.log('');
            console.log('⚙️ Bridge Configuration:');
            await this.runDFXCommand(`dfx canister --network=local call ${this.canisterId} get_bridge_config_query`);
            
        } catch (error) {
            console.error('❌ Error checking canister:', error.message);
        }
    }

    async checkSwapData() {
        console.log('');
        console.log('🔄 Checking Swap Data');
        console.log('=====================');
        console.log('');
        
        try {
            // Check if there are any swap orders (this might not be implemented yet)
            console.log('📋 Checking Swap Orders:');
            console.log('Note: This will show available methods and any swap data');
            
            // Try to get a specific swap order (this will fail if none exist, which is expected)
            console.log('Trying to get swap order with ID "test"...');
            await this.runDFXCommand(`dfx canister --network=local call ${this.canisterId} get_swap_order '("test")'`);
            
        } catch (error) {
            console.log('⚠️ Expected: No swap orders exist yet');
            console.log('This is normal - no swaps have been created yet');
        }
    }

    async runDFXCommand(command) {
        return new Promise((resolve, reject) => {
            console.log(`$ ${command}`);
            exec(command, { cwd: path.join(__dirname, '..', 'icp-canisters', 'bridge_canister') }, (error, stdout, stderr) => {
                if (error) {
                    console.log('❌ Command failed:', error.message);
                    reject(error);
                } else {
                    console.log('✅ Output:', stdout.trim());
                    resolve(stdout);
                }
            });
        });
    }

    async checkEthereumTransaction() {
        console.log('');
        console.log('🔗 Checking Ethereum Transaction');
        console.log('===============================');
        console.log('');
        
        try {
            const { ethers } = require('ethers');
            const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
            const contractAddress = process.env.ETHEREUM_CONTRACT_ADDRESS;
            
            if (!contractAddress) {
                throw new Error('Contract address not configured');
            }
            
            // Load contract ABI
            const contractABI = require('../ethereum-contracts/artifacts/contracts/EthereumICPBridge.sol/EthereumICPBridge.json').abi;
            const contract = new ethers.Contract(contractAddress, contractABI, provider);
            
            console.log('📊 Contract State:');
            console.log('Contract Address:', contractAddress);
            
            // Get recent events
            console.log('');
            console.log('📋 Recent Swap Events:');
            
            // Get the latest block number
            const latestBlock = await provider.getBlockNumber();
            console.log('Latest Block:', latestBlock);
            
            // Get SwapCreated events from the last 10 blocks
            const fromBlock = Math.max(0, latestBlock - 10);
            const events = await contract.queryFilter('SwapCreated', fromBlock, latestBlock);
            
            if (events.length > 0) {
                console.log('✅ Found', events.length, 'swap events:');
                events.forEach((event, index) => {
                    console.log(`Event ${index + 1}:`);
                    console.log('  Order ID:', event.args.orderId);
                    console.log('  Sender:', event.args.sender);
                    console.log('  Amount:', ethers.formatEther(event.args.amount), 'ETH');
                    console.log('  Hashlock:', event.args.hashlock);
                });
            } else {
                console.log('ℹ️ No recent swap events found');
            }
            
        } catch (error) {
            console.error('❌ Error checking Ethereum transaction:', error.message);
        }
    }

    async runFullCheck() {
        console.log('🔍 Full ICP Canister and Transaction Check');
        console.log('==========================================');
        console.log('');
        
        await this.checkCanisterStatus();
        await this.checkSwapData();
        await this.checkEthereumTransaction();
        
        console.log('');
        console.log('✅ Check complete!');
        console.log('');
        console.log('🔗 Useful Links:');
        console.log('ICP Canister UI: https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=' + this.canisterId);
        console.log('Etherscan Contract: https://sepolia.etherscan.io/address/' + process.env.ETHEREUM_CONTRACT_ADDRESS);
    }
}

// Run check
async function main() {
    const checker = new ICPCanisterChecker();
    await checker.runFullCheck();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = ICPCanisterChecker; 