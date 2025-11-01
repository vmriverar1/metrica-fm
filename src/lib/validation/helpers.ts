/**
 * Funciones auxiliares para validación de formularios
 */

/**
 * Verifica si un string tiene caracteres repetidos consecutivamente
 * @param str - String a verificar
 * @param minRepeats - Número mínimo de repeticiones consecutivas (default: 3)
 * @returns true si tiene caracteres repetidos
 */
export function hasRepeatedChars(str: string, minRepeats: number = 3): boolean {
  if (!str || str.length < minRepeats) return false;

  const regex = new RegExp(`(.)\\1{${minRepeats - 1},}`, 'i');
  return regex.test(str);
}

/**
 * Verifica si un string contiene solo un carácter repetido
 * @param str - String a verificar
 * @returns true si solo tiene un carácter repetido (ej: "aaa", "111")
 */
export function isSingleCharRepeated(str: string): boolean {
  if (!str || str.length < 2) return false;

  const firstChar = str.charAt(0).toLowerCase();
  return str.toLowerCase().split('').every(char => char === firstChar);
}

/**
 * Verifica si un número tiene dígitos consecutivos ascendentes o descendentes
 * @param phoneDigits - Dígitos del teléfono (solo números)
 * @returns true si tiene secuencia consecutiva
 */
export function hasConsecutiveNumbers(phoneDigits: string): boolean {
  if (!phoneDigits || phoneDigits.length < 5) return false;

  // Verificar secuencias ascendentes (123, 234, 345, etc.)
  for (let i = 0; i < phoneDigits.length - 4; i++) {
    const sequence = phoneDigits.substr(i, 5);
    let isAscending = true;

    for (let j = 1; j < sequence.length; j++) {
      if (parseInt(sequence[j]) !== parseInt(sequence[j-1]) + 1) {
        isAscending = false;
        break;
      }
    }

    if (isAscending) return true;
  }

  // Verificar secuencias descendentes (987, 876, 765, etc.)
  for (let i = 0; i < phoneDigits.length - 4; i++) {
    const sequence = phoneDigits.substr(i, 5);
    let isDescending = true;

    for (let j = 1; j < sequence.length; j++) {
      if (parseInt(sequence[j]) !== parseInt(sequence[j-1]) - 1) {
        isDescending = false;
        break;
      }
    }

    if (isDescending) return true;
  }

  return false;
}

/**
 * Verifica si un string tiene variedad mínima de caracteres diferentes
 * @param str - String a verificar
 * @param minUnique - Número mínimo de caracteres únicos (default: 2)
 * @returns true si tiene suficiente variedad
 */
export function hasMinimumVariety(str: string, minUnique: number = 2): boolean {
  if (!str) return false;

  const uniqueChars = new Set(str.toLowerCase().replace(/\s/g, ''));
  return uniqueChars.size >= minUnique;
}

/**
 * Cuenta el número de dígitos únicos en un string
 * @param str - String a verificar
 * @returns Número de dígitos únicos
 */
export function countUniqueDigits(str: string): number {
  if (!str) return 0;

  const digits = str.replace(/\D/g, '');
  const uniqueDigits = new Set(digits);
  return uniqueDigits.size;
}

/**
 * Verifica si un string contiene al menos N palabras diferentes
 * @param str - String a verificar
 * @param minWords - Número mínimo de palabras únicas (default: 3)
 * @returns true si tiene suficientes palabras
 */
export function hasMinimumWords(str: string, minWords: number = 3): boolean {
  if (!str) return false;

  const words = str
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0);

  const uniqueWords = new Set(words);
  return uniqueWords.size >= minWords;
}

/**
 * Verifica si un string contiene principalmente emojis
 * @param str - String a verificar
 * @returns true si es principalmente emojis
 */
export function isMainlyEmojis(str: string): boolean {
  if (!str) return false;

  // Contar caracteres que son letras o números
  const alphanumeric = str.match(/[a-zA-Z0-9]/g) || [];
  const spaces = str.match(/\s/g) || [];
  const textLength = alphanumeric.length;
  const totalLength = str.length - spaces.length;

  // Si tiene muy pocos caracteres alfanuméricos comparado con el total, probablemente son emojis
  if (totalLength > 0 && textLength < totalLength * 0.3) {
    return true;
  }

  return false;
}

/**
 * Limpia espacios múltiples y trim
 * @param str - String a limpiar
 * @returns String limpio
 */
export function normalizeSpaces(str: string): string {
  if (!str) return '';
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Extrae solo los dígitos de un string
 * @param str - String a procesar
 * @returns Solo los dígitos
 */
export function extractDigits(str: string): string {
  if (!str) return '';
  return str.replace(/\D/g, '');
}

/**
 * Verifica si una palabra está en una lista de palabras prohibidas
 * @param word - Palabra a verificar
 * @param blacklist - Lista de palabras prohibidas
 * @returns true si está en la blacklist
 */
export function isInBlacklist(word: string, blacklist: string[]): boolean {
  if (!word) return false;

  const normalized = word.toLowerCase().trim();
  return blacklist.some(banned => normalized === banned.toLowerCase());
}

/**
 * Verifica si un string contiene alguna palabra de una blacklist
 * @param str - String a verificar
 * @param blacklist - Lista de palabras prohibidas
 * @returns true si contiene alguna palabra prohibida
 */
export function containsBlacklistedWord(str: string, blacklist: string[]): boolean {
  if (!str) return false;

  const normalized = str.toLowerCase();
  return blacklist.some(banned => normalized.includes(banned.toLowerCase()));
}
