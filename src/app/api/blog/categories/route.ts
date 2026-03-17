/**
 * API para Categorías del Blog (Pública)
 * GET /api/blog/categories - Lista todas las categorías disponibles
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    // Obtener categorías usando Firestore client SDK (público)
    const categoriesRef = collection(db, 'blog_categories');
    const categoriesQuery = query(categoriesRef, orderBy('name'));
    const snapshot = await getDocs(categoriesQuery);

    const categories = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      data: categories,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0',
        system: 'blog',
        endpoint: 'categories',
        total: categories.length
      }
    });

  } catch (error) {
    console.error('BLOG CATEGORIES API Error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}