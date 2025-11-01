import { NextResponse } from 'next/server';
import { FirestoreCore } from '@/lib/firestore/firestore-core';

export async function GET() {
  try {
    console.log('🔍 Iniciando diagnóstico de proyectos destacados...');

    // 1. Obtener TODOS los proyectos sin límite
    const allProjectsResult = await FirestoreCore.getDocuments('portfolio_projects');

    if (!allProjectsResult.success || !allProjectsResult.data) {
      return NextResponse.json({
        success: false,
        error: 'No se pudieron obtener los proyectos',
        details: allProjectsResult.error
      }, { status: 404 });
    }

    const allProjects = allProjectsResult.data;
    console.log(`📋 Total de proyectos: ${allProjects.length}`);

    // 2. Analizar el campo featured en todos los proyectos
    const projectsAnalysis = allProjects.map(project => ({
      id: project.id,
      title: project.title,
      featured: project.featured,
      featuredType: typeof project.featured,
      featuredValue: project.featured,
      hasFeatureField: 'featured' in project,
      fields: Object.keys(project)
    }));

    // 3. Contar proyectos por estado de featured
    const featuredCount = allProjects.filter(p => p.featured === true).length;
    const notFeaturedCount = allProjects.filter(p => p.featured === false).length;
    const undefinedFeaturedCount = allProjects.filter(p => p.featured === undefined || p.featured === null).length;

    // 4. Obtener los proyectos que tienen featured = true
    const featuredProjects = allProjects.filter(p => p.featured === true);
    const featuredTitles = featuredProjects.map(p => ({
      id: p.id,
      title: p.title,
      category: p.category,
      featured: p.featured
    }));

    // 5. Intentar query directa
    let queryFeaturedResult = null;
    try {
      const queryResult = await FirestoreCore.getDocuments('portfolio_projects', {
        where: [{ field: 'featured', operator: '==', value: true }]
      });

      if (queryResult.success) {
        queryFeaturedResult = {
          success: true,
          count: queryResult.data?.length || 0,
          titles: queryResult.data?.map(p => p.title) || []
        };
      } else {
        queryFeaturedResult = {
          success: false,
          error: queryResult.error
        };
      }
    } catch (error) {
      queryFeaturedResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }

    // 6. Analizar diferencias
    const queryCount = queryFeaturedResult?.count || 0;
    const filterCount = featuredCount;
    const hasDifference = queryCount !== filterCount;

    return NextResponse.json({
      success: true,
      summary: {
        totalProjects: allProjects.length,
        featuredTrue: featuredCount,
        featuredFalse: notFeaturedCount,
        featuredUndefinedOrNull: undefinedFeaturedCount
      },
      featuredProjects: {
        count: featuredCount,
        titles: featuredTitles
      },
      queryResult: queryFeaturedResult,
      comparison: {
        filterMethod: filterCount,
        queryMethod: queryCount,
        hasDifference,
        difference: Math.abs(queryCount - filterCount)
      },
      sampleProjects: projectsAnalysis.slice(0, 5),
      diagnostics: {
        message: hasDifference
          ? `⚠️ HAY DIFERENCIA: Query retorna ${queryCount} pero filter encuentra ${filterCount}`
          : `✅ Consistente: Ambos métodos encuentran ${filterCount} proyectos destacados`,
        recommendation: hasDifference
          ? 'El query de Firestore puede tener problemas. Use el método de filtrado local.'
          : 'Todo funciona correctamente.'
      }
    });

  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
    return NextResponse.json({
      success: false,
      error: `Error interno: ${error instanceof Error ? error.message : 'Error desconocido'}`
    }, { status: 500 });
  }
}