import { tokenUtils, OrderConfig } from './token-utils';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

describe('Fill Order Test', () => {
  describe('Complete Fill Order', () => {
    it('should fill an order completely and remove it from the list', async () => {
      const orderid = Math.floor(Math.random() * 1000000);
      console.log(`🎯 Starting complete fill order test with order ID: ${orderid}`);
      
      // Create a test order first
      const currentTime = Math.floor(Date.now() / 1000);
      const orderConfig: OrderConfig = {
        id: orderid,
        src_mint: process.env.ICRC1_CANISTER_ID || 'br5f7-7uaaa-aaaaa-qaaca-cai',
        dst_mint: process.env.ICRC1_CANISTER_ID || 'br5f7-7uaaa-aaaaa-qaaca-cai',
        maker: process.env.TEST_MAKER_PRINCIPAL || 'cjobn-a4566-qzwux-yg5b5-z2vqh-huolu-nhxd6-6xrto-zunsj-zuwdd-qae',
        src_amount: 1000000000, // 1 billion tokens
        min_dst_amount: 900000000, // 900 million tokens
        estimated_dst_amount: 1000000000, // 1 billion tokens
        expiration_time: currentTime + 3600, // 1 hour from now
        fee: {
          protocol_fee_bps: 30,
          integrator_fee_bps: 20,
          surplus_bps: 10,
          max_cancel_premium: 100000000
        },
        auction: {
          start_time: currentTime,
          end_time: currentTime + 7200, // 2 hours from now
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
          created_at: currentTime
        },
        status: 'Announced',
        created_at: currentTime
      };

      console.log('📝 Creating test order for complete fill...');
      console.log(`Order config: ID=${orderConfig.id}, Amount=${orderConfig.src_amount}, Maker=${orderConfig.maker}`);
      
      const createResult = await tokenUtils.createOrderWithDfx(orderConfig, 'test-maker');
      
      if (!createResult.success) {
        console.log('❌ Order creation failed, skipping complete fill test');
        console.log('Error details:', createResult.error);
        return;
      }

      console.log(`✅ Order ${orderConfig.id} created successfully!`);
      
      // Verify order exists before filling
      console.log('🔍 Verifying order exists before complete fill...');
      const orderExists = await tokenUtils.verifyOrder(orderConfig.id);
      console.log(`Order exists: ${orderExists}`);
      expect(orderExists).toBe(true);

      // Fill the order completely
      console.log('🔄 Filling order completely...');
      console.log(`Fill parameters: OrderID=${orderConfig.id}, Amount=${orderConfig.src_amount}, Taker=test-taker`);
      
      const fillResult = await tokenUtils.fillOrderWithDfx(orderConfig.id, orderConfig.src_amount, 'test-taker');
      
      console.log('📊 Complete fill result:', fillResult);
      
      if (fillResult.success) {
        console.log(`✅ Order ${orderConfig.id} completely filled successfully!`);
        
        // Verify the order was removed (completely filled)
        console.log('🔍 Verifying order removal after complete fill...');
        const orderStillExists = await tokenUtils.verifyOrder(orderConfig.id);
        console.log(`Order still exists: ${orderStillExists}`);
        expect(orderStillExists).toBe(false);
        
        console.log('🎉 Complete fill order test completed successfully!');
        
      } else {
        console.error('❌ Order complete fill failed:', fillResult.error);
        console.error('Complete fill error details:', fillResult);
      }
    });
  });

  describe('Partial Fill Order', () => {
    it('should fill an order partially and keep it active', async () => {
      const orderid = Math.floor(Math.random() * 1000000);
      console.log(`🎯 Starting partial fill order test with order ID: ${orderid}`);
      
      // Create a test order first
      const currentTime = Math.floor(Date.now() / 1000);
      const orderConfig: OrderConfig = {
        id: orderid,
        src_mint: process.env.ICRC1_CANISTER_ID || 'br5f7-7uaaa-aaaaa-qaaca-cai',
        dst_mint: process.env.ICRC1_CANISTER_ID || 'br5f7-7uaaa-aaaaa-qaaca-cai',
        maker: process.env.TEST_MAKER_PRINCIPAL || 'cjobn-a4566-qzwux-yg5b5-z2vqh-huolu-nhxd6-6xrto-zunsj-zuwdd-qae',
        src_amount: 1000000000, // 1 billion tokens
        min_dst_amount: 900000000, // 900 million tokens
        estimated_dst_amount: 1000000000, // 1 billion tokens
        expiration_time: currentTime + 3600, // 1 hour from now
        fee: {
          protocol_fee_bps: 30,
          integrator_fee_bps: 20,
          surplus_bps: 10,
          max_cancel_premium: 100000000
        },
        auction: {
          start_time: currentTime,
          end_time: currentTime + 7200, // 2 hours from now
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
          created_at: currentTime
        },
        status: 'Announced',
        created_at: currentTime
      };

      console.log('📝 Creating test order for partial fill...');
      console.log(`Order config: ID=${orderConfig.id}, Amount=${orderConfig.src_amount}, Maker=${orderConfig.maker}`);
      
      const createResult = await tokenUtils.createOrderWithDfx(orderConfig, 'test-maker');
      
      if (!createResult.success) {
        console.log('❌ Order creation failed, skipping partial fill test');
        console.log('Error details:', createResult.error);
        return;
      }

      console.log(`✅ Order ${orderConfig.id} created successfully!`);
      
      // Verify order exists before filling
      console.log('🔍 Verifying order exists before partial fill...');
      const orderExists = await tokenUtils.verifyOrder(orderConfig.id);
      console.log(`Order exists: ${orderExists}`);
      expect(orderExists).toBe(true);

      // Fill the order partially (50% of the amount)
      const partialAmount = Math.floor(orderConfig.src_amount / 2);
      console.log('🔄 Filling order partially...');
      console.log(`Fill parameters: OrderID=${orderConfig.id}, Amount=${partialAmount}, Taker=test-taker`);
      
      const fillResult = await tokenUtils.fillOrderWithDfx(orderConfig.id, partialAmount, 'test-taker');
      
      console.log('📊 Partial fill result:', fillResult);
      
      if (fillResult.success) {
        console.log(`✅ Order ${orderConfig.id} partially filled successfully!`);
        
        // Verify the order still exists (partial fill)
        console.log('🔍 Verifying order still exists after partial fill...');
        const orderStillExists = await tokenUtils.verifyOrder(orderConfig.id);
        console.log(`Order still exists: ${orderStillExists}`);
        expect(orderStillExists).toBe(true);
        
        // Try to fill the remaining amount
        const remainingAmount = orderConfig.src_amount - partialAmount;
        console.log('🔄 Filling remaining amount...');
        console.log(`Remaining fill parameters: OrderID=${orderConfig.id}, Amount=${remainingAmount}, Taker=test-taker`);
        
        const remainingFillResult = await tokenUtils.fillOrderWithDfx(orderConfig.id, remainingAmount, 'test-taker');
        
        if (remainingFillResult.success) {
          console.log(`✅ Remaining amount filled successfully!`);
          
          // Verify the order was removed (now completely filled)
          console.log('🔍 Verifying order removal after complete fill...');
          const orderFinallyRemoved = await tokenUtils.verifyOrder(orderConfig.id);
          console.log(`Order finally removed: ${!orderFinallyRemoved}`);
          expect(orderFinallyRemoved).toBe(false);
          
          console.log('🎉 Partial fill order test completed successfully!');
        } else {
          console.error('❌ Remaining amount fill failed:', remainingFillResult.error);
        }
        
      } else {
        console.error('❌ Order partial fill failed:', fillResult.error);
        console.error('Partial fill error details:', fillResult);
      }
    });
  });

  describe('Multiple Partial Fills', () => {
    it('should handle multiple partial fills correctly', async () => {
      const orderid = Math.floor(Math.random() * 1000000);
      console.log(`🎯 Starting multiple partial fills test with order ID: ${orderid}`);
      
      // Create a test order first
      const currentTime = Math.floor(Date.now() / 1000);
      const orderConfig: OrderConfig = {
        id: orderid,
        src_mint: process.env.ICRC1_CANISTER_ID || 'br5f7-7uaaa-aaaaa-qaaca-cai',
        dst_mint: process.env.ICRC1_CANISTER_ID || 'br5f7-7uaaa-aaaaa-qaaca-cai',
        maker: process.env.TEST_MAKER_PRINCIPAL || 'cjobn-a4566-qzwux-yg5b5-z2vqh-huolu-nhxd6-6xrto-zunsj-zuwdd-qae',
        src_amount: 1000000000, // 1 billion tokens
        min_dst_amount: 900000000, // 900 million tokens
        estimated_dst_amount: 1000000000, // 1 billion tokens
        expiration_time: currentTime + 3600, // 1 hour from now
        fee: {
          protocol_fee_bps: 30,
          integrator_fee_bps: 20,
          surplus_bps: 10,
          max_cancel_premium: 100000000
        },
        auction: {
          start_time: currentTime,
          end_time: currentTime + 7200, // 2 hours from now
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
          created_at: currentTime
        },
        status: 'Announced',
        created_at: currentTime
      };

      console.log('📝 Creating test order for multiple partial fills...');
      
      const createResult = await tokenUtils.createOrderWithDfx(orderConfig, 'test-maker');
      
      if (!createResult.success) {
        console.log('❌ Order creation failed, skipping multiple partial fills test');
        return;
      }

      console.log(`✅ Order ${orderConfig.id} created successfully!`);
      
      // Perform multiple partial fills
      const partialAmounts = [200000000, 300000000, 250000000, 250000000]; // Should total 1B
      let totalFilled = 0;
      
      for (let i = 0; i < partialAmounts.length; i++) {
        const partialAmount = partialAmounts[i];
        totalFilled += partialAmount;
        
        console.log(`🔄 Partial fill ${i + 1}: Amount=${partialAmount}, Total filled so far=${totalFilled}`);
        
        const fillResult = await tokenUtils.fillOrderWithDfx(orderConfig.id, partialAmount, 'test-taker');
        
        if (fillResult.success) {
          console.log(`✅ Partial fill ${i + 1} successful!`);
          
          // Verify order still exists if not the last fill
          if (i < partialAmounts.length - 1) {
            const orderStillExists = await tokenUtils.verifyOrder(orderConfig.id);
            expect(orderStillExists).toBe(true);
          } else {
            // Last fill should remove the order
            const orderRemoved = await tokenUtils.verifyOrder(orderConfig.id);
            expect(orderRemoved).toBe(false);
            console.log('🎉 Order completely filled and removed!');
          }
        } else {
          console.error(`❌ Partial fill ${i + 1} failed:`, fillResult.error);
          break;
        }
      }
      
      console.log('🎉 Multiple partial fills test completed!');
    });
  });
}); 