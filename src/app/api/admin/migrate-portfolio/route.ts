/**
 * API Route: /api/admin/migrate-portfolio
 * Endpoint para migrar datos del portfolio desde JSON a Firestore
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, requirePermission } from '@/lib/admin/middleware/auth-middleware';
import { PortfolioMigration } from '@/lib/migration/portfolio-migration';
import { logger } from '@/lib/admin/core/logger';

// POST /api/admin/migrate-portfolio - Ejecutar migración
export const POST = withAuth(
  async (request: NextRequest, context) => {
    try {
      const body = await request.json();
      const { source, action } = body;

      // Validar parámetros
      if (!source) {
        return NextResponse.json(
          {
            success: false,
            error: 'INVALID_INPUT',
            message: 'Source file path is required.'
          },
          { status: 400 }
        );
      }

      const validActions = ['migrate', 'validate', 'incremental'];
      if (action && !validActions.includes(action)) {
        return NextResponse.json(
          {
            success: false,
            error: 'INVALID_ACTION',
            message: `Action must be one of: ${validActions.join(', ')}`
          },
          { status: 400 }
        );
      }

      const migrationAction = action || 'migrate';

      await logger.info('portfolio-migration', `Starting portfolio migration`, {
        userId: context.user.id,
        action: migrationAction,
        source
      });

      let result;

      switch (migrationAction) {
        case 'validate':
          // Solo validar estructura JSON
          try {
            if (typeof window !== 'undefined') {
              // En cliente
              const response = await fetch(source);
              const jsonData = await response.json();
              const isValid = PortfolioMigration.validateJSONStructure(jsonData);

              result = {
                success: isValid,
                message: isValid ? 'JSON structure is valid' : 'JSON structure is invalid',
                categoriesFound: jsonData.categories?.length || 0,
                projectsFound: jsonData.categories?.reduce((total: number, cat: any) =>
                  total + (cat.projects?.length || 0), 0) || 0
              };
            } else {
              // En servidor
              const fs = await import('fs/promises');
              const path = await import('path');

              const fullPath = path.resolve(process.cwd(), source);
              const fileContent = await fs.readFile(fullPath, 'utf-8');
              const jsonData = JSON.parse(fileContent);

              const isValid = PortfolioMigration.validateJSONStructure(jsonData);

              result = {
                success: isValid,
                message: isValid ? 'JSON structure is valid' : 'JSON structure is invalid',
                categoriesFound: jsonData.categories?.length || 0,
                projectsFound: jsonData.categories?.reduce((total: number, cat: any) =>
                  total + (cat.projects?.length || 0), 0) || 0
              };
            }
          } catch (error) {
            result = {
              success: false,
              error: 'VALIDATION_ERROR',
              message: `Failed to validate JSON: ${error}`
            };
          }
          break;

        case 'incremental':
          result = await PortfolioMigration.migrateIncremental(source);
          break;

        case 'migrate':
        default:
          result = await PortfolioMigration.migrateFromJSON(source);
          break;
      }

      // Log del resultado
      await logger.info('portfolio-migration',
        `Portfolio migration ${result.success ? 'completed' : 'failed'}`,
        {
          userId: context.user.id,
          action: migrationAction,
          source,
          result: {
            success: result.success,
            categoriesMigrated: result.categoriesMigrated || 0,
            projectsMigrated: result.projectsMigrated || 0,
            imagesMigrated: result.imagesMigrated || 0,
            errorsCount: result.errors?.length || 0,
            executionTime: result.executionTime || 0
          }
        }
      );

      if (result.success) {
        return NextResponse.json({
          success: true,
          message: 'Portfolio migration completed successfully',
          data: {
            ...result,
            action: migrationAction
          }
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            error: 'MIGRATION_FAILED',
            message: 'Portfolio migration failed',
            data: {
              ...result,
              action: migrationAction
            }
          },
          { status: 500 }
        );
      }

    } catch (error) {
      await logger.error('portfolio-migration', 'Portfolio migration failed with error', error, {
        userId: context.user.id
      });

      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred during migration.'
        },
        { status: 500 }
      );
    }
  },
  requirePermission('portfolio', 'write')()
);

// GET /api/admin/migrate-portfolio - Obtener estado de migración
export const GET = withAuth(
  async (request: NextRequest, context) => {
    try {
      // TODO: Implementar estado de migración
      // Por ahora retornar información básica

      const { searchParams } = new URL(request.url);
      const action = searchParams.get('action');

      if (action === 'status') {
        // Verificar si hay datos migrados en Firestore
        try {
          const { PortfolioCategoriesService, PortfolioStatsService } =
            await import('@/lib/firestore/portfolio-service');

          const [categories, stats] = await Promise.all([
            PortfolioCategoriesService.obtenerTodas(),
            PortfolioStatsService.obtenerEstadisticas()
          ]);

          return NextResponse.json({
            success: true,
            data: {
              migrationExists: categories.length > 0,
              stats,
              lastCheck: new Date().toISOString()
            }
          });

        } catch (error) {
          // Si falla, probablemente no hay datos migrados
          return NextResponse.json({
            success: true,
            data: {
              migrationExists: false,
              stats: null,
              lastCheck: new Date().toISOString(),
              error: `Firestore check failed: ${error}`
            }
          });
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          availableActions: ['migrate', 'validate', 'incremental'],
          supportedSources: [
            'public/json/dynamic-content/portfolio/content.json',
            'public/json/dynamic-content/portfolio/content-fixed.json'
          ],
          description: 'Portfolio migration API - Migrates JSON data to Firestore'
        }
      });

    } catch (error) {
      await logger.error('portfolio-migration', 'Failed to get migration status', error, {
        userId: context.user.id
      });

      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to retrieve migration status.'
        },
        { status: 500 }
      );
    }
  },
  requirePermission('portfolio', 'read')()
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