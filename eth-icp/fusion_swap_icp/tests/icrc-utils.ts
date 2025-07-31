import { exec } from 'child_process';
import { promisify } from 'util';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const execAsync = promisify(exec);

export interface Account {
  owner: string;
  subaccount?: string;
}

export interface TransferArg {
  from_subaccount?: string;
  to: Account;
  amount: number;
  fee?: number;
  memo?: string;
  created_at_time?: number;
}

export interface TransferFromArgs {
  spender_subaccount?: string;
  from: Account;
  to: Account;
  amount: number;
  fee?: number;
  memo?: string;
  created_at_time?: number;
}

export interface ApproveArgs {
  fee?: number;
  memo?: string;
  from_subaccount?: string;
  created_at_time?: number;
  amount: number;
  expected_allowance?: number;
  expires_at?: number;
  spender: Account;
}

export interface TransferResult {
  success: boolean;
  blockIndex?: number;
  error?: string;
}

export interface ApproveResult {
  success: boolean;
  blockIndex?: number;
  error?: string;
}

export interface BalanceResult {
  success: boolean;
  balance?: number;
  error?: string;
}

export interface AllowanceResult {
  success: boolean;
  allowance?: number;
  expires_at?: number;
  error?: string;
}

export class ICRCUtils {
  private ledgerCanisterId: string;

  constructor(ledgerCanisterId: string = process.env.ICRC1_CANISTER_ID || 'br5f7-7uaaa-aaaaa-qaaca-cai') {
    this.ledgerCanisterId = ledgerCanisterId;
  }

