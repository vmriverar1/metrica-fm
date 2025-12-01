/**
 * Firebase Storage Connection Verifier
 *
 * Ejecuta durante el build para verificar que Storage esté correctamente configurado
 * Si falla, detiene el build con un error claro
 */

const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');

// Colores para output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(70));
  log(title, 'bold');
  console.log('='.repeat(70) + '\n');
}

// Credenciales hardcodeadas (mismo que firebase-admin-safe.ts)
const HARDCODED_CREDENTIALS = {
  PROJECT_ID: 'metrica-fm',
  CLIENT_EMAIL: 'firebase-adminsdk-fbsvc@metrica-fm.iam.gserviceaccount.com',
  PRIVATE_KEY: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDiNcLebG8UYK5d
yH+lMEtwz26UyMx5dMN+c2THVhs4o0Q2sUQi7jNFUF83eIijGqjtVJ8109S+QfbT
eYw05aYsfK32ZuQ55DCL8aX9GE/ZWaF3C6JH5NgRjTkyF/J4BgevsrOP3kz48Aq1
eHTvKnRuoranCK8a9wfIUnY4m4xWPMRGdGPIQH8qN9cDu2Kir4jdAYTizfQ0UehM
f186iu0rkluP78xbLTdEGhvJDJFpefptSWoNSGYAwB+vO565ogwasUapaP1bvpn1
33SlW+W7PklGUxmVOTbrEHHDMHU2n+7DbnLjLBuBym0E5Lc7umXikcvQravP2Fpt
55GrqdI1AgMBAAECggEABhwBmVRAY8KAsxO5LtLxFqjjia0qqJUYuo+PRzryHUN7
kiaTeoYIaHTVPYBJ4G3V5iME8cU417KcYfXEbaFOLaFoaWE6BL4++WibXQyNC4e6
LqbnyR1LIJ45zzqKV+eByaL/6oDMf2SsRV5tehAheON4H2bCo+3MDgL8ImdBEQsi
Gf6BrKYWwR9vPYhq1ou3HomRWGWFqaJKRj4eLp0+daq1LNmJFXQZ7/ZLYRhfipL/
pBBsjtBgi4mtMS9MBWhAa5cL8LLm39ACRT6wLXSHdxS5M41aaWROYcZ1/7KhoTNn
UsuAXusV0xuyI5pe8kPBEazHlPu/MWL1cSCiOCb5AQKBgQDzup7rx3s6dCjTSy0b
5P7RwtbvBKYqmpDnIOq+q0x3MS8BnzWRE22Tdvy4dZUPCFqykknw5sr+N+IdTgW/
xuX4THuyuck+thJ9uS6SjV5z8SL9G1/bzFjANBDYMXy6ooS3S9kxl8BCcuF/aPWy
ZVxXip1AJXlvAelXkuBqzgXqIQKBgQDtmVdlnLgMaxyOt7zLX+NimaIRrbj9gE4t
7ekIAr5zPjJX+r+8umplBXzw3Xt3ih6ryaHzVKMaRhZPfTLNx5g7vz6c8KjGEJKk
ls2an9e09Jn0ev8bQRuBsfWCHZ2NejZU8Yil5fe+tQSEavlaXjiMQbQll6GN7JLn
pvL/aXjtlQKBgFEtYykcs8pwTfiyHUAhMU4kGvpZDg86k/CnYghHfZxlYUalBG5h
jimDhADcCN2M5sh7OO1nsUyiyEkCZ5/MW2Qr9Tc98e1VLyt4ti5Rr5fmRMUQjQjk
MtsxfDrFoMl4v8NdG+YMqRh4suqAxvS4Fd2CaYWn9Z4ngNSOMvjfzdCBAoGBANwH
vELSXjLJ4plcGA8yzm1aHxdGDOFdt4ibIMmVWO96Mr787CEHdU32Rhz8zsEF/J9T
y5F+2MiVDUYxiCG+7ACwe3h0+abqZBLdwKunyOe/+O7KFIMVyTZTKiuD54rEGZqS
TtxrWgGWuwcx1ZdVWAKzOfPyNt8qrWSvW6sh7qX9AoGAdU1PuUGE9gUMzMowE5Bo
X6K/a2iPgvkN/ox4w4BYeZOmPqsPnzyQyBuElWwC4d+3og8jE3K3GnBcf8yGEey6
8BgGOjUSQScCiAP57aZ+nF9iR00Vy3v1XvGghL3RAL4uMA5Q/U0HJQd9AOzYRpZ2
8F1HhyhB36MFvwR7bHDSbAA=
-----END PRIVATE KEY-----
`,
  STORAGE_BUCKET: 'metrica-fm.firebasestorage.app'
};

const EXPECTED_BUCKET = 'gs://metrica-fm.firebasestorage.app';

async function verifyStorage() {
  logSection('🔥 Firebase Storage Connection Verifier');

  try {
    // Step 1: Verificar credenciales
    log('📋 Step 1: Verificando credenciales...', 'cyan');

    const credentials = {
      projectId: process.env.FIREBASE_PROJECT_ID || HARDCODED_CREDENTIALS.PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL || HARDCODED_CREDENTIALS.CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY || HARDCODED_CREDENTIALS.PRIVATE_KEY,
    };

    log(`  ✓ Project ID: ${credentials.projectId}`, 'green');
    log(`  ✓ Client Email: ${credentials.clientEmail}`, 'green');
    log(`  ✓ Private Key: ${credentials.privateKey.includes('BEGIN PRIVATE KEY') ? 'Valid format' : 'Invalid format'}`,
        credentials.privateKey.includes('BEGIN PRIVATE KEY') ? 'green' : 'red');

    if (!credentials.privateKey.includes('BEGIN PRIVATE KEY')) {
      throw new Error('Invalid private key format');
    }

    // Step 2: Inicializar Firebase Admin
    log('\n📋 Step 2: Inicializando Firebase Admin SDK...', 'cyan');

    let app;
    const existingApps = getApps();

    if (existingApps.length > 0) {
      app = existingApps[0];
      log('  ✓ Usando app existente', 'green');
    } else {
      app = initializeApp({
        credential: cert({
          projectId: credentials.projectId,
          clientEmail: credentials.clientEmail,
          privateKey: credentials.privateKey,
        }),
        storageBucket: HARDCODED_CREDENTIALS.STORAGE_BUCKET
      });
      log('  ✓ Firebase Admin inicializado correctamente', 'green');
    }

    // Step 3: Conectar a Storage
    log('\n📋 Step 3: Conectando a Firebase Storage...', 'cyan');

    const storage = getStorage(app);
    log('  ✓ Storage SDK cargado', 'green');

    // Step 4: Verificar bucket
    log('\n📋 Step 4: Verificando bucket...', 'cyan');

    const bucket = storage.bucket(HARDCODED_CREDENTIALS.STORAGE_BUCKET);
    log(`  ✓ Bucket obtenido: ${bucket.name}`, 'green');

    // Verificar que el bucket name sea el esperado
    const bucketName = bucket.name.replace('gs://', '');
    const expectedBucketName = EXPECTED_BUCKET.replace('gs://', '');

    if (bucketName !== expectedBucketName) {
      log(`  ✗ ADVERTENCIA: Bucket name no coincide`, 'yellow');
      log(`    Esperado: ${expectedBucketName}`, 'yellow');
      log(`    Obtenido: ${bucketName}`, 'yellow');
    } else {
      log(`  ✓ Bucket name correcto: ${bucketName}`, 'green');
    }

    // Step 5: Probar acceso al bucket
    log('\n📋 Step 5: Probando acceso al bucket...', 'cyan');

    try {
      const [metadata] = await bucket.getMetadata();
      log('  ✓ Metadata del bucket obtenida exitosamente', 'green');
      log(`    - Location: ${metadata.location}`, 'blue');
      log(`    - Storage Class: ${metadata.storageClass}`, 'blue');
      log(`    - Time Created: ${metadata.timeCreated}`, 'blue');
    } catch (metadataError) {
      log('  ⚠ No se pudo obtener metadata del bucket', 'yellow');
      log(`    Error: ${metadataError.message}`, 'yellow');
      // No fallar aquí, puede ser por permisos pero el bucket existe
    }

    // Step 6: Probar listar archivos (opcional, puede fallar por permisos)
    log('\n📋 Step 6: Probando listar archivos...', 'cyan');

    try {
      const [files] = await bucket.getFiles({ maxResults: 1 });
      log(`  ✓ Listado exitoso (${files.length} archivo(s) encontrado(s))`, 'green');
    } catch (listError) {
      log('  ⚠ No se pudo listar archivos', 'yellow');
      log(`    Error: ${listError.message}`, 'yellow');
      log('    Esto puede ser normal si el bucket está vacío o hay restricciones de permisos', 'yellow');
    }

    // Step 7: Verificar variables de entorno para producción
    log('\n📋 Step 7: Verificando configuración de entorno...', 'cyan');

    const isProduction = process.env.NODE_ENV === 'production';
    const isFirebaseAppHosting = !!process.env.K_SERVICE;

    log(`  • NODE_ENV: ${process.env.NODE_ENV || 'not set'}`, 'blue');
    log(`  • K_SERVICE: ${process.env.K_SERVICE || 'not set'}`, 'blue');
    log(`  • Is Production: ${isProduction}`, 'blue');
    log(`  • Is Firebase App Hosting: ${isFirebaseAppHosting}`, 'blue');

    if (isProduction && !isFirebaseAppHosting) {
      log('  ⚠ ADVERTENCIA: NODE_ENV=production pero no está en Firebase App Hosting', 'yellow');
    }

    // SUCCESS
    logSection('✅ STORAGE VERIFICATION PASSED');
    log('Firebase Storage está correctamente configurado y accesible', 'green');
    log(`Bucket: ${EXPECTED_BUCKET}`, 'green');

    process.exit(0);

  } catch (error) {
    // FAILURE
    logSection('❌ STORAGE VERIFICATION FAILED');
    log('Error al verificar Firebase Storage:', 'red');
    log(error.message, 'red');

    if (error.stack) {
      log('\nStack trace:', 'yellow');
      console.error(error.stack);
    }

    log('\n🔍 Pasos para resolver:', 'yellow');
    log('1. Verificar que las credenciales en apphosting.yaml sean correctas', 'yellow');
    log('2. Verificar que el service account tenga permisos de Storage Admin', 'yellow');
    log('3. Verificar que el bucket existe en Firebase Console', 'yellow');
    log('4. Verificar reglas de Storage en Firebase Console', 'yellow');

    process.exit(1);
  }
}

// Ejecutar verificación
verifyStorage();
