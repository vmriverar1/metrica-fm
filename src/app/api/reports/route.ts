/**
 * FASE 6: API Route - Reports Generation
 * GET /api/reports
 * 
 * Endpoint para generación de reportes en diferentes formatos.
 * Incluye reportes de reclutamiento, usuarios y sistema.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ApplicationsService } from '@/lib/applications-service';
import { AuthService } from '@/lib/auth-service';

// Tipos para reportes
interface ReportRequest {
  type: 'recruitment' | 'applications' | 'performance' | 'users' | 'system';
  format: 'json' | 'csv' | 'pdf' | 'xlsx';
  dateRange?: {
    from: string;
    to: string;
  };
  filters?: Record<string, any>;
}

// Middleware de autenticación
async function verifyAuth(request: NextRequest) {
  const authorization = request.headers.get('authorization');
  
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return null;
  }

  const user = AuthService.getCurrentUser();
  return user;
}

// GET - Generar reportes
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Token de autorización requerido',
          code: 'UNAUTHORIZED'
        },
        { status: 401 }
      );
    }

    // Verificar permisos
    if (!AuthService.canAccess('reports', 'read')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No tienes permisos para generar reportes',
          code: 'FORBIDDEN'
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    const reportType = searchParams.get('type') || 'recruitment';
    const format = searchParams.get('format') || 'json';
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    // Validar parámetros
    const validTypes = ['recruitment', 'applications', 'performance', 'users', 'system'];
    const validFormats = ['json', 'csv', 'pdf', 'xlsx'];
    
    if (!validTypes.includes(reportType)) {
      return NextResponse.json({
        success: false,
        error: `Tipo de reporte inválido. Tipos válidos: ${validTypes.join(', ')}`,
        code: 'INVALID_TYPE'
      }, { status: 400 });
    }

    if (!validFormats.includes(format)) {
      return NextResponse.json({
        success: false,
        error: `Formato inválido. Formatos válidos: ${validFormats.join(', ')}`,
        code: 'INVALID_FORMAT'
      }, { status: 400 });
    }

    // Generar reporte según el tipo
    let reportData: any;
    let filename: string;

    switch (reportType) {
      case 'recruitment':
        reportData = await generateRecruitmentReport(fromDate, toDate);
        filename = `recruitment-report-${new Date().toISOString().split('T')[0]}`;
        break;
        
      case 'applications':
        reportData = await generateApplicationsReport(fromDate, toDate);
        filename = `applications-report-${new Date().toISOString().split('T')[0]}`;
        break;
        
      case 'performance':
        reportData = await generatePerformanceReport(fromDate, toDate);
        filename = `performance-report-${new Date().toISOString().split('T')[0]}`;
        break;
        
      case 'users':
        reportData = await generateUsersReport();
        filename = `users-report-${new Date().toISOString().split('T')[0]}`;
        break;
        
      case 'system':
        reportData = await generateSystemReport();
        filename = `system-report-${new Date().toISOString().split('T')[0]}`;
        break;
        
      default:
        reportData = { error: 'Tipo de reporte no implementado' };
        filename = 'error-report';
    }

    // Formatear respuesta según el formato solicitado
    if (format === 'json') {
      return NextResponse.json({
        success: true,
        data: reportData,
        meta: {
          type: reportType,
          format,
          generatedAt: new Date().toISOString(),
          generatedBy: `${user.firstName} ${user.lastName}`,
          filename: `${filename}.json`
        }
      });
    }

    if (format === 'csv') {
      const csvContent = convertToCSV(reportData);
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}.csv"`,
        },
      });
    }

    // Para PDF y XLSX, devolver JSON con indicación de procesamiento
    return NextResponse.json({
      success: true,
      message: `Reporte ${format.toUpperCase()} en procesamiento`,
      data: {
        reportId: `rpt-${Date.now()}`,
        status: 'processing',
        estimatedTime: '2-3 minutos',
        downloadUrl: `/api/reports/download?id=rpt-${Date.now()}&format=${format}`
      },
      meta: {
        type: reportType,
        format,
        filename: `${filename}.${format}`
      }
    });

  } catch (error) {
    console.error('API Reports Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

// POST - Programar reporte
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Token de autorización requerido',
          code: 'UNAUTHORIZED'
        },
        { status: 401 }
      );
    }

    if (!AuthService.canAccess('reports', 'create')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No tienes permisos para programar reportes',
          code: 'FORBIDDEN'
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { type, format, schedule, recipients, filters } = body;

    // Validar campos requeridos
    if (!type || !format || !schedule) {
      return NextResponse.json({
        success: false,
        error: 'Campos requeridos: type, format, schedule',
        code: 'MISSING_FIELDS'
      }, { status: 400 });
    }

    // Crear tarea de reporte programado (simulado)
    const scheduledReport = {
      id: `sched-${Date.now()}`,
      type,
      format,
      schedule, // 'daily', 'weekly', 'monthly'
      recipients: recipients || [user.email],
      filters: filters || {},
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      status: 'active',
      nextRun: calculateNextRun(schedule)
    };

    console.log('📅 Reporte programado creado:', scheduledReport.id);

    return NextResponse.json({
      success: true,
      data: scheduledReport,
      message: 'Reporte programado exitosamente'
    }, { status: 201 });

  } catch (error) {
    console.error('API Reports POST Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

// Funciones auxiliares para generar reportes

async function generateRecruitmentReport(fromDate?: string | null, toDate?: string | null) {
  const stats = await ApplicationsService.getRecruitmentStats();
  const applications = await ApplicationsService.getApplications({
    dateRange: fromDate && toDate ? {
      from: new Date(fromDate),
      to: new Date(toDate)
    } : undefined
  });

  return {
    summary: {
      totalApplications: stats.applications.total,
      thisMonth: stats.applications.thisMonth,
      growth: stats.applications.growth,
      averageTimeToHire: stats.performance.averageTimeToHire,
      overallConversion: stats.performance.conversionRates.overallConversion
    },
    applicationsByStatus: stats.applications.byStatus,
    applicationsBySource: stats.applications.bySource,
    conversionRates: stats.performance.conversionRates,
    topRecruiters: stats.performance.topRecruiters,
    topSources: stats.candidates.topSources,
    trends: stats.trends,
    applications: applications.slice(0, 100) // Limitar para reportes
  };
}

async function generateApplicationsReport(fromDate?: string | null, toDate?: string | null) {
  const applications = await ApplicationsService.getApplications({
    dateRange: fromDate && toDate ? {
      from: new Date(fromDate),
      to: new Date(toDate)
    } : undefined
  });

  return {
    applications: applications.map(app => ({
      id: app.id,
      candidateName: `${app.candidateInfo.firstName} ${app.candidateInfo.lastName}`,
      candidateEmail: app.candidateInfo.email,
      jobTitle: app.jobTitle,
      status: app.status,
      priority: app.priority,
      source: app.source,
      score: app.score?.overall || null,
      submittedAt: app.submittedAt,
      timeInStage: app.timeInStage,
      assignedTo: app.assignedTo?.recruiterName || null
    })),
    summary: {
      total: applications.length,
      byStatus: applications.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      averageScore: applications
        .filter(app => app.score)
        .reduce((sum, app) => sum + (app.score?.overall || 0), 0) / 
        applications.filter(app => app.score).length || 0
    }
  };
}

async function generatePerformanceReport(fromDate?: string | null, toDate?: string | null) {
  const stats = await ApplicationsService.getRecruitmentStats();
  
  return {
    conversionRates: stats.performance.conversionRates,
    averageTimeToHire: stats.performance.averageTimeToHire,
    timeInStageBreakdown: stats.performance.averageTimeInStage,
    recruiterPerformance: stats.performance.topRecruiters,
    sourceEffectiveness: stats.candidates.topSources,
    trends: stats.trends.applicationsOverTime,
    recommendations: [
      'Optimizar tiempo en etapa de revisión inicial',
      'Mejorar conversión de entrevistas a contrataciones',
      'Fortalecer fuentes de candidatos de mayor calidad'
    ]
  };
}

async function generateUsersReport() {
  const users = await AuthService.getUsers();
  
  return {
    users: users.map(user => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role.name,
      department: user.department,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      twoFactorEnabled: user.twoFactorEnabled
    })),
    summary: {
      total: users.length,
      active: users.filter(u => u.isActive).length,
      inactive: users.filter(u => !u.isActive).length,
      byRole: users.reduce((acc, user) => {
        acc[user.role.name] = (acc[user.role.name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      with2FA: users.filter(u => u.twoFactorEnabled).length
    }
  };
}

async function generateSystemReport() {
  const systemInfo = await ApplicationsService.getSystemInfo();
  const loginAttempts = AuthService.getLoginAttempts();
  
  return {
    systemHealth: {
      directusAvailable: systemInfo.directusAvailable,
      dataSource: systemInfo.dataSource,
      version: systemInfo.version,
      lastCheck: systemInfo.lastCheck,
      uptime: '99.9%' // Simulado
    },
    security: {
      totalLoginAttempts: loginAttempts.length,
      successfulLogins: loginAttempts.filter(a => a.success).length,
      failedLogins: loginAttempts.filter(a => !a.success).length,
      uniqueIPs: [...new Set(loginAttempts.map(a => a.ipAddress))].length,
      recentFailures: loginAttempts
        .filter(a => !a.success)
        .slice(-10)
        .map(a => ({
          email: a.email,
          timestamp: a.timestamp,
          reason: a.failureReason,
          ipAddress: a.ipAddress
        }))
    },
    performance: {
      averageResponseTime: '125ms',
      requestsPerMinute: 45,
      errorRate: '0.1%',
      cacheHitRate: '89%'
    }
  };
}

// Convertir datos a CSV
function convertToCSV(data: any): string {
  if (!Array.isArray(data) && data.applications) {
    data = data.applications;
  }
  
  if (!Array.isArray(data)) {
    return 'Error: No se pueden convertir los datos a CSV';
  }

  if (data.length === 0) {
    return 'Sin datos para exportar';
  }

  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => 
    Object.values(row).map(value => 
      typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
    ).join(',')
  );

  return [headers, ...rows].join('\n');
}

// Calcular próxima ejecución para reportes programados
function calculateNextRun(schedule: string): string {
  const now = new Date();
  
  switch (schedule) {
    case 'daily':
      now.setDate(now.getDate() + 1);
      now.setHours(9, 0, 0, 0); // 9 AM
      break;
    case 'weekly':
      now.setDate(now.getDate() + 7);
      now.setHours(9, 0, 0, 0);
      break;
    case 'monthly':
      now.setMonth(now.getMonth() + 1, 1);
      now.setHours(9, 0, 0, 0);
      break;
    default:
      now.setHours(now.getHours() + 1);
  }
  
  return now.toISOString();
}

// Método OPTIONS para CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}