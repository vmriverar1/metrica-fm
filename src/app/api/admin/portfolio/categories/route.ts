/**
 * API Route: /api/admin/portfolio/categories
 * CRUD para categorías del portfolio
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, requirePermission } from '@/lib/admin/middleware/auth-middleware';
import { jsonCrudSystem } from '@/lib/admin';
import { logger } from '@/lib/admin/core/logger';
import crypto from 'crypto';

const PORTFOLIO_FILE = 'dynamic-content/portfolio/content.json';

// GET /api/admin/portfolio/categories - Listar categorías
export const GET = withAuth(
  async (request: NextRequest, context) => {
    try {
      const { searchParams } = new URL(request.url);
      const search = searchParams.get('search');
      const sort = searchParams.get('sort') || 'order';
      const order = searchParams.get('order') || 'asc';
      const featured = searchParams.get('featured');

      // Leer datos del portfolio
      const portfolioData = await jsonCrudSystem.readJSON(PORTFOLIO_FILE, true);
      let categories = portfolioData.categories || [];

      // Filtrar por búsqueda
      if (search) {
        const searchLower = search.toLowerCase();
        categories = categories.filter((cat: any) =>
          cat.name?.toLowerCase().includes(searchLower) ||
          cat.slug?.toLowerCase().includes(searchLower) ||
          cat.description?.toLowerCase().includes(searchLower)
        );
      }

      // Filtrar por featured
      if (featured !== null) {
        const isFeatured = featured === 'true';
        categories = categories.filter((cat: any) => !!cat.featured === isFeatured);
      }

      // Ordenar
      categories.sort((a: any, b: any) => {
        const aValue = a[sort] || '';
        const bValue = b[sort] || '';
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return order === 'desc' ? bValue - aValue : aValue - bValue;
        }
        
        const comparison = aValue.toString().localeCompare(bValue.toString());
        return order === 'desc' ? -comparison : comparison;
      });

      return NextResponse.json({
        success: true,
        data: {
          categories,
          total: categories.length,
          filters: { search, sort, order, featured }
        }
      });

    } catch (error) {
      await logger.error('portfolio-api', 'Failed to list categories', error, {
        userId: context.user.id
      });

      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to retrieve categories.'
        },
        { status: 500 }
      );
    }
  },
  requirePermission('portfolio', 'read')()
);

// POST /api/admin/portfolio/categories - Crear categoría
export const POST = withAuth(
  async (request: NextRequest, context) => {
    try {
      const body = await request.json();
      const { name, slug, description, icon, color, featured_image, featured, order } = body;

      // Validar campos requeridos
      if (!name || !slug) {
        return NextResponse.json(
          {
            success: false,
            error: 'INVALID_INPUT',
            message: 'Name and slug are required.'
          },
          { status: 400 }
        );
      }

      // Validar formato del slug
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(slug)) {
        return NextResponse.json(
          {
            success: false,
            error: 'INVALID_SLUG',
            message: 'Slug must contain only lowercase letters, numbers, and hyphens.'
          },
          { status: 400 }
        );
      }

      // Leer datos actuales
      const portfolioData = await jsonCrudSystem.readJSON(PORTFOLIO_FILE, true);
      const categories = portfolioData.categories || [];

      // Verificar que el slug no existe
      if (categories.some((cat: any) => cat.slug === slug)) {
        return NextResponse.json(
          {
            success: false,
            error: 'SLUG_EXISTS',
            message: 'A category with this slug already exists.'
          },
          { status: 409 }
        );
      }

      // Crear nueva categoría
      const newCategory = {
        id: `cat_${crypto.randomBytes(8).toString('hex')}`,
        name,
        slug,
        description: description || '',
        icon: icon || '',
        color: color || '#00A8E8',
        featured_image: featured_image || '',
        featured: !!featured,
        order: order !== undefined ? Number(order) : categories.length,
        projects_count: 0,
        total_investment: '',
        total_area: '',
        created_at: new Date().toISOString(),
        created_by: context.user.id,
        updated_at: new Date().toISOString(),
        updated_by: context.user.id
      };

      // Agregar a la lista
      categories.push(newCategory);

      // Actualizar archivo
      const updatedData = {
        ...portfolioData,
        categories,
        metadata: {
          ...portfolioData.metadata,
          updated_at: new Date().toISOString(),
          updated_by: context.user.id
        }
      };

      await jsonCrudSystem.writeJSON(PORTFOLIO_FILE, updatedData, {
        validate: true,
        backup: true
      });

      // Log de auditoría
      await logger.audit({
        action: 'create',
        resource: 'portfolio-category',
        resourceId: newCategory.id,
        message: `Portfolio category '${name}' created`,
        user: context.user.id,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        metadata: { name, slug }
      });

      return NextResponse.json({
        success: true,
        message: 'Category created successfully.',
        data: { category: newCategory }
      }, { status: 201 });

    } catch (error) {
      await logger.error('portfolio-api', 'Failed to create category', error, {
        userId: context.user.id
      });

      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to create category.'
        },
        { status: 500 }
      );
    }
  },
  requirePermission('portfolio', 'write')()
);

// Método OPTIONS para CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}