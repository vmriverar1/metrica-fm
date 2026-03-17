/**
 * API para Artículos del Blog con Relaciones (Pública)
 * GET /api/blog/articles-with-relations - Lista artículos con datos de autor y categoría
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parámetros de filtrado
    const categoryId = searchParams.get('category_id');
    const authorId = searchParams.get('author_id');
    const featured = searchParams.get('featured');
    const status = searchParams.get('status') || 'published';
    const limit = searchParams.get('limit');

    // Construir filtros
    const filters: any = { status };

    if (categoryId && categoryId !== 'all') {
      filters.category_id = categoryId;
    }

    if (authorId && authorId !== 'all') {
      filters.author_id = authorId;
    }

    if (featured === 'true') {
      filters.featured = true;
    } else if (featured === 'false') {
      filters.featured = false;
    }

    if (limit) {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        filters.limit = Math.min(limitNum, 50); // Max 50 articles
      }
    }

    // Obtener artículos usando Firestore client SDK (público)
    // Simplificado temporalmente para evitar problemas de índices
    let articlesQuery = collection(db, 'blog_articles');
    let queryConstraints = [];

    // Solo aplicar filtro de status si no es 'published' (el valor por defecto)
    // Esto evita la necesidad de un índice compuesto mientras se crean
    if (status && status !== 'published') {
      queryConstraints.push(where('status', '==', status));
    }

    // Aplicar otros filtros individualmente
    if (categoryId && categoryId !== 'all') {
      queryConstraints.push(where('category_id', '==', categoryId));
    } else if (authorId && authorId !== 'all') {
      queryConstraints.push(where('author_id', '==', authorId));
    } else if (featured === 'true') {
      queryConstraints.push(where('featured', '==', true));
    } else if (featured === 'false') {
      queryConstraints.push(where('featured', '==', false));
    }

    // Si no hay filtros específicos, obtener todos los documentos
    const articlesFirestoreQuery = queryConstraints.length > 0
      ? query(articlesQuery, ...queryConstraints)
      : articlesQuery;

    const articlesSnapshot = await getDocs(articlesFirestoreQuery);

    let articles = articlesSnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

    // Filtrar por status manualmente si es 'published'
    if (status === 'published') {
      articles = articles.filter((article: any) => article.status === 'published');
    }

    // Ordenar por fecha manualmente (más nuevo primero)
    // Usar updated_at si existe, sino created_at, sino published_at
    articles.sort((a: any, b: any) => {
      // Función helper para extraer fecha de un timestamp de Firestore
      const extractDate = (timestamp: any): Date => {
        if (!timestamp) return new Date(0);

        if (typeof timestamp.toDate === 'function') {
          // Es un Timestamp de Firestore
          return timestamp.toDate();
        } else if (timestamp.seconds) {
          // Es un objeto con seconds (Firestore timestamp serializado)
          return new Date(timestamp.seconds * 1000);
        } else if (typeof timestamp === 'string') {
          // Es una cadena de fecha
          return new Date(timestamp);
        } else {
          return new Date(timestamp);
        }
      };

      // Obtener la fecha más relevante para cada artículo
      // Prioridad: updated_at > created_at > published_at
      const getRelevantDate = (article: any): Date => {
        if (article.updated_at !== undefined && article.updated_at !== null) {
          return extractDate(article.updated_at);
        }
        if (article.created_at !== undefined && article.created_at !== null) {
          return extractDate(article.created_at);
        }
        if (article.published_at !== undefined && article.published_at !== null) {
          return extractDate(article.published_at);
        }
        return new Date(0); // Fecha muy antigua para artículos sin fecha
      };

      const dateA = getRelevantDate(a);
      const dateB = getRelevantDate(b);

      // Ordenar descendente (más nuevo primero)
      return dateB.getTime() - dateA.getTime();
    });

    // Aplicar límite si existe
    if (filters.limit) {
      articles = articles.slice(0, filters.limit);
    }

    // Obtener IDs únicos de autores y categorías
    const authorIds = [...new Set(articles.map((a: any) => a.author_id).filter(Boolean))];
    const categoryIds = [...new Set(articles.map((a: any) => a.category_id).filter(Boolean))];

    // Obtener datos de autores en batch
    const authorsMap = new Map();
    if (authorIds.length > 0) {
      for (const id of authorIds) {
        try {
          const authorDoc = await getDoc(doc(db, 'blog_authors', id));
          if (authorDoc.exists()) {
            authorsMap.set(id, {
              id: authorDoc.id,
              ...authorDoc.data()
            });
          }
        } catch {
          // Non-critical: author lookup failed
        }
      }
    }

    // Obtener datos de categorías en batch
    const categoriesMap = new Map();
    if (categoryIds.length > 0) {
      for (const id of categoryIds) {
        try {
          const categoryDoc = await getDoc(doc(db, 'blog_categories', id));
          if (categoryDoc.exists()) {
            categoriesMap.set(id, {
              id: categoryDoc.id,
              ...categoryDoc.data()
            });
          }
        } catch {
          // Non-critical: category lookup failed
        }
      }
    }

    // Combinar artículos con sus datos relacionados
    const articlesWithRelations = articles.map((article: any) => ({
      ...article,
      author: authorsMap.get(article.author_id) || null,
      category: categoriesMap.get(article.category_id) || null
    }));

    return NextResponse.json({
      success: true,
      data: articlesWithRelations,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0',
        system: 'blog',
        endpoint: 'articles-with-relations',
        total: articlesWithRelations.length,
        filters
      }
    });

  } catch (error) {
    console.error('BLOG RELATIONS API Error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}