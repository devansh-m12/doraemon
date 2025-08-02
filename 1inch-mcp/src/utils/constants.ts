// Common token addresses
export const TOKEN_ADDRESSES = {
  ETH: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  USDC: '0xA0b86a33E6E4B8b5f8c1e9d6b2a8c3e7f9d5c8a7',
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
} as const;

// Supported chain IDs
export const SUPPORTED_CHAINS = {
  ETHEREUM: 1,
  BSC: 56,
  POLYGON: 137,
  ARBITRUM: 42161,
  OPTIMISM: 10,
  AVALANCHE: 43114,
  FANTOM: 250,
  GNOSIS: 100,
} as const;

// API endpoints
export const API_ENDPOINTS = {
  SWAP: '/swap/v6.0',
  FUSION: '/fusion/v1.0',
  PORTFOLIO: '/portfolio/v1',
  BALANCE: '/balance/v1.0',
  PRICE: '/price/v1.0',
  TOKEN: '/token/v1.0',
  GAS: '/gas/v1.0',
  HISTORY: '/history/v1.0',
  TRANSACTION: '/transaction/v1.0',
  ORDERBOOK: '/orderbook/v1.0',
} as const;

// Default values
export const DEFAULTS = {
  SLIPPAGE: 1,
  GAS_LIMIT: 300000,
  TIMEOUT: 300000,
  CACHE_TTL: 300,
  RATE_LIMIT_WINDOW: 900000,
  RATE_LIMIT_MAX_REQUESTS: 100,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  INVALID_CHAIN_ID: 'Invalid chain ID provided',
  INVALID_TOKEN_ADDRESS: 'Invalid token address provided',
  INVALID_WALLET_ADDRESS: 'Invalid wallet address provided',
  API_KEY_REQUIRED: '1inch API key is required',
  NETWORK_ERROR: 'Network error occurred',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
  INVALID_RESPONSE: 'Invalid response from 1inch API',
} as const;

// MCP tool names
export const TOOL_NAMES = {
  GET_SWAP_QUOTE: 'get_swap_quote',
  GET_SWAP_TRANSACTION: 'get_swap_transaction',
  GET_TOKEN_ALLOWANCE: 'get_token_allowance',
  GET_APPROVE_TRANSACTION: 'get_approve_transaction',
  CREATE_FUSION_ORDER: 'create_fusion_order',
  GET_FUSION_ORDER_STATUS: 'get_fusion_order_status',
  GET_PORTFOLIO_OVERVIEW: 'get_portfolio_overview',
  GET_PORTFOLIO_TOKENS: 'get_portfolio_tokens',
  GET_TOKEN_BALANCES: 'get_token_balances',
  GET_TOKEN_PRICE: 'get_token_price',
  GET_PRICE_HISTORY: 'get_price_history',
  SEARCH_TOKENS: 'search_tokens',
  GET_TOKEN_INFO: 'get_token_info',
  GET_GAS_PRICES: 'get_gas_prices',
  GET_SWAP_HISTORY: 'get_swap_history',
  BROADCAST_TRANSACTION: 'broadcast_transaction',
  GET_TRANSACTION_STATUS: 'get_transaction_status',
  CREATE_LIMIT_ORDER: 'create_limit_order',
  GET_SUPPORTED_CHAINS: 'get_supported_chains',
  HEALTH_CHECK: 'health_check',
} as const;

// Resource URIs
export const RESOURCE_URIS = {
  API_DOCUMENTATION: '1inch://api/documentation',
  SUPPORTED_CHAINS: '1inch://chains/supported',
  POPULAR_TOKENS: '1inch://tokens/popular',
} as const;

// Prompt names
export const PROMPT_NAMES = {
  SWAP_TOKENS: 'swap_tokens',
  PORTFOLIO_ANALYSIS: 'portfolio_analysis',
} as const; 