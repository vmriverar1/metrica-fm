/**
 * CacheManager - Sistema de caché en memoria con invalidación inteligente
 * 
 * Características:
 * - Caché LRU (Least Recently Used) con TTL configurable
 * - Invalidación automática por patrones de archivos
 * - Estadísticas de rendimiento (hit rate, miss rate)
 * - Estrategias de precarga para datos frecuentes
 * - Limpieza automática de entradas expiradas
 * - Soporte para invalidación en cascada
 */

import { EventEmitter } from 'events';

// Tipos
export interface CacheEntry<T = any> {
  data: T;
  etag: string;
  timestamp: number;
  lastAccessed: number;
  accessCount: number;
  ttl: number;
  tags: string[];
}

export interface CacheOptions {
  ttl?: number; // Time to live en milisegundos
  maxSize?: number; // Máximo número de entradas
  tags?: string[]; // Tags para invalidación selectiva
  priority?: 'low' | 'normal' | 'high';
}

export interface CacheStats {
  size: number;
  maxSize: number;
  hits: number;
  misses: number;
  hitRate: number;
  totalSize: number; // Tamaño aproximado en bytes
  oldestEntry: number;
  newestEntry: number;
}

export interface InvalidationPattern {
  pattern: string | RegExp;
  tags?: string[];
  recursive?: boolean;
}

/**
 * CacheManager - Gestor principal de caché
 */
