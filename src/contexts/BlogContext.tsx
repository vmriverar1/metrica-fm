'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode, useEffect } from 'react';
import { BlogPost, BlogFilters, BlogCategory, Author } from '@/types/blog';
import { BlogPageData, BlogContentData } from '@/types/blog-page';
import { BlogArticle, BlogAuthor, BlogCategory as BlogCat } from '@/hooks/useBlogWithRelations';

interface BlogContextType {
  // Combined page and content data
  pageData: BlogPageData | null;
  contentData: BlogContentData | null;

  // Data from Firestore with cross-references
  allPosts: BlogArticle[];
  filteredPosts: BlogArticle[];
  selectedPost: BlogArticle | null;

  // Filters
  filters: BlogFilters;
  setFilters: (filters: BlogFilters) => void;
  updateFilters: (newFilters: Partial<BlogFilters>) => void;

  // Actions
  selectPost: (post: BlogArticle | null) => void;
  searchPosts: (term: string) => void;
  filterByCategory: (category: BlogCategory | 'all') => void;
  filterByAuthor: (authorId: string | 'all') => void;
  filterByTags: (tags: string[]) => void;
  toggleFeatured: () => void;
  resetFilters: () => void;

  // Computed values
  uniqueCategories: BlogCat[];
  uniqueAuthors: Author[];
  uniqueTags: string[];
  featuredPosts: BlogArticle[];
  postCount: number;

  // Loading states
  isLoading: boolean;
  pageLoading: boolean;
  contentLoading: boolean;
  error: string | null;

