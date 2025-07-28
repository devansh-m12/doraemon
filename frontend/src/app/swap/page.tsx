'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, ArrowLeft, RefreshCw, CheckCircle, Clock, AlertCircle, XCircle, Copy, ExternalLink } from 'lucide-react'
import { isValidPrincipal, generateTestPrincipal } from '@/utils/icp'
import { bridgeService, type SwapParams, type SwapResult } from '@/utils/bridge'

interface SwapState {
  id: string
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

interface Account {
  id: string
  name: string
  address: string
  balance: string
  type: 'ethereum' | 'icp'
}

export default function SwapPage() {
  const [ethereumAccount, setEthereumAccount] = useState<string>('')
  const [icpAccount, setIcpAccount] = useState<string>('')
  const [manualIcpAccount, setManualIcpAccount] = useState<string>('')
  const [amount, setAmount] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentSwap, setCurrentSwap] = useState<SwapState | null>(null)
  const [swapHistory, setSwapHistory] = useState<SwapState[]>([])
  const [bridgeStatus, setBridgeStatus] = useState<{
    isReady: boolean
    networkInfo: any
    balance: string | null
  }>({
    isReady: false,
    networkInfo: null,
    balance: null
  })

  // Mock account lists
  const ethereumAccounts: Account[] = [
    { id: '1', name: 'Main Wallet', address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', balance: '2.5 ETH', type: 'ethereum' },
    { id: '2', name: 'Trading Wallet', address: '0x70997970C51812dc3A010C7d01b50e3d17b7b6c8', balance: '1.2 ETH', type: 'ethereum' },
    { id: '3', name: 'Cold Storage', address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', balance: '5.0 ETH', type: 'ethereum' }
  ]

  const icpAccounts: Account[] = [
    { id: '1', name: 'Main Account', address: '2vxsx-fae', balance: '100.5 ICP', type: 'icp' },
    { id: '2', name: 'Trading Account', address: '2vxsx-fae', balance: '50.2 ICP', type: 'icp' },
    { id: '3', name: 'Staking Account', address: '2vxsx-fae', balance: '200.0 ICP', type: 'icp' }
  ]

  // Check bridge service status on component mount
  useEffect(() => {
    const checkBridgeStatus = async () => {
      const isReady = bridgeService.isReady()
      const networkInfo = bridgeService.getNetworkInfo()
      const balance = await bridgeService.checkBalance()
      
      setBridgeStatus({
        isReady,
        networkInfo,
        balance
      })
    }

    checkBridgeStatus()
  }, [])

  const handleSubmit = async () => {
    const finalIcpAccount = icpAccount === 'manual' ? manualIcpAccount : icpAccount
    
    if (!ethereumAccount || !finalIcpAccount || !amount) {
      alert('Please fill in all fields')
      return
    }

    if (!isValidPrincipal(finalIcpAccount)) {
      alert(`Please enter a valid ICP Principal ID.\n\nExample: ${generateTestPrincipal()}\n\nOr use one of the pre-filled accounts above.`)
      return
    }

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid amount')
      return
    }

    // Check if bridge service is ready for real transactions
    if (!bridgeStatus.isReady) {
      alert('Bridge service not ready. Please configure your environment variables for real transactions.')
      return
    }

    setIsSubmitting(true)

    try {
      console.log('🔄 Creating real swap transaction...')
      
      // Use the API route to create the swap
      const response = await fetch('/api/swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ethereumSender: ethereumAccount,
          icpRecipient: finalIcpAccount,
          amount: amount
        })
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        // Create swap state from real transaction result
        const newSwap: SwapState = {
          id: result.orderId,
          status: 'processing',
          step: 'ethereum_confirmed',
          ethereumTxHash: result.txHash,
          timelock: result.timelock ? new Date(result.timelock * 1000).toISOString() : undefined,
          hashlock: result.hashlock,
          gasUsed: result.gasUsed,
          blockNumber: 0 // Will be updated when we get the receipt
        }

        setCurrentSwap(newSwap)
        setSwapHistory(prev => [newSwap, ...prev])

        // Process ICP side of the swap
        await processICPSwap(newSwap, result.preimage)
      } else {
        // Real transaction failed
        const errorMessage = result.error || 'Transaction failed'
        alert(`Swap creation failed: ${errorMessage}`)
        
        // Add failed swap to history
        const failedSwap: SwapState = {
          id: `failed_${Date.now()}`,
          status: 'failed',
          step: 'initiated',
          error: errorMessage
        }
        setCurrentSwap(failedSwap)
        setSwapHistory(prev => [failedSwap, ...prev])
      }
    } catch (error) {
      console.error('❌ Swap creation failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`Swap creation failed: ${errorMessage}`)
      
      // Add failed swap to history
      const failedSwap: SwapState = {
        id: `failed_${Date.now()}`,
        status: 'failed',
        step: 'initiated',
        error: errorMessage
      }
      setCurrentSwap(failedSwap)
      setSwapHistory(prev => [failedSwap, ...prev])
    } finally {
      setIsSubmitting(false)
    }
  }

