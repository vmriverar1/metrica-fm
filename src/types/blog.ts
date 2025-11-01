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
  hide_hero_text?: boolean;
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
    'industria-tendencias': 'Tendencias de Industria',
    'casos-estudio': 'Casos de Estudio',
    'guias-tecnicas': 'Guías Técnicas',
    'liderazgo-vision': 'Liderazgo y Visión'
  };
  return labels[category];
}

export function getBlogCategoryDescription(category: BlogCategory): string {
  const descriptions: Record<BlogCategory, string> = {
    'industria-tendencias': 'Análisis y perspectivas sobre las últimas tendencias en construcción e infraestructura',
    'casos-estudio': 'Análisis detallados de proyectos exitosos y lecciones aprendidas',
    'guias-tecnicas': 'Guías prácticas y recursos técnicos para profesionales del sector',
    'liderazgo-vision': 'Reflexiones sobre liderazgo y visión estratégica en el sector construcción'
  };
  return descriptions[category];
}

// Funciones helper para datos - ahora usan Firestore en lugar de arrays estáticos
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const { usePublicBlog, convertToCompatibleFormat } = await import('@/hooks/useNewsletterPublic');
    const services = await import('@/lib/firestore/newsletter-service');
    const articulos = new services.ArticulosService();
    const articulo = await articulos.getBySlug(slug);
    if (!articulo) return null;

    const articuloConRelaciones = await articulos.getConRelaciones(articulo.id);
    if (!articuloConRelaciones) return null;

    const converted = convertToCompatibleFormat([articuloConRelaciones]);
    const blogPost = converted[0];

    // Convertir al formato BlogPost
    return {
      id: blogPost.id,
      title: blogPost.title,
      slug: blogPost.slug,
      category: blogPost.category as BlogCategory,
      tags: blogPost.tags,
      author: blogPost.author,
      publishedAt: blogPost.publishedAt,
      readingTime: blogPost.readingTime,
      excerpt: blogPost.excerpt,
      content: blogPost.content,
      featuredImage: blogPost.featuredImage,
      seo: {
        metaTitle: blogPost.seo.metaTitle,
        metaDescription: blogPost.seo.metaDescription,
        keywords: blogPost.seo.keywords,
        schemaType: 'Article'
      },
      featured: blogPost.featured,
      status: 'published' as const
    };
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

export async function getBlogPostsByCategory(category: BlogCategory): Promise<BlogPost[]> {
  try {
    const { usePublicBlog, convertToCompatibleFormat } = await import('@/hooks/useNewsletterPublic');
    const services = await import('@/lib/firestore/newsletter-service');
    const articulos = new services.ArticulosService();
    const result = await articulos.getAll();

    // Obtener artículos con relaciones
    const articulosConRelaciones = [];
    for (const articulo of result.data) {
      const articuloConRelacion = await articulos.getConRelaciones(articulo.id);
      if (articuloConRelacion) {
        articulosConRelaciones.push(articuloConRelacion);
      }
    }

    const converted = convertToCompatibleFormat(articulosConRelaciones);

    const filteredPosts = converted.filter(post => post.category === category);

    // Convertir al formato BlogPost
    return filteredPosts.map(blogPost => ({
      id: blogPost.id,
      title: blogPost.title,
      slug: blogPost.slug,
      category: blogPost.category as BlogCategory,
      tags: blogPost.tags,
      author: blogPost.author,
      publishedAt: blogPost.publishedAt,
      readingTime: blogPost.readingTime,
      excerpt: blogPost.excerpt,
      content: blogPost.content,
      featuredImage: blogPost.featuredImage,
      seo: {
        metaTitle: blogPost.seo.metaTitle,
        metaDescription: blogPost.seo.metaDescription,
        keywords: blogPost.seo.keywords,
        schemaType: 'Article'
      },
      featured: blogPost.featured,
      status: 'published' as const
    }));
  } catch (error) {
    console.error('Error fetching blog posts by category:', error);
    return [];
  }
}

