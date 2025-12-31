/**
 * API Route: POST /api/admin/media/upload
 * Upload de archivos multimedia a Firebase Storage
 * Fase 3: Migración a Firebase Storage (solo nuevas imágenes van a Firebase)
 */

import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { uploadToStorage, generateDateFolder } from '@/lib/firebase-storage';

// Configuración de upload a Firebase
// Límite para archivo ORIGINAL (antes de procesar) - permite imágenes de cámaras profesionales
const MAX_ORIGINAL_FILE_SIZE = 50 * 1024 * 1024; // 50MB para el archivo original
// Límite para archivo PROCESADO (después de redimensionar y comprimir)
const MAX_PROCESSED_FILE_SIZE = 10 * 1024 * 1024; // 10MB para el archivo final
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/avif'
];

const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime', // .mov
  'video/x-msvideo'  // .avi
];

const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

// Límite de video: 100MB
const MAX_VIDEO_FILE_SIZE = 100 * 1024 * 1024;

// Configuración de procesamiento por defecto
const DEFAULT_PROCESSING_CONFIG = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 85,
  enableWebP: true,   // Habilitado: convierte a WebP para mejor rendimiento
  enableResize: true  // Habilitado: redimensiona imágenes grandes
};

// Utilidad para generar nombre único de archivo
const generateUniqueFileName = (originalName: string): string => {
  const ext = path.extname(originalName);
  const nameWithoutExt = path.basename(originalName, ext);
  const cleanName = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
  const timestamp = Date.now();
  const uuid = uuidv4().split('-')[0]; // Solo los primeros 8 caracteres
  return `${cleanName}-${timestamp}-${uuid}${ext}`;
};

const validateImageDimensions = async (buffer: Buffer): Promise<{ width: number; height: number }> => {
  try {
    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width || 0,
      height: metadata.height || 0
    };
  } catch (error) {
    console.warn('[VALIDATION] Error getting image dimensions:', error);
    return { width: 0, height: 0 };
  }
};

const processImage = async (
  buffer: Buffer,
  originalType: string,
  config = DEFAULT_PROCESSING_CONFIG
): Promise<{
  processedBuffer: Buffer;
  finalType: string;
  wasResized: boolean;
  wasConverted: boolean;
  finalDimensions: { width: number; height: number };
}> => {
  try {
    // .rotate() sin parámetros aplica la rotación EXIF automáticamente
    // Esto corrige fotos verticales que se muestran horizontales
    let image = sharp(buffer).rotate();
    const metadata = await image.metadata();

    let wasResized = false;
    let wasConverted = false;
    let finalType = originalType;

    const originalWidth = metadata.width || 0;
    const originalHeight = metadata.height || 0;

    // Redimensionar solo si el ancho excede el máximo
    // Solo se reduce el ancho, el alto se calcula automáticamente para mantener proporción
    // Si la imagen es más pequeña que maxWidth, no se redimensiona
    if (config.enableResize && originalWidth > config.maxWidth) {
      image = image.resize(config.maxWidth, null, {
        withoutEnlargement: true,
        fit: 'inside' // Mantiene aspect ratio
      });
      wasResized = true;
      console.log(`[PROCESSING] Resizing image: ${originalWidth}px width → ${config.maxWidth}px width (height auto)`);
    }

    // Convertir a WebP si está habilitado
    // No convertir: SVG (vectorial), GIF (animaciones), PNG (transparencia/logos)
    if (config.enableWebP && originalType !== 'image/webp' && originalType !== 'image/svg+xml' && originalType !== 'image/gif' && originalType !== 'image/png') {
      image = image.webp({
        quality: config.quality,
        effort: 4 // Balance entre velocidad y compresión (0-6)
      });
      finalType = 'image/webp';
      wasConverted = true;
      console.log(`[PROCESSING] Converting to WebP: ${originalType} → ${finalType}`);
    } else if (!wasConverted) {
      // Si no se convierte a WebP, aplicar optimizaciones al formato original
      if (originalType === 'image/jpeg' || originalType === 'image/jpg') {
        image = image.jpeg({ quality: config.quality, progressive: true });
      } else if (originalType === 'image/png') {
        image = image.png({ compressionLevel: 9 });
      }
    }

    const processedBuffer = await image.toBuffer();
    const finalMetadata = await sharp(processedBuffer).metadata();

    const finalWidth = finalMetadata.width || 0;
    const finalHeight = finalMetadata.height || 0;
    const compressionRatio = processedBuffer.length / buffer.length;

    console.log(`[PROCESSING] Complete: ${originalWidth}x${originalHeight} → ${finalWidth}x${finalHeight}, ${Math.round(buffer.length/1024)}KB → ${Math.round(processedBuffer.length/1024)}KB (${Math.round(compressionRatio * 100)}%)`);

    return {
      processedBuffer,
      finalType,
      wasResized,
      wasConverted,
      finalDimensions: {
        width: finalWidth,
        height: finalHeight
      }
    };

  } catch (error) {
    console.error('[PROCESSING] Error processing image:', error);
    // Retornar buffer original en caso de error
    const originalDimensions = await validateImageDimensions(buffer);
    return {
      processedBuffer: buffer,
      finalType: originalType,
      wasResized: false,
      wasConverted: false,
      finalDimensions: originalDimensions
    };
  }
};

