'use client';

import { useState, useEffect } from 'react';
import { SwapOrder, swapService } from '@/lib/swap';

export default function SwapHistory() {
  const [swaps, setSwaps] = useState<SwapOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSwaps();
  }, []);

  const loadSwaps = async () => {
    setIsLoading(true);
    try {
      const allSwaps = await swapService.getAllSwaps();
      setSwaps(allSwaps.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    } catch (error) {
      console.error('Failed to load swaps:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: SwapOrder['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Swap History</h3>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading swap history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Swap History</h3>
        <button
          onClick={loadSwaps}
          className="text-blue-500 hover:text-blue-600 text-sm font-medium"
        >
          Refresh
        </button>
      </div>

      {swaps.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500">No swap history yet</p>
          <p className="text-gray-400 text-sm">Your completed swaps will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {swaps.map((swap) => (
            <div key={swap.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">
                    {swap.fromChain} → {swap.toChain}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(swap.status)}`}>
                    {swap.status}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{formatDate(swap.createdAt)}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Amount:</span>
                  <div className="font-medium">{swap.amount} {swap.fromChain}</div>
                </div>
                <div>
                  <span className="text-gray-600">Recipient:</span>
                  <div className="font-medium truncate">{swap.recipient}</div>
                </div>
              </div>

              {swap.completedAt && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    Completed: {formatDate(swap.completedAt)}
                  </span>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">Order ID: {swap.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 