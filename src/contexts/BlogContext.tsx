'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { BlogPost, BlogFilters, BlogCategory, Author, sampleBlogPosts, sampleAuthors } from '@/types/blog';

interface BlogContextType {
  // Data
  allPosts: BlogPost[];
  filteredPosts: BlogPost[];
  selectedPost: BlogPost | null;
  authors: Author[];
  
  // Filters
  filters: BlogFilters;
  setFilters: (filters: BlogFilters) => void;
  
  // Actions
  selectPost: (post: BlogPost | null) => void;
  searchPosts: (term: string) => void;
  filterByCategory: (category: BlogCategory | 'all') => void;
  filterByAuthor: (authorId: string | 'all') => void;
  filterByTags: (tags: string[]) => void;
  toggleFeatured: () => void;
  
  // Computed values
  uniqueCategories: BlogCategory[];
  uniqueTags: string[];
  uniqueAuthors: Author[];
  postCount: number;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

interface BlogProviderProps {
  children: ReactNode;
}

export function BlogProvider({ children }: BlogProviderProps) {
  const [allPosts] = useState<BlogPost[]>(sampleBlogPosts);
  const [authors] = useState<Author[]>(sampleAuthors);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<BlogFilters>({
    searchQuery: ''
  });

  // Memoized filtered posts
  const filteredPosts = useMemo(() => {
    let filtered = [...allPosts];

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(post => post.category === filters.category);
    }

    // Filter by author
    if (filters.author) {
      filtered = filtered.filter(post => post.author.id === filters.author);
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(post => 
        filters.tags!.some(tag => post.tags.includes(tag))
      );
    }

    // Filter by featured
    if (filters.featured) {
      filtered = filtered.filter(post => post.featured);
    }

    // Filter by date range
    if (filters.dateRange) {
      filtered = filtered.filter(post => 
        post.publishedAt >= filters.dateRange!.from &&
        post.publishedAt <= filters.dateRange!.to
      );
    }

    // Filter by search query
    if (filters.searchQuery) {
      const searchLower = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchLower) ||
        post.excerpt.toLowerCase().includes(searchLower) ||
        post.content.toLowerCase().includes(searchLower) ||
        post.author.name.toLowerCase().includes(searchLower) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Only show published posts
    filtered = filtered.filter(post => post.status === 'published');

    // Sort by publish date (newest first)
    filtered.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

    return filtered;
  }, [allPosts, filters]);

  // Memoized unique values
  const uniqueCategories = useMemo(() => {
    const categories = new Set<BlogCategory>();
    allPosts.forEach(post => {
      categories.add(post.category);
    });
    return Array.from(categories);
  }, [allPosts]);

  const uniqueTags = useMemo(() => {
    const tags = new Set<string>();
    allPosts.forEach(post => {
      post.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [allPosts]);

  const uniqueAuthors = useMemo(() => {
    const authorIds = new Set<string>();
    allPosts.forEach(post => {
      authorIds.add(post.author.id);
    });
    return authors.filter(author => authorIds.has(author.id));
  }, [allPosts, authors]);

  // Actions
  const selectPost = useCallback((post: BlogPost | null) => {
    setSelectedPost(post);
  }, []);

  const searchPosts = useCallback((term: string) => {
    setFilters(prev => ({ ...prev, searchQuery: term }));
  }, []);

  const filterByCategory = useCallback((category: BlogCategory | 'all') => {
    setFilters(prev => ({ 
      ...prev, 
      category: category === 'all' ? undefined : category 
    }));
  }, []);

  const filterByAuthor = useCallback((authorId: string | 'all') => {
    setFilters(prev => ({ 
      ...prev, 
      author: authorId === 'all' ? undefined : authorId 
    }));
  }, []);

  const filterByTags = useCallback((tags: string[]) => {
    setFilters(prev => ({ ...prev, tags }));
  }, []);

  const toggleFeatured = useCallback(() => {
    setFilters(prev => ({ ...prev, featured: !prev.featured }));
  }, []);

  const contextValue: BlogContextType = {
    // Data
    allPosts,
    filteredPosts,
    selectedPost,
    authors,
    
    // Filters
    filters,
    setFilters,
    
    // Actions
    selectPost,
    searchPosts,
    filterByCategory,
    filterByAuthor,
    filterByTags,
    toggleFeatured,
    
    // Computed values
    uniqueCategories,
    uniqueTags,
    uniqueAuthors,
    postCount: filteredPosts.length,
    
    // Loading states
    isLoading,
    error
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

// Hook para obtener un post específico por slug
export function useBlogPost(slug: string): BlogPost | null {
  const { allPosts } = useBlog();
  return useMemo(() => {
    return allPosts.find(post => post.slug === slug) || null;
  }, [allPosts, slug]);
}

// Hook para obtener posts por categoría
export function useBlogPostsByCategory(category: BlogCategory): BlogPost[] {
  const { allPosts } = useBlog();
  return useMemo(() => {
    return allPosts.filter(post => post.category === category && post.status === 'published');
  }, [allPosts, category]);
}

// Hook para obtener posts destacados
export function useFeaturedBlogPosts(): BlogPost[] {
  const { allPosts } = useBlog();
  return useMemo(() => {
    return allPosts.filter(post => post.featured && post.status === 'published');
  }, [allPosts]);
}

// Hook para obtener posts recientes
export function useRecentBlogPosts(limit: number = 5): BlogPost[] {
  const { allPosts } = useBlog();
  return useMemo(() => {
    return allPosts
      .filter(post => post.status === 'published')
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, limit);
  }, [allPosts, limit]);
}

// Hook para obtener posts relacionados
export function useRelatedBlogPosts(currentPost: BlogPost, limit: number = 3): BlogPost[] {
  const { allPosts } = useBlog();
  return useMemo(() => {
    return allPosts
      .filter(post => 
        post.id !== currentPost.id && 
        post.status === 'published' &&
        (post.category === currentPost.category || 
         post.tags.some(tag => currentPost.tags.includes(tag)))
      )
      .sort((a, b) => {
        // Score by category match and tag overlap
        const aScore = (a.category === currentPost.category ? 2 : 0) + 
                       a.tags.filter(tag => currentPost.tags.includes(tag)).length;
        const bScore = (b.category === currentPost.category ? 2 : 0) + 
                       b.tags.filter(tag => currentPost.tags.includes(tag)).length;
        return bScore - aScore;
      })
      .slice(0, limit);
  }, [allPosts, currentPost, limit]);
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