/**
 * FileManager - Sistema de gestión de archivos JSON con bloqueo atómico
 * 
 * Características:
 * - Bloqueo de archivos para evitar colisiones en escrituras concurrentes
 * - Escritura atómica (write + rename) para garantizar integridad
 * - Control de versiones con ETags para detectar cambios concurrentes
 * - Manejo de errores robusto con rollback automático
 * - Compatible con hosting compartido
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { promisify } from 'util';

// Tipos
export interface FileMetadata {
  path: string;
  size: number;
  etag: string;
  lastModified: Date;
  version: string;
}

export interface WriteOptions {
  createBackup?: boolean;
  validateEtag?: string;
  ensureDirectory?: boolean;
  timeout?: number;
}

export interface ReadOptions {
  includeMetadata?: boolean;
  cache?: boolean;
}

export interface WriteResult {
  success: boolean;
  metadata: FileMetadata;
  previousEtag?: string;
  backupPath?: string;
}

export interface ReadResult<T = any> {
  data: T;
  metadata: FileMetadata;
  fromCache?: boolean;
}

// Errores personalizados
export class FileConflictError extends Error {
  constructor(
    message: string,
    public expectedEtag: string,
    public actualEtag: string
  ) {
    super(message);
    this.name = 'FileConflictError';
  }
}

export class FileLockError extends Error {
  constructor(message: string, public lockFile: string) {
    super(message);
    this.name = 'FileLockError';
  }
}

export class FileValidationError extends Error {
  constructor(message: string, public validationErrors: any[]) {
    super(message);
    this.name = 'FileValidationError';
  }
}

/**
 * FileManager - Gestor principal de archivos JSON
 */
export class FileManager {
  private locks: Map<string, Promise<any>> = new Map();
  private lockTimeout: number = 30000; // 30 segundos timeout por defecto
  private backupDir: string;

  constructor(
    private baseDir: string = 'public/json',
    private lockDir: string = 'data/locks'
  ) {
    this.backupDir = path.join('data', 'backups');
    this.ensureDirectories();
  }

