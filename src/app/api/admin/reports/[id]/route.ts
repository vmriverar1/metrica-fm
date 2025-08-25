import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const REPORTS_FILE_PATH = path.join(process.cwd(), 'private/data/reports.json');

// Función helper para leer el archivo de reportes
async function readReportsFile() {
  try {
    const fileContents = await fs.readFile(REPORTS_FILE_PATH, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading reports file:', error);
    return { generated_reports: [], report_templates: [], categories: [] };
  }
}

// Función helper para escribir el archivo de reportes
async function writeReportsFile(data: any) {
  try {
    await fs.writeFile(REPORTS_FILE_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing reports file:', error);
    return false;
  }
}

// GET - Obtener reporte específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const data = await readReportsFile();
    const report = data.generated_reports.find((r: any) => r.id === (await params).id);

    if (!report) {
      return NextResponse.json(
        { error: 'Reporte no encontrado' },
        { status: 404 }
      );
    }

    // Convertir fechas
    const reportWithDates = {
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
    };

    return NextResponse.json(reportWithDates);
  } catch (error) {
    console.error('Error in GET /api/admin/reports/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar reporte específico
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const data = await readReportsFile();

    const reportIndex = data.generated_reports.findIndex((r: any) => r.id === (await params).id);
    if (reportIndex === -1) {
      return NextResponse.json(
        { error: 'Reporte no encontrado' },
        { status: 404 }
      );
    }

    const existingReport = data.generated_reports[reportIndex];

    // Manejar descarga del reporte
    if (body.action === 'download') {
      const updatedReport = {
        ...existingReport,
        downloadCount: existingReport.downloadCount + 1,
        lastDownloaded: new Date().toISOString()
      };

      data.generated_reports[reportIndex] = updatedReport;

      const success = await writeReportsFile(data);
      if (!success) {
        return NextResponse.json(
          { error: 'Error al actualizar reporte' },
          { status: 500 }
        );
      }

      // Simular descarga del archivo
      return NextResponse.json({
        message: 'Descarga iniciada',
        downloadUrl: updatedReport.fileUrl,
        downloadCount: updatedReport.downloadCount
      });
    }

    // Actualización general del reporte
    const updatedReport = {
      ...existingReport,
      ...body,
      updatedAt: new Date().toISOString()
    };

    data.generated_reports[reportIndex] = updatedReport;

    const success = await writeReportsFile(data);
    if (!success) {
      return NextResponse.json(
        { error: 'Error al actualizar reporte' },
        { status: 500 }
      );
    }

    // Convertir fechas para respuesta
    const responseReport = {
      ...updatedReport,
      createdAt: new Date(updatedReport.createdAt),
      completedAt: updatedReport.completedAt ? new Date(updatedReport.completedAt) : null,
      lastDownloaded: updatedReport.lastDownloaded ? new Date(updatedReport.lastDownloaded) : null,
      parameters: {
        ...updatedReport.parameters,
        dateRange: {
          start: new Date(updatedReport.parameters.dateRange.start),
          end: new Date(updatedReport.parameters.dateRange.end)
        }
      }
    };

    return NextResponse.json(responseReport);
  } catch (error) {
    console.error('Error in PATCH /api/admin/reports/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar reporte específico
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const data = await readReportsFile();

    const reportIndex = data.generated_reports.findIndex((r: any) => r.id === (await params).id);
    if (reportIndex === -1) {
      return NextResponse.json(
        { error: 'Reporte no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar reporte
    data.generated_reports.splice(reportIndex, 1);

    const success = await writeReportsFile(data);
    if (!success) {
      return NextResponse.json(
        { error: 'Error al eliminar reporte' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Reporte eliminado correctamente' });
  } catch (error) {
    console.error('Error in DELETE /api/admin/reports/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}