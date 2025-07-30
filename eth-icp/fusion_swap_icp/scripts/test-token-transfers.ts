import { tokenUtils } from '../tests/token-utils';

// Load environment variables
require('dotenv').config();

async function main() {
  console.log('🚀 Starting ICRC1 Token Transfer Tests...\n');

  try {
    // Print initial token state
    console.log('📊 Initial Token State:');
    await tokenUtils.printTokenState();
    console.log('');

    // Distribute tokens to test accounts
    console.log('💰 Distributing tokens to test accounts...');
    await tokenUtils.distributeTestTokens();
    console.log('');

    // Print state after distribution
    console.log('📊 Token State After Distribution:');
    await tokenUtils.printTokenState();
    console.log('');

    // Test direct transfers between test accounts
    console.log('🔄 Testing direct transfers...');
    
    const makerPrincipal = process.env.TEST_MAKER_PRINCIPAL!;
    const takerPrincipal = process.env.TEST_TAKER_PRINCIPAL!;
    const resolverPrincipal = process.env.TEST_RESOLVER_PRINCIPAL!;

    // Transfer from maker to taker
    const transferAmount = BigInt(100_000_000); // 100 million tokens
    console.log(`Transferring ${transferAmount} tokens from maker to taker...`);
    
    const transferResult = await tokenUtils.transferTokens(
      makerPrincipal,
      takerPrincipal,
      transferAmount
    );

    if (transferResult.success) {
      console.log(`✅ Transfer successful! Transaction ID: ${transferResult.transactionId}`);
    } else {
      console.log(`❌ Transfer failed: ${transferResult.error}`);
    }

    // Test approve and transfer_from
    console.log('\n🔐 Testing approve and transfer_from...');
    
    const approveAmount = BigInt(50_000_000); // 50 million tokens
    console.log(`Approving ${approveAmount} tokens for resolver to spend from maker...`);
    
    const approveResult = await tokenUtils.approveTokens(
      makerPrincipal,
      resolverPrincipal,
      approveAmount
    );

    if (approveResult.success) {
      console.log(`✅ Approval successful! Transaction ID: ${approveResult.transactionId}`);
      
      // Check allowance
      const allowance = await tokenUtils.getAllowance(makerPrincipal, resolverPrincipal);
      console.log(`📋 Current allowance: ${allowance} tokens`);
      
      // Transfer using transfer_from
      const transferFromAmount = BigInt(25_000_000); // 25 million tokens
      console.log(`Transferring ${transferFromAmount} tokens using transfer_from...`);
      
      const transferFromResult = await tokenUtils.transferFromTokens(
        resolverPrincipal,
        makerPrincipal,
        resolverPrincipal,
        transferFromAmount
      );

      if (transferFromResult.success) {
        console.log(`✅ Transfer_from successful! Transaction ID: ${transferFromResult.transactionId}`);
      } else {
        console.log(`❌ Transfer_from failed: ${transferFromResult.error}`);
      }
    } else {
      console.log(`❌ Approval failed: ${approveResult.error}`);
    }

    // Print final state
    console.log('\n📊 Final Token State:');
    await tokenUtils.printTokenState();

    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Error during token transfer tests:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
} 