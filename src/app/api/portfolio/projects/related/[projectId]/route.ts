/**
 * API Portfolio Related Projects
 * Obtener proyectos relacionados a un proyecto específico
 */

import { NextRequest, NextResponse } from 'next/server';
import { portfolioProjectService } from '@/lib/firestore/portfolio-service-unified';
import type { APIResponse } from '@/lib/api/base-controller';

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '3');

    // Primero obtener el proyecto actual para saber su categoría
    const currentProject = await portfolioProjectService.getById(params.projectId);

    if (!currentProject) {
      return NextResponse.json({
        success: false,
        error: 'Project not found',
        message: `Project with ID ${params.projectId} does not exist`
      } as APIResponse, { status: 404 });
    }

    // Obtener proyectos relacionados
    const relatedProjects = await portfolioProjectService.getRelatedProjects(
      params.projectId,
      currentProject.category_id,
      limit
    );

    return NextResponse.json({
      success: true,
      data: relatedProjects,
      meta: {
        projectId: params.projectId,
        categoryId: currentProject.category_id,
        limit,
        total: relatedProjects.length
      }
    } as APIResponse);

  } catch (error) {
    console.error('Error fetching related projects:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch related projects',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as APIResponse, { status: 500 });
  }
}