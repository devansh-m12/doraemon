# Aptos Fusion Swap Utilities

This directory contains TypeScript utilities for interacting with the deployed Aptos Fusion Swap contract using the `@aptos-labs/ts-sdk`.

## 📁 Files

- `aptos-utils.ts` - Main utilities for contract interaction
- `aptos-fusion-swap.test.ts` - Jest tests for the utilities
- `example-usage.ts` - Example script demonstrating usage

## 🚀 Quick Start

### Prerequisites

```bash
# Install dependencies
npm install

# Make sure you have the Aptos CLI configured
aptos init --profile testnet
```

### Basic Usage

```typescript
import { AptosFusionSwapClient, AptosFusionSwapUtils, Network } from './aptos-utils';

// Create a test account (or use your own private key)
const testAccount = AptosFusionSwapUtils.createTestAccount();
const privateKey = AptosFusionSwapUtils.getTestAccountPrivateKey(testAccount);

// Initialize client
const client = new AptosFusionSwapClient(privateKey, Network.TESTNET);

// Get account info
const accountInfo = await client.getAccountInfo();
console.log('Account address:', accountInfo.address);

// Get balance
const balance = await client.getBalance();
console.log('Balance:', balance.toString(), 'octas');
```

## 📋 Available Methods

### Account Operations

- `getAccountInfo()` - Get account information
- `getBalance(coinType?)` - Get account balance for specified coin type

### Order Management

#### Create Orders
- `createOrder(params: CreateOrderParams)` - Create a single order
- `batchCreateOrders(params: BatchCreateOrderParams)` - Create multiple orders

#### Cancel Orders
- `cancelOrder(orderId: number)` - Cancel a single order
- `batchCancelOrders(orderIds: number[])` - Cancel multiple orders

#### Fill Orders
- `fillOrder(params: FillOrderParams)` - Fill a single order
- `batchFillOrders(params: BatchFillOrderParams)` - Fill multiple orders

### Query Functions

- `getOrderById(orderId: number)` - Get order by ID
- `getOrdersByMaker(makerAddress: string)` - Get orders by maker address
- `getOrdersByStatus(status: OrderStatus)` - Get orders by status
- `getActiveOrders()` - Get all active orders
- `getOrderHistory()` - Get order history
- `calculateOrderStatistics()` - Calculate order statistics
- `getContractStatistics()` - Get contract statistics
- `checkContractHealth()` - Check contract health
- `getTotalOrders()` - Get total orders count

## 🛠️ Utility Functions

### AptosFusionSwapUtils

- `createTestOrder(...)` - Create test order with default parameters
- `generateRandomHash()` - Generate random hash for testing
- `hexToBytes(hex: string)` - Convert hex string to Uint8Array
- `bytesToHex(bytes: Uint8Array)` - Convert Uint8Array to hex string
- `createTestAccount()` - Create a test Aptos account
- `getTestAccountPrivateKey(account: AptosAccount)` - Get private key as hex string

## 📝 Example: Creating an Order

```typescript
import { AptosFusionSwapClient, AptosFusionSwapUtils, Network } from './aptos-utils';

async function createOrderExample() {
  // Initialize client
  const testAccount = AptosFusionSwapUtils.createTestAccount();
  const privateKey = AptosFusionSwapUtils.getTestAccountPrivateKey(testAccount);
  const client = new AptosFusionSwapClient(privateKey, Network.TESTNET);

  // Create order parameters
  const orderParams = AptosFusionSwapUtils.createTestOrder(
    '0x1::aptos_coin::AptosCoin', // Source token
    '0x1::aptos_coin::AptosCoin', // Destination token
    BigInt(1000000), // 1 APT
    BigInt(950000),  // 0.95 APT (5% slippage)
    BigInt(1000000), // 1 APT
    Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
  );

  try {
    // Create the order
    const txHash = await client.createOrder(orderParams);
    console.log('Order created successfully!');
    console.log('Transaction hash:', txHash);

    // Get order details
    const orderDetails = await client.getOrderById(1);
    console.log('Order details:', orderDetails);
  } catch (error) {
    console.error('Failed to create order:', error);
  }
}
```

## 📝 Example: Filling an Order

```typescript
import { AptosFusionSwapClient, AptosFusionSwapUtils, Network } from './aptos-utils';

async function fillOrderExample() {
  const testAccount = AptosFusionSwapUtils.createTestAccount();
  const privateKey = AptosFusionSwapUtils.getTestAccountPrivateKey(testAccount);
  const client = new AptosFusionSwapClient(privateKey, Network.TESTNET);

  // Fill order parameters
  const fillParams = {
    order_id: 1,
    fill_amount: BigInt(500000), // 0.5 APT
    secret: AptosFusionSwapUtils.generateRandomHash() // Optional secret
  };

  try {
    const txHash = await client.fillOrder(fillParams);
    console.log('Order filled successfully!');
    console.log('Transaction hash:', txHash);
  } catch (error) {
    console.error('Failed to fill order:', error);
  }
}
```

## 📝 Example: Canceling an Order

```typescript
import { AptosFusionSwapClient, AptosFusionSwapUtils, Network } from './aptos-utils';

async function cancelOrderExample() {
  const testAccount = AptosFusionSwapUtils.createTestAccount();
  const privateKey = AptosFusionSwapUtils.getTestAccountPrivateKey(testAccount);
  const client = new AptosFusionSwapClient(privateKey, Network.TESTNET);

  try {
    const txHash = await client.cancelOrder(1);
    console.log('Order canceled successfully!');
    console.log('Transaction hash:', txHash);
  } catch (error) {
    console.error('Failed to cancel order:', error);
  }
}
```

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test aptos-fusion-swap.test.ts

# Run example script
npx ts-node example-usage.ts
```

## 🔧 Configuration

### Contract Address

The utilities are configured to work with the deployed contract at:
```
0xf3b387e70e971c321d06adc2c8a6721d010b2827508deae8cf1a24fa74817ac9
```

### Network Configuration

- **Testnet**: `https://fullnode.testnet.aptoslabs.com`
- **Mainnet**: `https://fullnode.mainnet.aptoslabs.com`
- **Local**: `http://localhost:8080`

## 📊 Order Status Values

```typescript
enum OrderStatus {
  ACTIVE = 0,
  FILLED = 1,
  CANCELLED = 2,
  EXPIRED = 3,
}
```

## 🔐 Security Notes

- **Private Keys**: Never hardcode private keys in production code
- **Test Accounts**: Use test accounts for development and testing
- **Network Selection**: Be careful when switching between testnet and mainnet
- **Transaction Confirmation**: Always wait for transaction confirmation before proceeding

## 🚨 Error Handling

The utilities include comprehensive error handling:

```typescript
try {
  const result = await client.createOrder(orderParams);
  console.log('Success:', result);
} catch (error) {
  console.error('Error:', error.message);
  // Handle specific error types
  if (error.message.includes('insufficient funds')) {
    console.log('Need to fund the account first');
  }
}
```

## 📚 Additional Resources

- [Aptos TypeScript SDK Documentation](https://aptos.dev/sdks/ts-sdk/)
- [Aptos Move Language](https://aptos.dev/move/)
- [Contract Explorer](https://explorer.aptoslabs.com/account/0xf3b387e70e971c321d06adc2c8a6721d010b2827508deae8cf1a24fa74817ac9?network=testnet)

## 🤝 Contributing

When adding new functionality:

1. Add new methods to `AptosFusionSwapClient`
2. Create corresponding tests in `aptos-fusion-swap.test.ts`
3. Update this README with examples
4. Ensure proper error handling and type safety

## 📄 License

This project is licensed under the MIT License. 