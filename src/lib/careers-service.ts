/**
 * CareersService - Sistema basado en datos locales
 * Servicio para gestión de careers/jobs usando únicamente datos locales
 */

import { 
  JobPosting, 
  JobCategory, 
  JobType,
  JobLevel,
  JobStatus,
  CareerFilters,
  CareersStats,
  JobApplication,
  JobBenefit,
  sampleJobPostings,
  sampleBenefits,
  getJobPosting,
  getJobsByCategory,
  getFeaturedJobs,
  getUrgentJobs,
  getCareersStats,
  getJobCategoryLabel,
  getJobCategoryDescription
} from '@/types/careers';

// Extensión de tipos locales para el servicio
export interface CareersServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon?: string;
  count: number; // Calculado dinámicamente
}

export interface CareersSystemInfo {
  dataSource: 'local';
  directusAvailable: boolean;
  lastCheck: Date;
  apiEndpoint: string;
  totalJobs: number;
  totalApplications: number;
  cacheStatus: 'active' | 'expired' | 'disabled';
}

/**
 * Cache simple para evitar verificaciones frecuentes
 */
class CareersServiceCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private ttl = 5 * 60 * 1000; // 5 minutos

  set(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

const cache = new CareersServiceCache();

/**
 * CareersService - Servicio principal usando datos locales
 */
export class CareersService {
  private static lastDirectusCheck = 0;
  private static directusAvailable = false;

  /**
   * Always returns false since we removed Directus
   */
  private static async checkDirectusAvailability(): Promise<boolean> {
    return false;
  }

  /**
   * Obtiene todas las categorías de trabajos
   */
  static async getCategories(): Promise<CareersServiceCategory[]> {
    const cacheKey = 'careers_categories';
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    // Categorías locales basadas en jobs
    const localCategories: CareersServiceCategory[] = [
      {
        id: 'gestion-direccion',
        name: 'Gestión y Dirección',
        slug: 'gestion-direccion',
        description: 'Liderar equipos y dirigir proyectos de construcción e infraestructura de gran escala.',
        color: '#007bc4',
        icon: '👨‍💼',
        count: sampleJobPostings.filter(j => j.category === 'gestion-direccion').length
      },
      {
        id: 'ingenieria-tecnica',
        name: 'Ingeniería y Técnica',
        slug: 'ingenieria-tecnica',
        description: 'Diseñar soluciones técnicas innovadoras y supervisar la implementación de proyectos.',
        color: '#003F6F',
        icon: '⚙️',
        count: sampleJobPostings.filter(j => j.category === 'ingenieria-tecnica').length
      },
      {
        id: 'arquitectura-diseño',
        name: 'Arquitectura y Diseño',
        slug: 'arquitectura-diseño',
        description: 'Crear espacios funcionales y estéticamente destacados que transformen el paisaje urbano.',
        color: '#9D9D9C',
        icon: '🏗️',
        count: sampleJobPostings.filter(j => j.category === 'arquitectura-diseño').length
      },
      {
        id: 'operaciones-control',
        name: 'Operaciones y Control',
        slug: 'operaciones-control',
        description: 'Garantizar la calidad, seguridad y eficiencia en todas las fases del proyecto.',
        color: '#646363',
        icon: '🔧',
        count: sampleJobPostings.filter(j => j.category === 'operaciones-control').length
      },
      {
        id: 'administracion-soporte',
        name: 'Administración y Soporte',
        slug: 'administracion-soporte',
        description: 'Brindar soporte estratégico y administrativo para el éxito de los proyectos.',
        color: '#D0D0D0',
        icon: '📊',
        count: sampleJobPostings.filter(j => j.category === 'administracion-soporte').length
      }
    ];

    cache.set(cacheKey, localCategories);
    return localCategories;
  }

  /**
   * Obtiene trabajos con filtros opcionales
   */
  static async getJobs(filters: CareerFilters & {
    limit?: number;
    offset?: number;
  } = {}): Promise<JobPosting[]> {
    const cacheKey = `careers_jobs_${JSON.stringify(filters)}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    // Datos locales con filtros
    let filteredJobs = [...sampleJobPostings].filter(job => job.status === 'active');

    if (filters.category) {
      filteredJobs = filteredJobs.filter(job => job.category === filters.category);
    }

    if (filters.featured !== undefined) {
      filteredJobs = filteredJobs.filter(job => job.featured === filters.featured);
    }

    if (filters.type) {
      filteredJobs = filteredJobs.filter(job => job.type === filters.type);
    }

    if (filters.level) {
      filteredJobs = filteredJobs.filter(job => job.level === filters.level);
    }

    if (filters.remote !== undefined) {
      filteredJobs = filteredJobs.filter(job => job.remote === filters.remote);
    }

    if (filters.location) {
      filteredJobs = filteredJobs.filter(job => 
        job.location.city.toLowerCase().includes(filters.location!.toLowerCase()) ||
        job.location.region.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filteredJobs = filteredJobs.filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.department.toLowerCase().includes(query) ||
        job.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Ordenar por fecha (más recientes primero)
    filteredJobs.sort((a, b) => b.postedAt.getTime() - a.postedAt.getTime());

    // Aplicar paginación
    if (filters.offset) {
      filteredJobs = filteredJobs.slice(filters.offset);
    }
    
    if (filters.limit) {
      filteredJobs = filteredJobs.slice(0, filters.limit);
    }

    cache.set(cacheKey, filteredJobs);
    return filteredJobs;
  }

  /**
   * Obtiene un trabajo por slug
   */
  static async getJobBySlug(slug: string): Promise<JobPosting | null> {
    const cacheKey = `career_job_${slug}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    // Datos locales
    const localJob = sampleJobPostings.find(job => job.slug === slug) || null;
    if (localJob) {
      cache.set(cacheKey, localJob);
    }
    return localJob;
  }

  /**
   * Busca trabajos por texto
   */
  static async searchJobs(query: string): Promise<JobPosting[]> {
    return this.getJobs({ searchQuery: query });
  }

  /**
   * Obtiene trabajos relacionados
   */
  static async getRelatedJobs(job: JobPosting, limit = 3): Promise<JobPosting[]> {
    const cacheKey = `related_jobs_${job.id}_${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    // Obtener trabajos de la misma categoría excluyendo el actual
    const categoryJobs = await this.getJobs({ 
      category: job.category,
      limit: limit + 1 
    });

    const related = categoryJobs
      .filter(j => j.id !== job.id)
      .slice(0, limit);

    // Si no hay suficientes, completar con trabajos de otras categorías
    if (related.length < limit) {
      const otherJobs = await this.getJobs({ 
        limit: limit - related.length + 5 
      });
      
      const additional = otherJobs
        .filter(j => j.id !== job.id && !related.find(r => r.id === j.id))
        .slice(0, limit - related.length);
      
      related.push(...additional);
    }

    cache.set(cacheKey, related);
    return related;
  }

  /**
   * Obtiene estadísticas de careers
   */
  static async getStats(): Promise<CareersStats> {
    const cacheKey = 'careers_stats';
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    // Estadísticas locales
    const localStats = getCareersStats();
    cache.set(cacheKey, localStats);
    return localStats;
  }

  /**
   * Obtiene información del sistema
   */
  static async getSystemInfo(): Promise<CareersSystemInfo> {
    const stats = await this.getStats();

    return {
      dataSource: 'local',
      directusAvailable: false,
      lastCheck: new Date(),
      apiEndpoint: '',
      totalJobs: stats.totalPositions,
      totalApplications: stats.totalApplications,
      cacheStatus: 'active'
    };
  }

  /**
   * Obtiene beneficios disponibles
   */
  static async getBenefits(): Promise<JobBenefit[]> {
    const cacheKey = 'job_benefits';
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    // Beneficios locales
    cache.set(cacheKey, sampleBenefits);
    return sampleBenefits;
  }

  /**
   * Limpia cache
   */
  static clearCache(): void {
    cache.clear();
    this.lastDirectusCheck = 0;
  }
}