// Sistema de validación para formularios ISO

export interface ValidationRule {
  required?: boolean
  pattern?: RegExp
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  custom?: (value: any) => string | null
}

export interface FieldValidation {
  [fieldName: string]: ValidationRule
}

export interface ValidationErrors {
  [fieldName: string]: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationErrors
}

// Patrones de validación comunes
export const VALIDATION_PATTERNS = {
  percentage: /^(\d{1,3}(\.\d{1,2})?%)$/,
  currency: /^\$?\d{1,10}(\.\d{1,2})?(k|K|M|B)?$/,
  number: /^\d+(\.\d+)?$/,
  days: /^\d+\s*(days?|días?|d)$/i,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/.+/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  version: /^v?\d+\.\d+(\.\d+)?$/,
  certificateNumber: /^[A-Z]{2}\d{2}-[A-Z]-\d{6}$/
}

// Validaciones específicas para campos ISO
export const ISO_FIELD_VALIDATIONS: Record<string, FieldValidation> = {
  hero: {
    title: {
      required: true,
      minLength: 3,
      maxLength: 100
    },
    subtitle: {
      required: true,
      minLength: 3,
      maxLength: 200
    },
    description: {
      maxLength: 500
    },
    'stats.certification_years': {
      pattern: /^\d+\+?$/,
      custom: (value: string) => {
        const num = parseInt(value.replace('+', ''))
        if (num < 1 || num > 50) return 'Los años deben estar entre 1 y 50'
        return null
      }
    },
    'stats.certified_projects': {
      pattern: VALIDATION_PATTERNS.number,
      custom: (value: string) => {
        const num = parseInt(value)
        if (num < 0 || num > 10000) return 'El número de proyectos debe estar entre 0 y 10000'
        return null
      }
    },
    'stats.average_satisfaction': {
      pattern: VALIDATION_PATTERNS.number,
      custom: (value: string) => {
        const num = parseFloat(value)
        if (num < 0 || num > 100) return 'La satisfacción debe estar entre 0 y 100'
        return null
      }
    },
    'certificate_details.certifying_body': {
      required: true,
      minLength: 2,
      maxLength: 100
    },
    'certificate_details.certificate_number': {
      required: true,
      minLength: 5,
      maxLength: 50
    },
    'certificate_details.verification_url': {
      pattern: VALIDATION_PATTERNS.url
    },
    'certificate_details.pdf_url': {
      custom: (value: string) => {
        if (value && !value.startsWith('/') && !value.startsWith('http')) {
          return 'La URL debe ser relativa (/) o absoluta (http)'
        }
        return null
      }
    }
  },
  
  policy: {
    'document.title': {
      required: true,
      minLength: 5,
      maxLength: 200
    },
    'document.version': {
      required: true,
      pattern: VALIDATION_PATTERNS.version
    },
    'document.approved_by': {
      required: true,
      minLength: 2,
      maxLength: 100
    },
    'document.effective_date': {
      pattern: VALIDATION_PATTERNS.date
    },
    'document.next_review': {
      pattern: VALIDATION_PATTERNS.date,
      custom: (value: string, allData?: any) => {
        if (value && allData?.document?.effective_date) {
          const effective = new Date(allData.document.effective_date)
          const review = new Date(value)
          if (review <= effective) {
            return 'La fecha de revisión debe ser posterior a la fecha efectiva'
          }
        }
        return null
      }
    }
  },
  
  metrics: {
    'section.title': {
      required: true,
      minLength: 5,
      maxLength: 100
    },
    'kpi.category': {
      required: true,
      minLength: 3,
      maxLength: 100
    },
    'kpi.current_value': {
      required: true,
      custom: (value: string) => {
        const patterns = [
          VALIDATION_PATTERNS.percentage,
          VALIDATION_PATTERNS.currency,
          VALIDATION_PATTERNS.number,
          VALIDATION_PATTERNS.days
        ]
        
        const isValid = patterns.some(pattern => pattern.test(value))
        if (!isValid) {
          return 'Formato inválido. Use: 95.5%, $1000, 30 días, o un número'
        }
        return null
      }
    },
    'kpi.target': {
      required: true,
      custom: (value: string) => {
        if (!value.includes('≥') && !value.includes('≤') && !VALIDATION_PATTERNS.percentage.test(value) && !VALIDATION_PATTERNS.number.test(value)) {
          return 'Use formato: ≥95%, ≤5%, o un valor específico'
        }
        return null
      }
    },
    'kpi.description': {
      required: true,
      minLength: 10,
      maxLength: 500
    }
  }
}

