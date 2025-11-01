/**
 * Tipos TypeScript para el sistema Newsletter/Blog con Firestore
 * Compatible con la estructura JSON existente
 */

import { Timestamp } from 'firebase/firestore';

// ==========================================
// INTERFACES PRINCIPALES
// ==========================================

export interface Autor {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  email: string;
  linkedin?: string;
  specializations: string[];
  articles_count: number;
  featured: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Categoria {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon?: string;
  articles_count: number;
  featured: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface ArticuloSEO {
  meta_title: string;
  meta_description: string;
  keywords: string[];
  og_title: string;
  og_description: string;
  og_image: string;
}

export interface GalleryItem {
  url: string;
  caption: string;
}

export interface Articulo {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // Markdown
  featured_image: string;
  featured_image_alt: string;
  author_id: string; // Referencia a colección autores
  category_id: string; // Referencia a colección categorias  
  tags: string[];
  featured: boolean;
  reading_time: number;
  published_date: Timestamp;
  seo: ArticuloSEO;
  url: string;
  related_articles: string[];
  gallery?: GalleryItem[];
  created_at: Timestamp;
  updated_at: Timestamp;
}

// ==========================================
// DATA TRANSFER OBJECTS (DTOs)
// ==========================================

export interface AutorData {
  name: string;
  role: string;
  bio: string;
  avatar: string;
  email: string;
  linkedin?: string;
  specializations: string[];
  featured: boolean;
}

export interface CategoriaData {
  name: string;
  slug: string;
  description: string;
  color: string;
  icon?: string;
  featured: boolean;
}

export interface ArticuloData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  featured_image_alt: string;
  author_id: string;
  category_id: string;
  tags: string[];
  featured: boolean;
  reading_time: number;
  published_date: Date | string;
  seo: ArticuloSEO;
  url: string;
  related_articles: string[];
  gallery?: GalleryItem[];
}

// ==========================================
// INTERFACES EXTENDIDAS CON RELACIONES
// ==========================================

export interface ArticuloConRelaciones extends Articulo {
  author?: Autor;
  category?: Categoria;
  related?: Articulo[];
}

// ==========================================
// FILTROS Y BÚSQUEDA
// ==========================================

export interface NewsletterFilters {
  category?: string;
  author_id?: string;
  featured?: boolean;
  tags?: string[];
  searchQuery?: string;
  limit?: number;
  offset?: number;
}

// ==========================================
// ESTADÍSTICAS
// ==========================================

export interface NewsletterStats {
  total_articles: number;
  total_authors: number;
  total_categories: number;
  total_featured_articles: number;
  total_featured_authors: number;
  average_reading_time: number;
  last_updated: Date;
  popular_tags: { tag: string; count: number }[];
  articles_by_category: { category: string; count: number }[];
  articles_by_author: { author: string; count: number }[];
}

// ==========================================
// RESPUESTAS DE CRUD
// ==========================================

export interface CRUDResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// ==========================================
// COMPATIBILIDAD CON BLOG TYPES EXISTENTES
// ==========================================

// Para mantener compatibilidad con el sistema existente
export interface BlogPostCompatible {
  id: string;
  title: string;
  slug: string;
  category: string;
  tags: string[];
  author: {
    id: string;
    name: string;
    role: string;
    bio: string;
    avatar: string;
  };
  publishedAt: Date;
  readingTime: number;
  excerpt: string;
  content: string;
  featuredImage: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  featured: boolean;
  hide_hero_text?: boolean;
  status: 'published' | 'draft';
}

// ==========================================
// UTILITIES Y HELPERS
// ==========================================

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

export function generateExcerpt(htmlContent: string, maxLength: number = 150): string {
  if (!htmlContent || htmlContent.trim() === '') {
    return '';
  }

  // Remover tags HTML y extraer solo texto
  let textContent = htmlContent
    // Primero remover completamente los headers H1, H2, H3 (incluyendo su contenido)
    .replace(/<h[1-3][^>]*>.*?<\/h[1-3]>/gi, '')
    // Remover otros tags HTML pero mantener el contenido
    .replace(/<[^>]*>/g, ' ')
    // Decodificar entidades HTML básicas
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    // Limpiar espacios múltiples y saltos de línea
    .replace(/\s+/g, ' ')
    .trim();

  // Si no hay contenido después de limpiar
  if (!textContent) {
    return '';
  }

  // Truncar a la longitud especificada
  if (textContent.length <= maxLength) {
    return textContent;
  }

  // Cortar en la palabra más cercana al límite
  let truncated = textContent.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');

  if (lastSpaceIndex > maxLength * 0.7) {
    // Si hay un espacio cerca del final, cortar ahí
    truncated = truncated.substring(0, lastSpaceIndex);
  }

  return truncated + '...';
}

export function generateURL(categorySlug: string, articleSlug: string): string {
  return `/blog/${categorySlug}/${articleSlug}`;
}

// ==========================================
// VALIDACIONES
// ==========================================

export function validateAutorData(data: AutorData): string[] {
  const errors: string[] = [];
  
  if (!data.name?.trim()) errors.push('Nombre es requerido');
  if (!data.role?.trim()) errors.push('Cargo es requerido');
  if (!data.bio?.trim()) errors.push('Biografía es requerida');
  if (!data.avatar?.trim()) errors.push('Avatar es requerido');
  if (!data.email?.trim()) errors.push('Email es requerido');
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Email inválido');
  }
  
