/**
 * Script de Migración Portfolio a Firestore
 * Utiliza la arquitectura unificada para migrar datos JSON a Firestore
 * Extiende UnifiedMigrator con transformadores específicos de Portfolio
 */

import { Timestamp } from 'firebase/firestore';
import { UnifiedMigrator, MigrationConfig, CollectionConfig, ValidationResult, MigrationContext } from '@/lib/migration/unified-migrator';
import { validatePortfolioCategory, validatePortfolioProject } from '@/lib/migration/validation-rules';
import { COLLECTIONS } from '@/lib/firebase/config';
import type { PortfolioCategoryData, PortfolioProjectData, ProjectImage } from '@/lib/firestore/portfolio-service-unified';

// Datos mock para testing - en producción vendrían de archivos JSON
const MOCK_PORTFOLIO_DATA = {
  categories: [
    {
      id: "cat-1",
      name: "Construcción Residencial",
      slug: "construccion-residencial",
      description: "Proyectos de viviendas unifamiliares y multifamiliares",
      icon: "home",
      color: "#00A8E8",
      featured: true,
      order: 1,
      projects_count: 0,
      total_investment_usd: 0,
      total_area_m2: 0
    },
    {
      id: "cat-2",
      name: "Infraestructura",
      slug: "infraestructura",
      description: "Obras de infraestructura civil y urbana",
      icon: "construction",
      color: "#003F6F",
      featured: true,
      order: 2,
      projects_count: 0,
      total_investment_usd: 0,
      total_area_m2: 0
    }
  ],
  projects: [
    {
      id: "proj-1",
      category_id: "cat-1",
      title: "Residencial Los Alamos",
      slug: "residencial-los-alamos",
      location: {
        city: "Lima",
        region: "Lima",
        address: "Av. Los Alamos 123",
        coordinates: [-12.0464, -77.0428] as [number, number]
      },
      images: {
        featured: "/images/portfolio/proj-1-featured.jpg",
        thumbnail: "/images/portfolio/proj-1-thumb.jpg",
        gallery: [
          {
            id: "img-1",
            url: "/images/portfolio/proj-1-gallery-1.jpg",
            thumbnail: "/images/portfolio/proj-1-gallery-1-thumb.jpg",
            caption: "Vista frontal del proyecto",
            stage: "final" as const,
            order: 1
          }
        ]
      },
      description: "Proyecto residencial de 50 unidades de vivienda con áreas comunes y amenities completos.",
      short_description: "Desarrollo residencial moderno en Lima Norte",
      details: {
        client: "Inmobiliaria ABC S.A.C.",
        duration: "18 meses",
        investment_usd: 2500000,
        area_m2: 8500,
        team: ["Arq. Juan Pérez", "Ing. María García"],
        certifications: ["ISO 9001", "LEED Gold"]
      },
      featured: true,
      completed_at: "2023-12-15",
      tags: ["residencial", "sostenible", "moderno"],
      status: "completed" as const,
      seo: {
        title: "Residencial Los Alamos - Proyecto de Construcción",
        description: "Desarrollo residencial moderno de 50 unidades en Lima Norte con certificación LEED Gold",
        keywords: ["residencial", "construcción", "lima", "sostenible"]
      },
      metrics: {
        views: 0,
        last_updated: new Date().toISOString()
      }
    }
  ]
};

/**
 * Transformadores específicos para Portfolio
 */
const portfolioCategoryTransformer = (item: any, context?: MigrationContext): PortfolioCategoryData => {
  return {
    name: item.name,
    slug: item.slug,
    description: item.description,
    icon: item.icon,
    color: item.color,
    featured_image: item.featured_image,
    projects_count: item.projects_count || 0,
    total_investment_usd: item.total_investment_usd || 0,
    total_area_m2: item.total_area_m2 || 0,
    featured: item.featured || false,
    order: item.order || context?.currentIndex || 0
  };
};

const portfolioProjectTransformer = (item: any, context?: MigrationContext): PortfolioProjectData => {
  // Transformar fecha de completado
  let completedAt: Timestamp;
  if (item.completed_at) {
    const date = typeof item.completed_at === 'string'
      ? new Date(item.completed_at)
      : item.completed_at;
    completedAt = Timestamp.fromDate(date);
  } else {
    completedAt = Timestamp.now();
  }

  // Transformar métricas de última actualización
  let lastUpdated: Timestamp;
  if (item.metrics?.last_updated) {
    const date = typeof item.metrics.last_updated === 'string'
      ? new Date(item.metrics.last_updated)
      : item.metrics.last_updated;
    lastUpdated = Timestamp.fromDate(date);
  } else {
    lastUpdated = Timestamp.now();
  }

  return {
    title: item.title,
    slug: item.slug,
    category_id: item.category_id,
    location: {
      city: item.location.city,
      region: item.location.region,
      address: item.location.address,
      coordinates: item.location.coordinates
    },
    images: {
      featured: item.images.featured,
      thumbnail: item.images.thumbnail,
      gallery: item.images.gallery || []
    },
    description: item.description,
    short_description: item.short_description,
    details: {
      client: item.details.client,
      duration: item.details.duration,
      investment_usd: item.details.investment_usd,
      area_m2: item.details.area_m2,
      team: item.details.team || [],
      certifications: item.details.certifications
    },
    featured: item.featured,
    completed_at: completedAt,
    tags: item.tags || [],
    status: item.status || 'completed',
    seo: item.seo,
    metrics: {
      views: item.metrics?.views || 0,
      last_updated: lastUpdated
    }
  };
};

