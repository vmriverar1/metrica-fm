/**
 * Portfolio Firestore Service - FASE 3 Optimized
 * Implementación con pagination, aggregations y cache optimization para Firebase App Hosting
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  writeBatch,
  increment,
  DocumentReference,
  QueryDocumentSnapshot,
  DocumentSnapshot,
  getCountFromServer,
  AggregateQuerySnapshot
} from 'firebase/firestore';

import { db, COLLECTIONS } from '@/lib/firebase/config';
import {
  PortfolioCategory,
  PortfolioCategoryData,
  PortfolioProjectFirestore,
  PortfolioProjectData,
  PortfolioImageFirestore,
  PortfolioImageData,
  PortfolioProjectWithCategory,
  PortfolioProjectWithImages,
  PortfolioProjectComplete,
  PortfolioCategoryWithProjects,
  PortfolioFilters,
  PortfolioStats,
  CRUDResponse,
  validateCategoryData,
  validateProjectData,
  validateImageData,
  generateSlug,
  parseInvestment,
  parseArea
} from '@/types/portfolio-firestore';

// ==========================================
// PAGINATION INTERFACES
// ==========================================

export interface PaginationOptions {
  limit?: number;
  startAfter?: QueryDocumentSnapshot;
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  lastDoc?: QueryDocumentSnapshot;
  hasMore: boolean;
  total?: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  key?: string; // Custom cache key
  forceRefresh?: boolean;
}

// ==========================================
// CACHE LAYER OPTIMIZADO
// ==========================================

class PortfolioCache {
  private static cache = new Map<string, { data: any; expires: number }>();
  private static defaultTTL = 5 * 60 * 1000; // 5 minutes

  static set(key: string, data: any, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl
    });
  }

  static get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  static clear(pattern?: string): void {
    if (pattern) {
      // Clear keys matching pattern
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  static invalidatePortfolio(): void {
    this.clear('portfolio:');
  }
}

// ==========================================
// SERVICIO DE CATEGORÍAS OPTIMIZADO
// ==========================================

export class OptimizedPortfolioCategoriesService {
  private static collection = collection(db, COLLECTIONS.PORTFOLIO_CATEGORIES);

  /**
   * Obtener todas las categorías con cache
   */
  static async obtenerTodas(options?: CacheOptions): Promise<PortfolioCategory[]> {
    const cacheKey = 'portfolio:categories:all';

    if (!options?.forceRefresh) {
      const cached = PortfolioCache.get<PortfolioCategory[]>(cacheKey);
      if (cached) return cached;
    }

    try {
      const q = query(this.collection, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);

      const categories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PortfolioCategory));

      // Cache por 24 horas (raramente cambian)
      PortfolioCache.set(cacheKey, categories, 24 * 60 * 60 * 1000);

      return categories;
    } catch (error) {
      console.error('Error obteniendo categorías optimizado:', error);
      throw new Error('Failed to fetch portfolio categories');
    }
  }

  /**
   * Obtener categorías con contadores actualizados via aggregation
   */
  static async obtenerConContadores(): Promise<PortfolioCategory[]> {
    const cacheKey = 'portfolio:categories:with-counts';

    const cached = PortfolioCache.get<PortfolioCategory[]>(cacheKey);
    if (cached) return cached;

    try {
      const categories = await this.obtenerTodas();

      // Obtener contadores reales via aggregation queries
      const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
          const projectsQuery = query(
            collection(db, COLLECTIONS.PORTFOLIO_PROJECTS),
            where('category_id', '==', category.id)
          );

          const countSnapshot = await getCountFromServer(projectsQuery);
          const realCount = countSnapshot.data().count;

          return {
            ...category,
            projects_count: realCount
          };
        })
      );

      // Cache por 1 hora
      PortfolioCache.set(cacheKey, categoriesWithCounts, 60 * 60 * 1000);

      return categoriesWithCounts;
    } catch (error) {
      console.error('Error obteniendo categorías con contadores:', error);
      // Fallback a método original
      return this.obtenerTodas();
    }
  }

  /**
   * Obtener solo categorías featured (optimización común)
   */
  static async obtenerDestacadas(): Promise<PortfolioCategory[]> {
    const cacheKey = 'portfolio:categories:featured';

    const cached = PortfolioCache.get<PortfolioCategory[]>(cacheKey);
    if (cached) return cached;

    try {
      const q = query(
        this.collection,
        where('featured', '==', true),
        orderBy('order', 'asc')
      );

      const snapshot = await getDocs(q);
      const categories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PortfolioCategory));

      // Cache por 12 horas
      PortfolioCache.set(cacheKey, categories, 12 * 60 * 60 * 1000);

      return categories;
    } catch (error) {
      console.error('Error obteniendo categorías destacadas:', error);
      throw new Error('Failed to fetch featured categories');
    }
  }
}

