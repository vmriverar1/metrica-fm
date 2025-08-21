/**
 * Portfolio Service - Sistema basado en datos locales
 * 
 * Servicio simplificado para gestión de portfolio usando únicamente datos locales.
 */

import { 
  Project, 
  ProjectCategory, 
  sampleProjects,
  getCategoryColor,
  getCategoryLabel
} from '@/types/portfolio';

// Define ProjectFilters locally since it doesn't exist in types
interface ProjectFilters {
  category?: ProjectCategory;
  featured?: boolean;
  tags?: string[];
  location?: string;
  year?: number;
  searchQuery?: string;
}

// Cache configuration
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface PortfolioServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  count: number;
}

interface PortfolioSystemInfo {
  dataSource: 'local';
  directusAvailable: boolean;
  lastCheck: Date;
  apiEndpoint: string;
  totalProjects: number;
  featuredProjects: number;
}

export class PortfolioService {
  private static dataSource: 'local' = 'local';

  /**
   * Get all available categories
   */
  static async getCategories(): Promise<PortfolioServiceCategory[]> {
    const cacheKey = 'portfolio_categories';
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    const categories: PortfolioServiceCategory[] = [
      {
        id: 'oficina',
        name: 'Oficina',
        slug: 'oficina',
        description: 'Espacios corporativos y edificios de oficinas modernas',
        color: '#3B82F6',
        count: sampleProjects.filter(p => p.category === ProjectCategory.OFICINA).length
      },
      {
        id: 'retail',
        name: 'Retail',
        slug: 'retail',
        description: 'Centros comerciales y espacios de venta',
        color: '#F97316',
        count: sampleProjects.filter(p => p.category === ProjectCategory.RETAIL).length
      },
      {
        id: 'industria',
        name: 'Industria',
        slug: 'industria',
        description: 'Plantas industriales y complejos manufactureros',
        color: '#6B7280',
        count: sampleProjects.filter(p => p.category === ProjectCategory.INDUSTRIA).length
      },
      {
        id: 'hoteleria',
        name: 'Hotelería',
        slug: 'hoteleria',
        description: 'Hoteles y complejos turísticos',
        color: '#8B5CF6',
        count: sampleProjects.filter(p => p.category === ProjectCategory.HOTELERIA).length
      },
      {
        id: 'educacion',
        name: 'Educación',
        slug: 'educacion',
        description: 'Instituciones educativas y campus universitarios',
        color: '#10B981',
        count: sampleProjects.filter(p => p.category === ProjectCategory.EDUCACION).length
      },
      {
        id: 'vivienda',
        name: 'Vivienda',
        slug: 'vivienda',
        description: 'Proyectos residenciales y complejos habitacionales',
        color: '#F59E0B',
        count: sampleProjects.filter(p => p.category === ProjectCategory.VIVIENDA).length
      },
      {
        id: 'salud',
        name: 'Salud',
        slug: 'salud',
        description: 'Hospitales y centros de salud',
        color: '#EF4444',
        count: sampleProjects.filter(p => p.category === ProjectCategory.SALUD).length
      }
    ];

    cache.set(cacheKey, { data: categories, timestamp: Date.now() });
    return categories;
  }

  /**
   * Get projects with optional filters
   */
  static async getProjects(filters: ProjectFilters & {
    limit?: number;
    offset?: number;
  } = {}): Promise<Project[]> {
    let projects = [...sampleProjects];

    // Apply filters
    if (filters.category) {
      projects = projects.filter(project => project.category === filters.category);
    }

    if (filters.featured !== undefined) {
      projects = projects.filter(project => project.featured === filters.featured);
    }

    if (filters.tags && filters.tags.length > 0) {
      projects = projects.filter(project => 
        filters.tags!.some(tag => project.tags.includes(tag))
      );
    }

    if (filters.location) {
      projects = projects.filter(project =>
        project.location.city.toLowerCase().includes(filters.location!.toLowerCase()) ||
        project.location.region.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    if (filters.year) {
      projects = projects.filter(project => 
        project.completedAt.getFullYear() === filters.year
      );
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      projects = projects.filter(project =>
        project.title.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.shortDescription.toLowerCase().includes(query) ||
        project.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort by completion date (most recent first)
    projects.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());

    // Apply pagination
    if (filters.offset) {
      projects = projects.slice(filters.offset);
    }
    
    if (filters.limit) {
      projects = projects.slice(0, filters.limit);
    }

    return projects;
  }

  /**
   * Get project by slug
   */
  static async getProjectBySlug(slug: string): Promise<Project | null> {
    return sampleProjects.find(project => project.slug === slug) || null;
  }

  /**
   * Get featured projects
   */
  static async getFeaturedProjects(limit?: number): Promise<Project[]> {
    return this.getProjects({ featured: true, limit });
  }

  /**
   * Get projects by category
   */
  static async getProjectsByCategory(category: ProjectCategory, limit?: number): Promise<Project[]> {
    return this.getProjects({ category, limit });
  }

  /**
   * Search projects
   */
  static async searchProjects(query: string): Promise<Project[]> {
    return this.getProjects({ searchQuery: query });
  }

  /**
   * Get system information
   */
  static async getSystemInfo(): Promise<PortfolioSystemInfo> {
    const allProjects = sampleProjects;
    const featuredProjects = allProjects.filter(p => p.featured);

    return {
      dataSource: 'local',
      directusAvailable: false,
      lastCheck: new Date(),
      apiEndpoint: 'local-data',
      totalProjects: allProjects.length,
      featuredProjects: featuredProjects.length
    };
  }

  /**
   * Get portfolio statistics
   */
  static async getStats() {
    const projects = sampleProjects;
    const categories = await this.getCategories();
    
    return {
      totalProjects: projects.length,
      featuredProjects: projects.filter(p => p.featured).length,
      totalCategories: categories.length,
      projectsByCategory: categories.map(cat => ({
        category: cat.name,
        count: cat.count
      })),
      recentProjects: projects
        .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())
        .slice(0, 5)
        .map(p => ({
          title: p.title,
          category: p.category,
          completedAt: p.completedAt
        }))
    };
  }

  /**
   * Clear cache
   */
  static clearCache(): void {
    cache.clear();
  }
}