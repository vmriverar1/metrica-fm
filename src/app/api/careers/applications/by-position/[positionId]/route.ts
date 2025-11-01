/**
 * API Career Applications by Position
 * Obtener aplicaciones de una posición específica
 */

import { NextRequest, NextResponse } from 'next/server';
import { careerApplicationService } from '@/lib/firestore/careers-service-unified';
import type { APIResponse } from '@/lib/api/base-controller';

export async function GET(
  request: NextRequest,
  { params }: { params: { positionId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let applications = await careerApplicationService.getApplicationsByPosition(params.positionId);

    // Filtrar por status si se especifica
    if (status) {
      applications = applications.filter(app => app.status === status);
    }

    return NextResponse.json({
      success: true,
      data: applications,
      meta: {
        positionId: params.positionId,
        status,
        total: applications.length
      }
    } as APIResponse);

  } catch (error) {
    console.error('Error fetching applications by position:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch applications by position',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as APIResponse, { status: 500 });
  }
}