/**
 * Portfolio Hybrid Service - Seguro y sin romper datos existentes
 * 
 * Este servicio funciona con:
 * 1. Directus cuando esté disponible y tenga datos
 * 2. Datos locales TypeScript como fallback
 * 3. Transición gradual sin romper nada
 */

import { sampleProjects, ProjectCategory, Project } from '@/types/portfolio';
import { directus } from './directus';

// Interface para datos de Directus (mínima y segura)
interface DirectusCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
}

interface DirectusProject {
  id: string;
  title: string;
  slug: string;
  category?: DirectusCategory;
  featured_image?: string;
  description?: string;
  short_description?: string;
  featured?: boolean;
  status?: string;
  // Campos adicionales opcionales
  [key: string]: any;
}

/**
 * Servicio híbrido para obtener proyectos
 * Intenta Directus primero, fallback a datos locales
 */
export class PortfolioHybridService {
  private static directusAvailable: boolean | null = null;
  private static lastCheck: number = 0;
  private static checkInterval = 5 * 60 * 1000; // 5 minutos

  /**
   * Verificar si Directus está disponible y tiene datos
   */
  private static async checkDirectusAvailability(): Promise<boolean> {
    const now = Date.now();
    
    // Cache del check por 5 minutos
    if (this.directusAvailable !== null && (now - this.lastCheck) < this.checkInterval) {
      return this.directusAvailable;
    }

    try {
      // Test simple y seguro
      const response = await fetch('http://localhost:8055/server/health');
      
      if (!response.ok) {
        this.directusAvailable = false;
        return false;
      }

      // Verificar si tiene datos reales
      const categoriesResponse = await fetch('http://localhost:8055/items/project_categories?limit=1');
      
      if (categoriesResponse.ok) {
        const data = await categoriesResponse.json();
        this.directusAvailable = data.data && data.data.length > 0;
      } else {
        this.directusAvailable = false;
      }

      this.lastCheck = now;
      return this.directusAvailable;
      
    } catch (error) {
      console.log('🔄 Directus no disponible, usando datos locales');
      this.directusAvailable = false;
      this.lastCheck = now;
      return false;
    }
  }

  /**
   * Obtener categorías (híbrido)
   */
  static async getCategories(): Promise<{ id: string; name: string; slug: string; color?: string }[]> {
    const isDirectusAvailable = await this.checkDirectusAvailability();

    if (isDirectusAvailable) {
      try {
        const response = await fetch('http://localhost:8055/items/project_categories');
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.data && data.data.length > 0) {
            console.log('📡 Usando categorías de Directus');
            return data.data.map((cat: DirectusCategory) => ({
              id: cat.id,
              name: cat.name,
              slug: cat.slug,
              color: cat.color
            }));
          }
        }
      } catch (error) {
        console.log('⚠️ Error en Directus, usando fallback');
      }
    }

    // Fallback a datos locales (SEGURO)
    console.log('📋 Usando categorías locales (fallback)');
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
   * Obtener proyectos (híbrido)
   */
  static async getProjects(options: {
    category?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<Project[]> {
    const isDirectusAvailable = await this.checkDirectusAvailability();

    if (isDirectusAvailable) {
      try {
        // Construir query parameters
        const params = new URLSearchParams();
        if (options.limit) params.append('limit', options.limit.toString());
        if (options.offset) params.append('offset', options.offset.toString());
        if (options.featured) params.append('filter[featured][_eq]', 'true');
        if (options.category) params.append('filter[category][slug][_eq]', options.category);

        const response = await fetch(`http://localhost:8055/items/projects?${params}`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.data && data.data.length > 0) {
            console.log('📡 Usando proyectos de Directus');
            
            // Mapear datos de Directus a formato local
            return data.data.map((proj: DirectusProject) => ({
              id: proj.id,
              title: proj.title,
              slug: proj.slug,
              category: proj.category?.slug as ProjectCategory || ProjectCategory.OFICINA,
              featuredImage: proj.featured_image || '',
              thumbnailImage: proj.featured_image || '',
              description: proj.description || '',
              shortDescription: proj.short_description || '',
              featured: proj.featured || false,
              completedAt: new Date(),
              location: { city: 'Lima', region: 'Lima', coordinates: [-77.0365, -12.0931] },
              gallery: [],
              details: { client: '', duration: '', team: [], area: '' },
              tags: []
            } as Project));
          }
        }
      } catch (error) {
        console.log('⚠️ Error en Directus, usando fallback');
      }
    }

    // Fallback a datos locales (SEGURO)
    console.log('📋 Usando proyectos locales (fallback)');
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
   * Obtener un proyecto por slug
   */
  static async getProjectBySlug(slug: string): Promise<Project | null> {
    const isDirectusAvailable = await this.checkDirectusAvailability();

    if (isDirectusAvailable) {
      try {
        const response = await fetch(`http://localhost:8055/items/projects?filter[slug][_eq]=${slug}&limit=1`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.data && data.data.length > 0) {
            console.log('📡 Usando proyecto de Directus');
            const proj = data.data[0];
            
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
              completedAt: new Date(),
              location: { city: 'Lima', region: 'Lima', coordinates: [-77.0365, -12.0931] },
              gallery: [],
              details: { client: '', duration: '', team: [], area: '' },
              tags: []
            } as Project;
          }
        }
      } catch (error) {
        console.log('⚠️ Error en Directus, usando fallback');
      }
    }

    // Fallback a datos locales
    console.log('📋 Usando proyecto local (fallback)');
    return sampleProjects.find(p => p.slug === slug) || null;
  }

  /**
   * Status del sistema híbrido
   */
  static async getSystemStatus(): Promise<{
    directusAvailable: boolean;
    dataSource: 'directus' | 'local';
    lastCheck: Date;
  }> {
    const available = await this.checkDirectusAvailability();
    
    return {
      directusAvailable: available,
      dataSource: available ? 'directus' : 'local',
      lastCheck: new Date(this.lastCheck)
    };
  }
}

// Exports compatibles con el sistema existente
export const getCategories = () => PortfolioHybridService.getCategories();
export const getProjects = (options = {}) => PortfolioHybridService.getProjects(options);
export const getProjectBySlug = (slug: string) => PortfolioHybridService.getProjectBySlug(slug);
export const getSystemStatus = () => PortfolioHybridService.getSystemStatus();