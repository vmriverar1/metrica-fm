/**
 * API Portfolio Projects by Category
 * Obtener proyectos de una categoría específica
 */

import { NextRequest, NextResponse } from 'next/server';
import { portfolioProjectService } from '@/lib/firestore/portfolio-service-unified';
import type { APIResponse } from '@/lib/api/base-controller';

export async function GET(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const projects = await portfolioProjectService.getProjectsByCategory(params.categoryId);

    return NextResponse.json({
      success: true,
      data: projects,
      meta: {
        categoryId: params.categoryId,
        total: projects.length
      }
    } as APIResponse);

  } catch (error) {
    console.error('Error fetching projects by category:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch projects by category',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as APIResponse, { status: 500 });
  }
}