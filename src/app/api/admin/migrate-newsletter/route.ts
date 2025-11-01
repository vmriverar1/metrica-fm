/**
 * API Endpoint para ejecutar la migración de Newsletter a Firestore
 */

import { NextRequest, NextResponse } from 'next/server';

// Solo permitir POST  
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API: Iniciando migración Newsletter → Firestore');

    // Verificar si estamos en modo demo
    const { isDemoMode } = await import('@/lib/firebase/config');

    if (isDemoMode) {
      // Simular migración exitosa en modo demo
      const demoResult = {
        success: true,
        message: 'Migración simulada completada exitosamente (modo demo)',
        totalDocuments: 12,
        collections: {
          authors: { migrated: 5, total: 5 },
          categories: { migrated: 4, total: 4 },
          articles: { migrated: 3, total: 3 }
        },
        errors: [],
        demoMode: true
      };

      console.log('📊 API: Resultado de migración demo:', demoResult);

      return NextResponse.json({
        success: demoResult.success,
        message: demoResult.message,
        data: {
          totalDocuments: demoResult.totalDocuments,
          collections: demoResult.collections,
          errors: demoResult.errors,
          demoMode: demoResult.demoMode
        }
      }, { status: 200 });
    }

    // Modo real: ejecutar migración real
    const { migrateNewsletterFromJSON } = await import('@/scripts/migrate-newsletter');
    const result = await migrateNewsletterFromJSON();

    console.log('📊 API: Resultado de migración:', {
      success: result.success,
      totalDocuments: result.totalDocuments,
      errorsCount: result.errors.length
    });

    return NextResponse.json({
      success: result.success,
      message: result.message,
      data: {
        totalDocuments: result.totalDocuments,
        collections: result.collections,
        errors: result.errors,
        demoMode: false
      }
    }, { 
      status: result.success ? 200 : 500 
    });

  } catch (error) {
    console.error('❌ API: Error crítico en migración:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error crítico durante la migración',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { 
      status: 500 
    });
  }
}

// Método no permitido para otros verbos HTTP
export async function GET() {
  return NextResponse.json(
    { error: 'Método no permitido. Use POST.' },
    { status: 405 }
  );
}