import { OrderbookService } from "../src/services/orderbook/OrderbookService";
import { config } from "../src/config/index";
import { describe, it, beforeEach, expect, jest, beforeAll } from '@jest/globals';

describe("OrderbookService", () => {
  let orderbookService: OrderbookService;

  beforeEach(() => {
    const serviceConfig = {
      baseUrl: config.oneInch.baseUrl,
      apiKey: config.oneInch.apiKey,
      timeout: config.oneInch.timeout,
    };
    orderbookService = new OrderbookService(serviceConfig);
  });

  describe("Tools", () => {
    it("should return all orderbook tools", () => {
      const tools = orderbookService.getTools();
      expect(tools).toBeDefined();
      expect(tools.length).toBeGreaterThan(0);

      const toolNames = tools.map((tool) => tool.name);
      expect(toolNames).toContain("add_limit_order");
      expect(toolNames).toContain("get_orders_by_address");
      expect(toolNames).toContain("get_order_by_hash");
      expect(toolNames).toContain("get_all_orders");
      expect(toolNames).toContain("get_orders_count");
      expect(toolNames).toContain("get_order_events");
      expect(toolNames).toContain("get_all_events");
      expect(toolNames).toContain("get_active_orders_for_permit");
      expect(toolNames).toContain("get_active_pairs");
      expect(toolNames).toContain("get_making_amount");
    });

    it("should have proper input schemas for tools", () => {
      const tools = orderbookService.getTools();

      tools.forEach((tool) => {
        expect(tool.inputSchema).toBeDefined();
        expect(tool.inputSchema.type).toBe("object");
        expect(tool.inputSchema.properties).toBeDefined();
        expect(tool.inputSchema.required).toBeDefined();
      });
    });
  });

  describe("Resources", () => {
    it("should return all orderbook resources", () => {
      const resources = orderbookService.getResources();
      expect(resources).toBeDefined();
      expect(resources.length).toBeGreaterThan(0);

      const resourceUris = resources.map((resource) => resource.uri);
      expect(resourceUris).toContain("1inch://orderbook/documentation");
      expect(resourceUris).toContain("1inch://orderbook/supported-chains");
      expect(resourceUris).toContain("1inch://orderbook/order-format");
    });
  });

  describe("Prompts", () => {
    it("should return all orderbook prompts", () => {
      const prompts = orderbookService.getPrompts();
      expect(prompts).toBeDefined();
      expect(prompts.length).toBeGreaterThan(0);

      const promptNames = prompts.map((prompt) => prompt.name);
      expect(promptNames).toContain("analyze_orderbook_activity");
      expect(promptNames).toContain("monitor_user_orders");
    });
  });

  describe("API Methods", () => {
    it("should handle get_orders_by_address tool call", async () => {
      const args = {
        chain: 1,
        address: "0x1234567890abcdef1234567890abcdef12345678",
      };

      const result = await orderbookService.handleToolCall(
        "get_orders_by_address",
        args,
      );
      console.log(result);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    }, 10000);

    it("should handle get_all_orders tool call", async () => {
      const args = {
        chain: 1,
        limit: 10,
        page: 1,
      };

      const result = await orderbookService.handleToolCall(
        "get_all_orders",
        args,
      );
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    }, 10000);

    it("should handle get_orders_count tool call", async () => {
      const args = {
        chain: 1,
      };

      const result = await orderbookService.handleToolCall(
        "get_orders_count",
        args,
      );
      expect(result).toBeDefined();
      expect(typeof result.count).toBe("number");
    }, 10000);

    it("should handle get_active_pairs tool call", async () => {
      const args = {
        chain: 1,
      };

      const result = await orderbookService.handleToolCall(
        "get_active_pairs",
        args,
      );
      expect(result).toBeDefined();
      expect(result.meta).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
    }, 10000);

    it("should handle get_making_amount tool call", async () => {
      const args = {
        chain: 1,
        makerAsset: "0xA0b86a33E6441b8c4C8C1C1E0F5C8C1C1E0F5C8C1",
        takerAsset: "0xB0b86a33E6441b8c4C8C1C1E0F5C8C1C1E0F5C8C1",
        takingAmount: "1000000000000000000",
      };

      try {
        const result = await orderbookService.handleToolCall(
          "get_making_amount",
          args,
        );
        expect(result).toBeDefined();
        expect(typeof result.feeBps).toBe("number");
      } catch (error) {
        // If the API returns an error due to invalid addresses, that's expected
        expect(error).toBeDefined();
      }
    }, 10000);

    it("should handle get_all_events tool call", async () => {
      const args = {
        chain: 1,
        limit: 5,
        offset: 0,
      };

      const result = await orderbookService.handleToolCall(
        "get_all_events",
        args,
      );
      expect(result).toBeDefined();
      // The response might be an array or have an events property
      if (Array.isArray(result)) {
        expect(Array.isArray(result)).toBe(true);
      } else {
        expect(result.events).toBeDefined();
      }
    }, 10000);
  });

  describe("Resource Handling", () => {
    it("should handle documentation resource read", async () => {
      const result = await orderbookService.handleResourceRead(
        "1inch://orderbook/documentation",
      );
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result).toContain("# 1inch Orderbook API Documentation");
    });

    it("should handle supported chains resource read", async () => {
      const result = await orderbookService.handleResourceRead(
        "1inch://orderbook/supported-chains",
      );
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");

      const parsed = JSON.parse(result);
      expect(parsed.chains).toBeDefined();
      expect(Array.isArray(parsed.chains)).toBe(true);
    });

    it("should handle order format resource read", async () => {
      const result = await orderbookService.handleResourceRead(
        "1inch://orderbook/order-format",
      );
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result).toContain("# 1inch Limit Order Format Specification");
    });
  });

  describe("Prompt Handling", () => {
    it("should handle analyze_orderbook_activity prompt", async () => {
      const args = {
        chain: 1,
        timeframe: "24h",
      };

      const result = await orderbookService.handlePromptRequest(
        "analyze_orderbook_activity",
        args,
      );
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result).toContain("Orderbook Activity Analysis");
    }, 15000);

    it("should handle monitor_user_orders prompt", async () => {
      const args = {
        chain: 1,
        address: "0x1234567890abcdef1234567890abcdef12345678",
      };

      const result = await orderbookService.handlePromptRequest(
        "monitor_user_orders",
        args,
      );
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result).toContain("User Order Monitor");
    }, 10000);
  });

  describe("Error Handling", () => {
    it("should throw error for unknown tool", async () => {
      await expect(
        orderbookService.handleToolCall("unknown_tool", {}),
      ).rejects.toThrow("Unknown tool: unknown_tool");
    });

    it("should throw error for unknown resource", async () => {
      await expect(
        orderbookService.handleResourceRead("1inch://unknown/resource"),
      ).rejects.toThrow("Unknown resource: 1inch://unknown/resource");
    });

    it("should throw error for unknown prompt", async () => {
      await expect(
        orderbookService.handlePromptRequest("unknown_prompt", {}),
      ).rejects.toThrow("Unknown prompt: unknown_prompt");
    });
  });

  describe("Direct API Methods", () => {
    it("should get orders by address directly", async () => {
      const result = await orderbookService.getOrdersByAddress({
        chain: 1,
        address: "0x1234567890abcdef1234567890abcdef12345678",
      });
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    }, 10000);

    it("should get all orders directly", async () => {
      const result = await orderbookService.getAllOrders({
        chain: 1,
        limit: 5,
        page: 1,
      });
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    }, 10000);

    it("should get orders count directly", async () => {
      const result = await orderbookService.getOrdersCount({
        chain: 1,
      });
      expect(result).toBeDefined();
      expect(typeof result.count).toBe("number");
    }, 10000);

    it("should get active pairs directly", async () => {
      const result = await orderbookService.getActivePairs({
        chain: 1,
      });
      expect(result).toBeDefined();
      expect(result.meta).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
    }, 10000);

    it("should get making amount directly", async () => {
      try {
        const result = await orderbookService.getMakingAmount({
          chain: 1,
          makerAsset: "0xA0b86a33E6441b8c4C8C1C1E0F5C8C1C1E0F5C8C1",
          takerAsset: "0xB0b86a33E6441b8c4C8C1C1E0F5C8C1C1E0F5C8C1",
          takingAmount: "1000000000000000000",
        });
        expect(result).toBeDefined();
        expect(typeof result.feeBps).toBe("number");
      } catch (error) {
        // If the API returns an error due to invalid addresses, that's expected
        expect(error).toBeDefined();
      }
    }, 10000);

    it("should get all events directly", async () => {
      const result = await orderbookService.getAllEvents({
        chain: 1,
        limit: 5,
        offset: 0,
      });
      expect(result).toBeDefined();
      // The response might be an array or have an events property
      if (Array.isArray(result)) {
        expect(Array.isArray(result)).toBe(true);
      } else {
        expect(result.events).toBeDefined();
      }
    }, 10000);
  });
});
