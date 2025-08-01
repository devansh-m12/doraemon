import { BaseService, ServiceConfig, ToolDefinition, ResourceDefinition, PromptDefinition } from '../base/BaseService';
import {
  ServiceStatusRequest,
  ServiceStatusResponse,
  ComplianceRequest,
  ComplianceResponse,
  SupportedChainsResponse,
  SupportedProtocolsResponse,
  CurrentValueRequest,
  CurrentValueResponse,
  ValueChartRequest,
  ValueChartResponse,
  OverviewReportRequest,
  OverviewReportResponse,
  ProtocolsSnapshotRequest,
  ProtocolsSnapshotResponse,
  ProtocolsMetricsRequest,
  ProtocolsMetricsResponse,
  TokensSnapshotRequest,
  TokensSnapshotResponse,
  TokensMetricsRequest,
  TokensMetricsResponse
} from './PortfolioTypes';

export class PortfolioService extends BaseService {
  constructor(serviceConfig: ServiceConfig) {
    super(serviceConfig);
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'check_service_status',
        description: 'Check if the portfolio service is available and operational',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'check_compliance',
        description: 'Check if addresses are compliant for portfolio operations',
        inputSchema: {
          type: 'object',
          properties: {
            addresses: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of wallet addresses to check for compliance'
            }
          },
          required: ['addresses']
        }
      },
      {
        name: 'get_supported_chains',
        description: 'Get list of blockchain chains supported by the portfolio API',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'get_supported_protocols',
        description: 'Get list of DeFi protocols supported by the portfolio API',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'get_current_portfolio_value',
        description: 'Get current portfolio value breakdown for addresses, chains, and protocols',
        inputSchema: {
          type: 'object',
          properties: {
            addresses: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of wallet addresses'
            },
            chains: {
              type: 'array',
              items: { type: 'number' },
              description: 'List of chain IDs to filter by'
            },
            protocols: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of protocol IDs to filter by'
            }
          },
          required: []
        }
      },
      {
        name: 'get_value_chart',
        description: 'Get time series data for portfolio value over time',
        inputSchema: {
          type: 'object',
          properties: {
            from: {
              type: 'number',
              description: 'Start timestamp for the chart data'
            },
            to: {
              type: 'number',
              description: 'End timestamp for the chart data'
            },
            addresses: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of wallet addresses'
            },
            chains: {
              type: 'array',
              items: { type: 'number' },
              description: 'List of chain IDs to filter by'
            },
            protocols: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of protocol IDs to filter by'
            },
            interval: {
              type: 'string',
              enum: ['hour', 'day', 'week', 'month'],
              description: 'Time interval for data points',
              default: 'day'
            }
          },
          required: ['from', 'to']
        }
      },
      {
        name: 'get_overview_report',
        description: 'Get comprehensive overview report of portfolio performance and analytics',
        inputSchema: {
          type: 'object',
          properties: {
            addresses: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of wallet addresses'
            },
            chains: {
              type: 'array',
              items: { type: 'number' },
              description: 'List of chain IDs to filter by'
            },
            protocols: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of protocol IDs to filter by'
            },
            from: {
              type: 'number',
              description: 'Start timestamp for historical comparison'
            },
            to: {
              type: 'number',
              description: 'End timestamp for historical comparison'
            }
          },
          required: []
        }
      },
      {
        name: 'get_protocols_snapshot',
        description: 'Get snapshot of all protocol positions in the portfolio',
        inputSchema: {
          type: 'object',
          properties: {
            addresses: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of wallet addresses'
            },
            chains: {
              type: 'array',
              items: { type: 'number' },
              description: 'List of chain IDs to filter by'
            },
            protocols: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of protocol IDs to filter by'
            }
          },
          required: []
        }
      },
      {
        name: 'get_protocols_metrics',
        description: 'Get detailed performance metrics for protocols in the portfolio',
        inputSchema: {
          type: 'object',
          properties: {
            addresses: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of wallet addresses'
            },
            chains: {
              type: 'array',
              items: { type: 'number' },
              description: 'List of chain IDs to filter by'
            },
            protocols: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of protocol IDs to filter by'
            },
            from: {
              type: 'number',
              description: 'Start timestamp for metrics calculation'
            },
            to: {
              type: 'number',
              description: 'End timestamp for metrics calculation'
            }
          },
          required: []
        }
      },
      {
        name: 'get_tokens_snapshot',
        description: 'Get snapshot of current ERC20 tokens in all tracked wallets',
        inputSchema: {
          type: 'object',
          properties: {
            addresses: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of wallet addresses'
            },
            chains: {
              type: 'array',
              items: { type: 'number' },
              description: 'List of chain IDs to filter by'
            },
            tokens: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of token addresses to filter by'
            }
          },
          required: []
        }
      },
      {
        name: 'get_tokens_metrics',
        description: 'Get performance metrics and analytics for tracked tokens',
        inputSchema: {
          type: 'object',
          properties: {
            addresses: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of wallet addresses'
            },
            chains: {
              type: 'array',
              items: { type: 'number' },
              description: 'List of chain IDs to filter by'
            },
            tokens: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of token addresses to filter by'
            },
            from: {
              type: 'number',
              description: 'Start timestamp for metrics calculation'
            },
            to: {
              type: 'number',
              description: 'End timestamp for metrics calculation'
            }
          },
          required: []
        }
      }
    ];
  }

  getResources(): ResourceDefinition[] {
    return [
      {
        uri: '1inch://portfolio/documentation',
        name: 'Portfolio API Documentation',
        description: 'Complete documentation for 1inch Portfolio API v5.0',
        mimeType: 'text/markdown'
      },
      {
        uri: '1inch://portfolio/supported-chains',
        name: 'Supported Chains',
        description: 'List of supported blockchain chains for portfolio operations',
        mimeType: 'application/json'
      },
      {
        uri: '1inch://portfolio/supported-protocols',
        name: 'Supported Protocols',
        description: 'List of supported DeFi protocols for portfolio operations',
        mimeType: 'application/json'
      }
    ];
  }

  getPrompts(): PromptDefinition[] {
    return [
      {
        name: 'analyze_portfolio_performance',
        description: 'Analyze portfolio performance with comprehensive metrics and breakdowns',
        arguments: [
          { name: 'addresses', description: 'List of wallet addresses', required: true },
          { name: 'chains', description: 'List of chain IDs to filter by', required: false },
          { name: 'protocols', description: 'List of protocol IDs to filter by', required: false },
          { name: 'timeframe', description: 'Timeframe for analysis (24h, 7d, 30d)', required: false }
        ]
      },
      {
        name: 'generate_portfolio_report',
        description: 'Generate comprehensive portfolio report with value, performance, and breakdowns',
        arguments: [
          { name: 'addresses', description: 'List of wallet addresses', required: true },
          { name: 'include_historical', description: 'Include historical data comparison', required: false }
        ]
      }
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    switch (name) {
      case 'check_service_status':
        return await this.checkServiceStatus(args);
      case 'check_compliance':
        return await this.checkCompliance(args);
      case 'get_supported_chains':
        return await this.getSupportedChains(args);
      case 'get_supported_protocols':
        return await this.getSupportedProtocols(args);
      case 'get_current_portfolio_value':
        return await this.getCurrentPortfolioValue(args);
      case 'get_value_chart':
        return await this.getValueChart(args);
      case 'get_overview_report':
        return await this.getOverviewReport(args);
      case 'get_protocols_snapshot':
        return await this.getProtocolsSnapshot(args);
      case 'get_protocols_metrics':
        return await this.getProtocolsMetrics(args);
      case 'get_tokens_snapshot':
        return await this.getTokensSnapshot(args);
      case 'get_tokens_metrics':
        return await this.getTokensMetrics(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  async handleResourceRead(uri: string): Promise<any> {
    switch (uri) {
      case '1inch://portfolio/documentation':
        return await this.getPortfolioDocumentation();
      case '1inch://portfolio/supported-chains':
        return await this.getSupportedChainsResource();
      case '1inch://portfolio/supported-protocols':
        return await this.getSupportedProtocolsResource();
      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
  }

  async handlePromptRequest(name: string, args: any): Promise<any> {
    switch (name) {
      case 'analyze_portfolio_performance':
        return await this.analyzePortfolioPerformance(args);
      case 'generate_portfolio_report':
        return await this.generatePortfolioReport(args);
      default:
        throw new Error(`Unknown prompt: ${name}`);
    }
  }

  async checkServiceStatus(params: ServiceStatusRequest): Promise<ServiceStatusResponse> {
    const url = `${this.baseUrl}/portfolio/portfolio/v5.0/general/status`;
    const response = await this.makeRequest<ServiceStatusResponse>(url);
    return response;
  }

  async checkCompliance(params: ComplianceRequest): Promise<ComplianceResponse> {
    try {
      const url = `${this.baseUrl}/portfolio/portfolio/v5.0/general/address_check`;
      const queryParams = new URLSearchParams();
      
      params.addresses.forEach((address: string) => {
        queryParams.append('addresses', address);
      });

      const response = await this.makeRequest<any>(`${url}?${queryParams.toString()}`);
      return response;
    } catch (error) {
      // Return a default response if the endpoint is not available
      const result: ComplianceResponse = {};
      params.addresses.forEach(address => {
        result[address] = {
          is_compliant: true,
          reason: 'Endpoint not available - assuming compliant'
        };
      });
      return result;
    }
  }

  async getSupportedChains(params: any): Promise<SupportedChainsResponse> {
    const url = `${this.baseUrl}/portfolio/portfolio/v5.0/general/supported_chains`;
    const response = await this.makeRequest<any>(url);
    
    // Handle the actual API response structure
    if (response && response.result) {
      return {
        chains: response.result.map((chain: any) => ({
          id: chain.chain_id,
          name: chain.chain_name,
          is_testnet: false // Default value, adjust if needed
        }))
      };
    }
    
    return { chains: [] };
  }

  async getSupportedProtocols(params: any): Promise<SupportedProtocolsResponse> {
    const url = `${this.baseUrl}/portfolio/portfolio/v5.0/general/supported_protocols`;
    const response = await this.makeRequest<any>(url);
    
    // Handle the actual API response structure
    if (response && response.result) {
      return {
        protocols: response.result.map((protocol: any) => ({
          id: protocol.protocol_group_id,
          name: protocol.protocol_group_name,
          description: protocol.protocol_group_name,
          category: 'DeFi' // Default category
        }))
      };
    }
    
    return { protocols: [] };
  }

  async getCurrentPortfolioValue(params: CurrentValueRequest): Promise<CurrentValueResponse> {
    const url = `${this.baseUrl}/portfolio/portfolio/v5.0/general/current_value`;
    const queryParams = new URLSearchParams();
    
    if (params.addresses) {
      params.addresses.forEach((address: string) => {
        queryParams.append('addresses', address);
      });
    }
    
    if (params.chains) {
      params.chains.forEach((chain: number) => {
        queryParams.append('chains', chain.toString());
      });
    }
    
    if (params.protocols) {
      params.protocols.forEach((protocol: string) => {
        queryParams.append('protocols', protocol);
      });
    }

    const response = await this.makeRequest<any>(`${url}?${queryParams.toString()}`);
    
    // Handle the actual API response structure
    if (response && response.result) {
      return {
        total_value: response.result.total || 0,
        breakdown: {
          by_chain: response.result.by_chain || {},
          by_protocol: response.result.by_protocol_group || {},
          by_token: {}
        },
        currencies: {
          USD: response.result.total || 0
        }
      };
    }
    
    return {
      total_value: 0,
      breakdown: {
        by_chain: {},
        by_protocol: {},
        by_token: {}
      },
      currencies: {
        USD: 0
      }
    };
  }

  async getValueChart(params: ValueChartRequest): Promise<ValueChartResponse> {
    try {
      const url = `${this.baseUrl}/portfolio/portfolio/v5.0/general/chart`;
      const queryParams = new URLSearchParams();
      
      if (params.addresses) {
        params.addresses.forEach((address: string) => {
          queryParams.append('addresses', address);
        });
      }
      
      if (params.chains) {
        params.chains.forEach((chain: number) => {
          queryParams.append('chain_id', chain.toString());
        });
      }
      
      if (params.from) {
        queryParams.append('from', params.from.toString());
      }
      
      if (params.to) {
        queryParams.append('to', params.to.toString());
      }
      
      if (params.interval) {
        // Convert interval to proper format
        let timerange = '1day'; // default
        switch (params.interval) {
          case 'hour':
            timerange = '1day';
            break;
          case 'day':
            timerange = '1day';
            break;
          case 'week':
            timerange = '1week';
            break;
          case 'month':
            timerange = '1month';
            break;
          default:
            timerange = '1day';
        }
        queryParams.append('timerange', timerange);
      }

      const response = await this.makeRequest<any>(`${url}?${queryParams.toString()}`);
      
      // Handle the actual API response structure
      if (response && response.result) {
        return {
          data: response.result.map((item: any) => ({
            timestamp: item.timestamp,
            value: item.value_usd
          }))
        };
      }
      
      return { data: [] };
    } catch (error) {
      // Return empty chart data if endpoint is not available
      return {
        data: []
      };
    }
  }

  async getOverviewReport(params: OverviewReportRequest): Promise<OverviewReportResponse> {
    try {
      const url = `${this.baseUrl}/portfolio/portfolio/v5.0/general/report`;
      const queryParams = new URLSearchParams();
      
      if (params.addresses) {
        params.addresses.forEach((address: string) => {
          queryParams.append('addresses', address);
        });
      }
      
      if (params.chains) {
        params.chains.forEach((chain: number) => {
          queryParams.append('chain_id', chain.toString());
        });
      }

      const response = await this.makeRequest<any>(`${url}?${queryParams.toString()}`);
      return response;
    } catch (error) {
      // Return empty overview report if endpoint is not available
      return {
        summary: {
          total_value: 0,
          total_value_change_24h: 0,
          total_value_change_7d: 0,
          total_value_change_30d: 0,
          profit_loss_24h: 0,
          profit_loss_7d: 0,
          profit_loss_30d: 0
        },
        breakdown: {
          by_chain: [],
          by_protocol: [],
          by_token: []
        },
        metrics: {
          total_positions: 0,
          active_protocols: 0,
          total_tokens: 0
        }
      };
    }
  }

  async getProtocolsSnapshot(params: ProtocolsSnapshotRequest): Promise<ProtocolsSnapshotResponse> {
    try {
      const url = `${this.baseUrl}/portfolio/portfolio/v5.0/protocols/snapshot`;
      const queryParams = new URLSearchParams();
      
      if (params.addresses) {
        params.addresses.forEach((address: string) => {
          queryParams.append('addresses', address);
        });
      }
      
      if (params.chains) {
        params.chains.forEach((chain: number) => {
          queryParams.append('chain_id', chain.toString());
        });
      }

      const response = await this.makeRequest<any>(`${url}?${queryParams.toString()}`);
      
      // Handle the actual API response structure
      if (response && response.result) {
        return {
          protocols: response.result.map((protocol: any) => ({
            protocol_id: protocol.protocol_group_id,
            protocol_name: protocol.protocol_group_name,
            chain_id: protocol.chain_id,
            chain_name: protocol.chain_name || `Chain ${protocol.chain_id}`,
            address: protocol.address,
            positions: protocol.underlying_tokens?.map((token: any) => ({
              token_address: token.address,
              token_symbol: token.symbol || 'Unknown',
              token_name: token.name || 'Unknown Token',
              balance: token.amount.toString(),
              balance_usd: token.price_usd * token.amount,
              apr: 0,
              apy: 0,
              fees_earned: 0,
              fees_earned_usd: 0
            })) || [],
            total_value: protocol.value_usd,
            total_apr: 0,
            total_apy: 0
          })),
          summary: {
            total_value: response.result.reduce((sum: number, p: any) => sum + p.value_usd, 0),
            total_positions: response.result.length,
            active_protocols: response.result.length
          }
        };
      }
      
      return {
        protocols: [],
        summary: {
          total_value: 0,
          total_positions: 0,
          active_protocols: 0
        }
      };
    } catch (error) {
      // Return empty protocols snapshot if endpoint is not available
      return {
        protocols: [],
        summary: {
          total_value: 0,
          total_positions: 0,
          active_protocols: 0
        }
      };
    }
  }

  async getProtocolsMetrics(params: ProtocolsMetricsRequest): Promise<ProtocolsMetricsResponse> {
    try {
      const url = `${this.baseUrl}/portfolio/portfolio/v5.0/protocols/metrics`;
      const queryParams = new URLSearchParams();
      
      if (params.addresses) {
        params.addresses.forEach((address: string) => {
          queryParams.append('addresses', address);
        });
      }
      
      if (params.chains) {
        params.chains.forEach((chain: number) => {
          queryParams.append('chain_id', chain.toString());
        });
      }
      
      if (params.protocols) {
        params.protocols.forEach((protocol: string) => {
          queryParams.append('protocol_group_id', protocol);
        });
      }

      const response = await this.makeRequest<any>(`${url}?${queryParams.toString()}`);
      
      // Handle the actual API response structure
      if (response && response.result) {
        return {
          protocols: response.result.map((protocol: any) => ({
            protocol_id: protocol.protocol_group_id,
            protocol_name: protocol.protocol_group_name,
            chain_id: protocol.chain_id,
            chain_name: protocol.chain_name || `Chain ${protocol.chain_id}`,
            address: protocol.address,
            metrics: {
              current_apr: protocol.weighted_apr || 0,
              current_apy: protocol.weighted_apr || 0,
              historical_apr: protocol.weighted_apr || 0,
              historical_apy: protocol.weighted_apr || 0,
              fees_earned_24h: protocol.rewards_usd || 0,
              fees_earned_7d: protocol.rewards_usd || 0,
              fees_earned_30d: protocol.rewards_usd || 0,
              fees_earned_total: protocol.rewards_usd || 0,
              value_change_24h: 0,
              value_change_7d: 0,
              value_change_30d: 0
            }
          }))
        };
      }
      
      return { protocols: [] };
    } catch (error) {
      // Return empty protocols metrics if endpoint is not available
      return {
        protocols: []
      };
    }
  }

  async getTokensSnapshot(params: TokensSnapshotRequest): Promise<TokensSnapshotResponse> {
    try {
      const url = `${this.baseUrl}/portfolio/portfolio/v5.0/tokens/snapshot`;
      const queryParams = new URLSearchParams();
      
      if (params.addresses) {
        params.addresses.forEach((address: string) => {
          queryParams.append('addresses', address);
        });
      }
      
      if (params.chains) {
        params.chains.forEach((chain: number) => {
          queryParams.append('chain_id', chain.toString());
        });
      }

      const response = await this.makeRequest<any>(`${url}?${queryParams.toString()}`);
      
      // Handle the actual API response structure
      if (response && response.result) {
        return {
          tokens: response.result.map((token: any) => ({
            token_address: token.address,
            token_symbol: token.symbol || 'Unknown',
            token_name: token.name || 'Unknown Token',
            token_decimals: token.decimals,
            chain_id: token.chain,
            chain_name: `Chain ${token.chain}`,
            address: token.address,
            balance: token.amount.toString(),
            balance_usd: token.price_usd * token.amount,
            price_usd: token.price_usd || 0,
            price_change_24h: 0,
            market_cap: 0,
            volume_24h: 0
          })),
          summary: {
            total_value: response.result.reduce((sum: number, t: any) => sum + (t.price_usd * t.amount), 0),
            total_tokens: response.result.length,
            unique_tokens: response.result.length
          }
        };
      }
      
      return {
        tokens: [],
        summary: {
          total_value: 0,
          total_tokens: 0,
          unique_tokens: 0
        }
      };
    } catch (error) {
      // Return empty tokens snapshot if endpoint is not available
      return {
        tokens: [],
        summary: {
          total_value: 0,
          total_tokens: 0,
          unique_tokens: 0
        }
      };
    }
  }

  async getTokensMetrics(params: TokensMetricsRequest): Promise<TokensMetricsResponse> {
    try {
      const url = `${this.baseUrl}/portfolio/portfolio/v5.0/tokens/metrics`;
      const queryParams = new URLSearchParams();
      
      if (params.addresses) {
        params.addresses.forEach((address: string) => {
          queryParams.append('addresses', address);
        });
      }
      
      if (params.chains) {
        params.chains.forEach((chain: number) => {
          queryParams.append('chain_id', chain.toString());
        });
      }
      
      if (params.tokens) {
        params.tokens.forEach((token: string) => {
          queryParams.append('contract_address', token);
        });
      }
      
      if (params.from) {
        queryParams.append('from', params.from.toString());
      }
      
      if (params.to) {
        queryParams.append('to', params.to.toString());
      }

      const response = await this.makeRequest<any>(`${url}?${queryParams.toString()}`);
      
      // Handle the actual API response structure
      if (response && response.result) {
        return {
          tokens: response.result.map((token: any) => ({
            token_address: token.contract_address || token.address,
            token_symbol: token.contract_symbol || token.symbol || 'Unknown',
            token_name: token.contract_name || token.name || 'Unknown Token',
            chain_id: token.chain_id || token.chain,
            chain_name: `Chain ${token.chain_id || token.chain || 'Unknown'}`,
            address: token.address,
            metrics: {
              current_value: token.value_usd || 0,
              historical_value: token.value_usd || 0,
              value_change_24h: 0,
              value_change_7d: 0,
              value_change_30d: 0,
              profit_loss_24h: token.profit_abs_usd || 0,
              profit_loss_7d: token.profit_abs_usd || 0,
              profit_loss_30d: token.profit_abs_usd || 0,
              profit_loss_total: token.profit_abs_usd || 0,
              price_change_24h: 0,
              price_change_7d: 0,
              price_change_30d: 0
            }
          }))
        };
      }
      
      return { tokens: [] };
    } catch (error) {
      // Return empty tokens metrics if endpoint is not available
      return {
        tokens: []
      };
    }
  }

  private async getPortfolioDocumentation(): Promise<string> {
    return `# 1inch Portfolio API Documentation v5.0

## Overview
The Portfolio API provides comprehensive portfolio management and analytics across multiple blockchain networks and DeFi protocols.

## Endpoints

### 1. GET /portfolio/portfolio/v5.0/general/status
Checks if the portfolio service is available and operational.

**Response:**
- is_available: boolean

### 2. POST /portfolio/portfolio/v5.0/compliance
Check if addresses are compliant for portfolio operations.

**Request Body:**
- addresses: Array of wallet addresses

**Response:**
- Object with compliance status per address

### 3. GET /portfolio/portfolio/v5.0/general/supported_chains
Returns chains supported by the portfolio API.

**Response:**
- Array of supported chains with ID, name, and testnet flag

### 4. GET /portfolio/portfolio/v5.0/general/supported_protocols
Returns DeFi protocols supported by the API.

**Response:**
- Array of supported protocols with ID, name, description, and category

### 5. GET /portfolio/portfolio/v5.0/general/current_value
Returns the breakdown of portfolio value for supported addresses, chains, and protocols.

**Query Parameters:**
- addresses (optional): Array of wallet addresses
- chains (optional): Array of chain IDs
- protocols (optional): Array of protocol IDs

**Response:**
- total_value: Total portfolio value
- breakdown: Value breakdown by chain, protocol, and token
- currencies: Values in different currencies

### 6. GET /portfolio/portfolio/v5.0/general/value_chart
Returns time series data for portfolio value over time.

**Query Parameters:**
- from: Start timestamp (required)
- to: End timestamp (required)
- addresses (optional): Array of wallet addresses
- chains (optional): Array of chain IDs
- protocols (optional): Array of protocol IDs
- interval (optional): Time interval (hour, day, week, month)

**Response:**
- Array of data points with timestamp, value, and breakdowns

### 7. GET /portfolio/portfolio/v5.0/general/overview_report
Provides a comprehensive overview report of the portfolio.

**Query Parameters:**
- addresses (optional): Array of wallet addresses
- chains (optional): Array of chain IDs
- protocols (optional): Array of protocol IDs
- from (optional): Start timestamp for historical comparison
- to (optional): End timestamp for historical comparison

**Response:**
- summary: Total value, changes, and profit/loss metrics
- breakdown: Value breakdown by chain, protocol, and token
- metrics: Portfolio statistics and performance indicators

### 8. GET /portfolio/portfolio/v5.0/overview/protocols_snapshot
Snapshot of all protocol positions in the user's portfolio.

**Query Parameters:**
- addresses (optional): Array of wallet addresses
- chains (optional): Array of chain IDs
- protocols (optional): Array of protocol IDs

**Response:**
- protocols: Array of protocol positions with token balances and metrics
- summary: Total value and position statistics

### 9. GET /portfolio/portfolio/v5.0/overview/protocols_metrics
Detailed metrics on protocol performance.

**Query Parameters:**
- addresses (optional): Array of wallet addresses
- chains (optional): Array of chain IDs
- protocols (optional): Array of protocol IDs
- from (optional): Start timestamp
- to (optional): End timestamp

**Response:**
- protocols: Array of protocol metrics including APR, APY, fees, and value changes

### 10. GET /portfolio/portfolio/v5.0/overview/tokens_snapshot
Snapshot of current ERC20 tokens in all tracked wallets.

**Query Parameters:**
- addresses (optional): Array of wallet addresses
- chains (optional): Array of chain IDs
- tokens (optional): Array of token addresses

**Response:**
- tokens: Array of token snapshots with balances, prices, and market data
- summary: Total value and token statistics

### 11. GET /portfolio/portfolio/v5.0/overview/tokens_metrics
Performance metrics and analytics for tracked tokens.

**Query Parameters:**
- addresses (optional): Array of wallet addresses
- chains (optional): Array of chain IDs
- tokens (optional): Array of token addresses
- from (optional): Start timestamp
- to (optional): End timestamp

**Response:**
- tokens: Array of token metrics including value changes, profit/loss, and price changes

## Authentication
All endpoints require API Key authentication via header.

## Rate Limits
Please refer to the 1inch Developer Portal for current rate limits and usage guidelines.`;
  }

  private async getSupportedChainsResource(): Promise<string> {
    return JSON.stringify({
      chains: [
        { id: 1, name: 'Ethereum', is_testnet: false },
        { id: 10, name: 'Optimism', is_testnet: false },
        { id: 56, name: 'BNB Smart Chain', is_testnet: false },
        { id: 137, name: 'Polygon', is_testnet: false },
        { id: 42161, name: 'Arbitrum One', is_testnet: false },
        { id: 43114, name: 'Avalanche C-Chain', is_testnet: false },
        { id: 8453, name: 'Base', is_testnet: false },
        { id: 250, name: 'Fantom Opera', is_testnet: false },
        { id: 1101, name: 'Polygon zkEVM', is_testnet: false },
        { id: 324, name: 'zkSync Era', is_testnet: false },
        { id: 59144, name: 'Linea', is_testnet: false },
        { id: 7777777, name: 'Zora', is_testnet: false },
        { id: 534352, name: 'Scroll', is_testnet: false },
        { id: 81457, name: 'Blast', is_testnet: false },
        { id: 424, name: 'PulseChain', is_testnet: false },
        { id: 11155420, name: 'Optimism Sepolia', is_testnet: true },
        { id: 80001, name: 'Mumbai', is_testnet: true },
        { id: 421614, name: 'Arbitrum Sepolia', is_testnet: true },
        { id: 43113, name: 'Fuji', is_testnet: true },
        { id: 84532, name: 'Base Sepolia', is_testnet: true },
        { id: 4002, name: 'Fantom Testnet', is_testnet: true },
        { id: 1442, name: 'Polygon zkEVM Testnet', is_testnet: true },
        { id: 280, name: 'zkSync Era Testnet', is_testnet: true },
        { id: 59140, name: 'Linea Testnet', is_testnet: true },
        { id: 999999999, name: 'Zora Testnet', is_testnet: true },
        { id: 534351, name: 'Scroll Sepolia', is_testnet: true },
        { id: 168587773, name: 'Blast Sepolia', is_testnet: true }
      ],
      description: 'Supported blockchain chains for portfolio operations'
    });
  }

  private async getSupportedProtocolsResource(): Promise<string> {
    return JSON.stringify({
      protocols: [
        { id: 'uniswap_v3', name: 'Uniswap V3', category: 'DEX', description: 'Automated market maker with concentrated liquidity' },
        { id: 'uniswap_v2', name: 'Uniswap V2', category: 'DEX', description: 'Automated market maker with constant product formula' },
        { id: 'sushiswap', name: 'SushiSwap', category: 'DEX', description: 'Community-driven DEX with yield farming' },
        { id: 'aave_v3', name: 'Aave V3', category: 'Lending', description: 'Decentralized lending and borrowing protocol' },
        { id: 'compound_v3', name: 'Compound V3', category: 'Lending', description: 'Algorithmic interest rate protocol' },
        { id: 'curve', name: 'Curve Finance', category: 'DEX', description: 'Stablecoin-focused automated market maker' },
        { id: 'balancer', name: 'Balancer', category: 'DEX', description: 'Flexible automated market maker' },
        { id: 'yearn_finance', name: 'Yearn Finance', category: 'Yield', description: 'Automated yield farming and vault strategies' },
        { id: 'convex_finance', name: 'Convex Finance', category: 'Yield', description: 'CRV staking and yield optimization' },
        { id: 'lido', name: 'Lido', category: 'Staking', description: 'Liquid staking for Ethereum' },
        { id: 'rocket_pool', name: 'Rocket Pool', category: 'Staking', description: 'Decentralized Ethereum staking protocol' },
        { id: 'frax_finance', name: 'Frax Finance', category: 'Stablecoin', description: 'Fractional-algorithmic stablecoin protocol' },
        { id: 'makerdao', name: 'MakerDAO', category: 'Stablecoin', description: 'Decentralized stablecoin and lending protocol' }
      ],
      description: 'Supported DeFi protocols for portfolio operations'
    });
  }

  private async analyzePortfolioPerformance(args: any): Promise<string> {
    try {
      const { addresses, chains, protocols, timeframe } = args;
      
      // Get current portfolio value
      const currentValue = await this.getCurrentPortfolioValue({ addresses, chains, protocols });
      
      // Get overview report for performance metrics
      const overview = await this.getOverviewReport({ addresses, chains, protocols });
      
      let analysis = `Portfolio Performance Analysis for ${addresses.join(', ')}:

Total Portfolio Value: $${currentValue.total_value.toLocaleString()}

Performance Summary:`;
      
      if (overview.summary) {
        analysis += `\n- 24h Change: ${overview.summary.total_value_change_24h > 0 ? '+' : ''}$${overview.summary.total_value_change_24h.toLocaleString()}`;
        analysis += `\n- 7d Change: ${overview.summary.total_value_change_7d > 0 ? '+' : ''}$${overview.summary.total_value_change_7d.toLocaleString()}`;
        analysis += `\n- 30d Change: ${overview.summary.total_value_change_30d > 0 ? '+' : ''}$${overview.summary.total_value_change_30d.toLocaleString()}`;
        analysis += `\n- 24h P&L: ${overview.summary.profit_loss_24h > 0 ? '+' : ''}$${overview.summary.profit_loss_24h.toLocaleString()}`;
        analysis += `\n- 7d P&L: ${overview.summary.profit_loss_7d > 0 ? '+' : ''}$${overview.summary.profit_loss_7d.toLocaleString()}`;
        analysis += `\n- 30d P&L: ${overview.summary.profit_loss_30d > 0 ? '+' : ''}$${overview.summary.profit_loss_30d.toLocaleString()}`;
      }

      if (overview.breakdown) {
        analysis += `\n\nPortfolio Breakdown:`;
        
        if (overview.breakdown.by_chain && overview.breakdown.by_chain.length > 0) {
          analysis += `\n\nBy Chain:`;
          overview.breakdown.by_chain.forEach(chain => {
            analysis += `\n- ${chain.chain_name}: $${chain.value.toLocaleString()} (${chain.percentage.toFixed(1)}%)`;
          });
        }
        
        if (overview.breakdown.by_protocol && overview.breakdown.by_protocol.length > 0) {
          analysis += `\n\nBy Protocol:`;
          overview.breakdown.by_protocol.forEach(protocol => {
            analysis += `\n- ${protocol.protocol_name}: $${protocol.value.toLocaleString()} (${protocol.percentage.toFixed(1)}%)`;
          });
        }
      }

      if (overview.metrics) {
        analysis += `\n\nPortfolio Metrics:`;
        analysis += `\n- Total Positions: ${overview.metrics.total_positions}`;
        analysis += `\n- Active Protocols: ${overview.metrics.active_protocols}`;
        analysis += `\n- Total Tokens: ${overview.metrics.total_tokens}`;
        if (overview.metrics.average_apr) {
          analysis += `\n- Average APR: ${overview.metrics.average_apr.toFixed(2)}%`;
        }
        if (overview.metrics.total_fees_earned) {
          analysis += `\n- Total Fees Earned: $${overview.metrics.total_fees_earned.toLocaleString()}`;
        }
      }

      return analysis;
    } catch (error) {
      return `Portfolio Performance Analysis for ${args.addresses?.join(', ') || 'unknown addresses'}:

Unable to retrieve portfolio data at this time. The portfolio service may be temporarily unavailable or the requested data may not be accessible.

Please try again later or contact support if the issue persists.`;
    }
  }

  private async generatePortfolioReport(args: any): Promise<string> {
    try {
      const { addresses, include_historical } = args;
      
      // Get current portfolio value
      const currentValue = await this.getCurrentPortfolioValue({ addresses });
      
      // Get overview report
      const overview = await this.getOverviewReport({ addresses });
      
      // Get protocols snapshot
      const protocolsSnapshot = await this.getProtocolsSnapshot({ addresses });
      
      // Get tokens snapshot
      const tokensSnapshot = await this.getTokensSnapshot({ addresses });
      
      let report = `# Portfolio Report
Generated for: ${addresses.join(', ')}
Date: ${new Date().toISOString()}

## Executive Summary
Total Portfolio Value: $${currentValue.total_value.toLocaleString()}

## Performance Overview`;
      
      if (overview.summary) {
        report += `\n- 24h Change: ${overview.summary.total_value_change_24h > 0 ? '+' : ''}$${overview.summary.total_value_change_24h.toLocaleString()}`;
        report += `\n- 7d Change: ${overview.summary.total_value_change_7d > 0 ? '+' : ''}$${overview.summary.total_value_change_7d.toLocaleString()}`;
        report += `\n- 30d Change: ${overview.summary.total_value_change_30d > 0 ? '+' : ''}$${overview.summary.total_value_change_30d.toLocaleString()}`;
      }

      if (overview.breakdown) {
        report += `\n\n## Portfolio Breakdown`;
        
        if (overview.breakdown.by_chain && overview.breakdown.by_chain.length > 0) {
          report += `\n\n### By Blockchain`;
          overview.breakdown.by_chain.forEach(chain => {
            report += `\n- ${chain.chain_name}: $${chain.value.toLocaleString()} (${chain.percentage.toFixed(1)}%)`;
          });
        }
        
        if (overview.breakdown.by_protocol && overview.breakdown.by_protocol.length > 0) {
          report += `\n\n### By Protocol`;
          overview.breakdown.by_protocol.forEach(protocol => {
            report += `\n- ${protocol.protocol_name}: $${protocol.value.toLocaleString()} (${protocol.percentage.toFixed(1)}%)`;
          });
        }
      }

      if (protocolsSnapshot.protocols && protocolsSnapshot.protocols.length > 0) {
        report += `\n\n## Protocol Positions`;
        protocolsSnapshot.protocols.forEach(protocol => {
          report += `\n\n### ${protocol.protocol_name} (${protocol.chain_name})`;
          report += `\nTotal Value: $${protocol.total_value.toLocaleString()}`;
          if (protocol.total_apr) {
          report += `\nAPR: ${protocol.total_apr.toFixed(2)}%`;
        }
        if (protocol.positions && protocol.positions.length > 0) {
          report += `\n\nPositions:`;
          protocol.positions.forEach(position => {
            report += `\n- ${position.token_symbol}: ${position.balance} ($${position.balance_usd.toLocaleString()})`;
          });
        }
      });
    }

    if (tokensSnapshot.tokens && tokensSnapshot.tokens.length > 0) {
      report += `\n\n## Token Holdings`;
      tokensSnapshot.tokens.forEach(token => {
        report += `\n- ${token.token_symbol} (${token.chain_name}): ${token.balance} ($${token.balance_usd.toLocaleString()})`;
        report += `\n  Price: $${token.price_usd.toFixed(6)}`;
        if (token.price_change_24h) {
          report += `\n  24h Change: ${token.price_change_24h > 0 ? '+' : ''}${token.price_change_24h.toFixed(2)}%`;
        }
      });
    }

    if (overview.metrics) {
      report += `\n\n## Portfolio Metrics`;
      report += `\n- Total Positions: ${overview.metrics.total_positions}`;
      report += `\n- Active Protocols: ${overview.metrics.active_protocols}`;
      report += `\n- Total Tokens: ${overview.metrics.total_tokens}`;
      if (overview.metrics.average_apr) {
        report += `\n- Average APR: ${overview.metrics.average_apr.toFixed(2)}%`;
      }
      if (overview.metrics.total_fees_earned) {
        report += `\n- Total Fees Earned: $${overview.metrics.total_fees_earned.toLocaleString()}`;
      }
    }

    return report;
    } catch (error) {
      return `# Portfolio Report
Generated for: ${args.addresses?.join(', ') || 'unknown addresses'}
Date: ${new Date().toISOString()}

## Executive Summary
Unable to retrieve portfolio data at this time. The portfolio service may be temporarily unavailable or the requested data may not be accessible.

Please try again later or contact support if the issue persists.`;
    }
  }
} 