/**
 * Fallbacks descriptivos para cuando Firestore no tiene datos
 * Ayudan al usuario a entender qué tipo de contenido puede ir en cada sección
 */

import { HomePageData } from '@/types/home';
import { PortfolioCategory, PortfolioProjectFirestore } from '@/types/portfolio-firestore';
import { Autor, Categoria, Articulo } from '@/types/newsletter';

// ==========================================
// HOME PAGE FALLBACKS
// ==========================================

export const HOME_PAGE_FALLBACK: HomePageData = {
  page: {
    title: 'Métrica FM - Dirección Integral de Proyectos',
    description: 'Empresa de gestión y dirección integral de proyectos de construcción'
  },
  hero: {
    title: {
      main: 'Métrica',
      secondary: 'DIP'
    },
    subtitle: '📝 Configura el subtítulo del hero desde Firestore: pages/home',
    background: {
      type: 'image',
      video_url: '',
      video_url_fallback: '',
      image_fallback: '/images/proyectos/hero-background.jpg',
      image_fallback_internal: '/images/proyectos/hero-background.jpg',
      image_main: '/images/proyectos/hero-background.jpg',
      overlay_opacity: 0.5
    },
    rotating_words: ['Maximiza ✨', 'Optimiza 🚀', 'Impulsa 💡'],
    transition_text: '📝 Agrega texto de transición desde Firestore',
    cta: {
      text: 'Conocer más',
      target: '#services'
    }
  },
  stats: {
    statistics: [
      {
        id: 'stat-1',
        number: '0',
        suffix: '+',
        label: '📊 Proyectos (agregar desde Firestore)',
        color: '#00A8E8'
      },
      {
        id: 'stat-2',
        number: '0',
        suffix: '+',
        label: '📊 Clientes (agregar desde Firestore)',
        color: '#003F6F'
      },
      {
        id: 'stat-3',
        number: '0',
        suffix: '%',
        label: '📊 Satisfacción (agregar desde Firestore)',
        color: '#00A8E8'
      }
    ]
  },
  services: {
    section: {
      title: 'Nuestros Servicios',
      subtitle: '📝 Agrega servicios desde Firestore: pages/home'
    },
    main_service: {
      title: '📋 Servicio Principal',
      description: 'Describe tu servicio principal desde Firestore. Ejemplo: Gestión integral de proyectos de construcción con metodologías ágiles y control total.',
      image: '/images/services/main-service.jpg',
      cta: {
        text: 'Conocer más',
        link: '/services'
      }
    },
    secondary_services: [
      {
        id: '1',
        title: '🏗️ Servicio 1',
        description: 'Agrega descripción desde Firestore',
        icon: 'building'
      },
      {
        id: '2',
        title: '📐 Servicio 2',
        description: 'Agrega descripción desde Firestore',
        icon: 'ruler'
      },
      {
        id: '3',
        title: '⚙️ Servicio 3',
        description: 'Agrega descripción desde Firestore',
        icon: 'settings'
      }
    ]
  },
  portfolio: {
    section: {
      title: 'Portfolio',
      subtitle: '📸 Agrega proyectos destacados desde Firestore: portfolio/projects',
      cta: {
        text: 'Ver todos los proyectos',
        link: '/portfolio'
      }
    },
    featured_projects: [
      {
        id: 'demo-1',
        title: '📁 Proyecto de ejemplo 1',
        description: 'Agrega proyectos reales desde Firestore',
        image: '/images/proyectos/hero-background.jpg',
        image_url: '/images/proyectos/hero-background.jpg',
        category: 'Oficina',
        year: new Date().getFullYear().toString()
      },
      {
        id: 'demo-2',
        title: '📁 Proyecto de ejemplo 2',
        description: 'Agrega proyectos reales desde Firestore',
        image: '/images/proyectos/hero-background.jpg',
        image_url: '/images/proyectos/hero-background.jpg',
        category: 'Retail',
        year: new Date().getFullYear().toString()
      }
    ]
  },
  pillars: {
    section: {
      title: 'Nuestros Pilares',
      subtitle: '🏛️ Define los pilares de tu empresa desde Firestore: pages/home'
    },
    pillars: [
      {
        id: '1',
        title: '💎 Pilar 1',
        description: 'Ejemplo: Calidad - Compromiso con la excelencia en cada proyecto',
        icon: 'diamond',
        image: '/images/proyectos/hero-background.jpg'
      },
      {
        id: '2',
        title: '🤝 Pilar 2',
        description: 'Ejemplo: Confianza - Relaciones duraderas con clientes',
        icon: 'handshake',
        image: '/images/proyectos/hero-background.jpg'
      },
      {
        id: '3',
        title: '🚀 Pilar 3',
        description: 'Ejemplo: Innovación - Soluciones creativas y tecnología',
        icon: 'rocket',
        image: '/images/proyectos/hero-background.jpg'
      }
    ]
  },
  policies: {
    section: {
      title: 'Nuestras Políticas',
      subtitle: '📜 Define las políticas de tu empresa desde Firestore: pages/home'
    },
    policies: [
      {
        id: '1',
        title: '🌱 Política 1',
        description: 'Ejemplo: Sostenibilidad - Proyectos eco-amigables',
        icon: 'leaf',
        image: '/images/proyectos/hero-background.jpg'
      },
      {
        id: '2',
        title: '🛡️ Política 2',
        description: 'Ejemplo: Seguridad - Protocolos estrictos en obra',
        icon: 'shield',
        image: '/images/proyectos/hero-background.jpg'
      }
    ]
  },
  clients: {
    section: {
      title: 'Nuestros Clientes',
      subtitle: '🤝 Empresas líderes que confían en nosotros'
    },
    logos: [
      {
        id: '1',
        name: '📝 Logo Cliente 1',
        alt: 'Logo Cliente 1',
        image: '/images/proyectos/hero-background.jpg',
        logo_url: '/images/proyectos/hero-background.jpg',
        website: '#'
      },
      {
        id: '2',
        name: '📝 Logo Cliente 2',
        alt: 'Logo Cliente 2',
        image: '/images/proyectos/hero-background.jpg',
        logo_url: '/images/proyectos/hero-background.jpg',
        website: '#'
      }
    ]
  },
  newsletter: {
    section: {
      title: 'Newsletter',
      subtitle: '📧 Suscríbete para recibir noticias y actualizaciones'
    },
    form: {
      placeholder_text: 'Tu email...',
      cta_text: 'Suscribirse',
      loading_text: 'Enviando...',
      success_message: '¡Gracias por suscribirte!',
      success_description: 'Recibirás nuestras últimas noticias'
    }
  }
};

