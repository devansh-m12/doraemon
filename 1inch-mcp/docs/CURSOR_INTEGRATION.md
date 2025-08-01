# Cursor IDE Integration Guide

This guide explains how to integrate the 1inch MCP Server with Cursor IDE for enhanced AI-assisted development.

## 🎯 Overview

The 1inch MCP Server provides Cursor with access to all 1inch APIs, enabling intelligent code generation, real-time data access, and context-aware suggestions for DeFi development.

## 🚀 Quick Setup

### 1. Install the MCP Server

```bash
# Clone and setup the server
git clone <repository-url>
cd 1inch-mcp
npm install
npm run build

# Copy environment file and add your API key
cp env.example .env
# Edit .env with your 1inch API key
```

### 2. Configure Cursor

Add this to your Cursor settings (Settings → MCP):

```json
{
  "mcpServers": {
    "1inch-mcp-server": {
      "command": "node",
      "args": ["/absolute/path/to/1inch-mcp/dist/index.js"],
      "env": {
        "ONEINCH_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### 3. Add Documentation

1. Go to `Settings → Features → Docs → Add New Doc`
2. URL: `https://portal.1inch.dev/documentation`
3. Name: `1inch-official-docs`

## 💡 Usage Examples

### Natural Language Queries

Once configured, you can ask Cursor natural language questions:

```
"Create a function to swap ETH for USDC with 1% slippage"
"Get the current price of USDC on Ethereum"
"Show me how to check token balances for a wallet"
"Create a function to get gas prices for Ethereum"
```

### Generated Code Examples

Cursor will generate code like this:

```typescript
// Swap ETH for USDC
async function swapETHForUSDC(amount: string, slippage: number = 1) {
  const quote = await mcpClient.callTool('get_swap_quote', {
    chainId: 1,
    src: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', // ETH
    dst: '0xa0b86a33e6e4b8b5f8c1e9d6b2a8c3e7f5c8a7', // USDC
    amount: amount,
    from: walletAddress,
    slippage: slippage
  });
  
  return quote;
}

// Get token price
async function getTokenPrice(tokenAddress: string, chainId: number = 1) {
  const price = await mcpClient.callTool('get_token_price', {
    chainId,
    tokenAddress,
    currency: 'USD'
  });
  
  return price;
}

// Check token balances
async function getTokenBalances(walletAddress: string, chainId: number = 1) {
  const balances = await mcpClient.callTool('get_token_balances', {
    chainId,
    address: walletAddress
  });
  
  return balances;
}
```

## 🛠️ Available Tools in Cursor

### Swap Operations
- `get_swap_quote` - Get optimal swap rates
- `get_swap_transaction` - Get transaction data
- `get_token_allowance` - Check approvals
- `get_approve_transaction` - Generate approvals

### Portfolio Management
- `get_portfolio_overview` - Multi-chain portfolio
- `get_portfolio_tokens` - Token holdings
- `get_token_balances` - Wallet balances

### Price & Market Data
- `get_token_price` - Current prices
- `get_price_history` - Historical data
- `get_gas_prices` - Network fees

### Token Information
- `search_tokens` - Find tokens
- `get_token_info` - Token details

### Advanced Features
- `create_fusion_order` - Gasless swaps
- `broadcast_transaction` - Send transactions
- `get_swap_history` - Transaction history

## 📚 Resources Available

The server provides these resources to Cursor:

- **API Documentation**: Complete 1inch API docs
- **Supported Chains**: List of blockchain networks
- **Popular Tokens**: Common token addresses

## 💬 Interactive Prompts

### Swap Assistant
Ask: "Help me swap tokens"
- Guides through the swap process
- Explains slippage and gas optimization
- Provides best practices

### Portfolio Analysis
Ask: "Analyze my DeFi portfolio"
- Shows token diversification
- Identifies optimization opportunities
- Provides market insights

## 🔧 Advanced Configuration

### Custom Environment Variables

```json
{
  "mcpServers": {
    "1inch-mcp-server": {
      "command": "node",
      "args": ["/path/to/1inch-mcp/dist/index.js"],
      "env": {
        "ONEINCH_API_KEY": "your_key",
        "NODE_ENV": "development",
        "LOG_LEVEL": "debug"
      }
    }
  }
}
```

### Multiple API Keys

For different environments:

```json
{
  "mcpServers": {
    "1inch-mcp-dev": {
      "command": "node",
      "args": ["/path/to/1inch-mcp/dist/index.js"],
      "env": {
        "ONEINCH_API_KEY": "dev_key",
        "NODE_ENV": "development"
      }
    },
    "1inch-mcp-prod": {
      "command": "node",
      "args": ["/path/to/1inch-mcp/dist/index.js"],
      "env": {
        "ONEINCH_API_KEY": "prod_key",
        "NODE_ENV": "production"
      }
    }
  }
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Server not starting**
   - Check API key in environment
   - Verify Node.js version (18+)
   - Check file permissions

2. **Tools not available**
   - Restart Cursor after configuration
   - Check server logs for errors
   - Verify MCP configuration syntax

3. **API errors**
   - Validate API key at 1inch portal
   - Check rate limits
   - Verify network connectivity

### Debug Mode

Enable debug logging:

```json
{
  "mcpServers": {
    "1inch-mcp-server": {
      "command": "node",
      "args": ["/path/to/1inch-mcp/dist/index.js"],
      "env": {
        "ONEINCH_API_KEY": "your_key",
        "LOG_LEVEL": "debug"
      }
    }
  }
}
```

## 🚀 Best Practices

### Code Generation
- Use specific, descriptive queries
- Include error handling in generated code
- Specify chain IDs and token addresses clearly

### Performance
- Cache frequently used data
- Use appropriate rate limits
- Monitor API usage

### Security
- Never commit API keys to version control
- Use environment variables for secrets
- Regularly rotate API keys

## 📖 Additional Resources

- [1inch Developer Portal](https://portal.1inch.dev/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Cursor Documentation](https://docs.cursor.com/)
- [DeFi Development Best Practices](docs/BEST_PRACTICES.md)

## 🤝 Support

- Check the main README for setup instructions
- Review the troubleshooting section above
- Create an issue for bugs or feature requests
- Join the community discussions

---

Happy coding with 1inch and Cursor! 🚀 