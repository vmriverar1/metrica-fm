// Types para el sistema de portafolio de Métrica FM

export enum ProjectCategory {
  OFICINA = 'oficina',
  RETAIL = 'retail',
  INDUSTRIA = 'industria',
  HOTELERIA = 'hoteleria',
  EDUCACION = 'educacion',
  VIVIENDA = 'vivienda',
  SALUD = 'salud'
}

export interface GalleryImage {
  id: string;
  url: string;
  thumbnail: string;
  caption?: string;
  stage: 'inicio' | 'proceso' | 'final';
  order: number;
}

export interface ProjectDetails {
  client: string;
  duration: string;           // "18 meses"
  investment?: string;        // "$15M USD"
  team: string[];            // ["Arquitectura", "Ingeniería", "Supervisión"]
  certifications?: string[]; // ["LEED Gold", "ISO 9001"]
  area: string;              // "45,000 m²"
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  category: ProjectCategory;
  location: {
    city: string;
    region: string;
    address?: string;
    coordinates: [number, number]; // [lat, lng]
  };
  featuredImage: string;
  thumbnailImage: string;
  gallery: GalleryImage[];
  description: string;
  shortDescription: string;    // Para cards y previews
  details: ProjectDetails;
  featured: boolean;          // Para destacar en home
  completedAt: Date;
  tags: string[];            // ["sostenible", "premiado", "innovador"]
}

export interface FilterState {
  category: ProjectCategory | 'all';
  location: string | 'all';
  year: number | 'all';
  searchTerm: string;
}

export interface ProjectCardProps {
  title: string;
  location: string;
  type: ProjectCategory;
  image: string;
  slug: string;
  area?: string;
  year?: number;
  onHover?: (isHovered: boolean) => void;
}

// Additional high-quality images for expanded galleries
const additionalImages = {
  architecture: [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200',
    'https://images.unsplash.com/photo-1577495508326-19a1b3cf65b7?w=1200',
    'https://images.unsplash.com/photo-1569074187119-c87815b476da?w=1200',
    'https://images.unsplash.com/photo-1523726491678-bf852e717f6a?w=1200'
  ],
  construction: [
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200',
    'https://images.unsplash.com/photo-1590764258395-1b8b8f83feca?w=1200',
    'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1200',
    'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=1200',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200'
  ],
  planning: [
    'https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=1200',
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200',
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200'
  ],
  retail: [
    'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1200',
    'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1200',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200',
    'https://images.unsplash.com/photo-1596003906949-67221c37965c?w=1200'
  ],
  industrial: [
    'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=1200',
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200',
    'https://images.unsplash.com/photo-1606107557311-4f5e6f3c6c44?w=1200'
  ],
  hotel: [
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200'
  ],
  health: [
    'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1200',
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200',
    'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=1200'
  ],
  education: [
    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200',
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200',
    'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=1200'
  ],
  residential: [
    'https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=1200',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200'
  ]
};

