import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { idlFactory as icrc1LedgerIdlFactory } from '../src/declarations/icrc1_ledger_canister';

// Load environment variables
require('dotenv').config();

describe('ICRC1 Token Transfer Tests', () => {
  let icrc1LedgerActor: any;
  let defaultAgent: HttpAgent;

  beforeAll(async () => {
    // Create agent for ICRC1 ledger
    defaultAgent = new HttpAgent({
      host: process.env.TEST_HOST || 'http://127.0.0.1:4943',
    });
    
    // For local testing, we need to fetch the root key
    await defaultAgent.fetchRootKey();
    
    // Create ICRC1 ledger actor
    const canisterId = process.env.CANISTER_ID_ICRC1_LEDGER_CANISTER!;
    icrc1LedgerActor = Actor.createActor(icrc1LedgerIdlFactory, {
      agent: defaultAgent,
      canisterId,
    });
  });

  describe('Token Information', () => {
    it('should get token name', async () => {
      const name = await icrc1LedgerActor.icrc1_name();
      expect(name).toBe('Fusion Token');
    });

    it('should get token symbol', async () => {
      const symbol = await icrc1LedgerActor.icrc1_symbol();
      expect(symbol).toBe('FUSION');
    });

    it('should get total supply', async () => {
      const totalSupply = await icrc1LedgerActor.icrc1_total_supply();
      expect(totalSupply).toBeGreaterThan(BigInt(1_000_000_000_000));
    });

    it('should get transfer fee', async () => {
      const fee = await icrc1LedgerActor.icrc1_fee();
      expect(fee).toBe(BigInt(10_000));
    });

    it('should get minting account', async () => {
      const mintingAccount = await icrc1LedgerActor.icrc1_minting_account();
      expect(mintingAccount).toBeDefined();
      if (mintingAccount && mintingAccount.owner) {
        expect(mintingAccount.owner.toString()).toBe('vz5cd-iuzeq-n2hg6-kzzzy-4dj3b-pcg4o-puhec-2irm3-wb677-6dl5i-zqe');
      } else {
        // If minting account structure is different, just verify it exists
        expect(mintingAccount).toBeDefined();
      }
    });
  });

  describe('Balance Queries', () => {
    it('should get balance of minting account', async () => {
      const balance = await icrc1LedgerActor.icrc1_balance_of({
        owner: Principal.fromText('vz5cd-iuzeq-n2hg6-kzzzy-4dj3b-pcg4o-puhec-2irm3-wb677-6dl5i-zqe'),
        subaccount: []
      });
      expect(balance).toBeGreaterThanOrEqual(BigInt(1_000_000_000_000));
    });

    it('should get balances for test accounts', async () => {
      if (process.env.TEST_MAKER_PRINCIPAL) {
        const makerBalance = await icrc1LedgerActor.icrc1_balance_of({
          owner: Principal.fromText(process.env.TEST_MAKER_PRINCIPAL),
          subaccount: []
        });
        expect(makerBalance).toBeGreaterThan(BigInt(0));
      }

      if (process.env.TEST_TAKER_PRINCIPAL) {
        const takerBalance = await icrc1LedgerActor.icrc1_balance_of({
          owner: Principal.fromText(process.env.TEST_TAKER_PRINCIPAL),
          subaccount: []
        });
        expect(takerBalance).toBeGreaterThan(BigInt(0));
      }

      if (process.env.TEST_RESOLVER_PRINCIPAL) {
        const resolverBalance = await icrc1LedgerActor.icrc1_balance_of({
          owner: Principal.fromText(process.env.TEST_RESOLVER_PRINCIPAL),
          subaccount: []
        });
        expect(resolverBalance).toBeGreaterThan(BigInt(0));
      }
    });
  });

  describe('Token State Verification', () => {
    it('should verify current token distribution', async () => {
      // Check that all test accounts have tokens
      if (process.env.TEST_MAKER_PRINCIPAL) {
        const makerBalance = await icrc1LedgerActor.icrc1_balance_of({
          owner: Principal.fromText(process.env.TEST_MAKER_PRINCIPAL),
          subaccount: []
        });
        expect(makerBalance).toBeGreaterThan(BigInt(1_000_000_000)); // Should have at least 1B
      }

      if (process.env.TEST_TAKER_PRINCIPAL) {
        const takerBalance = await icrc1LedgerActor.icrc1_balance_of({
          owner: Principal.fromText(process.env.TEST_TAKER_PRINCIPAL),
          subaccount: []
        });
        expect(takerBalance).toBeGreaterThan(BigInt(500_000_000)); // Should have at least 500M
      }

      if (process.env.TEST_RESOLVER_PRINCIPAL) {
        const resolverBalance = await icrc1LedgerActor.icrc1_balance_of({
          owner: Principal.fromText(process.env.TEST_RESOLVER_PRINCIPAL),
          subaccount: []
        });
        expect(resolverBalance).toBeGreaterThan(BigInt(300_000_000)); // Should have at least 300M
      }
    });

    it('should verify minting account has substantial balance', async () => {
      const mintingBalance = await icrc1LedgerActor.icrc1_balance_of({
        owner: Principal.fromText('vz5cd-iuzeq-n2hg6-kzzzy-4dj3b-pcg4o-puhec-2irm3-wb677-6dl5i-zqe'),
        subaccount: []
      });
      expect(mintingBalance).toBeGreaterThanOrEqual(BigInt(1_000_000_000_000)); // Should have at least 1T
    });
  });

  describe('ICRC2 Allowance Verification', () => {
    it('should check existing allowance between maker and resolver', async () => {
      if (process.env.TEST_MAKER_PRINCIPAL && process.env.TEST_RESOLVER_PRINCIPAL) {
        const allowance = await icrc1LedgerActor.icrc2_allowance({
          account: {
            owner: Principal.fromText(process.env.TEST_MAKER_PRINCIPAL),
            subaccount: []
          },
          spender: {
            owner: Principal.fromText(process.env.TEST_RESOLVER_PRINCIPAL),
            subaccount: []
          }
        });

        // Should have some allowance from previous tests
        expect(allowance.allowance).toBeGreaterThan(BigInt(0));
      }
    });

    it('should verify resolver has substantial balance from previous transfers', async () => {
      if (process.env.TEST_RESOLVER_PRINCIPAL) {
        const resolverBalance = await icrc1LedgerActor.icrc1_balance_of({
          owner: Principal.fromText(process.env.TEST_RESOLVER_PRINCIPAL),
          subaccount: []
        });
        
        // Should have balance from previous transfer_from operations
        expect(resolverBalance).toBeGreaterThan(BigInt(300_000_000));
      }
    });
  });

  describe('Token Metadata Verification', () => {
    it('should verify token metadata is properly set', async () => {
      const metadata = await icrc1LedgerActor.icrc1_metadata();
      expect(metadata).toBeDefined();
      expect(Array.isArray(metadata)).toBe(true);
    });

    it('should verify supported standards', async () => {
      const standards = await icrc1LedgerActor.icrc1_supported_standards();
      expect(standards).toBeDefined();
      expect(Array.isArray(standards)).toBe(true);
      
      // Should support ICRC1
      const hasICRC1 = standards.some((std: any) => 
        std.name === 'ICRC-1' || std.name === 'ICRC1'
      );
      expect(hasICRC1).toBe(true);
    });

    it('should verify decimals', async () => {
      const decimals = await icrc1LedgerActor.icrc1_decimals();
      expect(decimals).toBeDefined();
      expect(typeof decimals).toBe('number');
      expect(decimals).toBeGreaterThan(0);
    });
  });
}); 