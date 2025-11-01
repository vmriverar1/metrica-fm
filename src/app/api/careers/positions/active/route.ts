/**
 * API Career Active Positions
 * Obtener solo posiciones activas
 */

import { NextRequest, NextResponse } from 'next/server';
import { careerPositionService } from '@/lib/firestore/careers-service-unified';
import type { APIResponse } from '@/lib/api/base-controller';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    const positions = await careerPositionService.getActivePositions(limit);

    return NextResponse.json({
      success: true,
      data: positions,
      meta: {
        status: 'active',
        limit,
        total: positions.length
      }
    } as APIResponse);

  } catch (error) {
    console.error('Error fetching active positions:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch active positions',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as APIResponse, { status: 500 });
  }
}