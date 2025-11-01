/**
 * API para Autores del Blog (Pública)
 * GET /api/blog/authors - Lista todos los autores disponibles
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    console.log(`[${new Date().toISOString()}] BLOG AUTHORS API: GET ${request.url} from ${request.ip || 'unknown'}`);

    // Obtener autores usando Firestore client SDK (público)
    const authorsRef = collection(db, 'blog_authors');
    const authorsQuery = query(authorsRef, orderBy('name'));
    const snapshot = await getDocs(authorsQuery);

    const authors = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`👥 Blog authors found: ${authors.length}`);

    return NextResponse.json({
      success: true,
      data: authors,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0',
        system: 'blog',
        endpoint: 'authors',
        total: authors.length
      }
    });

  } catch (error) {
    console.error('BLOG AUTHORS API Error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}