/**
 * Hooks React para administración de Newsletter/Blog con Firestore
 * Específicamente diseñados para el panel admin CRUD
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Autor,
  AutorData,
  Categoria,
  CategoriaData,
  Articulo,
  ArticuloData,
  ArticuloConRelaciones,
  NewsletterFilters,
  NewsletterStats,
  CRUDResponse,
  validateAutorData,
  validateCategoriaData,
  validateArticuloData
} from '@/types/newsletter';

// Importación dinámica de servicios para evitar errores en SSR
let AutoresService: any;
let CategoriasService: any;
let ArticulosService: any;
let NewsletterStatsService: any;

async function initializeServices() {
  if (!AutoresService) {
    const services = await import('@/lib/firestore/newsletter-service');
    AutoresService = services.autoresService;
    CategoriasService = services.categoriasService;
    ArticulosService = services.articulosService;
    NewsletterStatsService = services.newsletterStatsService;
  }
}

// ==========================================
// HOOKS PARA AUTORES
// ==========================================

export interface UseAutoresResult {
  autores: Autor[];
  loading: boolean;
  error: string | null;
  create: (data: AutorData) => Promise<CRUDResponse>;
  update: (id: string, data: Partial<AutorData>) => Promise<CRUDResponse>;
  remove: (id: string) => Promise<CRUDResponse>;
  refresh: () => Promise<void>;
  getById: (id: string) => Promise<Autor | null>;
}

export function useAutores(): UseAutoresResult {
  const [autores, setAutores] = useState<Autor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar todos los autores
  const loadAutores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await initializeServices();
      const data = await AutoresService.listarTodos();
      setAutores(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading authors');
      console.error('Error loading autores:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear autor
  const create = useCallback(async (data: AutorData): Promise<CRUDResponse> => {
    try {
      // Validar datos del lado cliente
      const validationErrors = validateAutorData(data);
      if (validationErrors.length > 0) {
        return {
          exito: false,
          mensaje: `Errores de validación: ${validationErrors.join(', ')}`
        };
      }

      await initializeServices();
      const response = await AutoresService.crear(data);
      if (response.exito) {
        await loadAutores(); // Refrescar lista
      }
      return response;
    } catch (err) {
      console.error('Error creating autor:', err);
      return {
        exito: false,
        mensaje: err instanceof Error ? err.message : 'Error creating author'
      };
    }
  }, [loadAutores]);

  // Actualizar autor
  const update = useCallback(async (id: string, data: Partial<AutorData>): Promise<CRUDResponse> => {
    try {
      await initializeServices();
      const response = await AutoresService.actualizar(id, data);
      if (response.exito) {
        await loadAutores(); // Refrescar lista
      }
      return response;
    } catch (err) {
      console.error('Error updating autor:', err);
      return {
        exito: false,
        mensaje: err instanceof Error ? err.message : 'Error updating author'
      };
    }
  }, [loadAutores]);

  // Eliminar autor
  const remove = useCallback(async (id: string): Promise<CRUDResponse> => {
    try {
      await initializeServices();
      const response = await AutoresService.eliminar(id);
      if (response.exito) {
        await loadAutores(); // Refrescar lista
      }
      return response;
    } catch (err) {
      console.error('Error deleting autor:', err);
      return {
        exito: false,
        mensaje: err instanceof Error ? err.message : 'Error deleting author'
      };
    }
  }, [loadAutores]);

  // Obtener por ID
  const getById = useCallback(async (id: string): Promise<Autor | null> => {
    try {
      await initializeServices();
      return await AutoresService.obtenerPorId(id);
    } catch (err) {
      console.error('Error getting autor by ID:', err);
      return null;
    }
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    loadAutores();
  }, [loadAutores]);

  return {
    autores,
    loading,
    error,
    create,
    update,
    remove,
    refresh: loadAutores,
    getById
  };
}

// ==========================================
// HOOKS PARA CATEGORÍAS
// ==========================================

export interface UseCategoriasResult {
  categorias: Categoria[];
  loading: boolean;
  error: string | null;
  create: (data: CategoriaData) => Promise<CRUDResponse>;
  update: (id: string, data: Partial<CategoriaData>) => Promise<CRUDResponse>;
  remove: (id: string) => Promise<CRUDResponse>;
  refresh: () => Promise<void>;
  getById: (id: string) => Promise<Categoria | null>;
}

export function useCategorias(): UseCategoriasResult {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar todas las categorías
  const loadCategorias = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await initializeServices();
      const data = await CategoriasService.listarTodas();
      setCategorias(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading categories');
      console.error('Error loading categorias:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear categoría
  const create = useCallback(async (data: CategoriaData): Promise<CRUDResponse> => {
    try {
      // Validar datos del lado cliente
      const validationErrors = validateCategoriaData(data);
      if (validationErrors.length > 0) {
        return {
          exito: false,
          mensaje: `Errores de validación: ${validationErrors.join(', ')}`
        };
      }

      await initializeServices();
      const response = await CategoriasService.crear(data);
      if (response.exito) {
        await loadCategorias(); // Refrescar lista
      }
      return response;
    } catch (err) {
      console.error('Error creating categoria:', err);
      return {
        exito: false,
        mensaje: err instanceof Error ? err.message : 'Error creating category'
      };
    }
  }, [loadCategorias]);

  // Actualizar categoría
  const update = useCallback(async (id: string, data: Partial<CategoriaData>): Promise<CRUDResponse> => {
    try {
      await initializeServices();
      const response = await CategoriasService.actualizar(id, data);
      if (response.exito) {
        await loadCategorias(); // Refrescar lista
      }
      return response;
    } catch (err) {
      console.error('Error updating categoria:', err);
      return {
        exito: false,
        mensaje: err instanceof Error ? err.message : 'Error updating category'
      };
    }
  }, [loadCategorias]);

  // Eliminar categoría
  const remove = useCallback(async (id: string): Promise<CRUDResponse> => {
    try {
      await initializeServices();
      const response = await CategoriasService.eliminar(id);
      if (response.exito) {
        await loadCategorias(); // Refrescar lista
      }
      return response;
    } catch (err) {
      console.error('Error deleting categoria:', err);
      return {
        exito: false,
        mensaje: err instanceof Error ? err.message : 'Error deleting category'
      };
    }
  }, [loadCategorias]);

  // Obtener por ID
  const getById = useCallback(async (id: string): Promise<Categoria | null> => {
    try {
      await initializeServices();
      return await CategoriasService.obtenerPorId(id);
    } catch (err) {
      console.error('Error getting categoria by ID:', err);
      return null;
    }
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    loadCategorias();
  }, [loadCategorias]);

  return {
    categorias,
    loading,
    error,
    create,
    update,
    remove,
    refresh: loadCategorias,
    getById
  };
}

// ==========================================
// HOOKS PARA ARTÍCULOS
// ==========================================

export interface UseArticulosOptions {
  filters?: NewsletterFilters;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseArticulosResult {
  articulos: ArticuloConRelaciones[];
  loading: boolean;
  error: string | null;
  create: (data: ArticuloData) => Promise<CRUDResponse>;
  update: (id: string, data: Partial<ArticuloData>) => Promise<CRUDResponse>;
  remove: (id: string) => Promise<CRUDResponse>;
  refresh: () => Promise<void>;
  getById: (id: string) => Promise<ArticuloConRelaciones | null>;
  getBySlug: (slug: string) => Promise<ArticuloConRelaciones | null>;
  search: (query: string) => Promise<ArticuloConRelaciones[]>;
}

export function useArticulos(options: UseArticulosOptions = {}): UseArticulosResult {
  const [articulos, setArticulos] = useState<ArticuloConRelaciones[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar artículos con filtros
  const loadArticulos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await initializeServices();
      const data = await ArticulosService.listarTodos(options.filters);
      setArticulos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading articles');
      console.error('Error loading articulos:', err);
    } finally {
      setLoading(false);
    }
  }, [options.filters]);

  // Crear artículo
  const create = useCallback(async (data: ArticuloData): Promise<CRUDResponse> => {
    try {
      // Validar datos del lado cliente
      const validationErrors = validateArticuloData(data);
      if (validationErrors.length > 0) {
        return {
          exito: false,
          mensaje: `Errores de validación: ${validationErrors.join(', ')}`
        };
      }

      await initializeServices();
      const response = await ArticulosService.crear(data);
      if (response.exito) {
        await loadArticulos(); // Refrescar lista
      }
      return response;
    } catch (err) {
      console.error('Error creating articulo:', err);
      return {
        exito: false,
        mensaje: err instanceof Error ? err.message : 'Error creating article'
      };
    }
  }, [loadArticulos]);

  // Actualizar artículo
  const update = useCallback(async (id: string, data: Partial<ArticuloData>): Promise<CRUDResponse> => {
    try {
      await initializeServices();
      const response = await ArticulosService.actualizar(id, data);
      if (response.exito) {
        await loadArticulos(); // Refrescar lista
      }
      return response;
    } catch (err) {
      console.error('Error updating articulo:', err);
      return {
        exito: false,
        mensaje: err instanceof Error ? err.message : 'Error updating article'
      };
    }
  }, [loadArticulos]);

  // Eliminar artículo
  const remove = useCallback(async (id: string): Promise<CRUDResponse> => {
    try {
      await initializeServices();
      const response = await ArticulosService.eliminar(id);
      if (response.exito) {
        await loadArticulos(); // Refrescar lista
      }
      return response;
    } catch (err) {
      console.error('Error deleting articulo:', err);
      return {
        exito: false,
        mensaje: err instanceof Error ? err.message : 'Error deleting article'
      };
    }
  }, [loadArticulos]);

  // Obtener por ID
  const getById = useCallback(async (id: string): Promise<ArticuloConRelaciones | null> => {
    try {
      await initializeServices();
      return await ArticulosService.getConRelaciones(id);
    } catch (err) {
      console.error('Error getting articulo by ID:', err);
      return null;
    }
  }, []);

  // Obtener por slug
  const getBySlug = useCallback(async (slug: string): Promise<ArticuloConRelaciones | null> => {
    try {
      await initializeServices();
      const articulo = await ArticulosService.obtenerPorSlug(slug);
      if (!articulo) return null;

      // Cargar relaciones manualmente
      const [autor, categoria] = await Promise.all([
        AutoresService.obtenerPorId(articulo.author_id),
        CategoriasService.obtenerPorId(articulo.category_id)
      ]);

      return {
        ...articulo,
        author: autor || undefined,
        category: categoria || undefined
      };
    } catch (err) {
      console.error('Error getting articulo by slug:', err);
      return null;
    }
  }, []);

  // Buscar artículos
  const search = useCallback(async (query: string): Promise<ArticuloConRelaciones[]> => {
    try {
      await initializeServices();
      return await ArticulosService.buscar(query);
    } catch (err) {
      console.error('Error searching articulos:', err);
      return [];
    }
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    loadArticulos();
  }, [loadArticulos]);

  // Auto-refresh opcional
  useEffect(() => {
    if (options.autoRefresh) {
      const interval = setInterval(loadArticulos, options.refreshInterval || 5 * 60 * 1000); // 5 min default
      return () => clearInterval(interval);
    }
  }, [options.autoRefresh, options.refreshInterval, loadArticulos]);

  return {
    articulos,
    loading,
    error,
    create,
    update,
    remove,
    refresh: loadArticulos,
    getById,
    getBySlug,
    search
  };
}

// ==========================================
// HOOKS PARA ESTADÍSTICAS
// ==========================================

export interface UseNewsletterStatsResult {
  stats: NewsletterStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useNewsletterStats(): UseNewsletterStatsResult {
  const [stats, setStats] = useState<NewsletterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar estadísticas
  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await initializeServices();
      const data = await NewsletterStatsService.obtenerEstadisticas();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading stats');
      console.error('Error loading newsletter stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    refresh: loadStats
  };
}

// ==========================================
// HOOK COMBINADO PARA DASHBOARD
// ==========================================

export interface UseDashboardResult {
  // Data
  autores: Autor[];
  categorias: Categoria[];
  articulos: ArticuloConRelaciones[];
  stats: NewsletterStats | null;

  // Loading states
  loadingAutores: boolean;
  loadingCategorias: boolean;
  loadingArticulos: boolean;
  loadingStats: boolean;

  // Error states
  errorAutores: string | null;
  errorCategorias: string | null;
  errorArticulos: string | null;
  errorStats: string | null;

  // Actions
  refreshAll: () => Promise<void>;
  clearErrors: () => void;
}

export function useDashboard(): UseDashboardResult {
  const autoresHook = useAutores();
  const categoriasHook = useCategorias();

  // Memoizar filtros para evitar bucle infinito
  const articulosFilters = useMemo(() => ({ filters: { limit: 10 } }), []);
  const articulosHook = useArticulos(articulosFilters); // Solo últimos 10 para dashboard
  const statsHook = useNewsletterStats();

  // Refrescar todo
  const refreshAll = useCallback(async () => {
    await Promise.all([
      autoresHook.refresh(),
      categoriasHook.refresh(),
      articulosHook.refresh(),
      statsHook.refresh()
    ]);
  }, [autoresHook.refresh, categoriasHook.refresh, articulosHook.refresh, statsHook.refresh]);

  // Limpiar errores
  const clearErrors = useCallback(() => {
    // Los errores se limpian automáticamente en cada refresh de los hooks individuales
  }, []);

  return {
    // Data
    autores: autoresHook.autores,
    categorias: categoriasHook.categorias,
    articulos: articulosHook.articulos,
    stats: statsHook.stats,

    // Loading states
    loadingAutores: autoresHook.loading,
    loadingCategorias: categoriasHook.loading,
    loadingArticulos: articulosHook.loading,
    loadingStats: statsHook.loading,

    // Error states
    errorAutores: autoresHook.error,
    errorCategorias: categoriasHook.error,
    errorArticulos: articulosHook.error,
    errorStats: statsHook.error,

    // Actions
    refreshAll,
    clearErrors
  };
}