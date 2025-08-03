import {
  AptosClient,
  AptosAccount,
  TxnBuilderTypes,
  TransactionBuilder,
  TypeTag,
  AccountAddress,
  EntryFunction,
  TransactionArgument,
  TransactionPayload,
  Provider,
  Network,
  Ed25519PrivateKey,
  Ed25519PublicKey,
  HexString,
  BCS,
  Serializer,
  Deserializer,
} from "@aptos-labs/ts-sdk";

// Contract configuration
export const CONTRACT_ADDRESS = "0xf3b387e70e971c321d06adc2c8a6721d010b2827508deae8cf1a24fa74817ac9";
export const MODULE_NAME = "fusion_swap";
export const PACKAGE_NAME = "fusion_swap";

// Network configuration
export const TESTNET_NODE_URL = "https://fullnode.testnet.aptoslabs.com";
export const MAINNET_NODE_URL = "https://fullnode.mainnet.aptoslabs.com";
export const LOCAL_NODE_URL = "http://localhost:8080";

// Order status enum
export enum OrderStatus {
  ACTIVE = 0,
  FILLED = 1,
  CANCELLED = 2,
  EXPIRED = 3,
}

// Fee configuration interface
export interface FeeConfig {
  maker_fee: number;
  taker_fee: number;
  resolver_fee: number;
  platform_fee: number;
}

// Auction data interface
export interface AuctionData {
  start_price: bigint;
  end_price: bigint;
  start_time: number;
  duration: number;
  min_fill_amount: bigint;
  max_fill_amount: bigint;
}

// Hash lock interface
export interface HashLock {
  hash: Uint8Array;
  finality_lock: number;
  exclusive_withdraw: number;
  cancellation_timeout: number;
}

// Order creation parameters interface
export interface CreateOrderParams {
  src_mint: string;
  dst_mint: string;
  src_amount: bigint;
  min_dst_amount: bigint;
  estimated_dst_amount: bigint;
  expiration_time: number;
  fee: FeeConfig;
  auction: AuctionData;
  hashlock: HashLock;
}

// Fill order parameters interface
export interface FillOrderParams {
  order_id: number;
  fill_amount: bigint;
  secret?: Uint8Array;
}

// Batch order creation parameters
export interface BatchCreateOrderParams {
  src_tokens: string[];
  dst_tokens: string[];
  src_amounts: bigint[];
  min_dst_amounts: bigint[];
  estimated_dst_amounts: bigint[];
  expiration_times: number[];
  fees: FeeConfig[];
  auctions: AuctionData[];
  hashlocks: HashLock[];
}

// Batch fill order parameters
export interface BatchFillOrderParams {
  order_ids: number[];
  fill_amounts: bigint[];
  secrets: Uint8Array[];
}

export class AptosFusionSwapClient {
  private client: AptosClient;
  private account: AptosAccount;
  private provider: Provider;

  constructor(
    privateKey: string,
    network: Network = Network.TESTNET,
    nodeUrl?: string
  ) {
    const privateKeyBytes = new HexString(privateKey).toUint8Array();
    this.account = new AptosAccount(privateKeyBytes);
    
    const url = nodeUrl || this.getNodeUrl(network);
    this.client = new AptosClient(url);
    this.provider = new Provider(network, this.client);
  }

  private getNodeUrl(network: Network): string {
    switch (network) {
      case Network.TESTNET:
        return TESTNET_NODE_URL;
      case Network.MAINNET:
        return MAINNET_NODE_URL;
      case Network.LOCAL:
        return LOCAL_NODE_URL;
      default:
        return TESTNET_NODE_URL;
    }
  }

  /**
   * Get account information
   */
  async getAccountInfo(): Promise<any> {
    return await this.client.getAccount(this.account.accountAddress);
  }

  /**
   * Get account balance
   */
  async getBalance(coinType: string = "0x1::aptos_coin::AptosCoin"): Promise<bigint> {
    const resources = await this.client.getAccountResources(this.account.accountAddress);
    const coinResource = resources.find((r) => r.type === coinType);
    return coinResource ? BigInt(coinResource.data.coin.value) : BigInt(0);
  }

