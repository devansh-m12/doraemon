export interface GetTokensRequest {
    chain: number;
  }
  
  export interface GetTokensResponse {
    tokens: {
      [tokenAddress: string]: {
        symbol: string;
        name: string;
        decimals: number;
        address: string;
        logoURI?: string;
        [key: string]: any; // Open-ended for additional properties
      };
    };
  }
  
  export interface GetLiquiditySourcesRequest {
    chain: number;
  }
  
  export interface GetLiquiditySourcesResponse {
    protocols: Array<{
      id: string;
      title: string;
      img?: string;
      [key: string]: any; // Open-ended for additional properties
    }>;
  }
  
  export interface GetQuoteRequest {
    chain: number;
    fromTokenAddress: string;
    toTokenAddress: string;
    amount: string;
    [key: string]: any; // Open-ended for additional parameters
  }
  
  export interface GetQuoteResponse {
    fromToken: {
      symbol: string;
      name: string;
      address: string;
      decimals: number;
      logoURI?: string;
      [key: string]: any;
    };
    toToken: {
      symbol: string;
      name: string;
      address: string;
      decimals: number;
      logoURI?: string;
      [key: string]: any;
    };
    toTokenAmount: string;
    fromTokenAmount: string;
    protocols: Array<{
      name: string;
      part: number;
      fromTokenAddress: string;
      toTokenAddress: string;
      [key: string]: any;
    }>;
    estimatedGas: number;
    [key: string]: any; // Open-ended for additional response properties
  }
  
  export interface GetSwapRequest {
    chain: number;
    fromTokenAddress: string;
    toTokenAddress: string;
    amount: string;
    fromAddress: string;
    slippage: number;
    [key: string]: any; // Open-ended for additional parameters
  }
  
  export interface GetSwapResponse {
    fromToken: {
      symbol: string;
      name: string;
      address: string;
      decimals: number;
      logoURI?: string;
      [key: string]: any;
    };
    toToken: {
      symbol: string;
      name: string;
      address: string;
      decimals: number;
      logoURI?: string;
      [key: string]: any;
    };
    tx: {
      from: string;
      to: string;
      data: string;
      value: string;
      gas: number;
      gasPrice: string;
      [key: string]: any;
    };
    [key: string]: any; // Open-ended for additional response properties
  }
  
  export interface CreateOrderRequest {
    chain: number;
    fromTokenAddress: string;
    toTokenAddress: string;
    amount: string;
    fromAddress: string;
    [key: string]: any; // Open-ended for additional parameters
  }
  
  export interface CreateOrderResponse {
    orderId: string;
    status: string;
    [key: string]: any; // Open-ended for additional response properties
  }
  
  export interface GetOrderStatusRequest {
    chain: number;
    orderId: string;
  }
  
  export interface GetOrderStatusResponse {
    orderId: string;
    status: string;
    fromToken: {
      symbol: string;
      name: string;
      address: string;
      decimals: number;
      [key: string]: any;
    };
    toToken: {
      symbol: string;
      name: string;
      address: string;
      decimals: number;
      [key: string]: any;
    };
    fromTokenAmount: string;
    toTokenAmount: string;
    [key: string]: any; // Open-ended for additional response properties
  }
  
  export interface CancelOrderRequest {
    chain: number;
    orderId: string;
    fromAddress: string;
    [key: string]: any; // Open-ended for additional parameters
  }
  
  export interface CancelOrderResponse {
    success: boolean;
    [key: string]: any; // Open-ended for additional response properties
  }