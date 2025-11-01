/**
 * API Career Positions by Location
 * Obtener posiciones por ciudad
 */

import { NextRequest, NextResponse } from 'next/server';
import { careerPositionService } from '@/lib/firestore/careers-service-unified';
import type { APIResponse } from '@/lib/api/base-controller';

export async function GET(
  request: NextRequest,
  { params }: { params: { city: string } }
) {
  try {
    const city = decodeURIComponent(params.city);
    const { searchParams } = new URL(request.url);
    const employmentType = searchParams.get('employment_type');
    const experienceLevel = searchParams.get('experience_level');
    const remoteAvailable = searchParams.get('remote') === 'true';

    let positions = await careerPositionService.getPositionsByLocation(city);

    // Aplicar filtros adicionales
    if (employmentType) {
      positions = positions.filter(pos => pos.employment_type === employmentType);
    }

    if (experienceLevel) {
      positions = positions.filter(pos => pos.experience_level === experienceLevel);
    }

    if (remoteAvailable !== undefined) {
      positions = positions.filter(pos => pos.location.remote_available === remoteAvailable);
    }

    return NextResponse.json({
      success: true,
      data: positions,
      meta: {
        city,
        filters: {
          employment_type: employmentType,
          experience_level: experienceLevel,
          remote_available: remoteAvailable
        },
        total: positions.length
      }
    } as APIResponse);

  } catch (error) {
    console.error('Error fetching positions by location:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch positions by location',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as APIResponse, { status: 500 });
  }
}