/**
 * API Route: /api/admin/portfolio/projects/[id]
 * CRUD para proyecto específico del portfolio - Conectado a Firestore
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, requirePermission } from '@/lib/admin/middleware/auth-middleware';
import { readFileSync } from 'fs';
import { join } from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

interface RouteParams {
  params: {
    id: string;
  };
}

// Inicializar Firebase Admin
async function initializeFirebaseAdmin() {
  try {
    if (getApps().length === 0) {
      const serviceAccountPath = join(process.cwd(), 'credencials', 'service-account.json');
      const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

      initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id
      });
    }

    return getFirestore();
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error);
    throw error;
  }
}

// GET /api/admin/portfolio/projects/[id] - Obtener proyecto específico
export const GET = withAuth(
  async (request: NextRequest, context, { params }: RouteParams) => {
    try {
      const { id } = params;
      const db = await initializeFirebaseAdmin();

      // Buscar proyecto en Firestore
      const projectDoc = await db.collection('portfolio_projects').doc(id).get();

      if (!projectDoc.exists) {
        return NextResponse.json(
          {
            success: false,
            error: 'PROJECT_NOT_FOUND',
            message: 'Project not found.'
          },
          { status: 404 }
        );
      }

      const project = {
        id: projectDoc.id,
        ...projectDoc.data(),
        // Convertir Firestore Timestamps a strings
        created_at: projectDoc.data()?.created_at?.toDate?.()?.toISOString() || projectDoc.data()?.created_at,
        updated_at: projectDoc.data()?.updated_at?.toDate?.()?.toISOString() || projectDoc.data()?.updated_at
      };

      // Enriquecer con información de categoría
      let enrichedProject = project;
      try {
        if (project.category_id || project.category) {
          const categoryId = project.category_id || project.category;
          const categoryDoc = await db.collection('portfolio_categories').doc(categoryId).get();

          if (categoryDoc.exists) {
            const categoryData = categoryDoc.data();
            enrichedProject = {
              ...project,
              category_info: {
                id: categoryDoc.id,
                name: categoryData?.name,
                slug: categoryData?.slug,
                color: categoryData?.color,
                icon: categoryData?.icon
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
          const relatedSnapshot = await db.collection('portfolio_projects')
            .where('category', '==', categoryId)
            .limit(6)
            .get();

          relatedProjects = relatedSnapshot.docs
            .filter(doc => doc.id !== id)
            .slice(0, 5)
            .map(doc => ({
              id: doc.id,
              title: doc.data().title,
              slug: doc.data().slug,
              featured_image: doc.data().featured_image,
              status: doc.data().status
            }));
        }
      } catch (error) {
        console.warn('Warning: Could not fetch related projects:', error);
      }

      return NextResponse.json({
        success: true,
        data: {
          project: enrichedProject,
          related_projects: relatedProjects,
          category: enrichedProject.category_info || null
        }
      });

    } catch (error) {
      console.error('portfolio-api', `Failed to get project: ${id}`, error);

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

      // Obtener datos de Firestore
      const db = await initializeFirebaseAdmin();

      // Buscar proyecto
      const projectDoc = await db.collection('portfolio_projects').doc(id).get();
      if (!projectDoc.exists) {
        return NextResponse.json(
          {
            success: false,
            error: 'PROJECT_NOT_FOUND',
            message: 'Project not found.'
          },
          { status: 404 }
        );
      }

      const currentProject = {
        id: projectDoc.id,
        ...projectDoc.data()
      };

      // Verificar que la nueva categoría existe
      const categoryDoc = await db.collection('portfolio_categories').doc(category).get();
      if (!categoryDoc.exists) {
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
        const slugQuery = await db.collection('portfolio_projects')
          .where('slug', '==', slug)
          .get();

        const existingProject = slugQuery.docs.find(doc => doc.id !== id);
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
        updated_at: new Date(),
        updated_by: context.user.id
      };

      // Actualizar en Firestore
      await db.collection('portfolio_projects').doc(id).update(updatedProject);

      // Actualizar contadores de categorías si cambió la categoría
      if (currentProject.category !== category) {
        // Decrementar contador de categoría anterior
        try {
          const oldCategoryRef = db.collection('portfolio_categories').doc(currentProject.category);
          const oldCategoryDoc = await oldCategoryRef.get();
          if (oldCategoryDoc.exists) {
            const oldCategoryData = oldCategoryDoc.data();
            await oldCategoryRef.update({
              projects_count: Math.max(0, (oldCategoryData?.projects_count || 1) - 1),
              updated_at: new Date(),
              updated_by: context.user.id
            });
          }
        } catch (error) {
          console.warn('Warning: Could not update old category counter:', error);
        }

        // Incrementar contador de nueva categoría
        try {
          const newCategoryRef = db.collection('portfolio_categories').doc(category);
          const newCategoryDoc = await newCategoryRef.get();
          if (newCategoryDoc.exists) {
            const newCategoryData = newCategoryDoc.data();
            await newCategoryRef.update({
              projects_count: (newCategoryData?.projects_count || 0) + 1,
              updated_at: new Date(),
              updated_by: context.user.id
            });
          }
        } catch (error) {
          console.warn('Warning: Could not update new category counter:', error);
        }
      }

      // Log de auditoría (simplified)
      console.log(`Portfolio project '${title}' updated by user ${context.user.id}`);

      return NextResponse.json({
        success: true,
        message: 'Project updated successfully.',
        data: { project: updatedProject }
      });

    } catch (error) {
      console.error('portfolio-api', `Failed to update project: ${id}`, error);

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

      // Obtener datos de Firestore
      const db = await initializeFirebaseAdmin();

      // Buscar proyecto
      const projectDoc = await db.collection('portfolio_projects').doc(id).get();
      if (!projectDoc.exists) {
        return NextResponse.json(
          {
            success: false,
            error: 'PROJECT_NOT_FOUND',
            message: 'Project not found.'
          },
          { status: 404 }
        );
      }

      const project = {
        id: projectDoc.id,
        ...projectDoc.data()
      };

      // Eliminar proyecto
      await db.collection('portfolio_projects').doc(id).delete();

      // Actualizar contador de la categoría
      try {
        const categoryRef = db.collection('portfolio_categories').doc(project.category);
        const categoryDoc = await categoryRef.get();
        if (categoryDoc.exists) {
          const categoryData = categoryDoc.data();
          await categoryRef.update({
            projects_count: Math.max(0, (categoryData?.projects_count || 1) - 1),
            updated_at: new Date(),
            updated_by: context.user.id
          });
        }
      } catch (error) {
        console.warn('Warning: Could not update category counter:', error);
      }

      // Log de auditoría (simplified)
      console.log(`Portfolio project '${project.title}' deleted by user ${context.user.id}`);

      return NextResponse.json({
        success: true,
        message: 'Project deleted successfully.'
      });

    } catch (error) {
      console.error('portfolio-api', `Failed to delete project: ${id}`, error);

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