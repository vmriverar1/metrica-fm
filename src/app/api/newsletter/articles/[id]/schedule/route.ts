/**
 * API Newsletter Article Schedule
 * Programar artículo para publicación automática
 */

import { NextRequest, NextResponse } from 'next/server';
import { newsletterArticleService } from '@/lib/firestore/newsletter-service-unified';
import type { APIResponse } from '@/lib/api/base-controller';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { publish_date } = body;

    if (!publish_date) {
      return NextResponse.json({
        success: false,
        error: 'Publish date required',
        message: 'Please provide a publish_date in the request body'
      } as APIResponse, { status: 400 });
    }

    const publishDate = new Date(publish_date);
    if (isNaN(publishDate.getTime())) {
      return NextResponse.json({
        success: false,
        error: 'Invalid date format',
        message: 'Please provide a valid date format'
      } as APIResponse, { status: 400 });
    }

    if (publishDate <= new Date()) {
      return NextResponse.json({
        success: false,
        error: 'Invalid publish date',
        message: 'Publish date must be in the future'
      } as APIResponse, { status: 400 });
    }

    const result = await newsletterArticleService.scheduleArticle(params.id, publishDate);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Article scheduled for publication on ${publishDate.toISOString()}`
      } as APIResponse);
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        message: result.message
      } as APIResponse, { status: 400 });
    }

  } catch (error) {
    console.error('Error scheduling article:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to schedule article',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as APIResponse, { status: 500 });
  }
}