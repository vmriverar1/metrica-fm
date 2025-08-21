/**
 * API Route: /api/admin/portfolio/projects/[id]
 * CRUD para proyecto específico del portfolio
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

// GET /api/admin/portfolio/projects/[id] - Obtener proyecto específico
export const GET = withAuth(
  async (request: NextRequest, context, { params }: RouteParams) => {
    try {
      const { id } = params;

      // Leer datos del portfolio
      const portfolioData = await jsonCrudSystem.readJSON(PORTFOLIO_FILE, true);
      const projects = portfolioData.projects || [];
      const categories = portfolioData.categories || [];

      // Buscar proyecto
      const project = projects.find((proj: any) => proj.id === id);
      if (!project) {
        return NextResponse.json(
          {
            success: false,
            error: 'PROJECT_NOT_FOUND',
            message: 'Project not found.'
          },
          { status: 404 }
        );
      }

      // Enriquecer con información de categoría
      const category = categories.find((cat: any) => cat.id === project.category);
      const enrichedProject = {
        ...project,
        category_info: category ? {
          id: category.id,
          name: category.name,
          slug: category.slug,
          color: category.color,
          icon: category.icon
        } : null
      };

      // Proyectos relacionados (misma categoría, excluyendo el actual)
      const relatedProjects = projects
        .filter((proj: any) => proj.category === project.category && proj.id !== id)
        .slice(0, 5)
        .map((proj: any) => ({
          id: proj.id,
          title: proj.title,
          slug: proj.slug,
          featured_image: proj.featured_image,
          status: proj.status
        }));

      return NextResponse.json({
        success: true,
        data: {
          project: enrichedProject,
          related_projects: relatedProjects,
          category: category || null
        }
      });

    } catch (error) {
      await logger.error('portfolio-api', `Failed to get project: ${params.id}`, error, {
        userId: context.user.id
      });

      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to retrieve project.'
        },
        { status: 500 }
      );
    }
  },
  requirePermission('portfolio', 'read')()
);

// PUT /api/admin/portfolio/projects/[id] - Actualizar proyecto
export const PUT = withAuth(
  async (request: NextRequest, context, { params }: RouteParams) => {
    try {
      const { id } = params;
      const body = await request.json();
      const {
        title,
        slug,
        description,
        category,
        status,
        featured,
        featured_image,
        gallery,
        client,
        location,
        start_date,
        end_date,
        investment,
        area,
        tags,
        order,
        metadata
      } = body;

      // Validar campos requeridos
      if (!title || !category) {
        return NextResponse.json(
          {
            success: false,
            error: 'INVALID_INPUT',
            message: 'Title and category are required.'
          },
          { status: 400 }
        );
      }

      // Leer datos actuales
      const portfolioData = await jsonCrudSystem.readJSON(PORTFOLIO_FILE, true);
      const projects = portfolioData.projects || [];
      const categories = portfolioData.categories || [];

      // Buscar proyecto
      const projectIndex = projects.findIndex((proj: any) => proj.id === id);
      if (projectIndex === -1) {
        return NextResponse.json(
          {
            success: false,
            error: 'PROJECT_NOT_FOUND',
            message: 'Project not found.'
          },
          { status: 404 }
        );
      }

      const currentProject = projects[projectIndex];

      // Verificar que la nueva categoría existe
      const categoryExists = categories.find((cat: any) => cat.id === category);
      if (!categoryExists) {
        return NextResponse.json(
          {
            success: false,
            error: 'INVALID_CATEGORY',
            message: 'The specified category does not exist.'
          },
          { status: 400 }
        );
      }

      // Verificar que el slug no existe en otro proyecto
      if (slug && slug !== currentProject.slug) {
        const existingProject = projects.find((proj: any) => proj.slug === slug && proj.id !== id);
        if (existingProject) {
          return NextResponse.json(
            {
              success: false,
              error: 'SLUG_EXISTS',
              message: 'A project with this slug already exists.'
            },
            { status: 409 }
          );
        }
      }

      // Actualizar proyecto
      const updatedProject = {
        ...currentProject,
        title,
        slug: slug || currentProject.slug,
        description: description !== undefined ? description : currentProject.description,
        category,
        status: status !== undefined ? status : currentProject.status,
        featured: featured !== undefined ? !!featured : currentProject.featured,
        featured_image: featured_image !== undefined ? featured_image : currentProject.featured_image,
        gallery: gallery !== undefined ? (Array.isArray(gallery) ? gallery : []) : currentProject.gallery,
        client: client !== undefined ? client : currentProject.client,
        location: location !== undefined ? location : currentProject.location,
        start_date: start_date !== undefined ? start_date : currentProject.start_date,
        end_date: end_date !== undefined ? end_date : currentProject.end_date,
        investment: investment !== undefined ? investment : currentProject.investment,
        area: area !== undefined ? area : currentProject.area,
        tags: tags !== undefined ? (Array.isArray(tags) ? tags : []) : currentProject.tags,
        order: order !== undefined ? Number(order) : currentProject.order,
        metadata: {
          ...currentProject.metadata,
          ...(metadata || {})
        },
        updated_at: new Date().toISOString(),
        updated_by: context.user.id
      };

      projects[projectIndex] = updatedProject;

      // Actualizar contadores de categorías si cambió la categoría
      if (currentProject.category !== category) {
        // Decrementar contador de categoría anterior
        const oldCategoryIndex = categories.findIndex((cat: any) => cat.id === currentProject.category);
        if (oldCategoryIndex !== -1) {
          categories[oldCategoryIndex].projects_count = Math.max(0, (categories[oldCategoryIndex].projects_count || 1) - 1);
          categories[oldCategoryIndex].updated_at = new Date().toISOString();
          categories[oldCategoryIndex].updated_by = context.user.id;
        }

        // Incrementar contador de nueva categoría
        const newCategoryIndex = categories.findIndex((cat: any) => cat.id === category);
        if (newCategoryIndex !== -1) {
          categories[newCategoryIndex].projects_count = (categories[newCategoryIndex].projects_count || 0) + 1;
          categories[newCategoryIndex].updated_at = new Date().toISOString();
          categories[newCategoryIndex].updated_by = context.user.id;
        }
      }

      // Actualizar archivo
      const updatedData = {
        ...portfolioData,
        projects,
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
        resource: 'portfolio-project',
        resourceId: id,
        message: `Portfolio project '${title}' updated`,
        user: context.user.id,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        metadata: { 
          title, 
          slug: updatedProject.slug, 
          category,
          category_changed: currentProject.category !== category
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Project updated successfully.',
        data: { project: updatedProject }
      });

    } catch (error) {
      await logger.error('portfolio-api', `Failed to update project: ${params.id}`, error, {
        userId: context.user.id
      });

      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to update project.'
        },
        { status: 500 }
      );
    }
  },
  requirePermission('portfolio', 'write')()
);

// DELETE /api/admin/portfolio/projects/[id] - Eliminar proyecto
export const DELETE = withAuth(
  async (request: NextRequest, context, { params }: RouteParams) => {
    try {
      const { id } = params;

      // Leer datos actuales
      const portfolioData = await jsonCrudSystem.readJSON(PORTFOLIO_FILE, true);
      const projects = portfolioData.projects || [];
      const categories = portfolioData.categories || [];

      // Buscar proyecto
      const projectIndex = projects.findIndex((proj: any) => proj.id === id);
      if (projectIndex === -1) {
        return NextResponse.json(
          {
            success: false,
            error: 'PROJECT_NOT_FOUND',
            message: 'Project not found.'
          },
          { status: 404 }
        );
      }

      const project = projects[projectIndex];

      // Eliminar proyecto
      projects.splice(projectIndex, 1);

      // Actualizar contador de la categoría
      const categoryIndex = categories.findIndex((cat: any) => cat.id === project.category);
      if (categoryIndex !== -1) {
        categories[categoryIndex].projects_count = Math.max(0, (categories[categoryIndex].projects_count || 1) - 1);
        categories[categoryIndex].updated_at = new Date().toISOString();
        categories[categoryIndex].updated_by = context.user.id;
      }

      // Actualizar archivo
      const updatedData = {
        ...portfolioData,
        projects,
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
        resource: 'portfolio-project',
        resourceId: id,
        message: `Portfolio project '${project.title}' deleted`,
        user: context.user.id,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        metadata: { 
          title: project.title, 
          slug: project.slug, 
          category: project.category
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Project deleted successfully.'
      });

    } catch (error) {
      await logger.error('portfolio-api', `Failed to delete project: ${params.id}`, error, {
        userId: context.user.id
      });

      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to delete project.'
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