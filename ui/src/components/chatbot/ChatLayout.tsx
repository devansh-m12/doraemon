'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ChatLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function ChatLayout({ children, className }: ChatLayoutProps) {
  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-background via-background to-muted/20",
      "flex flex-col",
      "relative overflow-hidden",
      "dark:from-background dark:via-background dark:to-muted/10",
      className
    )}>
      {/* Background Pattern with improved dark mode */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none dark:opacity-[0.03]" />
      
      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {children}
      </div>
      
      {/* Subtle Border Gradient with dark mode */}
      <div className="absolute inset-0 border border-border/20 rounded-none pointer-events-none dark:border-border/30" />
    </div>
  );
}

// Add the grid pattern CSS with dark mode support
const gridPatternCSS = `
  .bg-grid-pattern {
    background-image: 
      linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px);
    background-size: 20px 20px;
  }
  
  .dark .bg-grid-pattern {
    background-image: 
      linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
    background-size: 20px 20px;
  }
`;

// Inject the CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = gridPatternCSS;
  document.head.appendChild(style);
} 