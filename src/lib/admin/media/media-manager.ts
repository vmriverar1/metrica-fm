/**
 * MediaManager - Sistema de gestión de archivos multimedia
 * 
 * Características:
 * - Upload de archivos con validación
 * - Optimización automática de imágenes
 * - Generación de thumbnails
 * - Validación de URLs externas
 * - Organización por tipo y fecha
 * - Control de tamaño y formato
 * - Metadata y etiquetado
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileManager } from '../core/file-manager';
import { logger } from '../core/logger';

// Tipos
export interface MediaFile {
  id: string;
  filename: string;
  original_name: string;
  path: string;
  url: string;
  type: MediaType;
  mime_type: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  thumbnail?: string;
  alt_text?: string;
  title?: string;
  description?: string;
  tags: string[];
  uploaded_by: string;
  uploaded_at: string;
  updated_at: string;
  metadata: Record<string, any>;
}

export type MediaType = 'image' | 'video' | 'audio' | 'document' | 'other';

export interface UploadOptions {
  allowedTypes?: string[];
  maxSize?: number; // bytes
  generateThumbnail?: boolean;
  optimizeImage?: boolean;
  prefix?: string;
  tags?: string[];
  alt_text?: string;
  title?: string;
  description?: string;
}

export interface MediaQuery {
  type?: MediaType;
  search?: string;
  tags?: string[];
  uploaded_by?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
  sort?: 'name' | 'date' | 'size' | 'type';
  order?: 'asc' | 'desc';
}

export interface MediaStats {
  total_files: number;
  total_size: number;
  files_by_type: Record<MediaType, number>;
  average_file_size: number;
  storage_usage_mb: number;
  recent_uploads: number;
}

// Constantes
const MEDIA_DIR = 'public/uploads';
const THUMBNAILS_DIR = 'public/uploads/thumbnails';
const MEDIA_INDEX_FILE = 'data/media-index.json';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB por defecto
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
const ALLOWED_AUDIO_TYPES = ['audio/mp3', 'audio/wav', 'audio/ogg'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'text/plain', 'application/json'];

/**
 * MediaManager - Gestor principal de medios
 */
export class MediaManager {
  private mediaIndex: MediaFile[] = [];
  private statsCache: { stats: MediaStats; expires: number } | null = null;

  constructor() {
    this.initializeMediaManager();
  }

  /**
   * Inicializar gestor de medios
   */
  private async initializeMediaManager(): Promise<void> {
    try {
      // Crear directorios necesarios
      await fs.mkdir(MEDIA_DIR, { recursive: true });
      await fs.mkdir(THUMBNAILS_DIR, { recursive: true });
      
      // Cargar índice de medios
      await this.loadMediaIndex();
      
      await logger.info('media', 'MediaManager initialized successfully', {
        totalFiles: this.mediaIndex.length
      });
      
    } catch (error) {
      await logger.error('media', 'Failed to initialize MediaManager', error);
      throw error;
    }
  }

  /**
   * Cargar índice de medios
   */
  private async loadMediaIndex(): Promise<void> {
    try {
      if (await fileManager.exists(MEDIA_INDEX_FILE)) {
        const data = await fileManager.readJSON<{ files: MediaFile[] }>(MEDIA_INDEX_FILE);
        this.mediaIndex = data.data.files || [];
      } else {
        this.mediaIndex = [];
        await this.saveMediaIndex();
      }
    } catch (error) {
      await logger.warn('media', 'Could not load media index, using empty list', { 
        error: error.message 
      });
      this.mediaIndex = [];
    }
  }

  /**
   * Guardar índice de medios
   */
  private async saveMediaIndex(): Promise<void> {
    await fileManager.writeJSON(MEDIA_INDEX_FILE, { 
      files: this.mediaIndex,
      updated_at: new Date().toISOString()
    }, {
      createBackup: true,
      ensureDirectory: true
    });
  }

  /**
   * Detectar tipo de media por MIME type
   */
  private getMediaType(mimeType: string): MediaType {
    if (ALLOWED_IMAGE_TYPES.includes(mimeType)) return 'image';
    if (ALLOWED_VIDEO_TYPES.includes(mimeType)) return 'video';
    if (ALLOWED_AUDIO_TYPES.includes(mimeType)) return 'audio';
    if (ALLOWED_DOCUMENT_TYPES.includes(mimeType)) return 'document';
    return 'other';
  }

