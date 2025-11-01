/**
 * API Route: GET /api/download/iso-certificate
 * Endpoint para descargar el certificado ISO 9001
 */

import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const ISO_CERT_DIR = path.join(process.cwd(), 'public', 'documents', 'iso');
const ISO_CERT_FILENAME = 'certificado-iso-9001-metrica-dip.pdf';

export async function GET(request: NextRequest) {
  try {
    const fullPath = path.join(ISO_CERT_DIR, ISO_CERT_FILENAME);

    // Verificar si el archivo existe
    if (!existsSync(fullPath)) {
      return NextResponse.json(
        { success: false, message: 'Certificado no disponible' },
        { status: 404 }
      );
    }

    // Leer el archivo
    const buffer = await readFile(fullPath);

    // Retornar el PDF con headers apropiados
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${ISO_CERT_FILENAME}"`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
      },
    });

  } catch (error) {
    console.error('[ISO-DOWNLOAD ERROR]:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error al descargar el certificado',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

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
