// Importación condicional para evitar errores en cliente
let readPublicJSON: any, readPublicJSONAsync: any;

if (typeof window === 'undefined') {
  // Solo en servidor
  const jsonReader = require('./json-reader');
  readPublicJSON = jsonReader.readPublicJSON;
  readPublicJSONAsync = jsonReader.readPublicJSONAsync;
}
import { JSONVersionManager } from './json-version-manager';

export class PWAJsonReader {
  private static readonly DEBUG = process.env.NODE_ENV === 'development';
  
  /**
   * Lee JSON con cache inteligente - versión principal
   */
  static async readWithCache<T>(filePath: string): Promise<T> {
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    const jsonPath = cleanPath.startsWith('json/') ? cleanPath : `json/${cleanPath}`;
    
    if (this.DEBUG) {
      console.log(`[PWAJsonReader] Reading ${jsonPath}`);
    }
    
    try {
      // 1. Intentar obtener del cache local primero
      const cachedData = JSONVersionManager.getCachedData(jsonPath);
      if (cachedData) {
        if (this.DEBUG) {
          console.log(`[PWAJsonReader] Cache hit for ${jsonPath}`);
        }
        return cachedData;
      }
      
      // 2. Si no hay cache, obtener del servidor
      const data = await this.fetchFromServer<T>(jsonPath);
      
      // 3. Actualizar cache con los nuevos datos
      await JSONVersionManager.setCachedData(jsonPath, data);
      
      if (this.DEBUG) {
        console.log(`[PWAJsonReader] Cached fresh data for ${jsonPath}`);
      }
      
      return data;
      
    } catch (error) {
      console.error(`[PWAJsonReader] Error reading ${jsonPath}:`, error);

      // 4. Fallback: intentar cache expirado como último recurso
      const expiredCache = JSONVersionManager.getCachedData(jsonPath);
      if (expiredCache) {
        console.warn(`[PWAJsonReader] Using expired cache for ${jsonPath}`);
        return expiredCache;
      }

      // 5. Final fallback: return empty object to prevent app crashes
      console.warn(`[PWAJsonReader] No cache available for ${jsonPath}, returning empty structure`);
      return {} as T;
    }
  }
  
