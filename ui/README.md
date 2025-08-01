# 1inch MCP Doraemon Client

A modern React-based UI client for interacting with the 1inch Model Context Protocol (MCP) server. This application provides a comprehensive interface for accessing 1inch DEX aggregator APIs through the MCP protocol.

## 🏗️ Architecture Overview

### System Components

```
┌─────────────────┐    HTTP/JSON-RPC    ┌─────────────────┐    REST API    ┌─────────────────┐
│   UI Client     │ ◄─────────────────► │   MCP Server    │ ◄────────────► │   1inch APIs    │
│   (Next.js)     │                     │   (Express)     │                │   (External)     │
└─────────────────┘                     └─────────────────┘                └─────────────────┘
        │                                        │
        │                                        │
        ▼                                        ▼
┌─────────────────┐                     ┌─────────────────┐
│   Chat Server   │                     │ Service Layer   │
│   (Port 3939)   │                     │ (Orchestrator)  │
└─────────────────┘                     └─────────────────┘
```

### Process Flow

1. **UI Client Initialization**
   - Next.js application starts on port 3000
   - MCP client connects to HTTP server on port 6969
   - Health check validates connection

2. **MCP Server Startup**
   - Express server initializes on port 6969
   - Service orchestrator loads all 1inch services
   - CORS enabled for cross-origin requests

3. **Request Flow**
   ```
   User Action → UI Component → MCP Client → HTTP Server → Service Orchestrator → 1inch API
   ```

4. **Response Flow**
   ```
   1inch API → Service Orchestrator → HTTP Server → MCP Client → UI Component → User
   ```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- 1inch API key (for production)

### 1. Clone and Setup

```bash
# Clone the repository
cd doraemon

# Install dependencies for both projects
cd 1inch-mcp && npm install
cd ../ui && npm install
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

### 3. Start the Services

#### Terminal 1: Start MCP Server
```bash
cd 1inch-mcp

# Development mode with hot reload
npm run dev:http

# Or production mode
npm run build
npm run start:http
```

#### Terminal 2: Start Chat Server (Optional)
```bash
cd 1inch-mcp

# Start chat server for AI interactions
npm run dev:chat
```

#### Terminal 3: Start UI Client
```bash
cd ui

# Development mode
npm run dev
```

### 4. Access the Application

- **UI Client**: http://localhost:3000
- **MCP Server**: http://localhost:6969
- **Chat Server**: http://localhost:3939

## 🔧 MCP Connection Details

### MCP Client Implementation

The UI uses a custom MCP client that communicates with the 1inch MCP server over HTTP:

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

### MCP Server Implementation

The 1inch MCP server provides HTTP endpoints for MCP protocol:

```typescript
// 1inch-mcp/src/mcp/http-server.ts
export class OneInchMCPHTTPServer {
  private setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

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

### Service Orchestrator

The orchestrator manages all 1inch services and routes requests:

```typescript
// 1inch-mcp/src/services/ServiceOrchestrator.ts
export class ServiceOrchestrator {
  private services: Map<string, BaseService>;

  constructor() {
    this.services = new Map();
    this.initializeServices();
  }

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

The MCP server provides access to the following 1inch services:

### Core Services
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

### Project Structure

```
doraemon/
├── 1inch-mcp/                    # MCP Server
│   ├── src/
│   │   ├── mcp/
│   │   │   └── http-server.ts    # HTTP server implementation
│   │   ├── services/             # 1inch service implementations
│   │   │   ├── base/
│   │   │   ├── swap/
│   │   │   ├── token/
│   │   │   └── ...               # Other services
│   │   └── config/               # Configuration management
│   └── package.json
├── ui/                           # UI Client
│   ├── src/
│   │   ├── app/                  # Next.js app router
│   │   ├── components/           # React components
│   │   ├── lib/
│   │   │   └── mcp-client.ts    # MCP client implementation
│   │   └── utils/                # Utility functions
│   └── package.json
```

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
