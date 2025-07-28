'use client';

import { useState, useEffect } from 'react';
import AccountCard from '@/components/AccountCard';
import SwapForm from '@/components/SwapForm';
import SwapHistory from '@/components/SwapHistory';
import { ethereumService, EthereumAccount } from '@/lib/ethereum';
import { icpService, ICPAccount } from '@/lib/icp';

export default function Home() {
  const [ethAccount, setEthAccount] = useState<EthereumAccount | null>(null);
  const [icpAccount, setIcpAccount] = useState<ICPAccount | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for existing connections on page load
    checkExistingConnections();
  }, []);

  const checkExistingConnections = async () => {
    const ethInfo = await ethereumService.getAccountInfo();
    const icpInfo = await icpService.getAccountInfo();
    
    if (ethInfo) setEthAccount(ethInfo);
    if (icpInfo) setIcpAccount(icpInfo);
  };

  const handleEthConnect = async () => {
    setIsLoading(true);
    try {
      const account = await ethereumService.connect();
      setEthAccount(account);
    } catch (error) {
      console.error('Failed to connect Ethereum:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEthDisconnect = async () => {
    setIsLoading(true);
    try {
      await ethereumService.disconnect();
      setEthAccount(null);
    } catch (error) {
      console.error('Failed to disconnect Ethereum:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEthRefresh = async () => {
    setIsLoading(true);
    try {
      const account = await ethereumService.getAccountInfo();
      setEthAccount(account);
    } catch (error) {
      console.error('Failed to refresh Ethereum:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIcpConnect = async () => {
    setIsLoading(true);
    try {
      const account = await icpService.connect();
      setIcpAccount(account);
    } catch (error) {
      console.error('Failed to connect ICP:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIcpDisconnect = async () => {
    setIsLoading(true);
    try {
      await icpService.disconnect();
      setIcpAccount(null);
    } catch (error) {
      console.error('Failed to disconnect ICP:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIcpRefresh = async () => {
    setIsLoading(true);
    try {
      const account = await icpService.getAccountInfo();
      setIcpAccount(account);
    } catch (error) {
      console.error('Failed to refresh ICP:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">Doraemon Bridge</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Cross-Chain Bridge</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Account Cards */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AccountCard
                title="Ethereum Account"
                address={ethAccount?.address || 'Not connected'}
                balance={ethAccount?.balance}
                isConnected={ethAccount?.isConnected || false}
                onConnect={handleEthConnect}
                onDisconnect={handleEthDisconnect}
                onRefresh={handleEthRefresh}
                type="ethereum"
              />
              
              <AccountCard
                title="ICP Account"
                address={icpAccount?.principal || 'Not connected'}
                isConnected={icpAccount?.isConnected || false}
                onConnect={handleIcpConnect}
                onDisconnect={handleIcpDisconnect}
                onRefresh={handleIcpRefresh}
                type="icp"
              />
            </div>

            {/* Swap Form */}
            <SwapForm
              ethAddress={ethAccount?.address || ''}
              icpPrincipal={icpAccount?.principal || ''}
              ethBalance={ethAccount?.balance || '0'}
              isEthConnected={ethAccount?.isConnected || false}
              isIcpConnected={icpAccount?.isConnected || false}
            />
          </div>

          {/* Swap History */}
          <div className="lg:col-span-1">
            <SwapHistory />
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">About Doraemon Bridge</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">How it works</h4>
                <ul className="space-y-1">
                  <li>• Connect your Ethereum and ICP accounts</li>
                  <li>• Enter the amount you want to swap</li>
                  <li>• Get a quote with exchange rate and fees</li>
                  <li>• Confirm the swap to start the process</li>
                  <li>• Track your swap status in real-time</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Features</h4>
                <ul className="space-y-1">
                  <li>• Secure cross-chain atomic swaps</li>
                  <li>• Real-time exchange rates</li>
                  <li>• Transparent fee structure</li>
                  <li>• Complete swap history</li>
                  <li>• Instant quote calculation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
