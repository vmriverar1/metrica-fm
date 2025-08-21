/**
 * Validator - Sistema de validación flexible con schemas JSON
 * 
 * Características:
 * - Validación progresiva (estricta/flexible según configuración)
 * - Auto-corrección de errores menores
 * - Sugerencias de normalización
 * - Compatibilidad con datos existentes
 * - Reportes detallados de validación
 * - Modo de migración gradual
 */

import Ajv, { JSONSchemaType, ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import fs from 'fs/promises';
import path from 'path';

// Tipos
export interface ValidationOptions {
  strict?: boolean; // Modo estricto vs flexible
  autoFix?: boolean; // Auto-corregir errores menores
  allowExtraProperties?: boolean; // Permitir propiedades adicionales
  skipMissingRequired?: boolean; // Ignorar campos requeridos faltantes
  generateSuggestions?: boolean; // Generar sugerencias de corrección
  migrationMode?: boolean; // Modo especial para migración
}

export interface ValidationResult<T = any> {
  valid: boolean;
  data: T; // Datos potencialmente corregidos
  originalData: T; // Datos originales sin modificar
  errors: ErrorObject[];
  warnings: string[];
  suggestions: string[];
  fixes: ValidationFix[];
  schema: string;
  stats: ValidationStats;
}

export interface ValidationFix {
  path: string;
  type: 'added' | 'modified' | 'removed' | 'converted';
  oldValue?: any;
  newValue?: any;
  description: string;
}

export interface ValidationStats {
  errorsCount: number;
  warningsCount: number;
  fixesApplied: number;
  compatibilityLevel: 'full' | 'high' | 'medium' | 'low';
}

export interface SchemaConfig {
  name: string;
  path: string;
  strict: boolean;
  required: string[];
  optional: string[];
  patterns: Record<string, RegExp>;
}

// Errores personalizados
export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: ErrorObject[],
    public suggestions: string[] = []
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class SchemaNotFoundError extends Error {
  constructor(schemaName: string) {
    super(`Schema '${schemaName}' not found`);
    this.name = 'SchemaNotFoundError';
  }
}

/**
 * FlexibleValidator - Validador principal con modo flexible
 */
export class FlexibleValidator {
  private ajv: Ajv;
  private schemas: Map<string, any> = new Map();
  private schemaConfigs: Map<string, SchemaConfig> = new Map();
  private defaultOptions: ValidationOptions = {
    strict: false,
    autoFix: true,
    allowExtraProperties: true,
    skipMissingRequired: false,
    generateSuggestions: true,
    migrationMode: true
  };

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      verbose: true,
      strict: false,
      removeAdditional: false, // No eliminar propiedades adicionales automáticamente
      useDefaults: true, // Usar valores por defecto cuando sea posible
      coerceTypes: true // Convertir tipos automáticamente cuando sea posible
    });
    
    addFormats(this.ajv);
    this.setupCustomKeywords();
  }

  /**
   * Configurar palabras clave personalizadas para AJV
   */
  private setupCustomKeywords(): void {
    // Keyword para validación flexible de campos requeridos
    this.ajv.addKeyword({
      keyword: 'flexibleRequired',
      type: 'object',
      schemaType: 'array',
      compile: (schemaVal: string[]) => {
        return function validate(data: any, ctx?: any) {
          const missing = [];
          for (const field of schemaVal) {
            if (!(field in data)) {
              missing.push(field);
            }
          }
          
          // En modo flexible, solo generar warnings
          if (missing.length > 0 && ctx?.parentData?.migrationMode) {
            return true; // Permitir en modo migración
          }
          
          return missing.length === 0;
        };
      }
    });

    // Keyword para normalización automática
    this.ajv.addKeyword({
      keyword: 'autoNormalize',
      type: ['string', 'object', 'array'],
      schemaType: 'object',
      compile: (schemaVal: any) => {
        return function validate(data: any) {
          // Lógica de normalización se manejará en otro lado
          return true;
        };
      }
    });
  }

  /**
   * Cargar schema desde archivo
   */
  async loadSchema(name: string, schemaPath: string): Promise<void> {
    try {
      const fullPath = path.resolve(schemaPath);
      const schemaContent = JSON.parse(await fs.readFile(fullPath, 'utf-8'));
      
      this.ajv.addSchema(schemaContent, name);
      this.schemas.set(name, schemaContent);
      
      // Crear configuración por defecto
      const config: SchemaConfig = {
        name,
        path: schemaPath,
        strict: false,
        required: schemaContent.required || [],
        optional: [],
        patterns: {}
      };
      
      this.schemaConfigs.set(name, config);
    } catch (error) {
      throw new Error(`Failed to load schema '${name}' from '${schemaPath}': ${error.message}`);
    }
  }

  /**
   * Cargar todos los schemas automáticamente
   */
  async loadAllSchemas(): Promise<void> {
    const schemasDir = path.join(process.cwd(), 'data/schemas');
    
    const schemaFiles = [
      { name: 'static-page', path: 'pages/static-page.schema.json' },
      { name: 'portfolio', path: 'dynamic-content/portfolio.schema.json' },
      { name: 'careers', path: 'dynamic-content/careers.schema.json' },
      { name: 'newsletter', path: 'dynamic-content/newsletter.schema.json' }
    ];

    for (const schema of schemaFiles) {
      const fullPath = path.join(schemasDir, schema.path);
      await this.loadSchema(schema.name, fullPath);
    }
  }

  /**
   * Determinar qué schema usar para un archivo
   */
  getSchemaForFile(filePath: string): string | null {
    const relativePath = filePath.replace(/^.*\/public\/json\//, '');
    
    if (relativePath.startsWith('pages/')) {
      return 'static-page';
    }
    
    if (relativePath.includes('portfolio')) {
      return 'portfolio';
    }
    
    if (relativePath.includes('careers')) {
      return 'careers';
    }
    
    if (relativePath.includes('newsletter')) {
      return 'newsletter';
    }
    
    return null;
  }

  /**
   * Validar datos contra un schema
   */
  async validate<T = any>(
    data: T,
    schemaName: string,
    options: ValidationOptions = {}
  ): Promise<ValidationResult<T>> {
    const opts = { ...this.defaultOptions, ...options };
    const originalData = JSON.parse(JSON.stringify(data)); // Deep clone
    let processedData = JSON.parse(JSON.stringify(data));
    
    const result: ValidationResult<T> = {
      valid: false,
      data: processedData,
      originalData,
      errors: [],
      warnings: [],
      suggestions: [],
      fixes: [],
      schema: schemaName,
      stats: {
        errorsCount: 0,
        warningsCount: 0,
        fixesApplied: 0,
        compatibilityLevel: 'low'
      }
    };

    // Verificar que el schema existe
    const validate = this.ajv.getSchema(schemaName);
    if (!validate) {
      throw new SchemaNotFoundError(schemaName);
    }

    // Pre-procesamiento: normalización automática
    if (opts.autoFix) {
      const fixes = await this.applyAutoFixes(processedData, schemaName);
      result.fixes.push(...fixes);
      result.stats.fixesApplied = fixes.length;
    }

    // Ejecutar validación
    const isValid = validate(processedData);
    result.valid = isValid;
    result.data = processedData;

    if (!isValid && validate.errors) {
      result.errors = validate.errors;
      result.stats.errorsCount = validate.errors.length;

      // En modo flexible, convertir algunos errores a warnings
      if (!opts.strict) {
        const { errors, warnings } = this.categorizeErrors(validate.errors, opts);
        result.errors = errors;
        result.warnings = warnings;
        result.stats.warningsCount = warnings.length;
        
        // Si solo quedan warnings, considerar válido en modo flexible
        if (errors.length === 0) {
          result.valid = true;
        }
      }

      // Generar sugerencias
      if (opts.generateSuggestions) {
        result.suggestions = this.generateSuggestions(validate.errors, processedData);
      }
    }

    // Calcular nivel de compatibilidad
    result.stats.compatibilityLevel = this.calculateCompatibilityLevel(result);

    return result;
  }

  /**
   * Aplicar correcciones automáticas
   */
  private async applyAutoFixes(data: any, schemaName: string): Promise<ValidationFix[]> {
    const fixes: ValidationFix[] = [];
    const schema = this.schemas.get(schemaName);
    
    if (!schema) return fixes;

    // Fix 1: Agregar campos requeridos con valores por defecto
    if (schema.required && Array.isArray(schema.required)) {
      for (const field of schema.required) {
        if (!(field in data) && schema.properties && schema.properties[field]) {
          const fieldSchema = schema.properties[field];
          const defaultValue = this.getDefaultValue(fieldSchema);
          
          if (defaultValue !== undefined) {
            data[field] = defaultValue;
            fixes.push({
              path: field,
              type: 'added',
              newValue: defaultValue,
              description: `Added missing required field '${field}' with default value`
            });
          }
        }
      }
    }

    // Fix 2: Normalizar arrays de stats (object -> array)
    fixes.push(...this.normalizeStatsFields(data));

    // Fix 3: Normalizar IDs como strings
    fixes.push(...this.normalizeIdFields(data));

    // Fix 4: Normalizar URLs
    fixes.push(...this.normalizeUrlFields(data));

    return fixes;
  }

  /**
   * Normalizar campos de estadísticas
   */
  private normalizeStatsFields(data: any, path = ''): ValidationFix[] {
    const fixes: ValidationFix[] = [];
    
    if (data && typeof data === 'object') {
      for (const [key, value] of Object.entries(data)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (key === 'stats' && value && typeof value === 'object' && !Array.isArray(value)) {
          // Convertir object stats a array
          const statsArray = Object.entries(value).map(([statKey, statValue]) => ({
            key: statKey,
            value: statValue,
            label: this.humanizeKey(statKey)
          }));
          
          data[key] = statsArray;
          fixes.push({
            path: currentPath,
            type: 'converted',
            oldValue: value,
            newValue: statsArray,
            description: `Converted stats object to array format`
          });
        } else if (value && typeof value === 'object') {
          fixes.push(...this.normalizeStatsFields(value, currentPath));
        }
      }
    }
    
    return fixes;
  }

  /**
   * Normalizar campos ID como strings
   */
  private normalizeIdFields(data: any, path = ''): ValidationFix[] {
    const fixes: ValidationFix[] = [];
    
    if (data && typeof data === 'object') {
      for (const [key, value] of Object.entries(data)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (key === 'id' && typeof value !== 'string' && value != null) {
          const stringValue = String(value);
          data[key] = stringValue;
          fixes.push({
            path: currentPath,
            type: 'converted',
            oldValue: value,
            newValue: stringValue,
            description: `Converted ID from ${typeof value} to string`
          });
        } else if (value && typeof value === 'object') {
          fixes.push(...this.normalizeIdFields(value, currentPath));
        }
      }
    }
    
    return fixes;
  }

  /**
   * Normalizar campos URL
   */
  private normalizeUrlFields(data: any, path = ''): ValidationFix[] {
    const fixes: ValidationFix[] = [];
    
    if (data && typeof data === 'object') {
      for (const [key, value] of Object.entries(data)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        if ((key === 'url' || key.includes('url') || key.includes('link')) && 
            typeof value === 'string' && value.startsWith('/')) {
          // Las URLs relativas están bien, no necesitan corrección
        } else if (value && typeof value === 'object') {
          fixes.push(...this.normalizeUrlFields(value, currentPath));
        }
      }
    }
    
    return fixes;
  }

  /**
   * Obtener valor por defecto para un campo
   */
  private getDefaultValue(fieldSchema: any): any {
    if (fieldSchema.default !== undefined) {
      return fieldSchema.default;
    }
    
    switch (fieldSchema.type) {
      case 'string':
        return '';
      case 'number':
      case 'integer':
        return 0;
      case 'boolean':
        return false;
      case 'array':
        return [];
      case 'object':
        return {};
      default:
        return undefined;
    }
  }

  /**
   * Humanizar claves (camelCase -> Title Case)
   */
  private humanizeKey(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  /**
   * Categorizar errores en errores reales vs warnings
   */
  private categorizeErrors(errors: ErrorObject[], options: ValidationOptions) {
    const realErrors: ErrorObject[] = [];
    const warnings: string[] = [];
    
    for (const error of errors) {
      // En modo migración, algunos errores se convierten en warnings
      if (options.migrationMode) {
        if (error.keyword === 'required' && options.skipMissingRequired) {
          warnings.push(`Missing required field: ${error.params?.missingProperty || error.instancePath}`);
          continue;
        }
        
        if (error.keyword === 'additionalProperties' && options.allowExtraProperties) {
          warnings.push(`Additional property: ${error.instancePath}/${error.params?.additionalProperty}`);
          continue;
        }
        
        if (error.keyword === 'type' && this.isMinorTypeError(error)) {
          warnings.push(`Type mismatch: ${error.instancePath} (${error.message})`);
          continue;
        }
      }
      
      realErrors.push(error);
    }
    
    return { errors: realErrors, warnings };
  }

  /**
   * Verificar si es un error de tipo menor
   */
  private isMinorTypeError(error: ErrorObject): boolean {
    // Errores de tipo menores que se pueden tolerar en modo migración
    const minorTypeErrors = [
      'number vs string', // IDs numéricos vs string
      'object vs array', // Stats object vs array
      'string vs null' // URLs opcionales
    ];
    
    return minorTypeErrors.some(pattern => 
      error.message?.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  /**
   * Generar sugerencias de corrección
   */
  private generateSuggestions(errors: ErrorObject[], data: any): string[] {
    const suggestions: string[] = [];
    const errorTypes = new Set(errors.map(e => e.keyword));
    
    for (const error of errors) {
      switch (error.keyword) {
        case 'required':
          suggestions.push(`Add missing required field: ${error.params?.missingProperty}`);
          break;
        case 'type':
          suggestions.push(`Convert ${error.instancePath} from ${typeof error.data} to ${error.schema}`);
          break;
        case 'format':
          if (error.schema === 'uri') {
            suggestions.push(`Ensure ${error.instancePath} is a valid URL`);
          } else if (error.schema === 'email') {
            suggestions.push(`Ensure ${error.instancePath} is a valid email`);
          }
          break;
        case 'pattern':
          suggestions.push(`${error.instancePath} must match pattern: ${error.schema}`);
          break;
      }
    }
    
    // Sugerencias generales
    if (errorTypes.has('type')) {
      suggestions.push('Consider running auto-fix to normalize data types');
    }
    
    if (errorTypes.has('required')) {
      suggestions.push('Use migration mode to add missing fields gradually');
    }
    
    return [...new Set(suggestions)]; // Eliminar duplicados
  }

  /**
   * Calcular nivel de compatibilidad
   */
  private calculateCompatibilityLevel(result: ValidationResult): 'full' | 'high' | 'medium' | 'low' {
    const { errorsCount, warningsCount, fixesApplied } = result.stats;
    const totalIssues = errorsCount + warningsCount;
    
    if (result.valid && totalIssues === 0) {
      return 'full';
    }
    
    if (result.valid && errorsCount === 0) {
      return 'high';
    }
    
    if (errorsCount <= 3 && fixesApplied > 0) {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * Validar archivo JSON
   */
  async validateFile(filePath: string, options: ValidationOptions = {}): Promise<ValidationResult> {
    const schemaName = this.getSchemaForFile(filePath);
    
    if (!schemaName) {
      throw new Error(`No schema available for file: ${filePath}`);
    }
    
    const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
    return this.validate(data, schemaName, options);
  }

  /**
   * Obtener estadísticas de validación
   */
  getValidationStats(): any {
    return {
      schemasLoaded: this.schemas.size,
      availableSchemas: Array.from(this.schemas.keys()),
      defaultOptions: this.defaultOptions
    };
  }
}

// Instancia singleton del validador
export const validator = new FlexibleValidator();