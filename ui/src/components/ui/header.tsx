'use client';

import { ThemeToggle } from './theme-toggle';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
  children?: React.ReactNode;
}

export function Header({ className, children }: HeaderProps) {
  return (
    <header className={cn(
      "sticky top-0 z-50 w-full",
      "border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      "transition-colors duration-200",
      className
    )}>
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-full bg-primary" />
            <span className="font-semibold text-foreground">Doraemon</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {children}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
} 