export async function getFeaturedBlogPosts(): Promise<BlogPost[]> {
  try {
    const { usePublicBlog, convertToCompatibleFormat } = await import('@/hooks/useNewsletterPublic');
    const services = await import('@/lib/firestore/newsletter-service');
    const articulos = new services.ArticulosService();
    const result = await articulos.getAll({ featured: true });

    // Obtener artículos con relaciones
    const articulosConRelaciones = [];
    for (const articulo of result.data) {
      const articuloConRelacion = await articulos.getConRelaciones(articulo.id);
      if (articuloConRelacion) {
        articulosConRelaciones.push(articuloConRelacion);
      }
    }

    const converted = convertToCompatibleFormat(articulosConRelaciones);

    // Convertir al formato BlogPost
    return converted.map(blogPost => ({
      id: blogPost.id,
      title: blogPost.title,
      slug: blogPost.slug,
      category: blogPost.category as BlogCategory,
      tags: blogPost.tags,
      author: blogPost.author,
      publishedAt: blogPost.publishedAt,
      readingTime: blogPost.readingTime,
      excerpt: blogPost.excerpt,
      content: blogPost.content,
      featuredImage: blogPost.featuredImage,
      seo: {
        metaTitle: blogPost.seo.metaTitle,
        metaDescription: blogPost.seo.metaDescription,
        keywords: blogPost.seo.keywords,
        schemaType: 'Article'
      },
      featured: blogPost.featured,
      status: 'published' as const
    }));
  } catch (error) {
    console.error('Error fetching featured blog posts:', error);
    return [];
  }
}

export async function getBlogStats(): Promise<BlogStats> {
  try {
    const services = await import('@/lib/firestore/newsletter-service');
    const statsService = new services.NewsletterStatsService();
    const stats = await statsService.getStats();

    return {
      totalPosts: stats.total_articles,
      totalAuthors: stats.total_authors,
      totalCategories: stats.total_categories,
      averageReadingTime: stats.average_reading_time,
      totalViews: 0, // Este dato no está disponible en NewsletterStats
      popularTags: stats.popular_tags
    };
  } catch (error) {
    console.error('Error fetching blog stats:', error);
    return {
      totalPosts: 0,
      totalAuthors: 0,
      totalCategories: 0,
      averageReadingTime: 0,
      totalViews: 0,
      popularTags: []
    };
  }
}

// Sample data para compatibilidad con imports existentes
export const sampleAuthors: Author[] = [
  {
    id: 'carlos-mendez',
    name: 'Carlos Méndez',
    role: 'Director de Proyectos',
    bio: 'Especialista en gestión de proyectos de infraestructura con más de 15 años de experiencia.',
    avatar: '/images/authors/carlos-mendez.jpg',
    linkedin: 'https://linkedin.com/in/carlos-mendez',
    email: 'carlos.mendez@metrica-dip.com'
  },
  {
    id: 'ana-rodriguez',
    name: 'Ana Rodríguez',
    role: 'Jefa de Ingeniería',
    bio: 'Ingeniera civil especializada en estructuras complejas y tecnología BIM.',
    avatar: '/images/authors/ana-rodriguez.jpg',
    linkedin: 'https://linkedin.com/in/ana-rodriguez',
    email: 'ana.rodriguez@metrica-dip.com'
  }
];

export const sampleBlogPosts: Omit<BlogPost, 'publishedAt'>[] = [
  {
    id: 'future-construction-tech-2024',
    title: 'El Futuro de la Tecnología en Construcción: Tendencias 2024',
    slug: 'futuro-tecnologia-construccion-2024',
    category: 'industria-tendencias',
    tags: ['BIM', 'IoT', 'Sostenibilidad', 'Automatización'],
    author: sampleAuthors[0],
    readingTime: 8,
    excerpt: 'Exploramos las tecnologías emergentes que están transformando la industria de la construcción en 2024.',
    content: 'La industria de la construcción está experimentando una revolución tecnológica...',
    featuredImage: '/images/blog/tech-construction-2024.jpg',
    seo: {
      metaTitle: 'Futuro de la Tecnología en Construcción 2024 | Métrica FM',
      metaDescription: 'Descubre las tendencias tecnológicas que están transformando la construcción en 2024.',
      keywords: ['tecnología construcción', 'BIM', 'IoT construcción', 'automatización'],
      schemaType: 'Article'
    },
    featured: true,
    status: 'published'
  },
  {
    id: 'sustainable-construction-practices',
    title: 'Prácticas de Construcción Sostenible: Guía Completa',
    slug: 'practicas-construccion-sostenible-guia',
    category: 'guias-tecnicas',
    tags: ['Sostenibilidad', 'LEED', 'Eficiencia Energética', 'Materiales Ecológicos'],
    author: sampleAuthors[1],
    readingTime: 12,
    excerpt: 'Una guía completa sobre cómo implementar prácticas sostenibles en proyectos de construcción.',
    content: 'La construcción sostenible no es solo una tendencia, es una necesidad...',
    featuredImage: '/images/blog/sustainable-construction.jpg',
    seo: {
      metaTitle: 'Construcción Sostenible: Guía Completa | Métrica FM',
      metaDescription: 'Aprende a implementar prácticas sostenibles en tus proyectos de construcción.',
      keywords: ['construcción sostenible', 'LEED', 'eficiencia energética', 'materiales ecológicos'],
      schemaType: 'TechArticle'
    },
    featured: false,
    status: 'published'
  }
];