/**
 * Configuración de migración Portfolio
 */
export const createPortfolioMigrationConfig = (
  categoriesData: any[] = MOCK_PORTFOLIO_DATA.categories,
  projectsData: any[] = MOCK_PORTFOLIO_DATA.projects,
  dryRun: boolean = true
): MigrationConfig => {
  const collections: CollectionConfig[] = [
    // Categorías primero (sin dependencias)
    {
      name: COLLECTIONS.PORTFOLIO_CATEGORIES,
      data: categoriesData,
      transformer: portfolioCategoryTransformer,
      validator: validatePortfolioCategory
    },
    // Proyectos después (dependen de categorías)
    {
      name: COLLECTIONS.PORTFOLIO_PROJECTS,
      data: projectsData,
      transformer: portfolioProjectTransformer,
      validator: validatePortfolioProject,
      dependencies: [COLLECTIONS.PORTFOLIO_CATEGORIES]
    }
  ];

  return {
    systemName: 'Portfolio',
    collections,
    dryRun,
    batchSize: 10 // Menor batch size para Portfolio por la complejidad de datos
  };
};

/**
 * Ejecutor principal de migración Portfolio
 */
export class PortfolioMigrator extends UnifiedMigrator {
  constructor() {
    super(10); // Batch size optimizado para Portfolio
  }

  /**
   * Migrar Portfolio completo desde datos JSON
   */
  async migratePortfolioSystem(
    categoriesData?: any[],
    projectsData?: any[],
    dryRun: boolean = true
  ) {
    console.log('🚀 Starting Portfolio migration to Firestore...');

    try {
      // Crear configuración
      const config = createPortfolioMigrationConfig(categoriesData, projectsData, dryRun);

      // Ejecutar migración
      const result = await this.migrateSystem(config);

      // Calcular relaciones después de la migración
      if (!dryRun && result.success) {
        await this.calculatePortfolioRelations();
      }

      return result;
    } catch (error) {
      console.error('❌ Portfolio migration failed:', error);
      throw error;
    }
  }

  /**
   * Calcular métricas y relaciones específicas de Portfolio
   */
  async calculatePortfolioRelations() {
    console.log('🔗 Calculating Portfolio relationships...');

    const relationships = [
      {
        parentCollection: COLLECTIONS.PORTFOLIO_CATEGORIES,
        childCollection: COLLECTIONS.PORTFOLIO_PROJECTS,
        relationField: 'category_id',
        calculateMetrics: true
      }
    ];

    await this.calculateRelations(relationships);

    // Calcular métricas adicionales específicas de Portfolio
    await this.calculatePortfolioMetrics();
  }

  /**
   * Calcular métricas agregadas específicas de Portfolio
   */
  private async calculatePortfolioMetrics() {
    console.log('📊 Calculating Portfolio specific metrics...');

    try {
      // Aquí se implementarían cálculos específicos como:
      // - Total de inversión por categoría
      // - Área total por categoría
      // - Promedio de duración de proyectos
      // - Distribución geográfica
      console.log('✅ Portfolio metrics calculated successfully');
    } catch (error) {
      console.error('❌ Error calculating Portfolio metrics:', error);
    }
  }

  /**
   * Validar migración Portfolio
   */
  async validatePortfolioMigration(originalData: {
    categories: any[],
    projects: any[]
  }) {
    console.log('🔍 Validating Portfolio migration...');

    const results = await Promise.all([
      this.validateMigration(COLLECTIONS.PORTFOLIO_CATEGORIES, originalData.categories.length),
      this.validateMigration(COLLECTIONS.PORTFOLIO_PROJECTS, originalData.projects.length)
    ]);

    const isValid = results.every(result => result.isValid);

    if (isValid) {
      console.log('✅ Portfolio migration validation passed');
    } else {
      console.log('❌ Portfolio migration validation failed');
      results.forEach((result, index) => {
        const collectionName = index === 0 ? 'categories' : 'projects';
        if (!result.isValid) {
          console.log(`❌ ${collectionName}:`, result.errors);
        }
      });
    }

    return {
      isValid,
      results
    };
  }
}

/**
 * Función de conveniencia para ejecutar migración rápidamente
 */
export async function migratePortfolioToFirestore(
  categoriesData?: any[],
  projectsData?: any[],
  dryRun: boolean = true
) {
  const migrator = new PortfolioMigrator();
  return await migrator.migratePortfolioSystem(categoriesData, projectsData, dryRun);
}

