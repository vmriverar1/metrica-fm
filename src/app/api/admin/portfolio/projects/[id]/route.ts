/**
 * API Route: /api/admin/portfolio/projects/[id]
 * CRUD para proyecto específico del portfolio - Usando FirestoreCore
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, requirePermission } from '@/lib/admin/middleware/auth-middleware';
import FirestoreCore from '@/lib/firestore/firestore-core';
import { COLLECTIONS } from '@/lib/firebase/config';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/admin/portfolio/projects/[id] - Obtener proyecto específico
export const GET = withAuth(
  async (request: NextRequest, context) => {
  try {
    // Extraer ID de la URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    console.log(`🔍 [ProjectAPI] Getting project: ${id}`);

    // Buscar proyecto en Firestore usando FirestoreCore
    const projectResult = await FirestoreCore.getDocumentById(COLLECTIONS.PORTFOLIO_PROJECTS, id);

    if (!projectResult.success || !projectResult.data) {
      console.warn(`⚠️ [ProjectAPI] Project not found: ${id}`);
      return NextResponse.json(
        {
          success: false,
          error: 'PROJECT_NOT_FOUND',
          message: 'Project not found.'
        },
        { status: 404 }
      );
    }

    const project = projectResult.data;

    // Enriquecer con información de categoría
    let enrichedProject = project;
    try {
      if (project.category_id || project.category) {
        const categoryId = project.category_id || project.category;
        const categoryResult = await FirestoreCore.getDocumentById(COLLECTIONS.PORTFOLIO_CATEGORIES, categoryId);

        if (categoryResult.success && categoryResult.data) {
          const categoryData = categoryResult.data;
          enrichedProject = {
            ...project,
            category_info: {
              id: categoryData.id,
              name: categoryData.name,
              slug: categoryData.slug,
              color: categoryData.color,
              icon: categoryData.icon
            }
          };
        }
      }
    } catch (error) {
      console.warn('Warning: Could not fetch category info:', error);
    }

    // Proyectos relacionados (misma categoría, excluyendo el actual)
    let relatedProjects = [];
    try {
      if (project.category || project.category_id) {
        const categoryId = project.category_id || project.category;
        const relatedResult = await FirestoreCore.getDocuments(COLLECTIONS.PORTFOLIO_PROJECTS, {
          filters: [{ field: 'category', operator: '==', value: categoryId }],
          limitTo: 6
        });

        if (relatedResult.success && relatedResult.data) {
          relatedProjects = relatedResult.data
            .filter(doc => doc.id !== id)
            .slice(0, 5)
            .map(doc => ({
              id: doc.id,
              title: doc.title,
              slug: doc.slug,
              featured_image: doc.featured_image,
              status: doc.status
            }));
        }
      }
    } catch (error) {
      console.warn('Warning: Could not fetch related projects:', error);
    }

    console.log(`✅ [ProjectAPI] Project retrieved: ${project.title}`);

    return NextResponse.json({
      success: true,
      data: {
        project: enrichedProject,
        related_projects: relatedProjects,
        category: enrichedProject.category_info || null
      }
    });

  } catch (error) {
    console.error(`❌ [ProjectAPI] Failed to get project:`, error);

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
  async (request: NextRequest, context) => {
  try {
    // Extraer ID de la URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    const body = await request.json();

    console.log(`📝 [ProjectAPI] Updating project: ${id}`);
    console.log(`📋 [ProjectAPI] Update data:`, Object.keys(body));
    console.log(`⭐ [ProjectAPI] Featured order value:`, body.featured_order, 'Type:', typeof body.featured_order);

    const {
      title,
      slug,
      description,
      category,
      status,
      featured,
      featured_order,
      featured_image,
      gallery,
      client,
      location,
      start_date,
      end_date,
      hide_dates,
      investment,
      area,
      tags,
      order,
      metadata,
      services,
      budget,
      duration,
      short_description,
      year,
      team,
      full_description,
      technical_details
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

    // Buscar proyecto existente
    const projectResult = await FirestoreCore.getDocumentById(COLLECTIONS.PORTFOLIO_PROJECTS, id);
    if (!projectResult.success || !projectResult.data) {
      return NextResponse.json(
        {
          success: false,
          error: 'PROJECT_NOT_FOUND',
          message: 'Project not found.'
        },
        { status: 404 }
      );
    }

    const currentProject = projectResult.data;

    // Verificar que la nueva categoría existe
    const categoryResult = await FirestoreCore.getDocumentById(COLLECTIONS.PORTFOLIO_CATEGORIES, category);
    if (!categoryResult.success || !categoryResult.data) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_CATEGORY',
          message: 'The specified category does not exist.'
        },
        { status: 400 }
      );
    }

    // Verificar que el slug no existe en otro proyecto (si se está cambiando)
    if (slug && slug !== currentProject.slug) {
      const slugResult = await FirestoreCore.getDocuments(COLLECTIONS.PORTFOLIO_PROJECTS, {
        filters: [{ field: 'slug', operator: '==', value: slug }]
      });

      if (slugResult.success && slugResult.data) {
        const existingProject = slugResult.data.find(doc => doc.id !== id);
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
    }

    // Preparar datos de actualización
    const updateData = {
      title,
      slug: slug || currentProject.slug,
      description: description !== undefined ? description : currentProject.description,
      category,
      category_id: category, // Asegurar compatibilidad
      status: status !== undefined ? status : currentProject.status,
      featured: featured !== undefined ? !!featured : currentProject.featured,
      featured_order: featured_order !== undefined ? Number(featured_order) : currentProject.featured_order,
      featured_image: featured_image !== undefined ? featured_image : currentProject.featured_image,
      gallery: gallery !== undefined ? (Array.isArray(gallery) ? gallery : []) : currentProject.gallery,
      client: client !== undefined ? client : currentProject.client,
      location: location !== undefined ? location : currentProject.location,
      start_date: start_date !== undefined ? start_date : currentProject.start_date,
      end_date: end_date !== undefined ? end_date : currentProject.end_date,
      hide_dates: hide_dates !== undefined ? hide_dates : currentProject.hide_dates,
      investment: investment !== undefined ? investment : currentProject.investment,
      area: area !== undefined ? area : currentProject.area,
      team: team !== undefined ? team : currentProject.team,
      tags: tags !== undefined ? (Array.isArray(tags) ? tags : []) : currentProject.tags,
      order: order !== undefined ? Number(order) : currentProject.order,
      services: services !== undefined ? (Array.isArray(services) ? services : []) : currentProject.services,
      budget: budget !== undefined ? budget : currentProject.budget,
      duration: duration !== undefined ? duration : currentProject.duration,
      short_description: short_description !== undefined ? short_description : currentProject.short_description,
      full_description: full_description !== undefined ? full_description : currentProject.full_description,
      technical_details: technical_details !== undefined ? technical_details : currentProject.technical_details,
      year: year !== undefined ? Number(year) : currentProject.year,
      metadata: {
        ...currentProject.metadata,
        ...(metadata || {})
      }
    };

    // Limpiar valores undefined antes de enviar a Firestore
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    // Log detallado antes de la actualización
    console.log(`📋 [ProjectAPI] About to update with data:`, JSON.stringify(cleanUpdateData, null, 2));

    // Actualizar en Firestore usando FirestoreCore
    const updateResult = await FirestoreCore.updateDocument(COLLECTIONS.PORTFOLIO_PROJECTS, id, cleanUpdateData);

    console.log(`🔍 [ProjectAPI] Update result:`, updateResult);

    if (!updateResult.success) {
      console.error(`❌ [ProjectAPI] Failed to update project in Firestore:`, updateResult.error);
      console.error(`❌ [ProjectAPI] Update data that failed:`, JSON.stringify(cleanUpdateData, null, 2));
      return NextResponse.json(
        {
          success: false,
          error: 'UPDATE_FAILED',
          message: 'Failed to update project in database.',
          details: updateResult.error
        },
        { status: 500 }
      );
    }

    // Actualizar contadores de categorías si cambió la categoría
    if (currentProject.category !== category) {
      console.log(`🔄 [ProjectAPI] Category changed from ${currentProject.category} to ${category}`);

      // Decrementar contador de categoría anterior
      try {
        const oldCategoryResult = await FirestoreCore.getDocumentById(COLLECTIONS.PORTFOLIO_CATEGORIES, currentProject.category);
        if (oldCategoryResult.success && oldCategoryResult.data) {
          const oldCategoryData = oldCategoryResult.data;
          await FirestoreCore.updateDocument(COLLECTIONS.PORTFOLIO_CATEGORIES, currentProject.category, {
            projectCount: Math.max(0, (oldCategoryData.projectCount || 1) - 1)
          });
        }
      } catch (error) {
        console.warn('Warning: Could not update old category counter:', error);
      }

      // Incrementar contador de nueva categoría
      try {
        const newCategoryResult = await FirestoreCore.getDocumentById(COLLECTIONS.PORTFOLIO_CATEGORIES, category);
        if (newCategoryResult.success && newCategoryResult.data) {
          const newCategoryData = newCategoryResult.data;
          await FirestoreCore.updateDocument(COLLECTIONS.PORTFOLIO_CATEGORIES, category, {
            projectCount: (newCategoryData.projectCount || 0) + 1
          });
        }
      } catch (error) {
        console.warn('Warning: Could not update new category counter:', error);
      }
    }

    console.log(`✅ [ProjectAPI] Project '${title}' updated successfully`);

    return NextResponse.json({
      success: true,
      message: 'Project updated successfully.',
      data: {
        project: {
          id,
          ...cleanUpdateData
        }
      }
    });

  } catch (error) {
    console.error(`❌ [ProjectAPI] Failed to update project:`, error);

    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Failed to update project.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
  },
  requirePermission('portfolio', 'write')()
);

// DELETE /api/admin/portfolio/projects/[id] - Eliminar proyecto
export const DELETE = withAuth(
  async (request: NextRequest, context) => {
  try {
    // Extraer ID de la URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    console.log(`🗑️ [ProjectAPI] Deleting project: ${id}`);

    // Buscar proyecto
    const projectResult = await FirestoreCore.getDocumentById(COLLECTIONS.PORTFOLIO_PROJECTS, id);
    if (!projectResult.success || !projectResult.data) {
      return NextResponse.json(
        {
          success: false,
          error: 'PROJECT_NOT_FOUND',
          message: 'Project not found.'
        },
        { status: 404 }
      );
    }

    const project = projectResult.data;

    // Eliminar proyecto
    const deleteResult = await FirestoreCore.deleteDocument(COLLECTIONS.PORTFOLIO_PROJECTS, id);

    if (!deleteResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'DELETE_FAILED',
          message: 'Failed to delete project.'
        },
        { status: 500 }
      );
    }

    // Actualizar contador de la categoría
    try {
      const categoryResult = await FirestoreCore.getDocumentById(COLLECTIONS.PORTFOLIO_CATEGORIES, project.category);
      if (categoryResult.success && categoryResult.data) {
        const categoryData = categoryResult.data;
        await FirestoreCore.updateDocument(COLLECTIONS.PORTFOLIO_CATEGORIES, project.category, {
          projectCount: Math.max(0, (categoryData.projectCount || 1) - 1)
        });
      }
    } catch (error) {
      console.warn('Warning: Could not update category counter:', error);
    }

    console.log(`✅ [ProjectAPI] Project '${project.title}' deleted successfully`);

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully.'
    });

  } catch (error) {
    console.error(`❌ [ProjectAPI] Failed to delete project:`, error);

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