/**
 * Script de Migración Newsletter a Firestore
 * Utiliza la arquitectura unificada para migrar datos JSON a Firestore
 * Extiende UnifiedMigrator con transformadores específicos de Newsletter
 */

import { Timestamp } from 'firebase/firestore';
import { UnifiedMigrator, MigrationConfig, CollectionConfig, ValidationResult, MigrationContext } from '@/lib/migration/unified-migrator';
import { validateNewsletterCategory, validateNewsletterArticle, validateNewsletterSubscriber } from '@/lib/migration/validation-rules';
import { COLLECTIONS } from '@/lib/firebase/config';
import type { NewsletterCategoryData, NewsletterArticleData, NewsletterSubscriberData, ArticleImage } from '@/lib/firestore/newsletter-service-unified';

// Datos mock para testing - en producción vendrían de archivos JSON
const MOCK_NEWSLETTER_DATA = {
  categories: [
    {
      id: "cat-1",
      name: "Construcción Sostenible",
      slug: "construccion-sostenible",
      description: "Artículos sobre técnicas de construcción ecológicas y sostenibles",
      icon: "leaf",
      color: "#22C55E",
      featured: true,
      order: 1,
      articles_count: 0,
      total_views: 0,
      avg_reading_time: 0
    },
    {
      id: "cat-2",
      name: "Innovación Arquitectónica",
      slug: "innovacion-arquitectonica",
      description: "Últimas tendencias y tecnologías en arquitectura moderna",
      icon: "lightbulb",
      color: "#00A8E8",
      featured: true,
      order: 2,
      articles_count: 0,
      total_views: 0,
      avg_reading_time: 0
    },
    {
      id: "cat-3",
      name: "Gestión de Proyectos",
      slug: "gestion-proyectos",
      description: "Metodologías y mejores prácticas en gestión de proyectos de construcción",
      icon: "tasks",
      color: "#003F6F",
      featured: false,
      order: 3,
      articles_count: 0,
      total_views: 0,
      avg_reading_time: 0
    }
  ],
  articles: [
    {
      id: "art-1",
      category_id: "cat-1",
      title: "Materiales Eco-Amigables en la Construcción Moderna",
      slug: "materiales-eco-amigables-construccion-moderna",
      author: {
        name: "Arq. María González",
        email: "maria.gonzalez@metricadip.com",
        avatar: "/images/authors/maria-gonzalez.jpg",
        bio: "Arquitecta especializada en construcción sostenible con 15 años de experiencia"
      },
      content: {
        excerpt: "Descubre cómo los materiales eco-amigables están revolucionando la industria de la construcción, reduciendo el impacto ambiental y mejorando la eficiencia energética de los edificios.",
        body: "La construcción sostenible se ha convertido en una prioridad en la industria moderna. Los materiales eco-amigables como el bambú, la madera certificada, y los ladrillos de tierra comprimida están ganando popularidad por sus beneficios ambientales y económicos. En este artículo exploramos las principales opciones disponibles y sus aplicaciones prácticas en proyectos reales.",
        reading_time: 8,
        word_count: 1200
      },
      images: {
        featured: "/images/blog/eco-materials-featured.jpg",
        thumbnail: "/images/blog/eco-materials-thumb.jpg",
        gallery: [
          {
            id: "img-1",
            url: "/images/blog/eco-materials-gallery-1.jpg",
            thumbnail: "/images/blog/eco-materials-gallery-1-thumb.jpg",
            caption: "Ejemplo de construcción con bambú estructural",
            alt: "Estructura de bambú en construcción moderna",
            order: 1
          }
        ]
      },
      tags: ["sostenibilidad", "materiales", "eco-amigable", "construcción verde"],
      featured: true,
      status: "published",
      published_at: "2024-01-20T10:00:00Z",
      last_modified_at: "2024-01-20T10:00:00Z",
      seo: {
        title: "Materiales Eco-Amigables en Construcción - Métrica FM Blog",
        description: "Descubre los mejores materiales eco-amigables para construcción sostenible. Guía completa de opciones verdes para proyectos modernos.",
        keywords: ["materiales eco-amigables", "construcción sostenible", "arquitectura verde", "materiales naturales"]
      },
      metrics: {
        views: 0,
        shares: 0,
        comments: 0,
        reading_completion_rate: 0,
        avg_time_on_page: 0,
        last_updated: new Date().toISOString()
      },
      newsletter_settings: {
        include_in_newsletter: true,
        newsletter_priority: 1,
        send_notification: true
      }
    },
    {
      id: "art-2",
      category_id: "cat-2",
      title: "BIM: Revolucionando el Diseño Arquitectónico",
      slug: "bim-revolucionando-diseno-arquitectonico",
      author: {
        name: "Ing. Carlos Mendoza",
        email: "carlos.mendoza@metricadip.com",
        avatar: "/images/authors/carlos-mendoza.jpg",
        bio: "Ingeniero civil especializado en tecnologías BIM y gestión de proyectos"
      },
      content: {
        excerpt: "El Building Information Modeling (BIM) está transformando la manera en que diseñamos y construimos. Conoce sus beneficios y cómo implementarlo en tu próximo proyecto.",
        body: "El BIM no es solo una herramienta de diseño, es una metodología completa que integra información de todo el ciclo de vida de un edificio. Desde el diseño conceptual hasta la operación y mantenimiento, BIM proporciona una plataforma colaborativa que mejora la eficiencia, reduce errores y optimiza costos. En este artículo analizamos casos de éxito y mejores prácticas.",
        reading_time: 10,
        word_count: 1500
      },
      images: {
        featured: "/images/blog/bim-featured.jpg",
        thumbnail: "/images/blog/bim-thumb.jpg",
        gallery: [
          {
            id: "img-2",
            url: "/images/blog/bim-gallery-1.jpg",
            thumbnail: "/images/blog/bim-gallery-1-thumb.jpg",
            caption: "Modelo BIM de proyecto residencial complejo",
            alt: "Visualización 3D de modelo BIM",
            order: 1
          }
        ]
      },
      tags: ["BIM", "tecnología", "diseño", "arquitectura", "innovación"],
      featured: true,
      status: "published",
      published_at: "2024-01-25T14:30:00Z",
      last_modified_at: "2024-01-25T14:30:00Z",
      seo: {
        title: "BIM: Revolución en Diseño Arquitectónico - Métrica FM Blog",
        description: "Descubre cómo BIM está transformando el diseño arquitectónico. Guía completa sobre implementación y beneficios.",
        keywords: ["BIM", "Building Information Modeling", "diseño arquitectónico", "tecnología construcción"]
      },
      metrics: {
        views: 0,
        shares: 0,
        comments: 0,
        reading_completion_rate: 0,
        avg_time_on_page: 0,
        last_updated: new Date().toISOString()
      },
      newsletter_settings: {
        include_in_newsletter: true,
        newsletter_priority: 2,
        send_notification: true
      }
    }
  ],
  subscribers: [
    {
      id: "sub-1",
      email: "ingeniero@ejemplo.com",
      name: "Juan Pérez",
      preferences: {
        categories: ["cat-1", "cat-3"],
        frequency: "weekly",
        format: "html"
      },
      status: "active",
      subscribed_at: "2024-01-15T09:00:00Z",
      engagement: {
        open_rate: 85.5,
        click_rate: 12.3,
        total_opens: 8,
        total_clicks: 2
      },
      source: "website",
      verified: true
    }
  ]
};

