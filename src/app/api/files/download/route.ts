/**
 * API Proxy para descargar archivos de Firebase Storage
 *
 * Este endpoint permite descargar archivos protegidos de Storage
 * sin exponer las URLs directas en emails u otros lugares.
 *
 * Uso: /api/files/download?path=applications/cv_123.pdf
 * O con token: /api/files/download?token=abc123
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStorage, getDownloadURL } from 'firebase-admin/storage';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Inicializar Firebase Admin si no está inicializado
const PROJECT_ID = 'metrica-fm';
const CLIENT_EMAIL = 'firebase-adminsdk-fbsvc@metrica-fm.iam.gserviceaccount.com';
const PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '';
const STORAGE_BUCKET = 'metrica-fm.firebasestorage.app';

function getFirebaseAdmin() {
  if (getApps().length === 0) {
    try {
      initializeApp({
        credential: cert({
          projectId: PROJECT_ID,
          clientEmail: CLIENT_EMAIL,
          privateKey: PRIVATE_KEY
        }),
        storageBucket: STORAGE_BUCKET
      });
    } catch (error) {
      console.error('Error initializing Firebase Admin:', error);
    }
  }
  return getStorage();
}

// Token simple para validar descargas (en producción usar JWT o similar)
function generateDownloadToken(path: string): string {
  const timestamp = Date.now();
  const data = `${path}:${timestamp}:metrica-secret`;
  // Simple hash - en producción usar crypto
  return Buffer.from(data).toString('base64url');
}

function validateDownloadToken(token: string, path: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    const parts = decoded.split(':');
    if (parts.length < 3) return false;

    const tokenPath = parts[0];
    const timestamp = parseInt(parts[1]);
    const secret = parts[2];

    // Validar path
    if (tokenPath !== path) return false;

    // Validar secret
    if (secret !== 'metrica-secret') return false;

    // Validar tiempo (24 horas)
    const maxAge = 24 * 60 * 60 * 1000;
    if (Date.now() - timestamp > maxAge) return false;

    return true;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get('path');
    const token = searchParams.get('token');

    if (!path) {
      return NextResponse.json(
        { error: 'Se requiere el parámetro path' },
        { status: 400 }
      );
    }

    // Validar que el path sea seguro (no permita path traversal)
    if (path.includes('..') || path.startsWith('/')) {
      return NextResponse.json(
        { error: 'Path inválido' },
        { status: 400 }
      );
    }

    // Validar token si se proporciona
    if (token && !validateDownloadToken(token, path)) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 401 }
      );
    }

    // Obtener el archivo de Storage
    const storage = getFirebaseAdmin();
    const bucket = storage.bucket(STORAGE_BUCKET);
    const file = bucket.file(path);

    // Verificar que el archivo existe
    const [exists] = await file.exists();
    if (!exists) {
      return NextResponse.json(
        { error: 'Archivo no encontrado' },
        { status: 404 }
      );
    }

    // Obtener metadata del archivo
    const [metadata] = await file.getMetadata();
    const contentType = metadata.contentType || 'application/octet-stream';
    const fileName = path.split('/').pop() || 'download';

    // Descargar el archivo
    const [fileBuffer] = await file.download();

    // Configurar headers para descarga
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
    headers.set('Content-Length', fileBuffer.length.toString());
    headers.set('Cache-Control', 'private, max-age=3600');

    return new NextResponse(fileBuffer, {
      status: 200,
      headers
    });

  } catch (error: any) {
    console.error('Error downloading file:', error);

    return NextResponse.json(
      {
        error: 'Error al descargar el archivo',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// Endpoint para generar token de descarga (uso interno)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path } = body;

    if (!path) {
      return NextResponse.json(
        { error: 'Se requiere el path del archivo' },
        { status: 400 }
      );
    }

    // Validar path
    if (path.includes('..') || path.startsWith('/')) {
      return NextResponse.json(
        { error: 'Path inválido' },
        { status: 400 }
      );
    }

    // Generar token
    const token = generateDownloadToken(path);

    // Generar URL de descarga
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://metricafm.com';
    const downloadUrl = `${baseUrl}/api/files/download?path=${encodeURIComponent(path)}&token=${token}`;

    return NextResponse.json({
      success: true,
      downloadUrl,
      token,
      expiresIn: '24h'
    });

  } catch (error: any) {
    console.error('Error generating download token:', error);

    return NextResponse.json(
      { error: 'Error al generar token de descarga' },
      { status: 500 }
    );
  }
}