// ==========================================
// PORTFOLIO FALLBACKS
// ==========================================

export const PORTFOLIO_CATEGORIES_FALLBACK: PortfolioCategory[] = [
  {
    id: 'oficina',
    name: '🏢 Oficina',
    slug: 'oficina',
    description: 'Proyectos de espacios de oficina. Agrega categorías reales desde Firestore: portfolio_categories',
    icon: 'building',
    color: '#003F6F',
    order: 1,
    is_active: true,
    project_count: 0,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'retail',
    name: '🛍️ Retail',
    slug: 'retail',
    description: 'Proyectos comerciales y retail. Agrega categorías reales desde Firestore: portfolio_categories',
    icon: 'shopping-bag',
    color: '#E84E0F',
    order: 2,
    is_active: true,
    project_count: 0,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'educacion',
    name: '🎓 Educación',
    slug: 'educacion',
    description: 'Proyectos educativos. Agrega categorías reales desde Firestore: portfolio_categories',
    icon: 'graduation-cap',
    color: '#003F6F',
    order: 3,
    is_active: true,
    project_count: 0,
    created_at: new Date(),
    updated_at: new Date()
  }
];

export const PORTFOLIO_PROJECTS_FALLBACK: PortfolioProjectFirestore[] = [
  {
    id: 'demo-project-1',
    title: '📁 Proyecto de Demostración 1',
    slug: 'demo-project-1',
    description: 'Este es un proyecto de ejemplo. Agrega proyectos reales desde Firestore: portfolio_projects',
    long_description: 'Descripción detallada del proyecto. Incluye desafíos, soluciones implementadas, tecnologías utilizadas, etc.',
    category_id: 'oficina',
    client: '👤 Cliente Ejemplo',
    location: {
      city: 'Lima',
      district: 'San Isidro',
      address: 'Av. Ejemplo 123'
    },
    date_start: new Date(),
    date_end: new Date(),
    status: 'completed',
    area: '500 m²',
    investment: '$100,000',
    tags: ['ejemplo', 'demo', 'configurar'],
    images: [],
    certifications: [],
    is_featured: false,
    is_active: true,
    views: 0,
    order: 1,
    created_at: new Date(),
    updated_at: new Date()
  }
];

