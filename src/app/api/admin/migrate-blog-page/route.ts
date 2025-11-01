import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API: Eliminando documento anterior y subiendo blog.json exacto');

    // Primero eliminar el documento anterior mal creado
    const blogDocRef = doc(db, 'pages', 'blog');
    try {
      await deleteDoc(blogDocRef);
      console.log('🗑️ API: Documento anterior blog eliminado');
    } catch (deleteError) {
      console.log('ℹ️ API: No había documento anterior blog o ya fue eliminado');
    }

    // Leer el archivo blog.json EXACTAMENTE como está actualizado
    const blogJsonPath = path.join(process.cwd(), 'public/json/pages/blog.json');
    const blogJsonContent = fs.readFileSync(blogJsonPath, 'utf8');
    const blogData = JSON.parse(blogJsonContent);

    console.log('📄 API: Archivo blog.json actualizado leído');

    // Subir EXACTAMENTE el contenido del JSON sin modificaciones
    // Sin referencias, sin subcolecciones, exactamente como está
    await setDoc(blogDocRef, blogData);

    console.log('✅ API: blog.json subido exactamente como está');

    const summary = {
      success: true,
      message: 'blog.json migrado exactamente como está en el archivo actualizado',
      document_path: 'pages/blog',
      action: 'documento_completo_reemplazado',
      original_file: 'public/json/pages/blog.json',
      content_verification: {
        page_title: blogData.page?.title,
        hero_title: blogData.hero?.title,
        sections_included: Object.keys(blogData).length,
        total_size_chars: JSON.stringify(blogData).length,
        main_sections: Object.keys(blogData)
      },
      structure_in_firestore: 'Un solo documento con todo el contenido JSON actualizado'
    };

    console.log('📊 API: Migración exacta de blog completada:', summary);

    return NextResponse.json(summary);

  } catch (error) {
    console.error('❌ API: Error en migración exacta de blog:', error);

    return NextResponse.json({
      success: false,
      message: 'Error en la migración exacta de blog.json',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ API: Eliminando documento pages/blog');

    const blogDocRef = doc(db, 'pages', 'blog');
    await deleteDoc(blogDocRef);

    return NextResponse.json({
      success: true,
      message: 'Documento pages/blog eliminado correctamente'
    });

  } catch (error) {
    console.error('❌ API: Error eliminando documento blog:', error);

    return NextResponse.json({
      success: false,
      message: 'Error eliminando documento blog',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}