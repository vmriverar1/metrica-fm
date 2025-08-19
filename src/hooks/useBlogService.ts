/**
 * Hooks React para usar el BlogService de forma reactiva
 * Sigue el mismo patrón exitoso de usePortfolioService
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  BlogService, 
  BlogServiceCategory, 
  BlogSystemInfo 
} from '@/lib/blog-service';
import { 
  BlogPost, 
  Author, 
  BlogStats, 
  BlogFilters,
  BlogCategory 
} from '@/types/blog';

export interface UseBlogOptions extends BlogFilters {
  limit?: number;
  offset?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface BlogHookResult {
  // Data
  posts: BlogPost[];
  categories: BlogServiceCategory[];
  authors: Author[];
  stats: BlogStats | null;
  
  // Loading states
  loading: boolean;
  categoriesLoading: boolean;
  authorsLoading: boolean;
  statsLoading: boolean;
  
  // Error states
  error: string | null;
  
  // System info
  systemInfo: BlogSystemInfo | null;
  
  // Actions
  refresh: () => Promise<void>;
  searchPosts: (query: string) => Promise<BlogPost[]>;
  getPostBySlug: (slug: string) => Promise<BlogPost | null>;
  getRelatedPosts: (post: BlogPost, limit?: number) => Promise<BlogPost[]>;
  clearCache: () => void;
}

/**
 * Hook principal para gestión completa del blog
 */
export function useBlogService(options: UseBlogOptions = {}): BlogHookResult {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogServiceCategory[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [stats, setStats] = useState<BlogStats | null>(null);
  const [systemInfo, setSystemInfo] = useState<BlogSystemInfo | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [authorsLoading, setAuthorsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar posts con filtros
  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const postsData = await BlogService.getPosts(options);
      setPosts(postsData);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading blog posts');
      console.error('Error loading blog posts:', err);
    } finally {
      setLoading(false);
    }
  }, [options.category, options.featured, options.author, options.searchQuery, options.limit, options.offset]);

  // Cargar categorías
  const loadCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      const categoriesData = await BlogService.getCategories();
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error loading blog categories:', err);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  // Cargar autores
  const loadAuthors = useCallback(async () => {
    try {
      setAuthorsLoading(true);
      const authorsData = await BlogService.getAuthors();
      setAuthors(authorsData);
    } catch (err) {
      console.error('Error loading blog authors:', err);
    } finally {
      setAuthorsLoading(false);
    }
  }, []);

  // Cargar estadísticas
  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const statsData = await BlogService.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error loading blog stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Cargar información del sistema
  const loadSystemInfo = useCallback(async () => {
    try {
      const info = await BlogService.getSystemInfo();
      setSystemInfo(info);
    } catch (err) {
      console.error('Error loading blog system info:', err);
    }
  }, []);

  // Refrescar todos los datos
  const refresh = useCallback(async () => {
    await Promise.all([
      loadPosts(),
      loadCategories(),
      loadAuthors(),
      loadStats(),
      loadSystemInfo()
    ]);
  }, [loadPosts, loadCategories, loadAuthors, loadStats, loadSystemInfo]);

  // Buscar posts
  const searchPosts = useCallback(async (query: string): Promise<BlogPost[]> => {
    try {
      return await BlogService.searchPosts(query);
    } catch (err) {
      console.error('Error searching blog posts:', err);
      return [];
    }
  }, []);

  // Obtener post por slug
  const getPostBySlug = useCallback(async (slug: string): Promise<BlogPost | null> => {
    try {
      return await BlogService.getPostBySlug(slug);
    } catch (err) {
      console.error('Error getting blog post by slug:', err);
      return null;
    }
  }, []);

  // Obtener posts relacionados
  const getRelatedPosts = useCallback(async (post: BlogPost, limit = 3): Promise<BlogPost[]> => {
    try {
      return await BlogService.getRelatedPosts(post, limit);
    } catch (err) {
      console.error('Error getting related blog posts:', err);
      return [];
    }
  }, []);

  // Limpiar cache
  const clearCache = useCallback(() => {
    BlogService.clearCache();
  }, []);

  // Carga inicial
  useEffect(() => {
    loadPosts();
    loadCategories();
    loadAuthors();
    loadStats();
    loadSystemInfo();
  }, [loadPosts, loadCategories, loadAuthors, loadStats, loadSystemInfo]);

  // Auto-refresh opcional
  useEffect(() => {
    if (options.autoRefresh) {
      const interval = setInterval(refresh, options.refreshInterval || 5 * 60 * 1000); // 5 min default
      return () => clearInterval(interval);
    }
  }, [options.autoRefresh, options.refreshInterval, refresh]);

  return {
    // Data
    posts,
    categories,
    authors,
    stats,
    
    // Loading states
    loading,
    categoriesLoading,
    authorsLoading,
    statsLoading,
    
    // Error state
    error,
    
    // System info
    systemInfo,
    
    // Actions
    refresh,
    searchPosts,
    getPostBySlug,
    getRelatedPosts,
    clearCache
  };
}

/**
 * Hook simplificado para obtener solo categorías de blog
 */
export function useBlogCategories() {
  const [categories, setCategories] = useState<BlogServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    BlogService.getCategories()
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
}

/**
 * Hook simplificado para obtener estadísticas de blog
 */
export function useBlogStats() {
  const [stats, setStats] = useState<BlogStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    BlogService.getStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading };
}

/**
 * Hook para información del sistema de blog
 */
export function useBlogSystemInfo() {
  const [systemInfo, setSystemInfo] = useState<BlogSystemInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const info = await BlogService.getSystemInfo();
      setSystemInfo(info);
    } catch (err) {
      console.error('Error loading blog system info:', err);
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
 * Hook para gestión de posts por categoría específica
 */
export function useBlogPostsByCategory(category: BlogCategory) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    BlogService.getPosts({ category })
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category]);

  return { posts, loading };
}

/**
 * Hook para posts destacados
 */
export function useFeaturedBlogPosts(limit = 3) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    BlogService.getPosts({ featured: true, limit })
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [limit]);

  return { posts, loading };
}

/**
 * Hook para búsqueda de posts con debounce
 */
export function useBlogSearch(initialQuery = '', debounceMs = 300) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const searchResults = await BlogService.searchPosts(query);
        setResults(searchResults);
      } catch (err) {
        console.error('Error searching blog posts:', err);
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
 * Hook para paginación de posts
 */
export function useBlogPagination(options: UseBlogOptions = {}, itemsPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loading, setLoading] = useState(true);

  const totalPages = Math.ceil(totalPosts / itemsPerPage);

  const loadPage = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const offset = (page - 1) * itemsPerPage;
      const postsData = await BlogService.getPosts({
        ...options,
        limit: itemsPerPage,
        offset
      });
      
      setPosts(postsData);
      
      // Para obtener total, hacer query sin límite (solo en primera carga)
      if (page === 1) {
        const allPosts = await BlogService.getPosts(options);
        setTotalPosts(allPosts.length);
      }
    } catch (err) {
      console.error('Error loading blog page:', err);
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
    posts,
    loading,
    currentPage,
    totalPages,
    totalPosts,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    goToPage,
    nextPage,
    prevPage
  };
}