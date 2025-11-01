import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Codifica correctamente una URL de imagen que puede contener espacios y caracteres especiales
 * Procesa cada segmento del path individualmente para evitar doble codificación
 */
export function encodeImageUrl(url: string): string {
  if (!url) return url;

  // Si es una URL externa completa, no modificar
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Separar el path en segmentos
  const segments = url.split('/');

  // Codificar cada segmento individualmente
  const encodedSegments = segments.map(segment =>
    encodeURIComponent(segment)
      // Mantener algunos caracteres que son válidos en URLs
      .replace(/%2F/g, '/')
  );

  return encodedSegments.join('/');
}
