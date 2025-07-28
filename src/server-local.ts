import express from 'express';
import cors from 'cors';
import { LocalDoraemonBridge, BridgeConfig } from './fusion-integration-local';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env['API_PORT'] || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize local bridge
const bridgeConfig: BridgeConfig = {
  ethereumRpcUrl: process.env['ETHEREUM_RPC_URL'] || 'http://localhost:8545',
  icpNetwork: (process.env['ICP_NETWORK'] as 'local' | 'ic') || 'local',
  oneInchApiKey: process.env['ONEINCH_API_KEY'] || '',
  privateKey: process.env['ETHEREUM_PRIVATE_KEY'] || '0x0000000000000000000000000000000000000000000000000000000000000001',
  bridgeFeePercentage: parseInt(process.env['BRIDGE_FEE_PERCENTAGE'] || '10'),
  minSwapAmount: process.env['MIN_SWAP_AMOUNT'] || '1000000000000000',
  maxSwapAmount: process.env['MAX_SWAP_AMOUNT'] || '100000000000000000000'
};

const bridge = new LocalDoraemonBridge(bridgeConfig);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const config = bridge.getConfig();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    bridge: {
      ethereumNetwork: 'localhost',
      icpNetwork: process.env['ICP_NETWORK'] || 'local',
      fusionEnabled: config.oneInchApiKey ? true : false,
      localMode: !config.oneInchApiKey,
      oneInchConnected: !!config.oneInchApiKey
    }
  });
});

// Get bridge configuration
app.get('/api/config', (req, res) => {
  const config = bridge.getConfig();
  res.json({
    ...config,
    privateKey: '***HIDDEN***',
    localMode: true
  });
});

// Create Ethereum to ICP swap
app.post('/api/swap/ethereum-to-icp', async (req, res): Promise<void> => {
  try {
    const { amount, icpRecipient, fromToken, toToken } = req.body;

    if (!amount || !icpRecipient) {
      res.status(400).json({
        error: 'Missing required parameters: amount, icpRecipient'
      });
      return;
    }

    const order = await bridge.initiateEthereumToICPSwap({
      amount,
      icpRecipient,
      fromToken,
      toToken
    });

    res.json({
      success: true,
      order,
      localMode: true
    });
  } catch (error) {
    console.error('Error creating swap:', error);
    res.status(500).json({
      error: 'Failed to create swap',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Complete swap
app.post('/api/swap/complete', async (req, res): Promise<void> => {
  try {
    const { orderId, preimage } = req.body;

    if (!orderId || !preimage) {
      res.status(400).json({
        error: 'Missing required parameters: orderId, preimage'
      });
      return;
    }

    const success = await bridge.completeSwap(orderId, preimage);

    res.json({
      success,
      message: success ? 'Swap completed successfully' : 'Swap completion failed',
      localMode: true
    });
  } catch (error) {
    console.error('Error completing swap:', error);
    res.status(500).json({
      error: 'Failed to complete swap',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get available tokens
app.get('/api/tokens', async (req, res) => {
  try {
    const tokens = await bridge.getAvailableTokens();
    res.json({
      success: true,
      tokens,
      localMode: true
    });
  } catch (error) {
    console.error('Error getting tokens:', error);
    res.status(500).json({
      error: 'Failed to get tokens',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get swap quote
app.post('/api/quote', async (req, res): Promise<void> => {
  try {
    const { fromToken, toToken, amount, walletAddress } = req.body;

    if (!fromToken || !toToken || !amount || !walletAddress) {
      res.status(400).json({
        error: 'Missing required parameters: fromToken, toToken, amount, walletAddress'
      });
      return;
    }

    const quote = await bridge.getQuote({
      fromToken,
      toToken,
      amount,
      walletAddress
    });

    res.json({
      success: true,
      quote,
      localMode: true
    });
  } catch (error) {
    console.error('Error getting quote:', error);
    res.status(500).json({
      error: 'Failed to get quote',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get order status
app.get('/api/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    if (!orderId) {
      res.status(400).json({
        error: 'Missing orderId parameter'
      });
      return;
    }

    const orderStatus = await bridge.getOrderStatus(orderId);
    res.json({
      success: true,
      orderStatus,
      localMode: true
    });
  } catch (error) {
    console.error('Error getting order status:', error);
    res.status(500).json({
      error: 'Failed to get order status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get gas price
app.get('/api/gas-price', async (req, res) => {
  try {
    const gasPrice = await bridge.getGasPrice();
    res.json({
      success: true,
      gasPrice,
      localMode: true
    });
  } catch (error) {
    console.error('Error getting gas price:', error);
    res.status(500).json({
      error: 'Failed to get gas price',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test hashlock generation
app.post('/api/test/hashlock', (req, res) => {
  try {
    const { hashlock, preimage } = bridge.generateHashlock();
    const isValid = bridge.verifyHashlock(hashlock, preimage);
    
    res.json({
      success: true,
      hashlock,
      preimage,
      isValid,
      localMode: true
    });
  } catch (error) {
    console.error('Error testing hashlock:', error);
    res.status(500).json({
      error: 'Failed to test hashlock',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env['NODE_ENV'] === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Doraemon Bridge LOCAL API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔧 Bridge config: http://localhost:${PORT}/api/config`);
  console.log(`🌐 Local Mode: Connected to Hardhat + ICP`);
});

export default app; 