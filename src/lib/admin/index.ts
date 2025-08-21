/**
 * JSON CRUD Admin System - Punto de entrada principal
 * 
 * Sistema completo de administración para archivos JSON con:
 * - Gestión segura de archivos con bloqueo atómico
 * - Sistema de caché en memoria con invalidación inteligente
 * - Validación flexible con schemas JSON
 * - Logs y auditoría completos
 * - Sistema de backups automáticos
 * - Tests de concurrencia y atomicidad
 */

// Core components
export { 
  FileManager, 
  type FileMetadata, 
  type WriteOptions, 
  type ReadOptions, 
  type WriteResult, 
  type ReadResult,
  type FileConflictError,
  type FileLockError,
  type FileValidationError
} from './core/file-manager';

export { 
  CacheManager, 
  JSONCacheManager,
  type CacheEntry,
  type CacheOptions,
  type CacheStats,
  type InvalidationPattern
} from './core/cache-manager';

export { 
  FlexibleValidator,
  type ValidationOptions,
  type ValidationResult,
  type ValidationFix,
  type ValidationStats,
  type SchemaConfig,
  type ValidationError,
  type SchemaNotFoundError
} from './core/validator';

export { 
  JSONCRUDLogger,
  logPerformance,
  type LogLevel,
  type LogEntry,
  type AuditEntry,
  type LoggerConfig,
  type LogStats,
  type PerformanceMetrics
} from './core/logger';

export { 
  BackupManager,
  type BackupType,
  type BackupFrequency,
  type BackupStatus,
  type BackupConfig,
  type BackupMetadata,
  type BackupJob,
  type RestoreOptions,
  type BackupStats
} from './core/backup-manager';

// Testing utilities
export { 
  ConcurrencyTester,
  runConcurrencyTests,
  type TestResult,
  type ConcurrencyTestSuite,
  type LoadTestMetrics
} from './tests/concurrency-tests';

// Instancias singleton pre-configuradas
import { fileManager } from './core/file-manager';
import { cacheManager } from './core/cache-manager';
import { validator } from './core/validator';
import { logger } from './core/logger';
import { backupManager } from './core/backup-manager';

/**
 * JSONCRUDSystem - Sistema integrado de administración JSON
 */
export class JSONCRUDSystem {
  public readonly fileManager = fileManager;
  public readonly cacheManager = cacheManager;
  public readonly validator = validator;
  public readonly logger = logger;
  public readonly backupManager = backupManager;

  private initialized = false;

  /**
   * Inicializar todo el sistema
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      await this.logger.info('system', 'Initializing JSON CRUD System...');

      // Cargar schemas de validación
      await this.validator.loadAllSchemas();
      
      // Configurar escuchadores de eventos para integración
      this.setupEventListeners();
      
      this.initialized = true;
      
      await this.logger.info('system', 'JSON CRUD System initialized successfully', {
        components: {
          fileManager: 'ready',
          cacheManager: 'ready',
          validator: 'ready',
          logger: 'ready',
          backupManager: 'ready'
        }
      });

    } catch (error) {
      await this.logger.error('system', 'Failed to initialize JSON CRUD System', error);
      throw error;
    }
  }

  /**
   * Configurar listeners para integración entre componentes
   */
  private setupEventListeners(): void {
    // FileManager -> Cache invalidation
    this.fileManager.on && this.fileManager.on('file-written', (filePath: string) => {
      this.cacheManager.invalidateFile(filePath);
    });

    this.fileManager.on && this.fileManager.on('file-deleted', (filePath: string) => {
      this.cacheManager.invalidateFile(filePath);
    });

    // Cache -> Logger para estadísticas
    this.cacheManager.on('hit', (key: string) => {
      this.logger.debug('cache', `Cache hit: ${key}`);
    });

    this.cacheManager.on('miss', (key: string) => {
      this.logger.debug('cache', `Cache miss: ${key}`);
    });

    // BackupManager -> Logger para auditoría
    this.backupManager.on('backup-completed', async (metadata: any) => {
      await this.logger.audit({
        action: 'create',
        resource: 'backup',
        resourceId: metadata.id,
        message: `Backup completed: ${metadata.type}`,
        metadata: {
          fileCount: metadata.fileCount,
          totalSize: metadata.totalSize,
          duration: metadata.duration
        }
      });
    });
  }

