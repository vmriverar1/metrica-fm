/**
 * Portfolio Firestore Lite Service - FASE 3
 * Usando Firestore Lite para operaciones read-only (70% bundle size reduction)
 */

import {
  initializeApp,
  getApp,
  getApps
} from 'firebase/app';

import {
  getFirestore as getFirestoreLite,
  connectFirestoreEmulator,
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getCountFromServer,
  Firestore as FirestoreLite,
  DocumentSnapshot,
  QueryDocumentSnapshot
} from 'firebase/firestore/lite';

import { COLLECTIONS } from '@/lib/firebase/config';
import {
  PortfolioCategory,
  PortfolioProjectFirestore,
  PortfolioImageFirestore,
  PortfolioProjectComplete,
  PortfolioFilters,
  PaginatedResult,
  CacheOptions
} from '@/types/portfolio-firestore';

import { PortfolioCache } from './portfolio-service-optimized';

// ==========================================
// FIRESTORE LITE CONFIGURATION
// ==========================================

class FirestoreLiteConfig {
  private static db: FirestoreLite | null = null;

  static getDB(): FirestoreLite {
    if (this.db) return this.db;

    // Detectar si tenemos credenciales reales
    const hasRealCredentials = (
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      !process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes('sample') &&
      !process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes('AIzaSyCj8b3cY8t6-sample')
    );

    // Configuración de Firebase
    const firebaseConfig = {
      apiKey: hasRealCredentials ? process.env.NEXT_PUBLIC_FIREBASE_API_KEY : 'demo-api-key',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:demo123'
    };

    // Inicializar app si no existe
    let app;
    try {
      app = getApp('lite'); // App específica para Firestore Lite
    } catch {
      app = initializeApp(firebaseConfig, 'lite');
    }

    // Inicializar Firestore Lite
    this.db = getFirestoreLite(app);

    // Conectar al emulador si es necesario
    if (typeof window !== 'undefined' && (!hasRealCredentials || process.env.NODE_ENV === 'development')) {
      try {
        if (!hasRealCredentials) {
          connectFirestoreEmulator(this.db, 'localhost', 8080);
          console.log('🔥 Firestore Lite connected to emulator');
        }
      } catch (error) {
        console.log('Firestore Lite emulator connection info:', error);
      }
    }

    return this.db;
  }
}

// ==========================================
// PORTFOLIO LITE SERVICES (READ-ONLY)
// ==========================================

export class PortfolioLiteService {
  private static get db() {
    return FirestoreLiteConfig.getDB();
  }

  /**
   * Obtener todas las categorías (Lite)
   */
  static async obtenerCategorias(options?: CacheOptions): Promise<PortfolioCategory[]> {
    const cacheKey = 'portfolio:lite:categories:all';

    if (!options?.forceRefresh) {
      const cached = PortfolioCache.get<PortfolioCategory[]>(cacheKey);
      if (cached) return cached;
    }

    try {
      const categoriesRef = collection(this.db, COLLECTIONS.PORTFOLIO_CATEGORIES);
      const q = query(categoriesRef, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);

      const categories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PortfolioCategory));

      // Cache por 24 horas
      PortfolioCache.set(cacheKey, categories, 24 * 60 * 60 * 1000);

