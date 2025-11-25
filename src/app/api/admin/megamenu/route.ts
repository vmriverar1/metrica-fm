import { NextRequest, NextResponse } from 'next/server';
import { FirestoreCore } from '@/lib/firestore/firestore-core';

const COLLECTIONS = {
  MEGAMENU: 'admin'
};

export async function GET(request: NextRequest) {
  try {
    // Intentar cargar desde Firestore
    const result = await FirestoreCore.getDocumentById(COLLECTIONS.MEGAMENU, 'megamenu');

    if (result.success && result.data) {
      return NextResponse.json({
        success: true,
        data: result.data,
        source: 'firestore'
      });
    }

    // Si no existe, devolver estructura por defecto
    const defaultMegamenu = {
      settings: {
        enabled: true,
        animation_duration: 300,
        hover_delay: 100,
        mobile_breakpoint: 'md',
        max_items: 10,
        last_updated: new Date().toISOString(),
        version: '1.0.0'
      },
      items: [
        {
          id: 'nosotros',
          label: 'Nosotros',
          type: 'megamenu',
          enabled: true,
          order: 1,
          submenu: {
            section1: {
              title: 'Acerca de Métrica',
              description: 'Configura menú desde Firestore: admin/megamenu'
            },
            links: [
              { title: 'Nuestra Historia', description: 'Conoce nuestro recorrido', href: '/about/historia', enabled: true },
              { title: 'Cultura', description: 'Nuestros valores y equipo', href: '/about/cultura', enabled: true },
              { title: 'Compromiso', description: 'Nuestro compromiso social', href: '/about/compromiso', enabled: true }
            ]
          }
        },
        { id: 'servicios', label: 'Servicios', type: 'simple', href: '/services', enabled: true, order: 2 },
        { id: 'portfolio', label: 'Portfolio', type: 'simple', href: '/portfolio', enabled: true, order: 3 },
        { id: 'blog', label: 'Blog', type: 'simple', href: '/blog', enabled: true, order: 4 },
        { id: 'contacto', label: 'Contacto', type: 'simple', href: '/contact', enabled: true, order: 5 }
      ],
      page_mappings: {},
      analytics: {
        total_clicks: 0,
        last_interaction: new Date().toISOString(),
        most_clicked_item: null,
        popular_links: []
      }
    };

    return NextResponse.json({
      success: true,
      data: defaultMegamenu,
      source: 'fallback'
    });
  } catch (error) {
    console.error('Error loading megamenu:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load megamenu data' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();

    // Guardar en Firestore
    const result = await FirestoreCore.createDocumentWithId(COLLECTIONS.MEGAMENU, 'megamenu', data, true);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Megamenu updated successfully'
      });
    } else {
      throw new Error(result.error || 'Failed to save megamenu');
    }
  } catch (error) {
    console.error('Error saving megamenu:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save megamenu data' },
      { status: 500 }
    );
  }
}
