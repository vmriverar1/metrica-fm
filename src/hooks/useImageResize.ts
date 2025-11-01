/**
 * useImageResize - Hook para redimensionar imágenes manteniendo aspect ratio
 * Fase 2 del plan de mejora de upload de imágenes
 */

'use client';

import { useState, useCallback } from 'react';

export interface ResizeConfig {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maintainAspectRatio?: boolean;
  enableResize?: boolean;
}

export interface ResizeResult {
  originalFile: File;
  resizedBlob: Blob | null;
  originalDimensions: { width: number; height: number };
  finalDimensions: { width: number; height: number };
  wasResized: boolean;
  compressionRatio: number;
}

interface UseImageResizeReturn {
  resizeImage: (file: File, config?: ResizeConfig) => Promise<ResizeResult>;
  resizeMultipleImages: (files: File[], config?: ResizeConfig) => Promise<ResizeResult[]>;
  calculateDimensions: (width: number, height: number, maxWidth: number, maxHeight?: number) => { width: number; height: number };
  isResizeNeeded: (width: number, height: number, maxWidth: number, maxHeight?: number) => boolean;
  getImageDimensions: (file: File) => Promise<{ width: number; height: number }>;
}

export const useImageResize = (): UseImageResizeReturn => {
  const [isProcessing, setIsProcessing] = useState(false);

  // Obtener dimensiones de una imagen desde un File
  const getImageDimensions = useCallback((file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Error loading image for dimension calculation'));
      };

      img.src = url;
    });
  }, []);

  // Calcular nuevas dimensiones manteniendo aspect ratio
  const calculateDimensions = useCallback((
    width: number,
    height: number,
    maxWidth: number,
    maxHeight?: number
  ) => {
    if (!maxHeight) {
      // Solo ancho máximo especificado
      if (width <= maxWidth) {
        return { width, height };
      }

      const aspectRatio = height / width;
      return {
        width: maxWidth,
        height: Math.round(maxWidth * aspectRatio)
      };
    }

    // Ambos ancho y alto máximo especificados
    if (width <= maxWidth && height <= maxHeight) {
      return { width, height };
    }

    const widthRatio = maxWidth / width;
    const heightRatio = maxHeight / height;
    const ratio = Math.min(widthRatio, heightRatio);

    return {
      width: Math.round(width * ratio),
      height: Math.round(height * ratio)
    };
  }, []);

  // Verificar si se necesita redimensionar
  const isResizeNeeded = useCallback((
    width: number,
    height: number,
    maxWidth: number,
    maxHeight?: number
  ) => {
    if (maxHeight) {
      return width > maxWidth || height > maxHeight;
    }
    return width > maxWidth;
  }, []);

  // Redimensionar una imagen usando Canvas API
  const resizeImage = useCallback(async (
    file: File,
    config: ResizeConfig = {}
  ): Promise<ResizeResult> => {
    const {
      maxWidth = 1800,
      maxHeight,
      quality = 0.9,
      maintainAspectRatio = true,
      enableResize = true
    } = config;

    console.log('🖼️ [ImageResize] Procesando:', {
      fileName: file.name,
      fileSize: file.size,
      maxWidth,
      enableResize
    });

    try {
      // Obtener dimensiones originales
      const originalDimensions = await getImageDimensions(file);

      console.log('📐 [ImageResize] Dimensiones originales:', originalDimensions);

      // Verificar si se necesita redimensionar
      if (!enableResize || !isResizeNeeded(originalDimensions.width, originalDimensions.height, maxWidth, maxHeight)) {
        console.log('✅ [ImageResize] No se requiere redimensionado');
        return {
          originalFile: file,
          resizedBlob: null,
          originalDimensions,
          finalDimensions: originalDimensions,
          wasResized: false,
          compressionRatio: 1
        };
      }

      // Calcular nuevas dimensiones
      const finalDimensions = maintainAspectRatio
        ? calculateDimensions(originalDimensions.width, originalDimensions.height, maxWidth, maxHeight)
        : { width: maxWidth, height: maxHeight || originalDimensions.height };

      console.log('🎯 [ImageResize] Nuevas dimensiones:', finalDimensions);

      // Crear imagen y canvas
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('No se pudo obtener contexto 2D del canvas');
      }

      // Configurar canvas
      canvas.width = finalDimensions.width;
      canvas.height = finalDimensions.height;

      // Cargar imagen
      const imageUrl = URL.createObjectURL(file);

      return new Promise((resolve, reject) => {
        img.onload = () => {
          try {
            // Configurar suavizado para mejor calidad
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Dibujar imagen redimensionada
            ctx.drawImage(img, 0, 0, finalDimensions.width, finalDimensions.height);

            // Convertir a blob
            canvas.toBlob(
              (blob) => {
                URL.revokeObjectURL(imageUrl);

                if (!blob) {
                  reject(new Error('Error generando blob redimensionado'));
                  return;
                }

                const compressionRatio = blob.size / file.size;

                console.log('✅ [ImageResize] Redimensionado exitoso:', {
                  originalSize: file.size,
                  newSize: blob.size,
                  compression: `${Math.round((1 - compressionRatio) * 100)}%`,
                  finalDimensions
                });

                resolve({
                  originalFile: file,
                  resizedBlob: blob,
                  originalDimensions,
                  finalDimensions,
                  wasResized: true,
                  compressionRatio
                });
              },
              file.type.startsWith('image/png') ? 'image/png' : 'image/jpeg',
              quality
            );
          } catch (error) {
            URL.revokeObjectURL(imageUrl);
            reject(error);
          }
        };

        img.onerror = () => {
          URL.revokeObjectURL(imageUrl);
          reject(new Error('Error cargando imagen para redimensionar'));
        };

        img.src = imageUrl;
      });

    } catch (error) {
      console.error('❌ [ImageResize] Error redimensionando imagen:', error);

      // Retornar archivo original en caso de error
      return {
        originalFile: file,
        resizedBlob: null,
        originalDimensions: { width: 0, height: 0 },
        finalDimensions: { width: 0, height: 0 },
        wasResized: false,
        compressionRatio: 1
      };
    }
  }, [getImageDimensions, calculateDimensions, isResizeNeeded]);

  // Redimensionar múltiples imágenes
  const resizeMultipleImages = useCallback(async (
    files: File[],
    config: ResizeConfig = {}
  ): Promise<ResizeResult[]> => {
    console.log(`🔄 [ImageResize] Procesando ${files.length} imágenes...`);
    setIsProcessing(true);

    try {
      const results: ResizeResult[] = [];

      // Procesar imágenes de una en una para evitar sobrecarga de memoria
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`🔄 [ImageResize] Procesando ${i + 1}/${files.length}: ${file.name}`);

        try {
          const result = await resizeImage(file, config);
          results.push(result);
        } catch (error) {
          console.error(`❌ [ImageResize] Error procesando ${file.name}:`, error);

          // Agregar resultado con error pero mantener archivo original
          results.push({
            originalFile: file,
            resizedBlob: null,
            originalDimensions: { width: 0, height: 0 },
            finalDimensions: { width: 0, height: 0 },
            wasResized: false,
            compressionRatio: 1
          });
        }
      }

      const resizedCount = results.filter(r => r.wasResized).length;
      console.log(`✅ [ImageResize] Procesamiento completado: ${resizedCount}/${files.length} imágenes redimensionadas`);

      return results;
    } finally {
      setIsProcessing(false);
    }
  }, [resizeImage]);

  return {
    resizeImage,
    resizeMultipleImages,
    calculateDimensions,
    isResizeNeeded,
    getImageDimensions
  };
};

export default useImageResize;