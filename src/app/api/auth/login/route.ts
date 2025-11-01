/**
 * API Route - Authentication Login
 * POST /api/auth/login
 *
 * Endpoint para autenticación via API REST.
 *
 * NOTA: El sistema actual de autenticación usa Google Sign-In únicamente.
 * Este endpoint retorna información sobre el método de autenticación disponible.
 *
 * Para autenticación via email/password, se requiere:
 * 1. Configurar Firebase Authentication con proveedores de email/password
 * 2. Implementar validación de tokens con Firebase Admin SDK
 * 3. Agregar sistema de roles/permisos en Firestore
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Información sobre el sistema de autenticación actual
    return NextResponse.json(
      {
        success: false,
        error: 'Este endpoint no está disponible con el sistema de autenticación actual',
        code: 'AUTH_METHOD_NOT_SUPPORTED',
        message: 'La autenticación se realiza exclusivamente mediante Google Sign-In en el panel de administración',
        availableMethods: ['google-sign-in'],
        documentation: {
          adminPanel: '/admin/login',
          method: 'Google Sign-In',
          note: 'Solo usuarios autorizados previamente en Firestore pueden acceder'
        }
      },
      { status: 501 } // 501 Not Implemented
    );

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