/**
 * Portfolio Data Bundling Service - FASE 3
 * Pre-empaquetado de datos populares como bundles estáticos para reducir Firestore reads
 */

import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';
import {
  PortfolioCategory,
  PortfolioProjectFirestore,
  PortfolioImageFirestore,
  PortfolioStats
} from '@/types/portfolio-firestore';

// ==========================================
// INTERFACES PARA BUNDLES
// ==========================================

export interface PortfolioBundle {
  id: string;
  name: string;
  description: string;
  version: string;
  created_at: string;
  expires_at: string;
  data: any;
  metadata: {
    size_bytes: number;
    items_count: number;
    compression: 'none' | 'gzip';
    source: 'firestore' | 'json' | 'hybrid';
  };
}

export interface CategoriesBundle extends PortfolioBundle {
  data: {
    categories: PortfolioCategory[];
    featured_categories: PortfolioCategory[];
    stats: {
      total: number;
      featured: number;
      with_projects: number;
    };
  };
}

export interface FeaturedProjectsBundle extends PortfolioBundle {
  data: {
    projects: PortfolioProjectFirestore[];
    by_category: Record<string, PortfolioProjectFirestore[]>;
    stats: {
      total: number;
      by_status: Record<string, number>;
      by_year: Record<string, number>;
    };
  };
}

export interface HomepageBundle extends PortfolioBundle {
  data: {
    featured_categories: PortfolioCategory[];
    featured_projects: PortfolioProjectFirestore[];
    stats: {
      total_projects: number;
      total_categories: number;
      completion_rate: number;
    };
    recent_projects: PortfolioProjectFirestore[];
  };
}

// ==========================================
// PORTFOLIO BUNDLING SERVICE
// ==========================================

export class PortfolioBundlingService {
  private static readonly BUNDLES_DIR = join(process.cwd(), 'public', 'bundles', 'portfolio');
  private static readonly MAX_AGE = 2 * 60 * 60 * 1000; // 2 horas

  /**
   * Inicializar directorio de bundles
   */
  static init(): void {
    if (!existsSync(this.BUNDLES_DIR)) {
      mkdirSync(this.BUNDLES_DIR, { recursive: true });
      console.log('📦 Portfolio bundles directory created');
    }
  }

