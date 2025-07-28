import { AuthClient } from '@dfinity/auth-client';
import { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

export interface ICPAccount {
  principal: string;
  isConnected: boolean;
}

export class ICPService {
  private authClient: AuthClient | null = null;
  private identity: Identity | null = null;

  async connect(): Promise<ICPAccount | null> {
    try {
      this.authClient = await AuthClient.create();
      
      const isAuthenticated = await this.authClient.isAuthenticated();
      
      if (!isAuthenticated) {
        // For demo purposes, we'll create a new identity
        // In production, you'd want to use Internet Identity
        await this.authClient.login({
          identityProvider: 'https://identity.ic0.app',
          onSuccess: () => {
            console.log('Successfully authenticated with Internet Identity');
          },
          onError: (error) => {
            console.error('Authentication failed:', error);
          }
        });
      }

      this.identity = this.authClient.getIdentity();
      const principal = this.identity.getPrincipal();
      
      return {
        principal: principal.toText(),
        isConnected: true
      };
    } catch (error) {
      console.error('Failed to connect to ICP:', error);
      return null;
    }
  }

  async createAccount(): Promise<ICPAccount | null> {
    try {
      this.authClient = await AuthClient.create();
      
      // Create a new anonymous identity for demo purposes
      // In production, you'd want to use Internet Identity
      this.identity = this.authClient.getIdentity();
      const principal = this.identity.getPrincipal();
      
      return {
        principal: principal.toText(),
        isConnected: true
      };
    } catch (error) {
      console.error('Failed to create ICP account:', error);
      return null;
    }
  }

  async getAccountInfo(): Promise<ICPAccount | null> {
    if (!this.identity) {
      return null;
    }

    try {
      const principal = this.identity.getPrincipal();
      
      return {
        principal: principal.toText(),
        isConnected: true
      };
    } catch (error) {
      console.error('Failed to get ICP account info:', error);
      return null;
    }
  }

  async disconnect(): Promise<void> {
    if (this.authClient) {
      await this.authClient.logout();
    }
    this.authClient = null;
    this.identity = null;
  }

  getIdentity(): Identity | null {
    return this.identity;
  }

  getAuthClient(): AuthClient | null {
    return this.authClient;
  }
}

export const icpService = new ICPService(); 