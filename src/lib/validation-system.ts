/**
 * FASE 6: Validation System - Sistema de validación y sanitización robusta
 * 
 * Características:
 * - Validación de esquemas con Zod
 * - Sanitización de inputs XSS
 * - Validación de archivos y uploads
 * - Rate limiting por endpoint
 * - Logging de intentos maliciosos
 */

import { z } from 'zod';

/**
 * Esquemas de validación para diferentes entidades
 */

// Portfolio Project Schema
export const PortfolioProjectSchema = z.object({
  title: z.string().min(3).max(200).regex(/^[a-zA-Z0-9\s\-áéíóúÁÉÍÓÚñÑ]+$/),
  slug: z.string().min(3).max(100).regex(/^[a-z0-9\-]+$/),
  description: z.string().min(10).max(2000),
  category: z.string().min(1),
  status: z.enum(['active', 'inactive', 'draft']),
  featured: z.boolean().default(false),
  featured_image: z.string().url().optional().or(z.literal('')),
  gallery: z.array(z.string().url()).max(20).default([]),
  client: z.string().max(200).optional().or(z.literal('')),
  location: z.string().max(300).optional().or(z.literal('')),
  start_date: z.string().datetime().optional().or(z.literal('')),
  end_date: z.string().datetime().optional().or(z.literal('')),
  investment: z.string().max(100).optional().or(z.literal('')),
  area: z.string().max(100).optional().or(z.literal('')),
  tags: z.array(z.string().max(50)).max(10).default([]),
  order: z.number().int().min(0).max(9999).optional()
});

// Career Job Schema
export const CareerJobSchema = z.object({
  title: z.string().min(3).max(200),
  department: z.string().min(1),
  location: z.string().max(200),
  type: z.enum(['full-time', 'part-time', 'contract', 'internship']),
  experience: z.enum(['entry', 'mid', 'senior', 'lead']),
  salary_range: z.string().max(100).optional().or(z.literal('')),
  description: z.string().min(50).max(3000),
  requirements: z.array(z.string().max(500)).min(1).max(20),
  benefits: z.array(z.string().max(200)).max(15).default([]),
  status: z.enum(['active', 'inactive', 'draft']),
  applications_count: z.number().int().min(0).default(0)
});

// Newsletter Article Schema
export const NewsletterArticleSchema = z.object({
  title: z.string().min(5).max(300),
  slug: z.string().min(3).max(150).regex(/^[a-z0-9\-]+$/),
  author_id: z.string().min(1),
  category_id: z.string().min(1),
  content: z.string().min(100).max(50000),
  excerpt: z.string().min(50).max(500),
  featured_image: z.string().url().optional().or(z.literal('')),
  status: z.enum(['draft', 'published', 'archived']),
  published_at: z.string().datetime().optional().or(z.literal('')),
  tags: z.array(z.string().max(50)).max(15).default([]),
  meta: z.object({
    seo_title: z.string().max(60).optional(),
    seo_description: z.string().max(160).optional(),
    social_image: z.string().url().optional()
  }).optional()
});

/**
 * Sanitización de strings para prevenir XSS
 */
