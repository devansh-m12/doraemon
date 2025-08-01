import { TokenDetailsService } from '../src/services/token-details/TokenDetailsService';
import { ServiceOrchestrator } from '../src/services/ServiceOrchestrator';

describe('TokenDetailsService', () => {
  let serviceOrchestrator: ServiceOrchestrator;

  beforeEach(() => {
    serviceOrchestrator = new ServiceOrchestrator();
  });

  test('should be registered in ServiceOrchestrator', () => {
    const serviceNames = serviceOrchestrator.getServiceNames();
    expect(serviceNames).toContain('token-details');
  });

  test('should have token details tools available', () => {
    const allTools = serviceOrchestrator.getAllTools();
    const tokenDetailsTools = allTools.filter(tool => 
      tool.name.startsWith('get_native_token_details') ||
      tool.name.startsWith('get_token_details') ||
      tool.name.startsWith('get_native_historical_prices') ||
      tool.name.startsWith('get_token_historical_prices') ||
      tool.name.startsWith('get_native_price_change') ||
      tool.name.startsWith('get_token_price_change') ||
      tool.name.startsWith('get_multiple_tokens_price_change')
    );
    
    expect(tokenDetailsTools.length).toBeGreaterThan(0);
    expect(tokenDetailsTools.length).toBe(9); // All 9 token details tools
  });

  test('should have token details resources available', () => {
    const allResources = serviceOrchestrator.getAllResources();
    const tokenDetailsResources = allResources.filter(resource => 
      resource.uri.startsWith('1inch://token-details/')
    );
    
    expect(tokenDetailsResources.length).toBeGreaterThan(0);
    expect(tokenDetailsResources.length).toBe(2); // Documentation and supported intervals
  });

  test('should have token details prompts available', () => {
    const allPrompts = serviceOrchestrator.getAllPrompts();
    const tokenDetailsPrompts = allPrompts.filter(prompt => 
      prompt.name === 'analyze_token_performance'
    );
    
    expect(tokenDetailsPrompts.length).toBe(1);
  });
}); 