# 1inch MCP Server with Intelligent Chat

A Model Context Protocol (MCP) server that provides access to 1inch DEX aggregator APIs with intelligent chat capabilities powered by OpenRouter.

## Features

### 🤖 Intelligent Chat Assistant
- **Conversational AI**: Powered by OpenRouter with access to multiple AI models
- **Tool Integration**: Automatically calls relevant DeFi tools based on user queries
- **Context Management**: Maintains conversation history and context
- **Real-time Responses**: Instant responses with tool execution results

### 🛠️ Available Tools
- **Wallet Analysis**: Check balances, allowances, and portfolio overviews
- **Token Information**: Get token details, prices, and market data
- **Trading Tools**: Get swap quotes, orderbook data, and trading history
- **Market Data**: Access price charts, gas prices, and market trends
- **NFT Services**: Check NFT balances and collections
- **Domain Services**: Resolve domains and get domain information

### 🏗️ Architecture
- **Service-Based**: Modular architecture with dedicated services for each API
- **HTTP Server**: RESTful API for easy integration
- **MCP Protocol**: Standard Model Context Protocol implementation
- **TypeScript**: Fully typed for better development experience

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy the environment file and configure your API keys:
```bash
cp env.example .env
```

Required environment variables:
```env
# 1inch API
ONEINCH_API_KEY=your_1inch_api_key_here

# OpenRouter API
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_SMALL_MODEL=gpt-3.5-turbo
OPENROUTER_LARGE_MODEL=gpt-4
```

### 3. Start the Server
```bash
# Development mode
npm run dev:http

# Production mode
npm run start:http
```

The server will start on port 6969 (configurable via MCP_PORT).

### 4. Start the UI
```bash
cd ui
npm install
npm run dev
```

The UI will be available at http://localhost:3000.

## Usage

### Chat Interface
The web interface provides a modern chat experience where you can:

1. **Ask Questions**: "What's the balance of 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6?"
2. **Get Token Info**: "Tell me about the USDC token"
3. **Check Prices**: "What's the current price of ETH?"
4. **Portfolio Analysis**: "Show me the portfolio for 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"

### API Endpoints

#### Chat Endpoints
- `POST /mcp` - Call the intelligent chat tool
- `GET /tools` - List available tools
- `GET /health` - Health check

#### Example Chat Request
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "intelligent_chat",
    "arguments": {
      "conversationId": "conv_123",
      "message": "What's the balance of 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6?"
    }
  }
}
```

## Available Tools

### Chat Tools
- `intelligent_chat` - Main chat interface with tool orchestration
- `chat_completion` - Direct OpenRouter chat completion
- `get_conversation_history` - Retrieve conversation history
- `clear_conversation` - Clear conversation history

### DeFi Tools
- `get_wallet_balances` - Get wallet token balances
- `get_aggregated_balances_and_allowances` - Multi-wallet balance check
- `get_spot_price` - Get token spot prices
- `get_swap_quote` - Get swap quotes
- `get_token_info` - Get token information
- `get_gas_price` - Get network gas prices
- `get_portfolio_overview` - Get portfolio analysis
- `get_nft_balances` - Get NFT balances
- `get_chart_data` - Get price chart data
- `get_domain_info` - Get domain information

## Development

### Project Structure
```
src/
├── config/           # Configuration management
├── mcp/             # MCP protocol implementation
├── services/        # Service modules
│   ├── balance/     # Balance checking services
│   ├── swap/        # Swap and trading services
│   ├── token/       # Token information services
│   ├── openrouter/  # AI chat services
│   └── ...          # Other services
└── utils/           # Utility functions
```

### Adding New Services
1. Create a new service directory in `src/services/`
2. Extend `BaseService` class
3. Implement required methods: `getTools()`, `getResources()`, `getPrompts()`
4. Add service to `ServiceOrchestrator`

### Testing
```bash
# Run all tests
npm test

# Run specific service tests
npm run test:services

# Watch mode
npm run test:watch
```

## Configuration

### OpenRouter Models
Configure different models for different use cases:
- **Small Model**: Fast responses for simple queries
- **Large Model**: More capable for complex analysis

### Chat Settings
- **Max Tokens**: Control response length
- **Temperature**: Control response creativity
- **Session Timeout**: Conversation cleanup

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review the test examples 