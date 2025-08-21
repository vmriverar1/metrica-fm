/**
 * API Route: GET /api/admin/auth/verify
 * Verificar magic link y crear sesión
 */

import { NextRequest, NextResponse } from 'next/server';
import { authManager } from '@/lib/admin/auth/auth-manager';
import { logger } from '@/lib/admin/core/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    // Validar token
    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_TOKEN',
          message: 'Magic link token is required.'
        },
        { status: 400 }
      );
    }

    // Obtener información del cliente
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded 
      ? forwarded.split(',')[0].trim() 
      : request.headers.get('x-real-ip') || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    // Verificar magic link
    const result = await authManager.verifyMagicLink(token, ip, userAgent);

    if (result.success && result.data) {
      // Crear respuesta con cookie httpOnly
      const response = NextResponse.json(result);
      
      // Configurar cookie de autenticación
      response.cookies.set('auth-token', result.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60, // 24 horas
        path: '/'
      });

      return response;
    }

    return NextResponse.json(result, { 
      status: result.success ? 200 : 400 
    });

  } catch (error) {
    await logger.error('auth-api', 'Verify endpoint error', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Internal server error. Please try again later.'
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
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}