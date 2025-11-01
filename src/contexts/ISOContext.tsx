'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ISOPageData } from '@/types/iso';
import { PagesService } from '@/lib/firestore/pages-service';

// Utility to normalize Firestore arrays (convert objects with numeric keys back to arrays)
function normalizeFirestoreArrays(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map(normalizeFirestoreArrays);
  }

  if (typeof obj === 'object') {
    // Check if this object should be an array (has consecutive numeric keys starting from 0)
    const keys = Object.keys(obj);
    const numericKeys = keys.filter(key => /^\d+$/.test(key)).sort((a, b) => parseInt(a) - parseInt(b));

    if (numericKeys.length > 0 && numericKeys[0] === '0' && numericKeys.length === parseInt(numericKeys[numericKeys.length - 1]) + 1) {
      // This looks like an array converted to object - convert it back
      const array = numericKeys.map(key => normalizeFirestoreArrays(obj[key]));
      return array;
    }

    // Regular object - recursively normalize its properties
    const normalized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      normalized[key] = normalizeFirestoreArrays(value);
    }
    return normalized;
  }

  return obj;
}

interface ISOContextType {
  data: ISOPageData | null;
  loading: boolean;
  error: string | null;
}

const ISOContext = createContext<ISOContextType | undefined>(undefined);

export function useISO() {
  const context = useContext(ISOContext);
  if (!context) {
    throw new Error('useISO must be used within an ISOProvider');
  }
  return context;
}

export function ISOProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<ISOPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchISOData() {
      try {
        setLoading(true);

        // Load from Firestore via API
        const response = await fetch('/api/admin/pages/iso', {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch ISO data: ${response.status}`);
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Failed to load ISO data');
        }

        // Extract content from Firestore response structure
        const pageData = result.data?.content || result.data;

        // Convert any object arrays back to proper arrays (Firestore sometimes converts arrays to objects with numeric keys)
        const normalizedData = normalizeFirestoreArrays(pageData);

        setData(normalizedData);
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

