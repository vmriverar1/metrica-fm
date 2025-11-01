import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API: Subiendo services.json exacto a Firestore');

    // Leer el archivo services.json EXACTAMENTE como está
    const servicesJsonPath = path.join(process.cwd(), 'public/json/pages/services.json');
    const servicesJsonContent = fs.readFileSync(servicesJsonPath, 'utf8');
    const servicesData = JSON.parse(servicesJsonContent);

    console.log('📄 API: Archivo services.json leído');

    // Crear documento 'services' en la colección 'pages'
    const servicesDocRef = doc(db, 'pages', 'services');

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

    const processedData = processArrays(servicesData);

    // Subir el contenido procesado compatible con Firestore
    await setDoc(servicesDocRef, processedData);

    console.log('✅ API: services.json subido exactamente como está');

    const summary = {
      success: true,
      message: 'services.json migrado exactamente como está en el archivo',
      document_path: 'pages/services',
      action: 'documento_completo_creado',
      original_file: 'public/json/pages/services.json',
      content_verification: {
        page_title: servicesData.page?.title,
        hero_title: servicesData.hero?.title,
        sections_included: Object.keys(servicesData).length,
        total_size_chars: JSON.stringify(servicesData).length,
        main_sections: Object.keys(servicesData),
        services_count: servicesData.services?.list?.length || 0,
        project_showcase_count: servicesData.project_showcase?.projects?.length || 0,
        contact_form_services_options: servicesData.contact_form?.services_options?.length || 0,
        value_propositions_count: servicesData.value_propositions?.items?.length || 0,
        budget_ranges_count: servicesData.contact_form?.budget_ranges?.length || 0,
        timeline_options_count: servicesData.contact_form?.timeline_options?.length || 0,
        form_fields_count: servicesData.contact_form?.form_fields ? Object.keys(servicesData.contact_form.form_fields).length : 0,
        hero_stats_count: servicesData.hero?.stats?.length || 0
      },
      structure_in_firestore: 'Un solo documento con todo el contenido JSON procesado para arrays anidados'
    };

    console.log('📊 API: Migración exacta de services completada:', summary);

    return NextResponse.json(summary);

  } catch (error) {
    console.error('❌ API: Error en migración exacta de services:', error);

    return NextResponse.json({
      success: false,
      message: 'Error en la migración exacta de services.json',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ API: Eliminando documento pages/services');

    const servicesDocRef = doc(db, 'pages', 'services');
    await deleteDoc(servicesDocRef);

    return NextResponse.json({
      success: true,
      message: 'Documento pages/services eliminado correctamente'
    });

  } catch (error) {
    console.error('❌ API: Error eliminando documento services:', error);

    return NextResponse.json({
      success: false,
      message: 'Error eliminando documento services',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}