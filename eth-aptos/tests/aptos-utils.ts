import { AptosAccount, AptosClient, TxnBuilderTypes, BCS } from "aptos";
import * as dotenv from "dotenv";

dotenv.config();

// Configuration
const NODE_URL = "https://fullnode.testnet.aptoslabs.com/v1";
const MODULE_ADDRESS = "0xf3b387e70e971c321d06adc2c8a6721d010b2827508deae8cf1a24fa74817ac9";

// Account setup
const account = AptosAccount.fromAptosAccountObject({
  privateKeyHex: process.env.PRIVKEY as string,
  address: process.env.ADDR as string,
});

const client = new AptosClient(NODE_URL);

// Utility Types
export interface OrderParams {
  srcMint: string;
  dstMint: string;
  srcAmount: string;
  minDstAmount: string;
  estimatedDstAmount: string;
  expirationTime: string;
  makerFee: string;
  takerFee: string;
  resolverFee: string;
  platformFee: string;
  startPrice: string;
  endPrice: string;
  startTime: string;
  duration: string;
  minFillAmount: string;
  maxFillAmount: string;
  hash: Uint8Array;
  finalityLock: string;
  exclusiveWithdraw: string;
  cancellationTimeout: string;
}

export interface FillOrderParams {
  orderId: string;
  fillAmount: string;
  secret: Uint8Array;
}

// Utility Functions
export async function signAndSubmit(payload: any): Promise<string> {
  console.log("Submitting payload:", payload);
  const rawTxn = await client.generateTransaction(account.address(), payload);
  const bcsTxn = AptosClient.generateBCSTransaction(account, rawTxn);
  const pending = await client.submitSignedBCSTransaction(bcsTxn);
  console.log("Transaction submitted:", pending.hash);
  await client.waitForTransaction(pending.hash);
  console.log("✓ Transaction confirmed:", `https://explorer.aptoslabs.com/txn/${pending.hash}?network=testnet`);
  return pending.hash;
}

export function createHashlockHash(secret: string): Uint8Array {
  return Uint8Array.from(Buffer.from(secret, "hex"));
}

