/**
 * Hook genérico unificado para cualquier sistema (Newsletter, Portfolio, Careers)
 * Compatible con la arquitectura de servicios Firestore unificados de Fase 5
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { APIResponse } from '@/lib/api/unified-response';

// Tipos genéricos para sistemas unificados
export type SystemType = 'newsletter' | 'portfolio' | 'careers';
export type DataType = 'articles' | 'categories' | 'projects' | 'positions' | 'departments' | 'applications' | 'subscribers';

export interface UnifiedDataOptions {
  system: SystemType;
  endpoint: DataType;
  filters?: Record<string, any>;
  limit?: number;
  offset?: number;
  search?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  cacheTime?: number; // Tiempo de cache en ms
}

export interface UnifiedDataResult<T = any> {
  // Data
  data: T[];
  totalCount: number;

  // Loading states
  loading: boolean;
  error: string | null;

  // Metadata
  lastFetch: Date | null;
  cached: boolean;
  systemInfo: SystemInfo | null;

  // Actions
  refresh: () => Promise<void>;
  search: (query: string) => Promise<T[]>;
  getById: (id: string) => Promise<T | null>;
  clearCache: () => void;

  // Pagination
  hasMore: boolean;
  loadMore: () => Promise<void>;
  currentPage: number;
  totalPages: number;
}

export interface SystemInfo {
  system: SystemType;
  endpoint: DataType;
  dataSource: 'firestore' | 'api';
  lastSync: Date;
  health: 'healthy' | 'warning' | 'error';
  metrics: {
    totalItems: number;
    recentItems: number;
    avgResponseTime: number;
  };
}

// Cache interno para evitar requests duplicados
const dataCache = new Map<string, { data: any[], timestamp: number, totalCount: number }>();
const DEFAULT_CACHE_TIME = 5 * 60 * 1000; // 5 minutos

/**
 * Hook genérico para cualquier sistema de datos
 */