// Función principal de validación
export function validateField(
  fieldPath: string, 
  value: any, 
  validations: FieldValidation,
  allData?: any
): string | null {
  const validation = validations[fieldPath]
  if (!validation) return null
  
  // Validar requerido
  if (validation.required && (!value || (typeof value === 'string' && !value.trim()))) {
    return 'Este campo es requerido'
  }
  
  // Si está vacío y no es requerido, no validar más
  if (!value || (typeof value === 'string' && !value.trim())) {
    return null
  }
  
  // Validar patrón
  if (validation.pattern && !validation.pattern.test(String(value))) {
    return 'El formato no es válido'
  }
  
  // Validar longitud mínima
  if (validation.minLength && String(value).length < validation.minLength) {
    return `Debe tener al menos ${validation.minLength} caracteres`
  }
  
  // Validar longitud máxima
  if (validation.maxLength && String(value).length > validation.maxLength) {
    return `Debe tener máximo ${validation.maxLength} caracteres`
  }
  
  // Validar valor mínimo
  if (validation.min !== undefined) {
    const numValue = Number(value)
    if (!isNaN(numValue) && numValue < validation.min) {
      return `El valor debe ser mayor o igual a ${validation.min}`
    }
  }
  
  // Validar valor máximo
  if (validation.max !== undefined) {
    const numValue = Number(value)
    if (!isNaN(numValue) && numValue > validation.max) {
      return `El valor debe ser menor o igual a ${validation.max}`
    }
  }
  
  // Validación personalizada
  if (validation.custom) {
    return validation.custom(value)
  }
  
  return null
}

// Validar un objeto completo
export function validateObject(
  data: any, 
  validations: FieldValidation,
  prefix = ''
): ValidationResult {
  const errors: ValidationErrors = {}
  
  function validateNested(obj: any, currentPrefix: string) {
    Object.keys(obj).forEach(key => {
      const fieldPath = currentPrefix ? `${currentPrefix}.${key}` : key
      const value = obj[key]
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        validateNested(value, fieldPath)
      } else {
        const error = validateField(fieldPath, value, validations, data)
        if (error) {
          errors[fieldPath] = error
        }
      }
    })
  }
  
  validateNested(data, prefix)
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Validar arrays de objetos
export function validateArray<T>(
  items: T[],
  validations: FieldValidation,
  itemPrefix: string
): ValidationResult {
  const errors: ValidationErrors = {}
  
  items.forEach((item, index) => {
    const result = validateObject(item, validations, `${itemPrefix}[${index}]`)
    Object.assign(errors, result.errors)
  })
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Utilidades para formatear valores
export const FORMAT_HELPERS = {
  formatPercentage: (value: string): string => {
    const num = parseFloat(value.replace('%', ''))
    if (isNaN(num)) return value
    return `${num}%`
  },
  
  formatCurrency: (value: string): string => {
    const match = value.match(/^(\$?)(\d+(?:\.\d{2})?)([kKMB]?)$/)
    if (!match) return value
    
    const [, dollar, amount, suffix] = match
    return `${dollar || '$'}${amount}${suffix || ''}`
  },
  
  formatDate: (value: string): string => {
    try {
      const date = new Date(value)
      return date.toISOString().split('T')[0]
    } catch {
      return value
    }
  },
  
  formatTrend: (value: string, isPositive: boolean): string => {
    const num = parseFloat(value.replace(/[+\-]/, ''))
    if (isNaN(num)) return value
    return isPositive ? `+${num}%` : `-${num}%`
  }
}

// Hook personalizado para validación en tiempo real
export function useISOValidation(
  formType: 'hero' | 'policy' | 'metrics',
  initialData: any
) {
  const validations = ISO_FIELD_VALIDATIONS[formType] || {}
  
  const validateSingle = (fieldPath: string, value: any) => {
    return validateField(fieldPath, value, validations, initialData)
  }
  
  const validateAll = (data: any) => {
    return validateObject(data, validations)
  }
  
  return {
    validateSingle,
    validateAll,
    validations
  }
}