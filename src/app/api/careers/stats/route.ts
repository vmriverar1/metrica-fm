/**
 * API Careers Stats - Estadísticas y métricas
 * Obtener estadísticas generales de careers
 */

import { NextRequest, NextResponse } from 'next/server';
import { careerPositionService } from '@/lib/firestore/careers-service-unified';
import type { APIResponse } from '@/lib/api/base-controller';

export async function GET(request: NextRequest) {
  try {
    const stats = await careerPositionService.getCareersStats();

    return NextResponse.json({
      success: true,
      data: stats,
      meta: {
        generatedAt: new Date().toISOString()
      }
    } as APIResponse);

  } catch (error) {
    console.error('Error fetching careers stats:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch careers statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as APIResponse, { status: 500 });
  }
}