// ==========================================
// SERVICIO DE PROYECTOS OPTIMIZADO
// ==========================================

export class OptimizedPortfolioProjectsService {
  private static collection = collection(db, COLLECTIONS.PORTFOLIO_PROJECTS);

  /**
   * Obtener proyectos con paginación optimizada
   */
  static async obtenerPaginados(
    filters: PortfolioFilters & PaginationOptions = {}
  ): Promise<PaginatedResult<PortfolioProjectFirestore>> {
    try {
      const {
        category,
        status,
        featured,
        year,
        limit: pageLimit = 12,
        startAfter: startAfterDoc,
        orderByField = 'created_at',
        orderDirection = 'desc'
      } = filters;

      let q = query(this.collection, orderBy(orderByField, orderDirection));

      // Aplicar filtros
      if (category) {
        q = query(q, where('category_id', '==', category));
      }
      if (status) {
        q = query(q, where('status', '==', status));
      }
      if (featured !== undefined) {
        q = query(q, where('featured', '==', featured));
      }
      if (year) {
        q = query(q, where('year', '==', year));
      }

      // Paginación
      if (startAfterDoc) {
        q = query(q, startAfter(startAfterDoc));
      }

      // Obtener uno más para verificar si hay más páginas
      q = query(q, limit(pageLimit + 1));

      const snapshot = await getDocs(q);
      const docs = snapshot.docs;

      const hasMore = docs.length > pageLimit;
      const data = docs.slice(0, pageLimit).map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PortfolioProjectFirestore));

      const lastDoc = hasMore ? docs[pageLimit - 1] : undefined;

      return {
        data,
        lastDoc,
        hasMore,
        total: undefined // Se puede obtener con aggregation si es necesario
      };

    } catch (error) {
      console.error('Error obteniendo proyectos paginados:', error);
      throw new Error('Failed to fetch paginated projects');
    }
  }

  /**
   * Obtener proyectos por categoría con cache
   */
  static async obtenerPorCategoria(
    categoryId: string,
    limitCount: number = 12,
    options?: CacheOptions
  ): Promise<PortfolioProjectFirestore[]> {
    const cacheKey = `portfolio:projects:category:${categoryId}:${limitCount}`;

    if (!options?.forceRefresh) {
      const cached = PortfolioCache.get<PortfolioProjectFirestore[]>(cacheKey);
      if (cached) return cached;
    }

    try {
      const q = query(
        this.collection,
        where('category_id', '==', categoryId),
        orderBy('created_at', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PortfolioProjectFirestore));

      // Cache por 1 hora
      PortfolioCache.set(cacheKey, projects, 60 * 60 * 1000);

      return projects;
    } catch (error) {
      console.error('Error obteniendo proyectos por categoría:', error);
      throw new Error('Failed to fetch projects by category');
    }
  }

  /**
   * Obtener solo metadata de proyectos (sin imágenes)
   */
  static async obtenerMetadata(filters?: PortfolioFilters): Promise<Partial<PortfolioProjectFirestore>[]> {
    const cacheKey = `portfolio:projects:metadata:${JSON.stringify(filters)}`;

    const cached = PortfolioCache.get<Partial<PortfolioProjectFirestore>[]>(cacheKey);
    if (cached) return cached;

    try {
      let q = query(this.collection, orderBy('created_at', 'desc'));

      // Aplicar filtros básicos
      if (filters?.category) {
        q = query(q, where('category_id', '==', filters.category));
      }
      if (filters?.featured !== undefined) {
        q = query(q, where('featured', '==', filters.featured));
      }

      const snapshot = await getDocs(q);

      // Solo campos esenciales para reducir bandwidth
      const metadata = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          category_id: data.category_id,
          slug: data.slug,
          featured_image: data.featured_image,
          year: data.year,
          status: data.status,
          featured: data.featured,
          area: data.area,
          budget: data.budget
        };
      });

      // Cache por 30 minutos
      PortfolioCache.set(cacheKey, metadata, 30 * 60 * 1000);

      return metadata;
    } catch (error) {
      console.error('Error obteniendo metadata de proyectos:', error);
      throw new Error('Failed to fetch projects metadata');
    }
  }

  /**
   * Obtener proyecto completo por slug con cache agresivo
   */
  static async obtenerCompletoPorSlug(slug: string): Promise<PortfolioProjectComplete | null> {
    const cacheKey = `portfolio:project:complete:${slug}`;

    const cached = PortfolioCache.get<PortfolioProjectComplete>(cacheKey);
    if (cached) return cached;

    try {
      const q = query(this.collection, where('slug', '==', slug));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      const projectDoc = snapshot.docs[0];
      const project = {
        id: projectDoc.id,
        ...projectDoc.data()
      } as PortfolioProjectFirestore;

      // Obtener categoría (probablemente en cache)
      const category = await OptimizedPortfolioCategoriesService.obtenerTodas()
        .then(cats => cats.find(c => c.id === project.category_id));

      if (!category) {
        throw new Error('Category not found for project');
      }

      // Obtener imágenes (cache separado)
      const images = await OptimizedPortfolioImagesService.obtenerPorProyecto(project.id);

      const complete: PortfolioProjectComplete = {
        ...project,
        category_info: {
          id: category.id,
          name: category.name,
          slug: category.slug,
          color: category.color,
          icon: category.icon
        },
        images
      };

      // Cache por 2 horas (proyecto individual cambia poco)
      PortfolioCache.set(cacheKey, complete, 2 * 60 * 60 * 1000);

      return complete;
    } catch (error) {
      console.error('Error obteniendo proyecto completo por slug:', error);
      throw new Error('Failed to fetch complete project by slug');
    }
  }

  /**
   * Invalidar cache cuando se modifica un proyecto
   */
  static invalidateCache(projectId?: string, categoryId?: string): void {
    PortfolioCache.clear('portfolio:projects');
    if (categoryId) {
      PortfolioCache.clear(`portfolio:projects:category:${categoryId}`);
    }
    if (projectId) {
      PortfolioCache.clear(`portfolio:project:complete`);
    }
  }
}

