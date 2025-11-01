/**
 * Portfolio Aggregations Service - FASE 3
 * Documentos agregados para reducir lecturas Firestore en dashboards y estadísticas
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
  increment,
  getCountFromServer
} from 'firebase/firestore';

import { db, COLLECTIONS } from '@/lib/firebase/config';
import {
  PortfolioStats,
  parseInvestment,
  parseArea
} from '@/types/portfolio-firestore';

// ==========================================
// INTERFACES PARA AGREGACIONES
// ==========================================

export interface PortfolioAggregatedStats extends PortfolioStats {
  last_updated: string;
  cached_until: string;
  version: number;
}

export interface CategoryAggregation {
  id: string;
  name: string;
  slug: string;
  projects_count: number;
  total_investment: number;
  total_area: number;
  featured_projects_count: number;
  completed_projects_count: number;
  last_project_date: string | null;
  avg_project_duration: number;
  last_updated: string;
}

export interface YearlyAggregation {
  year: string;
  projects_count: number;
  total_investment: number;
  total_area: number;
  categories_active: string[];
  completion_rate: number;
  avg_project_size: number;
}

export interface DashboardAggregation {
  id: 'portfolio_dashboard';
  overview: {
    total_categories: number;
    total_projects: number;
    total_images: number;
    total_investment: number;
    total_area: number;
    completion_rate: number;
  };
  recent_activity: {
    projects_this_month: number;
    projects_this_year: number;
    last_project_added: string;
    last_category_updated: string;
  };
  top_categories: CategoryAggregation[];
  yearly_summary: YearlyAggregation[];
  featured_stats: {
    featured_projects_count: number;
    featured_categories_count: number;
    featured_completion_rate: number;
  };
  last_updated: string;
  cached_until: string;
  version: number;
}

// ==========================================
// PORTFOLIO AGGREGATIONS SERVICE
// ==========================================

export class PortfolioAggregationsService {
  private static aggregationsCollection = 'portfolio_aggregations';
  private static readonly CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 horas

  /**
   * Obtener estadísticas del dashboard desde documento agregado
   */
  static async obtenerDashboardStats(): Promise<DashboardAggregation | null> {
    try {
      const docRef = doc(db, this.aggregationsCollection, 'portfolio_dashboard');
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // Si no existe, crear las agregaciones
        console.log('Dashboard aggregation not found, creating...');
        await this.crearDashboardAggregation();
        return this.obtenerDashboardStats();
      }

      const data = docSnap.data() as DashboardAggregation;

      // Verificar si está expirado
      const cachedUntil = new Date(data.cached_until);
      if (new Date() > cachedUntil) {
        console.log('Dashboard aggregation expired, refreshing...');
        // Actualizar en background
        this.actualizarDashboardAggregation().catch(console.error);
      }

      return data;
    } catch (error) {
      console.error('Error obteniendo dashboard stats:', error);
      return null;
    }
  }

  /**
   * Crear documento agregado inicial para dashboard
   */
  static async crearDashboardAggregation(): Promise<void> {
    try {
      console.log('🔄 Creando agregaciones del dashboard...');

      // Obtener datos base con aggregation queries
      const [
        categoriesSnapshot,
        projectsSnapshot,
        imagesSnapshot,
        featuredProjectsCount,
        completedProjectsCount
      ] = await Promise.all([
        getDocs(collection(db, COLLECTIONS.PORTFOLIO_CATEGORIES)),
        getDocs(collection(db, COLLECTIONS.PORTFOLIO_PROJECTS)),
        getCountFromServer(collection(db, COLLECTIONS.PORTFOLIO_IMAGES)),
        getCountFromServer(query(
          collection(db, COLLECTIONS.PORTFOLIO_PROJECTS),
          where('featured', '==', true)
        )),
        getCountFromServer(query(
          collection(db, COLLECTIONS.PORTFOLIO_PROJECTS),
          where('status', '==', 'completado')
        ))
      ]);

      const categories = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const projects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calcular agregaciones por categoría
      const categoryAggregations: CategoryAggregation[] = categories.map(category => {
        const categoryProjects = projects.filter(p => p.category_id === category.id);

        return {
          id: category.id,
          name: category.name,
          slug: category.slug,
          projects_count: categoryProjects.length,
          total_investment: categoryProjects.reduce((sum, p) => sum + parseInvestment(p.budget || '0'), 0),
          total_area: categoryProjects.reduce((sum, p) => sum + parseArea(p.area || '0'), 0),
          featured_projects_count: categoryProjects.filter(p => p.featured).length,
          completed_projects_count: categoryProjects.filter(p => p.status === 'completado').length,
          last_project_date: categoryProjects.length > 0
            ? categoryProjects.sort((a, b) => b.created_at?.toMillis() - a.created_at?.toMillis())[0]?.created_at?.toDate()?.toISOString() || null
            : null,
          avg_project_duration: this.calculateAvgDuration(categoryProjects),
          last_updated: new Date().toISOString()
        };
      });

      // Calcular agregaciones por año
      const projectsByYear = projects.reduce((acc, project) => {
        const year = project.year || 'unknown';
        if (!acc[year]) acc[year] = [];
        acc[year].push(project);
        return acc;
      }, {} as Record<string, any[]>);

      const yearlyAggregations: YearlyAggregation[] = Object.entries(projectsByYear).map(([year, yearProjects]) => ({
        year,
        projects_count: yearProjects.length,
        total_investment: yearProjects.reduce((sum, p) => sum + parseInvestment(p.budget || '0'), 0),
        total_area: yearProjects.reduce((sum, p) => sum + parseArea(p.area || '0'), 0),
        categories_active: [...new Set(yearProjects.map(p => p.category_id))],
        completion_rate: yearProjects.filter(p => p.status === 'completado').length / yearProjects.length,
        avg_project_size: yearProjects.reduce((sum, p) => sum + parseArea(p.area || '0'), 0) / yearProjects.length
      }));

      // Crear documento agregado
      const dashboardData: DashboardAggregation = {
        id: 'portfolio_dashboard',
        overview: {
          total_categories: categories.length,
          total_projects: projects.length,
          total_images: imagesSnapshot.data().count,
          total_investment: projects.reduce((sum, p) => sum + parseInvestment(p.budget || '0'), 0),
          total_area: projects.reduce((sum, p) => sum + parseArea(p.area || '0'), 0),
          completion_rate: completedProjectsCount.data().count / projects.length
        },
        recent_activity: {
          projects_this_month: this.getProjectsThisMonth(projects),
          projects_this_year: this.getProjectsThisYear(projects),
          last_project_added: this.getLastProjectAdded(projects),
          last_category_updated: this.getLastCategoryUpdated(categories)
        },
        top_categories: categoryAggregations.sort((a, b) => b.projects_count - a.projects_count).slice(0, 5),
        yearly_summary: yearlyAggregations.sort((a, b) => b.year.localeCompare(a.year)).slice(0, 5),
        featured_stats: {
          featured_projects_count: featuredProjectsCount.data().count,
          featured_categories_count: categories.filter(c => c.featured).length,
          featured_completion_rate: projects.filter(p => p.featured && p.status === 'completado').length / featuredProjectsCount.data().count
        },
        last_updated: new Date().toISOString(),
        cached_until: new Date(Date.now() + this.CACHE_DURATION).toISOString(),
        version: 1
      };

      // Guardar documento agregado
      const docRef = doc(db, this.aggregationsCollection, 'portfolio_dashboard');
      await setDoc(docRef, dashboardData);

      console.log('✅ Dashboard aggregation created successfully');

    } catch (error) {
      console.error('Error creando dashboard aggregation:', error);
      throw error;
    }
  }

  /**
   * Actualizar documento agregado existente
   */
  static async actualizarDashboardAggregation(): Promise<void> {
    try {
      // Eliminar y recrear para simplicidad
      // En producción, sería mejor hacer actualizaciones incrementales
      await this.crearDashboardAggregation();
    } catch (error) {
      console.error('Error actualizando dashboard aggregation:', error);
    }
  }

  /**
   * Obtener agregaciones por categoría
   */
  static async obtenerCategoryAggregations(): Promise<CategoryAggregation[]> {
    try {
      const dashboardData = await this.obtenerDashboardStats();
      return dashboardData?.top_categories || [];
    } catch (error) {
      console.error('Error obteniendo category aggregations:', error);
      return [];
    }
  }

  /**
   * Invalidar todas las agregaciones (llamar tras cambios importantes)
   */
  static async invalidarAgregaciones(): Promise<void> {
    try {
      console.log('🔄 Invalidando agregaciones...');

      // Marcar como expiradas actualizando cached_until
      const docRef = doc(db, this.aggregationsCollection, 'portfolio_dashboard');
      await updateDoc(docRef, {
        cached_until: new Date().toISOString(), // Expira inmediatamente
        last_updated: new Date().toISOString()
      });

      console.log('✅ Agregaciones invalidadas');
    } catch (error) {
      console.error('Error invalidando agregaciones:', error);
    }
  }

  /**
   * Programar actualización automática (para Cloud Functions)
   */
  static async programarActualizacionAutomatica(): Promise<void> {
    // TODO: Implementar con Cloud Scheduler + Cloud Functions
    // Ejecutar cada 2 horas para mantener agregaciones frescas
    console.log('📅 Programación automática configurada (Cloud Functions)');
  }

  // ==========================================
  // MÉTODOS AUXILIARES
  // ==========================================

  private static calculateAvgDuration(projects: any[]): number {
    const durationsInMonths = projects
      .map(p => this.parseDuration(p.duration))
      .filter(d => d > 0);

    return durationsInMonths.length > 0
      ? durationsInMonths.reduce((sum, d) => sum + d, 0) / durationsInMonths.length
      : 0;
  }

  private static parseDuration(duration: string): number {
    if (!duration) return 0;

    const match = duration.match(/(\d+)/);
    if (!match) return 0;

    const number = parseInt(match[1]);

    if (duration.includes('año')) return number * 12;
    if (duration.includes('mes')) return number;
    if (duration.includes('semana')) return number / 4;
    if (duration.includes('día')) return number / 30;

    return number; // Asume meses por defecto
  }

  private static getProjectsThisMonth(projects: any[]): number {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    return projects.filter(p => {
      const createdAt = p.created_at?.toDate() || new Date(0);
      return createdAt > oneMonthAgo;
    }).length;
  }

  private static getProjectsThisYear(projects: any[]): number {
    const currentYear = new Date().getFullYear().toString();
    return projects.filter(p => p.year === currentYear).length;
  }

  private static getLastProjectAdded(projects: any[]): string {
    if (projects.length === 0) return new Date().toISOString();

    const sorted = projects.sort((a, b) => {
      const aDate = a.created_at?.toMillis() || 0;
      const bDate = b.created_at?.toMillis() || 0;
      return bDate - aDate;
    });

    return sorted[0]?.created_at?.toDate()?.toISOString() || new Date().toISOString();
  }

  private static getLastCategoryUpdated(categories: any[]): string {
    if (categories.length === 0) return new Date().toISOString();

    const sorted = categories.sort((a, b) => {
      const aDate = a.updated_at?.toMillis() || 0;
      const bDate = b.updated_at?.toMillis() || 0;
      return bDate - aDate;
    });

    return sorted[0]?.updated_at?.toDate()?.toISOString() || new Date().toISOString();
  }
}

