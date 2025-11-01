/**
 * API Newsletter Published Articles
 * Obtener solo artículos publicados
 */

import { NextRequest, NextResponse } from 'next/server';
import { newsletterArticleService } from '@/lib/firestore/newsletter-service-unified';
import type { APIResponse } from '@/lib/api/base-controller';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    const articles = await newsletterArticleService.getPublishedArticles(limit);

    return NextResponse.json({
      success: true,
      data: articles,
      meta: {
        status: 'published',
        limit,
        total: articles.length
      }
    } as APIResponse);

  } catch (error) {
    console.error('Error fetching published articles:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch published articles',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as APIResponse, { status: 500 });
  }
}