'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { BlogPost, BlogFilters, BlogCategory, Author } from '@/types/blog';
import { useBlogService, BlogHookResult } from '@/hooks/useBlogService';
import { BlogServiceCategory } from '@/lib/blog-service';

interface BlogContextType extends Omit<BlogHookResult, 'posts'> {
  // Data extendida del hook
  allPosts: BlogPost[];
  filteredPosts: BlogPost[];
  selectedPost: BlogPost | null;
  
  // Filters
  filters: BlogFilters;
  setFilters: (filters: BlogFilters) => void;
  updateFilters: (newFilters: Partial<BlogFilters>) => void;
  
  // Actions
  selectPost: (post: BlogPost | null) => void;
  searchPosts: (term: string) => void;
  filterByCategory: (category: BlogCategory | 'all') => void;
  filterByAuthor: (authorId: string | 'all') => void;
  filterByTags: (tags: string[]) => void;
  toggleFeatured: () => void;
  resetFilters: () => void;
  
  // Computed values
  uniqueCategories: BlogCategory[];
  uniqueTags: string[];
  featuredPosts: BlogPost[];
  postCount: number;
  
  // Renamed loading state for compatibility
  isLoading: boolean;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

interface BlogProviderProps {
  children: ReactNode;
}

export function BlogProvider({ children }: BlogProviderProps) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [filters, setFilters] = useState<BlogFilters>({
    searchQuery: ''
  });

  // Usar el hook híbrido del BlogService
  const blogService = useBlogService(filters);

  // Los posts filtrados vienen directamente del BlogService
  const allPosts = blogService.posts;
  const filteredPosts = blogService.posts; // Ya están filtrados por el service

  // Memoized unique values basados en categorías del service
  const uniqueCategories = useMemo(() => {
    return blogService.categories.map(cat => cat.slug as BlogCategory);
  }, [blogService.categories]);

  const uniqueTags = useMemo(() => {
    const tags = new Set<string>();
    blogService.posts.forEach(post => {
      post.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [blogService.posts]);

  const featuredPosts = useMemo(() => {
    return blogService.posts.filter(post => post.featured);
  }, [blogService.posts]);

  // Actions
  const selectPost = useCallback((post: BlogPost | null) => {
    setSelectedPost(post);
  }, []);

  const updateFilters = useCallback((newFilters: Partial<BlogFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const searchPosts = useCallback((term: string) => {
    updateFilters({ searchQuery: term });
  }, [updateFilters]);

  const filterByCategory = useCallback((category: BlogCategory | 'all') => {
    updateFilters({ category: category === 'all' ? undefined : category });
  }, [updateFilters]);

  const filterByAuthor = useCallback((authorId: string | 'all') => {
    updateFilters({ author: authorId === 'all' ? undefined : authorId });
  }, [updateFilters]);

  const filterByTags = useCallback((tags: string[]) => {
    updateFilters({ tags });
  }, [updateFilters]);

  const toggleFeatured = useCallback(() => {
    updateFilters({ featured: !filters.featured });
  }, [updateFilters, filters.featured]);

  const resetFilters = useCallback(() => {
    setFilters({ searchQuery: '' });
  }, []);

  const contextValue: BlogContextType = {
    // Data del BlogService híbrido
    allPosts,
    filteredPosts,
    selectedPost,
    categories: blogService.categories,
    authors: blogService.authors,
    stats: blogService.stats,
    
    // Filters
    filters,
    setFilters,
    updateFilters,
    
    // Actions del BlogService
    selectPost,
    searchPosts,
    filterByCategory,
    filterByAuthor,
    filterByTags,
    toggleFeatured,
    resetFilters,
    refresh: blogService.refresh,
    getPostBySlug: blogService.getPostBySlug,
    getRelatedPosts: blogService.getRelatedPosts,
    clearCache: blogService.clearCache,
    
    // Computed values
    uniqueCategories,
    uniqueTags,
    featuredPosts,
    postCount: filteredPosts.length,
    
    // System info del BlogService
    systemInfo: blogService.systemInfo,
    
    // Loading states (renombrados para compatibilidad)
    isLoading: blogService.loading,
    loading: blogService.loading,
    categoriesLoading: blogService.categoriesLoading,
    authorsLoading: blogService.authorsLoading,
    statsLoading: blogService.statsLoading,
    error: blogService.error
  };

  return (
    <BlogContext.Provider value={contextValue}>
      {children}
    </BlogContext.Provider>
  );
}

export function useBlog() {
  const context = useContext(BlogContext);
  if (context === undefined) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
}

// Hook para obtener un post específico por slug (usa BlogService híbrido)
export function useBlogPost(slug: string): BlogPost | null {
  const { getPostBySlug } = useBlog();
  const [post, setPost] = useState<BlogPost | null>(null);
  
  useEffect(() => {
    getPostBySlug(slug).then(setPost);
  }, [slug, getPostBySlug]);
  
  return post;
}

// Hook para obtener posts por categoría (usa BlogService híbrido)
export function useBlogPostsByCategory(category: BlogCategory): BlogPost[] {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  
  useEffect(() => {
    import('@/lib/blog-service').then(({ BlogService }) => {
      BlogService.getPosts({ category }).then(setPosts);
    });
  }, [category]);
  
  return posts;
}

// Hook para obtener posts destacados (usa BlogService híbrido)
export function useFeaturedBlogPosts(): BlogPost[] {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  
  useEffect(() => {
    import('@/lib/blog-service').then(({ BlogService }) => {
      BlogService.getPosts({ featured: true }).then(setPosts);
    });
  }, []);
  
  return posts;
}

// Hook para obtener posts recientes (usa BlogService híbrido)
export function useRecentBlogPosts(limit: number = 5): BlogPost[] {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  
  useEffect(() => {
    import('@/lib/blog-service').then(({ BlogService }) => {
      BlogService.getPosts({ limit }).then(setPosts);
    });
  }, [limit]);
  
  return posts;
}

// Hook para obtener posts relacionados (usa BlogService híbrido)
export function useRelatedBlogPosts(currentPost: BlogPost, limit: number = 3): BlogPost[] {
  const { getRelatedPosts } = useBlog();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  
  useEffect(() => {
    getRelatedPosts(currentPost, limit).then(setPosts);
  }, [currentPost, limit, getRelatedPosts]);
  
  return posts;
}

// Hook para cache similar al portfolio
export function useBlogCache() {
  const cacheKey = 'metrica-blog-cache';
  
  const getCache = useCallback(() => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = localStorage.getItem(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }, []);

  const setCache = useCallback((data: any) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(cacheKey, JSON.stringify({
        ...data,
        timestamp: Date.now()
      }));
    } catch {
      // Silent fail
    }
  }, []);

  const clearCache = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(cacheKey);
    } catch {
      // Silent fail
    }
  }, []);

  return { getCache, setCache, clearCache };
}