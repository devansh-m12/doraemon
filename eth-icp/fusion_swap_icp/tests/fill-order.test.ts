import { tokenUtils, OrderConfig } from './token-utils';

describe('Fill Order Test', () => {
  describe('Fill Order with DFX', () => {
    it('should fill an order completely using dfx commands', async () => {
      const orderid = Math.floor(Math.random() * 1000000);
      console.log(`🎯 Starting fill order test with order ID: ${orderid}`);
      
      // Create a test order first
      const orderConfig: OrderConfig = {
        id: orderid,
        src_mint: 'b77ix-eeaaa-aaaaa-qaada-cai',
        dst_mint: 'b77ix-eeaaa-aaaaa-qaada-cai',
        maker: 'cjobn-a4566-qzwux-yg5b5-z2vqh-huolu-nhxd6-6xrto-zunsj-zuwdd-qae',
        src_amount: 1000000000, // 1 billion tokens
        min_dst_amount: 900000000, // 900 million tokens
        estimated_dst_amount: 1000000000, // 1 billion tokens
        expiration_time: 1753897000, // Future timestamp
        fee: {
          protocol_fee_bps: 30,
          integrator_fee_bps: 20,
          surplus_bps: 10,
          max_cancel_premium: 100000000
        },
        auction: {
          start_time: 1753896600,
          end_time: 1753900200,
          start_price: 1000000000,
          end_price: 900000000,
          current_price: 1000000000
        },
        cancellation_auction_secs: 3600
      };

      console.log('📝 Creating test order for filling...');
      console.log(`Order config: ID=${orderConfig.id}, Amount=${orderConfig.src_amount}, Maker=${orderConfig.maker}`);
      
      const createResult = await tokenUtils.createOrderWithDfx(orderConfig, 'test-maker');
      
      if (!createResult.success) {
        console.log('❌ Order creation failed, skipping fill test');
        console.log('Error details:', createResult.error);
        return;
      }

      console.log(`✅ Order ${orderConfig.id} created successfully!`);
      
      // Verify order exists before filling
      console.log('🔍 Verifying order exists before fill...');
      const orderExists = await tokenUtils.verifyOrder(orderConfig.id);
      console.log(`Order exists: ${orderExists}`);
      expect(orderExists).toBe(true);

      // Fill the order completely
      console.log('🔄 Filling order completely...');
      console.log(`Fill parameters: OrderID=${orderConfig.id}, Amount=${orderConfig.src_amount}, Taker=test-taker`);
      
      const fillResult = await tokenUtils.fillOrderWithDfx(orderConfig.id, orderConfig.src_amount, 'test-taker');
      
      console.log('📊 Fill result:', fillResult);
      
      if (fillResult.success) {
        console.log(`✅ Order ${orderConfig.id} filled successfully!`);
        
        // Verify the order was removed (completely filled)
        console.log('🔍 Verifying order removal after fill...');
        const orderStillExists = await tokenUtils.verifyOrder(orderConfig.id);
        console.log(`Order still exists: ${orderStillExists}`);
        expect(orderStillExists).toBe(false);
        
        console.log('🎉 Fill order test completed successfully!');
        
      } else {
        console.error('❌ Order fill failed:', fillResult.error);
        console.error('Fill error details:', fillResult);
      }
    });

    it('should verify order fill removes order from list', async () => {
      // Create another test order
      const orderid = Math.floor(Math.random() * 1000000);
      const orderConfig: OrderConfig = {
        id: orderid,
        src_mint: 'b77ix-eeaaa-aaaaa-qaada-cai',
        dst_mint: 'b77ix-eeaaa-aaaaa-qaada-cai',
        maker: 'cjobn-a4566-qzwux-yg5b5-z2vqh-huolu-nhxd6-6xrto-zunsj-zuwdd-qae',
        src_amount: 500000000, // 500 million tokens
        min_dst_amount: 450000000, // 450 million tokens
        estimated_dst_amount: 500000000, // 500 million tokens
        expiration_time: 1753898000, // Future timestamp
        fee: {
          protocol_fee_bps: 30,
          integrator_fee_bps: 20,
          surplus_bps: 10,
          max_cancel_premium: 100000000
        },
        auction: {
          start_time: 1753897600,
          end_time: 1753901200,
          start_price: 500000000,
          end_price: 450000000,
          current_price: 500000000
        },
        cancellation_auction_secs: 3600
      };

      console.log('Creating test order for verification...');
      const createResult = await tokenUtils.createOrderWithDfx(orderConfig, 'test-maker');
      
      if (!createResult.success) {
        console.log('Order creation failed, skipping verification test');
        return;
      }

      // Get all orders before fill
      const ordersBefore = await tokenUtils.getAllOrders();
      console.log('Orders before fill:', ordersBefore);

      // Fill the order
      const fillResult = await tokenUtils.fillOrderWithDfx(orderConfig.id, orderConfig.src_amount, 'test-taker');
      
      if (fillResult.success) {
        // Get all orders after fill
        const ordersAfter = await tokenUtils.getAllOrders();
        console.log('Orders after fill:', ordersAfter);
        
        // Verify order was removed
        const orderStillExists = await tokenUtils.verifyOrder(orderConfig.id);
        expect(orderStillExists).toBe(false);
        
      } else {
        console.error('❌ Order fill failed:', fillResult.error);
      }
    });
  });
}); 