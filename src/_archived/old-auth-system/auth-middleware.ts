/**
 * FASE 5: Middleware de Autenticación para API Routes
 * 
 * Middleware para validar tokens de autenticación en rutas API
 */

import { NextRequest } from 'next/server';
import { AuthService } from './auth-service-mock';

export interface AuthenticatedRequest extends NextRequest {
  user?: any;
}

export async function validateAuthToken(request: NextRequest): Promise<{
  success: boolean;
  user?: any;
  error?: string;
}> {
  try {
    // Obtener token del header Authorization
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        error: 'Authentication token required.'
      };
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Validar token mock (en producción sería JWT validation)
    if (token !== 'mock-token') {
      return {
        success: false,
        error: 'Invalid authentication token.'
      };
    }

    // En un sistema real, aquí validaríamos el JWT y extraeríamos el user
    // Para mock, usamos un usuario fijo
    const user = {
      id: '1',
      email: 'admin@metrica.pe',
      firstName: 'Admin',
      lastName: 'Usuario',
      role: {
        id: 'admin',
        name: 'Administrador',
        level: 1
      }
    };

    return {
      success: true,
      user
    };
  } catch (error) {
    return {
      success: false,
      error: 'Authentication failed.'
    };
  }
}

export async function withAuth(
  handler: (request: NextRequest, params?: any) => Promise<Response>
) {
  return async (request: NextRequest, params?: any): Promise<Response> => {
    const authResult = await validateAuthToken(request);
    
    if (!authResult.success) {
      return new Response(
        JSON.stringify({
          error: authResult.error,
          code: 'UNAUTHORIZED'
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Agregar user al request (simulado)
    (request as any).user = authResult.user;
    
    return handler(request, params);
  };
}

export function createAuthenticatedResponse(data: any, status: number = 200): Response {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    }
  );
}

export function createErrorResponse(error: string, status: number = 400): Response {
  return new Response(
    JSON.stringify({
      error,
      timestamp: new Date().toISOString()
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}