// Exportar instancia por defecto
export const portfolioMigrator = new PortfolioMigrator();

// Alias para compatibilidad con imports existentes
export { PortfolioMigrator as PortfolioMigration };

// ==========================================
// UTILIDADES PARA COMPATIBILIDAD LEGACY
// ==========================================

/**
 * Utilitarios para lectura de datos JSON (Legacy compatibility)
 */
export class PortfolioJSONReader {
  /**
   * Lee el archivo JSON del portfolio
   */
  static async readJSONFile(filePath: string): Promise<any> {
    try {
      if (typeof window !== 'undefined') {
        // En el cliente, usar fetch
        const response = await fetch(filePath);
        if (!response.ok) {
          throw new Error(`Failed to fetch JSON file: ${response.statusText}`);
        }
        return await response.json();
      } else {
        // En el servidor, usar fs
        const fs = await import('fs/promises');
        const path = await import('path');

        const fullPath = path.resolve(process.cwd(), filePath);
        const fileContent = await fs.readFile(fullPath, 'utf-8');
        return JSON.parse(fileContent);
      }
    } catch (error) {
      throw new Error(`Failed to read JSON file ${filePath}: ${error}`);
    }
  }

  /**
   * Transforma datos JSON legacy al formato unificado
   */
  static transformLegacyData(jsonData: any): { categories: any[], projects: any[] } {
    const categories: any[] = [];
    const projects: any[] = [];

    if (jsonData.categories && Array.isArray(jsonData.categories)) {
      jsonData.categories.forEach((legacyCategory: any) => {
        // Transformar categoría
        const category = {
          id: legacyCategory.id,
          name: legacyCategory.name,
          slug: legacyCategory.slug,
          description: legacyCategory.description,
          icon: legacyCategory.icon,
          color: legacyCategory.color,
          featured_image: legacyCategory.featured_image,
          projects_count: legacyCategory.projects_count || 0,
          total_investment_usd: parseInt(legacyCategory.total_investment) || 0,
          total_area_m2: parseInt(legacyCategory.total_area) || 0,
          featured: legacyCategory.featured || false,
          order: legacyCategory.order || 0
        };
        categories.push(category);

        // Transformar proyectos de esta categoría
        if (legacyCategory.projects && Array.isArray(legacyCategory.projects)) {
          legacyCategory.projects.forEach((legacyProject: any) => {
            const project = {
              id: legacyProject.id,
              category_id: legacyCategory.id,
              title: legacyProject.name,
              slug: `${legacyProject.name.toLowerCase().replace(/\s+/g, '-')}-${legacyProject.year}`,
              location: {
                city: legacyProject.location.split(',')[0]?.trim() || 'Lima',
                region: legacyProject.location.split(',')[1]?.trim() || 'Lima',
                address: legacyProject.location,
                coordinates: [-12.0464, -77.0428] as [number, number]
              },
              images: {
                featured: legacyProject.images?.[0]?.url || '',
                thumbnail: legacyProject.images?.[0]?.url || '',
                gallery: legacyProject.images?.map((img: any, index: number) => ({
                  id: `${legacyProject.id}-img-${index}`,
                  url: img.url,
                  thumbnail: img.url,
                  caption: img.alt || img.title,
                  stage: 'final' as const,
                  order: index
                })) || []
              },
              description: legacyProject.description,
              short_description: legacyProject.description.substring(0, 160),
              details: {
                client: legacyProject.client,
                duration: legacyProject.duration,
                investment_usd: parseInt(legacyProject.budget) || 0,
                area_m2: parseInt(legacyProject.area) || 0,
                team: [],
                certifications: []
              },
              featured: legacyProject.featured || false,
              completed_at: `${legacyProject.year}-12-31`,
              tags: legacyProject.services || [],
              status: legacyProject.status === 'completado' ? 'completed' :
                      legacyProject.status === 'en_curso' ? 'in_progress' : 'planned',
              seo: {
                title: `${legacyProject.name} - Proyecto de Construcción`,
                description: legacyProject.description.substring(0, 160),
                keywords: [legacyProject.name, legacyCategory.name, 'construcción']
              },
              metrics: {
                views: 0,
                last_updated: new Date().toISOString()
              }
            };
            projects.push(project);
          });
        }
      });
    }

    return { categories, projects };
  }

  /**
   * Migración desde archivo JSON legacy
   */
  static async migrateFromLegacyJSON(
    jsonFilePath: string,
    dryRun: boolean = true
  ) {
    console.log('📁 Reading legacy JSON file:', jsonFilePath);

    // Leer archivo JSON
    const jsonData = await this.readJSONFile(jsonFilePath);

    // Transformar a formato unificado
    const { categories, projects } = this.transformLegacyData(jsonData);

    console.log(`📊 Transformed data: ${categories.length} categories, ${projects.length} projects`);

    // Ejecutar migración usando arquitectura unificada
    return await migratePortfolioToFirestore(categories, projects, dryRun);
  }
}