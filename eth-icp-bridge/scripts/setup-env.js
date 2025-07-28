const fs = require('fs');
const path = require('path');
const readline = require('readline');

/**
 * Environment Setup Script
 * Helps configure the .env file with proper testnet values
 */
class EnvSetup {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.envPath = path.join(__dirname, '..', '.env');
    }

    question(prompt) {
        return new Promise((resolve) => {
            this.rl.question(prompt, resolve);
        });
    }

    async setup() {
        console.log('🚀 Environment Setup for Ethereum-ICP Bridge');
        console.log('=============================================\n');

        console.log('📋 Required Services:');
        console.log('1. Alchemy/Infura account (for Sepolia RPC)');
        console.log('2. 1inch Developer Portal account');
        console.log('3. MetaMask wallet with Sepolia testnet');
        console.log('4. Sepolia test ETH (from faucets)\n');

        const envContent = await this.readEnvFile();
        const updatedContent = await this.updateEnvFile(envContent);
        await this.writeEnvFile(updatedContent);

        console.log('\n✅ Environment setup complete!');
        console.log('📝 Next steps:');
        console.log('1. Get Sepolia test ETH from faucets');
        console.log('2. Deploy contracts to Sepolia testnet');
        console.log('3. Deploy ICP canisters to testnet');
        console.log('4. Test the integration\n');

        this.rl.close();
    }

    async readEnvFile() {
        try {
            return fs.readFileSync(this.envPath, 'utf8');
        } catch (error) {
            console.error('❌ Error reading .env file:', error.message);
            process.exit(1);
        }
    }

    async writeEnvFile(content) {
        try {
            fs.writeFileSync(this.envPath, content);
            console.log('✅ .env file updated successfully');
        } catch (error) {
            console.error('❌ Error writing .env file:', error.message);
        }
    }

    async updateEnvFile(content) {
        let updatedContent = content;

        // 1. Ethereum RPC URL
        console.log('🔗 Step 1: Ethereum Sepolia RPC URL');
        console.log('Get this from: https://www.alchemy.com/ or https://infura.io/');
        const rpcUrl = await this.question('Enter your Sepolia RPC URL: ');
        if (rpcUrl.trim()) {
            updatedContent = updatedContent.replace(
                /ETHEREUM_RPC_URL=.*/,
                `ETHEREUM_RPC_URL=${rpcUrl.trim()}`
            );
            updatedContent = updatedContent.replace(
                /TEST_ETHEREUM_RPC_URL=.*/,
                `TEST_ETHEREUM_RPC_URL=${rpcUrl.trim()}`
            );
        }

        // 2. 1inch API Token
        console.log('\n🔑 Step 2: 1inch API Token');
        console.log('Get this from: https://portal.1inch.dev/');
        const apiToken = await this.question('Enter your 1inch API token: ');
        if (apiToken.trim()) {
            updatedContent = updatedContent.replace(
                /DEV_PORTAL_API_TOKEN=.*/,
                `DEV_PORTAL_API_TOKEN=${apiToken.trim()}`
            );
        }

        // 3. Ethereum Private Key
        console.log('\n🔐 Step 3: Ethereum Private Key');
        console.log('⚠️  WARNING: Never share your private key!');
        console.log('Get this from MetaMask: Account Details → Export Private Key');
        const privateKey = await this.question('Enter your Ethereum private key (or press Enter to skip): ');
        if (privateKey.trim()) {
            updatedContent = updatedContent.replace(
                /ETHEREUM_PRIVATE_KEY=.*/,
                `ETHEREUM_PRIVATE_KEY=${privateKey.trim()}`
            );
        }

        // 4. Ethereum Wallet Address
        console.log('\n👛 Step 4: Ethereum Wallet Address');
        console.log('This is your wallet address (public key)');
        const walletAddress = await this.question('Enter your Ethereum wallet address: ');
        if (walletAddress.trim()) {
            updatedContent = updatedContent.replace(
                /ETHEREUM_WALLET_ADDRESS=.*/,
                `ETHEREUM_WALLET_ADDRESS=${walletAddress.trim()}`
            );
        }

        // 5. Contract Address (optional for now)
        console.log('\n📄 Step 5: Deployed Contract Address (Optional)');
        console.log('This will be available after deploying contracts to Sepolia');
        const contractAddress = await this.question('Enter deployed contract address (or press Enter to skip): ');
        if (contractAddress.trim()) {
            updatedContent = updatedContent.replace(
                /ETHEREUM_CONTRACT_ADDRESS=.*/,
                `ETHEREUM_CONTRACT_ADDRESS=${contractAddress.trim()}`
            );
        }

        // 6. ICP Canister ID (optional for now)
        console.log('\n🌐 Step 6: ICP Canister ID (Optional)');
        console.log('This will be available after deploying ICP canisters');
        const canisterId = await this.question('Enter ICP canister ID (or press Enter to skip): ');
        if (canisterId.trim()) {
            updatedContent = updatedContent.replace(
                /ICP_CANISTER_ID=.*/,
                `ICP_CANISTER_ID=${canisterId.trim()}`
            );
            updatedContent = updatedContent.replace(
                /TEST_ICP_CANISTER_ID=.*/,
                `TEST_ICP_CANISTER_ID=${canisterId.trim()}`
            );
        }

        return updatedContent;
    }

    async validateSetup() {
        console.log('\n🔍 Validating setup...');
        
        const envContent = await this.readEnvFile();
        const lines = envContent.split('\n');
        
        const required = [
            'ETHEREUM_RPC_URL',
            'DEV_PORTAL_API_TOKEN'
        ];
        
        const optional = [
            'ETHEREUM_PRIVATE_KEY',
            'ETHEREUM_WALLET_ADDRESS',
            'ETHEREUM_CONTRACT_ADDRESS',
            'ICP_CANISTER_ID'
        ];

        console.log('\n📊 Setup Status:');
        
        required.forEach(key => {
            const line = lines.find(l => l.startsWith(key + '='));
            const value = line ? line.split('=')[1] : '';
            const status = value && !value.includes('YOUR_') && !value.includes('HERE') ? '✅' : '❌';
            console.log(`${status} ${key}: ${value || 'Not set'}`);
        });

        optional.forEach(key => {
            const line = lines.find(l => l.startsWith(key + '='));
            const value = line ? line.split('=')[1] : '';
            const status = value && !value.includes('YOUR_') && !value.includes('HERE') ? '✅' : '⚠️';
            console.log(`${status} ${key}: ${value || 'Not set (optional)'}`);
        });
    }
}

// Run setup
async function main() {
    const setup = new EnvSetup();
    
    try {
        await setup.setup();
        await setup.validateSetup();
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = EnvSetup; 