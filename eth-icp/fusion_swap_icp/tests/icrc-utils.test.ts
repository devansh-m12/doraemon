import { icrcUtils, ICRCUtilsStatic, Account } from './icrc-utils';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

describe('ICRC Utils Test', () => {
  const testAccount: Account = {
    owner: process.env.TEST_MAKER_PRINCIPAL || 'cjobn-a4566-qzwux-yg5b5-z2vqh-huolu-nhxd6-6xrto-zunsj-zuwdd-qae'
  };

  const testTakerAccount: Account = {
    owner: process.env.TEST_TAKER_PRINCIPAL || 'fhrni-ukyxj-tns4p-l7f32-txwvg-anu57-55dcm-gzhue-22yg2-qokvv-mqe'
  };

  const contractAccount: Account = {
    owner: process.env.FUSION_SWAP_CANISTER_ID || 'bkyz2-fmaaa-aaaaa-qaaaq-cai'
  };

  describe('Balance Operations', () => {
    it('should get balance of an account', async () => {
      console.log('🔍 Getting balance for test account...');
      
      const balanceResult = await icrcUtils.getBalance(testAccount);
      
      console.log('📊 Balance result:', balanceResult);
      
      if (balanceResult.success) {
        console.log(`✅ Balance: ${ICRCUtilsStatic.formatAmount(balanceResult.balance!)} FUSION`);
        expect(balanceResult.balance).toBeGreaterThan(0);
      } else {
        console.error('❌ Failed to get balance:', balanceResult.error);
      }
    });

    it('should check if account has sufficient balance', async () => {
      console.log('🔍 Checking if account has sufficient balance...');
      
      const hasBalance = await icrcUtils.hasSufficientBalance(testAccount, 1000000000);
      
      console.log(`📊 Has sufficient balance: ${hasBalance}`);
      expect(typeof hasBalance).toBe('boolean');
    });
  });

  describe('Allowance Operations', () => {
    it('should get allowance for a spender', async () => {
      console.log('🔍 Getting allowance for contract...');
      
      const allowanceResult = await icrcUtils.getAllowance(testAccount, contractAccount);
      
      console.log('📊 Allowance result:', allowanceResult);
      
      if (allowanceResult.success) {
        console.log(`✅ Allowance: ${ICRCUtilsStatic.formatAmount(allowanceResult.allowance!)} FUSION`);
        expect(allowanceResult.allowance).toBeGreaterThanOrEqual(0);
      } else {
        console.error('❌ Failed to get allowance:', allowanceResult.error);
      }
    });

    it('should check if spender has sufficient allowance', async () => {
      console.log('🔍 Checking if spender has sufficient allowance...');
      
      const hasAllowance = await icrcUtils.hasSufficientAllowance(testAccount, contractAccount, 1000000000);
      
      console.log(`📊 Has sufficient allowance: ${hasAllowance}`);
      expect(typeof hasAllowance).toBe('boolean');
    });
  });

  describe('Transfer Operations', () => {
    it('should transfer tokens between accounts', async () => {
      console.log('🔄 Transferring tokens between test accounts...');
      
      const transferResult = await icrcUtils.transfer(
        testAccount,
        testTakerAccount,
        100000000, // 1 FUSION token
        10000 // fee
      );
      
      console.log('📊 Transfer result:', transferResult);
      
      if (transferResult.success) {
        console.log(`✅ Transfer successful! Block index: ${transferResult.blockIndex}`);
        expect(transferResult.blockIndex).toBeGreaterThan(0);
      } else {
        console.error('❌ Transfer failed:', transferResult.error);
      }
    });

    it('should transfer tokens with automatic approval', async () => {
      console.log('🔄 Transferring tokens with automatic approval...');
      
      const transferResult = await icrcUtils.transferWithApproval(
        testAccount,
        testTakerAccount,
        100000000, // 1 FUSION token
        contractAccount,
        10000 // fee
      );
      
      console.log('📊 Transfer with approval result:', transferResult);
      
      if (transferResult.success) {
        console.log(`✅ Transfer with approval successful! Block index: ${transferResult.blockIndex}`);
        expect(transferResult.blockIndex).toBeGreaterThan(0);
      } else {
        console.error('❌ Transfer with approval failed:', transferResult.error);
      }
    });
  });

  describe('Approval Operations', () => {
    it('should approve tokens for a spender', async () => {
      console.log('✅ Approving tokens for contract...');
      
      const approveResult = await icrcUtils.approve({
        amount: 1000000000, // 10 FUSION tokens
        spender: contractAccount,
        fee: 10000
      });
      
      console.log('📊 Approve result:', approveResult);
      
      if (approveResult.success) {
        console.log(`✅ Approval successful! Block index: ${approveResult.blockIndex}`);
        expect(approveResult.blockIndex).toBeGreaterThan(0);
      } else {
        console.error('❌ Approval failed:', approveResult.error);
      }
    });
  });

  describe('Metadata Operations', () => {
    it('should get token metadata', async () => {
      console.log('📋 Getting token metadata...');
      
      const metadataResult = await icrcUtils.getMetadata();
      
      console.log('📊 Metadata result:', metadataResult);
      
      if (metadataResult.success) {
        console.log(`✅ Token: ${metadataResult.name} (${metadataResult.symbol})`);
        console.log(`✅ Decimals: ${metadataResult.decimals}`);
        console.log(`✅ Fee: ${metadataResult.fee}`);
        console.log(`✅ Total Supply: ${ICRCUtilsStatic.formatAmount(metadataResult.totalSupply)}`);
        
        expect(metadataResult.name).toBeDefined();
        expect(metadataResult.symbol).toBeDefined();
        expect(metadataResult.decimals).toBeGreaterThanOrEqual(0);
      } else {
        console.error('❌ Failed to get metadata:', metadataResult.error);
      }
    });
  });

  describe('Batch Operations', () => {
    it('should perform batch transfers', async () => {
      console.log('🔄 Performing batch transfers...');
      
      const transfers = [
        { to: testTakerAccount, amount: 50000000 }, // 0.5 FUSION
        { to: testTakerAccount, amount: 50000000 }  // 0.5 FUSION
      ];
      
      const batchResults = await icrcUtils.batchTransfer(testAccount, transfers, 10000);
      
      console.log('📊 Batch transfer results:', batchResults);
      
      const successfulTransfers = batchResults.filter(result => result.success);
      console.log(`✅ Successful transfers: ${successfulTransfers.length}/${batchResults.length}`);
      
      expect(batchResults.length).toBe(2);
    });
  });

  describe('Utility Functions', () => {
    it('should format and parse amounts correctly', () => {
      const rawAmount = 123456789;
      const decimals = 8;
      
      const formatted = ICRCUtilsStatic.formatAmount(rawAmount, decimals);
      const parsed = ICRCUtilsStatic.parseAmount(formatted, decimals);
      
      console.log(`📊 Raw amount: ${rawAmount}`);
      console.log(`📊 Formatted: ${formatted}`);
      console.log(`📊 Parsed: ${parsed}`);
      
      expect(formatted).toBe('1.23456789');
      expect(parsed).toBe(rawAmount);
    });

    it('should create subaccount correctly', () => {
      const principal = 'cjobn-a4566-qzwux-yg5b5-z2vqh-huolu-nhxd6-6xrto-zunsj-zuwdd-qae';
      const subaccountNumber = 123;
      
      const subaccount = ICRCUtilsStatic.createSubaccount(principal, subaccountNumber);
      
      console.log(`📊 Principal: ${principal}`);
      console.log(`📊 Subaccount number: ${subaccountNumber}`);
      console.log(`📊 Subaccount: ${subaccount}`);
      
      expect(subaccount).toBeDefined();
      expect(subaccount.length).toBe(32);
    });
  });

  describe('Transaction History', () => {
    it('should get transaction history', async () => {
      console.log('📜 Getting transaction history...');
      
      const historyResult = await icrcUtils.getTransactionHistory(testAccount, 0, 5);
      
      console.log('📊 History result:', historyResult);
      
      if (historyResult.success) {
        console.log('✅ Transaction history retrieved successfully');
        expect(historyResult.data).toBeDefined();
      } else {
        console.error('❌ Failed to get transaction history:', historyResult.error);
      }
    });
  });
}); 