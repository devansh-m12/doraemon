import { OpenRouterService } from '../src/services/openrouter/OpenRouterService';
import { ServiceOrchestrator } from '../src/services/ServiceOrchestrator';
import { config } from '../src/config/index';
import { describe, it, expect, beforeAll } from '@jest/globals';

describe('OpenRouterService - Chat Interface', () => {
  let openRouterService: OpenRouterService;
  let orchestrator: ServiceOrchestrator;
  
  // Test configuration
  const testAddress = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045'; // Vitalik's address
  const testModel = config.openRouter.models.large;

  beforeAll(() => {
    // Create orchestrator first
    orchestrator = new ServiceOrchestrator();
    
    // Get the OpenRouter service from orchestrator (it's already properly initialized)
    const openRouterServiceFromOrchestrator = orchestrator.getService('openrouter') as OpenRouterService;
    
    if (!openRouterServiceFromOrchestrator) {
      throw new Error('OpenRouter service not found in orchestrator');
    }
    
    openRouterService = openRouterServiceFromOrchestrator;
  });

  it('should handle chat with token search using new chat interface', async () => {
    const userPrompt = `find the token "pepe" on binance`;
    const conversationId = 'test-conversation-1';

    // Test the new chat interface
    const result = await openRouterService.chat(userPrompt, conversationId);
    
    console.log('Chat result:', JSON.stringify(result, null, 2));
    
    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
    expect(typeof result.content).toBe('string');
    
    // Check if function calls were made
    if (result.functionCalls && result.functionCalls.length > 0) {
      console.log('Function calls made:', result.functionCalls.map(fc => ({
        name: fc.name,
        arguments: fc.arguments,
        result: fc.result
      })));
      
      expect(Array.isArray(result.functionCalls)).toBe(true);
      expect(result.functionCalls.length).toBeGreaterThan(0);
    }
  }, 120000); // 2 minute timeout for API calls

  it('should handle simple chat without function calls', async () => {
    const userPrompt = `Hello, how are you?`;
    const conversationId = 'test-conversation-2';

    // Test simple chat without function calls
    const result = await openRouterService.chat(userPrompt, conversationId);
    
    console.log('Simple chat result:', JSON.stringify(result, null, 2));
    
    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
    expect(typeof result.content).toBe('string');
    expect(result.content.length).toBeGreaterThan(0);
    
    // Should not have function calls for a simple greeting
    expect(result.functionCalls).toBeUndefined();
  }, 60000); // 1 minute timeout

  it('should handle balance query with wallet address', async () => {
    const userPrompt = `What's the balance of ${testAddress} on Ethereum?`;
    const conversationId = 'test-conversation-3';

    // Test balance query
    const result = await openRouterService.chat(userPrompt, conversationId);
    
    console.log('Balance query result:', JSON.stringify(result, null, 2));
    
    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
    expect(typeof result.content).toBe('string');
    
    // Should have function calls for balance query
    if (result.functionCalls && result.functionCalls.length > 0) {
      console.log('Balance function calls:', result.functionCalls.map(fc => ({
        name: fc.name,
        arguments: fc.arguments
      })));
      
      expect(Array.isArray(result.functionCalls)).toBe(true);
      expect(result.functionCalls.length).toBeGreaterThan(0);
    }
  }, 120000); // 2 minute timeout for API calls

  it('should maintain conversation context', async () => {
    const conversationId = 'test-conversation-4';
    
    // First message
    const result1 = await openRouterService.chat('Hello, my name is Alice', conversationId);
    expect(result1).toBeDefined();
    expect(result1.content).toBeDefined();
    
    // Second message - should remember the context
    const result2 = await openRouterService.chat('What is my name?', conversationId);
    expect(result2).toBeDefined();
    expect(result2.content).toBeDefined();
    
    console.log('Conversation test - First response:', result1.content);
    console.log('Conversation test - Second response:', result2.content);
    
    // The second response should reference the name from the first message
    expect(result2.content.toLowerCase()).toContain('alice');
  }, 120000); // 2 minute timeout
}); 