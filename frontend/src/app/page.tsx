'use client'

import Link from 'next/link'
import { Search, Activity, Wallet, ArrowRight, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { bridgeService } from '@/utils/bridge'

interface Transaction {
  orderId: string
  sender: string
  icpRecipient: string
  amount: string
  hashlock: string
  timelock: string
  transactionHash: string
  blockNumber: number
  timestamp: string
  gasUsed: string
  status: string
}

interface BridgeStats {
  totalTransactions: number
  activeSwaps: number
  completed: number
  pending: number
}

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<BridgeStats>({
    totalTransactions: 0,
    activeSwaps: 0,
    completed: 0,
    pending: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Check if bridge service is ready
        if (!bridgeService.isReady()) {
          setError('Bridge service not configured. Please set up environment variables.')
          setLoading(false)
          return
        }

        // Fetch recent transactions
        const recentTransactions = await bridgeService.getRecentTransactions(10)
        const validTransactions = recentTransactions.filter(tx => tx !== null) as Transaction[]
        setTransactions(validTransactions)

        // Calculate stats
        const totalTransactions = validTransactions.length
        const completed = validTransactions.filter(tx => tx.status === 'completed').length
        const pending = validTransactions.filter(tx => tx.status === 'pending').length
        const activeSwaps = pending

        setStats({
          totalTransactions,
          activeSwaps,
          completed,
          pending
        })

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'refunded':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Activity className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'pending':
        return 'Pending'
      case 'refunded':
        return 'Refunded'
      default:
        return 'Unknown'
    }
  }



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-2xl font-bold text-gray-900">ICP Explorer</h1>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading real transaction data...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-2xl font-bold text-gray-900">ICP Explorer</h1>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Bridge Service Error</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-yellow-800 mb-2">Required Environment Variables:</h3>
                <div className="text-sm text-yellow-700 space-y-1">
                  <div>• NEXT_PUBLIC_NETWORK (local or sepolia)</div>
                  <div>• NEXT_PUBLIC_LOCAL_RPC_URL or NEXT_PUBLIC_SEPOLIA_RPC_URL</div>
                  <div>• NEXT_PUBLIC_LOCAL_PRIVATE_KEY or NEXT_PUBLIC_SEPOLIA_PRIVATE_KEY</div>
                  <div>• NEXT_PUBLIC_LOCAL_CONTRACT_ADDRESS or NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS</div>
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
              <Link href="/" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Dashboard
              </Link>
              <Link href="/explorer" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Transaction Explorer
              </Link>
              <Link href="/balance" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
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
        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Real ETH-ICP Bridge Explorer
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Monitor real transactions, verify balances, and track cross-chain swaps between Ethereum and ICP
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/explorer" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                <Search className="mr-2 h-5 w-5" />
                Explore Transactions
              </Link>
              <Link href="/balance" className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <Wallet className="mr-2 h-5 w-5" />
                Check Balance
              </Link>
              <Link href="/swap" className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <ArrowRight className="mr-2 h-5 w-5" />
                Create Swap
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Transactions</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalTransactions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Swaps</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeSwaps}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Real Transactions</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {transactions.length > 0 ? (
              transactions.map((tx) => (
                <div key={tx.transactionHash} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {getStatusIcon(tx.status)}
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">Swap</p>
                        <p className="text-sm text-gray-500">ID: {tx.orderId?.slice(0, 16) || tx.transactionHash.slice(0, 16)}...</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{tx.amount} ETH</p>
                      <p className="text-sm text-gray-500">{getStatusText(tx.status)}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No recent transactions found. Create your first swap to see activity here.
              </div>
            )}
          </div>
          <div className="px-6 py-4 border-t border-gray-200">
            <Link href="/explorer" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500">
              View all transactions
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
