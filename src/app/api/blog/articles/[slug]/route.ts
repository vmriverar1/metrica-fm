/**
 * API para obtener un artículo específico por slug (Pública)
 * GET /api/blog/articles/[slug] - Obtiene un artículo por slug con sus relaciones
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, where, limit, doc, getDoc } from 'firebase/firestore';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json({
        success: false,
        error: 'Slug is required',
        message: 'El slug del artículo es requerido'
      }, { status: 400 });
    }

    // Buscar artículo por slug usando Firestore client SDK (público)
    const articlesRef = collection(db, 'blog_articles');
    const articleQuery = query(articlesRef, where('slug', '==', slug), limit(1));
    const articleSnapshot = await getDocs(articleQuery);

    if (articleSnapshot.empty) {
      return NextResponse.json({
        success: false,
        error: 'Article not found',
        message: 'Artículo no encontrado'
      }, { status: 404 });
    }

    const articleDoc = articleSnapshot.docs[0];
    const articleData = {
      id: articleDoc.id,
      ...articleDoc.data()
    };

    // Obtener datos del autor
    let author = null;
    if (articleData.author_id) {
      try {
        const authorDoc = await getDoc(doc(db, 'blog_authors', articleData.author_id));
        if (authorDoc.exists()) {
          author = {
            id: authorDoc.id,
            ...authorDoc.data()
          };
        }
      } catch {
        // Non-critical: author enrichment failed
      }
    }

    // Obtener datos de la categoría
    let category = null;
    if (articleData.category_id) {
      try {
        const categoryDoc = await getDoc(doc(db, 'blog_categories', articleData.category_id));
        if (categoryDoc.exists()) {
          category = {
            id: categoryDoc.id,
            ...categoryDoc.data()
          };
        }
      } catch {
        // Non-critical: category enrichment failed
      }
    }

    const article = {
      ...articleData,
      author,
      category
    };

    return NextResponse.json({
      success: true,
      data: article,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0',
        system: 'blog',
        endpoint: 'article-by-slug',
        slug
      }
    });

  } catch (error) {
    console.error('BLOG ARTICLE BY SLUG API Error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}