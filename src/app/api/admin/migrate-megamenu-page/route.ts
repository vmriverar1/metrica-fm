import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API: Subiendo megamenu.json exacto a Firestore');

    // Leer el archivo megamenu.json EXACTAMENTE como está
    const megamenuJsonPath = path.join(process.cwd(), 'public/json/admin/megamenu.json');
    const megamenuJsonContent = fs.readFileSync(megamenuJsonPath, 'utf8');
    const megamenuData = JSON.parse(megamenuJsonContent);

    console.log('📄 API: Archivo megamenu.json leído');

    // Extraer solo el contenido de megamenu (sin el wrapper)
    const megamenuContent = megamenuData.megamenu;

    if (!megamenuContent) {
      throw new Error('No se encontró la clave "megamenu" en el JSON');
    }

    // Crear documento 'main' en la colección 'megamenu'
    const megamenuDocRef = doc(db, 'megamenu', 'main');

    // Agregar metadata de exportación
    const dataToSave = {
      ...megamenuContent,
      export_metadata: {
        source: 'json_file',
        exported_at: new Date().toISOString(),
        source_path: '/public/json/admin/megamenu.json',
        exported_by: 'admin_api',
        version: '1.0.0'
      }
    };

    const processedData = dataToSave;

    // Subir el contenido procesado compatible con Firestore
    await setDoc(megamenuDocRef, processedData);

    console.log('✅ API: megamenu.json subido exactamente como está');

    const summary = {
      success: true,
      message: 'megamenu.json migrado correctamente a Firestore',
      document_path: 'megamenu/main',
      action: 'documento_completo_creado',
      original_file: 'public/json/admin/megamenu.json',
      content_verification: {
        megamenu_enabled: megamenuContent?.settings?.enabled || false,
        version: megamenuContent?.settings?.version || 'N/A',
        sections_included: Object.keys(megamenuContent).length,
        total_size_chars: JSON.stringify(megamenuContent).length,
        main_sections: Object.keys(megamenuContent),
        menu_items_count: megamenuContent?.items?.length || 0,
        page_mappings_count: megamenuContent?.page_mappings ? Object.keys(megamenuContent.page_mappings).length : 0,
        analytics_total_clicks: megamenuContent?.analytics?.total_clicks || 0,
        most_clicked_item: megamenuContent?.analytics?.most_clicked_item || 'N/A',
        popular_links_count: megamenuContent?.analytics?.popular_links?.length || 0,
        submenu_items_count: {
          about_links: megamenuContent?.items?.find((item: any) => item.id === 'about')?.submenu?.links?.length || 0,
          portfolio_links: megamenuContent?.items?.find((item: any) => item.id === 'portfolio')?.submenu?.links?.length || 0
        }
      },
      structure_in_firestore: 'Documento en colección megamenu con ID main'
    };

    console.log('📊 API: Migración exacta de megamenu completada:', summary);

    return NextResponse.json(summary);

  } catch (error) {
    console.error('❌ API: Error en migración exacta de megamenu:', error);

    return NextResponse.json({
      success: false,
      message: 'Error en la migración exacta de megamenu.json',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ API: Eliminando documento megamenu/main');

    const megamenuDocRef = doc(db, 'megamenu', 'main');
    await deleteDoc(megamenuDocRef);

    return NextResponse.json({
      success: true,
      message: 'Documento megamenu/main eliminado correctamente'
    });

  } catch (error) {
    console.error('❌ API: Error eliminando documento megamenu:', error);

    return NextResponse.json({
      success: false,
      message: 'Error eliminando documento megamenu',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}