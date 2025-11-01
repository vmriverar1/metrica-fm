/**
 * API Route: POST /api/upload/iso-certificate
 * Endpoint específico para subida del certificado ISO 9001
 * - Sube el PDF del certificado
 * - Elimina el PDF anterior si existe
 * - Actualiza la referencia en Firestore
 */

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const ISO_CERT_DIR = path.join(process.cwd(), 'public', 'documents', 'iso');
const ISO_CERT_FILENAME = 'certificado-iso-9001-metrica-dip.pdf';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    console.log('[ISO-UPLOAD] Starting ISO certificate upload...');

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No se proporcionó archivo' },
        { status: 400 }
      );
    }

    // Validar que sea un PDF
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      return NextResponse.json(
        { success: false, message: 'El archivo debe ser un PDF' },
        { status: 400 }
      );
    }

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: `El archivo es muy grande (máximo ${MAX_FILE_SIZE / 1024 / 1024}MB)`
        },
        { status: 400 }
      );
    }

    // Crear directorio si no existe
    if (!existsSync(ISO_CERT_DIR)) {
      const { mkdir } = await import('fs/promises');
      await mkdir(ISO_CERT_DIR, { recursive: true });
      console.log(`[ISO-UPLOAD] Created directory: ${ISO_CERT_DIR}`);
    }

    const fullPath = path.join(ISO_CERT_DIR, ISO_CERT_FILENAME);

    // Eliminar archivo anterior si existe
    if (existsSync(fullPath)) {
      try {
        await unlink(fullPath);
        console.log('[ISO-UPLOAD] Deleted previous certificate');
      } catch (error) {
        console.warn('[ISO-UPLOAD] Warning: Could not delete previous certificate:', error);
      }
    }

    // Guardar nuevo archivo
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(fullPath, buffer);

    // URL pública del archivo
    const publicUrl = `/documents/iso/${ISO_CERT_FILENAME}`;

    // Actualizar referencia en Firestore (página ISO)
    try {
      const isoDocRef = doc(db, 'pages', 'iso');
      const isoDoc = await getDoc(isoDocRef);

      if (isoDoc.exists()) {
        await updateDoc(isoDocRef, {
          'hero.certificate_details.pdf_url': publicUrl,
          'hero.certificate_details.updated_at': new Date().toISOString()
        });
        console.log('[ISO-UPLOAD] Updated Firestore reference');
      }
    } catch (firestoreError) {
      console.error('[ISO-UPLOAD] Error updating Firestore:', firestoreError);
      // No fallar si Firestore falla, el archivo ya está subido
    }

    console.log(`[ISO-UPLOAD] Certificate uploaded successfully: ${publicUrl}`);

    return NextResponse.json({
      success: true,
      message: 'Certificado ISO subido exitosamente',
      url: publicUrl,
      size: buffer.length,
      uploadedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('[ISO-UPLOAD ERROR]:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error interno del servidor durante la subida',
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
      'Allow': 'POST, OPTIONS',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
