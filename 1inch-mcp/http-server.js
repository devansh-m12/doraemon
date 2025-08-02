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

// Buffer for handling large JSON responses
let responseBuffer = '';
let braceCount = 0;
let inString = false;
let escapeNext = false;
let lastActivityTime = Date.now();

// Periodic cleanup to prevent infinite buffering
setInterval(() => {
  const now = Date.now();
  // If no activity for 5 seconds and we have a buffer, clear it
  if (now - lastActivityTime > 5000 && responseBuffer.length > 0) {
    console.log('Clearing stale buffer due to inactivity');
    responseBuffer = '';
    braceCount = 0;
    inString = false;
    escapeNext = false;
  }
}, 5000);

// Function to extract complete JSON objects from buffer
function extractCompleteJSON(buffer) {
  let braceCount = 0;
  let inString = false;
  let escapeNext = false;
  let startIndex = -1;
  let endIndex = -1;
  
  for (let i = 0; i < buffer.length; i++) {
    const char = buffer[i];
    
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    
    if (char === '\\') {
      escapeNext = true;
      continue;
    }
    
    if (char === '"' && !escapeNext) {
      inString = !inString;
    }
    
    if (!inString) {
      if (char === '{') {
        if (startIndex === -1) {
          startIndex = i;
        }
        braceCount++;
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0 && startIndex !== -1) {
          endIndex = i;
          break;
        }
      }
    }
  }
  
  if (startIndex !== -1 && endIndex !== -1) {
    return buffer.substring(startIndex, endIndex + 1);
  }
  
  return null;
}

// Forward child process stdout to parent console
mcpProcess.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('MCP Server:', output);
  
  // Update activity time
  lastActivityTime = Date.now();
  
  // Add new data to buffer
  responseBuffer += output;
  
  // Try to extract complete JSON objects from the buffer
  let extractedJSON;
  while ((extractedJSON = extractCompleteJSON(responseBuffer)) !== null) {
    try {
      const jsonResponse = JSON.parse(extractedJSON);
      if (jsonResponse.id && pendingResponses.has(jsonResponse.id)) {
        const { resolve, timeout } = pendingResponses.get(jsonResponse.id);
        clearTimeout(timeout);
        pendingResponses.delete(jsonResponse.id);
        resolve(jsonResponse);
        console.log('Successfully parsed and resolved JSON response for ID:', jsonResponse.id);
      }
      
      // Remove the extracted JSON from the buffer
      const jsonEndIndex = responseBuffer.indexOf(extractedJSON) + extractedJSON.length;
      responseBuffer = responseBuffer.substring(jsonEndIndex);
      
    } catch (error) {
      console.log('Failed to parse extracted JSON:', error.message);
      console.log('Extracted JSON length:', extractedJSON.length);
      console.log('Extracted JSON ends with:', extractedJSON.slice(-50));
      
      // Remove the failed JSON from buffer to prevent infinite loop
      const jsonEndIndex = responseBuffer.indexOf(extractedJSON) + extractedJSON.length;
      responseBuffer = responseBuffer.substring(jsonEndIndex);
    }
  }
  
  // Additional check: if we have a large buffer and no pending responses, clear it
  if (responseBuffer.length > 10000 && pendingResponses.size === 0) {
    console.log('Clearing large buffer with no pending responses');
    responseBuffer = '';
  }
});

// Handle MCP server responses
let pendingResponses = new Map();

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
      }, 300000); // 30 second timeout for large responses
      
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
      id: 'tools-list',
      method: 'tools/list'
    };
    
    // Create a promise to wait for the response
    const responsePromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        pendingResponses.delete('tools-list');
        reject(new Error('Tools list timeout'));
      }, 10000); // 10 second timeout
      
      pendingResponses.set('tools-list', { resolve, timeout });
    });
    
    // Send request to MCP server
    mcpProcess.stdin.write(JSON.stringify(listToolsRequest) + '\n');
    
    // Wait for response
    const response = await responsePromise;
    res.json(response);
    
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
      id: 'resources-list',
      method: 'resources/list'
    };
    
    // Create a promise to wait for the response
    const responsePromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        pendingResponses.delete('resources-list');
        reject(new Error('Resources list timeout'));
      }, 10000); // 10 second timeout
      
      pendingResponses.set('resources-list', { resolve, timeout });
    });
    
    // Send request to MCP server
    mcpProcess.stdin.write(JSON.stringify(listResourcesRequest) + '\n');
    
    // Wait for response
    const response = await responsePromise;
    res.json(response);
    
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