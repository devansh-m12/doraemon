'use client';

import { useState } from 'react';
import { MessageCircle, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import ToolCallsDisplay from './ToolCallsDisplay';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import MermaidDisplay from './MermaidDisplay';

interface MessageTabsProps {
  content: string;
  toolCalls?: any[];
  mermaidCode?: string;
}

export default function MessageTabs({ content, toolCalls, mermaidCode }: MessageTabsProps) {
  const [activeTab, setActiveTab] = useState<'message' | 'tools' | 'mermaid'>('message');

  const hasToolCalls = toolCalls && toolCalls.length > 0;
  const hasMermaidCode = mermaidCode && mermaidCode.trim().length > 0;

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
        
        {hasMermaidCode && (
          <button
            onClick={() => setActiveTab('mermaid')}
            className={cn(
              "flex items-center space-x-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === 'mermaid'
                ? 'border-primary text-primary dark:border-primary/90 dark:text-primary/90'
                : 'border-transparent text-muted-foreground hover:text-foreground dark:text-muted-foreground/80 dark:hover:text-foreground'
            )}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 7V3M16 7V3M7 11H17M7 15H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z"/>
            </svg>
            <span>Diagram</span>
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="min-h-[100px] min-w-[240px] sm:min-w-[280px]">
        {activeTab === 'message' && (
          <div className="text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown
              remarkPlugins={[
                remarkGfm,
                remarkBreaks,
                remarkMath,
              ]}
              rehypePlugins={[
                rehypeSlug,
                rehypeAutolinkHeadings,
                rehypeHighlight,
                rehypeKatex,
              ]}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
        
        {activeTab === 'tools' && hasToolCalls && (
          <ToolCallsDisplay toolCalls={toolCalls} />
        )}

        {activeTab === 'mermaid' && mermaidCode && (
          <MermaidDisplay diagrams={mermaidCode} />
        )}
      </div>
    </div>
  );
} 