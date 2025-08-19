/**
 * FASE 6: Production Configuration Service
 * 
 * Sistema completo de configuración para producción.
 * Maneja variables de entorno, optimizaciones, seguridad y deployment.
 * 
 * Features:
 * - Gestión de variables de entorno
 * - Configuraciones por ambiente
 * - Validación de configuración
 * - Optimizaciones de build
 * - Configuración de seguridad
 * - Health checks de producción
 * - Configuración de monitoreo
 * - Scripts de deployment
 */

// Tipos para configuración
export interface Environment {
  name: 'development' | 'staging' | 'production';
  debug: boolean;
  apiUrl: string;
  directusUrl: string;
  databaseUrl: string;
  redisUrl?: string;
  sentryDsn?: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableAnalytics: boolean;
  enableMonitoring: boolean;
  enableCaching: boolean;
  enableCompression: boolean;
  enableHTTPS: boolean;
  corsOrigins: string[];
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  cache: {
    ttl: number;
    maxSize: number;
  };
  upload: {
    maxFileSize: number;
    allowedTypes: string[];
  };
  auth: {
    jwtSecret: string;
    jwtExpiresIn: string;
    bcryptRounds: number;
    sessionTimeout: number;
    maxLoginAttempts: number;
    lockoutTime: number;
  };
  email: {
    service: string;
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
    from: string;
  };
  monitoring: {
    enabled: boolean;
    healthCheckInterval: number;
    metricsRetention: number;
    alertThresholds: {
      cpuUsage: number;
      memoryUsage: number;
      diskUsage: number;
      responseTime: number;
      errorRate: number;
    };
  };
}

export interface DeploymentConfig {
  target: 'firebase' | 'vercel' | 'netlify' | 'docker' | 'cpanel';
  buildCommand: string;
  outputDirectory: string;
  environmentVariables: Record<string, string>;
  customDomain?: string;
  cdn?: {
    enabled: boolean;
    provider: 'cloudflare' | 'aws' | 'gcp';
    cacheRules: Array<{
      pattern: string;
      ttl: number;
    }>;
  };
  ssl?: {
    enabled: boolean;
    certificate?: string;
    key?: string;
  };
  backup?: {
    enabled: boolean;
    schedule: string;
    retention: number;
  };
}

export interface BuildOptimizations {
  bundleAnalyzer: boolean;
  codeSplitting: boolean;
  treeShaking: boolean;
  minification: boolean;
  compression: boolean;
  imageOptimization: boolean;
  staticGeneration: boolean;
  serverSideRendering: boolean;
  incrementalStaticRegeneration: boolean;
  webpackOptimizations: {
    splitChunks: boolean;
    minimizer: boolean;
    moduleResolution: boolean;
  };
  nextjsOptimizations: {
    swcMinify: boolean;
    modularizeImports: boolean;
    optimizeFonts: boolean;
    optimizeImages: boolean;
  };
}