// Datos de ejemplo para proyectos
export const sampleProjects: Project[] = [
  {
    id: '1',
    title: 'Torre Empresarial San Isidro',
    slug: 'torre-empresarial-san-isidro',
    category: ProjectCategory.OFICINA,
    location: {
      city: 'Lima',
      region: 'Lima',
      address: 'Av. El Derby 254, San Isidro',
      coordinates: [-77.0365, -12.0931]
    },
    featuredImage: 'https://metrica-dip.com/images/slider-inicio-es/01.jpg',
    thumbnailImage: 'https://metrica-dip.com/images/slider-inicio-es/01.jpg',
    gallery: [
      {
        id: '1-1',
        url: 'https://metrica-dip.com/images/slider-inicio-es/01.jpg',
        thumbnail: 'https://metrica-dip.com/images/slider-inicio-es/01.jpg',
        caption: 'Vista frontal inicial del terreno',
        stage: 'inicio',
        order: 1
      },
      {
        id: '1-2',
        url: 'https://metrica-dip.com/images/slider-inicio-es/02.jpg',
        thumbnail: 'https://metrica-dip.com/images/slider-inicio-es/02.jpg',
        caption: 'Planos arquitectónicos y diseño conceptual',
        stage: 'inicio',
        order: 2
      },
      {
        id: '1-3',
        url: 'https://metrica-dip.com/images/slider-inicio-es/03.jpg',
        thumbnail: 'https://metrica-dip.com/images/slider-inicio-es/03.jpg',
        caption: 'Excavación y cimentación en proceso',
        stage: 'proceso',
        order: 1
      },
      {
        id: '1-4',
        url: 'https://metrica-dip.com/images/slider-inicio-es/04.jpg',
        thumbnail: 'https://metrica-dip.com/images/slider-inicio-es/04.jpg',
        caption: 'Estructura de concreto en construcción',
        stage: 'proceso',
        order: 2
      },
      {
        id: '1-5',
        url: 'https://metrica-dip.com/images/slider-inicio-es/05.jpg',
        thumbnail: 'https://metrica-dip.com/images/slider-inicio-es/05.jpg',
        caption: 'Instalación de fachada de vidrio',
        stage: 'proceso',
        order: 3
      },
      {
        id: '1-6',
        url: 'https://metrica-dip.com/images/slider-inicio-es/01.jpg',
        thumbnail: 'https://metrica-dip.com/images/slider-inicio-es/01.jpg',
        caption: 'Vista frontal del edificio completado',
        stage: 'final',
        order: 1
      },
      {
        id: '1-7',
        url: 'https://metrica-dip.com/images/slider-inicio-es/06.jpg',
        thumbnail: 'https://metrica-dip.com/images/slider-inicio-es/06.jpg',
        caption: 'Lobby principal con acabados de lujo',
        stage: 'final',
        order: 2
      },
      {
        id: '1-8',
        url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
        caption: 'Espacios de trabajo colaborativo',
        stage: 'final',
        order: 3
      },
      {
        id: '1-9',
        url: 'https://images.unsplash.com/photo-1577495508326-19a1b3cf65b7?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1577495508326-19a1b3cf65b7?w=400',
        caption: 'Sala de juntas ejecutiva',
        stage: 'final',
        order: 4
      },
      {
        id: '1-10',
        url: 'https://images.unsplash.com/photo-1569074187119-c87815b476da?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1569074187119-c87815b476da?w=400',
        caption: 'Vista nocturna de la fachada',
        stage: 'final',
        order: 5
      },
      {
        id: '1-11',
        url: 'https://images.unsplash.com/photo-1590764258395-1b8b8f83feca?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1590764258395-1b8b8f83feca?w=400',
        caption: 'Avance estructural fase 1',
        stage: 'proceso',
        order: 4
      },
      {
        id: '1-12',
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400',
        caption: 'Trabajos de cimentación',
        stage: 'proceso',
        order: 5
      },
      {
        id: '1-13',
        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        caption: 'Instalaciones MEP en progreso',
        stage: 'proceso',
        order: 6
      },
      {
        id: '1-14',
        url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400',
        caption: 'Renders arquitectónicos iniciales',
        stage: 'inicio',
        order: 3
      },
      {
        id: '1-15',
        url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400',
        caption: 'Estudios de factibilidad',
        stage: 'inicio',
        order: 4
      }
    ],
    description: 'Edificio corporativo de 25 pisos con certificación LEED Gold, featuring espacios de trabajo colaborativo y tecnología de punta.',
    shortDescription: 'Torre corporativa de 25 pisos con certificación LEED Gold',
    details: {
      client: 'Grupo Inmobiliario San Isidro',
      duration: '24 meses',
      investment: '$25M USD',
      team: ['Arquitectura', 'Ingeniería Estructural', 'Supervisión'],
      certifications: ['LEED Gold', 'ISO 9001'],
      area: '15,000 m²'
    },
    featured: true,
    completedAt: new Date('2023-06-15'),
    tags: ['sostenible', 'premiado', 'corporativo']
  },
  {
    id: '2',
    title: 'Centro Comercial Plaza Norte',
    slug: 'centro-comercial-plaza-norte',
    category: ProjectCategory.RETAIL,
    location: {
      city: 'Lima',
      region: 'Lima',
      address: 'Av. Alfredo Mendiola 3698, Independencia',
      coordinates: [-77.0667, -11.9833]
    },
    featuredImage: 'https://metrica-dip.com/images/slider-inicio-es/02.jpg',
    thumbnailImage: 'https://metrica-dip.com/images/slider-inicio-es/02.jpg',
    gallery: [
      {
        id: '2-1',
        url: 'https://metrica-dip.com/images/slider-inicio-es/01.jpg',
        thumbnail: 'https://metrica-dip.com/images/slider-inicio-es/01.jpg',
        caption: 'Terreno inicial para el centro comercial',
        stage: 'inicio',
        order: 1
      },
      {
        id: '2-2',
        url: 'https://metrica-dip.com/images/slider-inicio-es/03.jpg',
        thumbnail: 'https://metrica-dip.com/images/slider-inicio-es/03.jpg',
        caption: 'Diseño arquitectónico y masterplan',
        stage: 'inicio',
        order: 2
      },
      {
        id: '2-3',
        url: 'https://metrica-dip.com/images/slider-inicio-es/04.jpg',
        thumbnail: 'https://metrica-dip.com/images/slider-inicio-es/04.jpg',
        caption: 'Construcción de la estructura principal',
        stage: 'proceso',
        order: 1
      },
      {
        id: '2-4',
        url: 'https://metrica-dip.com/images/slider-inicio-es/05.jpg',
        thumbnail: 'https://metrica-dip.com/images/slider-inicio-es/05.jpg',
        caption: 'Instalación de sistemas MEP',
        stage: 'proceso',
        order: 2
      },
      {
        id: '2-5',
        url: 'https://metrica-dip.com/images/slider-inicio-es/06.jpg',
        thumbnail: 'https://metrica-dip.com/images/slider-inicio-es/06.jpg',
        caption: 'Acabados interiores en progress',
        stage: 'proceso',
        order: 3
      },
      {
        id: '2-6',
        url: 'https://metrica-dip.com/images/slider-inicio-es/02.jpg',
        thumbnail: 'https://metrica-dip.com/images/slider-inicio-es/02.jpg',
        caption: 'Vista general del centro comercial terminado',
        stage: 'final',
        order: 1
      },
      {
        id: '2-7',
        url: 'https://metrica-dip.com/images/slider-inicio-es/07.jpg',
        thumbnail: 'https://metrica-dip.com/images/slider-inicio-es/07.jpg',
        caption: 'Food court y áreas de entretenimiento',
        stage: 'final',
        order: 2
      },
      {
        id: '2-8',
        url: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400',
        caption: 'Atrium central con lucernario',
        stage: 'final',
        order: 3
      },
      {
        id: '2-9',
        url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400',
        caption: 'Tiendas ancla principales',
        stage: 'final',
        order: 4
      },
      {
        id: '2-10',
        url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
        caption: 'Cines multiplex',
        stage: 'final',
        order: 5
      },
      {
        id: '2-11',
        url: 'https://images.unsplash.com/photo-1596003906949-67221c37965c?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1596003906949-67221c37965c?w=400',
        caption: 'Estacionamiento con 1,500 plazas',
        stage: 'final',
        order: 6
      },
      {
        id: '2-12',
        url: 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=400',
        caption: 'Instalación de fachada comercial',
        stage: 'proceso',
        order: 4
      },
      {
        id: '2-13',
        url: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400',
        caption: 'Montaje de estructuras metálicas',
        stage: 'proceso',
        order: 5
      },
      {
        id: '2-14',
        url: 'https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=400',
        caption: 'Masterplan del proyecto comercial',
        stage: 'inicio',
        order: 3
      },
      {
        id: '2-15',
        url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400',
        caption: 'Estudios de impacto comercial',
        stage: 'inicio',
        order: 4
      }
    ],
    description: 'Centro comercial de gran formato con más de 200 tiendas, cines, food court y espacios de entretenimiento.',
    shortDescription: 'Centro comercial con más de 200 tiendas',
    details: {
      client: 'Mall Plaza',
      duration: '18 meses',
      investment: '$45M USD',
      team: ['Arquitectura', 'Ingeniería MEP', 'Supervisión'],
      area: '85,000 m²'
    },
    featured: true,
    completedAt: new Date('2023-03-20'),
    tags: ['retail', 'entretenimiento', 'gran formato']
  },
  {
    id: '3',
    title: 'Torre Corporativa Magdalena',
    slug: 'torre-corporativa-magdalena',
    category: ProjectCategory.OFICINA,
    location: {
      city: 'Lima',
      region: 'Lima',
      address: 'Av. Brasil 2950, Magdalena del Mar',
      coordinates: [-77.0717, -12.0961]
    },
    featuredImage: 'https://metrica-dip.com/images/slider-inicio-es/03.jpg',
    thumbnailImage: 'https://metrica-dip.com/images/slider-inicio-es/03.jpg',
    gallery: [
      {
        id: '3-1',
        url: 'https://metrica-dip.com/images/slider-inicio-es/03.jpg',
        thumbnail: 'https://metrica-dip.com/images/slider-inicio-es/03.jpg',
        caption: 'Vista inicial del terreno en Magdalena',
        stage: 'inicio',
        order: 1
      },
      {
        id: '3-2',
        url: 'https://metrica-dip.com/images/slider-inicio-es/04.jpg',
        thumbnail: 'https://metrica-dip.com/images/slider-inicio-es/04.jpg',
        caption: 'Estructura principal en construcción',
        stage: 'proceso',
        order: 1
      },
      {
        id: '3-3',
        url: 'https://metrica-dip.com/images/slider-inicio-es/05.jpg',
        thumbnail: 'https://metrica-dip.com/images/slider-inicio-es/05.jpg',
        caption: 'Torre corporativa completada',
        stage: 'final',
        order: 1
      }
    ],
    description: 'Torre corporativa de 18 pisos con certificación BREEAM, diseñada para maximizar la eficiencia energética y el bienestar de los ocupantes.',
    shortDescription: 'Torre corporativa de 18 pisos con certificación BREEAM',
    details: {
      client: 'Inversiones Magdalena S.A.',
      duration: '20 meses',
      investment: '$18M USD',
      team: ['Arquitectura', 'Ingeniería Estructural', 'Sustentabilidad'],
      certifications: ['BREEAM Excellent'],
      area: '12,500 m²'
    },
    featured: false,
    completedAt: new Date('2022-09-12'),
    tags: ['eficiencia energética', 'moderno', 'sustentable']
  },
  {
    id: '4',
    title: 'Centro de Negocios Miraflores',
    slug: 'centro-negocios-miraflores',
    category: ProjectCategory.OFICINA,
    location: {
      city: 'Lima',
      region: 'Lima',
      address: 'Av. Pardo 692, Miraflores',
      coordinates: [-77.0319, -12.1164]
    },
    featuredImage: 'https://metrica-dip.com/images/slider-inicio-es/04.jpg',
    thumbnailImage: 'https://metrica-dip.com/images/slider-inicio-es/04.jpg',
    gallery: [
      {
        id: '4-1',
        url: 'https://metrica-dip.com/images/slider-inicio-es/04.jpg',
        thumbnail: 'https://metrica-dip.com/images/slider-inicio-es/04.jpg',
        caption: 'Centro de negocios en Miraflores',
        stage: 'final',
        order: 1
      }
    ],
    description: 'Centro de negocios boutique con oficinas premium y coworking, ubicado en el corazón financiero de Miraflores.',
    shortDescription: 'Centro de negocios boutique con oficinas premium',
    details: {
      client: 'Miraflores Business Center',
      duration: '14 meses',
      investment: '$8M USD',
      team: ['Arquitectura', 'Diseño Interior'],
      area: '6,800 m²'
    },
    featured: false,
    completedAt: new Date('2023-11-30'),
    tags: ['boutique', 'coworking', 'premium']
  },
  {
    id: '5',
    title: 'Mall del Sur',
    slug: 'mall-del-sur',
    category: ProjectCategory.RETAIL,
    location: {
      city: 'Lima',
      region: 'Lima',
      address: 'Av. Paseo de la República Sur, San Juan de Miraflores',
      coordinates: [-76.9833, -12.1500]
    },
    featuredImage: 'https://metrica-dip.com/images/slider-inicio-es/05.jpg',
    thumbnailImage: 'https://metrica-dip.com/images/slider-inicio-es/05.jpg',
    gallery: [
      {
        id: '5-1',
        url: 'https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=400',
        caption: 'Diseño conceptual del centro comercial',
        stage: 'inicio',
        order: 1
      },
      {
        id: '5-2',
        url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400',
        caption: 'Planos arquitectónicos y zonificación',
        stage: 'inicio',
        order: 2
      },
      {
        id: '5-3',
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400',
        caption: 'Construcción de cimientos y estructura',
        stage: 'proceso',
        order: 1
      },
      {
        id: '5-4',
        url: 'https://images.unsplash.com/photo-1590764258395-1b8b8f83feca?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1590764258395-1b8b8f83feca?w=400',
        caption: 'Instalación de sistemas y acabados interiores',
        stage: 'proceso',
        order: 2
      },
      {
        id: '5-5',
        url: 'https://metrica-dip.com/images/slider-inicio-es/05.jpg',
        thumbnail: 'https://metrica-dip.com/images/slider-inicio-es/05.jpg',
        caption: 'Mall del Sur completado',
        stage: 'final',
        order: 1
      },
      {
        id: '5-6',
        url: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400',
        caption: 'Área de tiendas y pasillo principal',
        stage: 'final',
        order: 2
      },
      {
        id: '5-7',
        url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400',
        caption: 'Zona de entretenimiento familiar',
        stage: 'final',
        order: 3
      }
    ],
    description: 'Centro comercial regional con 180 tiendas, hipermercado, cines y zona de entretenimiento familiar.',
    shortDescription: 'Centro comercial regional con 180 tiendas',
    details: {
      client: 'Retail Group Peru',
      duration: '22 meses',
      investment: '$55M USD',
      team: ['Arquitectura', 'Ingeniería MEP', 'Retail Design'],
      area: '95,000 m²'
    },
    featured: false,
    completedAt: new Date('2022-07-15'),
    tags: ['regional', 'familiar', 'entretenimiento']
  },
  {
    id: '6',
    title: 'Outlet Premium Callao',
    slug: 'outlet-premium-callao',
    category: ProjectCategory.RETAIL,
    location: {
      city: 'Callao',
      region: 'Callao',
      address: 'Av. Oscar R. Benavides 5915, Callao',
      coordinates: [-77.1167, -12.0167]
    },
    featuredImage: 'https://metrica-dip.com/images/slider-inicio-es/06.jpg',
    thumbnailImage: 'https://metrica-dip.com/images/slider-inicio-es/06.jpg',
    gallery: [
      {
        id: '6-1',
        url: 'https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=400',
        caption: 'Planificación y diseño del outlet center',
        stage: 'inicio',
        order: 1
      },
      {
        id: '6-2',
        url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400',
        caption: 'Planos de lifestyle center al aire libre',
        stage: 'inicio',
        order: 2
      },
      {
        id: '6-3',
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400',
        caption: 'Construcción de las tiendas premium',
        stage: 'proceso',
        order: 1
      },
      {
        id: '6-4',
        url: 'https://images.unsplash.com/photo-1590764258395-1b8b8f83feca?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1590764258395-1b8b8f83feca?w=400',
        caption: 'Paisajismo y áreas comunes',
        stage: 'proceso',
        order: 2
      },
      {
        id: '6-5',
        url: 'https://metrica-dip.com/images/slider-inicio-es/06.jpg',
        thumbnail: 'https://metrica-dip.com/images/slider-inicio-es/06.jpg',
        caption: 'Outlet Premium en Callao completado',
        stage: 'final',
        order: 1
      },
      {
        id: '6-6',
        url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
        caption: 'Tiendas premium y marcas internacionales',
        stage: 'final',
        order: 2
      }
    ],
    description: 'Centro de outlets al aire libre con marcas premium internacionales y arquitectura tipo lifestyle center.',
    shortDescription: 'Centro de outlets con marcas premium internacionales',
    details: {
      client: 'Premium Outlets Peru',
      duration: '16 meses',
      investment: '$32M USD',
      team: ['Arquitectura', 'Paisajismo', 'Retail Planning'],
      area: '48,000 m²'
    },
    featured: false,
    completedAt: new Date('2023-05-20'),
    tags: ['outlet', 'premium', 'lifestyle']
  },
  {
    id: '7',
    title: 'Complejo Industrial Ventanilla',
    slug: 'complejo-industrial-ventanilla',
    category: ProjectCategory.INDUSTRIA,
    location: {
      city: 'Callao',
      region: 'Callao',
      address: 'Av. Néstor Gambetta Km 8.5',
      coordinates: [-77.1167, -11.8833]
    },
    featuredImage: 'https://metrica-dip.com/images/slider-inicio-es/03.jpg',
    thumbnailImage: 'https://metrica-dip.com/images/slider-inicio-es/03.jpg',
    gallery: [
      {
        id: '7-1',
        url: 'https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=400',
        caption: 'Planeación del complejo industrial',
        stage: 'inicio',
        order: 1
      },
      {
        id: '7-2',
        url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400',
        caption: 'Diseños técnicos de naves industriales',
        stage: 'inicio',
        order: 2
      },
      {
        id: '7-3',
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400',
        caption: 'Construcción de cimentación industrial',
        stage: 'proceso',
        order: 1
      },
      {
        id: '7-4',
        url: 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=400',
        caption: 'Montaje de estructura metálica',
        stage: 'proceso',
        order: 2
      },
      {
        id: '7-5',
        url: 'https://metrica-dip.com/images/slider-inicio-es/03.jpg',
        thumbnail: 'https://metrica-dip.com/images/slider-inicio-es/03.jpg',
        caption: 'Vista aérea del complejo industrial',
        stage: 'final',
        order: 1
      },
      {
        id: '7-6',
        url: 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=400',
        caption: 'Naves de manufactura terminadas',
        stage: 'final',
        order: 2
      },
      {
        id: '7-7',
        url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
        caption: 'Oficinas administrativas del complejo',
        stage: 'final',
        order: 3
      }
    ],
    description: 'Complejo industrial con naves de manufactura, oficinas administrativas y almacenes de alta rotación.',
    shortDescription: 'Complejo industrial con naves de manufactura',
    details: {
      client: 'Industrias del Pacífico',
      duration: '20 meses',
      investment: '$18M USD',
      team: ['Ingeniería Industrial', 'Arquitectura', 'Supervisión'],
      area: '35,000 m²'
    },
    featured: false,
    completedAt: new Date('2022-11-10'),
    tags: ['industrial', 'manufactura', 'logística']
  },
  {
    id: '8',
    title: 'Planta Industrial Lurín',
    slug: 'planta-industrial-lurin',
    category: ProjectCategory.INDUSTRIA,
    location: {
      city: 'Lima',
      region: 'Lima',
      address: 'Km 35 Panamericana Sur, Lurín',
      coordinates: [-76.8667, -12.2833]
    },
    featuredImage: 'https://metrica-dip.com/images/slider-inicio-es/07.jpg',
    thumbnailImage: 'https://metrica-dip.com/images/slider-inicio-es/07.jpg',
    gallery: [
      {
        id: '8-1',
        url: 'https://metrica-dip.com/images/slider-inicio-es/07.jpg',
        thumbnail: 'https://metrica-dip.com/images/slider-inicio-es/07.jpg',
        caption: 'Planta industrial en Lurín',
        stage: 'final',
        order: 1
      }
    ],
    description: 'Planta industrial automatizada para producción alimentaria con tecnología de última generación y sistemas de calidad internacional.',
    shortDescription: 'Planta industrial automatizada para producción alimentaria',
    details: {
      client: 'Alimentos del Pacífico S.A.',
      duration: '24 meses',
      investment: '$28M USD',
      team: ['Ingeniería Industrial', 'Automatización', 'Calidad'],
      certifications: ['HACCP', 'BRC'],
      area: '45,000 m²'
    },
    featured: false,
    completedAt: new Date('2023-02-10'),
    tags: ['automatización', 'alimentaria', 'calidad']
  },
  {
    id: '9',
    title: 'Centro Logístico Norte',
    slug: 'centro-logistico-norte',
    category: ProjectCategory.INDUSTRIA,
    location: {
      city: 'Lima',
      region: 'Lima',
      address: 'Av. Túpac Amaru Km 12, Ancón',
      coordinates: [-77.1667, -11.7667]
    },
    featuredImage: 'https://metrica-dip.com/images/slider-inicio-es/01.jpg',
    thumbnailImage: 'https://metrica-dip.com/images/slider-inicio-es/01.jpg',
    gallery: [
      {
        id: '9-1',
        url: 'https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=400',
        caption: 'Diseño del centro logístico',
        stage: 'inicio',
        order: 1
      },
      {
        id: '9-2',
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400',
        caption: 'Construcción de almacenes',
        stage: 'proceso',
        order: 1
      },
      {
        id: '9-3',
        url: 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=400',
        caption: 'Instalaciones logísticas',
        stage: 'proceso',
        order: 2
      },
      {
        id: '9-4',
        url: 'https://metrica-dip.com/images/slider-inicio-es/01.jpg',
        thumbnail: 'https://metrica-dip.com/images/slider-inicio-es/01.jpg',
        caption: 'Centro logístico completado',
        stage: 'final',
        order: 1
      },
      {
        id: '9-5',
        url: 'https://images.unsplash.com/photo-1606107557311-4f5e6f3c6c44?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1606107557311-4f5e6f3c6c44?w=400',
        caption: 'Área de carga y descarga',
        stage: 'final',
        order: 2
      }
    ],
    description: 'Centro de distribución logística con sistemas WMS, 50 andenes de carga y tecnología de almacenaje automatizado.',
    shortDescription: 'Centro de distribución con tecnología automatizada',
    details: {
      client: 'Logística Integral Peru',
      duration: '18 meses',
      investment: '$22M USD',
      team: ['Ingeniería Logística', 'Automatización', 'Estructural'],
      area: '65,000 m²'
    },
    featured: false,
    completedAt: new Date('2022-12-05'),
    tags: ['logística', 'automatizado', 'distribución']
  },
  {
    id: '10',
    title: 'Hotel Boutique Miraflores',
    slug: 'hotel-boutique-miraflores',
    category: ProjectCategory.HOTELERIA,
    location: {
      city: 'Lima',
      region: 'Lima',
      address: 'Malecón de la Reserva 610, Miraflores',
      coordinates: [-77.0319, -12.1203]
    },
    featuredImage: 'https://metrica-dip.com/images/slider-inicio-es/04.jpg',
    thumbnailImage: 'https://metrica-dip.com/images/slider-inicio-es/04.jpg',
    gallery: [
      {
        id: '10-1',
        url: 'https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=400',
        caption: 'Diseño arquitectónico del hotel boutique',
        stage: 'inicio',
        order: 1
      },
      {
        id: '10-2',
        url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400',
        caption: 'Planos de habitaciones y espacios comunes',
        stage: 'inicio',
        order: 2
      },
      {
        id: '10-3',
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400',
        caption: 'Construcción de estructura hotelera',
        stage: 'proceso',
        order: 1
      },
      {
        id: '10-4',
        url: 'https://images.unsplash.com/photo-1590764258395-1b8b8f83feca?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1590764258395-1b8b8f83feca?w=400',
        caption: 'Instalación de acabados de lujo',
        stage: 'proceso',
        order: 2
      },
      {
        id: '10-5',
        url: 'https://metrica-dip.com/images/slider-inicio-es/04.jpg',
        thumbnail: 'https://metrica-dip.com/images/slider-inicio-es/04.jpg',
        caption: 'Fachada principal del hotel',
        stage: 'final',
        order: 1
      },
      {
        id: '10-6',
        url: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400',
        caption: 'Suite presidencial con vista al mar',
        stage: 'final',
        order: 2
      },
      {
        id: '10-7',
        url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400',
        caption: 'Restaurante gourmet del hotel',
        stage: 'final',
        order: 3
      }
    ],
    description: 'Hotel boutique de lujo con vista al océano, 120 habitaciones, spa, restaurante gourmet y centro de eventos.',
    shortDescription: 'Hotel boutique de lujo con 120 habitaciones',
    details: {
      client: 'Hoteles Luxury Collection',
      duration: '22 meses',
      investment: '$35M USD',
      team: ['Arquitectura', 'Diseño Interior', 'Ingeniería MEP'],
      certifications: ['5 Estrellas'],
      area: '12,000 m²'
    },
    featured: true,
    completedAt: new Date('2023-08-05'),
    tags: ['lujo', 'turismo', 'vista al mar']
  },
  {
    id: '11',
    title: 'Resort Eco Lodge Paracas',
    slug: 'resort-eco-lodge-paracas',
    category: ProjectCategory.HOTELERIA,
    location: {
      city: 'Paracas',
      region: 'Ica',
      address: 'Reserva Nacional de Paracas, Ica',
      coordinates: [-76.2500, -13.8667]
    },
    featuredImage: 'https://metrica-dip.com/images/slider-inicio-es/05.jpg',
    thumbnailImage: 'https://metrica-dip.com/images/slider-inicio-es/05.jpg',
    gallery: [
      {
        id: '11-1',
        url: 'https://metrica-dip.com/images/slider-inicio-es/05.jpg',
        thumbnail: 'https://metrica-dip.com/images/slider-inicio-es/05.jpg',
        caption: 'Resort eco lodge en Paracas',
        stage: 'final',
        order: 1
      }
    ],
    description: 'Resort eco-sostenible con 80 suites frente al mar, spa wellness y arquitectura que se integra con el paisaje desértico.',
    shortDescription: 'Resort eco-sostenible con 80 suites frente al mar',
    details: {
      client: 'Eco Hotels Peru',
      duration: '28 meses',
      investment: '$45M USD',
      team: ['Arquitectura Sostenible', 'Paisajismo', 'Hospitality Design'],
      certifications: ['LEED Platinum', 'Green Globe'],
      area: '18,500 m²'
    },
    featured: true,
    completedAt: new Date('2023-09-18'),
    tags: ['eco-sostenible', 'wellness', 'frente al mar']
  },
  {
    id: '12',
    title: 'Hotel Business Cusco',
    slug: 'hotel-business-cusco',
    category: ProjectCategory.HOTELERIA,
    location: {
      city: 'Cusco',
      region: 'Cusco',
      address: 'Av. El Sol 954, Cusco',
      coordinates: [-71.9675, -13.5164]
    },
    featuredImage: 'https://metrica-dip.com/images/slider-inicio-es/06.jpg',
    thumbnailImage: 'https://metrica-dip.com/images/slider-inicio-es/06.jpg',
    gallery: [
      {
        id: '12-1',
        url: 'https://metrica-dip.com/images/slider-inicio-es/06.jpg',
        thumbnail: 'https://metrica-dip.com/images/slider-inicio-es/06.jpg',
        caption: 'Hotel business en Cusco',
        stage: 'final',
        order: 1
      }
    ],
    description: 'Hotel ejecutivo de 140 habitaciones que combina arquitectura colonial con tecnología moderna, ubicado en el centro histórico.',
    shortDescription: 'Hotel ejecutivo que combina arquitectura colonial y moderna',
    details: {
      client: 'Heritage Hotels Group',
      duration: '26 meses',
      investment: '$28M USD',
      team: ['Restauración Patrimonial', 'Arquitectura', 'Tecnología'],
      certifications: ['Patrimonio Cultural'],
      area: '14,200 m²'
    },
    featured: false,
    completedAt: new Date('2022-11-25'),
    tags: ['patrimonio', 'ejecutivo', 'centro histórico']
  },
  {
    id: '13',
    title: 'Colegio Internacional La Molina',
    slug: 'colegio-internacional-la-molina',
    category: ProjectCategory.EDUCACION,
    location: {
      city: 'Lima',
      region: 'Lima',
      address: 'Av. La Molina 1678, La Molina',
      coordinates: [-76.9667, -12.0833]
    },
    featuredImage: 'https://metrica-dip.com/images/slider-inicio-es/05.jpg',
    thumbnailImage: 'https://metrica-dip.com/images/slider-inicio-es/05.jpg',
    gallery: [
      {
        id: '5-1',
        url: 'https://metrica-dip.com/images/slider-inicio-es/05.jpg',
        thumbnail: 'https://metrica-dip.com/images/slider-inicio-es/05.jpg',
        caption: 'Campus del colegio',
        stage: 'final',
        order: 1
      }
    ],
    description: 'Institución educativa moderna con aulas inteligentes, laboratorios científicos, biblioteca digital y espacios deportivos.',
    shortDescription: 'Colegio internacional con aulas inteligentes',
    details: {
      client: 'Fundación Educativa Internacional',
      duration: '16 meses',
      investment: '$12M USD',
      team: ['Arquitectura Educativa', 'Ingeniería', 'Paisajismo'],
      certifications: ['Certificación Educativa Internacional'],
      area: '8,500 m²'
    },
    featured: false,
    completedAt: new Date('2023-01-15'),
    tags: ['educación', 'tecnología', 'sostenible']
  },
  {
    id: '14',
    title: 'Universidad Tecnológica del Norte',
    slug: 'universidad-tecnologica-norte',
    category: ProjectCategory.EDUCACION,
    location: {
      city: 'Trujillo',
      region: 'La Libertad',
      address: 'Av. América Norte 3145, Trujillo',
      coordinates: [-79.0192, -8.1116]
    },
    featuredImage: 'https://metrica-dip.com/images/slider-inicio-es/07.jpg',
    thumbnailImage: 'https://metrica-dip.com/images/slider-inicio-es/07.jpg',
    gallery: [
      {
        id: '14-1',
        url: 'https://metrica-dip.com/images/slider-inicio-es/07.jpg',
        thumbnail: 'https://metrica-dip.com/images/slider-inicio-es/07.jpg',
        caption: 'Campus universitario en Trujillo',
        stage: 'final',
        order: 1
      }
    ],
    description: 'Campus universitario moderno con 12 facultades, laboratorios de investigación y espacios colaborativos para 8,000 estudiantes.',
    shortDescription: 'Campus universitario moderno para 8,000 estudiantes',
    details: {
      client: 'Fundación Educativa Norte',
      duration: '36 meses',
      investment: '$85M USD',
      team: ['Arquitectura Educativa', 'Ingeniería', 'Tecnología Educativa'],
      certifications: ['Certificación Educativa SUNEDU'],
      area: '125,000 m²'
    },
    featured: true,
    completedAt: new Date('2023-03-20'),
    tags: ['universitario', 'investigación', 'tecnológico']
  },
  {
    id: '15',
    title: 'Instituto Técnico San Martín',
    slug: 'instituto-tecnico-san-martin',
    category: ProjectCategory.EDUCACION,
    location: {
      city: 'Lima',
      region: 'Lima',
      address: 'Av. Universitaria 1920, San Martín de Porres',
      coordinates: [-77.0833, -12.0167]
    },
    featuredImage: 'https://metrica-dip.com/images/slider-inicio-es/01.jpg',
    thumbnailImage: 'https://metrica-dip.com/images/slider-inicio-es/01.jpg',
    gallery: [
      {
        id: '15-1',
        url: 'https://metrica-dip.com/images/slider-inicio-es/01.jpg',
        thumbnail: 'https://metrica-dip.com/images/slider-inicio-es/01.jpg',
        caption: 'Instituto técnico en San Martín',
        stage: 'final',
        order: 1
      }
    ],
    description: 'Instituto de educación técnica superior con talleres especializados, laboratorios y biblioteca digital moderna.',
    shortDescription: 'Instituto técnico con talleres especializados',
    details: {
      client: 'Instituto Superior San Martín',
      duration: '20 meses',
      investment: '$15M USD',
      team: ['Arquitectura Técnica', 'Equipamiento', 'Tecnología'],
      area: '18,500 m²'
    },
    featured: false,
    completedAt: new Date('2022-08-15'),
    tags: ['técnico', 'talleres', 'especializado']
  },
  {
    id: '16',
    title: 'Condominio Residencial Los Jardines',
    slug: 'condominio-residencial-los-jardines',
    category: ProjectCategory.VIVIENDA,
    location: {
      city: 'Lima',
      region: 'Lima',
      address: 'Av. Los Jardines 234, Surco',
      coordinates: [-76.9833, -12.1333]
    },
    featuredImage: 'https://metrica-dip.com/images/slider-inicio-es/06.jpg',
    thumbnailImage: 'https://metrica-dip.com/images/slider-inicio-es/06.jpg',
    gallery: [
      {
        id: '6-1',
        url: 'https://metrica-dip.com/images/slider-inicio-es/06.jpg',
        thumbnail: 'https://metrica-dip.com/images/slider-inicio-es/06.jpg',
        caption: 'Vista del condominio',
        stage: 'final',
        order: 1
      }
    ],
    description: 'Complejo residencial de 180 departamentos con áreas comunes, gimnasio, piscina y áreas verdes.',
    shortDescription: 'Condominio residencial con 180 departamentos',
    details: {
      client: 'Inmobiliaria Los Jardines',
      duration: '30 meses',
      investment: '$28M USD',
      team: ['Arquitectura Residencial', 'Ingeniería', 'Paisajismo'],
      area: '25,000 m²'
    },
    featured: false,
    completedAt: new Date('2022-12-20'),
    tags: ['residencial', 'familiar', 'áreas verdes']
  },
  {
    id: '17',
    title: 'Torres Residenciales Barranco',
    slug: 'torres-residenciales-barranco',
    category: ProjectCategory.VIVIENDA,
    location: {
      city: 'Lima',
      region: 'Lima',
      address: 'Av. Grau 1245, Barranco',
      coordinates: [-77.0167, -12.1333]
    },
    featuredImage: 'https://metrica-dip.com/images/slider-inicio-es/02.jpg',
    thumbnailImage: 'https://metrica-dip.com/images/slider-inicio-es/02.jpg',
    gallery: [
      {
        id: '17-1',
        url: 'https://metrica-dip.com/images/slider-inicio-es/02.jpg',
        thumbnail: 'https://metrica-dip.com/images/slider-inicio-es/02.jpg',
        caption: 'Torres residenciales en Barranco',
        stage: 'final',
        order: 1
      }
    ],
    description: 'Dos torres residenciales de 25 pisos con 320 departamentos, rooftop con piscina y vistas panorámicas al mar.',
    shortDescription: 'Torres residenciales con 320 departamentos y vista al mar',
    details: {
      client: 'Desarrollos Inmobiliarios Barranco',
      duration: '42 meses',
      investment: '$95M USD',
      team: ['Arquitectura Residencial', 'Estructural', 'Paisajismo'],
      area: '85,000 m²'
    },
    featured: true,
    completedAt: new Date('2023-07-10'),
    tags: ['torres', 'vista al mar', 'lujo residencial']
  },
  {
    id: '18',
    title: 'Condominio Eco Village',
    slug: 'condominio-eco-village',
    category: ProjectCategory.VIVIENDA,
    location: {
      city: 'Lima',
      region: 'Lima',
      address: 'Km 38.5 Panamericana Sur, Asia',
      coordinates: [-76.7833, -12.7833]
    },
    featuredImage: 'https://metrica-dip.com/images/slider-inicio-es/03.jpg',
    thumbnailImage: 'https://metrica-dip.com/images/slider-inicio-es/03.jpg',
    gallery: [
      {
        id: '18-1',
        url: 'https://metrica-dip.com/images/slider-inicio-es/03.jpg',
        thumbnail: 'https://metrica-dip.com/images/slider-inicio-es/03.jpg',
        caption: 'Condominio eco village en Asia',
        stage: 'final',
        order: 1
      }
    ],
    description: 'Condominio eco-sostenible con 150 casas bioclimáticas, huertos urbanos y sistema de energía solar.',
    shortDescription: 'Condominio eco-sostenible con 150 casas bioclimáticas',
    details: {
      client: 'Green Living Peru',
      duration: '36 meses',
      investment: '$48M USD',
      team: ['Arquitectura Sostenible', 'Energías Renovables', 'Paisajismo'],
      certifications: ['EDGE Green Building'],
      area: '120,000 m²'
    },
    featured: false,
    completedAt: new Date('2023-01-28'),
    tags: ['eco-sostenible', 'bioclimático', 'energía solar']
  },
  {
    id: '19',
    title: 'Clínica Especializada San Borja',
    slug: 'clinica-especializada-san-borja',
    category: ProjectCategory.SALUD,
    location: {
      city: 'Lima',
      region: 'Lima',
      address: 'Av. San Borja Norte 523, San Borja',
      coordinates: [-76.9967, -12.1000]
    },
    featuredImage: 'https://metrica-dip.com/images/slider-inicio-es/07.jpg',
    thumbnailImage: 'https://metrica-dip.com/images/slider-inicio-es/07.jpg',
    gallery: [
      {
        id: '7-1',
        url: 'https://metrica-dip.com/images/slider-inicio-es/07.jpg',
        thumbnail: 'https://metrica-dip.com/images/slider-inicio-es/07.jpg',
        caption: 'Fachada de la clínica',
        stage: 'final',
        order: 1
      }
    ],
    description: 'Centro médico de alta complejidad con quirófanos de última generación, UCI, emergencia y consultorios especializados.',
    shortDescription: 'Clínica especializada con tecnología médica avanzada',
    details: {
      client: 'Grupo Médico San Borja',
      duration: '26 meses',
      investment: '$22M USD',
      team: ['Arquitectura Hospitalaria', 'Ingeniería Biomédica', 'Supervisión'],
      certifications: ['Certificación Hospitalaria Internacional'],
      area: '18,000 m²'
    },
    featured: true,
    completedAt: new Date('2023-04-10'),
    tags: ['salud', 'alta tecnología', 'especializado']
  },
  {
    id: '20',
    title: 'Hospital Regional Arequipa',
    slug: 'hospital-regional-arequipa',
    category: ProjectCategory.SALUD,
    location: {
      city: 'Arequipa',
      region: 'Arequipa',
      address: 'Av. Independencia 355, Arequipa',
      coordinates: [-71.5370, -16.3988]
    },
    featuredImage: 'https://metrica-dip.com/images/slider-inicio-es/04.jpg',
    thumbnailImage: 'https://metrica-dip.com/images/slider-inicio-es/04.jpg',
    gallery: [
      {
        id: '20-1',
        url: 'https://metrica-dip.com/images/slider-inicio-es/04.jpg',
        thumbnail: 'https://metrica-dip.com/images/slider-inicio-es/04.jpg',
        caption: 'Hospital regional en Arequipa',
        stage: 'final',
        order: 1
      }
    ],
    description: 'Hospital de tercer nivel con 450 camas, centro de trauma, oncología y telemedicina para el sur del país.',
    shortDescription: 'Hospital de tercer nivel con 450 camas',
    details: {
      client: 'Ministerio de Salud',
      duration: '48 meses',
      investment: '$120M USD',
      team: ['Arquitectura Hospitalaria', 'Ingeniería Biomédica', 'Infraestructura'],
      certifications: ['Habilitación Sanitaria', 'ISO 14001'],
      area: '95,000 m²'
    },
    featured: true,
    completedAt: new Date('2023-12-15'),
    tags: ['público', 'tercer nivel', 'regional']
  },
  {
    id: '21',
    title: 'Centro Médico Oncológico',
    slug: 'centro-medico-oncologico',
    category: ProjectCategory.SALUD,
    location: {
      city: 'Lima',
      region: 'Lima',
      address: 'Av. Benavides 2180, Miraflores',
      coordinates: [-77.0319, -12.1297]
    },
    featuredImage: 'https://metrica-dip.com/images/slider-inicio-es/05.jpg',
    thumbnailImage: 'https://metrica-dip.com/images/slider-inicio-es/05.jpg',
    gallery: [
      {
        id: '21-1',
        url: 'https://metrica-dip.com/images/slider-inicio-es/05.jpg',
        thumbnail: 'https://metrica-dip.com/images/slider-inicio-es/05.jpg',
        caption: 'Centro oncológico en Miraflores',
        stage: 'final',
        order: 1
      }
    ],
    description: 'Centro especializado en oncología con acelerador lineal, PET-CT y áreas de hospitalización oncológica.',
    shortDescription: 'Centro oncológico con tecnología de vanguardia',
    details: {
      client: 'Oncología Avanzada S.A.',
      duration: '32 meses',
      investment: '$65M USD',
      team: ['Arquitectura Médica Especializada', 'Radioprotección', 'Tecnología Médica'],
      certifications: ['Licencia Radiológica', 'Acreditación Internacional'],
      area: '28,000 m²'
    },
    featured: false,
    completedAt: new Date('2022-10-08'),
    tags: ['oncología', 'especializado', 'alta tecnología']
  }
];

