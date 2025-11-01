'use client';

import React from 'react';
import { usePWAData } from '@/hooks/usePWAData';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface PWADataWrapperProps<T> {
  filePath: string;
  children: (data: T) => React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  initialData?: T;
  className?: string;
}

export function PWADataWrapper<T>({ 
  filePath, 
  children, 
  fallback, 
  errorFallback,
  initialData,
  className 
}: PWADataWrapperProps<T>) {
  const { data, loading, error, reload } = usePWAData<T>(filePath, initialData);

  // Error state
  if (error && !data) {
    if (errorFallback) {
      return <>{errorFallback}</>;
    }

    return (
      <div className={`flex flex-col items-center justify-center p-8 text-center ${className || ''}`}>
        <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Error loading content</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Failed to load data from {filePath}
        </p>
        <button 
          onClick={reload}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  // Loading state (only if no data available)
  if (loading && !data) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className={className}>
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  // Render with data
  if (data) {
    return <>{children(data)}</>;
  }

  return null;
}

// Wrapper específico para componentes que esperan datos del servidor
export function PWADataWrapperSSR<T>({ 
  filePath, 
  children, 
  serverData,
  className 
}: Omit<PWADataWrapperProps<T>, 'initialData' | 'fallback' | 'errorFallback'> & { 
  serverData: T 
}) {
  return (
    <PWADataWrapper
      filePath={filePath}
      initialData={serverData}
      className={className}
      fallback={
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      }
    >
      {children}
    </PWADataWrapper>
  );
}