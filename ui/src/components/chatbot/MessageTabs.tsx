'use client';

import { useState } from 'react';
import { MessageCircle, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ToolCallsDisplay from './ToolCallsDisplay';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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
      <div className="flex border-b mb-4">
        <button
          onClick={() => setActiveTab('message')}
          className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'message'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
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
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Tools</span>
            <Badge variant="secondary" className="text-xs">
              {toolCalls.length}
            </Badge>
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="min-h-[100px]">
        {activeTab === 'message' && (
          <div className="text-sm leading-relaxed prose prose-sm max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
        
        {activeTab === 'tools' && hasToolCalls && (
          <ToolCallsDisplay toolCalls={toolCalls} />
        )}
      </div>
    </div>
  );
} 