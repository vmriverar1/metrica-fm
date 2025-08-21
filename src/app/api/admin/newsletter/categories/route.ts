/**
 * API Route: /api/admin/newsletter/categories
 * CRUD para categorías del newsletter
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, requirePermission } from '@/lib/admin/middleware/auth-middleware';
import { jsonCrudSystem } from '@/lib/admin';
import { logger } from '@/lib/admin/core/logger';
import crypto from 'crypto';

const NEWSLETTER_FILE = 'dynamic-content/newsletter/content.json';

// GET /api/admin/newsletter/categories - Listar categorías
export const GET = withAuth(
  async (request: NextRequest, context) => {
    try {
      const { searchParams } = new URL(request.url);
      const includeStats = searchParams.get('include_stats') === 'true';
      const search = searchParams.get('search');
      const featured = searchParams.get('featured');

      // Leer datos del newsletter
      const newsletterData = await jsonCrudSystem.readJSON(NEWSLETTER_FILE, true);
      let categories = newsletterData.categories || [];
      const articles = newsletterData.articles || [];

      // Filtrar por búsqueda
      if (search) {
        const searchLower = search.toLowerCase();
        categories = categories.filter((category: any) =>
          category.name?.toLowerCase().includes(searchLower) ||
          category.description?.toLowerCase().includes(searchLower)
        );
      }

      // Filtrar por featured
      if (featured !== null && featured !== undefined) {
        const isFeatured = featured === 'true';
        categories = categories.filter((category: any) => !!category.featured === isFeatured);
      }

      // Ordenar por order
      categories.sort((a: any, b: any) => (a.order || 999) - (b.order || 999));

      // Enriquecer con estadísticas si se solicita
      const enrichedCategories = categories.map((category: any) => {
        const categoryArticles = articles.filter((article: any) => article.category === category.id);
        const publishedArticles = categoryArticles.filter((article: any) => article.published_date);
        
        const baseData = {
          ...category,
          // Actualizar conteo real de artículos
          articles_count: categoryArticles.length,
          published_articles_count: publishedArticles.length
        };

        if (includeStats) {
          const totalReadingTime = categoryArticles.reduce((sum: number, article: any) => sum + (article.reading_time || 0), 0);
          
          return {
            ...baseData,
            stats: {
              total_reading_time: totalReadingTime,
              average_reading_time: categoryArticles.length > 0 ? Math.round(totalReadingTime / categoryArticles.length) : 0,
              featured_articles: categoryArticles.filter((article: any) => article.featured).length,
              draft_articles: categoryArticles.filter((article: any) => !article.published_date).length,
              latest_article_date: publishedArticles.length > 0 ? 
                publishedArticles.sort((a: any, b: any) => 
                  new Date(b.published_date).getTime() - new Date(a.published_date).getTime()
                )[0].published_date : null
            },
            recent_articles: publishedArticles
              .sort((a: any, b: any) => new Date(b.published_date).getTime() - new Date(a.published_date).getTime())
              .slice(0, 3)
              .map((article: any) => ({
                id: article.id,
                title: article.title,
                slug: article.slug,
                published_date: article.published_date,
                reading_time: article.reading_time,
                featured: article.featured
              }))
          };
        }

        return baseData;
      });

      return NextResponse.json({
        success: true,
        data: {
          categories: enrichedCategories,
          summary: {
            total_categories: categories.length,
            featured_categories: categories.filter((category: any) => category.featured).length,
            total_articles: categories.reduce((sum: number, category: any) => sum + (category.articles_count || 0), 0)
          }
        }
      });

    } catch (error) {
      await logger.error('newsletter-api', 'Failed to list categories', error, {
        userId: context.user.id
      });

      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to retrieve categories.'
        },
        { status: 500 }
      );
    }
  },
  requirePermission('newsletter', 'read')()
);

// POST /api/admin/newsletter/categories - Crear categoría
export const POST = withAuth(
  async (request: NextRequest, context) => {
    try {
      const body = await request.json();
      const {
        name,
        slug,
        description,
        color = '#6B7280',
        icon = 'FileText',
        featured = false,
        order
      } = body;

      // Validar campos requeridos
      if (!name || !description) {
        return NextResponse.json(
          {
            success: false,
            error: 'INVALID_INPUT',
            message: 'Name and description are required.'
          },
          { status: 400 }
        );
      }

      // Leer datos actuales
      const newsletterData = await jsonCrudSystem.readJSON(NEWSLETTER_FILE, true);
      const categories = newsletterData.categories || [];

      // Generar slug si no se proporciona
      const categorySlug = slug || name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Verificar que el slug no existe
      if (categories.some((category: any) => category.slug === categorySlug)) {
        return NextResponse.json(
          {
            success: false,
            error: 'SLUG_EXISTS',
            message: 'A category with this slug already exists.'
          },
          { status: 409 }
        );
      }

      // Determinar order si no se proporciona
      const categoryOrder = order !== undefined ? order : (Math.max(...categories.map((c: any) => c.order || 0), 0) + 1);

      // Crear nueva categoría
      const newCategory = {
        id: `cat-${crypto.randomBytes(6).toString('hex')}`,
        name,
        slug: categorySlug,
        description,
        color,
        icon,
        articles_count: 0,
        featured: !!featured,
        order: categoryOrder,
        created_at: new Date().toISOString(),
        created_by: context.user.id,
        updated_at: new Date().toISOString(),
        updated_by: context.user.id
      };

      // Agregar a la lista
      categories.push(newCategory);

      // Actualizar archivo
      const updatedData = {
        ...newsletterData,
        categories,
        metadata: {
          ...newsletterData.metadata,
          total_categories: categories.length,
          featured_categories: categories.filter((category: any) => category.featured).length,
          last_updated: new Date().toISOString()
        }
      };

      await jsonCrudSystem.writeJSON(NEWSLETTER_FILE, updatedData, {
        validate: true,
        backup: true
      });

      // Log de auditoría
      await logger.audit({
        action: 'create',
        resource: 'newsletter-category',
        resourceId: newCategory.id,
        message: `Newsletter category '${name}' created`,
        user: context.user.id,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        metadata: { name, slug: categorySlug, featured }
      });

      return NextResponse.json({
        success: true,
        message: 'Category created successfully.',
        data: { category: newCategory }
      }, { status: 201 });

    } catch (error) {
      await logger.error('newsletter-api', 'Failed to create category', error, {
        userId: context.user.id
      });

      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to create category.'
        },
        { status: 500 }
      );
    }
  },
  requirePermission('newsletter', 'write')()
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