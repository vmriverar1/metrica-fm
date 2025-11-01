/**
 * useWebPConversion - Hook para conversión automática a formato WebP
 * Fase 3 del plan de mejora de upload de imágenes
 */

'use client';

import { useState, useCallback, useEffect } from 'react';

export interface WebPConfig {
  quality?: number;
  enableWebP?: boolean;
  fallbackToOriginal?: boolean;
  preservePNG?: boolean; // Mantener PNG para imágenes con transparencia
  detectSupport?: boolean;
}

export interface ConversionResult {
  originalFile: File;
  convertedBlob: Blob | null;
  originalFormat: string;
  finalFormat: string;
  wasConverted: boolean;
  compressionRatio: number;
  supportedByBrowser: boolean;
}

interface UseWebPConversionReturn {
  convertToWebP: (file: File, config?: WebPConfig) => Promise<ConversionResult>;
  convertMultipleToWebP: (files: File[], config?: WebPConfig) => Promise<ConversionResult[]>;
  detectWebPSupport: () => Promise<boolean>;
  getOptimalQuality: (imageType: string) => number;
  shouldConvertToWebP: (file: File, config?: WebPConfig) => boolean;
  isWebPSupported: boolean;
}

export const useWebPConversion = (): UseWebPConversionReturn => {
  const [isWebPSupported, setIsWebPSupported] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Detectar soporte WebP del navegador
  const detectWebPSupport = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        const isSupported = webP.height === 2;
        console.log('🔍 [WebP] Soporte detectado:', isSupported);
        resolve(isSupported);
      };
      // Imagen WebP de 1x1 pixel codificada en base64
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }, []);

  // Obtener calidad óptima según tipo de imagen
  const getOptimalQuality = useCallback((imageType: string): number => {
    if (imageType.includes('png')) {
      // PNG suele ser gráficos/ilustraciones, usar mayor calidad
      return 0.9;
    } else if (imageType.includes('jpeg') || imageType.includes('jpg')) {
      // JPEG suele ser fotografías, usar calidad balanceada
      return 0.85;
    } else {
      // Otros formatos, calidad estándar
      return 0.87;
    }
  }, []);

  // Verificar si un archivo debe convertirse a WebP
  const shouldConvertToWebP = useCallback((file: File, config: WebPConfig = {}): boolean => {
    const {
      enableWebP = true,
      preservePNG = true
    } = config;

    if (!enableWebP || !isWebPSupported) {
      return false;
    }

    // No convertir si ya es WebP
    if (file.type === 'image/webp') {
      return false;
    }

    // Preservar PNG si tiene transparencia (simplificado)
    if (preservePNG && file.type === 'image/png') {
      console.log('🎨 [WebP] Preservando PNG (posible transparencia):', file.name);
      return false;
    }

    // Convertir JPEG, JPG y otros formatos compatibles
    return file.type.startsWith('image/') &&
           !file.type.includes('svg') &&
           !file.type.includes('gif');
  }, [isWebPSupported]);

  // Convertir una imagen a WebP
  const convertToWebP = useCallback(async (
    file: File,
    config: WebPConfig = {}
  ): Promise<ConversionResult> => {
    const {
      quality,
      enableWebP = true,
      fallbackToOriginal = true
    } = config;

    console.log('🔄 [WebP] Procesando:', {
      fileName: file.name,
      originalType: file.type,
      enableWebP,
      isSupported: isWebPSupported
    });

    const defaultResult: ConversionResult = {
      originalFile: file,
      convertedBlob: null,
      originalFormat: file.type,
      finalFormat: file.type,
      wasConverted: false,
      compressionRatio: 1,
      supportedByBrowser: isWebPSupported
    };

    // Verificar si debe convertirse
    if (!shouldConvertToWebP(file, config)) {
      console.log('✅ [WebP] No se requiere conversión para:', file.name);
      return defaultResult;
    }

    try {
      // Determinar calidad óptima
      const optimalQuality = quality || getOptimalQuality(file.type);

      console.log('🎯 [WebP] Convirtiendo con calidad:', optimalQuality);

      // Crear imagen y canvas
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('No se pudo obtener contexto 2D del canvas');
      }

      // Cargar imagen
      const imageUrl = URL.createObjectURL(file);

      return new Promise((resolve) => {
        img.onload = () => {
          try {
            // Configurar canvas con dimensiones originales
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;

            // Configurar rendering de alta calidad
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Dibujar imagen
            ctx.drawImage(img, 0, 0);

            // Convertir a WebP
            canvas.toBlob(
              (blob) => {
                URL.revokeObjectURL(imageUrl);

                if (!blob) {
                  console.warn('⚠️ [WebP] Error generando blob, usando original');
                  resolve(defaultResult);
                  return;
                }

                const compressionRatio = blob.size / file.size;

                console.log('✅ [WebP] Conversión exitosa:', {
                  originalSize: file.size,
                  newSize: blob.size,
                  compression: `${Math.round((1 - compressionRatio) * 100)}%`,
                  format: 'WebP'
                });

                // Crear nuevo nombre con extensión .webp
                const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
                const webpName = `${nameWithoutExt}.webp`;

                resolve({
                  originalFile: file,
                  convertedBlob: blob,
                  originalFormat: file.type,
                  finalFormat: 'image/webp',
                  wasConverted: true,
                  compressionRatio,
                  supportedByBrowser: isWebPSupported
                });
              },
              'image/webp',
              optimalQuality
            );
          } catch (error) {
            URL.revokeObjectURL(imageUrl);
            console.error('❌ [WebP] Error durante conversión:', error);

            if (fallbackToOriginal) {
              console.log('🔄 [WebP] Usando imagen original como fallback');
              resolve(defaultResult);
            } else {
              resolve(defaultResult);
            }
          }
        };

        img.onerror = () => {
          URL.revokeObjectURL(imageUrl);
          console.error('❌ [WebP] Error cargando imagen para conversión');
          resolve(defaultResult);
        };

        img.src = imageUrl;
      });

    } catch (error) {
      console.error('❌ [WebP] Error en conversión:', error);
      return defaultResult;
    }
  }, [isWebPSupported, shouldConvertToWebP, getOptimalQuality]);

  // Convertir múltiples imágenes a WebP
  const convertMultipleToWebP = useCallback(async (
    files: File[],
    config: WebPConfig = {}
  ): Promise<ConversionResult[]> => {
    console.log(`🔄 [WebP] Convirtiendo ${files.length} imágenes a WebP...`);
    setIsProcessing(true);

    try {
      const results: ConversionResult[] = [];

      // Procesar imágenes de una en una para evitar sobrecarga
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`🔄 [WebP] Procesando ${i + 1}/${files.length}: ${file.name}`);

        try {
          const result = await convertToWebP(file, config);
          results.push(result);
        } catch (error) {
          console.error(`❌ [WebP] Error procesando ${file.name}:`, error);

          // Agregar resultado con archivo original
          results.push({
            originalFile: file,
            convertedBlob: null,
            originalFormat: file.type,
            finalFormat: file.type,
            wasConverted: false,
            compressionRatio: 1,
            supportedByBrowser: isWebPSupported
          });
        }
      }

      const convertedCount = results.filter(r => r.wasConverted).length;
      const totalSavings = results.reduce((acc, r) => {
        if (r.wasConverted) {
          return acc + (1 - r.compressionRatio);
        }
        return acc;
      }, 0);

      const avgSavings = convertedCount > 0 ? (totalSavings / convertedCount * 100) : 0;

      console.log(`✅ [WebP] Conversión completada:`, {
        converted: `${convertedCount}/${files.length}`,
        avgCompression: `${Math.round(avgSavings)}%`
      });

      return results;
    } finally {
      setIsProcessing(false);
    }
  }, [convertToWebP, isWebPSupported]);

  // Detectar soporte al inicializar el hook
  useEffect(() => {
    detectWebPSupport().then(setIsWebPSupported);
  }, [detectWebPSupport]);

  return {
    convertToWebP,
    convertMultipleToWebP,
    detectWebPSupport,
    getOptimalQuality,
    shouldConvertToWebP,
    isWebPSupported
  };
};

export default useWebPConversion;