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