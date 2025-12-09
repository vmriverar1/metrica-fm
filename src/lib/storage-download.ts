/**
 * Helper para generar URLs de descarga seguras para archivos de Storage
 *
 * En lugar de enviar URLs directas de Firebase Storage (que están bloqueadas),
 * genera URLs que pasan por nuestro proxy API.
 */

/**
 * Genera un token de descarga para un archivo
 */
export function generateDownloadToken(path: string): string {
  const timestamp = Date.now();
  const data = `${path}:${timestamp}:metrica-secret`;
  return Buffer.from(data).toString('base64url');
}

/**
 * Genera una URL de descarga segura para un archivo de Storage
 *
 * @param storagePath - Path del archivo en Storage (ej: 'applications/cv_123.pdf')
 * @param baseUrl - URL base del sitio (default: https://metricafm.com)
 * @returns URL de descarga segura
 *
 * @example
 * // En el servicio de email:
 * const cvUrl = generateSecureDownloadUrl('applications/cv_123.pdf');
 * // Resultado: https://metricafm.com/api/files/download?path=applications/cv_123.pdf&token=...
 */
export function generateSecureDownloadUrl(
  storagePath: string,
  baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || 'https://metricafm.com'
): string {
  // Limpiar el path (remover prefijos de Storage si existen)
  let cleanPath = storagePath;

  // Si es una URL completa de Storage, extraer solo el path
  if (storagePath.includes('firebasestorage.googleapis.com')) {
    const match = storagePath.match(/\/o\/(.+?)\?/);
    if (match) {
      cleanPath = decodeURIComponent(match[1]);
    }
  }

  // Generar token
  const token = generateDownloadToken(cleanPath);

  // Construir URL
  return `${baseUrl}/api/files/download?path=${encodeURIComponent(cleanPath)}&token=${token}`;
}

/**
 * Convierte una URL de Firebase Storage a URL de descarga segura
 *
 * @param storageUrl - URL completa de Firebase Storage
 * @returns URL de descarga segura
 */
export function convertStorageUrlToSecure(storageUrl: string): string {
  // Si no es una URL de Storage, devolver como está
  if (!storageUrl.includes('firebasestorage.googleapis.com') &&
      !storageUrl.includes('storage.googleapis.com')) {
    return storageUrl;
  }

  return generateSecureDownloadUrl(storageUrl);
}

/**
 * Extrae el path de una URL de Firebase Storage
 */
export function extractPathFromStorageUrl(storageUrl: string): string | null {
  try {
    // Formato: https://firebasestorage.googleapis.com/v0/b/bucket/o/path%2Fto%2Ffile.pdf?...
    const match = storageUrl.match(/\/o\/(.+?)(\?|$)/);
    if (match) {
      return decodeURIComponent(match[1]);
    }

    // Formato alternativo: gs://bucket/path/to/file.pdf
    if (storageUrl.startsWith('gs://')) {
      const parts = storageUrl.replace('gs://', '').split('/');
      parts.shift(); // Remover bucket name
      return parts.join('/');
    }

    return null;
  } catch {
    return null;
  }
}
