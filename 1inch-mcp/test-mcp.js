#!/usr/bin/env node

import { spawn } from 'child_process';
import readline from 'readline';

// Start the MCP server
const mcpProcess = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Test messages to send to MCP server
const testMessages = [
  // List available tools
  {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {}
  },
  // List available resources
  {
    jsonrpc: '2.0',
    id: 2,
    method: 'resources/list',
    params: {}
  },
  // Test token search
  {
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'search_tokens',
      arguments: {
        chainId: 1,
        query: 'USDC',
        limit: 5
      }
    }
  },
  // Test get token info
  {
    jsonrpc: '2.0',
    id: 4,
    method: 'tools/call',
    params: {
      name: 'get_token_info',
      arguments: {
        chainId: 1,
        tokenAddress: '0xA0b86a33E6E4B8b5f8c1e9d6b2a8c3e7f9d5c8a7'
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
    mcpProcess.kill();
    process.exit(0);
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