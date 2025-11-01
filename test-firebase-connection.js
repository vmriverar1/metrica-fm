#!/usr/bin/env node

/**
 * Script de Prueba de Conexión a Firebase
 *
 * Prueba las conexiones a:
 * - Firestore (lectura/escritura)
 * - Storage (listado de buckets)
 * - Authentication (configuración)
 */

const { initializeApp, getApps } = require('firebase/app');
const { getFirestore, collection, getDocs, addDoc, deleteDoc, doc } = require('firebase/firestore');
const { getStorage, ref, listAll } = require('firebase/storage');
const { getAuth } = require('firebase/auth');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno desde .env.local manualmente
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      // Remove quotes if present
      value = value.replace(/^["'](.*)["']$/, '$1');
      process.env[key] = value;
    }
  });
  console.log('✅ Environment variables loaded from .env.local\n');
} else {
  console.warn('⚠️  .env.local file not found. Using process.env variables.\n');
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log('🔥 Firebase Connection Test\n');
console.log('📋 Configuration:');
console.log('   Project ID:', firebaseConfig.projectId);
console.log('   Auth Domain:', firebaseConfig.authDomain);
console.log('   Storage Bucket:', firebaseConfig.storageBucket);
console.log('   API Key:', firebaseConfig.apiKey ? firebaseConfig.apiKey.substring(0, 20) + '...' : 'NOT SET');
console.log('');

// Inicializar Firebase
let app;
try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log('✅ Firebase App initialized successfully\n');
  } else {
    app = getApps()[0];
    console.log('✅ Firebase App already initialized\n');
  }
} catch (error) {
  console.error('❌ Failed to initialize Firebase App:', error.message);
  process.exit(1);
}

// Test 1: Firestore Connection
async function testFirestore() {
  console.log('📦 Testing Firestore connection...');
  try {
    const db = getFirestore(app);

    // Test: Leer colecciones existentes
    console.log('   - Attempting to list collections...');
    const testCollection = collection(db, 'connection_test');

    // Test: Escribir documento de prueba
    console.log('   - Writing test document...');
    const testDoc = await addDoc(testCollection, {
      timestamp: new Date().toISOString(),
      test: 'connection-test',
      message: 'This is a test document from connection script'
    });
    console.log('   ✅ Test document written successfully. ID:', testDoc.id);

    // Test: Leer documento de prueba
    console.log('   - Reading test documents...');
    const snapshot = await getDocs(testCollection);
    console.log('   ✅ Found', snapshot.size, 'document(s) in test collection');

    // Test: Eliminar documento de prueba
    console.log('   - Cleaning up test document...');
    await deleteDoc(doc(db, 'connection_test', testDoc.id));
    console.log('   ✅ Test document deleted successfully');

    console.log('✅ Firestore: ALL TESTS PASSED\n');
    return true;
  } catch (error) {
    console.error('❌ Firestore Error:', error.message);
    console.error('   Code:', error.code);
    return false;
  }
}

// Test 2: Storage Connection
async function testStorage() {
  console.log('💾 Testing Storage connection...');
  try {
    const storage = getStorage(app);

    // Test: Listar archivos en el bucket raíz
    console.log('   - Attempting to list storage bucket...');
    const storageRef = ref(storage);
    const result = await listAll(storageRef);

    console.log('   ✅ Storage bucket accessible');
    console.log('   ✅ Found', result.prefixes.length, 'folder(s)');
    console.log('   ✅ Found', result.items.length, 'file(s) in root');

    if (result.prefixes.length > 0) {
      console.log('   📁 Folders:', result.prefixes.map(p => p.name).join(', '));
    }

    console.log('✅ Storage: ALL TESTS PASSED\n');
    return true;
  } catch (error) {
    console.error('❌ Storage Error:', error.message);
    console.error('   Code:', error.code);
    return false;
  }
}

// Test 3: Authentication Configuration
async function testAuth() {
  console.log('🔐 Testing Authentication configuration...');
  try {
    const auth = getAuth(app);

    console.log('   ✅ Auth instance created successfully');
    console.log('   ✅ Auth domain:', auth.config.authDomain);
    console.log('   ✅ API Key configured:', auth.config.apiKey ? 'YES' : 'NO');

    console.log('✅ Authentication: Configuration OK\n');
    return true;
  } catch (error) {
    console.error('❌ Authentication Error:', error.message);
    return false;
  }
}

// Run all tests
(async () => {
  console.log('🚀 Starting Firebase connection tests...\n');
  console.log('═'.repeat(60) + '\n');

  const results = {
    firestore: await testFirestore(),
    storage: await testStorage(),
    auth: await testAuth()
  };

  console.log('═'.repeat(60));
  console.log('\n📊 Test Results Summary:\n');
  console.log('   Firestore:', results.firestore ? '✅ PASS' : '❌ FAIL');
  console.log('   Storage:  ', results.storage ? '✅ PASS' : '❌ FAIL');
  console.log('   Auth:     ', results.auth ? '✅ PASS' : '❌ FAIL');

  const allPassed = results.firestore && results.storage && results.auth;

  if (allPassed) {
    console.log('\n🎉 ALL TESTS PASSED! Firebase connection is working correctly.\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  SOME TESTS FAILED. Check the errors above.\n');
    process.exit(1);
  }
})();
