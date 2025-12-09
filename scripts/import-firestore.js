/**
 * Script para importar datos de backup JSON a Firestore de metrica-fm
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Credenciales de metrica-fm
const serviceAccount = require('../credencials/service-account.json');

// Inicializar Firebase Admin
const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'metrica-fm.firebasestorage.app'
});

const db = app.firestore();

// Directorio de backup
const BACKUP_DIR = path.join(__dirname, '../backup');

// Mapeo de archivos a colecciones
const COLLECTIONS_MAP = {
  'pages.json': 'pages',
  'blog_articles.json': 'blog_articles',
  'blog_authors.json': 'blog_authors',
  'blog_categories.json': 'blog_categories',
  'careers_departments.json': 'careers_departments',
  'careers_positions.json': 'careers_positions',
  'config.json': 'config',
  'megamenu.json': 'megamenu',
  'portfolio_categories.json': 'portfolio_categories',
  'portfolio_projects.json': 'portfolio_projects'
  // Excluimos subscribers por privacidad
};

// Función para limpiar datos antes de importar
function cleanData(data) {
  const cleaned = { ...data };

  // Remover campos internos del backup
  delete cleaned._id;
  delete cleaned._path;

  // Convertir timestamps si existen
  if (cleaned.createdAt && cleaned.createdAt._type === 'Timestamp') {
    cleaned.createdAt = new admin.firestore.Timestamp(
      cleaned.createdAt.seconds,
      cleaned.createdAt.nanoseconds
    );
  }

  if (cleaned.updatedAt && cleaned.updatedAt._type === 'Timestamp') {
    cleaned.updatedAt = new admin.firestore.Timestamp(
      cleaned.updatedAt.seconds,
      cleaned.updatedAt.nanoseconds
    );
  }

  return cleaned;
}

// Función para importar una colección
async function importCollection(fileName, collectionName) {
  const filePath = path.join(BACKUP_DIR, fileName);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Archivo no encontrado: ${fileName}`);
    return { success: false, count: 0 };
  }

  console.log(`\n📁 Importando: ${fileName} -> ${collectionName}`);

  try {
    const rawData = fs.readFileSync(filePath, 'utf8');
    const documents = JSON.parse(rawData);

    if (!Array.isArray(documents)) {
      console.log(`   ⚠️  ${fileName} no es un array, saltando...`);
      return { success: false, count: 0 };
    }

    console.log(`   📊 Encontrados ${documents.length} documentos`);

    let successCount = 0;
    let errorCount = 0;

    // Usar batch para mejor performance
    const batchSize = 500; // Firestore limit

    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = db.batch();
      const chunk = documents.slice(i, i + batchSize);

      for (const doc of chunk) {
        // Usar _id como ID del documento, o generar uno
        const docId = doc._id || doc.id || `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const docRef = db.collection(collectionName).doc(docId);
        const cleanedData = cleanData(doc);

        batch.set(docRef, cleanedData, { merge: true });
      }

      try {
        await batch.commit();
        successCount += chunk.length;
        console.log(`   ✅ Batch ${Math.floor(i/batchSize) + 1}: ${chunk.length} documentos importados`);
      } catch (batchError) {
        console.error(`   ❌ Error en batch:`, batchError.message);
        errorCount += chunk.length;
      }
    }

    console.log(`   📊 Resultado: ${successCount} éxitos, ${errorCount} errores`);
    return { success: true, count: successCount };

  } catch (error) {
    console.error(`   ❌ Error procesando ${fileName}:`, error.message);
    return { success: false, count: 0, error: error.message };
  }
}

// Función principal
async function main() {
  console.log('🚀 Iniciando importación de backup a Firestore (metrica-fm)\n');
  console.log('=' .repeat(60));

  const results = {};
  let totalDocuments = 0;

  // Obtener argumento de línea de comandos para importar una colección específica
  const specificFile = process.argv[2];

  if (specificFile) {
    // Importar solo una colección específica
    const collectionName = COLLECTIONS_MAP[specificFile];
    if (collectionName) {
      const result = await importCollection(specificFile, collectionName);
      results[specificFile] = result;
      totalDocuments += result.count;
    } else {
      console.log(`❌ Archivo no válido: ${specificFile}`);
      console.log(`   Archivos válidos: ${Object.keys(COLLECTIONS_MAP).join(', ')}`);
      process.exit(1);
    }
  } else {
    // Importar todas las colecciones
    for (const [fileName, collectionName] of Object.entries(COLLECTIONS_MAP)) {
      const result = await importCollection(fileName, collectionName);
      results[fileName] = result;
      totalDocuments += result.count;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE IMPORTACIÓN');
  console.log('='.repeat(60));

  for (const [file, result] of Object.entries(results)) {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${file}: ${result.count} documentos`);
  }

  console.log(`\n📊 Total: ${totalDocuments} documentos importados`);
  console.log('\n✨ Importación completada!\n');

  process.exit(0);
}

// Ejecutar
main().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});
