/**
 * Servicio para acceder a las páginas almacenadas en Firestore
 * Específicamente para la colección 'pages'
 */

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

// Verificar si tenemos credenciales válidas para Firestore
const hasValidFirestoreCredentials = (
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID.includes('demo-project') &&
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  !process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes('demo')
);

// Helper para crear datos por defecto para una página
function createDefaultPageData(pageId: string): any {
  const baseData = {
    id: pageId,
    name: pageId.charAt(0).toUpperCase() + pageId.slice(1),
    title: `${pageId.charAt(0).toUpperCase() + pageId.slice(1)} - Métrica FM`,
    description: `Página ${pageId} - Datos no disponibles en el entorno actual`,
    path: `/${pageId}`,
    status: 'fallback',
    lastModified: new Date().toISOString(),
    size: '0KB',
    type: 'page',
    metadata: {}
  };

  // Crear estructura específica según la página
  switch (pageId) {
    case 'home':
      return {
        ...baseData,
        page: {
          title: 'Métrica FM - Dirección Integral de Proyectos',
          description: 'Líderes en dirección integral de proyectos de infraestructura pública y privada.'
        },
        hero: {
          title: 'Métrica FM',
          subtitle: 'Dirección Integral de Proyectos',
          background_image: '/img/hero/home-hero.jpg',
          background_image_fallback: '/img/hero/default-hero.jpg'
        },
        stats: {
          statistics: [
            {
              id: '1',
              icon: 'Award',
              value: 15,
              suffix: '+',
              label: 'Años de experiencia',
              description: 'Más de una década liderando proyectos'
            },
            {
              id: '2',
              icon: 'Briefcase',
              value: 200,
              suffix: '+',
              label: 'Proyectos completados',
              description: 'Desde complejos hospitalarios hasta centros comerciales'
            },
            {
              id: '3',
              icon: 'Users',
              value: 100,
              suffix: '+',
              label: 'Clientes satisfechos',
              description: 'Empresas públicas y privadas que confían en nosotros'
            },
            {
              id: '4',
              icon: 'Target',
              value: 98,
              suffix: '%',
              label: 'Tasa de satisfacción',
              description: 'Excelencia comprobada en cada proyecto'
            }
          ]
        },
        services: [],
        portfolio: [],
        pillars: [],
        policies: [],
        clients: [],
        newsletter: {
          title: 'Newsletter',
          description: 'Mantente informado'
        }
      };

    case 'contact':
      return {
        ...baseData,
        page: {
          title: 'Contacto - Métrica FM',
          description: 'Contacta con nuestro equipo para tu próximo proyecto.',
          url: '/contact'
        },
        hero: {
          title: 'Contacto',
          subtitle: 'Hablemos de tu proyecto',
          background_image: '/img/hero/contact-hero.jpg'
        },
        sections: {
          intro: {
            title: 'Trabajemos Juntos',
            description: 'Ponte en contacto con nuestro equipo de expertos para transformar tu visión en realidad.'
          },
          contact_info: {
            title: 'Información de Contacto',
            items: [
              {
                icon: 'Phone',
                title: 'Teléfono',
                content: '+34 XXX XXX XXX'
              },
              {
                icon: 'Mail',
                title: 'Email',
                content: 'info@metricadip.com'
              },
              {
                icon: 'MapPin',
                title: 'Oficina',
                content: 'Dirección, Ciudad, País'
              },
              {
                icon: 'Clock',
                title: 'Horario',
                content: 'Lun - Vie: 9:00 - 18:00'
              }
            ]
          },
          map: {
            title: 'Encuéntranos',
            subtitle: 'Visítanos en nuestra oficina',
            show_placeholder: true
          },
          urgent_quote: {
            title: '¿Necesitas una Cotización Urgente?',
            description: 'Para proyectos urgentes, contáctanos directamente por teléfono.',
            button: {
              text: 'Llamar Ahora',
              icon: 'Phone',
              variant: 'default'
            }
          },
          process: {
            title: 'Nuestro Proceso de Contacto',
            steps: [
              {
                number: '1',
                title: 'Envías tu Consulta',
                description: 'Completa el formulario con los detalles de tu proyecto'
              },
              {
                number: '2',
                title: 'Revisamos tu Solicitud',
                description: 'Nuestro equipo analiza tu proyecto en menos de 24 horas'
              },
              {
                number: '3',
                title: 'Te Contactamos',
                description: 'Programamos una reunión para discutir los detalles'
              }
            ]
          }
        },
        settings: {
          form_action: '/api/contact',
          form_method: 'POST',
          show_map_placeholder: true,
          response_time: '24 horas',
          urgent_response_time: '4 horas'
        },
        seo: {
          meta_title: 'Contáctanos | Métrica FM',
          meta_description: 'Ponte en contacto con nuestro equipo de expertos en dirección integral de proyectos.',
          keywords: ['contacto', 'consulta', 'proyecto', 'Métrica FM']
        }
      };

    case 'blog':
      return {
        ...baseData,
        page: {
          title: 'Blog - Métrica FM',
          description: 'Artículos y noticias sobre dirección de proyectos.'
        },
        hero: {
          title: 'Blog',
          subtitle: 'Insights y noticias',
          background_image: '/img/hero/blog-hero.jpg',
          background_image_fallback: '/img/hero/default-hero.jpg'
        },
        featured_articles: [],
        categories: [],
        recent_posts: []
      };

    case 'careers':
      return {
        ...baseData,
        page: {
          title: 'Carreras - Métrica FM',
          description: 'Únete a nuestro equipo de profesionales.'
        },
        hero: {
          title: 'Carreras',
          subtitle: 'Únete a nuestro equipo',
          background_image: '/img/hero/careers-hero.jpg',
          background_image_fallback: '/img/hero/default-hero.jpg'
        },
        job_openings: [],
        benefits: [],
        company_culture: {
          title: 'Nuestra Cultura',
          description: 'Ambiente de trabajo colaborativo'
        }
      };

    case 'services':
      return {
        ...baseData,
        page: {
          title: 'Servicios - Métrica FM',
          description: 'Servicios especializados en dirección de proyectos.'
        },
        hero: {
          title: 'Servicios',
          subtitle: 'Soluciones integrales',
          background_image: '/img/hero/services-hero.jpg',
          background_image_fallback: '/img/hero/default-hero.jpg'
        },
        service_categories: [],
        featured_services: []
      };

    case 'portfolio':
      return {
        ...baseData,
        page: {
          title: 'Portfolio - Métrica FM',
          description: 'Proyectos destacados y casos de éxito.'
        },
        hero: {
          title: 'Portfolio',
          subtitle: 'Proyectos destacados',
          background_image: '/img/hero/portfolio-hero.jpg',
          background_image_fallback: '/img/hero/default-hero.jpg'
        },
        projects: [],
        categories: []
      };

    case 'iso':
      return {
        ...baseData,
        page: {
          title: 'Certificación ISO - Métrica FM',
          description: 'Comprometidos con la calidad y estándares internacionales.'
        },
        hero: {
          title: 'Certificación ISO',
          subtitle: 'Comprometidos con la calidad',
          background_image: '/img/hero/iso-hero.jpg',
          background_image_fallback: '/img/hero/default-hero.jpg'
        },
        certifications: [],
        quality_policies: []
      };

    case 'megamenu':
      return {
        ...baseData,
        navigation: {
          main_sections: [],
          quick_links: [],
          contact_info: {
            phone: '+34 XXX XXX XXX',
            email: 'info@metricadip.com'
          }
        }
      };

    case 'clientes':
      return {
        ...baseData,
        page: {
          title: 'Nuestros Clientes - Métrica FM',
          description: 'Organismos públicos y empresas líderes que confían en nuestra experiencia.'
        },
        hero: {
          title: 'Nuestros Clientes',
          subtitle: 'Organismos públicos y empresas líderes que confían en nuestra experiencia',
          background_image: '/img/hero/clientes-hero.jpg',
          background_image_fallback: '/img/hero/default-hero.jpg'
        },
        introduction: {
          title: 'Compromiso con la Excelencia',
          description: 'Trabajamos con organizaciones líderes en diversos sectores.',
          stats: {
            total_clients: '100+',
            public_sector: '60%',
            private_sector: '40%',
            years_experience: '10+'
          }
        },
        client_sectors: [],
        testimonials: {
          title: 'Lo que dicen nuestros clientes',
          subtitle: 'Testimonios de confianza',
          testimonials_list: []
        },
        client_benefits: {
          title: 'Beneficios para nuestros clientes',
          subtitle: 'Ventajas de trabajar con nosotros',
          benefits: []
        },
        success_metrics: {
          title: 'Métricas de éxito',
          subtitle: 'Resultados que avalan nuestra experiencia',
          metrics: []
        },
        clientes: {
          section: {
            title: 'Nuestros Clientes',
            subtitle: 'Empresas líderes que confían en nuestra experiencia y profesionalismo'
          },
          logos: [
            {
              alt: "BCP logo",
              id: "bcp",
              name: "BCP",
              image: "/images/logos/bcp-4.svg"
            },
            {
              image: "/images/logos/Innova_Schools.svg",
              name: "Innova Schools",
              alt: "Innova Schools logo",
              id: "innova"
            },
            {
              id: "tottus",
              alt: "Tottus logo",
              name: "Tottus",
              image: "/images/logos/Logo_Tottus.png"
            }
          ]
        }
      };

    case 'compromiso':
      return {
        ...baseData,
        page: {
          title: 'Nuestro Compromiso - Métrica FM',
          description: 'Compromiso con la sostenibilidad y responsabilidad social.'
        },
        hero: {
          title: 'Nuestro Compromiso',
          subtitle: 'Compromiso con la sostenibilidad y responsabilidad social',
          background_image: '/img/hero/compromiso-hero.jpg',
          background_image_fallback: '/img/hero/default-hero.jpg'
        },
        main_content: {
          introduction: {
            title: 'Compromiso con el Futuro',
            description: 'Trabajamos por un desarrollo sostenible y responsable.'
          },
          sections: []
        },
        impact_metrics: {
          title: 'Nuestro Impacto',
          subtitle: 'Métricas de sostenibilidad',
          categories: []
        },
        sustainability_goals: {
          title: 'Objetivos de Sostenibilidad',
          subtitle: 'Compromisos para el futuro',
          description: 'Trabajamos por alcanzar los objetivos de desarrollo sostenible.',
          goals: []
        },
        future_commitments: {
          title: 'Compromisos Futuros',
          subtitle: 'Nuestra visión a largo plazo',
          description: 'Planes y objetivos para los próximos años.',
          commitments: []
        }
      };

    case 'cultura':
      return {
        ...baseData,
        page: {
          title: 'Nuestra Cultura - Métrica FM',
          description: 'Cultura organizacional basada en valores y excelencia.',
          keywords: ['cultura', 'valores', 'equipo', 'Métrica FM'],
          url: '/about/cultura',
          openGraph: {
            title: 'Nuestra Cultura - Métrica FM',
            description: 'Cultura organizacional basada en valores y excelencia.',
            type: 'website',
            locale: 'es_ES',
            siteName: 'Métrica FM'
          }
        },
        hero: {
          title: 'Nuestra Cultura',
          subtitle: 'Cultura organizacional basada en valores y excelencia',
          background_image: '/img/hero/cultura-hero.jpg',
          background_image_fallback: '/img/hero/default-hero.jpg',
          team_gallery: {
            columns: [[], [], []]
          }
        },
        values: {
          section: {
            title: 'Nuestros Valores',
            subtitle: 'Los principios que guían nuestro trabajo'
          },
          values_list: []
        },
        culture_stats: {
          section: {
            title: 'Cultura en Números',
            subtitle: 'Métricas que reflejan nuestra cultura'
          },
          categories: {}
        },
        team: {
          section: {
            title: 'Nuestro Equipo',
            subtitle: 'Profesionales comprometidos con la excelencia'
          },
          members: []
        },
        technologies: {
          section: {
            title: 'Innovación Tecnológica',
            subtitle: 'Herramientas que potencian nuestro trabajo'
          },
          tech_list: []
        }
      };

    case 'historia':
      return {
        ...baseData,
        page: {
          title: 'Nuestra Historia',
          subtitle: 'Más de 15 años de experiencia en dirección de proyectos',
          hero_image: '/img/hero/historia-hero.jpg',
          hero_image_fallback: '/img/hero/default-hero.jpg',
          hero_video: '',
          hero_video_fallback: '',
          description: 'Más de 15 años de experiencia en dirección de proyectos.',
          url: '/about/historia'
        },
        timeline_events: [],
        achievement_summary: {
          title: 'Nuestros Logros',
          metrics: []
        },
        call_to_action: {
          title: 'Trabajemos Juntos',
          description: 'Descubre cómo podemos ayudarte con tu próximo proyecto.',
          primary_button: {
            text: 'Contáctanos',
            href: '/contact'
          },
          secondary_button: {
            text: 'Ver Servicios',
            href: '/services'
          }
        }
      };

    default:
      return {
        ...baseData,
        page: {
          title: baseData.title,
          description: baseData.description
        },
        hero: {
          title: baseData.name,
          subtitle: baseData.description,
          background_image: '/img/hero/default-hero.jpg',
          background_image_fallback: '/img/hero/default-hero.jpg'
        }
      };
  }
}

