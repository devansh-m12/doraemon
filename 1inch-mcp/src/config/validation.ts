import Joi from 'joi';

const configSchema = Joi.object({
  server: Joi.object({
    port: Joi.number().port().default(3000),
    nodeEnv: Joi.string().valid('development', 'production', 'test').default('development'),
    logLevel: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
  }).required(),

  oneInch: Joi.object({
    apiKey: Joi.string().required(),
    baseUrl: Joi.string().uri().default('https://api.1inch.dev'),
    timeout: Joi.number().positive().default(30000),
  }).required(),

  openRouter: Joi.object({
    apiKey: Joi.string().allow('').default(''),
    baseUrl: Joi.string().uri().default('https://openrouter.ai/api/v1'),
    timeout: Joi.number().min(0).default(0), // Allow 0 for no timeout
    models: Joi.object({
      small: Joi.string().allow('').default(''),
      large: Joi.string().allow('').default(''),
    }).required(),
    maxTokens: Joi.number().positive().default(4096),
    temperature: Joi.number().min(0).max(2).default(0.7),
  }).required(),

  cache: Joi.object({
    ttl: Joi.number().positive().default(300),
    redisUrl: Joi.string().uri().optional(),
    enabled: Joi.boolean().default(true),
  }).required(),

  rateLimit: Joi.object({
    windowMs: Joi.number().positive().default(900000),
    maxRequests: Joi.number().positive().default(100),
  }).required(),

  security: Joi.object({
    corsOrigin: Joi.string().default('*'),
    helmetEnabled: Joi.boolean().default(true),
  }).required(),
});

export const config = (config: any) => {
  const { error } = configSchema.validate(config, { abortEarly: false });
  
  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    throw new Error(`Configuration validation failed: ${errorMessage}`);
  }
  
  return config;
}; 