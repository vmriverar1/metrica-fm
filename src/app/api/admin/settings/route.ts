import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const SETTINGS_FILE_PATH = path.join(process.cwd(), 'private/data/settings.json');

// Función helper para leer el archivo de configuraciones
async function readSettingsFile() {
  try {
    const fileContents = await fs.readFile(SETTINGS_FILE_PATH, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading settings file:', error);
    return {
      general: {},
      authentication: {},
      email: {},
      database: {},
      security: {},
      features: {},
      analytics: {},
      integrations: {},
      performance: {},
      notifications_settings: {},
      content: {},
      ui_preferences: {},
      system: {},
      backup: {}
    };
  }
}

// Función helper para escribir el archivo de configuraciones
async function writeSettingsFile(data: any) {
  try {
    await fs.writeFile(SETTINGS_FILE_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing settings file:', error);
    return false;
  }
}

// GET - Obtener todas las configuraciones
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    const settings = await readSettingsFile();
    
    // Si se solicita una categoría específica
    if (category && settings[category]) {
      return NextResponse.json({ [category]: settings[category] });
    }
    
    // Devolver todas las configuraciones
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error in GET /api/admin/settings:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    );
  }
}

// POST - Crear o actualizar configuración
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, settings: newSettings } = body;

    if (!category) {
      return NextResponse.json(
        { error: 'Categoría requerida' },
        { status: 400 }
      );
    }

    const currentSettings = await readSettingsFile();
    
    // Actualizar la categoría específica
    currentSettings[category] = {
      ...currentSettings[category],
      ...newSettings
    };

    const success = await writeSettingsFile(currentSettings);
    if (!success) {
      return NextResponse.json(
        { error: 'Error al guardar configuraciones' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Configuraciones actualizadas correctamente',
      [category]: currentSettings[category]
    });
  } catch (error) {
    console.error('Error in POST /api/admin/settings:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar configuraciones completas
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    const success = await writeSettingsFile(body);
    if (!success) {
      return NextResponse.json(
        { error: 'Error al actualizar configuraciones' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Todas las configuraciones actualizadas correctamente'
    });
  } catch (error) {
    console.error('Error in PUT /api/admin/settings:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}