  /**
   * Asegurar que los directorios necesarios existen
   */
  private async ensureDirectories(): Promise<void> {
    const dirs = [this.baseDir, this.lockDir, this.backupDir];
    
    for (const dir of dirs) {
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
      }
    }
  }

  /**
   * Generar ETag para un contenido
   */
  private generateEtag(content: string): string {
    return crypto.createHash('md5').update(content).digest('hex');
  }

  /**
   * Obtener ruta absoluta del archivo
   */
  private getFilePath(relativePath: string): string {
    return path.join(this.baseDir, relativePath);
  }

  /**
   * Obtener ruta del archivo de bloqueo
   */
  private getLockPath(filePath: string): string {
    const normalized = filePath.replace(/[^a-zA-Z0-9]/g, '_');
    return path.join(this.lockDir, `${normalized}.lock`);
  }

  /**
   * Obtener ruta de backup
   */
  private getBackupPath(filePath: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const basename = path.basename(filePath, '.json');
    return path.join(this.backupDir, `${basename}_${timestamp}.json`);
  }

  /**
   * Obtener metadata de un archivo
   */
  async getFileMetadata(relativePath: string): Promise<FileMetadata> {
    const filePath = this.getFilePath(relativePath);
    
    try {
      const stats = await fs.stat(filePath);
      const content = await fs.readFile(filePath, 'utf-8');
      const etag = this.generateEtag(content);
      
      return {
        path: relativePath,
        size: stats.size,
        etag,
        lastModified: stats.mtime,
        version: '1.0.0' // Por ahora versión fija, se puede mejorar
      };
    } catch (error) {
      throw new Error(`Failed to get metadata for ${relativePath}: ${error.message}`);
    }
  }

  /**
   * Adquirir bloqueo de archivo
   */
  private async acquireLock(filePath: string, timeout: number = this.lockTimeout): Promise<() => Promise<void>> {
    const lockPath = this.getLockPath(filePath);
    const lockKey = path.resolve(filePath);
    
    // Si ya hay un lock en proceso para este archivo, esperarlo
    if (this.locks.has(lockKey)) {
      await this.locks.get(lockKey);
    }

    const lockPromise = this.createLock(lockPath, timeout);
    this.locks.set(lockKey, lockPromise);

    try {
      const releaseLock = await lockPromise;
      
      return async () => {
        await releaseLock();
        this.locks.delete(lockKey);
      };
    } catch (error) {
      this.locks.delete(lockKey);
      throw error;
    }
  }

  /**
   * Crear bloqueo físico en el sistema de archivos
   */
  private async createLock(lockPath: string, timeout: number): Promise<() => Promise<void>> {
    const lockContent = JSON.stringify({
      pid: process.pid,
      timestamp: new Date().toISOString(),
      timeout: timeout
    });

    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        // Intentar crear el archivo de bloqueo (falla si ya existe)
        await fs.writeFile(lockPath, lockContent, { flag: 'wx' });
        
        // Bloqueo adquirido exitosamente
        return async () => {
          try {
            await fs.unlink(lockPath);
          } catch (error) {
            // No es crítico si no se puede eliminar el lock
            console.warn(`Warning: Could not remove lock file ${lockPath}:`, error.message);
          }
        };
      } catch (error) {
        if (error.code === 'EEXIST') {
          // El archivo de bloqueo ya existe, verificar si está vencido
          try {
            const existingLock = JSON.parse(await fs.readFile(lockPath, 'utf-8'));
            const lockAge = Date.now() - new Date(existingLock.timestamp).getTime();
            
            if (lockAge > (existingLock.timeout || this.lockTimeout)) {
              // El bloqueo está vencido, eliminarlo
              await fs.unlink(lockPath);
              continue; // Intentar de nuevo
            }
          } catch {
            // Si no se puede leer el archivo de bloqueo, eliminarlo
            try {
              await fs.unlink(lockPath);
              continue;
            } catch {}
          }
          
          // Esperar un poco antes de intentar de nuevo
          await this.sleep(100);
        } else {
          throw new FileLockError(`Failed to acquire lock: ${error.message}`, lockPath);
        }
      }
    }
    
    throw new FileLockError(`Lock acquisition timeout after ${timeout}ms`, lockPath);
  }

  /**
   * Utility para esperar
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Leer archivo JSON con metadatos opcionales
   */
  async readJSON<T = any>(relativePath: string, options: ReadOptions = {}): Promise<ReadResult<T>> {
    const filePath = this.getFilePath(relativePath);
    
    try {
      const [content, metadata] = await Promise.all([
        fs.readFile(filePath, 'utf-8'),
        options.includeMetadata ? this.getFileMetadata(relativePath) : null
      ]);
      
      const data = JSON.parse(content);
      
      const result: ReadResult<T> = {
        data,
        metadata: metadata || {
          path: relativePath,
          size: content.length,
          etag: this.generateEtag(content),
          lastModified: new Date(),
          version: '1.0.0'
        }
      };
      
      return result;
    } catch (error) {
      throw new Error(`Failed to read JSON file ${relativePath}: ${error.message}`);
    }
  }

  /**
   * Escribir archivo JSON con bloqueo atómico
   */
  async writeJSON<T = any>(
    relativePath: string, 
    data: T, 
    options: WriteOptions = {}
  ): Promise<WriteResult> {
    const filePath = this.getFilePath(relativePath);
    const tempPath = `${filePath}.tmp`;
    let releaseLock: (() => Promise<void>) | null = null;
    let backupPath: string | undefined;
    
    try {
      // Asegurar que el directorio existe
      if (options.ensureDirectory) {
        await fs.mkdir(path.dirname(filePath), { recursive: true });
      }
      
      // Adquirir bloqueo
      releaseLock = await this.acquireLock(filePath, options.timeout);
      
      // Verificar ETag si se proporciona (control de concurrencia optimista)
      if (options.validateEtag) {
        try {
          const currentContent = await fs.readFile(filePath, 'utf-8');
          const currentEtag = this.generateEtag(currentContent);
          
          if (currentEtag !== options.validateEtag) {
            throw new FileConflictError(
              'File has been modified by another process',
              options.validateEtag,
              currentEtag
            );
          }
        } catch (error) {
          if (error instanceof FileConflictError) throw error;
          // Si el archivo no existe, está bien (creación nueva)
        }
      }
      
      // Crear backup si se solicita
      if (options.createBackup) {
        try {
          backupPath = this.getBackupPath(filePath);
          await fs.copyFile(filePath, backupPath);
        } catch (error) {
          // Si no se puede hacer backup del archivo original, no es crítico
          // (puede ser que el archivo no exista aún)
        }
      }
      
      // Preparar contenido
      const content = JSON.stringify(data, null, 2);
      const newEtag = this.generateEtag(content);
      
      // Escritura atómica: escribir a archivo temporal, luego renombrar
      await fs.writeFile(tempPath, content, 'utf-8');
      await fs.rename(tempPath, filePath);
      
      // Obtener metadatos del archivo final
      const metadata = await this.getFileMetadata(relativePath);
      
      return {
        success: true,
        metadata,
        backupPath
      };
      
    } catch (error) {
      // Limpiar archivo temporal si existe
      try {
        await fs.unlink(tempPath);
      } catch {}
      
      throw error;
    } finally {
      // Liberar bloqueo
      if (releaseLock) {
        await releaseLock();
      }
    }
  }

  /**
   * Verificar si un archivo existe
   */
  async exists(relativePath: string): Promise<boolean> {
    try {
      await fs.access(this.getFilePath(relativePath));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Eliminar archivo con bloqueo
   */
  async deleteJSON(relativePath: string, createBackup: boolean = true): Promise<boolean> {
    const filePath = this.getFilePath(relativePath);
    let releaseLock: (() => Promise<void>) | null = null;
    
    try {
      // Verificar que el archivo existe
      if (!await this.exists(relativePath)) {
        return false;
      }
      
      // Adquirir bloqueo
      releaseLock = await this.acquireLock(filePath);
      
      // Crear backup antes de eliminar
      if (createBackup) {
        const backupPath = this.getBackupPath(filePath);
        await fs.copyFile(filePath, backupPath);
      }
      
      // Eliminar archivo
      await fs.unlink(filePath);
      
      return true;
    } catch (error) {
      throw new Error(`Failed to delete file ${relativePath}: ${error.message}`);
    } finally {
      if (releaseLock) {
        await releaseLock();
      }
    }
  }

  /**
   * Listar archivos en un directorio
   */
  async listFiles(directory: string = ''): Promise<string[]> {
    const dirPath = path.join(this.baseDir, directory);
    
    try {
      const items = await fs.readdir(dirPath, { withFileTypes: true });
      const files: string[] = [];
      
      for (const item of items) {
        if (item.isFile() && item.name.endsWith('.json')) {
          files.push(path.join(directory, item.name));
        } else if (item.isDirectory()) {
          const subdirFiles = await this.listFiles(path.join(directory, item.name));
          files.push(...subdirFiles);
        }
      }
      
      return files.sort();
    } catch (error) {
      throw new Error(`Failed to list files in ${directory}: ${error.message}`);
    }
  }

  /**
   * Limpiar archivos de bloqueo vencidos
   */
  async cleanupExpiredLocks(): Promise<number> {
    try {
      const lockFiles = await fs.readdir(this.lockDir);
      let cleaned = 0;
      
      for (const lockFile of lockFiles) {
        if (!lockFile.endsWith('.lock')) continue;
        
        const lockPath = path.join(this.lockDir, lockFile);
        
        try {
          const lockContent = JSON.parse(await fs.readFile(lockPath, 'utf-8'));
          const lockAge = Date.now() - new Date(lockContent.timestamp).getTime();
          const timeout = lockContent.timeout || this.lockTimeout;
          
          if (lockAge > timeout) {
            await fs.unlink(lockPath);
            cleaned++;
          }
        } catch (error) {
          // Si no se puede leer el archivo de bloqueo, eliminarlo
          try {
            await fs.unlink(lockPath);
            cleaned++;
          } catch {}
        }
      }
      
      return cleaned;
    } catch (error) {
      console.warn('Warning: Could not cleanup expired locks:', error.message);
      return 0;
    }
  }
}

// Instancia singleton del FileManager
export const fileManager = new FileManager();