import { describe, it, expect } from 'vitest';
import { DataSanitizer } from '@/lib/utils/data-sanitizer';

describe('DataSanitizer.sanitizeString', () => {
  it('conserva letras, tildes y eñes', () => {
    expect(DataSanitizer.sanitizeString('Diseño de Ingeniería')).toBe('Diseño de Ingeniería');
  });

  it('conserva números, puntuación básica y moneda', () => {
    expect(DataSanitizer.sanitizeString('Costo: S/. 1,500 (aprox.)')).toBe('Costo: S/. 1,500 (aprox.)');
  });

  it('elimina caracteres no permitidos', () => {
    expect(DataSanitizer.sanitizeString('Hola <script>alert(1)</script>'))
      .toBe('Hola scriptalert(1)/script');
  });

  it('colapsa espacios múltiples y recorta', () => {
    expect(DataSanitizer.sanitizeString('  hola    mundo  ')).toBe('hola mundo');
  });

  it('devuelve string vacío con entrada no válida', () => {
    expect(DataSanitizer.sanitizeString('')).toBe('');
    expect(DataSanitizer.sanitizeString(null as unknown as string)).toBe('');
    expect(DataSanitizer.sanitizeString(123 as unknown as string)).toBe('');
  });
});

describe('DataSanitizer.sanitizeEmail', () => {
  it('normaliza a minúsculas y recorta', () => {
    expect(DataSanitizer.sanitizeEmail('  JUAN@Empresa.COM ')).toBe('juan@empresa.com');
  });

  it('elimina caracteres inválidos en un email', () => {
    expect(DataSanitizer.sanitizeEmail('juan<>@empresa.com')).toBe('juan@empresa.com');
  });

  it('conserva los caracteres válidos de un email', () => {
    expect(DataSanitizer.sanitizeEmail('juan.perez+tag@sub-dominio.com'))
      .toBe('juan.perez+tag@sub-dominio.com');
  });

  it('devuelve string vacío con entrada no válida', () => {
    expect(DataSanitizer.sanitizeEmail('')).toBe('');
    expect(DataSanitizer.sanitizeEmail(null as unknown as string)).toBe('');
  });
});

describe('DataSanitizer.sanitizePhone', () => {
  it('conserva el formato internacional', () => {
    expect(DataSanitizer.sanitizePhone('+51 987-654-321')).toBe('+51 987-654-321');
  });

  it('elimina letras y símbolos extraños', () => {
    expect(DataSanitizer.sanitizePhone('987abc654!')).toBe('987654');
  });

  it('normaliza espacios y recorta', () => {
    expect(DataSanitizer.sanitizePhone('  987   654  ')).toBe('987 654');
  });

  it('devuelve string vacío con entrada no válida', () => {
    expect(DataSanitizer.sanitizePhone('')).toBe('');
  });
});
