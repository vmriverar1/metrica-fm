import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface ImageInfo {
  path: string;
  relativePath: string;
  size: number;
  modified: string;
  created: string;
  type: string;
}

// Función recursiva para escanear directorios
async function scanDirectory(dir: string, baseDir: string, images: ImageInfo[] = []): Promise<ImageInfo[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Ignorar node_modules, .next, .git, etc.
        const ignoreDirs = ['node_modules', '.next', '.git', 'cache', '.cache'];
        if (!ignoreDirs.includes(entry.name)) {
          await scanDirectory(fullPath, baseDir, images);
        }
      } else if (entry.isFile()) {
        // Verificar si es una imagen
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico', '.bmp', '.tiff', '.avif'];
        const ext = path.extname(entry.name).toLowerCase();

        if (imageExtensions.includes(ext)) {
          const stats = await fs.stat(fullPath);
          const relativePath = path.relative(baseDir, fullPath);

          images.push({
            path: fullPath,
            relativePath: relativePath,
            size: stats.size,
            modified: stats.mtime.toISOString(),
            created: stats.birthtime.toISOString(),
            type: ext.substring(1)
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error);
  }

  return images;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Directorio public
    const publicDir = path.join(process.cwd(), 'public');

    // Escanear todas las imágenes
    let images = await scanDirectory(publicDir, publicDir);

    // Filtrar por fecha si se proporciona
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : new Date('1970-01-01');
      const end = endDate ? new Date(endDate) : new Date();
      end.setHours(23, 59, 59, 999); // Incluir todo el día final

      images = images.filter(img => {
        const modified = new Date(img.modified);
        return modified >= start && modified <= end;
      });
    }

    // Ordenar por path para mejor organización
    images.sort((a, b) => a.relativePath.localeCompare(b.relativePath));

    // Calcular estadísticas
    const stats = {
      totalImages: images.length,
      totalSize: images.reduce((sum, img) => sum + img.size, 0),
      byType: images.reduce((acc, img) => {
        acc[img.type] = (acc[img.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byFolder: images.reduce((acc, img) => {
        const folder = path.dirname(img.relativePath).split(path.sep)[0] || 'root';
        acc[folder] = (acc[folder] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    return NextResponse.json({
      success: true,
      images,
      stats,
      scannedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error scanning images:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al escanear imágenes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}