  /**
   * Validar archivo subido
   */
  private validateFile(
    filename: string, 
    size: number, 
    mimeType: string, 
    options: UploadOptions = {}
  ): { valid: boolean; error?: string } {
    // Verificar tamaño
    const maxSize = options.maxSize || MAX_FILE_SIZE;
    if (size > maxSize) {
      return {
        valid: false,
        error: `File size ${(size / 1024 / 1024).toFixed(2)}MB exceeds maximum ${(maxSize / 1024 / 1024).toFixed(2)}MB`
      };
    }

    // Verificar tipo si se especifica
    if (options.allowedTypes && !options.allowedTypes.includes(mimeType)) {
      return {
        valid: false,
        error: `File type ${mimeType} not allowed. Allowed types: ${options.allowedTypes.join(', ')}`
      };
    }

    // Verificar tipos permitidos por defecto
    const allAllowedTypes = [
      ...ALLOWED_IMAGE_TYPES,
      ...ALLOWED_VIDEO_TYPES,
      ...ALLOWED_AUDIO_TYPES,
      ...ALLOWED_DOCUMENT_TYPES
    ];

    if (!allAllowedTypes.includes(mimeType)) {
      return {
        valid: false,
        error: `File type ${mimeType} not supported`
      };
    }

    return { valid: true };
  }

  /**
   * Generar nombre único para archivo
   */
  private generateUniqueFilename(originalName: string, prefix?: string): string {
    const ext = path.extname(originalName).toLowerCase();
    const baseName = path.basename(originalName, ext);
    const sanitizedName = baseName.replace(/[^a-zA-Z0-9-_]/g, '_');
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    
    const prefixPart = prefix ? `${prefix}_` : '';
    return `${prefixPart}${sanitizedName}_${timestamp}_${random}${ext}`;
  }

  /**
   * Obtener metadata de imagen
   */
  private async getImageMetadata(filePath: string): Promise<{ width?: number; height?: number }> {
    // Placeholder - en producción usar sharp o similar
    // Por ahora retornar metadata vacía
    return {};
  }

  /**
   * Generar thumbnail para imagen
   */
  private async generateThumbnail(
    sourceFile: string, 
    filename: string
  ): Promise<string | null> {
    try {
      // Placeholder - en producción usar sharp para generar thumbnail
      // Por ahora copiar el archivo original como thumbnail
      const thumbnailName = `thumb_${filename}`;
      const thumbnailPath = path.join(THUMBNAILS_DIR, thumbnailName);
      
      await fs.copyFile(sourceFile, thumbnailPath);
      
      return `/uploads/thumbnails/${thumbnailName}`;
    } catch (error) {
      await logger.warn('media', 'Failed to generate thumbnail', { 
        file: filename, 
        error: error.message 
      });
      return null;
    }
  }

  /**
   * Subir archivo
   */
  async uploadFile(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    uploadedBy: string,
    options: UploadOptions = {}
  ): Promise<MediaFile> {
    try {
      // Validar archivo
      const validation = this.validateFile(originalName, fileBuffer.length, mimeType, options);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Generar nombre único
      const filename = this.generateUniqueFilename(originalName, options.prefix);
      const filePath = path.join(MEDIA_DIR, filename);
      const relativeUrl = `/uploads/${filename}`;

      // Guardar archivo
      await fs.writeFile(filePath, fileBuffer);

      // Obtener tipo de media
      const mediaType = this.getMediaType(mimeType);

      // Crear registro de media
      const mediaFile: MediaFile = {
        id: `media_${crypto.randomBytes(8).toString('hex')}`,
        filename,
        original_name: originalName,
        path: filePath,
        url: relativeUrl,
        type: mediaType,
        mime_type: mimeType,
        size: fileBuffer.length,
        alt_text: options.alt_text || '',
        title: options.title || originalName,
        description: options.description || '',
        tags: options.tags || [],
        uploaded_by: uploadedBy,
        uploaded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {}
      };

      // Obtener metadata específica para imágenes
      if (mediaType === 'image') {
        const imageMetadata = await this.getImageMetadata(filePath);
        mediaFile.width = imageMetadata.width;
        mediaFile.height = imageMetadata.height;

        // Generar thumbnail si se solicita
        if (options.generateThumbnail !== false) {
          const thumbnailUrl = await this.generateThumbnail(filePath, filename);
          if (thumbnailUrl) {
            mediaFile.thumbnail = thumbnailUrl;
          }
        }
      }

      // Agregar al índice
      this.mediaIndex.push(mediaFile);
      await this.saveMediaIndex();

      // Limpiar caché de estadísticas
      this.statsCache = null;

      await logger.info('media', 'File uploaded successfully', {
        fileId: mediaFile.id,
        filename: mediaFile.filename,
        size: mediaFile.size,
        type: mediaFile.type,
        uploadedBy
      });

      return mediaFile;

    } catch (error) {
      await logger.error('media', 'Failed to upload file', error, {
        originalName,
        size: fileBuffer.length,
        uploadedBy
      });
      throw error;
    }
  }

