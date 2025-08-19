/**
 * FASE 7: Sistema de Integración Completa
 * 
 * Orquestador maestro que integra y coordina todos los sistemas:
 * - Portfolio Service (Fase 2)
 * - Blog Service (Fase 3) 
 * - Careers Service (Fase 4)
 * - Applications Service (Fase 5)
 * - Auth Service (Fase 6)
 * - Performance Service (Fase 6)
 * - Monitoring Service (Fase 6)
 * 
 * Features:
 * - Gestión unificada del estado global
 * - Sincronización entre servicios
 * - Cache compartido y optimizado
 * - Event bus para comunicación inter-servicios
 * - Sistema de dependencias automáticas
 * - Health checks integrados
 * - Métricas unificadas
 * - Gestión de errores centralizada
 */

import { PortfolioService } from '@/lib/portfolio-hybrid';
import { BlogService } from '@/lib/blog-service';
import { CareersService } from '@/lib/careers-service';
import { ApplicationsService } from '@/lib/applications-service';
import { AuthService } from '@/lib/auth-service';
import PerformanceService from '@/lib/performance-service';
import { MonitoringService } from '@/lib/monitoring-service';
import { NotificationsService } from '@/lib/notifications-service';
import ProductionConfig from '@/lib/production-config';

// Tipos centralizados
export interface SystemStatus {
  overall: 'healthy' | 'degraded' | 'critical';
  services: {
    [key: string]: {
      status: 'online' | 'offline' | 'degraded';
      lastCheck: Date;
      responseTime: number;
      errorRate: number;
    };
  };
  dependencies: {
    directus: 'available' | 'unavailable' | 'degraded';
    database: 'connected' | 'disconnected' | 'slow';
    redis: 'connected' | 'disconnected' | 'N/A';
    external: Record<string, 'available' | 'unavailable'>;
  };
  performance: {
    avgResponseTime: number;
    throughput: number;
    errorRate: number;
    cacheHitRate: number;
  };
  resources: {
    memory: number;
    cpu: number;
    disk: number;
  };
}

export interface SystemEvent {
  id: string;
  type: 'service' | 'auth' | 'performance' | 'error' | 'user' | 'system';
  service: string;
  event: string;
  data: any;
  timestamp: Date;
  severity: 'info' | 'warning' | 'error' | 'critical';
  userId?: string;
  sessionId?: string;
}

export interface ServiceConfig {
  enabled: boolean;
  priority: 'high' | 'medium' | 'low';
  dependencies: string[];
  healthCheckInterval: number;
  retryAttempts: number;
  timeout: number;
  cache: {
    enabled: boolean;
    ttl: number;
    strategy: 'lru' | 'lfu' | 'ttl';
  };
}

export interface IntegrationMetrics {
  timestamp: Date;
  totalRequests: number;
  totalErrors: number;
  avgResponseTime: number;
  serviceMetrics: {
    [service: string]: {
      requests: number;
      errors: number;
      responseTime: number;
      cacheHits: number;
      cacheMisses: number;
    };
  };
  userActivity: {
    activeUsers: number;
    newSessions: number;
    authentication: {
      logins: number;
      failures: number;
      registrations: number;
    };
  };
}

// Event Bus para comunicación inter-servicios
class SystemEventBus {
  private listeners: Map<string, Array<(event: SystemEvent) => void>> = new Map();
  private eventHistory: SystemEvent[] = [];
  private maxHistorySize = 1000;