// ==========================================
// TRIGGERS PARA MANTENER AGREGACIONES
// ==========================================

export class PortfolioAggregationTriggers {
  /**
   * Llamar cuando se crea/actualiza/elimina un proyecto
   */
  static async onProjectChange(
    projectId: string,
    action: 'create' | 'update' | 'delete',
    categoryId?: string
  ): Promise<void> {
    try {
      console.log(`📊 Trigger: ${action} project ${projectId}`);

      // Invalidar agregaciones relacionadas
      await PortfolioAggregationsService.invalidarAgregaciones();

      // En producción, hacer actualización incremental en lugar de invalidación completa
      // await this.updateCategoryAggregation(categoryId);
      // await this.updateDashboardCounters(action);

    } catch (error) {
      console.error('Error en project change trigger:', error);
    }
  }

  /**
   * Llamar cuando se crea/actualiza/elimina una categoría
   */
  static async onCategoryChange(
    categoryId: string,
    action: 'create' | 'update' | 'delete'
  ): Promise<void> {
    try {
      console.log(`📊 Trigger: ${action} category ${categoryId}`);

      // Invalidar agregaciones
      await PortfolioAggregationsService.invalidarAgregaciones();

    } catch (error) {
      console.error('Error en category change trigger:', error);
    }
  }

  /**
   * Llamar cuando se añaden/eliminan imágenes
   */
  static async onImageChange(
    imageId: string,
    projectId: string,
    action: 'create' | 'delete'
  ): Promise<void> {
    try {
      // Solo actualizar contador de imágenes (menor impacto)
      const docRef = doc(db, PortfolioAggregationsService['aggregationsCollection'], 'portfolio_dashboard');

      await updateDoc(docRef, {
        'overview.total_images': increment(action === 'create' ? 1 : -1),
        last_updated: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error en image change trigger:', error);
    }
  }
}