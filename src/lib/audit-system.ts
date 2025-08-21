/**
 * FASE 4: Version Control & Audit System
 * 
 * Sistema completo de auditoría y control de versiones integrado
 * con el sistema CRUD para home.json y otras páginas estáticas.
 */

interface AuditEntry {
  id: string;
  timestamp: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'restore' | 'import' | 'export';
  user: {
    id: string;
    name: string;
    email: string;
    ip?: string;
    userAgent?: string;
  };
  changes: {
    before?: any;
    after?: any;
    fields: string[];
    summary: {
      added: number;
      modified: number;
      deleted: number;
    };
  };
  metadata: {
    version: string;
    size: number;
    checksum: string;
    tags?: string[];
    message?: string;
    source?: 'manual' | 'automatic' | 'import' | 'restore';
  };
  context?: {
    sessionId?: string;
    correlationId?: string;
    parentId?: string;
  };
}

interface AuditConfig {
  enableAudit: boolean;
  maxEntries: number;
  retentionDays: number;
  sensitiveFields: string[];
  autoBackup: boolean;
  storage: 'localStorage' | 'indexedDB' | 'api';
}

export class AuditLogger {
  private config: AuditConfig;
  private storageKey: string;

  constructor(config: Partial<AuditConfig> = {}) {
    this.config = {
      enableAudit: true,
      maxEntries: 1000,
      retentionDays: 90,
      sensitiveFields: ['password', 'token', 'secret', 'key'],
      autoBackup: true,
      storage: 'localStorage',
      ...config
    };
    this.storageKey = 'metrica_audit_log';
  }

  async log(entry: Omit<AuditEntry, 'id' | 'timestamp'>): Promise<void> {
    if (!this.config.enableAudit) return;

    const auditEntry: AuditEntry = {
      ...entry,
      id: this.generateId(),
      timestamp: new Date().toISOString()
    };

    // Sanitize sensitive data
    auditEntry.changes.before = this.sanitizeData(auditEntry.changes.before);
    auditEntry.changes.after = this.sanitizeData(auditEntry.changes.after);

    // Store entry
    await this.storeEntry(auditEntry);

    // Cleanup old entries
    await this.cleanup();

    // Auto-backup if enabled
    if (this.config.autoBackup && entry.action === 'update') {
      await this.createBackup(entry.resource, auditEntry.changes.after);
    }
  }

