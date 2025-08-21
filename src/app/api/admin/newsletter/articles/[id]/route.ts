/**
 * API Route: /api/admin/newsletter/articles/[id]
 * CRUD para artículo específico
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, requirePermission } from '@/lib/admin/middleware/auth-middleware';
import { jsonCrudSystem } from '@/lib/admin';
import { logger } from '@/lib/admin/core/logger';

interface RouteParams {
  params: {
    id: string;
  };
}

const NEWSLETTER_FILE = 'dynamic-content/newsletter/content.json';

// GET /api/admin/newsletter/articles/[id] - Obtener artículo específico
export const GET = withAuth(
  async (request: NextRequest, context, { params }: RouteParams) => {
    try {
      const { id } = params;

      // Leer datos del newsletter
      const newsletterData = await jsonCrudSystem.readJSON(NEWSLETTER_FILE, true);
      const articles = newsletterData.articles || [];
      const authors = newsletterData.authors || [];
      const categories = newsletterData.categories || [];

      // Buscar artículo
      const article = articles.find((article: any) => article.id === id);
      if (!article) {
        return NextResponse.json(
          {
            success: false,
            error: 'ARTICLE_NOT_FOUND',
            message: 'Article not found.'
          },
          { status: 404 }
        );
      }

      // Enriquecer con información de autor y categoría
      const author = authors.find((author: any) => author.id === article.author_id);
      const category = categories.find((cat: any) => cat.id === article.category);
      
      const enrichedArticle = {
        ...article,
        author_info: author ? {
          id: author.id,
          name: author.name,
          role: author.role,
          avatar: author.avatar,
          bio: author.bio,
          linkedin: author.linkedin,
          email: author.email,
          specializations: author.specializations
        } : null,
        category_info: category ? {
          id: category.id,
          name: category.name,
          slug: category.slug,
          color: category.color,
          icon: category.icon,
          description: category.description
        } : null,
        // Calcular días desde publicación
        days_since_published: article.published_date ? 
          Math.floor((new Date().getTime() - new Date(article.published_date).getTime()) / (1000 * 60 * 60 * 24)) : null,
        // Status derivado
        status: article.published_date ? 'published' : 'draft'
      };

      // Artículos relacionados (mismo autor o categoría, excluyendo el actual)
      const relatedByAuthor = articles
        .filter((a: any) => a.author_id === article.author_id && a.id !== id && a.published_date)
        .slice(0, 3);
      
      const relatedByCategory = articles
        .filter((a: any) => a.category === article.category && a.id !== id && a.published_date)
        .slice(0, 3);

      // Combinar y deduplicar artículos relacionados
      const relatedArticles = [
        ...relatedByAuthor,
        ...relatedByCategory.filter((a: any) => !relatedByAuthor.find((r: any) => r.id === a.id))
      ]
        .slice(0, 5)
        .map((a: any) => ({
          id: a.id,
          title: a.title,
          slug: a.slug,
          excerpt: a.excerpt,
          featured_image: a.featured_image,
          published_date: a.published_date,
          reading_time: a.reading_time,
          author_name: authors.find((author: any) => author.id === a.author_id)?.name || 'Unknown',
          category_name: categories.find((cat: any) => cat.id === a.category)?.name || 'Unknown'
        }));

      return NextResponse.json({
        success: true,
        data: {
          article: enrichedArticle,
          related_articles: relatedArticles,
          author: author || null,
          category: category || null
        }
      });

    } catch (error) {
      await logger.error('newsletter-api', `Failed to get article: ${params.id}`, error, {
        userId: context.user.id
      });

      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to retrieve article.'
        },
        { status: 500 }
      );
    }
  },
  requirePermission('newsletter', 'read')()
);

// PUT /api/admin/newsletter/articles/[id] - Actualizar artículo
export const PUT = withAuth(
  async (request: NextRequest, context, { params }: RouteParams) => {
    try {
      const { id } = params;
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
        featured,
        tags,
        seo_description,
        social_image,
        related_articles,
        gallery
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

      // Buscar artículo
      const articleIndex = articles.findIndex((article: any) => article.id === id);
      if (articleIndex === -1) {
        return NextResponse.json(
          {
            success: false,
            error: 'ARTICLE_NOT_FOUND',
            message: 'Article not found.'
          },
          { status: 404 }
        );
      }

      const currentArticle = articles[articleIndex];

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

      // Verificar que el slug no existe en otro artículo
      if (slug && slug !== currentArticle.slug) {
        const existingArticle = articles.find((article: any) => article.slug === slug && article.id !== id);
        if (existingArticle) {
          return NextResponse.json(
            {
              success: false,
              error: 'SLUG_EXISTS',
              message: 'An article with this slug already exists.'
            },
            { status: 409 }
          );
        }
      }

      // Calcular tiempo de lectura si no se proporciona y el contenido cambió
      const calculatedReadingTime = reading_time || 
        (content !== currentArticle.content ? Math.ceil((content.length / 1000) * 4) : currentArticle.reading_time);

      // Actualizar artículo
      const updatedArticle = {
        ...currentArticle,
        title,
        slug: slug || currentArticle.slug,
        category,
        author_id,
        featured_image: featured_image !== undefined ? featured_image : currentArticle.featured_image,
        featured_image_alt: featured_image_alt !== undefined ? featured_image_alt : currentArticle.featured_image_alt,
        excerpt,
        content,
        published_date: published_date !== undefined ? published_date : currentArticle.published_date,
        reading_time: calculatedReadingTime,
        featured: featured !== undefined ? !!featured : currentArticle.featured,
        tags: tags !== undefined ? (Array.isArray(tags) ? tags : []) : currentArticle.tags,
        seo_description: seo_description !== undefined ? seo_description : currentArticle.seo_description,
        social_image: social_image !== undefined ? social_image : currentArticle.social_image,
        url: `/blog/${slug || currentArticle.slug}`,
        related_articles: related_articles !== undefined ? 
          (Array.isArray(related_articles) ? related_articles : []) : currentArticle.related_articles,
        gallery: gallery !== undefined ? (Array.isArray(gallery) ? gallery : []) : currentArticle.gallery,
        updated_at: new Date().toISOString(),
        updated_by: context.user.id
      };

      articles[articleIndex] = updatedArticle;

      // Actualizar contadores si cambió el autor o la categoría
      if (currentArticle.author_id !== author_id) {
        // Decrementar contador del autor anterior
        const oldAuthorIndex = authors.findIndex((author: any) => author.id === currentArticle.author_id);
        if (oldAuthorIndex !== -1) {
          authors[oldAuthorIndex].articles_count = Math.max(0, (authors[oldAuthorIndex].articles_count || 1) - 1);
        }

        // Incrementar contador del nuevo autor
        const newAuthorIndex = authors.findIndex((author: any) => author.id === author_id);
        if (newAuthorIndex !== -1) {
          authors[newAuthorIndex].articles_count = (authors[newAuthorIndex].articles_count || 0) + 1;
        }
      }

      if (currentArticle.category !== category) {
        // Decrementar contador de la categoría anterior
        const oldCategoryIndex = categories.findIndex((cat: any) => cat.id === currentArticle.category);
        if (oldCategoryIndex !== -1) {
          categories[oldCategoryIndex].articles_count = Math.max(0, (categories[oldCategoryIndex].articles_count || 1) - 1);
        }

        // Incrementar contador de la nueva categoría
        const newCategoryIndex = categories.findIndex((cat: any) => cat.id === category);
        if (newCategoryIndex !== -1) {
          categories[newCategoryIndex].articles_count = (categories[newCategoryIndex].articles_count || 0) + 1;
        }
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
        action: 'update',
        resource: 'newsletter-article',
        resourceId: id,
        message: `Newsletter article '${title}' updated`,
        user: context.user.id,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        metadata: { 
          title, 
          slug: updatedArticle.slug, 
          category,
          author_id,
          featured,
          author_changed: currentArticle.author_id !== author_id,
          category_changed: currentArticle.category !== category
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Article updated successfully.',
        data: { article: updatedArticle }
      });

    } catch (error) {
      await logger.error('newsletter-api', `Failed to update article: ${params.id}`, error, {
        userId: context.user.id
      });

      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to update article.'
        },
        { status: 500 }
      );
    }
  },
  requirePermission('newsletter', 'write')()
);

// DELETE /api/admin/newsletter/articles/[id] - Eliminar artículo
export const DELETE = withAuth(
  async (request: NextRequest, context, { params }: RouteParams) => {
    try {
      const { id } = params;

      // Leer datos actuales
      const newsletterData = await jsonCrudSystem.readJSON(NEWSLETTER_FILE, true);
      const articles = newsletterData.articles || [];
      const authors = newsletterData.authors || [];
      const categories = newsletterData.categories || [];

      // Buscar artículo
      const articleIndex = articles.findIndex((article: any) => article.id === id);
      if (articleIndex === -1) {
        return NextResponse.json(
          {
            success: false,
            error: 'ARTICLE_NOT_FOUND',
            message: 'Article not found.'
          },
          { status: 404 }
        );
      }

      const article = articles[articleIndex];

      // Eliminar artículo
      articles.splice(articleIndex, 1);

      // Actualizar contador del autor
      const authorIndex = authors.findIndex((author: any) => author.id === article.author_id);
      if (authorIndex !== -1) {
        authors[authorIndex].articles_count = Math.max(0, (authors[authorIndex].articles_count || 1) - 1);
      }

      // Actualizar contador de la categoría
      const categoryIndex = categories.findIndex((cat: any) => cat.id === article.category);
      if (categoryIndex !== -1) {
        categories[categoryIndex].articles_count = Math.max(0, (categories[categoryIndex].articles_count || 1) - 1);
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
          average_reading_time: articles.length > 0 ? Math.round(
            articles.reduce((sum: number, a: any) => sum + (a.reading_time || 0), 0) / articles.length
          ) : 0,
          last_updated: new Date().toISOString()
        }
      };

      await jsonCrudSystem.writeJSON(NEWSLETTER_FILE, updatedData, {
        validate: true,
        backup: true
      });

      // Log de auditoría
      await logger.audit({
        action: 'delete',
        resource: 'newsletter-article',
        resourceId: id,
        message: `Newsletter article '${article.title}' deleted`,
        user: context.user.id,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        metadata: { 
          title: article.title, 
          slug: article.slug, 
          category: article.category,
          author_id: article.author_id
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Article deleted successfully.'
      });

    } catch (error) {
      await logger.error('newsletter-api', `Failed to delete article: ${params.id}`, error, {
        userId: context.user.id
      });

      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to delete article.'
        },
        { status: 500 }
      );
    }
  },
  requirePermission('newsletter', 'delete')()
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