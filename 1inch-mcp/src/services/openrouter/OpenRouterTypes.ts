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

export interface EmbeddingRequest {
  model: string;
  input: string | string[];
  encoding_format?: string;
  dimensions?: number;
  user?: string;
}

export interface EmbeddingResponse {
  object: string;
  data: Array<{
    object: string;
    embedding: number[];
    index: number;
  }>;
  model: string;
  usage: UsageInfo;
}

export interface ModelInfo {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  permission: Array<{
    id: string;
    object: string;
    created: number;
    allow_create_engine: boolean;
    allow_sampling: boolean;
    allow_logprobs: boolean;
    allow_search_indices: boolean;
    allow_view: boolean;
    allow_fine_tuning: boolean;
    organization: string;
    group: string | null;
    is_blocking: boolean;
  }>;
  root: string | null;
  parent: string | null;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
}

export interface UsageInfo {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface OpenRouterError {
  error: {
    message: string;
    type: string;
    code: string;
    param?: string;
  };
}

export enum OpenRouterErrorType {
  INVALID_API_KEY = 'invalid_api_key',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  INVALID_REQUEST = 'invalid_request',
  MODEL_NOT_FOUND = 'model_not_found',
  QUOTA_EXCEEDED = 'quota_exceeded',
  SERVER_ERROR = 'server_error',
  TIMEOUT = 'timeout',
  NETWORK_ERROR = 'network_error'
}

export interface OpenRouterModelsResponse {
  object: string;
  data: ModelInfo[];
}

export interface OpenRouterUsageResponse {
  object: string;
  data: Array<{
    id: string;
    object: string;
    created: number;
    daily_costs: Array<{
      timestamp: number;
      line_items: Array<{
        name: string;
        cost: number;
      }>;
    }>;
    line_items: Array<{
      name: string;
      cost: number;
    }>;
  }>;
} 