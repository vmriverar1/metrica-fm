/**
 * Controlador Base para APIs REST
 * Implementación consistente de endpoints CRUD para todos los sistemas
 * Reutilizable para Newsletter, Portfolio, Careers y futuros sistemas
 */

import { NextRequest, NextResponse } from 'next/server';
import { BaseFirestoreService, BaseEntity, BaseData, FilterCondition, OrderCondition, CRUDResponse } from '@/lib/firestore/base-service';
import {
  UnifiedAPIResponse,
  APIResponse,
  Validator,
  APIMiddleware,
  withErrorHandling
} from '@/lib/api/unified-response';

// Export unified response type
export type { UnifiedAPIResponse as APIResponse };

export interface QueryParams {
  page?: string;
  limit?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  [key: string]: string | undefined;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export type ValidatorFunction<T> = (data: any) => ValidationResult;
export type TransformerFunction<T> = (data: any) => T;

/**
 * Controlador Base para APIs REST Unificadas
 */
export class BaseAPIController<T extends BaseEntity, TData extends BaseData = BaseData> {
  protected service: BaseFirestoreService<T, TData>;
  protected validator?: ValidatorFunction<TData>;
  protected transformer?: TransformerFunction<TData>;
  protected searchFields: string[];
  protected allowedFilters: string[];
  protected defaultLimit: number;
  protected maxLimit: number;
  protected systemName: string;

  constructor(
    service: BaseFirestoreService<T, TData>,
    options: {
      validator?: ValidatorFunction<TData>;
      transformer?: TransformerFunction<TData>;
      searchFields?: string[];
      allowedFilters?: string[];
      defaultLimit?: number;
      maxLimit?: number;
      systemName?: string;
    } = {}
  ) {
    this.service = service;
    this.validator = options.validator;
    this.transformer = options.transformer;
    this.searchFields = options.searchFields || [];
    this.allowedFilters = options.allowedFilters || [];
    this.defaultLimit = options.defaultLimit || 20;
    this.maxLimit = options.maxLimit || 100;
    this.systemName = options.systemName || 'unknown';
  }

  // ==========================================
  // HANDLERS HTTP
  // ==========================================

