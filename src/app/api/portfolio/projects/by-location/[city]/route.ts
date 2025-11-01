/**
 * API Portfolio Projects by Location
 * Obtener proyectos por ciudad
 */

import { NextRequest, NextResponse } from 'next/server';
import { portfolioProjectService } from '@/lib/firestore/portfolio-service-unified';
import type { APIResponse } from '@/lib/api/base-controller';

export async function GET(
  request: NextRequest,
  { params }: { params: { city: string } }
) {
  try {
    const city = decodeURIComponent(params.city);
    const projects = await portfolioProjectService.getProjectsByLocation(city);

    return NextResponse.json({
      success: true,
      data: projects,
      meta: {
        city,
        total: projects.length
      }
    } as APIResponse);

  } catch (error) {
    console.error('Error fetching projects by location:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch projects by location',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as APIResponse, { status: 500 });
  }
}