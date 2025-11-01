/**
 * Endpoint de diagnóstico para verificar Firebase en producción
 * GET /api/diagnostics/firebase
 */

import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase-admin-safe';

// Verificar credenciales sin intentar inicializar
function checkEnvironment() {
  return {
    // Variables de entorno
    env: {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PHASE: process.env.NEXT_PHASE,
      BUILDING: process.env.BUILDING,
      K_SERVICE: process.env.K_SERVICE,
    },

    // Estado de credenciales (sin exponer valores)
    credentials: {
      hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
      projectId: process.env.FIREBASE_PROJECT_ID || 'NOT_SET',
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      clientEmailPrefix: process.env.FIREBASE_CLIENT_EMAIL
        ? process.env.FIREBASE_CLIENT_EMAIL.split('@')[0]
        : 'NOT_SET',
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length || 0,
      hasStorageBucket: !!process.env.FIREBASE_STORAGE_BUCKET,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'NOT_SET',
    },

    // Información del servidor
    server: {
      timestamp: new Date().toISOString(),
      platform: process.platform,
      nodeVersion: process.version,
      cwd: process.cwd(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      }
    }
  };
}

export async function GET() {
  console.log('[DIAGNOSTICS] Firebase diagnostics endpoint called');

  const diagnostics = {
    ...checkEnvironment(),
    firebase: {
      status: 'checking',
      initialized: false,
      error: null as string | null,
      bucket: null as string | null,
    }
  };

  // Intentar inicializar Firebase
  try {
    console.log('[DIAGNOSTICS] Attempting to get Firebase Admin...');
    const { app, db } = await getFirebaseAdmin();

    if (app) {
      console.log('[DIAGNOSTICS] Firebase Admin initialized successfully');
      diagnostics.firebase.status = 'initialized';
      diagnostics.firebase.initialized = true;

      // Intentar obtener información del bucket
      try {
        const { getStorage } = await import('firebase-admin/storage');
        // IMPORTANTE: Usar bucket name explícito como en las otras funciones
        const STORAGE_BUCKET_NAME = 'metrica-dip.firebasestorage.app';
        const bucket = getStorage(app).bucket(STORAGE_BUCKET_NAME);
        diagnostics.firebase.bucket = bucket.name;
        console.log('[DIAGNOSTICS] Storage bucket:', bucket.name);

        // Intentar listar archivos para verificar acceso
        try {
          const [files] = await bucket.getFiles({
            prefix: 'images/',
            maxResults: 1
          });
          console.log('[DIAGNOSTICS] Storage access verified, files found:', files.length);
        } catch (listError) {
          console.error('[DIAGNOSTICS] Error listing files:', listError);
          diagnostics.firebase.error = `Storage list error: ${(listError as Error).message}`;
        }
      } catch (storageError) {
        console.error('[DIAGNOSTICS] Error getting storage:', storageError);
        diagnostics.firebase.error = `Storage error: ${(storageError as Error).message}`;
      }
    } else {
      console.log('[DIAGNOSTICS] Firebase Admin not initialized (app is null)');
      diagnostics.firebase.status = 'not_initialized';
      diagnostics.firebase.error = 'Firebase Admin returned null';
    }
  } catch (error) {
    console.error('[DIAGNOSTICS] Error initializing Firebase:', error);
    diagnostics.firebase.status = 'error';
    diagnostics.firebase.error = (error as Error).message;
  }

  // Log completo para debugging
  console.log('[DIAGNOSTICS] Complete diagnostics:', JSON.stringify(diagnostics, null, 2));

  return NextResponse.json(diagnostics);
}