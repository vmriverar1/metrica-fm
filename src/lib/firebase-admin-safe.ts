/**
 * Firebase Admin SDK Safe Initialization
 *
 * Uses environment variables exclusively (no hardcoded credentials).
 * Required env vars: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 * Optional: FIREBASE_STORAGE_BUCKET (defaults to {projectId}.firebasestorage.app)
 */

import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const isBuildPhase = () => {
  return process.env.NEXT_PHASE === 'phase-production-build' ||
         process.env.BUILDING === 'true';
};

const getCredentials = () => ({
  projectId: process.env.FIREBASE_PROJECT_ID || '',
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
  privateKey: process.env.FIREBASE_PRIVATE_KEY || '',
});

const hasValidCredentials = () => {
  if (isBuildPhase()) return false;

  const creds = getCredentials();
  if (!creds.projectId || !creds.clientEmail || !creds.privateKey) return false;
  if (creds.projectId.includes('demo-project')) return false;
  if (!creds.privateKey.includes('BEGIN PRIVATE KEY')) return false;

  return true;
};

const getStorageBucket = (): string => {
  const creds = getCredentials();
  return process.env.FIREBASE_STORAGE_BUCKET || `${creds.projectId}.firebasestorage.app`;
};

let cachedApp: App | null = null;
let cachedDb: Firestore | null = null;

export async function getFirebaseAdmin(): Promise<{
  app: App | null;
  db: Firestore | null;
}> {
  if (cachedApp && cachedDb) {
    return { app: cachedApp, db: cachedDb };
  }

  if (!hasValidCredentials()) {
    return { app: null, db: null };
  }

  try {
    const apps = getApps();
    if (apps.length > 0) {
      cachedApp = apps[0];
      cachedDb = getFirestore(cachedApp);
      return { app: cachedApp, db: cachedDb };
    }

    const creds = getCredentials();
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

    const bucketForInit = getStorageBucket().replace('gs://', '');
    const isFirebaseAppHosting = !!process.env.K_SERVICE;

    if (isFirebaseAppHosting) {
      try {
        cachedApp = initializeApp({
          credential: cert(serviceAccount as any),
          projectId: creds.projectId
        });
      } catch {
        cachedApp = initializeApp({
          credential: cert(serviceAccount as any),
          storageBucket: bucketForInit
        });
      }
    } else {
      cachedApp = initializeApp({
        credential: cert(serviceAccount as any),
        storageBucket: bucketForInit
      });
    }

    cachedDb = getFirestore(cachedApp);
    return { app: cachedApp, db: cachedDb };
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    return { app: null, db: null };
  }
}

export function isFirebaseAvailable(): boolean {
  return hasValidCredentials();
}

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
