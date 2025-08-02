'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ChatContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'compact' | 'full';
}

export default function ChatContainer({ 
  children, 
  className, 
  variant = 'default' 
}: ChatContainerProps) {
  const containerClasses = cn(
    // Base styles with improved dark mode boundaries
    "relative flex flex-col",
    "w-3/4 h-full mx-auto",
    "bg-background/95 backdrop-blur-sm",
    "border border-border/50",
    "rounded-lg shadow-lg",
    "overflow-hidden",
    "dark:bg-background/98 dark:border-border/60",
    "dark:shadow-2xl dark:shadow-black/20",
    
    // Variant-specific styles
    
    
    // Responsive design with reduced padding for better centering
    "sm:mx-auto md:mx-auto lg:mx-auto",
    "sm:my-4 md:my-8",
    "p-2 sm:p-4 md:p-6",
    
    // Enhanced glass morphism effect with proper dark mode
    "before:absolute before:inset-0",
    "before:bg-gradient-to-br before:from-primary/5 before:to-transparent",
    "before:rounded-lg before:pointer-events-none",
    "dark:before:from-primary/10 dark:before:to-primary/5",
    
    className
  );

  return (
    <div className={containerClasses}>
      {/* Enhanced inner glow with proper dark mode */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 rounded-lg pointer-events-none dark:from-primary/20 dark:to-accent/20" />
      
      {/* Content with improved dark mode boundaries and reduced padding */}
      <div className="relative z-10 flex-1 flex flex-col bg-transparent dark:bg-transparent">
        {children}
      </div>
    </div>
  );
} 