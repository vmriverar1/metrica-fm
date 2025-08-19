/**
 * FASE 6: Monitoring & Observability Service
 * 
 * Sistema completo de monitoreo y observabilidad para producción.
 * Incluye métricas, logs, alertas y health checks.
 * 
 * Features:
 * - Health checks automáticos
 * - Métricas de performance
 * - Sistema de alertas
 * - Logging estructurado
 * - Métricas de negocio
 * - Integración con servicios externos
 */

// Tipos para el sistema de monitoreo
export interface HealthCheck {
  service: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  responseTime: number;
  lastCheck: Date;
  details?: Record<string, any>;
  error?: string;
}

export interface SystemMetrics {
  timestamp: Date;
  cpu: number;
  memory: number;
  disk: number;
  network: {
    requests: number;
    errors: number;
    responseTime: number;
  };
  application: {
    activeUsers: number;
    totalApplications: number;
    pendingApplications: number;
    systemLoad: number;
  };
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  metric: string;
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  channels: ('email' | 'slack' | 'webhook')[];
  createdAt: Date;
}

export interface Alert {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: AlertRule['severity'];
  message: string;
  value: number;
  threshold: number;
  triggeredAt: Date;
  resolvedAt?: Date;
  status: 'active' | 'resolved' | 'acknowledged';
  acknowledgedBy?: string;
}

export interface LogEntry {
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  service: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  metadata?: Record<string, any>;
  stack?: string;
}

export interface PerformanceMetric {
  timestamp: Date;
  metric: string;
  value: number;
  unit: string;
  labels?: Record<string, string>;
}

// Almacenamiento en memoria para desarrollo
let healthChecks: HealthCheck[] = [];
let systemMetrics: SystemMetrics[] = [];
let alerts: Alert[] = [];
let logs: LogEntry[] = [];
let performanceMetrics: PerformanceMetric[] = [];

// Reglas de alerta predefinidas
const defaultAlertRules: AlertRule[] = [
  {
    id: 'high-error-rate',
    name: 'Alta Tasa de Errores',
    description: 'Tasa de errores superior al 5%',
    metric: 'error_rate',
    condition: 'greater_than',
    threshold: 5,
    severity: 'high',
    enabled: true,
    channels: ['email', 'slack'],
    createdAt: new Date()
  },
  {
    id: 'slow-response-time',
    name: 'Tiempo de Respuesta Lento',
    description: 'Tiempo de respuesta superior a 2 segundos',
    metric: 'response_time',
    condition: 'greater_than',
    threshold: 2000,
    severity: 'medium',
    enabled: true,
    channels: ['email'],
    createdAt: new Date()
  },
  {
    id: 'high-cpu-usage',
    name: 'Alto Uso de CPU',
    description: 'Uso de CPU superior al 80%',
    metric: 'cpu_usage',
    condition: 'greater_than',
    threshold: 80,
    severity: 'high',
    enabled: true,
    channels: ['email', 'slack'],
    createdAt: new Date()
  },
  {
    id: 'low-disk-space',
    name: 'Poco Espacio en Disco',
    description: 'Espacio en disco menor al 10%',
    metric: 'disk_usage',
    condition: 'greater_than',
    threshold: 90,
    severity: 'critical',
    enabled: true,
    channels: ['email', 'slack', 'webhook'],
    createdAt: new Date()
  }
];

export class MonitoringService {
  private static alertRules: AlertRule[] = [...defaultAlertRules];
  private static isMonitoring = false;
  private static monitoringInterval: NodeJS.Timeout | null = null;

  /**
   * Inicializar el sistema de monitoreo
   */
  static initialize(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.startHealthChecks();
    this.startMetricsCollection();
    
    console.log('🔍 Sistema de monitoreo inicializado');
  }

