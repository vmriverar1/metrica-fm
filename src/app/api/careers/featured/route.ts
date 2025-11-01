/**
 * API Careers Featured - Endpoints especializados
 * Obtener contenido destacado de Careers
 */

import { NextRequest, NextResponse } from 'next/server';
import { careerDepartmentService, careerPositionService } from '@/lib/firestore/careers-service-unified';
import type { APIResponse } from '@/lib/api/base-controller';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '6');

    let data: any = {};

    switch (type) {
      case 'departments':
        data.departments = await careerDepartmentService.getFeaturedDepartments();
        break;

      case 'positions':
        data.positions = await careerPositionService.getFeaturedPositions(limit);
        break;

      case 'urgent':
        data.positions = await careerPositionService.getUrgentPositions();
        break;

      case 'all':
      default:
        const [departments, positions, urgentPositions] = await Promise.all([
          careerDepartmentService.getFeaturedDepartments(),
          careerPositionService.getFeaturedPositions(limit),
          careerPositionService.getUrgentPositions()
        ]);
        data = { departments, positions, urgent_positions: urgentPositions };
        break;
    }

    return NextResponse.json({
      success: true,
      data,
      meta: {
        type,
        limit
      }
    } as APIResponse);

  } catch (error) {
    console.error('Error fetching featured careers content:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch featured content',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as APIResponse, { status: 500 });
  }
}