  /**
   * GET - Listar documentos con filtros, búsqueda y paginación
   */
  async handleGET(request: NextRequest): Promise<NextResponse> {
    return withErrorHandling(async () => {
      // Apply middleware
      APIMiddleware.logRequest(request, this.systemName);

      const rateLimitResponse = await APIMiddleware.rateLimit(request);
      if (rateLimitResponse) return rateLimitResponse;

      const { searchParams } = new URL(request.url);
      const params = this.parseQueryParams(searchParams);

      // Construir filtros
      const filters = this.buildFilters(params);

      // Construir ordenamiento
      const orderBy = this.buildOrderBy(params);

      // Manejar búsqueda
      let items: T[];
      if (params.search && this.searchFields.length > 0) {
        items = await this.service.search(params.search, this.searchFields);
        // Aplicar ordenamiento manual si es necesario
        items = this.applyManualSort(items, orderBy);
      } else {
        items = await this.service.getAll(filters, orderBy);
      }

      // Aplicar paginación
      const page = parseInt(params.page || '1');
      const limit = Math.min(parseInt(params.limit || String(this.defaultLimit)), this.maxLimit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const paginatedItems = items.slice(startIndex, endIndex);
      const hasMore = endIndex < items.length;

      return APIResponse.paginated(
        paginatedItems,
        {
          page,
          limit,
          total: items.length,
          hasMore
        },
        undefined,
        {
          system: this.systemName,
          endpoint: 'list',
          filters: Object.keys(filters).length > 0 ? filters : undefined,
          search: params.search
        }
      );
    }, `${this.systemName} GET handler`);
  }

  /**
   * POST - Crear nuevo documento
   */
  async handlePOST(request: NextRequest): Promise<NextResponse> {
    return withErrorHandling(async () => {
      // Apply middleware
      APIMiddleware.logRequest(request, this.systemName);

      const rateLimitResponse = await APIMiddleware.rateLimit(request, { maxRequests: 50 });
      if (rateLimitResponse) return rateLimitResponse;

      const body = await request.json();

      // Validar campos requeridos básicos
      if (!body || typeof body !== 'object') {
        return APIResponse.badRequest('Request body must be a valid JSON object');
      }

      // Validar datos específicos del sistema
      if (this.validator) {
        const validation = this.validator(body);
        if (!validation.isValid) {
          return APIResponse.validationError(
            'Validation failed',
            validation.errors,
            { system: this.systemName, endpoint: 'create' }
          );
        }
      }

      // Transformar datos si es necesario
      const transformedData = this.transformer ? this.transformer(body) : body;

      // Crear documento
      const result = await this.service.create(transformedData);

      if (result.success) {
        return APIResponse.created(
          { id: result.data },
          result.message || 'Document created successfully',
          {
            system: this.systemName,
            endpoint: 'create'
          }
        );
      } else {
        return APIResponse.badRequest(
          result.message || 'Failed to create document',
          {
            system: this.systemName,
            endpoint: 'create',
            error: result.error
          }
        );
      }
    }, `${this.systemName} POST handler`);
  }

  /**
   * PUT - Actualizar documento existente
   */
  async handlePUT(request: NextRequest, id: string): Promise<NextResponse> {
    return withErrorHandling(async () => {
      // Apply middleware
      APIMiddleware.logRequest(request, this.systemName);

      const rateLimitResponse = await APIMiddleware.rateLimit(request, { maxRequests: 50 });
      if (rateLimitResponse) return rateLimitResponse;

      // Validar ID
      if (!id || id.trim().length === 0) {
        return APIResponse.badRequest('Document ID is required');
      }

      const body = await request.json();

      // Validar campos requeridos básicos
      if (!body || typeof body !== 'object') {
        return APIResponse.badRequest('Request body must be a valid JSON object');
      }

      // Verificar que el documento existe
      const existingDoc = await this.service.getById(id);
      if (!existingDoc) {
        return APIResponse.notFound(
          `Document with ID ${id} does not exist`,
          {
            system: this.systemName,
            endpoint: 'update',
            documentId: id
          }
        );
      }

      // Validar datos parciales
      if (this.validator) {
        const validation = this.validator({ ...existingDoc, ...body });
        if (!validation.isValid) {
          return APIResponse.validationError(
            'Validation failed',
            validation.errors,
            { system: this.systemName, endpoint: 'update', documentId: id }
          );
        }
      }

      // Transformar datos si es necesario
      const transformedData = this.transformer ? this.transformer(body) : body;

      // Actualizar documento
      const result = await this.service.update(id, transformedData);

      if (result.success) {
        return APIResponse.success(
          null,
          result.message || 'Document updated successfully',
          {
            system: this.systemName,
            endpoint: 'update',
            documentId: id
          }
        );
      } else {
        return APIResponse.badRequest(
          result.message || 'Failed to update document',
          {
            system: this.systemName,
            endpoint: 'update',
            documentId: id,
            error: result.error
          }
        );
      }
    }, `${this.systemName} PUT handler`);
  }

  /**
   * DELETE - Eliminar documento
   */
  async handleDELETE(request: NextRequest, id: string): Promise<NextResponse> {
    return withErrorHandling(async () => {
      // Apply middleware
      APIMiddleware.logRequest(request, this.systemName);

      const rateLimitResponse = await APIMiddleware.rateLimit(request, { maxRequests: 30 });
      if (rateLimitResponse) return rateLimitResponse;

      // Validar ID
      if (!id || id.trim().length === 0) {
        return APIResponse.badRequest('Document ID is required');
      }

      // Verificar que el documento existe
      const existingDoc = await this.service.getById(id);
      if (!existingDoc) {
        return APIResponse.notFound(
          `Document with ID ${id} does not exist`,
          {
            system: this.systemName,
            endpoint: 'delete',
            documentId: id
          }
        );
      }

      // Eliminar documento
      const result = await this.service.delete(id);

      if (result.success) {
        return APIResponse.success(
          null,
          result.message || 'Document deleted successfully',
          {
            system: this.systemName,
            endpoint: 'delete',
            documentId: id
          }
        );
      } else {
        return APIResponse.badRequest(
          result.message || 'Failed to delete document',
          {
            system: this.systemName,
            endpoint: 'delete',
            documentId: id,
            error: result.error
          }
        );
      }
    }, `${this.systemName} DELETE handler`);
  }

  /**
   * GET by ID - Obtener documento específico
   */
  async handleGETById(request: NextRequest, id: string): Promise<NextResponse> {
    return withErrorHandling(async () => {
      // Apply middleware
      APIMiddleware.logRequest(request, this.systemName);

      const rateLimitResponse = await APIMiddleware.rateLimit(request);
      if (rateLimitResponse) return rateLimitResponse;

      // Validar ID
      if (!id || id.trim().length === 0) {
        return APIResponse.badRequest('Document ID is required');
      }

      const document = await this.service.getById(id);

      if (!document) {
        return APIResponse.notFound(
          `Document with ID ${id} does not exist`,
          {
            system: this.systemName,
            endpoint: 'get',
            documentId: id
          }
        );
      }

      return APIResponse.success(
        document,
        'Document retrieved successfully',
        {
          system: this.systemName,
          endpoint: 'get',
          documentId: id
        }
      );
    }, `${this.systemName} GET by ID handler`);
  }

  // ==========================================
  // UTILIDADES PRIVADAS
  // ==========================================

  private parseQueryParams(searchParams: URLSearchParams): QueryParams {
    const params: QueryParams = {};

    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    return params;
  }

  private buildFilters(params: QueryParams): FilterCondition[] {
    const filters: FilterCondition[] = [];

    // Construir filtros basados en parámetros permitidos
    this.allowedFilters.forEach(filterField => {
      const value = params[filterField];
      if (value !== undefined) {
        filters.push({
          field: filterField,
          operator: '==',
          value: this.parseFilterValue(value)
        });
      }
    });

    // Filtros especiales
    if (params.status) {
      filters.push({
        field: 'status',
        operator: '==',
        value: params.status
      });
    }

    if (params.featured === 'true') {
      filters.push({
        field: 'featured',
        operator: '==',
        value: true
      });
    }

    return filters;
  }

  private buildOrderBy(params: QueryParams): OrderCondition[] {
    const orderBy: OrderCondition[] = [];

    if (params.sort) {
      orderBy.push({
        field: params.sort,
        direction: params.order === 'desc' ? 'desc' : 'asc'
      });
    } else {
      // Ordenamiento por defecto
      orderBy.push({
        field: 'updated_at',
        direction: 'desc'
      });
    }

    return orderBy;
  }

  private parseFilterValue(value: string): any {
    // Intentar parsear como número
    if (!isNaN(Number(value))) {
      return Number(value);
    }

    // Intentar parsear como boolean
    if (value === 'true') return true;
    if (value === 'false') return false;

    // Devolver como string
    return value;
  }

  private applyManualSort(items: T[], orderBy: OrderCondition[]): T[] {
    if (orderBy.length === 0) return items;

    return items.sort((a, b) => {
      for (const order of orderBy) {
        const aValue = (a as any)[order.field];
        const bValue = (b as any)[order.field];

        let comparison = 0;
        if (aValue < bValue) comparison = -1;
        else if (aValue > bValue) comparison = 1;

        if (comparison !== 0) {
          return order.direction === 'desc' ? -comparison : comparison;
        }
      }
      return 0;
    });
  }
}