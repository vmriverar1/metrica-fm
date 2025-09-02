import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { ElementType, ELEMENT_CONFIGS, BaseCardElement } from '@/types/dynamic-elements';

interface RouteParams {
  type: ElementType;
  id: string;
}

// Función para obtener la ruta del archivo JSON según el tipo
function getJsonFilePath(type: ElementType): string {
  const config = ELEMENT_CONFIGS[type];
  if (!config) {
    throw new Error(`Tipo de elemento no soportado: ${type}`);
  }
  
  // Todos los elementos están en home.json por ahora
  return path.join(process.cwd(), 'public/json/pages/home.json');
}

// Función para obtener la ruta de los datos dentro del JSON
function getDataPath(type: ElementType): string {
  const config = ELEMENT_CONFIGS[type];
  return config.jsonPath;
}

// Función para obtener y establecer datos en el JSON usando la ruta
function getNestedData(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

function setNestedData(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
}

// GET - Obtener elemento específico por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const { type, id } = await params;
    
    if (!ELEMENT_CONFIGS[type]) {
      return NextResponse.json(
        { error: 'Tipo de elemento no soportado', type },
        { status: 400 }
      );
    }

    const filePath = getJsonFilePath(type);
    const fileContent = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    
    const dataPath = getDataPath(type);
    const elements = getNestedData(data, dataPath) || [];
    
    const element = elements.find((el: any) => el.id === id);
    
    if (!element) {
      return NextResponse.json(
        { error: 'Elemento no encontrado', id },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: element
    });
    
  } catch (error) {
    console.error('Error obteniendo elemento:', error);
    return NextResponse.json(
      { error: 'Error al obtener elemento' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar elemento completo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const { type, id } = await params;
    const body = await request.json();
    
    if (!ELEMENT_CONFIGS[type]) {
      return NextResponse.json(
        { error: 'Tipo de elemento no soportado', type },
        { status: 400 }
      );
    }

    const config = ELEMENT_CONFIGS[type];
    
    // Validar campos requeridos
    const requiredFields = config.fields.filter(field => field.required);
    for (const field of requiredFields) {
      if (!body[field.key] && body[field.key] !== 0) {
        return NextResponse.json(
          { error: `Campo requerido faltante: ${field.label}`, field: field.key },
          { status: 400 }
        );
      }
    }

    const filePath = getJsonFilePath(type);
    const fileContent = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    
    const dataPath = getDataPath(type);
    const elements = getNestedData(data, dataPath) || [];
    
    const elementIndex = elements.findIndex((el: any) => el.id === id);
    
    if (elementIndex === -1) {
      return NextResponse.json(
        { error: 'Elemento no encontrado', id },
        { status: 404 }
      );
    }
    
    const existingElement = elements[elementIndex];
    
    // Actualizar elemento manteniendo campos del sistema
    const updatedElement = {
      ...existingElement,
      ...body,
      id: existingElement.id, // Mantener ID original
      created_at: existingElement.created_at, // Mantener fecha de creación
      updated_at: new Date().toISOString()
    };
    
    // Actualizar en el array
    elements[elementIndex] = updatedElement;
    
    // Actualizar datos en el JSON
    setNestedData(data, dataPath, elements);
    
    // Guardar archivo
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    
    return NextResponse.json({
      success: true,
      data: updatedElement,
      message: `${config.displayName} actualizado exitosamente`
    });
    
  } catch (error) {
    console.error('Error actualizando elemento:', error);
    return NextResponse.json(
      { error: 'Error al actualizar elemento' },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar elemento parcial
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const { type, id } = await params;
    const body = await request.json();
    
    if (!ELEMENT_CONFIGS[type]) {
      return NextResponse.json(
        { error: 'Tipo de elemento no soportado', type },
        { status: 400 }
      );
    }

    const config = ELEMENT_CONFIGS[type];

    const filePath = getJsonFilePath(type);
    const fileContent = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    
    const dataPath = getDataPath(type);
    const elements = getNestedData(data, dataPath) || [];
    
    const elementIndex = elements.findIndex((el: any) => el.id === id);
    
    if (elementIndex === -1) {
      return NextResponse.json(
        { error: 'Elemento no encontrado', id },
        { status: 404 }
      );
    }
    
    const existingElement = elements[elementIndex];
    
    // Actualizar solo los campos proporcionados
    const updatedElement = {
      ...existingElement,
      ...body,
      id: existingElement.id, // Mantener ID original
      created_at: existingElement.created_at, // Mantener fecha de creación
      updated_at: new Date().toISOString()
    };
    
    // Actualizar en el array
    elements[elementIndex] = updatedElement;
    
    // Actualizar datos en el JSON
    setNestedData(data, dataPath, elements);
    
    // Guardar archivo
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    
    return NextResponse.json({
      success: true,
      data: updatedElement,
      message: `${config.displayName} actualizado exitosamente`
    });
    
  } catch (error) {
    console.error('Error actualizando elemento:', error);
    return NextResponse.json(
      { error: 'Error al actualizar elemento' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar elemento
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const { type, id } = await params;
    
    if (!ELEMENT_CONFIGS[type]) {
      return NextResponse.json(
        { error: 'Tipo de elemento no soportado', type },
        { status: 400 }
      );
    }

    const config = ELEMENT_CONFIGS[type];

    const filePath = getJsonFilePath(type);
    const fileContent = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    
    const dataPath = getDataPath(type);
    const elements = getNestedData(data, dataPath) || [];
    
    const elementIndex = elements.findIndex((el: any) => el.id === id);
    
    if (elementIndex === -1) {
      return NextResponse.json(
        { error: 'Elemento no encontrado', id },
        { status: 404 }
      );
    }
    
    const deletedElement = elements[elementIndex];
    
    // Eliminar elemento
    elements.splice(elementIndex, 1);
    
    // Reordenar elementos restantes
    const reorderedElements = elements.map((element: any, index: number) => ({
      ...element,
      order: index + 1
    }));
    
    // Actualizar datos en el JSON
    setNestedData(data, dataPath, reorderedElements);
    
    // Guardar archivo
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    
    return NextResponse.json({
      success: true,
      data: deletedElement,
      message: `${config.displayName} eliminado exitosamente`
    });
    
  } catch (error) {
    console.error('Error eliminando elemento:', error);
    return NextResponse.json(
      { error: 'Error al eliminar elemento' },
      { status: 500 }
    );
  }
}