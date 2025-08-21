/**
 * Health Check API - Sistema de monitoreo de salud de la aplicación
 * 
 * Endpoint para verificar el estado de la aplicación y sus dependencias
 */

import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  environment: string;
  services: {
    database: 'up' | 'down' | 'degraded';
    filesystem: 'up' | 'down' | 'degraded';
    memory: 'up' | 'down' | 'degraded';
  };
  metrics: {
    memoryUsage: {
      rss: number;
      heapUsed: number;
      heapTotal: number;
      external: number;
    };
    uptime: number;
    timestamp: string;
    nodeVersion: string;
    platform: string;
    architecture: string;
  };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const startTime = Date.now();
    
    // Información básica del sistema
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    // Leer versión del package.json
    let version = '1.0.0';
    try {
      const packageJson = JSON.parse(
        readFileSync(join(process.cwd(), 'package.json'), 'utf8')
      );
      version = packageJson.version || '1.0.0';
    } catch (error) {
      console.warn('Could not read package.json for version');
    }
    
    // Verificar servicios
    const services = {
      database: await checkDatabaseHealth(),
      filesystem: await checkFilesystemHealth(),
      memory: checkMemoryHealth(memoryUsage)
    };
    
    // Determinar estado general
    const allServicesUp = Object.values(services).every(service => service === 'up');
    const hasDownServices = Object.values(services).some(service => service === 'down');
    
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (allServicesUp) {
      overallStatus = 'healthy';
    } else if (hasDownServices) {
      overallStatus = 'unhealthy';
    } else {
      overallStatus = 'degraded';
    }
    
    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version,
      uptime,
      environment: process.env.NODE_ENV || 'development',
      services,
      metrics: {
        memoryUsage,
        uptime,
        timestamp: new Date().toISOString(),
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch
      }
    };
    
    // Determinar código de estado HTTP
    const statusCode = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503;
    
    const response = NextResponse.json(healthStatus, { status: statusCode });
    
    // Headers de cache y monitoreo
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('X-Health-Check-Duration', `${Date.now() - startTime}ms`);
    response.headers.set('X-Environment', process.env.NODE_ENV || 'development');
    response.headers.set('X-Version', version);
    
    return response;
    
  } catch (error) {
    console.error('Health check error:', error);
    
    const errorResponse = {
      status: 'unhealthy' as const,
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
    
    return NextResponse.json(errorResponse, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check-Error': 'true'
      }
    });
  }
}

/**
 * Verificar salud de la base de datos (JSON files)
 */
async function checkDatabaseHealth(): Promise<'up' | 'down' | 'degraded'> {
  try {
    // Verificar acceso a archivos JSON principales
    const testFiles = [
      join(process.cwd(), 'public/json/pages/home.json'),
      join(process.cwd(), 'public/json/pages/portfolio.json'),
      join(process.cwd(), 'public/json/pages/careers.json')
    ];
    
    let accessibleFiles = 0;
    
    for (const file of testFiles) {
      try {
        readFileSync(file, 'utf8');
        accessibleFiles++;
      } catch (error) {
        // File not accessible
      }
    }
    
    if (accessibleFiles === testFiles.length) {
      return 'up';
    } else if (accessibleFiles > 0) {
      return 'degraded';
    } else {
      return 'down';
    }
    
  } catch (error) {
    console.error('Database health check error:', error);
    return 'down';
  }
}

/**
 * Verificar salud del sistema de archivos
 */
async function checkFilesystemHealth(): Promise<'up' | 'down' | 'degraded'> {
  try {
    // Verificar directorios críticos
    const criticalPaths = [
      join(process.cwd(), 'public'),
      join(process.cwd(), 'public/json'),
      join(process.cwd(), 'src')
    ];
    
    let accessiblePaths = 0;
    
    for (const path of criticalPaths) {
      try {
        await import('fs').then(fs => 
          fs.promises.access(path, fs.constants.R_OK)
        );
        accessiblePaths++;
      } catch (error) {
        // Path not accessible
      }
    }
    
    if (accessiblePaths === criticalPaths.length) {
      return 'up';
    } else if (accessiblePaths > 0) {
      return 'degraded';
    } else {
      return 'down';
    }
    
  } catch (error) {
    console.error('Filesystem health check error:', error);
    return 'down';
  }
}

/**
 * Verificar salud de memoria
 */
function checkMemoryHealth(memoryUsage: NodeJS.MemoryUsage): 'up' | 'down' | 'degraded' {
  try {
    const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
    const heapTotalMB = memoryUsage.heapTotal / 1024 / 1024;
    const heapUsagePercent = (heapUsed / heapTotal) * 100;
    
    // Umbrales de memoria
    if (heapUsagePercent > 90 || heapUsedMB > 1024) { // > 90% o > 1GB
      return 'down';
    } else if (heapUsagePercent > 70 || heapUsedMB > 512) { // > 70% o > 512MB
      return 'degraded';
    } else {
      return 'up';
    }
    
  } catch (error) {
    console.error('Memory health check error:', error);
    return 'degraded';
  }
}

// Método HEAD para health checks más ligeros
export async function HEAD(request: NextRequest): Promise<NextResponse> {
  try {
    const memoryUsage = process.memoryUsage();
    const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
    
    // Quick health check - solo memoria
    const isHealthy = heapUsedMB < 1024; // Menos de 1GB usado
    
    return new NextResponse(null, {
      status: isHealthy ? 200 : 503,
      headers: {
        'X-Health-Status': isHealthy ? 'healthy' : 'unhealthy',
        'X-Memory-Usage': `${heapUsedMB.toFixed(2)}MB`,
        'Cache-Control': 'no-cache'
      }
    });
    
  } catch (error) {
    return new NextResponse(null, {
      status: 503,
      headers: {
        'X-Health-Status': 'error',
        'X-Health-Error': 'true'
      }
    });
  }
}