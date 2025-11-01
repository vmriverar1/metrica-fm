/**
 * API Portfolio Search - Búsqueda especializada
 * Búsqueda avanzada en proyectos y categorías
 */

import { NextRequest, NextResponse } from 'next/server';
import { portfolioCategoryService, portfolioProjectService } from '@/lib/firestore/portfolio-service-unified';
import type { APIResponse } from '@/lib/api/base-controller';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Search query required',
        message: 'Please provide a search query with at least 2 characters'
      } as APIResponse, { status: 400 });
    }

    let data: any = {};

    switch (type) {
      case 'projects':
        data.projects = await portfolioProjectService.searchProjects(query.trim());
        break;

      case 'categories':
        // Search en categories usando el método base search
        data.categories = await portfolioCategoryService.search(query.trim(), ['name', 'description']);
        break;

      case 'all':
      default:
        const [projects, categories] = await Promise.all([
          portfolioProjectService.searchProjects(query.trim()),
          portfolioCategoryService.search(query.trim(), ['name', 'description'])
        ]);
        data = { projects, categories };
        break;
    }

    // Aplicar límite si es necesario
    if (data.projects && data.projects.length > limit) {
      data.projects = data.projects.slice(0, limit);
    }
    if (data.categories && data.categories.length > limit) {
      data.categories = data.categories.slice(0, limit);
    }

    return NextResponse.json({
      success: true,
      data,
      meta: {
        query,
        type,
        limit,
        totalResults: {
          projects: data.projects?.length || 0,
          categories: data.categories?.length || 0
        }
      }
    } as APIResponse);

  } catch (error) {
    console.error('Error searching portfolio:', error);
    return NextResponse.json({
      success: false,
      error: 'Search failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as APIResponse, { status: 500 });
  }
}