import { Actor, HttpAgent } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { Principal } from '@dfinity/principal';
import { idlFactory as icrc1LedgerIdlFactory } from '../src/declarations/icrc1_ledger_canister';

// Load environment variables
require('dotenv').config();

export interface TokenTransferResult {
  success: boolean;
  transactionId?: bigint;
  error?: string;
}

export interface TokenBalance {
  owner: string;
  balance: bigint;
}

export class TokenUtils {
  private icrc1LedgerActor: any;
  private agent: HttpAgent;

  constructor() {
    this.agent = new HttpAgent({
      host: process.env.TEST_HOST || 'http://127.0.0.1:4943',
    });
    
    // Disable certificate verification for local testing
    this.agent.fetchRootKey = () => Promise.resolve(new ArrayBuffer(0));
    
    const canisterId = process.env.CANISTER_ID_ICRC1_LEDGER_CANISTER!;
    this.icrc1LedgerActor = Actor.createActor(icrc1LedgerIdlFactory, {
      agent: this.agent,
      canisterId,
    });
  }

  /**
   * Get token information
   */
  async getTokenInfo() {
    const [name, symbol, totalSupply, fee, decimals] = await Promise.all([
      this.icrc1LedgerActor.icrc1_name(),
      this.icrc1LedgerActor.icrc1_symbol(),
      this.icrc1LedgerActor.icrc1_total_supply(),
      this.icrc1LedgerActor.icrc1_fee(),
      this.icrc1LedgerActor.icrc1_decimals(),
    ]);

    return {
      name,
      symbol,
      totalSupply,
      fee,
      decimals,
    };
  }

  /**
   * Get balance for a specific account
   */
  async getBalance(owner: string): Promise<bigint> {
    const balance = await this.icrc1LedgerActor.icrc1_balance_of({
      owner: Principal.fromText(owner),
      subaccount: []
    });
    return balance;
  }

  /**
   * Transfer tokens from one account to another
   */
  async transferTokens(
    from: string,
    to: string,
    amount: bigint,
    fee?: bigint
  ): Promise<TokenTransferResult> {
    try {
      const transferResult = await this.icrc1LedgerActor.icrc1_transfer({
        from_subaccount: [],
        to: {
          owner: Principal.fromText(to),
          subaccount: []
        },
        amount,
        fee: fee ? [fee] : [],
        memo: [],
        created_at_time: []
      });

      if ('Ok' in transferResult) {
        return {
          success: true,
          transactionId: transferResult.Ok,
        };
      } else {
        return {
          success: false,
          error: JSON.stringify(transferResult.Err),
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Approve tokens for transfer_from operations
   */
  async approveTokens(
    owner: string,
    spender: string,
    amount: bigint,
    fee?: bigint
  ): Promise<TokenTransferResult> {
    try {
      const approveResult = await this.icrc1LedgerActor.icrc2_approve({
        from_subaccount: [],
        spender: {
          owner: Principal.fromText(spender),
          subaccount: []
        },
        amount,
        expires_at: [],
        fee: fee ? [fee] : [],
        memo: [],
        created_at_time: []
      });

      if ('Ok' in approveResult) {
        return {
          success: true,
          transactionId: approveResult.Ok,
        };
      } else {
        return {
          success: false,
          error: JSON.stringify(approveResult.Err),
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Transfer tokens using approve/transfer_from pattern
   */
  async transferFromTokens(
    spender: string,
    from: string,
    to: string,
    amount: bigint,
    fee?: bigint
  ): Promise<TokenTransferResult> {
    try {
      const transferFromResult = await this.icrc1LedgerActor.icrc2_transfer_from({
        spender_subaccount: [],
        from: {
          owner: Principal.fromText(from),
          subaccount: []
        },
        to: {
          owner: Principal.fromText(to),
          subaccount: []
        },
        amount,
        fee: fee ? [fee] : [],
        memo: [],
        created_at_time: []
      });

      if ('Ok' in transferFromResult) {
        return {
          success: true,
          transactionId: transferFromResult.Ok,
        };
      } else {
        return {
          success: false,
          error: JSON.stringify(transferFromResult.Err),
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get allowance for a spender
   */
  async getAllowance(owner: string, spender: string): Promise<bigint> {
    const allowance = await this.icrc1LedgerActor.icrc2_allowance({
      account: {
        owner: Principal.fromText(owner),
        subaccount: []
      },
      spender: {
        owner: Principal.fromText(spender),
        subaccount: []
      }
    });
    return allowance.allowance;
  }

  /**
   * Get balances for multiple accounts
   */
  async getBalances(accounts: string[]): Promise<TokenBalance[]> {
    const balancePromises = accounts.map(async (owner) => {
      const balance = await this.getBalance(owner);
      return { owner, balance };
    });

    return Promise.all(balancePromises);
  }

  /**
   * Distribute tokens from minting account to test accounts
   */
  async distributeTestTokens(): Promise<void> {
    const mintingAccount = '2vxsx-fae';
    const testAccounts = [
      process.env.TEST_MAKER_PRINCIPAL!,
      process.env.TEST_TAKER_PRINCIPAL!,
      process.env.TEST_RESOLVER_PRINCIPAL!,
    ];

    const distributionAmount = BigInt(1_000_000_000); // 1 billion tokens each

    for (const account of testAccounts) {
      const result = await this.transferTokens(mintingAccount, account, distributionAmount);
      if (!result.success) {
        console.error(`Failed to distribute tokens to ${account}:`, result.error);
      } else {
        console.log(`Successfully distributed ${distributionAmount} tokens to ${account}`);
      }
    }
  }

  /**
   * Print current token state
   */
  async printTokenState(): Promise<void> {
    const tokenInfo = await this.getTokenInfo();
    console.log('=== Token Information ===');
    console.log(`Name: ${tokenInfo.name}`);
    console.log(`Symbol: ${tokenInfo.symbol}`);
    console.log(`Total Supply: ${tokenInfo.totalSupply}`);
    console.log(`Transfer Fee: ${tokenInfo.fee}`);
    console.log(`Decimals: ${tokenInfo.decimals}`);

    const testAccounts = [
      '2vxsx-fae', // minting account
      process.env.TEST_MAKER_PRINCIPAL!,
      process.env.TEST_TAKER_PRINCIPAL!,
      process.env.TEST_RESOLVER_PRINCIPAL!,
    ];

    const balances = await this.getBalances(testAccounts);
    console.log('\n=== Account Balances ===');
    for (const { owner, balance } of balances) {
      console.log(`${owner}: ${balance} tokens`);
    }
  }
}

// Export a singleton instance
export const tokenUtils = new TokenUtils(); 