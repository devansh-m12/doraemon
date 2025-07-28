import { Agent, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { IDL } from '@dfinity/candid';

interface ICPSwapParams {
  ethereumSender: string;
  amount: string;
  hashlock: Uint8Array;
  timelock: number;
  crossChainId?: string;
}

interface ICPSwapResult {
  success: boolean;
  orderId?: string;
  error?: string;
  realCall: boolean;
}

interface ICPSwapOrder {
  ethereum_sender: string;
  icp_recipient: string;
  amount: number;
  hashlock: Uint8Array;
  timelock: number;
  completed: boolean;
  refunded: boolean;
  created_at: number;
  cross_chain_id?: string;
}

interface ICPBridgeConfig {
  bridge_fee_percentage: number;
  min_swap_amount: number;
  max_swap_amount: number;
  authorized_resolvers: string[];
  ethereum_contract_address: string;
  chain_fusion_enabled: boolean;
}

class ICPService {
  private agent: HttpAgent | null = null;
  private canisterId: string | null = null;
  private network: string = 'local';
  private isInitialized = false;

  constructor() {
    this.initializeFromEnv();
  }

  private initializeFromEnv() {
    try {
      // Get ICP configuration from environment
      this.canisterId = process.env.NEXT_PUBLIC_ICP_CANISTER_ID || null;
      this.network = process.env.NEXT_PUBLIC_ICP_NETWORK || 'local';

      if (!this.canisterId) {
        console.warn('ICP service: Missing ICP_CANISTER_ID environment variable');
        return;
      }

      this.initializeAgent();
      this.isInitialized = true;
      console.log('ICP service initialized for real canister calls');
    } catch (error) {
      console.error('Failed to initialize ICP service:', error);
    }
  }

  private initializeAgent() {
    try {
      const networkConfigs = {
        local: {
          host: 'http://localhost:4943',
          fetchRootKey: true
        },
        testnet: {
          host: 'https://ic0.testnet.app',
          fetchRootKey: false
        },
        mainnet: {
          host: 'https://ic0.app',
          fetchRootKey: false
        }
      };

      const config = networkConfigs[this.network as keyof typeof networkConfigs];
      if (!config) {
        throw new Error(`Unsupported ICP network: ${this.network}`);
      }

      this.agent = new HttpAgent({
        host: config.host,
        fetchRootKey: config.fetchRootKey
      });

      console.log(`✅ ICP Agent initialized for ${this.network} network`);
      console.log(`📡 Host: ${config.host}`);
      console.log(`🎯 Canister ID: ${this.canisterId}`);
    } catch (error) {
      console.error('❌ Failed to initialize ICP agent:', error);
      throw error;
    }
  }

  private async createCanisterInterface() {
    try {
      // Define the Candid interface for our canister
      const canisterIdl = IDL.Service({
        create_icp_swap: IDL.Func([IDL.Record({
          ethereum_sender: IDL.Text,
          amount: IDL.Text,
          hashlock: IDL.Vec(IDL.Nat8),
          timelock: IDL.Nat64,
          cross_chain_id: IDL.Opt(IDL.Text)
        })], [IDL.Text], ['oneway']),
        complete_icp_swap: IDL.Func([IDL.Record({
          order_id: IDL.Text,
          preimage: IDL.Vec(IDL.Nat8)
        })], [], ['oneway']),
        refund_icp_swap: IDL.Func([IDL.Record({
          order_id: IDL.Text
        })], [], ['oneway']),
        get_swap_order: IDL.Func([IDL.Text], [IDL.Record({
          ethereum_sender: IDL.Text,
          icp_recipient: IDL.Principal,
          amount: IDL.Nat64,
          hashlock: IDL.Vec(IDL.Nat8),
          timelock: IDL.Nat64,
          completed: IDL.Bool,
          refunded: IDL.Bool,
          created_at: IDL.Nat64,
          cross_chain_id: IDL.Opt(IDL.Text)
        })], ['query']),
        is_hashlock_used: IDL.Func([IDL.Vec(IDL.Nat8)], [IDL.Bool], ['query']),
        get_bridge_config_query: IDL.Func([], [IDL.Record({
          bridge_fee_percentage: IDL.Nat64,
          min_swap_amount: IDL.Nat64,
          max_swap_amount: IDL.Nat64,
          authorized_resolvers: IDL.Vec(IDL.Principal),
          ethereum_contract_address: IDL.Text,
          chain_fusion_enabled: IDL.Bool
        })], ['query']),
        process_cross_chain_message: IDL.Func([IDL.Record({
          source_chain: IDL.Text,
          target_chain: IDL.Text,
          order_id: IDL.Text,
          message_type: IDL.Text,
          payload: IDL.Vec(IDL.Nat8),
          signature: IDL.Opt(IDL.Vec(IDL.Nat8)),
          timestamp: IDL.Nat64
        })], [], ['oneway']),
        submit_ethereum_transaction: IDL.Func([IDL.Vec(IDL.Nat8)], [IDL.Text], ['oneway']),
        greet: IDL.Func([IDL.Text], [IDL.Text], ['query']),
        get_canister_status: IDL.Func([], [IDL.Text], ['query'])
      });

      const canisterId = Principal.fromText(this.canisterId!);
      
      return {
        call: async (method: string, args: any[]) => {
          if (!this.agent) {
            throw new Error('ICP agent not initialized');
          }
          
          const response = await this.agent.call(canisterId, {
            methodName: method,
            arg: canisterIdl.encode(method, args)
          });
          
          return canisterIdl.decode(method, response);
        }
      };
    } catch (error) {
      console.error('❌ Failed to create canister interface:', error);
      throw error;
    }
  }

  async createSwap(params: ICPSwapParams): Promise<ICPSwapResult> {
    if (!this.isInitialized || !this.agent) {
      return {
        success: false,
        error: 'ICP service not initialized',
        realCall: false
      };
    }

    try {
      console.log('📞 Making real ICP canister call: create_icp_swap');
      
      const request = {
        ethereum_sender: params.ethereumSender,
        amount: params.amount,
        hashlock: Array.from(params.hashlock),
        timelock: params.timelock,
        cross_chain_id: params.crossChainId || null
      };

      const canister = await this.createCanisterInterface();
      const result = await canister.call('create_icp_swap', [request]);
      
      console.log('✅ Real ICP swap created:', result);
      return {
        orderId: result,
        success: true,
        realCall: true
      };
    } catch (error) {
      console.error('❌ Real ICP create swap failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        realCall: true
      };
    }
  }

  async completeSwap(orderId: string, preimage: Uint8Array): Promise<ICPSwapResult> {
    if (!this.isInitialized || !this.agent) {
      return {
        success: false,
        error: 'ICP service not initialized',
        realCall: false
      };
    }

    try {
      console.log('📞 Making real ICP canister call: complete_icp_swap');
      
      const request = {
        order_id: orderId,
        preimage: Array.from(preimage)
      };

      const canister = await this.createCanisterInterface();
      await canister.call('complete_icp_swap', [request]);
      
      console.log('✅ Real ICP swap completed');
      return {
        success: true,
        realCall: true
      };
    } catch (error) {
      console.error('❌ Real ICP complete swap failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        realCall: true
      };
    }
  }

  async refundSwap(orderId: string): Promise<ICPSwapResult> {
    if (!this.isInitialized || !this.agent) {
      return {
        success: false,
        error: 'ICP service not initialized',
        realCall: false
      };
    }

    try {
      console.log('📞 Making real ICP canister call: refund_icp_swap');
      
      const request = {
        order_id: orderId
      };

      const canister = await this.createCanisterInterface();
      await canister.call('refund_icp_swap', [request]);
      
      console.log('✅ Real ICP swap refunded');
      return {
        success: true,
        realCall: true
      };
    } catch (error) {
      console.error('❌ Real ICP refund swap failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        realCall: true
      };
    }
  }

  async getSwapOrder(orderId: string): Promise<ICPSwapOrder | null> {
    if (!this.isInitialized || !this.agent) {
      return null;
    }

    try {
      console.log('📞 Making real ICP canister call: get_swap_order');
      
      const canister = await this.createCanisterInterface();
      const result = await canister.call('get_swap_order', [orderId]);
      
      console.log('✅ Real ICP swap order retrieved:', result);
      return result;
    } catch (error) {
      console.error('❌ Real ICP get swap order failed:', error);
      return null;
    }
  }

  async isHashlockUsed(hashlock: Uint8Array): Promise<boolean> {
    if (!this.isInitialized || !this.agent) {
      return false;
    }

    try {
      console.log('📞 Making real ICP canister call: is_hashlock_used');
      
      const canister = await this.createCanisterInterface();
      const result = await canister.call('is_hashlock_used', [Array.from(hashlock)]);
      
      console.log('✅ Real ICP hashlock check:', result);
      return result;
    } catch (error) {
      console.error('❌ Real ICP hashlock check failed:', error);
      return false;
    }
  }

  async getBridgeConfig(): Promise<ICPBridgeConfig | null> {
    if (!this.isInitialized || !this.agent) {
      return null;
    }

    try {
      console.log('📞 Making real ICP canister call: get_bridge_config_query');
      
      const canister = await this.createCanisterInterface();
      const result = await canister.call('get_bridge_config_query', []);
      
      console.log('✅ Real ICP bridge config retrieved:', result);
      return result;
    } catch (error) {
      console.error('❌ Real ICP bridge config failed:', error);
      return null;
    }
  }

  async testConnectivity(): Promise<{ success: boolean; response?: string; error?: string }> {
    if (!this.isInitialized || !this.agent) {
      return {
        success: false,
        error: 'ICP service not initialized'
      };
    }

    try {
      console.log('🧪 Testing real ICP canister connectivity...');
      
      const canister = await this.createCanisterInterface();
      const result = await canister.call('greet', ['Test']);
      
      console.log('✅ Real ICP canister responding:', result);
      return {
        success: true,
        response: result
      };
    } catch (error) {
      console.error('❌ Real ICP canister connectivity test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getCanisterStatus(): Promise<string | null> {
    if (!this.isInitialized || !this.agent) {
      return null;
    }

    try {
      const canister = await this.createCanisterInterface();
      const result = await canister.call('get_canister_status', []);
      return result;
    } catch (error) {
      console.error('❌ Failed to get canister status:', error);
      return null;
    }
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  getNetworkInfo() {
    if (!this.isInitialized) {
      return null;
    }

    return {
      canisterId: this.canisterId,
      network: this.network,
      isLocal: this.network === 'local'
    };
  }
}

// Create singleton instance
export const icpService = new ICPService();

// Export types for use in components
export type { ICPSwapParams, ICPSwapResult, ICPSwapOrder, ICPBridgeConfig }; 