export class InputSanitizer {
  private static htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#96;',
    '=': '&#x3D;'
  };

  /**
   * Escapar HTML entities
   */
  static escapeHtml(str: string): string {
    if (typeof str !== 'string') return String(str);
    return str.replace(/[&<>"'`=\/]/g, (char) => this.htmlEntities[char] || char);
  }

  /**
   * Limpiar scripts maliciosos
   */
  static removeScripts(str: string): string {
    if (typeof str !== 'string') return String(str);
    
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/eval\s*\(/gi, '')
      .replace(/expression\s*\(/gi, '');
  }

  /**
   * Sanitizar URLs
   */
  static sanitizeUrl(url: string): string {
    if (typeof url !== 'string') return '';
    
    // Permitir solo HTTP, HTTPS y rutas relativas
    const allowedProtocols = /^(https?:\/\/|\/|\.\/|\.\.\/)/i;
    
    if (!allowedProtocols.test(url)) {
      return '';
    }
    
    // Remover caracteres peligrosos
    return url.replace(/[<>"'`]/g, '');
  }

  /**
   * Sanitizar objeto completo recursivamente
   */
  static sanitizeObject(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj === 'string') {
      return this.removeScripts(this.escapeHtml(obj));
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }
    
    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const cleanKey = this.escapeHtml(key);
        sanitized[cleanKey] = this.sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  }

  /**
   * Validar y sanitizar email
   */
  static sanitizeEmail(email: string): string {
    if (typeof email !== 'string') return '';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = email.toLowerCase().trim();
    
    return emailRegex.test(cleanEmail) ? cleanEmail : '';
  }

  /**
   * Sanitizar nombres de archivo
   */
  static sanitizeFilename(filename: string): string {
    if (typeof filename !== 'string') return '';
    
    return filename
      .replace(/[^a-zA-Z0-9\-_\.]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^[._-]+|[._-]+$/g, '')
      .slice(0, 255);
  }
}

/**
 * Rate Limiting System
 */
export class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();
  private limits: Map<string, { max: number; window: number }> = new Map();

  constructor() {
    // Configurar límites por defecto
    this.setLimit('api', 100, 60 * 1000); // 100 requests per minute
    this.setLimit('auth', 5, 15 * 60 * 1000); // 5 auth attempts per 15 minutes
    this.setLimit('upload', 10, 60 * 1000); // 10 uploads per minute
    
    // Limpiar datos antiguos cada 5 minutos
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Configurar límite para un tipo de request
   */
  setLimit(type: string, maxRequests: number, windowMs: number): void {
    this.limits.set(type, { max: maxRequests, window: windowMs });
  }

  /**
   * Verificar si el request está dentro del límite
   */
  checkLimit(identifier: string, type: string = 'api'): { allowed: boolean; resetTime?: number } {
    const limit = this.limits.get(type);
    if (!limit) {
      return { allowed: true };
    }

    const key = `${type}:${identifier}`;
    const now = Date.now();
    
    let requestData = this.requests.get(key);
    
    if (!requestData || now > requestData.resetTime) {
      requestData = {
        count: 1,
        resetTime: now + limit.window
      };
      this.requests.set(key, requestData);
      return { allowed: true };
    }
    
    if (requestData.count >= limit.max) {
      return { 
        allowed: false, 
        resetTime: requestData.resetTime 
      };
    }
    
    requestData.count++;
    return { allowed: true };
  }

  /**
   * Obtener información de límite actual
   */
  getLimitInfo(identifier: string, type: string = 'api'): {
    current: number;
    max: number;
    resetTime: number;
  } | null {
    const limit = this.limits.get(type);
    if (!limit) return null;

    const key = `${type}:${identifier}`;
    const requestData = this.requests.get(key);
    
    if (!requestData) {
      return {
        current: 0,
        max: limit.max,
        resetTime: Date.now() + limit.window
      };
    }
    
    return {
      current: requestData.count,
      max: limit.max,
      resetTime: requestData.resetTime
    };
  }

  /**
   * Limpiar datos antiguos
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, data] of this.requests.entries()) {
      if (now > data.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

/**
 * Validador principal
 */
export class RequestValidator {
  private rateLimiter = new RateLimiter();
  
  /**
   * Validar request completo
   */
  async validateRequest(
    data: any,
    schema: z.ZodSchema,
    identifier: string,
    rateLimitType: string = 'api'
  ): Promise<{
    valid: boolean;
    data?: any;
    errors?: string[];
    rateLimited?: boolean;
    resetTime?: number;
  }> {
    const errors: string[] = [];
    
    // 1. Verificar rate limiting
    const rateLimitCheck = this.rateLimiter.checkLimit(identifier, rateLimitType);
    if (!rateLimitCheck.allowed) {
      return {
        valid: false,
        rateLimited: true,
        resetTime: rateLimitCheck.resetTime,
        errors: ['Rate limit exceeded']
      };
    }
    
    // 2. Sanitizar datos
    const sanitizedData = InputSanitizer.sanitizeObject(data);
    
    // 3. Validar con esquema
    try {
      const validatedData = schema.parse(sanitizedData);
      return {
        valid: true,
        data: validatedData
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.push(...error.errors.map(e => `${e.path.join('.')}: ${e.message}`));
      } else {
        errors.push('Validation error');
      }
      
      return {
        valid: false,
        errors
      };
    }
  }

  /**
   * Validar archivo upload
   */
  validateFileUpload(
    file: { name: string; size: number; type: string },
    options: {
      maxSize?: number;
      allowedTypes?: string[];
      maxNameLength?: number;
    } = {}
  ): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];
    const {
      maxSize = 10 * 1024 * 1024, // 10MB por defecto
      allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
      maxNameLength = 255
    } = options;

    // Validar tamaño
    if (file.size > maxSize) {
      errors.push(`File size exceeds limit of ${maxSize / 1024 / 1024}MB`);
    }

    // Validar tipo
    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} not allowed`);
    }

    // Validar nombre
    if (file.name.length > maxNameLength) {
      errors.push(`Filename too long (max ${maxNameLength} characters)`);
    }

    // Validar caracteres peligrosos en nombre
    if (/[<>:"'|?*\\\/]/.test(file.name)) {
      errors.push('Filename contains invalid characters');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * Obtener información de rate limiting
   */
  getRateLimitInfo(identifier: string, type: string = 'api') {
    return this.rateLimiter.getLimitInfo(identifier, type);
  }
}

/**
 * Middleware de validación para APIs
 */
export function withValidation(schema: z.ZodSchema, rateLimitType: string = 'api') {
  const validator = new RequestValidator();
  
  return function(handler: Function) {
    return async (request: any, ...args: any[]) => {
      try {
        // Obtener datos del request
        let data: any = {};
        if (request.method !== 'GET') {
          data = await request.json();
        }
        
        // Obtener identificador para rate limiting (IP o user ID)
        const identifier = request.headers.get('x-forwarded-for') || 
                          request.headers.get('x-real-ip') || 
                          'unknown';
        
        // Validar request
        const validation = await validator.validateRequest(
          data,
          schema,
          identifier,
          rateLimitType
        );
        
        if (!validation.valid) {
          const status = validation.rateLimited ? 429 : 400;
          const response: any = {
            error: validation.rateLimited ? 'Rate limit exceeded' : 'Validation failed',
            ...(validation.errors && { details: validation.errors }),
            ...(validation.resetTime && { resetTime: validation.resetTime })
          };
          
          return new Response(JSON.stringify(response), {
            status,
            headers: {
              'Content-Type': 'application/json',
              ...(validation.resetTime && {
                'Retry-After': String(Math.ceil((validation.resetTime - Date.now()) / 1000))
              })
            }
          });
        }
        
        // Agregar datos validados al request
        (request as any).validatedData = validation.data;
        
        return handler(request, ...args);
      } catch (error) {
        console.error('Validation middleware error:', error);
        return new Response(
          JSON.stringify({ error: 'Internal validation error' }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    };
  };
}

// Instancias exportadas
export const inputSanitizer = new InputSanitizer();
export const rateLimiter = new RateLimiter();
export const requestValidator = new RequestValidator();

// Esquemas exportados para uso directo
export const ValidationSchemas = {
  PortfolioProject: PortfolioProjectSchema,
  CareerJob: CareerJobSchema,
  NewsletterArticle: NewsletterArticleSchema
};

export default RequestValidator;