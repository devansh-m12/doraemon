#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import { ServiceOrchestrator } from './src/services/ServiceOrchestrator.ts';

const app = express();
const PORT = 3939;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize the service orchestrator
let orchestrator;
let openRouterService;

async function initializeServices() {
  try {
    console.log('Initializing ServiceOrchestrator...');
    orchestrator = new ServiceOrchestrator();
    
    // Get the OpenRouter service from orchestrator
    openRouterService = orchestrator.getService('openrouter');
    
    if (!openRouterService) {
      throw new Error('OpenRouter service not found in orchestrator');
    }
    
    console.log('OpenRouter service initialized successfully');
  } catch (error) {
    console.error('Failed to initialize services:', error);
    process.exit(1);
  }
}

// Chat endpoint
app.post('/chat', async (req, res) => {
  try {
    const { message, conversationId} = req.body;
    
    // Validate required parameters
    if (!message) {
      return res.status(400).json({
        error: 'Missing required parameter: message'
      });
    }
    
    console.log(`Processing chat request: ${message.substring(0, 100)}...`);
    
    // Use the OpenRouter service's chat method
    const result = await openRouterService.chat(message, conversationId);
    
    console.log('Chat request completed successfully');
    
    // Return the response
    res.json({
      success: true,
      data: {
        content: result.content,
        conversationId: conversationId || `conv_${Date.now()}`,
        functionCalls: result.functionCalls,
        mermaidCode: result.mermaidCode
      }
    });
    
  } catch (error) {
    console.error('Chat request failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'chat-server'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start the server
async function startServer() {
  try {
    // Initialize services first
    await initializeServices();
    
    // Start the HTTP server
    app.listen(PORT, () => {
      console.log(`Chat server running on http://localhost:${PORT}`);
      console.log(`Available endpoints:`);
      console.log(`  POST /chat - Send chat messages`);
      console.log(`  GET /health - Health check`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nReceived SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nReceived SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
