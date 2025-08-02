import { OpenRouterService } from '../src/services/openrouter/OpenRouterService';
import { config } from '../src/config/index';
import { describe, it, expect, beforeAll } from '@jest/globals';

describe('OpenRouterService - Balance Fetching', () => {
  let openRouterService: OpenRouterService;
  
  // Test configuration
  const testAddress = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045'; // Vitalik's address
  const testModel = config.openRouter.models.large;

  beforeAll(() => {
    const serviceConfig = {
      baseUrl: config.openRouter.baseUrl,
      apiKey: config.openRouter.apiKey,
      timeout: config.openRouter.timeout
    };
    openRouterService = new OpenRouterService(serviceConfig);
  });

  it('should attempt to fetch balance of address using intelligent chat', async () => {
    const args = {
      conversationId: 'balance-test',
      message: `What is the balance of ${testAddress} on Ethereum?`,
      model: testModel
    };

    // Test that the service can handle the request with proper authentication
    const result = await openRouterService.handleToolCall('intelligent_chat', args);
    console.log('Success! Balance fetch result:', JSON.stringify(result, null, 2));
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.response).toBeDefined();
  }, 120000); // 2 minute timeout for API calls
}); 