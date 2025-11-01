/**
 * API Newsletter Stats - Estadísticas y métricas
 * Obtener estadísticas generales del newsletter/blog
 */

import { NextRequest, NextResponse } from 'next/server';
import { newsletterArticleService } from '@/lib/firestore/newsletter-service-unified';
import type { APIResponse } from '@/lib/api/base-controller';

export async function GET(request: NextRequest) {
  try {
    const stats = await newsletterArticleService.getNewsletterStats();

    return NextResponse.json({
      success: true,
      data: stats,
      meta: {
        generatedAt: new Date().toISOString()
      }
    } as APIResponse);

  } catch (error) {
    console.error('Error fetching newsletter stats:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch newsletter statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as APIResponse, { status: 500 });
  }
}