#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import { ServiceOrchestrator } from '../services/ServiceOrchestrator';
import { logger } from '../config/logger';

/**
 * 1inch MCP HTTP Server
 * 
 * This server provides Model Context Protocol access to 1inch APIs over HTTP.
 * It runs on a specified port and can be accessed by other applications.
 */

export class OneInchMCPHTTPServer {
  private app: express.Application;
  private orchestrator: ServiceOrchestrator;
  private port: number;

  constructor(port: number = 6969) {
    this.port = port;
    this.app = express();
    this.orchestrator = new ServiceOrchestrator();
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    this.app.use(cors({
      origin: '*',
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
    this.app.use(express.json());
  }

  private setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // MCP JSON-RPC endpoint
    this.app.post('/mcp', async (req, res) => {
      try {
        const { jsonrpc, id, method, params } = req.body;
        
        if (jsonrpc !== '2.0') {
          return res.status(400).json({
            jsonrpc: '2.0',
            error: { code: -32600, message: 'Invalid Request' },
            id
          });
        }

        if (method === 'tools/call') {
          const { name, arguments: args } = params;
          const result = await this.orchestrator.handleToolCall(name, args);
          return res.json({
            jsonrpc: '2.0',
            result,
            id
          });
        } else if (method === 'tools/list') {
          const tools = this.orchestrator.getAllTools();
          return res.json({
            jsonrpc: '2.0',
            result: { tools },
            id
          });
        } else if (method === 'resources/list') {
          const resources = this.orchestrator.getAllResources();
          return res.json({
            jsonrpc: '2.0',
            result: { resources },
            id
          });
        } else if (method === 'resources/read') {
          const { uri } = params;
          const result = await this.orchestrator.handleResourceRead(uri);
          return res.json({
            jsonrpc: '2.0',
            result,
            id
          });
        } else {
          return res.status(400).json({
            jsonrpc: '2.0',
            error: { code: -32601, message: 'Method not found' },
            id
          });
        }
      } catch (error) {
        logger.error('Error handling MCP request:', error);
        return res.status(500).json({
          jsonrpc: '2.0',
          error: { 
            code: -32603, 
            message: error instanceof Error ? error.message : 'Internal error' 
          },
          id: req.body.id
        });
      }
    });

    // List available tools
    this.app.get('/tools', async (req, res) => {
      try {
        const tools = this.orchestrator.getAllTools();
        res.json({ tools });
      } catch (error) {
        logger.error('Error listing tools:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Handle tool calls
    this.app.post('/tools/:name', async (req, res) => {
      const { name } = req.params;
      const args = req.body;

      try {
        const result = await this.orchestrator.handleToolCall(name, args);
        res.json(result);
      } catch (error) {
        logger.error(`Error handling tool ${name}:`, error);
        res.status(500).json({ 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    });

    // List available resources
    this.app.get('/resources', async (req, res) => {
      try {
        const resources = this.orchestrator.getAllResources();
        res.json({ resources });
      } catch (error) {
        logger.error('Error listing resources:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Handle resource reads
    this.app.get('/resources/read', async (req, res) => {
      const { uri } = req.query;

      try {
        const result = await this.orchestrator.handleResourceRead(uri as string);
        res.json(result);
      } catch (error) {
        logger.error(`Error handling resource ${uri}:`, error);
        res.status(404).json({ error: `Unknown resource: ${uri}` });
      }
    });

    // List available prompts
    this.app.get('/prompts', async (req, res) => {
      try {
        const prompts = this.orchestrator.getAllPrompts();
        res.json({ prompts });
      } catch (error) {
        logger.error('Error listing prompts:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Handle prompt requests
    this.app.post('/prompts/:name', async (req, res) => {
      const { name } = req.params;
      const args = req.body;

      try {
        const result = await this.orchestrator.handlePromptRequest(name, args);
        res.json(result);
      } catch (error) {
        logger.error(`Error handling prompt ${name}:`, error);
        res.status(500).json({ 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    });
  }

  async run() {
    this.app.listen(this.port, () => {
      logger.info(`1inch MCP HTTP Server running on port ${this.port}`);
      logger.info(`Server URL: http://localhost:${this.port}`);
    });
  }
} 