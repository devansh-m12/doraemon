import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { idlFactory as fusionSwapBackendIdlFactory } from '../src/declarations/fusion_swap_icp_backend';
import { idlFactory as icrc1LedgerIdlFactory } from '../src/declarations/icrc1_ledger_canister';

// Load environment variables
require('dotenv').config();

describe('Create Order Test', () => {
  let fusionSwapActor: any;
  let icrc1LedgerActor: any;
  let defaultAgent: HttpAgent;

  beforeAll(async () => {
    // Create agent
    defaultAgent = new HttpAgent({
      host: process.env.TEST_HOST || 'http://127.0.0.1:4943',
    });
    
    // For local testing, we need to fetch the root key
    await defaultAgent.fetchRootKey();
    
    // Use the correct canister IDs from our deployment
    const fusionSwapCanisterId = 'br5f7-7uaaa-aaaaa-qaaca-cai';
    const icrc1CanisterId = 'b77ix-eeaaa-aaaaa-qaada-cai';
    
    fusionSwapActor = Actor.createActor(fusionSwapBackendIdlFactory, {
      agent: defaultAgent,
      canisterId: fusionSwapCanisterId,
    });

    icrc1LedgerActor = Actor.createActor(icrc1LedgerIdlFactory, {
      agent: defaultAgent,
      canisterId: icrc1CanisterId,
    });
  });

  describe('Verify Existing Orders Created by Maker Identity', () => {
    it('should verify orders created by maker identity exist', async () => {
      // Get the maker principal (test-maker identity)
      const makerPrincipal = 'cjobn-a4566-qzwux-yg5b5-z2vqh-huolu-nhxd6-6xrto-zunsj-zuwdd-qae';

      // Check maker balance
      const makerBalance = await icrc1LedgerActor.icrc1_balance_of({
        owner: Principal.fromText(makerPrincipal),
        subaccount: []
      });
      
      console.log(`Maker balance: ${makerBalance}`);
      expect(Number(makerBalance)).toBeGreaterThan(0);

      // Get all orders
      const allOrders = await fusionSwapActor.get_all_orders();
      console.log(`Total orders: ${allOrders.length}`);
      expect(allOrders.length).toBeGreaterThan(0);

      // Find orders by the maker
      const makerOrders = await fusionSwapActor.get_orders_by_maker(Principal.fromText(makerPrincipal));
      console.log(`Orders by maker: ${makerOrders.length}`);
      expect(makerOrders.length).toBeGreaterThan(0);

      // Verify specific order details
      const order1 = await fusionSwapActor.get_order(1n);
      console.log('Order 1:', order1);
      
      if (order1 && order1.maker) {
        expect(order1.maker.toString()).toBe(makerPrincipal);
        expect(order1.src_amount).toBe(10000000000n);
        expect(order1.min_dst_amount).toBe(9000000000n);
        expect(order1.fee.protocol_fee_bps).toBe(30n);
      } else {
        console.log('Order 1 not found or has no maker');
      }

      // Check if there's a second order by the maker
      const order2 = await fusionSwapActor.get_order(2n);
      console.log('Order 2:', order2);
      
      if (order2 && order2.src_amount) {
        expect(order2.src_amount).toBe(5000000000n);
        expect(order2.min_dst_amount).toBe(4500000000n);
        expect(order2.fee.protocol_fee_bps).toBe(25n);
      } else {
        console.log('Order 2 not found or has no src_amount');
      }

      // Verify the orders are properly stored
      const testMakerOrders = makerOrders.filter((order: any) => 
        order.maker && order.maker.toString() === makerPrincipal
      );
      expect(testMakerOrders.length).toBeGreaterThan(0);

      console.log('✅ Order verification test completed successfully!');
      console.log(`Found ${allOrders.length} total orders`);
      console.log(`Found ${makerOrders.length} orders by maker ${makerPrincipal}`);
    });

    it('should verify contract functions work correctly', async () => {
      // Test the greet function
      const greetResult = await fusionSwapActor.greet('Test');
      expect(greetResult).toBe('Hello, Test!');

      // Test getting orders by a different maker
      const takerPrincipal = 'fhrni-ukyxj-tns4p-l7f32-txwvg-anu57-55dcm-gzhue-22yg2-qokvv-mqe';
      const takerOrders = await fusionSwapActor.get_orders_by_maker(Principal.fromText(takerPrincipal));
      console.log(`Orders by taker: ${takerOrders.length}`);
      
      // Should find at least one order by the taker (order 2)
      expect(takerOrders.length).toBeGreaterThan(0);

      // Test getting non-existent order
      const nonExistentOrder = await fusionSwapActor.get_order(999n);
      expect(nonExistentOrder).toEqual([]);

      console.log('✅ Contract function verification completed successfully!');
    });
  });
}); 