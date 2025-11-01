import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API: Subiendo clientes.json exacto a Firestore');

    // Leer el archivo clientes.json EXACTAMENTE como está
    const clientesJsonPath = path.join(process.cwd(), 'public/json/pages/clientes.json');
    const clientesJsonContent = fs.readFileSync(clientesJsonPath, 'utf8');
    const clientesData = JSON.parse(clientesJsonContent);

    console.log('📄 API: Archivo clientes.json leído');

    // Crear documento 'clientes' en la colección 'pages'
    const clientesDocRef = doc(db, 'pages', 'clientes');

    // Subir EXACTAMENTE el contenido del JSON sin modificaciones
    await setDoc(clientesDocRef, clientesData);

    console.log('✅ API: clientes.json subido exactamente como está');

    const summary = {
      success: true,
      message: 'clientes.json migrado exactamente como está en el archivo',
      document_path: 'pages/clientes',
      action: 'documento_completo_creado',
      original_file: 'public/json/pages/clientes.json',
      content_verification: {
        page_title: clientesData.page?.title,
        hero_title: clientesData.hero?.title,
        sections_included: Object.keys(clientesData).length,
        total_size_chars: JSON.stringify(clientesData).length,
        main_sections: Object.keys(clientesData),
        public_clients_count: clientesData.clients?.public_sector?.length || 0,
        private_clients_count: clientesData.clients?.private_sector?.length || 0,
        testimonials_count: clientesData.testimonials?.items?.length || 0,
        benefits_count: clientesData.benefits?.items?.length || 0
      },
      structure_in_firestore: 'Un solo documento con todo el contenido JSON'
    };

    console.log('📊 API: Migración exacta de clientes completada:', summary);

    return NextResponse.json(summary);

  } catch (error) {
    console.error('❌ API: Error en migración exacta de clientes:', error);

    return NextResponse.json({
      success: false,
      message: 'Error en la migración exacta de clientes.json',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ API: Eliminando documento pages/clientes');

    const clientesDocRef = doc(db, 'pages', 'clientes');
    await deleteDoc(clientesDocRef);

    return NextResponse.json({
      success: true,
      message: 'Documento pages/clientes eliminado correctamente'
    });

  } catch (error) {
    console.error('❌ API: Error eliminando documento clientes:', error);

    return NextResponse.json({
      success: false,
      message: 'Error eliminando documento clientes',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}