/**
 * API Route: GET /api/admin/auth/me
 * Obtener información del usuario autenticado
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/admin/middleware/auth-middleware';
import { permissionsManager } from '@/lib/admin/auth/permissions-manager';
import { logger } from '@/lib/admin/core/logger';

export async function GET(request: NextRequest) {
  try {
    // Obtener contexto de autenticación
    const context = await getAuthContext(request);
    
    if (!context || !context.isAuthenticated) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_AUTHENTICATED',
          message: 'Authentication required.'
        },
        { status: 401 }
      );
    }

    const { user, session } = context;

    // Obtener permisos del usuario
    const permissions = permissionsManager.getUserPermissions(user);
    const resources = permissionsManager.getAvailableResources();

    // Preparar respuesta con información del usuario
    const userInfo = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      last_login: user.last_login,
      created_at: user.created_at,
      metadata: user.metadata || {}
    };

    const sessionInfo = {
      id: session.sessionId,
      created_at: session.created_at,
      expires_at: session.expires_at,
      ip_address: session.ip_address
    };

    return NextResponse.json({
      success: true,
      data: {
        user: userInfo,
        session: sessionInfo,
        permissions: permissions.map(p => ({
          resource: p.resource,
          action: p.action,
          description: p.description
        })),
        available_resources: Object.entries(resources).map(([key, resource]) => ({
          id: key,
          name: resource.name,
          description: resource.description,
          actions: resource.actions
        }))
      }
    });

  } catch (error) {
    await logger.error('auth-api', 'Me endpoint error', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Internal server error.'
      },
      { status: 500 }
    );
  }
}

// Método OPTIONS para CORS si es necesario
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'GET, OPTIONS',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}