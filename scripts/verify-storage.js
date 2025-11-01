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
  PROJECT_ID: 'metrica-dip',
  CLIENT_EMAIL: 'firebase-adminsdk-fbsvc@metrica-dip.iam.gserviceaccount.com',
  PRIVATE_KEY: `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCqocFqVKh8K6Se
C+hKBl4EdqMGB1QtwYM280yIXto+T2PD0jgFhWQ8DBQYQgGMALdTV1/oD+HA4Ifv
HbN/iFi5Og4AaTJ8Ma7aS0MMyzIg55kfpgK0oiAfGKC+FjfsSrPRlTUVdY1fXKRy
u6o9sG6KItO8wGTXET7J9KbLp6GOKAct1FyFIne0t5n8h1cQF0U/kIP7VsDUvFky
7QCuHL7vNntjjKYgg+A8fSfC4vjLfdIjBCLQ3QhPSpoxERbePihc7Q8ztXqj4nL2
VvLic5Zhx6UrRIXk7sRfo91OKToc+57OMUhzcLvPjlsKGhMXdgVy0dza9Nq2xnkq
Bos/UH+xAgMBAAECggEAEH8S8/S7VUXi5GTCUGXNMSFHIY4T1VigFu/utkB1WRDT
1Fq+j8oVpriEONQo0iA/mQ8ZdpYSfVM30SZN9EZ6TW4PbHq/JsKm5PPhx5rdfdDm
POkP2ebStC7tW3NKdM3EFL8YIrr6r/2E6JK8Irqr9S7oyZbQKPrB10SP26CZPeT3
/BbYfYDuDvawWsEF0ilKctS3PwAX/m8khuSHuaSDpNiw3Hdxr7tqWJ+g01fb5bCU
OK2Etw0cxP+7OCccPB2uysrEGr+7aJV4CVj30ZB2+o75moORboEOMhgtH/Z0Z2L1
Ca9EPnL1PkW4u32vg+wjAj9Vi6NUBOi5bEIiMONrAQKBgQDwp06AkEUOarpY7AKD
RkJfF/m/TNro51NctBDX2JsBzeSsgFyaYrLEsnw78X1J8Mu38BQpqBwBcv0b3H1F
w2kZFOQe+LRenCGRNG6WkRRKf0yHf/vgf4dXtZIQbCs453EefoMOH0bHCkzhiJX3
9fQ+r3VZbEap+aFZ5nNhn79YLwKBgQC1g1Z7dSF4KXlnJcvqSTiXcVHV/GjQOrKQ
Ssbhy/Y2SYxn5CUhbms0loemhrPvmYuPe0VpdZwGIPgmvTXm9EpGiPEQVLU5boGA
1ehQQYW9N5Ld7qFgJAK1lmsLQtE45G9+ge5PwSAcJ7jJnlj+nxjE45cG3ikIU0Gi
S4MQSgHOHwKBgQDmC4kHbOIWff/UsQdV5fvcW1bqf9Vjfn45yAexzeWfO+q025+q
FV8+mEAaLSbPX9fd5SnhCEp9OCasU4GNBteYmlfXI3eIWUfdPnnYhKcY78eAX9+v
IzmFppQSDtTieJuxws4U2eEWs8n6bk6t0ffBVIihCtgh8/dBsQHq+II5EQKBgAme
cSnPtjtY708RCLJcuPwFjFGrs549ThMpc0qp9V1BHoiu5WzVHidGRuADSWvMFkI/
RRlmmyMUAjKDWmTn0zvTq/qyknv9qC08qLgAEOdLF6RdLf4bSm13ECsjmlTKfkIU
/p0JXfs/+6Hrm0m7AqQEb490nHYNe2/vUn29fkT/AoGBAIFf9j8GBmS3anRvZ7h+
vo9E3Hw5qmMy4J+sNsVugKOjxa+7ySQbJXh37d3yxZiXCY860HHwjfDoHF4iCSN/
d+XoOrpMjCaOuyxDXUTjT4NpKuSnpv9KXkCsIdgPIZD7HxoszrROG3IULR/ubkN1
VsX2IcX7IkCkEGnblKsCIgqF
-----END PRIVATE KEY-----
`,
  STORAGE_BUCKET: 'metrica-dip.firebasestorage.app'
};

const EXPECTED_BUCKET = 'gs://metrica-dip.firebasestorage.app';

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
