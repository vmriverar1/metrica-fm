/**
 * Logger - Sistema de logs y auditoría completo
 * 
 * Características:
 * - Logs estructurados con metadatos
 * - Auditoría de cambios en archivos JSON
 * - Rotación automática de logs
 * - Niveles de log configurables
 * - Integración con FileManager para rastrear cambios
 * - Logs de performance y seguridad
 * - Exportación y análisis de logs
 */

import fs from 'fs/promises';
import path from 'path';
import { EventEmitter } from 'events';

// Tipos
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  metadata?: Record<string, any>;
  user?: string;
  session?: string;
  ip?: string;
  userAgent?: string;
  duration?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export interface AuditEntry extends LogEntry {
  action: 'create' | 'read' | 'update' | 'delete';
  resource: string;
  resourceId?: string;
  changes?: {
    before?: any;
    after?: any;
    fields?: string[];
  };
  etag?: string;
  backupPath?: string;
}

export interface LoggerConfig {
  logLevel: LogLevel;
  logDir: string;
  maxFileSize: number; // bytes
  maxFiles: number;
  enableAudit: boolean;
  enablePerformance: boolean;
  enableSecurity: boolean;
  rotateDaily: boolean;
  compressOldLogs: boolean;
}

export interface LogStats {
  totalEntries: number;
  entriesByLevel: Record<LogLevel, number>;
  entriesByCategory: Record<string, number>;
  oldestEntry: string;
  newestEntry: string;
  currentFileSize: number;
  totalFiles: number;
}

export interface PerformanceMetrics {
  operation: string;
  duration: number;
  timestamp: string;
  success: boolean;
  metadata?: Record<string, any>;
}

// Constantes
const LOG_LEVELS: Record<LogLevel, number> = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  fatal: 5
};

const DEFAULT_CONFIG: LoggerConfig = {
  logLevel: 'info',
  logDir: 'data/logs',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 10,
  enableAudit: true,
  enablePerformance: true,
  enableSecurity: true,
  rotateDaily: true,
  compressOldLogs: false
};

/**
 * JSONCRUDLogger - Logger principal del sistema
 */
export class JSONCRUDLogger extends EventEmitter {
  private config: LoggerConfig;
  private currentLogFile: string = '';
  private auditLogFile: string = '';
  private performanceLogFile: string = '';
  private securityLogFile: string = '';
  private writeQueue: Promise<void> = Promise.resolve();
  private stats: LogStats = {
    totalEntries: 0,
    entriesByLevel: {
      trace: 0,
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
      fatal: 0
    },
    entriesByCategory: {},
    oldestEntry: '',
    newestEntry: '',
    currentFileSize: 0,
    totalFiles: 0
  };

  constructor(config: Partial<LoggerConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeLogger();
  }

  /**
   * Inicializar el sistema de logging
   */
  private async initializeLogger(): Promise<void> {
    try {
      // Crear directorio de logs
      await fs.mkdir(this.config.logDir, { recursive: true });
      
      // Establecer archivos de log actuales
      const today = new Date().toISOString().split('T')[0];
      this.currentLogFile = path.join(this.config.logDir, `app-${today}.log`);
      this.auditLogFile = path.join(this.config.logDir, `audit-${today}.log`);
      this.performanceLogFile = path.join(this.config.logDir, `performance-${today}.log`);
      this.securityLogFile = path.join(this.config.logDir, `security-${today}.log`);
      
      // Calcular estadísticas iniciales
      await this.calculateStats();
      
      this.emit('initialized');
    } catch (error) {
      console.error('Failed to initialize logger:', error);
      throw error;
    }
  }

  /**
   * Log básico
   */
  private async writeLog(
    level: LogLevel,
    category: string,
    message: string,
    metadata?: Record<string, any>,
    context?: any
  ): Promise<void> {
    // Verificar nivel de log
    if (LOG_LEVELS[level] < LOG_LEVELS[this.config.logLevel]) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      metadata,
      ...context
    };

    // Agregar a cola de escritura para evitar problemas de concurrencia
    this.writeQueue = this.writeQueue.then(async () => {
      await this.writeLogEntry(entry, this.currentLogFile);
      this.updateStats(entry);
      this.emit('log', entry);
    });

