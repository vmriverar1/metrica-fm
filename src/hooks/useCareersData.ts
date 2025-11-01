'use client';

import { useState, useEffect } from 'react';
import { CareersPageData } from '@/types/careers';

// Export for backward compatibility
export type CareersData = CareersPageData;

export function useCareersData() {
  const [data, setData] = useState<CareersPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load from Firestore via API
        const response = await fetch('/api/admin/pages/careers', {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch careers data: ${response.status}`);
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Failed to load careers data');
        }

        // Extract content from Firestore response structure
        const pageData = result.data?.content || result.data;
        setData(pageData);
      } catch (err) {
        console.error('Error loading careers data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load careers data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}