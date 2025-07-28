require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true
    }
  },
  paths: {
    sources: "./eth-icp-bridge/ethereum-contracts/contracts",
    artifacts: "./eth-icp-bridge/ethereum-contracts/artifacts",
    cache: "./eth-icp-bridge/ethereum-contracts/cache"
  },
  networks: {
    hardhat: {
      chainId: 1337,
      accounts: {
        count: 10,
        accountsBalance: "10000000000000000000000" // 10,000 ETH
      }
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337
    },
    sepolia: {
      url: process.env.ETHEREUM_RPC_URL || "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
      accounts: process.env.ETHEREUM_PRIVATE_KEY ? [process.env.ETHEREUM_PRIVATE_KEY] : [],
      chainId: 11155111
    },
    mainnet: {
      url: process.env.ETHEREUM_RPC_URL || "https://mainnet.infura.io/v3/YOUR_INFURA_KEY",
      accounts: process.env.ETHEREUM_PRIVATE_KEY ? [process.env.ETHEREUM_PRIVATE_KEY] : [],
      chainId: 1
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD"
  },
  mocha: {
    timeout: 40000
  }
}; 