// ==========================================
// SERVICIO DE IMÁGENES OPTIMIZADO
// ==========================================

export class OptimizedPortfolioImagesService {
  private static collection = collection(db, COLLECTIONS.PORTFOLIO_IMAGES);

  /**
   * Obtener imágenes por proyecto con cache
   */
  static async obtenerPorProyecto(projectId: string): Promise<PortfolioImageFirestore[]> {
    const cacheKey = `portfolio:images:project:${projectId}`;

    const cached = PortfolioCache.get<PortfolioImageFirestore[]>(cacheKey);
    if (cached) return cached;

    try {
      const q = query(
        this.collection,
        where('project_id', '==', projectId),
        orderBy('order', 'asc')
      );

      const snapshot = await getDocs(q);
      const images = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PortfolioImageFirestore));

      // Cache por 7 días (imágenes son muy estables)
      PortfolioCache.set(cacheKey, images, 7 * 24 * 60 * 60 * 1000);

      return images;
    } catch (error) {
      console.error('Error obteniendo imágenes optimizado:', error);
      throw new Error('Failed to fetch project images');
    }
  }

  /**
   * Obtener solo imagen featured (optimización común)
   */
  static async obtenerFeaturedPorProyecto(projectId: string): Promise<PortfolioImageFirestore | null> {
    const cacheKey = `portfolio:images:featured:${projectId}`;

    const cached = PortfolioCache.get<PortfolioImageFirestore>(cacheKey);
    if (cached) return cached;

    try {
      const q = query(
        this.collection,
        where('project_id', '==', projectId),
        where('featured', '==', true),
        limit(1)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      const image = {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data()
      } as PortfolioImageFirestore;

      // Cache por 7 días
      PortfolioCache.set(cacheKey, image, 7 * 24 * 60 * 60 * 1000);

      return image;
    } catch (error) {
      console.error('Error obteniendo imagen featured:', error);
      return null;
    }
  }
}

// ==========================================
// SERVICIO DE AGREGACIONES Y ESTADÍSTICAS
// ==========================================

