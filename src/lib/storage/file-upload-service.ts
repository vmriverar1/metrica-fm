/**
 * Servicio para subir archivos a Firebase Storage
 * Especializado en CVs y documentos de postulaciones laborales
 */

import { ref, uploadBytesResumable, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase/config';

// Bucket de Firebase Storage
const STORAGE_BUCKET = 'metrica-fm.firebasestorage.app';

// Configuración de validación
const FILE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: [
    'application/pdf',
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
  ],
  ALLOWED_EXTENSIONS: ['.pdf', '.doc', '.docx']
};

interface UploadProgress {
  progress: number;
  bytesTransferred: number;
  totalBytes: number;
}

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  fileName?: string;
  filePath?: string;
}

/**
 * Valida un archivo antes de subirlo
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Validar tamaño
  if (file.size > FILE_CONFIG.MAX_SIZE) {
    return {
      valid: false,
      error: `El archivo es demasiado grande. Máximo permitido: ${FILE_CONFIG.MAX_SIZE / 1024 / 1024}MB`
    };
  }

  // Validar tipo MIME
  if (!FILE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipo de archivo no permitido. Solo se aceptan PDF, DOC y DOCX'
    };
  }

  // Validar extensión
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!FILE_CONFIG.ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: 'Extensión de archivo no válida. Solo se aceptan .pdf, .doc y .docx'
    };
  }

  return { valid: true };
}

/**
 * Sanitiza el nombre del archivo
 */
export function sanitizeFileName(fileName: string): string {
  // Remover caracteres peligrosos y espacios
  const sanitized = fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Reemplazar caracteres especiales
    .replace(/_{2,}/g, '_') // Reemplazar múltiples guiones bajos
    .replace(/^_+|_+$/g, ''); // Remover guiones bajos al inicio/fin

  // Asegurar que tenga extensión válida
  const parts = sanitized.split('.');
  const extension = parts.pop()?.toLowerCase() || 'pdf';
  const baseName = parts.join('_') || 'document';

  return `${baseName}.${extension}`;
}

/**
 * Genera un nombre único para el archivo
 */
export function generateUniqueFileName(originalName: string, jobId: string): string {
  const sanitized = sanitizeFileName(originalName);
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);

  const parts = sanitized.split('.');
  const extension = parts.pop();
  const baseName = parts.join('_');

  return `${timestamp}_${randomSuffix}_${baseName}.${extension}`;
}

/**
 * Genera una URL pública permanente para un archivo en Firebase Storage
 * Esta URL no requiere autenticación y no expira (mientras las reglas lo permitan)
 */
export function generatePublicUrl(filePath: string): string {
  // Codificar el path para la URL (reemplazar / por %2F)
  const encodedPath = encodeURIComponent(filePath);
  return `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${encodedPath}?alt=media`;
}

/**
 * Genera una URL de descarga segura usando nuestro proxy API
 * Esta URL pasa por nuestro servidor y permite descargar archivos protegidos
 */
export function generateSecureDownloadUrl(filePath: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://metricafm.com';
  const timestamp = Date.now();
  const data = `${filePath}:${timestamp}:metrica-secret`;
  const token = Buffer.from(data).toString('base64url');

  return `${baseUrl}/api/files/download?path=${encodeURIComponent(filePath)}&token=${token}`;
}

/**
 * Sube un archivo a Firebase Storage
 */
export async function uploadJobApplicationFile(
  file: File,
  jobId: string,
  fileType: 'resume' | 'coverLetter',
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  try {
    // Validar archivo
    const validation = validateFile(file);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error
      };
    }

    // Generar nombre único y seguro
    const uniqueFileName = generateUniqueFileName(file.name, jobId);
    const filePath = `job-applications/${jobId}/${fileType}_${uniqueFileName}`;

    // Crear referencia en Storage
    const storageRef = ref(storage, filePath);

    // Configurar metadata
    const metadata = {
      contentType: file.type,
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        fileType: fileType,
        jobId: jobId
      }
    };

    // Subir archivo con seguimiento de progreso
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Calcular progreso
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

          if (onProgress) {
            onProgress({
              progress,
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes
            });
          }

          console.log(`Upload ${fileType}: ${progress.toFixed(2)}%`);
        },
        (error) => {
          // Error durante la subida
          console.error('Error uploading file:', error);
          resolve({
            success: false,
            error: `Error al subir archivo: ${error.message}`
          });
        },
        async () => {
          // Subida completada exitosamente
          // Usar URL segura a través de nuestro proxy API
          const secureUrl = generateSecureDownloadUrl(filePath);

          console.log('✅ File uploaded successfully:', {
            fileName: uniqueFileName,
            url: secureUrl,
            path: filePath
          });

          resolve({
            success: true,
            url: secureUrl,
            fileName: uniqueFileName,
            filePath: filePath
          });
        }
      );
    });
  } catch (error) {
    console.error('Error in uploadJobApplicationFile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al subir archivo'
    };
  }
}

/**
 * Elimina un archivo de Storage (útil para limpiar archivos antiguos)
 */
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
    console.log('✅ File deleted successfully:', filePath);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

/**
 * Formatea el tamaño del archivo para mostrar
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
