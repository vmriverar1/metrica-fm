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

// Función helper para detectar si usar Firestore o JSON
async function shouldUseFirestore(): Promise<boolean> {
  try {
    const { isDemoMode } = await import('@/lib/firebase/config');
    return !isDemoMode; // Usar Firestore si no estamos en modo demo
  } catch (error) {
    console.warn('Error verificando modo Firebase:', error);
    return false; // Fallback a JSON
  }
}

// GET /api/admin/newsletter/articles/[id] - Obtener artículo específico
export const GET = withAuth(
  async (request: NextRequest, context, { params }: RouteParams) => {
    try {
    const { id } = params;
    const useFirestore = await shouldUseFirestore();
      
    if (useFirestore) {
      return await getArticleFromFirestore(id, context);
    } else {
      return await getArticleFromJSON(id, context);
    }

    } catch (error) {
    await logger.error('newsletter-api', 'Failed to get article', error, {
        userId: context.user.id,
        articleId: params.id
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

// GET desde Firestore
async function getArticleFromFirestore(id: string, context: any) {
  const { ArticulosService } = await import('@/lib/firestore/newsletter-service');

  try {
    const articulo = await ArticulosService.obtenerPorId(id);
    if (!articulo) {
    return NextResponse.json({
        success: false,
        error: 'ARTICLE_NOT_FOUND',
        message: 'Article not found.'
    }, { status: 404 });
    }

    // Convertir a formato esperado por el frontend
    const enrichedArticle = {
      id: articulo.id,
      title: articulo.title,
      slug: articulo.slug,
      category: articulo.categoria?.id || '',
      author_id: articulo.autor?.id || '',
      featured_image: articulo.featured_image,
      featured_image_alt: articulo.featured_image_alt || '',
      excerpt: articulo.excerpt,
      content: articulo.content,
      published_date: articulo.published_date?.toISOString() || null,
      reading_time: articulo.reading_time,
      featured: articulo.featured,
      tags: articulo.tags || [],
      seo_description: articulo.seo?.meta_description || articulo.excerpt,
      social_image: articulo.seo?.social_image || articulo.featured_image || '',
      url: `/blog/${articulo.slug}`,
      related_articles: [], // Por implementar
      gallery: [], // Por implementar
      created_at: articulo.created_at?.toISOString(),
      updated_at: articulo.updated_at?.toISOString(),
      author_info: articulo.autor ? {
        id: articulo.autor.id,
        name: articulo.autor.name,
        role: articulo.autor.role,
        avatar: articulo.autor.avatar,
        bio: articulo.autor.bio,
        linkedin: articulo.autor.social?.linkedin,
        email: articulo.autor.email,
        specializations: articulo.autor.specializations || []
    } : null,
      category_info: articulo.categoria ? {
        id: articulo.categoria.id,
        name: articulo.categoria.name,
        slug: articulo.categoria.slug,
        color: articulo.categoria.color,
        icon: articulo.categoria.icon,
        description: articulo.categoria.description
    } : null,
      days_since_published: articulo.published_date ? 
        Math.floor((new Date().getTime() - articulo.published_date.toDate().getTime()) / (1000 * 60 * 60 * 24)) : null,
      status: articulo.status === 'published' ? 'published' : 'draft'
    };

    return NextResponse.json({
      success: true,
      data: {
        article: enrichedArticle,
        related_articles: [] // Por implementar
    }
    });

  } catch (error) {
    throw error;
  }
}

// GET desde JSON (función original refactorizada)
async function getArticleFromJSON(id: string, context: any) {
  try {
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
    await logger.error('newsletter-api', `Failed to get article: ${id}`, error, {
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
}

// PUT /api/admin/newsletter/articles/[id] - Actualizar artículo
export const PUT = withAuth(
  async (request: NextRequest, context, { params }: RouteParams) => {
    try {
    const { id } = params;
    const body = await request.json();
    const useFirestore = await shouldUseFirestore();
      
    if (useFirestore) {
      return await updateArticleInFirestore(id, body, context, request);
    } else {
      return await updateArticleInJSON(id, body, context, request);
    }

    } catch (error) {
    await logger.error('newsletter-api', `Failed to update article: ${params.id}`, error, {
        userId: context.user.id
    });

    return NextResponse.json({
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Failed to update article.'
    }, { status: 500 });
    }
  },
  requirePermission('newsletter', 'write')()
);

// UPDATE desde Firestore
async function updateArticleInFirestore(id: string, body: any, context: any, request: NextRequest) {
  const { ArticulosService } = await import('@/lib/firestore/newsletter-service');

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
  } = body;

  // Validar campos requeridos
  if (!title || !category || !author_id || !excerpt || !content) {
    return NextResponse.json({
      success: false,
      error: 'INVALID_INPUT',
      message: 'Title, category, author_id, excerpt and content are required.'
    }, { status: 400 });
  }

  const updateData: any = {
    title,
    excerpt,
    content,
    featured: !!featured,
    tags: Array.isArray(tags) ? tags : [],
    reading_time: reading_time || Math.ceil((content.length / 1000) * 4),
    author_id,
    category_id: category,
    status: published_date ? 'published' as const : 'draft' as const,
    published_date: published_date ? new Date(published_date) : null
  };

  if (slug) updateData.slug = slug;
  if (featured_image !== undefined) updateData.featured_image = featured_image;
  if (featured_image_alt !== undefined) updateData.featured_image_alt = featured_image_alt;
  
  if (seo_description || social_image) {
    updateData.seo = {
      meta_title: title,
      meta_description: seo_description || excerpt,
      keywords: Array.isArray(tags) ? tags : [],
      social_image: social_image || featured_image || ''
    };
  }

  try {
    await ArticulosService.actualizar(id, updateData);
    
    await logger.audit({
      action: 'update',
      resource: 'newsletter-article',
      resourceId: id,
      message: `Newsletter article '${title}' updated via Firestore`,
      user: context.user.id,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      metadata: { title, category, author_id, featured }
    });

    return NextResponse.json({
      success: true,
      message: 'Article updated successfully.',
      data: { article: { id, ...updateData } }
    });

  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
    return NextResponse.json({
        success: false,
        error: 'ARTICLE_NOT_FOUND',
        message: 'Article not found.'
    }, { status: 404 });
    }
    
    if (error instanceof Error && error.message.includes('already exists')) {
    return NextResponse.json({
        success: false,
        error: 'SLUG_EXISTS',
        message: 'An article with this slug already exists.'
    }, { status: 409 });
    }
    
    throw error;
  }
}

// UPDATE desde JSON (función original refactorizada)
async function updateArticleInJSON(id: string, body: any, context: any, request: NextRequest) {
  try {
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
    await logger.error('newsletter-api', `Failed to update article: ${id}`, error, {
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
}

// DELETE /api/admin/newsletter/articles/[id] - Eliminar artículo
export const DELETE = withAuth(
  async (request: NextRequest, context, { params }: RouteParams) => {
    try {
    const { id } = params;
    const useFirestore = await shouldUseFirestore();
      
    if (useFirestore) {
      return await deleteArticleFromFirestore(id, context, request);
    } else {
      return await deleteArticleFromJSON(id, context, request);
    }

    } catch (error) {
    await logger.error('newsletter-api', `Failed to delete article: ${params.id}`, error, {
        userId: context.user.id
    });

    return NextResponse.json({
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Failed to delete article.'
    }, { status: 500 });
    }
  },
  requirePermission('newsletter', 'delete')()
);

// DELETE desde Firestore
async function deleteArticleFromFirestore(id: string, context: any, request: NextRequest) {
  const { ArticulosService } = await import('@/lib/firestore/newsletter-service');

  try {
    // Obtener datos del artículo antes de eliminarlo para logging
    const articulo = await ArticulosService.obtenerPorId(id);
    if (!articulo) {
    return NextResponse.json({
        success: false,
        error: 'ARTICLE_NOT_FOUND',
        message: 'Article not found.'
    }, { status: 404 });
    }

    await ArticulosService.eliminar(id);
    
    await logger.audit({
      action: 'delete',
      resource: 'newsletter-article',
      resourceId: id,
      message: `Newsletter article '${articulo.title}' deleted via Firestore`,
      user: context.user.id,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      metadata: { 
        title: articulo.title, 
        slug: articulo.slug,
        category: articulo.categoria?.id,
        author_id: articulo.autor?.id
    }
    });

    return NextResponse.json({
      success: true,
      message: 'Article deleted successfully.'
    });

  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
    return NextResponse.json({
        success: false,
        error: 'ARTICLE_NOT_FOUND',
        message: 'Article not found.'
    }, { status: 404 });
    }
    throw error;
  }
}

// DELETE desde JSON (función original refactorizada)
async function deleteArticleFromJSON(id: string, context: any, request: NextRequest) {
  try {
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
    await logger.error('newsletter-api', `Failed to delete article: ${id}`, error, {
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
}

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