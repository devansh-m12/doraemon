#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { ServiceOrchestrator } from '../services/ServiceOrchestrator';
import { logger } from '../config/logger';

/**
 * 1inch MCP Server
 * 
 * This server provides Model Context Protocol access to 1inch APIs using a service-based architecture:
 * - Swap Service: Token swapping with best rates
 * - Token Service: Token information and balances
 * 
 * Each service is self-contained and can be easily extended or modified.
 */

export class OneInchMCPServer {
  private server: Server;
  private orchestrator: ServiceOrchestrator;

  constructor() {
    this.server = new Server(
      {
        name: '1inch-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
      }
    );

    this.orchestrator = new ServiceOrchestrator();
    this.setupToolHandlers();
    this.setupResourceHandlers();
    this.setupPromptHandlers();
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.orchestrator.getAllTools()
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        const result = await this.orchestrator.handleToolCall(name, args);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (error) {
        logger.error(`Error handling tool ${name}:`, error);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ]
        };
      }
    });
  }

  private setupResourceHandlers() {
    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: this.orchestrator.getAllResources()
      };
    });

    // Handle resource reads
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      try {
        return await this.orchestrator.handleResourceRead(uri);
      } catch (error) {
        logger.error(`Error handling resource ${uri}:`, error);
        throw new Error(`Unknown resource: ${uri}`);
      }
    });
  }

  private setupPromptHandlers() {
    // List available prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: this.orchestrator.getAllPrompts()
      };
    });

    // Handle prompt requests
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        return await this.orchestrator.handlePromptRequest(name, args);
      } catch (error) {
        logger.error(`Error handling prompt ${name}:`, error);
        throw new Error(`Unknown prompt: ${name}`);
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    logger.info('1inch MCP Server running on stdio');
  }
}