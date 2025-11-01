/**
 * Sistema SEO Unificado - Compatible con Fase 6
 * Generación automática de metadatos para todos los sistemas
 * Newsletter, Portfolio, Careers con configuración centralizada
 */

import type { Metadata } from 'next';
import { SystemType } from '@/hooks/useUnifiedData';
import { UnifiedCardData } from '@/components/public/UnifiedCard';

// Tipos para el sistema SEO
export type PageType = 'home' | 'list' | 'category' | 'detail';

export interface SEOConfig {
  systemName: string;
  baseUrl: string;
  siteName: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultImage: string;
  twitterHandle?: string;
  fbAppId?: string;
}

export interface SEOData {
  title?: string;
  description?: string;
  image?: string;
  keywords?: string[];
  author?: string;
  publishedDate?: Date;
  modifiedDate?: Date;
  category?: string;
  tags?: string[];
  type?: 'article' | 'website' | 'product' | 'job';
  price?: {
    amount: number;
    currency: string;
  };
  location?: {
    city: string;
    region: string;
    country: string;
  };
}

// Configuraciones base por sistema
const SYSTEM_CONFIGS: Record<SystemType, SEOConfig> = {
  newsletter: {
    systemName: 'Blog',
    baseUrl: '/blog',
    siteName: 'Métrica FM Blog',
    defaultTitle: 'Blog Métrica FM - Construcción e Infraestructura',
    defaultDescription: 'Artículos especializados sobre construcción, arquitectura, ingeniería y gestión de proyectos en Perú.',
    defaultImage: '/images/seo/newsletter-default.jpg',
    twitterHandle: '@metrica_dip'
  },
  portfolio: {
    systemName: 'Portfolio',
    baseUrl: '/portfolio',
    siteName: 'Métrica FM Portfolio',
    defaultTitle: 'Portfolio Métrica FM - Proyectos de Construcción',
    defaultDescription: 'Proyectos destacados de construcción e infraestructura ejecutados por Métrica FM en Perú.',
    defaultImage: '/images/seo/portfolio-default.jpg',
    twitterHandle: '@metrica_dip'
  },
  careers: {
    systemName: 'Careers',
    baseUrl: '/careers',
    siteName: 'Métrica FM Careers',
    defaultTitle: 'Trabaja con Nosotros - Métrica FM Careers',
    defaultDescription: 'Únete al equipo de Métrica FM. Oportunidades laborales en construcción, arquitectura e ingeniería.',
    defaultImage: '/images/seo/careers-default.jpg',
    twitterHandle: '@metrica_dip'
  }
};

/**
 * Generador SEO Unificado
 */
export class UnifiedSEO {
  private config: SEOConfig;

  constructor(system: SystemType) {
    this.config = SYSTEM_CONFIGS[system];
  }

