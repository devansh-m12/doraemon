#!/bin/bash

# 1inch MCP Doraemon Client - Development Stop Script
# This script stops all development services

echo "🛑 Stopping 1inch MCP Doraemon Client Development Environment"
echo "==========================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to stop a service
stop_service() {
    local service_name=$1
    local pid_file="logs/$service_name.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            echo -e "${BLUE}Stopping $service_name (PID: $pid)...${NC}"
            kill $pid 2>/dev/null || true
            
            # Wait for process to stop
            local count=0
            while ps -p $pid > /dev/null 2>&1 && [ $count -lt 10 ]; do
                sleep 1
                count=$((count + 1))
            done
            
            if ps -p $pid > /dev/null 2>&1; then
                echo -e "${RED}Force killing $service_name...${NC}"
                kill -9 $pid 2>/dev/null || true
            fi
            
            echo -e "${GREEN}✅ $service_name stopped${NC}"
        else
            echo -e "${YELLOW}$service_name is not running${NC}"
        fi
        rm -f "$pid_file"
    else
        echo -e "${YELLOW}No PID file found for $service_name${NC}"
    fi
}

# Stop all services
echo -e "${BLUE}Stopping services...${NC}"

stop_service "UI Client"
stop_service "Chat Server"
stop_service "MCP Server"

# Kill any remaining processes on our ports
echo -e "${BLUE}Cleaning up any remaining processes...${NC}"

for port in 3000 3939 6969; do
    local pids=$(lsof -ti:$port 2>/dev/null || true)
    if [ ! -z "$pids" ]; then
        echo -e "${YELLOW}Killing processes on port $port: $pids${NC}"
        echo $pids | xargs kill -9 2>/dev/null || true
    fi
done

# Clean up log files
echo -e "${BLUE}Cleaning up log files...${NC}"
rm -f logs/*.log
rm -f logs/*.pid

echo ""
echo -e "${GREEN}🎉 All development services stopped successfully!${NC}"
echo ""
echo -e "${BLUE}To start services again, run:${NC}"
echo -e "  ${YELLOW}./start-dev.sh${NC}" 