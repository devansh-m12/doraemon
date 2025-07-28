'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Wallet, ArrowLeft, Copy, CheckCircle, RefreshCw, TrendingUp, TrendingDown, Activity } from 'lucide-react'

interface BalanceInfo {
  principal: string
  balance: number
  currency: string
  lastUpdated: string
  transactions: number
  incoming: number
  outgoing: number
}

interface TransactionHistory {
  id: string
  type: 'incoming' | 'outgoing'
  amount: number
  timestamp: string
  counterparty: string
  status: 'completed' | 'pending' | 'failed'
}

export default function BalancePage() {
  const [searchAddress, setSearchAddress] = useState('')
  const [balanceInfo, setBalanceInfo] = useState<BalanceInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [transactionHistory, setTransactionHistory] = useState<TransactionHistory[]>([])

  // Mock data for demonstration
  const mockBalanceData: BalanceInfo = {
    principal: '0x94cf75948a5d11686c7cff96ce35e4be1eb9baecfed191ad06122d49398f80c9',
    balance: 1000.0,
    currency: 'ICP',
    lastUpdated: new Date().toISOString(),
    transactions: 42,
    incoming: 15,
    outgoing: 27
  }

  const mockTransactionHistory: TransactionHistory[] = [
    {
      id: '0x235dfe7fd1b68dedf148ca616fae70df5f7a6570a4b42cff55534a3dbe92ffae',
      type: 'incoming',
      amount: 0.001,
      timestamp: '2025-07-28T08:41:57.000Z',
      counterparty: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      status: 'completed'
    },
    {
      id: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      type: 'outgoing',
      amount: 0.005,
      timestamp: '2025-07-28T07:30:15.000Z',
      counterparty: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      status: 'completed'
    },
    {
      id: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      type: 'incoming',
      amount: 0.002,
      timestamp: '2025-07-28T06:15:42.000Z',
      counterparty: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      status: 'pending'
    }
  ]

  const checkBalance = async () => {
    if (!searchAddress.trim()) {
      setError('Please enter a valid ICP address')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // For demo purposes, use mock data
      setBalanceInfo(mockBalanceData)
      setTransactionHistory(mockTransactionHistory)
    } catch (err) {
      setError('Failed to fetch balance information')
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <RefreshCw className="h-4 w-4 text-yellow-500" />
      case 'failed':
        return <CheckCircle className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
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
                <h1 className="text-2xl font-bold text-gray-900">Balance Checker</h1>
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
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Check ICP Balance</h2>
            <div className="flex space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter ICP address (Principal ID)..."
                    value={searchAddress}
                    onChange={(e) => setSearchAddress(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button
                onClick={checkBalance}
                disabled={loading}
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
                    <p className="text-sm font-medium text-gray-500">Incoming Transactions</p>
                    <p className="text-2xl font-semibold text-gray-900">{balanceInfo.incoming}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingDown className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Outgoing Transactions</p>
                    <p className="text-2xl font-semibold text-gray-900">{balanceInfo.outgoing}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Principal ID</label>
                  <div className="flex items-center space-x-2">
                    <code className="text-sm bg-gray-100 px-3 py-2 rounded flex-1">
                      {balanceInfo.principal}
                    </code>
                    <button
                      onClick={() => copyToClipboard(balanceInfo.principal, 'principal')}
                      className="p-2 hover:bg-gray-200 rounded"
                    >
                      {copied === 'principal' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-gray-500" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                  <p className="text-sm text-gray-900">{new Date(balanceInfo.lastUpdated).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Transactions</label>
                  <p className="text-sm text-gray-900">{balanceInfo.transactions}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <p className="text-sm text-gray-900">{balanceInfo.currency}</p>
                </div>
              </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Transaction History</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {transactionHistory.map((tx) => (
                  <div key={tx.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {getStatusIcon(tx.status)}
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            {tx.type === 'incoming' ? 'Received' : 'Sent'} {tx.amount} {balanceInfo.currency}
                          </p>
                          <p className="text-sm text-gray-500">ID: {tx.id.slice(0, 16)}...</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                          {tx.status}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">{new Date(tx.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      <span className="font-medium">Counterparty:</span> {tx.counterparty.slice(0, 16)}...
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Instructions */}
        {!balanceInfo && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">How to Check Balance</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-medium">1</span>
                </div>
                <div>
                  <p className="text-sm text-gray-900">Enter the ICP Principal ID you want to check</p>
                  <p className="text-sm text-gray-500">Example: 0x94cf75948a5d11686c7cff96ce35e4be1eb9baecfed191ad06122d49398f80c9</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-medium">2</span>
                </div>
                <div>
                  <p className="text-sm text-gray-900">Click "Check Balance" to fetch the latest balance information</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-medium">3</span>
                </div>
                <div>
                  <p className="text-sm text-gray-900">View detailed balance information and transaction history</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 