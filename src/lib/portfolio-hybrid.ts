/**
 * Portfolio Service - Sistema completamente basado en datos locales
 * 
 * Servicio para gestión de portfolio usando únicamente datos locales.
 */

import { sampleProjects, ProjectCategory, Project } from '@/types/portfolio';

/**
 * Servicio para obtener proyectos desde datos locales
 */
export class PortfolioHybridService {
  /**
   * Always returns false since we removed Directus
   */
  private static async checkDirectusAvailability(): Promise<boolean> {
    return false;
  }

  /**
   * Obtener categorías (solo datos locales)
   */
  static async getCategories(): Promise<{ id: string; name: string; slug: string; color?: string }[]> {
    return [
      { id: 'oficina', name: 'Oficina', slug: 'oficina', color: '#3B82F6' },
      { id: 'retail', name: 'Retail', slug: 'retail', color: '#F97316' },
      { id: 'industria', name: 'Industria', slug: 'industria', color: '#6B7280' },
      { id: 'hoteleria', name: 'Hotelería', slug: 'hoteleria', color: '#8B5CF6' },
      { id: 'educacion', name: 'Educación', slug: 'educacion', color: '#10B981' },
      { id: 'vivienda', name: 'Vivienda', slug: 'vivienda', color: '#F59E0B' },
      { id: 'salud', name: 'Salud', slug: 'salud', color: '#EF4444' }
    ];
  }

  /**
   * Obtener proyectos (solo datos locales)
   */
  static async getProjects(options: {
    category?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<Project[]> {
    let projects = [...sampleProjects];

    // Aplicar filtros a datos locales
    if (options.category) {
      projects = projects.filter(p => p.category === options.category);
    }
    
    if (options.featured) {
      projects = projects.filter(p => p.featured);
    }

    if (options.offset) {
      projects = projects.slice(options.offset);
    }

    if (options.limit) {
      projects = projects.slice(0, options.limit);
    }

    return projects;
  }

  /**
   * Obtener un proyecto por slug (solo datos locales)
   */
  static async getProjectBySlug(slug: string): Promise<Project | null> {
    return sampleProjects.find(p => p.slug === slug) || null;
  }

  /**
   * Status del sistema (solo local)
   */
  static async getSystemStatus(): Promise<{
    directusAvailable: boolean;
    dataSource: 'directus' | 'local';
    lastCheck: Date;
  }> {
    return {
      directusAvailable: false,
      dataSource: 'local',
      lastCheck: new Date()
    };
  }
}

// Exports compatibles con el sistema existente
export const getCategories = () => PortfolioHybridService.getCategories();
export const getProjects = (options = {}) => PortfolioHybridService.getProjects(options);
export const getProjectBySlug = (slug: string) => PortfolioHybridService.getProjectBySlug(slug);
export const getSystemStatus = () => PortfolioHybridService.getSystemStatus();