  /**
   * Generar metadatos completos para cualquier página
   */
  generateMetadata(pageType: PageType, data?: SEOData): Metadata {
    const title = this.generateTitle(pageType, data);
    const description = this.generateDescription(pageType, data);
    const canonicalUrl = this.generateCanonicalUrl(pageType, data);

    const metadata: Metadata = {
      title,
      description,
      keywords: data?.keywords?.join(', '),

      // Open Graph
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: this.config.siteName,
        images: [
          {
            url: data?.image || this.config.defaultImage,
            width: 1200,
            height: 630,
            alt: title
          }
        ],
        locale: 'es_PE',
        type: this.getOGType(pageType, data?.type)
      },

      // Twitter
      twitter: {
        card: 'summary_large_image',
        site: this.config.twitterHandle,
        creator: this.config.twitterHandle,
        title,
        description,
        images: [data?.image || this.config.defaultImage]
      },

      // Robots
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1
        }
      },

      // Alternates
      alternates: {
        canonical: canonicalUrl
      },

      // Authors
      authors: data?.author ? [{ name: data.author }] : undefined,

      // Publishing dates
      ...(data?.publishedDate && {
        other: {
          'article:published_time': data.publishedDate.toISOString()
        }
      }),
      ...(data?.modifiedDate && {
        other: {
          'article:modified_time': data.modifiedDate.toISOString()
        }
      })
    };

    return metadata;
  }

  /**
   * Generar structured data JSON-LD
   */
  generateStructuredData(pageType: PageType, data?: SEOData): any {
    const baseData = {
      '@context': 'https://schema.org',
      '@type': this.getSchemaType(pageType, data?.type),
      name: data?.title || this.config.defaultTitle,
      description: data?.description || this.config.defaultDescription,
      url: this.generateCanonicalUrl(pageType, data),
      image: data?.image || this.config.defaultImage,
      publisher: {
        '@type': 'Organization',
        name: 'Métrica FM',
        logo: {
          '@type': 'ImageObject',
          url: '/images/logo/metrica-dip-logo.png'
        }
      }
    };

    // Datos específicos por tipo de página
    switch (pageType) {
      case 'detail':
        if (this.config.systemName === 'Blog') {
          return this.generateArticleStructuredData(baseData, data);
        } else if (this.config.systemName === 'Portfolio') {
          return this.generateProjectStructuredData(baseData, data);
        } else if (this.config.systemName === 'Careers') {
          return this.generateJobStructuredData(baseData, data);
        }
        break;

      case 'list':
      case 'category':
        return {
          ...baseData,
          '@type': 'CollectionPage',
          mainEntity: {
            '@type': 'ItemList',
            name: data?.title || baseData.name,
            description: data?.description || baseData.description
          }
        };

      default:
        return baseData;
    }

    return baseData;
  }

  // ==========================================
  // GENERADORES ESPECÍFICOS
  // ==========================================

  private generateTitle(pageType: PageType, data?: SEOData): string {
    if (data?.title) {
      const suffix = ` | ${this.config.siteName}`;
      return data.title + suffix;
    }

    switch (pageType) {
      case 'home':
        return this.config.defaultTitle;
      case 'list':
        return `${this.config.systemName} | ${this.config.siteName}`;
      case 'category':
        return data?.category ?
          `${data.category} | ${this.config.systemName} | ${this.config.siteName}` :
          `${this.config.systemName} | ${this.config.siteName}`;
      default:
        return this.config.defaultTitle;
    }
  }

  private generateDescription(pageType: PageType, data?: SEOData): string {
    if (data?.description) {
      return data.description;
    }

    switch (pageType) {
      case 'category':
        if (this.config.systemName === 'Portfolio') {
          return `Proyectos de ${data?.category?.toLowerCase()} ejecutados por Métrica FM. Construcción e infraestructura de calidad en Perú.`;
        } else if (this.config.systemName === 'Careers') {
          return `Oportunidades laborales en ${data?.category?.toLowerCase()} en Métrica FM. Únete a nuestro equipo de profesionales.`;
        }
        break;
    }

    return this.config.defaultDescription;
  }

  private generateCanonicalUrl(pageType: PageType, data?: SEOData): string {
    const baseUrl = 'https://metricadip.com';

    switch (pageType) {
      case 'home':
        return baseUrl + this.config.baseUrl;
      case 'category':
        return data?.category ?
          `${baseUrl}${this.config.baseUrl}/${data.category.toLowerCase()}` :
          baseUrl + this.config.baseUrl;
      case 'detail':
        // Esto debería ser proporcionado por el llamador
        return baseUrl + this.config.baseUrl;
      default:
        return baseUrl + this.config.baseUrl;
    }
  }

  private getOGType(pageType: PageType, dataType?: string): 'website' | 'article' {
    if (pageType === 'detail' && this.config.systemName === 'Blog') {
      return 'article';
    }
    return 'website';
  }

  private getSchemaType(pageType: PageType, dataType?: string): string {
    if (pageType === 'detail') {
      if (this.config.systemName === 'Blog') return 'Article';
      if (this.config.systemName === 'Portfolio') return 'CreativeWork';
      if (this.config.systemName === 'Careers') return 'JobPosting';
    }

    return 'WebPage';
  }

  // ==========================================
  // STRUCTURED DATA ESPECÍFICO
  // ==========================================

  private generateArticleStructuredData(baseData: any, data?: SEOData): any {
    return {
      ...baseData,
      '@type': 'Article',
      headline: data?.title || baseData.name,
      author: data?.author ? {
        '@type': 'Person',
        name: data.author
      } : undefined,
      datePublished: data?.publishedDate?.toISOString(),
      dateModified: data?.modifiedDate?.toISOString(),
      keywords: data?.keywords?.join(', '),
      articleSection: data?.category,
      wordCount: data?.description?.length || 0
    };
  }

  private generateProjectStructuredData(baseData: any, data?: SEOData): any {
    return {
      ...baseData,
      '@type': 'CreativeWork',
      creator: {
        '@type': 'Organization',
        name: 'Métrica FM'
      },
      dateCreated: data?.publishedDate?.toISOString(),
      category: data?.category,
      keywords: data?.keywords?.join(', '),
      ...(data?.location && {
        locationCreated: {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressLocality: data.location.city,
            addressRegion: data.location.region,
            addressCountry: data.location.country
          }
        }
      })
    };
  }

  private generateJobStructuredData(baseData: any, data?: SEOData): any {
    return {
      ...baseData,
      '@type': 'JobPosting',
      hiringOrganization: {
        '@type': 'Organization',
        name: 'Métrica FM',
        sameAs: 'https://metricadip.com',
        logo: '/images/logo/metrica-dip-logo.png'
      },
      datePosted: data?.publishedDate?.toISOString(),
      validThrough: data?.modifiedDate?.toISOString(),
      employmentType: 'FULL_TIME',
      ...(data?.location && {
        jobLocation: {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressLocality: data.location.city,
            addressRegion: data.location.region,
            addressCountry: data.location.country
          }
        }
      }),
      ...(data?.price && {
        baseSalary: {
          '@type': 'MonetaryAmount',
          currency: data.price.currency,
          value: {
            '@type': 'QuantitativeValue',
            value: data.price.amount,
            unitText: 'MONTH'
          }
        }
      })
    };
  }
}

