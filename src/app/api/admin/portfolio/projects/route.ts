/**
 * API Route: /api/admin/portfolio/projects
 * CRUD para proyectos del portfolio - Conectado a Firestore usando FirestoreCore
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, requirePermission } from '@/lib/admin/middleware/auth-middleware';
import FirestoreCore from '@/lib/firestore/firestore-core';
import { COLLECTIONS } from '@/lib/firebase/config';
import crypto from 'crypto';

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

// Helper function to read portfolio data from Firestore using FirestoreCore
async function readPortfolioData() {
  try {
    console.log('🔍 [Portfolio API] Fetching portfolio data from Firestore...');

    // Obtener proyectos y categorías en paralelo usando FirestoreCore
    const [projectsResult, categoriesResult] = await Promise.all([
      FirestoreCore.getDocuments(COLLECTIONS.PORTFOLIO_PROJECTS),
      FirestoreCore.getDocuments(COLLECTIONS.PORTFOLIO_CATEGORIES)
    ]);

    const projects = projectsResult.success ? projectsResult.data : [];
    const categories = categoriesResult.success ? categoriesResult.data : [];

    console.log(`✅ [Portfolio API] Found ${projects?.length || 0} projects and ${categories?.length || 0} categories in Firestore`);
    console.log('📊 [Portfolio API] Projects sample:', projects?.slice(0, 2).map(p => ({ id: p.id, title: p.title })));

    if (!projectsResult.success) {
      console.error('❌ [Portfolio API] Error fetching projects:', projectsResult.error);
    }
    if (!categoriesResult.success) {
      console.error('❌ [Portfolio API] Error fetching categories:', categoriesResult.error);
    }

    return {
      projects: projects || [],
      categories: categories || [],
      projectsError: !projectsResult.success ? projectsResult.error : null,
      categoriesError: !categoriesResult.success ? categoriesResult.error : null
    };
  } catch (error) {
    console.error('❌ [Portfolio API] Error reading portfolio data from Firestore:', error);
    return {
      projects: [],
      categories: [],
      projectsError: 'Failed to connect to Firestore',
      categoriesError: 'Failed to connect to Firestore'
    };
  }
}

// GET /api/admin/portfolio/projects - Listar proyectos con paginación
export const GET = withAuth(
  async (request: NextRequest, context) => {
    try {
      console.log('🚀 [Portfolio API] Starting GET request for projects...');

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

      console.log('📋 [Portfolio API] Query parameters:', query);

      // Leer datos del portfolio
      const portfolioData = await readPortfolioData();
      let projects = portfolioData.projects || [];
      const categories = portfolioData.categories || [];

      console.log('📊 [Portfolio API] Raw data loaded:', {
        projectsCount: projects.length,
        categoriesCount: categories.length,
        projectsError: portfolioData.projectsError,
        categoriesError: portfolioData.categoriesError
      });

      // Si no hay datos, mostrar información de debug
      if (projects.length === 0) {
        console.warn('⚠️ [Portfolio API] No projects found in Firestore');
        console.warn('💡 [Portfolio API] Collections being queried:', {
          projects: COLLECTIONS.PORTFOLIO_PROJECTS,
          categories: COLLECTIONS.PORTFOLIO_CATEGORIES
        });
      }

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
        console.log(`🔍 [Portfolio API] Filtered by search: ${projects.length} projects match "${query.search}"`);
      }

      // Filtrar por categoría
      if (query.category) {
        projects = projects.filter((project: any) => project.category === query.category);
        console.log(`🏷️ [Portfolio API] Filtered by category: ${projects.length} projects match "${query.category}"`);
      }

      // Filtrar por estado
      if (query.status) {
        projects = projects.filter((project: any) => project.status === query.status);
        console.log(`📊 [Portfolio API] Filtered by status: ${projects.length} projects match "${query.status}"`);
      }

      // Filtrar por featured
      if (query.featured !== undefined) {
        const isFeatured = query.featured === 'true';
        projects = projects.filter((project: any) => !!project.featured === isFeatured);
        console.log(`⭐ [Portfolio API] Filtered by featured: ${projects.length} projects match featured=${isFeatured}`);
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

      console.log('📄 [Portfolio API] Pagination info:', {
        total,
        totalPages,
        currentPage: query.page,
        limit: query.limit,
        offset,
        paginatedCount: paginatedProjects.length
      });

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

      const response = {
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
            color: cat.color,
            projects_count: projects.filter((p: any) => p.category === cat.id).length
          })),
          debug: {
            collectionsUsed: {
              projects: COLLECTIONS.PORTFOLIO_PROJECTS,
              categories: COLLECTIONS.PORTFOLIO_CATEGORIES
            },
            dataLoadErrors: {
              projects: portfolioData.projectsError,
              categories: portfolioData.categoriesError
            },
            rawCounts: {
              projects: portfolioData.projects.length,
              categories: portfolioData.categories.length
            }
          }
        }
      };

      console.log('✅ [Portfolio API] Sending response with', enrichedProjects.length, 'projects');

      return NextResponse.json(response);

    } catch (error) {
      console.error('❌ [Portfolio API] Failed to list projects:', error);

      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to retrieve projects.',
          debug: {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
          }
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
      console.log('🚀 [Portfolio API] Starting POST request to create project...');

      const body = await request.json();
      const {
        title,
        slug,
        description,
        category,
        status = 'draft',
        featured = false,
        featured_order,
        featured_image,
        gallery = [],
        client,
        location,
        start_date,
        end_date,
        hide_dates,
        investment,
        area,
        team,
        duration,
        tags = [],
        order,
        metadata = {},
        short_description,
        full_description,
        technical_details,
        budget,
        services,
        year
      } = body;

      console.log('📋 [Portfolio API] Creating project with data:', { title, category, status });

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

      // Leer datos actuales para validaciones
      const portfolioData = await readPortfolioData();
      const projects = portfolioData.projects || [];
      const categories = portfolioData.categories || [];

      // Verificar que la categoría existe
      const categoryExists = categories.find((cat: any) => cat.id === category);
      if (!categoryExists) {
        console.error('❌ [Portfolio API] Invalid category:', category);
        console.log('📋 [Portfolio API] Available categories:', categories.map(c => ({ id: c.id, name: c.name })));

        return NextResponse.json(
          {
            success: false,
            error: 'INVALID_CATEGORY',
            message: 'The specified category does not exist.',
            debug: {
              requestedCategory: category,
              availableCategories: categories.map(c => ({ id: c.id, name: c.name }))
            }
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

      // Procesar tags: convertir string a array si es necesario
      let processedTags = tags;
      if (typeof tags === 'string') {
        processedTags = tags.split(',').map(tag => tag.trim()).filter(Boolean);
      }

      // Crear nuevo proyecto
      const newProject = {
        title,
        slug: projectSlug,
        description: description || '',
        short_description: short_description || description || '',
        full_description: full_description || '',
        technical_details: technical_details || '',
        category,
        status,
        featured: !!featured,
        featured_order: featured_order !== undefined ? Number(featured_order) : 999,
        featured_image: featured_image || '',
        gallery: Array.isArray(gallery) ? gallery : [],
        client: client || '',
        location: location || '',
        start_date: start_date || null,
        end_date: end_date || null,
        hide_dates: hide_dates !== undefined ? hide_dates : false,
        investment: investment || '',
        budget: budget || '',
        area: area || '',
        team: team || '',
        duration: duration || '',
        services: Array.isArray(services) ? services : [],
        year: year !== undefined ? Number(year) : null,
        tags: Array.isArray(processedTags) ? processedTags : [],
        order: order !== undefined ? Number(order) : projects.length,
        metadata: {
          ...metadata,
          views: 0,
          likes: 0
        },
        created_by: context.user.id,
        updated_by: context.user.id
      };

      // Generar ID único
      const projectId = `proj_${crypto.randomBytes(8).toString('hex')}`;

      console.log('💾 [Portfolio API] Saving project to Firestore with ID:', projectId);

      // Guardar el nuevo proyecto en Firestore usando FirestoreCore
      const createResult = await FirestoreCore.createDocumentWithId(
        COLLECTIONS.PORTFOLIO_PROJECTS,
        projectId,
        newProject
      );

      if (!createResult.success) {
        console.error('❌ [Portfolio API] Failed to create project:', createResult.error);
        return NextResponse.json(
          {
            success: false,
            error: 'FIRESTORE_ERROR',
            message: 'Failed to create project in database.',
            debug: {
              firestoreError: createResult.error,
              collection: COLLECTIONS.PORTFOLIO_PROJECTS
            }
          },
          { status: 500 }
        );
      }

      // Actualizar contador de proyectos en la categoría (opcional)
      try {
        const categoryUpdateResult = await FirestoreCore.updateDocument(
          COLLECTIONS.PORTFOLIO_CATEGORIES,
          category,
          {
            projects_count: categoryExists.projects_count ? categoryExists.projects_count + 1 : 1,
            updated_by: context.user.id
          }
        );

        if (!categoryUpdateResult.success) {
          console.warn('⚠️ [Portfolio API] Could not update category counter:', categoryUpdateResult.error);
        }
      } catch (error) {
        console.warn('⚠️ [Portfolio API] Warning: Could not update category counter:', error);
      }

      // Log de auditoría
      console.log(`✅ [Portfolio API] Project '${title}' created successfully by user ${context.user.id}`);

      return NextResponse.json({
        success: true,
        message: 'Project created successfully.',
        data: {
          project: {
            id: projectId,
            ...newProject
          }
        }
      }, { status: 201 });

    } catch (error) {
      console.error('❌ [Portfolio API] Failed to create project:', error);

      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to create project.',
          debug: {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
          }
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