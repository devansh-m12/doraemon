// Test setup file
import { ethers } from 'ethers';

// Global test timeout
jest.setTimeout(30000);

// Mock ethers for testing
(global as any).ethers = ethers; 