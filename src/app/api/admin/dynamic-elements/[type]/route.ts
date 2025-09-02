import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { ElementType, ELEMENT_CONFIGS, BaseCardElement } from '@/types/dynamic-elements';

interface RouteParams {
  type: ElementType;
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

// GET - Obtener elementos de un tipo específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const { type } = await params;
    
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
    
    // Asegurar que todos los elementos tengan orden
    const elementsWithOrder = elements.map((element: any, index: number) => ({
      ...element,
      order: element.order || index + 1,
      enabled: element.enabled !== undefined ? element.enabled : true
    }));

    return NextResponse.json({
      success: true,
      data: elementsWithOrder,
      total: elementsWithOrder.length,
      type
    });
    
  } catch (error) {
    console.error('Error obteniendo elementos:', error);
    return NextResponse.json(
      { error: 'Error al obtener elementos' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo elemento
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const { type } = await params;
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
    
    // Crear nuevo elemento
    const newElement: BaseCardElement = {
      id: body.id || `${type}-${Date.now()}`,
      title: body.title,
      description: body.description,
      icon: body.icon,
      image: body.image,
      image_fallback: body.image_fallback,
      order: body.order || elements.length + 1,
      enabled: body.enabled !== undefined ? body.enabled : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...body // Incluir campos específicos del tipo
    };
    
    // Validar ID único
    if (elements.some((el: any) => el.id === newElement.id)) {
      return NextResponse.json(
        { error: 'Ya existe un elemento con ese ID', id: newElement.id },
        { status: 400 }
      );
    }
    
    // Añadir elemento
    elements.push(newElement);
    
    // Actualizar datos en el JSON
    setNestedData(data, dataPath, elements);
    
    // Guardar archivo
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    
    return NextResponse.json({
      success: true,
      data: newElement,
      message: `${config.displayName} creado exitosamente`
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creando elemento:', error);
    return NextResponse.json(
      { error: 'Error al crear elemento' },
      { status: 500 }
    );
  }
}

// PATCH - Reordenar elementos
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const { type } = await params;
    const body = await request.json();
    
    if (!ELEMENT_CONFIGS[type]) {
      return NextResponse.json(
        { error: 'Tipo de elemento no soportado', type },
        { status: 400 }
      );
    }

    const { action, elements: reorderedElements } = body;
    
    if (action === 'reorder' && !reorderedElements) {
      return NextResponse.json(
        { error: 'Elementos requeridos para reordenar' },
        { status: 400 }
      );
    }
    
    const filePath = getJsonFilePath(type);
    const fileContent = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    
    const dataPath = getDataPath(type);
    
    if (action === 'reorder') {
      // Actualizar orden de elementos
      const updatedElements = reorderedElements.map((element: any, index: number) => ({
        ...element,
        order: index + 1,
        updated_at: new Date().toISOString()
      }));
      
      setNestedData(data, dataPath, updatedElements);
      
      // Guardar archivo
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
      
      return NextResponse.json({
        success: true,
        data: updatedElements,
        message: 'Elementos reordenados exitosamente'
      });
    }
    
    return NextResponse.json(
      { error: 'Acción no soportada' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Error actualizando elementos:', error);
    return NextResponse.json(
      { error: 'Error al actualizar elementos' },
      { status: 500 }
    );
  }
}