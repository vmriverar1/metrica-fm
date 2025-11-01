/**
 * API Route: /api/admin/media/images
 * Media Library - Gestión de imágenes del proyecto
 *
 * Sistema Dual: Lee imágenes de ambas fuentes:
 * - Local: /public/images/
 * - Firebase Storage: gs://bucket/images/
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, requirePermission } from '@/lib/admin/middleware/auth-middleware';
import { readdir, stat, unlink } from 'fs/promises';
import { join, extname, relative } from 'path';
import { listStorageFiles } from '@/lib/firebase-storage';

interface ImageInfo {
  id: string;
  name: string;
  path: string;
  url: string;
  size: number;
  type: string;
  lastModified: Date;
  dimensions?: {
    width: number;
    height: number;
  };
  source: 'local' | 'firebase';
  downloadURL?: string;
}

// Extensiones de imagen soportadas
const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];

// Función para obtener imágenes de Firebase Storage
async function getFirebaseImages(): Promise<ImageInfo[]> {
  console.log('[getFirebaseImages] Attempting to fetch Firebase images...');
  try {
    const result = await listStorageFiles('images/proyectos');

    if (!result.success || !result.files) {
      console.log('[getFirebaseImages] No files from Firebase or error:', result.error);
      return [];
    }

    // Convertir al formato ImageInfo
    return result.files.map(file => {
      const ext = extname(file.name).toLowerCase();

      return {
        id: `firebase-${Buffer.from(file.path).toString('base64')}`, // ID único con prefijo
        name: file.name,
        path: file.path,
        url: file.downloadURL,
        size: file.size,
        type: ext.substring(1) || 'unknown',
        lastModified: new Date(file.updated),
        source: 'firebase' as const,
        downloadURL: file.downloadURL
      };
    });
  } catch (error) {
    console.error('[getFirebaseImages] Error fetching from Firebase:', error);
    return [];
  }
}

// Función recursiva para explorar directorios locales
async function scanDirectory(dirPath: string, basePath: string = ''): Promise<ImageInfo[]> {
  const images: ImageInfo[] = [];

  try {
    const items = await readdir(dirPath);

    for (const item of items) {
      const fullPath = join(dirPath, item);
      const stats = await stat(fullPath);

      if (stats.isDirectory()) {
        // Explorar subdirectorio recursivamente
        const subImages = await scanDirectory(fullPath, join(basePath, item));
        images.push(...subImages);
      } else if (stats.isFile()) {
        const ext = extname(item).toLowerCase();

        if (SUPPORTED_EXTENSIONS.includes(ext)) {
          const relativePath = join(basePath, item);
          const urlPath = '/' + relativePath.replace(/\\/g, '/'); // Asegurar barras forward

          images.push({
            id: `local-${Buffer.from(relativePath).toString('base64')}`, // ID único con prefijo
            name: item,
            path: relativePath,
            url: urlPath,
            size: stats.size,
            type: ext.substring(1),
            lastModified: stats.mtime,
            source: 'local' // Marcar como imagen local
          });
        }
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not scan directory ${dirPath}:`, error);
  }

  return images;
}

// GET /api/admin/media/images - Listar todas las imágenes
export const GET = withAuth(
  async (request: NextRequest, context) => {
    try {
      const { searchParams } = new URL(request.url);
      const search = searchParams.get('search');
      const type = searchParams.get('type');
      const sortBy = searchParams.get('sort') || 'name';
      const order = searchParams.get('order') || 'asc';
      const folder = searchParams.get('folder') || '';

      // Directorio público base
      const publicDir = join(process.cwd(), 'public');
      let scanDir = publicDir;

      // Si se especifica una carpeta, escanear solo esa carpeta
      if (folder) {
        scanDir = join(publicDir, folder);
      }

      // Escanear imágenes locales
      let localImages = await scanDirectory(scanDir, folder);

      // Obtener imágenes de Firebase Storage
      let firebaseImages = await getFirebaseImages();

      // Combinar ambas fuentes
      let images = [...localImages, ...firebaseImages];

      console.log(`[media-api] Found ${localImages.length} local images and ${firebaseImages.length} Firebase images`);

      // Filtrar por búsqueda
      if (search) {
        const searchLower = search.toLowerCase();
        images = images.filter(img =>
          img.name.toLowerCase().includes(searchLower) ||
          img.path.toLowerCase().includes(searchLower)
        );
      }

      // Filtrar por tipo
      if (type && type !== 'all') {
        images = images.filter(img => img.type === type);
      }

      // Ordenar
      images.sort((a, b) => {
        let aValue: any, bValue: any;

        switch (sortBy) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'size':
            aValue = a.size;
            bValue = b.size;
            break;
          case 'date':
            aValue = a.lastModified.getTime();
            bValue = b.lastModified.getTime();
            break;
          case 'type':
            aValue = a.type;
            bValue = b.type;
            break;
          default:
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return order === 'desc' ? bValue - aValue : aValue - bValue;
        }

        const comparison = String(aValue).localeCompare(String(bValue));
        return order === 'desc' ? -comparison : comparison;
      });

      // Obtener estadísticas
      const stats = {
        total: images.length,
        totalSize: images.reduce((sum, img) => sum + img.size, 0),
        types: Object.entries(
          images.reduce((acc, img) => {
            acc[img.type] = (acc[img.type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        ).map(([type, count]) => ({ type, count }))
      };

      // Obtener directorios disponibles
      const directories = await scanDirectories(publicDir);

      return NextResponse.json({
        success: true,
        data: {
          images,
          stats,
          directories,
          pagination: {
            total: images.length,
            page: 1,
            limit: images.length
          },
          filters: {
            search,
            type,
            folder,
            sort: sortBy,
            order
          }
        }
      });

    } catch (error) {
      console.error('media-api', 'Failed to list images', error);

      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to retrieve images.'
        },
        { status: 500 }
      );
    }
  },
  requirePermission('media', 'read')()
);

// Función para obtener directorios
async function scanDirectories(basePath: string, currentPath: string = ''): Promise<string[]> {
  const directories: string[] = [];

  try {
    const fullPath = join(basePath, currentPath);
    const items = await readdir(fullPath);

    for (const item of items) {
      const itemPath = join(fullPath, item);
      const stats = await stat(itemPath);

      if (stats.isDirectory() && !item.startsWith('.')) {
        const relativePath = currentPath ? join(currentPath, item) : item;
        directories.push(relativePath.replace(/\\/g, '/'));

        // Recursivamente obtener subdirectorios (limitado a 3 niveles de profundidad)
        if (currentPath.split('/').length < 3) {
          const subDirs = await scanDirectories(basePath, relativePath);
          directories.push(...subDirs);
        }
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not scan directories in ${basePath}:`, error);
  }

  return directories;
}

// DELETE /api/admin/media/images - Eliminar imagen
export const DELETE = withAuth(
  async (request: NextRequest, context) => {
    try {
      const { searchParams } = new URL(request.url);
      const imageId = searchParams.get('id');
      const imagePath = searchParams.get('path');

      if (!imageId && !imagePath) {
        return NextResponse.json(
          {
            success: false,
            error: 'INVALID_INPUT',
            message: 'Image ID or path is required.'
          },
          { status: 400 }
        );
      }

      // Detectar fuente desde el ID
      const source = searchParams.get('source') as 'local' | 'firebase' | null;
      let imageSource = source;

      if (!imageSource && imageId) {
        imageSource = imageId.startsWith('firebase-') ? 'firebase' : 'local';
      }

      let targetPath: string;

      if (imageId) {
        // Decodificar ID a ruta (remover prefijo firebase- o local-)
        const cleanId = imageId.replace(/^(firebase|local)-/, '');
        targetPath = Buffer.from(cleanId, 'base64').toString();
      } else {
        targetPath = imagePath!;
      }

      // Eliminar según la fuente
      if (imageSource === 'firebase') {
        // Eliminar de Firebase Storage
        const { deleteFromStorage } = await import('@/lib/firebase-storage');
        const result = await deleteFromStorage(targetPath);

        if (!result.success) {
          return NextResponse.json(
            {
              success: false,
              error: 'DELETE_FAILED',
              message: result.error || 'Failed to delete from Firebase Storage'
            },
            { status: 500 }
          );
        }

        console.log(`Firebase image deleted: ${targetPath} by user ${context.user.id}`);

        return NextResponse.json({
          success: true,
          message: 'Image deleted successfully from Firebase Storage.',
          data: {
            path: targetPath,
            id: imageId,
            source: 'firebase'
          }
        });

      } else {
        // Eliminar imagen local (código original)
        const fullPath = join(process.cwd(), 'public', targetPath);

        // Verificar que el archivo existe y está en public
        const publicDir = join(process.cwd(), 'public');
        if (!fullPath.startsWith(publicDir)) {
          return NextResponse.json(
            {
              success: false,
              error: 'SECURITY_ERROR',
              message: 'Invalid file path.'
            },
            { status: 403 }
          );
        }

        // Verificar que es una imagen
        const ext = extname(targetPath).toLowerCase();
        if (!SUPPORTED_EXTENSIONS.includes(ext)) {
          return NextResponse.json(
            {
              success: false,
              error: 'INVALID_FILE_TYPE',
              message: 'File is not a supported image type.'
            },
            { status: 400 }
          );
        }

        // Eliminar archivo
        await unlink(fullPath);

        console.log(`Local image deleted: ${targetPath} by user ${context.user.id}`);

        return NextResponse.json({
          success: true,
          message: 'Image deleted successfully from local storage.',
          data: {
            path: targetPath,
            id: imageId,
            source: 'local'
          }
        });
      }

    } catch (error) {
      console.error('media-api', 'Failed to delete image', error);

      // Error específico si el archivo no existe
      if ((error as any).code === 'ENOENT') {
        return NextResponse.json(
          {
            success: false,
            error: 'FILE_NOT_FOUND',
            message: 'Image file not found.'
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to delete image.'
        },
        { status: 500 }
      );
    }
  },
  requirePermission('media', 'delete')()
);

// Método OPTIONS para CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'GET, DELETE, OPTIONS',
      'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}