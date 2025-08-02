import React from 'react';
import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DoraemonLoaderProps {
  className?: string;
}

export default function DoraemonLoader({ className }: DoraemonLoaderProps) {
  return (
    <div className={cn("flex items-center space-x-3 py-2", className)}>
      {/* Doraemon Avatar with pulse */}
      <div className="relative">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
          <Bot className="w-4 h-4 text-white" />
        </div>
        
        {/* Yellow sparkles around the avatar */}
        <div className="absolute -top-1 -right-1">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
        </div>
        <div className="absolute -bottom-1 -left-1">
          <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full animate-ping animation-delay-300"></div>
        </div>
        <div className="absolute top-0 left-0">
          <div className="w-1 h-1 bg-yellow-500 rounded-full animate-ping animation-delay-500"></div>
        </div>
      </div>

      {/* Magic message with typing dots */}
      <div className="flex items-center space-x-2">
        <span className="text-blue-600 dark:text-blue-400 font-medium animate-fade-in">
          Doraemon is making magic for you
        </span>
        
        {/* Animated dots */}
        <div className="flex space-x-1">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce animation-delay-100"></div>
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce animation-delay-200"></div>
        </div>
      </div>

      {/* Additional sparkle effect */}
      <div className="relative">
        <div className="w-6 h-6 text-yellow-400 animate-spin">
          ✨
        </div>
      </div>
    </div>
  );
}

/* Custom CSS animations - Add this to your global CSS if not already present */