#!/bin/bash

# 1inch MCP Doraemon Client - Development Startup Script
# This script starts all necessary services for development

set -e

echo "🚀 Starting 1inch MCP Doraemon Client Development Environment"
echo "=========================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${RED}Port $1 is already in use${NC}"
        return 1
    else
        return 0
    fi
}

# Function to start a service
start_service() {
    local service_name=$1
    local directory=$2
    local command=$3
    local port=$4
    
    echo -e "${BLUE}Starting $service_name...${NC}"
    
    if [ ! -d "$directory" ]; then
        echo -e "${RED}Directory $directory not found${NC}"
        return 1
    fi
    
    if ! check_port $port; then
        echo -e "${YELLOW}Skipping $service_name (port $port in use)${NC}"
        return 1
    fi
    
    cd "$directory"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing dependencies for $service_name...${NC}"
        npm install
    fi
    
    # Start the service in background
    echo -e "${GREEN}Starting $service_name on port $port${NC}"
    npm run $command > "../logs/$service_name.log" 2>&1 &
    echo $! > "../logs/$service_name.pid"
    
    cd ..
    echo -e "${GREEN}✅ $service_name started${NC}"
}

# Create logs directory
mkdir -p logs

# Check if .env files exist
echo -e "${BLUE}Checking environment configuration...${NC}"

if [ ! -f "1inch-mcp/.env" ]; then
    echo -e "${YELLOW}Creating 1inch-mcp/.env from template...${NC}"
    cp 1inch-mcp/env.example 1inch-mcp/.env
    echo -e "${YELLOW}Please update 1inch-mcp/.env with your API keys${NC}"
fi

if [ ! -f "ui/.env.local" ]; then
    echo -e "${YELLOW}Creating ui/.env.local...${NC}"
    cat > ui/.env.local << EOF
# MCP Server Configuration
NEXT_PUBLIC_MCP_SERVER_URL=http://localhost:6969
NEXT_PUBLIC_CHAT_SERVER_URL=http://localhost:3939

# Development Configuration
NEXT_PUBLIC_ENVIRONMENT=development
EOF
fi

# Kill existing processes if they exist
echo -e "${BLUE}Cleaning up existing processes...${NC}"
for pid_file in logs/*.pid; do
    if [ -f "$pid_file" ]; then
        pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            echo -e "${YELLOW}Killing existing process $pid${NC}"
            kill $pid 2>/dev/null || true
        fi
        rm "$pid_file"
    fi
done

# Start services
echo -e "${BLUE}Starting services...${NC}"

# Start MCP Server
start_service "MCP Server" "1inch-mcp" "dev:http" 6969

# Wait a moment for MCP server to start
sleep 3

# Start Chat Server (optional)
if check_port 3939; then
    start_service "Chat Server" "1inch-mcp" "dev:chat" 3939
else
    echo -e "${YELLOW}Skipping Chat Server (port 3939 in use)${NC}"
fi

# Wait a moment for chat server to start
sleep 2

# Start UI Client
start_service "UI Client" "ui" "dev" 3000

# Wait for all services to start
echo -e "${BLUE}Waiting for services to start...${NC}"
sleep 5

# Check service status
echo -e "${BLUE}Checking service status...${NC}"

check_service_status() {
    local service_name=$1
    local url=$2
    
    if curl -s "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $service_name is running at $url${NC}"
    else
        echo -e "${RED}❌ $service_name is not responding at $url${NC}"
    fi
}

check_service_status "MCP Server" "http://localhost:6969/health"
check_service_status "UI Client" "http://localhost:3000"

if [ -f "logs/Chat Server.pid" ]; then
    check_service_status "Chat Server" "http://localhost:3939"
fi

echo ""
echo -e "${GREEN}🎉 Development environment started successfully!${NC}"
echo ""
echo -e "${BLUE}Services:${NC}"
echo -e "  • UI Client: ${GREEN}http://localhost:3000${NC}"
echo -e "  • MCP Server: ${GREEN}http://localhost:6969${NC}"
if [ -f "logs/Chat Server.pid" ]; then
    echo -e "  • Chat Server: ${GREEN}http://localhost:3939${NC}"
fi
echo ""
echo -e "${BLUE}Logs:${NC}"
echo -e "  • MCP Server: ${YELLOW}logs/MCP Server.log${NC}"
echo -e "  • UI Client: ${YELLOW}logs/UI Client.log${NC}"
if [ -f "logs/Chat Server.pid" ]; then
    echo -e "  • Chat Server: ${YELLOW}logs/Chat Server.log${NC}"
fi
echo ""
echo -e "${BLUE}To stop all services, run:${NC}"
echo -e "  ${YELLOW}./stop-dev.sh${NC}"
echo ""
echo -e "${BLUE}To view logs:${NC}"
echo -e "  ${YELLOW}tail -f logs/*.log${NC}" 