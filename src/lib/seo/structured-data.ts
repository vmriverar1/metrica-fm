// FASE 5D: SEO Structured Data & Meta Tags Optimization
// Sistema completo de SEO para Firebase App Hosting

import type { Metadata } from 'next';

// Datos de la empresa
export const COMPANY_DATA = {
  name: 'Métrica FM',
  legalName: 'Métrica FM S.A.C.',
  description: 'Empresa líder en gerencia de proyectos, supervisión de obras y desarrollo de ingeniería en Perú. Especialistas en construcción, infraestructura y consultoría técnica.',
  url: 'https://metrica-dip.com',
  logo: 'https://metrica-dip.com/icons/icon-512x512.png',
  address: {
    streetAddress: 'Av. Javier Prado Este 1066',
    addressLocality: 'San Isidro',
    addressRegion: 'Lima',
    postalCode: '15036',
    addressCountry: 'PE',
  },
  contact: {
    telephone: '+51 1 234-5678',
    email: 'info@metrica-dip.com',
  },
  social: {
    facebook: 'https://facebook.com/metricadip',
    linkedin: 'https://linkedin.com/company/metrica-dip',
    instagram: 'https://instagram.com/metricadip',
  },
  foundingDate: '2015-01-01',
  employees: '11-50',
  industry: 'Construction',
  areaServed: 'PE',
};

// Servicios principales
export const SERVICES_DATA = [
  {
    name: 'Gerencia de Proyectos',
    description: 'Gestión integral de proyectos de construcción e ingeniería',
    serviceType: 'Project Management',
  },
  {
    name: 'Supervisión de Obras',
    description: 'Supervisión técnica especializada para obras de construcción',
    serviceType: 'Construction Supervision',
  },
  {
    name: 'Desarrollo de Ingeniería',
    description: 'Desarrollo de proyectos de ingeniería civil e industrial',
    serviceType: 'Engineering Development',
  },
  {
    name: 'Consultoría Técnica',
    description: 'Asesoría especializada en construcción e ingeniería',
    serviceType: 'Technical Consulting',
  },
];

