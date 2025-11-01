/**
 * API Newsletter Search - Búsqueda especializada
 * Búsqueda avanzada en artículos y categorías
 */

import { NextRequest, NextResponse } from 'next/server';
import { newsletterCategoryService, newsletterArticleService } from '@/lib/firestore/newsletter-service-unified';
import type { APIResponse } from '@/lib/api/base-controller';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '20');
    const filters = {
      category: searchParams.get('category'),
      author: searchParams.get('author'),
      tag: searchParams.get('tag'),
      status: searchParams.get('status') || 'published'
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
      case 'articles':
        data.articles = await newsletterArticleService.searchArticles(query.trim());
        break;

      case 'categories':
        data.categories = await newsletterCategoryService.search(query.trim(), ['name', 'description']);
        break;

      case 'all':
      default:
        const [articles, categories] = await Promise.all([
          newsletterArticleService.searchArticles(query.trim()),
          newsletterCategoryService.search(query.trim(), ['name', 'description'])
        ]);
        data = { articles, categories };
        break;
    }

    // Aplicar filtros adicionales a los artículos
    if (data.articles && data.articles.length > 0) {
      let filteredArticles = data.articles;

      if (filters.category) {
        filteredArticles = filteredArticles.filter((article: any) =>
          article.category_id === filters.category
        );
      }

      if (filters.author) {
        filteredArticles = filteredArticles.filter((article: any) =>
          article.author.email === filters.author ||
          article.author.name.toLowerCase().includes(filters.author!.toLowerCase())
        );
      }

      if (filters.tag) {
        filteredArticles = filteredArticles.filter((article: any) =>
          article.tags.includes(filters.tag)
        );
      }

      if (filters.status && filters.status !== 'published') {
        filteredArticles = filteredArticles.filter((article: any) =>
          article.status === filters.status
        );
      } else {
        // Por defecto solo mostrar artículos publicados
        filteredArticles = filteredArticles.filter((article: any) =>
          article.status === 'published'
        );
      }

      data.articles = filteredArticles;
    }

    // Aplicar límite si es necesario
    if (data.articles && data.articles.length > limit) {
      data.articles = data.articles.slice(0, limit);
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
        filters: Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== null)
        ),
        totalResults: {
          articles: data.articles?.length || 0,
          categories: data.categories?.length || 0
        }
      }
    } as APIResponse);

  } catch (error) {
    console.error('Error searching newsletter:', error);
    return NextResponse.json({
      success: false,
      error: 'Search failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as APIResponse, { status: 500 });
  }
}