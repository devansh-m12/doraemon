import { exec } from 'child_process';
import { promisify } from 'util';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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
  hashlock: {
    secret_hash: number[];
    revealed: boolean;
    reveal_time: number | null;
  };
  timelock: {
    finality_lock_duration: number;
    exclusive_withdraw_duration: number;
    cancellation_timeout: number;
    created_at: number;
  };
  status: 'Announced' | 'Active' | 'Completed' | 'Cancelled' | 'Failed';
  created_at: number;
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
    this.fusionSwapCanisterId = process.env.FUSION_SWAP_CANISTER_ID || 'bkyz2-fmaaa-aaaaa-qaaaq-cai';
    this.icrc1CanisterId = process.env.ICRC1_CANISTER_ID || 'br5f7-7uaaa-aaaaa-qaaca-cai';
  }

  /**
   * Creates an order using dfx terminal commands
   * @param orderConfig The order configuration
   * @param identity The dfx identity to use (e.g., 'test-maker', 'test-taker')
   * @returns Promise<CreateOrderResult>
   */
  async createOrderWithDfx(orderConfig: OrderConfig, identity: string): Promise<CreateOrderResult> {
    try {
      // Validate input parameters
      if (!orderConfig || !identity) {
        return {
          success: false,
          error: 'Invalid input parameters: orderConfig and identity are required'
        };
      }

      // Switch to the specified identity
      console.log(`Switching to identity: ${identity}`);
      await execAsync(`dfx identity use ${identity}`);
      
      // Get the actual principal for the identity
      const makerPrincipal = this.getMakerPrincipal(identity);
      
      // Check if identity has balance
      const balanceCheck = await execAsync(`dfx canister call ${this.icrc1CanisterId} icrc1_balance_of '(record { owner = principal "${makerPrincipal}"; subaccount = null })'`);
      console.log(`Balance check result: ${balanceCheck.stdout}`);

      // Approve tokens for the contract if needed
      console.log('Approving tokens for contract...');
      const approveResult = await execAsync(`dfx canister call ${this.icrc1CanisterId} icrc2_approve '(record { from_subaccount = null; spender = record { owner = principal "${this.fusionSwapCanisterId}"; subaccount = null }; amount = ${orderConfig.src_amount + 10000000} : nat; expires_at = null })'`);
      console.log(`Approve result: ${approveResult.stdout}`);

      // Create the order using dfx
      console.log(`Creating order with ID: ${orderConfig.id}`);
      const secretHashArray = orderConfig.hashlock.secret_hash.join('; ');
      const createOrderCommand = `dfx canister call ${this.fusionSwapCanisterId} create_order '(record { id = ${orderConfig.id} : nat64; src_mint = principal "${orderConfig.src_mint}"; dst_mint = principal "${orderConfig.dst_mint}"; maker = principal "${makerPrincipal}"; src_amount = ${orderConfig.src_amount} : nat; min_dst_amount = ${orderConfig.min_dst_amount} : nat; estimated_dst_amount = ${orderConfig.estimated_dst_amount} : nat; expiration_time = ${orderConfig.expiration_time} : nat64; fee = record { protocol_fee_bps = ${orderConfig.fee.protocol_fee_bps} : nat16; integrator_fee_bps = ${orderConfig.fee.integrator_fee_bps} : nat16; surplus_bps = ${orderConfig.fee.surplus_bps} : nat8; max_cancel_premium = ${orderConfig.fee.max_cancel_premium} : nat }; auction = record { start_time = ${orderConfig.auction.start_time} : nat64; end_time = ${orderConfig.auction.end_time} : nat64; start_price = ${orderConfig.auction.start_price} : nat; end_price = ${orderConfig.auction.end_price} : nat; current_price = ${orderConfig.auction.current_price} : nat }; cancellation_auction_secs = ${orderConfig.cancellation_auction_secs} : nat32; hashlock = record { secret_hash = vec { ${secretHashArray} } : vec nat8; revealed = ${orderConfig.hashlock.revealed}; reveal_time = ${orderConfig.hashlock.reveal_time === null ? 'null' : orderConfig.hashlock.reveal_time} : opt nat64 }; timelock = record { finality_lock_duration = ${orderConfig.timelock.finality_lock_duration} : nat64; exclusive_withdraw_duration = ${orderConfig.timelock.exclusive_withdraw_duration} : nat64; cancellation_timeout = ${orderConfig.timelock.cancellation_timeout} : nat64; created_at = ${orderConfig.timelock.created_at} : nat64 }; status = variant { ${orderConfig.status} }; created_at = ${orderConfig.created_at} : nat64 })'`;

      const createResult = await execAsync(createOrderCommand);
      console.log(`Order creation result: ${createResult.stdout}`);

      // Check if the result indicates success or failure
      if (createResult.stdout.includes('Ok')) {
        // Verify the order was created
        console.log('Verifying order creation...');
        const verifyResult = await execAsync(`dfx canister call ${this.fusionSwapCanisterId} get_order '(${orderConfig.id} : nat64)'`);
        console.log(`Verification result: ${verifyResult.stdout}`);

        return {
          success: true,
          orderId: orderConfig.id,
          transactionId: createResult.stdout
        };
      } else {
        return {
          success: false,
          error: createResult.stdout,
          orderId: orderConfig.id
        };
      }

    } catch (error) {
      console.error('Error creating order:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        orderId: orderConfig.id
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
      dst_mint: this.fusionSwapCanisterId,
      maker: this.getMakerPrincipal(identity),
      src_amount: 1000000000, // 1 billion tokens
      min_dst_amount: 900000000, // 900 million tokens
      estimated_dst_amount: 1000000000, // 1 billion tokens
      expiration_time: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      fee: {
        protocol_fee_bps: 30,
        integrator_fee_bps: 20,
        surplus_bps: 10,
        max_cancel_premium: 100000000
      },
      auction: {
        start_time: Math.floor(Date.now() / 1000),
        end_time: Math.floor(Date.now() / 1000) + 3600,
        start_price: 1000000000,
        end_price: 900000000,
        current_price: 1000000000
      },
      cancellation_auction_secs: 3600,
      hashlock: {
        secret_hash: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        revealed: false,
        reveal_time: null
      },
      timelock: {
        finality_lock_duration: 0,
        exclusive_withdraw_duration: 0,
        cancellation_timeout: 0,
        created_at: 0
      },
      status: 'Announced',
      created_at: 0
    };

    return this.createOrderWithDfx(testOrderConfig, identity);
  }

  /**
   * Gets the maker principal based on identity
   * @param identity The dfx identity name
   * @returns The principal string
   */
  public getMakerPrincipal(identity: string): string {
    const principals: { [key: string]: string } = {
      'test-maker': process.env.TEST_MAKER_PRINCIPAL || 'cjobn-a4566-qzwux-yg5b5-z2vqh-huolu-nhxd6-6xrto-zunsj-zuwdd-qae',
      'test-taker': process.env.TEST_TAKER_PRINCIPAL || 'fhrni-ukyxj-tns4p-l7f32-txwvg-anu57-55dcm-gzhue-22yg2-qokvv-mqe',
      'default': process.env.DEFAULT_PRINCIPAL || 'vz5cd-iuzeq-n2hg6-kzzzy-4dj3b-pcg4o-puhec-2irm3-wb677-6dl5i-zqe'
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
   * Gets a specific order by ID
   * @param orderId The order ID to get
   * @returns Promise<OrderConfig | null>
   */
  async getOrder(orderId: number): Promise<OrderConfig | null> {
    try {
      const result = await execAsync(`dfx canister call ${this.fusionSwapCanisterId} get_order '(${orderId} : nat64)'`);
      const orderData = result.stdout.trim();
      
      if (orderData === '(null)' || orderData === '[]') {
        return null;
      }
      
      console.log(`Order data: ${orderData}`);
      
      // Parse the Candid output to extract order information
      // This is a simplified parser that extracts key values from the Candid format
      const parseCandidValue = (data: string, fieldName: string): any => {
        const regex = new RegExp(`${fieldName}\\s*=\\s*([^;]+)`, 'i');
        const match = data.match(regex);
        if (match) {
          const value = match[1].trim();
          // Parse different types
          if (value.includes('principal')) {
            return value.match(/principal\s+"([^"]+)"/)?.[1] || '';
          } else if (value.includes(':')) {
            return parseInt(value.split(':')[0].trim().replace(/_/g, ''));
          } else if (value === 'true' || value === 'false') {
            return value === 'true';
          } else if (value.includes('blob')) {
            // Parse blob as array of numbers
            const blobMatch = value.match(/blob\s+"([^"]+)"/);
            if (blobMatch) {
              const blobStr = blobMatch[1];
              return Array.from(blobStr).map(char => char.charCodeAt(0));
            }
            return [];
          } else if (value.includes('variant')) {
            const variantMatch = value.match(/variant\s*{\s*([^}]+)\s*}/);
            return variantMatch ? variantMatch[1].trim() : '';
          }
          return value;
        }
        return null;
      };
      
      // Extract order fields
      const src_amount = parseCandidValue(orderData, 'src_amount') || 0;
      const min_dst_amount = parseCandidValue(orderData, 'min_dst_amount') || 0;
      const estimated_dst_amount = parseCandidValue(orderData, 'estimated_dst_amount') || 0;
      const expiration_time = parseCandidValue(orderData, 'expiration_time') || 0;
      const created_at = parseCandidValue(orderData, 'created_at') || 0;
      const cancellation_auction_secs = parseCandidValue(orderData, 'cancellation_auction_secs') || 0;
      const src_mint = parseCandidValue(orderData, 'src_mint') || '';
      const dst_mint = parseCandidValue(orderData, 'dst_mint') || '';
      const maker = parseCandidValue(orderData, 'maker') || '';
      const status = parseCandidValue(orderData, 'status') || 'Announced';
      
      // Parse fee structure
      const protocol_fee_bps = parseCandidValue(orderData, 'protocol_fee_bps') || 0;
      const integrator_fee_bps = parseCandidValue(orderData, 'integrator_fee_bps') || 0;
      const surplus_bps = parseCandidValue(orderData, 'surplus_bps') || 0;
      const max_cancel_premium = parseCandidValue(orderData, 'max_cancel_premium') || 0;
      
      // Parse auction structure
      const auction_start_time = parseCandidValue(orderData, 'start_time') || 0;
      const auction_end_time = parseCandidValue(orderData, 'end_time') || 0;
      const auction_start_price = parseCandidValue(orderData, 'start_price') || 0;
      const auction_end_price = parseCandidValue(orderData, 'end_price') || 0;
      const auction_current_price = parseCandidValue(orderData, 'current_price') || 0;
      
      // Parse hashlock structure
      const secret_hash = parseCandidValue(orderData, 'secret_hash') || [];
      const revealed = parseCandidValue(orderData, 'revealed') || false;
      const reveal_time = parseCandidValue(orderData, 'reveal_time') || null;
      
      // Parse timelock structure
      const finality_lock_duration = parseCandidValue(orderData, 'finality_lock_duration') || 0;
      const exclusive_withdraw_duration = parseCandidValue(orderData, 'exclusive_withdraw_duration') || 0;
      const cancellation_timeout = parseCandidValue(orderData, 'cancellation_timeout') || 0;
      const timelock_created_at = parseCandidValue(orderData, 'created_at') || 0;
      
      return {
        id: orderId,
        src_mint,
        dst_mint,
        maker,
        src_amount,
        min_dst_amount,
        estimated_dst_amount,
        expiration_time,
        fee: {
          protocol_fee_bps,
          integrator_fee_bps,
          surplus_bps,
          max_cancel_premium
        },
        auction: {
          start_time: auction_start_time,
          end_time: auction_end_time,
          start_price: auction_start_price,
          end_price: auction_end_price,
          current_price: auction_current_price
        },
        cancellation_auction_secs,
        hashlock: {
          secret_hash,
          revealed,
          reveal_time
        },
        timelock: {
          finality_lock_duration,
          exclusive_withdraw_duration,
          cancellation_timeout,
          created_at: timelock_created_at
        },
        status: status as 'Announced' | 'Active' | 'Completed' | 'Cancelled' | 'Failed',
        created_at
      };
    } catch (error) {
      console.error('Error getting order:', error);
      return null;
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
      const fillOrderCommand = `dfx canister call ${this.fusionSwapCanisterId} fill_order '(${orderId} : nat64, ${amount} : nat, null : opt vec nat8)'`;

      const fillResult = await execAsync(fillOrderCommand);
      console.log(`Fill order result: ${fillResult.stdout}`);

      // Check if the result indicates success or failure
      if (fillResult.stdout.includes('Ok')) {
        // For fill orders, we don't need to verify immediately as the order might still exist for partial fills
        console.log('Fill order command executed successfully');
        
        return {
          success: true,
          orderId: orderId,
          transactionId: fillResult.stdout
        };
      } else {
        return {
          success: false,
          error: fillResult.stdout,
          orderId: orderId
        };
      }

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