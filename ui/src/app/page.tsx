'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, Coins, TrendingUp, Info } from 'lucide-react';

interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  tags?: string[];
}

interface SearchResult {
  tokens: TokenInfo[];
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TokenInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedChain, setSelectedChain] = useState(1); // Ethereum by default

  const chains = [
    { id: 1, name: 'Ethereum', color: 'bg-blue-500' },
    { id: 56, name: 'BSC', color: 'bg-yellow-500' },
    { id: 137, name: 'Polygon', color: 'bg-purple-500' },
    { id: 42161, name: 'Arbitrum', color: 'bg-blue-600' },
    { id: 10, name: 'Optimism', color: 'bg-red-500' },
  ];

  const searchTokens = async (query: string, chainId: number) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate MCP call to 1inch API
      // In a real implementation, you would connect to the MCP server
      const response = await fetch('/api/search-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chainId,
          query,
          limit: 10
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to search tokens');
      }

      const data: SearchResult = await response.json();
      setSearchResults(data.tokens);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchTokens(searchQuery, selectedChain);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedChain]);

  const formatTokenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Coins className="w-8 h-8 text-purple-400 mr-3" />
            <h1 className="text-4xl font-bold text-white">Token Search</h1>
          </div>
          <p className="text-gray-300 text-lg">
            Search for tokens across multiple blockchain networks using 1inch API
          </p>
        </div>

        {/* Search Controls */}
        <div className="max-w-4xl mx-auto mb-8">
          {/* Chain Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Select Blockchain Network
            </label>
            <div className="flex flex-wrap gap-3">
              {chains.map((chain) => (
                <button
                  key={chain.id}
                  onClick={() => setSelectedChain(chain.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedChain === chain.id
                      ? `${chain.color} text-white shadow-lg`
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {chain.name}
                </button>
              ))}
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for tokens by name or symbol (e.g., USDC, ETH, Bitcoin)..."
              className="w-full pl-10 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            />
            {isLoading && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <Loader2 className="h-5 w-5 text-purple-400 animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-4">
              <div className="flex items-center">
                <Info className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-red-200">{error}</span>
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        <div className="max-w-4xl mx-auto">
          {searchResults.length > 0 && (
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-white mb-4">
                Search Results ({searchResults.length})
              </h2>
              <div className="grid gap-4">
                {searchResults.map((token) => (
                  <div
                    key={token.address}
                    className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {token.logoURI ? (
                          <img
                            src={token.logoURI}
                            alt={token.symbol}
                            className="w-12 h-12 rounded-full"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {token.symbol.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-xl font-semibold text-white">
                              {token.symbol}
                            </h3>
                            <span className="text-sm text-gray-400">
                              {token.name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-gray-400">
                              Decimals: {token.decimals}
                            </span>
                            <span className="text-sm text-gray-400">
                              {formatTokenAddress(token.address)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {token.tags && token.tags.length > 0 && (
                          <div className="flex space-x-1">
                            {token.tags.slice(0, 2).map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <TrendingUp className="h-5 w-5 text-green-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && searchQuery && searchResults.length === 0 && !error && (
            <div className="text-center py-12">
              <Coins className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                No tokens found
              </h3>
              <p className="text-gray-500">
                Try searching with a different term or check the spelling
              </p>
            </div>
          )}

          {/* Initial State */}
          {!searchQuery && !isLoading && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                Start searching for tokens
              </h3>
              <p className="text-gray-500">
                Enter a token name or symbol to begin your search
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 text-sm">
            Powered by 1inch API • Built with Next.js and TypeScript
          </p>
        </div>
      </div>
    </div>
  );
}
