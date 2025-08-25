/**
 * API Route: /api/admin/pages/[slug]
 * CRUD para página específica
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, requirePermission } from '@/lib/admin/middleware/auth-middleware';
import fs from 'fs/promises';
import path from 'path';

interface RouteParams {
  params: {
    slug: string;
  };
}

// GET /api/admin/pages/[slug] - Obtener página específica
export const GET = withAuth(
  async (request: NextRequest, context, { params }: RouteParams) => {
    try {
      const { slug } = params;
      const filePath = path.join(process.cwd(), `public/json/pages/${slug}.json`);

      // Verificar que el archivo existe
      try {
        await fs.access(filePath);
      } catch {
        return NextResponse.json(
          {
            success: false,
            error: 'PAGE_NOT_FOUND',
            message: `Page '${slug}' not found.`
          },
          { status: 404 }
        );
      }

      // Leer datos de la página
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const pageData = JSON.parse(fileContent);
      const stats = await fs.stat(filePath);

      return NextResponse.json({
        success: true,
        data: {
          slug,
          content: pageData,
          metadata: {
            size: stats.size,
            last_modified: stats.mtime.toISOString(),
            created: stats.birthtime.toISOString()
          }
        }
      });

    } catch (error) {
      console.error('pages-api', `Failed to get page: ${(await params).slug}`, error);

      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to retrieve page.'
        },
        { status: 500 }
      );
    }
  },
  requirePermission('pages', 'read')()
);

// PUT /api/admin/pages/[slug] - Actualizar página
export const PUT = withAuth(
  async (request: NextRequest, context) => {
    try {
      const url = new URL(request.url);
      const slug = url.pathname.split('/').pop()?.replace('.json', '');
      if (!slug) {
        return NextResponse.json(
          { success: false, error: 'INVALID_SLUG', message: 'Invalid slug provided.' },
          { status: 400 }
        );
      }

      const filePath = path.join(process.cwd(), `public/json/pages/${slug}.json`);
      
      // Verificar que el archivo existe
      try {
        await fs.access(filePath);
      } catch {
        return NextResponse.json(
          {
            success: false,
            error: 'PAGE_NOT_FOUND',
            message: `Page '${slug}' not found.`
          },
          { status: 404 }
        );
      }

      const body = await request.json();
      const { content } = body;

      if (!content) {
        return NextResponse.json(
          {
            success: false,
            error: 'INVALID_INPUT',
            message: 'Page content is required.'
          },
          { status: 400 }
        );
      }

      // Agregar metadatos de auditoría
      const updatedContent = {
        ...content,
        metadata: {
          ...content.metadata,
          updated_at: new Date().toISOString(),
          updated_by: context.user.id,
          version: (content.metadata?.version || 0) + 1
        }
      };

      // Escribir archivo
      await fs.writeFile(filePath, JSON.stringify(updatedContent, null, 2), 'utf-8');

      // Obtener metadata actualizada
      const newStats = await fs.stat(filePath);

      // Log de auditoría (simplified)
      console.log(`Page '${slug}' updated by user ${context.user.id}`);

      return NextResponse.json({
        success: true,
        message: `Page '${slug}' updated successfully.`,
        data: {
          slug,
          metadata: {
            size: newStats.size,
            last_modified: newStats.mtime.toISOString(),
            version: updatedContent.metadata?.version || 1
          }
        }
      });

    } catch (error) {
      const url = new URL(request.url);
      const slug = url.pathname.split('/').pop()?.replace('.json', '') || 'unknown';
      console.error('pages-api', `Failed to update page: ${slug}`, error);

      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to update page.'
        },
        { status: 500 }
      );
    }
  },
  requirePermission('pages', 'write')()
);

// Método OPTIONS para CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}