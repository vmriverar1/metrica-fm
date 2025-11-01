/**
 * Utilidades para el blog que pueden ser usadas tanto en el servidor como en el cliente
 */

import { ArticuloConRelaciones } from '@/types/newsletter';
import { BlogPostCompatible } from '@/types/blog';

export function convertToCompatibleFormat(articulos: any[]): BlogPostCompatible[] {
  return articulos.map(articulo => {
    // Handle different data formats from API vs Firestore
    const isFirestoreFormat = articulo.published_date && typeof articulo.published_date.toDate === 'function';

    return {
      id: articulo.id,
      title: articulo.title,
      slug: articulo.slug,
      category: articulo.category?.slug || articulo.category_id || '',
      tags: articulo.tags || [],
      author: {
        id: articulo.author?.id || articulo.author_id || '',
        name: articulo.author?.name || '',
        role: articulo.author?.role || '',
        bio: articulo.author?.bio || '',
        avatar: articulo.author?.avatar || ''
      },
      publishedAt: isFirestoreFormat
        ? articulo.published_date.toDate()
        : new Date(articulo.published_date || Date.now()),
      readingTime: articulo.reading_time || 1,
      excerpt: articulo.excerpt || '',
      content: articulo.content || '',
      featuredImage: articulo.featured_image || '',
      seo: {
        metaTitle: articulo.seo?.meta_title || articulo.title,
        metaDescription: articulo.seo?.meta_description || articulo.excerpt || '',
        keywords: articulo.seo?.keywords || articulo.tags || []
      },
      featured: articulo.featured || false,
      hide_hero_text: articulo.hide_hero_text ?? false,
      status: articulo.status === 'published' ? 'published' : 'draft'
    };
  });
}

export function convertSingleToCompatibleFormat(articulo: any): BlogPostCompatible | null {
  if (!articulo) return null;
  return convertToCompatibleFormat([articulo])[0];
}