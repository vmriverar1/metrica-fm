/**
 * API Route para obtener categorías de portfolio desde Firestore
 * Simplificado para resolver problemas del sistema unificado
 */

import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Inicializar Firebase Admin
async function initializeFirebaseAdmin() {
  try {
    if (getApps().length === 0) {
      const serviceAccountPath = join(process.cwd(), 'credencials', 'service-account.json');
      const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

      initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id
      });
    }

    return getFirestore();
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const db = await initializeFirebaseAdmin();

    // Obtener categorías de portfolio desde Firestore
    const categoriesSnapshot = await db.collection('portfolio_categories').get();
    const categories = categoriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`✅ Found ${categories.length} portfolio categories in Firestore`);

    return NextResponse.json({
      success: true,
      data: categories,
      count: categories.length,
      source: 'firestore',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fetching portfolio categories:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: [],
      count: 0,
      source: 'error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}