/**
 * API Career Applications by Status
 * Obtener aplicaciones por estado
 */

import { NextRequest, NextResponse } from 'next/server';
import { careerApplicationService } from '@/lib/firestore/careers-service-unified';
import type { APIResponse } from '@/lib/api/base-controller';

export async function GET(
  request: NextRequest,
  { params }: { params: { status: string } }
) {
  try {
    const status = decodeURIComponent(params.status);
    const applications = await careerApplicationService.getApplicationsByStatus(status);

    return NextResponse.json({
      success: true,
      data: applications,
      meta: {
        status,
        total: applications.length
      }
    } as APIResponse);

  } catch (error) {
    console.error('Error fetching applications by status:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch applications by status',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as APIResponse, { status: 500 });
  }
}