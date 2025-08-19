/**
 * Hooks React para usar el CareersService de forma reactiva
 * Sigue el mismo patrón exitoso de usePortfolioService y useBlogService
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  CareersService, 
  CareersServiceCategory, 
  CareersSystemInfo 
} from '@/lib/careers-service';
import { 
  JobPosting, 
  JobBenefit, 
  CareersStats, 
  CareerFilters,
  JobCategory,
  JobType,
  JobLevel
} from '@/types/careers';

export interface UseCareersOptions extends CareerFilters {
  limit?: number;
  offset?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface CareersHookResult {
  // Data
  jobs: JobPosting[];
  categories: CareersServiceCategory[];
  benefits: JobBenefit[];
  stats: CareersStats | null;
  
  // Loading states
  loading: boolean;
  categoriesLoading: boolean;
  benefitsLoading: boolean;
  statsLoading: boolean;
  
  // Error states
  error: string | null;
  
  // System info
  systemInfo: CareersSystemInfo | null;
  
  // Actions
  refresh: () => Promise<void>;
  searchJobs: (query: string) => Promise<JobPosting[]>;
  getJobBySlug: (slug: string) => Promise<JobPosting | null>;
  getRelatedJobs: (job: JobPosting, limit?: number) => Promise<JobPosting[]>;
  clearCache: () => void;
}

/**
 * Hook principal para gestión completa de careers
 */
export function useCareersService(options: UseCareersOptions = {}): CareersHookResult {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [categories, setCategories] = useState<CareersServiceCategory[]>([]);
  const [benefits, setBenefits] = useState<JobBenefit[]>([]);
  const [stats, setStats] = useState<CareersStats | null>(null);
  const [systemInfo, setSystemInfo] = useState<CareersSystemInfo | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [benefitsLoading, setBenefitsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar trabajos con filtros
  const loadJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const jobsData = await CareersService.getJobs(options);
      setJobs(jobsData);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading job postings');
      console.error('Error loading job postings:', err);
    } finally {
      setLoading(false);
    }
  }, [options.category, options.type, options.level, options.remote, options.searchQuery, options.limit, options.offset]);

  // Cargar categorías
  const loadCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      const categoriesData = await CareersService.getCategories();
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error loading job categories:', err);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  // Cargar beneficios
  const loadBenefits = useCallback(async () => {
    try {
      setBenefitsLoading(true);
      const benefitsData = await CareersService.getBenefits();
      setBenefits(benefitsData);
    } catch (err) {
      console.error('Error loading job benefits:', err);
    } finally {
      setBenefitsLoading(false);
    }
  }, []);

  // Cargar estadísticas
  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const statsData = await CareersService.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error loading careers stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Cargar información del sistema
  const loadSystemInfo = useCallback(async () => {
    try {
      const info = await CareersService.getSystemInfo();
      setSystemInfo(info);
    } catch (err) {
      console.error('Error loading careers system info:', err);
    }
  }, []);

  // Refrescar todos los datos
  const refresh = useCallback(async () => {
    await Promise.all([
      loadJobs(),
      loadCategories(),
      loadBenefits(),
      loadStats(),
      loadSystemInfo()
    ]);
  }, [loadJobs, loadCategories, loadBenefits, loadStats, loadSystemInfo]);

  // Buscar trabajos
  const searchJobs = useCallback(async (query: string): Promise<JobPosting[]> => {
    try {
      return await CareersService.searchJobs(query);
    } catch (err) {
      console.error('Error searching job postings:', err);
      return [];
    }
  }, []);

  // Obtener trabajo por slug
  const getJobBySlug = useCallback(async (slug: string): Promise<JobPosting | null> => {
    try {
      return await CareersService.getJobBySlug(slug);
    } catch (err) {
      console.error('Error getting job posting by slug:', err);
      return null;
    }
  }, []);

  // Obtener trabajos relacionados
  const getRelatedJobs = useCallback(async (job: JobPosting, limit = 3): Promise<JobPosting[]> => {
    try {
      return await CareersService.getRelatedJobs(job, limit);
    } catch (err) {
      console.error('Error getting related job postings:', err);
      return [];
    }
  }, []);

  // Limpiar cache
  const clearCache = useCallback(() => {
    CareersService.clearCache();
  }, []);

  // Carga inicial
  useEffect(() => {
    loadJobs();
    loadCategories();
    loadBenefits();
    loadStats();
    loadSystemInfo();
  }, [loadJobs, loadCategories, loadBenefits, loadStats, loadSystemInfo]);

  // Auto-refresh opcional
  useEffect(() => {
    if (options.autoRefresh) {
      const interval = setInterval(refresh, options.refreshInterval || 5 * 60 * 1000); // 5 min default
      return () => clearInterval(interval);
    }
  }, [options.autoRefresh, options.refreshInterval, refresh]);

  return {
    // Data
    jobs,
    categories,
    benefits,
    stats,
    
    // Loading states
    loading,
    categoriesLoading,
    benefitsLoading,
    statsLoading,
    
    // Error state
    error,
    
    // System info
    systemInfo,
    
    // Actions
    refresh,
    searchJobs,
    getJobBySlug,
    getRelatedJobs,
    clearCache
  };
}