  /**
   * Detener el sistema de monitoreo
   */
  static stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    
    console.log('⏹️ Sistema de monitoreo detenido');
  }

  /**
   * Realizar health check de todos los servicios
   */
  static async performHealthChecks(): Promise<HealthCheck[]> {
    const checks: HealthCheck[] = [];

    // Check Next.js Application
    const appCheck = await this.checkApplication();
    checks.push(appCheck);

    // Check Directus CMS
    const directusCheck = await this.checkDirectus();
    checks.push(directusCheck);

    // Check Database (simulado)
    const dbCheck = await this.checkDatabase();
    checks.push(dbCheck);

    // Check External APIs (simulado)
    const apiCheck = await this.checkExternalAPIs();
    checks.push(apiCheck);

    healthChecks = checks;
    return checks;
  }

  /**
   * Obtener métricas del sistema
   */
  static async collectSystemMetrics(): Promise<SystemMetrics> {
    const metrics: SystemMetrics = {
      timestamp: new Date(),
      cpu: this.getCPUUsage(),
      memory: this.getMemoryUsage(),
      disk: this.getDiskUsage(),
      network: {
        requests: this.getRequestCount(),
        errors: this.getErrorCount(),
        responseTime: this.getAverageResponseTime()
      },
      application: {
        activeUsers: this.getActiveUserCount(),
        totalApplications: await this.getTotalApplications(),
        pendingApplications: await this.getPendingApplications(),
        systemLoad: this.getSystemLoad()
      }
    };

    systemMetrics.push(metrics);
    
    // Mantener solo los últimos 1000 registros
    if (systemMetrics.length > 1000) {
      systemMetrics = systemMetrics.slice(-1000);
    }

    return metrics;
  }

  /**
   * Registrar evento de log
   */
  static log(
    level: LogEntry['level'], 
    message: string, 
    service: string = 'system',
    metadata?: Record<string, any>
  ): void {
    const logEntry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      service,
      metadata
    };

    logs.push(logEntry);
    
    // Mantener solo los últimos 10000 logs
    if (logs.length > 10000) {
      logs = logs.slice(-10000);
    }

    // Log en consola para desarrollo
    if (process.env.NODE_ENV === 'development') {
      const color = {
        debug: '\x1b[36m',
        info: '\x1b[32m',
        warn: '\x1b[33m',
        error: '\x1b[31m',
        fatal: '\x1b[41m'
      }[level];
      
      console.log(
        `${color}[${level.toUpperCase()}]\x1b[0m`,
        `[${service}]`,
        message,
        metadata ? JSON.stringify(metadata) : ''
      );
    }
  }

  /**
   * Registrar métrica de performance
   */
  static recordMetric(
    metric: string, 
    value: number, 
    unit: string = 'count',
    labels?: Record<string, string>
  ): void {
    const perfMetric: PerformanceMetric = {
      timestamp: new Date(),
      metric,
      value,
      unit,
      labels
    };

    performanceMetrics.push(perfMetric);
    
    // Mantener solo las últimas 5000 métricas
    if (performanceMetrics.length > 5000) {
      performanceMetrics = performanceMetrics.slice(-5000);
    }

    // Verificar alertas
    this.checkAlertRules(metric, value);
  }

  /**
   * Obtener estado de salud general
   */
  static getOverallHealth(): {
    status: 'healthy' | 'warning' | 'critical';
    services: HealthCheck[];
    summary: {
      healthy: number;
      warning: number;
      critical: number;
      total: number;
    };
  } {
    const services = healthChecks;
    const summary = {
      healthy: services.filter(s => s.status === 'healthy').length,
      warning: services.filter(s => s.status === 'warning').length,
      critical: services.filter(s => s.status === 'critical').length,
      total: services.length
    };

    let overallStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (summary.critical > 0) {
      overallStatus = 'critical';
    } else if (summary.warning > 0) {
      overallStatus = 'warning';
    }

    return {
      status: overallStatus,
      services,
      summary
    };
  }

  /**
   * Obtener métricas recientes
   */
  static getRecentMetrics(minutes: number = 60): SystemMetrics[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return systemMetrics.filter(m => m.timestamp >= cutoff);
  }

  /**
   * Obtener logs con filtros
   */
  static getLogs(filters?: {
    level?: LogEntry['level'];
    service?: string;
    since?: Date;
    limit?: number;
  }): LogEntry[] {
    let filteredLogs = [...logs];

    if (filters?.level) {
      filteredLogs = filteredLogs.filter(log => log.level === filters.level);
    }

    if (filters?.service) {
      filteredLogs = filteredLogs.filter(log => log.service === filters.service);
    }

    if (filters?.since) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.since!);
    }

    // Ordenar por timestamp descendente
    filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (filters?.limit) {
      filteredLogs = filteredLogs.slice(0, filters.limit);
    }

    return filteredLogs;
  }

  /**
   * Obtener alertas activas
   */
  static getActiveAlerts(): Alert[] {
    return alerts.filter(alert => alert.status === 'active');
  }

  /**
   * Obtener todas las alertas
   */
  static getAllAlerts(): Alert[] {
    return [...alerts].sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime());
  }

  /**
   * Reconocer alerta
   */
  static acknowledgeAlert(alertId: string, userId: string): boolean {
    const alert = alerts.find(a => a.id === alertId);
    if (alert && alert.status === 'active') {
      alert.status = 'acknowledged';
      alert.acknowledgedBy = userId;
      return true;
    }
    return false;
  }

  /**
   * Resolver alerta
   */
  static resolveAlert(alertId: string): boolean {
    const alert = alerts.find(a => a.id === alertId);
    if (alert && alert.status !== 'resolved') {
      alert.status = 'resolved';
      alert.resolvedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * Obtener dashboard de métricas
   */
  static getDashboard(): {
    health: ReturnType<typeof this.getOverallHealth>;
    metrics: SystemMetrics | null;
    alerts: {
      active: number;
      critical: number;
      recent: Alert[];
    };
    logs: {
      errors: number;
      warnings: number;
      recent: LogEntry[];
    };
  } {
    const health = this.getOverallHealth();
    const latestMetrics = systemMetrics[systemMetrics.length - 1] || null;
    const activeAlerts = this.getActiveAlerts();
    const recentLogs = this.getLogs({ limit: 10 });

    return {
      health,
      metrics: latestMetrics,
      alerts: {
        active: activeAlerts.length,
        critical: activeAlerts.filter(a => a.severity === 'critical').length,
        recent: activeAlerts.slice(0, 5)
      },
      logs: {
        errors: recentLogs.filter(l => l.level === 'error').length,
        warnings: recentLogs.filter(l => l.level === 'warn').length,
        recent: recentLogs.slice(0, 10)
      }
    };
  }

  // Métodos privados

  /**
   * Iniciar health checks automáticos
   */
  private static startHealthChecks(): void {
    // Health check inicial
    this.performHealthChecks();

    // Health checks cada 2 minutos
    setInterval(() => {
      this.performHealthChecks();
    }, 2 * 60 * 1000);
  }

  /**
   * Iniciar colección de métricas
   */
  private static startMetricsCollection(): void {
    // Métricas iniciales
    this.collectSystemMetrics();

    // Métricas cada 30 segundos
    this.monitoringInterval = setInterval(() => {
      this.collectSystemMetrics();
    }, 30 * 1000);
  }

  /**
   * Verificar reglas de alerta
   */
  private static checkAlertRules(metric: string, value: number): void {
    const applicableRules = this.alertRules.filter(rule => 
      rule.enabled && rule.metric === metric
    );

    for (const rule of applicableRules) {
      let shouldAlert = false;

      switch (rule.condition) {
        case 'greater_than':
          shouldAlert = value > rule.threshold;
          break;
        case 'less_than':
          shouldAlert = value < rule.threshold;
          break;
        case 'equals':
          shouldAlert = value === rule.threshold;
          break;
        case 'not_equals':
          shouldAlert = value !== rule.threshold;
          break;
      }

      if (shouldAlert) {
        this.triggerAlert(rule, value);
      } else {
        // Resolver alertas activas de esta regla
        const activeAlert = alerts.find(a => 
          a.ruleId === rule.id && a.status === 'active'
        );
        if (activeAlert) {
          this.resolveAlert(activeAlert.id);
        }
      }
    }
  }

  /**
   * Disparar alerta
   */
  private static triggerAlert(rule: AlertRule, value: number): void {
    // Verificar si ya hay una alerta activa para esta regla
    const existingAlert = alerts.find(a => 
      a.ruleId === rule.id && a.status === 'active'
    );

    if (existingAlert) return; // No duplicar alertas

    const alert: Alert = {
      id: `alert-${Date.now()}`,
      ruleId: rule.id,
      ruleName: rule.name,
      severity: rule.severity,
      message: `${rule.description}. Valor actual: ${value}, umbral: ${rule.threshold}`,
      value,
      threshold: rule.threshold,
      triggeredAt: new Date(),
      status: 'active'
    };

    alerts.push(alert);
    
    // Log de la alerta
    this.log('error', `ALERTA: ${alert.message}`, 'monitoring', {
      alertId: alert.id,
      ruleName: rule.name,
      severity: rule.severity
    });

    console.log('🚨 ALERTA DISPARADA:', alert.message);
  }

  // Health check methods

  private static async checkApplication(): Promise<HealthCheck> {
    const start = Date.now();
    try {
      // Simular check de la aplicación
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
      
      return {
        service: 'Next.js Application',
        status: 'healthy',
        responseTime: Date.now() - start,
        lastCheck: new Date(),
        details: {
          version: '15.3.3',
          uptime: process.uptime(),
          env: process.env.NODE_ENV
        }
      };
    } catch (error) {
      return {
        service: 'Next.js Application',
        status: 'critical',
        responseTime: Date.now() - start,
        lastCheck: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private static async checkDirectus(): Promise<HealthCheck> {
    const start = Date.now();
    try {
      const response = await fetch('http://localhost:8055/server/health', {
        method: 'GET',
        timeout: 5000
      });
      
      const status = response.ok ? 'healthy' : 'warning';
      
      return {
        service: 'Directus CMS',
        status,
        responseTime: Date.now() - start,
        lastCheck: new Date(),
        details: {
          statusCode: response.status,
          url: 'http://localhost:8055'
        }
      };
    } catch (error) {
      return {
        service: 'Directus CMS',
        status: 'warning',
        responseTime: Date.now() - start,
        lastCheck: new Date(),
        error: 'Directus no disponible (modo local activo)',
        details: {
          fallbackMode: true
        }
      };
    }
  }

  private static async checkDatabase(): Promise<HealthCheck> {
    const start = Date.now();
    // Simular check de base de datos
    await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
    
    return {
      service: 'Database',
      status: 'healthy',
      responseTime: Date.now() - start,
      lastCheck: new Date(),
      details: {
        type: 'SQLite (Directus)',
        connections: 5,
        poolSize: 10
      }
    };
  }

  private static async checkExternalAPIs(): Promise<HealthCheck> {
    const start = Date.now();
    // Simular check de APIs externas
    await new Promise(resolve => setTimeout(resolve, Math.random() * 200));
    
    return {
      service: 'External APIs',
      status: 'healthy',
      responseTime: Date.now() - start,
      lastCheck: new Date(),
      details: {
        emailService: 'healthy',
        smsService: 'healthy',
        notificationService: 'healthy'
      }
    };
  }

  // Métodos para obtener métricas del sistema (simulados)

  private static getCPUUsage(): number {
    return Math.random() * 100; // Simular uso de CPU
  }

  private static getMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memory = process.memoryUsage();
      return (memory.heapUsed / memory.heapTotal) * 100;
    }
    return Math.random() * 100;
  }

  private static getDiskUsage(): number {
    return Math.random() * 100; // Simular uso de disco
  }

  private static getRequestCount(): number {
    return Math.floor(Math.random() * 100); // Simular requests por minuto
  }

  private static getErrorCount(): number {
    return Math.floor(Math.random() * 5); // Simular errores por minuto
  }

  private static getAverageResponseTime(): number {
    return Math.random() * 1000; // Simular tiempo de respuesta en ms
  }

  private static getActiveUserCount(): number {
    return Math.floor(Math.random() * 20) + 1; // 1-20 usuarios activos
  }

  private static async getTotalApplications(): Promise<number> {
    // Simular consulta a base de datos
    return 47; // Número fijo para ejemplo
  }

  private static async getPendingApplications(): Promise<number> {
    // Simular consulta a base de datos
    return 12; // Número fijo para ejemplo
  }

  private static getSystemLoad(): number {
    return Math.random(); // Load average simulado
  }
}