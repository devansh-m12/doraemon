'use client';

import { useState, useEffect } from 'react';
import { SwapQuote, swapService } from '@/lib/swap';

interface SwapFormProps {
  ethAddress: string;
  icpPrincipal: string;
  ethBalance: string;
  isEthConnected: boolean;
  isIcpConnected: boolean;
}

export default function SwapForm({
  ethAddress,
  icpPrincipal,
  ethBalance,
  isEthConnected,
  isIcpConnected
}: SwapFormProps) {
  const [fromChain, setFromChain] = useState<'ETH' | 'ICP'>('ETH');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapOrder, setSwapOrder] = useState<any>(null);

  const toChain = fromChain === 'ETH' ? 'ICP' : 'ETH';

  useEffect(() => {
    // Set recipient based on selected chain
    if (fromChain === 'ETH') {
      setRecipient(icpPrincipal);
    } else {
      setRecipient(ethAddress);
    }
  }, [fromChain, ethAddress, icpPrincipal]);

  useEffect(() => {
    const getQuote = async () => {
      if (amount && parseFloat(amount) > 0) {
        setIsLoading(true);
        try {
          const quoteResult = await swapService.getQuote(fromChain, toChain, amount);
          setQuote(quoteResult);
        } catch (error) {
          console.error('Failed to get quote:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setQuote(null);
      }
    };

    const timeoutId = setTimeout(getQuote, 500);
    return () => clearTimeout(timeoutId);
  }, [amount, fromChain, toChain]);

  const handleSwap = async () => {
    if (!amount || !recipient) return;

    setIsSwapping(true);
    try {
      const order = await swapService.createSwap(fromChain, toChain, amount, recipient);
      setSwapOrder(order);
      setAmount('');
    } catch (error) {
      console.error('Failed to create swap:', error);
    } finally {
      setIsSwapping(false);
    }
  };

  const canSwap = isEthConnected && isIcpConnected && amount && quote && parseFloat(amount) > 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Cross-Chain Swap</h3>

      <div className="space-y-4">
        {/* Chain Selection */}
        <div className="flex space-x-4">
          <button
            onClick={() => setFromChain('ETH')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              fromChain === 'ETH'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ETH → ICP
          </button>
          <button
            onClick={() => setFromChain('ICP')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              fromChain === 'ICP'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ICP → ETH
          </button>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount ({fromChain})
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Enter ${fromChain} amount`}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!isEthConnected || !isIcpConnected}
          />
          {fromChain === 'ETH' && ethBalance && (
            <p className="text-sm text-gray-500 mt-1">
              Available: {ethBalance} ETH
            </p>
          )}
        </div>

        {/* Quote Display */}
        {quote && (
          <div className="bg-gray-50 rounded-md p-4 space-y-2">
            <h4 className="font-medium text-gray-900">Quote</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">You send:</span>
                <div className="font-medium">{quote.fromAmount} {fromChain}</div>
              </div>
              <div>
                <span className="text-gray-600">You receive:</span>
                <div className="font-medium">{quote.toAmount} {toChain}</div>
              </div>
              <div>
                <span className="text-gray-600">Fee:</span>
                <div className="font-medium">{quote.fee} {fromChain}</div>
              </div>
              <div>
                <span className="text-gray-600">Exchange rate:</span>
                <div className="font-medium">1 {fromChain} = {quote.exchangeRate} {toChain}</div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Estimated time: {quote.estimatedTime}
            </div>
          </div>
        )}

        {/* Recipient Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipient ({toChain})
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder={`Enter ${toChain} recipient`}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!isEthConnected || !isIcpConnected}
          />
        </div>

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          disabled={!canSwap || isSwapping}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-md font-medium transition-colors"
        >
          {isSwapping ? 'Processing Swap...' : 'Start Swap'}
        </button>

        {/* Swap Status */}
        {swapOrder && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <h4 className="font-medium text-green-900 mb-2">Swap Created!</h4>
            <div className="text-sm text-green-700 space-y-1">
              <div>Order ID: {swapOrder.id}</div>
              <div>Status: {swapOrder.status}</div>
              <div>Amount: {swapOrder.amount} {swapOrder.fromChain}</div>
            </div>
          </div>
        )}

        {/* Connection Status */}
        {(!isEthConnected || !isIcpConnected) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-sm text-yellow-700">
              Please connect both Ethereum and ICP accounts to start swapping.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 