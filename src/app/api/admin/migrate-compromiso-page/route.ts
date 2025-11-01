import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API: Subiendo compromiso.json exacto a Firestore');

    // Leer el archivo compromiso.json EXACTAMENTE como está
    const compromisoJsonPath = path.join(process.cwd(), 'public/json/pages/compromiso.json');
    const compromisoJsonContent = fs.readFileSync(compromisoJsonPath, 'utf8');
    const compromisoData = JSON.parse(compromisoJsonContent);

    console.log('📄 API: Archivo compromiso.json leído');

    // Crear documento 'compromiso' en la colección 'pages'
    const compromisoDocRef = doc(db, 'pages', 'compromiso');

    // Subir EXACTAMENTE el contenido del JSON sin modificaciones
    await setDoc(compromisoDocRef, compromisoData);

    console.log('✅ API: compromiso.json subido exactamente como está');

    const summary = {
      success: true,
      message: 'compromiso.json migrado exactamente como está en el archivo',
      document_path: 'pages/compromiso',
      action: 'documento_completo_creado',
      original_file: 'public/json/pages/compromiso.json',
      content_verification: {
        page_title: compromisoData.page?.title,
        hero_title: compromisoData.hero?.title,
        sections_included: Object.keys(compromisoData).length,
        total_size_chars: JSON.stringify(compromisoData).length,
        main_sections: Object.keys(compromisoData),
        social_pillars: compromisoData.main_content?.sections?.find(s => s.id === 'responsabilidad-social')?.pillars?.length || 0,
        environmental_pillars: compromisoData.main_content?.sections?.find(s => s.id === 'compromiso-ambiental')?.pillars?.length || 0,
        certifications_count: compromisoData.main_content?.sections?.find(s => s.id === 'certificaciones')?.certifications?.length || 0,
        sdg_goals_count: compromisoData.sustainability_goals?.goals?.length || 0,
        future_commitments_count: compromisoData.future_commitments?.commitments?.length || 0
      },
      structure_in_firestore: 'Un solo documento con todo el contenido JSON'
    };

    console.log('📊 API: Migración exacta de compromiso completada:', summary);

    return NextResponse.json(summary);

  } catch (error) {
    console.error('❌ API: Error en migración exacta de compromiso:', error);

    return NextResponse.json({
      success: false,
      message: 'Error en la migración exacta de compromiso.json',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ API: Eliminando documento pages/compromiso');

    const compromisoDocRef = doc(db, 'pages', 'compromiso');
    await deleteDoc(compromisoDocRef);

    return NextResponse.json({
      success: true,
      message: 'Documento pages/compromiso eliminado correctamente'
    });

  } catch (error) {
    console.error('❌ API: Error eliminando documento compromiso:', error);

    return NextResponse.json({
      success: false,
      message: 'Error eliminando documento compromiso',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}