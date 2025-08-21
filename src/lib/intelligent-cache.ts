'use client';

// Cache Manager Inteligente para optimización de performance
export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccess: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  size: number; // tamaño estimado en bytes
  tags: string[];
}

export interface CacheConfig {
  maxSize: number; // en MB
  maxEntries: number;
  defaultTTL: number; // en ms
  cleanupInterval: number; // en ms
  compressionThreshold: number; // en bytes
}

export interface CacheStats {
  entries: number;
  size: number;
  hitRate: number;
  missRate: number;
  evictions: number;
  compressions: number;
}

const DEFAULT_CONFIG: CacheConfig = {
  maxSize: 50 * 1024 * 1024, // 50MB
  maxEntries: 1000,
  defaultTTL: 5 * 60 * 1000, // 5 minutos
  cleanupInterval: 60 * 1000, // 1 minuto
  compressionThreshold: 100 * 1024 // 100KB
};

// Configuraciones específicas para secciones de home.json
export const HOME_CACHE_CONFIG = {
  'home.hero': { 
    ttl: 30 * 60 * 1000, // 30 minutos
    priority: 'critical' as const,
    tags: ['home', 'hero', 'landing']
  },
  'home.stats': { 
    ttl: 10 * 60 * 1000, // 10 minutos
    priority: 'critical' as const,
    tags: ['home', 'stats', 'numbers']
  },
  'home.services': { 
    ttl: 60 * 60 * 1000, // 1 hora
    priority: 'high' as const,
    tags: ['home', 'services', 'business']
  },
  'home.portfolio': { 
    ttl: 30 * 60 * 1000, // 30 minutos
    priority: 'high' as const,
    tags: ['home', 'portfolio', 'projects']
  },
  'home.pillars': { 
    ttl: 2 * 60 * 60 * 1000, // 2 horas
    priority: 'medium' as const,
    tags: ['home', 'pillars', 'about']
  },
  'home.policies': { 
    ttl: 4 * 60 * 60 * 1000, // 4 horas
    priority: 'low' as const,
    tags: ['home', 'policies', 'corporate']
  },
  'home.newsletter': { 
    ttl: 24 * 60 * 60 * 1000, // 24 horas
    priority: 'low' as const,
    tags: ['home', 'newsletter', 'marketing']
  }
};

export class CacheManager {
  private cache = new Map<string, CacheEntry>();
  private stats: CacheStats = {
    entries: 0,
    size: 0,
    hitRate: 0,
    missRate: 0,
    evictions: 0,
    compressions: 0
  };
  private hits = 0;
  private misses = 0;
  private cleanupTimer: NodeJS.Timeout | null = null;
  
