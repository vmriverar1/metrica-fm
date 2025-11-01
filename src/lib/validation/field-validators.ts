/**
 * Validadores de campos de formulario
 */

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
  containsBlacklistedWord
} from './helpers';

import {
  SPAM_NAMES,
  TEMP_EMAIL_DOMAINS,
  SPAM_MESSAGE_WORDS,
  SPAM_COMPANY_NAMES,
  FORBIDDEN_URL_PATTERNS,
  VALID_TLDS
} from './blacklists';

/**
 * Resultado de una validación
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Valida un nombre o apellido
 * @param name - Nombre a validar
 * @returns Resultado de validación
 */
export function validateName(name: string): ValidationResult {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'El nombre es obligatorio' };
  }

  const trimmed = normalizeSpaces(name);

  // Validar longitud
  if (trimmed.length < 2) {
    return { valid: false, error: 'El nombre debe tener al menos 2 caracteres' };
  }

  if (trimmed.length > 50) {
    return { valid: false, error: 'El nombre no puede exceder 50 caracteres' };
  }

  // Validar que solo contenga letras, espacios, guiones y tildes
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-]+$/;
  if (!nameRegex.test(trimmed)) {
    return { valid: false, error: 'El nombre solo puede contener letras, espacios y guiones' };
  }

  // Validar que no sea solo un carácter repetido
  if (isSingleCharRepeated(trimmed.replace(/\s/g, ''))) {
    return { valid: false, error: 'El nombre no puede contener solo caracteres repetidos' };
  }

  // Validar variedad mínima de caracteres
  if (!hasMinimumVariety(trimmed, 2)) {
    return { valid: false, error: 'El nombre debe tener al menos 2 caracteres diferentes' };
  }

  // Validar contra palabras de spam/prueba
  if (isInBlacklist(trimmed, SPAM_NAMES)) {
    return { valid: false, error: 'Por favor ingresa tu nombre real (no datos de prueba)' };
  }

  // Validar que no contenga números
  if (/\d/.test(trimmed)) {
    return { valid: false, error: 'El nombre no puede contener números' };
  }

  return { valid: true };
}

/**
 * Valida un email
 * @param email - Email a validar
 * @returns Resultado de validación
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'El email es obligatorio' };
  }

  const trimmed = email.trim().toLowerCase();

  // Validar longitud
  if (trimmed.length > 254) {
    return { valid: false, error: 'El email es demasiado largo' };
  }

  // Validar formato RFC 5322 (simplificado)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Por favor ingresa un email válido' };
  }

  // Extraer dominio
  const domain = trimmed.split('@')[1];
  if (!domain) {
    return { valid: false, error: 'El email no tiene un dominio válido' };
  }

  // Verificar que tenga un TLD válido
  const parts = domain.split('.');
  const tld = parts[parts.length - 1];
  if (!VALID_TLDS.includes(tld)) {
    return { valid: false, error: 'El dominio del email no es válido' };
  }

  // Verificar contra dominios temporales
  if (TEMP_EMAIL_DOMAINS.includes(domain)) {
    return { valid: false, error: 'No se permiten emails temporales o desechables' };
  }

  // Verificar patrones de emails de prueba
  const testPatterns = ['test@test', 'admin@admin', 'example@example', 'prueba@prueba'];
  if (testPatterns.some(pattern => trimmed.includes(pattern))) {
    return { valid: false, error: 'Por favor ingresa tu email real (no datos de prueba)' };
  }

  return { valid: true };
}

/**
 * Valida un teléfono (formato Perú principalmente)
 * @param phone - Teléfono a validar
 * @returns Resultado de validación
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'El teléfono es obligatorio' };
  }

  const trimmed = phone.trim();
  const digits = extractDigits(trimmed);

  // Validar que tenga dígitos
  if (digits.length === 0) {
    return { valid: false, error: 'El teléfono debe contener números' };
  }

  // Validar longitud (9 dígitos para Perú, o 10-15 para internacional)
  if (digits.length < 9) {
    return { valid: false, error: 'El teléfono debe tener al menos 9 dígitos' };
  }

  if (digits.length > 15) {
    return { valid: false, error: 'El teléfono no puede tener más de 15 dígitos' };
  }

  // Verificar que no tenga todos los dígitos iguales
  if (isSingleCharRepeated(digits)) {
    return { valid: false, error: 'El teléfono no puede tener todos los dígitos iguales' };
  }

  // Verificar que no tenga secuencias consecutivas
  if (hasConsecutiveNumbers(digits)) {
    return { valid: false, error: 'El teléfono no puede ser una secuencia consecutiva de números' };
  }

  // Verificar variedad mínima de dígitos (al menos 4 dígitos diferentes)
  const uniqueDigits = countUniqueDigits(digits);
  if (uniqueDigits < 4) {
    return { valid: false, error: 'El teléfono debe tener al menos 4 dígitos diferentes' };
  }

  return { valid: true };
}

/**
 * Valida un nombre de empresa u organización
 * @param company - Nombre de empresa a validar
 * @returns Resultado de validación
 */
