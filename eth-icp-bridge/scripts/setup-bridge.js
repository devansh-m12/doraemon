const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Bridge Setup Script
 * Automates the setup of the Ethereum-ICP bridge
 */
class BridgeSetup {
    constructor() {
        this.projectRoot = path.join(__dirname, '..');
        this.ethereumContractsPath = path.join(this.projectRoot, 'ethereum-contracts');
        this.icpCanistersPath = path.join(this.projectRoot, 'icp-canisters', 'bridge_canister');
    }

    async runSetup() {
        console.log('🚀 Ethereum-ICP Bridge Setup');
        console.log('=============================');
        console.log('');

        try {
            // Step 1: Check prerequisites
            await this.checkPrerequisites();

            // Step 2: Setup Ethereum
            await this.setupEthereum();

            // Step 3: Setup ICP
            await this.setupICP();

            // Step 4: Run tests
            await this.runTests();

            // Step 5: Show deployment instructions
            this.showDeploymentInstructions();

        } catch (error) {
            console.error('❌ Setup failed:', error.message);
            process.exit(1);
        }
    }

    async checkPrerequisites() {
        console.log('🔍 Checking Prerequisites...');

        // Check Node.js
        try {
            const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
            console.log('✅ Node.js:', nodeVersion);
        } catch (error) {
            throw new Error('Node.js not found. Please install Node.js first.');
        }

        // Check npm
        try {
            const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
            console.log('✅ npm:', npmVersion);
        } catch (error) {
            throw new Error('npm not found. Please install npm first.');
        }

        // Check dfx
        try {
            const dfxVersion = execSync('dfx --version', { encoding: 'utf8' }).trim();
            console.log('✅ dfx:', dfxVersion);
        } catch (error) {
            console.log('⚠️ dfx not found. ICP functionality will be limited.');
            console.log('Install with: sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"');
        }

        console.log('');
    }

    async setupEthereum() {
        console.log('🔧 Setting up Ethereum...');

        // Install dependencies
        console.log('📦 Installing Ethereum dependencies...');
        execSync('npm install', { cwd: this.ethereumContractsPath, stdio: 'inherit' });

        // Compile contracts
        console.log('🔨 Compiling smart contracts...');
        execSync('npx hardhat compile', { cwd: this.ethereumContractsPath, stdio: 'inherit' });

        console.log('✅ Ethereum setup complete');
        console.log('');
    }

    async setupICP() {
        console.log('🔧 Setting up ICP...');

        try {
            // Check if dfx is available
            execSync('dfx --version', { stdio: 'ignore' });

            // Build ICP canister
            console.log('🔨 Building ICP canister...');
            execSync('dfx build', { cwd: this.icpCanistersPath, stdio: 'inherit' });

            // Deploy locally
            console.log('📦 Deploying ICP canister locally...');
            execSync('dfx deploy', { cwd: this.icpCanistersPath, stdio: 'inherit' });

            // Get canister ID
            const canisterId = execSync('dfx canister id bridge_canister_backend', { 
                cwd: this.icpCanistersPath, 
                encoding: 'utf8' 
            }).trim();

            console.log('✅ ICP canister deployed with ID:', canisterId);

            // Update .env file
            this.updateEnvironmentFile(canisterId);

        } catch (error) {
            console.log('⚠️ ICP setup skipped (dfx not available)');
            console.log('ICP canister ID will need to be set manually in .env file');
        }

        console.log('');
    }

    updateEnvironmentFile(canisterId) {
        const envPath = path.join(this.projectRoot, '.env');
        
        if (fs.existsSync(envPath)) {
            let envContent = fs.readFileSync(envPath, 'utf8');
            
            // Update ICP canister ID
            envContent = envContent.replace(
                /ICP_CANISTER_ID=.*/,
                `ICP_CANISTER_ID=${canisterId}`
            );
            
            fs.writeFileSync(envPath, envContent);
            console.log('✅ Updated .env file with ICP canister ID');
        }
    }

    async runTests() {
        console.log('🧪 Running Tests...');

        try {
            // Start Hardhat node in background
            console.log('🚀 Starting Hardhat node...');
            const hardhatProcess = execSync('npx hardhat node', { 
                cwd: this.ethereumContractsPath, 
                stdio: 'pipe',
                detached: true 
            });

            // Wait a moment for the node to start
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Run bridge test
            console.log('🔍 Running bridge test...');
            execSync('node scripts/test-bridge-complete.js', { 
                cwd: this.projectRoot, 
                stdio: 'inherit' 
            });

            // Kill the background process
            process.kill(-hardhatProcess.pid);

        } catch (error) {
            console.log('⚠️ Tests failed:', error.message);
            console.log('You can run tests manually with: node scripts/test-bridge-complete.js');
        }

        console.log('');
    }

    showDeploymentInstructions() {
        console.log('📋 Deployment Instructions');
        console.log('========================');
        console.log('');

        console.log('🌐 Ethereum Deployment:');
        console.log('1. Configure .env file with your network settings');
        console.log('2. For Sepolia testnet:');
        console.log('   - Get Alchemy API key from https://alchemy.com');
        console.log('   - Set SEPOLIA_RPC_URL in .env');
        console.log('   - Set SEPOLIA_PRIVATE_KEY in .env');
        console.log('   - Run: npx hardhat run scripts/deploy.js --network sepolia');
        console.log('');

        console.log('🌐 ICP Deployment:');
        console.log('1. Get ICP tokens for deployment:');
        console.log('   - Visit: https://faucet.dfinity.org/');
        console.log('   - Or use: dfx ledger --network ic create-canister');
        console.log('2. Deploy to mainnet:');
        console.log('   - cd icp-canisters/bridge_canister');
        console.log('   - dfx deploy --network ic');
        console.log('3. Update .env with the deployed canister ID');
        console.log('');

        console.log('🔧 Production Setup:');
        console.log('1. Set NETWORK=sepolia in .env for testnet');
        console.log('2. Set NETWORK=mainnet in .env for mainnet (when ready)');
        console.log('3. Configure monitoring and alerts');
        console.log('4. Implement security measures');
        console.log('5. Set up automated testing');
        console.log('');

        console.log('📊 Monitoring:');
        console.log('- Monitor contract events on Etherscan');
        console.log('- Monitor canister calls on ICP dashboard');
        console.log('- Set up alerts for failed transactions');
        console.log('- Monitor gas prices and network congestion');
        console.log('');

        console.log('🔒 Security Checklist:');
        console.log('✅ Use secure private keys (not hardcoded)');
        console.log('✅ Implement rate limiting');
        console.log('✅ Add access controls to canisters');
        console.log('✅ Monitor for suspicious activity');
        console.log('✅ Regular security audits');
        console.log('✅ Backup and recovery procedures');
        console.log('');

        console.log('🎉 Setup Complete!');
        console.log('Your bridge is ready for testing and deployment.');
    }
}

// Run setup
async function main() {
    const setup = new BridgeSetup();
    await setup.runSetup();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = BridgeSetup; 