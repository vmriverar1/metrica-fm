import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API: Subiendo portfolio.json exacto a Firestore');

    // Leer el archivo portfolio.json EXACTAMENTE como está
    const portfolioJsonPath = path.join(process.cwd(), 'public/json/pages/portfolio.json');
    const portfolioJsonContent = fs.readFileSync(portfolioJsonPath, 'utf8');
    const portfolioData = JSON.parse(portfolioJsonContent);

    console.log('📄 API: Archivo portfolio.json leído');

    // Crear documento 'portfolio' en la colección 'pages'
    const portfolioDocRef = doc(db, 'pages', 'portfolio');

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

    const processedData = processArrays(portfolioData);

    // Subir el contenido procesado compatible con Firestore
    await setDoc(portfolioDocRef, processedData);

    console.log('✅ API: portfolio.json subido exactamente como está');

    const summary = {
      success: true,
      message: 'portfolio.json migrado exactamente como está en el archivo',
      document_path: 'pages/portfolio',
      action: 'documento_completo_creado',
      original_file: 'public/json/pages/portfolio.json',
      content_verification: {
        page_title: portfolioData.page?.title,
        hero_title: portfolioData.hero?.title,
        sections_included: Object.keys(portfolioData).length,
        total_size_chars: JSON.stringify(portfolioData).length,
        main_sections: Object.keys(portfolioData),
        featured_projects_count: portfolioData.featured_projects?.projects?.length || 0,
        categories_preview_count: portfolioData.categories_overview?.categories_preview?.length || 0,
        portfolio_views_count: portfolioData.portfolio_views?.views?.length || 0,
        geographic_locations_count: portfolioData.geographic_presence?.locations?.length || 0,
        investment_sectors_count: portfolioData.investment_analysis?.investment_by_sector?.length || 0,
        methodology_phases_count: portfolioData.project_methodology?.phases?.length || 0,
        success_metrics_count: portfolioData.success_metrics?.metrics?.length || 0,
        innovations_count: portfolioData.innovation_highlights?.innovations?.length || 0,
        total_investment: portfolioData.geographic_presence?.total_coverage?.total_investment || 'N/A',
        total_projects: portfolioData.geographic_presence?.total_coverage?.total_projects || 'N/A'
      },
      structure_in_firestore: 'Un solo documento con todo el contenido JSON procesado para arrays anidados'
    };

    console.log('📊 API: Migración exacta de portfolio completada:', summary);

    return NextResponse.json(summary);

  } catch (error) {
    console.error('❌ API: Error en migración exacta de portfolio:', error);

    return NextResponse.json({
      success: false,
      message: 'Error en la migración exacta de portfolio.json',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ API: Eliminando documento pages/portfolio');

    const portfolioDocRef = doc(db, 'pages', 'portfolio');
    await deleteDoc(portfolioDocRef);

    return NextResponse.json({
      success: true,
      message: 'Documento pages/portfolio eliminado correctamente'
    });

  } catch (error) {
    console.error('❌ API: Error eliminando documento portfolio:', error);

    return NextResponse.json({
      success: false,
      message: 'Error eliminando documento portfolio',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}