  async getHistory(resource: string, limit = 50): Promise<AuditEntry[]> {
    const entries = await this.getAllEntries();
    return entries
      .filter(entry => entry.resource === resource)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async getVersion(resource: string, version: string): Promise<AuditEntry | null> {
    const entries = await this.getAllEntries();
    return entries.find(entry => 
      entry.resource === resource && entry.metadata.version === version
    ) || null;
  }

  async rollback(resource: string, version: string, user: AuditEntry['user']): Promise<any> {
    const targetEntry = await this.getVersion(resource, version);
    if (!targetEntry) {
      throw new Error(`Version ${version} not found for resource ${resource}`);
    }

    const currentData = await this.getCurrentData(resource);
    
    // Log the rollback action
    await this.log({
      resource,
      action: 'restore',
      user,
      changes: {
        before: currentData,
        after: targetEntry.changes.after,
        fields: this.getChangedFields(currentData, targetEntry.changes.after),
        summary: this.calculateChangeSummary(currentData, targetEntry.changes.after)
      },
      metadata: {
        version: this.generateVersion(),
        size: this.calculateSize(targetEntry.changes.after),
        checksum: await this.generateChecksum(targetEntry.changes.after),
        message: `Rollback to version ${version}`,
        source: 'restore'
      }
    });

    return targetEntry.changes.after;
  }

  private async storeEntry(entry: AuditEntry): Promise<void> {
    const entries = await this.getAllEntries();
    entries.push(entry);
    localStorage.setItem(this.storageKey, JSON.stringify(entries));
  }

  private async getAllEntries(): Promise<AuditEntry[]> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading audit log:', error);
      return [];
    }
  }

  private async getCurrentData(resource: string): Promise<any> {
    try {
      const response = await fetch(`/api/admin/pages/${resource.replace('.json', '')}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error fetching current data:', error);
    }
    return null;
  }

  private async cleanup(): Promise<void> {
    const entries = await this.getAllEntries();
    const now = new Date();
    const retentionDate = new Date(now.getTime() - (this.config.retentionDays * 24 * 60 * 60 * 1000));

    const validEntries = entries
      .filter(entry => new Date(entry.timestamp) >= retentionDate)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, this.config.maxEntries);

    localStorage.setItem(this.storageKey, JSON.stringify(validEntries));
  }

  private async createBackup(resource: string, data: any): Promise<void> {
    const backupKey = `backup_${resource}_${Date.now()}`;
    try {
      localStorage.setItem(backupKey, JSON.stringify({
        resource,
        timestamp: new Date().toISOString(),
        data,
        checksum: await this.generateChecksum(data)
      }));
    } catch (error) {
      console.error('Error creating backup:', error);
    }
  }

  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') return data;
    const sanitized = { ...data };
    this.config.sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });
    return sanitized;
  }

  private getChangedFields(before: any, after: any): string[] {
    const fields: string[] = [];
    const allKeys = new Set([
      ...Object.keys(before || {}),
      ...Object.keys(after || {})
    ]);

    allKeys.forEach(key => {
      if (JSON.stringify(before?.[key]) !== JSON.stringify(after?.[key])) {
        fields.push(key);
      }
    });

    return fields;
  }

  private calculateChangeSummary(before: any, after: any): AuditEntry['changes']['summary'] {
    const beforeKeys = new Set(Object.keys(before || {}));
    const afterKeys = new Set(Object.keys(after || {}));

    const added = Array.from(afterKeys).filter(key => !beforeKeys.has(key)).length;
    const deleted = Array.from(beforeKeys).filter(key => !afterKeys.has(key)).length;
    const modified = Array.from(beforeKeys).filter(key => 
      afterKeys.has(key) && JSON.stringify(before[key]) !== JSON.stringify(after[key])
    ).length;

    return { added, modified, deleted };
  }

  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateVersion(): string {
    const now = new Date();
    return `v${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()}.${now.getHours()}${now.getMinutes()}`;
  }

  private calculateSize(data: any): number {
    return JSON.stringify(data).length;
  }

  private async generateChecksum(data: any): Promise<string> {
    const text = JSON.stringify(data);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return 'sha256:' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
  }
}

// Global audit logger instance
export const auditLogger = new AuditLogger({
  enableAudit: true,
  maxEntries: 500,
  retentionDays: 60,
  autoBackup: true
});

import fs from 'fs/promises';
import path from 'path';

// Tipos para el sistema de auditoría
export interface AuditEvent {
  id: string;
  timestamp: string;
  userId?: string;
  userEmail?: string;
  sessionId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'auth' | 'data' | 'admin' | 'security' | 'performance' | 'error';
  status: 'success' | 'failure' | 'warning';
  changes?: {
    before?: any;
    after?: any;
    fields: string[];
  };
  metadata?: {
    requestId?: string;
    duration?: number;
    size?: number;
    error?: {
      name: string;
      message: string;
      stack?: string;
    };
  };
}

export interface PerformanceMetric {
  timestamp: string;
  endpoint: string;
  method: string;
  duration: number;
  statusCode: number;
  userId?: string;
  size: number;
  userAgent: string;
  ipAddress: string;
  cacheHit?: boolean;
}

export interface SecurityAlert {
  id: string;
  timestamp: string;
  type: 'brute_force' | 'suspicious_activity' | 'rate_limit' | 'unauthorized_access' | 'data_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  ipAddress: string;
  userAgent: string;
  userId?: string;
  details: Record<string, any>;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

/**
 * Sistema principal de auditoría
 */
export class AuditSystem {
  private logsDirectory: string;
  private metricsBuffer: PerformanceMetric[] = [];
  private alertsBuffer: SecurityAlert[] = [];
  private flushInterval: NodeJS.Timeout;

  constructor(logsDirectory: string = path.join(process.cwd(), 'logs')) {
    this.logsDirectory = logsDirectory;
    this.initializeSystem();
    
    // Flush logs cada 30 segundos
    this.flushInterval = setInterval(() => {
      this.flushBuffers();
    }, 30 * 1000);
  }

  /**
   * Inicializar sistema
   */
  private async initializeSystem(): Promise<void> {
    try {
      await fs.mkdir(this.logsDirectory, { recursive: true });
      await fs.mkdir(path.join(this.logsDirectory, 'audit'), { recursive: true });
      await fs.mkdir(path.join(this.logsDirectory, 'performance'), { recursive: true });
      await fs.mkdir(path.join(this.logsDirectory, 'security'), { recursive: true });
      
      console.log('[AUDIT] Sistema de auditoría inicializado');
    } catch (error) {
      console.error('[AUDIT] Error inicializando sistema:', error);
    }
  }

  /**
   * Registrar evento de auditoría
   */
  async logAuditEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<void> {
    const auditEvent: AuditEvent = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      ...event
    };

    try {
      await this.writeAuditLog(auditEvent);
      
      // Generar alerta si es evento crítico
      if (auditEvent.severity === 'critical') {
        await this.createSecurityAlert({
          type: 'unauthorized_access',
          severity: 'critical',
          description: `Critical audit event: ${auditEvent.action}`,
          ipAddress: auditEvent.ipAddress,
          userAgent: auditEvent.userAgent,
          userId: auditEvent.userId,
          details: auditEvent.details,
          resolved: false
        });
      }
    } catch (error) {
      console.error('[AUDIT] Error logging audit event:', error);
    }
  }

  /**
   * Registrar métrica de performance
   */
  recordPerformanceMetric(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    const perfMetric: PerformanceMetric = {
      timestamp: new Date().toISOString(),
      ...metric
    };

    this.metricsBuffer.push(perfMetric);

    // Alerta si el endpoint es muy lento
    if (metric.duration > 5000) { // 5 segundos
      this.createSecurityAlert({
        type: 'suspicious_activity',
        severity: 'medium',
        description: `Slow endpoint detected: ${metric.endpoint} (${metric.duration}ms)`,
        ipAddress: metric.ipAddress,
        userAgent: metric.userAgent,
        userId: metric.userId,
        details: { endpoint: metric.endpoint, duration: metric.duration },
        resolved: false
      });
    }
  }

  /**
   * Crear alerta de seguridad
   */
  async createSecurityAlert(alert: Omit<SecurityAlert, 'id' | 'timestamp'>): Promise<void> {
    const securityAlert: SecurityAlert = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      ...alert
    };

    this.alertsBuffer.push(securityAlert);
    
    // Log inmediato para alertas críticas
    if (alert.severity === 'critical') {
      await this.writeSecurityAlert(securityAlert);
      console.warn(`[SECURITY ALERT] ${alert.description}`);
    }
  }

  /**
   * Obtener métricas de performance
   */
  async getPerformanceMetrics(
    startDate: Date,
    endDate: Date,
    endpoint?: string
  ): Promise<{
    metrics: PerformanceMetric[];
    summary: {
      totalRequests: number;
      avgDuration: number;
      maxDuration: number;
      minDuration: number;
      errorRate: number;
      cacheHitRate: number;
    };
  }> {
    try {
      const metrics = await this.readPerformanceMetrics(startDate, endDate);
      const filtered = endpoint 
        ? metrics.filter(m => m.endpoint === endpoint)
        : metrics;

      const totalRequests = filtered.length;
      const durations = filtered.map(m => m.duration);
      const errors = filtered.filter(m => m.statusCode >= 400).length;
      const cacheHits = filtered.filter(m => m.cacheHit === true).length;

      return {
        metrics: filtered,
        summary: {
          totalRequests,
          avgDuration: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
          maxDuration: durations.length > 0 ? Math.max(...durations) : 0,
          minDuration: durations.length > 0 ? Math.min(...durations) : 0,
          errorRate: totalRequests > 0 ? (errors / totalRequests) * 100 : 0,
          cacheHitRate: totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0
        }
      };
    } catch (error) {
      console.error('[AUDIT] Error getting performance metrics:', error);
      return {
        metrics: [],
        summary: {
          totalRequests: 0,
          avgDuration: 0,
          maxDuration: 0,
          minDuration: 0,
          errorRate: 0,
          cacheHitRate: 0
        }
      };
    }
  }

  /**
   * Obtener eventos de auditoría
   */
  async getAuditEvents(
    startDate: Date,
    endDate: Date,
    filters?: {
      userId?: string;
      action?: string;
      resource?: string;
      severity?: string;
      category?: string;
    }
  ): Promise<AuditEvent[]> {
    try {
      const events = await this.readAuditLogs(startDate, endDate);
      
      if (!filters) return events;

      return events.filter(event => {
        return (!filters.userId || event.userId === filters.userId) &&
               (!filters.action || event.action === filters.action) &&
               (!filters.resource || event.resource === filters.resource) &&
               (!filters.severity || event.severity === filters.severity) &&
               (!filters.category || event.category === filters.category);
      });
    } catch (error) {
      console.error('[AUDIT] Error getting audit events:', error);
      return [];
    }
  }

  /**
   * Obtener alertas de seguridad
   */
  async getSecurityAlerts(resolved?: boolean): Promise<SecurityAlert[]> {
    try {
      const alerts = await this.readSecurityAlerts();
      
      if (resolved === undefined) return alerts;
      
      return alerts.filter(alert => alert.resolved === resolved);
    } catch (error) {
      console.error('[AUDIT] Error getting security alerts:', error);
      return [];
    }
  }

  /**
   * Resolver alerta de seguridad
   */
  async resolveSecurityAlert(alertId: string, userId: string): Promise<void> {
    try {
      const alerts = await this.readSecurityAlerts();
      const alertIndex = alerts.findIndex(alert => alert.id === alertId);
      
      if (alertIndex === -1) {
        throw new Error('Alert not found');
      }

      alerts[alertIndex].resolved = true;
      alerts[alertIndex].resolvedAt = new Date().toISOString();
      alerts[alertIndex].resolvedBy = userId;

      await this.writeSecurityAlerts(alerts);
    } catch (error) {
      console.error('[AUDIT] Error resolving security alert:', error);
      throw error;
    }
  }

  /**
   * Generar reporte de auditoría
   */
  async generateAuditReport(
    startDate: Date,
    endDate: Date,
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    try {
      const [auditEvents, perfMetrics, securityAlerts] = await Promise.all([
        this.getAuditEvents(startDate, endDate),
        this.getPerformanceMetrics(startDate, endDate),
        this.getSecurityAlerts()
      ]);

      const report = {
        generatedAt: new Date().toISOString(),
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        summary: {
          totalAuditEvents: auditEvents.length,
          criticalEvents: auditEvents.filter(e => e.severity === 'critical').length,
          failedActions: auditEvents.filter(e => e.status === 'failure').length,
          performanceSummary: perfMetrics.summary,
          unresolvedAlerts: securityAlerts.filter(a => !a.resolved).length
        },
        auditEvents,
        performanceMetrics: perfMetrics.metrics,
        securityAlerts
      };

      const filename = `audit-report-${startDate.toISOString().split('T')[0]}-${endDate.toISOString().split('T')[0]}.${format}`;
      const filePath = path.join(this.logsDirectory, 'reports', filename);
      
      await fs.mkdir(path.join(this.logsDirectory, 'reports'), { recursive: true });

      if (format === 'json') {
        await fs.writeFile(filePath, JSON.stringify(report, null, 2));
      } else {
        // Implementar formato CSV si es necesario
        await fs.writeFile(filePath, JSON.stringify(report, null, 2));
      }

      return filePath;
    } catch (error) {
      console.error('[AUDIT] Error generating audit report:', error);
      throw error;
    }
  }

  /**
   * Limpiar logs antiguos
   */
  async cleanupOldLogs(daysToKeep: number = 90): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    try {
      const directories = ['audit', 'performance', 'security'];
      
      for (const dir of directories) {
        const dirPath = path.join(this.logsDirectory, dir);
        const files = await fs.readdir(dirPath);
        
        for (const file of files) {
          const filePath = path.join(dirPath, file);
          const stat = await fs.stat(filePath);
          
          if (stat.mtime < cutoffDate) {
            await fs.unlink(filePath);
            console.log(`[AUDIT] Deleted old log file: ${file}`);
          }
        }
      }
    } catch (error) {
      console.error('[AUDIT] Error cleaning up old logs:', error);
    }
  }

  // Métodos privados para manejo de archivos

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async flushBuffers(): Promise<void> {
    try {
      if (this.metricsBuffer.length > 0) {
        await this.writePerformanceMetrics(this.metricsBuffer);
        this.metricsBuffer = [];
      }

      if (this.alertsBuffer.length > 0) {
        await this.writeSecurityAlerts(this.alertsBuffer);
        this.alertsBuffer = [];
      }
    } catch (error) {
      console.error('[AUDIT] Error flushing buffers:', error);
    }
  }

  private async writeAuditLog(event: AuditEvent): Promise<void> {
    const date = new Date().toISOString().split('T')[0];
    const filename = `audit-${date}.json`;
    const filePath = path.join(this.logsDirectory, 'audit', filename);
    
    const logEntry = JSON.stringify(event) + '\n';
    await fs.appendFile(filePath, logEntry);
  }

  private async writePerformanceMetrics(metrics: PerformanceMetric[]): Promise<void> {
    const date = new Date().toISOString().split('T')[0];
    const filename = `performance-${date}.json`;
    const filePath = path.join(this.logsDirectory, 'performance', filename);
    
    const logEntries = metrics.map(m => JSON.stringify(m)).join('\n') + '\n';
    await fs.appendFile(filePath, logEntries);
  }

  private async writeSecurityAlert(alert: SecurityAlert): Promise<void> {
    const date = new Date().toISOString().split('T')[0];
    const filename = `security-${date}.json`;
    const filePath = path.join(this.logsDirectory, 'security', filename);
    
    const logEntry = JSON.stringify(alert) + '\n';
    await fs.appendFile(filePath, logEntry);
  }

  private async writeSecurityAlerts(alerts: SecurityAlert[]): Promise<void> {
    const filename = 'security-alerts.json';
    const filePath = path.join(this.logsDirectory, 'security', filename);
    await fs.writeFile(filePath, JSON.stringify(alerts, null, 2));
  }

  private async readAuditLogs(startDate: Date, endDate: Date): Promise<AuditEvent[]> {
    const events: AuditEvent[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const filename = `audit-${dateStr}.json`;
      const filePath = path.join(this.logsDirectory, 'audit', filename);
      
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const lines = content.trim().split('\n');
        
        for (const line of lines) {
          if (line.trim()) {
            events.push(JSON.parse(line));
          }
        }
      } catch (error) {
        // Archivo no existe, continuar
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return events;
  }

  private async readPerformanceMetrics(startDate: Date, endDate: Date): Promise<PerformanceMetric[]> {
    const metrics: PerformanceMetric[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const filename = `performance-${dateStr}.json`;
      const filePath = path.join(this.logsDirectory, 'performance', filename);
      
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const lines = content.trim().split('\n');
        
        for (const line of lines) {
          if (line.trim()) {
            metrics.push(JSON.parse(line));
          }
        }
      } catch (error) {
        // Archivo no existe, continuar
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return metrics;
  }

  private async readSecurityAlerts(): Promise<SecurityAlert[]> {
    const filename = 'security-alerts.json';
    const filePath = path.join(this.logsDirectory, 'security', filename);
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return [];
    }
  }

  /**
   * Destructor para limpiar recursos
   */
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flushBuffers();
  }
}

/**
 * Middleware de auditoría para APIs
 */
export function withAuditing(category: AuditEvent['category'] = 'data') {
  const audit = auditSystem;
  
  return function(handler: Function) {
    return async (request: any, ...args: any[]) => {
      const startTime = Date.now();
      const requestId = audit['generateId']();
      
      // Extraer información del request
      const userAgent = request.headers.get('user-agent') || 'Unknown';
      const ipAddress = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       'unknown';
      const userId = (request as any).user?.id;
      const userEmail = (request as any).user?.email;
      
      try {
        const response = await handler(request, ...args);
        const duration = Date.now() - startTime;
        
        // Log successful audit event
        await audit.logAuditEvent({
          userId,
          userEmail,
          action: `${request.method} ${request.url}`,
          resource: request.url.split('?')[0],
          ipAddress,
          userAgent,
          details: {
            requestId,
            method: request.method,
            statusCode: response?.status || 200,
            duration
          },
          severity: 'low',
          category,
          status: 'success',
          metadata: {
            requestId,
            duration,
            size: response?.headers?.get('content-length') || 0
          }
        });
        
        // Record performance metric
        audit.recordPerformanceMetric({
          endpoint: request.url.split('?')[0],
          method: request.method,
          duration,
          statusCode: response?.status || 200,
          userId,
          size: parseInt(response?.headers?.get('content-length') || '0'),
          userAgent,
          ipAddress,
          cacheHit: response?.headers?.get('x-cache') === 'HIT'
        });
        
        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        // Log failed audit event
        await audit.logAuditEvent({
          userId,
          userEmail,
          action: `${request.method} ${request.url}`,
          resource: request.url.split('?')[0],
          ipAddress,
          userAgent,
          details: {
            requestId,
            method: request.method,
            error: error instanceof Error ? error.message : 'Unknown error'
          },
          severity: 'high',
          category,
          status: 'failure',
          metadata: {
            requestId,
            duration,
            error: error instanceof Error ? {
              name: error.name,
              message: error.message,
              stack: error.stack
            } : undefined
          }
        });
        
        throw error;
      }
    };
  };
}

// Instancia global del sistema de auditoría
export const auditSystem = new AuditSystem();

// Limpiar logs antiguos cada día
setInterval(() => {
  auditSystem.cleanupOldLogs(90);
}, 24 * 60 * 60 * 1000);

// API pública para auditoría
export const auditAPI = {
  logEvent: (event: Omit<AuditEvent, 'id' | 'timestamp'>) => auditSystem.logAuditEvent(event),
  recordMetric: (metric: Omit<PerformanceMetric, 'timestamp'>) => auditSystem.recordPerformanceMetric(metric),
  createAlert: (alert: Omit<SecurityAlert, 'id' | 'timestamp'>) => auditSystem.createSecurityAlert(alert),
  getEvents: (start: Date, end: Date, filters?: any) => auditSystem.getAuditEvents(start, end, filters),
  getMetrics: (start: Date, end: Date, endpoint?: string) => auditSystem.getPerformanceMetrics(start, end, endpoint),
  getAlerts: (resolved?: boolean) => auditSystem.getSecurityAlerts(resolved),
  resolveAlert: (alertId: string, userId: string) => auditSystem.resolveSecurityAlert(alertId, userId),
  generateReport: (start: Date, end: Date, format?: 'json' | 'csv') => auditSystem.generateAuditReport(start, end, format)
};

export default auditSystem;