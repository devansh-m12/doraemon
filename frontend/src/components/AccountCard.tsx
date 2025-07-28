'use client';

import { useState } from 'react';

interface AccountCardProps {
  title: string;
  address: string;
  balance?: string;
  isConnected: boolean;
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
  onRefresh: () => Promise<void>;
  type: 'ethereum' | 'icp';
}

export default function AccountCard({
  title,
  address,
  balance,
  isConnected,
  onConnect,
  onDisconnect,
  onRefresh,
  type
}: AccountCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await onConnect();
    } catch (error) {
      console.error('Failed to connect:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await onDisconnect();
    } catch (error) {
      console.error('Failed to disconnect:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error('Failed to refresh:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {isConnected ? (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {type === 'ethereum' ? 'Address' : 'Principal'}
            </label>
            <div className="bg-gray-50 rounded-md p-3">
              <code className="text-sm text-gray-800 break-all">{address}</code>
            </div>
          </div>

          {balance && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Balance
              </label>
              <div className="bg-gray-50 rounded-md p-3">
                <span className="text-sm text-gray-800">{balance} {type === 'ethereum' ? 'ETH' : 'ICP'}</span>
              </div>
            </div>
          )}

          <div className="flex space-x-2 pt-2">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={handleDisconnect}
              disabled={isLoading}
              className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {isLoading ? 'Disconnecting...' : 'Disconnect'}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-gray-500 mb-4">Connect your {type === 'ethereum' ? 'Ethereum' : 'ICP'} account to start swapping</p>
          <button
            onClick={handleConnect}
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            {isLoading ? 'Connecting...' : `Connect ${type === 'ethereum' ? 'Ethereum' : 'ICP'}`}
          </button>
        </div>
      )}
    </div>
  );
} 