  constructor(private config: CacheConfig = DEFAULT_CONFIG) {
    this.startCleanupTimer();
    
    // Escuchar cambios de visibilidad para pausar/reanudar cleanup
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.pauseCleanup();
        } else {
          this.resumeCleanup();
        }
      });
    }
  }

  /**
   * Obtener entrada del cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.misses++;
      this.updateStats();
      return null;
    }

    const now = Date.now();
    
    // Verificar TTL
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.misses++;
      this.updateStats();
      return null;
    }

    // Actualizar estadísticas de acceso
    entry.accessCount++;
    entry.lastAccess = now;
    this.hits++;
    this.updateStats();

    // Descomprimir si es necesario
    let data = entry.data;
    if (this.isCompressed(entry.data)) {
      data = this.decompress(entry.data);
    }

    return data as T;
  }

  /**
   * Establecer entrada en cache
   */
  set<T>(key: string, data: T, options?: {
    ttl?: number;
    priority?: 'critical' | 'high' | 'medium' | 'low';
    tags?: string[];
  }): void {
    const now = Date.now();
    const cacheConfig = HOME_CACHE_CONFIG[key as keyof typeof HOME_CACHE_CONFIG];
    
    const ttl = options?.ttl || cacheConfig?.ttl || this.config.defaultTTL;
    const priority = options?.priority || cacheConfig?.priority || 'medium';
    const tags = options?.tags || cacheConfig?.tags || [];

    let processedData = data;
    let size = this.estimateSize(data);
    
    // Comprimir si supera el threshold
    if (size > this.config.compressionThreshold) {
      processedData = this.compress(data);
      size = this.estimateSize(processedData);
      this.stats.compressions++;
    }

    const entry: CacheEntry<T> = {
      data: processedData,
      timestamp: now,
      ttl,
      accessCount: 0,
      lastAccess: now,
      priority,
      size,
      tags
    };

    // Verificar límites de cache
    if (this.cache.size >= this.config.maxEntries || 
        this.stats.size + size > this.config.maxSize) {
      this.evictEntries(size);
    }

    this.cache.set(key, entry);
    this.updateStats();

    // Log en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log(`💾 Cache SET: ${key}`, {
        size: this.formatSize(size),
        ttl: `${Math.round(ttl / 1000)}s`,
        priority,
        compressed: size !== this.estimateSize(data)
      });
    }
  }

  /**
   * Verificar si existe en cache y no ha expirado
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.updateStats();
      return false;
    }

    return true;
  }

  /**
   * Eliminar entrada específica
   */
  delete(key: string): boolean {
    const result = this.cache.delete(key);
    if (result) {
      this.updateStats();
    }
    return result;
  }

  /**
   * Limpiar cache por tags
   */
  clearByTag(tag: string): number {
    let cleared = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key);
        cleared++;
      }
    }
    if (cleared > 0) {
      this.updateStats();
    }
    return cleared;
  }

  /**
   * Limpiar todo el cache
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    this.stats.evictions = 0;
    this.stats.compressions = 0;
    this.updateStats();
  }

  /**
   * Obtener estadísticas del cache
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Precarga de datos críticos
   */
  preload(entries: Array<{ key: string; data: any; options?: any }>): void {
    entries.forEach(({ key, data, options }) => {
      this.set(key, data, options);
    });
  }

  /**
   * Warmup del cache con datos de home.json
   */
  warmupHomeCache(homeData: any): void {
    const warmupEntries = [
      {
        key: 'home.hero',
        data: homeData?.hero,
        options: { priority: 'critical' as const }
      },
      {
        key: 'home.stats',
        data: homeData?.stats,
        options: { priority: 'critical' as const }
      },
      {
        key: 'home.services',
        data: homeData?.services,
        options: { priority: 'high' as const }
      },
      {
        key: 'home.portfolio',
        data: homeData?.portfolio,
        options: { priority: 'high' as const }
      }
    ].filter(entry => entry.data); // Solo cargar secciones que existen

    this.preload(warmupEntries);
    
    console.log(`🔥 Cache warmed up with ${warmupEntries.length} home sections`);
  }

  /**
   * Evicción inteligente basada en prioridad y uso
   */
  private evictEntries(sizeNeeded: number): void {
    const entries = Array.from(this.cache.entries());
    
    // Ordenar por prioridad (baja primero) y frecuencia de acceso
    entries.sort(([, a], [, b]) => {
      const priorityScore = this.getPriorityScore(a.priority) - this.getPriorityScore(b.priority);
      if (priorityScore !== 0) return priorityScore;
      
      // Si misma prioridad, considerar frecuencia y recencia
      const aScore = a.accessCount / Math.max(1, Date.now() - a.lastAccess);
      const bScore = b.accessCount / Math.max(1, Date.now() - b.lastAccess);
      return aScore - bScore;
    });

    let freedSize = 0;
    for (const [key, entry] of entries) {
      if (freedSize >= sizeNeeded) break;
      
      this.cache.delete(key);
      freedSize += entry.size;
      this.stats.evictions++;
    }

    console.log(`🗑️ Evicted entries, freed ${this.formatSize(freedSize)}`);
  }

  /**
   * Puntuación numérica de prioridad para ordenamiento
   */
  private getPriorityScore(priority: string): number {
    switch (priority) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }

  /**
   * Estimar tamaño de datos en bytes
   */
  private estimateSize(data: any): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      return JSON.stringify(data).length * 2; // Estimación básica
    }
  }

  /**
   * Comprimir datos (simulado - en producción usar una librería real)
   */
  private compress(data: any): any {
    try {
      // En una implementación real, usar LZ4, Gzip, etc.
      // Por ahora, solo marcamos como comprimido
      return {
        __compressed: true,
        data: JSON.stringify(data)
      };
    } catch {
      return data;
    }
  }

  /**
   * Descomprimir datos
   */
  private decompress(compressedData: any): any {
    try {
      if (this.isCompressed(compressedData)) {
        return JSON.parse(compressedData.data);
      }
      return compressedData;
    } catch {
      return compressedData;
    }
  }

  /**
   * Verificar si los datos están comprimidos
   */
  private isCompressed(data: any): boolean {
    return data && typeof data === 'object' && data.__compressed === true;
  }

  /**
   * Formatear tamaño en formato legible
   */
  private formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  /**
   * Actualizar estadísticas
   */
  private updateStats(): void {
    this.stats.entries = this.cache.size;
    this.stats.size = Array.from(this.cache.values()).reduce((total, entry) => total + entry.size, 0);
    
    const total = this.hits + this.misses;
    this.stats.hitRate = total > 0 ? (this.hits / total) * 100 : 0;
    this.stats.missRate = total > 0 ? (this.misses / total) * 100 : 0;
  }

  /**
   * Limpieza automática de entradas expiradas
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.updateStats();
      console.log(`🧹 Cache cleanup: removed ${cleaned} expired entries`);
    }
  }

  /**
   * Iniciar timer de limpieza automática
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Pausar limpieza automática
   */
  private pauseCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * Reanudar limpieza automática
   */
  private resumeCleanup(): void {
    if (!this.cleanupTimer) {
      this.startCleanupTimer();
    }
  }

  /**
   * Destruir cache manager
   */
  destroy(): void {
    this.pauseCleanup();
    this.clear();
  }
}

// Instancia singleton del cache manager
export const cacheManager = new CacheManager();

// Hook para usar cache en componentes React
export function useCache() {
  return {
    get: <T>(key: string) => cacheManager.get<T>(key),
    set: <T>(key: string, data: T, options?: any) => cacheManager.set(key, data, options),
    has: (key: string) => cacheManager.has(key),
    delete: (key: string) => cacheManager.delete(key),
    clearByTag: (tag: string) => cacheManager.clearByTag(tag),
    clear: () => cacheManager.clear(),
    getStats: () => cacheManager.getStats(),
    warmupHomeCache: (homeData: any) => cacheManager.warmupHomeCache(homeData)
  };
}

export default cacheManager;