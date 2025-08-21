/**
 * API Route: /api/admin/pages
 * CRUD para páginas estáticas
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, requirePermission } from '@/lib/admin/middleware/auth-middleware';
import { jsonCrudSystem } from '@/lib/admin';
import { logger } from '@/lib/admin/core/logger';

// GET /api/admin/pages - Listar todas las páginas
export const GET = withAuth(
  async (request: NextRequest, context) => {
    try {
      const { searchParams } = new URL(request.url);
      const search = searchParams.get('search');
      const sort = searchParams.get('sort') || 'name';
      const order = searchParams.get('order') || 'asc';

      // Obtener lista de archivos de páginas
      const pageFiles = await jsonCrudSystem.fileManager.listFiles('pages');
      
      const pages = [];
      for (const file of pageFiles) {
        try {
          const pageData = await jsonCrudSystem.readJSON(`pages/${file}`, true);
          const slug = file.replace('.json', '');
          
          // Información básica de la página
          const pageInfo = {
            slug,
            title: pageData.hero?.title || pageData.metadata?.title || slug,
            description: pageData.hero?.subtitle || pageData.metadata?.description || '',
            last_modified: (await jsonCrudSystem.fileManager.getFileMetadata(`pages/${file}`)).lastModified,
            sections_count: Array.isArray(pageData.sections) ? pageData.sections.length : 0,
            status: pageData.metadata?.status || 'active',
            featured_image: pageData.hero?.background_image || null
          };

          // Filtrar por búsqueda si se especifica
          if (search) {
            const searchLower = search.toLowerCase();
            const matchesSearch = 
              pageInfo.title.toLowerCase().includes(searchLower) ||
              pageInfo.description.toLowerCase().includes(searchLower) ||
              slug.toLowerCase().includes(searchLower);
            
            if (!matchesSearch) continue;
          }

          pages.push(pageInfo);
        } catch (error) {
          await logger.warn('pages-api', `Could not load page: ${file}`, { error: error.message });
        }
      }

      // Ordenar resultados
      pages.sort((a, b) => {
        const aValue = a[sort as keyof typeof a] || '';
        const bValue = b[sort as keyof typeof b] || '';
        
        if (order === 'desc') {
          return bValue.toString().localeCompare(aValue.toString());
        }
        return aValue.toString().localeCompare(bValue.toString());
      });

      return NextResponse.json({
        success: true,
        data: {
          pages,
          total: pages.length,
          filters: {
            search,
            sort,
            order
          }
        }
      });

    } catch (error) {
      await logger.error('pages-api', 'Failed to list pages', error, {
        userId: context.user.id
      });

      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to retrieve pages.'
        },
        { status: 500 }
      );
    }
  },
  requirePermission('pages', 'read')()
);

// Método OPTIONS para CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'GET, OPTIONS',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}