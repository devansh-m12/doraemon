import { OpenRouterService } from '../src/services/openrouter/OpenRouterService';
import { ServiceOrchestrator } from '../src/services/ServiceOrchestrator';
import { config } from '../src/config/index';
import { describe, it, expect, beforeAll } from '@jest/globals';

describe('OpenRouterService - Balance Fetching', () => {
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

  it('should attempt to fetch balance of address using intelligent chat', async () => {
    const args = {
      conversationId: 'balance-test',
      message: `find the token "pepe" on ethereum`,
      model: testModel
    };

    // Test that the service can handle the request with proper authentication
    const result = await openRouterService.handleToolCall('intelligent_chat', args);
    console.log('Success! Balance fetch result:', JSON.stringify(result, null, 2));
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.response).toBeDefined();
    
    // Check if tool calls were actually made
    if (result.data.toolCalls && result.data.toolCalls.length > 0) {
      console.log('Tool calls made:', result.data.toolCalls);
    }
    
    if (result.data.toolResults && result.data.toolResults.length > 0) {
      console.log('Tool results:', result.data.toolResults);
    }
  }, 120000); // 2 minute timeout for API calls
}); 