// Configuraciones por ambiente
const environments: Record<string, Environment> = {
  development: {
    name: 'development',
    debug: true,
    apiUrl: 'http://localhost:9002',
    directusUrl: 'http://localhost:8055',
    databaseUrl: 'sqlite:./directus.db',
    logLevel: 'debug',
    enableAnalytics: false,
    enableMonitoring: true,
    enableCaching: true,
    enableCompression: false,
    enableHTTPS: false,
    corsOrigins: ['http://localhost:9002', 'http://localhost:3000'],
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 1000
    },
    cache: {
      ttl: 5 * 60 * 1000, // 5 minutes
      maxSize: 100
    },
    upload: {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    },
    auth: {
      jwtSecret: 'dev-secret-key-change-in-production',
      jwtExpiresIn: '24h',
      bcryptRounds: 10,
      sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
      maxLoginAttempts: 10,
      lockoutTime: 15 * 60 * 1000 // 15 minutes
    },
    email: {
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      user: process.env.EMAIL_USER || '',
      password: process.env.EMAIL_PASSWORD || '',
      from: 'noreply@metrica-dip.com'
    },
    monitoring: {
      enabled: true,
      healthCheckInterval: 30000, // 30 seconds
      metricsRetention: 24 * 60 * 60 * 1000, // 24 hours
      alertThresholds: {
        cpuUsage: 90,
        memoryUsage: 90,
        diskUsage: 95,
        responseTime: 5000,
        errorRate: 10
      }
    }
  },

  staging: {
    name: 'staging',
    debug: true,
    apiUrl: 'https://staging-metrica.herokuapp.com',
    directusUrl: 'https://staging-cms.metrica-dip.com',
    databaseUrl: process.env.DATABASE_URL || '',
    redisUrl: process.env.REDIS_URL,
    sentryDsn: process.env.SENTRY_DSN,
    logLevel: 'info',
    enableAnalytics: true,
    enableMonitoring: true,
    enableCaching: true,
    enableCompression: true,
    enableHTTPS: true,
    corsOrigins: ['https://staging-metrica.herokuapp.com'],
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      maxRequests: 500
    },
    cache: {
      ttl: 15 * 60 * 1000, // 15 minutes
      maxSize: 500
    },
    upload: {
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    },
    auth: {
      jwtSecret: process.env.JWT_SECRET || '',
      jwtExpiresIn: '8h',
      bcryptRounds: 12,
      sessionTimeout: 8 * 60 * 60 * 1000, // 8 hours
      maxLoginAttempts: 5,
      lockoutTime: 30 * 60 * 1000 // 30 minutes
    },
    email: {
      service: 'sendgrid',
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      user: 'apikey',
      password: process.env.SENDGRID_API_KEY || '',
      from: 'noreply@metrica-dip.com'
    },
    monitoring: {
      enabled: true,
      healthCheckInterval: 60000, // 1 minute
      metricsRetention: 7 * 24 * 60 * 60 * 1000, // 7 days
      alertThresholds: {
        cpuUsage: 80,
        memoryUsage: 85,
        diskUsage: 90,
        responseTime: 3000,
        errorRate: 5
      }
    }
  },

  production: {
    name: 'production',
    debug: false,
    apiUrl: 'https://metrica-dip.com',
    directusUrl: 'https://cms.metrica-dip.com',
    databaseUrl: process.env.DATABASE_URL || '',
    redisUrl: process.env.REDIS_URL,
    sentryDsn: process.env.SENTRY_DSN,
    logLevel: 'warn',
    enableAnalytics: true,
    enableMonitoring: true,
    enableCaching: true,
    enableCompression: true,
    enableHTTPS: true,
    corsOrigins: ['https://metrica-dip.com', 'https://www.metrica-dip.com'],
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      maxRequests: 100
    },
    cache: {
      ttl: 60 * 60 * 1000, // 1 hour
      maxSize: 1000
    },
    upload: {
      maxFileSize: 2 * 1024 * 1024, // 2MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
    },
    auth: {
      jwtSecret: process.env.JWT_SECRET || '',
      jwtExpiresIn: '4h',
      bcryptRounds: 14,
      sessionTimeout: 4 * 60 * 60 * 1000, // 4 hours
      maxLoginAttempts: 3,
      lockoutTime: 60 * 60 * 1000 // 1 hour
    },
    email: {
      service: 'sendgrid',
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      user: 'apikey',
      password: process.env.SENDGRID_API_KEY || '',
      from: 'noreply@metrica-dip.com'
    },
    monitoring: {
      enabled: true,
      healthCheckInterval: 30000, // 30 seconds
      metricsRetention: 30 * 24 * 60 * 60 * 1000, // 30 days
      alertThresholds: {
        cpuUsage: 70,
        memoryUsage: 80,
        diskUsage: 85,
        responseTime: 2000,
        errorRate: 1
      }
    }
  }
};

