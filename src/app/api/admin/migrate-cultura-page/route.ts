import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API: Subiendo cultura.json exacto a Firestore');

    // Leer el archivo cultura.json EXACTAMENTE como está
    const culturaJsonPath = path.join(process.cwd(), 'public/json/pages/cultura.json');
    const culturaJsonContent = fs.readFileSync(culturaJsonPath, 'utf8');
    const culturaData = JSON.parse(culturaJsonContent);

    console.log('📄 API: Archivo cultura.json leído');

    // Crear documento 'cultura' en la colección 'pages'
    const culturaDocRef = doc(db, 'pages', 'cultura');

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

    const processedData = processArrays(culturaData);

    // Subir el contenido procesado compatible con Firestore
    await setDoc(culturaDocRef, processedData);

    console.log('✅ API: cultura.json subido exactamente como está');

    const summary = {
      success: true,
      message: 'cultura.json migrado exactamente como está en el archivo',
      document_path: 'pages/cultura',
      action: 'documento_completo_creado',
      original_file: 'public/json/pages/cultura.json',
      content_verification: {
        page_title: culturaData.page?.title,
        hero_title: culturaData.hero?.title,
        sections_included: Object.keys(culturaData).length,
        total_size_chars: JSON.stringify(culturaData).length,
        main_sections: Object.keys(culturaData),
        values_count: culturaData.values?.values_list?.length || 0,
        team_members_count: culturaData.team?.members?.length || 0,
        tech_list_count: culturaData.technologies?.tech_list?.length || 0,
        culture_stats_categories: culturaData.culture_stats?.categories ? Object.keys(culturaData.culture_stats.categories).length : 0,
        moments_gallery_count: culturaData.team?.moments?.gallery?.length || 0
      },
      structure_in_firestore: 'Un solo documento con todo el contenido JSON'
    };

    console.log('📊 API: Migración exacta de cultura completada:', summary);

    return NextResponse.json(summary);

  } catch (error) {
    console.error('❌ API: Error en migración exacta de cultura:', error);

    return NextResponse.json({
      success: false,
      message: 'Error en la migración exacta de cultura.json',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ API: Eliminando documento pages/cultura');

    const culturaDocRef = doc(db, 'pages', 'cultura');
    await deleteDoc(culturaDocRef);

    return NextResponse.json({
      success: true,
      message: 'Documento pages/cultura eliminado correctamente'
    });

  } catch (error) {
    console.error('❌ API: Error eliminando documento cultura:', error);

    return NextResponse.json({
      success: false,
      message: 'Error eliminando documento cultura',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}