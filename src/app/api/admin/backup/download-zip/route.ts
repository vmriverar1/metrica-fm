import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import archiver from 'archiver';
import { Readable } from 'stream';

// Convertir archiver stream a Web Stream
function streamToWebStream(stream: NodeJS.ReadableStream): ReadableStream {
  return new ReadableStream({
    async start(controller) {
      stream.on('data', (chunk) => {
        controller.enqueue(new Uint8Array(chunk));
      });
      stream.on('end', () => {
        controller.close();
      });
      stream.on('error', (err) => {
        controller.error(err);
      });
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const { images } = await request.json();

    if (!images || !Array.isArray(images)) {
      return NextResponse.json(
        { success: false, error: 'No se proporcionaron imágenes' },
        { status: 400 }
      );
    }

    // Crear el archivo ZIP usando archiver
    const archive = archiver('zip', {
      zlib: { level: 5 } // Nivel de compresión medio
    });

    // Manejar errores del archive
    archive.on('error', (err) => {
      console.error('Archive error:', err);
      throw err;
    });

    // Agregar cada imagen al archivo ZIP manteniendo la estructura
    const publicDir = path.join(process.cwd(), 'public');

    for (const image of images) {
      try {
        const fullPath = path.join(publicDir, image.relativePath);
        const fileExists = await fs.access(fullPath).then(() => true).catch(() => false);

        if (fileExists) {
          // Leer el archivo
          const fileBuffer = await fs.readFile(fullPath);

          // Agregar al ZIP con su path relativo
          archive.append(fileBuffer, { name: image.relativePath });
        }
      } catch (error) {
        console.error(`Error adding ${image.relativePath} to archive:`, error);
        // Continuar con los demás archivos
      }
    }

    // Finalizar el archivo
    archive.finalize();

    // Generar nombre del archivo con timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const filename = `backup-images-${timestamp}.zip`;

    // Convertir el stream de Node.js a Web Stream
    const webStream = streamToWebStream(archive);

    // Devolver el archivo ZIP como stream
    return new NextResponse(webStream, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Error creating backup:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al crear el backup',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}