// ==========================================
// UTILIDADES DE CONVENIENCIA
// ==========================================

/**
 * Generar metadatos rápidamente para cualquier sistema
 */
export function generateSEO(
  system: SystemType,
  pageType: PageType,
  data?: SEOData
): { metadata: Metadata; structuredData: any } {
  const seo = new UnifiedSEO(system);

  return {
    metadata: seo.generateMetadata(pageType, data),
    structuredData: seo.generateStructuredData(pageType, data)
  };
}

/**
 * Generar keywords automáticamente basado en contenido
 */
export function generateKeywords(
  system: SystemType,
  content: {
    title?: string;
    description?: string;
    category?: string;
    tags?: string[];
  }
): string[] {
  const baseKeywords = {
    newsletter: ['construcción', 'arquitectura', 'ingeniería', 'proyectos', 'Perú', 'infraestructura'],
    portfolio: ['portfolio', 'proyectos', 'construcción', 'obras', 'arquitectura', 'Métrica FM'],
    careers: ['empleos', 'trabajo', 'construcción', 'ingeniería', 'arquitectura', 'carrera profesional']
  };

  const keywords = [...baseKeywords[system]];

  if (content.category) {
    keywords.push(content.category.toLowerCase());
  }

  if (content.tags) {
    keywords.push(...content.tags.map(tag => tag.toLowerCase()));
  }

  // Extraer keywords del título y descripción
  const text = [content.title, content.description].join(' ').toLowerCase();
  const commonWords = ['construcción', 'arquitectura', 'ingeniería', 'proyecto', 'diseño', 'obra'];

  commonWords.forEach(word => {
    if (text.includes(word) && !keywords.includes(word)) {
      keywords.push(word);
    }
  });

  return [...new Set(keywords)]; // Eliminar duplicados
}

// ==========================================
// FUNCIONES COMPATIBLES CON FASE 6
// ==========================================

/**
 * Generar SEO metadata desde UnifiedCardData
 */
export function generateSEOFromCard(
  system: SystemType,
  data: UnifiedCardData,
  pageType: PageType = 'detail'
): { metadata: Metadata; structuredData: any } {
  const seoData: SEOData = {
    title: data.title,
    description: data.description || data.excerpt || data.short_description,
    image: data.image || data.featuredImage,
    keywords: generateKeywords(system, {
      title: data.title,
      description: data.description || data.excerpt || data.short_description,
      category: data.category,
      tags: data.tags
    }),
    author: data.author?.name,
    publishedDate: data.publishedAt || data.postedDate,
    category: data.category,
    tags: data.tags,
    location: data.location ? {
      city: data.location.city,
      region: data.location.country || 'Lima',
      country: 'PE'
    } : undefined,
    price: data.salary ? {
      amount: (data.salary.min + data.salary.max) / 2,
      currency: data.salary.currency
    } : undefined
  };

  const seo = new UnifiedSEO(system);
  return {
    metadata: seo.generateMetadata(pageType, seoData),
    structuredData: seo.generateStructuredData(pageType, seoData)
  };
}

/**
 * Generar SEO para listas con datos unificados
 */
export function generateListSEOFromData(
  system: SystemType,
  items: UnifiedCardData[],
  options?: {
    category?: string;
    page?: number;
    totalCount?: number;
    filters?: Record<string, any>;
  }
): { metadata: Metadata; structuredData: any } {
  const { category, page = 1, totalCount, filters } = options || {};

  const seoData: SEOData = {
    category,
    keywords: generateKeywords(system, { category }),
    ...(totalCount && {
      description: `${totalCount} elementos disponibles en ${system}`
    })
  };

  // Ajustar título para paginación
  if (page > 1) {
    seoData.title = `Página ${page}`;
  }

  const seo = new UnifiedSEO(system);
  const pageType = category ? 'category' : 'list';

  return {
    metadata: seo.generateMetadata(pageType, seoData),
    structuredData: seo.generateStructuredData(pageType, seoData)
  };
}

/**
 * Utilidad para generar breadcrumbs SEO
 */
export function generateBreadcrumbStructuredData(
  system: SystemType,
  breadcrumbs: Array<{ name: string; url: string }>
): any {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `https://metricadip.com${crumb.url}`
    }))
  };
}

/**
 * Generar JSON-LD script tag para insertar en páginas
 */
export function generateJSONLD(structuredData: any): string {
  return `<script type="application/ld+json">
${JSON.stringify(structuredData, null, 2)}
</script>`;
}

/**
 * Validar y limpiar datos SEO
 */
export function sanitizeSEOData(data: Partial<SEOData>): SEOData {
  return {
    title: data.title?.slice(0, 60), // Limitar título
    description: data.description?.slice(0, 160), // Limitar descripción
    keywords: data.keywords?.slice(0, 10), // Máximo 10 keywords
    author: data.author,
    publishedDate: data.publishedDate,
    modifiedDate: data.modifiedDate,
    category: data.category,
    tags: data.tags?.slice(0, 5), // Máximo 5 tags
    type: data.type,
    price: data.price,
    location: data.location,
    image: data.image
  };
}