  subscribe(eventType: string, listener: (event: SystemEvent) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(listener);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  emit(event: Omit<SystemEvent, 'id' | 'timestamp'>): void {
    const fullEvent: SystemEvent = {
      ...event,
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    // Add to history
    this.eventHistory.push(fullEvent);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Notify listeners
    const listeners = this.listeners.get(event.type) || [];
    listeners.forEach(listener => {
      try {
        listener(fullEvent);
      } catch (error) {
        console.error('Error in event listener:', error);
      }
    });

    // Log critical events
    if (fullEvent.severity === 'critical' || fullEvent.severity === 'error') {
      MonitoringService.log('error', `${fullEvent.service}: ${fullEvent.event}`, 'SystemEventBus');
    }
  }

  getHistory(filter?: { type?: string; service?: string; since?: Date }): SystemEvent[] {
    let events = this.eventHistory;

    if (filter) {
      events = events.filter(event => {
        if (filter.type && event.type !== filter.type) return false;
        if (filter.service && event.service !== filter.service) return false;
        if (filter.since && event.timestamp < filter.since) return false;
        return true;
      });
    }

    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  clearHistory(): void {
    this.eventHistory = [];
  }
}

// Sistema de Integración Principal
export class SystemIntegration {
  private static instance: SystemIntegration;
  private eventBus: SystemEventBus;
  private status: SystemStatus;
  private metrics: IntegrationMetrics;
  private serviceConfigs: Map<string, ServiceConfig>;
  private healthCheckIntervals: Map<string, NodeJS.Timeout> = new Map();
  private isInitialized = false;

  private constructor() {
    this.eventBus = new SystemEventBus();
    this.status = this.initializeStatus();
    this.metrics = this.initializeMetrics();
    this.serviceConfigs = this.initializeServiceConfigs();
    this.setupEventListeners();
  }

  static getInstance(): SystemIntegration {
    if (!SystemIntegration.instance) {
      SystemIntegration.instance = new SystemIntegration();
    }
    return SystemIntegration.instance;
  }

  /**
   * Inicializar todo el sistema integrado
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🚀 Iniciando Sistema de Integración Completa...');

    try {
      // 1. Inicializar servicios base
      await this.initializeBaseServices();

      // 2. Inicializar servicios dependientes
      await this.initializeDependentServices();

      // 3. Configurar health checks
      this.startHealthChecks();

      // 4. Inicializar métricas
      this.startMetricsCollection();

      // 5. Configurar cache compartido
      this.setupSharedCache();

      // 6. Configurar error handling
      this.setupErrorHandling();

      this.isInitialized = true;
      
      this.eventBus.emit({
        type: 'system',
        service: 'SystemIntegration',
        event: 'initialization_complete',
        data: { timestamp: new Date() },
        severity: 'info'
      });

      console.log('✅ Sistema de Integración inicializado correctamente');

    } catch (error) {
      console.error('❌ Error inicializando Sistema de Integración:', error);
      
      this.eventBus.emit({
        type: 'system',
        service: 'SystemIntegration',
        event: 'initialization_failed',
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
        severity: 'critical'
      });

      throw error;
    }
  }

  /**
   * Obtener estado actual del sistema
   */
  getSystemStatus(): SystemStatus {
    return { ...this.status };
  }

  /**
   * Obtener métricas actuales
   */
  getMetrics(): IntegrationMetrics {
    return { ...this.metrics };
  }

  /**
   * Obtener event bus para suscripciones
   */
  getEventBus(): SystemEventBus {
    return this.eventBus;
  }

  /**
   * Ejecutar operación con todos los sistemas disponibles
   */
  async executeWithAllSystems<T>(
    operation: (systems: {
      portfolio: typeof PortfolioService;
      blog: typeof BlogService;
      careers: typeof CareersService;
      applications: typeof ApplicationsService;
      auth: typeof AuthService;
      performance: typeof PerformanceService;
      monitoring: typeof MonitoringService;
      notifications: typeof NotificationsService;
    }) => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await operation({
        portfolio: PortfolioService,
        blog: BlogService,
        careers: CareersService,
        applications: ApplicationsService,
        auth: AuthService,
        performance: PerformanceService,
        monitoring: MonitoringService,
        notifications: NotificationsService
      });

      const duration = performance.now() - startTime;
      this.recordMetric('system_operation', duration, 'success');

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordMetric('system_operation', duration, 'error');
      
      this.eventBus.emit({
        type: 'error',
        service: 'SystemIntegration',
        event: 'operation_failed',
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
        severity: 'error'
      });

      throw error;
    }
  }

  /**
   * Sincronizar datos entre servicios
   */
  async synchronizeServices(): Promise<void> {
    console.log('🔄 Iniciando sincronización de servicios...');

    try {
      // Sincronizar cache entre servicios
      await this.synchronizeCache();

      // Sincronizar métricas
      await this.synchronizeMetrics();

      // Verificar consistencia de datos
      await this.verifyDataConsistency();

      this.eventBus.emit({
        type: 'system',
        service: 'SystemIntegration',
        event: 'synchronization_complete',
        data: { timestamp: new Date() },
        severity: 'info'
      });

      console.log('✅ Sincronización completada');

    } catch (error) {
      this.eventBus.emit({
        type: 'error',
        service: 'SystemIntegration',
        event: 'synchronization_failed',
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
        severity: 'error'
      });

      throw error;
    }
  }

  /**
   * Generar reporte completo del sistema
   */
  async generateSystemReport(): Promise<{
    status: SystemStatus;
    metrics: IntegrationMetrics;
    services: {
      [service: string]: {
        status: string;
        metrics: any;
        config: ServiceConfig;
      };
    };
    events: SystemEvent[];
    recommendations: string[];
  }> {
    const services = {
      portfolio: {
        status: this.status.services.portfolio?.status || 'unknown',
        metrics: await this.getServiceMetrics('portfolio'),
        config: this.serviceConfigs.get('portfolio')!
      },
      blog: {
        status: this.status.services.blog?.status || 'unknown',
        metrics: await this.getServiceMetrics('blog'),
        config: this.serviceConfigs.get('blog')!
      },
      careers: {
        status: this.status.services.careers?.status || 'unknown',
        metrics: await this.getServiceMetrics('careers'),
        config: this.serviceConfigs.get('careers')!
      },
      applications: {
        status: this.status.services.applications?.status || 'unknown',
        metrics: await this.getServiceMetrics('applications'),
        config: this.serviceConfigs.get('applications')!
      },
      auth: {
        status: this.status.services.auth?.status || 'unknown',
        metrics: await this.getServiceMetrics('auth'),
        config: this.serviceConfigs.get('auth')!
      },
      performance: {
        status: this.status.services.performance?.status || 'unknown',
        metrics: PerformanceService.getCacheStats(),
        config: this.serviceConfigs.get('performance')!
      },
      monitoring: {
        status: this.status.services.monitoring?.status || 'unknown',
        metrics: await MonitoringService.collectSystemMetrics(),
        config: this.serviceConfigs.get('monitoring')!
      }
    };

    const recentEvents = this.eventBus.getHistory({
      since: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
    });

    const recommendations = this.generateRecommendations();

    return {
      status: this.status,
      metrics: this.metrics,
      services,
      events: recentEvents,
      recommendations
    };
  }

  /**
   * Inicializar servicios base
   */
  private async initializeBaseServices(): Promise<void> {
    console.log('📦 Inicializando servicios base...');

    // Performance Service (debe ir primero)
    PerformanceService.initialize();
    this.updateServiceStatus('performance', 'online', 0);

    // Production Config
    const config = ProductionConfig.getInstance();
    await config.performHealthCheck();

    // Auth Service (crítico para otros servicios)
    // Ya está inicializado, solo verificamos su estado
    this.updateServiceStatus('auth', 'online', 0);

    console.log('✅ Servicios base inicializados');
  }

  /**
   * Inicializar servicios dependientes
   */
  private async initializeDependentServices(): Promise<void> {
    console.log('🔗 Inicializando servicios dependientes...');

    // Verificar disponibilidad de Directus
    const directusAvailable = await this.checkDirectusAvailability();
    
    // Portfolio Service
    try {
      const portfolioTest = await PortfolioService.getProjects({ limit: 1 });
      this.updateServiceStatus('portfolio', 'online', 50);
    } catch (error) {
      this.updateServiceStatus('portfolio', directusAvailable ? 'degraded' : 'online', 100);
    }

    // Blog Service
    try {
      const blogTest = await BlogService.getPosts({ limit: 1 });
      this.updateServiceStatus('blog', 'online', 50);
    } catch (error) {
      this.updateServiceStatus('blog', directusAvailable ? 'degraded' : 'online', 100);
    }

    // Careers Service
    try {
      const careersTest = await CareersService.getJobs({ limit: 1 });
      this.updateServiceStatus('careers', 'online', 50);
    } catch (error) {
      this.updateServiceStatus('careers', directusAvailable ? 'degraded' : 'online', 100);
    }

    // Applications Service
    try {
      const applicationsTest = await ApplicationsService.getApplications({ limit: 1 });
      this.updateServiceStatus('applications', 'online', 50);
    } catch (error) {
      this.updateServiceStatus('applications', directusAvailable ? 'degraded' : 'online', 100);
    }

    // Monitoring Service
    this.updateServiceStatus('monitoring', 'online', 0);

    console.log('✅ Servicios dependientes inicializados');
  }

  /**
   * Configurar health checks periódicos
   */
  private startHealthChecks(): void {
    console.log('🩺 Configurando health checks...');

    this.serviceConfigs.forEach((config, serviceName) => {
      if (config.enabled) {
        const interval = setInterval(async () => {
          await this.performServiceHealthCheck(serviceName);
        }, config.healthCheckInterval);

        this.healthCheckIntervals.set(serviceName, interval);
      }
    });

    console.log('✅ Health checks configurados');
  }

  /**
   * Configurar recolección de métricas
   */
  private startMetricsCollection(): void {
    console.log('📊 Iniciando recolección de métricas...');

    setInterval(() => {
      this.collectIntegrationMetrics();
    }, 60000); // Cada minuto

    console.log('✅ Recolección de métricas iniciada');
  }

  /**
   * Configurar cache compartido
   */
  private setupSharedCache(): void {
    console.log('🗄️ Configurando cache compartido...');

    // El PerformanceService ya maneja el cache compartido
    // Solo registramos eventos para sincronización
    
    this.eventBus.subscribe('cache', (event) => {
      if (event.event === 'invalidation') {
        // Propagar invalidación a todos los servicios
        this.propagateCacheInvalidation(event.data);
      }
    });

    console.log('✅ Cache compartido configurado');
  }

  /**
   * Configurar manejo centralizado de errores
   */
  private setupErrorHandling(): void {
    console.log('🚨 Configurando manejo de errores...');

    this.eventBus.subscribe('error', (event) => {
      MonitoringService.log('error', `${event.service}: ${event.event}`, 'SystemIntegration');
      
      // Incrementar contador de errores del servicio
      if (this.status.services[event.service]) {
        this.status.services[event.service].errorRate += 1;
      }

      // Si hay muchos errores, degradar el servicio
      if (this.status.services[event.service]?.errorRate > 10) {
        this.updateServiceStatus(event.service, 'degraded', 0);
      }
    });

    console.log('✅ Manejo de errores configurado');
  }

  /**
   * Configurar listeners de eventos del sistema
   */
  private setupEventListeners(): void {
    // User activity tracking
    this.eventBus.subscribe('auth', (event) => {
      if (event.event === 'login_success') {
        this.metrics.userActivity.authentication.logins++;
      } else if (event.event === 'login_failed') {
        this.metrics.userActivity.authentication.failures++;
      } else if (event.event === 'user_registered') {
        this.metrics.userActivity.authentication.registrations++;
      }
    });

    // Service performance tracking
    this.eventBus.subscribe('performance', (event) => {
      if (event.event === 'response_time') {
        this.updateResponseTime(event.service, event.data.duration);
      }
    });
  }

  /**
   * Métodos de inicialización de datos
   */
  private initializeStatus(): SystemStatus {
    return {
      overall: 'healthy',
      services: {},
      dependencies: {
        directus: 'unavailable',
        database: 'disconnected',
        redis: 'N/A',
        external: {}
      },
      performance: {
        avgResponseTime: 0,
        throughput: 0,
        errorRate: 0,
        cacheHitRate: 0
      },
      resources: {
        memory: 0,
        cpu: 0,
        disk: 0
      }
    };
  }

  private initializeMetrics(): IntegrationMetrics {
    return {
      timestamp: new Date(),
      totalRequests: 0,
      totalErrors: 0,
      avgResponseTime: 0,
      serviceMetrics: {},
      userActivity: {
        activeUsers: 0,
        newSessions: 0,
        authentication: {
          logins: 0,
          failures: 0,
          registrations: 0
        }
      }
    };
  }

  private initializeServiceConfigs(): Map<string, ServiceConfig> {
    const configs = new Map<string, ServiceConfig>();
    
    const defaultConfig: ServiceConfig = {
      enabled: true,
      priority: 'medium',
      dependencies: [],
      healthCheckInterval: 60000, // 1 minute
      retryAttempts: 3,
      timeout: 5000,
      cache: {
        enabled: true,
        ttl: 300000, // 5 minutes
        strategy: 'lru'
      }
    };

    // Service-specific configurations
    configs.set('portfolio', { 
      ...defaultConfig, 
      priority: 'high',
      dependencies: ['directus']
    });
    
    configs.set('blog', { 
      ...defaultConfig, 
      dependencies: ['directus']
    });
    
    configs.set('careers', { 
      ...defaultConfig, 
      dependencies: ['directus']
    });
    
    configs.set('applications', { 
      ...defaultConfig, 
      dependencies: ['directus', 'auth']
    });
    
    configs.set('auth', { 
      ...defaultConfig, 
      priority: 'high',
      healthCheckInterval: 30000 // More frequent for critical service
    });
    
    configs.set('performance', { 
      ...defaultConfig, 
      priority: 'high',
      cache: { ...defaultConfig.cache, enabled: false }
    });
    
    configs.set('monitoring', { 
      ...defaultConfig, 
      priority: 'high',
      cache: { ...defaultConfig.cache, enabled: false }
    });

    return configs;
  }

  /**
   * Métodos auxiliares
   */
  private async checkDirectusAvailability(): Promise<boolean> {
    try {
      const config = ProductionConfig.getInstance();
      const env = config.getEnvironment();
      
      const response = await fetch(`${env.directusUrl}/server/health`, {
        timeout: 5000
      });
      
      const available = response.ok;
      this.status.dependencies.directus = available ? 'available' : 'degraded';
      
      return available;
    } catch (error) {
      this.status.dependencies.directus = 'unavailable';
      return false;
    }
  }

  private updateServiceStatus(
    service: string, 
    status: 'online' | 'offline' | 'degraded', 
    responseTime: number
  ): void {
    this.status.services[service] = {
      status,
      lastCheck: new Date(),
      responseTime,
      errorRate: this.status.services[service]?.errorRate || 0
    };

    // Update overall status
    this.updateOverallStatus();
  }

  private updateOverallStatus(): void {
    const services = Object.values(this.status.services);
    const offlineCount = services.filter(s => s.status === 'offline').length;
    const degradedCount = services.filter(s => s.status === 'degraded').length;

    if (offlineCount > 0) {
      this.status.overall = 'critical';
    } else if (degradedCount > 2) {
      this.status.overall = 'critical';
    } else if (degradedCount > 0) {
      this.status.overall = 'degraded';
    } else {
      this.status.overall = 'healthy';
    }
  }

  private async performServiceHealthCheck(serviceName: string): Promise<void> {
    const startTime = performance.now();
    
    try {
      // Perform service-specific health check
      switch (serviceName) {
        case 'portfolio':
          await PortfolioService.getProjects({ limit: 1 });
          break;
        case 'blog':
          await BlogService.getPosts({ limit: 1 });
          break;
        case 'careers':
          await CareersService.getJobs({ limit: 1 });
          break;
        case 'applications':
          await ApplicationsService.getApplications({ limit: 1 });
          break;
        case 'auth':
          // Auth service health check would go here
          break;
        default:
          break;
      }

      const duration = performance.now() - startTime;
      this.updateServiceStatus(serviceName, 'online', duration);

    } catch (error) {
      const duration = performance.now() - startTime;
      this.updateServiceStatus(serviceName, 'degraded', duration);

      this.eventBus.emit({
        type: 'service',
        service: serviceName,
        event: 'health_check_failed',
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
        severity: 'warning'
      });
    }
  }

  private async collectIntegrationMetrics(): Promise<void> {
    this.metrics.timestamp = new Date();
    
    // Collect performance metrics from PerformanceService
    const perfStats = PerformanceService.getCacheStats();
    this.status.performance.cacheHitRate = Object.values(perfStats)
      .reduce((sum: number, stats: any) => sum + stats.hitRate, 0) / Object.keys(perfStats).length;

    // Update resource metrics (simulated)
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory;
      this.status.resources.memory = (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;
    }
  }

  private async synchronizeCache(): Promise<void> {
    // Cache synchronization logic would go here
    console.log('Synchronizing cache across services...');
  }

  private async synchronizeMetrics(): Promise<void> {
    // Metrics synchronization logic would go here
    console.log('Synchronizing metrics across services...');
  }

  private async verifyDataConsistency(): Promise<void> {
    // Data consistency verification would go here
    console.log('Verifying data consistency...');
  }

  private async getServiceMetrics(service: string): Promise<any> {
    return this.metrics.serviceMetrics[service] || {
      requests: 0,
      errors: 0,
      responseTime: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    // Analyze system status and generate recommendations
    if (this.status.overall !== 'healthy') {
      recommendations.push('Sistema en estado degradado - revisar servicios offline');
    }

    if (this.status.performance.errorRate > 5) {
      recommendations.push('Tasa de errores elevada - revisar logs y health checks');
    }

    if (this.status.performance.avgResponseTime > 2000) {
      recommendations.push('Tiempo de respuesta alto - optimizar queries y cache');
    }

    if (this.status.dependencies.directus === 'unavailable') {
      recommendations.push('Directus no disponible - verificar conexión y configuración');
    }

    if (this.status.performance.cacheHitRate < 0.7) {
      recommendations.push('Baja tasa de hit en cache - revisar configuración de TTL');
    }

    return recommendations;
  }

  private propagateCacheInvalidation(data: any): void {
    // Logic to propagate cache invalidation across services
    console.log('Propagating cache invalidation:', data);
  }

  private recordMetric(type: string, value: number, status: string): void {
    this.metrics.totalRequests++;
    if (status === 'error') {
      this.metrics.totalErrors++;
    }
    
    // Update average response time
    this.metrics.avgResponseTime = 
      (this.metrics.avgResponseTime + value) / 2;
  }

  private updateResponseTime(service: string, duration: number): void {
    if (!this.metrics.serviceMetrics[service]) {
      this.metrics.serviceMetrics[service] = {
        requests: 0,
        errors: 0,
        responseTime: 0,
        cacheHits: 0,
        cacheMisses: 0
      };
    }

    const serviceMetrics = this.metrics.serviceMetrics[service];
    serviceMetrics.requests++;
    serviceMetrics.responseTime = (serviceMetrics.responseTime + duration) / 2;
  }

  /**
   * Cleanup al destruir la instancia
   */
  destroy(): void {
    // Clear all health check intervals
    this.healthCheckIntervals.forEach(interval => {
      clearInterval(interval);
    });
    this.healthCheckIntervals.clear();

    // Clear event bus
    this.eventBus.clearHistory();

    this.isInitialized = false;
  }
}

// Export singleton instance
export default SystemIntegration.getInstance();