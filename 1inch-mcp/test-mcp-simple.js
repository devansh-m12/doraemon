#!/usr/bin/env node

import { spawn } from 'child_process';

// Start the MCP server
const mcpProcess = spawn('npx', ['tsx', 'src/index.ts'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// Test messages following MCP protocol
const testMessages = [
  // Initialize the connection
  {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {},
        resources: {},
        prompts: {}
      },
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    }
  },
  // List available tools
  {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
    params: {}
  },
  // List available resources
  {
    jsonrpc: '2.0',
    id: 3,
    method: 'resources/list',
    params: {}
  },
  // Test token search
  {
    jsonrpc: '2.0',
    id: 4,
    method: 'tools/call',
    params: {
      name: 'search_tokens',
      arguments: {
        chainId: 1,
        query: 'USDC',
        limit: 5
      }
    }
  }
];

let messageIndex = 0;

// Send messages to MCP server
function sendNextMessage() {
  if (messageIndex < testMessages.length) {
    const message = testMessages[messageIndex];
    console.log(`\n--- Sending message ${messageIndex + 1} ---`);
    console.log('Request:', JSON.stringify(message, null, 2));
    
    mcpProcess.stdin.write(JSON.stringify(message) + '\n');
    messageIndex++;
  } else {
    console.log('\n--- All test messages sent ---');
    setTimeout(() => {
      mcpProcess.kill();
      process.exit(0);
    }, 2000);
  }
}

// Handle MCP server responses
mcpProcess.stdout.on('data', (data) => {
  const response = data.toString().trim();
  console.log('Response:', response);
  
  // Send next message after a short delay
  setTimeout(sendNextMessage, 1000);
});

// Handle errors
mcpProcess.stderr.on('data', (data) => {
  console.error('MCP Server Error:', data.toString());
});

mcpProcess.on('error', (error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});

mcpProcess.on('close', (code) => {
  console.log(`MCP server process exited with code ${code}`);
});

// Start sending messages
console.log('Starting MCP server tests...');
setTimeout(sendNextMessage, 1000); 