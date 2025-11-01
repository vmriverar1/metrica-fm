import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API: Verificando que el contenido en Firestore sea idéntico al JSON');

    // Leer el archivo JSON original
    const homeJsonPath = path.join(process.cwd(), 'public/json/pages/home.json');
    const homeJsonContent = fs.readFileSync(homeJsonPath, 'utf8');
    const originalData = JSON.parse(homeJsonContent);

    // Obtener el documento de Firestore
    const homeDocRef = doc(db, 'pages', 'home');
    const docSnap = await getDoc(homeDocRef);

    if (!docSnap.exists()) {
      return NextResponse.json({
        success: false,
        message: 'El documento pages/home no existe en Firestore'
      }, { status: 404 });
    }

    const firestoreData = docSnap.data();

    // Verificación detallada de contenido
    const verification = {
      content_match: JSON.stringify(originalData) === JSON.stringify(firestoreData),
      size_comparison: {
        original_chars: JSON.stringify(originalData).length,
        firestore_chars: JSON.stringify(firestoreData).length
      },
      structure_comparison: {
        original_keys: Object.keys(originalData).sort(),
        firestore_keys: Object.keys(firestoreData).sort(),
        keys_match: JSON.stringify(Object.keys(originalData).sort()) === JSON.stringify(Object.keys(firestoreData).sort())
      },
      key_by_key_verification: {}
    };

    // Verificación clave por clave
    for (const key of Object.keys(originalData)) {
      const originalValue = originalData[key];
      const firestoreValue = firestoreData[key];

      verification.key_by_key_verification[key] = {
        exists_in_firestore: key in firestoreData,
        values_match: JSON.stringify(originalValue) === JSON.stringify(firestoreValue),
        original_type: typeof originalValue,
        firestore_type: typeof firestoreValue
      };
    }

    // Verificación específica de secciones importantes
    const sectionsToCheck = ['hero', 'stats', 'services', 'portfolio', 'pillars', 'policies', 'clients', 'newsletter'];
    const sectionVerification = {};

    for (const section of sectionsToCheck) {
      sectionVerification[section] = {
        exists_in_both: !!(originalData[section] && firestoreData[section]),
        content_matches: JSON.stringify(originalData[section]) === JSON.stringify(firestoreData[section])
      };
    }

    const summary = {
      success: true,
      message: verification.content_match ?
        'El contenido en Firestore es EXACTAMENTE idéntico al JSON original' :
        'Hay diferencias entre el JSON original y Firestore',
      is_identical: verification.content_match,
      document_path: 'pages/home',
      verification_details: verification,
      sections_verification: sectionVerification,
      summary_stats: {
        total_keys_original: Object.keys(originalData).length,
        total_keys_firestore: Object.keys(firestoreData).length,
        sections_verified: sectionsToCheck.length,
        sections_matching: Object.values(sectionVerification).filter(s => s.content_matches).length
      }
    };

    console.log('📊 API: Verificación completada:', {
      identical: verification.content_match,
      keys_match: verification.structure_comparison.keys_match,
      sections_ok: Object.values(sectionVerification).filter(s => s.content_matches).length
    });

    return NextResponse.json(summary);

  } catch (error) {
    console.error('❌ API: Error en verificación:', error);

    return NextResponse.json({
      success: false,
      message: 'Error en la verificación del contenido',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}