// ==========================================
// BLOG/NEWSLETTER FALLBACKS
// ==========================================

export const BLOG_AUTHORS_FALLBACK: Autor[] = [
  {
    id: 'admin',
    name: '👤 Administrador',
    email: 'admin@metrica-dip.com',
    bio: 'Configura autores desde Firestore: authors',
    avatar: '/images/team/placeholder-avatar.jpg',
    role: 'Editor',
    social_links: {
      linkedin: '#',
      twitter: '#'
    },
    article_count: 0,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  }
];

export const BLOG_CATEGORIES_FALLBACK: Categoria[] = [
  {
    id: 'noticias',
    name: '📰 Noticias',
    slug: 'noticias',
    description: 'Noticias y actualizaciones. Configura categorías desde Firestore: categories',
    color: '#003F6F',
    icon: 'newspaper',
    order: 1,
    article_count: 0,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'proyectos',
    name: '🏗️ Proyectos',
    slug: 'proyectos',
    description: 'Casos de estudio de proyectos. Configura categorías desde Firestore: categories',
    color: '#E84E0F',
    icon: 'building',
    order: 2,
    article_count: 0,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  }
];

export const BLOG_ARTICLES_FALLBACK: Articulo[] = [
  {
    id: 'welcome',
    title: '📝 Artículo de Bienvenida',
    slug: 'articulo-de-bienvenida',
    excerpt: 'Este es un artículo de ejemplo. Configura artículos desde Firestore: articles',
    content: '## Bienvenido al Blog\n\nEste es un artículo de demostración. Para agregar contenido real:\n\n1. Ve al panel de administración\n2. Navega a Newsletter/Blog\n3. Crea nuevos artículos con contenido real\n\n**Nota:** Este contenido se reemplazará automáticamente cuando agregues datos a Firestore.',
    author_id: 'admin',
    category_id: 'noticias',
    featured_image: '/images/blog/placeholder-article.jpg',
    tags: ['bienvenida', 'ejemplo', 'configurar'],
    status: 'draft',
    is_featured: false,
    views: 0,
    reading_time: 2,
    published_at: null,
    scheduled_for: null,
    created_at: new Date(),
    updated_at: new Date()
  }
];

// ==========================================
// CAREERS FALLBACKS
// ==========================================

