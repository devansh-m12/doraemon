'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface StatusIndicatorProps {
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusIndicator({ 
  status, 
  message, 
  className,
  size = 'md' 
}: StatusIndicatorProps) {
  const statusConfig = {
    connected: {
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      darkColor: 'dark:bg-green-400',
      darkTextColor: 'dark:text-green-400',
      darkBgColor: 'dark:bg-green-500/10',
      darkBorderColor: 'dark:border-green-500/20',
      text: 'Connected'
    },
    disconnected: {
      icon: WifiOff,
      color: 'bg-gray-500',
      textColor: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      darkColor: 'dark:bg-gray-400',
      darkTextColor: 'dark:text-gray-400',
      darkBgColor: 'dark:bg-gray-500/10',
      darkBorderColor: 'dark:border-gray-500/20',
      text: 'Disconnected'
    },
    connecting: {
      icon: Loader2,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      darkColor: 'dark:bg-blue-400',
      darkTextColor: 'dark:text-blue-400',
      darkBgColor: 'dark:bg-blue-500/10',
      darkBorderColor: 'dark:border-blue-500/20',
      text: 'Connecting'
    },
    error: {
      icon: AlertCircle,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      darkColor: 'dark:bg-red-400',
      darkTextColor: 'dark:text-red-400',
      darkBgColor: 'dark:bg-red-500/10',
      darkBorderColor: 'dark:border-red-500/20',
      text: 'Error'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  return (
    <div className={cn(
      "inline-flex items-center gap-2",
      sizeClasses[size],
      config.bgColor,
      config.borderColor,
      config.darkBgColor,
      config.darkBorderColor,
      "border rounded-full",
      className
    )}>
      <div className={cn(
        "w-2 h-2 rounded-full",
        config.color,
        config.darkColor,
        status === 'connecting' && "animate-pulse"
      )} />
      <Icon className={cn(
        "w-3 h-3",
        config.textColor,
        config.darkTextColor,
        status === 'connecting' && "animate-spin"
      )} />
      <span className={cn("font-medium", config.textColor, config.darkTextColor)}>
        {message || config.text}
      </span>
    </div>
  );
}

export function ConnectionStatus({ 
  isConnected, 
  isConnecting, 
  className 
}: { 
  isConnected: boolean; 
  isConnecting?: boolean; 
  className?: string; 
}) {
  let status: StatusIndicatorProps['status'] = 'disconnected';
  
  if (isConnecting) {
    status = 'connecting';
  } else if (isConnected) {
    status = 'connected';
  }

  return (
    <StatusIndicator 
      status={status} 
      className={className}
      size="sm"
    />
  );
} 