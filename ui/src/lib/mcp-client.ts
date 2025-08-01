export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  services: Record<string, any>;
  timestamp: string;
}

export interface MCPToolCall {
  name: string;
  arguments: Record<string, any>;
}

export interface MCPResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
}

export class MCPClient {
  private serverUrl: string;
  private isConnected = false;

  constructor(serverUrl: string = 'http://localhost:6969') {
    this.serverUrl = serverUrl;
  }

  async connect() {
    if (this.isConnected) return;

    try {
      // Test connection by calling health endpoint
      const response = await fetch(`${this.serverUrl}/health`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      this.isConnected = true;
      console.log('MCP Client connected successfully to HTTP server');
    } catch (error) {
      console.error('Failed to connect to MCP HTTP server:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async healthCheck(): Promise<HealthCheckResult> {
    try {
      await this.connect();
      
      // Test connectivity with tools endpoint
      try {
        const response = await fetch(`${this.serverUrl}/tools`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return {
          status: 'healthy',
          services: { 'mcp-server': { status: 'healthy' } },
          timestamp: new Date().toISOString()
        };
      } catch (listError) {
        return {
          status: 'unhealthy',
          services: { 'mcp-server': { status: 'unhealthy', error: listError instanceof Error ? listError.message : 'Unknown error' } },
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        services: { 'mcp-server': { status: 'unhealthy', error: error instanceof Error ? error.message : 'Connection failed' } },
        timestamp: new Date().toISOString()
      };
    }
  }

  async callTool(toolCall: MCPToolCall): Promise<MCPResponse> {
    try {
      await this.connect();

      const mcpRequest = {
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: toolCall.name,
          arguments: toolCall.arguments
        }
      };

      const response = await fetch(`${this.serverUrl}/mcp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mcpRequest)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error.message || 'MCP server error');
      }

      return result.result as MCPResponse;
    } catch (error) {
      console.error(`Error calling tool ${toolCall.name}:`, error);
      throw error;
    }
  }

  async listTools(): Promise<any> {
    try {
      await this.connect();

      const response = await fetch(`${this.serverUrl}/tools`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result.result;
    } catch (error) {
      console.error('Error listing tools:', error);
      throw error;
    }
  }

  async listResources(): Promise<any> {
    try {
      await this.connect();

      const response = await fetch(`${this.serverUrl}/resources`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result.result;
    } catch (error) {
      console.error('Error listing resources:', error);
      throw error;
    }
  }

  async readResource(uri: string): Promise<any> {
    try {
      await this.connect();

      const mcpRequest = {
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'resources/read',
        params: { uri }
      };

      const response = await fetch(`${this.serverUrl}/mcp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mcpRequest)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error.message || 'MCP server error');
      }

      return result.result;
    } catch (error) {
      console.error(`Error reading resource ${uri}:`, error);
      throw error;
    }
  }

  async disconnect() {
    this.isConnected = false;
  }
}

// Singleton instance
export const mcpClient = new MCPClient(); 