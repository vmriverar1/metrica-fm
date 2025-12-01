/**
 * Script para copiar datos de Firestore de metrica-dip a metrica-fm
 * Excluye imágenes, solo copia datos estructurales
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Inicializar Firebase Admin para metrica-dip (origen)
const sourceServiceAccount = require('/home/freelos/metrica/credencials/service-account.json');
const sourceApp = admin.initializeApp({
  credential: admin.credential.cert(sourceServiceAccount),
  storageBucket: 'metrica-dip.firebasestorage.app'
}, 'source');

const sourceDb = sourceApp.firestore();

// Inicializar Firebase Admin para metrica-fm (destino)
const targetServiceAccount = require('../credencials/service-account.json');
const targetApp = admin.initializeApp({
  credential: admin.credential.cert(targetServiceAccount),
  storageBucket: 'metrica-fm.firebasestorage.app'
}, 'target');

const targetDb = targetApp.firestore();

// Colecciones a copiar
const COLLECTIONS_TO_COPY = [
  'pages',
  'admin',
  'blog_authors',
  'blog_categories',
  'blog_articles',
  'portfolio_categories',
  'portfolio_projects',
  'careers_departments',
  'careers_positions',
  'newsletter_subscribers'
];

// Función para limpiar URLs de imágenes (dejarlas como están pero loggear)
function processImageUrls(data, path = '') {
  if (!data || typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map((item, index) => processImageUrls(item, `${path}[${index}]`));
  }

  const processed = {};
  for (const [key, value] of Object.entries(data)) {
    const currentPath = path ? `${path}.${key}` : key;

    // Si es una URL de imagen, dejarla como está pero loggear
    if (typeof value === 'string' && (
      value.includes('storage.googleapis.com') ||
      value.includes('firebasestorage.app') ||
      value.startsWith('/images/') ||
      key.toLowerCase().includes('image') ||
      key.toLowerCase().includes('logo') ||
      key.toLowerCase().includes('photo') ||
      key.toLowerCase().includes('picture')
    )) {
      console.log(`   📷 Found image URL at ${currentPath}: ${value.substring(0, 60)}...`);
      processed[key] = value; // Mantener la URL original
    } else if (typeof value === 'object' && value !== null) {
      processed[key] = processImageUrls(value, currentPath);
    } else {
      processed[key] = value;
    }
  }

  return processed;
}

// Función para copiar una colección
async function copyCollection(collectionName) {
  console.log(`\n📁 Copying collection: ${collectionName}`);

  try {
    const snapshot = await sourceDb.collection(collectionName).get();

    if (snapshot.empty) {
      console.log(`   ⚠️  Collection ${collectionName} is empty, skipping`);
      return { success: true, copied: 0, skipped: 0 };
    }

    console.log(`   📊 Found ${snapshot.size} documents`);

    let copied = 0;
    let skipped = 0;

    for (const doc of snapshot.docs) {
      try {
        const data = doc.data();

        // Procesar URLs de imágenes
        const processedData = processImageUrls(data);

        // Copiar a metrica-fm
        await targetDb.collection(collectionName).doc(doc.id).set(processedData, { merge: true });

        copied++;
        console.log(`   ✅ Copied: ${collectionName}/${doc.id}`);
      } catch (error) {
        console.error(`   ❌ Error copying ${collectionName}/${doc.id}:`, error.message);
        skipped++;
      }
    }

    return { success: true, copied, skipped };
  } catch (error) {
    console.error(`   ❌ Error accessing collection ${collectionName}:`, error.message);
    return { success: false, error: error.message };
  }
}

// Función principal
async function main() {
  console.log('🚀 Starting Firestore data copy from metrica-dip to metrica-fm\n');
  console.log('⚠️  Note: Image URLs will be preserved as-is\n');

  const results = {};
  let totalCopied = 0;
  let totalSkipped = 0;

  for (const collection of COLLECTIONS_TO_COPY) {
    const result = await copyCollection(collection);
    results[collection] = result;

    if (result.success) {
      totalCopied += result.copied || 0;
      totalSkipped += result.skipped || 0;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total documents copied: ${totalCopied}`);
  console.log(`Total documents skipped: ${totalSkipped}`);
  console.log('\nResults by collection:');

  for (const [collection, result] of Object.entries(results)) {
    if (result.success) {
      console.log(`  ✅ ${collection}: ${result.copied} copied, ${result.skipped} skipped`);
    } else {
      console.log(`  ❌ ${collection}: ${result.error}`);
    }
  }

  console.log('\n✨ Copy process completed!\n');

  process.exit(0);
}

// Ejecutar
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
