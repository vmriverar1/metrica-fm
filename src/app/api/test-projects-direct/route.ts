import { NextResponse } from 'next/server';
import { FirestoreCore } from '@/lib/firestore/firestore-core';

export async function GET() {
  try {
    console.log('🔍 Test directo de proyectos...');

    // Obtener todos los proyectos sin ningún límite
    const allResult = await FirestoreCore.getDocuments('portfolio_projects');

    if (!allResult.success || !allResult.data) {
      return NextResponse.json({
        success: false,
        error: 'No se pudieron obtener los proyectos',
        firestoreError: allResult.error
      });
    }

    const allProjects = allResult.data;

    // Filtrar proyectos destacados
    const featuredProjects = allProjects.filter(p => p.featured === true);

    // Obtener información detallada
    const summary = {
      totalProjects: allProjects.length,
      featuredCount: featuredProjects.length,
      notFeaturedCount: allProjects.filter(p => p.featured === false).length,
      featuredTitles: featuredProjects.map(p => ({
        title: p.title,
        category: p.category,
        id: p.id
      }))
    };

    return NextResponse.json({
      success: true,
      ...summary,
      message: `Se encontraron ${featuredProjects.length} de ${allProjects.length} proyectos destacados`
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}