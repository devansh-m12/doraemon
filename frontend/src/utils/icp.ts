import { Actor, HttpAgent } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'

// ICP Network Configuration
export const ICP_NETWORKS = {
  mainnet: {
    host: 'https://ic0.app',
    canisterId: 'ryjl3-tyaaa-aaaaa-aaaba-cai' // Ledger canister
  },
  testnet: {
    host: 'https://ic0.testnet.dfinity.network',
    canisterId: 'ryjl3-tyaaa-aaaaa-aaaba-cai'
  }
}

// Bridge Canister Configuration
export const BRIDGE_CANISTER = {
  mainnet: '2tvx6-uqaaa-aaaab-qaclq-cai',
  testnet: '2tvx6-uqaaa-aaaab-qaclq-cai'
}

export interface ICPBalance {
  principal: string
  balance: number
  currency: string
  lastUpdated: string
  transactions: number
  incoming: number
  outgoing: number
}

export interface ICPTransaction {
  id: string
  type: 'Swap Created' | 'Swap Completed' | 'Swap Refunded' | 'Balance Transfer'
  amount: string
  status: 'Pending' | 'Completed' | 'Refunded' | 'Failed'
  timestamp: string
  recipient: string
  sender: string
  hashlock?: string
  timelock?: string
  gasUsed?: string
  blockNumber?: number
}

// Initialize ICP Agent
export const createICPAgent = (network: 'mainnet' | 'testnet' = 'mainnet') => {
  const config = ICP_NETWORKS[network]
  const agent = new HttpAgent({ host: config.host })
  
  // For production, you would add identity here
  // agent.replaceIdentity(identity)
  
  return agent
}

// Check ICP Balance
export const checkICPBalance = async (
  principalId: string,
  network: 'mainnet' | 'testnet' = 'mainnet'
): Promise<ICPBalance> => {
  try {
    // Validate principal ID
    const principal = Principal.fromText(principalId)
    
    // For demo purposes, return mock data
    // In production, you would query the ICP ledger canister
    return {
      principal: principalId,
      balance: 1000.0,
      currency: 'ICP',
      lastUpdated: new Date().toISOString(),
      transactions: 42,
      incoming: 15,
      outgoing: 27
    }
  } catch (error) {
    throw new Error(`Invalid principal ID: ${principalId}`)
  }
}

// Get Transaction History
export const getTransactionHistory = async (
  principalId: string,
  network: 'mainnet' | 'testnet' = 'mainnet'
): Promise<ICPTransaction[]> => {
  try {
    // Validate principal ID
    const principal = Principal.fromText(principalId)
    
    // For demo purposes, return mock data
    // In production, you would query the ICP ledger canister
    return [
      {
        id: '0x235dfe7fd1b68dedf148ca616fae70df5f7a6570a4b42cff55534a3dbe92ffae',
        type: 'Swap Created',
        amount: '0.001 ETH',
        status: 'Pending',
        timestamp: '2025-07-28T08:41:57.000Z',
        recipient: '0x94cf75948a5d11686c7cff96ce35e4be1eb9baecfed191ad06122d49398f80c9',
        sender: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        hashlock: '0x332478b2ad7b1c3e56260c340529a16372a87d3db64c496d651a1ba131d363ab',
        timelock: '2025-07-28T08:41:57.000Z',
        gasUsed: '179,203',
        blockNumber: 12345
      },
      {
        id: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        type: 'Swap Completed',
        amount: '0.005 ETH',
        status: 'Completed',
        timestamp: '2025-07-28T07:30:15.000Z',
        recipient: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        sender: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        gasUsed: '156,789',
        blockNumber: 12344
      }
    ]
  } catch (error) {
    throw new Error(`Invalid principal ID: ${principalId}`)
  }
}

// Get Bridge Canister Transactions
export const getBridgeTransactions = async (
  network: 'mainnet' | 'testnet' = 'mainnet'
): Promise<ICPTransaction[]> => {
  try {
    const canisterId = BRIDGE_CANISTER[network]
    
    // For demo purposes, return mock data
    // In production, you would query the bridge canister
    return [
      {
        id: '0x235dfe7fd1b68dedf148ca616fae70df5f7a6570a4b42cff55534a3dbe92ffae',
        type: 'Swap Created',
        amount: '0.001 ETH',
        status: 'Pending',
        timestamp: '2025-07-28T08:41:57.000Z',
        recipient: '0x94cf75948a5d11686c7cff96ce35e4be1eb9baecfed191ad06122d49398f80c9',
        sender: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        hashlock: '0x332478b2ad7b1c3e56260c340529a16372a87d3db64c496d651a1ba131d363ab',
        timelock: '2025-07-28T08:41:57.000Z',
        gasUsed: '179,203',
        blockNumber: 12345
      },
      {
        id: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        type: 'Swap Completed',
        amount: '0.005 ETH',
        status: 'Completed',
        timestamp: '2025-07-28T07:30:15.000Z',
        recipient: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        sender: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        gasUsed: '156,789',
        blockNumber: 12344
      },
      {
        id: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        type: 'Swap Refunded',
        amount: '0.002 ETH',
        status: 'Refunded',
        timestamp: '2025-07-28T06:15:42.000Z',
        recipient: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        sender: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        gasUsed: '98,432',
        blockNumber: 12343
      },
      {
        id: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
        type: 'Balance Transfer',
        amount: '0.010 ETH',
        status: 'Completed',
        timestamp: '2025-07-28T05:45:20.000Z',
        recipient: '0xfedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210',
        sender: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
        gasUsed: '210,567',
        blockNumber: 12342
      }
    ]
  } catch (error) {
    throw new Error(`Failed to fetch bridge transactions: ${error}`)
  }
}

// Validate Principal ID
export const isValidPrincipal = (principalId: string): boolean => {
  try {
    Principal.fromText(principalId)
    return true
  } catch {
    return false
  }
}

// Format ICP Amount
export const formatICPAmount = (amount: number): string => {
  return `${amount.toFixed(8)} ICP`
}

// Get Transaction Status Color
export const getTransactionStatusColor = (status: string): string => {
  switch (status) {
    case 'Completed':
      return 'bg-green-100 text-green-800'
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'Refunded':
      return 'bg-red-100 text-red-800'
    case 'Failed':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Get Transaction Type Icon
export const getTransactionTypeIcon = (type: string): string => {
  switch (type) {
    case 'Swap Created':
      return '🔄'
    case 'Swap Completed':
      return '✅'
    case 'Swap Refunded':
      return '↩️'
    case 'Balance Transfer':
      return '💸'
    default:
      return '📄'
  }
} 