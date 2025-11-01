import { PageData } from '@/types/pages-management';

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'draft': return 'bg-yellow-100 text-yellow-800';
    case 'archived': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getTypeIcon = (type: string) => {
  switch (type) {
    case 'dynamic': return '⚡';
    case 'static': return '📄';
    default: return '📄';
  }
};

export const getPreviewUrl = (page: PageData): string => {
  const baseUrl = process.env.NODE_ENV === 'production'
    ? 'https://metrica-dip.com'
    : 'http://localhost:9002';

  return `${baseUrl}${page.path}`;
};

export const generateMockPages = (): PageData[] => {
  return [
    {
      id: '1',
      name: 'home',
      title: 'Página Principal',
      description: 'Página de inicio del sitio web',
      path: '/',
      status: 'active',
      lastModified: '2024-01-15',
      size: '2.3 KB',
      type: 'dynamic',
      metadata: {
        author: 'Admin',
        tags: ['inicio', 'principal'],
        category: 'General',
        seoTitle: 'Métrica FM - Dirección Integral de Proyectos',
        seoDescription: 'Empresa líder en dirección integral de proyectos de construcción'
      }
    },
    {
      id: '2',
      name: 'about-historia',
      title: 'Nuestra Historia',
      description: 'Historia y evolución de la empresa',
      path: '/sobre-nosotros/historia',
      status: 'active',
      lastModified: '2024-01-10',
      size: '4.1 KB',
      type: 'dynamic',
      metadata: {
        author: 'Editor',
        tags: ['historia', 'empresa'],
        category: 'Nosotros'
      }
    },
    {
      id: '3',
      name: 'cultura',
      title: 'Cultura Organizacional',
      description: 'Valores y cultura de la empresa',
      path: '/sobre-nosotros/cultura',
      status: 'active',
      lastModified: '2024-01-08',
      size: '3.2 KB',
      type: 'dynamic'
    },
    {
      id: '4',
      name: 'iso',
      title: 'Certificación ISO',
      description: 'Información sobre certificaciones ISO',
      path: '/calidad/iso',
      status: 'active',
      lastModified: '2024-01-05',
      size: '5.8 KB',
      type: 'dynamic'
    },
    {
      id: '5',
      name: 'contact',
      title: 'Contacto',
      description: 'Información de contacto',
      path: '/contacto',
      status: 'active',
      lastModified: '2024-01-12',
      size: '1.9 KB',
      type: 'static'
    },
    {
      id: '6',
      name: 'blog',
      title: 'Blog',
      description: 'Configuración del blog',
      path: '/blog',
      status: 'draft',
      lastModified: '2024-01-03',
      size: '1.2 KB',
      type: 'dynamic'
    },
    {
      id: '7',
      name: 'services',
      title: 'Servicios',
      description: 'Página de servicios',
      path: '/servicios',
      status: 'active',
      lastModified: '2024-01-14',
      size: '3.7 KB',
      type: 'dynamic'
    },
    {
      id: '8',
      name: 'compromiso',
      title: 'Compromiso',
      description: 'Nuestro compromiso',
      path: '/compromiso',
      status: 'active',
      lastModified: '2024-01-11',
      size: '2.8 KB',
      type: 'dynamic'
    },
    {
      id: '9',
      name: 'portfolio',
      title: 'Portfolio',
      description: 'Galería de proyectos',
      path: '/portfolio',
      status: 'active',
      lastModified: '2024-01-13',
      size: '4.5 KB',
      type: 'dynamic'
    },
    {
      id: '10',
      name: 'careers',
      title: 'Carreras',
      description: 'Oportunidades laborales',
      path: '/carreras',
      status: 'active',
      lastModified: '2024-01-09',
      size: '2.1 KB',
      type: 'dynamic'
    },
    {
      id: '11',
      name: 'clientes',
      title: 'Nuestros Clientes',
      description: 'Empresas y organismos que confían en nosotros',
      path: '/about/clientes',
      status: 'active',
      lastModified: '2024-01-28',
      size: '6.3 KB',
      type: 'dynamic',
      metadata: {
        author: 'Admin',
        tags: ['clientes', 'testimonios', 'casos de éxito'],
        category: 'Nosotros',
        seoTitle: 'Nuestros Clientes | Métrica FM',
        seoDescription: 'Organismos públicos y empresas líderes que confían en nuestra experiencia y profesionalismo en dirección integral de proyectos de infraestructura.'
      }
    }
  ];
};