'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { BlogPost } from '@/types/blog';
import { JobPosting } from '@/types/careers';

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum items in cache
  compression: boolean; // Enable data compression
  persistent: boolean; // Use localStorage
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccess: number;
  compressed?: boolean;
}

interface CacheStats {
  size: number;
  hitRate: number;
  missCount: number;
  hitCount: number;
  evictions: number;
  memory: number; // Estimated memory usage in bytes
}

const DEFAULT_CONFIG: CacheConfig = {
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 100,
  compression: true,
  persistent: true
};

class AdvancedCacheManager<T = any> {
  private cache = new Map<string, CacheItem<T>>();
  private stats: CacheStats = {
    size: 0,
    hitRate: 0,
    missCount: 0,
    hitCount: 0,
    evictions: 0,
    memory: 0
  };

  constructor(
    private namespace: string,
    private config: CacheConfig = DEFAULT_CONFIG
  ) {
    if (typeof window !== 'undefined' && this.config.persistent) {
      this.loadFromStorage();
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(`cache_${this.namespace}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        Object.entries(parsed).forEach(([key, item]: [string, any]) => {
          this.cache.set(key, {
            ...item,
            timestamp: new Date(item.timestamp).getTime(),
            lastAccess: new Date(item.lastAccess).getTime()
          });
        });
        this.updateStats();
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error);
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined' || !this.config.persistent) return;

    try {
      const serializable = Object.fromEntries(this.cache.entries());
      localStorage.setItem(`cache_${this.namespace}`, JSON.stringify(serializable));
    } catch (error) {
      console.warn('Failed to save cache to storage:', error);
    }
  }

  private compress(data: T): string {
    if (!this.config.compression) return JSON.stringify(data);
    
    // Simple compression using JSON stringify with replacer
    return JSON.stringify(data, (key, value) => {
      if (typeof value === 'string' && value.length > 100) {
        // Basic compression for long strings
        return value.replace(/\s+/g, ' ').trim();
      }
      return value;
    });
  }

  private decompress(compressed: string): T {
    return JSON.parse(compressed);
  }

  private isExpired(item: CacheItem<T>): boolean {
    return Date.now() - item.timestamp > this.config.ttl;
  }

  private evictLeastRecentlyUsed() {
    if (this.cache.size <= this.config.maxSize) return;

    let lruKey: string | null = null;
    let lruAccess = Infinity;

    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccess < lruAccess) {
        lruAccess = item.lastAccess;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
      this.stats.evictions++;
    }
  }

  private updateStats() {
    this.stats.size = this.cache.size;
    this.stats.hitRate = this.stats.hitCount / (this.stats.hitCount + this.stats.missCount) || 0;
    
    // Estimate memory usage
    this.stats.memory = Array.from(this.cache.values()).reduce((acc, item) => {
      return acc + JSON.stringify(item).length * 2; // Rough estimate in bytes
    }, 0);
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.missCount++;
      this.updateStats();
      return null;
    }

    if (this.isExpired(item)) {
      this.cache.delete(key);
      this.stats.missCount++;
      this.updateStats();
      this.saveToStorage();
      return null;
    }

    // Update access statistics
    item.accessCount++;
    item.lastAccess = Date.now();
    this.stats.hitCount++;
    this.updateStats();
    
    return item.data;
  }

  set(key: string, data: T): void {
    this.evictLeastRecentlyUsed();

    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      accessCount: 0,
      lastAccess: Date.now(),
      compressed: this.config.compression
    };

    this.cache.set(key, item);
    this.updateStats();
    this.saveToStorage();
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    return item !== undefined && !this.isExpired(item);
  }

  delete(key: string): boolean {
    const result = this.cache.delete(key);
    this.updateStats();
    this.saveToStorage();
    return result;
  }

  clear(): void {
    this.cache.clear();
    this.stats = {
      size: 0,
      hitRate: 0,
      missCount: 0,
      hitCount: 0,
      evictions: 0,
      memory: 0
    };
    this.saveToStorage();
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  // Batch operations
  getMultiple(keys: string[]): Map<string, T | null> {
    const results = new Map<string, T | null>();
    keys.forEach(key => {
      results.set(key, this.get(key));
    });
    return results;
  }

  setMultiple(entries: Map<string, T>): void {
    entries.forEach((value, key) => {
      this.set(key, value);
    });
  }

  // Cleanup expired items
  cleanup(): number {
    let removedCount = 0;
    const now = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.config.ttl) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    this.updateStats();
    this.saveToStorage();
    return removedCount;
  }

  // Pre-warming cache
  preload(loader: () => Promise<Map<string, T>>): Promise<void> {
    return loader().then(data => {
      this.setMultiple(data);
    });
  }
}

// Hook for blog cache
export function useBlogCache() {
  const [cacheManager] = useState(() => new AdvancedCacheManager<BlogPost>('blog', {
    ttl: 10 * 60 * 1000, // 10 minutes for blog posts
    maxSize: 50,
    compression: true,
    persistent: true
  }));

  const getCachedPost = useCallback((slug: string): BlogPost | null => {
    return cacheManager.get(`post_${slug}`);
  }, [cacheManager]);

  const setCachedPost = useCallback((slug: string, post: BlogPost) => {
    cacheManager.set(`post_${slug}`, post);
  }, [cacheManager]);

  const getCachedPosts = useCallback((category?: string): BlogPost[] | null => {
    const key = category ? `posts_${category}` : 'posts_all';
    return cacheManager.get(key);
  }, [cacheManager]);

  const setCachedPosts = useCallback((posts: BlogPost[], category?: string) => {
    const key = category ? `posts_${category}` : 'posts_all';
    cacheManager.set(key, posts);
  }, [cacheManager]);

  const preloadPopularPosts = useCallback(async () => {
    // In a real app, this would fetch from API
    const popularSlugs = ['construccion-sostenible-peru', 'aeropuerto-jorge-chavez', 'bim-infraestructura'];
    // Preload logic would go here
  }, []);

  const getCacheStats = useCallback(() => {
    return cacheManager.getStats();
  }, [cacheManager]);

  const clearCache = useCallback(() => {
    cacheManager.clear();
  }, [cacheManager]);

  return {
    getCachedPost,
    setCachedPost,
    getCachedPosts,
    setCachedPosts,
    preloadPopularPosts,
    getCacheStats,
    clearCache
  };
}

// Hook for careers cache
export function useCareersCache() {
  const [cacheManager] = useState(() => new AdvancedCacheManager<JobPosting>('careers', {
    ttl: 30 * 60 * 1000, // 30 minutes for job postings
    maxSize: 100,
    compression: true,
    persistent: true
  }));

  const getCachedJob = useCallback((id: string): JobPosting | null => {
    return cacheManager.get(`job_${id}`);
  }, [cacheManager]);

  const setCachedJob = useCallback((id: string, job: JobPosting) => {
    cacheManager.set(`job_${id}`, job);
  }, [cacheManager]);

  const getCachedJobs = useCallback((category?: string): JobPosting[] | null => {
    const key = category ? `jobs_${category}` : 'jobs_all';
    return cacheManager.get(key);
  }, [cacheManager]);

  const setCachedJobs = useCallback((jobs: JobPosting[], category?: string) => {
    const key = category ? `jobs_${category}` : 'jobs_all';
    cacheManager.set(key, jobs);
  }, [cacheManager]);

  const getCachedSearchResults = useCallback((query: string): JobPosting[] | null => {
    const key = `search_${query.toLowerCase().replace(/\s+/g, '_')}`;
    return cacheManager.get(key);
  }, [cacheManager]);

  const setCachedSearchResults = useCallback((query: string, results: JobPosting[]) => {
    const key = `search_${query.toLowerCase().replace(/\s+/g, '_')}`;
    cacheManager.set(key, results);
  }, [cacheManager]);

  const getCacheStats = useCallback(() => {
    return cacheManager.getStats();
  }, [cacheManager]);

  const clearCache = useCallback(() => {
    cacheManager.clear();
  }, [cacheManager]);

  // Auto-cleanup every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      cacheManager.cleanup();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [cacheManager]);

  return {
    getCachedJob,
    setCachedJob,
    getCachedJobs,
    setCachedJobs,
    getCachedSearchResults,
    setCachedSearchResults,
    getCacheStats,
    clearCache
  };
}

// Hook for performance monitoring
export function useCacheMonitoring() {
  const blogCache = useBlogCache();
  const careersCache = useCareersCache();

  const getAllStats = useCallback(() => {
    return {
      blog: blogCache.getCacheStats(),
      careers: careersCache.getCacheStats(),
      timestamp: Date.now()
    };
  }, [blogCache, careersCache]);

  const getTotalHitRate = useCallback(() => {
    const stats = getAllStats();
    const totalHits = stats.blog.hitCount + stats.careers.hitCount;
    const totalRequests = totalHits + stats.blog.missCount + stats.careers.missCount;
    return totalRequests > 0 ? totalHits / totalRequests : 0;
  }, [getAllStats]);

  const getTotalMemoryUsage = useCallback(() => {
    const stats = getAllStats();
    return stats.blog.memory + stats.careers.memory;
  }, [getAllStats]);

  const clearAllCaches = useCallback(() => {
    blogCache.clearCache();
    careersCache.clearCache();
  }, [blogCache, careersCache]);

  return {
    getAllStats,
    getTotalHitRate,
    getTotalMemoryUsage,
    clearAllCaches
  };
}

// Global cache warming function
export function useGlobalCacheWarming() {
  const blogCache = useBlogCache();
  const careersCache = useCareersCache();

  const warmupBlogCache = useCallback(async () => {
    // In a real app, preload popular blog posts
    await blogCache.preloadPopularPosts();
  }, [blogCache]);

  const warmupCareersCache = useCallback(async () => {
    // In a real app, preload active jobs and featured positions
    console.log('Warming up careers cache...');
  }, []);

  const warmupAll = useCallback(async () => {
    await Promise.all([
      warmupBlogCache(),
      warmupCareersCache()
    ]);
  }, [warmupBlogCache, warmupCareersCache]);

  return {
    warmupBlogCache,
    warmupCareersCache,
    warmupAll
  };
}