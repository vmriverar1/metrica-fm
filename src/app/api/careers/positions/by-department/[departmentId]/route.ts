/**
 * API Career Positions by Department
 * Obtener posiciones de un departamento específico
 */

import { NextRequest, NextResponse } from 'next/server';
import { careerPositionService } from '@/lib/firestore/careers-service-unified';
import type { APIResponse } from '@/lib/api/base-controller';

export async function GET(
  request: NextRequest,
  { params }: { params: { departmentId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let positions = await careerPositionService.getPositionsByDepartment(params.departmentId);

    // Filtrar por status si se especifica
    if (status) {
      positions = positions.filter(pos => pos.status === status);
    }

    return NextResponse.json({
      success: true,
      data: positions,
      meta: {
        departmentId: params.departmentId,
        status,
        total: positions.length
      }
    } as APIResponse);

  } catch (error) {
    console.error('Error fetching positions by department:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch positions by department',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as APIResponse, { status: 500 });
  }
}