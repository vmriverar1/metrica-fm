/**
 * Script para migrar home.json a Firestore (versión corregida)
 * Maneja campos especiales que pueden causar errores en Firestore
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

// Función para limpiar datos problemáticos para Firestore
function sanitizeForFirestore(obj) {
  if (obj === null || obj === undefined) {
    return null;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForFirestore(item));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    // Evitar campos que empiecen con punto o contengan caracteres especiales
    let sanitizedKey = key;
    if (key.includes('.') || key.includes('/') || key.includes('__')) {
      sanitizedKey = key.replace(/[./__]/g, '_');
    }

    sanitized[sanitizedKey] = sanitizeForFirestore(value);
  }

  return sanitized;
}

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

    // Limpiar datos para Firestore
    const sanitizedData = sanitizeForFirestore(homeData);

    // Añadir metadatos de migración
    const dataWithMetadata = {
      ...sanitizedData,
      migration_info: {
        migrated_at: new Date().toISOString(),
        source_file: 'public/json/pages/home.json',
        original_size: JSON.stringify(homeData).length
      }
    };

    console.log('🧹 Datos sanitizados para Firestore');

    // Crear referencia al documento 'home' en la colección 'pages'
    const homeDocRef = doc(db, 'pages', 'home');

    // Migrar con datos limpios
    await setDoc(homeDocRef, dataWithMetadata);

    console.log('✅ Migración completada exitosamente');
    console.log('📍 Ubicación en Firestore: pages/home');
    console.log('🔗 Documento ID: home');

    // Verificación de integridad
    console.log('\n🔍 Verificando integridad de datos:');
    console.log(`- ID: ${dataWithMetadata.id || 'NO ENCONTRADO'}`);
    console.log(`- Título: ${dataWithMetadata.page?.title || 'NO ENCONTRADO'}`);
    console.log(`- Secciones principales: ${Object.keys(dataWithMetadata).filter(key =>
      typeof dataWithMetadata[key] === 'object' && !Array.isArray(dataWithMetadata[key]) && key !== 'metadata' && key !== 'migration_info'
    ).length}`);
    console.log(`- Hero configurado: ${dataWithMetadata.hero?.title ? 'SÍ' : 'NO'}`);
    console.log(`- Estadísticas: ${dataWithMetadata.stats?.statistics?.length || 0} elementos`);
    console.log(`- Servicios: ${dataWithMetadata.services?.services_list?.length || 0} elementos`);
    console.log(`- Proyectos destacados: ${dataWithMetadata.portfolio?.featured_projects?.length || 0} elementos`);
    console.log(`- Pilares DIP: ${dataWithMetadata.pillars?.pillars?.length || 0} elementos`);
    console.log(`- Políticas: ${dataWithMetadata.policies?.policies?.length || 0} elementos`);
    console.log(`- Clientes: ${dataWithMetadata.clients?.logos?.length || 0} logos`);

    console.log('\n✅ Migración de home.json completada con sanitización');
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