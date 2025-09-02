'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useDebounce } from './useDebounce';

interface AutoSaveOptions {
  delay?: number;
  maxRetries?: number;
  onSave?: (data: any) => Promise<boolean>;
  onSaveStart?: () => void;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
  enabled?: boolean;
}

interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  saveError: Error | null;
  saveCount: number;
}

export function useAutoSave(data: any, options: AutoSaveOptions = {}) {
  const {
    delay = 30000, // 30 segundos por defecto
    maxRetries = 3,
    onSave,
    onSaveStart,
    onSaveSuccess,
    onSaveError,
    enabled = true
  } = options;

  const [state, setState] = useState<AutoSaveState>({
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,
    saveError: null,
    saveCount: 0
  });

  const retryCountRef = useRef(0);
  const lastDataRef = useRef<any>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce los datos para evitar guardados excesivos
  const debouncedData = useDebounce(data, 1000);

  // Función de guardado con reintentos
  const performSave = useCallback(async (dataToSave: any) => {
    if (!onSave || !enabled) return;

    setState(prev => ({ ...prev, isSaving: true, saveError: null }));
    onSaveStart?.();

    try {
      const success = await onSave(dataToSave);
      
      if (success) {
        setState(prev => ({
          ...prev,
          isSaving: false,
          lastSaved: new Date(),
          hasUnsavedChanges: false,
          saveError: null,
          saveCount: prev.saveCount + 1
        }));
        onSaveSuccess?.();
        retryCountRef.current = 0;
      } else {
        throw new Error('Save operation returned false');
      }
    } catch (error) {
      const saveError = error instanceof Error ? error : new Error('Unknown save error');
      
      retryCountRef.current += 1;
      
      if (retryCountRef.current < maxRetries) {
        // Retry con backoff exponencial
        const retryDelay = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000);
        setTimeout(() => performSave(dataToSave), retryDelay);
      } else {
        setState(prev => ({
          ...prev,
          isSaving: false,
          saveError,
          hasUnsavedChanges: true
        }));
        onSaveError?.(saveError);
        retryCountRef.current = 0;
      }
    }
  }, [onSave, onSaveStart, onSaveSuccess, onSaveError, maxRetries, enabled]);

  // Efecto principal de auto-save
  useEffect(() => {
    if (!enabled || !onSave) return;

    // Verificar si los datos han cambiado
    const dataString = JSON.stringify(debouncedData);
    const lastDataString = JSON.stringify(lastDataRef.current);

    if (dataString !== lastDataString && lastDataRef.current !== null) {
      setState(prev => ({ ...prev, hasUnsavedChanges: true }));
      
      // Limpiar timeout anterior si existe
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Programar nuevo guardado
      saveTimeoutRef.current = setTimeout(() => {
        performSave(debouncedData);
      }, delay);
    }

    lastDataRef.current = debouncedData;

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [debouncedData, delay, enabled, performSave]);

  // Guardado manual inmediato
  const saveNow = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    await performSave(data);
  }, [data, performSave]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Hook para detectar antes de salir de la página
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (state.hasUnsavedChanges) {
        const message = 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?';
        event.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, state.hasUnsavedChanges]);

  // Shortcuts de teclado
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+S o Cmd+S para guardar
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        saveNow();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, saveNow]);

  return {
    ...state,
    saveNow,
    isEnabled: enabled
  };
}

// Hook simple para debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}