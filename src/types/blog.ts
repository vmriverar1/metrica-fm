// Blog Types - Basado en la estrategia blog-strategy.md
export type BlogCategory = 
  | 'industria-tendencias' 
  | 'casos-estudio' 
  | 'guias-tecnicas' 
  | 'liderazgo-vision';

export interface Author {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  linkedin?: string;
  email?: string;
}

export interface SEOData {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  canonicalUrl?: string;
  ogImage?: string;
  schemaType: 'Article' | 'BlogPosting' | 'TechArticle';
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: BlogCategory;
  tags: string[];
  author: Author;
  publishedAt: Date;
  updatedAt?: Date;
  readingTime: number; // en minutos
  excerpt: string;
  content: string;
  featuredImage: string;
  images?: string[];
  seo: SEOData;
  featured: boolean;
  views?: number;
  likes?: number;
  status: 'draft' | 'published' | 'archived';
}

export interface BlogFilters {
  category?: BlogCategory;
  author?: string;
  tags?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  featured?: boolean;
  searchQuery?: string;
}

export interface BlogStats {
  totalPosts: number;
  totalAuthors: number;
  totalCategories: number;
  averageReadingTime: number;
  totalViews: number;
  popularTags: { tag: string; count: number }[];
}

// Funciones helper
export function getBlogCategoryLabel(category: BlogCategory): string {
  const labels: Record<BlogCategory, string> = {
    'industria-tendencias': 'Industria & Tendencias',
    'casos-estudio': 'Casos de Estudio',
    'guias-tecnicas': 'Guías Técnicas',
    'liderazgo-vision': 'Liderazgo & Visión'
  };
  return labels[category];
}

export function getBlogCategoryDescription(category: BlogCategory): string {
  const descriptions: Record<BlogCategory, string> = {
    'industria-tendencias': 'Análisis de mercado inmobiliario, tendencias en construcción sostenible e innovaciones tecnológicas del sector.',
    'casos-estudio': 'Deep dives de proyectos emblemáticos con lecciones aprendidas, métricas reales y testimonios de clientes.',
    'guias-tecnicas': 'Metodologías de gestión de proyectos, guías de cumplimiento normativo y herramientas especializadas.',
    'liderazgo-vision': 'Insights de líderes, filosofía empresarial, predicciones de mercado y participación en eventos del sector.'
  };
  return descriptions[category];
}

// Data de ejemplo basada en blog-strategy.md
export const sampleAuthors: Author[] = [
  {
    id: '1',
    name: 'Carlos Mendoza',
    role: 'Director General',
    bio: 'Arquitecto con 20+ años de experiencia en dirección integral de proyectos. Especialista en infraestructura comercial y sostenibilidad.',
    avatar: 'https://i.pravatar.cc/400?img=12',
    linkedin: 'https://linkedin.com/in/carlos-mendoza',
    email: 'cmendoza@metricadip.com'
  },
  {
    id: '2', 
    name: 'Ana Rodriguez',
    role: 'Gerente de Proyectos',
    bio: 'Ingeniera Civil especializada en gestión de proyectos de gran escala. Experta en metodologías PMI y construcción sostenible.',
    avatar: 'https://i.pravatar.cc/400?img=32',
    linkedin: 'https://linkedin.com/in/ana-rodriguez',
    email: 'arodriguez@metricadip.com'
  },
  {
    id: '3',
    name: 'Roberto Silva',
    role: 'Especialista en Normativas',
    bio: 'Abogado especializado en normativas de construcción y regulaciones municipales. 15 años asesorando proyectos inmobiliarios.',
    avatar: 'https://i.pravatar.cc/400?img=14',
    linkedin: 'https://linkedin.com/in/roberto-silva',
    email: 'rsilva@metricadip.com'
  },
  {
    id: '4',
    name: 'María Fernández',
    role: 'Jefa de Sostenibilidad',
    bio: 'Arquitecta LEED AP con especialización en diseño bioclimático y eficiencia energética. Líder en proyectos de certificación verde.',
    avatar: 'https://i.pravatar.cc/400?img=45',
    linkedin: 'https://linkedin.com/in/maria-fernandez',
    email: 'mfernandez@metricadip.com'
  },
  {
    id: '5',
    name: 'Jorge Vargas',
    role: 'Director de Innovación',
    bio: 'Ingeniero Industrial con MBA, especializado en transformación digital y metodologías ágiles aplicadas a construcción.',
    avatar: 'https://i.pravatar.cc/400?img=68',
    linkedin: 'https://linkedin.com/in/jorge-vargas',
    email: 'jvargas@metricadip.com'
  }
];