  // Firestore specific
  refresh: () => Promise<void>;
  getPostBySlug: (slug: string) => Promise<BlogArticle | null>;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

interface BlogProviderProps {
  children: ReactNode;
}

export function BlogProvider({ children }: BlogProviderProps) {
  const [pageData, setPageData] = useState<BlogPageData | null>(null);
  const [contentData, setContentData] = useState<BlogContentData | null>(null);
  const [selectedPost, setSelectedPost] = useState<BlogArticle | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(true);
  const [filters, setFilters] = useState<BlogFilters>({
    searchQuery: ''
  });

  // Data from new cross-reference APIs
  const [allPosts, setAllPosts] = useState<BlogArticle[]>([]);
  const [allPostsForTags, setAllPostsForTags] = useState<BlogArticle[]>([]); // All posts without filters for tags
  const [categories, setCategories] = useState<BlogCat[]>([]);
  const [authors, setAuthors] = useState<BlogAuthor[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [authorsLoading, setAuthorsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load articles with relations
  const loadArticles = useCallback(async () => {
    try {
      setArticlesLoading(true);
      setError(null);

      // Build query parameters for the new cross-reference API
      const params = new URLSearchParams();
      if (filters.category && filters.category !== 'all') {
        const category = categories.find(c => c.slug === filters.category);
        if (category) {
          params.set('category_id', category.id);
        }
      }
      if (filters.author && filters.author !== 'all') {
        params.set('author_id', filters.author);
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

      setAllPosts(result.data || []);
      console.log(`📰 Articles loaded with relations: ${result.data?.length || 0}`);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading articles');
      console.error('Error loading articles:', err);
    } finally {
      setArticlesLoading(false);
    }
  }, [filters.category, filters.author, filters.featured, categories]);

  // Load categories from new cross-reference API
  const loadCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      const response = await fetch('/api/blog/categories');
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to load categories');
      }
      setCategories(result.data || []);
      console.log(`📂 Blog categories loaded: ${result.data?.length || 0}`);
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  // Load authors from new cross-reference API
  const loadAuthors = useCallback(async () => {
    try {
      setAuthorsLoading(true);
      const response = await fetch('/api/blog/authors');
      if (!response.ok) {
        throw new Error(`Failed to fetch authors: ${response.status}`);
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to load authors');
      }
      setAuthors(result.data || []);
      console.log(`👥 Blog authors loaded: ${result.data?.length || 0}`);
    } catch (err) {
      console.error('Error loading authors:', err);
    } finally {
      setAuthorsLoading(false);
    }
  }, []);

  // Apply local filters (search and tags only, since category/author/featured are handled server-side)
  const filteredPosts = useMemo(() => {
    let result = allPosts;

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      result = result.filter(post =>
        filters.tags!.some(tag => post.tags.includes(tag))
      );
    }

    // Search filter
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const searchTerm = filters.searchQuery.toLowerCase();
      result = result.filter(post =>
        post.title.toLowerCase().includes(searchTerm) ||
        post.excerpt.toLowerCase().includes(searchTerm) ||
        post.content.toLowerCase().includes(searchTerm) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        post.author?.name.toLowerCase().includes(searchTerm) ||
        post.category?.name.toLowerCase().includes(searchTerm)
      );
    }

    return result;
  }, [allPosts, filters.searchQuery, filters.tags]);

  // Load initial data
  useEffect(() => {
    async function fetchBlogData() {
      try {
        setPageLoading(true);
        setContentLoading(true);

        // Fetch page content from Firestore and dynamic content from JSON
        const [pageResponse, contentResponse] = await Promise.all([
          fetch('/api/admin/pages/blog', { cache: 'no-store' }),
          fetch('/json/dynamic-content/newsletter/content.json', { cache: 'no-store' })
        ]);

        if (!pageResponse.ok) {
          throw new Error(`Failed to fetch page data from Firestore: ${pageResponse.status}`);
        }

        if (!contentResponse.ok) {
          throw new Error(`Failed to fetch content data: ${contentResponse.status}`);
        }

        const [pageApiResponse, contentJson] = await Promise.all([
          pageResponse.json(),
          contentResponse.json()
        ]);

        // Extract pageData from Firestore API response
        if (pageApiResponse.success && pageApiResponse.data.content) {
          setPageData(pageApiResponse.data.content);
        } else {
          throw new Error('Invalid page data structure from Firestore');
        }

        setContentData(contentJson);

      } catch (err) {
        console.error('Error fetching blog data:', err);
      } finally {
        setPageLoading(false);
        setContentLoading(false);
      }
    }

    fetchBlogData();
    loadCategories();
    loadAuthors();
  }, [loadCategories, loadAuthors]);

  // Load articles when filters change
  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  // Memoized unique categories from actual articles (dynamic)
  const uniqueCategories = useMemo(() => {
    // Extract unique categories from loaded articles
    const categoryMap = new Map<string, BlogCat>();

    allPosts.forEach(post => {
      if (post.category && post.category.id) {
        categoryMap.set(post.category.id, post.category);
      }
    });

    return Array.from(categoryMap.values());
  }, [allPosts]);

  const uniqueAuthors = useMemo(() => {
    return authors.map(autor => ({
      id: autor.id,
      name: autor.name,
      role: autor.role,
      bio: autor.bio,
      avatar: autor.avatar,
      linkedin: autor.linkedin,
      email: autor.email
    }));
  }, [authors]);

  const uniqueTags = useMemo(() => {
    const tags = new Set<string>();
    allPosts.forEach(post => {
      post.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [allPosts]);

  const featuredPosts = useMemo(() => {
    return allPosts.filter(post => post.featured);
  }, [allPosts]);

  // Actions
  const selectPost = useCallback((post: BlogArticle | null) => {
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

  // Function to get post by slug
  const getPostBySlug = useCallback(async (slug: string): Promise<BlogArticle | null> => {
    try {
      const response = await fetch(`/api/blog/articles/${slug}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Failed to fetch article: ${response.status}`);
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to load article');
      }
      return result.data;
    } catch (err) {
      console.error('Error loading article by slug:', err);
      return null;
    }
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([
      loadArticles(),
      loadCategories(),
      loadAuthors()
    ]);
  }, [loadArticles, loadCategories, loadAuthors]);

  const isLoading = pageLoading || contentLoading || articlesLoading || categoriesLoading || authorsLoading;

  const contextValue: BlogContextType = {
    // Combined data
    pageData,
    contentData,

    // Data from Firestore
    allPosts,
    filteredPosts,
    selectedPost,

    // Filters
    filters,
    setFilters,
    updateFilters,

    // Actions
    selectPost,
    searchPosts,
    filterByCategory,
    filterByAuthor,
    filterByTags,
    toggleFeatured,
    resetFilters,
    refresh,
    getPostBySlug,

    // Computed values
    uniqueCategories,
    uniqueAuthors,
    uniqueTags,
    featuredPosts,
    postCount: filteredPosts.length,

    // Loading states
    isLoading,
    pageLoading,
    contentLoading,
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

// Hook para obtener un post específico por slug (usa Firestore)
export function useBlogPost(slug: string): BlogArticle | null {
  const { getPostBySlug } = useBlog();
  const [post, setPost] = useState<BlogArticle | null>(null);

  useEffect(() => {
    getPostBySlug(slug).then(setPost);
  }, [slug, getPostBySlug]);

  return post;
}

// Hook para obtener posts por categoría (usa Firestore)
export function useBlogPostsByCategory(category: BlogCategory): BlogArticle[] {
  const { filteredPosts, filterByCategory } = useBlog();

  useEffect(() => {
    filterByCategory(category);
  }, [category, filterByCategory]);

  return filteredPosts;
}

// Hook para obtener posts destacados (usa Firestore)
export function useFeaturedBlogPosts(): BlogArticle[] {
  const { featuredPosts } = useBlog();
  return featuredPosts;
}

// Hook para obtener posts recientes (usa Firestore)
export function useRecentBlogPosts(limit: number = 5): BlogArticle[] {
  const { allPosts } = useBlog();

  const recentPosts = useMemo(() => {
    const sorted = [...allPosts].sort((a, b) => {
      const aDate = a.published_at || a.publishedAt || a.created_at;
      const bDate = b.published_at || b.publishedAt || b.created_at;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });
    return sorted.slice(0, limit);
  }, [allPosts, limit]);

  return recentPosts;
}

// Hook para obtener posts relacionados (usa Firestore)
export function useRelatedBlogPosts(currentPost: BlogArticle, limit: number = 3): BlogArticle[] {
  const { allPosts } = useBlog();

  const relatedPosts = useMemo(() => {
    // Filtrar posts relacionados por categoría y tags
    const related = allPosts.filter(post => {
      if (post.id === currentPost.id) return false;

      // Mismo categoría
      const sameCategory = post.category_id === currentPost.category_id;

      // Tags comunes
      const commonTags = post.tags.filter(tag =>
        currentPost.tags.includes(tag)
      ).length;

      return sameCategory || commonTags > 0;
    });

    // Ordenar por relevancia (categoría + tags comunes)
    const sorted = related.sort((a, b) => {
      const aScore = (a.category_id === currentPost.category_id ? 10 : 0) +
        a.tags.filter(tag => currentPost.tags.includes(tag)).length;
      const bScore = (b.category_id === currentPost.category_id ? 10 : 0) +
        b.tags.filter(tag => currentPost.tags.includes(tag)).length;
      return bScore - aScore;
    });

    return sorted.slice(0, limit);
  }, [allPosts, currentPost, limit]);

  return relatedPosts;
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