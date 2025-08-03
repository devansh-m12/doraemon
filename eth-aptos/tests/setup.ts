import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Global test setup
beforeAll(async () => {
  console.log("Setting up test environment...");
  
  // Verify required environment variables
  if (!process.env.PRIVKEY) {
    throw new Error("PRIVKEY environment variable is required");
  }
  
  if (!process.env.ADDR) {
    throw new Error("ADDR environment variable is required");
  }
  
  console.log("Test environment setup complete");
});

// Global test teardown
afterAll(async () => {
  console.log("Cleaning up test environment...");
});

// Increase timeout for blockchain operations
jest.setTimeout(60000); 