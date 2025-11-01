'use client';

import { useState, useEffect } from 'react';
import { PWAJsonReader } from '@/lib/pwa-json-reader';

export function usePWAData<T>(filePath: string, initialData?: T) {
  const [data, setData] = useState<T | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await PWAJsonReader.readWithCache<T>(filePath);
      setData(result);
      setLastUpdated(Date.now());
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading data';
      setError(errorMessage);
      console.error(`Error loading ${filePath}:`, err);
      
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    if (!initialData) {
      loadData();
    }
  }, [filePath]);

  // Listen for PWA updates
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const channel = new BroadcastChannel('metrica-json-updates');
    
    const handleUpdate = (event: MessageEvent) => {
      if (event.data.type === 'JSON_UPDATED') {
        const updatedPath = event.data.path;
        const targetPath = filePath.startsWith('json/') ? filePath : `json/${filePath}`;
        
        if (updatedPath === targetPath) {
          console.log(`[usePWAData] Reloading ${filePath} due to update`);
          loadData();
        }
      }
    };

    channel.addEventListener('message', handleUpdate);
    
    return () => {
      channel.removeEventListener('message', handleUpdate);
      channel.close();
    };
  }, [filePath]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    reload: loadData,
    clearError: () => setError(null)
  };
}

// Hook específico para componentes con datos iniciales (SSR)
export function usePWADataSSR<T>(filePath: string, serverData: T) {
  return usePWAData<T>(filePath, serverData);
}