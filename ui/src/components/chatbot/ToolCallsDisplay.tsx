'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Code, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface ToolCall {
  name: string;
  arguments: any;
  result: any;
  description: string;
}

interface ToolCallsDisplayProps {
  toolCalls: ToolCall[];
}

export default function ToolCallsDisplay({ toolCalls }: ToolCallsDisplayProps) {
  const [expandedTools, setExpandedTools] = useState<Set<number>>(new Set());

  const toggleTool = (index: number) => {
    const newExpanded = new Set(expandedTools);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedTools(newExpanded);
  };

  const formatValue = (value: any): string => {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const isExpandable = (value: any): boolean => {
    return typeof value === 'object' && value !== null && 
           (Array.isArray(value) || Object.keys(value).length > 0);
  };

  const renderValue = (value: any, depth: number = 0) => {
    if (isExpandable(value)) {
      return (
        <div className="ml-4">
          {Array.isArray(value) ? (
            <div>
              <span className="text-muted-foreground dark:text-muted-foreground/80">[</span>
              <div className="ml-4">
                {value.map((item, index) => (
                  <div key={index} className="flex items-start">
                    <span className="text-muted-foreground dark:text-muted-foreground/80 mr-2">{index}:</span>
                    <div className="flex-1">
                      {isExpandable(item) ? renderValue(item, depth + 1) : formatValue(item)}
                    </div>
                  </div>
                ))}
              </div>
              <span className="text-muted-foreground dark:text-muted-foreground/80">]</span>
            </div>
          ) : (
            <div>
              <span className="text-muted-foreground dark:text-muted-foreground/80">{'{'}</span>
              <div className="ml-4">
                {Object.entries(value).map(([key, val]) => (
                  <div key={key} className="flex items-start">
                    <span className="text-primary dark:text-primary/90 mr-2">"{key}":</span>
                    <div className="flex-1">
                      {isExpandable(val) ? renderValue(val, depth + 1) : formatValue(val)}
                    </div>
                  </div>
                ))}
              </div>
              <span className="text-muted-foreground dark:text-muted-foreground/80">{'}'}</span>
            </div>
          )}
        </div>
      );
    }
    return <span className="text-foreground dark:text-foreground">{formatValue(value)}</span>;
  };

  if (!toolCalls || toolCalls.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 min-w-[280px] sm:min-w-[320px]">
      <div className="flex items-center space-x-2">
        <Zap className="w-4 h-4 text-primary dark:text-primary/90" />
        <span className="text-sm font-medium text-foreground dark:text-foreground">
          Tools Called
        </span>
        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary">
          {toolCalls.length}
        </Badge>
      </div>
      
      <div className="space-y-2">
        {toolCalls.map((tool, index) => (
          <Card key={index} className="border-border/50 dark:border-border/60 min-w-[240px] sm:min-w-[280px]">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Code className="w-4 h-4 text-primary dark:text-primary/90" />
                    <CardTitle className="text-sm font-medium text-foreground dark:text-foreground">
                      {tool.name}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-xs text-muted-foreground dark:text-muted-foreground/80 ml-6">
                    {tool.description}
                  </CardDescription>
                </div>
                <button
                  onClick={() => toggleTool(index)}
                  className="p-1 rounded hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/80 dark:hover:text-accent-foreground transition-colors ml-2"
                >
                  {expandedTools.has(index) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              </div>
            </CardHeader>
            
            {expandedTools.has(index) && (
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {/* Arguments */}
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground dark:text-muted-foreground/80 mb-2">
                      Arguments
                    </h4>
                    <div className="bg-muted/50 dark:bg-muted/30 rounded p-3 text-xs font-mono min-w-[200px] sm:min-w-[240px]">
                      {renderValue(tool.arguments)}
                    </div>
                  </div>
                  
                  <Separator className="dark:bg-border/60" />
                  
                  {/* Result */}
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground dark:text-muted-foreground/80 mb-2">
                      Result
                    </h4>
                    <div className="bg-muted/50 dark:bg-muted/30 rounded p-3 text-xs font-mono min-w-[200px] sm:min-w-[240px]">
                      {renderValue(tool.result)}
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
} 