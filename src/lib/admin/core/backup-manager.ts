/**
 * BackupManager - Sistema de backups automáticos
 * 
 * Características:
 * - Backups incrementales y completos
 * - Programación automática (cron-like)
 * - Retención configurable de backups
 * - Verificación de integridad
 * - Restauración de backups
 * - Compresión de archivos antiguos
 * - Monitoreo y alertas
 * - Exportación a diferentes destinos
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { EventEmitter } from 'events';
import { FileManager } from './file-manager';
import { JSONCRUDLogger } from './logger';

// Tipos
export type BackupType = 'full' | 'incremental' | 'differential';
export type BackupFrequency = 'manual' | 'hourly' | 'daily' | 'weekly' | 'monthly';
export type BackupStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';

export interface BackupConfig {
  sourceDir: string;
  backupDir: string;
  frequency: BackupFrequency;
  retentionDays: number;
  maxBackups: number;
  enableCompression: boolean;
  enableEncryption: boolean;
  encryptionKey?: string;
  enableVerification: boolean;
  excludePatterns: string[];
  includePatternsOnly: string[];
}

export interface BackupMetadata {
  id: string;
  timestamp: string;
  type: BackupType;
  status: BackupStatus;
  sourceDir: string;
  backupPath: string;
  fileCount: number;
  totalSize: number;
  duration: number;
  checksum: string;
  encrypted: boolean;
  compressed: boolean;
  version: string;
  parentBackupId?: string; // Para backups incrementales
  changes?: {
    added: string[];
    modified: string[];
    deleted: string[];
  };
}

export interface BackupJob {
  id: string;
  name: string;
  config: BackupConfig;
  schedule: string; // Cron-like expression
  lastRun?: string;
  nextRun?: string;
  enabled: boolean;
  metadata: Partial<BackupMetadata>;
}

export interface RestoreOptions {
  backupId: string;
  targetDir: string;
  overwrite: boolean;
  selectiveRestore?: string[]; // Archivos específicos a restaurar
  preserveTimestamps: boolean;
  verifyIntegrity: boolean;
}

export interface BackupStats {
  totalBackups: number;
  totalSize: number;
  oldestBackup: string;
  newestBackup: string;
  backupsByType: Record<BackupType, number>;
  averageBackupSize: number;
  successRate: number;
  lastSuccessfulBackup: string;
}

// Constantes
const DEFAULT_CONFIG: BackupConfig = {
  sourceDir: 'public/json',
  backupDir: 'data/backups',
  frequency: 'daily',
  retentionDays: 30,
  maxBackups: 50,
  enableCompression: false,
  enableEncryption: false,
  enableVerification: true,
  excludePatterns: ['*.tmp', '*.lock', 'node_modules'],
  includePatternsOnly: []
};

/**
 * BackupManager - Gestor principal de backups
 */
export class BackupManager extends EventEmitter {
  private config: BackupConfig;
  private fileManager: FileManager;
  private logger: JSONCRUDLogger;
  private activeJobs: Map<string, BackupJob> = new Map();
  private scheduleTimers: Map<string, NodeJS.Timeout> = new Map();
  private backupHistory: BackupMetadata[] = [];
  private lastBackupMetadata: Map<string, BackupMetadata> = new Map();

  constructor(
    config: Partial<BackupConfig> = {},
    fileManager?: FileManager,
    logger?: JSONCRUDLogger
  ) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.fileManager = fileManager || new FileManager();
    this.logger = logger || new JSONCRUDLogger({
      logDir: path.join(this.config.backupDir, 'logs')
    });
    
