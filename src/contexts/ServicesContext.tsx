'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ServicesPageData } from '@/types/services';

interface ServicesContextType {
  data: ServicesPageData | null;
  loading: boolean;
  error: string | null;
}

const ServicesContext = createContext<ServicesContextType | undefined>(undefined);

export function useServices() {
  const context = useContext(ServicesContext);
  if (!context) {
    throw new Error('useServices must be used within a ServicesProvider');
  }
  return context;
}

export function ServicesProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<ServicesPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchServicesData() {
      try {
        setLoading(true);

        // Load from Firestore via API
        const response = await fetch('/api/admin/pages/services', {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch services data: ${response.status}`);
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Failed to load services data');
        }

        setData(result.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchServicesData();
  }, []);

  return (
    <ServicesContext.Provider value={{ data, loading, error }}>
      {children}
    </ServicesContext.Provider>
  );
}