import { ethers } from 'ethers';

/**
 * Utility functions for generating real raw transactions for testing
 */
export class TransactionUtils {
  /**
   * Generate a real raw transaction for testing purposes
   * @param chainId - The chain ID for the transaction
   * @param options - Optional transaction parameters
   * @returns Promise<string> - The signed raw transaction hex string
   */
  static async generateTestRawTransaction(
    chainId: number,
    options: {
      to?: string;
      value?: bigint;
      gasLimit?: bigint;
      gasPrice?: bigint;
      nonce?: number;
    } = {}
  ): Promise<string> {
    // Create a test wallet
    const wallet = ethers.Wallet.createRandom();
    
    // Default transaction parameters
    const transaction = {
      to: options.to || wallet.address, // Default to self-transfer
      value: options.value || ethers.parseEther('0'),
      gasLimit: options.gasLimit || 21000n,
      gasPrice: options.gasPrice || ethers.parseUnits('20', 'gwei'),
      nonce: options.nonce || 0,
      chainId: chainId
    };
    
    // Sign the transaction
    const signedTx = await wallet.signTransaction(transaction);
    return signedTx;
  }

  /**
   * Generate multiple test raw transactions for different chains
   * @param chainIds - Array of chain IDs to generate transactions for
   * @returns Promise<Map<number, string>> - Map of chain ID to raw transaction
   */
  static async generateTestRawTransactions(chainIds: number[]): Promise<Map<number, string>> {
    const transactions = new Map<number, string>();
    
    for (const chainId of chainIds) {
      const rawTx = await this.generateTestRawTransaction(chainId);
      transactions.set(chainId, rawTx);
    }
    
    return transactions;
  }

  /**
   * Validate if a transaction hex string is properly formatted
   * @param rawTransaction - The raw transaction hex string
   * @returns boolean - True if valid format
   */
  static isValidRawTransaction(rawTransaction: string): boolean {
    if (!rawTransaction.startsWith('0x')) {
      return false;
    }
    
    if (rawTransaction.length < 10) {
      return false;
    }
    
    // Check if it's a valid hex string
    const hexRegex = /^0x[0-9a-fA-F]+$/;
    return hexRegex.test(rawTransaction);
  }

  /**
   * Parse transaction details from a raw transaction
   * @param rawTransaction - The raw transaction hex string
   * @returns object - Parsed transaction details
   */
  static parseTransaction(rawTransaction: string): {
    isValid: boolean;
    length: number;
    estimatedType: string;
    error?: string;
  } {
    if (!this.isValidRawTransaction(rawTransaction)) {
      return {
        isValid: false,
        length: 0,
        estimatedType: 'Invalid',
        error: 'Invalid hex format'
      };
    }

    const txLength = rawTransaction.length - 2; // Remove 0x prefix
    
    let estimatedType = 'Unknown';
    if (txLength === 130) {
      estimatedType = 'Legacy transaction (EIP-155)';
    } else if (txLength > 130) {
      estimatedType = 'EIP-1559 transaction (with access list or other extensions)';
    }

    return {
      isValid: true,
      length: txLength,
      estimatedType
    };
  }
} 