export const sampleBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'El Futuro de la Construcción Sostenible en el Perú',
    slug: 'futuro-construccion-sostenible-peru',
    category: 'industria-tendencias',
    tags: ['sostenibilidad', 'construcción verde', 'LEED', 'innovación'],
    author: sampleAuthors[0],
    publishedAt: new Date('2024-12-15'),
    readingTime: 8,
    excerpt: 'Análisis completo de las tendencias en construcción sostenible y su impacto en el mercado inmobiliario peruano para 2025.',
    content: `# El Futuro de la Construcción Sostenible en el Perú

La industria de la construcción en el Perú está experimentando una transformación hacia prácticas más sostenibles...

## Tendencias Clave para 2025

### 1. Certificaciones Verdes
La adopción de certificaciones LEED y BREEAM está creciendo exponencialmente...

### 2. Materiales Innovadores
El uso de materiales locales y reciclados se está convirtiendo en estándar...

### 3. Eficiencia Energética
Los edificios net-zero están ganando tracción en el mercado corporativo...`,
    featuredImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=630',
    seo: {
      metaTitle: 'El Futuro de la Construcción Sostenible en el Perú | Blog Métrica DIP',
      metaDescription: 'Descubre las tendencias en construcción sostenible que transformarán el mercado inmobiliario peruano en 2025.',
      keywords: ['construcción sostenible', 'LEED Perú', 'edificios verdes', 'arquitectura sostenible'],
      schemaType: 'Article'
    },
    featured: true,
    views: 2430,
    likes: 156,
    status: 'published'
  },
  {
    id: '2',
    title: 'Caso de Estudio: Torre San Isidro - Innovación en Altura',
    slug: 'caso-estudio-torre-san-isidro',
    category: 'casos-estudio',
    tags: ['caso estudio', 'oficinas', 'San Isidro', 'innovación'],
    author: sampleAuthors[1],
    publishedAt: new Date('2024-12-10'),
    readingTime: 12,
    excerpt: 'Deep dive del proyecto Torre San Isidro: desafíos, soluciones innovadoras y lecciones aprendidas en 18 meses de construcción.',
    content: `# Caso de Estudio: Torre San Isidro

La Torre San Isidro representa uno de nuestros proyectos más ambiciosos...

## El Desafío Inicial
Construir 25 pisos en un terreno irregular de solo 800m²...

## Soluciones Implementadas
### Tecnología BIM
Implementamos modelado 5D para optimización de costos...`,
    featuredImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=630',
    seo: {
      metaTitle: 'Caso de Estudio: Torre San Isidro | Blog Métrica DIP',
      metaDescription: 'Análisis completo del proyecto Torre San Isidro: metodologías, desafíos y resultados de 18 meses de construcción.',
      keywords: ['torre san isidro', 'caso estudio construcción', 'oficinas lima', 'BIM'],
      schemaType: 'Article'
    },
    featured: true,
    views: 1875,
    likes: 98,
    status: 'published'
  },
  {
    id: '3',
    title: 'Guía Completa: Certificación LEED en el Perú',
    slug: 'guia-certificacion-leed-peru',
    category: 'guias-tecnicas',
    tags: ['LEED', 'certificación', 'guía', 'sostenibilidad'],
    author: sampleAuthors[0],
    publishedAt: new Date('2024-12-05'),
    readingTime: 15,
    excerpt: 'Guía paso a paso para obtener certificación LEED en proyectos peruanos: requisitos, proceso, costos y beneficios.',
    content: `# Guía Completa: Certificación LEED en el Perú

La certificación LEED (Leadership in Energy and Environmental Design)...

## ¿Qué es LEED?
LEED es un sistema de certificación...

## Proceso de Certificación
### Paso 1: Registro del Proyecto
### Paso 2: Documentación
### Paso 3: Revisión y Certificación`,
    featuredImage: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=1200&h=630',
    seo: {
      metaTitle: 'Guía LEED Perú: Certificación Paso a Paso | Blog Métrica DIP',
      metaDescription: 'Guía completa para obtener certificación LEED en Perú: proceso, requisitos, costos y beneficios detallados.',
      keywords: ['LEED Perú', 'certificación verde', 'construcción sostenible', 'guía LEED'],
      schemaType: 'TechArticle'
    },
    featured: false,
    views: 3240,
    likes: 287,
    status: 'published'
  }
];

// Funciones helper para datos
export function getBlogPost(slug: string): BlogPost | null {
  return sampleBlogPosts.find(post => post.slug === slug) || null;
}

export function getBlogPostsByCategory(category: BlogCategory): BlogPost[] {
  return sampleBlogPosts.filter(post => post.category === category);
}

export function getFeaturedBlogPosts(): BlogPost[] {
  return sampleBlogPosts.filter(post => post.featured);
}

export function getBlogStats(): BlogStats {
  const totalViews = sampleBlogPosts.reduce((sum, post) => sum + (post.views || 0), 0);
  const averageReadingTime = Math.round(
    sampleBlogPosts.reduce((sum, post) => sum + post.readingTime, 0) / sampleBlogPosts.length
  );
  
  const allTags = sampleBlogPosts.flatMap(post => post.tags);
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const popularTags = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalPosts: sampleBlogPosts.length,
    totalAuthors: sampleAuthors.length,
    totalCategories: 4,
    averageReadingTime,
    totalViews,
    popularTags
  };
}