/**
 * API Career Positions by Employment Type
 * Obtener posiciones por tipo de empleo
 */

import { NextRequest, NextResponse } from 'next/server';
import { careerPositionService } from '@/lib/firestore/careers-service-unified';
import type { APIResponse } from '@/lib/api/base-controller';

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const type = decodeURIComponent(params.type);
    const positions = await careerPositionService.getPositionsByEmploymentType(type);

    return NextResponse.json({
      success: true,
      data: positions,
      meta: {
        employment_type: type,
        total: positions.length
      }
    } as APIResponse);

  } catch (error) {
    console.error('Error fetching positions by employment type:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch positions by employment type',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as APIResponse, { status: 500 });
  }
}