'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Trash2, RefreshCw } from 'lucide-react';
import { mcpClient } from '../lib/mcp-client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolCalls?: any[];
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  conversationId: string;
  isConnected: boolean;
}

export default function Home() {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    conversationId: `conv_${Date.now()}`,
    isConnected: false
  });
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  const checkConnection = async () => {
    try {
      const health = await mcpClient.healthCheck();
      setChatState(prev => ({ ...prev, isConnected: health.status === 'healthy' }));
    } catch (error) {
      console.error('Connection check failed:', error);
      setChatState(prev => ({ ...prev, isConnected: false }));
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || chatState.isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true
    }));

    setInputMessage('');

    try {
      const response : any = await mcpClient.callTool({
        name: 'intelligent_chat',
        arguments: {
          conversationId: chatState.conversationId,
          message: inputMessage
        }
      });

      console.log("response", response);

      const assistantMessage: any = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response?.data.response || 'No response received',
        timestamp: new Date(),
        toolCalls: response?.data.functionCalls
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        isLoading: false
      }));
    }
  };

  const clearConversation = () => {
    setChatState(prev => ({
      ...prev,
      messages: [],
      conversationId: `conv_${Date.now()}`
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">Doraemon Chat</h1>
          <p className="text-sm text-gray-600 mt-1">AI Assistant with DeFi Tools</p>
        </div>
        
        <div className="flex-1 p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${chatState.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {chatState.isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            <button
              onClick={checkConnection}
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Connection</span>
            </button>
            
            <button
              onClick={clearConversation}
              className="flex items-center space-x-2 text-sm text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Chat</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <h2 className="text-lg font-medium text-gray-900">Chat</h2>
          <p className="text-sm text-gray-600">Ask me anything about DeFi, wallets, tokens, and more!</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatState.messages.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">Welcome to Doraemon Chat!</p>
              <p className="text-sm mt-2">I can help you with:</p>
              <ul className="text-sm mt-2 space-y-1">
                <li>• Checking wallet balances and allowances</li>
                <li>• Getting token prices and market data</li>
                <li>• Finding swap quotes and trading opportunities</li>
                <li>• Analyzing portfolios and transaction history</li>
                <li>• Exploring NFTs and domain information</li>
              </ul>
            </div>
          )}

          {chatState.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {message.role === 'user' ? (
                      <User className="w-5 h-5" />
                    ) : (
                      <Bot className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium mb-1">
                      {message.role === 'user' ? 'You' : 'Assistant'}
                    </div>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    {message.toolCalls && message.toolCalls.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-xs font-medium text-gray-600 mb-2">Tool Calls:</div>
                        <div className="space-y-1">
                          {message.toolCalls.map((tool, index) => (
                            <div key={index} className="text-xs bg-gray-100 p-2 rounded">
                              {tool.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {chatState.isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Bot className="w-5 h-5" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about DeFi, wallets, tokens..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={1}
                disabled={!chatState.isConnected || chatState.isLoading}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || !chatState.isConnected || chatState.isLoading}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}