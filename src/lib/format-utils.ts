/**
 * Utilidades para formateo consistente de números y fechas
 * Previene errores de hidratación SSR/CSR
 */

/**
 * Formatea números usando el locale peruano de manera consistente
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('es-PE');
}

/**
 * Formatea moneda peruana (soles)
 */
export function formatCurrency(value: number): string {
  return `S/ ${formatNumber(value)}`;
}

/**
 * Formatea fechas usando el locale peruano
 */
export function formatDate(date: Date): string {
  return date.toLocaleString('es-PE');
}

/**
 * Formatea rangos de salarios
 */
export function formatSalaryRange(min: number, max: number): string {
  return `${formatCurrency(min)} - ${formatCurrency(max)}`;
}