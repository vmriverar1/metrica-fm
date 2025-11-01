/**
 * Unified API Response System
 * Standardizes all API responses across all systems
 */

import { NextResponse } from 'next/server';

// Standard response structure for all APIs
export interface UnifiedAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    timestamp?: string;
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
    system?: string;
    endpoint?: string;
    version?: string;
    [key: string]: any;
  };
}

// Standard error codes
export enum APIErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  RATE_LIMIT = 'RATE_LIMIT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  CONFLICT = 'CONFLICT'
}

// HTTP Status mapping
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  RATE_LIMIT: 429,
  INTERNAL_ERROR: 500
} as const;

/**
 * Unified response builder
 */
export class UnifiedResponseBuilder {
  /**
   * Success response
   */
  static success<T>(
    data: T,
    message?: string,
    meta?: UnifiedAPIResponse<T>['meta'],
    status: number = HTTP_STATUS.OK
  ): NextResponse {
    const response: UnifiedAPIResponse<T> = {
      success: true,
      data,
      message,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0',
        ...meta
      }
    };

    return NextResponse.json(response, { status });
  }

  /**
   * Created response
   */
  static created<T>(
    data: T,
    message?: string,
    meta?: UnifiedAPIResponse<T>['meta']
  ): NextResponse {
    return this.success(data, message, meta, HTTP_STATUS.CREATED);
  }

  /**
   * Error response
   */
  static error(
    error: string | APIErrorCode,
    message?: string,
    status: number = HTTP_STATUS.INTERNAL_ERROR,
    meta?: UnifiedAPIResponse['meta']
  ): NextResponse {
    const response: UnifiedAPIResponse = {
      success: false,
      error,
      message,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0',
        ...meta
      }
    };

    return NextResponse.json(response, { status });
  }

  /**
   * Validation error response
   */
  static validationError(
    message: string,
    errors?: string[],
    meta?: UnifiedAPIResponse['meta']
  ): NextResponse {
    return this.error(
      APIErrorCode.VALIDATION_ERROR,
      message,
      HTTP_STATUS.VALIDATION_ERROR,
      {
        ...meta,
        validationErrors: errors
      }
    );
  }

  /**
   * Not found response
   */
  static notFound(
    message: string = 'Resource not found',
    meta?: UnifiedAPIResponse['meta']
  ): NextResponse {
    return this.error(
      APIErrorCode.NOT_FOUND,
      message,
      HTTP_STATUS.NOT_FOUND,
      meta
    );
  }

  /**
   * Bad request response
   */
  static badRequest(
    message: string,
    meta?: UnifiedAPIResponse['meta']
  ): NextResponse {
    return this.error(
      APIErrorCode.BAD_REQUEST,
      message,
      HTTP_STATUS.BAD_REQUEST,
      meta
    );
  }

  /**
   * Conflict response
   */
  static conflict(
    message: string,
    meta?: UnifiedAPIResponse['meta']
  ): NextResponse {
    return this.error(
      APIErrorCode.CONFLICT,
      message,
      HTTP_STATUS.CONFLICT,
      meta
    );
  }

  /**
   * Paginated response
   */
  static paginated<T>(
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
    },
    message?: string,
    meta?: UnifiedAPIResponse<T[]>['meta']
  ): NextResponse {
    return this.success(
      data,
      message,
      {
        ...meta,
        ...pagination
      }
    );
  }

  /**
   * Collection response with metadata
   */
  static collection<T>(
    data: T[],
    collectionMeta: {
      total: number;
      system: string;
      collection: string;
      filters?: any;
    },
    message?: string
  ): NextResponse {
    return this.success(
      data,
      message,
      {
        ...collectionMeta,
        count: data.length
      }
    );
  }
}

/**
 * Request validator utilities
 */
export class RequestValidator {
  /**
   * Validate required fields
   */
  static validateRequired(
    data: any,
    requiredFields: string[]
  ): { isValid: boolean; missingFields: string[] } {
    const missingFields: string[] = [];

    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        missingFields.push(field);
      }
    }

    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate URL format
   */
  static validateURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate slug format
   */
  static validateSlug(slug: string): boolean {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(slug);
  }

  /**
   * Sanitize string input
   */
  static sanitizeString(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }
}

/**
 * API rate limiting utilities
 */
export class RateLimiter {
  private static requests = new Map<string, { count: number; resetTime: number }>();

  /**
   * Check rate limit for an IP/key
   */
  static checkLimit(
    key: string,
    maxRequests: number = 100,
    windowMs: number = 60 * 1000 // 1 minute
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const record = this.requests.get(key);

    if (!record || now > record.resetTime) {
      // Reset or create new record
      const resetTime = now + windowMs;
      this.requests.set(key, { count: 1, resetTime });
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime
      };
    }

    if (record.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime
      };
    }

    // Increment count
    record.count++;
    this.requests.set(key, record);

    return {
      allowed: true,
      remaining: maxRequests - record.count,
      resetTime: record.resetTime
    };
  }

  /**
   * Clean expired records
   */
  static cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

/**
 * Error handling utilities
 */
export class ErrorHandler {
  /**
   * Handle and format any error into a standard response
   */
  static handleError(error: unknown, context?: string): NextResponse {
    console.error(`API Error ${context ? `in ${context}` : ''}:`, error);

    if (error instanceof Error) {
      // Handle known error types
      if (error.message.includes('not found')) {
        return UnifiedResponseBuilder.notFound(error.message);
      }

      if (error.message.includes('validation')) {
        return UnifiedResponseBuilder.validationError(error.message);
      }

      if (error.message.includes('unauthorized')) {
        return UnifiedResponseBuilder.error(
          APIErrorCode.UNAUTHORIZED,
          'Unauthorized access',
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      // Generic error
      return UnifiedResponseBuilder.error(
        APIErrorCode.INTERNAL_ERROR,
        error.message
      );
    }

    // Unknown error type
    return UnifiedResponseBuilder.error(
      APIErrorCode.INTERNAL_ERROR,
      'An unexpected error occurred'
    );
  }

  /**
   * Async error wrapper
   */
  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T | NextResponse> {
    try {
      return await operation();
    } catch (error) {
      return this.handleError(error, context);
    }
  }
}

/**
 * Middleware utilities
 */
export class APIMiddleware {
  /**
   * Apply rate limiting
   */
  static async rateLimit(
    request: Request,
    options: { maxRequests?: number; windowMs?: number } = {}
  ): Promise<NextResponse | null> {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { allowed, remaining, resetTime } = RateLimiter.checkLimit(
      ip,
      options.maxRequests,
      options.windowMs
    );

    if (!allowed) {
      return UnifiedResponseBuilder.error(
        APIErrorCode.RATE_LIMIT,
        'Too many requests',
        HTTP_STATUS.RATE_LIMIT,
        {
          resetTime: new Date(resetTime).toISOString(),
          remaining: 0
        }
      );
    }

    return null; // Allow request to continue
  }

  /**
   * Log request
   */
  static logRequest(request: Request, system: string): void {
    const { method, url } = request;
    const timestamp = new Date().toISOString();
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    console.log(`[${timestamp}] ${system.toUpperCase()} API: ${method} ${url} from ${ip}`);
  }
}

// Export convenience functions
export const APIResponse = UnifiedResponseBuilder;
export const Validator = RequestValidator;
export const handleError = ErrorHandler.handleError;
export const withErrorHandling = ErrorHandler.withErrorHandling;