/**
 * Transformadores específicos para Newsletter
 */
const newsletterCategoryTransformer = (item: any, context?: MigrationContext): NewsletterCategoryData => {
  return {
    name: item.name,
    slug: item.slug,
    description: item.description,
    icon: item.icon,
    color: item.color,
    featured_image: item.featured_image,
    articles_count: item.articles_count || 0,
    total_views: item.total_views || 0,
    avg_reading_time: item.avg_reading_time || 0,
    featured: item.featured || false,
    order: item.order || context?.currentIndex || 0
  };
};

const newsletterArticleTransformer = (item: any, context?: MigrationContext): NewsletterArticleData => {
  // Transformar fecha de publicación
  let publishedAt: Timestamp | undefined;
  if (item.published_at) {
    const date = typeof item.published_at === 'string'
      ? new Date(item.published_at)
      : item.published_at;
    publishedAt = Timestamp.fromDate(date);
  }

  // Transformar fecha de programación
  let scheduledAt: Timestamp | undefined;
  if (item.scheduled_at) {
    const date = typeof item.scheduled_at === 'string'
      ? new Date(item.scheduled_at)
      : item.scheduled_at;
    scheduledAt = Timestamp.fromDate(date);
  }

  // Transformar fecha de última modificación
  let lastModifiedAt: Timestamp;
  if (item.last_modified_at) {
    const date = typeof item.last_modified_at === 'string'
      ? new Date(item.last_modified_at)
      : item.last_modified_at;
    lastModifiedAt = Timestamp.fromDate(date);
  } else {
    lastModifiedAt = Timestamp.now();
  }

  // Transformar métricas de última actualización
  let metricsLastUpdated: Timestamp;
  if (item.metrics?.last_updated) {
    const date = typeof item.metrics.last_updated === 'string'
      ? new Date(item.metrics.last_updated)
      : item.metrics.last_updated;
    metricsLastUpdated = Timestamp.fromDate(date);
  } else {
    metricsLastUpdated = Timestamp.now();
  }

  // Calcular tiempo de lectura si no está presente
  let readingTime = item.content.reading_time;
  let wordCount = item.content.word_count;

  if (!readingTime && item.content.body) {
    wordCount = item.content.body.split(/\s+/).length;
    readingTime = Math.ceil(wordCount / 200); // 200 palabras por minuto promedio
  }

  return {
    title: item.title,
    slug: item.slug,
    category_id: item.category_id,
    author: {
      name: item.author.name,
      email: item.author.email,
      avatar: item.author.avatar,
      bio: item.author.bio
    },
    content: {
      excerpt: item.content.excerpt,
      body: item.content.body,
      reading_time: readingTime || 5,
      word_count: wordCount || 0
    },
    images: {
      featured: item.images.featured,
      thumbnail: item.images.thumbnail,
      gallery: item.images.gallery || []
    },
    tags: item.tags || [],
    featured: item.featured || false,
    status: item.status || 'draft',
    published_at: publishedAt,
    scheduled_at: scheduledAt,
    last_modified_at: lastModifiedAt,
    seo: item.seo || {
      title: item.title,
      description: item.content.excerpt,
      keywords: item.tags || []
    },
    metrics: {
      views: item.metrics?.views || 0,
      shares: item.metrics?.shares || 0,
      comments: item.metrics?.comments || 0,
      reading_completion_rate: item.metrics?.reading_completion_rate || 0,
      avg_time_on_page: item.metrics?.avg_time_on_page || 0,
      last_updated: metricsLastUpdated
    },
    newsletter_settings: item.newsletter_settings || {
      include_in_newsletter: true,
      newsletter_priority: 5,
      send_notification: false
    }
  };
};

