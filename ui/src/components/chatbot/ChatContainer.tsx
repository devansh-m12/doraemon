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
    // Base styles
    "relative flex flex-col",
    "w-full h-full",
    "bg-background/90 backdrop-blur-sm",
    "border border-primary/30",
    "rounded-lg shadow-lg",
    "overflow-hidden",
    
    // Variant-specific styles
    variant === 'compact' && "max-w-4xl mx-auto",
    variant === 'full' && "w-full h-full",
    variant === 'default' && "max-w-6xl mx-auto",
    
    // Responsive design
    "sm:mx-4 md:mx-8 lg:mx-auto",
    "sm:my-4 md:my-8",
    
    // Glass morphism effect with yellow tint
    "before:absolute before:inset-0",
    "before:bg-gradient-to-br before:from-primary/5 before:to-transparent",
    "before:rounded-lg before:pointer-events-none",
    
    className
  );

  return (
    <div className={containerClasses}>
      {/* Subtle inner glow with yellow tint */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 rounded-lg pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
} 