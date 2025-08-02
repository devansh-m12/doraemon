'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={cn(
      "flex items-center justify-center",
      className
    )}>
      <div className={cn(
        "animate-spin rounded-full border-2 border-muted",
        "border-t-primary",
        "dark:border-muted/50 dark:border-t-primary/90",
        sizeClasses[size]
      )} />
    </div>
  );
}

export function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn("flex space-x-1", className)}>
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce dark:bg-primary/90" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce dark:bg-primary/90" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce dark:bg-primary/90" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

export function LoadingPulse({ className }: { className?: string }) {
  return (
    <div className={cn(
      "flex space-x-2",
      className
    )}>
      <div className="w-2 h-2 bg-primary rounded-full animate-pulse dark:bg-primary/90" />
      <div className="w-2 h-2 bg-primary rounded-full animate-pulse dark:bg-primary/90" style={{ animationDelay: '200ms' }} />
      <div className="w-2 h-2 bg-primary rounded-full animate-pulse dark:bg-primary/90" style={{ animationDelay: '400ms' }} />
    </div>
  );
} 