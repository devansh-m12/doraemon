# 1inch MCP Doraemon Client

A comprehensive Model Context Protocol (MCP) client for interacting with 1inch DEX aggregator APIs. This project consists of a modular MCP server and a modern React-based UI client.

## 🏗️ Project Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Doraemon Project                        │
├─────────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐    HTTP/JSON-RPC    ┌─────────────────┐  │
│  │   UI Client     │ ◄─────────────────► │   MCP Server    │  │
│  │   (Next.js)     │                     │   (Express)     │  │
│  │   Port: 3000    │                     │   Port: 6969    │  │
│  └─────────────────┘                     └─────────────────┘  │
│           │                                        │          │
│           │                                        │          │
│           ▼                                        ▼          │
│  ┌─────────────────┐                     ┌─────────────────┐  │
│  │   Chat Server   │                     │ Service Layer   │  │
│  │   Port: 3939    │                     │ (Orchestrator)  │  │
│  └─────────────────┘                     └─────────────────┘  │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                1inch APIs (External)                   │  │
│  │  • Swap API • Token API • Balance API • Gas API       │  │
│  │  • Portfolio API • Charts API • NFT API • etc.        │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
doraemon/
├── 1inch-mcp/                    # MCP Server Implementation
│   ├── src/
│   │   ├── mcp/
│   │   │   ├── http-server.ts    # HTTP server for MCP protocol
│   │   │   └── server.ts         # Standard MCP server
│   │   ├── services/             # 1inch API service implementations
│   │   │   ├── base/
│   │   │   │   └── BaseService.ts # Base service class
│   │   │   ├── swap/
│   │   │   ├── token/
│   │   │   ├── balance/
│   │   │   ├── gas/
│   │   │   ├── portfolio/
│   │   │   ├── charts/
│   │   │   ├── orderbook/
│   │   │   ├── spot-price/
│   │   │   ├── nft/
│   │   │   ├── transaction-gateway/
│   │   │   ├── web3-rpc/
│   │   │   ├── domain/
│   │   │   ├── intent-swap/
│   │   │   ├── fusion-plus-swap/
│   │   │   └── openrouter/
│   │   ├── config/
│   │   │   ├── index.ts          # Configuration management
│   │   │   ├── logger.ts         # Logging configuration
│   │   │   └── validation.ts     # Environment validation
│   │   ├── utils/
│   │   │   └── helpers.ts        # Utility functions
│   │   ├── index.ts              # Standard MCP server entry
│   │   └── http-index.ts         # HTTP server entry
│   ├── tests/                    # Test files
│   ├── package.json
│   └── env.example
├── ui/                           # React UI Client
│   ├── src/
│   │   ├── app/                  # Next.js app router
│   │   │   ├── api/              # API routes
│   │   │   │   ├── chat/
│   │   │   │   │   └── route.ts  # Chat API endpoint
│   │   │   │   ├── health/
│   │   │   │   │   └── route.ts  # Health check endpoint
│   │   │   │   └── test/
│   │   │   │       └── route.ts  # Test API endpoint
│   │   │   ├── globals.css       # Global styles
│   │   │   ├── layout.tsx        # Root layout
│   │   │   └── page.tsx          # Main page
│   │   ├── components/
│   │   │   ├── chatbot/          # Chat interface components
│   │   │   │   ├── ChatContainer.tsx
│   │   │   │   ├── ChatHeader.tsx
│   │   │   │   ├── ChatInput.tsx
│   │   │   │   └── ...
│   │   │   ├── ui/               # UI components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   └── ...
│   │   │   └── MermaidProvider.tsx
│   │   ├── lib/
│   │   │   ├── mcp-client.ts     # MCP client implementation
│   │   │   ├── chat-storage.ts   # Chat storage utilities
│   │   │   └── ...
│   │   └── utils/
│   ├── public/                   # Static assets
│   └── package.json
├── eth-bnb/                      # Ethereum-BNB cross-chain contracts
├── eth-icp/                      # Ethereum-ICP cross-chain contracts
├── start-dev.sh                  # Development startup script
├── stop-dev.sh                   # Development stop script
└── README.md                     # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- 1inch API key (for production)

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/devansh-m12/doraemon.git
cd doraemon

