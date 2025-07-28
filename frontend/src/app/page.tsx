import Link from 'next/link'
import { Search, Activity, Wallet, ArrowRight, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react'

export default function Home() {
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
              ICP Transaction Explorer
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Monitor transactions, verify balances, and track cross-chain swaps on the Internet Computer
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
                <p className="text-2xl font-semibold text-gray-900">1,234</p>
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
                <p className="text-2xl font-semibold text-gray-900">42</p>
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
                <p className="text-2xl font-semibold text-gray-900">892</p>
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
                <p className="text-2xl font-semibold text-gray-900">156</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {[
              {
                id: '0x235dfe7fd1b68dedf148ca616fae70df5f7a6570a4b42cff55534a3dbe92ffae',
                type: 'Swap Created',
                amount: '0.001 ETH',
                status: 'Pending',
                timestamp: '2025-07-28T08:41:57.000Z',
                recipient: '0x94cf75948a5d11686c7cff96ce35e4be1eb9baecfed191ad06122d49398f80c9'
              },
              {
                id: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
                type: 'Swap Completed',
                amount: '0.005 ETH',
                status: 'Completed',
                timestamp: '2025-07-28T07:30:15.000Z',
                recipient: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
              },
              {
                id: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
                type: 'Swap Refunded',
                amount: '0.002 ETH',
                status: 'Refunded',
                timestamp: '2025-07-28T06:15:42.000Z',
                recipient: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
              }
            ].map((tx) => (
              <div key={tx.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {tx.status === 'Completed' && <CheckCircle className="h-5 w-5 text-green-500" />}
                      {tx.status === 'Pending' && <Clock className="h-5 w-5 text-yellow-500" />}
                      {tx.status === 'Refunded' && <XCircle className="h-5 w-5 text-red-500" />}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{tx.type}</p>
                      <p className="text-sm text-gray-500">ID: {tx.id.slice(0, 16)}...</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{tx.amount}</p>
                    <p className="text-sm text-gray-500">{new Date(tx.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
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
