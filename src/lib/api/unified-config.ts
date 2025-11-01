/**
 * Unified API Configuration System
 * Centralized configuration for all API endpoints across systems
 */

import { BaseAPIController } from '@/lib/api/base-controller';

// System-specific configurations
export interface SystemAPIConfig {
  name: string;
  baseUrl: string;
  rateLimits: {
    get: number;
    post: number;
    put: number;
    delete: number;
    windowMs: number;
  };
  caching: {
    ttl: number; // Time to live in seconds
    strategy: 'memory' | 'redis' | 'none';
  };
  validation: {
    strict: boolean;
    sanitize: boolean;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    includeBody: boolean;
  };
  features: {
    search: boolean;
    pagination: boolean;
    sorting: boolean;
    filtering: boolean;
    bulkOperations: boolean;
  };
}

// Default configuration
const DEFAULT_API_CONFIG: SystemAPIConfig = {
  name: 'default',
  baseUrl: '/api',
  rateLimits: {
    get: 200,
    post: 50,
    put: 50,
    delete: 30,
    windowMs: 60 * 1000 // 1 minute
  },
  caching: {
    ttl: 300, // 5 minutes
    strategy: 'memory'
  },
  validation: {
    strict: true,
    sanitize: true
  },
  logging: {
    level: 'info',
    includeBody: false
  },
  features: {
    search: true,
    pagination: true,
    sorting: true,
    filtering: true,
    bulkOperations: false
  }
};

// System-specific configurations
export const API_CONFIGS: Record<string, SystemAPIConfig> = {
  newsletter: {
    ...DEFAULT_API_CONFIG,
    name: 'newsletter',
    baseUrl: '/api/newsletter',
    rateLimits: {
      get: 300,
      post: 30, // Lower for content creation
      put: 30,
      delete: 10, // Very restrictive for content deletion
      windowMs: 60 * 1000
    },
    caching: {
      ttl: 600, // 10 minutes for articles
      strategy: 'memory'
    },
    features: {
      search: true,
      pagination: true,
      sorting: true,
      filtering: true,
      bulkOperations: true // For newsletter management
    }
  },

  portfolio: {
    ...DEFAULT_API_CONFIG,
    name: 'portfolio',
    baseUrl: '/api/portfolio',
    rateLimits: {
      get: 500, // High read volume expected
      post: 20,
      put: 20,
      delete: 5, // Very restrictive for portfolio deletion
      windowMs: 60 * 1000
    },
    caching: {
      ttl: 1800, // 30 minutes for projects (less frequent updates)
      strategy: 'memory'
    },
    features: {
      search: true,
      pagination: true,
      sorting: true,
      filtering: true,
      bulkOperations: false
    }
  },

  careers: {
    ...DEFAULT_API_CONFIG,
    name: 'careers',
    baseUrl: '/api/careers',
    rateLimits: {
      get: 400,
      post: 40, // Higher for job applications
      put: 20,
      delete: 10,
      windowMs: 60 * 1000
    },
    caching: {
      ttl: 300, // 5 minutes for jobs (frequent updates)
      strategy: 'memory'
    },
    features: {
      search: true,
      pagination: true,
      sorting: true,
      filtering: true,
      bulkOperations: true // For HR management
    }
  },

  public: {
    ...DEFAULT_API_CONFIG,
    name: 'public',
    baseUrl: '/api/public',
    rateLimits: {
      get: 1000, // Very high for public APIs
      post: 100, // For subscriptions, contact forms
      put: 10,
      delete: 0, // No public deletes
      windowMs: 60 * 1000
    },
    caching: {
      ttl: 900, // 15 minutes for public content
      strategy: 'memory'
    },
    validation: {
      strict: false, // More lenient for public APIs
      sanitize: true
    },
    logging: {
      level: 'warn', // Less verbose for public APIs
      includeBody: false
    }
  }
};

/**
 * Configuration manager
 */
export class APIConfigManager {
  /**
   * Get configuration for a system
   */
  static getConfig(system: string): SystemAPIConfig {
    return API_CONFIGS[system] || DEFAULT_API_CONFIG;
  }

  /**
   * Get rate limit for specific operation
   */
  static getRateLimit(system: string, operation: 'get' | 'post' | 'put' | 'delete'): {
    maxRequests: number;
    windowMs: number;
  } {
    const config = this.getConfig(system);
    return {
      maxRequests: config.rateLimits[operation],
      windowMs: config.rateLimits.windowMs
    };
  }

  /**
   * Check if feature is enabled
   */
  static isFeatureEnabled(system: string, feature: keyof SystemAPIConfig['features']): boolean {
    const config = this.getConfig(system);
    return config.features[feature];
  }

  /**
   * Get caching configuration
   */
  static getCacheConfig(system: string): SystemAPIConfig['caching'] {
    const config = this.getConfig(system);
    return config.caching;
  }

