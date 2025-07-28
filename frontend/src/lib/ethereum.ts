import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';

export interface EthereumAccount {
  address: string;
  balance: string;
  isConnected: boolean;
}

export class EthereumService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  async connect(): Promise<EthereumAccount | null> {
    try {
      const ethereum = await detectEthereumProvider();
      
      if (!ethereum) {
        throw new Error('No Ethereum provider found');
      }

      // Request account access
      const accounts = await (ethereum as any).request({ method: 'eth_requestAccounts' });
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      this.provider = new ethers.BrowserProvider(ethereum as any);
      this.signer = await this.provider.getSigner();
      
      const address = await this.signer.getAddress();
      const balance = await this.provider.getBalance(address);
      
      return {
        address,
        balance: ethers.formatEther(balance),
        isConnected: true
      };
    } catch (error) {
      console.error('Failed to connect to Ethereum:', error);
      return null;
    }
  }

  async createAccount(): Promise<EthereumAccount | null> {
    try {
      const ethereum = await detectEthereumProvider();
      
      if (!ethereum) {
        throw new Error('No Ethereum provider found');
      }

      // Request account access (this will create a new account if none exists)
      const accounts = await (ethereum as any).request({ method: 'eth_requestAccounts' });
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      this.provider = new ethers.BrowserProvider(ethereum as any);
      this.signer = await this.provider.getSigner();
      
      const address = await this.signer.getAddress();
      const balance = await this.provider.getBalance(address);
      
      return {
        address,
        balance: ethers.formatEther(balance),
        isConnected: true
      };
    } catch (error) {
      console.error('Failed to create Ethereum account:', error);
      return null;
    }
  }

  async getAccountInfo(): Promise<EthereumAccount | null> {
    if (!this.signer) {
      return null;
    }

    try {
      const address = await this.signer.getAddress();
      const balance = await this.provider!.getBalance(address);
      
      return {
        address,
        balance: ethers.formatEther(balance),
        isConnected: true
      };
    } catch (error) {
      console.error('Failed to get account info:', error);
      return null;
    }
  }

  async disconnect(): Promise<void> {
    this.provider = null;
    this.signer = null;
  }

  getSigner(): ethers.JsonRpcSigner | null {
    return this.signer;
  }

  getProvider(): ethers.BrowserProvider | null {
    return this.provider;
  }
}

export const ethereumService = new EthereumService(); 