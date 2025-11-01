/**
 * API Portfolio Stats - Estadísticas y métricas
 * Obtener estadísticas generales del portfolio
 */

import { NextRequest, NextResponse } from 'next/server';
import { portfolioProjectService } from '@/lib/firestore/portfolio-service-unified';
import type { APIResponse } from '@/lib/api/base-controller';

export async function GET(request: NextRequest) {
  try {
    const stats = await portfolioProjectService.getPortfolioStats();

    return NextResponse.json({
      success: true,
      data: stats,
      meta: {
        generatedAt: new Date().toISOString()
      }
    } as APIResponse);

  } catch (error) {
    console.error('Error fetching portfolio stats:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch portfolio statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as APIResponse, { status: 500 });
  }
}