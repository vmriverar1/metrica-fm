/**
 * API Careers Search - Búsqueda especializada
 * Búsqueda avanzada en posiciones y departamentos
 */

import { NextRequest, NextResponse } from 'next/server';
import { careerDepartmentService, careerPositionService } from '@/lib/firestore/careers-service-unified';
import type { APIResponse } from '@/lib/api/base-controller';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '20');
    const filters = {
      department: searchParams.get('department'),
      location: searchParams.get('location'),
      employment_type: searchParams.get('employment_type'),
      experience_level: searchParams.get('experience_level'),
      salary_min: searchParams.get('salary_min'),
      salary_max: searchParams.get('salary_max')
    };

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Search query required',
        message: 'Please provide a search query with at least 2 characters'
      } as APIResponse, { status: 400 });
    }

    let data: any = {};

    switch (type) {
      case 'positions':
        data.positions = await careerPositionService.searchPositions(query.trim());
        break;

      case 'departments':
        data.departments = await careerDepartmentService.search(query.trim(), ['name', 'description']);
        break;

      case 'all':
      default:
        const [positions, departments] = await Promise.all([
          careerPositionService.searchPositions(query.trim()),
          careerDepartmentService.search(query.trim(), ['name', 'description'])
        ]);
        data = { positions, departments };
        break;
    }

    // Aplicar filtros adicionales a las posiciones
    if (data.positions && data.positions.length > 0) {
      let filteredPositions = data.positions;

      if (filters.department) {
        filteredPositions = filteredPositions.filter((pos: any) =>
          pos.department_id === filters.department
        );
      }

      if (filters.location) {
        filteredPositions = filteredPositions.filter((pos: any) =>
          pos.location.city.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }

      if (filters.employment_type) {
        filteredPositions = filteredPositions.filter((pos: any) =>
          pos.employment_type === filters.employment_type
        );
      }

      if (filters.experience_level) {
        filteredPositions = filteredPositions.filter((pos: any) =>
          pos.experience_level === filters.experience_level
        );
      }

      if (filters.salary_min) {
        const salaryMin = parseInt(filters.salary_min);
        filteredPositions = filteredPositions.filter((pos: any) =>
          pos.salary_range.min >= salaryMin
        );
      }

      if (filters.salary_max) {
        const salaryMax = parseInt(filters.salary_max);
        filteredPositions = filteredPositions.filter((pos: any) =>
          pos.salary_range.max <= salaryMax
        );
      }

      data.positions = filteredPositions;
    }

    // Aplicar límite si es necesario
    if (data.positions && data.positions.length > limit) {
      data.positions = data.positions.slice(0, limit);
    }
    if (data.departments && data.departments.length > limit) {
      data.departments = data.departments.slice(0, limit);
    }

    return NextResponse.json({
      success: true,
      data,
      meta: {
        query,
        type,
        limit,
        filters: Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== null)
        ),
        totalResults: {
          positions: data.positions?.length || 0,
          departments: data.departments?.length || 0
        }
      }
    } as APIResponse);

  } catch (error) {
    console.error('Error searching careers:', error);
    return NextResponse.json({
      success: false,
      error: 'Search failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as APIResponse, { status: 500 });
  }
}