  /**
   * Create a new swap order
   */
  async createOrder(params: CreateOrderParams): Promise<string> {
    const payload = new TxnBuilderTypes.TransactionPayloadEntryFunction(
      new EntryFunction(
        new TxnBuilderTypes.ModuleId(
          new AccountAddress(HexString.ensure(CONTRACT_ADDRESS)),
          new TxnBuilderTypes.Identifier(MODULE_NAME)
        ),
        new TxnBuilderTypes.Identifier("create_order"),
        [
          new TypeTag(AccountAddress.fromString(params.src_mint)),
          new TypeTag(AccountAddress.fromString(params.dst_mint)),
        ],
        [
          this.serializeU128(params.src_amount),
          this.serializeU128(params.min_dst_amount),
          this.serializeU128(params.estimated_dst_amount),
          this.serializeU64(params.expiration_time),
          this.serializeU64(params.fee.maker_fee),
          this.serializeU64(params.fee.taker_fee),
          this.serializeU64(params.fee.resolver_fee),
          this.serializeU64(params.fee.platform_fee),
          this.serializeU128(params.auction.start_price),
          this.serializeU128(params.auction.end_price),
          this.serializeU64(params.auction.start_time),
          this.serializeU64(params.auction.duration),
          this.serializeU128(params.auction.min_fill_amount),
          this.serializeU128(params.auction.max_fill_amount),
          this.serializeBytes(params.hashlock.hash),
          this.serializeU64(params.hashlock.finality_lock),
          this.serializeU64(params.hashlock.exclusive_withdraw),
          this.serializeU64(params.hashlock.cancellation_timeout),
        ]
      )
    );

    const rawTxn = await this.client.generateTransaction(
      this.account.accountAddress,
      payload
    );

    const bcsTxn = await this.client.signTransaction(this.account, rawTxn);
    const transactionRes = await this.client.submitTransaction(bcsTxn);
    await this.client.waitForTransaction(transactionRes.hash);

    return transactionRes.hash;
  }

  /**
   * Cancel an existing order
   */
  async cancelOrder(orderId: number): Promise<string> {
    const payload = new TxnBuilderTypes.TransactionPayloadEntryFunction(
      new EntryFunction(
        new TxnBuilderTypes.ModuleId(
          new AccountAddress(HexString.ensure(CONTRACT_ADDRESS)),
          new TxnBuilderTypes.Identifier(MODULE_NAME)
        ),
        new TxnBuilderTypes.Identifier("cancel_order"),
        [],
        [this.serializeU64(orderId)]
      )
    );

    const rawTxn = await this.client.generateTransaction(
      this.account.accountAddress,
      payload
    );

    const bcsTxn = await this.client.signTransaction(this.account, rawTxn);
    const transactionRes = await this.client.submitTransaction(bcsTxn);
    await this.client.waitForTransaction(transactionRes.hash);

    return transactionRes.hash;
  }

  /**
   * Fill an order with the secret
   */
  async fillOrder(params: FillOrderParams): Promise<string> {
    const args = [
      this.serializeU64(params.order_id),
      this.serializeU128(params.fill_amount),
    ];

    if (params.secret) {
      args.push(this.serializeBytes(params.secret));
    }

    const payload = new TxnBuilderTypes.TransactionPayloadEntryFunction(
      new EntryFunction(
        new TxnBuilderTypes.ModuleId(
          new AccountAddress(HexString.ensure(CONTRACT_ADDRESS)),
          new TxnBuilderTypes.Identifier(MODULE_NAME)
        ),
        new TxnBuilderTypes.Identifier("fill_order"),
        [],
        args
      )
    );

    const rawTxn = await this.client.generateTransaction(
      this.account.accountAddress,
      payload
    );

    const bcsTxn = await this.client.signTransaction(this.account, rawTxn);
    const transactionRes = await this.client.submitTransaction(bcsTxn);
    await this.client.waitForTransaction(transactionRes.hash);

    return transactionRes.hash;
  }