export function validateCompany(company: string): ValidationResult {
  // El campo empresa es opcional en algunos formularios
  if (!company || company.trim().length === 0) {
    return { valid: true };
  }

  const trimmed = normalizeSpaces(company);

  // Validar longitud
  if (trimmed.length < 2) {
    return { valid: false, error: 'El nombre de la empresa debe tener al menos 2 caracteres' };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: 'El nombre de la empresa no puede exceder 100 caracteres' };
  }

  // Permitir letras, números, espacios, guiones, puntos, &, comas
  const companyRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\.\&,]+$/;
  if (!companyRegex.test(trimmed)) {
    return { valid: false, error: 'El nombre de la empresa contiene caracteres no permitidos' };
  }

  // Validar contra palabras de spam/prueba
  if (isInBlacklist(trimmed, SPAM_COMPANY_NAMES)) {
    return { valid: false, error: 'Por favor ingresa el nombre real de la empresa (no datos de prueba)' };
  }

  return { valid: true };
}

/**
 * Valida un mensaje o descripción larga
 * @param message - Mensaje a validar
 * @param minLength - Longitud mínima (default: 10)
 * @param maxLength - Longitud máxima (default: 2000)
 * @returns Resultado de validación
 */
export function validateMessage(
  message: string,
  minLength: number = 10,
  maxLength: number = 2000
): ValidationResult {
  if (!message || typeof message !== 'string') {
    return { valid: false, error: 'El mensaje es obligatorio' };
  }

  const trimmed = normalizeSpaces(message);

  // Validar longitud
  if (trimmed.length < minLength) {
    return { valid: false, error: `El mensaje debe tener al menos ${minLength} caracteres` };
  }

  if (trimmed.length > maxLength) {
    return { valid: false, error: `El mensaje no puede exceder ${maxLength} caracteres` };
  }

  // Validar que tenga al menos 3 palabras diferentes
  if (!hasMinimumWords(trimmed, 3)) {
    return { valid: false, error: 'El mensaje debe contener al menos 3 palabras diferentes' };
  }

  // Validar que no sea principalmente emojis
  if (isMainlyEmojis(trimmed)) {
    return { valid: false, error: 'El mensaje no puede contener solo emojis' };
  }

  // Validar que no tenga caracteres repetidos excesivamente
  if (hasRepeatedChars(trimmed, 5)) {
    return { valid: false, error: 'El mensaje contiene demasiados caracteres repetidos' };
  }

  // Validar contra palabras de spam
  if (containsBlacklistedWord(trimmed, SPAM_MESSAGE_WORDS)) {
    return { valid: false, error: 'El mensaje contiene contenido no permitido' };
  }

  return { valid: true };
}

/**
 * Valida una URL
 * @param url - URL a validar
 * @param type - Tipo de URL ('linkedin', 'portfolio', 'generic')
 * @returns Resultado de validación
 */
export function validateURL(url: string, type: 'linkedin' | 'portfolio' | 'generic' = 'generic'): ValidationResult {
  // URLs son opcionales en algunos formularios
  if (!url || url.trim().length === 0) {
    return { valid: true };
  }

  const trimmed = url.trim().toLowerCase();

  // Validar longitud
  if (trimmed.length > 500) {
    return { valid: false, error: 'La URL es demasiado larga' };
  }

  // Validar formato básico de URL
  const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  if (!urlRegex.test(trimmed)) {
    return { valid: false, error: 'Por favor ingresa una URL válida' };
  }

  // Verificar que comience con http:// o https://
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return { valid: false, error: 'La URL debe comenzar con http:// o https://' };
  }

  // Validar contra patrones prohibidos
  for (const pattern of FORBIDDEN_URL_PATTERNS) {
    if (trimmed.includes(pattern)) {
      return { valid: false, error: 'La URL no es válida' };
    }
  }

  // Validaciones específicas por tipo
  if (type === 'linkedin') {
    if (!trimmed.includes('linkedin.com')) {
      return { valid: false, error: 'Por favor ingresa una URL de LinkedIn válida' };
    }
  }

  return { valid: true };
}

/**
 * Valida todos los campos de un formulario
 * @param fields - Objeto con los campos a validar
 * @returns Objeto con errores por campo (vacío si todo es válido)
 */
export function validateForm(fields: Record<string, any>): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const [key, value] of Object.entries(fields)) {
    let result: ValidationResult;

    // Determinar qué validador usar basándose en el nombre del campo
    const lowerKey = key.toLowerCase();

    if (lowerKey.includes('nombre') || lowerKey.includes('name') ||
        lowerKey.includes('apellido') || lowerKey.includes('lastname') ||
        lowerKey.includes('firstname') || lowerKey.includes('lastname')) {
      result = validateName(value);
    } else if (lowerKey.includes('email') || lowerKey.includes('correo') || lowerKey.includes('mail')) {
      result = validateEmail(value);
    } else if (lowerKey.includes('telefono') || lowerKey.includes('phone') || lowerKey.includes('celular')) {
      result = validatePhone(value);
    } else if (lowerKey.includes('empresa') || lowerKey.includes('company') || lowerKey.includes('organizacion')) {
      result = validateCompany(value);
    } else if (lowerKey.includes('mensaje') || lowerKey.includes('message') ||
               lowerKey.includes('descripcion') || lowerKey.includes('description') ||
               lowerKey.includes('experiencia') || lowerKey.includes('experience') ||
               lowerKey.includes('educacion') || lowerKey.includes('education') ||
               lowerKey.includes('motivation')) {
      result = validateMessage(value);
    } else if (lowerKey.includes('linkedin')) {
      result = validateURL(value, 'linkedin');
    } else if (lowerKey.includes('portfolio') || lowerKey.includes('url') || lowerKey.includes('website')) {
      result = validateURL(value, 'generic');
    } else {
      // Campo no reconocido, asumir que es texto general
      continue;
    }

    if (!result.valid && result.error) {
      errors[key] = result.error;
    }
  }

  return errors;
}
