import { BaseService, ToolDefinition, ResourceDefinition, PromptDefinition } from '../base/BaseService';
import { 
  OpenRouterConfig, 
  ChatCompletionRequest, 
  ChatCompletionResponse,
  ChatMessage,
  ConversationContext,
  ToolCallRequest,
  ToolCallResult
} from './OpenRouterTypes';
import { config } from '../../config/index';
import { logger } from '../../config/logger';
import { OpenAIClient } from '../../utils/llm/openai-client';

export type OpenRouterKitConfig = {
  openaiModel?: string;
  openaiApiKey?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

export type OpenRouterResponse = {
  content: string;
  functionCalls?: Array<{
    name: string;
    arguments: Record<string, any>;
    description: string;
    result: any;
  }>;
  mermaidCode?: string;
}

export class OpenRouterService extends BaseService {
  private openRouterConfig: OpenRouterConfig;
  private conversations: Map<string, ConversationContext> = new Map();
  private orchestrator?: any;
  private openAIClient: OpenAIClient;
  private config: OpenRouterKitConfig;

  constructor(serviceConfig: any, orchestrator?: any, agentConfig: OpenRouterKitConfig = {}) {
    super(serviceConfig);
    this.orchestrator = orchestrator;
    
    this.config = {
      openaiModel: "gpt-4o-mini",
      temperature: 0.7,
      maxTokens: 4000,
      ...agentConfig,
    };

    this.openRouterConfig = {
      baseUrl: config.openRouter.baseUrl,
      apiKey: config.openRouter.apiKey,
      timeout: config.openRouter.timeout,
      models: config.openRouter.models,
      maxTokens: this.config.maxTokens || config.openRouter.maxTokens,
      temperature: this.config.temperature || config.openRouter.temperature
    };
    
    // Initialize OpenAI client
    this.openAIClient = new OpenAIClient({
      apiKey: this.openRouterConfig.apiKey,
      baseURL: this.openRouterConfig.baseUrl,
      timeout: this.openRouterConfig.timeout,
      model: this.openRouterConfig.models.large,
      temperature: this.openRouterConfig.temperature,
      maxTokens: this.openRouterConfig.maxTokens,
    });
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'intelligent_chat',
        description: 'Intelligent chat with automatic tool calling and context management',
        inputSchema: {
          type: 'object',
          properties: {
            conversationId: {
              type: 'string',
              description: 'Unique conversation ID for context management'
            },
            message: {
              type: 'string',
              description: 'User message to process'
            },
            model: {
              type: 'string',
              description: 'The model to use for completion'
            },
            temperature: {
              type: 'number',
              description: 'Controls randomness (0-2, default: 0.7)'
            }
          },
          required: ['conversationId', 'message']
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
      }
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    try {
      switch (name) {
        case 'intelligent_chat':
          return await this.handleIntelligentChat(args);
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
      const resourceMap: Record<string, any> = {
        'https://openrouter.ai/docs': {
          title: 'OpenRouter Documentation',
          description: 'Official documentation for OpenRouter API',
          url: 'https://openrouter.ai/docs'
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
        default:
          throw new Error(`Unknown prompt: ${name}`);
      }
    } catch (error) {
      logger.error(`Error in OpenRouter prompt request ${name}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResponse(`Failed to handle prompt: ${errorMessage}`);
    }
  }

  /**
   * Send a user prompt → let the model call your functions → return final answer.
   */
  async chat(userPrompt: string, conversationId?: string): Promise<OpenRouterResponse> {
    logger.info("Starting chat with prompt:", userPrompt);
    
    // Get or create conversation context
    const convId = conversationId || `conv_${Date.now()}`;
    let conversation = this.conversations.get(convId);
    if (!conversation) {
      conversation = {
        id: convId,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.conversations.set(convId, conversation);
    }

    // Add user message to conversation
    conversation.messages.push({
      role: 'user',
      content: userPrompt
    });

    // Get available function definitions
    const fnDefs = this.getAvailableFunctionDefinitions();
    logger.info(`Available functions: ${fnDefs.map(f => f.name).join(', ')}`);

    // Step 1: Ask the model with function definitions
    const first = await this.openAIClient.chatCompletion([
      ...conversation.messages
    ], {
      model: this.config.openaiModel!,
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
      tools: fnDefs.map(def => ({
        type: "function" as const,
        function: def
      })),
      tool_choice: "auto",
    });

    if (!first.success) {
      throw new Error(first.error || 'Failed to get chat completion');
    }

    const msg = first.data;
    logger.info("First response received:", msg);
    
    // Step 2: If it didn't call a function, just return the text
    if (!msg.tool_calls || msg.tool_calls.length === 0) {
      logger.info("No function calls made, returning direct response");
      const assistantMessage = msg.completion || msg.content || "I apologize, but I was unable to generate a response.";
      
      // Add assistant response to conversation
      conversation.messages.push({
        role: 'assistant',
        content: assistantMessage
      });
      conversation.updatedAt = new Date();

      // Extract Mermaid code from the direct response
      const mermaidCode = this.extractMermaidCode(assistantMessage);
      if (mermaidCode) {
        logger.info("Mermaid code extracted from direct response");
      }

      return {
        content: assistantMessage,
        mermaidCode,
      };
    }

    // Step 3: Parse arguments & invoke your handler
    const functionCalls: OpenRouterResponse['functionCalls'] = [];
    
    for (const toolCall of msg.tool_calls) {
      const { name, arguments: argStr } = toolCall.function;
      logger.info(`Raw function call - name: ${name}, arguments: ${argStr}`);
      const args = JSON.parse(argStr || "{}");
      
      // Get the tool description from the orchestrator
      const toolInfo = this.orchestrator?.getToolInfo(name);
      const description = toolInfo?.description || '';
      
      logger.info(`Calling function: ${name} with args:`, args);
      
      try {
        const result = await this.executeToolCall(name, args);
        functionCalls.push({
          name,
          arguments: args,
          description,
          result,
        });
        logger.info(`Function ${name} completed successfully`);
      } catch (error) {
        logger.error(`Function ${name} failed:`, error);
        functionCalls.push({
          name,
          arguments: args,
          description,
          result: { error: error instanceof Error ? error.message : String(error) },
        });
      }
    }

    // Step 4: Send the function's results back into the chat for a final response
    const messages: ChatMessage[] = [
      ...conversation.messages
    ];

    // Add function results - match by index to avoid duplicates
    for (let i = 0; i < functionCalls.length; i++) {
      const call = functionCalls[i];
      if (!call) continue; // Skip if call is undefined
      
      const toolCall = msg.tool_calls?.[i]; // Use optional chaining
      if (toolCall && toolCall.function.name === call.name) {
        messages.push({
          role: "assistant",
          content: `Function call: ${call.name}`,
          name: call.name
        });
        messages.push({
          role: "user",
          content: JSON.stringify(call.result),
        });
      }
    }

    const second = await this.openAIClient.chatCompletion([
      {
        role: 'system',
        content: 'Always respond in markdown format (.md) to make rendering easier in frontend applications. Use proper markdown syntax for formatting, lists, code blocks, and other elements.'
      },
      ...messages
    ], {
      model: this.config.openaiModel!,
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
    });

    if (!second.success) {
      throw new Error(second.error || 'Failed to get final chat completion');
    }

    const finalMessage = second.data.completion || second.data.content || "I apologize, but I was unable to generate a response.";
    logger.debug("Final response received:", finalMessage);

    // Add assistant response to conversation
    conversation.messages.push({
      role: 'assistant',
      content: finalMessage
    });
    conversation.updatedAt = new Date();

    // Extract Mermaid code from the final message
    const mermaidCode = this.extractMermaidCode(finalMessage);
    if (mermaidCode) {
      logger.info("Mermaid code extracted from response");
    }

    return {
      content: finalMessage,
      functionCalls,
      mermaidCode,
    };
  }

  /**
   * Get available function definitions
   */
  private getAvailableFunctionDefinitions(): any[] {
    // Get orchestrator reference
    const orchestrator = this.orchestrator;
    
    if (orchestrator) {
      // Get all tools from orchestrator, excluding OpenRouter tools to avoid circular reference
      const allTools = orchestrator.getAllTools();
      return allTools
        .filter((tool: ToolDefinition) => !tool.name.startsWith('intelligent_chat'))
        .map((tool: ToolDefinition) => ({
          name: tool.name,
          description: tool.description,
          parameters: {
            type: tool.inputSchema.type,
            properties: tool.inputSchema.properties,
            required: tool.inputSchema.required
          }
        }));
    }
    
    // Fallback to empty array if orchestrator is not available
    return [];
  }

  /**
   * Extract Mermaid code from text content
   */
  private extractMermaidCode(content: string): string | undefined {
    // Match mermaid code blocks with various formats
    const mermaidPatterns = [
      /```mermaid\s*\n([\s\S]*?)\n```/g,
      /```\s*mermaid\s*\n([\s\S]*?)\n```/g,
      /\bmermaid\s*\n([\s\S]*?)(?=\n\n|\n```|\n$)/g
    ];

    for (const pattern of mermaidPatterns) {
      const matches = Array.from(content.matchAll(pattern));
      if (matches.length > 0 && matches[0] && matches[0][1]) {
        // Return the first mermaid code block found
        return matches[0][1].trim();
      }
    }

    return undefined;
  }

  /**
   * Execute a tool call through the orchestrator
   */
  private async executeToolCall(name: string, args: any): Promise<any> {
    const orchestrator = this.orchestrator;
    
    if (!orchestrator) {
      throw new Error('Orchestrator not available');
    }

    // Validate tool exists
    const toolInfo = orchestrator.getToolInfo(name);
    if (!toolInfo) {
      throw new Error(`Tool '${name}' not found`);
    }

    // Execute tool call
    return await orchestrator.handleToolCall(name, args);
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

  private async handleIntelligentChat(args: any): Promise<any> {
    this.validateRequiredParams(args, ['conversationId', 'message']);
    
    const { conversationId, message, model, temperature } = args;
    
    // Update config if provided
    if (model) this.config.openaiModel = model;
    if (temperature) this.config.temperature = temperature;
    
    const response = await this.chat(message, conversationId);
    
    return this.createSuccessResponse({
      response: response.content,
      conversationId,
      functionCalls: response.functionCalls,
    });
  }

  private async handleChatCompletion(args: any): Promise<any> {
    this.validateRequiredParams(args, ['messages']);
    
    let modelToUse = args.model;
    if (!modelToUse) {
      if (this.openRouterConfig.models.small) {
        modelToUse = this.openRouterConfig.models.small;
      } else if (this.openRouterConfig.models.large) {
        modelToUse = this.openRouterConfig.models.large;
      } else {
        throw new Error('No model configured. Please set OPENROUTER_SMALL_MODEL or OPENROUTER_LARGE_MODEL environment variable.');
      }
    }

    try {
      const result = await this.openAIClient.chatCompletion(args.messages, {
        model: modelToUse,
        temperature: args.temperature || this.openRouterConfig.temperature,
        maxTokens: args.max_tokens || this.openRouterConfig.maxTokens,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to get chat completion');
      }

      return this.createSuccessResponse({
        completion: result.data.completion,
        model: result.data.model,
        usage: result.data.usage,
        finish_reason: result.data.finish_reason
      });
    } catch (error) {
      throw this.handleOpenRouterError(error);
    }
  }

  private handleOpenRouterError(error: any): Error {
    if (error.response?.data?.error) {
      const openRouterError = error.response.data;
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

/**
 * Convenience function for quick usage
 */
export async function createOpenRouterAgent(config?: OpenRouterKitConfig): Promise<OpenRouterService> {
  return new OpenRouterService({}, undefined, config);
}

/**
 * Legacy function for backward compatibility
 */
export async function llmAgent(userPrompt: string, config?: OpenRouterKitConfig): Promise<string> {
  const agent = new OpenRouterService({}, undefined, config);
  const response = await agent.chat(userPrompt);
  return response.content;
} 