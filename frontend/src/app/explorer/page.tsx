'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Filter, ArrowLeft, ExternalLink, Copy, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react'
import { getBridgeTransactions, checkNetworkStatus } from '@/utils/icp'

interface Transaction {
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

export default function ExplorerPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [networkStatus, setNetworkStatus] = useState<boolean>(false)
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  // Load transactions and check network status on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Check network status
        const status = await checkNetworkStatus('local')
        setNetworkStatus(status)

        if (status) {
          // Load real transactions from bridge
          const bridgeTransactions = await getBridgeTransactions('local')
          setTransactions(bridgeTransactions)
        }
      } catch (error) {
        console.error('Failed to load transactions:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.sender.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || tx.status === filterStatus
    return matchesSearch && matchesFilter
  })

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
      case 'Completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'Pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'Refunded':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'Failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transactions...</p>
        </div>
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
              <Link href="/" className="mr-4">
                <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-900" />
              </Link>
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">Transaction Explorer</h1>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Dashboard
              </Link>
              <Link href="/explorer" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
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
        {/* Network Status */}
        <div className="mb-6">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            networkStatus ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${networkStatus ? 'bg-green-500' : 'bg-red-500'}`}></div>
            {networkStatus ? 'ICP Local Network Connected' : 'ICP Local Network Disconnected'}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by transaction ID, sender, or recipient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Refunded">Refunded</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {!networkStatus && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  ICP Local Network Not Connected
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Please start the ICP local network to view real transactions.</p>
                  <p className="mt-1">Run: <code className="bg-yellow-100 px-1 py-0.5 rounded">dfx start --clean --background</code></p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transaction List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Transactions ({filteredTransactions.length})
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      onClick={() => setSelectedTx(tx)}
                      className={`px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedTx?.id === tx.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {getStatusIcon(tx.status)}
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">{tx.type}</p>
                            <p className="text-sm text-gray-500">ID: {tx.id.slice(0, 16)}...</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{tx.amount}</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                            {tx.status}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        {new Date(tx.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-8 text-center text-gray-500">
                    <p>{networkStatus ? 'No transactions found matching your search criteria.' : 'No transactions available. Please connect to the local network.'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Transaction Details</h3>
              </div>
              {selectedTx ? (
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
                    <div className="flex items-center space-x-2">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded flex-1">
                        {selectedTx.id}
                      </code>
                      <button
                        onClick={() => copyToClipboard(selectedTx.id, 'id')}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        {copied === 'id' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-gray-500" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <p className="text-sm text-gray-900">{selectedTx.type}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <p className="text-sm text-gray-900">{selectedTx.amount}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(selectedTx.status)}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedTx.status)}`}>
                        {selectedTx.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timestamp</label>
                    <p className="text-sm text-gray-900">{new Date(selectedTx.timestamp).toLocaleString()}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sender</label>
                    <div className="flex items-center space-x-2">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded flex-1">
                        {selectedTx.sender}
                      </code>
                      <button
                        onClick={() => copyToClipboard(selectedTx.sender, 'sender')}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        {copied === 'sender' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-gray-500" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recipient</label>
                    <div className="flex items-center space-x-2">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded flex-1">
                        {selectedTx.recipient}
                      </code>
                      <button
                        onClick={() => copyToClipboard(selectedTx.recipient, 'recipient')}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        {copied === 'recipient' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-gray-500" />}
                      </button>
                    </div>
                  </div>

                  {selectedTx.hashlock && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hashlock</label>
                      <div className="flex items-center space-x-2">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded flex-1">
                          {selectedTx.hashlock}
                        </code>
                        <button
                          onClick={() => copyToClipboard(selectedTx.hashlock!, 'hashlock')}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          {copied === 'hashlock' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-gray-500" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedTx.timelock && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Timelock</label>
                      <p className="text-sm text-gray-900">{new Date(selectedTx.timelock).toLocaleString()}</p>
                    </div>
                  )}

                  {selectedTx.gasUsed && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gas Used</label>
                      <p className="text-sm text-gray-900">{selectedTx.gasUsed}</p>
                    </div>
                  )}

                  {selectedTx.blockNumber && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Block Number</label>
                      <p className="text-sm text-gray-900">{selectedTx.blockNumber}</p>
                    </div>
                  )}

                  <div className="pt-4">
                    <a
                      href={`https://dashboard.internetcomputer.org/transaction/${selectedTx.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      View on ICP Dashboard
                      <ExternalLink className="ml-1 h-4 w-4" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <p>Select a transaction to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 