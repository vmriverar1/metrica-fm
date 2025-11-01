#!/usr/bin/env tsx

/**
 * Migración de Autores del Blog a Firestore
 * Extrae autores únicos de los artículos existentes y los migra a la colección blog_authors
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
// Variables de entorno cargadas automáticamente por Node.js

// Tipos de autor
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

// Inicializar Firebase Admin
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

const app = initializeApp({
  credential: cert(serviceAccount as any)
});

const db = getFirestore(app);

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
    bio: 'Equipo multidisciplinario de expertos en construcción, infraestructura y gestión de proyectos de Métrica DIP.',
    avatar: '/images/team/admin.jpg',
    linkedin: 'https://linkedin.com/company/metrica-dip',
    featured: true
  }
];

async function migrateAuthors() {
  console.log('🚀 Iniciando migración de autores del blog...');

  try {
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
    console.log('✅ Migración de autores completada exitosamente');

    // Verificar la migración
    console.log('\n📋 Verificando autores migrados:');
    const authorsSnapshot = await db.collection('blog_authors').get();
    authorsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`  - ${data.name} (${doc.id}): ${data.email}`);
    });

  } catch (error) {
    console.error('❌ Error en la migración:', error);
    process.exit(1);
  }
}

async function updateArticlesWithAuthorIds() {
  console.log('\n🔄 Actualizando artículos con IDs de autores...');

  try {
    const articlesSnapshot = await db.collection('blog_articles').get();
    const batch = db.batch();

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
        batch.update(doc.ref, {
          author_id: authorId,
          updated_at: new Date()
        });
        console.log(`✅ Actualizando artículo ${doc.id} -> autor: ${authorId}`);
      }
    }

    await batch.commit();
    console.log('✅ Artículos actualizados con IDs de autores');

  } catch (error) {
    console.error('❌ Error actualizando artículos:', error);
    process.exit(1);
  }
}

async function main() {
  try {
    await migrateAuthors();
    await updateArticlesWithAuthorIds();
    console.log('\n🎉 Migración completa de autores del blog!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en el proceso de migración:', error);
    process.exit(1);
  }
}

// Ejecutar migración
main();