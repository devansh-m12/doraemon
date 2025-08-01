import { TOKEN_ADDRESSES, SUPPORTED_CHAINS, ERROR_MESSAGES } from './constants.js';

/**
 * Validates if a string is a valid Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validates if a chain ID is supported
 */
export function isValidChainId(chainId: number): boolean {
  return Object.values(SUPPORTED_CHAINS).includes(chainId as any);
}

/**
 * Validates if a token address is valid
 */
export function isValidTokenAddress(address: string): boolean {
  return isValidAddress(address) || address === TOKEN_ADDRESSES.ETH;
}

/**
 * Formats a token amount with proper decimals
 */
export function formatTokenAmount(amount: string, decimals: number): string {
  const bigIntAmount = BigInt(amount);
  const divisor = BigInt(10 ** decimals);
  const wholePart = bigIntAmount / divisor;
  const fractionalPart = bigIntAmount % divisor;
  
  if (fractionalPart === BigInt(0)) {
    return wholePart.toString();
  }
  
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  return `${wholePart}.${fractionalStr}`;
}

/**
 * Converts a decimal amount to wei (smallest unit)
 */
export function toWei(amount: string, decimals: number): string {
  const [whole, fractional = ''] = amount.split('.');
  const paddedFractional = fractional.padEnd(decimals, '0').slice(0, decimals);
  return whole + paddedFractional;
}

/**
 * Formats a price with proper currency symbol
 */
export function formatPrice(price: string, currency: string = 'USD'): string {
  const numPrice = parseFloat(price);
  if (isNaN(numPrice)) return '0';
  
  if (numPrice < 0.01) {
    return `$${numPrice.toFixed(6)}`;
  } else if (numPrice < 1) {
    return `$${numPrice.toFixed(4)}`;
  } else {
    return `$${numPrice.toFixed(2)}`;
  }
}

/**
 * Formats a gas price in Gwei
 */
export function formatGasPrice(gasPrice: string): string {
  const gwei = BigInt(gasPrice) / BigInt(10 ** 9);
  return `${gwei} Gwei`;
}

/**
 * Calculates the percentage difference between two values
 */
export function calculatePercentageDifference(value1: string, value2: string): number {
  const num1 = parseFloat(value1);
  const num2 = parseFloat(value2);
  
  if (num1 === 0) return 0;
  return ((num2 - num1) / num1) * 100;
}

/**
 * Validates and sanitizes input parameters
 */
export function validateAndSanitizeParams(params: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Creates a standardized error response
 */
export function createErrorResponse(message: string, code?: string): any {
  return {
    success: false,
    error: message,
    code,
    timestamp: new Date().toISOString()
  };
}

/**
 * Creates a standardized success response
 */
export function createSuccessResponse(data: any): any {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString()
  };
}

/**
 * Retries a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * Debounces a function call
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttles a function call
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Generates a unique request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validates required parameters
 */
export function validateRequiredParams(params: Record<string, any>, required: string[]): void {
  const missing = required.filter(param => !params[param]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required parameters: ${missing.join(', ')}`);
  }
} 