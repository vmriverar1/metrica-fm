/**
 * Advanced caching utilities for Métrica FM
 * Provides memory and localStorage caching with TTL and invalidation
 */

import React from 'react';

// Memory cache with TTL
class MemoryCache {
  private cache = new Map<string, { data: any; expires: number; }>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  set(key: string, data: any, ttlMs = 15 * 60 * 1000) { // Default 15 minutes
    const expires = Date.now() + ttlMs;
    this.cache.set(key, { data, expires });
  }

  get<T = any>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key);
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.clear();
  }
}

// Browser storage cache with TTL
class BrowserCache {
  private isAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch {
      return false;
    }
  }

  set(key: string, data: any, ttlMs = 60 * 60 * 1000) { // Default 1 hour
    if (!this.isAvailable()) return false;
    
    try {
      const item = {
        data,
        expires: Date.now() + ttlMs,
        version: '1.0.0' // For cache invalidation on app updates
      };
      localStorage.setItem(`metrica_cache_${key}`, JSON.stringify(item));
      return true;
    } catch (error) {
      console.warn('Failed to set browser cache:', error);
      return false;
    }
  }

  get<T = any>(key: string): T | null {
    if (!this.isAvailable()) return null;
    
    try {
      const stored = localStorage.getItem(`metrica_cache_${key}`);
      if (!stored) return null;
      
      const item = JSON.parse(stored);
      
      // Check version for cache invalidation
      if (item.version !== '1.0.0') {
        this.delete(key);
        return null;
      }
      
      // Check expiration
      if (Date.now() > item.expires) {
        this.delete(key);
        return null;
      }
      
      return item.data;
    } catch (error) {
      console.warn('Failed to get from browser cache:', error);
      return null;
    }
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    if (!this.isAvailable()) return false;
    
    try {
      localStorage.removeItem(`metrica_cache_${key}`);
      return true;
    } catch {
      return false;
    }
  }

  clear(): void {
    if (!this.isAvailable()) return;
    
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith('metrica_cache_')) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.warn('Failed to clear browser cache:', error);
    }
  }

  // Clean expired entries
  cleanup(): void {
    if (!this.isAvailable()) return;
    
    try {
      const keys = Object.keys(localStorage);
      const now = Date.now();
      
      for (const key of keys) {
        if (!key.startsWith('metrica_cache_')) continue;
        
        try {
          const stored = localStorage.getItem(key);
          if (!stored) continue;
          
          const item = JSON.parse(stored);
          if (now > item.expires) {
            localStorage.removeItem(key);
          }
        } catch {
          // Remove corrupted entries
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.warn('Failed to cleanup browser cache:', error);
    }
  }
}

// Combined cache manager
class CacheManager {
  private memoryCache = new MemoryCache();
  private browserCache = new BrowserCache();

  // Get from memory first, then browser cache
  async get<T = any>(key: string): Promise<T | null> {
    // Try memory cache first (fastest)
    let data = this.memoryCache.get<T>(key);
    if (data !== null) return data;
    
    // Try browser cache
    data = this.browserCache.get<T>(key);
    if (data !== null) {
      // Store in memory for faster next access
      this.memoryCache.set(key, data);
      return data;
    }
    
    return null;
  }

  // Set in both caches
  set(key: string, data: any, ttlMs = 15 * 60 * 1000): void {
    this.memoryCache.set(key, data, ttlMs);
    this.browserCache.set(key, data, ttlMs * 4); // Browser cache lasts longer
  }

  has(key: string): boolean {
    return this.memoryCache.has(key) || this.browserCache.has(key);
  }

  delete(key: string): void {
    this.memoryCache.delete(key);
    this.browserCache.delete(key);
  }

  clear(): void {
    this.memoryCache.clear();
    this.browserCache.clear();
  }

  cleanup(): void {
    this.browserCache.cleanup();
  }

  destroy(): void {
    this.memoryCache.destroy();
  }
}

// Singleton instance
export const cache = new CacheManager();

// Utility functions for common caching patterns
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs = 15 * 60 * 1000
): Promise<T> {
  // Try cache first
  const cached = await cache.get<T>(key);
  if (cached !== null) return cached;
  
  // Fetch and cache
  const data = await fetcher();
  cache.set(key, data, ttlMs);
  return data;
}

export function withCacheSync<T>(
  key: string,
  fetcher: () => T,
  ttlMs = 15 * 60 * 1000
): T {
  // Try memory cache only for sync operations
  const cached = cache['memoryCache'].get<T>(key);
  if (cached !== null) return cached;
  
  // Fetch and cache
  const data = fetcher();
  cache.set(key, data, ttlMs);
  return data;
}

// React hook for cached data
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs = 15 * 60 * 1000
) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        const result = await withCache(key, fetcher, ttlMs);
        
        if (mounted) {
          setData(result);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, [key, ttlMs]);

  return { data, loading, error };
}

// Initialize cleanup on app start
if (typeof window !== 'undefined') {
  // Cleanup expired entries on page load
  cache.cleanup();
  
  // Set up periodic cleanup
  setInterval(() => cache.cleanup(), 30 * 60 * 1000); // Every 30 minutes
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => cache.cleanup());
}

export default cache;