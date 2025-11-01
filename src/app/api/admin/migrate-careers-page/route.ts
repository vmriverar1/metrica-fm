import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API: Subiendo careers.json exacto a Firestore');

    // Leer el archivo careers.json EXACTAMENTE como está
    const careersJsonPath = path.join(process.cwd(), 'public/json/pages/careers.json');
    const careersJsonContent = fs.readFileSync(careersJsonPath, 'utf8');
    const careersData = JSON.parse(careersJsonContent);

    console.log('📄 API: Archivo careers.json leído');

    // Crear documento 'careers' en la colección 'pages'
    const careersDocRef = doc(db, 'pages', 'careers');

    // Subir EXACTAMENTE el contenido del JSON sin modificaciones
    await setDoc(careersDocRef, careersData);

    console.log('✅ API: careers.json subido exactamente como está');

    const summary = {
      success: true,
      message: 'careers.json migrado exactamente como está en el archivo',
      document_path: 'pages/careers',
      action: 'documento_completo_creado',
      original_file: 'public/json/pages/careers.json',
      content_verification: {
        page_title: careersData.page?.title,
        hero_title: careersData.hero?.title,
        sections_included: Object.keys(careersData).length,
        total_size_chars: JSON.stringify(careersData).length,
        main_sections: Object.keys(careersData),
        benefits_count: careersData.company_benefits?.benefits?.length || 0,
        values_count: careersData.culture_preview?.values?.length || 0,
        process_steps: careersData.application_process?.steps?.length || 0
      },
      structure_in_firestore: 'Un solo documento con todo el contenido JSON'
    };

    console.log('📊 API: Migración exacta de careers completada:', summary);

    return NextResponse.json(summary);

  } catch (error) {
    console.error('❌ API: Error en migración exacta de careers:', error);

    return NextResponse.json({
      success: false,
      message: 'Error en la migración exacta de careers.json',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ API: Eliminando documento pages/careers');

    const careersDocRef = doc(db, 'pages', 'careers');
    await deleteDoc(careersDocRef);

    return NextResponse.json({
      success: true,
      message: 'Documento pages/careers eliminado correctamente'
    });

  } catch (error) {
    console.error('❌ API: Error eliminando documento careers:', error);

    return NextResponse.json({
      success: false,
      message: 'Error eliminando documento careers',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}