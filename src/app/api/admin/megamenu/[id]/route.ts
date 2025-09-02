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

// GET - Obtener un item específico del megamenu
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    const fileContent = await fs.readFile(MEGAMENU_JSON_PATH, 'utf8');
    const data: MegaMenuData = JSON.parse(fileContent);
    
    const item = data.megamenu.items.find(item => item.id === id);
    
    if (!item) {
      return NextResponse.json(
        { error: 'Item del megamenu no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error reading megamenu item:', error);
    return NextResponse.json(
      { error: 'Error al cargar item del megamenu' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar un item específico del megamenu
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    
    // Validación básica
    if (!body.label) {
      return NextResponse.json(
        { error: 'El campo label es requerido' },
        { status: 400 }
      );
    }

    // Leer archivo actual
    const fileContent = await fs.readFile(MEGAMENU_JSON_PATH, 'utf8');
    const data: MegaMenuData = JSON.parse(fileContent);

    // Encontrar y actualizar el item
    const itemIndex = data.megamenu.items.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Item del megamenu no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar item manteniendo el id y orden original
    const updatedItem = {
      ...data.megamenu.items[itemIndex],
      ...body,
      id, // Mantener el id original
      order: data.megamenu.items[itemIndex].order, // Mantener orden original
      updated_at: new Date().toISOString()
    };

    data.megamenu.items[itemIndex] = updatedItem;

    // Actualizar settings
    data.megamenu.settings.last_updated = new Date().toISOString();

    // Guardar archivo
    await fs.writeFile(MEGAMENU_JSON_PATH, JSON.stringify(data, null, 2), 'utf8');

    return NextResponse.json({ 
      success: true, 
      message: 'Item del megamenu actualizado correctamente',
      item: updatedItem
    });
  } catch (error) {
    console.error('Error updating megamenu item:', error);
    return NextResponse.json(
      { error: 'Error al actualizar item del megamenu' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un item específico del megamenu
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    // Leer archivo actual
    const fileContent = await fs.readFile(MEGAMENU_JSON_PATH, 'utf8');
    const data: MegaMenuData = JSON.parse(fileContent);

    // Encontrar el item
    const itemIndex = data.megamenu.items.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Item del megamenu no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar el item
    const deletedItem = data.megamenu.items.splice(itemIndex, 1)[0];

    // Reordenar los items restantes
    data.megamenu.items = data.megamenu.items.map((item, index) => ({
      ...item,
      order: index + 1,
      updated_at: new Date().toISOString()
    }));

    // Actualizar settings
    data.megamenu.settings.last_updated = new Date().toISOString();

    // Guardar archivo
    await fs.writeFile(MEGAMENU_JSON_PATH, JSON.stringify(data, null, 2), 'utf8');

    return NextResponse.json({ 
      success: true, 
      message: 'Item del megamenu eliminado correctamente',
      deleted_item: deletedItem,
      remaining_items: data.megamenu.items.length
    });
  } catch (error) {
    console.error('Error deleting megamenu item:', error);
    return NextResponse.json(
      { error: 'Error al eliminar item del megamenu' },
      { status: 500 }
    );
  }
}