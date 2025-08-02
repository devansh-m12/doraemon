import OpenAI from 'openai';
import { config } from '../../config/index';
import { logger } from '../../config/logger';

export interface LLMConfig {
  apiKey: string;
  baseURL?: string;
  timeout?: number;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export class OpenAIClient {
  private client: OpenAI;
  private config: LLMConfig;

  constructor(llmConfig?: Partial<LLMConfig>) {
    this.config = {
      apiKey: llmConfig?.apiKey || config.openRouter.apiKey,
      baseURL: llmConfig?.baseURL || config.openRouter.baseUrl,
      timeout: llmConfig?.timeout || config.openRouter.timeout,
      model: llmConfig?.model || config.openRouter.models.large,
      temperature: llmConfig?.temperature || config.openRouter.temperature,
      maxTokens: llmConfig?.maxTokens || config.openRouter.maxTokens,
    };



    if (!this.config.apiKey) {
      throw new Error('OpenAI API key is required. Please set OPENROUTER_API_KEY in your .env file.');
    }

    this.client = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseURL,
      defaultHeaders: {
        'HTTP-Referer': 'https://1inch-mcp-server.com',
        'X-Title': '1inch MCP Server',
      },
      // Don't set timeout if it's 0 (no timeout)
      ...(this.config.timeout && this.config.timeout > 0 ? { timeout: this.config.timeout } : {}),
    });
  }

  async chatCompletion(messages: any[], options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<any> {
    try {
      const modelToUse = options?.model || this.config.model;
      if (!modelToUse) {
        throw new Error('No model specified. Please provide a model or configure one in the environment.');
      }
      const response = await this.client.chat.completions.create({
        model: modelToUse,
        messages,
        temperature: options?.temperature || this.config.temperature,
        max_tokens: options?.maxTokens || this.config.maxTokens,
      });

      return {
        success: true,
        data: {
          completion: response.choices[0]?.message?.content,
          model: response.model,
          usage: response.usage,
          finish_reason: response.choices[0]?.finish_reason,
        },
      };
    } catch (error: any) {
      logger.error('OpenAI API Error:', error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred',
        details: error.response?.data || error,
      };
    }
  }

  async simpleChat(message: string, options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<any> {
    const messages = [
      {
        role: 'user' as const,
        content: message,
      },
    ];

    return this.chatCompletion(messages, options);
  }

  async systemChat(systemPrompt: string, userMessage: string, options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<any> {
    const messages = [
      {
        role: 'system' as const,
        content: systemPrompt,
      },
      {
        role: 'user' as const,
        content: userMessage,
      },
    ];

    return this.chatCompletion(messages, options);
  }

  async multiTurnChat(conversation: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>, options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<any> {
    return this.chatCompletion(conversation, options);
  }

  // Utility method to check if API key is valid
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.simpleChat('Hello');
      return result.success;
    } catch (error) {
      logger.error('OpenAI connection test failed:', error);
      return false;
    }
  }
}

// Export a default instance
export const openAIClient = new OpenAIClient(); 