  /**
   * Crear bundle de categorías
   */
  static async crearCategoriesBundle(
    categories: PortfolioCategory[],
    options: { compress?: boolean } = {}
  ): Promise<CategoriesBundle> {
    try {
      const featuredCategories = categories.filter(c => c.featured);

      const bundle: CategoriesBundle = {
        id: 'portfolio_categories',
        name: 'Portfolio Categories Bundle',
        description: 'All portfolio categories with metadata',
        version: '1.0.0',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + this.MAX_AGE).toISOString(),
        data: {
          categories,
          featured_categories: featuredCategories,
          stats: {
            total: categories.length,
            featured: featuredCategories.length,
            with_projects: categories.filter(c => c.projects_count > 0).length
          }
        },
        metadata: {
          size_bytes: 0, // Se calcula después
          items_count: categories.length,
          compression: options.compress ? 'gzip' : 'none',
          source: 'firestore'
        }
      };

      // Guardar bundle
      await this.saveBundle('categories.json', bundle);

      console.log(`✅ Categories bundle created: ${categories.length} categories`);
      return bundle;

    } catch (error) {
      console.error('Error creando categories bundle:', error);
      throw error;
    }
  }

  /**
   * Crear bundle de proyectos destacados
   */
  static async crearFeaturedProjectsBundle(
    projects: PortfolioProjectFirestore[],
    categories: PortfolioCategory[]
  ): Promise<FeaturedProjectsBundle> {
    try {
      const featuredProjects = projects.filter(p => p.featured);

      // Agrupar por categoría
      const byCategory = categories.reduce((acc, category) => {
        acc[category.id] = featuredProjects.filter(p => p.category_id === category.id);
        return acc;
      }, {} as Record<string, PortfolioProjectFirestore[]>);

      // Estadísticas
      const byStatus = featuredProjects.reduce((acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const byYear = featuredProjects.reduce((acc, project) => {
        acc[project.year] = (acc[project.year] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const bundle: FeaturedProjectsBundle = {
        id: 'portfolio_featured_projects',
        name: 'Portfolio Featured Projects Bundle',
        description: 'Featured projects with category grouping',
        version: '1.0.0',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + this.MAX_AGE).toISOString(),
        data: {
          projects: featuredProjects,
          by_category: byCategory,
          stats: {
            total: featuredProjects.length,
            by_status: byStatus,
            by_year: byYear
          }
        },
        metadata: {
          size_bytes: 0,
          items_count: featuredProjects.length,
          compression: 'none',
          source: 'firestore'
        }
      };

      await this.saveBundle('featured-projects.json', bundle);

      console.log(`✅ Featured projects bundle created: ${featuredProjects.length} projects`);
      return bundle;

    } catch (error) {
      console.error('Error creando featured projects bundle:', error);
      throw error;
    }
  }

  /**
   * Crear bundle de homepage (más crítico para performance)
   */
  static async crearHomepageBundle(
    categories: PortfolioCategory[],
    featuredProjects: PortfolioProjectFirestore[],
    recentProjects: PortfolioProjectFirestore[],
    stats: {
      total_projects: number;
      total_categories: number;
      completion_rate: number;
    }
  ): Promise<HomepageBundle> {
    try {
      const bundle: HomepageBundle = {
        id: 'portfolio_homepage',
        name: 'Portfolio Homepage Bundle',
        description: 'Critical data for homepage - categories, featured projects, stats',
        version: '1.0.0',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + this.MAX_AGE).toISOString(),
        data: {
          featured_categories: categories.filter(c => c.featured),
          featured_projects: featuredProjects,
          stats,
          recent_projects: recentProjects
        },
        metadata: {
          size_bytes: 0,
          items_count: categories.length + featuredProjects.length + recentProjects.length,
          compression: 'none',
          source: 'firestore'
        }
      };

      await this.saveBundle('homepage.json', bundle);

      console.log('✅ Homepage bundle created - critical data cached');
      return bundle;

    } catch (error) {
      console.error('Error creando homepage bundle:', error);
      throw error;
    }
  }

  /**
   * Crear bundle de metadata (muy ligero para navegación)
   */
  static async crearMetadataBundle(
    categories: PortfolioCategory[],
    projects: PortfolioProjectFirestore[]
  ): Promise<PortfolioBundle> {
    try {
      // Solo metadata esencial
      const categoriesMetadata = categories.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        icon: c.icon,
        color: c.color,
        projects_count: c.projects_count,
        featured: c.featured
      }));

      const projectsMetadata = projects.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        category_id: p.category_id,
        featured_image: p.featured_image,
        year: p.year,
        status: p.status,
        featured: p.featured
      }));

      const bundle: PortfolioBundle = {
        id: 'portfolio_metadata',
        name: 'Portfolio Metadata Bundle',
        description: 'Lightweight metadata for navigation and listings',
        version: '1.0.0',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 horas
        data: {
          categories: categoriesMetadata,
          projects: projectsMetadata
        },
        metadata: {
          size_bytes: 0,
          items_count: categoriesMetadata.length + projectsMetadata.length,
          compression: 'none',
          source: 'firestore'
        }
      };

      await this.saveBundle('metadata.json', bundle);

      console.log('✅ Metadata bundle created - navigation data cached');
      return bundle;

    } catch (error) {
      console.error('Error creando metadata bundle:', error);
      throw error;
    }
  }

  /**
   * Cargar bundle desde archivo
   */
  static async loadBundle<T extends PortfolioBundle>(bundleId: string): Promise<T | null> {
    try {
      const filePath = join(this.BUNDLES_DIR, `${bundleId}.json`);

      if (!existsSync(filePath)) {
        return null;
      }

      const fileContent = readFileSync(filePath, 'utf-8');
      const bundle = JSON.parse(fileContent) as T;

      // Verificar expiración
      const expiresAt = new Date(bundle.expires_at);
      if (new Date() > expiresAt) {
        console.log(`📦 Bundle ${bundleId} expired, needs refresh`);
        return null;
      }

      return bundle;

    } catch (error) {
      console.error(`Error loading bundle ${bundleId}:`, error);
      return null;
    }
  }

  /**
   * Verificar si bundle existe y está vigente
   */
  static isBundleValid(bundleId: string): boolean {
    try {
      const filePath = join(this.BUNDLES_DIR, `${bundleId}.json`);

      if (!existsSync(filePath)) {
        return false;
      }

      const fileContent = readFileSync(filePath, 'utf-8');
      const bundle = JSON.parse(fileContent);

      const expiresAt = new Date(bundle.expires_at);
      return new Date() <= expiresAt;

    } catch (error) {
      return false;
    }
  }

  /**
   * Invalidar bundle (eliminar archivo)
   */
  static invalidateBundle(bundleId: string): void {
    try {
      const filePath = join(this.BUNDLES_DIR, `${bundleId}.json`);

      if (existsSync(filePath)) {
        const fs = require('fs');
        fs.unlinkSync(filePath);
        console.log(`🗑️  Bundle ${bundleId} invalidated`);
      }

    } catch (error) {
      console.error(`Error invalidating bundle ${bundleId}:`, error);
    }
  }

  /**
   * Invalidar todos los bundles
   */
  static invalidateAllBundles(): void {
    try {
      const fs = require('fs');
      const files = fs.readdirSync(this.BUNDLES_DIR);

      for (const file of files) {
        if (file.endsWith('.json')) {
          fs.unlinkSync(join(this.BUNDLES_DIR, file));
        }
      }

      console.log('🗑️  All portfolio bundles invalidated');

    } catch (error) {
      console.error('Error invalidating all bundles:', error);
    }
  }

  /**
   * Obtener estadísticas de bundles
   */
  static getBundleStats(): {
    total_bundles: number;
    total_size_mb: number;
    expired_bundles: number;
    bundles: Array<{
      id: string;
      size_kb: number;
      created_at: string;
      expires_at: string;
      expired: boolean;
    }>;
  } {
    try {
      const fs = require('fs');
      const files = fs.readdirSync(this.BUNDLES_DIR).filter(f => f.endsWith('.json'));

      let totalSize = 0;
      let expiredCount = 0;
      const bundleDetails = [];

      for (const file of files) {
        const filePath = join(this.BUNDLES_DIR, file);
        const stats = fs.statSync(filePath);
        const content = JSON.parse(readFileSync(filePath, 'utf-8'));

        const expired = new Date() > new Date(content.expires_at);
        if (expired) expiredCount++;

        totalSize += stats.size;
        bundleDetails.push({
          id: content.id,
          size_kb: Math.round(stats.size / 1024),
          created_at: content.created_at,
          expires_at: content.expires_at,
          expired
        });
      }

      return {
        total_bundles: files.length,
        total_size_mb: Math.round(totalSize / 1024 / 1024 * 100) / 100,
        expired_bundles: expiredCount,
        bundles: bundleDetails
      };

    } catch (error) {
      console.error('Error getting bundle stats:', error);
      return {
        total_bundles: 0,
        total_size_mb: 0,
        expired_bundles: 0,
        bundles: []
      };
    }
  }

  /**
   * Guardar bundle en archivo
   */
  private static async saveBundle(filename: string, bundle: PortfolioBundle): Promise<void> {
    try {
      const filePath = join(this.BUNDLES_DIR, filename);
      const content = JSON.stringify(bundle, null, 2);

      // Actualizar tamaño en metadata
      bundle.metadata.size_bytes = Buffer.byteLength(content, 'utf8');

      writeFileSync(filePath, content, 'utf-8');

      console.log(`📦 Bundle saved: ${filename} (${Math.round(bundle.metadata.size_bytes / 1024)}KB)`);

    } catch (error) {
      console.error(`Error saving bundle ${filename}:`, error);
      throw error;
    }
  }
}