  /**
   * Create multiple orders in a batch
   */
  async batchCreateOrders(params: BatchCreateOrderParams): Promise<string> {
    const payload = new TxnBuilderTypes.TransactionPayloadEntryFunction(
      new EntryFunction(
        new TxnBuilderTypes.ModuleId(
          new AccountAddress(HexString.ensure(CONTRACT_ADDRESS)),
          new TxnBuilderTypes.Identifier(MODULE_NAME)
        ),
        new TxnBuilderTypes.Identifier("batch_create_orders"),
        [],
        [
          this.serializeVectorAddress(params.src_tokens),
          this.serializeVectorAddress(params.dst_tokens),
          this.serializeVectorU128(params.src_amounts),
          this.serializeVectorU128(params.min_dst_amounts),
          this.serializeVectorU128(params.estimated_dst_amounts),
          this.serializeVectorU64(params.expiration_times),
          this.serializeVectorU64(params.fees.map(f => f.maker_fee)),
          this.serializeVectorU64(params.fees.map(f => f.taker_fee)),
          this.serializeVectorU64(params.fees.map(f => f.resolver_fee)),
          this.serializeVectorU64(params.fees.map(f => f.platform_fee)),
          this.serializeVectorU128(params.auctions.map(a => a.start_price)),
          this.serializeVectorU128(params.auctions.map(a => a.end_price)),
          this.serializeVectorU64(params.auctions.map(a => a.start_time)),
          this.serializeVectorU64(params.auctions.map(a => a.duration)),
          this.serializeVectorU128(params.auctions.map(a => a.min_fill_amount)),
          this.serializeVectorU128(params.auctions.map(a => a.max_fill_amount)),
          this.serializeVectorBytes(params.hashlocks.map(h => h.hash)),
          this.serializeVectorU64(params.hashlocks.map(h => h.finality_lock)),
          this.serializeVectorU64(params.hashlocks.map(h => h.exclusive_withdraw)),
          this.serializeVectorU64(params.hashlocks.map(h => h.cancellation_timeout)),
        ]
      )
    );

    const rawTxn = await this.client.generateTransaction(
      this.account.accountAddress,
      payload
    );

    const bcsTxn = await this.client.signTransaction(this.account, rawTxn);
    const transactionRes = await this.client.submitTransaction(bcsTxn);
    await this.client.waitForTransaction(transactionRes.hash);

    return transactionRes.hash;
  }

  /**
   * Cancel multiple orders in a batch
   */
  async batchCancelOrders(orderIds: number[]): Promise<string> {
    const payload = new TxnBuilderTypes.TransactionPayloadEntryFunction(
      new EntryFunction(
        new TxnBuilderTypes.ModuleId(
          new AccountAddress(HexString.ensure(CONTRACT_ADDRESS)),
          new TxnBuilderTypes.Identifier(MODULE_NAME)
        ),
        new TxnBuilderTypes.Identifier("batch_cancel_orders"),
        [],
        [this.serializeVectorU64(orderIds)]
      )
    );

    const rawTxn = await this.client.generateTransaction(
      this.account.accountAddress,
      payload
    );

    const bcsTxn = await this.client.signTransaction(this.account, rawTxn);
    const transactionRes = await this.client.submitTransaction(bcsTxn);
    await this.client.waitForTransaction(transactionRes.hash);

    return transactionRes.hash;
  }