  return errors;
}

export function validateCategoriaData(data: CategoriaData): string[] {
  const errors: string[] = [];
  
  if (!data.name?.trim()) errors.push('Nombre es requerido');
  if (!data.slug?.trim()) errors.push('Slug es requerido');
  if (!data.description?.trim()) errors.push('Descripción es requerida');
  if (!data.color?.trim()) errors.push('Color es requerido');
  if (data.slug && !/^[a-z0-9-]+$/.test(data.slug)) {
    errors.push('Slug debe contener solo letras minúsculas, números y guiones');
  }
  
  return errors;
}

export function validateArticuloData(data: ArticuloData): string[] {
  const errors: string[] = [];

  if (!data.title?.trim()) errors.push('Título es requerido');
  if (!data.slug?.trim()) errors.push('Slug es requerido');
  if (!data.content?.trim()) errors.push('Contenido es requerido');
  if (!data.featured_image?.trim()) errors.push('Imagen destacada es requerida');
  if (!data.author_id?.trim()) errors.push('Autor es requerido');
  if (!data.category_id?.trim()) errors.push('Categoría es requerida');

  if (data.slug && !/^[a-z0-9-]+$/.test(data.slug)) {
    errors.push('Slug debe contener solo letras minúsculas, números y guiones');
  }

  if (data.excerpt && data.excerpt.length > 300) {
    errors.push('Resumen no puede exceder 300 caracteres');
  }

  return errors;
}

// ==========================================
// CONVERSORES PARA COMPATIBILIDAD
// ==========================================

export function articuloToBlogPost(articulo: ArticuloConRelaciones): BlogPostCompatible {
  return {
    id: articulo.id,
    title: articulo.title,
    slug: articulo.slug,
    category: articulo.category?.slug || '',
    tags: articulo.tags,
    author: {
      id: articulo.author?.id || '',
      name: articulo.author?.name || '',
      role: articulo.author?.role || '',
      bio: articulo.author?.bio || '',
      avatar: articulo.author?.avatar || ''
    },
    publishedAt: articulo.published_date.toDate(),
    readingTime: articulo.reading_time,
    excerpt: articulo.excerpt,
    content: articulo.content,
    featuredImage: articulo.featured_image,
    seo: {
      metaTitle: articulo.seo.meta_title,
      metaDescription: articulo.seo.meta_description,
      keywords: articulo.seo.keywords
    },
    featured: articulo.featured,
    status: 'published'
  };
}