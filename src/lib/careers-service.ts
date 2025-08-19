/**
 * CareersService - Sistema híbrido para gestión de careers/jobs
 * Sigue el mismo patrón exitoso de PortfolioService y BlogService
 * Detecta automáticamente si usar Directus o datos locales
 */

import { directus } from './directus';
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

// Interfaces extendidas para Directus
export interface DirectusJobPosting {
  id: string;
  title: string;
  slug: string;
  category: string;
  department: string;
  location: {
    city: string;
    region: string;
    country: string;
    remote: boolean;
    hybrid: boolean;
  };
  type: JobType;
  level: JobLevel;
  status: JobStatus;
  remote: boolean;
  experience: number;
  description: string;
  responsibilities: string[];
  requirements: any[];
  benefits: DirectusJobBenefit[];
  nice_to_have?: string[];
  salary: {
    min: number;
    max: number;
    currency: string;
    period: string;
    negotiable: boolean;
  };
  posted_at: string;
  deadline: string;
  created_at: string;
  tags: string[];
  featured: boolean;
  urgent: boolean;
  applicant_count: number;
  view_count: number;
  hiring_manager: {
    name: string;
    email: string;
    role: string;
  };
  seo_title: string;
  seo_description: string;
  seo_keywords: string[];
}

export interface DirectusJobBenefit {
  id: string;
  category: string;
  title: string;
  description: string;
  icon?: string;
}

export interface DirectusJobCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
}

// Extensión de tipos locales para compatibilidad con Directus
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
  dataSource: 'local' | 'directus';
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
 * CareersService - Servicio principal híbrido
 */
export class CareersService {
  private static lastDirectusCheck = 0;
  private static directusAvailable = false;