    return this.writeQueue;
  }

  /**
   * Escribir entrada de log al archivo
   */
  private async writeLogEntry(entry: LogEntry, logFile: string): Promise<void> {
    try {
      // Verificar rotación de archivos
      await this.checkFileRotation(logFile);
      
      const logLine = JSON.stringify(entry) + '\n';
      await fs.appendFile(logFile, logLine, 'utf-8');
      
      this.stats.currentFileSize += logLine.length;
    } catch (error) {
      console.error('Failed to write log entry:', error);
      this.emit('error', error);
    }
  }

  /**
   * Verificar si necesita rotación de archivos
   */
  private async checkFileRotation(logFile: string): Promise<void> {
    try {
      const stats = await fs.stat(logFile);
      
      if (stats.size >= this.config.maxFileSize) {
        await this.rotateLogFile(logFile);
      }
    } catch (error) {
      // El archivo no existe aún, está bien
    }
  }

  /**
   * Rotar archivo de log
   */
  private async rotateLogFile(logFile: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const rotatedFile = logFile.replace('.log', `-${timestamp}.log`);
    
    try {
      await fs.rename(logFile, rotatedFile);
      this.stats.totalFiles++;
      this.stats.currentFileSize = 0;
      
      // Comprimir archivo viejo si está habilitado
      if (this.config.compressOldLogs) {
        // TODO: Implementar compresión con gzip
      }
      
      // Limpiar archivos viejos
      await this.cleanupOldLogs();
      
      this.emit('rotated', { original: logFile, rotated: rotatedFile });
    } catch (error) {
      console.error('Failed to rotate log file:', error);
    }
  }

  /**
   * Limpiar archivos de log viejos
   */
  private async cleanupOldLogs(): Promise<void> {
    try {
      const files = await fs.readdir(this.config.logDir);
      const logFiles = files
        .filter(file => file.endsWith('.log'))
        .map(file => ({
          name: file,
          path: path.join(this.config.logDir, file),
          stat: null as any
        }));

      // Obtener estadísticas de archivos
      for (const file of logFiles) {
        try {
          file.stat = await fs.stat(file.path);
        } catch {
          // Ignorar archivos que no se pueden leer
        }
      }

      // Ordenar por fecha de modificación (más recientes primero)
      const sortedFiles = logFiles
        .filter(file => file.stat)
        .sort((a, b) => b.stat.mtime.getTime() - a.stat.mtime.getTime());

      // Eliminar archivos excedentes
      const filesToDelete = sortedFiles.slice(this.config.maxFiles);
      for (const file of filesToDelete) {
        try {
          await fs.unlink(file.path);
          this.stats.totalFiles--;
          this.emit('cleanup', file.path);
        } catch (error) {
          console.error(`Failed to delete old log file ${file.path}:`, error);
        }
      }
    } catch (error) {
      console.error('Failed to cleanup old logs:', error);
    }
  }

  /**
   * Actualizar estadísticas
   */
  private updateStats(entry: LogEntry): void {
    this.stats.totalEntries++;
    this.stats.entriesByLevel[entry.level]++;
    
    if (!this.stats.entriesByCategory[entry.category]) {
      this.stats.entriesByCategory[entry.category] = 0;
    }
    this.stats.entriesByCategory[entry.category]++;
    
    if (!this.stats.oldestEntry || entry.timestamp < this.stats.oldestEntry) {
      this.stats.oldestEntry = entry.timestamp;
    }
    
    if (!this.stats.newestEntry || entry.timestamp > this.stats.newestEntry) {
      this.stats.newestEntry = entry.timestamp;
    }
  }

  /**
   * Calcular estadísticas iniciales
   */
  private async calculateStats(): Promise<void> {
    try {
      const files = await fs.readdir(this.config.logDir);
      this.stats.totalFiles = files.filter(file => file.endsWith('.log')).length;
      
      if (this.currentLogFile) {
        try {
          const stat = await fs.stat(this.currentLogFile);
          this.stats.currentFileSize = stat.size;
        } catch {
          this.stats.currentFileSize = 0;
        }
      }
    } catch {
      // Directorio no existe aún
    }
  }

  // Métodos públicos de logging
  trace(category: string, message: string, metadata?: Record<string, any>, context?: any): Promise<void> {
    return this.writeLog('trace', category, message, metadata, context);
  }

  debug(category: string, message: string, metadata?: Record<string, any>, context?: any): Promise<void> {
    return this.writeLog('debug', category, message, metadata, context);
  }

  info(category: string, message: string, metadata?: Record<string, any>, context?: any): Promise<void> {
    return this.writeLog('info', category, message, metadata, context);
  }

  warn(category: string, message: string, metadata?: Record<string, any>, context?: any): Promise<void> {
    return this.writeLog('warn', category, message, metadata, context);
  }

  error(category: string, message: string, error?: Error, metadata?: Record<string, any>, context?: any): Promise<void> {
    const errorMetadata = error ? {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      ...metadata
    } : metadata;
    
    return this.writeLog('error', category, message, errorMetadata, context);
  }

  fatal(category: string, message: string, error?: Error, metadata?: Record<string, any>, context?: any): Promise<void> {
    const errorMetadata = error ? {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      ...metadata
    } : metadata;
    
    return this.writeLog('fatal', category, message, errorMetadata, context);
  }

  /**
   * Log de auditoría para cambios en archivos
   */
  async audit(auditEntry: Omit<AuditEntry, 'timestamp' | 'level' | 'category'>): Promise<void> {
    if (!this.config.enableAudit) return;

    const entry: AuditEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      category: 'audit',
      ...auditEntry
    };

    this.writeQueue = this.writeQueue.then(async () => {
      await this.writeLogEntry(entry, this.auditLogFile);
      this.emit('audit', entry);
    });

    return this.writeQueue;
  }

  /**
   * Log de performance
   */
  async performance(metrics: PerformanceMetrics): Promise<void> {
    if (!this.config.enablePerformance) return;

    const entry: LogEntry = {
      timestamp: metrics.timestamp,
      level: 'info',
      category: 'performance',
      message: `${metrics.operation} completed in ${metrics.duration}ms`,
      metadata: {
        operation: metrics.operation,
        duration: metrics.duration,
        success: metrics.success,
        ...metrics.metadata
      }
    };

    this.writeQueue = this.writeQueue.then(async () => {
      await this.writeLogEntry(entry, this.performanceLogFile);
      this.emit('performance', entry);
    });

    return this.writeQueue;
  }

  /**
   * Log de seguridad
   */
  async security(
    action: string,
    result: 'success' | 'failure',
    details: Record<string, any>,
    context?: any
  ): Promise<void> {
    if (!this.config.enableSecurity) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: result === 'failure' ? 'warn' : 'info',
      category: 'security',
      message: `Security event: ${action} - ${result}`,
      metadata: {
        action,
        result,
        ...details
      },
      ...context
    };

    this.writeQueue = this.writeQueue.then(async () => {
      await this.writeLogEntry(entry, this.securityLogFile);
      this.emit('security', entry);
    });

    return this.writeQueue;
  }

  /**
   * Obtener estadísticas de logs
   */
  getStats(): LogStats {
    return { ...this.stats };
  }

  /**
   * Buscar logs por criterios
   */
  async searchLogs(criteria: {
    level?: LogLevel;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
    message?: string;
    limit?: number;
  }): Promise<LogEntry[]> {
    // TODO: Implementar búsqueda en archivos de log
    // Por ahora retornar array vacío
    return [];
  }

  /**
   * Exportar logs a JSON
   */
  async exportLogs(dateFrom?: string, dateTo?: string): Promise<string> {
    // TODO: Implementar exportación de logs
    return JSON.stringify({ message: 'Export functionality not implemented yet' });
  }

  /**
   * Limpiar logs antiguos por fecha
   */
  async cleanupLogsByDate(olderThan: string): Promise<number> {
    let cleaned = 0;
    
    try {
      const files = await fs.readdir(this.config.logDir);
      const cutoffDate = new Date(olderThan);
      
      for (const file of files) {
        if (!file.endsWith('.log')) continue;
        
        const filePath = path.join(this.config.logDir, file);
        const stat = await fs.stat(filePath);
        
        if (stat.mtime < cutoffDate) {
          await fs.unlink(filePath);
          cleaned++;
        }
      }
      
      await this.calculateStats();
      this.emit('cleanup', { cleaned, olderThan });
    } catch (error) {
      console.error('Failed to cleanup logs by date:', error);
    }
    
    return cleaned;
  }

  /**
   * Destruir logger y limpiar recursos
   */
  async destroy(): Promise<void> {
    // Esperar que termine la cola de escritura
    await this.writeQueue;
    
    // Emitir evento de cierre
    this.emit('destroyed');
    
    // Limpiar listeners
    this.removeAllListeners();
  }
}

/**
 * Decorator para loggear performance automáticamente
 */
export function logPerformance(category: string = 'operation') {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      const operationName = `${target.constructor.name}.${propertyName}`;
      
      try {
        const result = await method.apply(this, args);
        const duration = Date.now() - startTime;
        
        if (logger) {
          await logger.performance({
            operation: operationName,
            duration,
            timestamp: new Date().toISOString(),
            success: true,
            metadata: { category, args: args.length }
          });
        }
        
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        if (logger) {
          await logger.performance({
            operation: operationName,
            duration,
            timestamp: new Date().toISOString(),
            success: false,
            metadata: { category, error: error.message }
          });
        }
        
        throw error;
      }
    };
    
    return descriptor;
  };
}

// Instancia singleton del logger
export const logger = new JSONCRUDLogger();