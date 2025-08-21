'use client';

import { useState, useCallback } from 'react';
import { useNotification } from '@/contexts/NotificationContext';

export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string | RegExp;
  email?: boolean;
  url?: boolean;
  custom?: (value: any) => string | null;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface FormValidationConfig {
  [fieldName: string]: ValidationRule;
}

export const useFormValidation = (config: FormValidationConfig) => {
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const { error: showError, warning } = useNotification();

  const validateField = useCallback((fieldName: string, value: any): string | null => {
    const rule = config[fieldName];
    if (!rule) return null;

    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return 'Este campo es requerido';
    }

    // Skip other validations if field is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return null;
    }

    // String length validations
    if (typeof value === 'string') {
      if (rule.min && value.length < rule.min) {
        return `Mínimo ${rule.min} caracteres`;
      }
      if (rule.max && value.length > rule.max) {
        return `Máximo ${rule.max} caracteres`;
      }
    }

    // Number validations
    if (typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        return `El valor mínimo es ${rule.min}`;
      }
      if (rule.max !== undefined && value > rule.max) {
        return `El valor máximo es ${rule.max}`;
      }
    }

    // Email validation
    if (rule.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Ingrese un email válido';
      }
    }

    // URL validation
    if (rule.url) {
      try {
        new URL(value);
      } catch {
        return 'Ingrese una URL válida';
      }
    }

    // Pattern validation
    if (rule.pattern) {
      const regex = typeof rule.pattern === 'string' ? new RegExp(rule.pattern) : rule.pattern;
      if (!regex.test(value)) {
        return 'El formato no es válido';
      }
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        return customError;
      }
    }

    return null;
  }, [config]);

  const validateForm = useCallback((formData: Record<string, any>): boolean => {
    setIsValidating(true);
    const newErrors: FieldError[] = [];

    Object.keys(config).forEach(fieldName => {
      const value = getNestedValue(formData, fieldName);
      const error = validateField(fieldName, value);
      
      if (error) {
        newErrors.push({ field: fieldName, message: error });
      }
    });

    setErrors(newErrors);

    if (newErrors.length > 0) {
      showError(
        'Errores de validación',
        `Se encontraron ${newErrors.length} error(es) en el formulario`
      );
      setIsValidating(false);
      return false;
    }

    setIsValidating(false);
    return true;
  }, [config, validateField, showError]);

  const validateSingleField = useCallback((fieldName: string, value: any): boolean => {
    const error = validateField(fieldName, value);
    
    setErrors(prev => {
      // Remove existing error for this field
      const filtered = prev.filter(e => e.field !== fieldName);
      
      // Add new error if exists
      if (error) {
        return [...filtered, { field: fieldName, message: error }];
      }
      
      return filtered;
    });

    return !error;
  }, [validateField]);

  const clearErrors = useCallback((fieldName?: string) => {
    if (fieldName) {
      setErrors(prev => prev.filter(e => e.field !== fieldName));
    } else {
      setErrors([]);
    }
  }, []);

  const getFieldError = useCallback((fieldName: string): string | null => {
    const error = errors.find(e => e.field === fieldName);
    return error ? error.message : null;
  }, [errors]);

  const hasErrors = errors.length > 0;
  const hasFieldError = useCallback((fieldName: string): boolean => {
    return errors.some(e => e.field === fieldName);
  }, [errors]);

  // Helper function to get nested values from form data
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  };

  return {
    errors,
    isValidating,
    hasErrors,
    validateForm,
    validateSingleField,
    validateField,
    clearErrors,
    getFieldError,
    hasFieldError
  };
};

// Predefined validation rules for common use cases
export const commonValidations = {
  email: { required: true, email: true },
  password: { required: true, min: 8 },
  name: { required: true, min: 2, max: 100 },
  slug: { 
    required: true, 
    pattern: /^[a-z0-9-]+$/,
    custom: (value: string) => {
      if (!/^[a-z0-9-]+$/.test(value)) {
        return 'Solo letras minúsculas, números y guiones';
      }
      return null;
    }
  },
  url: { url: true },
  phone: { 
    pattern: /^[+]?[\d\s\-()]+$/,
    custom: (value: string) => {
      if (value && !/^[+]?[\d\s\-()]+$/.test(value)) {
        return 'Formato de teléfono inválido';
      }
      return null;
    }
  },
  positiveNumber: {
    custom: (value: any) => {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0) {
        return 'Debe ser un número positivo';
      }
      return null;
    }
  },
  percentage: {
    custom: (value: any) => {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0 || num > 100) {
        return 'Debe ser un porcentaje entre 0 y 100';
      }
      return null;
    }
  }
};