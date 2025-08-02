# 1inch MCP Doraemon Client - Complete Setup Guide

This guide provides step-by-step instructions for setting up the complete 1inch MCP Doraemon client development environment.

## 📋 Prerequisites

### System Requirements
- **Operating System**: macOS, Linux, or Windows (WSL recommended for Windows)
- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher (comes with Node.js)
- **Git**: For cloning the repository
- **curl**: For health checks (usually pre-installed)

### API Keys Required
- **1inch API Key**: Get from [1inch Developer Portal](https://portal.1inch.dev/)
- **OpenRouter API Key**: Get from [OpenRouter](https://openrouter.ai/) (optional, for AI features)

## 🚀 Step-by-Step Setup

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone <repository-url>
cd doraemon

# Verify the structure
ls -la
```

You should see:
```
doraemon/
├── 1inch-mcp/
├── ui/
├── eth-bnb/
├── eth-icp/
├── start-dev.sh
├── stop-dev.sh
└── README.md
```

### Step 2: Install Dependencies

```bash
# Install MCP Server dependencies
cd 1inch-mcp
npm install

# Install UI Client dependencies
cd ../ui
npm install

# Return to root directory
cd ..
```

### Step 3: Environment Configuration

#### 3.1 MCP Server Configuration

Create the environment file for the MCP server:

```bash
cd 1inch-mcp

# Copy the example environment file
cp env.example .env

# Edit the environment file
nano .env  # or use your preferred editor
```

Update the `.env` file with your API keys:

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

#### 3.2 UI Client Configuration

Create the environment file for the UI client:

```bash
cd ../ui

# Create the environment file
cat > .env.local << EOF
# MCP Server Configuration
NEXT_PUBLIC_MCP_SERVER_URL=http://localhost:6969
NEXT_PUBLIC_CHAT_SERVER_URL=http://localhost:3939

# Development Configuration
NEXT_PUBLIC_ENVIRONMENT=development
EOF
```

### Step 4: Make Startup Scripts Executable

```bash
cd ..

# Make scripts executable
chmod +x start-dev.sh stop-dev.sh
```

### Step 5: Verify Installation

#### 5.1 Check Node.js Version
```bash
node --version  # Should be 18 or higher
npm --version   # Should be 9 or higher
```

#### 5.2 Check Port Availability
```bash
# Check if ports are available
lsof -i :3000  # UI Client port
lsof -i :6969  # MCP Server port
lsof -i :3939  # Chat Server port
```

If any ports are in use, you can either:
- Stop the processes using those ports
- Change the ports in the configuration files

### Step 6: Start the Development Environment

#### Option A: Automated Startup (Recommended)

```bash
# Start all services automatically
./start-dev.sh
```

This script will:
1. Check and create environment files if missing
2. Install dependencies if needed
3. Start the MCP server on port 6969
4. Start the chat server on port 3939 (optional)
5. Start the UI client on port 3000
6. Verify all services are running

#### Option B: Manual Startup

If you prefer to start services manually:

**Terminal 1 - MCP Server:**
```bash
cd 1inch-mcp
npm run dev:http
```

**Terminal 2 - Chat Server (Optional):**
```bash
cd 1inch-mcp
npm run dev:chat
```

**Terminal 3 - UI Client:**
```bash
cd ui
npm run dev
```

### Step 7: Verify Services

#### 7.1 Check Service Status

```bash
# Check MCP Server
curl http://localhost:6969/health

# Check UI Client
curl http://localhost:3000

# Check Chat Server (if running)
curl http://localhost:3939
```

#### 7.2 Access the Application

Open your browser and navigate to:
- **UI Client**: http://localhost:3000
- **MCP Server Health**: http://localhost:6969/health
- **Chat Server**: http://localhost:3939 (if running)

## 🔧 Configuration Details

### MCP Server Configuration

The MCP server runs on port 6969 and provides the following endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Server health check |
| `/mcp` | POST | MCP JSON-RPC endpoint |
| `/tools` | GET | List available tools |
| `/resources` | GET | List available resources |
| `/prompts` | GET | List available prompts |

### UI Client Configuration

The UI client runs on port 3000 and connects to the MCP server via HTTP.

### Environment Variables

#### MCP Server (1inch-mcp/.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `ONEINCH_API_KEY` | Your 1inch API key | Required |
| `ONEINCH_BASE_URL` | 1inch API base URL | https://api.1inch.dev |
| `ONEINCH_TIMEOUT` | API request timeout | 30000 |
| `OPENROUTER_API_KEY` | OpenRouter API key | Optional |
| `OPENROUTER_BASE_URL` | OpenRouter API URL | https://openrouter.ai/api/v1 |
| `OPENROUTER_TIMEOUT` | OpenRouter timeout | 60000 |
| `MCP_PORT` | MCP server port | 6969 |
| `NODE_ENV` | Environment | development |
| `LOG_LEVEL` | Logging level | debug |

#### UI Client (ui/.env.local)

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_MCP_SERVER_URL` | MCP server URL | http://localhost:6969 |
| `NEXT_PUBLIC_CHAT_SERVER_URL` | Chat server URL | http://localhost:3939 |
| `NEXT_PUBLIC_ENVIRONMENT` | Environment | development |

## 🛠️ Development Workflow

### Starting Development

```bash
# Start all services
./start-dev.sh

# Or start manually
cd 1inch-mcp && npm run dev:http
cd ui && npm run dev
```

### Stopping Development

```bash
# Stop all services
./stop-dev.sh

# Or stop manually with Ctrl+C in each terminal
```

### Viewing Logs

```bash
# View all logs
tail -f logs/*.log

# View specific service logs
tail -f logs/MCP\ Server.log
tail -f logs/UI\ Client.log
tail -f logs/Chat\ Server.log
```

### Making Changes

1. **MCP Server Changes**: Edit files in `1inch-mcp/src/`
2. **UI Client Changes**: Edit files in `ui/src/`
3. **Service Changes**: Edit files in `1inch-mcp/src/services/`

The development servers will automatically reload when you make changes.

## 🔍 Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Check what's using the port
lsof -i :6969

# Kill the process
kill -9 <PID>
```

#### 2. API Key Issues

```bash
# Verify API key is set
cd 1inch-mcp
grep ONEINCH_API_KEY .env

# Test API key
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://api.1inch.dev/health
```

#### 3. Node Modules Issues

```bash
# Clear node modules and reinstall
cd 1inch-mcp
rm -rf node_modules package-lock.json
npm install

cd ../ui
rm -rf node_modules package-lock.json
npm install
```

#### 4. Environment File Issues

```bash
# Check if environment files exist
ls -la 1inch-mcp/.env
ls -la ui/.env.local

# Recreate if missing
cd 1inch-mcp
cp env.example .env
# Edit .env with your API keys

cd ../ui
cat > .env.local << EOF
NEXT_PUBLIC_MCP_SERVER_URL=http://localhost:6969
NEXT_PUBLIC_CHAT_SERVER_URL=http://localhost:3939
NEXT_PUBLIC_ENVIRONMENT=development
EOF
```

### Debug Mode

Enable debug logging for more detailed information:

```bash
# MCP Server debug
cd 1inch-mcp
LOG_LEVEL=debug npm run dev:http

# UI Client debug
cd ../ui
NEXT_PUBLIC_ENVIRONMENT=development npm run dev
```

### Health Checks

```bash
# Check MCP server health
curl http://localhost:6969/health

# Check available tools
curl http://localhost:6969/tools

# Check UI client
curl http://localhost:3000
```

## 📚 Next Steps

After successful setup:

1. **Explore the UI**: Navigate to http://localhost:3000
2. **Test MCP Connection**: Check the browser console for connection status
3. **Try API Calls**: Use the UI to search for tokens or execute swaps
4. **Review Logs**: Monitor logs for any issues
5. **Customize**: Modify the UI or add new services as needed

## 🤝 Getting Help

If you encounter issues:

1. **Check Logs**: Look at the log files in the `logs/` directory
2. **Verify Environment**: Ensure all environment variables are set correctly
3. **Test Connectivity**: Use curl to test API endpoints
4. **Check Dependencies**: Ensure all npm packages are installed
5. **Restart Services**: Use `./stop-dev.sh` and `./start-dev.sh`

## 📄 Additional Resources

- [1inch Developer Portal](https://portal.1inch.dev/)
- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Node.js Documentation](https://nodejs.org/docs/) 