export function generateRandomSecret(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function getAccountAddress(): string {
  return account.address().toString();
}

export function getClient(): AptosClient {
  return client;
}

export function getAccount(): AptosAccount {
  return account;
}

// Order Creation Functions
export async function createOrder(params: OrderParams): Promise<string> {
  const payload = {
    function: `${MODULE_ADDRESS}::fusion_swap::create_order`,
    type_arguments: [],
    arguments: [
      params.srcMint,
      params.dstMint,
      params.srcAmount,
      params.minDstAmount,
      params.estimatedDstAmount,
      params.expirationTime,
      params.makerFee,
      params.takerFee,
      params.resolverFee,
      params.platformFee,
      params.startPrice,
      params.endPrice,
      params.startTime,
      params.duration,
      params.minFillAmount,
      params.maxFillAmount,
      params.hash,
      params.finalityLock,
      params.exclusiveWithdraw,
      params.cancellationTimeout
    ]
  };

  return await signAndSubmit(payload);
}

export async function cancelOrder(orderId: string): Promise<string> {
  const payload = {
    function: `${MODULE_ADDRESS}::fusion_swap::cancel_order`,
    type_arguments: [],
    arguments: [orderId]
  };

  return await signAndSubmit(payload);
}

export async function fillOrder(params: FillOrderParams): Promise<string> {
  const payload = {
    function: `${MODULE_ADDRESS}::fusion_swap::fill_order`,
    type_arguments: [],
    arguments: [
      params.orderId,
      params.fillAmount,
      params.secret
    ]
  };

  return await signAndSubmit(payload);
}

// Query Functions
export async function getOrderById(orderId: string): Promise<any> {
  const payload = {
    function: `${MODULE_ADDRESS}::fusion_swap::get_order_by_id`,
    type_arguments: [],
    arguments: [orderId]
  };

  return await client.view(payload);
}

export async function getOrdersByMaker(makerAddress: string): Promise<any> {
  const payload = {
    function: `${MODULE_ADDRESS}::fusion_swap::get_orders_by_maker`,
    type_arguments: [],
    arguments: [makerAddress]
  };

  return await client.view(payload);
}

export async function getActiveOrders(): Promise<any> {
  const payload = {
    function: `${MODULE_ADDRESS}::fusion_swap::get_active_orders`,
    type_arguments: [],
    arguments: []
  };

  return await client.view(payload);
}

export async function getContractStatistics(): Promise<any> {
  const payload = {
    function: `${MODULE_ADDRESS}::fusion_swap::get_contract_statistics`,
    type_arguments: [],
    arguments: []
  };

  return await client.view(payload);
}

export async function checkContractHealth(): Promise<any> {
  const payload = {
    function: `${MODULE_ADDRESS}::fusion_swap::check_contract_health`,
    type_arguments: [],
    arguments: []
  };

  return await client.view(payload);
}

// Batch Operations
export async function batchCreateOrders(orders: OrderParams[]): Promise<string> {
  const batchSize = orders.length;
  const srcTokens = orders.map(o => o.srcMint);
  const dstTokens = orders.map(o => o.dstMint);
  const srcAmounts = orders.map(o => o.srcAmount);
  const dstAmounts = orders.map(o => o.estimatedDstAmount);
  const minDstAmounts = orders.map(o => o.minDstAmount);
  const maxDstAmounts = orders.map(o => o.estimatedDstAmount);
  const makerFees = orders.map(o => o.makerFee);
  const takerFees = orders.map(o => o.takerFee);
  const resolverFees = orders.map(o => o.resolverFee);
  const platformFees = orders.map(o => o.platformFee);
  const startPrices = orders.map(o => o.startPrice);
  const endPrices = orders.map(o => o.endPrice);
  const startTimes = orders.map(o => o.startTime);
  const durations = orders.map(o => o.duration);
  const minFillAmounts = orders.map(o => o.minFillAmount);
  const maxFillAmounts = orders.map(o => o.maxFillAmount);
  const hashes = orders.map(o => o.hash);
  const finalityLocks = orders.map(o => o.finalityLock);
  const exclusiveWithdraws = orders.map(o => o.exclusiveWithdraw);
  const cancellationTimeouts = orders.map(o => o.cancellationTimeout);

  const payload = {
    function: `${MODULE_ADDRESS}::fusion_swap::batch_create_orders`,
    type_arguments: [],
    arguments: [
      srcTokens,
      dstTokens,
      srcAmounts,
      dstAmounts,
      minDstAmounts,
      maxDstAmounts,
      makerFees,
      takerFees,
      resolverFees,
      platformFees,
      startPrices,
      endPrices,
      startTimes,
      durations,
      minFillAmounts,
      maxFillAmounts,
      hashes,
      finalityLocks,
      exclusiveWithdraws,
      cancellationTimeouts
    ]
  };

  return await signAndSubmit(payload);
}

// Test Data Generators
export function createTestOrderParams(secret?: string): OrderParams {
  const testSecret = secret || generateRandomSecret();
  
  return {
    srcMint: "0x00000000000000000000000000000001",
    dstMint: "0x00000000000000000000000000000001",
    srcAmount: "1000000",
    minDstAmount: "950000",
    estimatedDstAmount: "1000000",
    expirationTime: "1735689600",
    makerFee: "100",
    takerFee: "50",
    resolverFee: "25",
    platformFee: "25",
    startPrice: "1000000",
    endPrice: "950000",
    startTime: "1735689600",
    duration: "3600",
    minFillAmount: "100000",
    maxFillAmount: "1000000",
    hash: createHashlockHash(testSecret),
    finalityLock: "300",
    exclusiveWithdraw: "600",
    cancellationTimeout: "900"
  };
}

export function createTestFillParams(orderId: string, secret: string): FillOrderParams {
  return {
    orderId,
    fillAmount: "500000",
    secret: createHashlockHash(secret)
  };
}

// Validation Functions
export function validateOrderParams(params: OrderParams): boolean {
  return (
    params.srcAmount !== "0" &&
    params.minDstAmount !== "0" &&
    parseInt(params.duration) >= 300 &&
    parseInt(params.duration) <= 3600 &&
    params.hash.length === 32 &&
    parseInt(params.makerFee) <= 10000 &&
    parseInt(params.takerFee) <= 10000 &&
    parseInt(params.resolverFee) <= 10000 &&
    parseInt(params.platformFee) <= 10000
  );
}

export function validateFillParams(params: FillOrderParams): boolean {
  return (
    params.orderId !== "" &&
    params.fillAmount !== "0" &&
    params.secret.length === 32
  );
}

// Error Handling
export class AptosFusionError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AptosFusionError';
  }
}

export function handleTransactionError(error: any): never {
  console.error("Transaction failed:", error);
  throw new AptosFusionError(`Transaction failed: ${error.message}`, error.code);
}

// Export configuration
export const CONFIG = {
  NODE_URL,
  MODULE_ADDRESS,
  ACCOUNT_ADDRESS: getAccountAddress()
};
