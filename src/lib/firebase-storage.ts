/**
 * Firebase Storage Utilities
 *
 * Provides helper functions for uploading, listing, and managing files in Firebase Storage
 */

import { getStorage } from 'firebase-admin/storage';
import { getFirebaseAdmin } from './firebase-admin-safe';

/**
 * IMPORTANTE: El bucket name debe ser explícito en producción
 * bucket() sin parámetros puede fallar si storageBucket no se configura correctamente
 * durante la inicialización de Firebase Admin
 */
const STORAGE_BUCKET_NAME = 'metrica-fm.firebasestorage.app';

/**
 * Helper para obtener el bucket de forma consistente
 * En producción intenta usar el default primero, en local usa explícito
 */
function getStorageBucket(app: any) {
  const isFirebaseAppHosting = !!process.env.K_SERVICE;
  const isProduction = process.env.NODE_ENV === 'production';

  // Log para debugging
  console.log('[getStorageBucket] Environment check:', {
    isFirebaseAppHosting,
    isProduction,
    K_SERVICE: process.env.K_SERVICE
  });

  if (isFirebaseAppHosting || isProduction) {
    // En Firebase App Hosting o producción, intentar usar el bucket default primero
    try {
      const bucket = getStorage(app).bucket();
      console.log('[getStorageBucket] Using default bucket from app config:', bucket.name);
      return bucket;
    } catch (error) {
      console.log('[getStorageBucket] Default bucket failed:', error);
      console.log('[getStorageBucket] Falling back to explicit bucket:', STORAGE_BUCKET_NAME);
      return getStorage(app).bucket(STORAGE_BUCKET_NAME);
    }
  } else {
    // En local, siempre usar bucket explícito
    console.log('[getStorageBucket] Local - using explicit bucket:', STORAGE_BUCKET_NAME);
    return getStorage(app).bucket(STORAGE_BUCKET_NAME);
  }
}

/**
 * Upload a file to Firebase Storage
 *
 * @param file - File buffer to upload
 * @param fileName - Name of the file
 * @param folder - Folder path (e.g., 'images/proyectos/22-10-2025')
 * @param contentType - MIME type of the file
 * @returns Download URL of the uploaded file
 */