    this.initializeBackupManager();
  }

  /**
   * Inicializar el gestor de backups
   */
  private async initializeBackupManager(): Promise<void> {
    try {
      // Crear directorios necesarios
      await fs.mkdir(this.config.backupDir, { recursive: true });
      await fs.mkdir(path.join(this.config.backupDir, 'metadata'), { recursive: true });
      await fs.mkdir(path.join(this.config.backupDir, 'temp'), { recursive: true });
      
      // Cargar historial de backups existente
      await this.loadBackupHistory();
      
      // Cargar trabajos de backup programados
      await this.loadScheduledJobs();
      
      await this.logger.info('backup', 'BackupManager initialized successfully');
      this.emit('initialized');
    } catch (error) {
      await this.logger.error('backup', 'Failed to initialize BackupManager', error);
      throw error;
    }
  }

  /**
   * Crear un backup completo
   */
  async createFullBackup(name: string = 'manual'): Promise<BackupMetadata> {
    const backupId = this.generateBackupId();
    const timestamp = new Date().toISOString();
    const startTime = Date.now();

    const metadata: BackupMetadata = {
      id: backupId,
      timestamp,
      type: 'full',
      status: 'in_progress',
      sourceDir: this.config.sourceDir,
      backupPath: path.join(this.config.backupDir, `full_${backupId}`),
      fileCount: 0,
      totalSize: 0,
      duration: 0,
      checksum: '',
      encrypted: this.config.enableEncryption,
      compressed: this.config.enableCompression,
      version: '1.0.0'
    };

    try {
      await this.logger.info('backup', `Starting full backup: ${backupId}`, { name, backupId });
      this.emit('backup-started', metadata);

      // Crear directorio de backup
      await fs.mkdir(metadata.backupPath, { recursive: true });

      // Obtener lista de archivos a respaldar
      const filesToBackup = await this.getFilesToBackup();
      metadata.fileCount = filesToBackup.length;

      // Copiar archivos
      let totalSize = 0;
      for (const file of filesToBackup) {
        const sourcePath = path.join(this.config.sourceDir, file);
        const targetPath = path.join(metadata.backupPath, file);
        
        // Crear directorio de destino si no existe
        await fs.mkdir(path.dirname(targetPath), { recursive: true });
        
        // Copiar archivo
        await fs.copyFile(sourcePath, targetPath);
        
        // Calcular tamaño
        const stats = await fs.stat(targetPath);
        totalSize += stats.size;
        
        this.emit('file-backed-up', { file, size: stats.size });
      }

      metadata.totalSize = totalSize;
      metadata.duration = Date.now() - startTime;

      // Generar checksum del backup
      metadata.checksum = await this.generateBackupChecksum(metadata.backupPath);

      // Aplicar compresión si está habilitada
      if (this.config.enableCompression) {
        await this.compressBackup(metadata);
      }

      // Aplicar encriptación si está habilitada
      if (this.config.enableEncryption && this.config.encryptionKey) {
        await this.encryptBackup(metadata);
      }

      // Verificar integridad si está habilitada
      if (this.config.enableVerification) {
        const verified = await this.verifyBackupIntegrity(metadata);
        if (!verified) {
          throw new Error('Backup integrity verification failed');
        }
      }

      metadata.status = 'completed';
      
      // Guardar metadata
      await this.saveBackupMetadata(metadata);
      
      // Actualizar historial
      this.backupHistory.push(metadata);
      this.lastBackupMetadata.set('full', metadata);

      // Limpiar backups antiguos
      await this.cleanupOldBackups();

      await this.logger.info('backup', `Full backup completed: ${backupId}`, {
        fileCount: metadata.fileCount,
        totalSize: metadata.totalSize,
        duration: metadata.duration
      });

      this.emit('backup-completed', metadata);
      return metadata;

    } catch (error) {
      metadata.status = 'failed';
      metadata.duration = Date.now() - startTime;
      
      await this.logger.error('backup', `Full backup failed: ${backupId}`, error, {
        backupId,
        error: error.message
      });

      // Limpiar backup fallido
      try {
        await fs.rm(metadata.backupPath, { recursive: true, force: true });
      } catch {}

      this.emit('backup-failed', metadata, error);
      throw error;
    }
  }

  /**
   * Crear backup incremental
   */
  async createIncrementalBackup(name: string = 'incremental'): Promise<BackupMetadata> {
    const lastFullBackup = this.lastBackupMetadata.get('full');
    if (!lastFullBackup) {
      throw new Error('No full backup found. Create a full backup first.');
    }

    const backupId = this.generateBackupId();
    const timestamp = new Date().toISOString();
    const startTime = Date.now();

    const metadata: BackupMetadata = {
      id: backupId,
      timestamp,
      type: 'incremental',
      status: 'in_progress',
      sourceDir: this.config.sourceDir,
      backupPath: path.join(this.config.backupDir, `incremental_${backupId}`),
      fileCount: 0,
      totalSize: 0,
      duration: 0,
      checksum: '',
      encrypted: this.config.enableEncryption,
      compressed: this.config.enableCompression,
      version: '1.0.0',
      parentBackupId: lastFullBackup.id,
      changes: {
        added: [],
        modified: [],
        deleted: []
      }
    };

    try {
      await this.logger.info('backup', `Starting incremental backup: ${backupId}`, { 
        name, 
        backupId,
        parentBackup: lastFullBackup.id
      });

      this.emit('backup-started', metadata);

      // Detectar cambios desde el último backup
      const changes = await this.detectChanges(lastFullBackup.timestamp);
      metadata.changes = changes;

      // Crear directorio de backup
      await fs.mkdir(metadata.backupPath, { recursive: true });

      // Respaldar solo archivos modificados y nuevos
      const filesToBackup = [...changes.added, ...changes.modified];
      metadata.fileCount = filesToBackup.length;

      let totalSize = 0;
      for (const file of filesToBackup) {
        const sourcePath = path.join(this.config.sourceDir, file);
        const targetPath = path.join(metadata.backupPath, file);
        
        // Verificar que el archivo existe
        try {
          await fs.access(sourcePath);
        } catch {
          continue; // Archivo ya no existe
        }
        
        await fs.mkdir(path.dirname(targetPath), { recursive: true });
        await fs.copyFile(sourcePath, targetPath);
        
        const stats = await fs.stat(targetPath);
        totalSize += stats.size;
      }

      // Guardar lista de archivos eliminados
      if (changes.deleted.length > 0) {
        const deletedListPath = path.join(metadata.backupPath, 'deleted-files.json');
        await fs.writeFile(deletedListPath, JSON.stringify(changes.deleted, null, 2));
      }

      metadata.totalSize = totalSize;
      metadata.duration = Date.now() - startTime;
      metadata.checksum = await this.generateBackupChecksum(metadata.backupPath);
      metadata.status = 'completed';

      await this.saveBackupMetadata(metadata);
      this.backupHistory.push(metadata);
      this.lastBackupMetadata.set('incremental', metadata);

      await this.logger.info('backup', `Incremental backup completed: ${backupId}`, {
        fileCount: metadata.fileCount,
        changesDetected: {
          added: changes.added.length,
          modified: changes.modified.length,
          deleted: changes.deleted.length
        }
      });

      this.emit('backup-completed', metadata);
      return metadata;

    } catch (error) {
      metadata.status = 'failed';
      metadata.duration = Date.now() - startTime;
      
      await this.logger.error('backup', `Incremental backup failed: ${backupId}`, error);
      
      try {
        await fs.rm(metadata.backupPath, { recursive: true, force: true });
      } catch {}

      this.emit('backup-failed', metadata, error);
      throw error;
    }
  }

  /**
   * Restaurar desde backup
   */
  async restoreFromBackup(options: RestoreOptions): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      await this.logger.info('backup', `Starting restore from backup: ${options.backupId}`, options);
      
      // Buscar metadata del backup
      const backupMetadata = await this.getBackupMetadata(options.backupId);
      if (!backupMetadata) {
        throw new Error(`Backup not found: ${options.backupId}`);
      }

      // Verificar integridad si está habilitada
      if (options.verifyIntegrity) {
        const verified = await this.verifyBackupIntegrity(backupMetadata);
        if (!verified) {
          throw new Error('Backup integrity verification failed');
        }
      }

      // Crear directorio de destino
      await fs.mkdir(options.targetDir, { recursive: true });

      // Obtener lista de archivos a restaurar
      const filesToRestore = options.selectiveRestore || 
                            await this.getBackupFileList(backupMetadata);

      // Restaurar archivos
      let restoredCount = 0;
      for (const file of filesToRestore) {
        const sourcePath = path.join(backupMetadata.backupPath, file);
        const targetPath = path.join(options.targetDir, file);

        try {
          // Verificar que el archivo existe en el backup
          await fs.access(sourcePath);
          
          // Crear directorio de destino si no existe
          await fs.mkdir(path.dirname(targetPath), { recursive: true });
          
          // Verificar si el archivo de destino existe
          if (!options.overwrite) {
            try {
              await fs.access(targetPath);
              continue; // Skip si el archivo existe y no se debe sobrescribir
            } catch {
              // El archivo no existe, se puede restaurar
            }
          }
          
          // Copiar archivo
          await fs.copyFile(sourcePath, targetPath);
          
          // Preservar timestamps si está habilitado
          if (options.preserveTimestamps) {
            const stats = await fs.stat(sourcePath);
            await fs.utimes(targetPath, stats.atime, stats.mtime);
          }
          
          restoredCount++;
          this.emit('file-restored', { file, targetPath });
          
        } catch (error) {
          await this.logger.warn('backup', `Failed to restore file: ${file}`, { error: error.message });
        }
      }

      const duration = Date.now() - startTime;
      
      await this.logger.info('backup', `Restore completed from backup: ${options.backupId}`, {
        filesRestored: restoredCount,
        duration
      });

      this.emit('restore-completed', {
        backupId: options.backupId,
        filesRestored: restoredCount,
        duration
      });

      return true;

    } catch (error) {
      await this.logger.error('backup', `Restore failed from backup: ${options.backupId}`, error);
      this.emit('restore-failed', options.backupId, error);
      throw error;
    }
  }

  /**
   * Programar backup automático
   */
  scheduleBackup(job: Omit<BackupJob, 'id'>): string {
    const jobId = this.generateJobId();
    const backupJob: BackupJob = {
      id: jobId,
      ...job
    };

    this.activeJobs.set(jobId, backupJob);
    
    if (job.enabled) {
      this.activateJob(backupJob);
    }

    this.logger.info('backup', `Backup job scheduled: ${jobId}`, {
      name: job.name,
      schedule: job.schedule
    });

    return jobId;
  }

  /**
   * Activar job programado
   */
  private activateJob(job: BackupJob): void {
    // Parsear expresión cron-like simplificada
    const nextRun = this.calculateNextRun(job.schedule);
    job.nextRun = nextRun.toISOString();
    
    const delay = nextRun.getTime() - Date.now();
    
    const timer = setTimeout(async () => {
      try {
        await this.executeScheduledJob(job);
      } catch (error) {
        await this.logger.error('backup', `Scheduled job failed: ${job.id}`, error);
      }
      
      // Reprogramar para la siguiente ejecución
      if (job.enabled) {
        this.activateJob(job);
      }
    }, delay);
    
    this.scheduleTimers.set(job.id, timer);
  }

  /**
   * Ejecutar job programado
   */
  private async executeScheduledJob(job: BackupJob): Promise<void> {
    job.lastRun = new Date().toISOString();
    
    try {
      let backup: BackupMetadata;
      
      if (job.config.frequency === 'daily' || job.config.frequency === 'weekly' || job.config.frequency === 'monthly') {
        // Backup completo para frecuencias largas
        backup = await this.createFullBackup(job.name);
      } else {
        // Backup incremental para frecuencias cortas
        try {
          backup = await this.createIncrementalBackup(job.name);
        } catch (error) {
          // Si falla el incremental, crear uno completo
          backup = await this.createFullBackup(job.name);
        }
      }
      
      job.metadata = backup;
      
    } catch (error) {
      await this.logger.error('backup', `Scheduled backup failed: ${job.name}`, error);
      throw error;
    }
  }

  /**
   * Obtener archivos a respaldar
   */
  private async getFilesToBackup(): Promise<string[]> {
    const allFiles = await this.getAllFiles(this.config.sourceDir);
    
    return allFiles.filter(file => {
      // Aplicar patrones de exclusión
      if (this.config.excludePatterns.some(pattern => 
        this.matchPattern(file, pattern))) {
        return false;
      }
      
      // Aplicar patrones de inclusión si están definidos
      if (this.config.includePatternsOnly.length > 0) {
        return this.config.includePatternsOnly.some(pattern => 
          this.matchPattern(file, pattern));
      }
      
      return true;
    });
  }

  /**
   * Obtener todos los archivos de un directorio recursivamente
   */
  private async getAllFiles(dir: string, basePath: string = ''): Promise<string[]> {
    const files: string[] = [];
    const items = await fs.readdir(path.join(this.config.sourceDir, basePath), { withFileTypes: true });
    
    for (const item of items) {
      const itemPath = path.join(basePath, item.name);
      
      if (item.isFile()) {
        files.push(itemPath);
      } else if (item.isDirectory()) {
        const subFiles = await this.getAllFiles(dir, itemPath);
        files.push(...subFiles);
      }
    }
    
    return files;
  }

  /**
   * Verificar si un archivo coincide con un patrón
   */
  private matchPattern(file: string, pattern: string): boolean {
    // Convertir wildcard pattern a regex
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$',
      'i'
    );
    return regex.test(file);
  }

  /**
   * Detectar cambios desde un timestamp
   */
  private async detectChanges(since: string): Promise<{
    added: string[];
    modified: string[];
    deleted: string[];
  }> {
    const changes = {
      added: [] as string[],
      modified: [] as string[],
      deleted: [] as string[]
    };

    const sinceDate = new Date(since);
    const currentFiles = await this.getFilesToBackup();
    
    for (const file of currentFiles) {
      const filePath = path.join(this.config.sourceDir, file);
      
      try {
        const stats = await fs.stat(filePath);
        
        if (stats.mtime > sinceDate) {
          // Determinar si es nuevo o modificado
          // Por simplicidad, consideramos todo como modificado
          // En una implementación más sofisticada, mantendríamos un registro
          changes.modified.push(file);
        }
      } catch {
        // El archivo no existe, se considera eliminado
        changes.deleted.push(file);
      }
    }

    return changes;
  }

  /**
   * Generar checksum de un backup
   */
  private async generateBackupChecksum(backupPath: string): Promise<string> {
    const hash = crypto.createHash('sha256');
    const files = await this.getAllFiles(backupPath);
    
    // Ordenar archivos para checksum consistente
    files.sort();
    
    for (const file of files) {
      const filePath = path.join(backupPath, file);
      const content = await fs.readFile(filePath);
      hash.update(content);
    }
    
    return hash.digest('hex');
  }

  /**
   * Verificar integridad de backup
   */
  private async verifyBackupIntegrity(metadata: BackupMetadata): Promise<boolean> {
    try {
      const currentChecksum = await this.generateBackupChecksum(metadata.backupPath);
      return currentChecksum === metadata.checksum;
    } catch {
      return false;
    }
  }

  /**
   * Guardar metadata de backup
   */
  private async saveBackupMetadata(metadata: BackupMetadata): Promise<void> {
    const metadataPath = path.join(
      this.config.backupDir,
      'metadata',
      `${metadata.id}.json`
    );
    
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  }

  /**
   * Obtener metadata de backup
   */
  private async getBackupMetadata(backupId: string): Promise<BackupMetadata | null> {
    try {
      const metadataPath = path.join(
        this.config.backupDir,
        'metadata',
        `${backupId}.json`
      );
      
      const content = await fs.readFile(metadataPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  /**
   * Cargar historial de backups
   */
  private async loadBackupHistory(): Promise<void> {
    try {
      const metadataDir = path.join(this.config.backupDir, 'metadata');
      const files = await fs.readdir(metadataDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const content = await fs.readFile(path.join(metadataDir, file), 'utf-8');
            const metadata: BackupMetadata = JSON.parse(content);
            this.backupHistory.push(metadata);
            
            // Mantener referencia al último backup de cada tipo
            this.lastBackupMetadata.set(metadata.type, metadata);
          } catch (error) {
            await this.logger.warn('backup', `Failed to load backup metadata: ${file}`, {
              error: error.message
            });
          }
        }
      }
      
      // Ordenar por timestamp
      this.backupHistory.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
    } catch {
      // Directorio no existe aún
    }
  }

  /**
   * Cargar trabajos programados
   */
  private async loadScheduledJobs(): Promise<void> {
    // TODO: Implementar persistencia de jobs programados
  }

  /**
   * Limpiar backups antiguos
   */
  private async cleanupOldBackups(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

    const backupsToDelete = this.backupHistory.filter(backup => 
      new Date(backup.timestamp) < cutoffDate || 
      this.backupHistory.length > this.config.maxBackups
    );

    for (const backup of backupsToDelete) {
      try {
        // Eliminar directorio de backup
        await fs.rm(backup.backupPath, { recursive: true, force: true });
        
        // Eliminar metadata
        const metadataPath = path.join(
          this.config.backupDir,
          'metadata',
          `${backup.id}.json`
        );
        await fs.unlink(metadataPath);
        
        // Remover del historial
        const index = this.backupHistory.indexOf(backup);
        if (index > -1) {
          this.backupHistory.splice(index, 1);
        }
        
        await this.logger.info('backup', `Cleaned up old backup: ${backup.id}`);
        
      } catch (error) {
        await this.logger.warn('backup', `Failed to cleanup backup: ${backup.id}`, {
          error: error.message
        });
      }
    }
  }

  /**
   * Comprimir backup (placeholder)
   */
  private async compressBackup(metadata: BackupMetadata): Promise<void> {
    // TODO: Implementar compresión con gzip/tar
    metadata.compressed = false;
  }

  /**
   * Encriptar backup (placeholder)
   */
  private async encryptBackup(metadata: BackupMetadata): Promise<void> {
    // TODO: Implementar encriptación
    metadata.encrypted = false;
  }

  /**
   * Obtener lista de archivos en backup
   */
  private async getBackupFileList(metadata: BackupMetadata): Promise<string[]> {
    return this.getAllFiles(metadata.backupPath);
  }

  /**
   * Calcular próxima ejecución
   */
  private calculateNextRun(schedule: string): Date {
    const now = new Date();
    
    // Implementación simplificada para daily, hourly, etc.
    switch (schedule) {
      case 'hourly':
        return new Date(now.getTime() + 60 * 60 * 1000);
      case 'daily':
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(2, 0, 0, 0); // 2 AM
        return tomorrow;
      case 'weekly':
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + 7);
        nextWeek.setHours(2, 0, 0, 0);
        return nextWeek;
      default:
        return new Date(now.getTime() + 60 * 60 * 1000); // Default: 1 hora
    }
  }

  /**
   * Generar ID único para backup
   */
  private generateBackupId(): string {
    return `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generar ID único para job
   */
  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtener estadísticas de backups
   */
  getBackupStats(): BackupStats {
    const stats: BackupStats = {
      totalBackups: this.backupHistory.length,
      totalSize: this.backupHistory.reduce((sum, b) => sum + b.totalSize, 0),
      oldestBackup: this.backupHistory.length > 0 ? this.backupHistory[0].timestamp : '',
      newestBackup: this.backupHistory.length > 0 ? this.backupHistory[this.backupHistory.length - 1].timestamp : '',
      backupsByType: {
        full: this.backupHistory.filter(b => b.type === 'full').length,
        incremental: this.backupHistory.filter(b => b.type === 'incremental').length,
        differential: this.backupHistory.filter(b => b.type === 'differential').length
      },
      averageBackupSize: this.backupHistory.length > 0 ? 
        this.backupHistory.reduce((sum, b) => sum + b.totalSize, 0) / this.backupHistory.length : 0,
      successRate: this.backupHistory.length > 0 ? 
        this.backupHistory.filter(b => b.status === 'completed').length / this.backupHistory.length : 0,
      lastSuccessfulBackup: this.backupHistory
        .filter(b => b.status === 'completed')
        .slice(-1)[0]?.timestamp || ''
    };

    return stats;
  }

  /**
   * Listar backups disponibles
   */
  listBackups(type?: BackupType): BackupMetadata[] {
    if (type) {
      return this.backupHistory.filter(b => b.type === type);
    }
    return [...this.backupHistory];
  }

  /**
   * Destruir backup manager
   */
  async destroy(): Promise<void> {
    // Cancelar todos los timers
    for (const timer of this.scheduleTimers.values()) {
      clearTimeout(timer);
    }
    this.scheduleTimers.clear();
    
    // Destruir logger
    await this.logger.destroy();
    
    // Limpiar eventos
    this.removeAllListeners();
  }
}

// Instancia singleton del backup manager
export const backupManager = new BackupManager();