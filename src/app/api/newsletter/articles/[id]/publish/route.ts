/**
 * API Newsletter Article Publish
 * Publicar artículo programado inmediatamente
 */

import { NextRequest, NextResponse } from 'next/server';
import { newsletterArticleService } from '@/lib/firestore/newsletter-service-unified';
import type { APIResponse } from '@/lib/api/base-controller';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await newsletterArticleService.publishScheduledArticle(params.id);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Article published successfully'
      } as APIResponse);
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        message: result.message
      } as APIResponse, { status: 400 });
    }

  } catch (error) {
    console.error('Error publishing article:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to publish article',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as APIResponse, { status: 500 });
  }
}