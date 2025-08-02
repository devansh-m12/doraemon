'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Code, Zap } from 'lucide-react';

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
              <span className="text-gray-600">[</span>
              <div className="ml-4">
                {value.map((item, index) => (
                  <div key={index} className="flex items-start">
                    <span className="text-gray-600 mr-2">{index}:</span>
                    <div className="flex-1">
                      {isExpandable(item) ? renderValue(item, depth + 1) : formatValue(item)}
                    </div>
                  </div>
                ))}
              </div>
              <span className="text-gray-600">]</span>
            </div>
          ) : (
            <div>
              <span className="text-gray-600">{'{'}</span>
              <div className="ml-4">
                {Object.entries(value).map(([key, val]) => (
                  <div key={key} className="flex items-start">
                    <span className="text-blue-600 mr-2">"{key}":</span>
                    <div className="flex-1">
                      {isExpandable(val) ? renderValue(val, depth + 1) : formatValue(val)}
                    </div>
                  </div>
                ))}
              </div>
              <span className="text-gray-600">{'}'}</span>
            </div>
          )}
        </div>
      );
    }
    return <span className="text-gray-800">{formatValue(value)}</span>;
  };

  if (!toolCalls || toolCalls.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="flex items-center space-x-2 mb-3">
        <Zap className="w-4 h-4 text-orange-500" />
        <span className="text-sm font-medium text-gray-700">
          Tools Called ({toolCalls.length})
        </span>
      </div>
      
      <div className="space-y-2">
        {toolCalls.map((tool, index) => (
          <div key={index} className="bg-gray-50 rounded-lg border border-gray-200">
            <button
              onClick={() => toggleTool(index)}
              className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Code className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-800">{tool.name}</span>
              </div>
              {expandedTools.has(index) ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>
            
            {expandedTools.has(index) && (
              <div className="px-3 pb-3 border-t border-gray-200">
                <div className="pt-3 space-y-3">
                  {/* Arguments */}
                  <div>
                    <div className="text-xs font-medium text-gray-600 mb-1">Arguments:</div>
                    <div className="bg-white rounded border p-2 text-xs font-mono">
                      {Object.keys(tool.arguments).length > 0 ? (
                        renderValue(tool.arguments)
                      ) : (
                        <span className="text-gray-500">No arguments</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Result */}
                  <div>
                    <div className="text-xs font-medium text-gray-600 mb-1">Result:</div>
                    <div className="bg-white rounded border p-2 text-xs font-mono max-h-40 overflow-y-auto">
                      {renderValue(tool.result)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 