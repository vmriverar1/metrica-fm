/**
 * FASE 5: Applications Hooks - Hooks React para Sistema de Aplicaciones
 * 
 * Hooks React especializados para el sistema híbrido de aplicaciones.
 * Proporciona gestión de estado reactiva y optimizada para el dashboard de reclutamiento.
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ApplicationsService } from '@/lib/applications-service';
import {
  JobApplication,
  ApplicationStatus,
  ApplicationSource,
  ApplicationPriority,
  ApplicationFilters,
  RecruitmentStats,
  RecruiterProfile,
  ApplicationScore
} from '@/types/careers';

// Tipos para los hooks
export interface UseApplicationsOptions extends ApplicationFilters {
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
  limit?: number;
  offset?: number;
}

export interface ApplicationsHookResult {
  applications: JobApplication[];
  loading: boolean;
  error: string | null;
  total: number;
  
  // Actions
  refresh: () => Promise<void>;
  updateStatus: (id: string, status: ApplicationStatus, notes?: string) => Promise<boolean>;
  scoreApplication: (id: string, score: Partial<ApplicationScore>, scoredBy: string) => Promise<boolean>;
  searchApplications: (query: string) => void;
  
  // Filters
  filters: ApplicationFilters;
  setFilters: (filters: Partial<ApplicationFilters>) => void;
  clearFilters: () => void;
  
  // System info
  systemInfo: {
    dataSource: 'directus' | 'local';
    directusAvailable: boolean;
    lastRefresh: Date | null;
  };
}

export interface RecruitmentStatsHookResult {
  stats: RecruitmentStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export interface RecruiterHookResult {
  recruiters: RecruiterProfile[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook principal para gestión de aplicaciones
 */
