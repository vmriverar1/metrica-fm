/**
 * Script para migrar home.json a Firestore por secciones
 * Para evitar el error de tamaño de documento
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateHomePageSimple() {
  try {
    console.log('🚀 Iniciando migración simplificada de home.json a Firestore...');

    // Leer el archivo home.json
    const homeJsonPath = path.join(process.cwd(), 'public/json/pages/home.json');
    const homeJsonContent = fs.readFileSync(homeJsonPath, 'utf8');
    const homeData = JSON.parse(homeJsonContent);

    console.log('📄 Archivo home.json leído correctamente');

    // Documento principal con metadatos básicos
    const mainDoc = {
      id: homeData.id,
      name: homeData.name,
      title: homeData.title,
      description: homeData.description,
      status: homeData.status,
      lastModified: homeData.lastModified,
      type: homeData.type,
      metadata: homeData.metadata,
      page: homeData.page,
      migration_info: {
        migrated_at: new Date().toISOString(),
        source_file: 'public/json/pages/home.json',
        sections: ['hero', 'stats', 'services', 'portfolio', 'pillars', 'policies', 'clients', 'newsletter']
      }
    };

    // Crear documento principal
    const homeDocRef = doc(db, 'pages', 'home');
    await setDoc(homeDocRef, mainDoc);
    console.log('✅ Documento principal creado');

    // Migrar cada sección como subdocumento
    const sections = [
      { name: 'hero', data: homeData.hero },
      { name: 'stats', data: homeData.stats },
      { name: 'services', data: homeData.services },
      { name: 'portfolio', data: homeData.portfolio },
      { name: 'pillars', data: homeData.pillars },
      { name: 'policies', data: homeData.policies },
      { name: 'clients', data: homeData.clients },
      { name: 'newsletter', data: homeData.newsletter }
    ];

    for (const section of sections) {
      const sectionDocRef = doc(collection(homeDocRef, 'sections'), section.name);
      await setDoc(sectionDocRef, section.data);
      console.log(`✅ Sección '${section.name}' migrada`);
    }

    console.log('\n🔍 Verificación de contenido migrado:');
    console.log(`- ID: ${mainDoc.id}`);
    console.log(`- Título: ${mainDoc.page?.title}`);
    console.log(`- Secciones migradas: ${sections.length}`);

    sections.forEach(section => {
      console.log(`  - ${section.name}: ${JSON.stringify(section.data).length} caracteres`);
    });

    console.log('\n✅ Migración de home.json completada exitosamente');
    console.log('📍 Estructura en Firestore:');
    console.log('  └── pages/home (documento principal)');
    console.log('      └── sections/ (subcolección)');
    sections.forEach(section => {
      console.log(`          ├── ${section.name}`);
    });

    return true;

  } catch (error) {
    console.error('❌ Error en la migración:', error);
    throw error;
  }
}

// Ejecutar migración
migrateHomePageSimple()
  .then(() => {
    console.log('\n🎉 ¡Migración finalizada exitosamente!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error fatal en migración:', error);
    process.exit(1);
  });