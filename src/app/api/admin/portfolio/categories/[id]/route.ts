/**
 * API Route: /api/admin/portfolio/categories/[id]
 * CRUD para categoría específica del portfolio
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, requirePermission } from '@/lib/admin/middleware/auth-middleware';
import { jsonCrudSystem } from '@/lib/admin';
import { logger } from '@/lib/admin/core/logger';

interface RouteParams {
  params: {
    id: string;
  };
}

const PORTFOLIO_FILE = 'dynamic-content/portfolio/content.json';

// GET /api/admin/portfolio/categories/[id] - Obtener categoría específica
export const GET = withAuth(
  async (request: NextRequest, context, { params }: RouteParams) => {
    try {
      const { id } = params;

      // Leer datos del portfolio
      const portfolioData = await jsonCrudSystem.readJSON(PORTFOLIO_FILE, true);
      const categories = portfolioData.categories || [];

      // Buscar categoría
      const category = categories.find((cat: any) => cat.id === id);
      if (!category) {
        return NextResponse.json(
          {
            success: false,
            error: 'CATEGORY_NOT_FOUND',
            message: 'Category not found.'
          },
          { status: 404 }
        );
      }

      // Obtener proyectos relacionados
      const projects = portfolioData.projects || [];
      const relatedProjects = projects.filter((project: any) => project.category === id);

      return NextResponse.json({
        success: true,
        data: {
          category: {
            ...category,
            projects_count: relatedProjects.length
          },
          related_projects: relatedProjects.map((project: any) => ({
            id: project.id,
            title: project.title,
            status: project.status,
            featured_image: project.featured_image
          }))
        }
      });

    } catch (error) {
      await logger.error('portfolio-api', `Failed to get category: ${(await params).id}`, error, {
        userId: context.user.id
      });

      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to retrieve category.'
        },
        { status: 500 }
      );
    }
  },
  requirePermission('portfolio', 'read')()
);

// PUT /api/admin/portfolio/categories/[id] - Actualizar categoría
export const PUT = withAuth(
  async (request: NextRequest, context, { params }: RouteParams) => {
    try {
      const { id } = params;
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

      // Buscar categoría
      const categoryIndex = categories.findIndex((cat: any) => cat.id === id);
      if (categoryIndex === -1) {
        return NextResponse.json(
          {
            success: false,
            error: 'CATEGORY_NOT_FOUND',
            message: 'Category not found.'
          },
          { status: 404 }
        );
      }

      // Verificar que el slug no existe en otra categoría
      const existingCategory = categories.find((cat: any) => cat.slug === slug && cat.id !== id);
      if (existingCategory) {
        return NextResponse.json(
          {
            success: false,
            error: 'SLUG_EXISTS',
            message: 'A category with this slug already exists.'
          },
          { status: 409 }
        );
      }

      // Actualizar categoría
      const updatedCategory = {
        ...categories[categoryIndex],
        name,
        slug,
        description: description || '',
        icon: icon || '',
        color: color || '#00A8E8',
        featured_image: featured_image || '',
        featured: !!featured,
        order: order !== undefined ? Number(order) : categories[categoryIndex].order,
        updated_at: new Date().toISOString(),
        updated_by: context.user.id
      };

      categories[categoryIndex] = updatedCategory;

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
        action: 'update',
        resource: 'portfolio-category',
        resourceId: id,
        message: `Portfolio category '${name}' updated`,
        user: context.user.id,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        metadata: { name, slug }
      });

      return NextResponse.json({
        success: true,
        message: 'Category updated successfully.',
        data: { category: updatedCategory }
      });

    } catch (error) {
      await logger.error('portfolio-api', `Failed to update category: ${(await params).id}`, error, {
        userId: context.user.id
      });

      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to update category.'
        },
        { status: 500 }
      );
    }
  },
  requirePermission('portfolio', 'write')()
);

// DELETE /api/admin/portfolio/categories/[id] - Eliminar categoría
export const DELETE = withAuth(
  async (request: NextRequest, context, { params }: RouteParams) => {
    try {
      const { id } = params;

      // Leer datos actuales
      const portfolioData = await jsonCrudSystem.readJSON(PORTFOLIO_FILE, true);
      const categories = portfolioData.categories || [];
      const projects = portfolioData.projects || [];

      // Buscar categoría
      const categoryIndex = categories.findIndex((cat: any) => cat.id === id);
      if (categoryIndex === -1) {
        return NextResponse.json(
          {
            success: false,
            error: 'CATEGORY_NOT_FOUND',
            message: 'Category not found.'
          },
          { status: 404 }
        );
      }

      const category = categories[categoryIndex];

      // Verificar que no tenga proyectos asociados
      const relatedProjects = projects.filter((project: any) => project.category === id);
      if (relatedProjects.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'CATEGORY_HAS_PROJECTS',
            message: `Cannot delete category with ${relatedProjects.length} associated projects.`,
            details: {
              projects_count: relatedProjects.length,
              project_titles: relatedProjects.slice(0, 5).map((p: any) => p.title)
            }
          },
          { status: 409 }
        );
      }

      // Eliminar categoría
      categories.splice(categoryIndex, 1);

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
        action: 'delete',
        resource: 'portfolio-category',
        resourceId: id,
        message: `Portfolio category '${category.name}' deleted`,
        user: context.user.id,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        metadata: { name: category.name, slug: category.slug }
      });

      return NextResponse.json({
        success: true,
        message: 'Category deleted successfully.'
      });

    } catch (error) {
      await logger.error('portfolio-api', `Failed to delete category: ${(await params).id}`, error, {
        userId: context.user.id
      });

      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to delete category.'
        },
        { status: 500 }
      );
    }
  },
  requirePermission('portfolio', 'delete')()
);

// Método OPTIONS para CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}