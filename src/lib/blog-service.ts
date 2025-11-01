/**
 * BlogService - Sistema híbrido para gestión de blog
 * Sigue el mismo patrón exitoso de PortfolioService
 * Detecta automáticamente si usar Directus o datos locales
 */

import { 
  BlogPost, 
  BlogCategory as BlogCategoryType, 
  Author, 
  BlogStats, 
  BlogFilters,
  sampleBlogPosts,
  sampleAuthors,
  getBlogPost,
  getBlogPostsByCategory,
  getFeaturedBlogPosts,
  getBlogStats,
  getBlogCategoryLabel
} from '@/types/blog';

// Interfaces extendidas para Directus
export interface DirectusBlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: DirectusAuthor;
  published_at: string;
  updated_at?: string;
  reading_time: number;
  excerpt: string;
  content: string;
  featured_image: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string[];
  featured: boolean;
  status: 'draft' | 'published' | 'archived';
  views?: number;
  likes?: number;
  tags: DirectusBlogTag[];
}

export interface DirectusAuthor {
  id: string;
  name: string;
  slug: string;
  role: string;
  bio: string;
  avatar: string;
  email?: string;
  linkedin?: string;
  expertise: string[];
  active: boolean;
}

export interface DirectusBlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
}

export interface DirectusBlogTag {
  id: string;
  name: string;
  slug: string;
  color: string;
}

// Extensión de tipos locales para compatibilidad con Directus
export interface BlogServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon?: string;
  count: number; // Calculado dinámicamente
}

export interface BlogSystemInfo {
  dataSource: 'local' | 'directus';
  directusAvailable: boolean;
  lastCheck: Date;
  apiEndpoint: string;
  totalPosts: number;
  totalAuthors: number;
  cacheStatus: 'active' | 'expired' | 'disabled';
}

/**
 * Cache simple para evitar verificaciones frecuentes
 */
class BlogServiceCache {
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

const cache = new BlogServiceCache();

/**
 * BlogService - Servicio principal híbrido
 */
export class BlogService {
  private static lastDirectusCheck = 0;
  private static directusAvailable = false;

  /**
   * Verifica si Firestore está disponible
   */
  private static async checkFirestoreAvailability(): Promise<boolean> {
    try {
      const { isDemoMode } = await import('@/lib/firebase/config');
      if (isDemoMode) return false; // En modo demo usar datos locales
      
      // Intentar obtener estadísticas básicas de Firestore
      const { NewsletterStatsService } = await import('@/lib/firestore/newsletter-service');
      await NewsletterStatsService.obtenerEstadisticas();
      return true;
    } catch (error) {
      console.warn('Firestore no disponible, usando datos locales:', error);
      return false;
    }
  }

  /**
   * Convierte autor de Firestore a formato local
   */
  private static convertFirestoreAuthor(firestoreAuthor: any): Author {
    return {
      id: firestoreAuthor.id,
      name: firestoreAuthor.name,
      role: firestoreAuthor.role,
      bio: firestoreAuthor.bio,
      avatar: firestoreAuthor.avatar,
      email: firestoreAuthor.email,
      linkedin: firestoreAuthor.social?.linkedin
    };
  }

  /**
   * Convierte autor de Directus a formato local (para compatibilidad)
   */
  private static convertDirectusAuthor(directusAuthor: DirectusAuthor): Author {
    return {
      id: directusAuthor.id,
      name: directusAuthor.name,
      role: directusAuthor.role,
      bio: directusAuthor.bio,
      avatar: directusAuthor.avatar,
      email: directusAuthor.email,
      linkedin: directusAuthor.linkedin
    };
  }

