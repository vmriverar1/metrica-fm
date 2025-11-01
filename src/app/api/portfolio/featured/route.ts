/**
 * API Portfolio Featured - Endpoints especializados
 * Obtener contenido destacado de Portfolio
 */

import { NextRequest, NextResponse } from 'next/server';
import { portfolioCategoryService, portfolioProjectService } from '@/lib/firestore/portfolio-service-unified';
import type { APIResponse } from '@/lib/api/base-controller';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '6');

    let data: any = {};

    switch (type) {
      case 'categories':
        data.categories = await portfolioCategoryService.getFeaturedCategories();
        break;

      case 'projects':
        data.projects = await portfolioProjectService.getFeaturedProjects(limit);
        break;

      case 'all':
      default:
        const [categories, projects] = await Promise.all([
          portfolioCategoryService.getFeaturedCategories(),
          portfolioProjectService.getFeaturedProjects(limit)
        ]);
        data = { categories, projects };
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
    console.error('Error fetching featured portfolio content:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch featured content',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as APIResponse, { status: 500 });
  }
}