export interface PageData {
  id: string;
  name: string;
  title: string;
  description: string;
  path: string;
  status: string;
  lastModified: string;
  size: string;
  type: string;
  metadata: any;
  page: any;
  hero?: any;
  stats?: any;
  services?: any;
  portfolio?: any;
  pillars?: any;
  policies?: any;
  clients?: any;
  newsletter?: any;
}

export class PagesService {
  /**
   * Función genérica para obtener una página con fallback
   */
  private static async getPageWithFallback(pageId: string): Promise<any> {
    // Si no hay credenciales válidas, devolver datos por defecto inmediatamente
    if (!hasValidFirestoreCredentials) {
      return createDefaultPageData(pageId);
    }

    try {
      const pageDocRef = doc(db, 'pages', pageId);
      const docSnap = await getDoc(pageDocRef);

      if (docSnap.exists()) {
        return docSnap.data();
      }

      return createDefaultPageData(pageId);
    } catch (error) {
      return createDefaultPageData(pageId);
    }
  }


  /**
   * Obtiene los datos de la página home desde Firestore
   */
  static async getHomePage(): Promise<any | null> {
    return await this.getPageWithFallback('home');
  }

  /**
   * Actualiza los datos de la página home en Firestore
   */
  static async updateHomePage(data: any): Promise<void> {
    if (!hasValidFirestoreCredentials) {
      return;
    }

    try {
      const docRef = doc(db, 'pages', 'home');
      await setDoc(docRef, data, { merge: true });
    } catch (error) {
      console.error('Error al actualizar página home:', error);
      throw new Error('Error al actualizar la página home');
    }
  }

