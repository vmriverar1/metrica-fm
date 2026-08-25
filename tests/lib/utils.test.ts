import { describe, it, expect } from 'vitest';
import { cn, encodeImageUrl } from '@/lib/utils';

describe('cn', () => {
  it('concatena clases', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('descarta valores falsy y condicionales', () => {
    expect(cn('a', false && 'b', undefined, null, 'c')).toBe('a c');
  });

  it('resuelve conflictos de Tailwind quedándose con la última', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });
});

describe('encodeImageUrl', () => {
  it('codifica espacios manteniendo las barras del path', () => {
    expect(encodeImageUrl('/images/proyectos/Copia de foto.webp'))
      .toBe('/images/proyectos/Copia%20de%20foto.webp');
  });

  it('codifica tildes y eñes', () => {
    expect(encodeImageUrl('/images/proyectos/EDUCACIÓN/aula.webp'))
      .toBe('/images/proyectos/EDUCACI%C3%93N/aula.webp');
  });

  it('deja intactas las URLs externas', () => {
    const url = 'https://cdn.ejemplo.com/foto con espacio.webp';
    expect(encodeImageUrl(url)).toBe(url);
  });

  it('devuelve la entrada tal cual si es vacía', () => {
    expect(encodeImageUrl('')).toBe('');
  });

  it('no codifica dos veces una ruta ya limpia', () => {
    const url = '/images/logo.webp';
    expect(encodeImageUrl(url)).toBe(url);
  });
});
