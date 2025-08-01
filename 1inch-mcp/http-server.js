#!/usr/bin/env node

import express from 'express';
import { spawn } from 'child_process';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Start the MCP server process
const mcpProcess = spawn('npx', ['tsx', 'src/index.ts'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// Handle MCP server responses
let responseBuffer = '';
mcpProcess.stdout.on('data', (data) => {
  responseBuffer += data.toString();
  
  // Try to parse complete JSON responses
  try {
    const lines = responseBuffer.split('\n').filter(line => line.trim());
    responseBuffer = '';
    
    for (const line of lines) {
      if (line.trim()) {
        const response = JSON.parse(line);
        console.log('MCP Response:', JSON.stringify(response, null, 2));
      }
    }
  } catch (error) {
    // Incomplete JSON, keep buffering
  }
});

// Handle MCP server errors
mcpProcess.stderr.on('data', (data) => {
  console.error('MCP Server Error:', data.toString());
});

mcpProcess.on('error', (error) => {
  console.error('Failed to start MCP server:', error);
});

// HTTP endpoint to forward requests to MCP server
app.post('/mcp', async (req, res) => {
  try {
    const request = req.body;
    
    console.log('HTTP Request:', JSON.stringify(request, null, 2));
    
    // Send request to MCP server
    mcpProcess.stdin.write(JSON.stringify(request) + '\n');
    
    // Wait for response (simple implementation)
    setTimeout(() => {
      res.json({
        message: 'Request sent to MCP server',
        request: request
      });
    }, 1000);
    
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: '1inch-mcp-http-wrapper',
    timestamp: new Date().toISOString()
  });
});

// Start HTTP server
app.listen(PORT, () => {
  console.log(`HTTP Server running on http://localhost:${PORT}`);
  console.log(`MCP requests can be sent to http://localhost:${PORT}/mcp`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down...');
  mcpProcess.kill();
  process.exit(0);
}); 