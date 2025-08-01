import { config } from '../config/index';
import { BaseService, ToolDefinition, ResourceDefinition, PromptDefinition } from './base/BaseService';
import { SwapService } from './swap/SwapService';
import { TokenService } from './token/TokenService';
import { TokenDetailsService } from './token-details/TokenDetailsService';
import { BalanceService } from './balance/BalanceService';
import { GasService } from './gas/GasService';
import { PortfolioService } from './portfolio/PortfolioService';
import { TracesService } from './traces/TracesService';
import { HistoryService } from './history/HistoryService';
import { OrderbookService } from './orderbook/OrderbookService';
import { SpotPriceService } from './spot-price/SpotPriceService';
import { NFTService } from './nft/NFTService';
import { TransactionGatewayService } from './transaction-gateway/TransactionGatewayService';
import { Web3RpcService } from './web3-rpc/Web3RpcService';
import { ChartsService } from './charts/ChartsService';
import { DomainService } from './domain/DomainService';
import { logger } from '../config/logger';
import { IntentSwapService } from './intent-swap/IntentSwapService';
import { FusionPlusSwapService } from './fusion-plus-swap/FusionPlusSwapService';
import { OpenRouterService } from './openrouter/OpenRouterService';

export class ServiceOrchestrator {
  private services: Map<string, BaseService>;

  constructor() {
    this.services = new Map();
    this.initializeServices();
  }

  private initializeServices() {
    const serviceConfig = {
      baseUrl: config.oneInch.baseUrl,
      apiKey: config.oneInch.apiKey,
      timeout: config.oneInch.timeout
    };

    // Initialize services
    this.services.set('swap', new SwapService(serviceConfig));
    this.services.set('token', new TokenService(serviceConfig));
    this.services.set('token-details', new TokenDetailsService(serviceConfig));
    this.services.set('balance', new BalanceService(serviceConfig));
    this.services.set('gas', new GasService(serviceConfig));
    this.services.set('portfolio', new PortfolioService(serviceConfig));
    this.services.set('traces', new TracesService(serviceConfig));
    this.services.set('history', new HistoryService(serviceConfig));
    this.services.set('orderbook', new OrderbookService(serviceConfig));
    this.services.set('spot-price', new SpotPriceService(serviceConfig));
    this.services.set('nft', new NFTService(serviceConfig));
    this.services.set('transaction-gateway', new TransactionGatewayService(serviceConfig));
    this.services.set('web3-rpc', new Web3RpcService(serviceConfig));
    this.services.set('charts', new ChartsService(serviceConfig));
    this.services.set('domain', new DomainService(serviceConfig));
    this.services.set('intent-swap', new IntentSwapService(serviceConfig));
    this.services.set('fusion-plus-swap', new FusionPlusSwapService(serviceConfig));
    
    // Initialize OpenRouter service with orchestrator reference
    const openRouterServiceConfig = {
      baseUrl: config.openRouter.baseUrl,
      apiKey: config.openRouter.apiKey,
      timeout: config.openRouter.timeout
    };
    const openRouterService = new OpenRouterService(openRouterServiceConfig, this);
    this.services.set('openrouter', openRouterService);
    
    logger.info(`Initialized ${this.services.size} services`);
  }

  getAllTools(): ToolDefinition[] {
    const allTools: ToolDefinition[] = [];
    
    for (const service of this.services.values()) {
      allTools.push(...service.getTools());
    }

    return allTools;
  }

  getAllResources(): ResourceDefinition[] {
    const allResources: ResourceDefinition[] = [];
    
    for (const service of this.services.values()) {
      allResources.push(...service.getResources());
    }

    return allResources;
  }

  getAllPrompts(): PromptDefinition[] {
    const allPrompts: PromptDefinition[] = [];
    
    for (const service of this.services.values()) {
      allPrompts.push(...service.getPrompts());
    }

    return allPrompts;
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    // Find which service handles this tool
    for (const [serviceName, service] of this.services.entries()) {
      const tools = service.getTools();
      const toolExists = tools.some(tool => tool.name === name);
      
      if (toolExists) {
        logger.debug(`Routing tool call '${name}' to ${serviceName} service`);
        try {
          return await service.handleToolCall(name, args);
        } catch (error) {
          logger.error(`Error executing tool '${name}' in ${serviceName} service:`, error);
          throw error;
        }
      }
    }

    // If tool not found, provide helpful error message with available tools
    const availableTools = this.getAllTools().map(tool => tool.name);
    throw new Error(`Unknown tool: ${name}. Available tools: ${availableTools.join(', ')}`);
  }

  async handleResourceRead(uri: string): Promise<any> {
    // Find which service handles this resource
    for (const [serviceName, service] of this.services.entries()) {
      const resources = service.getResources();
      const resourceExists = resources.some(resource => resource.uri === uri);
      
      if (resourceExists) {
        logger.debug(`Routing resource read '${uri}' to ${serviceName} service`);
        try {
          return await service.handleResourceRead(uri);
        } catch (error) {
          logger.error(`Error reading resource '${uri}' in ${serviceName} service:`, error);
          throw error;
        }
      }
    }

    // If resource not found, provide helpful error message with available resources
    const availableResources = this.getAllResources().map(resource => resource.uri);
    throw new Error(`Unknown resource: ${uri}. Available resources: ${availableResources.join(', ')}`);
  }

  async handlePromptRequest(name: string, args: any): Promise<any> {
    // Find which service handles this prompt
    for (const [serviceName, service] of this.services.entries()) {
      const prompts = service.getPrompts();
      const promptExists = prompts.some(prompt => prompt.name === name);
      
      if (promptExists) {
        logger.debug(`Routing prompt request '${name}' to ${serviceName} service`);
        try {
          return await service.handlePromptRequest(name, args);
        } catch (error) {
          logger.error(`Error handling prompt '${name}' in ${serviceName} service:`, error);
          throw error;
        }
      }
    }

    // If prompt not found, provide helpful error message with available prompts
    const availablePrompts = this.getAllPrompts().map(prompt => prompt.name);
    throw new Error(`Unknown prompt: ${name}. Available prompts: ${availablePrompts.join(', ')}`);
  }

  getService(name: string): BaseService | undefined {
    return this.services.get(name);
  }

  getServiceNames(): string[] {
    return Array.from(this.services.keys());
  }

  getToolsByService(serviceName: string): ToolDefinition[] {
    const service = this.services.get(serviceName);
    return service ? service.getTools() : [];
  }

  getServiceForTool(toolName: string): string | null {
    for (const [serviceName, service] of this.services.entries()) {
      const tools = service.getTools();
      const toolExists = tools.some(tool => tool.name === toolName);
      if (toolExists) {
        return serviceName;
      }
    }
    return null;
  }

  getToolInfo(toolName: string): ToolDefinition | null {
    for (const service of this.services.values()) {
      const tools = service.getTools();
      const tool = tools.find(tool => tool.name === toolName);
      if (tool) {
        return tool;
      }
    }
    return null;
  }

  async healthCheck(): Promise<any> {
    const healthStatus = {
      status: 'healthy',
      services: {} as Record<string, any>,
      timestamp: new Date().toISOString()
    };

    for (const [serviceName, service] of this.services.entries()) {
      try {
        // Basic health check - try to make a simple request
        await service.makeRequest('/health');
        healthStatus.services[serviceName] = { status: 'healthy' };
      } catch (error) {
        healthStatus.services[serviceName] = { 
          status: 'unhealthy', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
        healthStatus.status = 'degraded';
      }
    }

    return healthStatus;
  }
} 