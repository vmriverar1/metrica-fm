/**
 * FASE 6: API Route - Authentication Login
 * POST /api/auth/login
 * 
 * Endpoint para autenticación via API REST.
 * Permite integraciones externas y aplicaciones móviles.
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, twoFactorCode, rememberMe } = body;

    // Validar campos requeridos
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email y password son requeridos',
          code: 'MISSING_CREDENTIALS'
        },
        { status: 400 }
      );
    }

    // Intentar login
    const result = await AuthService.login({
      email,
      password,
      twoFactorCode,
      rememberMe
    });

    if (result.success && result.session) {
      // Login exitoso
      return NextResponse.json({
        success: true,
        data: {
          user: {
            id: result.session.user.id,
            email: result.session.user.email,
            firstName: result.session.user.firstName,
            lastName: result.session.user.lastName,
            role: result.session.user.role.name,
            department: result.session.user.department,
            permissions: result.session.user.permissions.map(p => ({
              resource: p.resource,
              action: p.action
            }))
          },
          session: {
            accessToken: result.session.accessToken,
            expiresAt: result.session.expiresAt.toISOString()
          }
        },
        message: 'Autenticación exitosa'
      });
    }

    if (result.requiresTwoFactor) {
      // Requiere 2FA
      return NextResponse.json({
        success: false,
        requiresTwoFactor: true,
        message: 'Código de verificación 2FA requerido',
        code: 'REQUIRES_2FA'
      }, { status: 202 }); // 202 Accepted - requiere acción adicional
    }

    // Error de autenticación
    return NextResponse.json({
      success: false,
      error: result.error || 'Credenciales inválidas',
      code: 'INVALID_CREDENTIALS'
    }, { status: 401 });

  } catch (error) {
    console.error('API Login Error:', error);
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}