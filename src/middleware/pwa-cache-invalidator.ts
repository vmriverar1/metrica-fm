import { PWAJsonReader } from '@/lib/pwa-json-reader';
import { NextRequest, NextResponse } from 'next/server';

export interface CacheInvalidationOptions {
  broadcastToClients?: boolean;
  preloadAfterInvalidation?: boolean;
  logActivity?: boolean;
}

export interface CacheInvalidationResult {
  success: boolean;
  jsonPath: string;
  timestamp: number;
  error?: string;
  clientsNotified?: boolean;
}

/**
 * Middleware para invalidar cache PWA automáticamente después de editar JSONs
 */
export class PWACacheInvalidator {
  private static readonly DEBUG = process.env.NODE_ENV === 'development';
  
  /**
   * Invalida el cache de un JSON específico después de una edición admin
   */
  static async invalidateJSONCache(
    jsonPath: string,
    options: CacheInvalidationOptions = {}
  ): Promise<CacheInvalidationResult> {
    const {
      broadcastToClients = true,
      preloadAfterInvalidation = true,
      logActivity = true
    } = options;
    
    const timestamp = Date.now();
    
    if (this.DEBUG && logActivity) {
      console.log(`[PWACacheInvalidator] Invalidating cache for ${jsonPath}`);
    }
    
    try {
      // 1. Invalidar cache del JSON
      await PWAJsonReader.invalidateOnEdit(jsonPath);
      
      // 2. Pre-cargar datos frescos si está habilitado
      if (preloadAfterInvalidation) {
        try {
          await PWAJsonReader.refreshCache(jsonPath);
          if (this.DEBUG) {
            console.log(`[PWACacheInvalidator] Preloaded fresh data for ${jsonPath}`);
          }
        } catch (preloadError) {
          console.warn(`[PWACacheInvalidator] Failed to preload ${jsonPath}:`, preloadError);
          // No es crítico, continuamos
        }
      }
      
      // 3. Log de actividad para auditoría
      if (logActivity) {
        await this.logCacheActivity(jsonPath, 'invalidated', timestamp);
      }
      
      return {
        success: true,
        jsonPath,
        timestamp,
        clientsNotified: broadcastToClients
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      console.error(`[PWACacheInvalidator] Failed to invalidate ${jsonPath}:`, error);
      
      return {
        success: false,
        jsonPath,
        timestamp,
        error: errorMessage,
        clientsNotified: false
      };
    }
  }
  
  /**
   * Middleware para integrar automáticamente en APIs admin
   */
  static async withCacheInvalidation(
    jsonPath: string,
    apiHandler: () => Promise<NextResponse>,
    options?: CacheInvalidationOptions
  ): Promise<NextResponse> {
    try {
      // 1. Ejecutar la lógica original del API
      const response = await apiHandler();
      
      // 2. Si fue exitoso, invalidar cache
      if (response.ok) {
        const invalidationResult = await this.invalidateJSONCache(jsonPath, options);
        
        // 3. Añadir headers informativos
        const responseWithHeaders = new NextResponse(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
        
        responseWithHeaders.headers.set('X-PWA-Cache-Invalidated', 'true');
        responseWithHeaders.headers.set('X-PWA-Cache-Path', jsonPath);
        responseWithHeaders.headers.set('X-PWA-Cache-Timestamp', invalidationResult.timestamp.toString());
        
        if (this.DEBUG) {
          responseWithHeaders.headers.set('X-PWA-Cache-Debug', 'true');
        }
        
        return responseWithHeaders;
      }
      
      return response;
      
    } catch (error) {
      console.error(`[PWACacheInvalidator] Error in API handler for ${jsonPath}:`, error);
      throw error;
    }
  }
  
  /**
   * Invalida múltiples JSONs (útil para operaciones que afectan varios archivos)
   */
  static async invalidateMultiple(
    jsonPaths: string[],
    options?: CacheInvalidationOptions
  ): Promise<CacheInvalidationResult[]> {
    const results = await Promise.allSettled(
      jsonPaths.map(path => this.invalidateJSONCache(path, options))
    );
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          success: false,
          jsonPath: jsonPaths[index],
          timestamp: Date.now(),
          error: result.reason.message || 'Unknown error',
          clientsNotified: false
        };
      }
    });
  }
  
  /**
   * Invalida cache por patrón (ej: todas las páginas, todo el portfolio)
   */
  static async invalidateByPattern(
    pattern: 'pages' | 'dynamic-content' | 'admin' | 'all',
    options?: CacheInvalidationOptions
  ): Promise<CacheInvalidationResult[]> {
    const pathsByPattern: Record<string, string[]> = {
      'pages': [
        '/api/admin/pages/home',
        '/api/admin/pages/portfolio',
        '/api/admin/pages/historia',
        '/api/admin/pages/blog',
        '/api/admin/pages/careers',
        '/api/admin/pages/cultura',
        '/api/admin/pages/contact',
        '/api/admin/pages/compromiso',
        '/api/admin/pages/clientes',
        '/api/admin/pages/iso',
        '/api/admin/pages/services'
      ],
      'dynamic-content': [
        'dynamic-content/newsletter/content.json',
        'dynamic-content/portfolio/content.json',
        'dynamic-content/careers/content.json'
      ],
      'admin': [
        'admin/megamenu.json',
        'data/users.json',
        'data/permissions.json',
        'data/media-index.json'
      ],
      'all': [] // Se llena dinámicamente
    };
    
    if (pattern === 'all') {
      pathsByPattern.all = [
        ...pathsByPattern.pages,
        ...pathsByPattern['dynamic-content'],
        ...pathsByPattern.admin
      ];
    }
    
    const paths = pathsByPattern[pattern] || [];
    
    if (this.DEBUG) {
      console.log(`[PWACacheInvalidator] Invalidating pattern '${pattern}': ${paths.length} files`);
    }
    
    return await this.invalidateMultiple(paths, options);
  }
  
  /**
   * Logging de actividad para auditoría
   */
  private static async logCacheActivity(
    jsonPath: string,
    action: 'invalidated' | 'refreshed' | 'preloaded',
    timestamp: number
  ): Promise<void> {
    // En desarrollo, solo log a consola
    if (process.env.NODE_ENV === 'development') {
      console.log(`[PWACacheInvalidator] ${action} ${jsonPath} at ${new Date(timestamp).toISOString()}`);
      return;
    }
    
    // En producción, podrías enviar a un servicio de logging
    // Por ahora, almacenar en localStorage para debugging
    if (typeof window !== 'undefined') {
      try {
        const activity = {
          jsonPath,
          action,
          timestamp,
          userAgent: navigator.userAgent.slice(0, 100) // Limitado por tamaño
        };
        
        const key = 'pwa-cache-activity';
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.push(activity);
        
        // Mantener solo las últimas 50 entradas
        const trimmed = existing.slice(-50);
        localStorage.setItem(key, JSON.stringify(trimmed));
        
      } catch (error) {
        // Ignorar errores de localStorage
      }
    }
  }
  
  /**
   * Obtiene estadísticas de invalidación para debugging
   */
  static getCacheInvalidationStats(): {
    activity: any[];
    cacheStats: any;
    debug: boolean;
  } {
    let activity: any[] = [];
    
    if (typeof window !== 'undefined') {
      try {
        activity = JSON.parse(localStorage.getItem('pwa-cache-activity') || '[]');
      } catch {
        activity = [];
      }
    }
    
    return {
      activity,
      cacheStats: PWAJsonReader.getCacheStats(),
      debug: this.DEBUG
    };
  }
  
  /**
   * Limpia todo el historial de invalidación
   */
  static clearInvalidationHistory(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pwa-cache-activity');
    }
    
    PWAJsonReader.clearCache();
  }
}

/**
 * Decorator/helper para APIs que necesitan invalidación automática
 */
export function withPWACacheInvalidation(jsonPath: string, options?: CacheInvalidationOptions) {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args: any[]) {
      const result = await originalMethod.apply(this, args);
      
      // Si el resultado es un NextResponse exitoso, invalidar cache
      if (result instanceof NextResponse && result.ok) {
        await PWACacheInvalidator.invalidateJSONCache(jsonPath, options);
      }
      
      return result;
    };
    
    return descriptor;
  };
}