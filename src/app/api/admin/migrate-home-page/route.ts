import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API: Eliminando documento anterior y subiendo home.json exacto');

    // Primero eliminar el documento anterior mal creado
    const homeDocRef = doc(db, 'pages', 'home');
    try {
      await deleteDoc(homeDocRef);
      console.log('🗑️ API: Documento anterior eliminado');
    } catch (deleteError) {
      console.log('ℹ️ API: No había documento anterior o ya fue eliminado');
    }

    // Leer el archivo home.json EXACTAMENTE como está
    const homeJsonPath = path.join(process.cwd(), 'public/json/pages/home.json');
    const homeJsonContent = fs.readFileSync(homeJsonPath, 'utf8');
    const homeData = JSON.parse(homeJsonContent);

    console.log('📄 API: Archivo home.json leído');

    // Subir EXACTAMENTE el contenido del JSON sin modificaciones
    // Sin referencias, sin subcolecciones, exactamente como está
    await setDoc(homeDocRef, homeData);

    console.log('✅ API: home.json subido exactamente como está');

    const summary = {
      success: true,
      message: 'home.json migrado exactamente como está en el archivo',
      document_path: 'pages/home',
      action: 'documento_completo_reemplazado',
      original_file: 'public/json/pages/home.json',
      content_verification: {
        id: homeData.id,
        title: homeData.page?.title,
        sections_included: Object.keys(homeData).filter(key =>
          typeof homeData[key] === 'object' && homeData[key] !== null
        ).length,
        total_size_chars: JSON.stringify(homeData).length
      },
      structure_in_firestore: 'Un solo documento con todo el contenido JSON'
    };

    console.log('📊 API: Migración exacta completada:', summary);

    return NextResponse.json(summary);

  } catch (error) {
    console.error('❌ API: Error en migración exacta:', error);

    return NextResponse.json({
      success: false,
      message: 'Error en la migración exacta de home.json',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ API: Eliminando documento pages/home');

    const homeDocRef = doc(db, 'pages', 'home');
    await deleteDoc(homeDocRef);

    return NextResponse.json({
      success: true,
      message: 'Documento pages/home eliminado correctamente'
    });

  } catch (error) {
    console.error('❌ API: Error eliminando documento:', error);

    return NextResponse.json({
      success: false,
      message: 'Error eliminando documento',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}