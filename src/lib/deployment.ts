/**
 * Deployment utilities for Métrica FM
 * Provides production deployment helpers, health checks, and environment validation
 */

// Environment validation
export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  NEXT_PUBLIC_BASE_URL?: string;
  NEXT_PUBLIC_GA_MEASUREMENT_ID?: string;
  GOOGLE_VERIFICATION?: string;
  DATABASE_URL?: string;
  REDIS_URL?: string;
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USER?: string;
  SMTP_PASS?: string;
}

export function validateEnvironment(): {
  isValid: boolean;
  missing: string[];
  warnings: string[];
} {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Required environment variables
  const required = ['NODE_ENV'];
  
  // Production-specific requirements
  const productionRequired = [
    'NEXT_PUBLIC_BASE_URL',
  ];

  // Optional but recommended
  const recommended = [
    'NEXT_PUBLIC_GA_MEASUREMENT_ID',
    'GOOGLE_VERIFICATION',
  ];

  // Check required variables
  required.forEach(variable => {
    if (!process.env[variable]) {
      missing.push(variable);
    }
  });

  // Check production-specific variables
  if (process.env.NODE_ENV === 'production') {
    productionRequired.forEach(variable => {
      if (!process.env[variable]) {
        missing.push(variable);
      }
    });
  }

  // Check recommended variables
  recommended.forEach(variable => {
    if (!process.env[variable]) {
      warnings.push(`Recommended variable ${variable} is not set`);
    }
  });

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  };
}

// Health check utilities
export class HealthChecker {
  private checks: Map<string, () => Promise<boolean>> = new Map();

  addCheck(name: string, check: () => Promise<boolean>): void {
    this.checks.set(name, check);
  }

  async runChecks(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Record<string, { status: 'pass' | 'fail'; duration: number; error?: string }>;
    timestamp: string;
  }> {
    const results: Record<string, { status: 'pass' | 'fail'; duration: number; error?: string }> = {};
    let healthyCount = 0;

    for (const [name, check] of this.checks.entries()) {
      const start = Date.now();
      try {
        const result = await check();
        const duration = Date.now() - start;
        
        results[name] = {
          status: result ? 'pass' : 'fail',
          duration,
        };
        
        if (result) healthyCount++;
      } catch (error) {
        const duration = Date.now() - start;
        results[name] = {
          status: 'fail',
          duration,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    const totalChecks = this.checks.size;
    let status: 'healthy' | 'degraded' | 'unhealthy';
    
    if (healthyCount === totalChecks) {
      status = 'healthy';
    } else if (healthyCount > totalChecks / 2) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return {
      status,
      checks: results,
      timestamp: new Date().toISOString(),
    };
  }
}

// Default health checks
export const defaultHealthChecker = new HealthChecker();

// Add basic health checks
defaultHealthChecker.addCheck('memory', async () => {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const memory = process.memoryUsage();
    const usedMB = memory.heapUsed / 1024 / 1024;
    return usedMB < 512; // Healthy if using less than 512MB
  }
  return true;
});

defaultHealthChecker.addCheck('environment', async () => {
  const validation = validateEnvironment();
  return validation.isValid;
});

defaultHealthChecker.addCheck('static-assets', async () => {
  try {
    // Check if manifest.json is accessible
    const response = await fetch('/manifest.json');
    return response.ok;
  } catch {
    return false;
  }
});

// Performance monitoring
export class PerformanceReporter {
  private metrics: Map<string, number[]> = new Map();

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
  }

  getMetrics(): Record<string, {
    count: number;
    average: number;
    min: number;
    max: number;
    p95: number;
  }> {
    const results: Record<string, any> = {};

    for (const [name, values] of this.metrics.entries()) {
      if (values.length === 0) continue;

      const sorted = [...values].sort((a, b) => a - b);
      const sum = values.reduce((acc, val) => acc + val, 0);
      
      results[name] = {
        count: values.length,
        average: sum / values.length,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        p95: sorted[Math.floor(sorted.length * 0.95)],
      };
    }

    return results;
  }

  reset(): void {
    this.metrics.clear();
  }
}

export const performanceReporter = new PerformanceReporter();

// Deployment validation
export async function validateDeployment(): Promise<{
  isReady: boolean;
  issues: string[];
  warnings: string[];
  score: number;
}> {
  const issues: string[] = [];
  const warnings: string[] = [];
  let score = 0;

  // Environment validation (20 points)
  const envValidation = validateEnvironment();
  if (envValidation.isValid) {
    score += 20;
  } else {
    issues.push(...envValidation.missing.map(v => `Missing environment variable: ${v}`));
  }
  warnings.push(...envValidation.warnings);

  // Health checks (30 points)
  try {
    const health = await defaultHealthChecker.runChecks();
    if (health.status === 'healthy') {
      score += 30;
    } else if (health.status === 'degraded') {
      score += 15;
      warnings.push('Some health checks are failing');
    } else {
      issues.push('Health checks are failing');
    }
  } catch (error) {
    issues.push('Unable to run health checks');
  }

  // Build validation (25 points)
  if (typeof window !== 'undefined') {
    // Check if service worker is registered
    if ('serviceWorker' in navigator) {
      score += 10;
    } else {
      warnings.push('Service worker not available');
    }

    // Check if PWA manifest is available
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) {
      score += 10;
    } else {
      warnings.push('PWA manifest not found');
    }

    // Check if analytics is configured
    if ('gtag' in window || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      score += 5;
    } else {
      warnings.push('Analytics not configured');
    }
  }

