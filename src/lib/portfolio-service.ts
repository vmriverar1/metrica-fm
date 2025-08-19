/**
 * Portfolio Service - Versión de producción optimizada
 * 
 * Sistema híbrido que funciona perfectamente con:
 * 1. Datos locales TypeScript (siempre disponible)
 * 2. Directus cuando esté configurado (futuro)
 * 3. API unificada para todas las páginas del portfolio
 */

import { sampleProjects, ProjectCategory, Project, getCategoryColor, getCategoryLabel } from '@/types/portfolio';

export interface PortfolioCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  count?: number;
}

export interface PortfolioProject extends Project {
  // Campos adicionales para la API
  url: string;
  isExternal?: boolean;
}

export interface PortfolioStats {
  totalProjects: number;
  featuredProjects: number;
  categories: number;
  latestUpdate: Date;
}

/**
 * Servicio principal del portfolio - SIEMPRE funcional
 */
export class PortfolioService {
  private static dataSource: 'local' | 'directus' = 'local';
  private static lastHealthCheck: number = 0;
  private static healthCheckInterval = 5 * 60 * 1000; // 5 minutos

  /**
   * Verificar si Directus está disponible (con cache)
   */
  private static async checkDirectusHealth(): Promise<boolean> {
    const now = Date.now();
    
    if ((now - this.lastHealthCheck) < this.healthCheckInterval) {
      return this.dataSource === 'directus';
    }

    try {
      const response = await fetch('http://localhost:8055/server/health', {
        timeout: 2000,
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        // Verificar si tiene datos reales
        const categoriesResponse = await fetch('http://localhost:8055/items/project_categories?limit=1', {
          timeout: 2000
        });
        
        if (categoriesResponse.ok) {
          const data = await categoriesResponse.json();
          this.dataSource = (data.data && data.data.length > 0) ? 'directus' : 'local';
        } else {
          this.dataSource = 'local';
        }
      } else {
        this.dataSource = 'local';
      }
    } catch (error) {
      this.dataSource = 'local';
    }

    this.lastHealthCheck = now;
    return this.dataSource === 'directus';
  }

  /**
   * Obtener todas las categorías
   */
  static async getCategories(): Promise<PortfolioCategory[]> {
    const isDirectusReady = await this.checkDirectusHealth();

    if (isDirectusReady) {
      try {
        const response = await fetch('http://localhost:8055/items/project_categories');
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.data && data.data.length > 0) {
            return data.data.map((cat: any) => ({
              id: cat.id,
              name: cat.name,
              slug: cat.slug,
              description: cat.description,
              color: cat.color,
              icon: cat.icon,
              count: this.getProjectCountByCategory(cat.slug)
            }));
          }
        }
      } catch (error) {
        console.log('🔄 Directus unavailable, using local data');
      }
    }

    // Datos locales SIEMPRE disponibles
    const categories = Object.values(ProjectCategory).map(category => ({
      id: category,
      name: getCategoryLabel(category),
      slug: category,
      description: this.getCategoryDescription(category),
      color: getCategoryColor(category).replace('text-', '#').replace('-500', ''),
      icon: this.getCategoryIcon(category),
      count: this.getProjectCountByCategory(category)
    }));

