/**
 * Servicio unificado de datos para frontend
 * Abstrae la comunicación con las APIs unificadas de Fase 5
 */

import { SystemType, DataType } from '@/hooks/useUnifiedData';

export interface UnifiedDataServiceOptions {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  cacheEnabled?: boolean;
}

export interface FetchOptions {
  filters?: Record<string, any>;
  limit?: number;
  offset?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface ServiceResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
  error?: string;
}

/**
 * Servicio principal de datos unificados
 */
export class UnifiedDataService {
  private baseUrl: string;
  private timeout: number;
  private retries: number;
  private cache: Map<string, { data: any, timestamp: number }>;
  private cacheTimeout: number;

  constructor(options: UnifiedDataServiceOptions = {}) {
    this.baseUrl = options.baseUrl || '/api';
    this.timeout = options.timeout || 10000;
    this.retries = options.retries || 2;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
  }

  /**
   * Construir URL de endpoint
   */
  private buildUrl(system: SystemType, endpoint: DataType, id?: string): string {
    const base = `${this.baseUrl}/${system}/${endpoint}`;
    return id ? `${base}/${id}` : base;
  }

  /**
   * Construir query string desde opciones
   */
  private buildQueryString(options: FetchOptions = {}): string {
    const params = new URLSearchParams();

    // Filtros
    Object.entries(options.filters || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    // Opciones de paginación y búsqueda
    if (options.limit) params.append('limit', String(options.limit));
    if (options.offset) params.append('offset', String(options.offset));
    if (options.search) params.append('search', options.search);
    if (options.sort) params.append('sort', options.sort);
    if (options.order) params.append('order', options.order);

    return params.toString();
  }

  /**
   * Realizar request HTTP con reintentos
   */
  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ServiceResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const requestOptions: RequestInit = {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    let lastError: Error | null = null;

    // Implementar reintentos
    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const response = await fetch(url, requestOptions);
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        return result as ServiceResponse<T>;

      } catch (error) {
        lastError = error as Error;

        // No reintentar si fue cancelado por timeout o es el último intento
        if (error instanceof DOMException && error.name === 'AbortError') {
          break;
        }

        if (attempt === this.retries) {
          break;
        }

        // Esperar antes del siguiente intento
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    clearTimeout(timeoutId);
    throw lastError || new Error('Request failed after retries');
  }

  /**
   * Gestión de cache
   */
  private getCacheKey(system: SystemType, endpoint: DataType, options: FetchOptions = {}): string {
    return `${system}-${endpoint}-${JSON.stringify(options)}`;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Obtener lista de items
   */
  async getList<T>(
    system: SystemType,
    endpoint: DataType,
    options: FetchOptions = {}
  ): Promise<ServiceResponse<T[]>> {
    const cacheKey = this.getCacheKey(system, endpoint, options);
    const cachedData = this.getFromCache<ServiceResponse<T[]>>(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const queryString = this.buildQueryString(options);
    const url = `${this.buildUrl(system, endpoint)}${queryString ? `?${queryString}` : ''}`;

    try {
      const response = await this.request<T[]>(url);
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error(`Error fetching ${system} ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Obtener item por ID
   */
  async getById<T>(
    system: SystemType,
    endpoint: DataType,
    id: string
  ): Promise<ServiceResponse<T>> {
    const url = this.buildUrl(system, endpoint, id);

    try {
      return await this.request<T>(url);
    } catch (error) {
      console.error(`Error fetching ${system} ${endpoint} by ID:`, error);
      throw error;
    }
  }

  /**
   * Crear nuevo item
   */
  async create<T>(
    system: SystemType,
    endpoint: DataType,
    data: Partial<T>
  ): Promise<ServiceResponse<{ id: string }>> {
    const url = this.buildUrl(system, endpoint);

    try {
      const response = await this.request<{ id: string }>(url, {
        method: 'POST',
        body: JSON.stringify(data)
      });

      // Invalidar cache relacionado
      this.clearCache(system, endpoint);

      return response;
    } catch (error) {
      console.error(`Error creating ${system} ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Actualizar item existente
   */
  async update<T>(
    system: SystemType,
    endpoint: DataType,
    id: string,
    data: Partial<T>
  ): Promise<ServiceResponse<T>> {
    const url = this.buildUrl(system, endpoint, id);

    try {
      const response = await this.request<T>(url, {
        method: 'PUT',
        body: JSON.stringify(data)
      });

      // Invalidar cache relacionado
      this.clearCache(system, endpoint);

      return response;
    } catch (error) {
      console.error(`Error updating ${system} ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar item
   */
  async delete(
    system: SystemType,
    endpoint: DataType,
    id: string
  ): Promise<ServiceResponse<{ deleted: boolean }>> {
    const url = this.buildUrl(system, endpoint, id);

    try {
      const response = await this.request<{ deleted: boolean }>(url, {
        method: 'DELETE'
      });

      // Invalidar cache relacionado
      this.clearCache(system, endpoint);

      return response;
    } catch (error) {
      console.error(`Error deleting ${system} ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Búsqueda
   */
  async search<T>(
    system: SystemType,
    endpoint: DataType,
    query: string,
    options: Omit<FetchOptions, 'search'> = {}
  ): Promise<ServiceResponse<T[]>> {
    return this.getList<T>(system, endpoint, {
      ...options,
      search: query
    });
  }

  /**
   * Obtener estadísticas del sistema
   */
  async getSystemStats(system?: SystemType): Promise<ServiceResponse<any>> {
    const url = system
      ? `${this.baseUrl}/unified/stats?system=${system}`
      : `${this.baseUrl}/unified/stats`;

    try {
      return await this.request(url);
    } catch (error) {
      console.error('Error fetching system stats:', error);
      throw error;
    }
  }

  /**
   * Obtener configuración del sistema
   */
  async getSystemConfig(system?: SystemType): Promise<ServiceResponse<any>> {
    const url = system
      ? `${this.baseUrl}/unified/config?system=${system}`
      : `${this.baseUrl}/unified/config`;

    try {
      return await this.request(url);
    } catch (error) {
      console.error('Error fetching system config:', error);
      throw error;
    }
  }

  /**
   * Health check del sistema
   */
  async getSystemHealth(system?: SystemType): Promise<ServiceResponse<any>> {
    const url = system
      ? `${this.baseUrl}/unified/health?system=${system}`
      : `${this.baseUrl}/unified/health`;

    try {
      return await this.request(url);
    } catch (error) {
      console.error('Error fetching system health:', error);
      throw error;
    }
  }

  /**
   * Limpiar cache
   */
  clearCache(system?: SystemType, endpoint?: DataType): void {
    if (system && endpoint) {
      // Limpiar cache específico
      const pattern = `${system}-${endpoint}-`;
      Array.from(this.cache.keys())
        .filter(key => key.startsWith(pattern))
        .forEach(key => this.cache.delete(key));
    } else if (system) {
      // Limpiar todo el cache de un sistema
      Array.from(this.cache.keys())
        .filter(key => key.startsWith(`${system}-`))
        .forEach(key => this.cache.delete(key));
    } else {
      // Limpiar todo el cache
      this.cache.clear();
    }
  }

  /**
   * Obtener tamaño del cache
   */
  getCacheSize(): number {
    return this.cache.size;
  }

  /**
   * Limpiar cache expirado
   */
  cleanExpiredCache(): number {
    const now = Date.now();
    let cleaned = 0;

    this.cache.forEach((value, key) => {
      if (now - value.timestamp > this.cacheTimeout) {
        this.cache.delete(key);
        cleaned++;
      }
    });

    return cleaned;
  }
}

// Instancia singleton del servicio
export const unifiedDataService = new UnifiedDataService();

// Funciones de conveniencia para sistemas específicos
export const newsletterService = {
  articles: (options?: FetchOptions) => unifiedDataService.getList('newsletter', 'articles', options),
  categories: (options?: FetchOptions) => unifiedDataService.getList('newsletter', 'categories', options),
  getArticle: (id: string) => unifiedDataService.getById('newsletter', 'articles', id),
  getCategory: (id: string) => unifiedDataService.getById('newsletter', 'categories', id),
  searchArticles: (query: string, options?: Omit<FetchOptions, 'search'>) =>
    unifiedDataService.search('newsletter', 'articles', query, options)
};

export const portfolioService = {
  projects: (options?: FetchOptions) => unifiedDataService.getList('portfolio', 'projects', options),
  categories: (options?: FetchOptions) => unifiedDataService.getList('portfolio', 'categories', options),
  getProject: (id: string) => unifiedDataService.getById('portfolio', 'projects', id),
  getCategory: (id: string) => unifiedDataService.getById('portfolio', 'categories', id),
  searchProjects: (query: string, options?: Omit<FetchOptions, 'search'>) =>
    unifiedDataService.search('portfolio', 'projects', query, options)
};

export const careersService = {
  positions: (options?: FetchOptions) => unifiedDataService.getList('careers', 'positions', options),
  departments: (options?: FetchOptions) => unifiedDataService.getList('careers', 'departments', options),
  applications: (options?: FetchOptions) => unifiedDataService.getList('careers', 'applications', options),
  getPosition: (id: string) => unifiedDataService.getById('careers', 'positions', id),
  getDepartment: (id: string) => unifiedDataService.getById('careers', 'departments', id),
  getApplication: (id: string) => unifiedDataService.getById('careers', 'applications', id),
  searchPositions: (query: string, options?: Omit<FetchOptions, 'search'>) =>
    unifiedDataService.search('careers', 'positions', query, options)
};