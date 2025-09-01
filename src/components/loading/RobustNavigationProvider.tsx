'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useRobustNavigation } from '@/hooks/useRobustNavigation';
import RobustLoadingScreen from './RobustLoadingScreen';

interface RobustNavigationContextType {
  navigate: (href: string, message?: string) => Promise<boolean>;
  isNavigating: boolean;
  progress: number;
  message: string;
  canNavigate: boolean;
  cancelNavigation: () => void;
  networkConditions: any;
}

const RobustNavigationContext = createContext<RobustNavigationContextType | undefined>(undefined);

export const useRobustNavigationContext = () => {
  const context = useContext(RobustNavigationContext);
  if (!context) {
    throw new Error('useRobustNavigationContext must be used within RobustNavigationProvider');
  }
  return context;
};

interface RobustNavigationProviderProps {
  children: React.ReactNode;
}

export default function RobustNavigationProvider({ children }: RobustNavigationProviderProps) {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const {
    isNavigating,
    currentNavigation,
    navigationQueue,
    networkConditions,
    navigateWithRetry,
    cancelNavigation,
    handleLinkClick,
    smartPrefetch,
    clearQueue,
    canNavigate
  } = useRobustNavigation({
    onStart: (msg) => {
      setProgress(0);
      setMessage(msg);
      setError(null);
    },
    onProgress: (prog, msg) => {
      setProgress(prog);
      setMessage(msg);
    },
    onSuccess: (msg) => {
      setProgress(100);
      setMessage(msg);
      setError(null);
    },
    onError: (err) => {
      setError(err);
      setMessage(err);
    },
    onComplete: () => {
      // Mantener el loading un poco más para suavizar la transición
      setTimeout(() => {
        setProgress(0);
        setMessage('');
        setError(null);
      }, 500);
    }
  });

  const contextValue: RobustNavigationContextType = {
    navigate: navigateWithRetry,
    isNavigating,
    progress,
    message: error || message,
    canNavigate,
    cancelNavigation,
    networkConditions
  };

  return (
    <RobustNavigationContext.Provider value={contextValue}>
      {children}
      
      {/* Loading Screen */}
      <RobustLoadingScreen
        isVisible={isNavigating}
        message={message}
        progress={progress}
        onCancel={cancelNavigation}
        showCancelButton={true}
        currentNavigation={currentNavigation}
      />
    </RobustNavigationContext.Provider>
  );
}