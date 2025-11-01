/**
 * API Newsletter Articles by Tag
 * Obtener artículos por tag/etiqueta
 */

import { NextRequest, NextResponse } from 'next/server';
import { newsletterArticleService } from '@/lib/firestore/newsletter-service-unified';
import type { APIResponse } from '@/lib/api/base-controller';

export async function GET(
  request: NextRequest,
  { params }: { params: { tag: string } }
) {
  try {
    const tag = decodeURIComponent(params.tag);
    const articles = await newsletterArticleService.getArticlesByTag(tag);

    return NextResponse.json({
      success: true,
      data: articles,
      meta: {
        tag,
        total: articles.length
      }
    } as APIResponse);

  } catch (error) {
    console.error('Error fetching articles by tag:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch articles by tag',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as APIResponse, { status: 500 });
  }
}