/**
 * API Route: /api/admin/newsletter/authors
 * CRUD para autores del newsletter
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, requirePermission } from '@/lib/admin/middleware/auth-middleware';
import { jsonCrudSystem } from '@/lib/admin';
import { logger } from '@/lib/admin/core/logger';
import crypto from 'crypto';

const NEWSLETTER_FILE = 'dynamic-content/newsletter/content.json';

// GET /api/admin/newsletter/authors - Listar autores
export const GET = withAuth(
  async (request: NextRequest, context) => {
    try {
      const { searchParams } = new URL(request.url);
      const includeStats = searchParams.get('include_stats') === 'true';
      const search = searchParams.get('search');
      const featured = searchParams.get('featured');

      // Leer datos del newsletter
      const newsletterData = await jsonCrudSystem.readJSON(NEWSLETTER_FILE, true);
      let authors = newsletterData.authors || [];
      const articles = newsletterData.articles || [];

      // Filtrar por búsqueda
      if (search) {
        const searchLower = search.toLowerCase();
        authors = authors.filter((author: any) =>
          author.name?.toLowerCase().includes(searchLower) ||
          author.role?.toLowerCase().includes(searchLower) ||
          author.bio?.toLowerCase().includes(searchLower) ||
          author.specializations?.some((spec: string) => spec.toLowerCase().includes(searchLower))
        );
      }

      // Filtrar por featured
      if (featured !== null && featured !== undefined) {
        const isFeatured = featured === 'true';
        authors = authors.filter((author: any) => !!author.featured === isFeatured);
      }

      // Enriquecer con estadísticas si se solicita
      const enrichedAuthors = authors.map((author: any) => {
        const authorArticles = articles.filter((article: any) => article.author_id === author.id);
        const publishedArticles = authorArticles.filter((article: any) => article.published_date);
        
        const baseData = {
          ...author,
          // Actualizar conteo real de artículos
          articles_count: authorArticles.length,
          published_articles_count: publishedArticles.length
        };

        if (includeStats) {
          const totalReadingTime = authorArticles.reduce((sum: number, article: any) => sum + (article.reading_time || 0), 0);
          
          return {
            ...baseData,
            stats: {
              total_reading_time: totalReadingTime,
              average_reading_time: authorArticles.length > 0 ? Math.round(totalReadingTime / authorArticles.length) : 0,
              featured_articles: authorArticles.filter((article: any) => article.featured).length,
              draft_articles: authorArticles.filter((article: any) => !article.published_date).length,
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
          authors: enrichedAuthors,
          summary: {
            total_authors: authors.length,
            featured_authors: authors.filter((author: any) => author.featured).length,
            total_articles: authors.reduce((sum: number, author: any) => sum + (author.articles_count || 0), 0)
          }
        }
      });

    } catch (error) {
      await logger.error('newsletter-api', 'Failed to list authors', error, {
        userId: context.user.id
      });

      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to retrieve authors.'
        },
        { status: 500 }
      );
    }
  },
  requirePermission('newsletter', 'read')()
);

// POST /api/admin/newsletter/authors - Crear autor
export const POST = withAuth(
  async (request: NextRequest, context) => {
    try {
      const body = await request.json();
      const {
        name,
        role,
        bio,
        avatar,
        linkedin,
        email,
        featured = false,
        specializations = []
      } = body;

      // Validar campos requeridos
      if (!name || !role || !bio || !email) {
        return NextResponse.json(
          {
            success: false,
            error: 'INVALID_INPUT',
            message: 'Name, role, bio and email are required.'
          },
          { status: 400 }
        );
      }

      // Leer datos actuales
      const newsletterData = await jsonCrudSystem.readJSON(NEWSLETTER_FILE, true);
      const authors = newsletterData.authors || [];

      // Verificar que el email no existe
      if (authors.some((author: any) => author.email === email)) {
        return NextResponse.json(
          {
            success: false,
            error: 'EMAIL_EXISTS',
            message: 'An author with this email already exists.'
          },
          { status: 409 }
        );
      }

      // Crear nuevo autor
      const newAuthor = {
        id: `author-${crypto.randomBytes(6).toString('hex')}`,
        name,
        role,
        bio,
        avatar: avatar || `https://i.pravatar.cc/400?u=${email}`,
        linkedin: linkedin || '',
        email,
        featured: !!featured,
        articles_count: 0,
        specializations: Array.isArray(specializations) ? specializations : [],
        created_at: new Date().toISOString(),
        created_by: context.user.id,
        updated_at: new Date().toISOString(),
        updated_by: context.user.id
      };

      // Agregar a la lista
      authors.push(newAuthor);

      // Actualizar archivo
      const updatedData = {
        ...newsletterData,
        authors,
        metadata: {
          ...newsletterData.metadata,
          total_authors: authors.length,
          featured_authors: authors.filter((author: any) => author.featured).length,
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
        resource: 'newsletter-author',
        resourceId: newAuthor.id,
        message: `Newsletter author '${name}' created`,
        user: context.user.id,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        metadata: { name, role, email, featured }
      });

      return NextResponse.json({
        success: true,
        message: 'Author created successfully.',
        data: { author: newAuthor }
      }, { status: 201 });

    } catch (error) {
      await logger.error('newsletter-api', 'Failed to create author', error, {
        userId: context.user.id
      });

      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to create author.'
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