export class CacheManager extends EventEmitter {
  private cache: Map<string, CacheEntry> = new Map();
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    invalidations: 0
  };
  
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos
  private readonly MAX_SIZE = 1000; // Máximo 1000 entradas
  private readonly CLEANUP_INTERVAL = 60 * 1000; // Limpiar cada minuto

  constructor(
    private maxSize: number = 1000,
    private defaultTtl: number = 5 * 60 * 1000
  ) {
    super();
    this.startCleanupTimer();
  }

  /**
   * Iniciar timer de limpieza automática
   */
  private startCleanupTimer(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, this.CLEANUP_INTERVAL);
  }

  /**
   * Detener timer de limpieza
   */
  public stopCleanupTimer(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Generar clave de caché normalizada
   */
  private normalizeKey(key: string): string {
    return key.toLowerCase().replace(/\\/g, '/');
  }

  /**
   * Calcular tamaño aproximado de un objeto en bytes
   */
  private calculateSize(data: any): number {
    try {
      return JSON.stringify(data).length * 2; // Estimación rough (UTF-16)
    } catch {
      return 1024; // Valor por defecto si no se puede serializar
    }
  }

  /**
   * Verificar si una entrada ha expirado
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Ejecutar estrategia LRU para hacer espacio
   */
  private evictLRU(): void {
    if (this.cache.size <= this.maxSize) return;

    // Encontrar la entrada menos recientemente usada
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
      this.emit('eviction', oldestKey);
    }
  }

  /**
   * Obtener entrada del caché
   */
  public get<T = any>(key: string): T | null {
    const normalizedKey = this.normalizeKey(key);
    const entry = this.cache.get(normalizedKey);

    if (!entry) {
      this.stats.misses++;
      this.emit('miss', key);
      return null;
    }

    // Verificar si ha expirado
    if (this.isExpired(entry)) {
      this.cache.delete(normalizedKey);
      this.stats.misses++;
      this.emit('miss', key);
      this.emit('expired', key);
      return null;
    }

    // Actualizar estadísticas de acceso
    entry.lastAccessed = Date.now();
    entry.accessCount++;
    this.stats.hits++;
    this.emit('hit', key);

    return entry.data as T;
  }

  /**
   * Establecer entrada en el caché
   */
  public set<T = any>(key: string, data: T, options: CacheOptions = {}): void {
    const normalizedKey = this.normalizeKey(key);
    const now = Date.now();
    
    // Asegurar espacio en el caché
    this.evictLRU();

    const entry: CacheEntry<T> = {
      data,
      etag: this.generateEtag(data),
      timestamp: now,
      lastAccessed: now,
      accessCount: 1,
      ttl: options.ttl || this.defaultTtl,
      tags: options.tags || []
    };

    this.cache.set(normalizedKey, entry);
    this.emit('set', key, data);
  }

  /**
   * Generar ETag para los datos
   */
  private generateEtag(data: any): string {
    const crypto = require('crypto');
    const content = JSON.stringify(data);
    return crypto.createHash('md5').update(content).digest('hex');
  }

  /**
   * Verificar si una clave existe en el caché y no ha expirado
   */
  public has(key: string): boolean {
    const normalizedKey = this.normalizeKey(key);
    const entry = this.cache.get(normalizedKey);
    
    if (!entry) return false;
    
    if (this.isExpired(entry)) {
      this.cache.delete(normalizedKey);
      return false;
    }
    
    return true;
  }

  /**
   * Eliminar entrada específica del caché
   */
  public delete(key: string): boolean {
    const normalizedKey = this.normalizeKey(key);
    const deleted = this.cache.delete(normalizedKey);
    
    if (deleted) {
      this.emit('delete', key);
    }
    
    return deleted;
  }

  /**
   * Invalidar caché por patrón
   */
  public invalidate(pattern: string | RegExp | InvalidationPattern): number {
    let invalidated = 0;
    const keysToDelete: string[] = [];

    // Normalizar patrón
    let searchPattern: RegExp;
    let tags: string[] = [];
    
    if (typeof pattern === 'string') {
      // Convertir wildcards a regex
      const regexPattern = pattern
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.');
      searchPattern = new RegExp(`^${regexPattern}$`, 'i');
    } else if (pattern instanceof RegExp) {
      searchPattern = pattern;
    } else {
      // Es un InvalidationPattern
      if (typeof pattern.pattern === 'string') {
        const regexPattern = pattern.pattern
          .replace(/\*/g, '.*')
          .replace(/\?/g, '.');
        searchPattern = new RegExp(`^${regexPattern}$`, 'i');
      } else {
        searchPattern = pattern.pattern;
      }
      tags = pattern.tags || [];
    }

    // Buscar claves que coincidan
    for (const [key, entry] of this.cache.entries()) {
      let shouldInvalidate = false;

      // Verificar patrón de clave
      if (searchPattern.test(key)) {
        shouldInvalidate = true;
      }

      // Verificar tags si se especificaron
      if (tags.length > 0 && entry.tags.some(tag => tags.includes(tag))) {
        shouldInvalidate = true;
      }

      if (shouldInvalidate) {
        keysToDelete.push(key);
      }
    }

    // Eliminar claves encontradas
    for (const key of keysToDelete) {
      this.cache.delete(key);
      invalidated++;
    }

    this.stats.invalidations += invalidated;
    this.emit('invalidate', pattern, invalidated);

    return invalidated;
  }

  /**
   * Limpiar entradas expiradas
   */
  public cleanupExpired(): number {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.cache.delete(key);
    }

    if (expiredKeys.length > 0) {
      this.emit('cleanup', expiredKeys.length);
    }

    return expiredKeys.length;
  }

  /**
   * Limpiar todo el caché
   */
  public clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.emit('clear', size);
  }

  /**
   * Obtener estadísticas del caché
   */
  public getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;
    
    let totalSize = 0;
    let oldestEntry = Date.now();
    let newestEntry = 0;

    for (const entry of this.cache.values()) {
      totalSize += this.calculateSize(entry.data);
      oldestEntry = Math.min(oldestEntry, entry.timestamp);
      newestEntry = Math.max(newestEntry, entry.timestamp);
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: Math.round(hitRate * 100) / 100,
      totalSize,
      oldestEntry: this.cache.size > 0 ? oldestEntry : 0,
      newestEntry: this.cache.size > 0 ? newestEntry : 0
    };
  }

  /**
   * Obtener estadísticas detalladas por entrada
   */
  public getDetailedStats(): Array<{key: string, accessCount: number, lastAccessed: number, age: number}> {
    const now = Date.now();
    const details: Array<{key: string, accessCount: number, lastAccessed: number, age: number}> = [];

    for (const [key, entry] of this.cache.entries()) {
      details.push({
        key,
        accessCount: entry.accessCount,
        lastAccessed: entry.lastAccessed,
        age: now - entry.timestamp
      });
    }

    return details.sort((a, b) => b.accessCount - a.accessCount);
  }

  /**
   * Precargar datos frecuentemente accedidos
   */
  public async preload(keys: string[], loader: (key: string) => Promise<any>): Promise<number> {
    let loaded = 0;

    for (const key of keys) {
      if (!this.has(key)) {
        try {
          const data = await loader(key);
          this.set(key, data, { ttl: this.defaultTtl * 2 }); // TTL más largo para precargados
          loaded++;
        } catch (error) {
          this.emit('preload-error', key, error);
        }
      }
    }

    this.emit('preload', loaded);
    return loaded;
  }

  /**
   * Obtener o establecer (get or set pattern)
   */
  public async getOrSet<T = any>(
    key: string, 
    loader: () => Promise<T>, 
    options: CacheOptions = {}
  ): Promise<T> {
    // Intentar obtener del caché primero
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Si no está en caché, cargar y almacenar
    try {
      const data = await loader();
      this.set(key, data, options);
      return data;
    } catch (error) {
      this.emit('loader-error', key, error);
      throw error;
    }
  }

  /**
   * Resetear estadísticas
   */
  public resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      invalidations: 0
    };
    this.emit('stats-reset');
  }

  /**
   * Obtener información de una entrada específica
   */
  public getEntryInfo(key: string): Partial<CacheEntry> | null {
    const normalizedKey = this.normalizeKey(key);
    const entry = this.cache.get(normalizedKey);
    
    if (!entry) return null;
    
    const now = Date.now();
    return {
      etag: entry.etag,
      timestamp: entry.timestamp,
      lastAccessed: entry.lastAccessed,
      accessCount: entry.accessCount,
      ttl: entry.ttl,
      tags: entry.tags
    };
  }

  /**
   * Cleanup al destruir la instancia
   */
  public destroy(): void {
    this.stopCleanupTimer();
    this.clear();
    this.removeAllListeners();
  }
}