// ==========================================
// BUNDLE AUTOMATION SERVICE
// ==========================================

export class PortfolioBundleAutomation {
  /**
   * Crear todos los bundles desde datos Firestore
   */
  static async createAllBundles(): Promise<void> {
    try {
      console.log('🚀 Creating all portfolio bundles...');

      // Aquí integraríamos con los servicios Firestore optimizados
      // const categories = await OptimizedPortfolioCategoriesService.obtenerTodas({ forceRefresh: true });
      // const projects = await OptimizedPortfolioProjectsService.obtenerTodos();

      // Por ahora, simulamos los bundles
      console.log('📦 Bundles creation scheduled');

      // TODO: Implementar Cloud Function que ejecute esto periódicamente

    } catch (error) {
      console.error('Error creating all bundles:', error);
    }
  }

  /**
   * Programar creación automática de bundles
   */
  static scheduleAutomaticCreation(): void {
    console.log('📅 Bundle automation scheduled');
    // TODO: Configurar con Cloud Scheduler
    // - Ejecutar cada 2 horas
    // - Invalidar cuando hay cambios en Firestore
    // - Generar bundles críticos (homepage, categories, featured)
  }

  /**
   * Hook para invalidar bundles tras cambios
   */
  static onDataChange(
    changeType: 'category' | 'project' | 'image',
    action: 'create' | 'update' | 'delete'
  ): void {
    try {
      console.log(`🔄 Data change detected: ${changeType} ${action}`);

      // Invalidar bundles relacionados
      switch (changeType) {
        case 'category':
          PortfolioBundlingService.invalidateBundle('categories');
          PortfolioBundlingService.invalidateBundle('homepage');
          PortfolioBundlingService.invalidateBundle('metadata');
          break;

        case 'project':
          if (action !== 'update') {
            // Create/delete afecta contadores
            PortfolioBundlingService.invalidateBundle('categories');
          }
          PortfolioBundlingService.invalidateBundle('featured-projects');
          PortfolioBundlingService.invalidateBundle('homepage');
          PortfolioBundlingService.invalidateBundle('metadata');
          break;

        case 'image':
          // Solo afecta bundles que incluyan imágenes
          break;
      }

      console.log('✅ Related bundles invalidated');

    } catch (error) {
      console.error('Error handling data change:', error);
    }
  }
}

// Export services
export {
  PortfolioBundlingService,
  PortfolioBundleAutomation
};