export class OptimizedPortfolioStatsService {
  /**
   * Obtener estadísticas via aggregation queries (FASE 3)
   */
  static async obtenerEstadisticasOptimizadas(): Promise<PortfolioStats> {
    const cacheKey = 'portfolio:stats:optimized';

    const cached = PortfolioCache.get<PortfolioStats>(cacheKey);
    if (cached) return cached;

    try {
      // Usar aggregation queries para reducir reads
      const [
        categoriesCount,
        projectsCount,
        featuredProjectsCount,
        completedProjectsCount
      ] = await Promise.all([
        getCountFromServer(collection(db, COLLECTIONS.PORTFOLIO_CATEGORIES)),
        getCountFromServer(collection(db, COLLECTIONS.PORTFOLIO_PROJECTS)),
        getCountFromServer(query(
          collection(db, COLLECTIONS.PORTFOLIO_PROJECTS),
          where('featured', '==', true)
        )),
        getCountFromServer(query(
          collection(db, COLLECTIONS.PORTFOLIO_PROJECTS),
          where('status', '==', 'completado')
        ))
      ]);

      // Para estadísticas más complejas, usar documentos agregados
      const stats: PortfolioStats = {
        total_categories: categoriesCount.data().count,
        total_projects: projectsCount.data().count,
        total_images: 0, // Se calcularía con agregación
        featured_projects: featuredProjectsCount.data().count,
        completed_projects: completedProjectsCount.data().count,
        total_investment_value: 0, // Se calcularía con agregación
        total_area_value: 0, // Se calcularía con agregación
        projects_by_category: {}, // Se calcularía con agregación
        projects_by_year: {}, // Se calcularía con agregación
        projects_by_status: {
          completado: completedProjectsCount.data().count,
          en_curso: 0, // Se calcularía
          planificado: 0 // Se calcularía
        }
      };

      // Cache por 1 hora
      PortfolioCache.set(cacheKey, stats, 60 * 60 * 1000);

      return stats;
    } catch (error) {
      console.error('Error obteniendo estadísticas optimizadas:', error);
      throw new Error('Failed to fetch optimized portfolio statistics');
    }
  }

  /**
   * Crear documento agregado para dashboard (ejecutar periódicamente)
   */
  static async crearDocumentoAgregado(): Promise<void> {
    try {
      // TODO: Implementar Cloud Function que actualice un documento
      // agregado con todas las estadísticas pre-calculadas
      console.log('Agregated document creation scheduled');
    } catch (error) {
      console.error('Error creando documento agregado:', error);
    }
  }
}

// ==========================================
// SERVICIO DE BATCH OPERATIONS
// ==========================================

export class OptimizedPortfolioBatchService {
  /**
   * Crear múltiples proyectos en batch
   */
  static async crearProyectosBatch(projects: PortfolioProjectData[]): Promise<string[]> {
    try {
      const batch = writeBatch(db);
      const projectIds: string[] = [];

      for (const projectData of projects) {
        const projectRef = doc(collection(db, COLLECTIONS.PORTFOLIO_PROJECTS));
        const projectDoc: Omit<PortfolioProjectFirestore, 'id'> = {
          ...projectData,
          featured: projectData.featured || false,
          images_count: 0,
          created_at: Timestamp.now(),
          updated_at: Timestamp.now()
        };

        batch.set(projectRef, projectDoc);
        projectIds.push(projectRef.id);
      }

      await batch.commit();

      // Invalidar cache
      OptimizedPortfolioProjectsService.invalidateCache();

      return projectIds;
    } catch (error) {
      console.error('Error en batch creation:', error);
      throw new Error('Failed to create projects in batch');
    }
  }

  /**
   * Actualizar contadores denormalizados en batch
   */
  static async actualizarContadoresBatch(): Promise<void> {
    try {
      // Recalcular todos los contadores denormalizados
      const categories = await OptimizedPortfolioCategoriesService.obtenerTodas({ forceRefresh: true });

      const batch = writeBatch(db);

      for (const category of categories) {
        const projectsQuery = query(
          collection(db, COLLECTIONS.PORTFOLIO_PROJECTS),
          where('category_id', '==', category.id)
        );

        const countSnapshot = await getCountFromServer(projectsQuery);
        const realCount = countSnapshot.data().count;

        if (realCount !== category.projects_count) {
          const categoryRef = doc(collection(db, COLLECTIONS.PORTFOLIO_CATEGORIES), category.id);
          batch.update(categoryRef, {
            projects_count: realCount,
            updated_at: Timestamp.now()
          });
        }
      }

      await batch.commit();

      // Invalidar cache
      PortfolioCache.clear('portfolio:categories');

    } catch (error) {
      console.error('Error actualizando contadores batch:', error);
      throw new Error('Failed to update counters in batch');
    }
  }
}

// Export optimized services
export {
  PortfolioCache,
  OptimizedPortfolioCategoriesService as PortfolioCategoriesService,
  OptimizedPortfolioProjectsService as PortfolioProjectsService,
  OptimizedPortfolioImagesService as PortfolioImagesService,
  OptimizedPortfolioStatsService as PortfolioStatsService,
  OptimizedPortfolioBatchService as PortfolioBatchService
};