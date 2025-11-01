/**
 * Script temporal para crear datos mínimos de blog en Firestore
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createSampleData() {
  try {
    console.log('🔥 Creating sample blog data...');

    // Crear categorías
    const categories = [
      {
        id: 'construccion-sostenible',
        name: 'Construcción Sostenible',
        slug: 'construccion-sostenible',
        description: 'Artículos sobre construcción ecológica y sostenible',
        articles_count: 2,
        featured: true,
        order: 1
      },
      {
        id: 'gestion-proyectos',
        name: 'Gestión de Proyectos',
        slug: 'gestion-proyectos',
        description: 'Tips y estrategias para la gestión efectiva de proyectos',
        articles_count: 1,
        featured: true,
        order: 2
      }
    ];

    for (const category of categories) {
      await setDoc(doc(db, 'blog_categories', category.id), category);
      console.log(`✅ Created category: ${category.name}`);
    }

    // Crear autores
    const authors = [
      {
        id: 'carlos-mendoza',
        name: 'Carlos Mendoza',
        role: 'Director General',
        bio: 'Arquitecto con 10+ años de experiencia en dirección de proyectos',
        email: 'carlos.mendoza@metrica-dip.com',
        avatar: '/img/authors/carlos-mendoza.jpg'
      }
    ];

    for (const author of authors) {
      await setDoc(doc(db, 'blog_authors', author.id), author);
      console.log(`✅ Created author: ${author.name}`);
    }

    // Crear artículos
    const articles = [
      {
        id: 'construccion-sostenible-2024',
        title: 'Tendencias en Construcción Sostenible 2024',
        slug: 'construccion-sostenible-2024',
        category_id: 'construccion-sostenible',
        author: {
          name: 'Carlos Mendoza',
          email: 'carlos.mendoza@metrica-dip.com',
          avatar: '/img/authors/carlos-mendoza.jpg'
        },
        content: {
          excerpt: 'Descubre las principales tendencias en construcción sostenible para este año.',
          body: 'La construcción sostenible ha evolucionado significativamente...',
          reading_time: 5
        },
        metadata: {
          seo_title: 'Construcción Sostenible 2024 | Métrica FM',
          seo_description: 'Tendencias y innovaciones en construcción sostenible',
          keywords: ['construcción', 'sostenible', '2024', 'tendencias']
        },
        featured_image: '/img/blog/construccion-sostenible.jpg',
        status: 'published',
        published: true,
        featured: true,
        tags: ['sostenibilidad', 'construcción', 'tendencias'],
        views: 150,
        likes: 12,
        published_at: new Date('2024-01-15'),
        created_at: new Date('2024-01-10'),
        updated_at: new Date('2024-01-15')
      },
      {
        id: 'gestion-proyectos-bim',
        title: 'BIM en la Gestión de Proyectos de Construcción',
        slug: 'gestion-proyectos-bim',
        category_id: 'gestion-proyectos',
        author: {
          name: 'Carlos Mendoza',
          email: 'carlos.mendoza@metrica-dip.com',
          avatar: '/img/authors/carlos-mendoza.jpg'
        },
        content: {
          excerpt: 'Cómo BIM revoluciona la gestión de proyectos de construcción.',
          body: 'Building Information Modeling (BIM) representa una revolución...',
          reading_time: 7
        },
        metadata: {
          seo_title: 'BIM Gestión Proyectos | Métrica FM',
          seo_description: 'Building Information Modeling en proyectos de construcción',
          keywords: ['BIM', 'gestión', 'proyectos', 'construcción']
        },
        featured_image: '/img/blog/bim-gestion.jpg',
        status: 'published',
        published: true,
        featured: false,
        tags: ['BIM', 'gestión', 'proyectos'],
        views: 89,
        likes: 8,
        published_at: new Date('2024-02-01'),
        created_at: new Date('2024-01-25'),
        updated_at: new Date('2024-02-01')
      }
    ];

    for (const article of articles) {
      await setDoc(doc(db, 'blog_articles', article.id), article);
      console.log(`✅ Created article: ${article.title}`);
    }

    console.log('🎉 Sample blog data created successfully!');
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  }
}

createSampleData();