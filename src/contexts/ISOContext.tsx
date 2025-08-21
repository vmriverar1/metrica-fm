'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ISOPageData } from '@/types/iso';

interface ISOContextType {
  data: ISOPageData | null;
  loading: boolean;
  error: string | null;
}

const ISOContext = createContext<ISOContextType | undefined>(undefined);

export function ISOProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<ISOPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchISOData() {
      try {
        setLoading(true);
        const response = await fetch('/json/pages/iso.json', {
          cache: 'no-store', // Para actualizaciones en tiempo real
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch ISO data');
        }
        
        const jsonData = await response.json();
        setData(jsonData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchISOData();
  }, []);

  return (
    <ISOContext.Provider value={{ data, loading, error }}>
      {children}
    </ISOContext.Provider>
  );
}

export function useISO() {
  const context = useContext(ISOContext);
  if (context === undefined) {
    throw new Error('useISO must be used within an ISOProvider');
  }
  return context;
}