      return categories;
    } catch (error) {
      console.error('Error obteniendo categorías (Lite):', error);
      throw new Error('Failed to fetch categories with Firestore Lite');
    }
  }

  /**
   * Obtener categorías destacadas (Lite)
   */
  static async obtenerCategoriasDestacadas(): Promise<PortfolioCategory[]> {
    const cacheKey = 'portfolio:lite:categories:featured';

    const cached = PortfolioCache.get<PortfolioCategory[]>(cacheKey);
    if (cached) return cached;

    try {
      const categoriesRef = collection(this.db, COLLECTIONS.PORTFOLIO_CATEGORIES);
      const q = query(
        categoriesRef,
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
      console.error('Error obteniendo categorías destacadas (Lite):', error);
      throw new Error('Failed to fetch featured categories with Firestore Lite');
    }
  }

  /**
   * Obtener proyectos paginados (Lite)
   */
  static async obtenerProyectosPaginados(
    filters: PortfolioFilters & {
      limit?: number;
      startAfter?: QueryDocumentSnapshot;
    } = {}
  ): Promise<PaginatedResult<PortfolioProjectFirestore>> {
    try {
      const {
        category,
        status,
        featured,
        year,
        limit: pageLimit = 12,
        startAfter: startAfterDoc
      } = filters;

      const projectsRef = collection(this.db, COLLECTIONS.PORTFOLIO_PROJECTS);
      let q = query(projectsRef, orderBy('created_at', 'desc'));

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
        hasMore
      };

    } catch (error) {
      console.error('Error obteniendo proyectos paginados (Lite):', error);
      throw new Error('Failed to fetch paginated projects with Firestore Lite');
    }
  }

  /**
   * Obtener proyectos por categoría (Lite)
   */
  static async obtenerProyectosPorCategoria(
    categoryId: string,
    limitCount: number = 12
  ): Promise<PortfolioProjectFirestore[]> {
    const cacheKey = `portfolio:lite:projects:category:${categoryId}:${limitCount}`;

    const cached = PortfolioCache.get<PortfolioProjectFirestore[]>(cacheKey);
    if (cached) return cached;

    try {
      const projectsRef = collection(this.db, COLLECTIONS.PORTFOLIO_PROJECTS);
      const q = query(
        projectsRef,
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
      console.error('Error obteniendo proyectos por categoría (Lite):', error);
      throw new Error('Failed to fetch projects by category with Firestore Lite');
    }
  }

  /**
   * Obtener proyecto completo por slug (Lite)
   */
  static async obtenerProyectoCompleto(slug: string): Promise<PortfolioProjectComplete | null> {
    const cacheKey = `portfolio:lite:project:complete:${slug}`;

    const cached = PortfolioCache.get<PortfolioProjectComplete>(cacheKey);
    if (cached) return cached;

    try {
      // Obtener proyecto
      const projectsRef = collection(this.db, COLLECTIONS.PORTFOLIO_PROJECTS);
      const projectQuery = query(projectsRef, where('slug', '==', slug));
      const projectSnapshot = await getDocs(projectQuery);

      if (projectSnapshot.empty) {
        return null;
      }

      const projectDoc = projectSnapshot.docs[0];
      const project = {
        id: projectDoc.id,
        ...projectDoc.data()
      } as PortfolioProjectFirestore;

      // Obtener categoría
      const categoryDoc = await getDoc(doc(this.db, COLLECTIONS.PORTFOLIO_CATEGORIES, project.category_id));
      if (!categoryDoc.exists()) {
        throw new Error('Category not found for project');
      }

      const category = { id: categoryDoc.id, ...categoryDoc.data() } as PortfolioCategory;

      // Obtener imágenes
      const imagesRef = collection(this.db, COLLECTIONS.PORTFOLIO_IMAGES);
      const imagesQuery = query(
        imagesRef,
        where('project_id', '==', project.id),
        orderBy('order', 'asc')
      );
      const imagesSnapshot = await getDocs(imagesQuery);

      const images = imagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PortfolioImageFirestore));

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

      // Cache por 2 horas
      PortfolioCache.set(cacheKey, complete, 2 * 60 * 60 * 1000);

      return complete;

    } catch (error) {
      console.error('Error obteniendo proyecto completo (Lite):', error);
      throw new Error('Failed to fetch complete project with Firestore Lite');
    }
  }

  /**
   * Obtener proyectos destacados (Lite)
   */
  static async obtenerProyectosDestacados(limitCount: number = 6): Promise<PortfolioProjectFirestore[]> {
    const cacheKey = `portfolio:lite:projects:featured:${limitCount}`;

    const cached = PortfolioCache.get<PortfolioProjectFirestore[]>(cacheKey);
    if (cached) return cached;

    try {
      const projectsRef = collection(this.db, COLLECTIONS.PORTFOLIO_PROJECTS);
      const q = query(
        projectsRef,
        where('featured', '==', true),
        orderBy('created_at', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PortfolioProjectFirestore));

      // Cache por 2 horas
      PortfolioCache.set(cacheKey, projects, 2 * 60 * 60 * 1000);

      return projects;
    } catch (error) {
      console.error('Error obteniendo proyectos destacados (Lite):', error);
      throw new Error('Failed to fetch featured projects with Firestore Lite');
    }
  }

  /**
   * Obtener contadores usando aggregation queries (Lite)
   */
  static async obtenerContadores(): Promise<{
    totalCategories: number;
    totalProjects: number;
    featuredProjects: number;
    completedProjects: number;
  }> {
    const cacheKey = 'portfolio:lite:counters';

    const cached = PortfolioCache.get<any>(cacheKey);
    if (cached) return cached;

    try {
      // Usar aggregation queries para reducir reads
      const [
        categoriesCount,
        projectsCount,
        featuredProjectsCount,
        completedProjectsCount
      ] = await Promise.all([
        getCountFromServer(collection(this.db, COLLECTIONS.PORTFOLIO_CATEGORIES)),
        getCountFromServer(collection(this.db, COLLECTIONS.PORTFOLIO_PROJECTS)),
        getCountFromServer(query(
          collection(this.db, COLLECTIONS.PORTFOLIO_PROJECTS),
          where('featured', '==', true)
        )),
        getCountFromServer(query(
          collection(this.db, COLLECTIONS.PORTFOLIO_PROJECTS),
          where('status', '==', 'completado')
        ))
      ]);

      const counters = {
        totalCategories: categoriesCount.data().count,
        totalProjects: projectsCount.data().count,
        featuredProjects: featuredProjectsCount.data().count,
        completedProjects: completedProjectsCount.data().count
      };

      // Cache por 30 minutos
      PortfolioCache.set(cacheKey, counters, 30 * 60 * 1000);

      return counters;
    } catch (error) {
      console.error('Error obteniendo contadores (Lite):', error);
      throw new Error('Failed to fetch counters with Firestore Lite');
    }
  }

  /**
   * Búsqueda optimizada de proyectos (Lite)
   */
  static async buscarProyectos(
    searchTerm: string,
    limitCount: number = 20
  ): Promise<PortfolioProjectFirestore[]> {
    const cacheKey = `portfolio:lite:search:${searchTerm}:${limitCount}`;

    const cached = PortfolioCache.get<PortfolioProjectFirestore[]>(cacheKey);
    if (cached) return cached;

    try {
      // Firestore no tiene full-text search, usar filtros básicos
      // Para producción, considerar Algolia o Elasticsearch
      const projectsRef = collection(this.db, COLLECTIONS.PORTFOLIO_PROJECTS);
      const snapshot = await getDocs(projectsRef);

      const allProjects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PortfolioProjectFirestore));

      // Filtro del lado del cliente (no ideal para grandes datasets)
      const searchLower = searchTerm.toLowerCase();
      const filtered = allProjects.filter(project =>
        project.name.toLowerCase().includes(searchLower) ||
        project.description.toLowerCase().includes(searchLower) ||
        project.client.toLowerCase().includes(searchLower) ||
        project.location.toLowerCase().includes(searchLower)
      ).slice(0, limitCount);

      // Cache por 15 minutos (búsquedas son más dinámicas)
      PortfolioCache.set(cacheKey, filtered, 15 * 60 * 1000);

      return filtered;
    } catch (error) {
      console.error('Error buscando proyectos (Lite):', error);
      throw new Error('Failed to search projects with Firestore Lite');
    }
  }
}