export async function uploadToStorage(
  file: Buffer,
  fileName: string,
  folder: string,
  contentType: string
): Promise<{ success: boolean; downloadURL?: string; error?: string }> {
  try {
    console.log('[uploadToStorage] Starting upload:', { fileName, folder, contentType, size: file.length });

    const { app } = await getFirebaseAdmin();

    if (!app) {
      console.error('[uploadToStorage] Firebase Admin not initialized');
      return {
        success: false,
        error: 'Firebase Admin not initialized'
      };
    }

    // Obtener bucket usando el helper
    const bucket = getStorageBucket(app);
    console.log('[uploadToStorage] Using bucket:', bucket.name);

    // Construct full path
    const filePath = `${folder}/${fileName}`;
    console.log('[uploadToStorage] Full path:', filePath);

    const fileUpload = bucket.file(filePath);

    // Upload file
    console.log('[uploadToStorage] Saving file to bucket...');
    await fileUpload.save(file, {
      metadata: {
        contentType,
        metadata: {
          uploadedAt: new Date().toISOString(),
          source: 'admin-upload'
        }
      }
    });
    console.log('[uploadToStorage] File saved successfully');

    // Make file publicly accessible
    console.log('[uploadToStorage] Making file public...');
    try {
      await fileUpload.makePublic();
      console.log('[uploadToStorage] File is now public');
    } catch (publicError) {
      console.error('[uploadToStorage] Error making file public:', publicError);
      // Continuar de todos modos, tal vez las reglas ya lo hacen público
    }

    // Verificar que el archivo existe
    const [exists] = await fileUpload.exists();
    console.log('[uploadToStorage] File exists after upload:', exists);

    // Obtener metadata para verificar
    if (exists) {
      const [metadata] = await fileUpload.getMetadata();
      console.log('[uploadToStorage] File metadata:', {
        name: metadata.name,
        bucket: metadata.bucket,
        contentType: metadata.contentType,
        size: metadata.size,
        public: metadata.metadata
      });
    }

    // Get public URL - usar el formato correcto
    // IMPORTANTE: El bucket name en la URL debe ser el correcto
    const publicBucketName = bucket.name.replace('gs://', '');
    const downloadURL = `https://storage.googleapis.com/${publicBucketName}/${filePath}`;
    console.log('[uploadToStorage] Generated download URL:', downloadURL);
    console.log('[uploadToStorage] Bucket name used:', publicBucketName);
    console.log('[uploadToStorage] File path used:', filePath);

    return {
      success: true,
      downloadURL
    };
  } catch (error) {
    console.error('[uploadToStorage] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * List all files in a specific folder
 *
 * @param folder - Folder path to list (e.g., 'images/proyectos')
 * @returns Array of file metadata
 */
export async function listStorageFiles(folder?: string): Promise<{
  success: boolean;
  files?: Array<{
    name: string;
    path: string;
    size: number;
    contentType: string;
    created: string;
    updated: string;
    downloadURL: string;
  }>;
  error?: string;
}> {
  console.log('[listStorageFiles] Starting with folder:', folder);

  try {
    const { app } = await getFirebaseAdmin();

    if (!app) {
      console.error('[listStorageFiles] Firebase Admin not initialized');
      return {
        success: false,
        error: 'Firebase Admin not initialized'
      };
    }

    // Obtener bucket usando el helper
    const bucket = getStorageBucket(app);
    console.log('[listStorageFiles] Using bucket:', bucket.name);

    // List files with optional prefix
    console.log('[listStorageFiles] Listing files with prefix:', folder || 'images/');

    let files;
    try {
      [files] = await bucket.getFiles({
        prefix: folder || 'images/'
      });
      console.log('[listStorageFiles] Found', files.length, 'files');
    } catch (listError) {
      console.error('[listStorageFiles] Error listing files:', listError);
      throw listError;
    }

    // Map to simpler format
    const fileList = await Promise.all(
      files.map(async (file) => {
        const [metadata] = await file.getMetadata();

        // Get public URL - asegurar formato correcto
        const publicBucketName = bucket.name.replace('gs://', '');
        const downloadURL = `https://storage.googleapis.com/${publicBucketName}/${file.name}`;

        console.log('[listStorageFiles] File:', file.name, '-> URL:', downloadURL);

        return {
          name: file.name.split('/').pop() || file.name,
          path: file.name,
          size: parseInt(metadata.size || '0'),
          contentType: metadata.contentType || 'application/octet-stream',
          created: metadata.timeCreated || new Date().toISOString(),
          updated: metadata.updated || new Date().toISOString(),
          downloadURL
        };
      })
    );

    return {
      success: true,
      files: fileList
    };
  } catch (error) {
    console.error('[listStorageFiles] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get download URL for a specific file
 *
 * @param filePath - Full path to the file in storage
 * @returns Public download URL
 */
export async function getDownloadURL(filePath: string): Promise<{
  success: boolean;
  downloadURL?: string;
  error?: string;
}> {
  try {
    const { app } = await getFirebaseAdmin();

    if (!app) {
      return {
        success: false,
        error: 'Firebase Admin not initialized'
      };
    }

    const bucket = getStorageBucket(app);
    const file = bucket.file(filePath);

    // Check if file exists
    const [exists] = await file.exists();
    if (!exists) {
      return {
        success: false,
        error: 'File not found'
      };
    }

    // Get public URL
    const downloadURL = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    return {
      success: true,
      downloadURL
    };
  } catch (error) {
    console.error('[getDownloadURL] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Delete a file from Firebase Storage
 *
 * @param filePath - Full path to the file in storage
 * @returns Success status
 */
export async function deleteFromStorage(filePath: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { app } = await getFirebaseAdmin();

    if (!app) {
      return {
        success: false,
        error: 'Firebase Admin not initialized'
      };
    }

    const bucket = getStorageBucket(app);
    const file = bucket.file(filePath);

    // Check if file exists
    const [exists] = await file.exists();
    if (!exists) {
      return {
        success: false,
        error: 'File not found'
      };
    }

    // Delete file
    await file.delete();

    return {
      success: true
    };
  } catch (error) {
    console.error('[deleteFromStorage] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get file metadata
 *
 * @param filePath - Full path to the file in storage
 * @returns File metadata
 */
export async function getFileMetadata(filePath: string): Promise<{
  success: boolean;
  metadata?: {
    name: string;
    size: number;
    contentType: string;
    created: string;
    updated: string;
  };
  error?: string;
}> {
  try {
    const { app } = await getFirebaseAdmin();

    if (!app) {
      return {
        success: false,
        error: 'Firebase Admin not initialized'
      };
    }

    const bucket = getStorageBucket(app);
    const file = bucket.file(filePath);

    // Check if file exists
    const [exists] = await file.exists();
    if (!exists) {
      return {
        success: false,
        error: 'File not found'
      };
    }

    // Get metadata
    const [metadata] = await file.getMetadata();

    return {
      success: true,
      metadata: {
        name: file.name.split('/').pop() || file.name,
        size: parseInt(metadata.size || '0'),
        contentType: metadata.contentType || 'application/octet-stream',
        created: metadata.timeCreated || new Date().toISOString(),
        updated: metadata.updated || new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('[getFileMetadata] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Generate folder path based on current date
 * Format: images/proyectos/DD-MM-YYYY
 *
 * @returns Folder path string
 */
export function generateDateFolder(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();

  return `images/proyectos/${day}-${month}-${year}`;
}

/**
 * Check if Firebase Storage is available
 *
 * @returns Boolean indicating availability
 */
export async function isStorageAvailable(): Promise<boolean> {
  try {
    const { app } = await getFirebaseAdmin();
    return !!app;
  } catch {
    return false;
  }
}
