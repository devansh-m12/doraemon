'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Code, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ToolCall {
  name: string;
  arguments: any;
  result: any;
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
              <span className="text-muted-foreground">[</span>
              <div className="ml-4">
                {value.map((item, index) => (
                  <div key={index} className="flex items-start">
                    <span className="text-muted-foreground mr-2">{index}:</span>
                    <div className="flex-1">
                      {isExpandable(item) ? renderValue(item, depth + 1) : formatValue(item)}
                    </div>
                  </div>
                ))}
              </div>
              <span className="text-muted-foreground">]</span>
            </div>
          ) : (
            <div>
              <span className="text-muted-foreground">{'{'}</span>
              <div className="ml-4">
                {Object.entries(value).map(([key, val]) => (
                  <div key={key} className="flex items-start">
                    <span className="text-primary mr-2">"{key}":</span>
                    <div className="flex-1">
                      {isExpandable(val) ? renderValue(val, depth + 1) : formatValue(val)}
                    </div>
                  </div>
                ))}
              </div>
              <span className="text-muted-foreground">{'}'}</span>
            </div>
          )}
        </div>
      );
    }
    return <span className="text-foreground">{formatValue(value)}</span>;
  };

  if (!toolCalls || toolCalls.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Zap className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">
          Tools Called
        </span>
        <Badge variant="secondary" className="text-xs">
          {toolCalls.length}
        </Badge>
      </div>
      
      <div className="space-y-2">
        {toolCalls.map((tool, index) => (
          <Card key={index} className="border">
            <CardHeader className="pb-2">
              <button
                onClick={() => toggleTool(index)}
                className="w-full flex items-center justify-between text-left hover:bg-muted/50 transition-colors rounded-md p-2 -m-2"
              >
                <div className="flex items-center space-x-2">
                  <Code className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{tool.name}</span>
                </div>
                {expandedTools.has(index) ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </CardHeader>
            
            {expandedTools.has(index) && (
              <CardContent className="pt-0 space-y-3">
                <Separator />
                <div className="space-y-3">
                  {/* Arguments */}
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-2">Arguments:</div>
                    <div className="bg-muted rounded-md p-3 text-xs font-mono border">
                      {Object.keys(tool.arguments).length > 0 ? (
                        renderValue(tool.arguments)
                      ) : (
                        <span className="text-muted-foreground">No arguments</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Result */}
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-2">Result:</div>
                    <div className="bg-muted rounded-md p-3 text-xs font-mono border max-h-40 overflow-y-auto">
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