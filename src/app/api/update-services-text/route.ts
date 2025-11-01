import { NextResponse } from 'next/server';
import { FirestoreCore } from '@/lib/firestore/firestore-core';

export async function POST() {
  try {
    console.log('🔄 Actualizando título y descripción de servicios...');

    // Obtener el documento services actual
    const result = await FirestoreCore.getDocumentById('pages', 'services');

    if (!result.success || !result.data) {
      return NextResponse.json({
        success: false,
        error: 'No se encontró el documento services'
      }, { status: 404 });
    }

    // Actualizar con el mismo título y descripción que usa el home
    const updateData = {
      ...result.data,
      services: {
        ...result.data.services,
        section: {
          title: 'Nuestros Servicios',
          subtitle: 'Ofrecemos un portafolio de servicios especializados para cuidar la rentabilidad y el éxito de proyectos del sector construcción.'
        }
      },
      updatedAt: new Date().toISOString()
    };

    const updateResult = await FirestoreCore.updateDocument('pages', 'services', updateData);

    if (!updateResult.success) {
      return NextResponse.json({
        success: false,
        error: `Error al actualizar documento: ${updateResult.message}`
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Título y descripción actualizados exitosamente',
      data: {
        section: updateData.services.section
      }
    });

  } catch (error) {
    console.error('❌ Error actualizando servicios:', error);
    return NextResponse.json({
      success: false,
      error: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`
    }, { status: 500 });
  }
}