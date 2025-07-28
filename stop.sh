#!/bin/bash

echo "🛑 Stopping ICP Transaction Explorer..."

# Stop frontend
if [ -f "frontend.pid" ]; then
    FRONTEND_PID=$(cat frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "Stopping frontend..."
        kill $FRONTEND_PID
        rm frontend.pid
    fi
fi

# Stop Hardhat
if [ -f "hardhat.pid" ]; then
    HARDHAT_PID=$(cat hardhat.pid)
    if kill -0 $HARDHAT_PID 2>/dev/null; then
        echo "Stopping Hardhat..."
        kill $HARDHAT_PID
        rm hardhat.pid
    fi
fi

# Stop dfx
if [ -f "dfx.pid" ]; then
    DFX_PID=$(cat dfx.pid)
    if kill -0 $DFX_PID 2>/dev/null; then
        echo "Stopping ICP local network..."
        kill $DFX_PID
        rm dfx.pid
    fi
fi

# Stop dfx processes
pkill -f "dfx start" 2>/dev/null || true

echo "✅ All services stopped."
