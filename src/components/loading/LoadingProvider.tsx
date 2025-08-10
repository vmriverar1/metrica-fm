'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { useLoadingStore, usePageTransition } from '@/hooks/useGlobalLoading';
import LoadingScreen from './LoadingScreen';

interface LoadingContextType {
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  setProgress: (progress: number) => void;
  setMessage: (message: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
}

interface LoadingProviderProps {
  children: React.ReactNode;
  enableRouteLoading?: boolean;
  minLoadingTime?: number;
}

export default function LoadingProvider({ 
  children, 
  enableRouteLoading = true,
  minLoadingTime = 500
}: LoadingProviderProps) {
  const { isLoading, message, setLoading, setProgress, setMessage } = useLoadingStore();
  const { startTransition, endTransition } = usePageTransition();
  const router = useRouter();
  const pathname = usePathname();

  // Handle route changes
  useEffect(() => {
    if (!enableRouteLoading) return;

    const handleRouteStart = () => {
      startTransition('Cargando página...');
    };

    const handleRouteEnd = () => {
      // Add minimum loading time for better UX
      setTimeout(() => {
        endTransition();
      }, minLoadingTime);
    };

    // Listen for route changes (simplified approach)
    const originalPush = router.push;
    router.push = function(...args) {
      handleRouteStart();
      return originalPush.apply(this, args);
    };

    // Handle completion on pathname change
    handleRouteEnd();

    return () => {
      router.push = originalPush;
    };
  }, [pathname, enableRouteLoading, minLoadingTime, router, startTransition, endTransition]);

  // Loading methods
  const showLoading = (loadingMessage?: string) => {
    setLoading(true, loadingMessage);
  };

  const hideLoading = () => {
    setLoading(false);
  };

  const updateProgress = (progress: number) => {
    setProgress(progress);
  };

  const updateMessage = (newMessage: string) => {
    setMessage(newMessage);
  };

  const contextValue: LoadingContextType = {
    showLoading,
    hideLoading,
    setProgress: updateProgress,
    setMessage: updateMessage
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
      
      {/* Global Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <LoadingScreen key="loading-screen" />
        )}
      </AnimatePresence>
    </LoadingContext.Provider>
  );
}

// HOC for pages that need loading states
export function withLoading<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  loadingMessage?: string
) {
  return function WithLoadingComponent(props: P) {
    const { showLoading, hideLoading } = useLoading();

    useEffect(() => {
      showLoading(loadingMessage);
      
      // Simulate component loading
      const timer = setTimeout(() => {
        hideLoading();
      }, 1000);

      return () => {
        clearTimeout(timer);
        hideLoading();
      };
    }, [showLoading, hideLoading]);

    return <WrappedComponent {...props} />;
  };
}

// Loading boundary component for error handling
export function LoadingBoundary({ 
  children, 
  fallback,
  error 
}: { 
  children: React.ReactNode;
  fallback?: React.ReactNode;
  error?: string | null;
}) {
  const { isLoading } = useLoadingStore();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Error al cargar contenido
        </h3>
        <p className="text-muted-foreground text-center max-w-md">
          {error}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Intentar nuevamente
        </button>
      </div>
    );
  }

  if (isLoading && fallback) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}