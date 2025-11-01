import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Inicializar Firebase Admin
async function initializeFirebaseAdmin() {
  try {
    if (getApps().length === 0) {
      const serviceAccountPath = join(process.cwd(), 'credencials', 'service-account.json');
      const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

      initializeApp({
        credential: cert(serviceAccount),
        databaseURL: `https://metrica-dip-default-rtdb.firebaseio.com/`
      });
    }

    return getFirestore();
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    throw error;
  }
}

export async function POST() {
  try {
    const db = await initializeFirebaseAdmin();

    // Crear categorías básicas
    const categories = [
      {
        name: 'Construcción Sostenible',
        slug: 'construccion-sostenible',
        description: 'Artículos sobre construcción ecológica y sostenible',
        articles_count: 1,
        featured: true,
        order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Gestión de Proyectos',
        slug: 'gestion-proyectos',
        description: 'Tips y estrategias para la gestión efectiva de proyectos',
        articles_count: 1,
        featured: true,
        order: 2,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    console.log('Creating blog categories...');
    for (const [index, category] of categories.entries()) {
      await db.collection('blog_categories').doc(`category-${index + 1}`).set(category);
    }

    // Crear autores básicos
    const authors = [
      {
        name: 'Carlos Mendoza',
        role: 'Director General',
        bio: 'Arquitecto con 10+ años de experiencia en dirección de proyectos',
        email: 'carlos.mendoza@metrica-dip.com',
        avatar: '/img/authors/carlos-mendoza.jpg',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    console.log('Creating blog authors...');
    for (const [index, author] of authors.entries()) {
      await db.collection('blog_authors').doc(`author-${index + 1}`).set(author);
    }

    // Crear artículos básicos
    const articles = [
      {
        title: 'Tendencias en Construcción Sostenible 2024',
        slug: 'construccion-sostenible-2024',
        category_id: 'category-1',
        author: {
          name: 'Carlos Mendoza',
          email: 'carlos.mendoza@metrica-dip.com',
          avatar: '/img/authors/carlos-mendoza.jpg'
        },
        content: {
          excerpt: 'Descubre las principales tendencias en construcción sostenible para este año.',
          body: 'La construcción sostenible ha evolucionado significativamente en los últimos años...',
          reading_time: 5
        },
        featured_image: '/img/blog/construccion-sostenible.jpg',
        status: 'published',
        published: true,
        featured: true,
        tags: ['sostenibilidad', 'construcción', 'tendencias'],
        views: 150,
        likes: 12,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'BIM en la Gestión de Proyectos de Construcción',
        slug: 'gestion-proyectos-bim',
        category_id: 'category-2',
        author: {
          name: 'Carlos Mendoza',
          email: 'carlos.mendoza@metrica-dip.com',
          avatar: '/img/authors/carlos-mendoza.jpg'
        },
        content: {
          excerpt: 'Cómo BIM revoluciona la gestión de proyectos de construcción.',
          body: 'Building Information Modeling (BIM) representa una revolución en la industria...',
          reading_time: 7
        },
        featured_image: '/img/blog/bim-gestion.jpg',
        status: 'published',
        published: true,
        featured: false,
        tags: ['BIM', 'gestión', 'proyectos'],
        views: 89,
        likes: 8,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    console.log('Creating blog articles...');
    for (const [index, article] of articles.entries()) {
      await db.collection('blog_articles').doc(`article-${index + 1}`).set(article);
    }

    return NextResponse.json({
      success: true,
      message: 'Blog sample data created successfully',
      data: {
        categories_created: categories.length,
        authors_created: authors.length,
        articles_created: articles.length
      }
    });

  } catch (error) {
    console.error('Error creating blog sample data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create blog sample data',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}