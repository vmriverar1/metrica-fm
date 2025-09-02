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

// POST - Reordenar items del megamenu con drag & drop
export async function POST(request: NextRequest) {
  try {
    const { itemIds } = await request.json();
    
    if (!itemIds || !Array.isArray(itemIds)) {
      return NextResponse.json(
        { error: 'El campo itemIds es requerido y debe ser un array' },
        { status: 400 }
      );
    }

    // Leer archivo actual
    const fileContent = await fs.readFile(MEGAMENU_JSON_PATH, 'utf8');
    const data: MegaMenuData = JSON.parse(fileContent);

    // Crear un mapa de items por id para acceso rápido
    const itemsMap = new Map();
    data.megamenu.items.forEach(item => {
      itemsMap.set(item.id, item);
    });

    // Validar que todos los IDs existen
    for (const id of itemIds) {
      if (!itemsMap.has(id)) {
        return NextResponse.json(
          { error: `Item con ID '${id}' no encontrado` },
          { status: 400 }
        );
      }
    }

    // Reordenar items según el nuevo orden
    const reorderedItems = itemIds.map((id: string, index: number) => ({
      ...itemsMap.get(id),
      order: index + 1,
      updated_at: new Date().toISOString()
    }));

    // Actualizar datos
    const updatedData = {
      ...data,
      megamenu: {
        ...data.megamenu,
        items: reorderedItems,
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
      items: reorderedItems,
      total_items: reorderedItems.length
    });
  } catch (error) {
    console.error('Error reordering megamenu items:', error);
    return NextResponse.json(
      { error: 'Error al reordenar items del megamenu' },
      { status: 500 }
    );
  }
}

// GET - Obtener orden actual de items
export async function GET() {
  try {
    const fileContent = await fs.readFile(MEGAMENU_JSON_PATH, 'utf8');
    const data: MegaMenuData = JSON.parse(fileContent);
    
    const itemOrder = data.megamenu.items
      .sort((a, b) => a.order - b.order)
      .map(item => ({
        id: item.id,
        label: item.label,
        order: item.order,
        enabled: item.enabled,
        type: item.type
      }));

    return NextResponse.json({
      items: itemOrder,
      total: itemOrder.length,
      last_updated: data.megamenu.settings.last_updated
    });
  } catch (error) {
    console.error('Error getting megamenu order:', error);
    return NextResponse.json(
      { error: 'Error al obtener orden del megamenu' },
      { status: 500 }
    );
  }
}