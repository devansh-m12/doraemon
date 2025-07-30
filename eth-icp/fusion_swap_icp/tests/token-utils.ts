import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface OrderConfig {
  id: number;
  src_mint: string;
  dst_mint: string;
  maker: string;
  src_amount: number;
  min_dst_amount: number;
  estimated_dst_amount: number;
  expiration_time: number;
  fee: {
    protocol_fee_bps: number;
    integrator_fee_bps: number;
    surplus_bps: number;
    max_cancel_premium: number;
  };
  auction: {
    start_time: number;
    end_time: number;
    start_price: number;
    end_price: number;
    current_price: number;
  };
  cancellation_auction_secs: number;
}

export interface CreateOrderResult {
  success: boolean;
  orderId?: number;
  error?: string;
  transactionId?: string;
}

export interface FillOrderResult {
  success: boolean;
  orderId?: number;
  error?: string;
  transactionId?: string;
}

export class TokenUtils {
  private fusionSwapCanisterId: string;
  private icrc1CanisterId: string;

  constructor() {
    this.fusionSwapCanisterId = 'br5f7-7uaaa-aaaaa-qaaca-cai';
    this.icrc1CanisterId = 'b77ix-eeaaa-aaaaa-qaada-cai';
  }

  /**
   * Creates an order using dfx terminal commands
   * @param orderConfig The order configuration
   * @param identity The dfx identity to use (e.g., 'test-maker', 'test-taker')
   * @returns Promise<CreateOrderResult>
   */
  async createOrderWithDfx(orderConfig: OrderConfig, identity: string): Promise<CreateOrderResult> {
    try {
      // Switch to the specified identity
      console.log(`Switching to identity: ${identity}`);
      await execAsync(`dfx identity use ${identity}`);
      
      // Check if identity has balance
      const balanceCheck = await execAsync(`dfx canister call ${this.icrc1CanisterId} icrc1_balance_of '(record { owner = principal "${orderConfig.maker}"; subaccount = null })'`);
      console.log(`Balance check result: ${balanceCheck.stdout}`);

      // Approve tokens for the contract if needed
      console.log('Approving tokens for contract...');
      const approveResult = await execAsync(`dfx canister call ${this.icrc1CanisterId} icrc2_approve '(record { from_subaccount = null; spender = record { owner = principal "${this.fusionSwapCanisterId}"; subaccount = null }; amount = ${orderConfig.src_amount + 10000000} : nat; expires_at = null })'`);
      console.log(`Approve result: ${approveResult.stdout}`);

      // Create the order using dfx
      console.log(`Creating order with ID: ${orderConfig.id}`);
      const createOrderCommand = `dfx canister call ${this.fusionSwapCanisterId} create_order '(record { id = ${orderConfig.id} : nat64; src_mint = principal "${orderConfig.src_mint}"; dst_mint = principal "${orderConfig.dst_mint}"; maker = principal "${orderConfig.maker}"; src_amount = ${orderConfig.src_amount} : nat; min_dst_amount = ${orderConfig.min_dst_amount} : nat; estimated_dst_amount = ${orderConfig.estimated_dst_amount} : nat; expiration_time = ${orderConfig.expiration_time} : nat64; fee = record { protocol_fee_bps = ${orderConfig.fee.protocol_fee_bps} : nat16; integrator_fee_bps = ${orderConfig.fee.integrator_fee_bps} : nat16; surplus_bps = ${orderConfig.fee.surplus_bps} : nat8; max_cancel_premium = ${orderConfig.fee.max_cancel_premium} : nat }; auction = record { start_time = ${orderConfig.auction.start_time} : nat64; end_time = ${orderConfig.auction.end_time} : nat64; start_price = ${orderConfig.auction.start_price} : nat; end_price = ${orderConfig.auction.end_price} : nat; current_price = ${orderConfig.auction.current_price} : nat }; cancellation_auction_secs = ${orderConfig.cancellation_auction_secs} : nat32 })'`;

      const createResult = await execAsync(createOrderCommand);
      console.log(`Order creation result: ${createResult.stdout}`);

      // Verify the order was created
      console.log('Verifying order creation...');
      const verifyResult = await execAsync(`dfx canister call ${this.fusionSwapCanisterId} get_order '(${orderConfig.id} : nat64)'`);
      console.log(`Verification result: ${verifyResult.stdout}`);

      return {
        success: true,
        orderId: orderConfig.id,
        transactionId: createResult.stdout
      };

    } catch (error) {
      console.error('Error creating order:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Creates a test order with default parameters
   * @param orderId The order ID to use
   * @param identity The dfx identity to use
   * @returns Promise<CreateOrderResult>
   */
  async createTestOrder(orderId: number, identity: string): Promise<CreateOrderResult> {
    const testOrderConfig: OrderConfig = {
      id: orderId,
      src_mint: this.icrc1CanisterId,
      dst_mint: this.icrc1CanisterId,
      maker: this.getMakerPrincipal(identity),
      src_amount: 1000000000, // 1 billion tokens
      min_dst_amount: 900000000, // 900 million tokens
      estimated_dst_amount: 1000000000, // 1 billion tokens
      expiration_time: 1735689600, // January 1, 2025
      fee: {
        protocol_fee_bps: 30,
        integrator_fee_bps: 20,
        surplus_bps: 10,
        max_cancel_premium: 100000000
      },
      auction: {
        start_time: 1735689600,
        end_time: 1735776000,
        start_price: 1000000000,
        end_price: 900000000,
        current_price: 1000000000
      },
      cancellation_auction_secs: 3600
    };

    return this.createOrderWithDfx(testOrderConfig, identity);
  }

  /**
   * Gets the maker principal based on identity
   * @param identity The dfx identity name
   * @returns The principal string
   */
  private getMakerPrincipal(identity: string): string {
    const principals: { [key: string]: string } = {
      'test-maker': 'cjobn-a4566-qzwux-yg5b5-z2vqh-huolu-nhxd6-6xrto-zunsj-zuwdd-qae',
      'test-taker': 'fhrni-ukyxj-tns4p-l7f32-txwvg-anu57-55dcm-gzhue-22yg2-qokvv-mqe',
      'default': 'vz5cd-iuzeq-n2hg6-kzzzy-4dj3b-pcg4o-puhec-2irm3-wb677-6dl5i-zqe'
    };

    return principals[identity] || principals['default'];
  }

  /**
   * Verifies an order exists
   * @param orderId The order ID to verify
   * @returns Promise<boolean>
   */
  async verifyOrder(orderId: number): Promise<boolean> {
    try {
      const result = await execAsync(`dfx canister call ${this.fusionSwapCanisterId} get_order '(${orderId} : nat64)'`);
      const orderData = result.stdout.trim();
      return orderData !== '(null)' && orderData !== '[]';
    } catch (error) {
      console.error('Error verifying order:', error);
      return false;
    }
  }

  /**
   * Gets all orders
   * @returns Promise<string>
   */
  async getAllOrders(): Promise<string> {
    try {
      const result = await execAsync(`dfx canister call ${this.fusionSwapCanisterId} get_all_orders`);
      return result.stdout;
    } catch (error) {
      console.error('Error getting all orders:', error);
      return '';
    }
  }

  /**
   * Gets orders by maker
   * @param makerPrincipal The maker principal
   * @returns Promise<string>
   */
  async getOrdersByMaker(makerPrincipal: string): Promise<string> {
    try {
      const result = await execAsync(`dfx canister call ${this.fusionSwapCanisterId} get_orders_by_maker '(principal "${makerPrincipal}")'`);
      return result.stdout;
    } catch (error) {
      console.error('Error getting orders by maker:', error);
      return '';
    }
  }

  /**
   * Transfers tokens to an account
   * @param fromIdentity The identity to transfer from
   * @param toPrincipal The recipient principal
   * @param amount The amount to transfer
   * @returns Promise<boolean>
   */
  async transferTokens(fromIdentity: string, toPrincipal: string, amount: number): Promise<boolean> {
    try {
      // Switch to the from identity
      await execAsync(`dfx identity use ${fromIdentity}`);
      
      // Get the from principal
      const fromPrincipalResult = await execAsync('dfx identity get-principal');
      const fromPrincipal = fromPrincipalResult.stdout.trim();

      // Transfer tokens
      const transferCommand = `dfx canister call ${this.icrc1CanisterId} icrc1_transfer '(record { from = record { owner = principal "${fromPrincipal}"; subaccount = null }; to = record { owner = principal "${toPrincipal}"; subaccount = null }; amount = ${amount} : nat; fee = null; memo = null; created_at_time = null })'`;
      
      const result = await execAsync(transferCommand);
      console.log(`Transfer result: ${result.stdout}`);
      
      return result.stdout.includes('Ok');
    } catch (error) {
      console.error('Error transferring tokens:', error);
      return false;
    }
  }

  /**
   * Fills an order using dfx terminal commands
   * @param orderId The order ID to fill
   * @param amount The amount to fill
   * @param identity The dfx identity to use (e.g., 'test-taker')
   * @returns Promise<FillOrderResult>
   */
  async fillOrderWithDfx(orderId: number, amount: number, identity: string): Promise<FillOrderResult> {
    try {
      // Switch to the specified identity
      console.log(`Switching to identity: ${identity}`);
      await execAsync(`dfx identity use ${identity}`);
      
      // Check if identity has balance
      const takerPrincipal = this.getMakerPrincipal(identity);
      const balanceCheck = await execAsync(`dfx canister call ${this.icrc1CanisterId} icrc1_balance_of '(record { owner = principal "${takerPrincipal}"; subaccount = null })'`);
      console.log(`Balance check result: ${balanceCheck.stdout}`);

      // Approve tokens for the contract if needed
      console.log('Approving tokens for contract...');
      const approveResult = await execAsync(`dfx canister call ${this.icrc1CanisterId} icrc2_approve '(record { from_subaccount = null; spender = record { owner = principal "${this.fusionSwapCanisterId}"; subaccount = null }; amount = ${amount + 10000000} : nat; expires_at = null })'`);
      console.log(`Approve result: ${approveResult.stdout}`);

      // Fill the order using dfx
      console.log(`Filling order ${orderId} with amount ${amount}...`);
      const fillOrderCommand = `dfx canister call ${this.fusionSwapCanisterId} fill_order '(${orderId}, ${amount})'`;

      const fillResult = await execAsync(fillOrderCommand);
      console.log(`Fill order result: ${fillResult.stdout}`);

      // Verify the order was filled by checking if it still exists
      console.log('Verifying order fill...');
      const verifyResult = await execAsync(`dfx canister call ${this.fusionSwapCanisterId} get_order '(${orderId} : nat64)'`);
      console.log(`Verification result: ${verifyResult.stdout}`);

      return {
        success: true,
        orderId: orderId,
        transactionId: fillResult.stdout
      };

    } catch (error) {
      console.error('Error filling order:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Approves tokens for a spender
   * @param identity The identity to approve from
   * @param spenderPrincipal The spender principal
   * @param amount The amount to approve
   * @returns Promise<boolean>
   */
  async approveTokens(identity: string, spenderPrincipal: string, amount: number): Promise<boolean> {
    try {
      // Switch to the identity
      await execAsync(`dfx identity use ${identity}`);
      
      // Approve tokens
      const approveCommand = `dfx canister call ${this.icrc1CanisterId} icrc2_approve '(record { from_subaccount = null; spender = record { owner = principal "${spenderPrincipal}"; subaccount = null }; amount = ${amount} : nat; expires_at = null })'`;
      
      const result = await execAsync(approveCommand);
      console.log(`Approve result: ${result.stdout}`);
      
      return result.stdout.includes('Ok');
    } catch (error) {
      console.error('Error approving tokens:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const tokenUtils = new TokenUtils();
