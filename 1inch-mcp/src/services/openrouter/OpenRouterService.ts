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

export class OpenRouterService extends BaseService {
  private openRouterConfig: OpenRouterConfig;
  private conversations: Map<string, ConversationContext> = new Map();
  private orchestrator?: any;
  private openAIClient: OpenAIClient;

  constructor(serviceConfig: any, orchestrator?: any) {
    super(serviceConfig);
    this.orchestrator = orchestrator;
    this.openRouterConfig = {
      baseUrl: config.openRouter.baseUrl,
      apiKey: config.openRouter.apiKey,
      timeout: config.openRouter.timeout,
      models: config.openRouter.models,
      maxTokens: config.openRouter.maxTokens,
      temperature: config.openRouter.temperature
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

  private async handleIntelligentChat(args: any): Promise<any> {
    this.validateRequiredParams(args, ['conversationId', 'message']);
    
    const { conversationId, message, model, temperature } = args;
    
    // Get or create conversation context
    let conversation = this.conversations.get(conversationId);
    if (!conversation) {
      conversation = {
        id: conversationId,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.conversations.set(conversationId, conversation);
    }

    // Add user message to conversation
    conversation.messages.push({
      role: 'user',
      content: message
    });

    // Step 1: Analyze the user message to identify needed tools
    const toolAnalysis = await this.analyzeMessageForTools(message);
    
    // Step 2: Execute tool calls if needed
    let toolResults: ToolCallResult[] = [];
    if (toolAnalysis.tools.length > 0) {
      toolResults = await this.executeToolCalls(toolAnalysis.tools);
    }

    // Step 3: Create context-aware system message
    const systemMessage = this.createSystemMessageWithContext(toolResults);
    
    // Step 4: Prepare messages for OpenRouter with tool results context
    const messages: ChatMessage[] = [
      systemMessage,
      ...conversation.messages
    ];

    // Add tool results context if available
    if (toolResults.length > 0) {
      const toolContextMessage = this.createToolResultsContext(toolResults);
      messages.push(toolContextMessage);
    }

    // Step 5: Call OpenRouter for response
    const modelToUse = model || this.openRouterConfig.models.small || this.openRouterConfig.models.large;

    try {
      const result = await this.openAIClient.chatCompletion(messages, {
        model: modelToUse,
        temperature: temperature || this.openRouterConfig.temperature,
        maxTokens: this.openRouterConfig.maxTokens,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to get chat completion');
      }

      const assistantMessage = result.data.completion || 'I apologize, but I was unable to generate a response.';
      
      // Add assistant response to conversation
      conversation.messages.push({
        role: 'assistant',
        content: assistantMessage
      });
      conversation.updatedAt = new Date();

      return this.createSuccessResponse({
        response: assistantMessage,
        conversationId,
        toolCalls: toolAnalysis.tools.length > 0 ? toolAnalysis.tools : undefined,
        toolResults: toolResults.length > 0 ? toolResults : undefined,
        model: result.data.model,
        usage: result.data.usage
      });
    } catch (error) {
      throw this.handleOpenRouterError(error);
    }
  }

  private async analyzeMessageForTools(message: string): Promise<{tools: ToolCallRequest[], confidence: number}> {
    const tools: ToolCallRequest[] = [];
    let totalConfidence = 0;
    
    // Get available tools from orchestrator
    const availableTools = this.getAvailableTools();
    
    for (const tool of availableTools) {
      const toolCall = this.analyzeToolRelevance(tool, message);
      if (toolCall) {
        tools.push(toolCall);
        totalConfidence += toolCall.confidence || 0;
      }
    }
    
    // Sort by confidence and limit to top 3
    tools.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
    const topTools = tools.slice(0, 3);
    
    return {
      tools: topTools,
      confidence: topTools.length > 0 ? totalConfidence / topTools.length : 0
    };
  }

  private analyzeToolRelevance(tool: ToolDefinition, message: string): ToolCallRequest | null {
    const messageLower = message.toLowerCase();
    const toolName = tool.name.toLowerCase();
    const description = tool.description.toLowerCase();
    
    let confidence = 0;
    const args: Record<string, any> = {};
    
    // Check for exact tool name matches
    if (messageLower.includes(toolName)) {
      confidence += 0.8;
    }
    
    // Check for description keywords
    const keywords = this.extractKeywords(description);
    for (const keyword of keywords) {
      if (messageLower.includes(keyword)) {
        confidence += 0.3;
      }
    }
    
    // Extract specific parameters based on tool type
    this.extractToolParameters(tool, message, args);
    
    // Only return if confidence is high enough
    if (confidence >= 0.3) {
      return {
        name: tool.name,
        arguments: args,
        confidence: Math.min(confidence, 1.0),
        description: `Extracted from: ${message}`
      };
    }
    
    return null;
  }

  private extractKeywords(text: string): string[] {
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'get', 'check', 'find', 'show', 'display', 'list', 'give', 'provide', 'return', 'fetch', 'retrieve']);
    
    return text
      .split(/\s+/)
      .map(word => word.toLowerCase().replace(/[^\w]/g, ''))
      .filter(word => word.length > 2 && !stopWords.has(word));
  }

  private extractToolParameters(tool: ToolDefinition, message: string, args: Record<string, any>): void {
    const messageLower = message.toLowerCase();
    const toolName = tool.name.toLowerCase();
    
    // Extract wallet addresses
    const walletMatch = message.match(/0x[a-fA-F0-9]{40}/);
    if (walletMatch && (toolName.includes('balance') || toolName.includes('wallet') || toolName.includes('portfolio') || toolName.includes('nft'))) {
      // Map to correct parameter names based on tool
      if (toolName === 'get_balance') {
        args.address = walletMatch[0];
        args.chainId = 1; // Default to Ethereum mainnet
      } else {
        args.walletAddress = walletMatch[0];
        args.chain = 1; // Default to Ethereum mainnet
      }
    }
    
    // Extract token addresses
    const tokenMatch = message.match(/0x[a-fA-F0-9]{40}/);
    if (tokenMatch && (toolName.includes('token') || toolName.includes('price') || toolName.includes('swap'))) {
      args.tokenAddress = tokenMatch[0];
      args.chain = 1;
    }
    
    // Extract chain ID
    const chainMatch = message.match(/chain\s*(?:id\s*)?(\d+)/i);
    if (chainMatch && chainMatch[1]) {
      const chainId = parseInt(chainMatch[1]);
      if (toolName === 'get_balance') {
        args.chainId = chainId;
      } else {
        args.chain = chainId;
      }
    }
    
    // Extract amounts
    const amountMatch = message.match(/(\d+(?:\.\d+)?)\s*(?:tokens?|coins?|amount|eth|usd)/i);
    if (amountMatch && amountMatch[1]) {
      args.amount = amountMatch[1];
    }
    
    // Extract limits
    const limitMatch = message.match(/limit\s*(\d+)/i);
    if (limitMatch && limitMatch[1]) {
      args.limit = parseInt(limitMatch[1]);
    }
  }

  private async executeToolCalls(toolCalls: ToolCallRequest[]): Promise<ToolCallResult[]> {
    const results: ToolCallResult[] = [];
    
    for (const toolCall of toolCalls) {
      try {
        const startTime = Date.now();
        
        // Get orchestrator reference
        const orchestrator = this.orchestrator;
        
        if (orchestrator) {
          // Validate tool exists
          const toolInfo = orchestrator.getToolInfo(toolCall.name);
          if (!toolInfo) {
            results.push({
              success: false,
              toolName: toolCall.name,
              error: `Tool '${toolCall.name}' not found`,
              executionTime: 0
            });
            continue;
          }

          // Execute tool call
          const result = await orchestrator.handleToolCall(toolCall.name, toolCall.arguments);
          
          results.push({
            success: true,
            toolName: toolCall.name,
            result: result,
            executionTime: Date.now() - startTime
          });
        } else {
          results.push({
            success: false,
            toolName: toolCall.name,
            error: 'Orchestrator not available',
            executionTime: Date.now() - startTime
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({
          success: false,
          toolName: toolCall.name,
          error: errorMessage,
          executionTime: 0
        });
        
        logger.error(`Error executing tool call '${toolCall.name}':`, error);
      }
    }
    
    return results;
  }

  private createSystemMessageWithContext(toolResults: ToolCallResult[]): ChatMessage {
    const successfulResults = toolResults.filter(r => r.success);
    
    let systemContent = `You are an intelligent AI assistant with access to blockchain and DeFi tools. You can help users with:

1. **Wallet Analysis**: Check balances, allowances, and portfolio overviews
2. **Token Information**: Get token details, prices, and market data
3. **Trading**: Get swap quotes, orderbook data, and trading history
4. **Market Data**: Access price charts, gas prices, and market trends
5. **NFTs**: Check NFT balances and collections
6. **Domain Services**: Resolve domains and get domain information

Always provide helpful, accurate responses with context for the data you retrieve.`;

    if (successfulResults.length > 0) {
      systemContent += `\n\nI have executed some tools to gather data for you. Use this information to provide a comprehensive response.`;
    }

    return {
      role: 'system',
      content: systemContent
    };
  }

  private createToolResultsContext(toolResults: ToolCallResult[]): ChatMessage {
    const successfulResults = toolResults.filter(r => r.success);
    const failedResults = toolResults.filter(r => !r.success);
    
    let contextContent = '**Tool Execution Results:**\n\n';
    
    if (successfulResults.length > 0) {
      contextContent += '✅ **Successful Tool Calls:**\n';
      for (const result of successfulResults) {
        contextContent += `• **${result.toolName}** (${result.executionTime}ms): `;
        
        // Add intelligent summary of the result
        const summary = this.generateResultSummary(result);
        contextContent += summary + '\n';
      }
    }
    
    if (failedResults.length > 0) {
      contextContent += '\n❌ **Failed Tool Calls:**\n';
      for (const result of failedResults) {
        contextContent += `• **${result.toolName}**: ${result.error}\n`;
      }
    }
    
    return {
      role: 'assistant',
      content: contextContent
    };
  }

  private generateResultSummary(result: ToolCallResult): string {
    if (!result.result || typeof result.result !== 'object') {
      return 'Data retrieved';
    }

    const data = result.result.data || result.result;
    const toolName = result.toolName.toLowerCase();
    
    // Balance-related summaries
    if (toolName.includes('balance')) {
      if (Array.isArray(data)) {
        return `Found ${data.length} token balances`;
      } else if (data.balances) {
        const tokenCount = Object.keys(data.balances).length;
        return `Retrieved ${tokenCount} token balances`;
      }
    }
    
    // Price-related summaries
    if (toolName.includes('price') || toolName.includes('spot')) {
      if (data.price) {
        return `Current price: $${data.price}`;
      } else if (data.spotPrice) {
        return `Spot price: $${data.spotPrice}`;
      }
    }
    
    // Swap-related summaries
    if (toolName.includes('swap') || toolName.includes('quote')) {
      if (data.quote) {
        return `Swap quote available`;
      } else if (data.toTokenAmount) {
        return `Estimated output: ${data.toTokenAmount}`;
      }
    }
    
    // Token-related summaries
    if (toolName.includes('token')) {
      if (data.symbol) {
        return `Token: ${data.symbol} (${data.name})`;
      } else if (Array.isArray(data)) {
        return `Found ${data.length} tokens`;
      }
    }
    
    // Portfolio-related summaries
    if (toolName.includes('portfolio')) {
      if (data.totalValue) {
        return `Portfolio value: $${data.totalValue}`;
      } else if (data.holdings) {
        return `Portfolio holdings retrieved`;
      }
    }
    
    // Generic summary
    if (Array.isArray(data)) {
      return `Retrieved ${data.length} items`;
    } else if (typeof data === 'object') {
      const keys = Object.keys(data);
      if (keys.length > 0) {
        return `Data retrieved with fields: ${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''}`;
      }
    }
    
    return 'Data retrieved';
  }

  private getAvailableTools(): ToolDefinition[] {
    // Get orchestrator reference
    const orchestrator = this.orchestrator;
    
    if (orchestrator) {
      // Get all tools from orchestrator, excluding OpenRouter tools to avoid circular reference
      const allTools = orchestrator.getAllTools();
      return allTools.filter((tool: ToolDefinition) => !tool.name.startsWith('intelligent_chat'));
    }
    
    // Fallback to empty array if orchestrator is not available
    return [];
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