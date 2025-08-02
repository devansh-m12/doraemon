'use client';

import { useState } from 'react';
import { MessageCircle, Zap } from 'lucide-react';
import ToolCallsDisplay from './ToolCallsDisplay';

interface MessageTabsProps {
  content: string;
  toolCalls?: any[];
}

export default function MessageTabs({ content, toolCalls }: MessageTabsProps) {
  const [activeTab, setActiveTab] = useState<'message' | 'tools'>('message');

  const hasToolCalls = toolCalls && toolCalls.length > 0;

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-3">
        <button
          onClick={() => setActiveTab('message')}
          className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'message'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>Message</span>
        </button>
        
        {hasToolCalls && (
          <button
            onClick={() => setActiveTab('tools')}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'tools'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Tools Called ({toolCalls.length})</span>
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="min-h-[100px]">
        {activeTab === 'message' && (
          <div className="whitespace-pre-wrap">{content}</div>
        )}
        
        {activeTab === 'tools' && hasToolCalls && (
          <ToolCallsDisplay toolCalls={toolCalls} />
        )}
      </div>
    </div>
  );
} 