// Utilidades para filtros y búsqueda
export const getCategoryColor = (category: ProjectCategory): string => {
  const colors = {
    [ProjectCategory.OFICINA]: 'text-blue-500',
    [ProjectCategory.RETAIL]: 'text-cyan-500',
    [ProjectCategory.INDUSTRIA]: 'text-gray-500',
    [ProjectCategory.HOTELERIA]: 'text-purple-500',
    [ProjectCategory.EDUCACION]: 'text-green-500',
    [ProjectCategory.VIVIENDA]: 'text-yellow-500',
    [ProjectCategory.SALUD]: 'text-red-500'
  };
  return colors[category];
};

export const getCategoryBgColor = (category: ProjectCategory): string => {
  const colors = {
    [ProjectCategory.OFICINA]: 'bg-blue-500/10',
    [ProjectCategory.RETAIL]: 'bg-cyan-500/10',
    [ProjectCategory.INDUSTRIA]: 'bg-gray-500/10',
    [ProjectCategory.HOTELERIA]: 'bg-purple-500/10',
    [ProjectCategory.EDUCACION]: 'bg-green-500/10',
    [ProjectCategory.VIVIENDA]: 'bg-yellow-500/10',
    [ProjectCategory.SALUD]: 'bg-red-500/10'
  };
  return colors[category];
};

export const getCategoryLabel = (category: ProjectCategory): string => {
  const labels = {
    [ProjectCategory.OFICINA]: 'Oficina',
    [ProjectCategory.RETAIL]: 'Retail',
    [ProjectCategory.INDUSTRIA]: 'Industria',
    [ProjectCategory.HOTELERIA]: 'Hotelería',
    [ProjectCategory.EDUCACION]: 'Educación',
    [ProjectCategory.VIVIENDA]: 'Vivienda',
    [ProjectCategory.SALUD]: 'Salud'
  };
  return labels[category];
};

export const getUniqueLocations = (projects: Project[]): string[] => {
  const locations = new Set<string>();
  projects.forEach(project => {
    locations.add(project.location.city);
  });
  return Array.from(locations).sort();
};

export const getUniqueYears = (projects: Project[]): number[] => {
  const years = new Set<number>();
  projects.forEach(project => {
    if (project.completedAt) {
      years.add(project.completedAt.getFullYear());
    }
  });
  return Array.from(years).sort((a, b) => b - a);
};