// Configuraciones de deployment
const deploymentConfigs: Record<string, DeploymentConfig> = {
  firebase: {
    target: 'firebase',
    buildCommand: 'npm run build',
    outputDirectory: 'out',
    environmentVariables: {
      NEXT_PUBLIC_ENV: 'production',
      NEXT_PUBLIC_API_URL: 'https://metrica-dip.com',
      NEXT_PUBLIC_DIRECTUS_URL: 'https://cms.metrica-dip.com'
    },
    customDomain: 'metrica-dip.com',
    cdn: {
      enabled: true,
      provider: 'cloudflare',
      cacheRules: [
        { pattern: '*.js', ttl: 31536000 }, // 1 year
        { pattern: '*.css', ttl: 31536000 }, // 1 year
        { pattern: '*.png', ttl: 2592000 }, // 30 days
        { pattern: '*.jpg', ttl: 2592000 }, // 30 days
        { pattern: '/api/*', ttl: 300 } // 5 minutes
      ]
    },
    ssl: {
      enabled: true
    },
    backup: {
      enabled: true,
      schedule: '0 2 * * *', // Daily at 2 AM
      retention: 30
    }
  },

  vercel: {
    target: 'vercel',
    buildCommand: 'npm run build',
    outputDirectory: '.next',
    environmentVariables: {
      NEXT_PUBLIC_ENV: 'production',
      NEXT_PUBLIC_API_URL: 'https://metrica-dip.vercel.app',
      NEXT_PUBLIC_DIRECTUS_URL: 'https://cms.metrica-dip.com'
    }
  },

  docker: {
    target: 'docker',
    buildCommand: 'docker build -t metrica-app .',
    outputDirectory: 'dist',
    environmentVariables: {
      NODE_ENV: 'production',
      PORT: '3000'
    }
  },

  cpanel: {
    target: 'cpanel',
    buildCommand: 'npm run build && npm run export',
    outputDirectory: 'out',
    environmentVariables: {
      NEXT_PUBLIC_ENV: 'production',
      NEXT_PUBLIC_BASEPATH: '',
      NEXT_PUBLIC_ASSET_PREFIX: ''
    }
  }
};

// Optimizaciones de build
const buildOptimizations: BuildOptimizations = {
  bundleAnalyzer: process.env.ANALYZE === 'true',
  codeSplitting: true,
  treeShaking: true,
  minification: true,
  compression: true,
  imageOptimization: true,
  staticGeneration: true,
  serverSideRendering: false, // Disabled for static export
  incrementalStaticRegeneration: false,
  webpackOptimizations: {
    splitChunks: true,
    minimizer: true,
    moduleResolution: true
  },
  nextjsOptimizations: {
    swcMinify: true,
    modularizeImports: true,
    optimizeFonts: true,
    optimizeImages: true
  }
};

// Clase principal de configuración
export class ProductionConfig {
  private static instance: ProductionConfig;
  private environment: Environment;
  private deploymentConfig: DeploymentConfig;
  private buildOptimizations: BuildOptimizations;

  private constructor() {
    const env = process.env.NODE_ENV || 'development';
    this.environment = environments[env] || environments.development;
    this.deploymentConfig = deploymentConfigs[process.env.DEPLOYMENT_TARGET || 'firebase'];
    this.buildOptimizations = buildOptimizations;

    this.validateConfiguration();
  }

  static getInstance(): ProductionConfig {
    if (!ProductionConfig.instance) {
      ProductionConfig.instance = new ProductionConfig();
    }
    return ProductionConfig.instance;
  }

  /**
   * Obtener configuración del ambiente actual
   */
  getEnvironment(): Environment {
    return this.environment;
  }

  /**
   * Obtener configuración de deployment
   */
  getDeploymentConfig(): DeploymentConfig {
    return this.deploymentConfig;
  }

  /**
   * Obtener optimizaciones de build
   */
  getBuildOptimizations(): BuildOptimizations {
    return this.buildOptimizations;
  }

  /**
   * Validar configuración
   */
  private validateConfiguration(): void {
    const errors: string[] = [];
    const env = this.environment;

    // Validar variables requeridas en producción
    if (env.name === 'production') {
      if (!env.auth.jwtSecret || env.auth.jwtSecret === 'dev-secret-key-change-in-production') {
        errors.push('JWT_SECRET is required in production');
      }

      if (!env.databaseUrl) {
        errors.push('DATABASE_URL is required in production');
      }

      if (!env.email.password) {
        errors.push('Email configuration is incomplete in production');
      }
    }

    // Validar URLs
    try {
      new URL(env.apiUrl);
      new URL(env.directusUrl);
    } catch (error) {
      errors.push('Invalid API or Directus URLs');
    }

    // Validar configuración de seguridad
    if (env.auth.bcryptRounds < 10) {
      errors.push('bcryptRounds should be at least 10');
    }

    if (env.auth.maxLoginAttempts > 20) {
      errors.push('maxLoginAttempts should not exceed 20');
    }

    // Log errors
    if (errors.length > 0) {
      console.error('❌ Configuration validation errors:');
      errors.forEach(error => console.error(`  - ${error}`));
      
      if (env.name === 'production') {
        throw new Error('Production configuration validation failed');
      }
    } else {
      console.log('✅ Configuration validation passed');
    }
  }

