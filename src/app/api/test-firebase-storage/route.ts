/**
 * Test endpoint para verificar Firebase Storage
 */

import { NextResponse } from 'next/server';
import { isStorageAvailable, listStorageFiles } from '@/lib/firebase-storage';

export async function GET() {
  try {
    console.log('[TEST] Checking Firebase Storage availability...');

    // Verificar si Firebase Storage está disponible
    const available = await isStorageAvailable();
    console.log('[TEST] Firebase Storage available:', available);

    if (!available) {
      return NextResponse.json({
        success: false,
        error: 'Firebase Storage not available',
        message: 'Firebase Admin SDK is not initialized or Storage is not enabled'
      });
    }

    // Intentar listar archivos
    console.log('[TEST] Attempting to list files...');
    const result = await listStorageFiles('images/proyectos');
    console.log('[TEST] List result:', result);

    return NextResponse.json({
      success: result.success,
      available: true,
      filesCount: result.files?.length || 0,
      files: result.files?.slice(0, 5), // Solo primeros 5 para no sobrecargar
      error: result.error
    });

  } catch (error) {
    console.error('[TEST] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    }, { status: 500 });
  }
}
