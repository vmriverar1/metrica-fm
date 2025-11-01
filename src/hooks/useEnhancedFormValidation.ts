'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  validateName,
  validateEmail,
  validatePhone,
  validateCompany,
  validateMessage,
  validateURL,
  type ValidationResult
} from '@/lib/validation';

/**
 * Tipo de campo para aplicar la validación correcta
 */
export type FieldType =
  | 'name'           // Nombres y apellidos
  | 'email'          // Emails
  | 'phone'          // Teléfonos
  | 'company'        // Empresas/organizaciones
  | 'message'        // Mensajes/descripciones largas
  | 'url'            // URLs genéricas
  | 'linkedin'       // URLs de LinkedIn
  | 'portfolio';     // URLs de portfolio

/**
 * Configuración de un campo
 */
export interface FieldConfig {
  type: FieldType;
  required?: boolean;
  label?: string;
  minLength?: number;
  maxLength?: number;
}

/**
 * Estado de validación de un campo
 */
export interface FieldValidationState {
  value: string;
  error: string | null;
  touched: boolean;
  validating: boolean;
  valid: boolean;
}

/**
 * Configuración del formulario
 */
export interface FormConfig {
  [fieldName: string]: FieldConfig;
}

/**
 * Hook mejorado para validación de formularios con validadores de Fase 1
 *
 * Características:
 * - Validación en tiempo real (onChange con debounce)
 * - Validación al enviar (onSubmit)
 * - Feedback visual (valid/invalid)
 * - Mensajes de error en español
 * - Integra validadores anti-spam de Fase 1
 *
 * @param config - Configuración de campos del formulario
 * @param debounceMs - Tiempo de debounce para validación onChange (default: 500ms)
 * @returns Estado y funciones de validación
 */
