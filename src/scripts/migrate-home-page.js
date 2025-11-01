/**
 * Script para migrar home.json a Firestore
 * Crea la colección 'pages' con documento 'home' tal cual está
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
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

async function migrateHomePage() {
  try {
    console.log('🚀 Iniciando migración de home.json a Firestore...');

    // Leer el archivo home.json
    const homeJsonPath = path.join(process.cwd(), 'public/json/pages/home.json');
    const homeJsonContent = fs.readFileSync(homeJsonPath, 'utf8');
    const homeData = JSON.parse(homeJsonContent);

    console.log('📄 Archivo home.json leído correctamente');
    console.log(`📊 Tamaño del contenido: ${JSON.stringify(homeData).length} caracteres`);

    // Crear referencia al documento 'home' en la colección 'pages'
    const homeDocRef = doc(db, 'pages', 'home');

    // Migrar exactamente como está
    await setDoc(homeDocRef, homeData);

    console.log('✅ Migración completada exitosamente');
    console.log('📍 Ubicación en Firestore: pages/home');
    console.log('🔗 Documento ID: home');

    // Verificación de integridad
    console.log('\n🔍 Verificando integridad de datos:');
    console.log(`- ID: ${homeData.id || 'NO ENCONTRADO'}`);
    console.log(`- Título: ${homeData.page?.title || 'NO ENCONTRADO'}`);
    console.log(`- Secciones principales: ${Object.keys(homeData).filter(key =>
      typeof homeData[key] === 'object' && !Array.isArray(homeData[key]) && key !== 'metadata'
    ).length}`);
    console.log(`- Hero configurado: ${homeData.hero?.title ? 'SÍ' : 'NO'}`);
    console.log(`- Estadísticas: ${homeData.stats?.statistics?.length || 0} elementos`);
    console.log(`- Servicios: ${homeData.services?.services_list?.length || 0} elementos`);
    console.log(`- Proyectos destacados: ${homeData.portfolio?.featured_projects?.length || 0} elementos`);
    console.log(`- Pilares DIP: ${homeData.pillars?.pillars?.length || 0} elementos`);
    console.log(`- Políticas: ${homeData.policies?.policies?.length || 0} elementos`);
    console.log(`- Clientes: ${homeData.clients?.logos?.length || 0} logos`);

    console.log('\n✅ Migración de home.json completada sin cambios');
    return true;

  } catch (error) {
    console.error('❌ Error en la migración:', error);
    throw error;
  }
}

// Ejecutar migración
migrateHomePage()
  .then(() => {
    console.log('\n🎉 ¡Migración finalizada exitosamente!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error fatal en migración:', error);
    process.exit(1);
  });