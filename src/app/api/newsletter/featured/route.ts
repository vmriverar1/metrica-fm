/**
 * API Newsletter Featured - Endpoints especializados
 * Obtener contenido destacado de Newsletter/Blog
 */

import { NextRequest, NextResponse } from 'next/server';
import { newsletterCategoryService, newsletterArticleService } from '@/lib/firestore/newsletter-service-unified';
import type { APIResponse } from '@/lib/api/base-controller';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '6');

    let data: any = {};

    switch (type) {
      case 'categories':
        data.categories = await newsletterCategoryService.getFeaturedCategories();
        break;

      case 'articles':
        data.articles = await newsletterArticleService.getFeaturedArticles(limit);
        break;

      case 'recent':
        data.articles = await newsletterArticleService.getRecentArticles(limit);
        break;

      case 'all':
      default:
        const [categories, featuredArticles, recentArticles] = await Promise.all([
          newsletterCategoryService.getFeaturedCategories(),
          newsletterArticleService.getFeaturedArticles(Math.floor(limit / 2)),
          newsletterArticleService.getRecentArticles(Math.ceil(limit / 2))
        ]);
        data = {
          categories,
          featured_articles: featuredArticles,
          recent_articles: recentArticles
        };
        break;
    }

    return NextResponse.json({
      success: true,
      data,
      meta: {
        type,
        limit
      }
    } as APIResponse);

  } catch (error) {
    console.error('Error fetching featured newsletter content:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch featured content',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as APIResponse, { status: 500 });
  }
}