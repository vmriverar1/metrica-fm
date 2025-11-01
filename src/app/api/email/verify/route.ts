import { NextResponse } from 'next/server';
import { EmailService } from '@/lib/email/email-service';

/**
 * Endpoint para verificar la conexión con Gmail
 */
export async function GET() {
  try {
    const isConnected = await EmailService.verifyConnection();

    if (isConnected) {
      return NextResponse.json({
        success: true,
        message: 'Conexión con Gmail verificada correctamente'
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'No se pudo conectar con Gmail. Verifica las credenciales.'
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error al verificar conexión'
      },
      { status: 500 }
    );
  }
}