  /**
   * Obtiene datos del servidor con manejo de errores
   */
  private static async fetchFromServer<T>(jsonPath: string): Promise<T> {
    // En servidor, usar el método existente
    if (typeof window === 'undefined') {
      return readPublicJSON<T>(jsonPath);
    }
    
    // En cliente, usar fetch
    const response = await fetch(`/${jsonPath}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      // Cache headers para aprovechar HTTP cache también
      cache: 'no-cache' // Siempre validar con servidor
    });
    
    if (!response.ok) {
      // Si es 404, devolver estructura vacía en lugar de error
      if (response.status === 404) {
        console.warn(`[PWAJsonReader] File not found: ${jsonPath}, returning empty structure`);
        return {} as T;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  /**
   * Invalida cache después de edición admin
   */
  static async invalidateOnEdit(filePath: string): Promise<void> {
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    const jsonPath = cleanPath.startsWith('json/') ? cleanPath : `json/${cleanPath}`;
    
    if (this.DEBUG) {
      console.log(`[PWAJsonReader] Invalidating cache for ${jsonPath}`);
    }
    
    try {
      // 1. Invalidar cache local
      await JSONVersionManager.invalidateCache(jsonPath);
      
      // 2. Recargar datos frescos inmediatamente
      await this.refreshCache(jsonPath);
      
      // 3. Notificar a otros clientes conectados
      await this.broadcastUpdate(jsonPath);
      
    } catch (error) {
      console.error(`[PWAJsonReader] Error invalidating cache for ${jsonPath}:`, error);
      throw error;
    }
  }
  
  /**
   * Refresca el cache con datos frescos del servidor
   */
  static async refreshCache<T>(jsonPath: string): Promise<T> {
    if (this.DEBUG) {
      console.log(`[PWAJsonReader] Refreshing cache for ${jsonPath}`);
    }
    
    try {
      // Forzar obtención desde servidor
      const freshData = await this.fetchFromServer<T>(jsonPath);
      
      // Actualizar cache
      await JSONVersionManager.setCachedData(jsonPath, freshData);
      
      return freshData;
      
    } catch (error) {
      console.error(`[PWAJsonReader] Error refreshing cache for ${jsonPath}:`, error);
      throw error;
    }
  }
  
  /**
   * Broadcast de actualización a clientes conectados
   */
  private static async broadcastUpdate(jsonPath: string): Promise<void> {
    // Solo en el browser
    if (typeof window === 'undefined') return;
    
    try {
      // Notificar via BroadcastChannel para múltiples tabs
      const channel = new BroadcastChannel('metrica-json-updates');
      channel.postMessage({
        type: 'JSON_UPDATED',
        path: jsonPath,
        timestamp: Date.now()
      });
      
      // Notificar al service worker también
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
      console.warn(`[PWAJsonReader] Error broadcasting update for ${jsonPath}:`, error);
    }
  }
  
  /**
   * Preload de JSONs críticos para mejor UX
   */
  static async preloadCritical(): Promise<void> {
    const criticalPaths = [
      '/api/admin/pages/home',
      '/api/admin/pages/portfolio',
      '/api/admin/megamenu'
    ];
    
    if (this.DEBUG) {
      console.log('[PWAJsonReader] Preloading critical JSONs...');
    }
    
    await JSONVersionManager.preloadCriticalJSONs(criticalPaths);
  }
  
  /**
   * Método de compatibilidad con el sistema existente
   */
  static async readJSON<T>(filePath: string): Promise<T> {
    return this.readWithCache<T>(filePath);
  }
  
  /**
   * Versión síncrona para servidor (compatibilidad)
   */
  static readJSONSync<T>(filePath: string): T {
    // En servidor, usar el método existente
    if (typeof window === 'undefined') {
      const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
      const jsonPath = cleanPath.startsWith('json/') ? cleanPath : `json/${cleanPath}`;
      return readPublicJSON<T>(jsonPath);
    }
    
    // En cliente, no es posible síncrono
    throw new Error('Synchronous JSON reading not available in browser. Use readWithCache() instead.');
  }
  
  /**
   * Obtiene estadísticas del cache para debugging
   */
  static getCacheStats() {
    return {
      ...JSONVersionManager.getCacheStats(),
      debug: this.DEBUG
    };
  }
  
  /**
   * Limpia todo el cache (útil para reset/logout)
   */
  static clearCache(): void {
    JSONVersionManager.clearAll();
    
    if (this.DEBUG) {
      console.log('[PWAJsonReader] Cache cleared');
    }
  }
}

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
      console.error(`Error loading ${filePath}:`, err);
      
    } finally {
      setLoading(false);
    }
  }, [filePath]);
  
  // Cargar datos inicialmente
  React.useEffect(() => {
    loadData();
  }, [loadData]);
  
  // Escuchar actualizaciones via BroadcastChannel
  React.useEffect(() => {
    const channel = new BroadcastChannel('metrica-json-updates');
    
    const handleUpdate = (event: MessageEvent) => {
      if (event.data.type === 'JSON_UPDATED') {
        const updatedPath = event.data.path;
        const targetPath = filePath.startsWith('json/') ? filePath : `json/${filePath}`;
        
        if (updatedPath === targetPath) {
          console.log(`[usePWAJSON] Reloading ${filePath} due to update`);
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
  
  return {
    data,
    loading,
    error,
    lastUpdated,
    reload: loadData,
    clearError: () => setError(null)
  };
}

// Exportar también el tipo para TypeScript
export type PWAJSONHookResult<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number;
  reload: () => Promise<void>;
  clearError: () => void;
};

// React import para hooks
import React from 'react';