import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API: Subiendo historia.json exacto a Firestore');

    // Leer el archivo historia.json EXACTAMENTE como está
    const historiaJsonPath = path.join(process.cwd(), 'public/json/pages/historia.json');
    const historiaJsonContent = fs.readFileSync(historiaJsonPath, 'utf8');
    const historiaData = JSON.parse(historiaJsonContent);

    console.log('📄 API: Archivo historia.json leído');

    // Crear documento 'historia' en la colección 'pages'
    const historiaDocRef = doc(db, 'pages', 'historia');

    // Convertir arrays anidados a formato compatible con Firestore
    const processArrays = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map((item, index) => ({ index, ...item }));
      }
      if (obj && typeof obj === 'object') {
        const result: any = {};
        for (const key in obj) {
          result[key] = processArrays(obj[key]);
        }
        return result;
      }
      return obj;
    };

    const processedData = processArrays(historiaData);

    // Subir el contenido procesado compatible con Firestore
    await setDoc(historiaDocRef, processedData);

    console.log('✅ API: historia.json subido exactamente como está');

    const summary = {
      success: true,
      message: 'historia.json migrado exactamente como está en el archivo',
      document_path: 'pages/historia',
      action: 'documento_completo_creado',
      original_file: 'public/json/pages/historia.json',
      content_verification: {
        page_title: historiaData.page?.title,
        page_subtitle: historiaData.page?.subtitle,
        sections_included: Object.keys(historiaData).length,
        total_size_chars: JSON.stringify(historiaData).length,
        main_sections: Object.keys(historiaData),
        timeline_events_count: historiaData.timeline_events?.length || 0,
        achievement_metrics_count: historiaData.achievement_summary?.metrics?.length || 0,
        timeline_years_covered: historiaData.timeline_events ?
          `${Math.min(...historiaData.timeline_events.map((e: any) => e.year))}-${Math.max(...historiaData.timeline_events.map((e: any) => e.year))}` : 'N/A'
      },
      structure_in_firestore: 'Un solo documento con todo el contenido JSON procesado para arrays anidados'
    };

    console.log('📊 API: Migración exacta de historia completada:', summary);

    return NextResponse.json(summary);

  } catch (error) {
    console.error('❌ API: Error en migración exacta de historia:', error);

    return NextResponse.json({
      success: false,
      message: 'Error en la migración exacta de historia.json',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ API: Eliminando documento pages/historia');

    const historiaDocRef = doc(db, 'pages', 'historia');
    await deleteDoc(historiaDocRef);

    return NextResponse.json({
      success: true,
      message: 'Documento pages/historia eliminado correctamente'
    });

  } catch (error) {
    console.error('❌ API: Error eliminando documento historia:', error);

    return NextResponse.json({
      success: false,
      message: 'Error eliminando documento historia',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}