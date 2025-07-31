# ICRC Utils Module

A comprehensive TypeScript utility module for interacting with ICRC-1 and ICRC-2 tokens on the Internet Computer.

## Features

### 🔍 **Balance Operations**
- Get account balances
- Check if accounts have sufficient balance
- Format amounts with proper decimals

### 💸 **Transfer Operations**
- ICRC-1 direct transfers
- ICRC-2 approved transfers
- Automatic approval handling
- Batch transfers
- Transfer with automatic approval

### ✅ **Approval Operations**
- Approve tokens for spenders
- Check allowance amounts
- Verify sufficient allowance

### 📋 **Metadata Operations**
- Get token name, symbol, decimals
- Retrieve transfer fees
- Get total supply information

### 📜 **Transaction History**
- Get transaction history for accounts
- Parse transaction data

## Installation

The module is already included in the project. Import it in your test files:

```typescript
import { icrcUtils, ICRCUtilsStatic, Account } from './icrc-utils';
```

## Usage Examples

### Basic Balance Check

```typescript
const account: Account = {
  owner: 'cjobn-a4566-qzwux-yg5b5-z2vqh-huolu-nhxd6-6xrto-zunsj-zuwdd-qae'
};

const balanceResult = await icrcUtils.getBalance(account);
if (balanceResult.success) {
  console.log(`Balance: ${ICRCUtilsStatic.formatAmount(balanceResult.balance!)} FUSION`);
}
```

### Transfer Tokens

```typescript
const fromAccount: Account = {
  owner: 'cjobn-a4566-qzwux-yg5b5-z2vqh-huolu-nhxd6-6xrto-zunsj-zuwdd-qae'
};

const toAccount: Account = {
  owner: 'fhrni-ukyxj-tns4p-l7f32-txwvg-anu57-55dcm-gzhue-22yg2-qokvv-mqe'
};

const transferResult = await icrcUtils.transfer(
  fromAccount,
  toAccount,
  100000000, // 1 FUSION token
  10000 // fee
);

if (transferResult.success) {
  console.log(`Transfer successful! Block: ${transferResult.blockIndex}`);
}
```

### Approve and Transfer

```typescript
const spender: Account = {
  owner: 'bkyz2-fmaaa-aaaaa-qaaaq-cai' // Contract address
};

// Approve tokens
const approveResult = await icrcUtils.approve({
  amount: 1000000000, // 10 FUSION tokens
  spender,
  fee: 10000
});

// Transfer with approval
const transferResult = await icrcUtils.transferWithApproval(
  fromAccount,
  toAccount,
  100000000, // 1 FUSION token
  spender,
  10000 // fee
);
```

### Batch Transfers

```typescript
const transfers = [
  { to: account1, amount: 50000000 }, // 0.5 FUSION
  { to: account2, amount: 50000000 }  // 0.5 FUSION
];

const batchResults = await icrcUtils.batchTransfer(fromAccount, transfers, 10000);
const successfulTransfers = batchResults.filter(result => result.success);
console.log(`Successful: ${successfulTransfers.length}/${batchResults.length}`);
```

### Get Token Metadata

```typescript
const metadata = await icrcUtils.getMetadata();
if (metadata.success) {
  console.log(`Token: ${metadata.name} (${metadata.symbol})`);
  console.log(`Decimals: ${metadata.decimals}`);
  console.log(`Fee: ${metadata.fee}`);
  console.log(`Total Supply: ${ICRCUtilsStatic.formatAmount(metadata.totalSupply)}`);
}
```

### Utility Functions

```typescript
// Format amounts
const formatted = ICRCUtilsStatic.formatAmount(123456789, 8); // "1.23456789"

// Parse amounts
const parsed = ICRCUtilsStatic.parseAmount("1.23456789", 8); // 123456789

// Create subaccount
const subaccount = ICRCUtilsStatic.createSubaccount(principal, 123);
```

## API Reference

### ICRCUtils Class

#### Constructor
```typescript
constructor(ledgerCanisterId?: string)
```

#### Methods

##### `getBalance(account: Account): Promise<BalanceResult>`
Get the balance of an account.

##### `transfer(from: Account, to: Account, amount: number, fee?: number, memo?: string): Promise<TransferResult>`
Transfer tokens using ICRC-1.

##### `transferFrom(args: TransferFromArgs): Promise<TransferResult>`
Transfer tokens using ICRC-2 (approved transfer).

##### `approve(args: ApproveArgs): Promise<ApproveResult>`
Approve tokens for a spender.

##### `getAllowance(from: Account, spender: Account): Promise<AllowanceResult>`
Get allowance for a spender.

##### `hasSufficientBalance(account: Account, amount: number): Promise<boolean>`
Check if account has sufficient balance.

##### `hasSufficientAllowance(from: Account, spender: Account, amount: number): Promise<boolean>`
Check if spender has sufficient allowance.

##### `transferWithApproval(from: Account, to: Account, amount: number, spender: Account, fee?: number): Promise<TransferResult>`
Transfer tokens with automatic approval if needed.

##### `batchTransfer(from: Account, transfers: Array<{to: Account, amount: number}>, fee?: number): Promise<TransferResult[]>`
Perform batch transfers.

##### `getMetadata(): Promise<any>`
Get token metadata.

##### `getTransactionHistory(account: Account, start?: number, length?: number): Promise<any>`
Get transaction history for an account.

### ICRCUtilsStatic (Static Methods)

##### `formatAmount(amount: number, decimals?: number): string`
Format amount with proper decimals.

##### `parseAmount(formattedAmount: string, decimals?: number): number`
Parse amount from formatted string.

##### `createSubaccount(principal: string, subaccountNumber: number): string`
Create a subaccount from principal and number.

## Interfaces

### Account
```typescript
interface Account {
  owner: string;
  subaccount?: string;
}
```

### TransferResult
```typescript
interface TransferResult {
  success: boolean;
  blockIndex?: number;
  error?: string;
}
```

### BalanceResult
```typescript
interface BalanceResult {
  success: boolean;
  balance?: number;
  error?: string;
}
```

### ApproveResult
```typescript
interface ApproveResult {
  success: boolean;
  blockIndex?: number;
  error?: string;
}
```

### AllowanceResult
```typescript
interface AllowanceResult {
  success: boolean;
  allowance?: number;
  expires_at?: number;
  error?: string;
}
```

## Error Handling

All methods return result objects with success/error information:

```typescript
const result = await icrcUtils.getBalance(account);
if (result.success) {
  // Handle success
  console.log(`Balance: ${result.balance}`);
} else {
  // Handle error
  console.error(`Error: ${result.error}`);
}
```

## Testing

Run the ICRC utils tests:

```bash
npm test -- --testNamePattern="ICRC Utils Test"
```

## Configuration

The default ledger canister ID is `br5f7-7uaaa-aaaaa-qaaca-cai`. You can override this when creating an instance:

```typescript
const customIcrcUtils = new ICRCUtils('your-ledger-canister-id');
```

## Dependencies

- `child_process` - For executing dfx commands
- `util` - For promisifying exec function

## Notes

- All amounts are in the smallest unit (e.g., e8s for 8 decimals)
- The module uses dfx commands to interact with the ledger
- Error handling is comprehensive with detailed error messages
- Batch operations include rate limiting delays
- All methods are async and return Promises 