// Importación condicional para evitar errores en cliente
let readPublicJSON: any, readPublicJSONAsync: any;

if (typeof window === 'undefined') {
  // Solo en servidor
  const jsonReader = require('./json-reader');
  readPublicJSON = jsonReader.readPublicJSON;
  readPublicJSONAsync = jsonReader.readPublicJSONAsync;
}

// Simple in-memory cache (replaces deleted JSONVersionManager)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const SimpleCache = {
  get(key: string): any | null {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      cache.delete(key);
      return null;
    }
    return entry.data;
  },
  set(key: string, data: any): void {
    cache.set(key, { data, timestamp: Date.now() });
  },
  invalidate(key: string): void {
    cache.delete(key);
  },
  clear(): void {
    cache.clear();
  },
  getStats() {
    return { entries: cache.size, ttl: CACHE_TTL };
  }
};

export class PWAJsonReader {
  private static readonly DEBUG = process.env.NODE_ENV === 'development';

  static async readWithCache<T>(filePath: string): Promise<T> {
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    const jsonPath = cleanPath.startsWith('json/') ? cleanPath : `json/${cleanPath}`;

    try {
      const cachedData = SimpleCache.get(jsonPath);
      if (cachedData) {
        return cachedData;
      }

      const data = await this.fetchFromServer<T>(jsonPath);
      SimpleCache.set(jsonPath, data);
      return data;

    } catch (error) {
      console.error(`[PWAJsonReader] Error reading ${jsonPath}:`, error);

      const expiredCache = SimpleCache.get(jsonPath);
      if (expiredCache) {
        return expiredCache;
      }

      return {} as T;
    }
  }

  private static async fetchFromServer<T>(jsonPath: string): Promise<T> {
    if (typeof window === 'undefined') {
      return readPublicJSON<T>(jsonPath);
    }

    const response = await fetch(`/${jsonPath}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-cache'
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {} as T;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  static async invalidateOnEdit(filePath: string): Promise<void> {
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    const jsonPath = cleanPath.startsWith('json/') ? cleanPath : `json/${cleanPath}`;

    SimpleCache.invalidate(jsonPath);
    await this.refreshCache(jsonPath);
    await this.broadcastUpdate(jsonPath);
  }

  static async refreshCache<T>(jsonPath: string): Promise<T> {
    const freshData = await this.fetchFromServer<T>(jsonPath);
    SimpleCache.set(jsonPath, freshData);
    return freshData;
  }

  private static async broadcastUpdate(jsonPath: string): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const channel = new BroadcastChannel('metrica-json-updates');
      channel.postMessage({
        type: 'JSON_UPDATED',
        path: jsonPath,
        timestamp: Date.now()
      });

      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration.active) {
          registration.active.postMessage({
            type: 'JSON_UPDATED',
            path: jsonPath,
            timestamp: Date.now()
          });
        }
      }
    } catch (error) {
      // Broadcast failure is non-critical
    }
  }

  static async preloadCritical(): Promise<void> {
    const criticalPaths = [
      '/api/admin/pages/home',
      '/api/admin/pages/portfolio',
      '/api/admin/megamenu'
    ];

    await Promise.allSettled(
      criticalPaths.map(path => this.readWithCache(path))
    );
  }

  static async readJSON<T>(filePath: string): Promise<T> {
    return this.readWithCache<T>(filePath);
  }

  static readJSONSync<T>(filePath: string): T {
    if (typeof window === 'undefined') {
      const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
      const jsonPath = cleanPath.startsWith('json/') ? cleanPath : `json/${cleanPath}`;
      return readPublicJSON<T>(jsonPath);
    }
    throw new Error('Synchronous JSON reading not available in browser. Use readWithCache() instead.');
  }

  static getCacheStats() {
    return {
      ...SimpleCache.getStats(),
      debug: this.DEBUG
    };
  }

  static clearCache(): void {
    SimpleCache.clear();
  }
}

// React import para hooks
import React from 'react';

// Hook para usar en componentes React
export function usePWAJSON<T>(filePath: string) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = React.useState<number>(0);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await PWAJsonReader.readWithCache<T>(filePath);
      setData(result);
      setLastUpdated(Date.now());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filePath]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  React.useEffect(() => {
    const channel = new BroadcastChannel('metrica-json-updates');

    const handleUpdate = (event: MessageEvent) => {
      if (event.data.type === 'JSON_UPDATED') {
        const updatedPath = event.data.path;
        const targetPath = filePath.startsWith('json/') ? filePath : `json/${filePath}`;
        if (updatedPath === targetPath) {
          loadData();
        }
      }
    };

    channel.addEventListener('message', handleUpdate);
    return () => {
      channel.removeEventListener('message', handleUpdate);
      channel.close();
    };
  }, [filePath, loadData]);

  return { data, loading, error, lastUpdated, reload: loadData, clearError: () => setError(null) };
}

export type PWAJSONHookResult<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number;
  reload: () => Promise<void>;
  clearError: () => void;
};
