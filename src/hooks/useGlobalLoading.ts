'use client';

import { create } from 'zustand';
import { useEffect, useState } from 'react';

interface LoadingState {
  isLoading: boolean;
  message: string;
  progress: number;
  setLoading: (loading: boolean, message?: string) => void;
  setProgress: (progress: number) => void;
  setMessage: (message: string) => void;
}

// Global loading store using Zustand
export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  message: 'Cargando...',
  progress: 0,
  setLoading: (loading: boolean, message?: string) => 
    set({ 
      isLoading: loading, 
      message: message || 'Cargando...',
      progress: loading ? 0 : 100
    }),
  setProgress: (progress: number) => set({ progress }),
  setMessage: (message: string) => set({ message })
}));

// Hook for managing global loading state
export function useGlobalLoading() {
  const { isLoading, message, progress, setLoading, setProgress, setMessage } = useLoadingStore();

  const showLoading = (message?: string) => {
    setLoading(true, message);
  };

  const hideLoading = () => {
    setLoading(false);
  };

  const updateProgress = (newProgress: number) => {
    setProgress(Math.min(Math.max(newProgress, 0), 100));
  };

  const updateMessage = (newMessage: string) => {
    setMessage(newMessage);
  };

  // Simulate progressive loading
  const simulateLoading = async (messages: string[], duration: number = 3000) => {
    showLoading(messages[0]);
    
    const steps = messages.length;
    const stepDuration = duration / steps;
    
    for (let i = 0; i < messages.length; i++) {
      updateMessage(messages[i]);
      updateProgress((i + 1) * (100 / steps));
      
      if (i < messages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, stepDuration));
      }
    }
    
    setTimeout(() => {
      hideLoading();
    }, 500);
  };

  return {
    isLoading,
    message,
    progress,
    showLoading,
    hideLoading,
    updateProgress,
    updateMessage,
    simulateLoading
  };
}

// Hook for page transition loading
export function usePageTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const { showLoading, hideLoading } = useGlobalLoading();

  const startTransition = (message?: string) => {
    setIsTransitioning(true);
    setStartTime(Date.now());
    showLoading(message || 'Navegando...');
  };

  const endTransition = () => {
    if (!startTime) return;
    
    const elapsedTime = Date.now() - startTime;
    const minLoadingTime = 1000; // Minimum 1 second
    
    if (elapsedTime < minLoadingTime) {
      // Wait until minimum loading time is reached
      setTimeout(() => {
        setIsTransitioning(false);
        setStartTime(null);
        hideLoading();
      }, minLoadingTime - elapsedTime);
    } else {
      setIsTransitioning(false);
      setStartTime(null);
      hideLoading();
    }
  };

  useEffect(() => {
    // Auto-hide loading after 15 seconds as safety measure
    if (isTransitioning && startTime) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
        setStartTime(null);
        hideLoading();
      }, 15000);
      
      return () => clearTimeout(timeout);
    }
  }, [isTransitioning, startTime, hideLoading]);

  return {
    isTransitioning,
    startTransition,
    endTransition
  };
}

// Hook for API request loading
export function useAsyncLoading() {
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showLoading, hideLoading, updateMessage } = useGlobalLoading();

  const executeWithLoading = async <T>(
    asyncFn: () => Promise<T>,
    options?: {
      globalLoading?: boolean;
      loadingMessage?: string;
      successMessage?: string;
      errorMessage?: string;
    }
  ): Promise<T | null> => {
    const {
      globalLoading = false,
      loadingMessage = 'Procesando...',
      successMessage,
      errorMessage = 'Error al procesar la solicitud'
    } = options || {};

    try {
      setError(null);
      
      if (globalLoading) {
        showLoading(loadingMessage);
      } else {
        setLocalLoading(true);
      }

      const result = await asyncFn();

      if (successMessage) {
        if (globalLoading) {
          updateMessage(successMessage);
          setTimeout(() => hideLoading(), 1000);
        }
      } else {
        if (globalLoading) {
          hideLoading();
        } else {
          setLocalLoading(false);
        }
      }

      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : errorMessage;
      setError(errorMsg);

      if (globalLoading) {
        updateMessage(errorMsg);
        setTimeout(() => hideLoading(), 2000);
      } else {
        setLocalLoading(false);
      }

      return null;
    }
  };

  return {
    loading: localLoading,
    error,
    executeWithLoading,
    clearError: () => setError(null)
  };
}

// Hook for form submission loading
export function useFormLoading() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const { updateProgress } = useGlobalLoading();

  const submitWithProgress = async (
    submitFn: () => Promise<void>,
    steps: string[]
  ) => {
    setIsSubmitting(true);
    
    try {
      for (let i = 0; i < steps.length; i++) {
        setSubmitMessage(steps[i]);
        updateProgress((i / steps.length) * 100);
        
        if (i === steps.length - 1) {
          await submitFn();
        } else {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      updateProgress(100);
      setSubmitMessage('¡Completado!');
      
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitMessage('');
      }, 1000);
      
    } catch (error) {
      setSubmitMessage('Error al procesar');
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitMessage('');
      }, 2000);
      throw error;
    }
  };

  return {
    isSubmitting,
    submitMessage,
    submitWithProgress
  };
}