// Schema.org Types
export interface JsonLdObject {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

export class StructuredDataGenerator {
  // Organization Schema
  generateOrganizationSchema(): JsonLdObject {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: COMPANY_DATA.name,
      legalName: COMPANY_DATA.legalName,
      url: COMPANY_DATA.url,
      logo: COMPANY_DATA.logo,
      description: COMPANY_DATA.description,
      foundingDate: COMPANY_DATA.foundingDate,
      numberOfEmployees: COMPANY_DATA.employees,
      industry: COMPANY_DATA.industry,
      areaServed: {
        '@type': 'Country',
        name: 'Peru',
        sameAs: 'https://en.wikipedia.org/wiki/Peru',
      },
      address: {
        '@type': 'PostalAddress',
        streetAddress: COMPANY_DATA.address.streetAddress,
        addressLocality: COMPANY_DATA.address.addressLocality,
        addressRegion: COMPANY_DATA.address.addressRegion,
        postalCode: COMPANY_DATA.address.postalCode,
        addressCountry: COMPANY_DATA.address.addressCountry,
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: COMPANY_DATA.contact.telephone,
        email: COMPANY_DATA.contact.email,
        contactType: 'Customer Service',
        availableLanguage: ['Spanish', 'English'],
      },
      sameAs: [
        COMPANY_DATA.social.facebook,
        COMPANY_DATA.social.linkedin,
        COMPANY_DATA.social.instagram,
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Servicios de Ingeniería y Construcción',
        itemListElement: SERVICES_DATA.map(service => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: service.name,
            description: service.description,
            serviceType: service.serviceType,
            provider: {
              '@type': 'Organization',
              name: COMPANY_DATA.name,
            },
            areaServed: {
              '@type': 'Country',
              name: 'Peru',
            },
          },
        })),
      },
    };
  }

  // Website Schema
  generateWebsiteSchema(): JsonLdObject {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: COMPANY_DATA.name,
      url: COMPANY_DATA.url,
      description: COMPANY_DATA.description,
      publisher: {
        '@type': 'Organization',
        name: COMPANY_DATA.name,
        logo: COMPANY_DATA.logo,
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${COMPANY_DATA.url}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    };
  }

  // Service Schema for specific service pages
  generateServiceSchema(service: typeof SERVICES_DATA[0]): JsonLdObject {
    return {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: service.name,
      description: service.description,
      serviceType: service.serviceType,
      provider: {
        '@type': 'Organization',
        name: COMPANY_DATA.name,
        url: COMPANY_DATA.url,
        logo: COMPANY_DATA.logo,
        address: {
          '@type': 'PostalAddress',
          streetAddress: COMPANY_DATA.address.streetAddress,
          addressLocality: COMPANY_DATA.address.addressLocality,
          addressRegion: COMPANY_DATA.address.addressRegion,
          addressCountry: COMPANY_DATA.address.addressCountry,
        },
      },
      areaServed: {
        '@type': 'Country',
        name: 'Peru',
        sameAs: 'https://en.wikipedia.org/wiki/Peru',
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: service.name,
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: service.name,
              description: service.description,
            },
          },
        ],
      },
    };
  }

  // Portfolio/Project Schema
  generateProjectSchema(project: any): JsonLdObject {
    return {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      '@id': `${COMPANY_DATA.url}/portfolio/${project.slug}`,
      name: project.title,
      description: project.description,
      creator: {
        '@type': 'Organization',
        name: COMPANY_DATA.name,
        url: COMPANY_DATA.url,
      },
      dateCreated: project.startDate,
      dateModified: project.endDate || project.startDate,
      image: project.images?.[0]?.url || `${COMPANY_DATA.url}/images/default-project.jpg`,
      url: `${COMPANY_DATA.url}/portfolio/${project.slug}`,
      keywords: project.tags?.join(', ') || 'ingeniería, construcción, proyecto',
      genre: project.category || 'Construction Project',
      locationCreated: {
        '@type': 'Place',
        name: project.location || 'Peru',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'PE',
        },
      },
    };
  }

  // Breadcrumb Schema
  generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>): JsonLdObject {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: crumb.url,
      })),
    };
  }

  // FAQ Schema
  generateFAQSchema(faqs: Array<{ question: string; answer: string }>): JsonLdObject {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };
  }

  // Generate all schemas for a page
  generatePageSchemas(pageType: string, data?: any): JsonLdObject[] {
    const schemas: JsonLdObject[] = [
      this.generateOrganizationSchema(),
      this.generateWebsiteSchema(),
    ];

    switch (pageType) {
      case 'homepage':
        // Homepage includes all main schemas
        break;

      case 'services':
        SERVICES_DATA.forEach(service => {
          schemas.push(this.generateServiceSchema(service));
        });
        break;

      case 'service':
        if (data?.service) {
          schemas.push(this.generateServiceSchema(data.service));
        }
        break;

      case 'portfolio':
        if (data?.projects) {
          data.projects.forEach((project: any) => {
            schemas.push(this.generateProjectSchema(project));
          });
        }
        break;

      case 'project':
        if (data?.project) {
          schemas.push(this.generateProjectSchema(data.project));
        }
        break;

      case 'contact':
        // Contact page uses base organization schema
        break;
    }

    if (data?.breadcrumbs) {
      schemas.push(this.generateBreadcrumbSchema(data.breadcrumbs));
    }

    if (data?.faqs) {
      schemas.push(this.generateFAQSchema(data.faqs));
    }

    return schemas;
  }
}