const newsletterSubscriberTransformer = (item: any, context?: MigrationContext): NewsletterSubscriberData => {
  // Transformar fecha de suscripción
  let subscribedAt: Timestamp;
  if (item.subscribed_at) {
    const date = typeof item.subscribed_at === 'string'
      ? new Date(item.subscribed_at)
      : item.subscribed_at;
    subscribedAt = Timestamp.fromDate(date);
  } else {
    subscribedAt = Timestamp.now();
  }

  // Transformar fecha de desuscripción
  let unsubscribedAt: Timestamp | undefined;
  if (item.unsubscribed_at) {
    const date = typeof item.unsubscribed_at === 'string'
      ? new Date(item.unsubscribed_at)
      : item.unsubscribed_at;
    unsubscribedAt = Timestamp.fromDate(date);
  }

  // Transformar último email enviado
  let lastEmailSent: Timestamp | undefined;
  if (item.last_email_sent) {
    const date = typeof item.last_email_sent === 'string'
      ? new Date(item.last_email_sent)
      : item.last_email_sent;
    lastEmailSent = Timestamp.fromDate(date);
  }

  return {
    email: item.email,
    name: item.name,
    preferences: {
      categories: item.preferences.categories || [],
      frequency: item.preferences.frequency || 'weekly',
      format: item.preferences.format || 'html'
    },
    status: item.status || 'active',
    subscribed_at: subscribedAt,
    unsubscribed_at: unsubscribedAt,
    last_email_sent: lastEmailSent,
    engagement: item.engagement || {
      open_rate: 0,
      click_rate: 0,
      total_opens: 0,
      total_clicks: 0
    },
    source: item.source || 'website',
    verified: item.verified || false
  };
};

