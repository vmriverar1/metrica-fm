import { describe, it, expect } from 'vitest';
import {
  hasRepeatedChars,
  isSingleCharRepeated,
  hasConsecutiveNumbers,
  hasMinimumVariety,
  countUniqueDigits,
  hasMinimumWords,
  isMainlyEmojis,
  normalizeSpaces,
  extractDigits,
  isInBlacklist,
  containsBlacklistedWord,
} from '@/lib/validation/helpers';

describe('hasRepeatedChars', () => {
  it('detecta 3 o más caracteres consecutivos iguales', () => {
    expect(hasRepeatedChars('aaa')).toBe(true);
    expect(hasRepeatedChars('holaaa')).toBe(true);
  });

  it('ignora repeticiones por debajo del umbral', () => {
    expect(hasRepeatedChars('aa')).toBe(false);
    expect(hasRepeatedChars('hola')).toBe(false);
  });

  it('respeta un umbral personalizado', () => {
    expect(hasRepeatedChars('aa', 2)).toBe(true);
    expect(hasRepeatedChars('aaa', 4)).toBe(false);
  });

  it('devuelve false con string vacío', () => {
    expect(hasRepeatedChars('')).toBe(false);
  });
});

describe('isSingleCharRepeated', () => {
  it('detecta strings de un solo carácter repetido', () => {
    expect(isSingleCharRepeated('aaa')).toBe(true);
    expect(isSingleCharRepeated('111')).toBe(true);
  });

  it('es insensible a mayúsculas', () => {
    expect(isSingleCharRepeated('aAa')).toBe(true);
  });

  it('devuelve false si hay variedad', () => {
    expect(isSingleCharRepeated('abc')).toBe(false);
  });

  it('devuelve false con menos de 2 caracteres', () => {
    expect(isSingleCharRepeated('a')).toBe(false);
    expect(isSingleCharRepeated('')).toBe(false);
  });
});

describe('hasConsecutiveNumbers', () => {
  it('detecta secuencias ascendentes de 5 dígitos', () => {
    expect(hasConsecutiveNumbers('123456789')).toBe(true);
  });

  it('detecta secuencias descendentes de 5 dígitos', () => {
    expect(hasConsecutiveNumbers('987654321')).toBe(true);
  });

  it('acepta números reales sin secuencia', () => {
    expect(hasConsecutiveNumbers('987412563')).toBe(false);
  });

  it('devuelve false con menos de 5 dígitos', () => {
    expect(hasConsecutiveNumbers('1234')).toBe(false);
  });
});

describe('hasMinimumVariety', () => {
  it('exige al menos 2 caracteres distintos por defecto', () => {
    expect(hasMinimumVariety('ab')).toBe(true);
    expect(hasMinimumVariety('aaa')).toBe(false);
  });

  it('no cuenta los espacios como variedad', () => {
    expect(hasMinimumVariety('a a a')).toBe(false);
  });

  it('respeta un mínimo personalizado', () => {
    expect(hasMinimumVariety('abc', 3)).toBe(true);
    expect(hasMinimumVariety('abc', 4)).toBe(false);
  });
});

describe('countUniqueDigits', () => {
  it('cuenta solo dígitos distintos', () => {
    expect(countUniqueDigits('112233')).toBe(3);
    expect(countUniqueDigits('999999999')).toBe(1);
  });

  it('ignora los caracteres no numéricos', () => {
    expect(countUniqueDigits('+51 987-654')).toBe(7);
  });

  it('devuelve 0 sin dígitos', () => {
    expect(countUniqueDigits('abc')).toBe(0);
    expect(countUniqueDigits('')).toBe(0);
  });
});

describe('hasMinimumWords', () => {
  it('exige 3 palabras únicas por defecto', () => {
    expect(hasMinimumWords('hola que tal')).toBe(true);
    expect(hasMinimumWords('hola que')).toBe(false);
  });

  it('no cuenta palabras repetidas', () => {
    expect(hasMinimumWords('hola hola hola')).toBe(false);
  });

  it('trata la puntuación como separador', () => {
    expect(hasMinimumWords('hola,que,tal')).toBe(true);
  });
});

describe('isMainlyEmojis', () => {
  it('detecta texto casi sin caracteres alfanuméricos', () => {
    expect(isMainlyEmojis('🎉🎉🎉🎉')).toBe(true);
  });

  it('acepta texto normal', () => {
    expect(isMainlyEmojis('Hola, buenos días')).toBe(false);
  });

  it('devuelve false con string vacío', () => {
    expect(isMainlyEmojis('')).toBe(false);
  });
});

describe('normalizeSpaces', () => {
  it('colapsa espacios múltiples y recorta los extremos', () => {
    expect(normalizeSpaces('  hola   mundo  ')).toBe('hola mundo');
  });

  it('normaliza saltos de línea y tabulaciones', () => {
    expect(normalizeSpaces('hola\n\tmundo')).toBe('hola mundo');
  });

  it('devuelve string vacío si la entrada es vacía', () => {
    expect(normalizeSpaces('')).toBe('');
  });
});

describe('extractDigits', () => {
  it('conserva solo los dígitos', () => {
    expect(extractDigits('+51 987-654-321')).toBe('51987654321');
  });

  it('devuelve string vacío si no hay dígitos', () => {
    expect(extractDigits('abc')).toBe('');
    expect(extractDigits('')).toBe('');
  });
});

describe('isInBlacklist', () => {
  const lista = ['test', 'prueba'];

  it('compara la palabra completa sin distinguir mayúsculas', () => {
    expect(isInBlacklist('TEST', lista)).toBe(true);
    expect(isInBlacklist('  prueba  ', lista)).toBe(true);
  });

  it('no hace coincidencia parcial', () => {
    expect(isInBlacklist('testing', lista)).toBe(false);
  });

  it('devuelve false con entrada vacía', () => {
    expect(isInBlacklist('', lista)).toBe(false);
  });
});

describe('containsBlacklistedWord', () => {
  const lista = ['casino', 'viagra'];

  it('detecta la palabra dentro de una frase', () => {
    expect(containsBlacklistedWord('Visita nuestro CASINO online', lista)).toBe(true);
  });

  it('devuelve false si no aparece ninguna', () => {
    expect(containsBlacklistedWord('Solicito una cotización', lista)).toBe(false);
  });
});
