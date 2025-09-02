import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const MEGAMENU_JSON_PATH = path.join(process.cwd(), 'public/json/admin/megamenu.json');

interface MegaMenuData {
  megamenu: {
    settings: any;
    items: any[];
    page_mappings: Record<string, any>;
    analytics: any;
  };
}

// GET - Obtener configuración completa del megamenu
export async function GET() {
  try {
    const fileContent = await fs.readFile(MEGAMENU_JSON_PATH, 'utf8');
    const data: MegaMenuData = JSON.parse(fileContent);
    
    return NextResponse.json(data.megamenu);
  } catch (error) {
    console.error('Error reading megamenu file:', error);
    return NextResponse.json(
      { error: 'Error al cargar configuración del megamenu' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo item del megamenu o actualizar configuración completa
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Leer archivo actual
    const fileContent = await fs.readFile(MEGAMENU_JSON_PATH, 'utf8');
    const data: MegaMenuData = JSON.parse(fileContent);

    // Si el body tiene un campo 'id', es un nuevo item
    if (body.id && !body.items) {
      // Validar campos requeridos para nuevo item
      if (!body.label) {
        return NextResponse.json(
          { error: 'El campo label es requerido' },
          { status: 400 }
        );
      }

      // Verificar que el ID no exista
      if (data.megamenu.items.some(item => item.id === body.id)) {
        return NextResponse.json(
          { error: 'Ya existe un menú con ese ID' },
          { status: 400 }
        );
      }

      // Agregar nuevo item
      const newItem = {
        ...body,
        order: body.order || (data.megamenu.items.length + 1),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      data.megamenu.items.push(newItem);
      data.megamenu.settings.last_updated = new Date().toISOString();

      // Guardar archivo
      await fs.writeFile(MEGAMENU_JSON_PATH, JSON.stringify(data, null, 2), 'utf8');

      return NextResponse.json({ 
        success: true, 
        message: 'Menú creado correctamente',
        item: newItem
      });
    } else {
      // Actualización completa de configuración (comportamiento original)
      if (!body.items || !Array.isArray(body.items)) {
        return NextResponse.json(
          { error: 'El campo items es requerido y debe ser un array' },
          { status: 400 }
        );
      }

      const updatedData = {
        ...data,
        megamenu: {
          ...data.megamenu,
          ...body,
          settings: {
            ...data.megamenu.settings,
            ...body.settings,
            last_updated: new Date().toISOString()
          }
        }
      };

      await fs.writeFile(MEGAMENU_JSON_PATH, JSON.stringify(updatedData, null, 2), 'utf8');

      return NextResponse.json({ 
        success: true, 
        message: 'Configuración del megamenu actualizada correctamente',
        data: updatedData.megamenu
      });
    }
  } catch (error) {
    console.error('Error updating megamenu:', error);
    return NextResponse.json(
      { error: 'Error al procesar solicitud del megamenu' },
      { status: 500 }
    );
  }
}

// PUT - Reordenar items del megamenu
export async function PUT(request: NextRequest) {
  try {
    const { items } = await request.json();
    
    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'El campo items es requerido y debe ser un array' },
        { status: 400 }
      );
    }

    // Leer archivo actual
    const fileContent = await fs.readFile(MEGAMENU_JSON_PATH, 'utf8');
    const data: MegaMenuData = JSON.parse(fileContent);

    // Actualizar orden de items
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1,
      updated_at: new Date().toISOString()
    }));

    const updatedData = {
      ...data,
      megamenu: {
        ...data.megamenu,
        items: updatedItems,
        settings: {
          ...data.megamenu.settings,
          last_updated: new Date().toISOString()
        }
      }
    };

    // Guardar archivo
    await fs.writeFile(MEGAMENU_JSON_PATH, JSON.stringify(updatedData, null, 2), 'utf8');

    return NextResponse.json({ 
      success: true, 
      message: 'Orden del megamenu actualizado correctamente',
      items: updatedItems
    });
  } catch (error) {
    console.error('Error reordering megamenu items:', error);
    return NextResponse.json(
      { error: 'Error al reordenar items del megamenu' },
      { status: 500 }
    );
  }
}

// PATCH - Tracking de clics y actualizaciones parciales
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle click tracking
    if (body.action === 'track_click' && body.item_id) {
      const fileContent = await fs.readFile(MEGAMENU_JSON_PATH, 'utf8');
      const data: MegaMenuData = JSON.parse(fileContent);
      
      // Update analytics
      data.megamenu.analytics.total_clicks = (data.megamenu.analytics.total_clicks || 0) + 1;
      data.megamenu.analytics.last_interaction = new Date().toISOString();
      
      // Update item click count
      const item = data.megamenu.items.find((item: any) => item.id === body.item_id);
      if (item) {
        item.click_count = (item.click_count || 0) + 1;
      }
      
      // Update popular links
      if (!data.megamenu.analytics.popular_links) {
        data.megamenu.analytics.popular_links = [];
      }
      
      const popularLink = data.megamenu.analytics.popular_links.find((link: any) => link.id === body.item_id);
      if (popularLink) {
        popularLink.clicks++;
      } else {
        data.megamenu.analytics.popular_links.push({
          id: body.item_id,
          clicks: 1,
          label: item?.label || body.item_id
        });
      }
      
      // Sort popular links by clicks
      data.megamenu.analytics.popular_links.sort((a: any, b: any) => b.clicks - a.clicks);
      data.megamenu.analytics.most_clicked_item = data.megamenu.analytics.popular_links[0]?.id || null;
      
      await fs.writeFile(MEGAMENU_JSON_PATH, JSON.stringify(data, null, 2), 'utf8');
      
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
  } catch (error) {
    console.error('Error in PATCH megamenu:', error);
    return NextResponse.json(
      { error: 'Error al actualizar datos del megamenu' },
      { status: 500 }
    );
  }
}