import type { AuditEntry, LogStats, PerformanceMetrics } from './logger';

/**
 * Lo que los consumidores usan de verdad, de los quince y pico métodos que la clase expone.
 *
 * El contrato lo define quien llama, no quien implementa: depender de `JSONCRUDLogger` obliga a
 * arrastrar `fs/promises` y el EventEmitter a cualquier módulo que solo quería escribir una línea.
 */
export interface Logger {
  debug(category: string, message: string, metadata?: Record<string, any>, context?: any): Promise<void>;
  info(category: string, message: string, metadata?: Record<string, any>, context?: any): Promise<void>;
  warn(category: string, message: string, metadata?: Record<string, any>, context?: any): Promise<void>;
  error(category: string, message: string, error?: Error, metadata?: Record<string, any>, context?: any): Promise<void>;
  audit(entry: Omit<AuditEntry, 'timestamp' | 'level' | 'category'>): Promise<void>;
  performance(metrics: PerformanceMetrics): Promise<void>;
  getStats(): LogStats;
  destroy(): Promise<void>;
}
