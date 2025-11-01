'use client';

/**
 * Hooks React para acceso público de Newsletter/Blog con Firestore
 * Optimizados para páginas públicas con cache y performance
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Autor,
  Categoria,
  Articulo,
  ArticuloConRelaciones,
  NewsletterFilters,
  NewsletterStats
} from '@/types/newsletter';

// Importación dinámica de servicios para evitar errores en SSR
let autoresService: any;
let categoriasService: any;
let articulosService: any;
let newsletterStatsService: any;

async function initializeServices() {
  if (!autoresService) {
    const services = await import('@/lib/firestore/newsletter-service');
    autoresService = services.autoresService;
    categoriasService = services.categoriasService;
    articulosService = services.articulosService;
    newsletterStatsService = services.newsletterStatsService;
  }
}

// ==========================================
// HOOK PÚBLICO PARA ARTÍCULOS
// ==========================================

export interface UsePublicArticulosOptions {
  filters?: NewsletterFilters;
  cache?: boolean;
  refetchInterval?: number;
}

export interface UsePublicArticulosResult {
  articulos: BlogPostCompatible[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getBySlug: (slug: string) => Promise<BlogPostCompatible | null>;
  getByCategory: (categorySlug: string) => BlogPostCompatible[];
  getFeatured: (limit?: number) => BlogPostCompatible[];
  getRecent: (limit?: number) => BlogPostCompatible[];
  search: (query: string) => BlogPostCompatible[];
}

const CACHE_KEY = 'newsletter-public-articulos';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export function usePublicArticulos(options: UsePublicArticulosOptions = {}): UsePublicArticulosResult {
  const [articulos, setArticulos] = useState<BlogPostCompatible[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cache helpers
  const getFromCache = useCallback(() => {
    if (!options.cache || typeof window === 'undefined') return null;
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      const parsedCache = JSON.parse(cached);
      if (Date.now() - parsedCache.timestamp > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
      return parsedCache.data;
    } catch {
      return null;
    }
  }, [options.cache]);

  const saveToCache = useCallback((data: BlogPostCompatible[]) => {
    if (!options.cache || typeof window === 'undefined') return;
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch {
      // Silent fail
    }
  }, [options.cache]);

  // Cargar artículos
  const loadArticulos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Intentar obtener del cache primero
      if (options.cache) {
        const cachedData = getFromCache();
        if (cachedData) {
          setArticulos(cachedData);
          setLoading(false);
          return;
        }
      }

      // Use API endpoint instead of direct Firestore calls
      const response = await fetch('/api/newsletter/articles');
      if (!response.ok) {
        throw new Error(`Failed to fetch articles: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to load articles');
      }

      console.log('📰 usePublicBlog Articles loaded:', {
        count: result.data?.length || 0,
        articles: result.data?.slice(0, 2)?.map((a: any) => ({ id: a.id, title: a.title })) || []
      });

      // Convert API data to compatible format
      const convertedArticles = convertToCompatibleFormat(result.data || []);
      console.log('📰 Converted articles:', {
        count: convertedArticles.length,
        sample: convertedArticles.slice(0, 1)
      });

      setArticulos(convertedArticles);

      // Guardar en cache
      if (options.cache) {
        saveToCache(result.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading articles');
      console.error('Error loading public articulos:', err);
    } finally {
      setLoading(false);
    }
  }, [options.cache, getFromCache, saveToCache]);

  // Obtener por slug
  const getBySlug = useCallback(async (slug: string): Promise<BlogPostCompatible | null> => {
    try {
      const response = await fetch(`/api/newsletter/articles?slug=${encodeURIComponent(slug)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch article: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success || !result.data || result.data.length === 0) {
        return null;
      }

      return convertToCompatibleFormat(result.data)[0];
    } catch (err) {
      console.error('Error getting article by slug:', err);
      return null;
    }
  }, []);

  // Filtrar por categoría
  const getByCategory = useCallback((categorySlug: string): BlogPostCompatible[] => {
    return articulos.filter(articulo =>
      articulo.category === categorySlug
    );
  }, [articulos]);

  // Obtener destacados
  const getFeatured = useCallback((limit?: number): BlogPostCompatible[] => {
    const featured = articulos.filter(articulo => articulo.featured);
    return limit ? featured.slice(0, limit) : featured;
  }, [articulos]);

  // Obtener recientes
  const getRecent = useCallback((limit?: number): BlogPostCompatible[] => {
    const sorted = [...articulos].sort((a, b) =>
      b.publishedAt.getTime() - a.publishedAt.getTime()
    );
    return limit ? sorted.slice(0, limit) : sorted;
  }, [articulos]);

  // Buscar artículos
  const search = useCallback((query: string): BlogPostCompatible[] => {
    if (!query.trim()) return articulos;

    const searchTerm = query.toLowerCase();
    return articulos.filter(articulo =>
      articulo.title.toLowerCase().includes(searchTerm) ||
      articulo.excerpt.toLowerCase().includes(searchTerm) ||
      articulo.content.toLowerCase().includes(searchTerm) ||
      articulo.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      articulo.author?.name.toLowerCase().includes(searchTerm)
    );
  }, [articulos]);

  // Cargar datos iniciales
  useEffect(() => {
    loadArticulos();
  }, [loadArticulos]);

  // Auto-refresh opcional
  useEffect(() => {
    if (options.refetchInterval) {
      const interval = setInterval(loadArticulos, options.refetchInterval);
      return () => clearInterval(interval);
    }
  }, [options.refetchInterval, loadArticulos]);

  return {
    articulos,
    loading,
    error,
    refresh: loadArticulos,
    getBySlug,
    getByCategory,
    getFeatured,
    getRecent,
    search
  };
}

// ==========================================
// HOOK PÚBLICO PARA CATEGORÍAS
// ==========================================

export interface UsePublicCategoriasResult {
  categorias: Categoria[];
  loading: boolean;
  error: string | null;
  getBySlug: (slug: string) => Categoria | null;
  getActive: () => Categoria[];
}

export function usePublicCategorias(): UsePublicCategoriasResult {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar categorías
  const loadCategorias = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/newsletter/categories');
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to load categories');
      }

      console.log('📂 usePublicBlog Categories loaded:', {
        count: result.data?.length || 0,
        categories: result.data?.slice(0, 2)?.map((c: any) => ({ id: c.id, name: c.name, slug: c.slug })) || []
      });

      setCategorias(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading categories');
      console.error('Error loading public categorias:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener por slug
  const getBySlug = useCallback((slug: string): Categoria | null => {
    return categorias.find(categoria => categoria.slug === slug) || null;
  }, [categorias]);

  // Obtener activas
  const getActive = useCallback((): Categoria[] => {
    return categorias.filter(categoria => categoria.featured);
  }, [categorias]);

  // Cargar datos iniciales
  useEffect(() => {
    loadCategorias();
  }, [loadCategorias]);

  return {
    categorias,
    loading,
    error,
    getBySlug,
    getActive
  };
}

// ==========================================
// HOOK PÚBLICO PARA AUTORES
// ==========================================

export interface UsePublicAutoresResult {
  autores: Autor[];
  loading: boolean;
  error: string | null;
  getById: (id: string) => Autor | null;
  getFeatured: () => Autor[];
}

export function usePublicAutores(): UsePublicAutoresResult {
  const [autores, setAutores] = useState<Autor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar autores
  const loadAutores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/newsletter/authors');
      if (!response.ok) {
        throw new Error(`Failed to fetch authors: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to load authors');
      }

      console.log('👥 usePublicBlog Authors loaded:', {
        count: result.data?.length || 0,
        authors: result.data?.slice(0, 2)?.map((a: any) => ({ id: a.id, name: a.name, email: a.email })) || []
      });

      setAutores(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading authors');
      console.error('Error loading public autores:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener por ID
  const getById = useCallback((id: string): Autor | null => {
    return autores.find(autor => autor.id === id) || null;
  }, [autores]);

  // Obtener destacados
  const getFeatured = useCallback((): Autor[] => {
    return autores.filter(autor => autor.featured);
  }, [autores]);

  // Cargar datos iniciales
  useEffect(() => {
    loadAutores();
  }, [loadAutores]);

  return {
    autores,
    loading,
    error,
    getById,
    getFeatured
  };
}

// ==========================================
// HOOK COMBINADO PARA BLOG PÚBLICO
// ==========================================

export interface UsePublicBlogResult {
  // Data
  articulos: BlogPostCompatible[];
  categorias: Categoria[];
  autores: Autor[];
  stats: NewsletterStats | null;

  // Loading states
  articulosLoading: boolean;
  categoriasLoading: boolean;
  autoresLoading: boolean;
  statsLoading: boolean;

  // Error states
  articulosError: string | null;
  categoriasError: string | null;
  autoresError: string | null;
  statsError: string | null;

  // Actions
  refreshAll: () => Promise<void>;

  // Helpers
  getArticuloBySlug: (slug: string) => Promise<BlogPostCompatible | null>;
  getArticulosByCategory: (categorySlug: string) => BlogPostCompatible[];
  getCategoriaBySlug: (slug: string) => Categoria | null;
  getAutorById: (id: string) => Autor | null;
  getFeaturedArticulos: (limit?: number) => BlogPostCompatible[];
  getRecentArticulos: (limit?: number) => BlogPostCompatible[];
  searchArticulos: (query: string) => BlogPostCompatible[];
}

export function usePublicBlog(options: UsePublicArticulosOptions = {}): UsePublicBlogResult {
  const articulosHook = usePublicArticulos({ ...options, cache: true });
  const categoriasHook = usePublicCategorias();
  const autoresHook = usePublicAutores();

  const [stats, setStats] = useState<NewsletterStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Cargar estadísticas
  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      setStatsError(null);
      await initializeServices();
      const data = await newsletterStatsService.getStats();
      setStats(data);
    } catch (err) {
      setStatsError(err instanceof Error ? err.message : 'Error loading stats');
      console.error('Error loading public stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Cargar estadísticas iniciales
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Refrescar todo
  const refreshAll = useCallback(async () => {
    await Promise.all([
      articulosHook.refresh(),
      loadStats()
    ]);
  }, [articulosHook.refresh, loadStats]);

  return {
    // Data
    articulos: articulosHook.articulos,
    categorias: categoriasHook.categorias,
    autores: autoresHook.autores,
    stats,

    // Loading states
    articulosLoading: articulosHook.loading,
    categoriasLoading: categoriasHook.loading,
    autoresLoading: autoresHook.loading,
    statsLoading,

    // Error states
    articulosError: articulosHook.error,
    categoriasError: categoriasHook.error,
    autoresError: autoresHook.error,
    statsError,

    // Actions
    refreshAll,

    // Helpers
    getArticuloBySlug: articulosHook.getBySlug,
    getArticulosByCategory: articulosHook.getByCategory,
    getCategoriaBySlug: categoriasHook.getBySlug,
    getAutorById: autoresHook.getById,
    getFeaturedArticulos: articulosHook.getFeatured,
    getRecentArticulos: articulosHook.getRecent,
    searchArticulos: articulosHook.search
  };
}

// ==========================================
// HOOK DE CONVERSIÓN PARA COMPATIBILIDAD
// ==========================================

export interface BlogPostCompatible {
  id: string;
  title: string;
  slug: string;
  category: string;
  tags: string[];
  author: {
    id: string;
    name: string;
    role: string;
    bio: string;
    avatar: string;
  };
  publishedAt: Date;
  readingTime: number;
  excerpt: string;
  content: string;
  featuredImage: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  featured: boolean;
  status: 'published' | 'draft';
}

// Convertir artículos de API al formato compatible con componentes existentes
export function convertToCompatibleFormat(articulos: any[]): BlogPostCompatible[] {
  return articulos.map(articulo => {
    // Handle different data formats from API vs Firestore
    const isFirestoreFormat = articulo.published_date && typeof articulo.published_date.toDate === 'function';

    return {
      id: articulo.id,
      title: articulo.title,
      slug: articulo.slug,
      category: articulo.category?.slug || articulo.category_id || '',
      tags: articulo.tags || [],
      author: {
        id: articulo.author?.id || articulo.author_id || '',
        name: articulo.author?.name || '',
        role: articulo.author?.role || '',
        bio: articulo.author?.bio || '',
        avatar: articulo.author?.avatar || ''
      },
      publishedAt: isFirestoreFormat
        ? articulo.published_date.toDate()
        : new Date(articulo.published_at?.seconds ? articulo.published_at.seconds * 1000 : articulo.publishedAt?.seconds ? articulo.publishedAt.seconds * 1000 : Date.now()),
      readingTime: articulo.reading_time || articulo.content?.reading_time || 5,
      excerpt: articulo.excerpt || articulo.content?.excerpt || articulo.description || articulo.short_description || '',
      content: articulo.content?.body || articulo.content || '',
      featuredImage: articulo.featured_image || articulo.image || '',
      seo: {
        metaTitle: articulo.seo?.meta_title || articulo.title,
        metaDescription: articulo.seo?.meta_description || articulo.excerpt || articulo.description || '',
        keywords: articulo.seo?.keywords || articulo.tags || []
      },
      featured: articulo.featured || false,
      status: 'published'
    };
  });
}