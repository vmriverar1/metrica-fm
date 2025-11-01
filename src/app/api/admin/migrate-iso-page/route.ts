import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API: Subiendo iso.json exacto a Firestore');

    // Leer el archivo iso.json EXACTAMENTE como está
    const isoJsonPath = path.join(process.cwd(), 'public/json/pages/iso.json');
    const isoJsonContent = fs.readFileSync(isoJsonPath, 'utf8');
    const isoData = JSON.parse(isoJsonContent);

    console.log('📄 API: Archivo iso.json leído');

    // Crear documento 'iso' en la colección 'pages'
    const isoDocRef = doc(db, 'pages', 'iso');

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

    const processedData = processArrays(isoData);

    // Subir el contenido procesado compatible con Firestore
    await setDoc(isoDocRef, processedData);

    console.log('✅ API: iso.json subido exactamente como está');

    const summary = {
      success: true,
      message: 'iso.json migrado exactamente como está en el archivo',
      document_path: 'pages/iso',
      action: 'documento_completo_creado',
      original_file: 'public/json/pages/iso.json',
      content_verification: {
        page_title: isoData.page?.title,
        hero_title: isoData.hero?.title,
        sections_included: Object.keys(isoData).length,
        total_size_chars: JSON.stringify(isoData).length,
        main_sections: Object.keys(isoData),
        quality_commitments_count: isoData.quality_policy?.commitments?.length || 0,
        quality_objectives_count: isoData.quality_policy?.objectives?.length || 0,
        client_benefits_count: isoData.client_benefits?.benefits_list?.length || 0,
        testimonials_count: isoData.testimonials?.testimonials_list?.length || 0,
        process_phases_count: isoData.process_overview?.phases?.length || 0,
        certifications_count: isoData.certifications_standards?.certifications?.length || 0,
        kpis_count: isoData.quality_metrics?.kpis?.length || 0,
        audit_schedule_count: isoData.audit_information?.audit_schedule?.length || 0
      },
      structure_in_firestore: 'Un solo documento con todo el contenido JSON procesado para arrays anidados'
    };

    console.log('📊 API: Migración exacta de iso completada:', summary);

    return NextResponse.json(summary);

  } catch (error) {
    console.error('❌ API: Error en migración exacta de iso:', error);

    return NextResponse.json({
      success: false,
      message: 'Error en la migración exacta de iso.json',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ API: Eliminando documento pages/iso');

    const isoDocRef = doc(db, 'pages', 'iso');
    await deleteDoc(isoDocRef);

    return NextResponse.json({
      success: true,
      message: 'Documento pages/iso eliminado correctamente'
    });

  } catch (error) {
    console.error('❌ API: Error eliminando documento iso:', error);

    return NextResponse.json({
      success: false,
      message: 'Error eliminando documento iso',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}