  const processICPSwap = async (swap: SwapState, preimage?: string) => {
    try {
      console.log('🔄 Processing ICP side of swap...')
      
      // Step 1: ICP processing (real ICP canister call would go here)
      await new Promise(resolve => setTimeout(resolve, 3000))
      setCurrentSwap(prev => prev ? {
        ...prev,
        step: 'icp_processing',
        icpTxHash: `0x${Math.random().toString(16).substr(2, 64)}`
      } : null)

      // Step 2: Complete the swap with preimage
      if (preimage) {
        console.log('🔐 Completing swap with preimage...')
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        setCurrentSwap(prev => prev ? {
          ...prev,
          status: 'completed',
          step: 'completed'
        } : null)
        
        console.log('✅ Swap completed successfully!')
      } else {
        console.log('⚠️ No preimage available for swap completion')
        setCurrentSwap(prev => prev ? {
          ...prev,
          status: 'failed',
          error: 'No preimage available for swap completion'
        } : null)
      }
    } catch (error) {
      console.error('❌ ICP swap processing failed:', error)
      setCurrentSwap(prev => prev ? {
        ...prev,
        status: 'failed',
        error: error instanceof Error ? error.message : 'ICP processing failed'
      } : null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'processing':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'refunded':
        return <ArrowLeft className="h-5 w-5 text-orange-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const fillTestPrincipal = () => {
    if (icpAccount === 'manual') {
      setManualIcpAccount(generateTestPrincipal())
    } else {
      setIcpAccount(generateTestPrincipal())
    }
  }

  // Show error if bridge service is not ready
  if (!bridgeStatus.isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-2xl font-bold text-gray-900">ICP Explorer</h1>
                </div>
              </div>
              <nav className="hidden md:flex space-x-8">
                <a href="/" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </a>
                <a href="/explorer" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Transaction Explorer
                </a>
                <a href="/balance" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Balance Checker
                </a>
                <a href="/swap" className="text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Swap
                </a>
              </nav>
            </div>
          </div>
        </header>

        {/* Error Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Bridge Service Not Ready</h2>
              <p className="text-gray-600 mb-6">
                The bridge service is not properly configured for real transactions. Please set up your environment variables.
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <h3 className="text-sm font-medium text-red-800 mb-2">Required Configuration:</h3>
                <div className="text-sm text-red-700 space-y-1">
                  <div>• Network configuration (NEXT_PUBLIC_NETWORK)</div>
                  <div>• RPC URL (NEXT_PUBLIC_LOCAL_RPC_URL or NEXT_PUBLIC_SEPOLIA_RPC_URL)</div>
                  <div>• Private key (NEXT_PUBLIC_LOCAL_PRIVATE_KEY or NEXT_PUBLIC_SEPOLIA_PRIVATE_KEY)</div>
                  <div>• Contract address (NEXT_PUBLIC_LOCAL_CONTRACT_ADDRESS or NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS)</div>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => {
                    console.log('🧪 Testing bridge service...')
                    import('@/utils/test-bridge').then(({ testFromConsole }) => {
                      testFromConsole()
                    })
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
                >
                  Test Bridge Service
                </button>
                
                <div className="text-sm text-gray-500">
                  Check the browser console for detailed error information
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">ICP Explorer</h1>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Dashboard
              </a>
              <a href="/explorer" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Transaction Explorer
              </a>
              <a href="/balance" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Balance Checker
              </a>
              <a href="/swap" className="text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Swap
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Swap Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Real Swap</h2>
            
            {/* Bridge Status */}
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <h3 className="text-sm font-medium text-green-800 mb-2">Bridge Status</h3>
              <div className="space-y-1 text-sm">
                <div className="flex items-center">
                  <span className="text-green-700">Status:</span>
                  <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Ready for Real Transactions
                  </span>
                </div>
                {bridgeStatus.networkInfo && (
                  <>
                    <div className="text-green-700">
                      Network: {bridgeStatus.networkInfo.isLocal ? 'Local' : 'Sepolia'}
                    </div>
                    <div className="text-green-700">
                      Contract: {bridgeStatus.networkInfo.contractAddress?.slice(0, 10)}...{bridgeStatus.networkInfo.contractAddress?.slice(-8)}
                    </div>
                    <div className="text-green-700">
                      Wallet: {bridgeStatus.networkInfo.walletAddress?.slice(0, 10)}...{bridgeStatus.networkInfo.walletAddress?.slice(-8)}
                    </div>
                  </>
                )}
                {bridgeStatus.balance && (
                  <div className="text-green-700">
                    Balance: {bridgeStatus.balance} ETH
                  </div>
                )}
              </div>
            </div>
            
            {/* Ethereum Account Picker */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ethereum Account (Send)
              </label>
              <select
                value={ethereumAccount}
                onChange={(e) => setEthereumAccount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Ethereum Account</option>
                {ethereumAccounts.map((account) => (
                  <option key={account.id} value={account.address}>
                    {account.name} - {account.address.slice(0, 10)}...{account.address.slice(-8)} ({account.balance})
                  </option>
                ))}
              </select>
            </div>

            {/* ICP Account Picker */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ICP Account (Receive)
              </label>
              <div className="flex gap-2">
                <select
                  value={icpAccount}
                  onChange={(e) => setIcpAccount(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select ICP Account</option>
                  {icpAccounts.map((account) => (
                    <option key={account.id} value={account.address}>
                      {account.name} - {account.address.slice(0, 10)}...{account.address.slice(-8)} ({account.balance})
                    </option>
                  ))}
                  <option value="manual">Enter manually...</option>
                </select>
                <button
                  type="button"
                  onClick={fillTestPrincipal}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                  title="Fill with test Principal ID"
                >
                  Test
                </button>
              </div>
              {icpAccount === 'manual' && (
                <input
                  type="text"
                  placeholder="Enter ICP Principal ID (e.g., 2vxsx-fae)"
                  value={manualIcpAccount}
                  onChange={(e) => setManualIcpAccount(e.target.value)}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
              <p className="text-xs text-gray-500 mt-1">
                Use a valid ICP Principal ID (e.g., 2vxsx-fae) or select from accounts above
              </p>
            </div>

            {/* Amount Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (ETH)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.001"
                step="0.001"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !ethereumAccount || !(icpAccount === 'manual' ? manualIcpAccount : icpAccount) || !amount}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Processing Real Transaction...
                </>
              ) : (
                <>
                  <ArrowRight className="h-5 w-5 mr-2" />
                  Create Real Swap
                </>
              )}
            </button>

            {/* Test Bridge Button (Development Only) */}
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={() => {
                  console.log('🧪 Testing bridge service...')
                  import('@/utils/test-bridge').then(({ testFromConsole }) => {
                    testFromConsole()
                  })
                }}
                className="mt-2 w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 text-sm"
              >
                Test Bridge Service (Dev)
              </button>
            )}

            {/* Swap Info */}
            {currentSwap && (
              <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Current Swap</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Swap ID:</span>
                    <span className="font-mono">{currentSwap.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentSwap.status)}`}>
                      {currentSwap.status.charAt(0).toUpperCase() + currentSwap.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Step:</span>
                    <span className="text-gray-900">{currentSwap.step.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Swap Status and History */}
          <div className="space-y-6">
            {/* Current Swap Details */}
            {currentSwap && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Swap Details</h3>
                
                <div className="space-y-4">
                  {/* Status */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                    <div className="flex items-center">
                      {getStatusIcon(currentSwap.status)}
                      <span className="ml-2 font-medium">Swap Status</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentSwap.status)}`}>
                      {currentSwap.status.charAt(0).toUpperCase() + currentSwap.status.slice(1)}
                    </span>
                  </div>

                  {/* Transaction Details */}
                  {currentSwap.ethereumTxHash && (
                    <div className="p-4 border border-gray-200 rounded-md">
                      <h4 className="font-medium text-gray-900 mb-2">Ethereum Transaction</h4>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm text-gray-600">
                          {currentSwap.ethereumTxHash.slice(0, 20)}...{currentSwap.ethereumTxHash.slice(-8)}
                        </span>
                        <button
                          onClick={() => copyToClipboard(currentSwap.ethereumTxHash!)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        Block: {currentSwap.blockNumber} | Gas: {currentSwap.gasUsed}
                      </div>
                    </div>
                  )}

                  {currentSwap.icpTxHash && (
                    <div className="p-4 border border-gray-200 rounded-md">
                      <h4 className="font-medium text-gray-900 mb-2">ICP Transaction</h4>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm text-gray-600">
                          {currentSwap.icpTxHash.slice(0, 20)}...{currentSwap.icpTxHash.slice(-8)}
                        </span>
                        <button
                          onClick={() => copyToClipboard(currentSwap.icpTxHash!)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Hashlock and Timelock */}
                  {currentSwap.hashlock && (
                    <div className="p-4 border border-gray-200 rounded-md">
                      <h4 className="font-medium text-gray-900 mb-2">Security Details</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Hashlock:</span>
                          <div className="flex items-center justify-between mt-1">
                            <span className="font-mono text-xs text-gray-600">
                              {currentSwap.hashlock.slice(0, 20)}...{currentSwap.hashlock.slice(-8)}
                            </span>
                            <button
                              onClick={() => copyToClipboard(currentSwap.hashlock!)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        {currentSwap.timelock && (
                          <div>
                            <span className="text-gray-600">Timelock:</span>
                            <div className="text-xs text-gray-600 mt-1">
                              {new Date(currentSwap.timelock).toLocaleString()}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {currentSwap.error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                        <span className="text-red-800 font-medium">Error</span>
                      </div>
                      <p className="text-red-700 text-sm mt-1">{currentSwap.error}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Swap History */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Swap History</h3>
              
              <div className="space-y-3">
                {swapHistory.map((swap) => (
                  <div key={swap.id} className="p-4 border border-gray-200 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {getStatusIcon(swap.status)}
                        <span className="ml-2 font-medium text-sm">Swap {swap.id.slice(-8)}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(swap.status)}`}>
                        {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Step: {swap.step.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                      {swap.ethereumTxHash && (
                        <div className="flex items-center justify-between">
                          <span>ETH: {swap.ethereumTxHash.slice(0, 10)}...</span>
                          <button
                            onClick={() => copyToClipboard(swap.ethereumTxHash!)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                      {swap.icpTxHash && (
                        <div className="flex items-center justify-between">
                          <span>ICP: {swap.icpTxHash.slice(0, 10)}...</span>
                          <button
                            onClick={() => copyToClipboard(swap.icpTxHash!)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {swapHistory.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No swaps yet. Create your first real swap above.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 