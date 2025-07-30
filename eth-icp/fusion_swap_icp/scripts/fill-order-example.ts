import { tokenUtils, OrderConfig } from '../tests/token-utils';

console.log('🚀 Starting DFX Order Fill Example...\n');

async function runFillOrderExample() {
  try {
    // Create a test order configuration
    const orderConfig: OrderConfig = {
      id: 3000,
      src_mint: 'b77ix-eeaaa-aaaaa-qaada-cai',
      dst_mint: 'b77ix-eeaaa-aaaaa-qaada-cai',
      maker: 'cjobn-a4566-qzwux-yg5b5-z2vqh-huolu-nhxd6-6xrto-zunsj-zuwdd-qae',
      src_amount: 2000000000, // 2 billion tokens
      min_dst_amount: 1800000000, // 1.8 billion tokens
      estimated_dst_amount: 2000000000, // 2 billion tokens
      expiration_time: 1753899000, // Future timestamp
      fee: {
        protocol_fee_bps: 30,
        integrator_fee_bps: 20,
        surplus_bps: 10,
        max_cancel_premium: 100000000
      },
      auction: {
        start_time: 1753898600,
        end_time: 1753902200,
        start_price: 2000000000,
        end_price: 1800000000,
        current_price: 2000000000
      },
      cancellation_auction_secs: 3600
    };

    console.log('📝 Creating test order...');
    const createResult = await tokenUtils.createOrderWithDfx(orderConfig, 'test-maker');
    
    if (!createResult.success) {
      console.log('❌ Order creation failed:', createResult.error);
      return;
    }

    console.log(`✅ Order ${orderConfig.id} created successfully!`);
    
    // Verify order exists
    const orderExists = await tokenUtils.verifyOrder(orderConfig.id);
    console.log(`Order exists: ${orderExists}`);

    // Get all orders before fill
    console.log('\n📊 Orders before fill:');
    const ordersBefore = await tokenUtils.getAllOrders();
    console.log(ordersBefore);

    // Fill the order completely
    console.log('\n🔄 Filling order completely...');
    const fillResult = await tokenUtils.fillOrderWithDfx(orderConfig.id, orderConfig.src_amount, 'test-taker');
    
    if (fillResult.success) {
      console.log(`✅ Order ${orderConfig.id} filled successfully!`);
      
      // Verify the order was removed
      const orderStillExists = await tokenUtils.verifyOrder(orderConfig.id);
      console.log(`Order still exists: ${orderStillExists}`);
      
      // Get all orders after fill
      console.log('\n📊 Orders after fill:');
      const ordersAfter = await tokenUtils.getAllOrders();
      console.log(ordersAfter);
      
    } else {
      console.error('❌ Order fill failed:', fillResult.error);
    }

  } catch (error) {
    console.error('❌ Error in fill order example:', error);
  }
}

// Run the example
runFillOrderExample().then(() => {
  console.log('\n🎉 DFX Order Fill Example completed!');
}).catch((error) => {
  console.error('❌ Example failed:', error);
}); 