// Meta tags generator
export class MetaTagsGenerator {
  generateBaseMeta(title: string, description: string, path: string = '/'): Metadata {
    const url = `${COMPANY_DATA.url}${path}`;

    return {
      title,
      description,
      keywords: 'ingeniería, construcción, gerencia proyectos, supervisión obras, Perú, Lima, infraestructura',
      authors: [{ name: COMPANY_DATA.name }],
      creator: COMPANY_DATA.name,
      publisher: COMPANY_DATA.name,
      formatDetection: {
        email: false,
        address: false,
        telephone: false,
      },
      metadataBase: new URL(COMPANY_DATA.url),
      alternates: {
        canonical: url,
      },
      openGraph: {
        title,
        description,
        url,
        siteName: COMPANY_DATA.name,
        images: [
          {
            url: `${COMPANY_DATA.url}/images/og-image.jpg`,
            width: 1200,
            height: 630,
            alt: `${COMPANY_DATA.name} - ${title}`,
          },
        ],
        locale: 'es_PE',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [`${COMPANY_DATA.url}/images/og-image.jpg`],
        creator: '@metricadip',
        site: '@metricadip',
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      verification: {
        google: 'your-google-site-verification-code',
        yandex: 'your-yandex-verification-code',
      },
    };
  }

  generateHomepageMeta(): Metadata {
    return this.generateBaseMeta(
      'Métrica FM - Ingeniería y Construcción en Perú | Gerencia de Proyectos',
      'Empresa líder en gerencia de proyectos, supervisión de obras y desarrollo de ingeniería en Perú. Especialistas en construcción, infraestructura y consultoría técnica.',
      '/'
    );
  }

  generateServicesMeta(): Metadata {
    return this.generateBaseMeta(
      'Servicios de Ingeniería y Construcción | Métrica FM',
      'Descubre nuestros servicios especializados: gerencia de proyectos, supervisión de obras, desarrollo de ingeniería y consultoría técnica en Perú.',
      '/services'
    );
  }

  generatePortfolioMeta(): Metadata {
    return this.generateBaseMeta(
      'Portfolio de Proyectos | Métrica FM',
      'Conoce nuestros proyectos destacados en construcción e ingeniería. Portfolio completo de obras supervisadas y proyectos desarrollados en Perú.',
      '/portfolio'
    );
  }

  generateContactMeta(): Metadata {
    return this.generateBaseMeta(
      'Contacto | Métrica FM - Ingeniería y Construcción',
      'Contáctanos para tu próximo proyecto de construcción o ingeniería. Ubicados en San Isidro, Lima, Perú. Consulta gratuita disponible.',
      '/contact'
    );
  }

  generateProjectMeta(project: any): Metadata {
    const meta = this.generateBaseMeta(
      `${project.title} | Portfolio Métrica FM`,
      project.description || `Proyecto ${project.title} desarrollado por Métrica FM. Especialistas en ingeniería y construcción en Perú.`,
      `/portfolio/${project.slug}`
    );

    // Override with project-specific data
    if (project.images?.[0]?.url) {
      meta.openGraph!.images = [
        {
          url: project.images[0].url,
          width: 1200,
          height: 630,
          alt: `${project.title} - Métrica FM`,
        },
      ];
      meta.twitter!.images = [project.images[0].url];
    }

    return meta;
  }
}

// Singleton instances
export const structuredData = new StructuredDataGenerator();
export const metaTags = new MetaTagsGenerator();

// Helper function to inject structured data into HTML
export function injectStructuredData(schemas: JsonLdObject[]): string {
  return schemas
    .map(schema => `<script type="application/ld+json">${JSON.stringify(schema, null, 0)}</script>`)
    .join('\n');
}

// React hook for SEO
export function useSEO(pageType: string, data?: any) {
  const schemas = structuredData.generatePageSchemas(pageType, data);
  const structuredDataScript = injectStructuredData(schemas);

  return {
    schemas,
    structuredDataScript,
    metaTags: {
      homepage: metaTags.generateHomepageMeta(),
      services: metaTags.generateServicesMeta(),
      portfolio: metaTags.generatePortfolioMeta(),
      contact: metaTags.generateContactMeta(),
      project: (project: any) => metaTags.generateProjectMeta(project),
    },
  };
}