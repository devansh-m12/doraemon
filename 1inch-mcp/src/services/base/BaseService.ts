import axios, { AxiosInstance } from 'axios';
import { config } from '../../config/index';
import { logger } from '../../config/logger';

export interface ServiceConfig {
  baseUrl: string;
  apiKey: string;
  timeout?: number;
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}

export interface ResourceDefinition {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

export interface PromptDefinition {
  name: string;
  description: string;
  arguments: Array<{
    name: string;
    description: string;
    required: boolean;
  }>;
}

export abstract class BaseService {
  protected client: AxiosInstance;
  protected baseUrl: string;
  protected apiKey: string;

  constructor(serviceConfig: ServiceConfig) {
    this.baseUrl = serviceConfig.baseUrl;
    this.apiKey = serviceConfig.apiKey;
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: serviceConfig.timeout || 30000,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.debug(`Making request to: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        logger.debug(`Response received: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        logger.error('Response error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Abstract methods that each service must implement
  abstract getTools(): ToolDefinition[];
  abstract getResources(): ResourceDefinition[];
  abstract getPrompts(): PromptDefinition[];
  abstract handleToolCall(name: string, args: any): Promise<any>;
  abstract handleResourceRead(uri: string): Promise<any>;
  abstract handlePromptRequest(name: string, args: any): Promise<any>;

  // Common utility methods
  public async makeRequest<T>(endpoint: string, params?: any): Promise<T> {
    const response = await this.client.get(endpoint, { params });
    return response.data;
  }

  public async makePostRequest<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.client.post(endpoint, data);
    return response.data;
  }

  protected validateRequiredParams(params: Record<string, any>, required: string[]): void {
    const missing = required.filter(param => !params[param]);
    if (missing.length > 0) {
      throw new Error(`Missing required parameters: ${missing.join(', ')}`);
    }
  }

  protected createErrorResponse(message: string, code?: string): any {
    return {
      success: false,
      error: message,
      code,
      timestamp: new Date().toISOString()
    };
  }

  protected createSuccessResponse(data: any): any {
    return {
      success: true,
      data,
      timestamp: new Date().toISOString()
    };
  }
} 