/**
 * API Route: /api/admin/portfolio/projects
 * CRUD para proyectos del portfolio
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, requirePermission } from '@/lib/admin/middleware/auth-middleware';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const PORTFOLIO_FILE_PATH = path.join(process.cwd(), 'public/json/dynamic-content/portfolio/content.json');

// Interface para query parameters
interface ProjectQuery {
  page?: number;
  limit?: number;
  sort?: 'title' | 'created_at' | 'updated_at' | 'order' | 'status';
  order?: 'asc' | 'desc';
  search?: string;
  category?: string;
  status?: 'active' | 'inactive' | 'draft';
  featured?: 'true' | 'false';
}

// Helper function to read portfolio data
async function readPortfolioData() {
  try {
    const fileContent = await fs.readFile(PORTFOLIO_FILE_PATH, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading portfolio file:', error);
    return { projects: [], categories: [] };
  }
}

// GET /api/admin/portfolio/projects - Listar proyectos con paginación
export const GET = withAuth(
  async (request: NextRequest, context) => {
    try {
      const { searchParams } = new URL(request.url);
      
      const query: ProjectQuery = {
        page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
        limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
        sort: (searchParams.get('sort') as any) || 'created_at',
        order: (searchParams.get('order') as any) || 'desc',
        search: searchParams.get('search') || undefined,
        category: searchParams.get('category') || undefined,
        status: (searchParams.get('status') as any) || undefined,
        featured: searchParams.get('featured') || undefined
      };

      // Leer datos del portfolio
      const portfolioData = await readPortfolioData();
      let projects = portfolioData.projects || [];
      const categories = portfolioData.categories || [];

      // Filtrar por búsqueda
      if (query.search) {
        const searchLower = query.search.toLowerCase();
        projects = projects.filter((project: any) =>
          project.title?.toLowerCase().includes(searchLower) ||
          project.description?.toLowerCase().includes(searchLower) ||
          project.location?.toLowerCase().includes(searchLower) ||
          project.client?.toLowerCase().includes(searchLower) ||
          project.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower))
        );
      }

      // Filtrar por categoría
      if (query.category) {
        projects = projects.filter((project: any) => project.category === query.category);
      }

      // Filtrar por estado
      if (query.status) {
        projects = projects.filter((project: any) => project.status === query.status);
      }

      // Filtrar por featured
      if (query.featured !== undefined) {
        const isFeatured = query.featured === 'true';
        projects = projects.filter((project: any) => !!project.featured === isFeatured);
      }

      // Ordenar
      projects.sort((a: any, b: any) => {
        let aValue = a[query.sort!];
        let bValue = b[query.sort!];
        
        // Manejar fechas
        if (query.sort === 'created_at' || query.sort === 'updated_at') {
          aValue = new Date(aValue || 0).getTime();
          bValue = new Date(bValue || 0).getTime();
        }
        
        // Manejar números
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return query.order === 'desc' ? bValue - aValue : aValue - bValue;
        }
        
        // Manejar strings
        const comparison = String(aValue || '').localeCompare(String(bValue || ''));
        return query.order === 'desc' ? -comparison : comparison;
      });

      // Paginación
      const total = projects.length;
      const totalPages = Math.ceil(total / query.limit!);
      const offset = (query.page! - 1) * query.limit!;
      const paginatedProjects = projects.slice(offset, offset + query.limit!);

      // Enriquecer con información de categoría
      const enrichedProjects = paginatedProjects.map((project: any) => {
        const category = categories.find((cat: any) => cat.id === project.category);
        return {
          ...project,
          category_info: category ? {
            id: category.id,
            name: category.name,
            slug: category.slug,
            color: category.color
          } : null
        };
      });

      return NextResponse.json({
        success: true,
        data: {
          projects: enrichedProjects,
          pagination: {
            page: query.page,
            limit: query.limit,
            total,
            totalPages,
            hasNextPage: query.page! < totalPages,
            hasPrevPage: query.page! > 1
          },
          filters: {
            search: query.search,
            category: query.category,
            status: query.status,
            featured: query.featured,
            sort: query.sort,
            order: query.order
          },
          categories: categories.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            projects_count: projects.filter((p: any) => p.category === cat.id).length
          }))
        }
      });

    } catch (error) {
      console.error('portfolio-api', 'Failed to list projects', error);

      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to retrieve projects.'
        },
        { status: 500 }
      );
    }
  },
  requirePermission('portfolio', 'read')()
);

// POST /api/admin/portfolio/projects - Crear proyecto
export const POST = withAuth(
  async (request: NextRequest, context) => {
    try {
      const body = await request.json();
      const {
        title,
        slug,
        description,
        category,
        status = 'draft',
        featured = false,
        featured_image,
        gallery = [],
        client,
        location,
        start_date,
        end_date,
        investment,
        area,
        tags = [],
        order,
        metadata = {}
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
      const portfolioData = await readPortfolioData();
      const projects = portfolioData.projects || [];
      const categories = portfolioData.categories || [];

      // Verificar que la categoría existe
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

      // Generar slug si no se proporciona
      const projectSlug = slug || title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Verificar que el slug no existe
      if (projects.some((proj: any) => proj.slug === projectSlug)) {
        return NextResponse.json(
          {
            success: false,
            error: 'SLUG_EXISTS',
            message: 'A project with this slug already exists.'
          },
          { status: 409 }
        );
      }

      // Crear nuevo proyecto
      const newProject = {
        id: `proj_${crypto.randomBytes(8).toString('hex')}`,
        title,
        slug: projectSlug,
        description: description || '',
        category,
        status,
        featured: !!featured,
        featured_image: featured_image || '',
        gallery: Array.isArray(gallery) ? gallery : [],
        client: client || '',
        location: location || '',
        start_date: start_date || null,
        end_date: end_date || null,
        investment: investment || '',
        area: area || '',
        tags: Array.isArray(tags) ? tags : [],
        order: order !== undefined ? Number(order) : projects.length,
        metadata: {
          ...metadata,
          views: 0,
          likes: 0
        },
        created_at: new Date().toISOString(),
        created_by: context.user.id,
        updated_at: new Date().toISOString(),
        updated_by: context.user.id
      };

      // Agregar a la lista
      projects.push(newProject);

      // Actualizar contador de proyectos en la categoría
      const categoryIndex = categories.findIndex((cat: any) => cat.id === category);
      if (categoryIndex !== -1) {
        categories[categoryIndex].projects_count = (categories[categoryIndex].projects_count || 0) + 1;
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

      await fs.writeFile(PORTFOLIO_FILE_PATH, JSON.stringify(updatedData, null, 2), 'utf-8');

      // Log de auditoría (simplified)
      console.log(`Portfolio project '${title}' created by user ${context.user.id}`);

      return NextResponse.json({
        success: true,
        message: 'Project created successfully.',
        data: { project: newProject }
      }, { status: 201 });

    } catch (error) {
      console.error('portfolio-api', 'Failed to create project', error);

      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to create project.'
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