# Make startup scripts executable
chmod +x start-dev.sh stop-dev.sh
```

### 2. Environment Configuration

#### MCP Server Configuration (`1inch-mcp/.env`)
```env
# 1inch API Configuration
ONEINCH_API_KEY=your_1inch_api_key_here
ONEINCH_BASE_URL=https://api.1inch.dev
ONEINCH_TIMEOUT=30000

# OpenRouter Configuration (for AI features)
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_TIMEOUT=60000

# Server Configuration
MCP_PORT=6969
NODE_ENV=development
LOG_LEVEL=debug
```

#### UI Client Configuration (`ui/.env.local`)
```env
# MCP Server Configuration
NEXT_PUBLIC_MCP_SERVER_URL=http://localhost:6969
NEXT_PUBLIC_CHAT_SERVER_URL=http://localhost:3939

# Development Configuration
NEXT_PUBLIC_ENVIRONMENT=development
```

### 3. Start Development Environment

#### Option A: Automated Startup (Recommended)
```bash
# Start all services automatically
./start-dev.sh
```

#### Option B: Manual Startup
```bash
# Terminal 1: Start MCP Server
cd 1inch-mcp
npm install
npm run dev:http

# Terminal 2: Start Chat Server (Optional)
cd 1inch-mcp
npm run dev:chat

# Terminal 3: Start UI Client
cd ui
npm install
npm run dev
```

### 4. Access the Application

- **UI Client**: http://localhost:3000
- **MCP Server**: http://localhost:6969
- **Chat Server**: http://localhost:3939

## 🔧 MCP Connection Flow

### 1. UI Client Initialization
```typescript
// ui/src/lib/mcp-client.ts
export class MCPClient {
  private serverUrl: string;
  private isConnected = false;

  constructor(serverUrl: string = 'http://localhost:6969') {
    this.serverUrl = serverUrl;
  }

  async connect() {
    // Test connection via health endpoint
    const response = await fetch(`${this.serverUrl}/health`);
    this.isConnected = response.ok;
  }

  async callTool(toolCall: MCPToolCall): Promise<MCPResponse> {
    const mcpRequest = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: {
        name: toolCall.name,
        arguments: toolCall.arguments
      }
    };

