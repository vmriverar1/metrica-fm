/**
 * useFileValidation - Hook para validación de archivos y detección de duplicados
 * Fase 1 del plan de mejora de upload de imágenes
 */

'use client';

import { useState, useCallback } from 'react';

export interface FileValidationResult {
  file: File;
  originalName: string;
  suggestedName: string;
  isDuplicate: boolean;
  conflictType: 'exact' | 'similar' | 'none';
}

export interface DuplicateResolution {
  action: 'replace' | 'rename' | 'skip';
  newName?: string;
}

export interface ValidationConfig {
  caseSensitive?: boolean;
  checkSimilarNames?: boolean;
  autoRename?: boolean;
  renamePattern?: string; // Default: "{name}-{number}.{ext}"
}

interface UseFileValidationReturn {
  validateFiles: (files: File[], existingImages: string[]) => FileValidationResult[];
  generateUniqueName: (fileName: string, existingNames: string[]) => string;
  extractFileName: (fileName: string) => { name: string; extension: string };
  getConflictFiles: (results: FileValidationResult[]) => FileValidationResult[];
  resolveConflicts: (
    conflicts: FileValidationResult[],
    resolutions: Record<string, DuplicateResolution>
  ) => { validFiles: File[]; renamedFiles: Record<string, string> };
}

export const useFileValidation = (config: ValidationConfig = {}): UseFileValidationReturn => {
  const {
    caseSensitive = false,
    checkSimilarNames = true,
    autoRename = false,
    renamePattern = "{name}-{number}.{ext}"
  } = config;

  // Extraer nombre y extensión de un archivo
  const extractFileName = useCallback((fileName: string) => {
    const lastDotIndex = fileName.lastIndexOf('.');

    if (lastDotIndex === -1) {
      return { name: fileName, extension: '' };
    }

    return {
      name: fileName.substring(0, lastDotIndex),
      extension: fileName.substring(lastDotIndex + 1).toLowerCase()
    };
  }, []);

  // Normalizar nombre para comparación
  const normalizeName = useCallback((name: string) => {
    return caseSensitive ? name : name.toLowerCase();
  }, [caseSensitive]);

  // Detectar similitud entre nombres
  const isSimilarName = useCallback((name1: string, name2: string) => {
    if (!checkSimilarNames) return false;

    const normalized1 = normalizeName(name1);
    const normalized2 = normalizeName(name2);

    // Verificar si es el mismo nombre base con número
    const regex1 = new RegExp(`^${normalized1.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-\\d+$`);
    const regex2 = new RegExp(`^${normalized2.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-\\d+$`);

    return regex1.test(normalized2) || regex2.test(normalized1) ||
           normalized1.startsWith(normalized2) || normalized2.startsWith(normalized1);
  }, [checkSimilarNames, normalizeName]);

  // Detectar tipo de conflicto
  const detectConflictType = useCallback((fileName: string, existingNames: string[]) => {
    const { name, extension } = extractFileName(fileName);
    const normalizedFileName = normalizeName(fileName);

    for (const existingName of existingNames) {
      const normalizedExisting = normalizeName(existingName);

      // Conflicto exacto
      if (normalizedFileName === normalizedExisting) {
        return 'exact' as const;
      }

      // Verificar solo nombres base (sin extensión) para similitud
      const { name: existingBaseName } = extractFileName(existingName);
      if (isSimilarName(name, existingBaseName)) {
        return 'similar' as const;
      }
    }

    return 'none' as const;
  }, [extractFileName, normalizeName, isSimilarName]);

  // Generar nombre único
  const generateUniqueName = useCallback((fileName: string, existingNames: string[]) => {
    const { name, extension } = extractFileName(fileName);
    const ext = extension ? `.${extension}` : '';

    // Si no hay conflicto, devolver el nombre original
    if (detectConflictType(fileName, existingNames) === 'none') {
      return fileName;
    }

    let counter = 1;
    let newName: string;

    do {
      newName = renamePattern
        .replace('{name}', name)
        .replace('{number}', counter.toString())
        .replace('{ext}', ext);
      counter++;
    } while (
      existingNames.some(existing =>
        normalizeName(existing) === normalizeName(newName)
      ) && counter < 100 // Límite de seguridad
    );

    return newName;
  }, [extractFileName, detectConflictType, renamePattern, normalizeName]);

  // Validar lista de archivos
  const validateFiles = useCallback((files: File[], existingImages: string[]) => {
    // Extraer solo nombres de archivos de las URLs existentes
    const existingFileNames = existingImages.map(url => {
      const urlParts = url.split('/');
      return urlParts[urlParts.length - 1];
    });

    const results: FileValidationResult[] = files.map(file => {
      const conflictType = detectConflictType(file.name, existingFileNames);
      const isDuplicate = conflictType !== 'none';

      let suggestedName = file.name;

      if (isDuplicate && autoRename) {
        suggestedName = generateUniqueName(file.name, existingFileNames);
      }

      const result: FileValidationResult = {
        file,
        originalName: file.name,
        suggestedName,
        isDuplicate,
        conflictType
      };

      return result;
    });

    return results;
  }, [caseSensitive, checkSimilarNames, autoRename, detectConflictType, generateUniqueName]);

  // Obtener solo archivos con conflictos
  const getConflictFiles = useCallback((results: FileValidationResult[]) => {
    return results.filter(result => result.isDuplicate);
  }, []);

  // Resolver conflictos según las decisiones del usuario
  const resolveConflicts = useCallback((
    conflicts: FileValidationResult[],
    resolutions: Record<string, DuplicateResolution>
  ) => {
    const validFiles: File[] = [];
    const renamedFiles: Record<string, string> = {};

    conflicts.forEach(conflict => {
      const resolution = resolutions[conflict.originalName];

      if (!resolution) {
        return;
      }

      switch (resolution.action) {
        case 'replace':
          validFiles.push(conflict.file);
          break;

        case 'rename':
          const newName = resolution.newName || conflict.suggestedName;

          // Crear nuevo File con nombre modificado
          const renamedFile = new File([conflict.file], newName, {
            type: conflict.file.type,
            lastModified: conflict.file.lastModified
          });

          validFiles.push(renamedFile);
          renamedFiles[conflict.originalName] = newName;
          break;

        case 'skip':
          break;

        default:
          break;
      }
    });

    return { validFiles, renamedFiles };
  }, []);

  return {
    validateFiles,
    generateUniqueName,
    extractFileName,
    getConflictFiles,
    resolveConflicts
  };
};

export default useFileValidation;