/**
 * API Route: POST /api/admin/auth/logout
 * Cerrar sesión del usuario
 */

import { NextRequest, NextResponse } from 'next/server';
import { authManager } from '@/lib/admin/auth/auth-manager';
import { getAuthContext } from '@/lib/admin/middleware/auth-middleware';
import { logger } from '@/lib/admin/core/logger';

export async function POST(request: NextRequest) {
  try {
    // Obtener contexto de autenticación
    const context = await getAuthContext(request);
    
    if (!context || !context.isAuthenticated) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_AUTHENTICATED',
          message: 'No active session found.'
        },
        { status: 401 }
      );
    }

    // Cerrar sesión
    const result = await authManager.logout(context.session.sessionId);

    // Crear respuesta y limpiar cookie
    const response = NextResponse.json(result);
    
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expira inmediatamente
      path: '/'
    });

    return response;

  } catch (error) {
    await logger.error('auth-api', 'Logout endpoint error', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Internal server error during logout.'
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
      'Allow': 'POST, OPTIONS',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}