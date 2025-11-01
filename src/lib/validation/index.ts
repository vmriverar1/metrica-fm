/**
 * Exportaciones principales del módulo de validación
 */

// Exportar validadores
export {
  validateName,
  validateEmail,
  validatePhone,
  validateCompany,
  validateMessage,
  validateURL,
  validateForm,
  type ValidationResult
} from './field-validators';

// Exportar helpers (por si se necesitan en algún lugar)
export {
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

// Exportar blacklists (por si se necesitan extender)
export {
  SPAM_NAMES,
  TEMP_EMAIL_DOMAINS,
  SPAM_MESSAGE_WORDS,
  SPAM_COMPANY_NAMES,
  FORBIDDEN_URL_PATTERNS,
  VALID_TLDS
} from './blacklists';
