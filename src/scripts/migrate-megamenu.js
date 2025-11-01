/**
 * Script para migrar megamenu.json a Firestore
 * Crea la colección 'megamenu' con documento 'main'
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function migrateMegaMenu() {
  try {
    console.log('🚀 Iniciando migración de megamenu.json a Firestore...');

    // Leer el archivo megamenu.json
    const megamenuJsonPath = path.join(process.cwd(), 'public/json/admin/megamenu.json');
    const megamenuJsonContent = fs.readFileSync(megamenuJsonPath, 'utf8');
    const megamenuData = JSON.parse(megamenuJsonContent);

    console.log('📄 Archivo megamenu.json leído correctamente');

    // Extraer solo el contenido de megamenu (sin el wrapper)
    const megamenuContent = megamenuData.megamenu;

    if (!megamenuContent) {
      throw new Error('No se encontró la clave "megamenu" en el JSON');
    }

    console.log(`📊 Items encontrados: ${megamenuContent.items?.length || 0}`);

    // Crear documento 'main' en la colección 'megamenu'
    const megamenuDocRef = doc(db, 'megamenu', 'main');

    // Agregar metadata de exportación
    const dataToSave = {
      ...megamenuContent,
      export_metadata: {
        source: 'json_file',
        exported_at: new Date().toISOString(),
        source_path: '/public/json/admin/megamenu.json',
        exported_by: 'migration_script',
        version: '1.0.0'
      }
    };

    // Guardar en Firestore
    await setDoc(megamenuDocRef, dataToSave);

    console.log('✅ Migración completada exitosamente');
    console.log('📍 Ubicación en Firestore: megamenu/main');
    console.log('🔗 Documento ID: main');

    // Verificación de integridad
    console.log('\n🔍 Verificando integridad de datos:');
    console.log(`- Mega Menú habilitado: ${megamenuContent.settings?.enabled ? 'SÍ' : 'NO'}`);
    console.log(`- Versión: ${megamenuContent.settings?.version || 'N/A'}`);
    console.log(`- Items de menú: ${megamenuContent.items?.length || 0}`);
    console.log(`- Page mappings: ${megamenuContent.page_mappings ? Object.keys(megamenuContent.page_mappings).length : 0}`);
    console.log(`- Total clicks registrados: ${megamenuContent.analytics?.total_clicks || 0}`);

    console.log('\n📋 Items del menú:');
    megamenuContent.items?.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.label} (${item.type}) - ${item.enabled ? 'Habilitado' : 'Deshabilitado'}`);
      if (item.type === 'megamenu' && item.submenu?.links) {
        console.log(`     └─ ${item.submenu.links.length} subenlaces`);
      }
    });

    console.log('\n✅ Migración de megamenu.json completada exitosamente');
    return true;

  } catch (error) {
    console.error('❌ Error en la migración:', error);
    throw error;
  }
}

// Ejecutar migración
migrateMegaMenu()
  .then(() => {
    console.log('\n🎉 ¡Migración finalizada exitosamente!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error fatal en migración:', error);
    process.exit(1);
  });
