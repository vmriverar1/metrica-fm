/**
 * API Newsletter Recent Articles
 * Obtener artículos recientes
 */

import { NextRequest, NextResponse } from 'next/server';
import { newsletterArticleService } from '@/lib/firestore/newsletter-service-unified';
import type { APIResponse } from '@/lib/api/base-controller';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const articles = await newsletterArticleService.getRecentArticles(limit);

    return NextResponse.json({
      success: true,
      data: articles,
      meta: {
        limit,
        total: articles.length
      }
    } as APIResponse);

  } catch (error) {
    console.error('Error fetching recent articles:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch recent articles',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as APIResponse, { status: 500 });
  }
}