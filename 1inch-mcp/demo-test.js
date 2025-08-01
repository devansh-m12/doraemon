#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('🚀 1inch MCP Server Demo');
console.log('========================\n');

// Start the MCP server
const mcpProcess = spawn('npx', ['tsx', 'src/index.ts'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// Test scenarios
const testScenarios = [
  {
    name: '🔧 Initialize MCP Connection',
    request: {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {}, resources: {}, prompts: {} },
        clientInfo: { name: 'demo-client', version: '1.0.0' }
      }
    }
  },
  {
    name: '📋 List Available Tools',
    request: {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    }
  },
  {
    name: '📚 List Available Resources',
    request: {
      jsonrpc: '2.0',
      id: 3,
      method: 'resources/list',
      params: {}
    }
  },
  {
    name: '🔍 Search Tokens - USDC',
    request: {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'search_tokens',
        arguments: {
          chainId: 1,
          query: 'USDC',
          limit: 3
        }
      }
    }
  },
  {
    name: '🔍 Search Tokens - ETH',
    request: {
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: {
        name: 'search_tokens',
        arguments: {
          chainId: 1,
          query: 'ETH',
          limit: 2
        }
      }
    }
  },
  {
    name: '💰 Get Token Price - USDC',
    request: {
      jsonrpc: '2.0',
      id: 6,
      method: 'tools/call',
      params: {
        name: 'get_token_price',
        arguments: {
          chainId: 1,
          tokenAddress: '0xA0b86a33E6E4B8b5f8c1e9d6b2a8c3e7f9d5c8a7',
          currency: 'USD'
        }
      }
    }
  },
  {
    name: '📖 Read Token Documentation',
    request: {
      jsonrpc: '2.0',
      id: 7,
      method: 'resources/read',
      params: {
        uri: '1inch://token/documentation'
      }
    }
  },
  {
    name: '⭐ Read Popular Tokens',
    request: {
      jsonrpc: '2.0',
      id: 8,
      method: 'resources/read',
      params: {
        uri: '1inch://token/popular-tokens'
      }
    }
  },
  {
    name: '💱 Get Swap Quote - ETH to USDC',
    request: {
      jsonrpc: '2.0',
      id: 9,
      method: 'tools/call',
      params: {
        name: 'get_swap_quote',
        arguments: {
          chainId: 1,
          src: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
          dst: '0xA0b86a33E6E4B8b5f8c1e9d6b2a8c3e7f9d5c8a7',
          amount: '1000000000000000000',
          from: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          slippage: 1
        }
      }
    }
  }
];

let currentTest = 0;

function runNextTest() {
  if (currentTest >= testScenarios.length) {
    console.log('\n✅ Demo completed successfully!');
    mcpProcess.kill();
    process.exit(0);
  }

  const scenario = testScenarios[currentTest];
  console.log(`\n${scenario.name}`);
  console.log('─'.repeat(scenario.name.length));
  
  mcpProcess.stdin.write(JSON.stringify(scenario.request) + '\n');
  currentTest++;
}

// Handle MCP server responses
mcpProcess.stdout.on('data', (data) => {
  const response = data.toString().trim();
  
  if (response.includes('"jsonrpc":"2.0"')) {
    try {
      const parsed = JSON.parse(response);
      console.log('✅ Response received');
      
      // Wait a bit before running next test
      setTimeout(runNextTest, 1500);
    } catch (error) {
      console.log('⚠️  Response parsing error:', error.message);
    }
  } else if (response.includes('info:')) {
    console.log('ℹ️  Server log:', response);
  }
});

// Handle errors
mcpProcess.stderr.on('data', (data) => {
  console.error('❌ MCP Server Error:', data.toString());
});

mcpProcess.on('error', (error) => {
  console.error('❌ Failed to start MCP server:', error);
  process.exit(1);
});

mcpProcess.on('close', (code) => {
  console.log(`\n🔚 MCP server process exited with code ${code}`);
});

// Start the demo
console.log('Starting MCP server...');
setTimeout(runNextTest, 2000); 