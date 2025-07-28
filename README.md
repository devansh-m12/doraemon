# 1inch Cross-Chain Swap Extension: Ethereum ↔ ICP Bridge

A novel extension for 1inch Cross-chain Swap (Fusion+) that enables bidirectional swaps between Ethereum and Internet Computer Protocol (ICP) with preserved hashlock and timelock functionality.

## 🚀 Project Overview

This project implements a **trustless cross-chain bridge** between Ethereum (EVM) and Internet Computer Protocol (non-EVM) using 1inch's proven Fusion+ architecture. The solution maintains atomic swap guarantees through Hash Time-Locked Contracts (HTLCs) while leveraging ICP's unique Chain Fusion capabilities.

### Key Features

- ✅ **Bidirectional Swaps**: Ethereum ↔ ICP in both directions
- ✅ **Atomic Swap Guarantees**: HTLC implementation with hashlock and timelock
- ✅ **1inch Fusion+ Integration**: Extends existing Fusion SDK architecture
- ✅ **ICP Chain Fusion**: Native Ethereum integration via EVM RPC
- ✅ **Security First**: Multi-signature validation and consensus mechanisms

## 📁 Project Structure

```
eth-icp-bridge/
├── ethereum-contracts/     # Ethereum smart contracts (Hardhat)
│   ├── contracts/         # Solidity contracts
│   ├── test/             # Contract tests
│   └── hardhat.config.js # Hardhat configuration
├── icp-canisters/         # ICP canister smart contracts
│   └── bridge_canister/   # Rust-based canister
├── frontend/              # React-based UI
├── scripts/               # Deployment and utility scripts
├── deployment/            # Deployment configurations
└── docs/                  # Documentation
```

## 🛠️ Technology Stack

### Ethereum Stack
- **Solidity**: Smart contract development
- **Hardhat**: Development framework
- **Ethers.js**: Web3 library
- **OpenZeppelin**: Security-tested libraries
- **1inch Fusion SDK**: Core swap functionality

### ICP Stack
- **Rust CDK**: Canister development
- **DFX**: IC SDK for deployment
- **Chain Fusion**: Native Ethereum integration
- **Threshold ECDSA**: Cross-chain transaction signing

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- DFX (Internet Computer SDK)
- Git

### Secure Environment Setup

This project uses a secure environment configuration that separates sensitive data from public configuration:

- **Public Configuration**: `.env.example` → `.env` (safe to commit)
- **Sensitive Data**: `env.secrets.example` → `.env.secrets` (NEVER commit)

For detailed setup instructions, see [SECURE_SETUP_README.md](SECURE_SETUP_README.md).

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd eth-icp-bridge

# Install dependencies
npm install

# Install DFX (if not already installed)
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
source "$HOME/Library/Application Support/org.dfinity.dfx/env"

# Set up secure environment configuration
./setup-secrets.sh
# Edit .env.secrets with your sensitive data
```

### Development Setup

```bash
# Start the complete development environment
./start.sh

# Or run components individually:

# Ethereum contracts
cd ethereum-contracts
npm install
npx hardhat compile
npx hardhat test

# ICP canisters
cd ../icp-canisters/bridge_canister
dfx start --background
dfx deploy
```

## 📋 Phase 1 Implementation

### Current Status: Foundation Setup ✅

- [x] Project structure initialized
- [x] Hardhat configuration for Ethereum contracts
- [x] DFX setup for ICP canisters
- [x] Core dependencies installed
- [ ] Smart contract development (Phase 2)
- [ ] Cross-chain communication (Phase 3)
- [ ] 1inch Fusion+ integration (Phase 4)
- [ ] Testing & security (Phase 5)
- [ ] UI/UX development (Phase 6)

## 🔧 Development Commands

```bash
# Ethereum Development
cd ethereum-contracts
npx hardhat compile          # Compile contracts
npx hardhat test            # Run tests
npx hardhat node            # Start local node
npx hardhat run scripts/deploy.js --network localhost

# ICP Development
cd icp-canisters/bridge_canister
dfx start --background      # Start local replica
dfx deploy                  # Deploy canisters
dfx canister call bridge_canister greet '("World")'
```

## 🔐 Security Features

- **HTLC Implementation**: Atomic swap guarantees
- **Multi-Signature Validation**: Cross-chain consensus
- **Economic Security**: Anti-griefing mechanisms
- **Smart Contract Audits**: Comprehensive testing

## 📚 Documentation

- [1inch Fusion+ Documentation](https://1inch.io/assets/1inch-fusion-plus.pdf)
- [ICP Developer Documentation](https://internetcomputer.org/docs)
- [Chain Fusion Guide](https://internetcomputer.org/docs/building-apps/chain-fusion/overview)
- [Fusion SDK](https://github.com/1inch/fusion-sdk)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Documentation**: See `/docs` directory

---

**Built with ❤️ for the 1inch and ICP communities** 