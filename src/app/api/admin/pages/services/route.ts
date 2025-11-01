import { NextRequest, NextResponse } from 'next/server';
import { PagesService } from '@/lib/firestore/pages-service';
import { FirestoreCore } from '@/lib/firestore/firestore-core';

export async function GET(req: NextRequest) {
  try {
    // Obtener datos de la página de servicios desde Firestore
    const data = await PagesService.getServicesPage();

    if (data) {
      return NextResponse.json({
        success: true,
        data
      });
    } else {
      // Si no hay datos, devolver estructura vacía
      return NextResponse.json({
        success: true,
        data: {
          page: {
            title: 'Servicios de Dirección Integral de Proyectos | Métrica FM',
            description: 'Transformamos ideas en impacto con nuestros servicios especializados'
          },
          hero: {
            title: 'Supervisamos y gerenciamos proyectos',
            subtitle: '10+ años liderando proyectos de infraestructura que transforman el Perú',
            background_type: 'image',
            background_image: 'https://metricadip.com/images/proyectos/RETAIL/REMODELACION TD6/317906044_611374014122511_6533312105092675192_n.webp',
            overlay_opacity: 0.5,
            buttons: {
              primary: {
                text: 'Ver Proyectos Emblemáticos',
                href: '/portfolio'
              }
            }
          },
          services: {
            section: {
              title: 'Nuestros Servicios',
              subtitle: 'Ofrecemos servicios especializados para el sector construcción'
            },
            main_service: {
              title: 'Dirección Integral de Proyectos',
              description: 'Gestión completa de proyectos de construcción e infraestructura desde la concepción hasta la entrega final.',
              image_url: '/images/services/direccion-integral.jpg',
              icon_url: '/icons/direccion-integral.svg',
              cta: {
                text: 'Ver más detalles',
                url: '/services/direccion-integral'
              }
            },
            secondary_services: [
              {
                id: 'consultoria',
                title: 'Consultoría Estratégica',
                description: 'Asesoramiento especializado en planificación y gestión de proyectos de infraestructura.',
                image_url: '/images/services/consultoria.jpg',
                icon_url: '/icons/consultoria.svg',
                width: '1/3',
                cta: {
                  text: 'Conocer más',
                  url: '/services/consultoria'
                }
              },
              {
                id: 'supervision',
                title: 'Supervisión Técnica',
                description: 'Control y seguimiento técnico de proyectos de construcción con los más altos estándares.',
                image_url: '/images/services/supervision.jpg',
                icon_url: '/icons/supervision.svg',
                width: '1/3',
                cta: {
                  text: 'Ver detalles',
                  url: '/services/supervision'
                }
              }
            ],
            services_list: []
          },
          value_propositions: {
            title: 'Por Qué Elegir Métrica FM'
          },
          project_showcase: {
            title: 'Proyectos Emblemáticos',
            subtitle: 'Casos de éxito que demuestran nuestra experiencia'
          },
          contact_form: {
            title: 'Hablemos de tu Proyecto',
            subtitle: 'Obtén una consulta especializada para tu proyecto',
            why_choose_us: {
              title: '¿Por qué Métrica FM?',
              benefits: [
                {
                  id: 'experiencia',
                  text: '10+ años de experiencia',
                  icon: 'CheckCircle2'
                },
                {
                  id: 'certificacion',
                  text: 'ISO 9001 Certificado',
                  icon: 'CheckCircle2'
                },
                {
                  id: 'proyectos',
                  text: '300+ proyectos exitosos',
                  icon: 'CheckCircle2'
                },
                {
                  id: 'satisfaccion',
                  text: '99% satisfacción del cliente',
                  icon: 'CheckCircle2'
                },
                {
                  id: 'respuesta',
                  text: 'Respuesta en 48 horas',
                  icon: 'CheckCircle2'
                }
              ]
            }
          }
        }
      });
    }
  } catch (error) {
    console.error('Error fetching services data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch services data' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();

    // Primero obtener el documento actual para preservar campos que no se están editando
    const currentDoc = await FirestoreCore.getDocumentById('pages', 'services');

    // Combinar datos existentes con los nuevos (los nuevos sobrescriben los existentes)
    const mergedData = currentDoc.success && currentDoc.data
      ? { ...currentDoc.data, ...data, updatedAt: new Date() }
      : { ...data, updatedAt: new Date() };

    // Actualizar el documento (updateDocument preserva campos no modificados)
    const result = await FirestoreCore.updateDocument(
      'pages',
      'services',
      mergedData
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Services page data saved successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to save services page data' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error saving services data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save services data' },
      { status: 500 }
    );
  }
}