export function useUnifiedData<T = any>(options: UnifiedDataOptions): UnifiedDataResult<T> {
  const { system, endpoint, filters = {}, limit = 20, cacheTime = DEFAULT_CACHE_TIME } = options;

  // Estado principal
  const [data, setData] = useState<T[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [cached, setCached] = useState(false);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Clave de cache única
  const cacheKey = useMemo(() =>
    `${system}-${endpoint}-${JSON.stringify(filters)}-${limit}-${options.offset || 0}-${options.search || ''}`,
    [system, endpoint, filters, limit, options.offset, options.search]
  );

  // Construir URL de API unificada
  const buildApiUrl = useCallback((overrideOptions: Partial<UnifiedDataOptions> = {}) => {
    const opts = { ...options, ...overrideOptions };
    const params = new URLSearchParams();

    // Añadir filtros como parámetros
    Object.entries(opts.filters || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    if (opts.limit) params.append('limit', String(opts.limit));
    if (opts.offset) params.append('offset', String(opts.offset));
    if (opts.search) params.append('search', opts.search);

    return `/api/${system}/${endpoint}?${params.toString()}`;
  }, [system, endpoint, options]);

  // Fetch de datos con cache
  const fetchData = useCallback(async (useCache = true) => {
    try {
      setLoading(true);
      setError(null);

      // Revisar cache primero
      if (useCache) {
        const cachedData = dataCache.get(cacheKey);
        if (cachedData && (Date.now() - cachedData.timestamp) < cacheTime) {
          setData(cachedData.data);
          setTotalCount(cachedData.totalCount);
          setCached(true);
          setLoading(false);
          return;
        }
      }

      // Fetch desde API
      const url = buildApiUrl();
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      // Verificar formato de respuesta unificada
      if (!result.success) {
        throw new Error(result.message || 'API request failed');
      }

      const fetchedData = result.data || [];
      const total = result.meta?.total || fetchedData.length;

      // Actualizar estado
      setData(fetchedData);
      setTotalCount(total);
      setLastFetch(new Date());
      setCached(false);

      // Guardar en cache
      dataCache.set(cacheKey, {
        data: fetchedData,
        timestamp: Date.now(),
        totalCount: total
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error(`Error fetching ${system} ${endpoint}:`, err);
    } finally {
      setLoading(false);
    }
  }, [system, endpoint, cacheKey, cacheTime, buildApiUrl]);

  // Fetch información del sistema
  const fetchSystemInfo = useCallback(async () => {
    try {
      const response = await fetch(`/api/unified/stats?system=${system}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSystemInfo({
            system,
            endpoint,
            dataSource: 'firestore',
            lastSync: new Date(),
            health: 'healthy',
            metrics: {
              totalItems: result.data?.[`total${endpoint.charAt(0).toUpperCase() + endpoint.slice(1)}`] || 0,
              recentItems: 0,
              avgResponseTime: 0
            }
          });
        }
      }
    } catch (err) {
      console.error('Error fetching system info:', err);
    }
  }, [system, endpoint]);

  // Búsqueda
  const search = useCallback(async (query: string): Promise<T[]> => {
    if (!query.trim()) return data;

    try {
      const url = buildApiUrl({ search: query });
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.success ? result.data : [];
    } catch (err) {
      console.error('Search error:', err);
      return [];
    }
  }, [buildApiUrl, data]);

  // Obtener por ID
  const getById = useCallback(async (id: string): Promise<T | null> => {
    try {
      const response = await fetch(`/api/${system}/${endpoint}/${id}`);

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Failed to fetch item: ${response.statusText}`);
      }

      const result = await response.json();
      return result.success ? result.data : null;
    } catch (err) {
      console.error('Error fetching item by ID:', err);
      return null;
    }
  }, [system, endpoint]);

  // Refresh
  const refresh = useCallback(async () => {
    await fetchData(false);
    await fetchSystemInfo();
  }, [fetchData, fetchSystemInfo]);

  // Clear cache
  const clearCache = useCallback(() => {
    dataCache.delete(cacheKey);
    setCached(false);
  }, [cacheKey]);

  // Load more (paginación)
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;

    const nextOffset = (currentPage - 1) * limit + data.length;
    const nextPageData = await fetchData(false);
    // Implementar lógica de append para paginación
  }, [currentPage, limit, data.length, loading]);

  // Cálculos derivados
  const totalPages = Math.ceil(totalCount / limit);
  const hasMore = currentPage < totalPages;

  // Efectos
  useEffect(() => {
    fetchData();
    fetchSystemInfo();
  }, [fetchData, fetchSystemInfo]);

  // Auto-refresh
  useEffect(() => {
    if (options.autoRefresh) {
      const interval = setInterval(refresh, options.refreshInterval || 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [options.autoRefresh, options.refreshInterval, refresh]);

  return {
    // Data
    data,
    totalCount,

    // Estados
    loading,
    error,

    // Metadata
    lastFetch,
    cached,
    systemInfo,

    // Actions
    refresh,
    search,
    getById,
    clearCache,

    // Pagination
    hasMore,
    loadMore,
    currentPage,
    totalPages
  };
}

/**
 * Hooks especializados que usan useUnifiedData
 */

// Newsletter
export function useNewsletterArticles(filters?: Record<string, any>, options?: Partial<UnifiedDataOptions>) {
  return useUnifiedData({
    system: 'newsletter',
    endpoint: 'articles',
    filters,
    ...options
  });
}

export function useNewsletterCategories(options?: Partial<UnifiedDataOptions>) {
  return useUnifiedData({
    system: 'newsletter',
    endpoint: 'categories',
    ...options
  });
}

// Portfolio
export function usePortfolioProjects(filters?: Record<string, any>, options?: Partial<UnifiedDataOptions>) {
  return useUnifiedData({
    system: 'portfolio',
    endpoint: 'projects',
    filters,
    ...options
  });
}

export function usePortfolioCategories(options?: Partial<UnifiedDataOptions>) {
  return useUnifiedData({
    system: 'portfolio',
    endpoint: 'categories',
    ...options
  });
}

// Careers
export function useCareersPositions(filters?: Record<string, any>, options?: Partial<UnifiedDataOptions>) {
  return useUnifiedData({
    system: 'careers',
    endpoint: 'positions',
    filters,
    ...options
  });
}

export function useCareersDepartments(options?: Partial<UnifiedDataOptions>) {
  return useUnifiedData({
    system: 'careers',
    endpoint: 'departments',
    ...options
  });
}

export function useCareersApplications(filters?: Record<string, any>, options?: Partial<UnifiedDataOptions>) {
  return useUnifiedData({
    system: 'careers',
    endpoint: 'applications',
    filters,
    ...options
  });
}

/**
 * Hook para múltiples sistemas a la vez
 */
export function useMultiSystemData(systems: Array<{system: SystemType, endpoint: DataType, filters?: Record<string, any>}>) {
  const results = systems.map(config =>
    useUnifiedData(config)
  );

  const isLoading = results.some(result => result.loading);
  const hasError = results.some(result => result.error);
  const errors = results.filter(result => result.error).map(result => result.error);

  return {
    results: results.map((result, index) => ({
      ...result,
      systemConfig: systems[index]
    })),
    isLoading,
    hasError,
    errors,
    refresh: () => Promise.all(results.map(result => result.refresh()))
  };
}

/**
 * Hook para estadísticas cross-system
 */
export function useUnifiedStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/unified/stats');
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch unified stats');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching unified stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats
  };
}