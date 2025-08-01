import dotenv from 'dotenv';
import { config as validateConfig } from './validation';

// Load environment variables
dotenv.config();

export const config = {
  // Server configuration
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
  },

  // 1inch API configuration
  oneInch: {
    apiKey: process.env.ONEINCH_API_KEY || '',
    baseUrl: process.env.ONEINCH_BASE_URL || 'https://api.1inch.dev',
    timeout: parseInt(process.env.ONEINCH_TIMEOUT || '30000', 10),
  },

  // Cache configuration
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '300', 10),
    redisUrl: process.env.REDIS_URL,
    enabled: process.env.CACHE_ENABLED !== 'false',
  },

  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // Security
  security: {
    corsOrigin: process.env.CORS_ORIGIN || '*',
    helmetEnabled: process.env.HELMET_ENABLED !== 'false',
  },
};

// Validate configuration
validateConfig(config);

export default config; 