import { BaseService, ToolDefinition, ResourceDefinition, PromptDefinition } from '../base/BaseService';
import { 
  OpenRouterConfig, 
  ChatCompletionRequest, 
  ChatCompletionResponse,
  EmbeddingRequest,
  EmbeddingResponse,
  ModelInfo,
  UsageInfo,
  OpenRouterError,
  OpenRouterErrorType,
  OpenRouterModelsResponse,
  OpenRouterUsageResponse,
  ChatMessage
} from './OpenRouterTypes';
import { config } from '../../config/index';
import { logger } from '../../config/logger';

export class OpenRouterService extends BaseService {
  private openRouterConfig: OpenRouterConfig;

  constructor(serviceConfig: any) {
    super(serviceConfig);
    this.openRouterConfig = {
      baseUrl: config.openRouter.baseUrl,
      apiKey: config.openRouter.apiKey,
      timeout: config.openRouter.timeout,
      models: config.openRouter.models,
      maxTokens: config.openRouter.maxTokens,
      temperature: config.openRouter.temperature
    };
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'chat_completion',
        description: 'Generate chat completions using OpenRouter API',
        inputSchema: {
          type: 'object',
          properties: {
            model: {
              type: 'string',
              description: 'The model to use for completion (will use configured small model if not specified)'
            },
            messages: {
              type: 'array',
              description: 'Array of chat messages',
              items: {
                type: 'object',
                properties: {
                  role: {
                    type: 'string',
                    enum: ['system', 'user', 'assistant']
                  },
                  content: {
                    type: 'string'
                  }
                },
                required: ['role', 'content']
              }
            },
            temperature: {
              type: 'number',
              description: 'Controls randomness (0-2, default: 0.7)'
            },
            max_tokens: {
              type: 'number',
              description: 'Maximum tokens to generate (default: 4096)'
            }
          },
          required: ['messages']
        }
      },
      {
        name: 'generate_embeddings',
        description: 'Generate embeddings using OpenRouter API',
        inputSchema: {
          type: 'object',
          properties: {
            model: {
              type: 'string',
              description: 'The embedding model to use (will use configured small model if not specified)'
            },
            input: {
              type: 'string',
              description: 'Text to generate embeddings for'
            }
          },
          required: ['input']
        }
      },
      {
        name: 'list_models',
        description: 'List available models on OpenRouter',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'get_model_info',
        description: 'Get information about a specific model',
        inputSchema: {
          type: 'object',
          properties: {
            model: {
              type: 'string',
              description: 'The model ID to get information about'
            }
          },
          required: ['model']
        }
      },
      {
        name: 'get_usage_info',
        description: 'Get usage information and costs',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      }
    ];
  }

  getResources(): ResourceDefinition[] {
    return [
      {
        uri: 'https://openrouter.ai/docs',
        name: 'OpenRouter Documentation',
        description: 'Official OpenRouter API documentation',
        mimeType: 'text/html'
      },
      {
        uri: 'https://openrouter.ai/models',
        name: 'Available Models',
        description: 'List of available models on OpenRouter',
        mimeType: 'application/json'
      },
      {
        uri: 'https://openrouter.ai/api/v1',
        name: 'OpenRouter API Reference',
        description: 'OpenRouter API reference and endpoints',
        mimeType: 'application/json'
      }
    ];
  }

  getPrompts(): PromptDefinition[] {
    return [
      {
        name: 'ai_assistant',
        description: 'Get AI assistance for various tasks',
        arguments: [
          {
            name: 'task',
            description: 'The task you need help with',
            required: true
          },
          {
            name: 'context',
            description: 'Additional context for the task',
            required: false
          }
        ]
      },
      {
        name: 'model_selection',
        description: 'Get recommendations for model selection',
        arguments: [
          {
            name: 'use_case',
            description: 'Your specific use case',
            required: true
          },
          {
            name: 'budget',
            description: 'Your budget constraints',
            required: false
          }
        ]
      },
      {
        name: 'usage_optimization',
        description: 'Get tips for optimizing API usage and costs',
        arguments: [
          {
            name: 'current_usage',
            description: 'Your current usage patterns',
            required: false
          }
        ]
      }
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    try {
      switch (name) {
        case 'chat_completion':
          return await this.handleChatCompletion(args);
        case 'generate_embeddings':
          return await this.handleEmbeddings(args);
        case 'list_models':
          return await this.handleListModels();
        case 'get_model_info':
          return await this.handleGetModelInfo(args);
        case 'get_usage_info':
          return await this.handleGetUsageInfo();
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      logger.error(`Error in OpenRouter service tool call ${name}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResponse(`Failed to execute ${name}: ${errorMessage}`);
    }
  }

  async handleResourceRead(uri: string): Promise<any> {
    try {
      // For now, return static information about OpenRouter resources
      const resourceMap: Record<string, any> = {
        'https://openrouter.ai/docs': {
          title: 'OpenRouter Documentation',
          description: 'Official documentation for OpenRouter API',
          url: 'https://openrouter.ai/docs'
        },
        'https://openrouter.ai/models': {
          title: 'Available Models',
          description: 'List of all available models on OpenRouter',
          url: 'https://openrouter.ai/models'
        },
        'https://openrouter.ai/api/v1': {
          title: 'API Reference',
          description: 'Complete API reference for OpenRouter',
          url: 'https://openrouter.ai/api/v1'
        }
      };

      return resourceMap[uri] || { error: 'Resource not found' };
    } catch (error) {
      logger.error('Error reading OpenRouter resource:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResponse(`Failed to read resource: ${errorMessage}`);
    }
  }

  async handlePromptRequest(name: string, args: any): Promise<any> {
    try {
      switch (name) {
        case 'ai_assistant':
          return await this.handleAIAssistant(args);
        case 'model_selection':
          return await this.handleModelSelection(args);
        case 'usage_optimization':
          return await this.handleUsageOptimization(args);
        default:
          throw new Error(`Unknown prompt: ${name}`);
      }
    } catch (error) {
      logger.error(`Error in OpenRouter prompt request ${name}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResponse(`Failed to handle prompt: ${errorMessage}`);
    }
  }

  private async handleChatCompletion(args: any): Promise<any> {
    this.validateRequiredParams(args, ['messages']);
    
    // Determine which model to use based on args or default to small model
    let modelToUse = args.model;
    if (!modelToUse) {
      // If no model specified, use small model if available, otherwise throw error
      if (this.openRouterConfig.models.small) {
        modelToUse = this.openRouterConfig.models.small;
      } else if (this.openRouterConfig.models.large) {
        modelToUse = this.openRouterConfig.models.large;
      } else {
        throw new Error('No model configured. Please set OPENROUTER_SMALL_MODEL or OPENROUTER_LARGE_MODEL environment variable.');
      }
    }
    
    const request: ChatCompletionRequest = {
      model: modelToUse,
      messages: args.messages,
      temperature: args.temperature || this.openRouterConfig.temperature,
      max_tokens: args.max_tokens || this.openRouterConfig.maxTokens
    };

    try {
      const response = await this.makePostRequest<ChatCompletionResponse>('/chat/completions', request);
      return this.createSuccessResponse({
        completion: response.choices[0]?.message?.content,
        model: response.model,
        usage: response.usage,
        finish_reason: response.choices[0]?.finish_reason
      });
    } catch (error) {
      throw this.handleOpenRouterError(error);
    }
  }

  private async handleEmbeddings(args: any): Promise<any> {
    this.validateRequiredParams(args, ['input']);
    
    // For embeddings, we'll use the small model if available, otherwise require explicit model
    let modelToUse = args.model;
    if (!modelToUse) {
      if (this.openRouterConfig.models.small) {
        modelToUse = this.openRouterConfig.models.small;
      } else {
        throw new Error('No embedding model configured. Please specify a model or set OPENROUTER_SMALL_MODEL environment variable.');
      }
    }
    
    const request: EmbeddingRequest = {
      model: modelToUse,
      input: args.input
    };

    try {
      const response = await this.makePostRequest<EmbeddingResponse>('/embeddings', request);
      return this.createSuccessResponse({
        embeddings: response.data[0]?.embedding,
        model: response.model,
        usage: response.usage
      });
    } catch (error) {
      throw this.handleOpenRouterError(error);
    }
  }

  private async handleListModels(): Promise<any> {
    try {
      const response = await this.makeRequest<OpenRouterModelsResponse>('/models');
      return this.createSuccessResponse({
        models: response.data.map(model => ({
          id: model.id,
          created: model.created,
          owned_by: model.owned_by,
          context_length: model.context_length,
          pricing: model.pricing
        }))
      });
    } catch (error) {
      throw this.handleOpenRouterError(error);
    }
  }

  private async handleGetModelInfo(args: any): Promise<any> {
    this.validateRequiredParams(args, ['model']);
    
    try {
      const response = await this.makeRequest<ModelInfo>(`/models/${args.model}`);
      return this.createSuccessResponse({
        model: response
      });
    } catch (error) {
      throw this.handleOpenRouterError(error);
    }
  }

  private async handleGetUsageInfo(): Promise<any> {
    try {
      const response = await this.makeRequest<OpenRouterUsageResponse>('/usage');
      return this.createSuccessResponse({
        usage: response.data
      });
    } catch (error) {
      throw this.handleOpenRouterError(error);
    }
  }

  private async handleAIAssistant(args: any): Promise<any> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are a helpful AI assistant. Provide clear, concise, and accurate responses.'
      },
      {
        role: 'user',
        content: `Task: ${args.task}${args.context ? `\nContext: ${args.context}` : ''}`
      }
    ];

    return await this.handleChatCompletion({ messages });
  }

  private async handleModelSelection(args: any): Promise<any> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are an expert in AI model selection. Provide recommendations based on use case and budget constraints.'
      },
      {
        role: 'user',
        content: `Use case: ${args.use_case}${args.budget ? `\nBudget: ${args.budget}` : ''}\n\nRecommend the best models for this use case.`
      }
    ];

    return await this.handleChatCompletion({ messages });
  }

  private async handleUsageOptimization(args: any): Promise<any> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are an expert in API usage optimization. Provide tips for reducing costs and improving efficiency.'
      },
      {
        role: 'user',
        content: `Current usage: ${args.current_usage || 'Not specified'}\n\nProvide optimization tips for OpenRouter API usage.`
      }
    ];

    return await this.handleChatCompletion({ messages });
  }

  private handleOpenRouterError(error: any): Error {
    if (error.response?.data?.error) {
      const openRouterError = error.response.data as OpenRouterError;
      return new Error(`OpenRouter API Error: ${openRouterError.error.message} (${openRouterError.error.type})`);
    }
    
    if (error.code === 'ECONNABORTED') {
      return new Error('Request timeout - please try again');
    }
    
    if (error.code === 'ENOTFOUND') {
      return new Error('Network error - please check your connection');
    }
    
    return new Error(`Unexpected error: ${error.message}`);
  }
} 