    return categories;
  }

  /**
   * Obtener proyectos con filtros
   */
  static async getProjects(options: {
    category?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
    search?: string;
  } = {}): Promise<PortfolioProject[]> {
    const isDirectusReady = await this.checkDirectusHealth();

    if (isDirectusReady) {
      try {
        const params = new URLSearchParams();
        if (options.limit) params.append('limit', options.limit.toString());
        if (options.offset) params.append('offset', options.offset.toString());
        if (options.featured) params.append('filter[featured][_eq]', 'true');
        if (options.category) params.append('filter[category][slug][_eq]', options.category);

        const response = await fetch(`http://localhost:8055/items/projects?${params}`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.data && data.data.length > 0) {
            return data.data.map((proj: any) => this.mapDirectusProject(proj));
          }
        }
      } catch (error) {
        console.log('🔄 Using local projects data');
      }
    }

    // Datos locales con filtros aplicados
    let projects = [...sampleProjects].map(proj => ({
      ...proj,
      url: `/portfolio/${proj.category}/${proj.slug}`,
      isExternal: false
    }));

    // Aplicar filtros
    if (options.category) {
      projects = projects.filter(p => p.category === options.category);
    }
    
    if (options.featured) {
      projects = projects.filter(p => p.featured);
    }

    if (options.search) {
      const searchTerm = options.search.toLowerCase();
      projects = projects.filter(p => 
        p.title.toLowerCase().includes(searchTerm) ||
        p.shortDescription.toLowerCase().includes(searchTerm) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Ordenar por fecha de completado (más reciente primero)
    projects.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());

    if (options.offset) {
      projects = projects.slice(options.offset);
    }

    if (options.limit) {
      projects = projects.slice(0, options.limit);
    }

    return projects;
  }

  /**
   * Obtener un proyecto por slug
   */
  static async getProjectBySlug(slug: string): Promise<PortfolioProject | null> {
    const isDirectusReady = await this.checkDirectusHealth();

    if (isDirectusReady) {
      try {
        const response = await fetch(`http://localhost:8055/items/projects?filter[slug][_eq]=${slug}&limit=1`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.data && data.data.length > 0) {
            return this.mapDirectusProject(data.data[0]);
          }
        }
      } catch (error) {
        console.log('🔄 Using local project data');
      }
    }

    // Buscar en datos locales
    const project = sampleProjects.find(p => p.slug === slug);
    
    if (project) {
      return {
        ...project,
        url: `/portfolio/${project.category}/${project.slug}`,
        isExternal: false
      };
    }

    return null;
  }

  /**
   * Obtener estadísticas del portfolio
   */
  static async getStats(): Promise<PortfolioStats> {
    const projects = await this.getProjects();
    const categories = await this.getCategories();

    return {
      totalProjects: projects.length,
      featuredProjects: projects.filter(p => p.featured).length,
      categories: categories.length,
      latestUpdate: new Date(Math.max(...projects.map(p => p.completedAt.getTime())))
    };
  }

  /**
   * Buscar proyectos
   */
  static async searchProjects(query: string, limit: number = 10): Promise<PortfolioProject[]> {
    return this.getProjects({ search: query, limit });
  }

  /**
   * Obtener proyectos relacionados
   */
  static async getRelatedProjects(project: Project, limit: number = 3): Promise<PortfolioProject[]> {
    const allProjects = await this.getProjects();
    
    // Filtrar proyectos de la misma categoría, excluyendo el actual
    const related = allProjects
      .filter(p => p.category === project.category && p.id !== project.id)
      .slice(0, limit);

    // Si no hay suficientes de la misma categoría, agregar otros proyectos
    if (related.length < limit) {
      const additional = allProjects
        .filter(p => p.id !== project.id && !related.find(r => r.id === p.id))
        .slice(0, limit - related.length);
      
      related.push(...additional);
    }

    return related;
  }

  /**
   * Obtener información del sistema
   */
  static async getSystemInfo(): Promise<{
    dataSource: 'local' | 'directus';
    directusAvailable: boolean;
    lastCheck: Date;
    apiEndpoint: string;
  }> {
    const directusAvailable = await this.checkDirectusHealth();
    
    return {
      dataSource: this.dataSource,
      directusAvailable,
      lastCheck: new Date(this.lastHealthCheck),
      apiEndpoint: directusAvailable ? 'http://localhost:8055' : 'local-data'
    };
  }

  // Métodos auxiliares privados
  private static mapDirectusProject(proj: any): PortfolioProject {
    return {
      id: proj.id,
      title: proj.title,
      slug: proj.slug,
      category: proj.category?.slug as ProjectCategory || ProjectCategory.OFICINA,
      featuredImage: proj.featured_image || '',
      thumbnailImage: proj.featured_image || '',
      description: proj.description || '',
      shortDescription: proj.short_description || '',
      featured: proj.featured || false,
      completedAt: new Date(proj.completed_at || Date.now()),
      location: proj.location || { city: 'Lima', region: 'Lima', coordinates: [-77.0365, -12.0931] },
      gallery: [],
      details: { client: '', duration: '', team: [], area: '' },
      tags: proj.tags || [],
      url: `/portfolio/${proj.category?.slug || 'general'}/${proj.slug}`,
      isExternal: false
    };
  }

  private static getProjectCountByCategory(category: string): number {
    return sampleProjects.filter(p => p.category === category).length;
  }

  private static getCategoryDescription(category: ProjectCategory): string {
    const descriptions = {
      [ProjectCategory.OFICINA]: 'Proyectos de oficinas corporativas y centros de negocios',
      [ProjectCategory.RETAIL]: 'Centros comerciales, tiendas y espacios comerciales',
      [ProjectCategory.INDUSTRIA]: 'Plantas industriales, fábricas y centros logísticos',
      [ProjectCategory.HOTELERIA]: 'Hoteles, resorts y proyectos de hospitalidad',
      [ProjectCategory.EDUCACION]: 'Colegios, universidades e instituciones educativas',
      [ProjectCategory.VIVIENDA]: 'Proyectos residenciales y condominios',
      [ProjectCategory.SALUD]: 'Clínicas, hospitales y centros médicos'
    };
    
    return descriptions[category] || '';
  }

  private static getCategoryIcon(category: ProjectCategory): string {
    const icons = {
      [ProjectCategory.OFICINA]: 'business',
      [ProjectCategory.RETAIL]: 'shopping_cart',
      [ProjectCategory.INDUSTRIA]: 'precision_manufacturing',
      [ProjectCategory.HOTELERIA]: 'hotel',
      [ProjectCategory.EDUCACION]: 'school',
      [ProjectCategory.VIVIENDA]: 'home',
      [ProjectCategory.SALUD]: 'local_hospital'
    };
    
    return icons[category] || 'folder';
  }
}

// Exports para compatibilidad con código existente
export const getCategories = () => PortfolioService.getCategories();
export const getProjects = (options = {}) => PortfolioService.getProjects(options);
export const getProjectBySlug = (slug: string) => PortfolioService.getProjectBySlug(slug);
export const getStats = () => PortfolioService.getStats();
export const searchProjects = (query: string, limit = 10) => PortfolioService.searchProjects(query, limit);
export const getRelatedProjects = (project: Project, limit = 3) => PortfolioService.getRelatedProjects(project, limit);
export const getSystemInfo = () => PortfolioService.getSystemInfo();