    const response = await fetch(`${this.serverUrl}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mcpRequest)
    });

    return response.json();
  }
}
```

### 2. MCP Server Request Handling
```typescript
// 1inch-mcp/src/mcp/http-server.ts
export class OneInchMCPHTTPServer {
  private setupRoutes() {
    // MCP JSON-RPC endpoint
    this.app.post('/mcp', async (req, res) => {
      const { jsonrpc, id, method, params } = req.body;
      
      if (method === 'tools/call') {
        const result = await this.orchestrator.handleToolCall(
          params.name, 
          params.arguments
        );
        return res.json({ jsonrpc: '2.0', result, id });
      }
    });
  }
}
```

### 3. Service Orchestrator Routing
```typescript
// 1inch-mcp/src/services/ServiceOrchestrator.ts
export class ServiceOrchestrator {
  async handleToolCall(name: string, args: any): Promise<any> {
    // Find service that handles this tool
    for (const [serviceName, service] of this.services.entries()) {
      const tools = service.getTools();
      const toolExists = tools.some(tool => tool.name === name);
      
      if (toolExists) {
        return await service.handleToolCall(name, args);
      }
    }
    
    throw new Error(`Unknown tool: ${name}`);
  }
}
```

## 📊 Available Services

### Core DEX Services
- **Swap Service**: Execute token swaps across multiple DEXes
- **Token Service**: Search and retrieve token information
- **Balance Service**: Check token balances across chains
- **Gas Service**: Get gas estimates and prices
- **Portfolio Service**: Track portfolio performance

### Advanced Services
- **Charts Service**: Historical price data and charts
- **Orderbook Service**: DEX orderbook data
- **Spot Price Service**: Real-time token prices
- **NFT Service**: NFT trading and information
- **Transaction Gateway**: Cross-chain transaction routing

### AI Integration
- **OpenRouter Service**: AI-powered trading insights
- **Intent Swap Service**: Natural language swap execution
- **Fusion Plus Swap Service**: Advanced swap routing

## 🎯 Usage Examples

### 1. Search Tokens
```typescript
// UI Component
const searchTokens = async (query: string, chainId: number) => {
  const result = await mcpClient.callTool({
    name: 'search_tokens',
    arguments: { query, chainId, limit: 10 }
  });
  return result;
};
```

### 2. Execute Swap
```typescript
// UI Component
const executeSwap = async (swapParams: SwapParams) => {
  const result = await mcpClient.callTool({
    name: 'execute_swap',
    arguments: swapParams
  });
  return result;
};
```

### 3. Get Token Balance
```typescript
// UI Component
const getBalance = async (address: string, tokenAddress: string, chainId: number) => {
  const result = await mcpClient.callTool({
    name: 'get_token_balance',
    arguments: { address, tokenAddress, chainId }
  });
  return result;
};
```

## 🔍 API Endpoints

### MCP Server Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Server health check |
| `/mcp` | POST | MCP JSON-RPC endpoint |
| `/tools` | GET | List available tools |
| `/resources` | GET | List available resources |
| `/prompts` | GET | List available prompts |

### Chat Server Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/chat` | POST | AI chat interface |

## 🛠️ Development

### Adding New Services

1. **Create Service Class**
```typescript
// 1inch-mcp/src/services/new-service/NewService.ts
export class NewService extends BaseService {
  getTools(): ToolDefinition[] {
    return [
      {
        name: 'new_tool',
        description: 'Description of new tool',
        inputSchema: {
          type: 'object',
          properties: {
            // Define input schema
          }
        }
      }
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    if (name === 'new_tool') {
      // Implement tool logic
      return await this.makeRequest('/new-endpoint', args);
    }
  }
}
```

2. **Register Service**
```typescript
// 1inch-mcp/src/services/ServiceOrchestrator.ts
import { NewService } from './new-service/NewService';

private initializeServices() {
  // ... existing services
  this.services.set('new-service', new NewService(serviceConfig));
}
```

### Testing

#### MCP Server Tests
```bash
cd 1inch-mcp
npm run test
npm run test:services
```

#### UI Client Tests
```bash
cd ui
npm run test
```

## 🚀 Production Deployment

### 1. Build Applications
```bash
# Build MCP server
cd 1inch-mcp
npm run build

# Build UI client
cd ../ui
npm run build
```

### 2. Environment Configuration
Ensure all production environment variables are set:
- `ONEINCH_API_KEY`: Production 1inch API key
- `OPENROUTER_API_KEY`: Production OpenRouter API key
- `NODE_ENV=production`
- `LOG_LEVEL=info`

### 3. Start Services
```bash
# Start MCP server
cd 1inch-mcp
npm run start:http

# Start UI client
cd ../ui
npm start
```

## 🔧 Troubleshooting

### Common Issues

1. **MCP Server Connection Failed**
   - Check if MCP server is running on port 6969
   - Verify environment variables are set correctly
   - Check firewall settings

2. **1inch API Errors**
   - Verify API key is valid and has sufficient permissions
   - Check rate limits and API quotas
   - Ensure network connectivity

3. **UI Client Issues**
   - Clear browser cache and local storage
   - Check browser console for errors
   - Verify CORS settings

### Debug Mode

Enable debug logging:
```bash
# MCP Server
LOG_LEVEL=debug npm run dev:http

# UI Client
NEXT_PUBLIC_ENVIRONMENT=development npm run dev
```

## 📚 Additional Resources

- [1inch Developer Portal](https://portal.1inch.dev/)
- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ using Next.js, React 19, and the 1inch MCP server architecture. 