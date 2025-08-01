#!/usr/bin/env node

import { OneInchMCPServer } from './mcp/server.js';

// Start the MCP server
const server = new OneInchMCPServer();
server.run().catch((error) => {
  console.error('Failed to start 1inch MCP server:', error);
  process.exit(1);
}); 