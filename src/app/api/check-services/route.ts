import { NextResponse } from 'next/server';
import { FirestoreCore } from '@/lib/firestore/firestore-core';

export async function GET() {
  try {
    console.log('🔍 Verificando documento services...');

    // Obtener el documento services
    const result = await FirestoreCore.getDocumentById('pages', 'services');

    if (!result.success || !result.data) {
      return NextResponse.json({
        success: false,
        error: 'No se encontró el documento services',
        result
      }, { status: 404 });
    }

    // Verificar estructura
    const hasServices = 'services' in result.data;
    const servicesStructure = hasServices ? {
      hasSection: result.data.services?.section ? true : false,
      hasServicesList: result.data.services?.services_list ? true : false,
      servicesListCount: result.data.services?.services_list?.length || 0,
      sectionData: result.data.services?.section,
      firstService: result.data.services?.services_list?.[0]
    } : null;

    return NextResponse.json({
      success: true,
      documentKeys: Object.keys(result.data),
      hasServicesKey: hasServices,
      servicesStructure,
      fullData: result.data
    });

  } catch (error) {
    console.error('❌ Error verificando services:', error);
    return NextResponse.json({
      success: false,
      error: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`
    }, { status: 500 });
  }
}