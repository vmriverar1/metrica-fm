/**
 * Endpoint de prueba para validar la configuración de Firestore
 */

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Probando conectividad Firestore...');

    // Importar dinámicamente para evitar problemas durante build
    const { db, COLLECTIONS, isDemoMode } = await import('@/lib/firebase/config');

    if (isDemoMode) {
      // Modo demo: simular respuesta exitosa sin conectar realmente a Firestore
      const stats = {
        authors: 0,
        categories: 0,
        articles: 0,
        firestoreConnected: false,
        demoMode: true,
        projectId: 'demo-project',
        message: 'Ejecutando en modo demo - Las credenciales Firebase son de ejemplo'
      };

      console.log('✅ Demo mode stats:', stats);

      return NextResponse.json({
        success: true,
        message: 'Configuración validada en modo demo',
        data: stats
      });
    }

    // Modo real: intentar conectar a Firestore
    const { collection, getDocs } = await import('firebase/firestore');

    const [authorsSnap, categoriesSnap, articlesSnap] = await Promise.all([
      getDocs(collection(db, COLLECTIONS.AUTHORS)),
      getDocs(collection(db, COLLECTIONS.CATEGORIES)),
      getDocs(collection(db, COLLECTIONS.ARTICLES))
    ]);

    const stats = {
      authors: authorsSnap.size,
      categories: categoriesSnap.size,
      articles: articlesSnap.size,
      firestoreConnected: true,
      demoMode: false,
      projectId: db.app.options.projectId
    };

    console.log('✅ Firestore stats:', stats);

    return NextResponse.json({
      success: true,
      message: 'Firestore conectado correctamente',
      data: stats
    });

  } catch (error) {
    console.error('❌ Error conectando a Firestore:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error conectando a Firestore',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}