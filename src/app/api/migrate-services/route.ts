import { NextResponse } from 'next/server';
import { FirestoreCore } from '@/lib/firestore/firestore-core';

export async function POST() {
  try {
    console.log('🔄 Iniciando migración de servicios correcta...');

    // 1. Obtener el documento home
    const homeResult = await FirestoreCore.getDocumentById('pages', 'home');

    if (!homeResult.success || !homeResult.data) {
      return NextResponse.json({
        success: false,
        error: 'No se pudo obtener el documento home'
      }, { status: 404 });
    }

    const homeData = homeResult.data;

    // Verificar si services existe en home (podría ya estar eliminado)
    if (!homeData.services) {
      console.log('⚠️ Services no está en home, verificando el documento services existente...');

      // Obtener el documento services actual
      const existingServicesResult = await FirestoreCore.getDocumentById('pages', 'services');

      if (existingServicesResult.success && existingServicesResult.data) {
        // Ya existe el documento services, solo actualizar con la estructura correcta
        const updateData = {
          ...existingServicesResult.data,
          services: {
            section: {
              title: 'Nuestros Servicios',
              subtitle: 'Ofrecemos un portafolio de servicios especializados para cuidar la rentabilidad y el éxito de proyectos del sector construcción.'
            },
            services_list: [
              {
                id: 'gerencia-proyectos',
                title: 'Gerencia de Proyectos',
                description: 'Implementamos y gestionamos oficinas de proyectos para estandarizar procesos y maximizar la eficiencia en cada etapa del desarrollo.',
                image_url: '/images/proyectos/EDUCACIÓN/Cibertec/Copia de _ARI2738.webp',
                image_url_fallback: '/images/proyectos/EDUCACIÓN/Cibertec/Copia de _ARI2738.webp',
                icon_url: '/img/ico-service-2.png',
                is_main: false,
                width: '1/3',
                cta: {
                  text: 'Ver Más',
                  url: '/services'
                }
              },
              {
                id: 'supervision-obras',
                title: 'Supervisión de Obras',
                description: 'Vigilancia técnica y administrativa especializada para que la construcción se ejecute según los planos, especificaciones y normativas vigentes.',
                image_url: '/images/proyectos/EDUCACIÓN/Innova/Copia de _ARI3935-Pano.webp',
                image_url_fallback: '/images/proyectos/EDUCACIÓN/Innova/Copia de _ARI3935-Pano.webp',
                icon_url: '/img/ico-service-3.png',
                is_main: false,
                width: '1/3',
                cta: {
                  text: 'Ver Más',
                  url: '/services'
                }
              },
              {
                id: 'desarrollo-ingenieria',
                title: 'Desarrollo de Ingeniería',
                description: 'Servicios especializados de ingeniería para el desarrollo, optimización y mejora continua de proyectos de construcción e infraestructura.',
                image_url: '/images/proyectos/OFICINA/Oficinas INMA_/Copia de _ARI2408.webp',
                image_url_fallback: '/images/proyectos/OFICINA/Oficinas INMA_/Copia de _ARI2408.webp',
                icon_url: '/img/ico-service-4.png',
                is_main: false,
                width: '1/3',
                cta: {
                  text: 'Ver Más',
                  url: '/services'
                }
              }
            ]
          },
          updatedAt: new Date().toISOString()
        };

        const updateResult = await FirestoreCore.updateDocument('pages', 'services', updateData);

        return NextResponse.json({
          success: true,
          message: 'Documento services actualizado con la estructura correcta',
          data: {
            servicesUpdated: updateResult.success,
            servicesData: updateData.services
          }
        });
      }
    }

    // Si services existe en home, usar esos datos
    const servicesData = homeData.services || {
      section: {
        title: 'Nuestros Servicios',
        subtitle: 'Ofrecemos un portafolio de servicios especializados para cuidar la rentabilidad y el éxito de proyectos del sector construcción.'
      },
      services_list: []
    };

    console.log('📦 Datos de servicios a migrar:', servicesData);

    // 2. Actualizar o crear el documento services con la estructura correcta
    const servicesDocument = {
      services: servicesData,
      createdAt: new Date().toISOString(),
      migratedFrom: 'pages/home',
      migratedAt: new Date().toISOString()
    };

    // 3. Actualizar el documento services (que ya existe)
    const updateResult = await FirestoreCore.updateDocument('pages', 'services', servicesDocument);

    if (!updateResult.success) {
      return NextResponse.json({
        success: false,
        error: `Error al actualizar documento services: ${updateResult.message}`
      }, { status: 500 });
    }

    console.log('✅ Documento services actualizado exitosamente');

    // 4. Eliminar services del documento home si aún existe
    if (homeData.services) {
      const { services, ...homeDataWithoutServices } = homeData;
      const homeUpdateResult = await FirestoreCore.updateDocument('pages', 'home', homeDataWithoutServices);

      if (homeUpdateResult.success) {
        console.log('✅ Services eliminado del documento home');
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Migración completada exitosamente',
      data: {
        servicesUpdated: true,
        servicesData: servicesData
      }
    });

  } catch (error) {
    console.error('❌ Error en la migración de servicios:', error);

    return NextResponse.json({
      success: false,
      error: `Error interno: ${error instanceof Error ? error.message : 'Error desconocido'}`
    }, { status: 500 });
  }
}