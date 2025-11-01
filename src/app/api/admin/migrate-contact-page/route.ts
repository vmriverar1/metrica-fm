import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API: Subiendo contact.json exacto a Firestore');

    // Leer el archivo contact.json EXACTAMENTE como está
    const contactJsonPath = path.join(process.cwd(), 'public/json/pages/contact.json');
    const contactJsonContent = fs.readFileSync(contactJsonPath, 'utf8');
    const contactData = JSON.parse(contactJsonContent);

    console.log('📄 API: Archivo contact.json leído');

    // Crear documento 'contact' en la colección 'pages'
    const contactDocRef = doc(db, 'pages', 'contact');

    // Subir EXACTAMENTE el contenido del JSON sin modificaciones
    await setDoc(contactDocRef, contactData);

    console.log('✅ API: contact.json subido exactamente como está');

    const summary = {
      success: true,
      message: 'contact.json migrado exactamente como está en el archivo',
      document_path: 'pages/contact',
      action: 'documento_completo_creado',
      original_file: 'public/json/pages/contact.json',
      content_verification: {
        page_title: contactData.page?.title,
        hero_title: contactData.hero?.title,
        sections_included: Object.keys(contactData).length,
        total_size_chars: JSON.stringify(contactData).length,
        main_sections: Object.keys(contactData),
        contact_info_items: contactData.sections?.contact_info?.items?.length || 0,
        process_steps: contactData.sections?.process?.steps?.length || 0,
        settings_included: contactData.settings ? Object.keys(contactData.settings).length : 0,
        seo_keywords_count: contactData.seo?.keywords?.length || 0
      },
      structure_in_firestore: 'Un solo documento con todo el contenido JSON'
    };

    console.log('📊 API: Migración exacta de contact completada:', summary);

    return NextResponse.json(summary);

  } catch (error) {
    console.error('❌ API: Error en migración exacta de contact:', error);

    return NextResponse.json({
      success: false,
      message: 'Error en la migración exacta de contact.json',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ API: Eliminando documento pages/contact');

    const contactDocRef = doc(db, 'pages', 'contact');
    await deleteDoc(contactDocRef);

    return NextResponse.json({
      success: true,
      message: 'Documento pages/contact eliminado correctamente'
    });

  } catch (error) {
    console.error('❌ API: Error eliminando documento contact:', error);

    return NextResponse.json({
      success: false,
      message: 'Error eliminando documento contact',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}