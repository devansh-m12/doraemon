'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, ArrowLeft, RefreshCw, CheckCircle, Clock, AlertCircle, XCircle, Copy, ExternalLink } from 'lucide-react'
import { isValidPrincipal } from '@/utils/icp'

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
  const [amount, setAmount] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentSwap, setCurrentSwap] = useState<SwapState | null>(null)
  const [swapHistory, setSwapHistory] = useState<SwapState[]>([])

  // Mock account lists
  const ethereumAccounts: Account[] = [
    { id: '1', name: 'Main Wallet', address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', balance: '2.5 ETH', type: 'ethereum' },
    { id: '2', name: 'Trading Wallet', address: '0x70997970C51812dc3A010C7d01b50e3d17b7b6c8', balance: '1.2 ETH', type: 'ethereum' },
    { id: '3', name: 'Cold Storage', address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', balance: '5.0 ETH', type: 'ethereum' }
  ]

  const icpAccounts: Account[] = [
    { id: '1', name: 'Main Account', address: '0x94cf75948a5d11686c7cff96ce35e4be1eb9baecfed191ad06122d49398f80c9', balance: '100.5 ICP', type: 'icp' },
    { id: '2', name: 'Trading Account', address: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890', balance: '50.2 ICP', type: 'icp' },
    { id: '3', name: 'Staking Account', address: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', balance: '200.0 ICP', type: 'icp' }
  ]

  const handleSubmit = async () => {
    if (!ethereumAccount || !icpAccount || !amount) {
      alert('Please fill in all fields')
      return
    }

    if (!isValidPrincipal(icpAccount)) {
      alert('Please enter a valid ICP Principal ID')
      return
    }

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid amount')
      return
    }

    setIsSubmitting(true)

    // Create new swap
    const newSwap: SwapState = {
      id: `swap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      step: 'initiated',
      timelock: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      hashlock: `0x${Math.random().toString(16).substr(2, 64)}`,
      gasUsed: '0',
      blockNumber: 0
    }

    setCurrentSwap(newSwap)
    setSwapHistory(prev => [newSwap, ...prev])

    // Simulate swap process
    await simulateSwapProcess(newSwap)
  }

  const simulateSwapProcess = async (swap: SwapState) => {
    // Step 1: Ethereum transaction confirmation
    await new Promise(resolve => setTimeout(resolve, 2000))
    setCurrentSwap(prev => prev ? {
      ...prev,
      status: 'processing',
      step: 'ethereum_confirmed',
      ethereumTxHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      gasUsed: '179,203',
      blockNumber: Math.floor(Math.random() * 100000) + 10000
    } : null)

    // Step 2: ICP processing
    await new Promise(resolve => setTimeout(resolve, 3000))
    setCurrentSwap(prev => prev ? {
      ...prev,
      step: 'icp_processing',
      icpTxHash: `0x${Math.random().toString(16).substr(2, 64)}`
    } : null)

    // Step 3: Completion
    await new Promise(resolve => setTimeout(resolve, 2000))
    setCurrentSwap(prev => prev ? {
      ...prev,
      status: 'completed',
      step: 'completed'
    } : null)

    setIsSubmitting(false)
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Swap</h2>
            
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
              <select
                value={icpAccount}
                onChange={(e) => setIcpAccount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select ICP Account</option>
                {icpAccounts.map((account) => (
                  <option key={account.id} value={account.address}>
                    {account.name} - {account.address.slice(0, 10)}...{account.address.slice(-8)} ({account.balance})
                  </option>
                ))}
              </select>
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
              disabled={isSubmitting || !ethereumAccount || !icpAccount || !amount}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Processing Swap...
                </>
              ) : (
                <>
                  <ArrowRight className="h-5 w-5 mr-2" />
                  Create Swap
                </>
              )}
            </button>

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
                    No swaps yet. Create your first swap above.
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