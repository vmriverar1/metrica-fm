'use client';

import { createHash } from 'crypto';

export interface JSONCacheEntry {
  version: string;
  timestamp: number;
  data: any;
  path: string;
}

export class JSONVersionManager {
  private static versions = new Map<string, string>();
  private static cache = new Map<string, JSONCacheEntry>();
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  /**
   * Genera un hash único basado en el contenido del JSON
   */
  static async generateVersion(content: any): Promise<string> {
    const jsonString = JSON.stringify(content, null, 0);
    const timestamp = Date.now().toString();

    // En el browser, usamos una versión simplificada del hash
    if (typeof window !== 'undefined') {
      try {
        // Convertir a UTF-8 bytes y luego a base64
        const utf8Bytes = new TextEncoder().encode(jsonString + timestamp);
        const base64 = btoa(String.fromCharCode(...utf8Bytes));
        return base64.slice(0, 12);
      } catch {
        // Fallback simple basado en timestamp
        return timestamp.slice(-12);
      }
    }

    // En el servidor, usamos crypto
    try {
      return createHash('md5').update(jsonString + timestamp).digest('hex').slice(0, 12);
    } catch {
      // Fallback simple basado en timestamp
      return timestamp.slice(-12);
    }
  }

  /**
   * Obtiene la versión actual de un JSON
   */
  static getVersion(jsonPath: string): string | null {
    return this.versions.get(jsonPath) || null;
  }

  /**
   * Actualiza la versión de un JSON
   */
  static async setVersion(jsonPath: string, data: any): Promise<string> {
    const version = await this.generateVersion(data);
    this.versions.set(jsonPath, version);
    
    // Actualiza el cache también
    const cacheEntry: JSONCacheEntry = {
      version,
      timestamp: Date.now(),
      data,
      path: jsonPath
    };
    
    this.cache.set(jsonPath, cacheEntry);
    
    return version;
  }

  /**
   * Invalida el cache de un JSON específico
   */
  static async invalidateCache(jsonPath: string): Promise<void> {
    // Elimina de versiones y cache
    this.versions.delete(jsonPath);
    this.cache.delete(jsonPath);
    
    // Si estamos en el browser, notifica al service worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration.active) {
          registration.active.postMessage({
            type: 'INVALIDATE_JSON_CACHE',
            path: jsonPath,
            timestamp: Date.now()
          });
        }
      } catch (error) {
        console.warn('Failed to notify service worker:', error);
      }
    }
  }

  /**
   * Obtiene datos del cache si son válidos
   */
  static getCachedData(jsonPath: string): any | null {
    const entry = this.cache.get(jsonPath);
    
    if (!entry) return null;
    
    // Verifica si el cache ha expirado
    const now = Date.now();
    if (now - entry.timestamp > this.CACHE_DURATION) {
      this.cache.delete(jsonPath);
      return null;
    }
    
    return entry.data;
  }

  /**
   * Establece datos en cache
   */
  static async setCachedData(jsonPath: string, data: any): Promise<void> {
    const version = await this.setVersion(jsonPath, data);
    // El cache ya se actualiza en setVersion
  }

  /**
   * Verifica si un JSON necesita actualización comparando versiones
   */
  static needsUpdate(jsonPath: string, serverVersion: string): boolean {
    const localVersion = this.getVersion(jsonPath);
    return !localVersion || localVersion !== serverVersion;
  }

  /**
   * Limpia todo el cache (útil para testing o reset)
   */
  static clearAll(): void {
    this.versions.clear();
    this.cache.clear();
  }

  /**
   * Obtiene estadísticas del cache
   */
  static getCacheStats() {
    const entries = Array.from(this.cache.values());
    const now = Date.now();
    
    return {
      totalEntries: entries.length,
      validEntries: entries.filter(entry => 
        now - entry.timestamp < this.CACHE_DURATION
      ).length,
      oldestEntry: entries.reduce((oldest, entry) => 
        !oldest || entry.timestamp < oldest.timestamp ? entry : oldest
      , null as JSONCacheEntry | null),
      newestEntry: entries.reduce((newest, entry) => 
        !newest || entry.timestamp > newest.timestamp ? entry : newest
      , null as JSONCacheEntry | null),
      cachePaths: Array.from(this.cache.keys())
    };
  }

  /**
   * Preload de JSONs críticos
   */
  static async preloadCriticalJSONs(paths: string[]): Promise<void> {
    const preloadPromises = paths.map(async (path) => {
      try {
        const response = await fetch(`/json/${path}`);
        if (response.ok) {
          const data = await response.json();
          await this.setCachedData(path, data);
        }
      } catch (error) {
        console.warn(`Failed to preload ${path}:`, error);
      }
    });

    await Promise.allSettled(preloadPromises);
  }
}

// Hook para usar en componentes React
export function useJSONVersion(jsonPath: string) {
  const [version, setVersion] = React.useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = React.useState<number>(0);
  
  React.useEffect(() => {
    const currentVersion = JSONVersionManager.getVersion(jsonPath);
    setVersion(currentVersion);
    setLastUpdated(Date.now());
    
    // Escucha cambios en el cache
    const checkVersion = () => {
      const newVersion = JSONVersionManager.getVersion(jsonPath);
      if (newVersion !== currentVersion) {
        setVersion(newVersion);
        setLastUpdated(Date.now());
      }
    };
    
    const interval = setInterval(checkVersion, 1000); // Check every second
    return () => clearInterval(interval);
  }, [jsonPath]);
  
  return { version, lastUpdated };
}

// React import para el hook
import React from 'react';