export function useApplicationsService(options: UseApplicationsOptions = {}): ApplicationsHookResult {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [filters, setFiltersState] = useState<ApplicationFilters>(options);
  const [systemInfo, setSystemInfo] = useState({
    dataSource: 'local' as const,
    directusAvailable: false,
    lastRefresh: null as Date | null
  });

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [applicationsData, sysInfo] = await Promise.all([
        ApplicationsService.getApplications({
          ...filters,
          limit: options.limit,
          offset: options.offset
        }),
        ApplicationsService.getSystemInfo()
      ]);

      setApplications(applicationsData);
      setTotal(applicationsData.length);
      setSystemInfo({
        dataSource: sysInfo.dataSource,
        directusAvailable: sysInfo.directusAvailable,
        lastRefresh: new Date()
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading applications');
    } finally {
      setLoading(false);
    }
  }, [filters, options.limit, options.offset]);

  const updateStatus = useCallback(async (
    id: string, 
    status: ApplicationStatus, 
    notes?: string
  ): Promise<boolean> => {
    try {
      const success = await ApplicationsService.updateApplicationStatus(id, status, 'Current User', notes);
      if (success) {
        await fetchApplications(); // Refresh data
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating status');
      return false;
    }
  }, [fetchApplications]);

  const scoreApplication = useCallback(async (
    id: string, 
    score: Partial<ApplicationScore>, 
    scoredBy: string
  ): Promise<boolean> => {
    try {
      const success = await ApplicationsService.scoreApplication(id, score, scoredBy);
      if (success) {
        await fetchApplications(); // Refresh data
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating score');
      return false;
    }
  }, [fetchApplications]);

  const searchApplications = useCallback((query: string) => {
    setFiltersState(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const setFilters = useCallback((newFilters: Partial<ApplicationFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({});
  }, []);

  // Initial load
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Auto refresh
  useEffect(() => {
    if (options.autoRefresh && options.refreshInterval) {
      const interval = setInterval(fetchApplications, options.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [options.autoRefresh, options.refreshInterval, fetchApplications]);

  return {
    applications,
    loading,
    error,
    total,
    refresh: fetchApplications,
    updateStatus,
    scoreApplication,
    searchApplications,
    filters,
    setFilters,
    clearFilters,
    systemInfo
  };
}

/**
 * Hook para estadísticas de reclutamiento
 */
export function useRecruitmentStats(): RecruitmentStatsHookResult {
  const [stats, setStats] = useState<RecruitmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const statsData = await ApplicationsService.getRecruitmentStats();
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading recruitment stats');
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

/**
 * Hook para gestión de reclutadores
 */
export function useRecruiters(): RecruiterHookResult {
  const [recruiters, setRecruiters] = useState<RecruiterProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecruiters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const recruitersData = await ApplicationsService.getRecruiters();
      setRecruiters(recruitersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading recruiters');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecruiters();
  }, [fetchRecruiters]);

  return {
    recruiters,
    loading,
    error,
    refresh: fetchRecruiters
  };
}

/**
 * Hook especializado para aplicaciones por trabajo
 */
export function useApplicationsByJob(jobId: string) {
  return useApplicationsService({ jobId });
}

/**
 * Hook especializado para aplicaciones por estado
 */
export function useApplicationsByStatus(status: ApplicationStatus) {
  return useApplicationsService({ status: [status] });
}

/**
 * Hook especializado para aplicaciones asignadas a un reclutador
 */
export function useApplicationsByRecruiter(recruiterId: string) {
  return useApplicationsService({ assignedTo: recruiterId });
}

/**
 * Hook para búsqueda de aplicaciones con debounce
 */
export function useApplicationSearch(initialQuery: string = '', debounceMs: number = 300) {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search query
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setIsSearching(false);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  const applicationsResult = useApplicationsService({
    searchQuery: debouncedQuery,
    limit: 50
  });

  return {
    query,
    setQuery,
    isSearching,
    results: applicationsResult.applications,
    loading: applicationsResult.loading || isSearching,
    error: applicationsResult.error
  };
}

/**
 * Hook para paginación de aplicaciones
 */
export function useApplicationsPagination(
  options: UseApplicationsOptions = {},
  itemsPerPage: number = 20
) {
  const [currentPage, setCurrentPage] = useState(1);
  
  const offset = (currentPage - 1) * itemsPerPage;
  
  const applicationsResult = useApplicationsService({
    ...options,
    limit: itemsPerPage,
    offset
  });

  const totalPages = Math.ceil(applicationsResult.total / itemsPerPage);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  return {
    ...applicationsResult,
    pagination: {
      currentPage,
      totalPages,
      itemsPerPage,
      totalItems: applicationsResult.total,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
      goToPage,
      nextPage,
      prevPage
    }
  };
}

/**
 * Hook para filtros avanzados de aplicaciones
 */
export function useApplicationFilters() {
  const [filters, setFilters] = useState<ApplicationFilters>({});
  
  const addStatusFilter = useCallback((status: ApplicationStatus) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status ? [...prev.status, status] : [status]
    }));
  }, []);

  const removeStatusFilter = useCallback((status: ApplicationStatus) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status?.filter(s => s !== status)
    }));
  }, []);

  const addSourceFilter = useCallback((source: ApplicationSource) => {
    setFilters(prev => ({
      ...prev,
      source: prev.source ? [...prev.source, source] : [source]
    }));
  }, []);

  const removeSourceFilter = useCallback((source: ApplicationSource) => {
    setFilters(prev => ({
      ...prev,
      source: prev.source?.filter(s => s !== source)
    }));
  }, []);

  const setDateRange = useCallback((from: Date, to: Date) => {
    setFilters(prev => ({
      ...prev,
      dateRange: { from, to }
    }));
  }, []);

  const setScoreRange = useCallback((min: number, max: number) => {
    setFilters(prev => ({
      ...prev,
      score: { min, max }
    }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Get active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.status?.length) count++;
    if (filters.source?.length) count++;
    if (filters.priority?.length) count++;
    if (filters.dateRange) count++;
    if (filters.score) count++;
    if (filters.flagged !== undefined) count++;
    if (filters.searchQuery) count++;
    return count;
  }, [filters]);

  return {
    filters,
    setFilters,
    addStatusFilter,
    removeStatusFilter,
    addSourceFilter,
    removeSourceFilter,
    setDateRange,
    setScoreRange,
    clearAllFilters,
    activeFiltersCount
  };
}

/**
 * Hook para información del sistema de aplicaciones
 */
export function useApplicationsSystemInfo() {
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ApplicationsService.getSystemInfo()
      .then(info => {
        setSystemInfo(info);
        setLoading(false);
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Error loading system info');
        setLoading(false);
      });
  }, []);

  return { systemInfo, loading, error };
}