  /**
   * Convierte artículo de Firestore a formato local
   */
  private static convertFirestoreBlogPost(firestorePost: any): BlogPost {
    return {
      id: firestorePost.id,
      title: firestorePost.title,
      slug: firestorePost.slug,
      category: firestorePost.categoria?.slug as BlogCategoryType,
      tags: firestorePost.tags || [],
      author: this.convertFirestoreAuthor(firestorePost.autor),
      publishedAt: firestorePost.published_date?.toDate() || new Date(),
      updatedAt: firestorePost.updated_at?.toDate(),
      readingTime: firestorePost.reading_time,
      excerpt: firestorePost.excerpt,
      content: firestorePost.content,
      featuredImage: firestorePost.featured_image,
      seo: {
        metaTitle: firestorePost.seo?.meta_title || firestorePost.title,
        metaDescription: firestorePost.seo?.meta_description || firestorePost.excerpt,
        keywords: firestorePost.seo?.keywords || [],
        schemaType: 'Article' as const
      },
      featured: firestorePost.featured,
      views: 0, // Por ahora
      likes: 0, // Por ahora
      status: firestorePost.status === 'published' ? 'published' : 'draft'
    };
  }

  /**
   * Convierte post de Directus a formato local (para compatibilidad)
   */
  private static convertDirectusBlogPost(directusPost: DirectusBlogPost): BlogPost {
    return {
      id: directusPost.id,
      title: directusPost.title,
      slug: directusPost.slug,
      category: directusPost.category as BlogCategoryType,
      tags: directusPost.tags.map(tag => tag.name),
      author: this.convertDirectusAuthor(directusPost.author),
      publishedAt: new Date(directusPost.published_at),
      updatedAt: directusPost.updated_at ? new Date(directusPost.updated_at) : undefined,
      readingTime: directusPost.reading_time,
      excerpt: directusPost.excerpt,
      content: directusPost.content,
      featuredImage: directusPost.featured_image,
      seo: {
        metaTitle: directusPost.seo_title,
        metaDescription: directusPost.seo_description,
        keywords: directusPost.seo_keywords,
        schemaType: 'Article' as const
      },
      featured: directusPost.featured,
      views: directusPost.views,
      likes: directusPost.likes,
      status: directusPost.status
    };
  }

  /**
   * Obtiene todas las categorías de blog
   */
  static async getCategories(): Promise<BlogServiceCategory[]> {
    const cacheKey = 'blog_categories';
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      // Intentar obtener de Firestore primero
      const firestoreAvailable = await this.checkFirestoreAvailability();
      if (firestoreAvailable) {
        const { CategoriasService, ArticulosService } = await import('@/lib/firestore/newsletter-service');
        const categorias = await CategoriasService.listarTodas();
        
        // Convertir a formato BlogServiceCategory y calcular counts
        const firestoreCategories: BlogServiceCategory[] = await Promise.all(
          categorias.map(async (cat) => {
            // Contar artículos de esta categoría
            const articulosCount = await ArticulosService.contarPorCategoria(cat.id);
            return {
              id: cat.id,
              name: cat.name,
              slug: cat.slug,
              description: cat.description,
              color: cat.color,
              icon: cat.icon,
              count: articulosCount
            };
          })
        );

        cache.set(cacheKey, firestoreCategories);
        return firestoreCategories;
      }
    } catch (error) {
      console.warn('Error cargando categorías de Firestore:', error);
    }

    // Fallback: categorías locales basadas en posts
    const localCategories: BlogServiceCategory[] = [
      {
        id: 'industria-tendencias',
        name: 'Industria & Tendencias',
        slug: 'industria-tendencias',
        description: 'Análisis de mercado inmobiliario, tendencias en construcción sostenible e innovaciones tecnológicas del sector.',
        color: '#00A8E8',
        icon: '📈',
        count: sampleBlogPosts.filter(p => p.category === 'industria-tendencias').length
      },
      {
        id: 'casos-estudio',
        name: 'Casos de Estudio',
        slug: 'casos-estudio',
        description: 'Deep dives de proyectos emblemáticos con lecciones aprendidas, métricas reales y testimonios de clientes.',
        color: '#003F6F',
        icon: '🔍',
        count: sampleBlogPosts.filter(p => p.category === 'casos-estudio').length
      },
      {
        id: 'guias-tecnicas',
        name: 'Guías Técnicas',
        slug: 'guias-tecnicas',
        description: 'Metodologías de gestión de proyectos, guías de cumplimiento normativo y herramientas especializadas.',
        color: '#9D9D9C',
        icon: '⚙️',
        count: sampleBlogPosts.filter(p => p.category === 'guias-tecnicas').length
      },
      {
        id: 'liderazgo-vision',
        name: 'Liderazgo & Visión',
        slug: 'liderazgo-vision',
        description: 'Insights de líderes, filosofía empresarial, predicciones de mercado y participación en eventos del sector.',
        color: '#D0D0D0',
        icon: '👥',
        count: sampleBlogPosts.filter(p => p.category === 'liderazgo-vision').length
      }
    ];

