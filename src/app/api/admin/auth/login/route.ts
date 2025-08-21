/**
 * API Route: POST /api/admin/auth/login
 * Solicitar magic link para autenticación
 */

import { NextRequest, NextResponse } from 'next/server';
import { authManager } from '@/lib/admin/auth/auth-manager';
import { logger } from '@/lib/admin/core/logger';

interface LoginRequest {
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email } = body;

    // Validar entrada
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_INPUT',
          message: 'Email is required and must be a valid string.'
        },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_EMAIL',
          message: 'Please provide a valid email address.'
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

    // Solicitar magic link
    const result = await authManager.requestMagicLink(email, ip, userAgent);

    return NextResponse.json(result, { 
      status: result.success ? 200 : 400 
    });

  } catch (error) {
    await logger.error('auth-api', 'Login endpoint error', error);
    
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
      'Allow': 'POST, OPTIONS',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}