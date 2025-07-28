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

  // Helper function to validate Ethereum address
  private validateEthereumAddress(address: string): boolean {
    try {
      // Check if it's a valid hex address
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        return false
      }
      // Additional validation using ethers
      ethers.getAddress(address)
      return true
    } catch {
      return false
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
      
      // Validate Ethereum address to prevent ENS resolution issues
      if (!this.validateEthereumAddress(params.ethereumSender)) {
        return {
          success: false,
          error: 'Invalid Ethereum address format. Please use a valid hex address.'
        }
      }
      
      // Generate cryptographic materials
      const preimage = ethers.randomBytes(32)
      const hashlock = ethers.keccak256(preimage)
      const timelock = Math.floor(Date.now() / 1000) + 7200 // 2 hours (must be > 1 hour per contract)
      
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
          return parsed?.name === 'SwapCreated'
        } catch {
          return false
        }
      })
      
      if (event) {
        const parsedEvent = this.contract!.interface.parseLog(event)
        if (parsedEvent) {
          const orderId = parsedEvent.args.orderId
          
          console.log('🎉 Swap Created Successfully!')
          console.log('Order ID:', orderId)
          
          return {
            success: true,
            orderId: orderId,
            preimage: ethers.hexlify(preimage),
            hashlock: hashlock,
            timelock: timelock,
            txHash: tx.hash,
            gasUsed: receipt.gasUsed.toString()
          }
        }
      }
      
      console.log('⚠️ No SwapCreated event found')
      return {
        success: false,
        txHash: tx.hash,
        error: 'No SwapCreated event found'
      }
      
    } catch (error) {
      console.error('❌ Swap creation failed:', error)
      
      // Handle ENS-related errors specifically
      if (error instanceof Error && error.message.includes('network does not support ENS')) {
        return {
          success: false,
          error: 'ENS resolution is not supported on this network. Please use a valid Ethereum address instead of an ENS name.'
        }
      }
      
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

  async getRecentTransactions(limit: number = 10): Promise<any[]> {
    if (!this.isInitialized || !this.contract || !this.provider) {
      console.warn('Bridge service not initialized, returning empty transactions')
      return []
    }

    try {
      // Get the latest block number
      const latestBlock = await this.provider.getBlockNumber()
      
      // Get events from recent blocks (last 1000 blocks)
      const fromBlock = Math.max(0, latestBlock - 1000)
      const toBlock = latestBlock
      
      console.log(`🔍 Fetching transactions from blocks ${fromBlock} to ${toBlock}`)
      
      // Get SwapCreated events
      const filter = this.contract.filters.SwapCreated()
      const events = await this.contract.queryFilter(filter, fromBlock, toBlock)
      
      const transactions = await Promise.all(
        events.slice(-limit).map(async (event) => {
          try {
            const block = await this.provider!.getBlock(event.blockNumber)
            const tx = await this.provider!.getTransaction(event.transactionHash)
            
            // Parse the event to get args
            const parsedEvent = this.contract!.interface.parseLog(event)
            if (!parsedEvent || parsedEvent.name !== 'SwapCreated') {
              return null
            }
            
            return {
              orderId: parsedEvent.args[0], // orderId
              sender: parsedEvent.args[1], // sender
              icpRecipient: parsedEvent.args[2], // icpRecipient
              amount: ethers.formatEther(parsedEvent.args[3]), // amount
              hashlock: parsedEvent.args[4], // hashlock
              timelock: new Date(Number(parsedEvent.args[5]) * 1000).toISOString(), // timelock
              transactionHash: event.transactionHash,
              blockNumber: event.blockNumber,
              timestamp: block?.timestamp ? new Date(block.timestamp * 1000).toISOString() : null,
              gasUsed: tx?.gasLimit?.toString() || '0',
              status: 'pending' // Default status, could be enhanced with contract queries
            }
          } catch (error) {
            console.error('Error processing transaction:', error)
            return null
          }
        })
      )
      
      // Filter out null results and sort by block number (newest first)
      return transactions
        .filter(tx => tx !== null)
        .sort((a, b) => b.blockNumber - a.blockNumber)
        .slice(0, limit)
        
    } catch (error) {
      console.error('Failed to get recent transactions:', error)
      return []
    }
  }

  async getContractInfo(): Promise<any> {
    if (!this.isInitialized || !this.contract) {
      return null
    }

    try {
      // Get basic contract information
      const contractAddress = this.contractAddress
      const network = process.env.NEXT_PUBLIC_NETWORK || 'local'
      
      // Try to get contract balance
      let contractBalance = '0'
      try {
        if (this.provider) {
          const balance = await this.provider.getBalance(contractAddress!)
          contractBalance = ethers.formatEther(balance)
        }
      } catch (error) {
        console.warn('Failed to get contract balance:', error)
      }

      return {
        address: contractAddress,
        network: network,
        balance: contractBalance,
        currency: 'ETH',
        isLocal: network === 'local',
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      console.error('Failed to get contract info:', error)
      return null
    }
  }

  async claimSwap(orderId: string, preimage: string): Promise<SwapResult> {
    if (!this.isInitialized || !this.contract || !this.wallet) {
      return {
        success: false,
        error: 'Bridge service not initialized. Cannot complete swap.'
      }
    }

    try {
      console.log('🔄 Completing swap with preimage...')
      console.log('Order ID:', orderId)
      console.log('Preimage:', preimage)
      
      // Convert preimage from hex string to bytes
      const preimageBytes = ethers.getBytes(preimage)
      
      // Estimate gas for claimSwap
      const gasEstimate = await this.contract.claimSwap.estimateGas(orderId, preimageBytes)
      
      console.log('⛽ Estimated Gas:', gasEstimate.toString())
      
      // Complete the swap transaction
      const tx = await this.contract.claimSwap(
        orderId,
        preimageBytes,
        { 
          gasLimit: gasEstimate * BigInt(120) / BigInt(100) // Add 20% buffer
        }
      )
      
      console.log('📤 Claim transaction sent!')
      console.log('Transaction Hash:', tx.hash)
      
      // Wait for transaction confirmation
      console.log('⏳ Waiting for confirmation...')
      const receipt = await tx.wait()
      
      console.log('✅ Swap completed successfully!')
      console.log('Block Number:', receipt.blockNumber)
      console.log('Gas Used:', receipt.gasUsed.toString())
      
      return {
        success: true,
        orderId: orderId,
        txHash: tx.hash,
        gasUsed: receipt.gasUsed.toString()
      }
      
    } catch (error) {
      console.error('❌ Swap completion failed:', error)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during swap completion'
      }
    }
  }
}

// Create singleton instance
export const bridgeService = new BridgeService()

// Export types for use in components
export type { SwapParams, SwapResult, SwapStatus } 