/**
 * API Route: /api/admin/newsletter/articles
 * CRUD para artículos del newsletter
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, requirePermission } from '@/lib/admin/middleware/auth-middleware';
import { jsonCrudSystem } from '@/lib/admin';
import { logger } from '@/lib/admin/core/logger';
import crypto from 'crypto';

const NEWSLETTER_FILE = 'dynamic-content/newsletter/content.json';

// Interface para query parameters
interface ArticleQuery {
  page?: number;
  limit?: number;
  sort?: 'title' | 'published_date' | 'reading_time' | 'featured';
  order?: 'asc' | 'desc';
  search?: string;
  category?: string;
  author_id?: string;
  featured?: 'true' | 'false';
  published?: 'true' | 'false';
  tags?: string;
}

// GET /api/admin/newsletter/articles - Listar artículos con paginación
export const GET = withAuth(
  async (request: NextRequest, context) => {
    try {
      const { searchParams } = new URL(request.url);
      
      const query: ArticleQuery = {
        page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
        limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
        sort: (searchParams.get('sort') as any) || 'published_date',
        order: (searchParams.get('order') as any) || 'desc',
        search: searchParams.get('search') || undefined,
        category: searchParams.get('category') || undefined,
        author_id: searchParams.get('author_id') || undefined,
        featured: searchParams.get('featured') || undefined,
        published: searchParams.get('published') || undefined,
        tags: searchParams.get('tags') || undefined
      };

      // Leer datos del newsletter
      const newsletterData = await jsonCrudSystem.readJSON(NEWSLETTER_FILE, true);
      let articles = newsletterData.articles || [];
      const authors = newsletterData.authors || [];
      const categories = newsletterData.categories || [];

      // Filtrar por búsqueda
      if (query.search) {
        const searchLower = query.search.toLowerCase();
        articles = articles.filter((article: any) =>
          article.title?.toLowerCase().includes(searchLower) ||
          article.excerpt?.toLowerCase().includes(searchLower) ||
          article.content?.toLowerCase().includes(searchLower) ||
          article.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower))
        );
      }

      // Filtrar por categoría
      if (query.category) {
        articles = articles.filter((article: any) => article.category === query.category);
      }

      // Filtrar por autor
      if (query.author_id) {
        articles = articles.filter((article: any) => article.author_id === query.author_id);
      }

      // Filtrar por featured
      if (query.featured !== undefined) {
        const isFeatured = query.featured === 'true';
        articles = articles.filter((article: any) => !!article.featured === isFeatured);
      }

      // Filtrar por publicado (artículos con fecha de publicación)
      if (query.published !== undefined) {
        const isPublished = query.published === 'true';
        articles = articles.filter((article: any) => 
          isPublished ? !!article.published_date : !article.published_date
        );
      }

      // Filtrar por tags
      if (query.tags) {
        const requestedTags = query.tags.split(',').map(tag => tag.trim().toLowerCase());
        articles = articles.filter((article: any) => 
          article.tags?.some((tag: string) => 
            requestedTags.includes(tag.toLowerCase())
          )
        );
      }

      // Ordenar
      articles.sort((a: any, b: any) => {
        let aValue = a[query.sort!];
        let bValue = b[query.sort!];
        
        // Manejar fechas
        if (query.sort === 'published_date') {
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
      const total = articles.length;
      const totalPages = Math.ceil(total / query.limit!);
      const offset = (query.page! - 1) * query.limit!;
      const paginatedArticles = articles.slice(offset, offset + query.limit!);

      // Enriquecer con información de autor y categoría
      const enrichedArticles = paginatedArticles.map((article: any) => {
        const author = authors.find((author: any) => author.id === article.author_id);
        const category = categories.find((cat: any) => cat.id === article.category);
        
        return {
          ...article,
          author_info: author ? {
            id: author.id,
            name: author.name,
            role: author.role,
            avatar: author.avatar,
            bio: author.bio
          } : null,
          category_info: category ? {
            id: category.id,
            name: category.name,
            slug: category.slug,
            color: category.color,
            icon: category.icon
          } : null,
          // Calcular días desde publicación
          days_since_published: article.published_date ? 
            Math.floor((new Date().getTime() - new Date(article.published_date).getTime()) / (1000 * 60 * 60 * 24)) : null,
          // Status derivado
          status: article.published_date ? 'published' : 'draft'
        };
      });

      // Estadísticas adicionales
      const stats = {
        total_articles: total,
        published_articles: articles.filter((a: any) => a.published_date).length,
        draft_articles: articles.filter((a: any) => !a.published_date).length,
        featured_articles: articles.filter((a: any) => a.featured).length,
        by_category: categories.map((cat: any) => ({
          category: cat.name,
          count: articles.filter((a: any) => a.category === cat.id).length
        })),
        by_author: authors.map((author: any) => ({
          author: author.name,
          count: articles.filter((a: any) => a.author_id === author.id).length
        })),
        total_reading_time: articles.reduce((sum: number, a: any) => sum + (a.reading_time || 0), 0),
        average_reading_time: Math.round(
          articles.reduce((sum: number, a: any) => sum + (a.reading_time || 0), 0) / (articles.length || 1)
        )
      };

      return NextResponse.json({
        success: true,
        data: {
          articles: enrichedArticles,
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
            author_id: query.author_id,
            featured: query.featured,
            published: query.published,
            tags: query.tags,
            sort: query.sort,
            order: query.order
          },
          authors: authors.map((author: any) => ({
            id: author.id,
            name: author.name,
            role: author.role,
            articles_count: articles.filter((a: any) => a.author_id === author.id).length
          })),
          categories: categories.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            articles_count: articles.filter((a: any) => a.category === cat.id).length
          })),
          stats
        }
      });

    } catch (error) {
      await logger.error('newsletter-api', 'Failed to list articles', error, {
        userId: context.user.id
      });

      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to retrieve articles.'
        },
        { status: 500 }
      );
    }
  },
  requirePermission('newsletter', 'read')()
);

// POST /api/admin/newsletter/articles - Crear artículo
export const POST = withAuth(
  async (request: NextRequest, context) => {
    try {
      const body = await request.json();
      const {
        title,
        slug,
        category,
        author_id,
        featured_image,
        featured_image_alt,
        excerpt,
        content,
        published_date,
        reading_time,
        featured = false,
        tags = [],
        seo_description,
        social_image,
        related_articles = [],
        gallery = []
      } = body;

      // Validar campos requeridos
      if (!title || !category || !author_id || !excerpt || !content) {
        return NextResponse.json(
          {
            success: false,
            error: 'INVALID_INPUT',
            message: 'Title, category, author_id, excerpt and content are required.'
          },
          { status: 400 }
        );
      }

      // Leer datos actuales
      const newsletterData = await jsonCrudSystem.readJSON(NEWSLETTER_FILE, true);
      const articles = newsletterData.articles || [];
      const authors = newsletterData.authors || [];
      const categories = newsletterData.categories || [];

      // Verificar que el autor existe
      const authorExists = authors.find((author: any) => author.id === author_id);
      if (!authorExists) {
        return NextResponse.json(
          {
            success: false,
            error: 'INVALID_AUTHOR',
            message: 'The specified author does not exist.'
          },
          { status: 400 }
        );
      }

      // Verificar que la categoría existe
      const categoryExists = categories.find((cat: any) => cat.id === category);
      if (!categoryExists) {
        return NextResponse.json(
          {
            success: false,
            error: 'INVALID_CATEGORY',
            message: 'The specified category does not exist.'
          },
          { status: 400 }
        );
      }

      // Generar slug si no se proporciona
      const articleSlug = slug || title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Verificar que el slug no existe
      if (articles.some((article: any) => article.slug === articleSlug)) {
        return NextResponse.json(
          {
            success: false,
            error: 'SLUG_EXISTS',
            message: 'An article with this slug already exists.'
          },
          { status: 409 }
        );
      }

      // Calcular tiempo de lectura si no se proporciona
      const calculatedReadingTime = reading_time || Math.ceil((content.length / 1000) * 4); // ~250 words per minute

      // Crear nuevo artículo
      const newArticle = {
        id: `article-${crypto.randomBytes(6).toString('hex')}`,
        title,
        slug: articleSlug,
        category,
        author_id,
        featured_image: featured_image || '',
        featured_image_alt: featured_image_alt || '',
        excerpt,
        content,
        published_date: published_date || null,
        reading_time: calculatedReadingTime,
        featured: !!featured,
        tags: Array.isArray(tags) ? tags : [],
        seo_description: seo_description || excerpt,
        social_image: social_image || featured_image || '',
        url: `/blog/${articleSlug}`,
        related_articles: Array.isArray(related_articles) ? related_articles : [],
        gallery: Array.isArray(gallery) ? gallery : [],
        created_at: new Date().toISOString(),
        created_by: context.user.id,
        updated_at: new Date().toISOString(),
        updated_by: context.user.id
      };

      // Agregar a la lista
      articles.push(newArticle);

      // Actualizar contador de artículos del autor
      const authorIndex = authors.findIndex((author: any) => author.id === author_id);
      if (authorIndex !== -1) {
        authors[authorIndex].articles_count = (authors[authorIndex].articles_count || 0) + 1;
      }

      // Actualizar contador de artículos de la categoría
      const categoryIndex = categories.findIndex((cat: any) => cat.id === category);
      if (categoryIndex !== -1) {
        categories[categoryIndex].articles_count = (categories[categoryIndex].articles_count || 0) + 1;
      }

      // Actualizar archivo
      const updatedData = {
        ...newsletterData,
        articles,
        authors,
        categories,
        metadata: {
          ...newsletterData.metadata,
          total_articles: articles.length,
          featured_articles: articles.filter((a: any) => a.featured).length,
          total_reading_time: articles.reduce((sum: number, a: any) => sum + (a.reading_time || 0), 0),
          average_reading_time: Math.round(
            articles.reduce((sum: number, a: any) => sum + (a.reading_time || 0), 0) / articles.length
          ),
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
        resource: 'newsletter-article',
        resourceId: newArticle.id,
        message: `Newsletter article '${title}' created`,
        user: context.user.id,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        metadata: { title, slug: articleSlug, category, author_id, featured }
      });

      return NextResponse.json({
        success: true,
        message: 'Article created successfully.',
        data: { article: newArticle }
      }, { status: 201 });

    } catch (error) {
      await logger.error('newsletter-api', 'Failed to create article', error, {
        userId: context.user.id
      });

      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to create article.'
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