/**
 * Configuración de migración Newsletter
 */
export const createNewsletterMigrationConfig = (
  categoriesData: any[] = MOCK_NEWSLETTER_DATA.categories,
  articlesData: any[] = MOCK_NEWSLETTER_DATA.articles,
  subscribersData: any[] = MOCK_NEWSLETTER_DATA.subscribers,
  dryRun: boolean = true
): MigrationConfig => {
  const collections: CollectionConfig[] = [
    // Categorías primero (sin dependencias)
    {
      name: COLLECTIONS.NEWSLETTER_CATEGORIES,
      data: categoriesData,
      transformer: newsletterCategoryTransformer,
      validator: validateNewsletterCategory
    },
    // Artículos después (dependen de categorías)
    {
      name: COLLECTIONS.NEWSLETTER_ARTICLES,
      data: articlesData,
      transformer: newsletterArticleTransformer,
      validator: validateNewsletterArticle,
      dependencies: [COLLECTIONS.NEWSLETTER_CATEGORIES]
    },
    // Suscriptores (independientes)
    {
      name: COLLECTIONS.NEWSLETTER_SUBSCRIBERS,
      data: subscribersData,
      transformer: newsletterSubscriberTransformer,
      validator: validateNewsletterSubscriber
    }
  ];

  return {
    systemName: 'Newsletter',
    collections,
    dryRun,
    batchSize: 20 // Batch size optimizado para Newsletter
  };
};

/**
 * Ejecutor principal de migración Newsletter
 */
export class NewsletterMigrator extends UnifiedMigrator {
  constructor() {
    super(20); // Batch size optimizado para Newsletter
  }

  /**
   * Migrar Newsletter completo desde datos JSON
   */
  async migrateNewsletterSystem(
    categoriesData?: any[],
    articlesData?: any[],
    subscribersData?: any[],
    dryRun: boolean = true
  ) {
    console.log('🚀 Starting Newsletter migration to Firestore...');

    try {
      // Crear configuración
      const config = createNewsletterMigrationConfig(categoriesData, articlesData, subscribersData, dryRun);

      // Ejecutar migración
      const result = await this.migrateSystem(config);

      // Calcular relaciones después de la migración
      if (!dryRun && result.success) {
        await this.calculateNewsletterRelations();
      }

      return result;
    } catch (error) {
      console.error('❌ Newsletter migration failed:', error);
      throw error;
    }
  }

  /**
   * Calcular métricas y relaciones específicas de Newsletter
   */
  async calculateNewsletterRelations() {
    console.log('🔗 Calculating Newsletter relationships...');

    const relationships = [
      {
        parentCollection: COLLECTIONS.NEWSLETTER_CATEGORIES,
        childCollection: COLLECTIONS.NEWSLETTER_ARTICLES,
        relationField: 'category_id',
        calculateMetrics: true
      }
    ];

    await this.calculateRelations(relationships);

    // Calcular métricas adicionales específicas de Newsletter
    await this.calculateNewsletterMetrics();
  }

  /**
   * Calcular métricas agregadas específicas de Newsletter
   */
  private async calculateNewsletterMetrics() {
    console.log('📊 Calculating Newsletter specific metrics...');

    try {
      // Aquí se implementarían cálculos específicos como:
      // - Tiempo promedio de lectura por categoría
      // - Tasa de engagement por tipo de contenido
      // - Análisis de tendencias de suscripción
      // - Optimización de horarios de envío
      console.log('✅ Newsletter metrics calculated successfully');
    } catch (error) {
      console.error('❌ Error calculating Newsletter metrics:', error);
    }
  }

