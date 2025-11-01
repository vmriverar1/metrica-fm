/**
 * Servicio de sanitización de datos
 * Limpia caracteres extraños permitiendo solo:
 * - Letras (a-z, A-Z)
 * - Números (0-9)
 * - Letras con tildes (á, é, í, ó, ú, Á, É, Í, Ó, Ú)
 * - Ñ y ñ
 * - Signos: + $ S/. (soles) y espacios
 * - Puntuación básica: . , ; : ? ! - ( ) [ ]
 */

export class DataSanitizer {
  /**
   * Patrón regex que permite:
   * - Letras básicas y con tildes
   * - Números
   * - Espacios
   * - Puntuación básica
   * - Símbolos monetarios
   */
  private static readonly ALLOWED_PATTERN = /[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\+\$\.,;:\?!\-\(\)\[\]@\/]/g;

  /**
   * Sanitiza un string eliminando caracteres no permitidos
   */
  static sanitizeString(value: string): string {
    if (!value || typeof value !== 'string') {
      return '';
    }

    // Eliminar caracteres no permitidos
    let sanitized = value.replace(this.ALLOWED_PATTERN, '');

    // Normalizar espacios múltiples
    sanitized = sanitized.replace(/\s+/g, ' ');

    // Trim
    sanitized = sanitized.trim();

    return sanitized;
  }

  /**
   * Sanitiza un email
   */
  static sanitizeEmail(email: string): string {
    if (!email || typeof email !== 'string') {
      return '';
    }

    // Convertir a minúsculas y eliminar espacios
    let sanitized = email.toLowerCase().trim();

    // Permitir solo caracteres válidos en emails
    sanitized = sanitized.replace(/[^a-z0-9@._\-\+]/g, '');

    return sanitized;
  }

  /**
   * Sanitiza un teléfono
   */
  static sanitizePhone(phone: string): string {
    if (!phone || typeof phone !== 'string') {
      return '';
    }

    // Permitir solo números, +, espacios, guiones y paréntesis
    let sanitized = phone.replace(/[^0-9\+\s\-\(\)]/g, '');

    // Normalizar espacios
    sanitized = sanitized.replace(/\s+/g, ' ').trim();

    return sanitized;
  }

  /**
   * Sanitiza un objeto completo de forma recursiva
   */
  static sanitizeObject(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    // Si es un array, sanitizar cada elemento
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    // Si no es un objeto, retornar tal cual
    if (typeof obj !== 'object') {
      return obj;
    }

    const sanitized: any = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];

        // Detectar tipo de campo por el nombre de la clave
        if (key.toLowerCase().includes('email')) {
          sanitized[key] = this.sanitizeEmail(value);
        } else if (key.toLowerCase().includes('phone') || key.toLowerCase().includes('telefono')) {
          sanitized[key] = this.sanitizePhone(value);
        } else if (typeof value === 'string') {
          sanitized[key] = this.sanitizeString(value);
        } else if (typeof value === 'object') {
          sanitized[key] = this.sanitizeObject(value);
        } else {
          // Números, booleanos, etc. se mantienen sin cambios
          sanitized[key] = value;
        }
      }
    }

    return sanitized;
  }

  /**
   * Valida un email
   */
  static isValidEmail(email: string): boolean {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida un teléfono (básico)
   */
  static isValidPhone(phone: string): boolean {
    if (!phone) return false;
    // Al menos 7 dígitos
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 7;
  }

  /**
   * Valida que un string no esté vacío después de sanitizar
   */
  static isNotEmpty(value: string): boolean {
    return this.sanitizeString(value).length > 0;
  }

  /**
   * Valida campos requeridos de un objeto
   */
  static validateRequired(obj: any, requiredFields: string[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const field of requiredFields) {
      const value = obj[field];

      if (value === undefined || value === null) {
        errors.push(`El campo ${field} es requerido`);
        continue;
      }

      if (typeof value === 'string') {
        if (field.toLowerCase().includes('email')) {
          if (!this.isValidEmail(value)) {
            errors.push(`El email en ${field} no es válido`);
          }
        } else if (field.toLowerCase().includes('phone') || field.toLowerCase().includes('telefono')) {
          if (!this.isValidPhone(value)) {
            errors.push(`El teléfono en ${field} no es válido`);
          }
        } else if (!this.isNotEmpty(value)) {
          errors.push(`El campo ${field} no puede estar vacío`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Prepara datos para ser guardados: sanitiza y valida
   */
  static prepareForStorage(
    data: any,
    requiredFields: string[] = []
  ): {
    success: boolean;
    data?: any;
    errors?: string[]
  } {
    // Validar campos requeridos primero (sin sanitizar para detectar campos vacíos)
    if (requiredFields.length > 0) {
      const validation = this.validateRequired(data, requiredFields);
      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors
        };
      }
    }

    // Sanitizar datos
    const sanitized = this.sanitizeObject(data);

    return {
      success: true,
      data: sanitized
    };
  }
}

// Exportar instancia por defecto
export default DataSanitizer;