// Sistema de caché específico para JSON con invalidación inteligente
export class JSONCacheManager extends CacheManager {
  constructor() {
    super(500, 10 * 60 * 1000); // 500 entradas, 10 minutos TTL por defecto
  }

  /**
   * Invalidar caché cuando se modifica un archivo JSON
   */
  public invalidateFile(filePath: string): number {
    const patterns = [
      filePath, // Archivo exacto
      `${filePath}/*`, // Contenido relacionado
      `*/${filePath.split('/').pop()}` // Archivos con el mismo nombre
    ];

    let totalInvalidated = 0;
    for (const pattern of patterns) {
      totalInvalidated += this.invalidate(pattern);
    }

    return totalInvalidated;
  }

  /**
   * Invalidar por tipo de contenido
   */
  public invalidateByType(type: 'pages' | 'dynamic-content' | 'all'): number {
    switch (type) {
      case 'pages':
        return this.invalidate('pages/*');
      case 'dynamic-content':
        return this.invalidate('dynamic-content/*');
      case 'all':
        this.clear();
        return -1; // Indica limpieza completa
      default:
        return 0;
    }
  }

  /**
   * Precargar archivos JSON comunes
   */
  public async preloadCommonFiles(loader: (key: string) => Promise<any>): Promise<number> {
    const commonFiles = [
      'pages/home.json',
      'pages/portfolio.json',
      'dynamic-content/portfolio/content.json',
      'dynamic-content/newsletter/content.json'
    ];

    return this.preload(commonFiles, loader);
  }
}

// Instancia singleton del cache manager
export const cacheManager = new JSONCacheManager();