// Jest setup file for ICP tests
import 'dotenv/config';

// Global test timeout
jest.setTimeout(30000);

// Mock console methods to reduce noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  // Suppress console output during tests unless explicitly needed
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  // Restore console methods
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

// Global test utilities
(global as any).testUtils = {
  // Helper to restore console for specific tests
  enableConsole: () => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  },
  
  // Helper to suppress console for specific tests
  disableConsole: () => {
    console.log = jest.fn();
    console.error = jest.fn();
  }
}; 