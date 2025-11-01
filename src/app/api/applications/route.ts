/**
 * API Route - Applications Management
 * GET/POST /api/applications
 *
 * Endpoints para gestión de aplicaciones laborales via API REST.
 *
 * NOTA: Autenticación simplificada. Para sistema completo de roles/permisos,
 * integrar con Firebase Auth Admin SDK y Firestore.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ApplicationsService } from '@/lib/applications-service';
import { ApplicationFilters, ApplicationStatus } from '@/types/careers';

/**
 * Verificación básica de autenticación
 * TODO: Integrar con Firebase Auth Admin SDK para validación de tokens real
 */
async function verifyAuth(request: NextRequest) {
  const authorization = request.headers.get('authorization');

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return null;
  }

  const token = authorization.split(' ')[1];

  // Validación básica del token
  // En producción, usar Firebase Admin SDK: getAuth().verifyIdToken(token)
  if (!token || token.length < 10) {
    return null;
  }

  // Retornar usuario básico
  return {
    id: 'auth-user',
    email: 'authenticated@user.com',
    displayName: 'Authenticated User'
  };
}

// GET - Obtener aplicaciones con filtros
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

    // TODO: Agregar verificación de permisos si se implementa sistema de roles

    const { searchParams } = new URL(request.url);

    // Parsear filtros desde query params
    const filters: ApplicationFilters & { limit?: number; offset?: number } = {};

    // Status filter
    const statusParam = searchParams.get('status');
    if (statusParam) {
      filters.status = statusParam.split(',') as ApplicationStatus[];
    }

    // Priority filter
    const priorityParam = searchParams.get('priority');
    if (priorityParam) {
      filters.priority = priorityParam.split(',') as any;
    }

    // Source filter
    const sourceParam = searchParams.get('source');
    if (sourceParam) {
      filters.source = sourceParam.split(',') as any;
    }

    // Job ID filter
    const jobId = searchParams.get('jobId');
    if (jobId) {
      filters.jobId = jobId;
    }

    // Date range filter
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    if (fromDate && toDate) {
      filters.dateRange = {
        from: new Date(fromDate),
        to: new Date(toDate)
      };
    }

    // Score range filter
    const minScore = searchParams.get('minScore');
    const maxScore = searchParams.get('maxScore');
    if (minScore && maxScore) {
      filters.score = {
        min: parseInt(minScore),
        max: parseInt(maxScore)
      };
    }

    // Search query
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      filters.searchQuery = searchQuery;
    }

    // Flagged filter
    const flagged = searchParams.get('flagged');
    if (flagged) {
      filters.flagged = flagged === 'true';
    }

    // Assigned to filter
    const assignedTo = searchParams.get('assignedTo');
    if (assignedTo) {
      filters.assignedTo = assignedTo;
    }

    // Pagination
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    if (limit) {
      filters.limit = parseInt(limit);
    }
    if (offset) {
      filters.offset = parseInt(offset);
    }

    // Obtener aplicaciones
    const applications = await ApplicationsService.getApplications(filters);

    // Respuesta con metadatos de paginación
    return NextResponse.json({
      success: true,
      data: applications,
      meta: {
        total: applications.length,
        limit: filters.limit || applications.length,
        offset: filters.offset || 0,
        hasMore: applications.length === (filters.limit || 0)
      },
      filters: filters
    });

  } catch (error) {
    console.error('API Applications GET Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

// POST - Crear nueva aplicación (para integraciones externas)
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

    // TODO: Agregar verificación de permisos si se implementa sistema de roles

    const body = await request.json();

    // Validar campos requeridos
    const requiredFields = ['jobId', 'candidateInfo', 'source'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Campos requeridos faltantes: ${missingFields.join(', ')}`,
        code: 'MISSING_FIELDS'
      }, { status: 400 });
    }

    // Validar estructura de candidateInfo
    const requiredCandidateFields = ['firstName', 'lastName', 'email', 'phone'];
    const missingCandidateFields = requiredCandidateFields.filter(
      field => !body.candidateInfo[field]
    );

    if (missingCandidateFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Campos de candidato requeridos: ${missingCandidateFields.join(', ')}`,
        code: 'MISSING_CANDIDATE_FIELDS'
      }, { status: 400 });
    }

    // Crear aplicación (simulado - en producción se crearía en BD)
    const newApplication = {
      id: `app-${Date.now()}`,
      jobId: body.jobId,
      jobTitle: body.jobTitle || 'Posición Externa',
      candidateInfo: {
        ...body.candidateInfo,
        location: body.candidateInfo.location || { city: 'Lima', country: 'Perú' },
        availability: body.candidateInfo.availability || {
          startDate: new Date(),
          noticePeriod: 30
        }
      },
      documents: body.documents || [],
      responses: body.responses || [],
      status: 'submitted' as ApplicationStatus,
      priority: body.priority || 'normal',
      source: body.source,
      submittedAt: new Date(),
      tags: body.tags || [],
      flagged: false,
      activities: [{
        id: `act-${Date.now()}`,
        type: 'status-change' as const,
        description: 'Aplicación creada via API',
        performedBy: 'API System',
        performedAt: new Date()
      }],
      interviews: [],
      internalNotes: [],
      viewCount: 0,
      timeInStage: 0
    };

    console.log('📝 Nueva aplicación creada via API:', newApplication.id);

    return NextResponse.json({
      success: true,
      data: newApplication,
      message: 'Aplicación creada exitosamente'
    }, { status: 201 });

  } catch (error) {
    console.error('API Applications POST Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

// PATCH - Actualizar aplicación
export async function PATCH(request: NextRequest) {
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

    // TODO: Agregar verificación de permisos si se implementa sistema de roles

    const body = await request.json();
    const { id, status, priority, assignedTo, notes } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID de aplicación requerido',
        code: 'MISSING_ID'
      }, { status: 400 });
    }

    // Actualizar aplicación
    let success = false;
    if (status) {
      success = await ApplicationsService.updateApplicationStatus(
        id,
        status,
        user.displayName || user.email || 'Usuario',
        notes
      );
    }

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Aplicación actualizada exitosamente'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'No se pudo actualizar la aplicación',
        code: 'UPDATE_FAILED'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('API Applications PATCH Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

// Método OPTIONS para CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}