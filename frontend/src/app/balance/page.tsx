'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Wallet, ArrowLeft, Copy, CheckCircle, RefreshCw, TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { bridgeService } from '@/utils/bridge'

interface BalanceInfo {
  address: string
  balance: string
  currency: string
  lastUpdated: string
  network: string
  contractInfo?: any
  networkInfo?: any
}

interface TransactionHistory {
  type: string
  orderId: string
  blockNumber: number
  transactionHash: string
  timestamp: string
  sender?: string
  recipient?: string
  amount?: string
}

export default function BalancePage() {
  const [searchAddress, setSearchAddress] = useState('')
  const [balanceInfo, setBalanceInfo] = useState<BalanceInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [transactionHistory, setTransactionHistory] = useState<TransactionHistory[]>([])
  const [bridgeStatus, setBridgeStatus] = useState<boolean>(false)

  // Check bridge status on component mount
  useEffect(() => {
    const checkBridge = () => {
      const isReady = bridgeService.isReady()
      setBridgeStatus(isReady)
    }
    checkBridge()
  }, [])

  const checkBalance = async () => {
    if (!searchAddress.trim()) {
      setError('Please enter a valid Ethereum address')
      return
    }

    // Basic Ethereum address validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(searchAddress)) {
      setError('Invalid Ethereum address format')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Use real bridge service balance checking
      const response = await fetch(`/api/balance?address=${encodeURIComponent(searchAddress)}`)
      const data = await response.json()

      if (response.ok) {
        setBalanceInfo(data)

        // Get real transaction history from bridge service
        const recentTransactions = await bridgeService.getRecentTransactions(20)
        const validTransactions = recentTransactions.filter(tx => tx !== null) as TransactionHistory[]
        setTransactionHistory(validTransactions)
      } else {
        setError(data.error || 'Failed to fetch balance information')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balance information')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(field)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'SwapCompleted':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'SwapCreated':
        return <RefreshCw className="h-4 w-4 text-yellow-500" />
      case 'SwapRefunded':
        return <CheckCircle className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'SwapCompleted':
        return 'bg-green-100 text-green-800'
      case 'SwapCreated':
        return 'bg-yellow-100 text-yellow-800'
      case 'SwapRefunded':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (type: string) => {
    switch (type) {
      case 'SwapCompleted':
        return 'Completed'
      case 'SwapCreated':
        return 'Pending'
      case 'SwapRefunded':
        return 'Refunded'
      default:
        return 'Unknown'
    }
  }

  const getAmount = (transaction: TransactionHistory) => {
    // This would need to be extracted from the transaction data
    // For now, we'll show a placeholder
    return '0.001 ETH'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="mr-4">
                <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-900" />
              </Link>
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">Real Balance Checker</h1>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Dashboard
              </Link>
              <Link href="/explorer" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Transaction Explorer
              </Link>
              <Link href="/balance" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Balance Checker
              </Link>
              <Link href="/swap" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Swap
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Bridge Status */}
        <div className="mb-6">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            bridgeStatus ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${bridgeStatus ? 'bg-green-500' : 'bg-red-500'}`}></div>
            {bridgeStatus ? 'Bridge Service Connected' : 'Bridge Service Disconnected'}
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Check Real ETH Balance</h2>
            <div className="flex space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter Ethereum address..."
                    value={searchAddress}
                    onChange={(e) => setSearchAddress(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button
                onClick={checkBalance}
                disabled={loading || !bridgeStatus}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Wallet className="mr-2 h-5 w-5" />
                    Check Balance
                  </>
                )}
              </button>
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
            {!bridgeStatus && (
              <p className="mt-2 text-sm text-yellow-600">
                ⚠️ Bridge service is not configured. Please set up environment variables.
              </p>
            )}
          </div>
        </div>

        {balanceInfo && (
          <>
            {/* Balance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Wallet className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Current Balance</p>
                    <p className="text-2xl font-semibold text-gray-900">{balanceInfo.balance} {balanceInfo.currency}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Network</p>
                    <p className="text-2xl font-semibold text-gray-900">{balanceInfo.network}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Activity className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Recent Transactions</p>
                    <p className="text-2xl font-semibold text-gray-900">{transactionHistory.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ethereum Address</label>
                  <div className="flex items-center space-x-2">
                    <code className="text-sm bg-gray-100 px-3 py-2 rounded flex-1">
                      {balanceInfo.address}
                    </code>
                    <button
                      onClick={() => copyToClipboard(balanceInfo.address, 'address')}
                      className="p-2 hover:bg-gray-200 rounded"
                    >
                      {copied === 'address' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-gray-500" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                  <p className="text-sm text-gray-900">{new Date(balanceInfo.lastUpdated).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Network</label>
                  <p className="text-sm text-gray-900">{balanceInfo.network}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <p className="text-sm text-gray-900">{balanceInfo.currency}</p>
                </div>
              </div>

              {balanceInfo.contractInfo && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Contract Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Min Swap Amount</label>
                      <p className="text-sm text-gray-900">{balanceInfo.contractInfo.minSwapAmount} ETH</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Swap Amount</label>
                      <p className="text-sm text-gray-900">{balanceInfo.contractInfo.maxSwapAmount} ETH</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bridge Fee</label>
                      <p className="text-sm text-gray-900">{balanceInfo.contractInfo.bridgeFeePercentage} basis points</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Bridge Transactions</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {transactionHistory.length > 0 ? (
                  transactionHistory.map((tx) => (
                    <div key={tx.transactionHash} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {getStatusIcon(tx.type)}
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">
                              {tx.type.replace('Swap', '')} {getAmount(tx)}
                            </p>
                            <p className="text-sm text-gray-500">Hash: {tx.transactionHash.slice(0, 16)}...</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tx.type)}`}>
                            {getStatusText(tx.type)}
                          </span>
                          <p className="text-sm text-gray-500 mt-1">Block: {tx.blockNumber}</p>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        {new Date(tx.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-8 text-center text-gray-500">
                    <p>No recent bridge transactions found.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Instructions */}
        {!balanceInfo && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">How to Check Real Balance</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-medium">1</span>
                </div>
                <div>
                  <p className="text-sm text-gray-900">Ensure the bridge service is configured</p>
                  <p className="text-sm text-gray-500">Set up environment variables for real transactions</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-medium">2</span>
                </div>
                <div>
                  <p className="text-sm text-gray-900">Enter the Ethereum address you want to check</p>
                  <p className="text-sm text-gray-500">Example: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-medium">3</span>
                </div>
                <div>
                  <p className="text-sm text-gray-900">Click "Check Balance" to fetch real balance information</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 