  /**
   * Get the balance of an account
   * @param account The account to check
   * @returns Promise<BalanceResult>
   */
  async getBalance(account: Account): Promise<BalanceResult> {
    try {
      const subaccount = account.subaccount ? `opt blob "${account.subaccount}"` : 'null';
      const command = `dfx canister call ${this.ledgerCanisterId} icrc1_balance_of '(record { owner = principal "${account.owner}"; subaccount = ${subaccount} })'`;
      
      const result = await execAsync(command);
      const balanceMatch = result.stdout.match(/\((\d+(?:_\d+)*)\s*:\s*nat\)/);
      
      if (balanceMatch) {
        const balance = parseInt(balanceMatch[1].replace(/_/g, ''));
        return {
          success: true,
          balance
        };
      } else {
        return {
          success: false,
          error: 'Failed to parse balance from response'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Transfer tokens using ICRC-1
   * @param from The sender account
   * @param to The recipient account
   * @param amount The amount to transfer
   * @param fee Optional fee
   * @param memo Optional memo
   * @returns Promise<TransferResult>
   */
  async transfer(from: Account, to: Account, amount: number, fee?: number, memo?: string): Promise<TransferResult> {
    try {
      const fromSubaccount = from.subaccount ? `opt blob "${from.subaccount}"` : 'null';
      const toSubaccount = to.subaccount ? `opt blob "${to.subaccount}"` : 'null';
      const feeArg = fee ? `opt (${fee} : nat)` : 'null';
      const memoArg = memo ? `opt blob "${memo}"` : 'null';
      
      const command = `dfx canister call ${this.ledgerCanisterId} icrc1_transfer '(record { from_subaccount = ${fromSubaccount}; to = record { owner = principal "${to.owner}"; subaccount = ${toSubaccount} }; amount = ${amount} : nat; fee = ${feeArg}; memo = ${memoArg}; created_at_time = null })'`;
      
      const result = await execAsync(command);
      
      if (result.stdout.includes('Ok')) {
        const blockMatch = result.stdout.match(/Ok\s*=\s*(\d+)/);
        const blockIndex = blockMatch ? parseInt(blockMatch[1]) : undefined;
        
        return {
          success: true,
          blockIndex
        };
      } else {
        return {
          success: false,
          error: result.stdout
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Transfer tokens using ICRC-2 (approved transfer)
   * @param args TransferFromArgs
   * @returns Promise<TransferResult>
   */
  async transferFrom(args: TransferFromArgs): Promise<TransferResult> {
    try {
      const spenderSubaccount = args.spender_subaccount ? `opt blob "${args.spender_subaccount}"` : 'null';
      const fromSubaccount = args.from.subaccount ? `opt blob "${args.from.subaccount}"` : 'null';
      const toSubaccount = args.to.subaccount ? `opt blob "${args.to.subaccount}"` : 'null';
      const feeArg = args.fee ? `opt (${args.fee} : nat)` : 'null';
      const memoArg = args.memo ? `opt blob "${args.memo}"` : 'null';
      
      const command = `dfx canister call ${this.ledgerCanisterId} icrc2_transfer_from '(record { spender_subaccount = ${spenderSubaccount}; from = record { owner = principal "${args.from.owner}"; subaccount = ${fromSubaccount} }; to = record { owner = principal "${args.to.owner}"; subaccount = ${toSubaccount} }; amount = ${args.amount} : nat; fee = ${feeArg}; memo = ${memoArg}; created_at_time = null })'`;
      
      const result = await execAsync(command);
      
      if (result.stdout.includes('Ok')) {
        const blockMatch = result.stdout.match(/Ok\s*=\s*(\d+)/);
        const blockIndex = blockMatch ? parseInt(blockMatch[1]) : undefined;
        
        return {
          success: true,
          blockIndex
        };
      } else {
        return {
          success: false,
          error: result.stdout
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Approve tokens for a spender (ICRC-2)
   * @param args ApproveArgs
   * @returns Promise<ApproveResult>
   */
  async approve(args: ApproveArgs): Promise<ApproveResult> {
    try {
      const feeArg = args.fee ? `${args.fee} : nat` : 'null';
      const memoArg = args.memo ? `opt blob "${args.memo}"` : 'null';
      const fromSubaccount = args.from_subaccount ? `opt blob "${args.from_subaccount}"` : 'null';
      const expectedAllowance = args.expected_allowance ? `${args.expected_allowance} : nat` : 'null';
      const expiresAt = args.expires_at ? `${args.expires_at} : nat64` : 'null';
      const spenderSubaccount = args.spender.subaccount ? `opt blob "${args.spender.subaccount}"` : 'null';
      
      const command = `dfx canister call ${this.ledgerCanisterId} icrc2_approve '(record { fee = ${feeArg}; memo = ${memoArg}; from_subaccount = ${fromSubaccount}; created_at_time = null; amount = ${args.amount} : nat; expected_allowance = ${expectedAllowance}; expires_at = ${expiresAt}; spender = record { owner = principal "${args.spender.owner}"; subaccount = ${spenderSubaccount} })'`;
      
      const result = await execAsync(command);
      
      if (result.stdout.includes('Ok')) {
        const blockMatch = result.stdout.match(/Ok\s*=\s*(\d+)/);
        const blockIndex = blockMatch ? parseInt(blockMatch[1]) : undefined;
        
        return {
          success: true,
          blockIndex
        };
      } else {
        return {
          success: false,
          error: result.stdout
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get allowance for a spender
   * @param from The account giving allowance
   * @param spender The spender account
   * @returns Promise<AllowanceResult>
   */
  async getAllowance(from: Account, spender: Account): Promise<AllowanceResult> {
    try {
      const fromSubaccount = from.subaccount ? `opt blob "${from.subaccount}"` : 'null';
      const spenderSubaccount = spender.subaccount ? `opt blob "${spender.subaccount}"` : 'null';
      
      const command = `dfx canister call ${this.ledgerCanisterId} icrc2_allowance '(record { account = record { owner = principal "${from.owner}"; subaccount = ${fromSubaccount} }; spender = record { owner = principal "${spender.owner}"; subaccount = ${spenderSubaccount} })'`;
      
      const result = await execAsync(command);
      
      if (result.stdout.includes('allowance')) {
        const allowanceMatch = result.stdout.match(/allowance\s*=\s*(\d+(?:_\d+)*)/);
        const expiresMatch = result.stdout.match(/expires_at\s*=\s*(\d+(?:_\d+)*)/);
        
        const allowance = allowanceMatch ? parseInt(allowanceMatch[1].replace(/_/g, '')) : undefined;
        const expires_at = expiresMatch ? parseInt(expiresMatch[1].replace(/_/g, '')) : undefined;
        
        return {
          success: true,
          allowance,
          expires_at
        };
      } else {
        return {
          success: false,
          error: result.stdout
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get token metadata
   * @returns Promise<any>
   */
  async getMetadata(): Promise<any> {
    try {
      const commands = [
        `dfx canister call ${this.ledgerCanisterId} icrc1_name`,
        `dfx canister call ${this.ledgerCanisterId} icrc1_symbol`,
        `dfx canister call ${this.ledgerCanisterId} icrc1_decimals`,
        `dfx canister call ${this.ledgerCanisterId} icrc1_fee`,
        `dfx canister call ${this.ledgerCanisterId} icrc1_total_supply`
      ];

      const results = await Promise.all(commands.map(cmd => execAsync(cmd)));
      
      return {
        success: true,
        name: results[0].stdout.match(/"([^"]+)"/)?.[1],
        symbol: results[1].stdout.match(/"([^"]+)"/)?.[1],
        decimals: parseInt(results[2].stdout.match(/\((\d+)\s*:\s*nat8\)/)?.[1] || '0'),
        fee: parseInt(results[3].stdout.match(/\((\d+(?:_\d+)*)\s*:\s*nat\)/)?.[1].replace(/_/g, '') || '0'),
        totalSupply: parseInt(results[4].stdout.match(/\((\d+(?:_\d+)*)\s*:\s*nat\)/)?.[1].replace(/_/g, '') || '0')
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Check if an account has sufficient balance
   * @param account The account to check
   * @param amount The required amount
   * @returns Promise<boolean>
   */
  async hasSufficientBalance(account: Account, amount: number): Promise<boolean> {
    const balanceResult = await this.getBalance(account);
    if (!balanceResult.success || balanceResult.balance === undefined) {
      return false;
    }
    return balanceResult.balance >= amount;
  }

  /**
   * Check if a spender has sufficient allowance
   * @param from The account giving allowance
   * @param spender The spender account
   * @param amount The required amount
   * @returns Promise<boolean>
   */
  async hasSufficientAllowance(from: Account, spender: Account, amount: number): Promise<boolean> {
    const allowanceResult = await this.getAllowance(from, spender);
    if (!allowanceResult.success || allowanceResult.allowance === undefined) {
      return false;
    }
    return allowanceResult.allowance >= amount;
  }

  /**
   * Transfer tokens with automatic approval if needed
   * @param from The sender account
   * @param to The recipient account
   * @param amount The amount to transfer
   * @param spender The spender (usually the contract)
   * @param fee Optional fee
   * @returns Promise<TransferResult>
   */
  async transferWithApproval(from: Account, to: Account, amount: number, spender: Account, fee?: number): Promise<TransferResult> {
    try {
      // Check if approval is needed
      const hasAllowance = await this.hasSufficientAllowance(from, spender, amount);
      
      if (!hasAllowance) {
        // Approve tokens first
        const approveResult = await this.approve({
          amount: amount + (fee || 0),
          spender,
          fee: fee
        });
        
        if (!approveResult.success) {
          return {
            success: false,
            error: `Approval failed: ${approveResult.error}`
          };
        }
      }
      
      // Perform the transfer
      return await this.transferFrom({
        from,
        to,
        amount,
        fee
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Batch transfer multiple amounts to multiple recipients
   * @param from The sender account
   * @param transfers Array of {to, amount} transfers
   * @param fee Optional fee per transfer
   * @returns Promise<TransferResult[]>
   */
  async batchTransfer(from: Account, transfers: Array<{to: Account, amount: number}>, fee?: number): Promise<TransferResult[]> {
    const results: TransferResult[] = [];
    
    for (const transfer of transfers) {
      const result = await this.transfer(from, transfer.to, transfer.amount, fee);
      results.push(result);
      
      // Add small delay between transfers to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }

  /**
   * Get transaction history for an account
   * @param account The account to get history for
   * @param start Starting transaction index
   * @param length Number of transactions to fetch
   * @returns Promise<any>
   */
  async getTransactionHistory(account: Account, start: number = 0, length: number = 10): Promise<any> {
    try {
      const command = `dfx canister call ${this.ledgerCanisterId} get_transactions '(record { start = ${start} : nat; length = ${length} : nat })'`;
      
      const result = await execAsync(command);
      return {
        success: true,
        data: result.stdout
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Create a subaccount from a principal and subaccount number
   * @param principal The principal
   * @param subaccountNumber The subaccount number
   * @returns string The subaccount blob
   */
  static createSubaccount(principal: string, subaccountNumber: number): string {
    // This is a simplified implementation
    // In a real implementation, you'd need to properly encode the subaccount
    return subaccountNumber.toString(16).padStart(32, '0');
  }

  /**
   * Format amount with decimals
   * @param amount The raw amount
   * @param decimals The number of decimals
   * @returns string The formatted amount
   */
  static formatAmount(amount: number, decimals: number = 8): string {
    const divisor = Math.pow(10, decimals);
    const whole = Math.floor(amount / divisor);
    const fraction = amount % divisor;
    const fractionStr = fraction.toString().padStart(decimals, '0');
    return `${whole}.${fractionStr}`;
  }

  /**
   * Parse amount from formatted string
   * @param formattedAmount The formatted amount string
   * @param decimals The number of decimals
   * @returns number The raw amount
   */
  static parseAmount(formattedAmount: string, decimals: number = 8): number {
    const parts = formattedAmount.split('.');
    const whole = parseInt(parts[0] || '0');
    const fraction = parts[1] ? parseInt(parts[1].padEnd(decimals, '0')) : 0;
    return whole * Math.pow(10, decimals) + fraction;
  }
}

// Export a singleton instance with default ledger
export const icrcUtils = new ICRCUtils();

// Export utility functions
export const ICRCUtilsStatic = {
  createSubaccount: ICRCUtils.createSubaccount,
  formatAmount: ICRCUtils.formatAmount,
  parseAmount: ICRCUtils.parseAmount
}; 