    cache.set(cacheKey, localCategories);
    return localCategories;
  }

  /**
   * Obtiene posts con filtros opcionales
   */
  static async getPosts(filters: BlogFilters & {
    limit?: number;
    offset?: number;
  } = {}): Promise<BlogPost[]> {
    const cacheKey = `blog_posts_${JSON.stringify(filters)}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      // Intentar obtener de Firestore primero
      const firestoreAvailable = await this.checkFirestoreAvailability();
      if (firestoreAvailable) {
        const { ArticulosService } = await import('@/lib/firestore/newsletter-service');
        
        // Convertir filtros BlogFilters a NewsletterFilters
        const newsletterFilters: any = {
          categoria_slug: filters.category,
          destacado: filters.featured,
          estado: 'published',
          busqueda: filters.searchQuery,
          limite: filters.limit,
          offset: filters.offset
        };

        // Filtro por autor si se especifica
        if (filters.author) {
          newsletterFilters.autor_nombre = filters.author;
        }

        const articulos = await ArticulosService.listarTodos(newsletterFilters);
        const blogPosts = articulos.map(articulo => this.convertFirestoreBlogPost(articulo));

        cache.set(cacheKey, blogPosts);
        return blogPosts;
      }
    } catch (error) {
      console.warn('Error cargando posts de Firestore:', error);
    }

    // Fallback: datos locales con filtros
    let filteredPosts = [...sampleBlogPosts].filter(post => post.status === 'published');

    if (filters.category) {
      filteredPosts = filteredPosts.filter(post => post.category === filters.category);
    }

    if (filters.featured !== undefined) {
      filteredPosts = filteredPosts.filter(post => post.featured === filters.featured);
    }

    if (filters.author) {
      filteredPosts = filteredPosts.filter(post => 
        post.author.name.toLowerCase().includes(filters.author!.toLowerCase())
      );
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filteredPosts = filteredPosts.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Ordenar por fecha (más recientes primero)
    filteredPosts.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

    // Aplicar paginación
    if (filters.offset) {
      filteredPosts = filteredPosts.slice(filters.offset);
    }
    
    if (filters.limit) {
      filteredPosts = filteredPosts.slice(0, filters.limit);
    }

    cache.set(cacheKey, filteredPosts);
    return filteredPosts;
  }

  /**
   * Obtiene un post por slug
   */
  static async getPostBySlug(slug: string): Promise<BlogPost | null> {
    const cacheKey = `blog_post_${slug}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      // Intentar obtener de Firestore primero
      const firestoreAvailable = await this.checkFirestoreAvailability();
      if (firestoreAvailable) {
        const { ArticulosService } = await import('@/lib/firestore/newsletter-service');
        const articulo = await ArticulosService.obtenerPorSlug(slug);
        if (articulo) {
          const blogPost = this.convertFirestoreBlogPost(articulo);
          cache.set(cacheKey, blogPost);
          return blogPost;
        }
      }
    } catch (error) {
      console.warn('Error cargando post de Firestore:', error);
    }