  /**
   * Buscar archivos de media
   */
  async searchFiles(query: MediaQuery = {}): Promise<{
    files: MediaFile[];
    total: number;
    pagination: {
      offset: number;
      limit: number;
      hasMore: boolean;
    };
  }> {
    let filteredFiles = [...this.mediaIndex];

    // Filtrar por tipo
    if (query.type) {
      filteredFiles = filteredFiles.filter(file => file.type === query.type);
    }

    // Filtrar por búsqueda de texto
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      filteredFiles = filteredFiles.filter(file =>
        file.original_name.toLowerCase().includes(searchLower) ||
        file.title?.toLowerCase().includes(searchLower) ||
        file.description?.toLowerCase().includes(searchLower) ||
        file.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Filtrar por tags
    if (query.tags && query.tags.length > 0) {
      filteredFiles = filteredFiles.filter(file =>
        query.tags!.some(tag => file.tags.includes(tag))
      );
    }

    // Filtrar por usuario
    if (query.uploaded_by) {
      filteredFiles = filteredFiles.filter(file => file.uploaded_by === query.uploaded_by);
    }

    // Filtrar por fecha
    if (query.date_from) {
      const fromDate = new Date(query.date_from);
      filteredFiles = filteredFiles.filter(file => 
        new Date(file.uploaded_at) >= fromDate
      );
    }

    if (query.date_to) {
      const toDate = new Date(query.date_to);
      filteredFiles = filteredFiles.filter(file => 
        new Date(file.uploaded_at) <= toDate
      );
    }

    // Ordenar
    const sort = query.sort || 'date';
    const order = query.order || 'desc';

    filteredFiles.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sort) {
        case 'name':
          aValue = a.original_name;
          bValue = b.original_name;
          break;
        case 'size':
          aValue = a.size;
          bValue = b.size;
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'date':
        default:
          aValue = new Date(a.uploaded_at).getTime();
          bValue = new Date(b.uploaded_at).getTime();
          break;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return order === 'desc' ? -comparison : comparison;
      }

      if (order === 'desc') {
        return bValue - aValue;
      }
      return aValue - bValue;
    });

    // Paginación
    const offset = query.offset || 0;
    const limit = query.limit || 20;
    const paginatedFiles = filteredFiles.slice(offset, offset + limit);

    return {
      files: paginatedFiles,
      total: filteredFiles.length,
      pagination: {
        offset,
        limit,
        hasMore: offset + limit < filteredFiles.length
      }
    };
  }

  /**
   * Obtener archivo por ID
   */
  getFileById(id: string): MediaFile | null {
    return this.mediaIndex.find(file => file.id === id) || null;
  }

  /**
   * Actualizar metadata de archivo
   */
  async updateFile(
    id: string,
    updates: Partial<Pick<MediaFile, 'alt_text' | 'title' | 'description' | 'tags'>>,
    updatedBy: string
  ): Promise<MediaFile> {
    const fileIndex = this.mediaIndex.findIndex(file => file.id === id);
    if (fileIndex === -1) {
      throw new Error('File not found');
    }

    const file = this.mediaIndex[fileIndex];
    const updatedFile = {
      ...file,
      ...updates,
      updated_at: new Date().toISOString()
    };

    this.mediaIndex[fileIndex] = updatedFile;
    await this.saveMediaIndex();

    await logger.info('media', 'File metadata updated', {
      fileId: id,
      filename: file.filename,
      updatedBy,
      updates: Object.keys(updates)
    });

    return updatedFile;
  }

  /**
   * Eliminar archivo
   */
  async deleteFile(id: string, deletedBy: string): Promise<boolean> {
    const fileIndex = this.mediaIndex.findIndex(file => file.id === id);
    if (fileIndex === -1) {
      throw new Error('File not found');
    }

    const file = this.mediaIndex[fileIndex];

    try {
      // Eliminar archivo físico
      await fs.unlink(file.path);
      
      // Eliminar thumbnail si existe
      if (file.thumbnail) {
        const thumbnailPath = path.join(process.cwd(), 'public', file.thumbnail);
        try {
          await fs.unlink(thumbnailPath);
        } catch {
          // No es crítico si no se puede eliminar el thumbnail
        }
      }

      // Remover del índice
      this.mediaIndex.splice(fileIndex, 1);
      await this.saveMediaIndex();

      // Limpiar caché de estadísticas
      this.statsCache = null;

      await logger.info('media', 'File deleted successfully', {
        fileId: id,
        filename: file.filename,
        deletedBy
      });

      return true;

    } catch (error) {
      await logger.error('media', 'Failed to delete file', error, {
        fileId: id,
        filename: file.filename,
        deletedBy
      });
      throw error;
    }
  }

  /**
   * Validar URL externa
   */
  async validateExternalUrl(url: string): Promise<{
    valid: boolean;
    metadata?: {
      type: string;
      size?: number;
      width?: number;
      height?: number;
    };
    error?: string;
  }> {
    try {
      // Validar formato de URL
      new URL(url);

      // TODO: En producción, hacer request HEAD para validar que existe
      // Por ahora, asumir que URLs con formato válido son válidas
      
      return {
        valid: true,
        metadata: {
          type: 'external'
        }
      };

    } catch (error) {
      return {
        valid: false,
        error: 'Invalid URL format'
      };
    }
  }

  /**
   * Obtener estadísticas de medios
   */
  async getStats(): Promise<MediaStats> {
    // Usar caché si está disponible y no ha expirado
    if (this.statsCache && this.statsCache.expires > Date.now()) {
      return this.statsCache.stats;
    }

    const stats: MediaStats = {
      total_files: this.mediaIndex.length,
      total_size: this.mediaIndex.reduce((sum, file) => sum + file.size, 0),
      files_by_type: {
        image: 0,
        video: 0,
        audio: 0,
        document: 0,
        other: 0
      },
      average_file_size: 0,
      storage_usage_mb: 0,
      recent_uploads: 0
    };

    // Calcular estadísticas por tipo
    for (const file of this.mediaIndex) {
      stats.files_by_type[file.type]++;
    }

    // Calcular promedio
    if (stats.total_files > 0) {
      stats.average_file_size = stats.total_size / stats.total_files;
    }

    // Convertir a MB
    stats.storage_usage_mb = stats.total_size / (1024 * 1024);

    // Uploads recientes (últimas 24 horas)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    stats.recent_uploads = this.mediaIndex.filter(file => 
      new Date(file.uploaded_at) > yesterday
    ).length;

    // Cachear resultado por 5 minutos
    this.statsCache = {
      stats,
      expires: Date.now() + 5 * 60 * 1000
    };

    return stats;
  }

  /**
   * Obtener todos los tags utilizados
   */
  getAllTags(): string[] {
    const tagsSet = new Set<string>();
    for (const file of this.mediaIndex) {
      file.tags.forEach(tag => tagsSet.add(tag));
    }
    return Array.from(tagsSet).sort();
  }

  /**
   * Limpiar archivos huérfanos (archivos físicos sin registro en índice)
   */
  async cleanupOrphanedFiles(): Promise<{ cleaned: number; errors: number }> {
    let cleaned = 0;
    let errors = 0;

    try {
      // Listar archivos físicos
      const physicalFiles = await fs.readdir(MEDIA_DIR);
      const indexedFiles = this.mediaIndex.map(file => file.filename);

      // Encontrar archivos huérfanos
      const orphanedFiles = physicalFiles.filter(file => !indexedFiles.includes(file));

      for (const file of orphanedFiles) {
        try {
          await fs.unlink(path.join(MEDIA_DIR, file));
          cleaned++;
        } catch (error) {
          errors++;
          await logger.warn('media', `Failed to delete orphaned file: ${file}`, {
            error: error.message
          });
        }
      }

      if (cleaned > 0) {
        await logger.info('media', 'Cleanup completed', { cleaned, errors });
      }

    } catch (error) {
      await logger.error('media', 'Failed to cleanup orphaned files', error);
      errors++;
    }

    return { cleaned, errors };
  }
}

// Instancia singleton del media manager
export const mediaManager = new MediaManager();