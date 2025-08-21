/**
 * API Route: /api/admin/media
 * Gestión de archivos multimedia
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, requirePermission } from '@/lib/admin/middleware/auth-middleware';
import { mediaManager } from '@/lib/admin/media/media-manager';
import { logger } from '@/lib/admin/core/logger';

// GET /api/admin/media - Listar archivos multimedia
export const GET = withAuth(
  async (request: NextRequest, context) => {
    try {
      const { searchParams } = new URL(request.url);
      
      const query = {
        type: searchParams.get('type') as any,
        search: searchParams.get('search'),
        tags: searchParams.get('tags')?.split(',').filter(Boolean),
        uploaded_by: searchParams.get('uploaded_by'),
        date_from: searchParams.get('date_from'),
        date_to: searchParams.get('date_to'),
        limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
        offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
        sort: searchParams.get('sort') as any || 'date',
        order: searchParams.get('order') as any || 'desc'
      };

      const result = await mediaManager.searchFiles(query);
      const stats = await mediaManager.getStats();
      const availableTags = mediaManager.getAllTags();

      return NextResponse.json({
        success: true,
        data: {
          files: result.files,
          pagination: result.pagination,
          total: result.total,
          stats,
          available_tags: availableTags,
          query
        }
      });

    } catch (error) {
      await logger.error('media-api', 'Failed to list media files', error, {
        userId: context.user.id
      });

      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to retrieve media files.'
        },
        { status: 500 }
      );
    }
  },
  requirePermission('media', 'read')()
);

// POST /api/admin/media - Subir archivo
export const POST = withAuth(
  async (request: NextRequest, context) => {
    try {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        return NextResponse.json(
          {
            success: false,
            error: 'NO_FILE',
            message: 'No file provided.'
          },
          { status: 400 }
        );
      }

      // Opciones de upload
      const options = {
        alt_text: formData.get('alt_text') as string || '',
        title: formData.get('title') as string || file.name,
        description: formData.get('description') as string || '',
        tags: (formData.get('tags') as string || '').split(',').filter(Boolean),
        prefix: formData.get('prefix') as string || undefined,
        generateThumbnail: formData.get('generate_thumbnail') !== 'false',
        optimizeImage: formData.get('optimize_image') !== 'false'
      };

      // Convertir archivo a buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Subir archivo
      const mediaFile = await mediaManager.uploadFile(
        buffer,
        file.name,
        file.type,
        context.user.id,
        options
      );

      return NextResponse.json({
        success: true,
        message: 'File uploaded successfully.',
        data: { file: mediaFile }
      }, { status: 201 });

    } catch (error) {
      await logger.error('media-api', 'Failed to upload file', error, {
        userId: context.user.id
      });

      // Errores específicos
      if (error.message.includes('File size') || error.message.includes('File type')) {
        return NextResponse.json(
          {
            success: false,
            error: 'VALIDATION_ERROR',
            message: error.message
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to upload file.'
        },
        { status: 500 }
      );
    }
  },
  requirePermission('media', 'write')()
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