// ==========================================
// BUNDLE SIZE UTILITIES
// ==========================================

export class FirestoreBundleUtils {
  /**
   * Comparar tamaño del bundle con/sin Firestore Lite
   */
  static logBundleInfo(): void {
    console.log('📦 Firestore Lite Bundle Info:');
    console.log('   - Firestore SDK: ~2.5MB → Firestore Lite: ~750KB');
    console.log('   - Reducción: ~70% del bundle Firestore');
    console.log('   - Trade-off: Solo operaciones read-only');
    console.log('   - Ideal para: Páginas públicas, landing pages, catálogos');
  }

  /**
   * Verificar si podemos usar Lite en el contexto actual
   */
  static canUseLite(): boolean {
    // Verificar si estamos en un contexto de solo lectura
    // Por ejemplo, páginas públicas vs admin panel
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      return !pathname.startsWith('/admin') && !pathname.includes('/edit');
    }
    return true; // En servidor, asumir que se puede usar
  }

  /**
   * Wrapper automático que decide entre Lite y SDK completo
   */
  static async autoSelectService<T>(
    liteOperation: () => Promise<T>,
    fullOperation: () => Promise<T>
  ): Promise<T> {
    if (this.canUseLite()) {
      try {
        return await liteOperation();
      } catch (error) {
        console.warn('Firestore Lite failed, falling back to full SDK:', error);
        return await fullOperation();
      }
    } else {
      return await fullOperation();
    }
  }
}

// Export optimized lite service
export default PortfolioLiteService;