import { describe, it, expect } from 'vitest';
import {
  parseNumberInput,
  formatNumber,
  isValidNumber,
  clampNumber,
} from '@/lib/form-utils';

describe('parseNumberInput', () => {
  it('convierte entradas numéricas válidas', () => {
    expect(parseNumberInput('42')).toBe(42);
    expect(parseNumberInput('3.14')).toBe(3.14);
    expect(parseNumberInput('-7')).toBe(-7);
  });

  it('usa el fallback con entrada vacía', () => {
    expect(parseNumberInput('')).toBe(0);
    expect(parseNumberInput('', 10)).toBe(10);
  });

  it('usa el fallback con entradas parciales de tecleo', () => {
    expect(parseNumberInput('.')).toBe(0);
    expect(parseNumberInput('-')).toBe(0);
  });

  it('usa el fallback con texto no numérico', () => {
    expect(parseNumberInput('abc', 5)).toBe(5);
  });

  it('trata null y undefined como vacío', () => {
    expect(parseNumberInput(null as unknown as string, 3)).toBe(3);
    expect(parseNumberInput(undefined as unknown as string, 3)).toBe(3);
  });
});

describe('formatNumber', () => {
  it('elimina los ceros finales innecesarios', () => {
    expect(formatNumber(5)).toBe('5');
    expect(formatNumber(5.5)).toBe('5.5');
  });

  it('respeta el número de decimales indicado', () => {
    expect(formatNumber(3.14159, 3)).toBe('3.142');
  });

  it('devuelve "0" con NaN', () => {
    expect(formatNumber(NaN)).toBe('0');
  });
});

describe('isValidNumber', () => {
  it('acepta números y decimales', () => {
    expect(isValidNumber('42')).toBe(true);
    expect(isValidNumber('3.14')).toBe(true);
  });

  it('acepta entradas parciales durante el tecleo', () => {
    expect(isValidNumber('.')).toBe(true);
    expect(isValidNumber('-')).toBe(true);
  });

  it('rechaza vacío y solo espacios', () => {
    expect(isValidNumber('')).toBe(false);
    expect(isValidNumber('   ')).toBe(false);
  });

  it('rechaza texto e infinito', () => {
    expect(isValidNumber('abc')).toBe(false);
    expect(isValidNumber('Infinity')).toBe(false);
  });
});

describe('clampNumber', () => {
  it('deja pasar los valores dentro del rango', () => {
    expect(clampNumber(5, 0, 10)).toBe(5);
  });

  it('recorta por debajo del mínimo y por encima del máximo', () => {
    expect(clampNumber(-5, 0, 10)).toBe(0);
    expect(clampNumber(15, 0, 10)).toBe(10);
  });

  it('aplica solo el límite que se indica', () => {
    expect(clampNumber(-5, 0)).toBe(0);
    expect(clampNumber(100, undefined, 10)).toBe(10);
  });

  it('devuelve el valor tal cual si no hay límites', () => {
    expect(clampNumber(42)).toBe(42);
  });
});