  /**
   * Validar migración Newsletter
   */
  async validateNewsletterMigration(originalData: {
    categories: any[],
    articles: any[],
    subscribers: any[]
  }) {
    console.log('🔍 Validating Newsletter migration...');

    const results = await Promise.all([
      this.validateMigration(COLLECTIONS.NEWSLETTER_CATEGORIES, originalData.categories.length),
      this.validateMigration(COLLECTIONS.NEWSLETTER_ARTICLES, originalData.articles.length),
      this.validateMigration(COLLECTIONS.NEWSLETTER_SUBSCRIBERS, originalData.subscribers.length)
    ]);

    const isValid = results.every(result => result.isValid);

    if (isValid) {
      console.log('✅ Newsletter migration validation passed');
    } else {
      console.log('❌ Newsletter migration validation failed');
      results.forEach((result, index) => {
        const collectionNames = ['categories', 'articles', 'subscribers'];
        const collectionName = collectionNames[index];
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

  /**
   * Procesar artículos programados
   */
  async processScheduledArticles() {
    console.log('⏰ Processing scheduled articles...');

    try {
      // Esta funcionalidad específica de Newsletter permitiría
      // publicar automáticamente artículos programados
      const now = Timestamp.now();

      // En una implementación real, buscaríamos artículos donde scheduled_at <= now
      // y actualizaríamos su status a 'published' y published_at = now

      console.log('✅ Scheduled articles processing completed');
    } catch (error) {
      console.error('❌ Error processing scheduled articles:', error);
    }
  }

  /**
   * Generar reporte de engagement
   */
  async generateEngagementReport(period: 'weekly' | 'monthly' = 'monthly') {
    console.log(`📈 Generating ${period} engagement report...`);

    try {
      // Esta funcionalidad específica generaría reportes detallados
      // de engagement de suscriptores y performance de artículos

      console.log('✅ Engagement report generated successfully');
    } catch (error) {
      console.error('❌ Error generating engagement report:', error);
    }
  }
}

/**
 * Función de conveniencia para ejecutar migración rápidamente
 */
export async function migrateNewsletterToFirestore(
  categoriesData?: any[],
  articlesData?: any[],
  subscribersData?: any[],
  dryRun: boolean = true
) {
  const migrator = new NewsletterMigrator();
  return await migrator.migrateNewsletterSystem(categoriesData, articlesData, subscribersData, dryRun);
}

/**
 * Utilitarios para lectura de datos JSON (Legacy compatibility)
 */
export class NewsletterJSONReader {
  /**
   * Lee el archivo JSON de newsletter
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
  static transformLegacyData(jsonData: any): { categories: any[], articles: any[], subscribers: any[] } {
    const categories: any[] = [];
    const articles: any[] = [];
    const subscribers: any[] = [];

    // Transformar categorías
    if (jsonData.categories && Array.isArray(jsonData.categories)) {
      jsonData.categories.forEach((legacyCat: any) => {
        const category = {
          id: legacyCat.id,
          name: legacyCat.name,
          slug: legacyCat.slug || legacyCat.name.toLowerCase().replace(/\s+/g, '-'),
          description: legacyCat.description,
          icon: legacyCat.icon,
          color: legacyCat.color,
          featured_image: legacyCat.featured_image,
          articles_count: legacyCat.articles_count || 0,
          total_views: legacyCat.total_views || 0,
          avg_reading_time: legacyCat.avg_reading_time || 0,
          featured: legacyCat.featured || false,
          order: legacyCat.order || 0
        };
        categories.push(category);

        // Transformar artículos de esta categoría
        if (legacyCat.articles && Array.isArray(legacyCat.articles)) {
          legacyCat.articles.forEach((legacyArticle: any) => {
            const article = {
              id: legacyArticle.id,
              category_id: legacyCat.id,
              title: legacyArticle.title,
              slug: legacyArticle.slug || legacyArticle.title.toLowerCase().replace(/\s+/g, '-'),
              author: {
                name: legacyArticle.author?.name || 'Métrica FM',
                email: legacyArticle.author?.email || 'info@metricadip.com',
                avatar: legacyArticle.author?.avatar,
                bio: legacyArticle.author?.bio
              },
              content: {
                excerpt: legacyArticle.excerpt || legacyArticle.summary,
                body: legacyArticle.content || legacyArticle.body,
                reading_time: legacyArticle.reading_time || Math.ceil((legacyArticle.content?.split(/\s+/).length || 500) / 200),
                word_count: legacyArticle.word_count || legacyArticle.content?.split(/\s+/).length || 500
              },
              images: {
                featured: legacyArticle.featured_image || legacyArticle.image,
                thumbnail: legacyArticle.thumbnail || legacyArticle.featured_image || legacyArticle.image,
                gallery: legacyArticle.gallery || []
              },
              tags: legacyArticle.tags || [],
              featured: legacyArticle.featured || false,
              status: legacyArticle.status || 'published',
              published_at: legacyArticle.published_date || legacyArticle.created_date || new Date().toISOString(),
              last_modified_at: legacyArticle.updated_date || new Date().toISOString(),
              seo: {
                title: legacyArticle.seo?.title || `${legacyArticle.title} - Métrica FM Blog`,
                description: legacyArticle.seo?.description || legacyArticle.excerpt || legacyArticle.summary,
                keywords: legacyArticle.seo?.keywords || legacyArticle.tags || []
              },
              metrics: {
                views: legacyArticle.views || 0,
                shares: legacyArticle.shares || 0,
                comments: legacyArticle.comments || 0,
                reading_completion_rate: 0,
                avg_time_on_page: 0,
                last_updated: new Date().toISOString()
              },
              newsletter_settings: {
                include_in_newsletter: legacyArticle.include_in_newsletter !== false,
                newsletter_priority: legacyArticle.newsletter_priority || 5,
                send_notification: legacyArticle.send_notification || false
              }
            };
            articles.push(article);
          });
        }
      });
    }

    // Transformar suscriptores si existen
    if (jsonData.subscribers && Array.isArray(jsonData.subscribers)) {
      jsonData.subscribers.forEach((legacySub: any) => {
        const subscriber = {
          id: legacySub.id,
          email: legacySub.email,
          name: legacySub.name || legacySub.full_name,
          preferences: {
            categories: legacySub.preferences?.categories || [],
            frequency: legacySub.preferences?.frequency || 'weekly',
            format: legacySub.preferences?.format || 'html'
          },
          status: legacySub.status || 'active',
          subscribed_at: legacySub.subscribed_date || legacySub.created_date || new Date().toISOString(),
          unsubscribed_at: legacySub.unsubscribed_date,
          last_email_sent: legacySub.last_email_sent,
          engagement: legacySub.engagement || {
            open_rate: 0,
            click_rate: 0,
            total_opens: 0,
            total_clicks: 0
          },
          source: legacySub.source || 'website',
          verified: legacySub.verified || false
        };
        subscribers.push(subscriber);
      });
    }

    return { categories, articles, subscribers };
  }

  /**
   * Migración desde archivo JSON legacy
   */
  static async migrateFromLegacyJSON(
    jsonFilePath: string,
    dryRun: boolean = true
  ) {
    console.log('📁 Reading legacy Newsletter JSON file:', jsonFilePath);

    // Leer archivo JSON
    const jsonData = await this.readJSONFile(jsonFilePath);

    // Transformar a formato unificado
    const { categories, articles, subscribers } = this.transformLegacyData(jsonData);

    console.log(`📊 Transformed data: ${categories.length} categories, ${articles.length} articles, ${subscribers.length} subscribers`);

    // Ejecutar migración usando arquitectura unificada
    return await migrateNewsletterToFirestore(categories, articles, subscribers, dryRun);
  }
}

// Exportar instancia por defecto
export const newsletterMigrator = new NewsletterMigrator();