/**
 * API Newsletter Articles by Author
 * Obtener artículos por autor
 */

import { NextRequest, NextResponse } from 'next/server';
import { newsletterArticleService } from '@/lib/firestore/newsletter-service-unified';
import type { APIResponse } from '@/lib/api/base-controller';

export async function GET(
  request: NextRequest,
  { params }: { params: { authorEmail: string } }
) {
  try {
    const authorEmail = decodeURIComponent(params.authorEmail);
    const articles = await newsletterArticleService.getArticlesByAuthor(authorEmail);

    return NextResponse.json({
      success: true,
      data: articles,
      meta: {
        authorEmail,
        total: articles.length
      }
    } as APIResponse);

  } catch (error) {
    console.error('Error fetching articles by author:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch articles by author',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as APIResponse, { status: 500 });
  }
}