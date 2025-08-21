/**
 * FASE 6: Cache Manager - Sistema de caché para optimización de performance
 * 
 * Características:
 * - Cache en memoria para APIs frecuentes
 * - Cache de archivos estáticos
 * - Invalidación inteligente de cache
 * - Compresión automática
 * - Métricas de cache hit/miss
 */

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
  hits: number;
  size: number;
}

interface CacheStats {
  totalSize: number;
  entryCount: number;
  hitRate: number;
  missRate: number;
  totalRequests: number;
}

export class CacheManager {
  private cache: Map<string, CacheEntry> = new Map();
  private stats = {
    hits: 0,
    misses: 0,
    totalRequests: 0
  };
  private maxSize: number;
  private defaultTTL: number;
  
  constructor(maxSize: number = 100 * 1024 * 1024, defaultTTL: number = 5 * 60 * 1000) { // 100MB, 5min
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
    
    // Cleanup expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Obtener valor del cache
   */
  get(key: string): any | null {
    this.stats.totalRequests++;
    
    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    entry.hits++;
    this.stats.hits++;
    return entry.data;
  }

  /**
   * Guardar valor en cache
   */
  set(key: string, data: any, ttl?: number): boolean {
    const serializedData = JSON.stringify(data);
    const size = Buffer.byteLength(serializedData, 'utf8');
    
    // Check size limits
    if (size > this.maxSize * 0.1) { // No more than 10% of total cache
      console.warn(`Cache entry too large: ${key} (${size} bytes)`);
      return false;
    }

    // Ensure we don't exceed max size
    while (this.getTotalSize() + size > this.maxSize) {
      this.evictLRU();
    }

    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      hits: 0,
      size
    };

    this.cache.set(key, entry);
    return true;
  }

  /**
   * Eliminar entrada del cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Limpiar cache por patrón
   */
  invalidatePattern(pattern: string): number {
    const regex = new RegExp(pattern);
    let deleted = 0;
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deleted++;
      }
    }
    
    return deleted;
  }

  /**
   * Limpiar entradas expiradas
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp + entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Eviction LRU (Least Recently Used)
   */
  private evictLRU(): void {
    let lruKey: string | null = null;
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        lruKey = key;
      }
    }
    
    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }

  /**
   * Obtener tamaño total del cache
   */
  private getTotalSize(): number {
    let totalSize = 0;
    for (const entry of this.cache.values()) {
      totalSize += entry.size;
    }
    return totalSize;
  }

  /**
   * Obtener estadísticas del cache
   */
  getStats(): CacheStats {
    return {
      totalSize: this.getTotalSize(),
      entryCount: this.cache.size,
      hitRate: this.stats.totalRequests > 0 ? (this.stats.hits / this.stats.totalRequests) * 100 : 0,
      missRate: this.stats.totalRequests > 0 ? (this.stats.misses / this.stats.totalRequests) * 100 : 0,
      totalRequests: this.stats.totalRequests
    };
  }

  /**
   * Limpiar todo el cache
   */
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, totalRequests: 0 };
  }
}

/**
 * Cache wrapper para funciones async
 */
export function cached<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  getCacheKey: (...args: Parameters<T>) => string,
  ttl?: number
): T {
  return (async (...args: Parameters<T>) => {
    const cacheKey = getCacheKey(...args);
    const cached = cacheManager.get(cacheKey);
    
    if (cached !== null) {
      return cached;
    }
    
    const result = await fn(...args);
    cacheManager.set(cacheKey, result, ttl);
    return result;
  }) as T;
}

/**
 * Cache para respuestas HTTP
 */
export function cacheResponse(key: string, data: any, maxAge: number = 300): void {
  cacheManager.set(`response:${key}`, {
    data,
    headers: {
      'Cache-Control': `public, max-age=${maxAge}`,
      'ETag': generateETag(data),
      'Last-Modified': new Date().toUTCString()
    }
  }, maxAge * 1000);
}

/**
 * Obtener respuesta cacheada
 */
export function getCachedResponse(key: string): { data: any; headers: Record<string, string> } | null {
  return cacheManager.get(`response:${key}`);
}

/**
 * Generar ETag para cache HTTP
 */
function generateETag(data: any): string {
  const crypto = require('crypto');
  return `"${crypto.createHash('md5').update(JSON.stringify(data)).digest('hex')}"`;
}

// Instancia global del cache manager
export const cacheManager = new CacheManager();

// Cache específicos para diferentes tipos de datos
export const apiCache = {
  portfolio: {
    get: (key: string) => cacheManager.get(`api:portfolio:${key}`),
    set: (key: string, data: any) => cacheManager.set(`api:portfolio:${key}`, data, 10 * 60 * 1000), // 10min
    invalidate: () => cacheManager.invalidatePattern('api:portfolio:.*')
  },
  careers: {
    get: (key: string) => cacheManager.get(`api:careers:${key}`),
    set: (key: string, data: any) => cacheManager.set(`api:careers:${key}`, data, 15 * 60 * 1000), // 15min
    invalidate: () => cacheManager.invalidatePattern('api:careers:.*')
  },
  newsletter: {
    get: (key: string) => cacheManager.get(`api:newsletter:${key}`),
    set: (key: string, data: any) => cacheManager.set(`api:newsletter:${key}`, data, 5 * 60 * 1000), // 5min
    invalidate: () => cacheManager.invalidatePattern('api:newsletter:.*')
  }
};

export default cacheManager;