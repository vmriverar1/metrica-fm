/**
 * Servicio Portfolio Unificado
 * Extiende BaseFirestoreService con funcionalidades específicas de Portfolio
 * Reutiliza arquitectura base para máxima eficiencia
 */

import { Timestamp, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { BaseFirestoreService, BaseEntity, BaseData, FilterCondition, CRUDResponse } from '@/lib/firestore/base-service';
import { COLLECTIONS } from '@/lib/firebase/config';

// Tipos específicos de Portfolio
export interface PortfolioCategory extends BaseEntity {
  name: string;
  slug: string;
  description: string;
  icon?: string;
  color?: string;
  featured_image?: string;
  projects_count: number;
  total_investment_usd: number;
  total_area_m2: number;
  featured: boolean;
  order: number;
}

export interface PortfolioCategoryData extends BaseData {
  name: string;
  slug: string;
  description: string;
  icon?: string;
  color?: string;
  featured_image?: string;
  projects_count?: number;
  total_investment_usd?: number;
  total_area_m2?: number;
  featured?: boolean;
  order?: number;
}

export interface PortfolioProject extends BaseEntity {
  title: string;
  slug: string;
  category_id: string;
  location: {
    city: string;
    region: string;
    address?: string;
    coordinates: [number, number];
  };
  images: {
    featured: string;
    thumbnail: string;
    gallery: ProjectImage[];
  };
  description: string;
  short_description: string;
  details: {
    client: string;
    duration: string;
    investment_usd: number;
    area_m2: number;
    team: string[];
    certifications?: string[];
  };
  featured: boolean;
  completed_at: Timestamp;
  tags: string[];
  status: 'completed' | 'in_progress' | 'planned';
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  metrics: {
    views: number;
    last_updated: Timestamp;
  };
}

export interface PortfolioProjectData extends BaseData {
  title: string;
  slug: string;
  category_id: string;
  location: {
    city: string;
    region: string;
    address?: string;
    coordinates: [number, number];
  };
  images: {
    featured: string;
    thumbnail: string;
    gallery: ProjectImage[];
  };
  description: string;
  short_description: string;
  details: {
    client: string;
    duration: string;
    investment_usd: number;
    area_m2: number;
    team: string[];
    certifications?: string[];
  };
  featured?: boolean;
  completed_at?: Timestamp;
  tags?: string[];
  status?: 'completed' | 'in_progress' | 'planned';
  seo?: {
    title: string;
    description: string;
    keywords: string[];
  };
  metrics?: {
    views: number;
    last_updated: Timestamp;
  };
}

export interface ProjectImage {
  id: string;
  url: string;
  thumbnail: string;
  caption?: string;
  stage: 'inicio' | 'proceso' | 'final';
  order: number;
}

export interface PortfolioStats {
  totalProjects: number;
  totalInvestment: number;
  totalArea: number;
  categoriesCount: number;
  featuredProjects: number;
  projectsByStatus: Record<string, number>;
  projectsByCategory: Record<string, number>;
}

/**
 * Servicio de Categorías de Portfolio
 */
export class PortfolioCategoryService extends BaseFirestoreService<PortfolioCategory, PortfolioCategoryData> {
  constructor() {
    super(COLLECTIONS.PORTFOLIO_CATEGORIES);
  }

  /**
   * Obtener categorías con contador de proyectos actualizado
   */
  async getCategoriesWithProjectCount(): Promise<PortfolioCategory[]> {
    try {
      const categories = await this.getAll(
        undefined,
        [{ field: 'order', direction: 'asc' }]
      );

      // Actualizar contadores en paralelo
      const categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
          const projectCount = await this.getProjectCountForCategory(category.id);
          return {
            ...category,
            projects_count: projectCount
          };
        })
      );

      return categoriesWithCount;
    } catch (error) {
      console.error('Error getting categories with project count:', error);
      throw new Error('Failed to fetch categories with project count');
    }
  }

  /**
   * Obtener categorías destacadas para home
   */
  async getFeaturedCategories(): Promise<PortfolioCategory[]> {
    try {
      return await this.getAll(
        [{ field: 'featured', operator: '==', value: true }],
        [{ field: 'order', direction: 'asc' }]
      );
    } catch (error) {
      console.error('Error getting featured categories:', error);
      throw new Error('Failed to fetch featured categories');
    }
  }

  /**
   * Reordenar categorías
   */
  async reorderCategories(orderMap: { id: string; order: number }[]): Promise<CRUDResponse<void>> {
    try {
      const updates = orderMap.map(item => ({
        id: item.id,
        data: { order: item.order }
      }));

      return await this.batchUpdate(updates);
    } catch (error) {
      console.error('Error reordering categories:', error);
      return {
        success: false,
        error: 'Failed to reorder categories',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Actualizar métricas de una categoría
   */
  async updateCategoryMetrics(categoryId: string): Promise<CRUDResponse<void>> {
    try {
      const projects = await portfolioProjectService.getProjectsByCategory(categoryId);

      const totalInvestment = projects.reduce((sum, project) =>
        sum + (project.details.investment_usd || 0), 0
      );

      const totalArea = projects.reduce((sum, project) =>
        sum + (project.details.area_m2 || 0), 0
      );

      return await this.update(categoryId, {
        projects_count: projects.length,
        total_investment_usd: totalInvestment,
        total_area_m2: totalArea
      });
    } catch (error) {
      console.error('Error updating category metrics:', error);
      return {
        success: false,
        error: 'Failed to update category metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Obtener categoría por slug
   */
  async getCategoryBySlug(slug: string): Promise<PortfolioCategory | null> {
    try {
      const categories = await this.getAll([
        { field: 'slug', operator: '==', value: slug }
      ]);

      return categories.length > 0 ? categories[0] : null;
    } catch (error) {
      console.error('Error getting category by slug:', error);
      return null;
    }
  }

  // Método privado para contar proyectos
  private async getProjectCountForCategory(categoryId: string): Promise<number> {
    try {
      const projectsCount = await portfolioProjectService.count([
        { field: 'category_id', operator: '==', value: categoryId }
      ]);
      return projectsCount;
    } catch (error) {
      console.error('Error counting projects for category:', error);
      return 0;
    }
  }
}

/**
 * Servicio de Proyectos de Portfolio
 */
export class PortfolioProjectService extends BaseFirestoreService<PortfolioProject, PortfolioProjectData> {
  constructor() {
    super(COLLECTIONS.PORTFOLIO_PROJECTS);
  }

  /**
   * Obtener proyectos por categoría
   */
  async getProjectsByCategory(categoryId: string): Promise<PortfolioProject[]> {
    try {
      return await this.getAll(
        [{ field: 'category_id', operator: '==', value: categoryId }],
        [{ field: 'completed_at', direction: 'desc' }]
      );
    } catch (error) {
      console.error('Error getting projects by category:', error);
      throw new Error('Failed to fetch projects by category');
    }
  }

  /**
   * Obtener proyectos destacados
   */
  async getFeaturedProjects(limitCount: number = 6): Promise<PortfolioProject[]> {
    try {
      return await this.getAll(
        [{ field: 'featured', operator: '==', value: true }],
        [{ field: 'completed_at', direction: 'desc' }],
        { limit: limitCount }
      );
    } catch (error) {
      console.error('Error getting featured projects:', error);
      throw new Error('Failed to fetch featured projects');
    }
  }

  /**
   * Obtener proyecto por slug
   */
  async getProjectBySlug(slug: string): Promise<PortfolioProject | null> {
    try {
      const projects = await this.getAll([
        { field: 'slug', operator: '==', value: slug }
      ]);

      if (projects.length > 0) {
        // Incrementar contador de vistas
        await this.incrementField(projects[0].id, 'metrics.views');
        return projects[0];
      }

      return null;
    } catch (error) {
      console.error('Error getting project by slug:', error);
      return null;
    }
  }

  /**
   * Buscar proyectos por término
   */
  async searchProjects(searchTerm: string): Promise<PortfolioProject[]> {
    try {
      return await this.search(searchTerm, ['title', 'description', 'short_description', 'details.client']);
    } catch (error) {
      console.error('Error searching projects:', error);
      throw new Error('Failed to search projects');
    }
  }

  /**
   * Obtener proyectos por ubicación
   */
  async getProjectsByLocation(city: string): Promise<PortfolioProject[]> {
    try {
      return await this.getAll([
        { field: 'location.city', operator: '==', value: city }
      ]);
    } catch (error) {
      console.error('Error getting projects by location:', error);
      throw new Error('Failed to fetch projects by location');
    }
  }

  /**
   * Obtener proyectos relacionados (misma categoría, excluyendo el actual)
   */
  async getRelatedProjects(projectId: string, categoryId: string, limitCount: number = 3): Promise<PortfolioProject[]> {
    try {
      const relatedProjects = await this.getAll(
        [{ field: 'category_id', operator: '==', value: categoryId }],
        [{ field: 'completed_at', direction: 'desc' }],
        { limit: limitCount + 1 }
      );

      // Filtrar el proyecto actual
      return relatedProjects.filter(project => project.id !== projectId).slice(0, limitCount);
    } catch (error) {
      console.error('Error getting related projects:', error);
      throw new Error('Failed to fetch related projects');
    }
  }

  /**
   * Obtener estadísticas de portfolio
   */
  async getPortfolioStats(): Promise<PortfolioStats> {
    try {
      const [projects, categories] = await Promise.all([
        this.getAll(),
        portfolioCategoryService.getAll()
      ]);

      const totalInvestment = projects.reduce((sum, project) =>
        sum + (project.details.investment_usd || 0), 0
      );

      const totalArea = projects.reduce((sum, project) =>
        sum + (project.details.area_m2 || 0), 0
      );

      const featuredProjects = projects.filter(project => project.featured).length;

      // Proyectos por estado
      const projectsByStatus = projects.reduce((acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Proyectos por categoría
      const projectsByCategory = projects.reduce((acc, project) => {
        acc[project.category_id] = (acc[project.category_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalProjects: projects.length,
        totalInvestment,
        totalArea,
        categoriesCount: categories.length,
        featuredProjects,
        projectsByStatus,
        projectsByCategory
      };
    } catch (error) {
      console.error('Error getting portfolio stats:', error);
      throw new Error('Failed to fetch portfolio statistics');
    }
  }

  /**
   * Incrementar vistas de proyecto
   */
  async incrementViews(projectId: string): Promise<CRUDResponse<void>> {
    try {
      await this.incrementField(projectId, 'metrics.views');
      await this.update(projectId, {
        'metrics.last_updated': Timestamp.now()
      });

      return {
        success: true,
        message: 'Project views incremented successfully'
      };
    } catch (error) {
      console.error('Error incrementing project views:', error);
      return {
        success: false,
        error: 'Failed to increment project views',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Instancias de servicios exportadas
export const portfolioCategoryService = new PortfolioCategoryService();
export const portfolioProjectService = new PortfolioProjectService();