/**
 * API Newsletter Article Views
 * Incrementar contador de vistas de un artículo
 */

import { NextRequest, NextResponse } from 'next/server';
import { newsletterArticleService } from '@/lib/firestore/newsletter-service-unified';
import type { APIResponse } from '@/lib/api/base-controller';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await newsletterArticleService.incrementViews(params.id);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message
      } as APIResponse);
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        message: result.message
      } as APIResponse, { status: 400 });
    }

  } catch (error) {
    console.error('Error incrementing article views:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to increment views',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as APIResponse, { status: 500 });
  }
}