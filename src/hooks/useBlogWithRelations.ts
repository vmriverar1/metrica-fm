/**
 * Hook para Blog con Relaciones
 * Usa las nuevas APIs que hacen cross-reference entre artículos, autores y categorías
 */

import { useState, useEffect, useCallback } from 'react';

export interface BlogAuthor {
  id: string;
  name: string;
  email: string;
  role: string;
  bio: string;
  avatar: string;
  linkedin?: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color?: string;
  icon?: string;
}

export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string;
  tags: string[];
  featured: boolean;
  status: string;
  reading_time?: number;
  views?: number;
  likes?: number;
  created_at: any;
  updated_at: any;
  published_at?: any;
  publishedAt?: any;

  // IDs de relaciones
  author_id: string;
  category_id: string;

  // Datos relacionados
  author: BlogAuthor;
  category: BlogCategory;
}

export interface BlogFilters {
  category_id?: string;
  author_id?: string;
  featured?: boolean;
  searchQuery?: string;
}

export interface UseBlogWithRelationsResult {
  // Data
  articles: BlogArticle[];
  categories: BlogCategory[];
  authors: BlogAuthor[];
  filteredArticles: BlogArticle[];

  // Filters
  filters: BlogFilters;
  setFilters: (filters: BlogFilters) => void;
  updateFilters: (newFilters: Partial<BlogFilters>) => void;

  // Loading states
  articlesLoading: boolean;
  categoriesLoading: boolean;
  authorsLoading: boolean;
  isLoading: boolean;

  // Error states
  articlesError: string | null;
  categoriesError: string | null;
  authorsError: string | null;
  error: string | null;

  // Actions
  refresh: () => Promise<void>;
  filterByCategory: (categoryId: string) => void;
  filterByAuthor: (authorId: string) => void;
  searchArticles: (term: string) => void;
  resetFilters: () => void;
}

export function useBlogWithRelations(): UseBlogWithRelationsResult {
  // State
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [authors, setAuthors] = useState<BlogAuthor[]>([]);
  const [filters, setFilters] = useState<BlogFilters>({});

  // Loading states
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [authorsLoading, setAuthorsLoading] = useState(true);

  // Error states
  const [articlesError, setArticlesError] = useState<string | null>(null);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [authorsError, setAuthorsError] = useState<string | null>(null);

  // Load articles
  const loadArticles = useCallback(async () => {
    try {
      setArticlesLoading(true);
      setArticlesError(null);

      // Build query parameters
      const params = new URLSearchParams();
      if (filters.category_id && filters.category_id !== 'all') {
        params.set('category_id', filters.category_id);
      }
      if (filters.author_id && filters.author_id !== 'all') {
        params.set('author_id', filters.author_id);
      }
      if (filters.featured !== undefined) {
        params.set('featured', String(filters.featured));
      }

      const url = `/api/blog/articles-with-relations${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch articles: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to load articles');
      }

      console.log('📰 Blog articles with relations loaded:', {
        count: result.data?.length || 0,
        samples: result.data?.slice(0, 2)?.map((a: BlogArticle) => ({
          title: a.title,
          author: a.author?.name,
          category: a.category?.name
        })) || []
      });

      setArticles(result.data || []);

    } catch (err) {
      setArticlesError(err instanceof Error ? err.message : 'Error loading articles');
      console.error('Error loading articles:', err);
    } finally {
      setArticlesLoading(false);
    }
  }, [filters.category_id, filters.author_id, filters.featured]);

  // Load categories
  const loadCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError(null);

      const response = await fetch('/api/blog/categories');
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to load categories');
      }

      console.log('📂 Blog categories loaded:', { count: result.data?.length || 0 });
      setCategories(result.data || []);

    } catch (err) {
      setCategoriesError(err instanceof Error ? err.message : 'Error loading categories');
      console.error('Error loading categories:', err);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  // Load authors
  const loadAuthors = useCallback(async () => {
    try {
      setAuthorsLoading(true);
      setAuthorsError(null);

      const response = await fetch('/api/blog/authors');
      if (!response.ok) {
        throw new Error(`Failed to fetch authors: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to load authors');
      }

      console.log('👥 Blog authors loaded:', { count: result.data?.length || 0 });
      setAuthors(result.data || []);

    } catch (err) {
      setAuthorsError(err instanceof Error ? err.message : 'Error loading authors');
      console.error('Error loading authors:', err);
    } finally {
      setAuthorsLoading(false);
    }
  }, []);

  // Filter articles by search query
  const filteredArticles = articles.filter(article => {
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const searchTerm = filters.searchQuery.toLowerCase();
      return (
        article.title.toLowerCase().includes(searchTerm) ||
        article.excerpt.toLowerCase().includes(searchTerm) ||
        article.content.toLowerCase().includes(searchTerm) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        article.author?.name.toLowerCase().includes(searchTerm) ||
        article.category?.name.toLowerCase().includes(searchTerm)
      );
    }
    return true;
  });

  // Actions
  const updateFilters = useCallback((newFilters: Partial<BlogFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const filterByCategory = useCallback((categoryId: string) => {
    updateFilters({ category_id: categoryId === 'all' ? undefined : categoryId });
  }, [updateFilters]);

  const filterByAuthor = useCallback((authorId: string) => {
    updateFilters({ author_id: authorId === 'all' ? undefined : authorId });
  }, [updateFilters]);

  const searchArticles = useCallback((term: string) => {
    updateFilters({ searchQuery: term });
  }, [updateFilters]);

  const resetFilters = useCallback(() => {
    setFilters({});
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([
      loadArticles(),
      loadCategories(),
      loadAuthors()
    ]);
  }, [loadArticles, loadCategories, loadAuthors]);

  // Load data on mount and when filters change
  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  useEffect(() => {
    loadCategories();
    loadAuthors();
  }, [loadCategories, loadAuthors]);

  // Computed values
  const isLoading = articlesLoading || categoriesLoading || authorsLoading;
  const error = articlesError || categoriesError || authorsError;

  return {
    // Data
    articles,
    categories,
    authors,
    filteredArticles,

    // Filters
    filters,
    setFilters,
    updateFilters,

    // Loading states
    articlesLoading,
    categoriesLoading,
    authorsLoading,
    isLoading,

    // Error states
    articlesError,
    categoriesError,
    authorsError,
    error,

    // Actions
    refresh,
    filterByCategory,
    filterByAuthor,
    searchArticles,
    resetFilters
  };
}