import {
  createOrder,
  cancelOrder,
  fillOrder,
  getOrderById,
  getOrdersByMaker,
  getActiveOrders,
  getContractStatistics,
  checkContractHealth,
  batchCreateOrders,
  createTestOrderParams,
  createTestFillParams,
  validateOrderParams,
  validateFillParams,
  generateRandomSecret,
  createHashlockHash,
  CONFIG,
  AptosFusionError
} from "./aptos-utils";

// Test suite
describe("Aptos Fusion Contract Tests", () => {
  let testOrderId: string | null = null;
  let testSecret: string;

  beforeAll(async () => {
    console.log("Setting up test environment...");
    testSecret = generateRandomSecret();
    console.log("Generated test secret:", testSecret);
  });

  describe("Order Creation", () => {
    test("should create order with valid parameters", async () => {
      const orderParams = createTestOrderParams(testSecret);
      
      // Validate parameters before submission
      expect(validateOrderParams(orderParams)).toBe(true);
      
      const txHash = await createOrder(orderParams);
      expect(txHash).toBeDefined();
      expect(txHash.length).toBeGreaterThan(0);
      
      // Store order ID for subsequent tests
      testOrderId = "1"; // First order will have ID 1
      console.log("Order created with ID:", testOrderId);
    }, 30000);

    test("should fail with invalid src_amount", async () => {
      const orderParams = createTestOrderParams(testSecret);
      orderParams.srcAmount = "0"; // Invalid: zero amount
      
      expect(validateOrderParams(orderParams)).toBe(false);
      
      await expect(createOrder(orderParams)).rejects.toThrow();
    }, 30000);

    test("should fail with invalid min_dst_amount", async () => {
      const orderParams = createTestOrderParams(testSecret);
      orderParams.minDstAmount = "0"; // Invalid: zero amount
      
      expect(validateOrderParams(orderParams)).toBe(false);
      
      await expect(createOrder(orderParams)).rejects.toThrow();
    }, 30000);

    test("should fail with invalid auction duration", async () => {
      const orderParams = createTestOrderParams(testSecret);
      orderParams.duration = "100"; // Invalid: too short duration
      
      expect(validateOrderParams(orderParams)).toBe(false);
      
      await expect(createOrder(orderParams)).rejects.toThrow();
    }, 30000);

    test("should fail with invalid hashlock", async () => {
      const orderParams = createTestOrderParams(testSecret);
      orderParams.hash = Uint8Array.from([1, 2, 3]); // Invalid: wrong length
      
      expect(validateOrderParams(orderParams)).toBe(false);
      
      await expect(createOrder(orderParams)).rejects.toThrow();
    }, 30000);
  });

  describe("Order Querying", () => {
    test("should get order by ID", async () => {
      if (!testOrderId) {
        throw new Error("No test order ID available");
      }

      const result = await getOrderById(testOrderId);
      expect(result).toBeDefined();
      console.log("Order data:", result);
    });

    test("should get orders by maker", async () => {
      const result = await getOrdersByMaker(CONFIG.ACCOUNT_ADDRESS);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      console.log("Maker orders:", result);
    });

    test("should get active orders", async () => {
      const result = await getActiveOrders();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      console.log("Active orders:", result);
    });

    test("should get contract statistics", async () => {
      const result = await getContractStatistics();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      console.log("Contract statistics:", result);
    });
  });

  describe("Order Cancellation", () => {
    test("should cancel order successfully", async () => {
      if (!testOrderId) {
        throw new Error("No test order ID available");
      }

      const txHash = await cancelOrder(testOrderId);
      expect(txHash).toBeDefined();
      expect(txHash.length).toBeGreaterThan(0);
      console.log("Order cancelled successfully");
    }, 30000);

    test("should fail to cancel non-existent order", async () => {
      await expect(cancelOrder("999999")).rejects.toThrow();
    }, 30000);
  });

  describe("Order Filling", () => {
    let fillOrderId: string;

    beforeAll(async () => {
      // Create a new order for filling tests
      const newSecret = generateRandomSecret();
      const orderParams = createTestOrderParams(newSecret);
      
      await createOrder(orderParams);
      fillOrderId = "2"; // Second order
      console.log("Created order for filling tests:", fillOrderId);
    });

    test("should fill order with valid secret", async () => {
      if (!fillOrderId) {
        throw new Error("No fill order ID available");
      }

      const fillParams = createTestFillParams(fillOrderId, testSecret);
      
      // Validate fill parameters
      expect(validateFillParams(fillParams)).toBe(true);
      
      const txHash = await fillOrder(fillParams);
      expect(txHash).toBeDefined();
      expect(txHash.length).toBeGreaterThan(0);
      console.log("Order filled successfully");
    }, 30000);

    test("should fail to fill order with invalid secret", async () => {
      if (!fillOrderId) {
        throw new Error("No fill order ID available");
      }

      const fillParams = createTestFillParams(fillOrderId, "invalid_secret");
      
      // This should still validate as the secret is a valid hex string
      expect(validateFillParams(fillParams)).toBe(true);
      
      // But the transaction should fail due to invalid hashlock
      await expect(fillOrder(fillParams)).rejects.toThrow();
    }, 30000);

    test("should fail to fill non-existent order", async () => {
      const fillParams = createTestFillParams("999999", testSecret);
      
      expect(validateFillParams(fillParams)).toBe(true);
      
      await expect(fillOrder(fillParams)).rejects.toThrow();
    }, 30000);
  });

  describe("Batch Operations", () => {
    test("should create multiple orders in batch", async () => {
      const orders = [
        createTestOrderParams(generateRandomSecret()),
        createTestOrderParams(generateRandomSecret())
      ];
      
      // Validate all orders
      orders.forEach(order => {
        expect(validateOrderParams(order)).toBe(true);
      });
      
      const txHash = await batchCreateOrders(orders);
      expect(txHash).toBeDefined();
      expect(txHash.length).toBeGreaterThan(0);
      console.log("Batch order creation successful");
    }, 30000);
  });

  describe("Contract Health Checks", () => {
    test("should check contract health", async () => {
      const result = await checkContractHealth();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      console.log("Contract health:", result);
    });

    test("should get order statistics", async () => {
      const result = await getContractStatistics();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      console.log("Order statistics:", result);
    });
  });

  describe("Utility Functions", () => {
    test("should generate random secrets", () => {
      const secret1 = generateRandomSecret();
      const secret2 = generateRandomSecret();
      
      expect(secret1).toBeDefined();
      expect(secret2).toBeDefined();
      expect(secret1).not.toBe(secret2);
      expect(secret1.length).toBe(64); // 32 bytes = 64 hex chars
      expect(secret2.length).toBe(64);
    });

    test("should create hashlock hashes", () => {
      const secret = "fcf730b6d95236ecd3c9fc2d92d7b6b2bb061514961aec041d6c7a7192f592e4";
      const hash = createHashlockHash(secret);
      
      expect(hash).toBeDefined();
      expect(hash.length).toBe(32);
      expect(hash).toBeInstanceOf(Uint8Array);
    });

    test("should validate order parameters", () => {
      const validParams = createTestOrderParams();
      expect(validateOrderParams(validParams)).toBe(true);
      
      const invalidParams = { ...validParams, srcAmount: "0" };
      expect(validateOrderParams(invalidParams)).toBe(false);
    });

    test("should validate fill parameters", () => {
      const validParams = createTestFillParams("1", "fcf730b6d95236ecd3c9fc2d92d7b6b2bb061514961aec041d6c7a7192f592e4");
      expect(validateFillParams(validParams)).toBe(true);
      
      const invalidParams = { ...validParams, orderId: "" };
      expect(validateFillParams(invalidParams)).toBe(false);
    });
  });

  describe("Configuration", () => {
    test("should have valid configuration", () => {
      expect(CONFIG.NODE_URL).toBeDefined();
      expect(CONFIG.MODULE_ADDRESS).toBeDefined();
      expect(CONFIG.ACCOUNT_ADDRESS).toBeDefined();
      
      expect(CONFIG.NODE_URL).toContain("https://");
      expect(CONFIG.MODULE_ADDRESS).toMatch(/^0x[a-fA-F0-9]{64}$/);
      expect(CONFIG.ACCOUNT_ADDRESS).toMatch(/^0x[a-fA-F0-9]{64}$/);
    });
  });
}); 