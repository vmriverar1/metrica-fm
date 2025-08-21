'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { SmartValidator, ValidationResult, ValidationRule } from '@/lib/validation/SmartValidator';

interface UseSmartValidationOptions {
  debounceMs?: number;
  validateOnChange?: boolean;
  fieldValidation?: boolean;
  autoSuggest?: boolean;
}

export function useSmartValidation(
  data: any, 
  options: UseSmartValidationOptions = {}
) {
  const {
    debounceMs = 500,
    validateOnChange = true,
    fieldValidation = true,
    autoSuggest = true
  } = options;

  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, ValidationRule[]>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidationTime, setLastValidationTime] = useState<Date | null>(null);

  const validator = useMemo(() => new SmartValidator(), []);

  // Debounced validation function
  const validateData = useCallback(
    debounce(async (currentData: any) => {
      if (!currentData) return;
      
      setIsValidating(true);
      
      try {
        const result = validator.validateComplete(currentData);
        setValidationResult(result);
        
        if (fieldValidation) {
          const fieldRules = validator.getRulesByField(result.rules);
          setFieldErrors(fieldRules);
        }
        
        setLastValidationTime(new Date());
      } catch (error) {
        console.error('Validation error:', error);
      } finally {
        setIsValidating(false);
      }
    }, debounceMs),
    [validator, fieldValidation, debounceMs]
  );

  // Validate specific field
  const validateField = useCallback((field: string, value: any) => {
    if (!fieldValidation) return [];
    
    const rules = validator.validateField(field, value, data);
    
    setFieldErrors(prev => ({
      ...prev,
      [field]: rules
    }));
    
    return rules;
  }, [validator, data, fieldValidation]);

  // Main effect for data validation
  useEffect(() => {
    if (validateOnChange && data) {
      validateData(data);
    }
  }, [data, validateOnChange, validateData]);

  // Manual validation trigger
  const validate = useCallback(async () => {
    if (data) {
      await validateData(data);
    }
  }, [data, validateData]);

  // Get validation status for a specific field
  const getFieldValidation = useCallback((field: string) => {
    const rules = fieldErrors[field] || [];
    const hasError = rules.some(r => r.severity === 'error');
    const hasWarning = rules.some(r => r.severity === 'warning');
    const hasInfo = rules.some(r => r.severity === 'info');
    const hasSuccess = rules.some(r => r.severity === 'success');

    return {
      rules,
      hasError,
      hasWarning,
      hasInfo,
      hasSuccess,
      status: hasError ? 'error' : hasWarning ? 'warning' : hasInfo ? 'info' : hasSuccess ? 'success' : 'none'
    };
  }, [fieldErrors]);

  // Get suggestions for UI
  const getSuggestions = useCallback(() => {
    if (!validationResult || !autoSuggest) return [];
    return validationResult.suggestions;
  }, [validationResult, autoSuggest]);

  // Get auto-fix suggestions
  const getAutoFixes = useCallback(() => {
    if (!validationResult) return {};
    return validationResult.autoFixes;
  }, [validationResult]);

  // Apply auto-fix for a field
  const applyAutoFix = useCallback((field: string) => {
    const autoFixes = getAutoFixes();
    return autoFixes[field] || null;
  }, [getAutoFixes]);

  // Get validation summary
  const getValidationSummary = useCallback(() => {
    if (!validationResult) {
      return {
        score: 100,
        total: 0,
        errors: 0,
        warnings: 0,
        infos: 0,
        successes: 0,
        isValid: true
      };
    }

    const rulesBySeverity = validator.getRulesBySeverity(validationResult.rules);
    
    return {
      score: validationResult.score,
      total: validationResult.rules.length,
      errors: (rulesBySeverity.error || []).length,
      warnings: (rulesBySeverity.warning || []).length,
      infos: (rulesBySeverity.info || []).length,
      successes: (rulesBySeverity.success || []).length,
      isValid: validationResult.isValid
    };
  }, [validationResult, validator]);

  // Get validation color theme
  const getValidationTheme = useCallback(() => {
    const summary = getValidationSummary();
    
    if (summary.errors > 0) return 'red';
    if (summary.warnings > 0) return 'yellow';
    if (summary.infos > 0) return 'blue';
    if (summary.successes > 0) return 'green';
    return 'gray';
  }, [getValidationSummary]);

  // Get field validation styles
  const getFieldStyles = useCallback((field: string) => {
    const fieldValidation = getFieldValidation(field);
    
    const baseStyles = 'transition-all duration-200';
    
    switch (fieldValidation.status) {
      case 'error':
        return `${baseStyles} border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50`;
      case 'warning':
        return `${baseStyles} border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500 bg-yellow-50`;
      case 'info':
        return `${baseStyles} border-blue-300 focus:border-blue-500 focus:ring-blue-500 bg-blue-50`;
      case 'success':
        return `${baseStyles} border-green-300 focus:border-green-500 focus:ring-green-500 bg-green-50`;
      default:
        return `${baseStyles} border-gray-300 focus:border-blue-500 focus:ring-blue-500`;
    }
  }, [getFieldValidation]);

  // Clear validation for field
  const clearFieldValidation = useCallback((field: string) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  // Clear all validation
  const clearValidation = useCallback(() => {
    setValidationResult(null);
    setFieldErrors({});
  }, []);

  return {
    // Validation results
    validationResult,
    fieldErrors,
    isValidating,
    lastValidationTime,
    
    // Validation methods
    validate,
    validateField,
    
    // Field-specific helpers
    getFieldValidation,
    getFieldStyles,
    clearFieldValidation,
    
    // Global helpers
    getSuggestions,
    getAutoFixes,
    applyAutoFix,
    getValidationSummary,
    getValidationTheme,
    clearValidation,
    
    // Computed values
    isValid: validationResult?.isValid ?? true,
    score: validationResult?.score ?? 100,
    hasValidation: validationResult !== null
  };
}

// Debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}