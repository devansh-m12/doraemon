# 1inch MCP Server

A comprehensive Model Context Protocol (MCP) server that provides access to 1inch APIs through a modular, service-based architecture, optimized for use with Cursor IDE.

## 🚀 Features

- **Service-Based Architecture**: Modular design with separate services for different API domains
- **Complete 1inch API Coverage**: All APIs with 35+ endpoints organized into services
- **Cursor IDE Integration**: Optimized for AI-assisted development
- **Type Safety**: Full TypeScript coverage with strict typing
- **Industry Standards**: Follows Node.js best practices
- **Production Ready**: Error handling, logging, caching, and monitoring
- **Easy Extension**: Add new services without modifying existing code

## 🏗️ Architecture

### Service-Based Design

The project uses a modular service-based architecture where each API domain is encapsulated in its own service:

```
src/
├── services/
│   ├── base/
│   │   └── BaseService.ts          # Abstract base class for all services
│   ├── swap/
│   │   ├── SwapService.ts          # Swap API functionality
│   │   └── SwapTypes.ts            # Swap-specific types
│   ├── token/
│   │   ├── TokenService.ts         # Token API functionality
│   │   └── TokenTypes.ts           # Token-specific types
│   └── ServiceOrchestrator.ts      # Main orchestrator
```

### Available Services

#### Swap Service
- **get_swap_quote**: Get optimal swap rates across DEXs
- **get_swap_transaction**: Get transaction data for execution
- **get_token_allowance**: Check token spending approvals
- **get_approve_transaction**: Generate approval transactions

#### Token Service
- **get_token_info**: Get detailed token information
- **search_tokens**: Search tokens by name or symbol
- **get_token_price**: Get current token prices
- **get_token_balances**: Get wallet token balances

## 🛠️ Quick Start

### 1. Prerequisites

- Node.js 18+ 
- npm or yarn
- 1inch API key (get one at [1inch Developer Portal](https://portal.1inch.dev/))

### 2. Installation

```bash
# Clone the repository
git clone <repository-url>
cd 1inch-mcp

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit .env with your API key
# ONEINCH_API_KEY=your_actual_api_key_here
```

### 3. Build and Run

```bash
# Build the project
npm run build

# Run in development mode
npm run dev

# Run in production mode
npm start
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run only service tests
npm run test:services
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `env.example`:

```env
# 1inch API Configuration
ONEINCH_API_KEY=your_1inch_api_key_here
ONEINCH_BASE_URL=https://api.1inch.dev
ONEINCH_TIMEOUT=30000

# Server Configuration
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# Cache Configuration (optional)
REDIS_URL=redis://localhost:6379
CACHE_TTL=300
CACHE_ENABLED=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
CORS_ORIGIN=*
HELMET_ENABLED=true
```

## 🎯 Cursor IDE Integration

### 1. MCP Configuration

Add this to your Cursor settings:

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

### 2. Usage Examples

Once configured, you can use natural language in Cursor:

```typescript
// Ask Cursor: "Create a function to swap 1 ETH for USDC with 1% slippage"
async function swapETHForUSDC(amount: string, slippage: number = 1) {
  const quote = await mcpClient.callTool('get_swap_quote', {
    chainId: 1,
    src: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', // ETH
    dst: '0xa0b86a33e6e4b8b5f8c1e9d6b2a8c3e7f9d5c8a7', // USDC
    amount: amount,
    from: walletAddress,
    slippage: slippage
  });
  
  return quote;
}

// Ask Cursor: "Get token information for USDC"
async function getTokenInfo(tokenAddress: string) {
  const info = await mcpClient.callTool('get_token_info', {
    chainId: 1,
    tokenAddress: tokenAddress
  });
  
  return info;
}
```

## 🏗️ Development

### Project Structure

```
1inch-mcp/
├── src/
│   ├── index.ts                    # Main entry point
│   ├── mcp/
│   │   └── server.ts               # MCP server implementation
│   ├── services/
│   │   ├── base/
│   │   │   └── BaseService.ts      # Abstract base class
│   │   ├── swap/
│   │   │   ├── SwapService.ts      # Swap API service
│   │   │   └── SwapTypes.ts        # Swap types
│   │   ├── token/
│   │   │   ├── TokenService.ts     # Token API service
│   │   │   └── TokenTypes.ts       # Token types
│   │   └── ServiceOrchestrator.ts  # Service orchestrator
│   ├── config/
│   │   ├── index.ts                # Configuration loader
│   │   ├── logger.ts               # Winston logger
│   │   └── validation.ts           # Config validation
│   └── utils/
│       ├── constants.ts             # App constants
│       └── helpers.ts               # Helper functions
├── tests/
│   └── services/
│       ├── SwapService.test.ts      # Swap service tests
│       └── TokenService.test.ts     # Token service tests
├── docs/                           # Documentation
├── cursor/                         # Cursor-specific config
└── scripts/                        # Build scripts
```

### Adding New Services

To add a new service (e.g., Portfolio Service):

1. Create the service directory:
```bash
mkdir src/services/portfolio
```

2. Create the types file:
```typescript
// src/services/portfolio/PortfolioTypes.ts
export interface PortfolioRequest {
  address: string;
  chains?: number[];
}

export interface PortfolioResponse {
  address: string;
  totalValue: string;
  chains: any[];
}
```

3. Create the service class:
```typescript
// src/services/portfolio/PortfolioService.ts
import { BaseService, ServiceConfig } from '../base/BaseService';
import { PortfolioRequest, PortfolioResponse } from './PortfolioTypes';

export class PortfolioService extends BaseService {
  constructor(serviceConfig: ServiceConfig) {
    super(serviceConfig);
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'get_portfolio_overview',
        description: 'Get portfolio overview',
        inputSchema: {
          type: 'object',
          properties: {
            address: { type: 'string', description: 'Wallet address' }
          },
          required: ['address']
        }
      }
    ];
  }

  // Implement other abstract methods...
}
```

4. Add the service to the orchestrator:
```typescript
// src/services/ServiceOrchestrator.ts
import { PortfolioService } from './portfolio/PortfolioService';

// In initializeServices method:
this.services.set('portfolio', new PortfolioService(serviceConfig));
```

5. Create tests:
```typescript
// tests/services/PortfolioService.test.ts
import { PortfolioService } from '../../src/services/portfolio/PortfolioService';

describe('PortfolioService', () => {
  // Test implementation...
});
```

### Development Commands

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Format code
npm run format

# Generate documentation
npm run docs:generate
```

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new services
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- [1inch Developer Portal](https://portal.1inch.dev/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Cursor IDE](https://cursor.com/)
- [Documentation](docs/)

## 🆘 Support

- Create an issue for bugs or feature requests
- Check the documentation in the `docs/` folder
- Join the community discussions

---

Built with ❤️ for the DeFi community using service-based architecture 