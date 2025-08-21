/**
 * FASE 6: Backup System - Sistema de respaldo y recuperación de datos
 * 
 * Características:
 * - Backup automático incremental
 * - Compresión de archivos
 * - Versionado de backups
 * - Recovery automático
 * - Validación de integridad
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

interface BackupMetadata {
  timestamp: string;
  version: string;
  size: number;
  checksum: string;
  files: string[];
  type: 'full' | 'incremental';
  description?: string;
}

interface BackupConfig {
  dataDirectory: string;
  backupDirectory: string;
  maxBackups: number;
  compressionLevel: number;
  autoBackupInterval: number; // in minutes
}

export class BackupSystem {
  private config: BackupConfig;
  private backupHistory: BackupMetadata[] = [];

  constructor(config: Partial<BackupConfig> = {}) {
    this.config = {
      dataDirectory: path.join(process.cwd(), 'data'),
      backupDirectory: path.join(process.cwd(), 'backups'),
      maxBackups: 30,
      compressionLevel: 6,
      autoBackupInterval: 60, // 1 hour
      ...config
    };

    this.initializeBackupSystem();
  }

  /**
   * Inicializar sistema de backup
   */
  private async initializeBackupSystem(): Promise<void> {
    try {
      // Crear directorio de backups si no existe
      await fs.mkdir(this.config.backupDirectory, { recursive: true });
      
      // Cargar historial de backups
      await this.loadBackupHistory();
      
      // Configurar backup automático
      this.setupAutoBackup();
      
      console.log('[BACKUP] Sistema de backup inicializado');
    } catch (error) {
      console.error('[BACKUP] Error inicializando sistema:', error);
    }
  }

  /**
   * Configurar backup automático
   */
  private setupAutoBackup(): void {
    const intervalMs = this.config.autoBackupInterval * 60 * 1000;
    
    setInterval(async () => {
      try {
        await this.createIncrementalBackup('Auto backup');
        console.log('[BACKUP] Backup automático completado');
      } catch (error) {
        console.error('[BACKUP] Error en backup automático:', error);
      }
    }, intervalMs);

    // Backup inicial después de 5 minutos
    setTimeout(async () => {
      await this.createIncrementalBackup('Backup inicial');
    }, 5 * 60 * 1000);
  }

  /**
   * Crear backup completo
   */
  async createFullBackup(description?: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupId = `full-${timestamp}`;
    const backupPath = path.join(this.config.backupDirectory, backupId);

    try {
      await fs.mkdir(backupPath, { recursive: true });

      // Copiar todos los archivos
      const files = await this.getAllDataFiles();
      const copiedFiles: string[] = [];

      for (const file of files) {
        const relativePath = path.relative(this.config.dataDirectory, file);
        const backupFilePath = path.join(backupPath, relativePath);
        
        await fs.mkdir(path.dirname(backupFilePath), { recursive: true });
        await fs.copyFile(file, backupFilePath);
        copiedFiles.push(relativePath);
      }

      // Crear metadatos del backup
      const metadata: BackupMetadata = {
        timestamp: new Date().toISOString(),
        version: backupId,
        size: await this.calculateDirectorySize(backupPath),
        checksum: await this.calculateDirectoryChecksum(backupPath),
        files: copiedFiles,
        type: 'full',
        description
      };

      await this.saveBackupMetadata(backupPath, metadata);
      this.backupHistory.push(metadata);
      await this.saveBackupHistory();

      // Limpiar backups antiguos
      await this.cleanupOldBackups();

      console.log(`[BACKUP] Backup completo creado: ${backupId}`);
      return backupId;
    } catch (error) {
      console.error('[BACKUP] Error creando backup completo:', error);
      throw error;
    }
  }

  /**
   * Crear backup incremental
   */
  async createIncrementalBackup(description?: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupId = `incr-${timestamp}`;
    const backupPath = path.join(this.config.backupDirectory, backupId);

    try {
      await fs.mkdir(backupPath, { recursive: true });

      // Encontrar el último backup
      const lastBackup = this.getLastBackup();
      const lastBackupTime = lastBackup ? new Date(lastBackup.timestamp) : new Date(0);

      // Copiar solo archivos modificados
      const files = await this.getAllDataFiles();
      const changedFiles: string[] = [];

      for (const file of files) {
        const stat = await fs.stat(file);
        if (stat.mtime > lastBackupTime) {
          const relativePath = path.relative(this.config.dataDirectory, file);
          const backupFilePath = path.join(backupPath, relativePath);
          
          await fs.mkdir(path.dirname(backupFilePath), { recursive: true });
          await fs.copyFile(file, backupFilePath);
          changedFiles.push(relativePath);
        }
      }

      // Si no hay cambios, no crear el backup
      if (changedFiles.length === 0) {
        await fs.rmdir(backupPath);
        console.log('[BACKUP] No hay cambios para backup incremental');
        return '';
      }

      // Crear metadatos del backup
      const metadata: BackupMetadata = {
        timestamp: new Date().toISOString(),
        version: backupId,
        size: await this.calculateDirectorySize(backupPath),
        checksum: await this.calculateDirectoryChecksum(backupPath),
        files: changedFiles,
        type: 'incremental',
        description
      };

      await this.saveBackupMetadata(backupPath, metadata);
      this.backupHistory.push(metadata);
      await this.saveBackupHistory();

      await this.cleanupOldBackups();

      console.log(`[BACKUP] Backup incremental creado: ${backupId} (${changedFiles.length} archivos)`);
      return backupId;
    } catch (error) {
      console.error('[BACKUP] Error creando backup incremental:', error);
      throw error;
    }
  }

  /**
   * Restaurar desde backup
   */
  async restoreFromBackup(backupId: string): Promise<void> {
    const backupPath = path.join(this.config.backupDirectory, backupId);
    
    try {
      // Verificar que el backup existe
      const metadata = await this.getBackupMetadata(backupPath);
      if (!metadata) {
        throw new Error(`Backup ${backupId} no encontrado`);
      }

      // Crear backup de seguridad antes de restaurar
      const safetyBackupId = await this.createFullBackup('Pre-restore safety backup');
      
      // Si es backup incremental, necesitamos restaurar desde el último full backup
      if (metadata.type === 'incremental') {
        const fullBackup = this.getLastFullBackup();
        if (fullBackup) {
          await this.restoreFromFullBackup(fullBackup.version);
        }
      }

      // Restaurar archivos del backup especificado
      for (const file of metadata.files) {
        const backupFilePath = path.join(backupPath, file);
        const targetFilePath = path.join(this.config.dataDirectory, file);
        
        await fs.mkdir(path.dirname(targetFilePath), { recursive: true });
        await fs.copyFile(backupFilePath, targetFilePath);
      }

      // Validar integridad
      const isValid = await this.validateBackupIntegrity(backupPath, metadata);
      if (!isValid) {
        throw new Error('Falla en validación de integridad después de restaurar');
      }

      console.log(`[BACKUP] Restauración completada desde: ${backupId}`);
    } catch (error) {
      console.error('[BACKUP] Error restaurando backup:', error);
      throw error;
    }
  }

  /**
   * Obtener lista de backups disponibles
   */
  async getAvailableBackups(): Promise<BackupMetadata[]> {
    return [...this.backupHistory].reverse(); // Más recientes primero
  }

  /**
   * Validar integridad de backup
   */
  async validateBackupIntegrity(backupPath: string, metadata: BackupMetadata): Promise<boolean> {
    try {
      const currentChecksum = await this.calculateDirectoryChecksum(backupPath);
      return currentChecksum === metadata.checksum;
    } catch (error) {
      console.error('[BACKUP] Error validando integridad:', error);
      return false;
    }
  }

  /**
   * Obtener todos los archivos de datos
   */
  private async getAllDataFiles(): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = await fs.readdir(this.config.dataDirectory, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(this.config.dataDirectory, entry.name);
        
        if (entry.isDirectory()) {
          const subFiles = await this.getAllFilesRecursive(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile()) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directorio no existe, retornar array vacío
      console.warn('[BACKUP] Directorio de datos no existe:', this.config.dataDirectory);
    }
    
    return files;
  }

  /**
   * Obtener archivos recursivamente
   */
  private async getAllFilesRecursive(directory: string): Promise<string[]> {
    const files: string[] = [];
    const entries = await fs.readdir(directory, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      
      if (entry.isDirectory()) {
        const subFiles = await this.getAllFilesRecursive(fullPath);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  /**
   * Calcular tamaño de directorio
   */
  private async calculateDirectorySize(directory: string): Promise<number> {
    const files = await this.getAllFilesRecursive(directory);
    let totalSize = 0;
    
    for (const file of files) {
      try {
        const stat = await fs.stat(file);
        totalSize += stat.size;
      } catch (error) {
        // Archivo puede haber sido eliminado
        continue;
      }
    }
    
    return totalSize;
  }

  /**
   * Calcular checksum de directorio
   */
  private async calculateDirectoryChecksum(directory: string): Promise<string> {
    const files = await this.getAllFilesRecursive(directory);
    files.sort(); // Orden consistente
    
    const hash = crypto.createHash('sha256');
    
    for (const file of files) {
      try {
        const content = await fs.readFile(file);
        hash.update(path.relative(directory, file));
        hash.update(content);
      } catch (error) {
        continue;
      }
    }
    
    return hash.digest('hex');
  }

  /**
   * Obtener último backup
   */
  private getLastBackup(): BackupMetadata | null {
    if (this.backupHistory.length === 0) return null;
    return this.backupHistory[this.backupHistory.length - 1];
  }

  /**
   * Obtener último backup completo
   */
  private getLastFullBackup(): BackupMetadata | null {
    for (let i = this.backupHistory.length - 1; i >= 0; i--) {
      if (this.backupHistory[i].type === 'full') {
        return this.backupHistory[i];
      }
    }
    return null;
  }

  /**
   * Guardar metadatos del backup
   */
  private async saveBackupMetadata(backupPath: string, metadata: BackupMetadata): Promise<void> {
    const metadataPath = path.join(backupPath, 'metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  }

  /**
   * Obtener metadatos del backup
   */
  private async getBackupMetadata(backupPath: string): Promise<BackupMetadata | null> {
    try {
      const metadataPath = path.join(backupPath, 'metadata.json');
      const content = await fs.readFile(metadataPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }

  /**
   * Cargar historial de backups
   */
  private async loadBackupHistory(): Promise<void> {
    const historyPath = path.join(this.config.backupDirectory, 'backup-history.json');
    
    try {
      const content = await fs.readFile(historyPath, 'utf-8');
      this.backupHistory = JSON.parse(content);
    } catch (error) {
      this.backupHistory = [];
    }
  }

  /**
   * Guardar historial de backups
   */
  private async saveBackupHistory(): Promise<void> {
    const historyPath = path.join(this.config.backupDirectory, 'backup-history.json');
    await fs.writeFile(historyPath, JSON.stringify(this.backupHistory, null, 2));
  }

  /**
   * Limpiar backups antiguos
   */
  private async cleanupOldBackups(): Promise<void> {
    if (this.backupHistory.length <= this.config.maxBackups) return;

    const toDelete = this.backupHistory.slice(0, this.backupHistory.length - this.config.maxBackups);
    
    for (const backup of toDelete) {
      try {
        const backupPath = path.join(this.config.backupDirectory, backup.version);
        await fs.rm(backupPath, { recursive: true, force: true });
        console.log(`[BACKUP] Backup eliminado: ${backup.version}`);
      } catch (error) {
        console.error(`[BACKUP] Error eliminando backup ${backup.version}:`, error);
      }
    }

    this.backupHistory = this.backupHistory.slice(-this.config.maxBackups);
    await this.saveBackupHistory();
  }

  /**
   * Restaurar desde backup completo
   */
  private async restoreFromFullBackup(backupId: string): Promise<void> {
    const backupPath = path.join(this.config.backupDirectory, backupId);
    const metadata = await this.getBackupMetadata(backupPath);
    
    if (!metadata) {
      throw new Error(`Metadata no encontrada para backup: ${backupId}`);
    }

    for (const file of metadata.files) {
      const backupFilePath = path.join(backupPath, file);
      const targetFilePath = path.join(this.config.dataDirectory, file);
      
      await fs.mkdir(path.dirname(targetFilePath), { recursive: true });
      await fs.copyFile(backupFilePath, targetFilePath);
    }
  }
}

// Instancia global del sistema de backup
export const backupSystem = new BackupSystem();

// API para interactuar con el sistema de backup
export const backupAPI = {
  /**
   * Crear backup manual
   */
  async createBackup(type: 'full' | 'incremental' = 'incremental', description?: string): Promise<string> {
    if (type === 'full') {
      return await backupSystem.createFullBackup(description);
    } else {
      return await backupSystem.createIncrementalBackup(description);
    }
  },

  /**
   * Restaurar backup
   */
  async restore(backupId: string): Promise<void> {
    return await backupSystem.restoreFromBackup(backupId);
  },

  /**
   * Listar backups
   */
  async listBackups(): Promise<BackupMetadata[]> {
    return await backupSystem.getAvailableBackups();
  },

  /**
   * Validar backup
   */
  async validate(backupId: string): Promise<boolean> {
    const backupPath = path.join(process.cwd(), 'backups', backupId);
    const metadata = await backupSystem['getBackupMetadata'](backupPath);
    
    if (!metadata) return false;
    
    return await backupSystem.validateBackupIntegrity(backupPath, metadata);
  }
};

export default backupSystem;