  /**
   * Verifica si Directus está disponible y tiene datos de careers
   */
  private static async checkDirectusAvailability(): Promise<boolean> {
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    // Cache check para evitar verificaciones frecuentes
    if (now - this.lastDirectusCheck < fiveMinutes) {
      return this.directusAvailable;
    }

    try {
      const health = await fetch(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/server/health`, {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' }
      });

      if (!health.ok) {
        this.directusAvailable = false;
        this.lastDirectusCheck = now;
        return false;
      }

      // Verificar si las collections de careers existen y tienen datos
      const categoriesResponse = await directus.request(
        // @ts-ignore - rest API call
        'GET', '/items/job_categories?limit=1'
      );

      const jobsResponse = await directus.request(
        // @ts-ignore - rest API call  
        'GET', '/items/job_postings?limit=1'
      );

      this.directusAvailable = categoriesResponse?.data?.length > 0 && jobsResponse?.data?.length > 0;
      this.lastDirectusCheck = now;

      if (this.directusAvailable) {
        console.log('💼 Directus careers collections disponibles');
      } else {
        console.log('📋 Usando datos locales de careers (fallback)');
      }

      return this.directusAvailable;
    } catch (error) {
      console.log('📋 Usando datos locales de careers (fallback)');
      this.directusAvailable = false;
      this.lastDirectusCheck = now;
      return false;
    }
  }

  /**
   * Convierte job posting de Directus a formato local
   */
  private static convertDirectusJobPosting(directusJob: DirectusJobPosting): JobPosting {
    return {
      id: directusJob.id,
      title: directusJob.title,
      slug: directusJob.slug,
      category: directusJob.category as JobCategory,
      department: directusJob.department,
      location: directusJob.location,
      type: directusJob.type,
      level: directusJob.level,
      status: directusJob.status,
      remote: directusJob.remote,
      experience: directusJob.experience,
      description: directusJob.description,
      responsibilities: directusJob.responsibilities,
      requirements: directusJob.requirements,
      benefits: directusJob.benefits.map(b => ({
        id: b.id,
        category: b.category as any,
        title: b.title,
        description: b.description,
        icon: b.icon
      })),
      niceToHave: directusJob.nice_to_have,
      salary: directusJob.salary,
      postedAt: new Date(directusJob.posted_at),
      deadline: new Date(directusJob.deadline),
      createdAt: new Date(directusJob.created_at),
      tags: directusJob.tags,
      featured: directusJob.featured,
      urgent: directusJob.urgent,
      applicantCount: directusJob.applicant_count,
      viewCount: directusJob.view_count,
      hiringManager: directusJob.hiring_manager,
      seo: {
        metaTitle: directusJob.seo_title,
        metaDescription: directusJob.seo_description,
        keywords: directusJob.seo_keywords
      }
    };
  }

  /**
   * Obtiene todas las categorías de trabajos
   */
  static async getCategories(): Promise<CareersServiceCategory[]> {
    const cacheKey = 'careers_categories';
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const directusAvailable = await this.checkDirectusAvailability();

      if (directusAvailable) {
        const categoriesResponse = await directus.request(
          // @ts-ignore
          'GET', '/items/job_categories'
        );

        const directusCategories: CareersServiceCategory[] = categoriesResponse.data.map((cat: DirectusJobCategory) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          color: cat.color,
          icon: cat.icon,
          count: 0 // Se calculará después
        }));

        cache.set(cacheKey, directusCategories);
        return directusCategories;
      }
    } catch (error) {
      console.error('Error fetching Directus job categories:', error);
    }

    // Fallback: categorías locales basadas en jobs
    const localCategories: CareersServiceCategory[] = [
      {
        id: 'gestion-direccion',
        name: 'Gestión y Dirección',
        slug: 'gestion-direccion',
        description: 'Liderar equipos y dirigir proyectos de construcción e infraestructura de gran escala.',
        color: '#E84E0F',
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

    try {
      const directusAvailable = await this.checkDirectusAvailability();

      if (directusAvailable) {
        // Construir query de Directus con filtros
        let query = '/items/job_postings?status=active';
        
        if (filters.category) {
          query += `&filter[category][_eq]=${filters.category}`;
        }
        
        if (filters.featured !== undefined) {
          query += `&filter[featured][_eq]=${filters.featured}`;
        }
        
        if (filters.type) {
          query += `&filter[type][_eq]=${filters.type}`;
        }

        if (filters.level) {
          query += `&filter[level][_eq]=${filters.level}`;
        }

        if (filters.remote !== undefined) {
          query += `&filter[remote][_eq]=${filters.remote}`;
        }
        
        if (filters.searchQuery) {
          query += `&search=${encodeURIComponent(filters.searchQuery)}`;
        }
        
        if (filters.limit) {
          query += `&limit=${filters.limit}`;
        }
        
        if (filters.offset) {
          query += `&offset=${filters.offset}`;
        }

        query += '&fields=*,benefits.*&sort=-posted_at';

        const jobsResponse = await directus.request('GET', query);
        const directusJobs = jobsResponse.data.map(this.convertDirectusJobPosting);

        cache.set(cacheKey, directusJobs);
        return directusJobs;
      }
    } catch (error) {
      console.error('Error fetching Directus job postings:', error);
    }

    // Fallback: datos locales con filtros
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

    try {
      const directusAvailable = await this.checkDirectusAvailability();

      if (directusAvailable) {
        const jobResponse = await directus.request(
          'GET', 
          `/items/job_postings?filter[slug][_eq]=${slug}&fields=*,benefits.*&limit=1`
        );

        if (jobResponse.data.length > 0) {
          const directusJob = this.convertDirectusJobPosting(jobResponse.data[0]);
          cache.set(cacheKey, directusJob);
          return directusJob;
        }
      }
    } catch (error) {
      console.error('Error fetching Directus job posting:', error);
    }

    // Fallback: datos locales
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

    try {
      const directusAvailable = await this.checkDirectusAvailability();

      if (directusAvailable) {
        // Obtener estadísticas de Directus
        const [jobsResponse, applicationsResponse] = await Promise.all([
          directus.request('GET', '/items/job_postings?aggregate[count]=*'),
          directus.request('GET', '/items/job_applications?aggregate[count]=*')
        ]);

        const stats: CareersStats = {
          totalPositions: jobsResponse.data[0]?.count || 0,
          totalCategories: 5,
          totalApplications: applicationsResponse.data[0]?.count || 0,
          averageSalary: 8500, // Calculado por separado
          topLocations: [{ location: 'Lima, Lima', count: 3 }],
          popularBenefits: [] // Calculado por separado
        };

        cache.set(cacheKey, stats);
        return stats;
      }
    } catch (error) {
      console.error('Error fetching Directus careers stats:', error);
    }

    // Fallback: estadísticas locales
    const localStats = getCareersStats();
    cache.set(cacheKey, localStats);
    return localStats;
  }

  /**
   * Obtiene información del sistema
   */
  static async getSystemInfo(): Promise<CareersSystemInfo> {
    const directusAvailable = await this.checkDirectusAvailability();
    const stats = await this.getStats();

    return {
      dataSource: directusAvailable ? 'directus' : 'local',
      directusAvailable,
      lastCheck: new Date(this.lastDirectusCheck),
      apiEndpoint: process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055',
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

    try {
      const directusAvailable = await this.checkDirectusAvailability();

      if (directusAvailable) {
        const benefitsResponse = await directus.request(
          'GET', 
          '/items/job_benefits'
        );

        const directusBenefits = benefitsResponse.data.map((b: DirectusJobBenefit) => ({
          id: b.id,
          category: b.category as any,
          title: b.title,
          description: b.description,
          icon: b.icon
        }));

        cache.set(cacheKey, directusBenefits);
        return directusBenefits;
      }
    } catch (error) {
      console.error('Error fetching Directus job benefits:', error);
    }

    // Fallback: beneficios locales
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