/**
 * API Newsletter Related Articles
 * Obtener artículos relacionados a un artículo específico
 */

import { NextRequest, NextResponse } from 'next/server';
import { newsletterArticleService } from '@/lib/firestore/newsletter-service-unified';
import type { APIResponse } from '@/lib/api/base-controller';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '3');

    // Primero obtener el artículo actual para saber su categoría y tags
    const currentArticle = await newsletterArticleService.getById(params.id);

    if (!currentArticle) {
      return NextResponse.json({
        success: false,
        error: 'Article not found',
        message: `Article with ID ${params.id} does not exist`
      } as APIResponse, { status: 404 });
    }

    // Obtener artículos relacionados
    const relatedArticles = await newsletterArticleService.getRelatedArticles(
      params.id,
      currentArticle.category_id,
      currentArticle.tags,
      limit
    );

    return NextResponse.json({
      success: true,
      data: relatedArticles,
      meta: {
        articleId: params.id,
        categoryId: currentArticle.category_id,
        tags: currentArticle.tags,
        limit,
        total: relatedArticles.length
      }
    } as APIResponse);

  } catch (error) {
    console.error('Error fetching related articles:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch related articles',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as APIResponse, { status: 500 });
  }
}