  /**
   * Fill multiple orders in a batch
   */
  async batchFillOrders(params: BatchFillOrderParams): Promise<string> {
    const payload = new TxnBuilderTypes.TransactionPayloadEntryFunction(
      new EntryFunction(
        new TxnBuilderTypes.ModuleId(
          new AccountAddress(HexString.ensure(CONTRACT_ADDRESS)),
          new TxnBuilderTypes.Identifier(MODULE_NAME)
        ),
        new TxnBuilderTypes.Identifier("batch_fill_orders"),
        [],
        [
          this.serializeVectorU64(params.order_ids),
          this.serializeVectorU128(params.fill_amounts),
          this.serializeVectorBytes(params.secrets),
        ]
      )
    );

    const rawTxn = await this.client.generateTransaction(
      this.account.accountAddress,
      payload
    );

    const bcsTxn = await this.client.signTransaction(this.account, rawTxn);
    const transactionRes = await this.client.submitTransaction(bcsTxn);
    await this.client.waitForTransaction(transactionRes.hash);

    return transactionRes.hash;
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: number): Promise<any> {
    const payload = {
      function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::get_order_by_id`,
      type_arguments: [],
      arguments: [orderId.toString()],
    };

    const response = await this.client.view(payload);
    return response[0];
  }

  /**
   * Get orders by maker address
   */
  async getOrdersByMaker(makerAddress: string): Promise<any[]> {
    const payload = {
      function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::get_orders_by_maker`,
      type_arguments: [],
      arguments: [makerAddress],
    };

    const response = await this.client.view(payload);
    return response[0];
  }

  /**
   * Get orders by status
   */
  async getOrdersByStatus(status: OrderStatus): Promise<any[]> {
    const payload = {
      function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::get_orders_by_status`,
      type_arguments: [],
      arguments: [status.toString()],
    };

    const response = await this.client.view(payload);
    return response[0];
  }

  /**
   * Get all active orders
   */
  async getActiveOrders(): Promise<any[]> {
    const payload = {
      function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::get_active_orders`,
      type_arguments: [],
      arguments: [],
    };

    const response = await this.client.view(payload);
    return response[0];
  }

  /**
   * Get order history
   */
  async getOrderHistory(): Promise<any[]> {
    const payload = {
      function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::get_order_history`,
      type_arguments: [],
      arguments: [],
    };

    const response = await this.client.view(payload);
    return response[0];
  }

  /**
   * Calculate order statistics
   */
  async calculateOrderStatistics(): Promise<any> {
    const payload = {
      function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::calculate_order_statistics`,
      type_arguments: [],
      arguments: [],
    };

    const response = await this.client.view(payload);
    return response[0];
  }

  /**
   * Get contract statistics
   */
  async getContractStatistics(): Promise<any> {
    const payload = {
      function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::get_contract_statistics`,
      type_arguments: [],
      arguments: [],
    };

    const response = await this.client.view(payload);
    return response[0];
  }

  /**
   * Check contract health
   */
  async checkContractHealth(): Promise<any> {
    const payload = {
      function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::check_contract_health`,
      type_arguments: [],
      arguments: [],
    };

    const response = await this.client.view(payload);
    return response[0];
  }