  /**
   * Generar variables de entorno para deployment
   */
  generateEnvironmentVariables(): Record<string, string> {
    const env = this.environment;
    const deployment = this.deploymentConfig;

    return {
      ...deployment.environmentVariables,
      NODE_ENV: env.name,
      NEXT_PUBLIC_API_URL: env.apiUrl,
      NEXT_PUBLIC_DIRECTUS_URL: env.directusUrl,
      DATABASE_URL: env.databaseUrl,
      REDIS_URL: env.redisUrl || '',
      JWT_SECRET: env.auth.jwtSecret,
      EMAIL_USER: env.email.user,
      EMAIL_PASSWORD: env.email.password,
      SENTRY_DSN: env.sentryDsn || '',
      LOG_LEVEL: env.logLevel,
      ENABLE_ANALYTICS: env.enableAnalytics.toString(),
      ENABLE_MONITORING: env.enableMonitoring.toString(),
      ENABLE_CACHING: env.enableCaching.toString(),
      RATE_LIMIT_WINDOW_MS: env.rateLimit.windowMs.toString(),
      RATE_LIMIT_MAX_REQUESTS: env.rateLimit.maxRequests.toString(),
      CACHE_TTL: env.cache.ttl.toString(),
      CACHE_MAX_SIZE: env.cache.maxSize.toString(),
      MAX_FILE_SIZE: env.upload.maxFileSize.toString(),
      SESSION_TIMEOUT: env.auth.sessionTimeout.toString(),
      MAX_LOGIN_ATTEMPTS: env.auth.maxLoginAttempts.toString(),
      LOCKOUT_TIME: env.auth.lockoutTime.toString()
    };
  }

  /**
   * Obtener configuración de Next.js optimizada
   */
  getNextJsConfig(): any {
    const env = this.environment;
    const opts = this.buildOptimizations;

    return {
      output: env.name === 'production' && this.deploymentConfig.target === 'cpanel' ? 'export' : undefined,
      trailingSlash: true,
      basePath: process.env.NEXT_PUBLIC_BASEPATH || '',
      assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX || '',
      poweredByHeader: false,
      compress: env.enableCompression,
      generateEtags: true,
      httpAgentOptions: {
        keepAlive: true
      },
      
      // Optimizations
      swcMinify: opts.nextjsOptimizations.swcMinify,
      modularizeImports: opts.nextjsOptimizations.modularizeImports ? {
        'lucide-react': {
          transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}'
        }
      } : undefined,
      optimizeFonts: opts.nextjsOptimizations.optimizeFonts,
      
      // Images
      images: opts.nextjsOptimizations.optimizeImages ? {
        domains: ['picsum.photos', 'images.unsplash.com'],
        formats: ['image/webp', 'image/avif'],
        minimumCacheTTL: 60,
        dangerouslyAllowSVG: false
      } : { unoptimized: true },
      
      // Experimental
      experimental: {
        scrollRestoration: true,
        optimizeCss: env.name === 'production',
        legacyBrowsers: false
      },
      
      // Webpack
      webpack: (config: any, { dev, isServer }: any) => {
        if (opts.webpackOptimizations.splitChunks && !dev) {
          config.optimization.splitChunks = {
            chunks: 'all',
            cacheGroups: {
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all'
              }
            }
          };
        }

        if (opts.webpackOptimizations.moduleResolution) {
          config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            net: false,
            tls: false
          };
        }

