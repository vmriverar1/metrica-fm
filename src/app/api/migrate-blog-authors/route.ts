import { NextResponse } from 'next/server';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Tipo de autor
interface BlogAuthor {
  id: string;
  name: string;
  email: string;
  role: string;
  bio: string;
  avatar: string;
  linkedin?: string;
  featured: boolean;
  created_at: Date;
  updated_at: Date;
}

// Datos de autores a migrar
const authorsData: Omit<BlogAuthor, 'created_at' | 'updated_at'>[] = [
  {
    id: 'carlos-mendoza',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@metrica-dip.com',
    role: 'Ingeniero Senior de Proyectos',
    bio: 'Especialista en gestión de proyectos de construcción e infraestructura con más de 10 años de experiencia en el sector.',
    avatar: '/img/authors/carlos-mendoza.jpg',
    linkedin: 'https://linkedin.com/in/carlos-mendoza-metrica',
    featured: true
  },
  {
    id: 'equipo-metrica',
    name: 'Equipo Métrica',
    email: 'info@metrica.com',
    role: 'Equipo Editorial',
    bio: 'Equipo multidisciplinario de expertos en construcción, infraestructura y gestión de proyectos de Métrica FM.',
    avatar: '/images/team/admin.jpg',
    linkedin: 'https://linkedin.com/company/metrica-dip',
    featured: true
  }
];

// Función para verificar si tenemos credenciales válidas
const hasValidCredentials = () => {
  // Durante build time, no intentar conectar a Firebase
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
    return false;
  }

  return (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_PRIVATE_KEY &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    !process.env.FIREBASE_PROJECT_ID.includes('demo-project') &&
    typeof process.env.FIREBASE_PRIVATE_KEY === 'string' &&
    process.env.FIREBASE_PRIVATE_KEY.includes('BEGIN PRIVATE KEY')
  );
};

// Función para inicializar Firebase de forma segura
const getFirebaseInstances = async () => {
  if (!hasValidCredentials()) {
    return { firebaseApp: null, db: null };
  }

  let firebaseApp: any = null;
  let db: any = null;

  try {
    firebaseApp = require('firebase-admin').app();
  } catch (error) {
    try {
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
      };

      firebaseApp = initializeApp({
        credential: cert(serviceAccount as any)
      });
    } catch (initError) {
      console.error('Error initializing Firebase:', initError);
      return { firebaseApp: null, db: null };
    }
  }

  if (firebaseApp) {
    db = getFirestore(firebaseApp);
  }

  return { firebaseApp, db };
};

export async function POST() {
  // Inicializar Firebase de forma segura
  const { firebaseApp, db } = await getFirebaseInstances();

  // Si no hay credenciales válidas o db no está inicializado, devolver error 501
  if (!hasValidCredentials() || !db) {
    console.log('⚠️ Firebase credentials not available for migration');
    return NextResponse.json({
      success: false,
      error: 'Firebase credentials not configured for this environment',
      message: 'Migration requires valid Firebase Admin credentials'
    }, { status: 501 });
  }

  try {
    console.log('🚀 Iniciando migración de autores del blog...');
    const results = {
      authorsCreated: 0,
      articlesUpdated: 0,
      errors: [] as string[]
    };

    // Migrar autores
    const batch = db.batch();
    const now = new Date();

    for (const authorData of authorsData) {
      const authorRef = db.collection('blog_authors').doc(authorData.id);

      const author: BlogAuthor = {
        ...authorData,
        created_at: now,
        updated_at: now
      };

      batch.set(authorRef, author);
      console.log(`✅ Preparando autor: ${author.name} (${author.id})`);
    }

    await batch.commit();
    results.authorsCreated = authorsData.length;
    console.log('✅ Migración de autores completada');

    // Actualizar artículos con author_id
    console.log('🔄 Actualizando artículos con IDs de autores...');

    const articlesSnapshot = await db.collection('blog_articles').get();
    const updateBatch = db.batch();

    for (const doc of articlesSnapshot.docs) {
      const data = doc.data();

      // Mapear email del autor a ID
      let authorId = '';
      if (data.author?.email === 'carlos.mendoza@metrica-dip.com') {
        authorId = 'carlos-mendoza';
      } else if (data.author?.email === 'info@metrica.com') {
        authorId = 'equipo-metrica';
      }

      if (authorId) {
        updateBatch.update(doc.ref, {
          author_id: authorId,
          updated_at: new Date()
        });
        results.articlesUpdated++;
        console.log(`✅ Actualizando artículo ${doc.id} -> autor: ${authorId}`);
      }
    }

    await updateBatch.commit();
    console.log('✅ Artículos actualizados con IDs de autores');

    // Verificar la migración
    const authorsSnapshot = await db.collection('blog_authors').get();
    const verifiedAuthors = authorsSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      email: doc.data().email
    }));

    return NextResponse.json({
      success: true,
      message: 'Migración de autores del blog completada exitosamente',
      results: {
        ...results,
        verifiedAuthors
      }
    });

  } catch (error) {
    console.error('❌ Error en la migración:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      message: 'Error en la migración de autores del blog'
    }, { status: 500 });
  }
}