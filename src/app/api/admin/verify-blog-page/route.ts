import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API: Verificando que el contenido blog en Firestore sea idéntico al JSON');

    // Leer el archivo JSON original
    const blogJsonPath = path.join(process.cwd(), 'public/json/pages/blog.json');
    const blogJsonContent = fs.readFileSync(blogJsonPath, 'utf8');
    const originalData = JSON.parse(blogJsonContent);

    // Obtener el documento de Firestore
    const blogDocRef = doc(db, 'pages', 'blog');
    const docSnap = await getDoc(blogDocRef);

    if (!docSnap.exists()) {
      return NextResponse.json({
        success: false,
        message: 'El documento pages/blog no existe en Firestore'
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

    // Verificación específica de secciones principales
    const sectionsToCheck = ['page', 'hero', 'content_sections', 'filters', 'contact_cta'];
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
        'El contenido blog en Firestore es EXACTAMENTE idéntico al JSON original' :
        'Hay diferencias entre el JSON original y Firestore',
      is_identical: verification.content_match,
      document_path: 'pages/blog',
      verification_details: verification,
      sections_verification: sectionVerification,
      content_summary: {
        page_title: originalData.page?.title,
        hero_title: originalData.hero?.title,
        total_keys: Object.keys(originalData).length,
        sections_matching: Object.values(sectionVerification).filter(s => s.content_matches).length,
        all_sections_match: Object.values(sectionVerification).every(s => s.content_matches)
      }
    };

    console.log('📊 API: Verificación blog completada:', {
      identical: verification.content_match,
      keys_match: verification.structure_comparison.keys_match,
      sections_ok: Object.values(sectionVerification).filter(s => s.content_matches).length
    });

    return NextResponse.json(summary);

  } catch (error) {
    console.error('❌ API: Error en verificación blog:', error);

    return NextResponse.json({
      success: false,
      message: 'Error en la verificación del contenido blog',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}