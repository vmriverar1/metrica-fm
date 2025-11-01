import { useState, useEffect } from 'react';
import { FirestoreCore } from '@/lib/firestore/firestore-core';

interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  backgroundImage?: string;
  isActive: boolean;
  projectCount: number;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  metadata?: any;
}

interface UseCategoryDataReturn {
  categoryData: CategoryData | null;
  loading: boolean;
  error: string | null;
}

export function useCategoryData(categorySlug: string): UseCategoryDataReturn {
  const [categoryData, setCategoryData] = useState<CategoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log(`📂 [useCategoryData] Fetching data for category: ${categorySlug}`);

        const result = await FirestoreCore.getDocumentById('portfolio_categories', categorySlug);

        if (result.success && result.data) {
          setCategoryData(result.data);
          console.log(`✅ [useCategoryData] Category data loaded:`, result.data);
        } else {
          setError(`No se encontró la categoría: ${categorySlug}`);
          console.warn(`⚠️ [useCategoryData] Category not found: ${categorySlug}`, result.error);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
        console.error(`❌ [useCategoryData] Error fetching category data:`, err);
      } finally {
        setLoading(false);
      }
    };

    if (categorySlug) {
      fetchCategoryData();
    }
  }, [categorySlug]);

  return { categoryData, loading, error };
}