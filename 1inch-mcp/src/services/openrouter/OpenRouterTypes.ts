export interface OpenRouterConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
  models: {
    small: string;
    large: string;
  };
  maxTokens: number;
  temperature: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name?: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string | string[];
  stream?: boolean;
  n?: number;
  logprobs?: number;
  echo?: boolean;
  logit_bias?: Record<string, number>;
  user?: string;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }>;
  usage: UsageInfo;
}

export interface UsageInfo {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface ConversationContext {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface ToolCallRequest {
  name: string;
  arguments: Record<string, any>;
  description?: string;
  confidence?: number;
}

export interface ToolCallResult {
  success: boolean;
  result?: any;
  error?: string;
  toolName: string;
  executionTime?: number;
} 