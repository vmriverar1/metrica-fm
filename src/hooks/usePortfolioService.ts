/**
 * Hook para usar el PortfolioService de forma reactiva
 * Mantiene compatibilidad con el contexto existente
 */

import { useState, useEffect, useCallback } from 'react';
import { PortfolioService, PortfolioCategory, PortfolioProject, PortfolioStats } from '@/lib/portfolio-service';
import { Project } from '@/types/portfolio';

export interface UsePortfolioOptions {
  category?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
  search?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface PortfolioHookResult {
  // Data
  projects: PortfolioProject[];
  categories: PortfolioCategory[];
  stats: PortfolioStats | null;
  
  // Loading states
  loading: boolean;
  categoriesLoading: boolean;
  statsLoading: boolean;
  
  // Error states
  error: string | null;
  
  // System info
  systemInfo: {
    dataSource: 'local' | 'directus';
    directusAvailable: boolean;
    lastCheck: Date;
  } | null;
  
  // Actions
  refresh: () => Promise<void>;
  searchProjects: (query: string) => Promise<PortfolioProject[]>;
  getProjectBySlug: (slug: string) => Promise<PortfolioProject | null>;
  getRelatedProjects: (project: Project) => Promise<PortfolioProject[]>;
}

export function usePortfolioService(options: UsePortfolioOptions = {}): PortfolioHookResult {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [categories, setCategories] = useState<PortfolioCategory[]>([]);
  const [stats, setStats] = useState<PortfolioStats | null>(null);
  const [systemInfo, setSystemInfo] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar proyectos
  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const projectsData = await PortfolioService.getProjects(options);
      setProjects(projectsData);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading projects');
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  }, [options.category, options.featured, options.limit, options.offset, options.search]);

  // Cargar categorías
  const loadCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      const categoriesData = await PortfolioService.getCategories();
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  // Cargar estadísticas
  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const statsData = await PortfolioService.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Cargar información del sistema
  const loadSystemInfo = useCallback(async () => {
    try {
      const info = await PortfolioService.getSystemInfo();
      setSystemInfo(info);
    } catch (err) {
      console.error('Error loading system info:', err);
    }
  }, []);

  // Refrescar todos los datos
  const refresh = useCallback(async () => {
    await Promise.all([
      loadProjects(),
      loadCategories(),
      loadStats(),
      loadSystemInfo()
    ]);
  }, [loadProjects, loadCategories, loadStats, loadSystemInfo]);

  // Buscar proyectos
  const searchProjects = useCallback(async (query: string): Promise<PortfolioProject[]> => {
    try {
      return await PortfolioService.searchProjects(query);
    } catch (err) {
      console.error('Error searching projects:', err);
      return [];
    }
  }, []);

  // Obtener proyecto por slug
  const getProjectBySlug = useCallback(async (slug: string): Promise<PortfolioProject | null> => {
    try {
      return await PortfolioService.getProjectBySlug(slug);
    } catch (err) {
      console.error('Error getting project by slug:', err);
      return null;
    }
  }, []);

  // Obtener proyectos relacionados
  const getRelatedProjects = useCallback(async (project: Project): Promise<PortfolioProject[]> => {
    try {
      return await PortfolioService.getRelatedProjects(project);
    } catch (err) {
      console.error('Error getting related projects:', err);
      return [];
    }
  }, []);

  // Carga inicial
  useEffect(() => {
    loadProjects();
    loadCategories();
    loadStats();
    loadSystemInfo();
  }, [loadProjects, loadCategories, loadStats, loadSystemInfo]);

  // Auto-refresh opcional
  useEffect(() => {
    if (options.autoRefresh) {
      const interval = setInterval(refresh, options.refreshInterval || 5 * 60 * 1000); // 5 min default
      return () => clearInterval(interval);
    }
  }, [options.autoRefresh, options.refreshInterval, refresh]);

  return {
    // Data
    projects,
    categories,
    stats,
    
    // Loading states
    loading,
    categoriesLoading,
    statsLoading,
    
    // Error state
    error,
    
    // System info
    systemInfo,
    
    // Actions
    refresh,
    searchProjects,
    getProjectBySlug,
    getRelatedProjects
  };
}

/**
 * Hook simplificado para obtener solo categorías
 */
export function usePortfolioCategories() {
  const [categories, setCategories] = useState<PortfolioCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    PortfolioService.getCategories()
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
}

/**
 * Hook simplificado para obtener estadísticas
 */
export function usePortfolioStats() {
  const [stats, setStats] = useState<PortfolioStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    PortfolioService.getStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading };
}

/**
 * Hook para información del sistema
 */
export function usePortfolioSystemInfo() {
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const info = await PortfolioService.getSystemInfo();
      setSystemInfo(info);
    } catch (err) {
      console.error('Error loading system info:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { systemInfo, loading, refresh };
}