    // Fallback: datos locales
    const localPost = getBlogPost(slug);
    if (localPost) {
      cache.set(cacheKey, localPost);
    }
    return localPost;
  }

  /**
   * Obtiene autores
   */
  static async getAuthors(): Promise<Author[]> {
    const cacheKey = 'blog_authors';
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      // Intentar obtener de Firestore primero
      const firestoreAvailable = await this.checkFirestoreAvailability();
      if (firestoreAvailable) {
        const { AutoresService } = await import('@/lib/firestore/newsletter-service');
        const autores = await AutoresService.listarTodos();
        const authors = autores.map(autor => this.convertFirestoreAuthor(autor));
        
        cache.set(cacheKey, authors);
        return authors;
      }
    } catch (error) {
      console.warn('Error cargando autores de Firestore:', error);
    }

    // Fallback: datos locales
    cache.set(cacheKey, sampleAuthors);
    return sampleAuthors;
  }

  /**
   * Busca posts por texto
   */
  static async searchPosts(query: string): Promise<BlogPost[]> {
    return this.getPosts({ searchQuery: query });
  }

  /**
   * Obtiene posts relacionados
   */
  static async getRelatedPosts(post: BlogPost, limit = 3): Promise<BlogPost[]> {
    const cacheKey = `related_posts_${post.id}_${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    // Obtener posts de la misma categoría excluyendo el actual
    const categoryPosts = await this.getPosts({ 
      category: post.category,
      limit: limit + 1 
    });

    const related = categoryPosts
      .filter(p => p.id !== post.id)
      .slice(0, limit);

    // Si no hay suficientes, completar con posts de otras categorías
    if (related.length < limit) {
      const otherPosts = await this.getPosts({ 
        limit: limit - related.length + 5 
      });
      
      const additional = otherPosts
        .filter(p => p.id !== post.id && !related.find(r => r.id === p.id))
        .slice(0, limit - related.length);
      
      related.push(...additional);
    }

    cache.set(cacheKey, related);
    return related;
  }

  /**
   * Obtiene estadísticas del blog
   */
  static async getStats(): Promise<BlogStats> {
    const cacheKey = 'blog_stats';
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      // Intentar obtener de Firestore primero
      const firestoreAvailable = await this.checkFirestoreAvailability();
      if (firestoreAvailable) {
        const { NewsletterStatsService } = await import('@/lib/firestore/newsletter-service');
        const firestoreStats = await NewsletterStatsService.obtenerEstadisticas();
        
        // Convertir stats de Firestore a formato BlogStats
        const blogStats: BlogStats = {
          totalPosts: firestoreStats.totalArticulos || 0,
          publishedPosts: firestoreStats.articulosPublicados || 0,
          draftPosts: firestoreStats.articulosBorrador || 0,
          totalAuthors: firestoreStats.totalAutores || 0,
          totalCategories: firestoreStats.totalCategorias || 0,
          avgReadingTime: firestoreStats.tiempoPromedioLectura || 5,
          totalViews: 0, // Por implementar
          lastUpdated: new Date()
        };

        cache.set(cacheKey, blogStats);
        return blogStats;
      }
    } catch (error) {
      console.warn('Error cargando stats de Firestore:', error);
    }

    // Fallback: estadísticas locales
    const localStats = getBlogStats();
    cache.set(cacheKey, localStats);
    return localStats;
  }

  /**
   * Obtiene información del sistema
   */
  static async getSystemInfo(): Promise<BlogSystemInfo> {
    const stats = await this.getStats();
    
    // Determinar fuente de datos
    let dataSource: 'local' | 'directus' = 'local';
    let firestoreAvailable = false;
    
    try {
      firestoreAvailable = await this.checkFirestoreAvailability();
      if (firestoreAvailable) {
        dataSource = 'directus'; // Usamos 'directus' para mantener compatibilidad
      }
    } catch (error) {
      console.warn('Error verificando Firestore:', error);
    }

    return {
      dataSource,
      directusAvailable: firestoreAvailable, // En realidad es firestoreAvailable
      lastCheck: new Date(),
      apiEndpoint: firestoreAvailable ? 'firestore' : '',
      totalPosts: stats.totalPosts,
      totalAuthors: stats.totalAuthors,
      cacheStatus: 'active'
    };
  }

  /**
   * Limpia cache
   */
  static clearCache(): void {
    cache.clear();
    this.lastDirectusCheck = 0;
  }
}