export function useEnhancedFormValidation(
  config: FormConfig,
  debounceMs: number = 500
) {
  // Estado de validación de todos los campos
  const [fieldStates, setFieldStates] = useState<Record<string, FieldValidationState>>(() => {
    const initial: Record<string, FieldValidationState> = {};
    Object.keys(config).forEach(fieldName => {
      initial[fieldName] = {
        value: '',
        error: null,
        touched: false,
        validating: false,
        valid: false
      };
    });
    return initial;
  });

  // Referencias para debounce timers
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  /**
   * Valida un campo específico según su tipo
   */
  const validateFieldValue = useCallback((
    fieldName: string,
    value: string
  ): ValidationResult => {
    const fieldConfig = config[fieldName];
    if (!fieldConfig) {
      return { valid: true };
    }

    // Si el campo no es requerido y está vacío, es válido
    if (!fieldConfig.required && (!value || value.trim() === '')) {
      return { valid: true };
    }

    // Si el campo es requerido y está vacío, error
    if (fieldConfig.required && (!value || value.trim() === '')) {
      return {
        valid: false,
        error: `${fieldConfig.label || 'Este campo'} es obligatorio`
      };
    }

    // Aplicar validador específico según el tipo
    switch (fieldConfig.type) {
      case 'name':
        return validateName(value);

      case 'email':
        return validateEmail(value);

      case 'phone':
        return validatePhone(value);

      case 'company':
        return validateCompany(value);

      case 'message':
        return validateMessage(
          value,
          fieldConfig.minLength || 10,
          fieldConfig.maxLength || 2000
        );

      case 'linkedin':
        return validateURL(value, 'linkedin');

      case 'portfolio':
      case 'url':
        return validateURL(value, 'generic');

      default:
        return { valid: true };
    }
  }, [config]);

  /**
   * Valida un campo con debounce
   */
  const validateFieldDebounced = useCallback((
    fieldName: string,
    value: string
  ) => {
    // Limpiar timer anterior si existe
    if (debounceTimers.current[fieldName]) {
      clearTimeout(debounceTimers.current[fieldName]);
    }

    // Marcar como "validando"
    setFieldStates(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        value,
        validating: true
      }
    }));

    // Crear nuevo timer
    debounceTimers.current[fieldName] = setTimeout(() => {
      const result = validateFieldValue(fieldName, value);

      setFieldStates(prev => ({
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          value,
          error: result.error || null,
          validating: false,
          valid: result.valid
        }
      }));
    }, debounceMs);
  }, [validateFieldValue, debounceMs]);

  /**
   * Valida un campo inmediatamente (sin debounce)
   * Usado al hacer blur o submit
   */
  const validateFieldImmediate = useCallback((
    fieldName: string,
    value: string
  ) => {
    const result = validateFieldValue(fieldName, value);

    setFieldStates(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        value,
        error: result.error || null,
        touched: true,
        validating: false,
        valid: result.valid
      }
    }));

    return result.valid;
  }, [validateFieldValue]);

  /**
   * Maneja el cambio de valor de un campo (onChange)
   */
  const handleFieldChange = useCallback((
    fieldName: string,
    value: string
  ) => {
    // Actualizar valor inmediatamente
    setFieldStates(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        value
      }
    }));

    // Validar con debounce
    validateFieldDebounced(fieldName, value);
  }, [validateFieldDebounced]);

  /**
   * Maneja el blur de un campo (onBlur)
   */
  const handleFieldBlur = useCallback((fieldName: string) => {
    const currentValue = fieldStates[fieldName]?.value || '';

    setFieldStates(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        touched: true
      }
    }));

    // Validar inmediatamente al hacer blur
    validateFieldImmediate(fieldName, currentValue);
  }, [fieldStates, validateFieldImmediate]);

  /**
   * Valida todos los campos del formulario
   * Retorna true si todos son válidos
   */
  const validateAllFields = useCallback((): boolean => {
    let allValid = true;
    const newStates = { ...fieldStates };

    Object.keys(config).forEach(fieldName => {
      const value = fieldStates[fieldName]?.value || '';
      const result = validateFieldValue(fieldName, value);

      newStates[fieldName] = {
        ...newStates[fieldName],
        value,
        error: result.error || null,
        touched: true,
        validating: false,
        valid: result.valid
      };

      if (!result.valid) {
        allValid = false;
      }
    });

    setFieldStates(newStates);
    return allValid;
  }, [config, fieldStates, validateFieldValue]);

  /**
   * Limpia errores de un campo específico o todos
   */
  const clearErrors = useCallback((fieldName?: string) => {
    if (fieldName) {
      setFieldStates(prev => ({
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          error: null,
          touched: false
        }
      }));
    } else {
      const clearedStates = { ...fieldStates };
      Object.keys(clearedStates).forEach(key => {
        clearedStates[key] = {
          ...clearedStates[key],
          error: null,
          touched: false
        };
      });
      setFieldStates(clearedStates);
    }
  }, [fieldStates]);

  /**
   * Resetea el formulario completo
   */
  const resetForm = useCallback(() => {
    const resetStates: Record<string, FieldValidationState> = {};
    Object.keys(config).forEach(fieldName => {
      resetStates[fieldName] = {
        value: '',
        error: null,
        touched: false,
        validating: false,
        valid: false
      };
    });
    setFieldStates(resetStates);
  }, [config]);

  /**
   * Obtiene el estado de un campo
   */
  const getFieldState = useCallback((fieldName: string): FieldValidationState => {
    return fieldStates[fieldName] || {
      value: '',
      error: null,
      touched: false,
      validating: false,
      valid: false
    };
  }, [fieldStates]);

  /**
   * Obtiene el error de un campo (solo si está touched)
   */
  const getFieldError = useCallback((fieldName: string): string | null => {
    const state = fieldStates[fieldName];
    if (!state || !state.touched) return null;
    return state.error;
  }, [fieldStates]);

  /**
   * Verifica si un campo tiene error
   */
  const hasFieldError = useCallback((fieldName: string): boolean => {
    const state = fieldStates[fieldName];
    return !!(state && state.touched && state.error);
  }, [fieldStates]);

  /**
   * Verifica si un campo es válido
   */
  const isFieldValid = useCallback((fieldName: string): boolean => {
    const state = fieldStates[fieldName];
    return !!(state && state.touched && state.valid);
  }, [fieldStates]);

  /**
   * Obtiene todos los valores del formulario
   */
  const getFormValues = useCallback((): Record<string, string> => {
    const values: Record<string, string> = {};
    Object.keys(fieldStates).forEach(key => {
      values[key] = fieldStates[key].value;
    });
    return values;
  }, [fieldStates]);

  /**
   * Establece el valor de un campo sin validar
   */
  const setFieldValue = useCallback((fieldName: string, value: string) => {
    setFieldStates(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        value
      }
    }));
  }, []);

  /**
   * Establece múltiples valores de una vez
   */
  const setFormValues = useCallback((values: Record<string, string>) => {
    setFieldStates(prev => {
      const newStates = { ...prev };
      Object.entries(values).forEach(([fieldName, value]) => {
        if (newStates[fieldName]) {
          newStates[fieldName] = {
            ...newStates[fieldName],
            value
          };
        }
      });
      return newStates;
    });
  }, []);

  // Limpiar timers al desmontar
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(timer => {
        clearTimeout(timer);
      });
    };
  }, []);

  return {
    // Estado
    fieldStates,

    // Handlers
    handleFieldChange,
    handleFieldBlur,

    // Validación
    validateAllFields,
    validateFieldImmediate,

    // Utilidades
    getFieldState,
    getFieldError,
    hasFieldError,
    isFieldValid,
    clearErrors,
    resetForm,

    // Valores
    getFormValues,
    setFieldValue,
    setFormValues
  };
}
