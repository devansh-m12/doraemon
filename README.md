# Doraemon 🤖

![Doraemon Logo](logo.png)

**A unified cross-chain DeFi infrastructure with AI-powered trading capabilities.**

*Submitted to ETH Global "Unite DeFi" Hackathon*

---

## 🎯 Project Overview

Doraemon is a comprehensive DeFi platform that bridges multiple blockchain ecosystems with AI-enhanced trading experiences. This project consists of three main components:

### 📁 Project Components

#### 1. **ETH ↔ ICP Cross-Chain Bridge** 📍 [`eth-icp/`](./eth-icp/)
Fusion+ expansion to Internet Computer Protocol (ICP) enabling seamless cross-chain swaps between Ethereum and ICP ecosystems.
- Smart contracts for cross-chain escrow
- ICP canister implementation
- Cross-chain transaction routing

*→ [Read detailed documentation](./eth-icp/README.md)*

#### 2. **ETH ↔ Aptos Cross-Chain Bridge** 📍 [`eth-aptos/`](./eth-aptos/)
Fusion+ expansion to Aptos blockchain enabling efficient cross-chain operations between Ethereum and Aptos networks.
- Move language smart contracts
- Cross-chain resolver implementation
- Aptos-specific transaction handling

*→ [Read detailed documentation](./eth-aptos/README.md)*

#### 3. **1inch MCP Server & Web UI** 📍 [`1inch-mcp/`](./1inch-mcp/) & [`ui/`](./ui/)
Model Context Protocol (MCP) server for 1inch DEX aggregator with modern React-based interface.
- Comprehensive 1inch API integration
- AI-powered trading insights
- Real-time portfolio management
- Cross-chain swap execution

*→ [MCP Server Documentation](./1inch-mcp/README.md)*  
*→ [Web UI Documentation](./ui/README.md)*

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Rust & Cargo (for ICP canisters)
- dfx (for ICP development)
- Aptos CLI (for Aptos contracts)
- Foundry (for Ethereum contracts)

### Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd doraemon

# Make scripts executable
chmod +x start-dev.sh stop-dev.sh

# Start all development services
./start-dev.sh
```

### Quick Access
- **Web UI**: http://localhost:3000
- **MCP Server**: http://localhost:6969
- **Chat Interface**: http://localhost:3939

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Doraemon Platform                     │
├─────────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  ETH ↔ ICP  │  │ ETH ↔ Aptos │  │    1inch MCP        │ │
│  │   Bridge    │  │   Bridge    │  │   + Web UI          │ │
│  │             │  │             │  │                     │ │
│  │ Smart       │  │ Move        │  │ • Trading APIs      │ │
│  │ Contracts   │  │ Contracts   │  │ • AI Integration    │ │
│  │ + Canisters │  │ + Resolvers │  │ • Portfolio Mgmt    │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│                                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, Model Context Protocol
- **Ethereum**: Solidity, Foundry, OpenZeppelin
- **ICP**: Rust, Candid, dfx
- **Aptos**: Move, Aptos CLI
- **AI**: OpenRouter API integration
- **APIs**: 1inch DEX Aggregator

---

## 📄 License

MIT License - Built with ❤️ for ETH Global Unite DeFi Hackathon 