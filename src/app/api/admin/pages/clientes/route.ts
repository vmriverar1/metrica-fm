import { NextRequest, NextResponse } from 'next/server';
import { PagesService } from '@/lib/firestore/pages-service';
import { FirestoreCore } from '@/lib/firestore/firestore-core';

export async function GET(req: NextRequest) {
  try {
    // Obtener datos de la página de clientes desde Firestore
    const data = await PagesService.getClientesPage();

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
            title: 'Nuestros Clientes | Métrica FM',
            description: 'Organismos públicos y empresas líderes que confían en nuestra experiencia'
          },
          hero: {
            title: 'Nuestros Clientes',
            subtitle: 'Empresas líderes que confían en nuestra experiencia'
          },
          clientes: {
            section: {
              title: 'Nuestros Clientes',
              subtitle: 'Empresas líderes que confían en nuestra experiencia'
            },
            logos: []
          },
          introduction: {
            title: 'Construyendo Confianza con Cada Proyecto',
            description: 'En Métrica FM, nos enorgullece trabajar con una amplia gama de clientes del sector público y privado.',
            stats: {
              total_clients: '50+',
              public_sector: '30+',
              private_sector: '20+',
              years_experience: '15+'
            }
          },
          testimonials: {
            title: 'Testimonios de Nuestros Clientes',
            subtitle: 'Escucha de primera mano lo que nuestros clientes opinan',
            testimonials_list: [],
            youtube_videos: [
              {
                id: 'testimonio_cliente_1',
                videoId: 'xBpz8Ret1Io',
                title: 'Testimonio - Nora Valencia, Gerente de BCP',
                description: 'Nora Valencia, Gerente de BCP, comparte su experiencia trabajando con Métrica FM en proyectos de infraestructura bancaria.',
                author: 'Nora Valencia',
                position: 'Gerente',
                company: 'BCP',
                sector: 'Financiero',
                order: 1
              },
              {
                id: 'testimonio_cliente_2',
                videoId: 'DkUC15ltTYs',
                title: 'Testimonio - Mario Cruz Galarza CEO ™',
                description: 'Mario Cruz Galarza, CEO, nos cuenta cómo Métrica FM contribuyó al éxito de sus proyectos empresariales.',
                author: 'Mario Cruz Galarza',
                position: 'CEO',
                company: 'Empresa',
                sector: 'Empresarial',
                order: 2
              },
              {
                id: 'testimonio_cliente_3',
                videoId: 'd3aYMlb5VKA',
                title: 'Álvaro Chinchayán - CEO Latam Logistic',
                description: 'Álvaro Chinchayán, CEO de Latam Logistic, destaca la calidad y profesionalismo en la dirección de proyectos logísticos.',
                author: 'Álvaro Chinchayán',
                position: 'CEO',
                company: 'Latam Logistic',
                sector: 'Logística',
                order: 3
              }
            ]
          },
          client_benefits: {
            title: 'Por Qué Nos Eligen',
            subtitle: 'Beneficios clave que ofrecemos',
            benefits: []
          },
          success_metrics: {
            title: 'Nuestro Impacto en Números',
            subtitle: 'Resultados que demuestran nuestro compromiso',
            metrics: []
          }
        }
      });
    }
  } catch (error) {
    console.error('Error fetching clientes data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch clientes data' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();

    // Guardar en Firestore usando FirestoreCore directamente
    const result = await FirestoreCore.createDocumentWithId(
      'pages',
      'clientes',
      {
        ...data,
        updatedAt: new Date()
      }
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Clientes page data saved successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to save clientes page data' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error saving clientes data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save clientes data' },
      { status: 500 }
    );
  }
}