// Funciones de metadata y duplicados eliminadas (Firebase Storage maneja esto automáticamente)

export async function POST(request: NextRequest) {
  console.log('[UPLOAD-FIREBASE] POST endpoint called at:', new Date().toISOString());
  console.log('[UPLOAD-FIREBASE] Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PHASE: process.env.NEXT_PHASE,
    BUILDING: process.env.BUILDING,
    hasFirebaseProjectId: !!process.env.FIREBASE_PROJECT_ID,
    hasFirebaseConfig: !!process.env.FIREBASE_CONFIG,
    hasGoogleApplicationCredentials: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
    hasK_SERVICE: !!process.env.K_SERVICE,
    K_SERVICE: process.env.K_SERVICE
  });

  const startTime = Date.now();

  try {
    console.log('[UPLOAD-FIREBASE] Starting upload to Firebase Storage...');

    const formData = await request.formData();

    // Soportar tanto 'file' (singular) como 'files' (plural)
    let files = formData.getAll('files') as File[];
    if (files.length === 0) {
      const singleFile = formData.get('file') as File;
      if (singleFile) {
        files = [singleFile];
      }
    }

    const enableProcessing = (formData.get('enableProcessing') as string) !== 'false';

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No se proporcionaron archivos' },
        { status: 400 }
      );
    }

    console.log(`[UPLOAD-FIREBASE] Processing ${files.length} files for Firebase Storage...`);

    const results = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileId = uuidv4();

      try {
        console.log(`[UPLOAD-FIREBASE] Processing file ${i + 1}/${files.length}: ${file.name}`);

        // Validaciones básicas
        if (!ALLOWED_TYPES.includes(file.type)) {
          errors.push({
            file: file.name,
            error: 'Tipo de archivo no permitido'
          });
          continue;
        }

        // Determinar si es video o imagen
        const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
        const maxSize = isVideo ? MAX_VIDEO_FILE_SIZE : MAX_ORIGINAL_FILE_SIZE;

        // Validar tamaño del archivo según tipo
        if (file.size > maxSize) {
          errors.push({
            file: file.name,
            error: `Archivo demasiado grande (máximo ${maxSize / 1024 / 1024}MB para ${isVideo ? 'videos' : 'imágenes'}).`
          });
          continue;
        }

        // Generar carpeta con fecha (formato: images/DD-MM-YYYY o videos/DD-MM-YYYY)
        const baseFolderPath = generateDateFolder();
        const folderPath = isVideo ? baseFolderPath.replace('images/', 'videos/') : baseFolderPath;
        console.log(`[UPLOAD-FIREBASE] Using folder: ${folderPath} (${isVideo ? 'video' : 'image'})`);

        // Generar nombre único para el archivo
        let fileName = generateUniqueFileName(file.name);

        // Procesar archivo
        const originalBuffer = Buffer.from(await file.arrayBuffer());

        let finalBuffer = originalBuffer;
        let finalType = file.type;
        let wasResized = false;
        let wasConverted = false;
        let finalDimensions = { width: 0, height: 0 };

        // Solo procesar imágenes, NO videos
        if (!isVideo) {
          const originalDimensions = await validateImageDimensions(originalBuffer);
          finalDimensions = originalDimensions;

          if (enableProcessing && file.type.startsWith('image/') && file.type !== 'image/svg+xml') {
            // Log para imágenes grandes (útil para debugging)
            if (file.size > 10 * 1024 * 1024) {
              console.log(`[UPLOAD-FIREBASE] Procesando imagen grande de cámara profesional: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB, ${originalDimensions.width}x${originalDimensions.height}px)`);
            }
            const processed = await processImage(originalBuffer, file.type);
            finalBuffer = processed.processedBuffer;
            finalType = processed.finalType;
            wasResized = processed.wasResized;
            wasConverted = processed.wasConverted;
            finalDimensions = processed.finalDimensions;

            // Actualizar extensión del archivo si se convirtió
            if (wasConverted && finalType === 'image/webp') {
              const nameWithoutExt = path.basename(fileName, path.extname(fileName));
              fileName = `${nameWithoutExt}.webp`;
            }
          }

          // Validar tamaño del archivo PROCESADO (solo para imágenes)
          if (finalBuffer.length > MAX_PROCESSED_FILE_SIZE) {
            console.error(`[UPLOAD-FIREBASE] Archivo procesado sigue siendo muy grande: ${Math.round(finalBuffer.length / 1024 / 1024)}MB`);
            errors.push({
              file: file.name,
              error: `El archivo procesado (${(finalBuffer.length / 1024 / 1024).toFixed(2)}MB) sigue excediendo el límite de ${MAX_PROCESSED_FILE_SIZE / 1024 / 1024}MB. Intente con una imagen de menor resolución.`
            });
            continue;
          }
        } else {
          // Para videos, simplemente log el tamaño
          console.log(`[UPLOAD-FIREBASE] Subiendo video sin procesar: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        }

        // Determinar content type
        const contentType = finalType;

        // Subir a Firebase Storage
        console.log(`[UPLOAD-FIREBASE] Uploading ${fileName} to ${folderPath}...`);
        const uploadResult = await uploadToStorage(
          finalBuffer,
          fileName,
          folderPath,
          contentType
        );

        if (!uploadResult.success || !uploadResult.downloadURL) {
          console.error(`[UPLOAD-FIREBASE] Upload failed:`, uploadResult.error);
          errors.push({
            file: file.name,
            error: uploadResult.error || 'Upload to Firebase failed'
          });
          continue;
        }

        const downloadURL = uploadResult.downloadURL;

        // Agregar a resultados
        results.push({
          id: `firebase-${Buffer.from(`${folderPath}/${fileName}`).toString('base64')}`,
          name: fileName,
          path: `${folderPath}/${fileName}`,
          url: downloadURL,
          size: finalBuffer.length,
          type: finalType,
          lastModified: new Date().toISOString(),
          originalName: file.name,
          dimensions: finalDimensions,
          source: 'firebase',
          downloadURL: downloadURL,
          optimizations: {
            wasResized,
            wasConverted,
            originalSize: file.size,
            finalSize: finalBuffer.length,
            compressionRatio: finalBuffer.length / file.size
          }
        });

        console.log(`[UPLOAD-FIREBASE] File uploaded successfully: ${downloadURL} (${Math.round(finalBuffer.length / 1024)}KB)`);

      } catch (fileError) {
        console.error(`[UPLOAD] Error processing file ${file.name}:`, fileError);
        errors.push({
          file: file.name,
          error: 'Error interno procesando archivo'
        });
      }
    }

    const processingTime = Date.now() - startTime;
    const totalOptimizations = results.filter(r => r.optimizations?.wasResized || r.optimizations?.wasConverted).length;

    console.log(`[UPLOAD-FIREBASE] Process completed in ${processingTime}ms. ${results.length}/${files.length} files uploaded to Firebase Storage. ${totalOptimizations} optimized.`);

    // Si es un solo archivo (probablemente desde ImageField), devolver respuesta simplificada
    if (files.length === 1 && results.length === 1) {
      return NextResponse.json({
        success: true,
        message: 'Archivo subido exitosamente a Firebase Storage',
        url: results[0].url,  // ImageField espera 'url' directamente
        downloadURL: results[0].downloadURL,
        // Mantener compatibilidad con otros componentes
        images: results,
        stats: {
          totalFiles: 1,
          successfulUploads: 1,
          failedUploads: errors.length,
          totalOptimizations,
          processingTimeMs: processingTime,
          storage: 'firebase'
        }
      });
    }

    // Respuesta para múltiples archivos
    return NextResponse.json({
      success: true,
      message: `${results.length} archivo${results.length !== 1 ? 's' : ''} subido${results.length !== 1 ? 's' : ''} exitosamente a Firebase Storage`,
      images: results,
      errors: errors.length > 0 ? errors : undefined,
      stats: {
        totalFiles: files.length,
        successfulUploads: results.length,
        failedUploads: errors.length,
        totalOptimizations,
        processingTimeMs: processingTime,
        storage: 'firebase'
      }
    });

  } catch (error) {
    console.error('[UPLOAD-FIREBASE ERROR]:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Error interno del servidor durante la subida a Firebase Storage',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

// Método OPTIONS para CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'POST, OPTIONS',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}