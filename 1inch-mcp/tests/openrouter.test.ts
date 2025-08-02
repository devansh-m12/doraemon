import { OpenRouterService } from '../src/services/openrouter/OpenRouterService';
import { config } from '../src/config/index';
import { describe, it, beforeEach, expect, jest, beforeAll } from '@jest/globals';

describe('OpenRouterService', () => {
  let openRouterService: OpenRouterService;
  
  // Test configuration
  const testModel = config.openRouter.models.large;
  const testMessages = [
    {
      role: 'user' as const,
      content: 'Hello, how are you? and tell me random fact'
    }
  ];

  beforeAll(() => {
    const serviceConfig = {
      baseUrl: config.openRouter.baseUrl,
      apiKey: config.openRouter.apiKey,
      timeout: config.openRouter.timeout
    };
    openRouterService = new OpenRouterService(serviceConfig);
  });

  describe('Chat Completion', () => {
    it('should handle chat completion with valid parameters', async () => {
      const args = {
        model: testModel,
        messages: testMessages,
        temperature: 0.7,
        max_tokens: 100
      };

      const result = await openRouterService.handleToolCall('chat_completion', args);
      console.log(result);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.completion).toBeDefined();
      expect(result.data.model).toBe(testModel);
      expect(result.data.usage).toBeDefined();
      expect(result.data.finish_reason).toBeDefined();
    }, 30000); // 30 second timeout for API call
  });
}); 