  /**
   * Operación completa de lectura con cache y logging
   */
  async readJSON<T = any>(filePath: string, useCache: boolean = true): Promise<T> {
    const startTime = Date.now();
    
    try {
      // Intentar obtener del cache primero
      if (useCache) {
        const cached = this.cacheManager.get<T>(filePath);
        if (cached !== null) {
          await this.logger.debug('system', `Read from cache: ${filePath}`);
          return cached;
        }
      }

      // Leer del sistema de archivos
      const result = await this.fileManager.readJSON<T>(filePath);
      
      // Almacenar en cache
      if (useCache) {
        this.cacheManager.set(filePath, result.data, {
          tags: [this.getFileCategory(filePath)]
        });
      }

      // Log de performance
      const duration = Date.now() - startTime;
      await this.logger.performance({
        operation: 'readJSON',
        duration,
        timestamp: new Date().toISOString(),
        success: true,
        metadata: { filePath, fromCache: false }
      });

      return result.data;

    } catch (error) {
      const duration = Date.now() - startTime;
      await this.logger.performance({
        operation: 'readJSON',
        duration,
        timestamp: new Date().toISOString(),
        success: false,
        metadata: { filePath, error: error.message }
      });

      throw error;
    }
  }

  /**
   * Operación completa de escritura con validación, backup y logging
   */
  async writeJSON<T = any>(
    filePath: string, 
    data: T, 
    options: {
      validate?: boolean;
      backup?: boolean;
      skipCache?: boolean;
    } = {}
  ): Promise<void> {
    const startTime = Date.now();
    const opts = { validate: true, backup: true, skipCache: false, ...options };
    
    try {
      // Validar datos si está habilitado
      if (opts.validate) {
        const schemaName = this.validator.getSchemaForFile(filePath);
        if (schemaName) {
          const validationResult = await this.validator.validate(data, schemaName, {
            migrationMode: true,
            autoFix: true
          });
          
          if (!validationResult.valid && validationResult.stats.compatibilityLevel === 'low') {
            throw new Error(`Validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`);
          }
          
          // Usar datos corregidos si se aplicaron fixes
          if (validationResult.fixes.length > 0) {
            data = validationResult.data;
            await this.logger.info('system', `Applied ${validationResult.fixes.length} auto-fixes to ${filePath}`);
          }
        }
      }

      // Crear backup si está habilitado
      if (opts.backup && await this.fileManager.exists(filePath)) {
        try {
          await this.backupManager.createIncrementalBackup(`auto-${Date.now()}`);
        } catch (error) {
          await this.logger.warn('system', `Backup failed for ${filePath}`, { error: error.message });
          // Continuar con la escritura aunque falle el backup
        }
      }

      // Escribir archivo
      const result = await this.fileManager.writeJSON(filePath, data, {
        createBackup: opts.backup,
        ensureDirectory: true
      });

      // Invalidar cache
      if (!opts.skipCache) {
        this.cacheManager.invalidateFile(filePath);
      }

      // Log de auditoría
      await this.logger.audit({
        action: 'update',
        resource: 'json-file',
        resourceId: filePath,
        message: `JSON file updated: ${filePath}`,
        etag: result.metadata.etag,
        metadata: {
          fileSize: result.metadata.size,
          validated: opts.validate,
          backed_up: opts.backup
        }
      });

      // Log de performance
      const duration = Date.now() - startTime;
      await this.logger.performance({
        operation: 'writeJSON',
        duration,
        timestamp: new Date().toISOString(),
        success: true,
        metadata: { filePath, fileSize: result.metadata.size }
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      await this.logger.performance({
        operation: 'writeJSON',
        duration,
        timestamp: new Date().toISOString(),
        success: false,
        metadata: { filePath, error: error.message }
      });

      await this.logger.error('system', `Failed to write JSON file: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas del sistema
   */
  async getSystemStats(): Promise<{
    cache: any;
    backups: any;
    validation: any;
    logs: any;
  }> {
    return {
      cache: this.cacheManager.getStats(),
      backups: this.backupManager.getBackupStats(),
      validation: this.validator.getValidationStats(),
      logs: this.logger.getStats()
    };
  }

  /**
   * Ejecutar tests de concurrencia
   */
  async runDiagnostics(): Promise<any> {
    const { runConcurrencyTests } = await import('./tests/concurrency-tests');
    return runConcurrencyTests();
  }

  /**
   * Determinar categoría de archivo para cache
   */
  private getFileCategory(filePath: string): string {
    if (filePath.includes('/pages/')) return 'pages';
    if (filePath.includes('/dynamic-content/')) return 'dynamic-content';
    return 'unknown';
  }

  /**
   * Limpiar recursos del sistema
   */
  async shutdown(): Promise<void> {
    await this.logger.info('system', 'Shutting down JSON CRUD System...');
    
    try {
      // Limpiar cache
      this.cacheManager.clear();
      
      // Destruir backup manager
      await this.backupManager.destroy();
      
      // Destruir logger (debe ser último)
      await this.logger.destroy();
      
      this.initialized = false;
      
    } catch (error) {
      console.error('Error during system shutdown:', error);
    }
  }
}

// Instancia singleton del sistema completo
export const jsonCrudSystem = new JSONCRUDSystem();

// Export por defecto del sistema
export default jsonCrudSystem;