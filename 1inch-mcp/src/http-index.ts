#!/usr/bin/env node

import { OneInchMCPHTTPServer } from './mcp/http-server.js';

// Get port from environment variable or default to 6969
const PORT = parseInt(process.env.MCP_PORT || '6969', 10);

// Start the MCP HTTP server
const server = new OneInchMCPHTTPServer(PORT);
server.run().catch((error) => {
  console.error('Failed to start 1inch MCP HTTP server:', error);
  process.exit(1);
}); 