/**
 * Firebase Admin SDK Safe Initialization
 *
 * Provides safe initialization of Firebase Admin SDK that:
 * - Avoids initialization during build time
 * - Handles missing or invalid credentials gracefully
 * - Prevents "Invalid PEM formatted message" errors
 *
 * TODO: MIGRAR A VARIABLES DE ENTORNO EN PRODUCCIÓN
 * Actualmente tiene credenciales hardcodeadas como fallback para que funcione
 * en producción sin necesidad de configurar todas las variables de entorno.
 */

import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// TODO: MIGRAR A VARIABLES DE ENTORNO
// Credenciales hardcodeadas como fallback para producción
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

// Check if we're in build phase
const isBuildPhase = () => {
  // Solo consideramos build phase si explícitamente está en fase de build
  // NO bloqueamos por NODE_ENV=production ya que eso es runtime
  const isBuild = process.env.NEXT_PHASE === 'phase-production-build' ||
                  process.env.BUILDING === 'true';

  if (isBuild) {
    console.log('[Firebase Admin] Detected build phase, skipping initialization');
  }

  return isBuild;
};

// Helper to get credentials (env vars or hardcoded fallback)
const getCredentials = () => {
  return {
    projectId: process.env.FIREBASE_PROJECT_ID || HARDCODED_CREDENTIALS.PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || HARDCODED_CREDENTIALS.CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY || HARDCODED_CREDENTIALS.PRIVATE_KEY,
  };
};

// Check if we have valid Firebase credentials
const hasValidCredentials = () => {
  // Don't try to connect during build phase
  if (isBuildPhase()) {
    console.log('[Firebase Admin] Skipping initialization during build phase');
    return false;
  }

  const creds = getCredentials();

  // Check if credentials exist (from env or hardcoded)
  if (!creds.projectId || !creds.clientEmail || !creds.privateKey) {
    console.log('[Firebase Admin] Missing credentials');
    return false;
  }

  // Check if it's a demo project
  if (creds.projectId.includes('demo-project')) {
    console.log('[Firebase Admin] Demo project detected, skipping');
    return false;
  }

  // Validate private key format
  if (!creds.privateKey.includes('BEGIN PRIVATE KEY')) {
    console.log('[Firebase Admin] Invalid private key format');
    return false;
  }

  console.log('[Firebase Admin] Valid credentials found for project:', creds.projectId);
  return true;
};

// Get storage bucket name
const getStorageBucket = (): string => {
  // Usar env var si está disponible, sino fallback a hardcoded
  const bucket = process.env.FIREBASE_STORAGE_BUCKET || HARDCODED_CREDENTIALS.STORAGE_BUCKET;
  console.log('[Firebase Admin] Using storage bucket:', bucket);
  return bucket;
};

// Cache for Firebase instances
let cachedApp: App | null = null;
let cachedDb: Firestore | null = null;

/**
 * Get Firebase Admin instances safely
 * Returns null values if Firebase cannot be initialized
 */
export async function getFirebaseAdmin(): Promise<{
  app: App | null;
  db: Firestore | null;
}> {
  console.log('[Firebase Admin] getFirebaseAdmin() called');

  // Return cached instances if available
  if (cachedApp && cachedDb) {
    console.log('[Firebase Admin] Returning cached instances');
    return { app: cachedApp, db: cachedDb };
  }

  // Check if we can initialize Firebase
  if (!hasValidCredentials()) {
    console.log('[Firebase Admin] No valid credentials, returning null');
    return { app: null, db: null };
  }

  try {
    // Check if app is already initialized
    const apps = getApps();
    if (apps.length > 0) {
      console.log('[Firebase Admin] Found existing app, reusing it');
      cachedApp = apps[0];

      // Log app configuration for debugging
      try {
        const storage = getStorage(cachedApp);
        const testBucket = storage.bucket();
        console.log('[Firebase Admin] Existing app has default bucket:', testBucket.name);
      } catch (e) {
        console.log('[Firebase Admin] Existing app has no default bucket configured');
      }

      cachedDb = getFirestore(cachedApp);
      return { app: cachedApp, db: cachedDb };
    }

    // Initialize new app
    const creds = getCredentials();

    // En producción con K_SERVICE, Firebase App Hosting puede usar ADC
    const isFirebaseHosting = !!process.env.K_SERVICE;

    if (isFirebaseHosting) {
      console.log('[Firebase Admin] Detected Firebase App Hosting environment (K_SERVICE present)');
    }

    const serviceAccount = {
      type: "service_account",
      project_id: creds.projectId,
      private_key: creds.privateKey.replace(/\\n/g, '\n'),
      client_email: creds.clientEmail,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${creds.clientEmail}`
    };

    const storageBucket = getStorageBucket();

    console.log('[Firebase Admin] Initializing with:', {
      projectId: creds.projectId,
      clientEmail: creds.clientEmail,
      storageBucket,
      source: process.env.FIREBASE_PROJECT_ID ? 'env' : 'hardcoded'
    });

    // IMPORTANTE: Firebase App Hosting maneja credenciales de forma diferente
    const isFirebaseAppHosting = !!process.env.K_SERVICE;
    const isProduction = process.env.NODE_ENV === 'production';
    const bucketForInit = storageBucket.replace('gs://', '');

    if (isFirebaseAppHosting) {
      console.log('[Firebase Admin] Firebase App Hosting detected - using minimal config');
      // En Firebase App Hosting, usar configuración mínima
      // El entorno ya tiene las credenciales y configuración necesarias
      try {
        // Intentar inicializar sin especificar bucket (usa el default del proyecto)
        cachedApp = initializeApp({
          credential: cert(serviceAccount as any),
          projectId: creds.projectId
        });
        console.log('[Firebase Admin] Initialized with default Firebase App Hosting config');
      } catch (e) {
        console.log('[Firebase Admin] Default init failed, trying with bucket:', bucketForInit);
        cachedApp = initializeApp({
          credential: cert(serviceAccount as any),
          storageBucket: bucketForInit
        });
      }
    } else {
      // En local o sin Firebase App Hosting, especificar todo
      console.log('[Firebase Admin] Local environment - using full config');
      cachedApp = initializeApp({
        credential: cert(serviceAccount as any),
        storageBucket: bucketForInit
      });
    }

    console.log('[Firebase Admin] Successfully initialized. Bucket config:', isProduction ? 'default' : bucketForInit);

    // Verificar que el bucket se configuró correctamente
    try {
      const testStorage = getStorage(cachedApp);
      const testBucket = testStorage.bucket();
      console.log('[Firebase Admin] Storage bucket verification - Default bucket name:', testBucket.name);
    } catch (storageError) {
      console.error('[Firebase Admin] Storage verification failed:', storageError);
    }

    cachedDb = getFirestore(cachedApp);

    return { app: cachedApp, db: cachedDb };
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    return { app: null, db: null };
  }
}

/**
 * Check if Firebase Admin is available
 */
export function isFirebaseAvailable(): boolean {
  return hasValidCredentials();
}

/**
 * Get a fallback response for when Firebase is not available
 */
export function getFirebaseFallbackResponse(resource: string) {
  return {
    success: true,
    data: [],
    total: 0,
    message: 'Firebase not available in this environment',
    resource,
    source: 'fallback'
  };
}