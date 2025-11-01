/**
 * API Career Positions by Experience Level
 * Obtener posiciones por nivel de experiencia
 */

import { NextRequest, NextResponse } from 'next/server';
import { careerPositionService } from '@/lib/firestore/careers-service-unified';
import type { APIResponse } from '@/lib/api/base-controller';

export async function GET(
  request: NextRequest,
  { params }: { params: { level: string } }
) {
  try {
    const level = decodeURIComponent(params.level);
    const positions = await careerPositionService.getPositionsByExperienceLevel(level);

    return NextResponse.json({
      success: true,
      data: positions,
      meta: {
        experience_level: level,
        total: positions.length
      }
    } as APIResponse);

  } catch (error) {
    console.error('Error fetching positions by experience level:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch positions by experience level',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as APIResponse, { status: 500 });
  }
}