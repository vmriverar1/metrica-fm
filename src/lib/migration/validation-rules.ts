/**
 * Reglas de Validación Globales
 * Validadores reutilizables para todos los sistemas de migración
 * Newsletter, Portfolio, Careers con validaciones consistentes
 */

import { ValidationResult } from './unified-migrator';

// Tipos para validación
export interface ValidationRule<T = any> {
  field: keyof T;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date' | 'email' | 'url';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  dependsOn?: keyof T;
}

export interface ValidationSchema<T = any> {
  rules: ValidationRule<T>[];
  customValidators?: ((data: T) => string | null)[];
}

/**
 * Validador Base Genérico
 */
export class BaseValidator {
  static validate<T>(data: T, schema: ValidationSchema<T>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validar reglas individuales
    schema.rules.forEach(rule => {
      const fieldName = String(rule.field);
      const value = (data as any)[rule.field];

      try {
        const fieldErrors = this.validateField(fieldName, value, rule, data);
        errors.push(...fieldErrors);
      } catch (error) {
        errors.push(`Error validating field ${fieldName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

    // Validadores personalizados
    if (schema.customValidators) {
      schema.customValidators.forEach(validator => {
        try {
          const error = validator(data);
          if (error) {
            errors.push(error);
          }
        } catch (error) {
          errors.push(`Custom validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private static validateField<T>(
    fieldName: string,
    value: any,
    rule: ValidationRule<T>,
    fullData: T
  ): string[] {
    const errors: string[] = [];

    // Campo requerido
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${fieldName} is required`);
      return errors; // No continuar validando si es requerido y está vacío
    }

    // Si el campo no es requerido y está vacío, no validar más
    if (!rule.required && (value === undefined || value === null || value === '')) {
      return errors;
    }

    // Validar tipo
    if (rule.type) {
      const typeError = this.validateType(fieldName, value, rule.type);
      if (typeError) {
        errors.push(typeError);
        return errors; // No continuar si el tipo es incorrecto
      }
    }

    // Validar longitud (strings y arrays)
    if (rule.minLength !== undefined || rule.maxLength !== undefined) {
      const lengthErrors = this.validateLength(fieldName, value, rule.minLength, rule.maxLength);
      errors.push(...lengthErrors);
    }

    // Validar rango numérico
    if (rule.min !== undefined || rule.max !== undefined) {
      const rangeErrors = this.validateRange(fieldName, value, rule.min, rule.max);
      errors.push(...rangeErrors);
    }

    // Validar patrón
    if (rule.pattern && typeof value === 'string') {
      if (!rule.pattern.test(value)) {
        errors.push(`${fieldName} does not match required pattern`);
      }
    }

    // Validador personalizado
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        errors.push(`${fieldName}: ${customError}`);
      }
    }

    // Validar dependencias
    if (rule.dependsOn) {
      const dependentValue = (fullData as any)[rule.dependsOn];
      if (dependentValue && !value) {
        errors.push(`${fieldName} is required when ${String(rule.dependsOn)} is specified`);
      }
    }

    return errors;
  }

  private static validateType(fieldName: string, value: any, expectedType: string): string | null {
    switch (expectedType) {
      case 'string':
        if (typeof value !== 'string') {
          return `${fieldName} must be a string`;
        }
        break;
      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          return `${fieldName} must be a valid number`;
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          return `${fieldName} must be a boolean`;
        }
        break;
      case 'array':
        if (!Array.isArray(value)) {
          return `${fieldName} must be an array`;
        }
        break;
      case 'object':
        if (typeof value !== 'object' || Array.isArray(value) || value === null) {
          return `${fieldName} must be an object`;
        }
        break;
      case 'date':
        if (!(value instanceof Date) && typeof value !== 'string') {
          return `${fieldName} must be a date or date string`;
        }
        if (typeof value === 'string' && isNaN(Date.parse(value))) {
          return `${fieldName} must be a valid date string`;
        }
        break;
      case 'email':
        if (typeof value === 'string') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            return `${fieldName} must be a valid email address`;
          }
        }
        break;
      case 'url':
        if (typeof value === 'string') {
          try {
            new URL(value);
          } catch {
            return `${fieldName} must be a valid URL`;
          }
        }
        break;
    }
    return null;
  }

  private static validateLength(
    fieldName: string,
    value: any,
    minLength?: number,
    maxLength?: number
  ): string[] {
    const errors: string[] = [];
    let length: number;

    if (typeof value === 'string') {
      length = value.length;
    } else if (Array.isArray(value)) {
      length = value.length;
    } else {
      return errors; // No aplicable
    }

    if (minLength !== undefined && length < minLength) {
      errors.push(`${fieldName} must be at least ${minLength} characters/items long`);
    }

    if (maxLength !== undefined && length > maxLength) {
      errors.push(`${fieldName} must be at most ${maxLength} characters/items long`);
    }

    return errors;
  }

  private static validateRange(
    fieldName: string,
    value: any,
    min?: number,
    max?: number
  ): string[] {
    const errors: string[] = [];

    if (typeof value !== 'number') {
      return errors; // No aplicable
    }

    if (min !== undefined && value < min) {
      errors.push(`${fieldName} must be at least ${min}`);
    }

    if (max !== undefined && value > max) {
      errors.push(`${fieldName} must be at most ${max}`);
    }

    return errors;
  }
}

// ==========================================
// VALIDADORES ESPECÍFICOS POR SISTEMA
// ==========================================

/**
 * Esquemas de validación para Newsletter
 */
export const NewsletterValidationSchemas = {
  author: {
    rules: [
      { field: 'name' as const, required: true, type: 'string' as const, minLength: 2, maxLength: 100 },
      { field: 'role' as const, required: true, type: 'string' as const, minLength: 2, maxLength: 100 },
      { field: 'bio' as const, required: true, type: 'string' as const, minLength: 50, maxLength: 500 },
      { field: 'email' as const, required: true, type: 'email' as const },
      { field: 'avatar' as const, required: false, type: 'url' as const },
      { field: 'linkedin' as const, required: false, type: 'url' as const },
      { field: 'specializations' as const, required: true, type: 'array' as const, minLength: 1 },
      { field: 'featured' as const, required: false, type: 'boolean' as const }
    ]
  } as ValidationSchema,

  category: {
    rules: [
      { field: 'name' as const, required: true, type: 'string' as const, minLength: 2, maxLength: 50 },
      { field: 'slug' as const, required: true, type: 'string' as const, pattern: /^[a-z0-9-]+$/ },
      { field: 'description' as const, required: true, type: 'string' as const, minLength: 20, maxLength: 200 },
      { field: 'color' as const, required: false, type: 'string' as const, pattern: /^#[0-9A-Fa-f]{6}$/ },
      { field: 'featured' as const, required: false, type: 'boolean' as const }
    ]
  } as ValidationSchema,

  article: {
    rules: [
      { field: 'title' as const, required: true, type: 'string' as const, minLength: 10, maxLength: 200 },
      { field: 'slug' as const, required: true, type: 'string' as const, pattern: /^[a-z0-9-]+$/ },
      { field: 'excerpt' as const, required: true, type: 'string' as const, minLength: 50, maxLength: 300 },
      { field: 'content' as const, required: true, type: 'string' as const, minLength: 200 },
      { field: 'author_id' as const, required: true, type: 'string' as const },
      { field: 'category_id' as const, required: true, type: 'string' as const },
      { field: 'featured_image' as const, required: false, type: 'url' as const },
      { field: 'status' as const, required: true, type: 'string' as const },
      { field: 'tags' as const, required: false, type: 'array' as const },
      { field: 'reading_time' as const, required: false, type: 'number' as const, min: 1 }
    ],
    customValidators: [
      (data: any) => {
        if (data.status && !['draft', 'published', 'archived'].includes(data.status)) {
          return 'Status must be one of: draft, published, archived';
        }
        return null;
      }
    ]
  } as ValidationSchema
};

/**
 * Esquemas de validación para Portfolio
 */
export const PortfolioValidationSchemas = {
  category: {
    rules: [
      { field: 'name' as const, required: true, type: 'string' as const, minLength: 2, maxLength: 50 },
      { field: 'slug' as const, required: true, type: 'string' as const, pattern: /^[a-z0-9-]+$/ },
      { field: 'description' as const, required: true, type: 'string' as const, minLength: 20, maxLength: 200 },
      { field: 'icon' as const, required: false, type: 'string' as const },
      { field: 'color' as const, required: false, type: 'string' as const, pattern: /^#[0-9A-Fa-f]{6}$/ },
      { field: 'featured_image' as const, required: false, type: 'url' as const },
      { field: 'projects_count' as const, required: false, type: 'number' as const, min: 0 },
      { field: 'total_investment' as const, required: false, type: 'string' as const },
      { field: 'total_area' as const, required: false, type: 'string' as const },
      { field: 'featured' as const, required: false, type: 'boolean' as const },
      { field: 'order' as const, required: false, type: 'number' as const, min: 1 }
    ]
  } as ValidationSchema,

  project: {
    rules: [
      { field: 'title' as const, required: true, type: 'string' as const, minLength: 5, maxLength: 200 },
      { field: 'slug' as const, required: true, type: 'string' as const, pattern: /^[a-z0-9-]+$/ },
      { field: 'category' as const, required: true, type: 'string' as const },
      { field: 'location' as const, required: true, type: 'object' as const },
      { field: 'featured_image' as const, required: false, type: 'url' as const },
      { field: 'thumbnail_image' as const, required: false, type: 'url' as const },
      { field: 'gallery' as const, required: false, type: 'array' as const },
      { field: 'description' as const, required: true, type: 'string' as const, minLength: 100 },
      { field: 'short_description' as const, required: true, type: 'string' as const, minLength: 20, maxLength: 200 },
      { field: 'details' as const, required: true, type: 'object' as const },
      { field: 'featured' as const, required: false, type: 'boolean' as const },
      { field: 'completed_at' as const, required: false, type: 'date' as const },
      { field: 'tags' as const, required: false, type: 'array' as const },
      { field: 'status' as const, required: false, type: 'string' as const }
    ],
    customValidators: [
      (data: any) => {
        if (data.location && (!data.location.city || !data.location.region)) {
          return 'Location must include city and region';
        }
        return null;
      },
      (data: any) => {
        if (data.details && !data.details.client) {
          return 'Project details must include client information';
        }
        return null;
      }
    ]
  } as ValidationSchema
};

/**
 * Esquemas de validación para Careers
 */
export const CareersValidationSchemas = {
  department: {
    rules: [
      { field: 'name' as const, required: true, type: 'string' as const, minLength: 2, maxLength: 100 },
      { field: 'slug' as const, required: true, type: 'string' as const, pattern: /^[a-z0-9-]+$/ },
      { field: 'description' as const, required: true, type: 'string' as const, minLength: 20, maxLength: 200 },
      { field: 'detailed_description' as const, required: false, type: 'string' as const, minLength: 50 },
      { field: 'icon' as const, required: false, type: 'string' as const },
      { field: 'color' as const, required: false, type: 'string' as const, pattern: /^#[0-9A-Fa-f]{6}$/ },
      { field: 'open_positions' as const, required: false, type: 'number' as const, min: 0 },
      { field: 'total_employees' as const, required: false, type: 'number' as const, min: 0 },
      { field: 'growth_rate' as const, required: false, type: 'string' as const },
      { field: 'featured' as const, required: false, type: 'boolean' as const },
      { field: 'required_skills' as const, required: false, type: 'array' as const },
      { field: 'career_path' as const, required: false, type: 'object' as const }
    ]
  } as ValidationSchema,

  job: {
    rules: [
      { field: 'title' as const, required: true, type: 'string' as const, minLength: 5, maxLength: 200 },
      { field: 'slug' as const, required: true, type: 'string' as const, pattern: /^[a-z0-9-]+$/ },
      { field: 'category' as const, required: true, type: 'string' as const },
      { field: 'department' as const, required: true, type: 'string' as const },
      { field: 'location' as const, required: true, type: 'object' as const },
      { field: 'type' as const, required: true, type: 'string' as const },
      { field: 'level' as const, required: true, type: 'string' as const },
      { field: 'status' as const, required: true, type: 'string' as const },
      { field: 'experience_years' as const, required: false, type: 'number' as const, min: 0, max: 50 },
      { field: 'featured' as const, required: false, type: 'boolean' as const },
      { field: 'urgent' as const, required: false, type: 'boolean' as const },
      { field: 'posted_date' as const, required: false, type: 'date' as const },
      { field: 'deadline' as const, required: false, type: 'date' as const },
      { field: 'short_description' as const, required: true, type: 'string' as const, minLength: 50, maxLength: 300 },
      { field: 'full_description' as const, required: true, type: 'string' as const, minLength: 200 },
      { field: 'key_responsibilities' as const, required: true, type: 'array' as const, minLength: 3 },
      { field: 'requirements' as const, required: true, type: 'object' as const },
      { field: 'salary' as const, required: false, type: 'object' as const }
    ],
    customValidators: [
      (data: any) => {
        if (data.type && !['full-time', 'part-time', 'contract', 'internship'].includes(data.type)) {
          return 'Job type must be one of: full-time, part-time, contract, internship';
        }
        return null;
      },
      (data: any) => {
        if (data.level && !['entry', 'junior', 'mid', 'senior', 'lead', 'director'].includes(data.level)) {
          return 'Job level must be one of: entry, junior, mid, senior, lead, director';
        }
        return null;
      },
      (data: any) => {
        if (data.status && !['active', 'paused', 'closed', 'draft'].includes(data.status)) {
          return 'Job status must be one of: active, paused, closed, draft';
        }
        return null;
      },
      (data: any) => {
        if (data.deadline && data.posted_date) {
          const deadline = new Date(data.deadline);
          const posted = new Date(data.posted_date);
          if (deadline <= posted) {
            return 'Deadline must be after posted date';
          }
        }
        return null;
      },
      (data: any) => {
        if (data.requirements && (!data.requirements.essential || !Array.isArray(data.requirements.essential))) {
          return 'Job requirements must include essential requirements array';
        }
        return null;
      }
    ]
  } as ValidationSchema
};

// ==========================================
// UTILIDADES DE CONVENIENCIA
// ==========================================

/**
 * Validar datos usando esquemas predefinidos
 */
export function validateBySystem(
  system: 'newsletter' | 'portfolio' | 'careers',
  type: string,
  data: any
): ValidationResult {
  let schema: ValidationSchema;

  switch (system) {
    case 'newsletter':
      schema = (NewsletterValidationSchemas as any)[type];
      break;
    case 'portfolio':
      schema = (PortfolioValidationSchemas as any)[type];
      break;
    case 'careers':
      schema = (CareersValidationSchemas as any)[type];
      break;
    default:
      return {
        isValid: false,
        errors: [`Unknown system: ${system}`],
        warnings: []
      };
  }

  if (!schema) {
    return {
      isValid: false,
      errors: [`Unknown type '${type}' for system '${system}'`],
      warnings: []
    };
  }

  return BaseValidator.validate(data, schema);
}

/**
 * Generar slug válido a partir de un título
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Validar URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validador específico para Career Position
 */
export function validateCareerPosition(data: any): ValidationResult {
  return validateBySystem('careers', 'job', data);
}

/**
 * Validador específico para Career Department
 */
export function validateCareerDepartment(data: any): ValidationResult {
  return validateBySystem('careers', 'department', data);
}

/**
 * Validador específico para Newsletter Article
 */
export function validateNewsletterArticle(data: any): ValidationResult {
  return validateBySystem('newsletter', 'article', data);
}

/**
 * Validador específico para Newsletter Category
 */
export function validateNewsletterCategory(data: any): ValidationResult {
  return validateBySystem('newsletter', 'category', data);
}

/**
 * Validador específico para Newsletter Author
 */
export function validateNewsletterAuthor(data: any): ValidationResult {
  return validateBySystem('newsletter', 'author', data);
}

// Funciones faltantes para Portfolio
export function validatePortfolioCategory(data: any): ValidationResult {
  return validateBySystem('portfolio', 'category', data);
}

export function validatePortfolioProject(data: any): ValidationResult {
  return validateBySystem('portfolio', 'project', data);
}

// Funciones faltantes para Career
export function validateCareerApplication(data: any): ValidationResult {
  return validateBySystem('careers', 'application', data);
}

// Funciones faltantes para Newsletter
export function validateNewsletterSubscriber(data: any): ValidationResult {
  return validateBySystem('newsletter', 'subscriber', data);
}