        return config;
      },

      // Headers
      async headers() {
        const headers = [];

        if (env.enableHTTPS && env.name === 'production') {
          headers.push({
            source: '/:path*',
            headers: [
              {
                key: 'Strict-Transport-Security',
                value: 'max-age=31536000; includeSubDomains'
              },
              {
                key: 'X-Frame-Options',
                value: 'SAMEORIGIN'
              },
              {
                key: 'X-Content-Type-Options',
                value: 'nosniff'
              },
              {
                key: 'Referrer-Policy',
                value: 'strict-origin-when-cross-origin'
              },
              {
                key: 'Permissions-Policy',
                value: 'camera=(), microphone=(), geolocation=()'
              }
            ]
          });
        }

        return headers;
      },

      // Redirects
      async redirects() {
        return [
          {
            source: '/home',
            destination: '/',
            permanent: true
          }
        ];
      }
    };
  }

  /**
   * Health check de configuración
   */
  async performHealthCheck(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    checks: Array<{
      name: string;
      status: 'pass' | 'fail';
      message: string;
      duration: number;
    }>;
  }> {
    const checks = [];
    const startTime = performance.now();

    // Check environment variables
    const envCheck = {
      name: 'Environment Variables',
      status: 'pass' as const,
      message: 'All required variables present',
      duration: 0
    };

    try {
      this.validateConfiguration();
    } catch (error) {
      envCheck.status = 'fail';
      envCheck.message = error instanceof Error ? error.message : 'Validation failed';
    }

    envCheck.duration = performance.now() - startTime;
    checks.push(envCheck);

    // Check API connectivity
    const apiCheck = {
      name: 'API Connectivity',
      status: 'pass' as const,
      message: 'API is reachable',
      duration: 0
    };

    const apiStartTime = performance.now();
    try {
      const response = await fetch(`${this.environment.apiUrl}/health`, { 
        timeout: 5000 
      });
      if (!response.ok) {
        apiCheck.status = 'fail';
        apiCheck.message = `API returned status ${response.status}`;
      }
    } catch (error) {
      apiCheck.status = 'fail';
      apiCheck.message = 'API is not reachable';
    }

    apiCheck.duration = performance.now() - apiStartTime;
    checks.push(apiCheck);

    // Check Directus connectivity
    const directusCheck = {
      name: 'Directus CMS',
      status: 'pass' as const,
      message: 'Directus is reachable',
      duration: 0
    };

    const directusStartTime = performance.now();
    try {
      const response = await fetch(`${this.environment.directusUrl}/server/health`, { 
        timeout: 5000 
      });
      if (!response.ok) {
        directusCheck.status = 'fail';
        directusCheck.message = `Directus returned status ${response.status}`;
      }
    } catch (error) {
      directusCheck.status = 'warning' as const;
      directusCheck.message = 'Directus not available (fallback mode active)';
    }

    directusCheck.duration = performance.now() - directusStartTime;
    checks.push(directusCheck);

    // Determine overall status
    const failedChecks = checks.filter(c => c.status === 'fail').length;
    const warningChecks = checks.filter(c => c.status === 'warning').length;

    let overallStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (failedChecks > 0) {
      overallStatus = 'critical';
    } else if (warningChecks > 0) {
      overallStatus = 'warning';
    }

    return {
      status: overallStatus,
      checks
    };
  }

  /**
   * Generar reporte de configuración
   */
  generateConfigReport(): {
    environment: string;
    features: Record<string, boolean>;
    security: Record<string, any>;
    performance: Record<string, any>;
    deployment: Record<string, any>;
  } {
    const env = this.environment;
    const deployment = this.deploymentConfig;
    const build = this.buildOptimizations;

    return {
      environment: env.name,
      features: {
        analytics: env.enableAnalytics,
        monitoring: env.enableMonitoring,
        caching: env.enableCaching,
        compression: env.enableCompression,
        https: env.enableHTTPS
      },
      security: {
        corsOrigins: env.corsOrigins.length,
        rateLimit: env.rateLimit,
        maxLoginAttempts: env.auth.maxLoginAttempts,
        sessionTimeout: env.auth.sessionTimeout,
        bcryptRounds: env.auth.bcryptRounds
      },
      performance: {
        cacheConfig: env.cache,
        bundleAnalyzer: build.bundleAnalyzer,
        codeSplitting: build.codeSplitting,
        minification: build.minification,
        imageOptimization: build.imageOptimization
      },
      deployment: {
        target: deployment.target,
        buildCommand: deployment.buildCommand,
        outputDirectory: deployment.outputDirectory,
        customDomain: deployment.customDomain,
        cdnEnabled: deployment.cdn?.enabled || false
      }
    };
  }
}

// Export singleton instance
export default ProductionConfig.getInstance();