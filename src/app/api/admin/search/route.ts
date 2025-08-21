/**
 * API Route: /api/admin/search
 * Búsqueda general en todos los contenidos del sistema
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, requirePermission } from '@/lib/admin/middleware/auth-middleware';
import { jsonCrudSystem } from '@/lib/admin';
import { logger } from '@/lib/admin/core/logger';

interface SearchQuery {
  q: string;
  type?: 'all' | 'pages' | 'portfolio' | 'careers' | 'newsletter';
  limit?: number;
  fuzzy?: boolean;
}

interface SearchResult {
  id: string;
  type: 'page' | 'portfolio-project' | 'portfolio-category' | 'career-job' | 'career-department' | 'newsletter-article' | 'newsletter-author' | 'newsletter-category';
  title: string;
  description: string;
  url: string;
  score: number;
  metadata: Record<string, any>;
  highlighted_fields: string[];
}

// GET /api/admin/search - Búsqueda general
export const GET = withAuth(
  async (request: NextRequest, context) => {
    try {
      const { searchParams } = new URL(request.url);
      
      const query: SearchQuery = {
        q: searchParams.get('q') || '',
        type: (searchParams.get('type') as any) || 'all',
        limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
        fuzzy: searchParams.get('fuzzy') === 'true'
      };

      if (!query.q || query.q.trim().length < 2) {
        return NextResponse.json(
          {
            success: false,
            error: 'INVALID_QUERY',
            message: 'Search query must be at least 2 characters long.'
          },
          { status: 400 }
        );
      }

      const searchTerm = query.q.toLowerCase().trim();
      const results: SearchResult[] = [];

      // Función para calcular score de relevancia
      const calculateScore = (text: string, field: string, boost: number = 1): number => {
        if (!text) return 0;
        const lowerText = text.toLowerCase();
        let score = 0;

        // Coincidencia exacta (mayor score)
        if (lowerText.includes(searchTerm)) {
          score += 10 * boost;
        }

        // Coincidencias de palabras individuales
        const searchWords = searchTerm.split(' ');
        const textWords = lowerText.split(' ');
        
        searchWords.forEach(searchWord => {
          textWords.forEach(textWord => {
            if (textWord.includes(searchWord) && searchWord.length > 2) {
              score += 3 * boost;
            }
          });
        });

        // Fuzzy matching básico (búsqueda parcial)
        if (query.fuzzy) {
          searchWords.forEach(searchWord => {
            if (searchWord.length > 3) {
              const regex = new RegExp(searchWord.split('').join('.*'), 'i');
              if (regex.test(text)) {
                score += 1 * boost;
              }
            }
          });
        }

        return score;
      };

      // Función para resaltar campos que coinciden
      const getHighlightedFields = (item: any, searchFields: string[]): string[] => {
        const highlighted: string[] = [];
        searchFields.forEach(field => {
          const value = field.split('.').reduce((obj, key) => obj?.[key], item);
          if (value && typeof value === 'string' && calculateScore(value, field) > 0) {
            highlighted.push(field);
          }
        });
        return highlighted;
      };

      // Buscar en páginas estáticas
      if (query.type === 'all' || query.type === 'pages') {
        try {
          const files = ['pages/about-historia.json']; // Agregar más archivos de páginas según necesidad
          
          for (const file of files) {
            try {
              const pageData = await jsonCrudSystem.readJSON(file, true);
              
              if (pageData.page_info) {
                const page = pageData.page_info;
                let score = 0;
                score += calculateScore(page.title, 'title', 3);
                score += calculateScore(page.description, 'description', 2);
                score += calculateScore(page.meta_description, 'meta_description', 1);

                if (score > 0) {
                  results.push({
                    id: file.replace('.json', ''),
                    type: 'page',
                    title: page.title || 'Página',
                    description: page.description || page.meta_description || '',
                    url: `/${file.replace('pages/', '').replace('.json', '')}`,
                    score,
                    metadata: {
                      type: 'static_page',
                      file
                    },
                    highlighted_fields: getHighlightedFields(page, ['title', 'description', 'meta_description'])
                  });
                }
              }
            } catch (error) {
              // Archivo no existe o no es accesible, continuar
              continue;
            }
          }
        } catch (error) {
          // Error al leer páginas, continuar con otros tipos
        }
      }

      // Buscar en portfolio
      if (query.type === 'all' || query.type === 'portfolio') {
        try {
          const portfolioData = await jsonCrudSystem.readJSON('dynamic-content/portfolio/content.json', true);
          
          // Buscar en proyectos del portfolio
          if (portfolioData.projects) {
            portfolioData.projects.forEach((project: any) => {
              let score = 0;
              score += calculateScore(project.title, 'title', 3);
              score += calculateScore(project.description, 'description', 2);
              score += calculateScore(project.location, 'location', 1);
              score += calculateScore(project.client, 'client', 1);
              score += calculateScore(project.tags?.join(' '), 'tags', 1);

              if (score > 0) {
                results.push({
                  id: project.id,
                  type: 'portfolio-project',
                  title: project.title,
                  description: project.description || '',
                  url: `/portfolio/${project.slug}`,
                  score,
                  metadata: {
                    category: project.category,
                    status: project.status,
                    client: project.client,
                    location: project.location
                  },
                  highlighted_fields: getHighlightedFields(project, ['title', 'description', 'location', 'client', 'tags'])
                });
              }
            });
          }

          // Buscar en categorías del portfolio
          if (portfolioData.categories) {
            portfolioData.categories.forEach((category: any) => {
              let score = 0;
              score += calculateScore(category.name, 'name', 3);
              score += calculateScore(category.description, 'description', 2);

              if (score > 0) {
                results.push({
                  id: category.id,
                  type: 'portfolio-category',
                  title: category.name,
                  description: category.description || '',
                  url: `/portfolio/category/${category.slug}`,
                  score,
                  metadata: {
                    projects_count: category.projects_count,
                    color: category.color
                  },
                  highlighted_fields: getHighlightedFields(category, ['name', 'description'])
                });
              }
            });
          }
        } catch (error) {
          // Error al leer portfolio, continuar
        }
      }

      // Buscar en careers
      if (query.type === 'all' || query.type === 'careers') {
        try {
          const careersData = await jsonCrudSystem.readJSON('dynamic-content/careers/content.json', true);
          
          // Buscar en trabajos
          if (careersData.job_postings) {
            careersData.job_postings.forEach((job: any) => {
              let score = 0;
              score += calculateScore(job.title, 'title', 3);
              score += calculateScore(job.short_description, 'short_description', 2);
              score += calculateScore(job.full_description, 'full_description', 1);
              score += calculateScore(job.department, 'department', 2);
              score += calculateScore(job.location?.city, 'location.city', 1);
              score += calculateScore(job.requirements?.essential?.join(' '), 'requirements.essential', 1);
              score += calculateScore(job.tags?.join(' '), 'tags', 1);

              if (score > 0) {
                results.push({
                  id: job.id,
                  type: 'career-job',
                  title: job.title,
                  description: job.short_description || '',
                  url: `/careers/job/${job.slug}`,
                  score,
                  metadata: {
                    department: job.department,
                    level: job.level,
                    type: job.type,
                    status: job.status,
                    location: job.location,
                    featured: job.featured,
                    urgent: job.urgent
                  },
                  highlighted_fields: getHighlightedFields(job, ['title', 'short_description', 'department', 'location.city', 'tags'])
                });
              }
            });
          }

          // Buscar en departamentos
          if (careersData.departments) {
            careersData.departments.forEach((dept: any) => {
              let score = 0;
              score += calculateScore(dept.name, 'name', 3);
              score += calculateScore(dept.description, 'description', 2);
              score += calculateScore(dept.detailed_description, 'detailed_description', 1);
              score += calculateScore(dept.required_skills?.join(' '), 'required_skills', 1);

              if (score > 0) {
                results.push({
                  id: dept.id,
                  type: 'career-department',
                  title: dept.name,
                  description: dept.description || '',
                  url: `/careers/department/${dept.slug}`,
                  score,
                  metadata: {
                    open_positions: dept.open_positions,
                    total_employees: dept.total_employees,
                    featured: dept.featured
                  },
                  highlighted_fields: getHighlightedFields(dept, ['name', 'description', 'detailed_description', 'required_skills'])
                });
              }
            });
          }
        } catch (error) {
          // Error al leer careers, continuar
        }
      }

      // Buscar en newsletter
      if (query.type === 'all' || query.type === 'newsletter') {
        try {
          const newsletterData = await jsonCrudSystem.readJSON('dynamic-content/newsletter/content.json', true);
          
          // Buscar en artículos
          if (newsletterData.articles) {
            newsletterData.articles.forEach((article: any) => {
              let score = 0;
              score += calculateScore(article.title, 'title', 3);
              score += calculateScore(article.excerpt, 'excerpt', 2);
              score += calculateScore(article.content, 'content', 1);
              score += calculateScore(article.tags?.join(' '), 'tags', 1);

              if (score > 0) {
                results.push({
                  id: article.id,
                  type: 'newsletter-article',
                  title: article.title,
                  description: article.excerpt || '',
                  url: `/blog/${article.slug}`,
                  score,
                  metadata: {
                    category: article.category,
                    author_id: article.author_id,
                    published_date: article.published_date,
                    featured: article.featured,
                    reading_time: article.reading_time
                  },
                  highlighted_fields: getHighlightedFields(article, ['title', 'excerpt', 'content', 'tags'])
                });
              }
            });
          }

          // Buscar en autores
          if (newsletterData.authors) {
            newsletterData.authors.forEach((author: any) => {
              let score = 0;
              score += calculateScore(author.name, 'name', 3);
              score += calculateScore(author.role, 'role', 2);
              score += calculateScore(author.bio, 'bio', 1);
              score += calculateScore(author.specializations?.join(' '), 'specializations', 1);

              if (score > 0) {
                results.push({
                  id: author.id,
                  type: 'newsletter-author',
                  title: author.name,
                  description: `${author.role} - ${author.bio}`,
                  url: `/blog/author/${author.id}`,
                  score,
                  metadata: {
                    role: author.role,
                    articles_count: author.articles_count,
                    featured: author.featured,
                    specializations: author.specializations
                  },
                  highlighted_fields: getHighlightedFields(author, ['name', 'role', 'bio', 'specializations'])
                });
              }
            });
          }

          // Buscar en categorías
          if (newsletterData.categories) {
            newsletterData.categories.forEach((category: any) => {
              let score = 0;
              score += calculateScore(category.name, 'name', 3);
              score += calculateScore(category.description, 'description', 2);

              if (score > 0) {
                results.push({
                  id: category.id,
                  type: 'newsletter-category',
                  title: category.name,
                  description: category.description || '',
                  url: `/blog/category/${category.slug}`,
                  score,
                  metadata: {
                    articles_count: category.articles_count,
                    featured: category.featured,
                    color: category.color
                  },
                  highlighted_fields: getHighlightedFields(category, ['name', 'description'])
                });
              }
            });
          }
        } catch (error) {
          // Error al leer newsletter, continuar
        }
      }

      // Ordenar por score y limitar resultados
      const sortedResults = results
        .sort((a, b) => b.score - a.score)
        .slice(0, query.limit!);

      // Estadísticas de búsqueda
      const stats = {
        total_results: sortedResults.length,
        search_term: query.q,
        search_type: query.type,
        fuzzy_enabled: query.fuzzy,
        by_type: {
          pages: sortedResults.filter(r => r.type === 'page').length,
          'portfolio-projects': sortedResults.filter(r => r.type === 'portfolio-project').length,
          'portfolio-categories': sortedResults.filter(r => r.type === 'portfolio-category').length,
          'career-jobs': sortedResults.filter(r => r.type === 'career-job').length,
          'career-departments': sortedResults.filter(r => r.type === 'career-department').length,
          'newsletter-articles': sortedResults.filter(r => r.type === 'newsletter-article').length,
          'newsletter-authors': sortedResults.filter(r => r.type === 'newsletter-author').length,
          'newsletter-categories': sortedResults.filter(r => r.type === 'newsletter-category').length
        },
        avg_score: sortedResults.length > 0 ? 
          Math.round(sortedResults.reduce((sum, r) => sum + r.score, 0) / sortedResults.length) : 0
      };

      // Log de la búsqueda
      await logger.info('search-api', `Search performed: "${query.q}"`, {
        userId: context.user.id,
        searchTerm: query.q,
        searchType: query.type,
        resultsCount: sortedResults.length,
        fuzzyEnabled: query.fuzzy
      });

      return NextResponse.json({
        success: true,
        data: {
          results: sortedResults,
          stats,
          query: {
            term: query.q,
            type: query.type,
            fuzzy: query.fuzzy,
            limit: query.limit
          }
        }
      });

    } catch (error) {
      await logger.error('search-api', 'Failed to perform search', error, {
        userId: context.user.id,
        searchQuery: request.url
      });

      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to perform search.'
        },
        { status: 500 }
      );
    }
  },
  requirePermission('search', 'read')()
);

// Método OPTIONS para CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'GET, OPTIONS',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}