  /**
   * Get total orders count
   */
  async getTotalOrders(): Promise<number> {
    const payload = {
      function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::get_total_orders`,
      type_arguments: [],
      arguments: [],
    };

    const response = await this.client.view(payload);
    return parseInt(response[0]);
  }

  // Helper methods for serialization
  private serializeU64(value: number): TransactionArgument {
    return new TransactionArgument.U64(value);
  }

  private serializeU128(value: bigint): TransactionArgument {
    return new TransactionArgument.U128(value);
  }

  private serializeAddress(value: string): TransactionArgument {
    return new TransactionArgument.Address(AccountAddress.fromString(value));
  }

  private serializeBytes(value: Uint8Array): TransactionArgument {
    return new TransactionArgument.U8Vector(value);
  }

  private serializeVectorU64(values: number[]): TransactionArgument {
    const serializer = new Serializer();
    BCS.serializeU32AsUleb128(serializer, values.length);
    values.forEach(value => BCS.serializeU64(serializer, value));
    return new TransactionArgument.U8Vector(serializer.getBytes());
  }

  private serializeVectorU128(values: bigint[]): TransactionArgument {
    const serializer = new Serializer();
    BCS.serializeU32AsUleb128(serializer, values.length);
    values.forEach(value => BCS.serializeU128(serializer, value));
    return new TransactionArgument.U8Vector(serializer.getBytes());
  }

  private serializeVectorAddress(values: string[]): TransactionArgument {
    const serializer = new Serializer();
    BCS.serializeU32AsUleb128(serializer, values.length);
    values.forEach(value => {
      const address = AccountAddress.fromString(value);
      BCS.serializeAccountAddress(serializer, address);
    });
    return new TransactionArgument.U8Vector(serializer.getBytes());
  }

  private serializeVectorBytes(values: Uint8Array[]): TransactionArgument {
    const serializer = new Serializer();
    BCS.serializeU32AsUleb128(serializer, values.length);
    values.forEach(value => BCS.serializeBytes(serializer, value));
    return new TransactionArgument.U8Vector(serializer.getBytes());
  }
}

// Utility functions for common operations
export class AptosFusionSwapUtils {
  /**
   * Create a test order with default parameters
   */
  static createTestOrder(
    srcMint: string = "0x1::aptos_coin::AptosCoin",
    dstMint: string = "0x1::aptos_coin::AptosCoin",
    srcAmount: bigint = BigInt(1000000), // 1 APT
    minDstAmount: bigint = BigInt(950000), // 0.95 APT
    estimatedDstAmount: bigint = BigInt(1000000), // 1 APT
    expirationTime: number = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
  ): CreateOrderParams {
    return {
      src_mint: srcMint,
      dst_mint: dstMint,
      src_amount: srcAmount,
      min_dst_amount: minDstAmount,
      estimated_dst_amount: estimatedDstAmount,
      expiration_time: expirationTime,
      fee: {
        maker_fee: 100, // 0.01%
        taker_fee: 200, // 0.02%
        resolver_fee: 50, // 0.005%
        platform_fee: 25, // 0.0025%
      },
      auction: {
        start_price: BigInt(1000000), // 1 APT
        end_price: BigInt(900000), // 0.9 APT
        start_time: Math.floor(Date.now() / 1000),
        duration: 3600, // 1 hour
        min_fill_amount: BigInt(100000), // 0.1 APT
        max_fill_amount: BigInt(1000000), // 1 APT
      },
      hashlock: {
        hash: new TextEncoder().encode("test_hash_123"),
        finality_lock: 300, // 5 minutes
        exclusive_withdraw: 600, // 10 minutes
        cancellation_timeout: 1800, // 30 minutes
      },
    };
  }

  /**
   * Generate a random hash for testing
   */
  static generateRandomHash(): Uint8Array {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return array;
  }

  /**
   * Convert hex string to Uint8Array
   */
  static hexToBytes(hex: string): Uint8Array {
    return new HexString(hex).toUint8Array();
  }

  /**
   * Convert Uint8Array to hex string
   */
  static bytesToHex(bytes: Uint8Array): string {
    return new HexString(bytes).hex();
  }

  /**
   * Create a test account for development
   */
  static createTestAccount(): AptosAccount {
    return new AptosAccount();
  }

  /**
   * Get test account private key as hex string
   */
  static getTestAccountPrivateKey(account: AptosAccount): string {
    return account.privateKey.toString();
  }
}

// Example usage and testing functions
export async function exampleUsage() {
  // Create a test account
  const testAccount = AptosFusionSwapUtils.createTestAccount();
  const privateKey = AptosFusionSwapUtils.getTestAccountPrivateKey(testAccount);
  
  // Initialize client
  const client = new AptosFusionSwapClient(privateKey, Network.TESTNET);
  
  // Get account info
  const accountInfo = await client.getAccountInfo();
  console.log("Account info:", accountInfo);
  
  // Get balance
  const balance = await client.getBalance();
  console.log("Balance:", balance.toString());
  
  // Create a test order
  const orderParams = AptosFusionSwapUtils.createTestOrder();
  const orderTxHash = await client.createOrder(orderParams);
  console.log("Order created:", orderTxHash);
  
  // Get order details
  const orderDetails = await client.getOrderById(1);
  console.log("Order details:", orderDetails);
  
  // Get contract statistics
  const stats = await client.getContractStatistics();
  console.log("Contract statistics:", stats);
}

// Export for use in tests
export default {
  AptosFusionSwapClient,
  AptosFusionSwapUtils,
  OrderStatus,
  CONTRACT_ADDRESS,
  MODULE_NAME,
  exampleUsage,
}; 