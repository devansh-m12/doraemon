#!/usr/bin/env node

import express from 'express';
import { spawn } from 'child_process';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 6969;

// Middleware
app.use(cors());
app.use(express.json());

// Start the MCP server process
const mcpProcess = spawn('npx', ['tsx', 'src/index.ts'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// Handle MCP server responses
let responseBuffer = '';
let pendingResponses = new Map();

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
        
        // Check if this response matches a pending request
        if (response.id && pendingResponses.has(response.id)) {
          const { resolve, timeout } = pendingResponses.get(response.id);
          clearTimeout(timeout);
          pendingResponses.delete(response.id);
          resolve(response);
        }
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

// Generic MCP endpoint that handles all MCP requests
app.post('/mcp', async (req, res) => {
  try {
    const request = req.body;
    
    console.log('MCP Request:', JSON.stringify(request, null, 2));
    
    // Create a promise to wait for the response
    const responsePromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        pendingResponses.delete(request.id);
        reject(new Error('Request timeout'));
      }, 10000); // 10 second timeout
      
      pendingResponses.set(request.id, { resolve, timeout });
    });
    
    // Send request to MCP server
    mcpProcess.stdin.write(JSON.stringify(request) + '\n');
    
    // Wait for response
    const response = await responsePromise;
    res.json(response);
    
  } catch (error) {
    console.error('Error handling MCP request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: '1inch-mcp-http-wrapper',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// List available tools endpoint
app.get('/tools', async (req, res) => {
  try {
    const listToolsRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list'
    };
    
    mcpProcess.stdin.write(JSON.stringify(listToolsRequest) + '\n');
    
    const timeout = setTimeout(() => {
      res.status(408).json({ error: 'Timeout getting tools list' });
    }, 5000);
    
    mcpProcess.stdout.once('data', (data) => {
      try {
        const response = JSON.parse(data.toString().trim());
        clearTimeout(timeout);
        res.json(response);
      } catch (error) {
        res.status(500).json({ error: 'Invalid response format' });
      }
    });
    
  } catch (error) {
    console.error('Error getting tools:', error);
    res.status(500).json({ error: error.message });
  }
});

// List available resources endpoint
app.get('/resources', async (req, res) => {
  try {
    const listResourcesRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'resources/list'
    };
    
    mcpProcess.stdin.write(JSON.stringify(listResourcesRequest) + '\n');
    
    const timeout = setTimeout(() => {
      res.status(408).json({ error: 'Timeout getting resources list' });
    }, 5000);
    
    mcpProcess.stdout.once('data', (data) => {
      try {
        const response = JSON.parse(data.toString().trim());
        clearTimeout(timeout);
        res.json(response);
      } catch (error) {
        res.status(500).json({ error: 'Invalid response format' });
      }
    });
    
  } catch (error) {
    console.error('Error getting resources:', error);
    res.status(500).json({ error: error.message });
  }
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