import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const REPORTS_FILE_PATH = path.join(process.cwd(), 'private/data/reports.json');
const USERS_FILE_PATH = path.join(process.cwd(), 'private/data/users.json');
const SUBSCRIPTIONS_FILE_PATH = path.join(process.cwd(), 'private/data/subscriptions.json');

// Función helper para leer archivos JSON
async function readJSONFile(filePath: string) {
  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

// Función helper para escribir archivos JSON
async function writeJSONFile(filePath: string, data: any) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
    return false;
  }
}

// GET - Obtener reportes y templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'reports' | 'templates' | 'categories'
    
    const reportsData = await readJSONFile(REPORTS_FILE_PATH);
    if (!reportsData) {
      return NextResponse.json(
        { error: 'Error al cargar datos de reportes' },
        { status: 500 }
      );
    }

    // Convertir fechas a objetos Date para reportes generados
    const reportsWithDates = reportsData.generated_reports.map((report: any) => ({
      ...report,
      createdAt: new Date(report.createdAt),
      completedAt: report.completedAt ? new Date(report.completedAt) : null,
      lastDownloaded: report.lastDownloaded ? new Date(report.lastDownloaded) : null,
      parameters: {
        ...report.parameters,
        dateRange: {
          start: new Date(report.parameters.dateRange.start),
          end: new Date(report.parameters.dateRange.end)
        }
      }
    }));

    let result;
    switch (type) {
      case 'templates':
        result = {
          templates: reportsData.report_templates,
          categories: reportsData.categories
        };
        break;
      case 'categories':
        result = { categories: reportsData.categories };
        break;
      default:
        result = {
          reports: reportsWithDates,
          templates: reportsData.report_templates,
          categories: reportsData.categories,
          settings: reportsData.settings
        };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/admin/reports:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Generar nuevo reporte
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateId, title, parameters, userId } = body;

    if (!templateId || !title || !parameters) {
      return NextResponse.json(
        { error: 'Template ID, título y parámetros son requeridos' },
        { status: 400 }
      );
    }

    const reportsData = await readJSONFile(REPORTS_FILE_PATH);
    if (!reportsData) {
      return NextResponse.json(
        { error: 'Error al cargar datos de reportes' },
        { status: 500 }
      );
    }

    // Buscar el template
    const template = reportsData.report_templates.find((t: any) => t.id === templateId);
    if (!template) {
      return NextResponse.json(
        { error: 'Template no encontrado' },
        { status: 404 }
      );
    }

    // Simular generación de datos del reporte basado en el tipo
    const reportData = await generateReportData(templateId, parameters);

    // Crear nuevo reporte
    const newReport = {
      id: `report_${Date.now()}`,
      title,
      type: templateId,
      category: template.category,
      description: template.description,
      status: 'completed', // En producción sería 'generating' inicialmente
      createdBy: userId || 'user_001',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(), // En producción se establecería cuando termine
      fileUrl: `/reports/${templateId}_${Date.now()}.${parameters.format}`,
      fileSize: Math.round(Math.random() * 5 + 1), // MB simulado
      parameters: {
        ...parameters,
        dateRange: {
          start: new Date(parameters.dateRange.start).toISOString(),
          end: new Date(parameters.dateRange.end).toISOString()
        }
      },
      metrics: {
        totalPages: parameters.format === 'pdf' ? Math.floor(Math.random() * 20 + 5) : null,
        totalSheets: parameters.format === 'excel' ? Math.floor(Math.random() * 8 + 3) : null,
        executionTime: Math.round(Math.random() * 30 + 10), // segundos simulados
        dataPoints: reportData.totalDataPoints
      },
      downloadCount: 0,
      lastDownloaded: null
    };

    // Agregar a la lista de reportes
    reportsData.generated_reports.unshift(newReport);

    // Guardar cambios
    const success = await writeJSONFile(REPORTS_FILE_PATH, reportsData);
    if (!success) {
      return NextResponse.json(
        { error: 'Error al guardar reporte' },
        { status: 500 }
      );
    }

    // Convertir fechas para respuesta
    const responseReport = {
      ...newReport,
      createdAt: new Date(newReport.createdAt),
      completedAt: new Date(newReport.completedAt),
      parameters: {
        ...newReport.parameters,
        dateRange: {
          start: new Date(newReport.parameters.dateRange.start),
          end: new Date(newReport.parameters.dateRange.end)
        }
      }
    };

    return NextResponse.json(responseReport, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/reports:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Función para generar datos simulados del reporte
async function generateReportData(templateId: string, parameters: any) {
  // En una implementación real, aquí se generarían los datos reales
  // Por ahora simulamos la generación basada en el tipo de reporte
  
  let totalDataPoints = 0;
  
  switch (templateId) {
    case 'subscription_analytics':
      // Cargar datos de suscripciones
      const subsData = await readJSONFile(SUBSCRIPTIONS_FILE_PATH);
      if (subsData) {
        totalDataPoints = subsData.newsletter_subscriptions?.length || 0;
      }
      break;
      
    case 'sales_analytics':
      // Cargar datos de contactos/leads
      const contactsData = await readJSONFile(SUBSCRIPTIONS_FILE_PATH);
      if (contactsData) {
        totalDataPoints = contactsData.contact_submissions?.length || 0;
      }
      break;
      
    case 'user_activity':
      // Cargar datos de usuarios
      const usersData = await readJSONFile(USERS_FILE_PATH);
      if (usersData) {
        totalDataPoints = usersData.users?.length || 0;
      }
      break;
      
    default:
      totalDataPoints = Math.floor(Math.random() * 1000 + 500);
  }

  return {
    totalDataPoints,
    generatedAt: new Date().toISOString()
  };
}