  /**
   * Get logging configuration
   */
  static getLoggingConfig(system: string): SystemAPIConfig['logging'] {
    const config = this.getConfig(system);
    return config.logging;
  }
}

/**
 * Controller factory with unified configuration
 */
export class APIControllerFactory {
  /**
   * Create a configured BaseAPIController instance
   */
  static createController<T, TData>(
    system: string,
    service: any,
    options: {
      validator?: (data: any) => { isValid: boolean; errors: string[] };
      transformer?: (data: any) => any;
      searchFields?: string[];
      allowedFilters?: string[];
    } = {}
  ): BaseAPIController<T, TData> {
    const config = APIConfigManager.getConfig(system);

    return new BaseAPIController(service, {
      ...options,
      systemName: system,
      defaultLimit: 20,
      maxLimit: config.features.pagination ? 100 : 50
    });
  }
}

/**
 * Endpoint metadata for documentation and monitoring
 */
export interface EndpointMetadata {
  system: string;
  endpoint: string;
  method: string;
  description: string;
  parameters?: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
  responses: {
    status: number;
    description: string;
    schema?: any;
  }[];
  examples?: {
    request?: any;
    response?: any;
  };
}

// Unified endpoint registry
export const ENDPOINT_REGISTRY: Record<string, EndpointMetadata[]> = {
  newsletter: [
    {
      system: 'newsletter',
      endpoint: '/api/newsletter/categories',
      method: 'GET',
      description: 'List all newsletter categories',
      parameters: [
        { name: 'page', type: 'number', required: false, description: 'Page number for pagination' },
        { name: 'limit', type: 'number', required: false, description: 'Items per page' },
        { name: 'search', type: 'string', required: false, description: 'Search term' }
      ],
      responses: [
        { status: 200, description: 'Success' },
        { status: 400, description: 'Bad Request' },
        { status: 500, description: 'Internal Server Error' }
      ]
    }
    // More endpoints...
  ],

  portfolio: [
    {
      system: 'portfolio',
      endpoint: '/api/portfolio/projects',
      method: 'GET',
      description: 'List all portfolio projects',
      parameters: [
        { name: 'category_id', type: 'string', required: false, description: 'Filter by category' },
        { name: 'featured', type: 'boolean', required: false, description: 'Filter featured projects' }
      ],
      responses: [
        { status: 200, description: 'Success' },
        { status: 400, description: 'Bad Request' }
      ]
    }
    // More endpoints...
  ],

  careers: [
    {
      system: 'careers',
      endpoint: '/api/careers/positions',
      method: 'GET',
      description: 'List all job positions',
      parameters: [
        { name: 'department_id', type: 'string', required: false, description: 'Filter by department' },
        { name: 'status', type: 'string', required: false, description: 'Filter by status' }
      ],
      responses: [
        { status: 200, description: 'Success' },
        { status: 400, description: 'Bad Request' }
      ]
    }
    // More endpoints...
  ]
};

/**
 * API health check utilities
 */
export class APIHealthCheck {
  /**
   * Check health of a specific system
   */
  static async checkSystemHealth(system: string): Promise<{
    system: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    latency: number;
    errors: string[];
  }> {
    const startTime = Date.now();
    const errors: string[] = [];

    try {
      // Perform basic health checks
      const config = APIConfigManager.getConfig(system);

      // Check configuration
      if (!config) {
        errors.push('System configuration not found');
      }

      // Add more health checks as needed

      const latency = Date.now() - startTime;
      const status = errors.length === 0 ? 'healthy' : 'unhealthy';

      return {
        system,
        status,
        latency,
        errors
      };
    } catch (error) {
      return {
        system,
        status: 'unhealthy',
        latency: Date.now() - startTime,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Check health of all systems
   */
  static async checkAllSystems(): Promise<{
    overall: 'healthy' | 'degraded' | 'unhealthy';
    systems: Awaited<ReturnType<typeof APIHealthCheck.checkSystemHealth>>[];
  }> {
    const systems = Object.keys(API_CONFIGS);
    const systemHealths = await Promise.all(
      systems.map(system => this.checkSystemHealth(system))
    );

    const healthyCount = systemHealths.filter(h => h.status === 'healthy').length;
    const unhealthyCount = systemHealths.filter(h => h.status === 'unhealthy').length;

    let overall: 'healthy' | 'degraded' | 'unhealthy';
    if (unhealthyCount === 0) {
      overall = 'healthy';
    } else if (healthyCount > unhealthyCount) {
      overall = 'degraded';
    } else {
      overall = 'unhealthy';
    }

    return {
      overall,
      systems: systemHealths
    };
  }
}

// Export convenience functions
export const getSystemConfig = APIConfigManager.getConfig;
export const getRateLimit = APIConfigManager.getRateLimit;
export const isFeatureEnabled = APIConfigManager.isFeatureEnabled;
export const createController = APIControllerFactory.createController;