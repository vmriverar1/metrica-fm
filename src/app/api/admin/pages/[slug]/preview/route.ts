/**
 * API Route: POST /api/admin/pages/[slug]/preview
 * Preview de página sin guardar cambios
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, requirePermission } from '@/lib/admin/middleware/auth-middleware';
import { validator } from '@/lib/admin/core/validator';
import { logger } from '@/lib/admin/core/logger';

interface RouteParams {
  params: {
    slug: string;
  };
}

// POST /api/admin/pages/[slug]/preview - Preview de página
export const POST = withAuth(
  async (request: NextRequest, context, { params }: RouteParams) => {
    try {
      const { slug } = params;
      const body = await request.json();
      const { content } = body;

      if (!content) {
        return NextResponse.json(
          {
            success: false,
            error: 'INVALID_INPUT',
            message: 'Page content is required for preview.'
          },
          { status: 400 }
        );
      }

      // Validar contenido sin guardarlo
      const validationResult = await validator.validate(content, 'static-page', {
        migrationMode: true,
        autoFix: true,
        generateSuggestions: true
      });

      // Generar información de preview
      const previewData = {
        slug,
        title: content.hero?.title || content.metadata?.title || slug,
        description: content.hero?.subtitle || content.metadata?.description || '',
        sections_count: Array.isArray(content.sections) ? content.sections.length : 0,
        hero: content.hero || null,
        sections: content.sections || [],
        metadata: content.metadata || {}
      };

      // Agregar estadísticas del contenido
      const stats = {
        total_sections: previewData.sections_count,
        has_hero: !!previewData.hero,
        has_metadata: Object.keys(previewData.metadata).length > 0,
        validation: {
          valid: validationResult.valid,
          errors_count: validationResult.errors.length,
          warnings_count: validationResult.warnings.length,
          fixes_applied: validationResult.fixes.length,
          compatibility_level: validationResult.stats.compatibilityLevel
        }
      };

      // Log de preview (solo para debugging en desarrollo)
      if (process.env.NODE_ENV === 'development') {
        await logger.debug('pages-api', `Page preview generated: ${slug}`, {
          userId: context.user.id,
          stats
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          preview: previewData,
          stats,
          validation: {
            valid: validationResult.valid,
            errors: validationResult.errors.slice(0, 5), // Primeros 5 errores
            warnings: validationResult.warnings.slice(0, 5), // Primeras 5 advertencias
            suggestions: validationResult.suggestions.slice(0, 10), // Primeras 10 sugerencias
            fixes_applied: validationResult.fixes.map(fix => ({
              path: fix.path,
              type: fix.type,
              description: fix.description
            }))
          }
        }
      });

    } catch (error) {
      await logger.error('pages-api', `Failed to generate preview: ${params.slug}`, error, {
        userId: context.user.id
      });

      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to generate page preview.'
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
      'Allow': 'POST, OPTIONS',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}