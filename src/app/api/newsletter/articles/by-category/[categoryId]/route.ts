/**
 * API Newsletter Articles by Category
 * Obtener artículos de una categoría específica
 */

import { NextRequest, NextResponse } from 'next/server';
import { newsletterArticleService } from '@/lib/firestore/newsletter-service-unified';
import type { APIResponse } from '@/lib/api/base-controller';

export async function GET(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'published';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    let articles = await newsletterArticleService.getArticlesByCategory(params.categoryId);

    // Filtrar por status
    if (status !== 'all') {
      articles = articles.filter(article => article.status === status);
    }

    // Aplicar límite si se especifica
    if (limit && limit > 0) {
      articles = articles.slice(0, limit);
    }

    return NextResponse.json({
      success: true,
      data: articles,
      meta: {
        categoryId: params.categoryId,
        status,
        limit,
        total: articles.length
      }
    } as APIResponse);

  } catch (error) {
    console.error('Error fetching articles by category:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch articles by category',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as APIResponse, { status: 500 });
  }
}