export const CAREERS_FALLBACK = {
  departments: [
    {
      id: 'ingenieria',
      name: '🔧 Ingeniería',
      description: 'Departamento de ingeniería. Configura departamentos desde Firestore: careers_departments',
      icon: 'wrench',
      color: '#003F6F',
      position_count: 0,
      order: 1,
      is_active: true
    }
  ],
  positions: [
    {
      id: 'demo-position',
      title: '💼 Posición de Ejemplo',
      department_id: 'ingenieria',
      description: 'Descripción de la posición. Configura posiciones desde Firestore: careers_positions',
      requirements: [
        '✓ Requisito ejemplo 1',
        '✓ Requisito ejemplo 2'
      ],
      responsibilities: [
        '✓ Responsabilidad ejemplo 1',
        '✓ Responsabilidad ejemplo 2'
      ],
      location: 'Lima, Perú',
      type: 'full_time',
      level: 'mid',
      salary_range: 'Competitivo',
      is_active: false,
      is_featured: false,
      views: 0,
      application_count: 0,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]
};

// ==========================================
// SERVICES FALLBACKS
// ==========================================

export const SERVICES_PAGE_FALLBACK = {
  hero: {
    title: 'Nuestros Servicios',
    subtitle: '📝 Configura servicios desde Firestore: pages/services',
    background_image: '/images/services/hero-background.jpg'
  },
  services: [
    {
      id: '1',
      title: '🏗️ Servicio Ejemplo 1',
      description: 'Descripción del servicio. Agrega servicios reales desde Firestore',
      icon: 'building',
      features: [
        '✓ Característica 1',
        '✓ Característica 2',
        '✓ Característica 3'
      ]
    }
  ]
};

// ==========================================
// MEGAMENU FALLBACKS
// ==========================================

export const MEGAMENU_FALLBACK = {
  settings: {
    enabled: true,
    animation_duration: 300,
    hover_delay: 100,
    mobile_breakpoint: 'md',
    max_items: 10,
    last_updated: new Date().toISOString(),
    version: '1.0.0'
  },
  items: [
    {
      id: 'nosotros',
      label: 'Nosotros',
      type: 'megamenu' as const,
      enabled: true,
      order: 1,
      submenu: {
        section1: {
          title: 'Acerca de Métrica',
          description: 'Configura menú desde Firestore: admin/megamenu'
        },
        links: [
          {
            title: 'Nuestra Historia',
            description: 'Conoce nuestro recorrido',
            href: '/about/historia',
            enabled: true
          },
          {
            title: 'Cultura',
            description: 'Nuestros valores y equipo',
            href: '/about/cultura',
            enabled: true
          },
          {
            title: 'Compromiso',
            description: 'Nuestro compromiso social',
            href: '/about/compromiso',
            enabled: true
          }
        ],
        section3: {
          title: '¿Por qué elegirnos?',
          description: 'Experiencia y compromiso con la excelencia',
          image: '/images/proyectos/hero-background.jpg'
        }
      }
    },
    {
      id: 'servicios',
      label: 'Servicios',
      type: 'simple' as const,
      href: '/services',
      enabled: true,
      order: 2
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      type: 'simple' as const,
      href: '/portfolio',
      enabled: true,
      order: 3
    },
    {
      id: 'blog',
      label: 'Blog',
      type: 'simple' as const,
      href: '/blog',
      enabled: true,
      order: 4
    },
    {
      id: 'contacto',
      label: 'Contacto',
      type: 'simple' as const,
      href: '/contact',
      enabled: true,
      order: 5
    }
  ],
  page_mappings: {},
  analytics: {
    total_clicks: 0,
    last_interaction: new Date().toISOString(),
    most_clicked_item: null,
    popular_links: []
  }
};

// ==========================================
// CONSTANTES DE IMÁGENES POR DEFECTO
// ==========================================

/**
 * Imagen por defecto cuando no hay imagen disponible
 */
export const DEFAULT_IMAGE = '/images/proyectos/hero-background.jpg';

/**
 * Logo por defecto para clientes
 */
export const DEFAULT_LOGO = '/images/proyectos/hero-background.jpg';

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Retorna fallback con mensaje explicativo
 */
export function getFallbackWithMessage<T>(
  fallback: T,
  collection: string,
  additionalInfo?: string
): T {
  console.warn(
    `⚠️ [FALLBACK] Usando datos de ejemplo para ${collection}. ` +
    `Configura datos reales en Firestore${additionalInfo ? `: ${additionalInfo}` : ''}`
  );
  return fallback;
}

/**
 * Obtiene la URL de imagen válida o retorna la imagen por defecto
 */
export function getValidImageUrl(imageUrl: string | undefined | null, defaultImage: string = DEFAULT_IMAGE): string {
  if (!imageUrl || imageUrl.trim() === '') {
    return defaultImage;
  }
  return imageUrl;
}

/**
 * Wrapper para manejar errores de Firestore con fallbacks
 */
export async function withFallback<T>(
  operation: () => Promise<T>,
  fallback: T,
  context: string
): Promise<T> {
  try {
    const result = await operation();
    if (!result || (Array.isArray(result) && result.length === 0)) {
      console.warn(`⚠️ [FALLBACK] ${context}: Sin datos, usando fallback`);
      return fallback;
    }
    return result;
  } catch (error) {
    console.error(`❌ [ERROR] ${context}:`, error);
    console.warn(`⚠️ [FALLBACK] ${context}: Error detectado, usando fallback`);
    return fallback;
  }
}