  /**
   * Obtiene los datos de la página blog desde Firestore
   */
  static async getBlogPage(): Promise<any | null> {
    return await this.getPageWithFallback('blog');
  }

  /**
   * Obtiene los datos de la página careers desde Firestore
   */
  static async getCareersPage(): Promise<any | null> {
    return await this.getPageWithFallback('careers');
  }

  /**
   * Obtiene los datos de la página clientes desde Firestore
   */
  static async getClientesPage(): Promise<any | null> {
    return await this.getPageWithFallback('clientes');
  }

  /**
   * Obtiene los datos de la página compromiso desde Firestore
   */
  static async getCompromisoPage(): Promise<any | null> {
    return await this.getPageWithFallback('compromiso');
  }

  /**
   * Obtiene los datos de la página contact desde Firestore
   */
  static async getContactPage(): Promise<any | null> {
    return await this.getPageWithFallback('contact');
  }

  /**
   * Obtiene los datos de la página cultura desde Firestore
   */
  static async getCulturaPage(): Promise<any | null> {
    return await this.getPageWithFallback('cultura');
  }

  /**
   * Obtiene los datos de la página historia desde Firestore
   */
  static async getHistoriaPage(): Promise<any | null> {
    return await this.getPageWithFallback('historia');
  }

  /**
   * Obtiene los datos de la página iso desde Firestore
   */
  static async getIsoPage(): Promise<any | null> {
    return await this.getPageWithFallback('iso');
  }

  /**
   * Obtiene los datos de la página portfolio desde Firestore
   */
  static async getPortfolioPage(): Promise<any | null> {
    return await this.getPageWithFallback('portfolio');
  }

  /**
   * Obtiene los datos de la página services desde Firestore
   */
  static async getServicesPage(): Promise<any | null> {
    return await this.getPageWithFallback('services');
  }

  /**
   * Obtiene los datos del megamenu desde Firestore
   */
  static async getMegamenuPage(): Promise<any | null> {
    return await this.getPageWithFallback('megamenu');
  }

  /**
   * Obtiene una página específica por ID
   */
  static async getPageById(pageId: string): Promise<PageData | null> {
    try {
      const pageDocRef = doc(db, 'pages', pageId);
      const docSnap = await getDoc(pageDocRef);

      if (docSnap.exists()) {
        return docSnap.data() as PageData;
      }

      return null;
    } catch (error) {
      throw new Error(`Error al cargar página ${pageId} desde Firestore`);
    }
  }
}