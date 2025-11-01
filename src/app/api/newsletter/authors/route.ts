/**
 * API para Autores del Newsletter/Blog
 * GET /api/newsletter/authors - Lista todos los autores
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateNewsletterAuthor } from '@/lib/migration/validation-rules';
import { getFirebaseAdmin, getFirebaseFallbackResponse } from '@/lib/firebase-admin-safe';

export async function GET(request: NextRequest) {
  // Get Firebase instances safely
  const { db } = await getFirebaseAdmin();

  // Si no hay credenciales válidas o db no está inicializado, devolver datos vacíos
  if (!db) {
    console.log('⚠️ Firebase credentials not available, returning empty authors data');
    return NextResponse.json(getFirebaseFallbackResponse('newsletter/authors'));
  }

  try {
    console.log(`[${new Date().toISOString()}] NEWSLETTER AUTHORS API: GET ${request.url} from ${request.ip || 'unknown'}`);

    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');
    const limit = searchParams.get('limit');

    // Consultar autores directamente desde Firestore
    let query = db.collection('blog_authors');

    // Aplicar filtros
    if (featured === 'true') {
      query = query.where('featured', '==', true);
    }

    const snapshot = await query.get();
    let authors = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Aplicar límite si se especifica
    if (limit) {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        authors = authors.slice(0, limitNum);
      }
    }

    console.log(`👥 Newsletter authors found: ${authors.length}`);

    return NextResponse.json({
      success: true,
      data: authors,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0',
        system: 'newsletter',
        endpoint: 'authors',
        total: authors.length,
        filters: {
          featured: featured === 'true',
          limit: limit ? parseInt(limit) : null
        }
      }
    });

  } catch (error) {
    console.error('NEWSLETTER AUTHORS API Error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Si no hay credenciales válidas o db no está inicializado, devolver error 501
  if (!hasValidCredentials || !db) {
    console.log('⚠️ Firebase credentials not available for author creation');
    return NextResponse.json({
      success: false,
      error: 'Firebase credentials not configured for this environment',
      message: 'Author creation requires valid Firebase Admin credentials'
    }, { status: 501 });
  }

  try {
    console.log(`[${new Date().toISOString()}] NEWSLETTER AUTHORS API: POST ${request.url} from ${request.ip || 'unknown'}`);

    const body = await request.json();

    // Validar datos
    const validation = validateNewsletterAuthor(body);
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: validation.errors.join(', '),
        message: 'Datos de autor inválidos'
      }, { status: 400 });
    }

    // Crear autor directamente con Firestore
    const now = new Date();
    const authorData = {
      ...body,
      created_at: now,
      updated_at: now
    };

    const authorRef = await db.collection('blog_authors').add(authorData);
    const newAuthor = {
      id: authorRef.id,
      ...authorData
    };

    console.log(`✅ Newsletter author created: ${authorRef.id}`);

    return NextResponse.json({
      success: true,
      data: newAuthor,
      message: 'Autor creado exitosamente'
    }, { status: 201 });

  } catch (error) {
    console.error('NEWSLETTER AUTHORS API Error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}