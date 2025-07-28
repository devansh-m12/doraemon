import { ethers } from 'ethers'

interface SwapParams {
  ethereumSender: string
  icpRecipient: string
  amount: string
}

interface SwapResult {
  success: boolean
  orderId?: string
  preimage?: string
  hashlock?: string
  timelock?: number
  txHash?: string
  gasUsed?: string
  error?: string
}

interface SwapStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
  step: 'initiated' | 'ethereum_confirmed' | 'icp_processing' | 'completed'
  ethereumTxHash?: string
  icpTxHash?: string
  timelock?: string
  hashlock?: string
  gasUsed?: string
  blockNumber?: number
  error?: string
}

class BridgeService {
  private provider: ethers.JsonRpcProvider | null = null
  private wallet: ethers.Wallet | null = null
  private contract: ethers.Contract | null = null
  private contractAddress: string | null = null
  private isInitialized = false

  constructor() {
    // Initialize with environment variables
    this.initializeFromEnv()
  }

  private initializeFromEnv() {
    try {
      // Get network configuration from environment
      const network = process.env.NEXT_PUBLIC_NETWORK || 'local'
      const rpcUrl = network === 'local' 
        ? process.env.NEXT_PUBLIC_LOCAL_RPC_URL 
        : process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL
      const privateKey = network === 'local'
        ? process.env.NEXT_PUBLIC_LOCAL_PRIVATE_KEY
        : process.env.NEXT_PUBLIC_SEPOLIA_PRIVATE_KEY
      this.contractAddress = network === 'local'
        ? process.env.NEXT_PUBLIC_LOCAL_CONTRACT_ADDRESS || null
        : process.env.NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS || null

      if (!rpcUrl || !privateKey || !this.contractAddress) {
        console.warn('Bridge service: Missing environment variables for real transactions')
        return
      }

      this.provider = new ethers.JsonRpcProvider(rpcUrl)
      this.wallet = new ethers.Wallet(privateKey, this.provider)
      
      // Load contract ABI (you'll need to include this in your frontend)
      const contractABI = this.getContractABI()
      this.contract = new ethers.Contract(this.contractAddress, contractABI, this.wallet)
      
      this.isInitialized = true
      console.log('Bridge service initialized for real transactions')
    } catch (error) {
      console.error('Failed to initialize bridge service:', error)
    }
  }

  private getContractABI() {
    // This is a simplified ABI for the EthereumICPBridge contract
    // In a real implementation, you'd load this from the artifacts
    return [
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "icpRecipient",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "hashlock",
            "type": "bytes32"
          },
          {
            "internalType": "uint256",
            "name": "timelock",
            "type": "uint256"
          }
        ],
        "name": "createSwap",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "orderId",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "preimage",
            "type": "bytes32"
          }
        ],
        "name": "claimSwap",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "orderId",
            "type": "bytes32"
          }
        ],
        "name": "refund",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "bytes32",
            "name": "orderId",
            "type": "bytes32"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "sender",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "bytes32",
            "name": "icpRecipient",
            "type": "bytes32"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "bytes32",
            "name": "hashlock",
            "type": "bytes32"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "timelock",
            "type": "uint256"
          }
        ],
        "name": "SwapCreated",
        "type": "event"
      }
    ]
  }

  async createSwap(params: SwapParams): Promise<SwapResult> {
    if (!this.isInitialized || !this.contract || !this.wallet) {
      return {
        success: false,
        error: 'Bridge service not initialized. Falling back to simulation.'
      }
    }

    try {
      console.log('🔄 Creating real swap transaction...')
      
      // Generate cryptographic materials
      const preimage = ethers.randomBytes(32)
      const hashlock = ethers.keccak256(preimage)
      const timelock = Math.floor(Date.now() / 1000) + 3600 // 1 hour
      
      // Convert amount to wei
      const swapAmount = ethers.parseEther(params.amount)
      
      // Convert ICP recipient to bytes32
      const icpRecipient = ethers.keccak256(ethers.toUtf8Bytes(params.icpRecipient))
      
      console.log('📋 Swap Parameters:')
      console.log('Amount:', params.amount, 'ETH')
      console.log('Hashlock:', hashlock)
      console.log('Timelock:', new Date(timelock * 1000).toISOString())
      console.log('ICP Recipient:', params.icpRecipient)
      
      // Estimate gas
      const gasEstimate = await this.contract.createSwap.estimateGas(
        icpRecipient,
        hashlock,
        timelock,
        { value: swapAmount }
      )
      
      console.log('⛽ Estimated Gas:', gasEstimate.toString())
      
      // Create the swap transaction
      const tx = await this.contract.createSwap(
        icpRecipient,
        hashlock,
        timelock,
        { 
          value: swapAmount,
          gasLimit: gasEstimate * BigInt(120) / BigInt(100) // Add 20% buffer
        }
      )
      
      console.log('📤 Transaction sent!')
      console.log('Transaction Hash:', tx.hash)
      
      // Wait for transaction confirmation
      console.log('⏳ Waiting for confirmation...')
      const receipt = await tx.wait()
      
      console.log('✅ Transaction confirmed!')
      console.log('Block Number:', receipt.blockNumber)
      console.log('Gas Used:', receipt.gasUsed.toString())
      
      // Find the SwapCreated event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.contract!.interface.parseLog(log)
          return parsed.name === 'SwapCreated'
        } catch {
          return false
        }
      })
      
      if (event) {
        const parsedEvent = this.contract!.interface.parseLog(event)
        const orderId = parsedEvent.args.orderId
        
        console.log('🎉 Swap Created Successfully!')
        console.log('Order ID:', orderId)
        
        return {
          success: true,
          orderId: orderId,
          preimage: preimage,
          hashlock: hashlock,
          timelock: timelock,
          txHash: tx.hash,
          gasUsed: receipt.gasUsed.toString()
        }
      } else {
        console.log('⚠️ No SwapCreated event found')
        return {
          success: false,
          txHash: tx.hash,
          error: 'No SwapCreated event found'
        }
      }
      
    } catch (error) {
      console.error('❌ Swap creation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async getSwapStatus(orderId: string): Promise<SwapStatus | null> {
    if (!this.isInitialized || !this.contract) {
      return null
    }

    try {
      // Get swap order from contract
      const order = await this.contract.swapOrders(orderId)
      
      return {
        status: order.completed ? 'completed' : order.refunded ? 'refunded' : 'pending',
        step: order.completed ? 'completed' : 'initiated',
        timelock: new Date(order.timelock * 1000).toISOString(),
        hashlock: order.hashlock,
        gasUsed: '0', // Not available from contract query
        blockNumber: 0 // Not available from contract query
      }
    } catch (error) {
      console.error('Failed to get swap status:', error)
      return null
    }
  }

  async checkBalance(): Promise<string | null> {
    if (!this.isInitialized || !this.wallet || !this.provider) {
      return null
    }

    try {
      const balance = await this.provider.getBalance(this.wallet.address)
      return ethers.formatEther(balance)
    } catch (error) {
      console.error('Failed to check balance:', error)
      return null
    }
  }

  isReady(): boolean {
    return this.isInitialized
  }

  getNetworkInfo() {
    if (!this.isInitialized) {
      return null
    }

    return {
      contractAddress: this.contractAddress,
      walletAddress: this.wallet?.address,
      isLocal: process.env.NEXT_PUBLIC_NETWORK === 'local'
    }
  }
}

// Create singleton instance
export const bridgeService = new BridgeService()

// Export types for use in components
export type { SwapParams, SwapResult, SwapStatus } 