/**
 * Hook simplificado para obtener solo categorías de trabajos
 */
export function useJobCategories() {
  const [categories, setCategories] = useState<CareersServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    CareersService.getCategories()
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
}

/**
 * Hook simplificado para obtener estadísticas de careers
 */
export function useCareersStats() {
  const [stats, setStats] = useState<CareersStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    CareersService.getStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading };
}

/**
 * Hook para información del sistema de careers
 */
export function useCareersSystemInfo() {
  const [systemInfo, setSystemInfo] = useState<CareersSystemInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const info = await CareersService.getSystemInfo();
      setSystemInfo(info);
    } catch (err) {
      console.error('Error loading careers system info:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { systemInfo, loading, refresh };
}

/**
 * Hook para gestión de trabajos por categoría específica
 */
export function useJobsByCategory(category: JobCategory) {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    CareersService.getJobs({ category })
      .then(setJobs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category]);

  return { jobs, loading };
}

/**
 * Hook para trabajos destacados
 */
export function useFeaturedJobs(limit = 3) {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    CareersService.getJobs({ featured: true, limit })
      .then(setJobs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [limit]);

  return { jobs, loading };
}

/**
 * Hook para trabajos urgentes
 */
export function useUrgentJobs(limit = 5) {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    CareersService.getJobs({ urgent: true, limit })
      .then(setJobs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [limit]);

  return { jobs, loading };
}

/**
 * Hook para trabajos remotos
 */
export function useRemoteJobs(limit = 10) {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    CareersService.getJobs({ remote: true, limit })
      .then(setJobs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [limit]);

  return { jobs, loading };
}

/**
 * Hook para búsqueda de trabajos con debounce
 */
export function useJobSearch(initialQuery = '', debounceMs = 300) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const searchResults = await CareersService.searchJobs(query);
        setResults(searchResults);
      } catch (err) {
        console.error('Error searching job postings:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, debounceMs]);

  return {
    query,
    setQuery,
    results,
    loading,
    hasResults: results.length > 0
  };
}

/**
 * Hook para paginación de trabajos
 */
export function useJobsPagination(options: UseCareersOptions = {}, itemsPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [loading, setLoading] = useState(true);

  const totalPages = Math.ceil(totalJobs / itemsPerPage);

  const loadPage = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const offset = (page - 1) * itemsPerPage;
      const jobsData = await CareersService.getJobs({
        ...options,
        limit: itemsPerPage,
        offset
      });
      
      setJobs(jobsData);
      
      // Para obtener total, hacer query sin límite (solo en primera carga)
      if (page === 1) {
        const allJobs = await CareersService.getJobs(options);
        setTotalJobs(allJobs.length);
      }
    } catch (err) {
      console.error('Error loading jobs page:', err);
    } finally {
      setLoading(false);
    }
  }, [options, itemsPerPage]);

  useEffect(() => {
    loadPage(currentPage);
  }, [loadPage, currentPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  return {
    jobs,
    loading,
    currentPage,
    totalPages,
    totalJobs,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    goToPage,
    nextPage,
    prevPage
  };
}

/**
 * Hook para beneficios de trabajos
 */
export function useJobBenefits() {
  const [benefits, setBenefits] = useState<JobBenefit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    CareersService.getBenefits()
      .then(setBenefits)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { benefits, loading };
}

/**
 * Hook para trabajos recientes
 */
export function useRecentJobs(limit = 5) {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    CareersService.getJobs({ limit })
      .then(setJobs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [limit]);

  return { jobs, loading };
}