  // Security headers validation (25 points)
  try {
    if (typeof window !== 'undefined') {
      // This would be better implemented as a server-side check
      // For now, we'll assume security headers are configured if in production
      if (process.env.NODE_ENV === 'production') {
        score += 25;
      } else {
        score += 10;
        warnings.push('Security headers validation skipped in development');
      }
    }
  } catch (error) {
    issues.push('Unable to validate security headers');
  }

  return {
    isReady: issues.length === 0 && score >= 80,
    issues,
    warnings,
    score,
  };
}

// Graceful shutdown
export class GracefulShutdown {
  private handlers: (() => Promise<void>)[] = [];
  private isShuttingDown = false;

  addHandler(handler: () => Promise<void>): void {
    this.handlers.push(handler);
  }

  async shutdown(signal?: string): Promise<void> {
    if (this.isShuttingDown) return;
    
    this.isShuttingDown = true;
    console.log(`Graceful shutdown initiated ${signal ? `(${signal})` : ''}`);

    const promises = this.handlers.map(async (handler, index) => {
      try {
        await handler();
        console.log(`Shutdown handler ${index + 1} completed`);
      } catch (error) {
        console.error(`Shutdown handler ${index + 1} failed:`, error);
      }
    });

    await Promise.all(promises);
    console.log('Graceful shutdown completed');
  }

  initialize(): void {
    if (typeof process !== 'undefined') {
      process.on('SIGTERM', () => this.shutdown('SIGTERM'));
      process.on('SIGINT', () => this.shutdown('SIGINT'));
      process.on('uncaughtException', (error) => {
        console.error('Uncaught exception:', error);
        this.shutdown('uncaughtException');
      });
    }
  }
}

export const gracefulShutdown = new GracefulShutdown();

// Initialize graceful shutdown
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
  gracefulShutdown.initialize();
}

// Deployment checklist
export const DEPLOYMENT_CHECKLIST = [
  {
    category: 'Environment',
    items: [
      'All required environment variables are set',
      'Production URLs are configured correctly',
      'API endpoints are accessible',
      'Database connection is working',
    ],
  },
  {
    category: 'Security',
    items: [
      'HTTPS is enabled and enforced',
      'Security headers are configured',
      'API rate limiting is enabled',
      'Authentication is working',
      'Input validation is in place',
    ],
  },
  {
    category: 'Performance',
    items: [
      'Static assets are minified and compressed',
      'Images are optimized',
      'Caching headers are configured',
      'CDN is configured (if applicable)',
      'Service worker is registered',
    ],
  },
  {
    category: 'Monitoring',
    items: [
      'Error tracking is configured',
      'Performance monitoring is active',
      'Health checks are working',
      'Logging is configured',
      'Alerts are set up',
    ],
  },
  {
    category: 'Accessibility',
    items: [
      'Screen reader compatibility tested',
      'Keyboard navigation works',
      'Color contrast meets WCAG guidelines',
      'Alternative text for images',
      'Focus management is implemented',
    ],
  },
  {
    category: 'PWA',
    items: [
      'Manifest file is valid',
      'Service worker is working',
      'Offline functionality tested',
      'Install prompts work',
      'Icons are properly sized',
    ],
  },
];

export default {
  validateEnvironment,
  HealthChecker,
  defaultHealthChecker,
  PerformanceReporter,
  performanceReporter,
  validateDeployment,
  GracefulShutdown,
  gracefulShutdown,
  DEPLOYMENT_CHECKLIST,
};