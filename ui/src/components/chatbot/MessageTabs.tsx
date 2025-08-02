'use client';

import { useState } from 'react';
import { MessageCircle, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ToolCallsDisplay from './ToolCallsDisplay';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface MessageTabsProps {
  content: string;
  toolCalls?: any[];
}

export default function MessageTabs({ content, toolCalls }: MessageTabsProps) {
  const [activeTab, setActiveTab] = useState<'message' | 'tools'>('message');

  const hasToolCalls = toolCalls && toolCalls.length > 0;

  return (
    <div className="min-w-[280px] sm:min-w-[320px]">
      {/* Tab Navigation */}
      <div className="flex border-b border-border/50 mb-4 dark:border-border/60">
        <button
          onClick={() => setActiveTab('message')}
          className={cn(
            "flex items-center space-x-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === 'message'
              ? 'border-primary text-primary dark:border-primary/90 dark:text-primary/90'
              : 'border-transparent text-muted-foreground hover:text-foreground dark:text-muted-foreground/80 dark:hover:text-foreground'
          )}
        >
          <MessageCircle className="w-4 h-4" />
          <span>Message</span>
        </button>
        
        {hasToolCalls && (
          <button
            onClick={() => setActiveTab('tools')}
            className={cn(
              "flex items-center space-x-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === 'tools'
                ? 'border-primary text-primary dark:border-primary/90 dark:text-primary/90'
                : 'border-transparent text-muted-foreground hover:text-foreground dark:text-muted-foreground/80 dark:hover:text-foreground'
            )}
          >
            <Zap className="w-4 h-4" />
            <span>Tools</span>
            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary">
              {toolCalls.length}
            </Badge>
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="min-h-[100px] min-w-[240px] sm:min-w-[280px]">
        {activeTab === 'message' && (
          <div className="text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert">
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