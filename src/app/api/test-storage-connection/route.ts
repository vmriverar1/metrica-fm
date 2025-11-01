/**
 * Test exhaustivo de conexión a Firebase Storage
 * GET /api/test-storage-connection
 *
 * Compara Firestore (funciona) vs Storage (no funciona)
 */

import { NextResponse } from 'next/server';
import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

export async function GET() {
  console.log('\n========== TEST STORAGE CONNECTION ==========');

  const results = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      hasFirebaseProjectId: !!process.env.FIREBASE_PROJECT_ID,
      hasFirebaseClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasFirebasePrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      hasStorageBucket: !!process.env.FIREBASE_STORAGE_BUCKET,
    },
    tests: {
      initializeApp: { success: false, details: {} as any },
      firestore: { success: false, details: {} as any },
      storageDefault: { success: false, details: {} as any },
      storageExplicit: { success: false, details: {} as any },
      storageWithGsProtocol: { success: false, details: {} as any },
      storageWithoutApp: { success: false, details: {} as any }
    }
  };

  try {
    // Test 1: Initialize App
    console.log('\n[TEST 1] Initializing Firebase Admin...');

    // Verificar si ya hay una app inicializada
    const existingApps = getApps();
    let app: App;

    if (existingApps.length > 0) {
      console.log('[TEST 1] Using existing app');
      app = existingApps[0];
      results.tests.initializeApp.success = true;
      results.tests.initializeApp.details = {
        method: 'existing',
        appName: app.name
      };
    } else {
      console.log('[TEST 1] Creating new app');

      // Credenciales hardcodeadas
      const credentials = {
        projectId: process.env.FIREBASE_PROJECT_ID || 'metrica-dip',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@metrica-dip.iam.gserviceaccount.com',
        privateKey: process.env.FIREBASE_PRIVATE_KEY || `-----BEGIN PRIVATE KEY-----
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
-----END PRIVATE KEY-----`
      };

      const storageBucket = 'metrica-dip.firebasestorage.app';

      console.log('[TEST 1] Using credentials:', {
        projectId: credentials.projectId,
        clientEmail: credentials.clientEmail,
        privateKeyLength: credentials.privateKey.length,
        storageBucket
      });

      app = initializeApp({
        credential: cert({
          projectId: credentials.projectId,
          clientEmail: credentials.clientEmail,
          privateKey: credentials.privateKey.replace(/\\n/g, '\n')
        }),
        storageBucket: storageBucket
      });

      results.tests.initializeApp.success = true;
      results.tests.initializeApp.details = {
        method: 'new',
        appName: app.name,
        storageBucket
      };
    }

    // Test 2: Firestore Connection
    console.log('\n[TEST 2] Testing Firestore connection...');
    try {
      const db = getFirestore(app);
      const testCollection = db.collection('test-connection');
      const docRef = await testCollection.doc('test').get();

      results.tests.firestore.success = true;
      results.tests.firestore.details = {
        connected: true,
        testDocExists: docRef.exists
      };
      console.log('[TEST 2] ✅ Firestore works!');
    } catch (error) {
      results.tests.firestore.details = {
        error: (error as Error).message
      };
      console.log('[TEST 2] ❌ Firestore failed:', (error as Error).message);
    }

    // Test 3: Storage Default (sin parámetros)
    console.log('\n[TEST 3] Testing Storage with default bucket()...');
    try {
      const storage = getStorage(app);
      const bucket = storage.bucket(); // Sin parámetros

      console.log('[TEST 3] Bucket name from default:', bucket.name);

      // Intentar listar archivos
      const [files] = await bucket.getFiles({
        prefix: 'images/',
        maxResults: 1
      });

      results.tests.storageDefault.success = true;
      results.tests.storageDefault.details = {
        bucketName: bucket.name,
        filesFound: files.length
      };
      console.log('[TEST 3] ✅ Storage default works! Files found:', files.length);
    } catch (error) {
      results.tests.storageDefault.details = {
        error: (error as Error).message,
        errorCode: (error as any).code,
        errorDetails: (error as any).errors
      };
      console.log('[TEST 3] ❌ Storage default failed:', (error as Error).message);
    }

    // Test 4: Storage Explicit
    console.log('\n[TEST 4] Testing Storage with explicit bucket name...');
    try {
      const storage = getStorage(app);
      const bucket = storage.bucket('metrica-dip.firebasestorage.app'); // Explícito

      console.log('[TEST 4] Bucket name from explicit:', bucket.name);

      // Intentar listar archivos
      const [files] = await bucket.getFiles({
        prefix: 'images/',
        maxResults: 1
      });

      results.tests.storageExplicit.success = true;
      results.tests.storageExplicit.details = {
        bucketName: bucket.name,
        filesFound: files.length
      };
      console.log('[TEST 4] ✅ Storage explicit works! Files found:', files.length);
    } catch (error) {
      results.tests.storageExplicit.details = {
        error: (error as Error).message,
        errorCode: (error as any).code,
        errorDetails: (error as any).errors
      };
      console.log('[TEST 4] ❌ Storage explicit failed:', (error as Error).message);
    }

    // Test 5: Storage con protocolo gs://
    console.log('\n[TEST 5] Testing Storage with gs:// protocol...');
    try {
      const storage = getStorage(app);
      const bucket = storage.bucket('gs://metrica-dip.firebasestorage.app'); // Con gs://

      console.log('[TEST 5] Bucket name from gs://:', bucket.name);

      const [files] = await bucket.getFiles({
        prefix: 'images/',
        maxResults: 1
      });

      results.tests.storageWithGsProtocol.success = true;
      results.tests.storageWithGsProtocol.details = {
        bucketName: bucket.name,
        filesFound: files.length
      };
      console.log('[TEST 5] ✅ Storage with gs:// works! Files found:', files.length);
    } catch (error) {
      results.tests.storageWithGsProtocol.details = {
        error: (error as Error).message,
        errorCode: (error as any).code,
        errorDetails: (error as any).errors
      };
      console.log('[TEST 5] ❌ Storage with gs:// failed:', (error as Error).message);
    }

    // Test 6: Storage sin app (directo)
    console.log('\n[TEST 6] Testing Storage without app reference...');
    try {
      const storage = getStorage(); // Sin app
      const bucket = storage.bucket('metrica-dip.firebasestorage.app');

      console.log('[TEST 6] Bucket name without app:', bucket.name);

      const [files] = await bucket.getFiles({
        prefix: 'images/',
        maxResults: 1
      });

      results.tests.storageWithoutApp.success = true;
      results.tests.storageWithoutApp.details = {
        bucketName: bucket.name,
        filesFound: files.length
      };
      console.log('[TEST 6] ✅ Storage without app works! Files found:', files.length);
    } catch (error) {
      results.tests.storageWithoutApp.details = {
        error: (error as Error).message,
        errorCode: (error as any).code,
        errorDetails: (error as any).errors
      };
      console.log('[TEST 6] ❌ Storage without app failed:', (error as Error).message);
    }

  } catch (mainError) {
    console.error('[MAIN ERROR]:', mainError);
    results.tests.initializeApp.success = false;
    results.tests.initializeApp.details = {
      error: (mainError as Error).message
    };
  }

  console.log('\n========== TEST COMPLETE ==========\n');
  console.log('Results summary:', JSON.stringify(results, null, 2));

  return NextResponse.json(results);
}