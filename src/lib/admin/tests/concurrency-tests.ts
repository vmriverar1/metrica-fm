/**
 * Concurrency Tests - Tests de concurrencia y atomicidad
 * 
 * Características:
 * - Tests de escrituras concurrentes
 * - Verificación de bloqueo de archivos
 * - Tests de integridad de datos
 * - Simulación de condiciones de carrera
 * - Verificación de rollback en errores
 * - Tests de performance bajo carga
 */

import { FileManager } from '../core/file-manager';
import { FlexibleValidator } from '../core/validator';
import { JSONCRUDLogger } from '../core/logger';
import fs from 'fs/promises';
import path from 'path';

// Tipos para tests
interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
  details?: any;
}

interface ConcurrencyTestSuite {
  suiteName: string;
  tests: TestResult[];
  totalTests: number;
  passedTests: number;
  totalDuration: number;
  summary: string;
}

interface LoadTestMetrics {
  operationsPerSecond: number;
  averageResponseTime: number;
  errorRate: number;
  concurrentUsers: number;
  testDuration: number;
}

/**
 * ConcurrencyTester - Suite de tests de concurrencia
 */
export class ConcurrencyTester {
  private fileManager: FileManager;
  private cacheManager: JSONCacheManager;
  private validator: FlexibleValidator;
  private logger: JSONCRUDLogger;
  private testDir: string;
  private testResults: TestResult[] = [];

  constructor() {
    this.testDir = path.join(process.cwd(), 'data/test-temp');
    this.fileManager = new FileManager(this.testDir, path.join(this.testDir, 'locks'));
    this.cacheManager = new JSONCacheManager();
    this.validator = new FlexibleValidator();
    this.logger = new JSONCRUDLogger({
      logDir: path.join(this.testDir, 'logs'),
      logLevel: 'debug'
    });
  }

  /**
   * Ejecutar todos los tests de concurrencia
   */
  async runAllTests(): Promise<ConcurrencyTestSuite> {
    console.log('🧪 Iniciando tests de concurrencia y atomicidad...\n');
    
    const startTime = Date.now();
    this.testResults = [];

    try {
      // Preparar entorno de tests
      await this.setupTestEnvironment();

      // Tests básicos de atomicidad
      await this.testAtomicWrites();
      await this.testFileLocking();
      await this.testETagValidation();
      
      // Tests de concurrencia
      await this.testConcurrentWrites();
      await this.testConcurrentReads();
      await this.testMixedOperations();
      
      // Tests de integridad
      await this.testDataIntegrity();
      await this.testRollbackOnError();
      
      // Tests de performance
      await this.testLoadHandling();
      await this.testCachePerformance();
      
      // Tests de validación
      await this.testValidationUnderLoad();

    } catch (error) {
      console.error('❌ Error durante tests:', error);
    } finally {
      // Limpiar entorno de tests
      await this.cleanupTestEnvironment();
    }

    const totalDuration = Date.now() - startTime;
    const passedTests = this.testResults.filter(t => t.passed).length;

    const suite: ConcurrencyTestSuite = {
      suiteName: 'Concurrency and Atomicity Tests',
      tests: this.testResults,
      totalTests: this.testResults.length,
      passedTests,
      totalDuration,
      summary: `${passedTests}/${this.testResults.length} tests passed in ${totalDuration}ms`
    };

    this.printTestResults(suite);
    return suite;
  }

  /**
   * Configurar entorno de tests
   */
  private async setupTestEnvironment(): Promise<void> {
    try {
      await fs.mkdir(this.testDir, { recursive: true });
      await fs.mkdir(path.join(this.testDir, 'locks'), { recursive: true });
      
      // Cargar schemas para validación
      await this.validator.loadAllSchemas();
      
      console.log('✅ Entorno de tests configurado');
    } catch (error) {
      throw new Error(`Failed to setup test environment: ${error.message}`);
    }
  }

  /**
   * Limpiar entorno de tests
   */
  private async cleanupTestEnvironment(): Promise<void> {
    try {
      await fs.rm(this.testDir, { recursive: true, force: true });
      await this.logger.destroy();
      console.log('✅ Entorno de tests limpiado');
    } catch (error) {
      console.warn('⚠️ Warning: Could not cleanup test environment:', error.message);
    }
  }

  /**
   * Test de escrituras atómicas
   */
  private async testAtomicWrites(): Promise<void> {
    const testName = 'Atomic Writes';
    const startTime = Date.now();
    
    try {
      const testFile = 'atomic-test.json';
      const testData = { id: 'test', content: 'atomic write test', timestamp: Date.now() };
      
      // Escribir datos
      const result = await this.fileManager.writeJSON(testFile, testData, {
        createBackup: true,
        ensureDirectory: true
      });
      
      // Verificar que el archivo existe y contiene los datos correctos
      const readResult = await this.fileManager.readJSON(testFile);
      
      const success = result.success && 
                     JSON.stringify(readResult.data) === JSON.stringify(testData) &&
                     result.metadata.etag === readResult.metadata.etag;
      
      this.addTestResult(testName, success, Date.now() - startTime, {
        wrote: testData,
        read: readResult.data,
        etag: result.metadata.etag
      });
      
    } catch (error) {
      this.addTestResult(testName, false, Date.now() - startTime, error.message);
    }
  }

  /**
   * Test de bloqueo de archivos
   */
  private async testFileLocking(): Promise<void> {
    const testName = 'File Locking';
    const startTime = Date.now();
    
    try {
      const testFile = 'lock-test.json';
      const testData1 = { id: 'test1', writer: 'process1' };
      const testData2 = { id: 'test2', writer: 'process2' };
      
      // Simular dos escrituras concurrentes
      const promise1 = this.fileManager.writeJSON(testFile, testData1, {
        timeout: 5000,
        ensureDirectory: true
      });
      
      const promise2 = this.fileManager.writeJSON(testFile, testData2, {
        timeout: 5000
      });
      
      // Esperar ambas operaciones
      const [result1, result2] = await Promise.all([promise1, promise2]);
      
      // Verificar que ambas fueron exitosas y que no hubo corrupción
      const finalData = await this.fileManager.readJSON(testFile);
      const isValid = (JSON.stringify(finalData.data) === JSON.stringify(testData1) ||
                      JSON.stringify(finalData.data) === JSON.stringify(testData2)) &&
                     result1.success && result2.success;
      
      this.addTestResult(testName, isValid, Date.now() - startTime, {
        result1: result1.success,
        result2: result2.success,
        finalData: finalData.data
      });
      
    } catch (error) {
      this.addTestResult(testName, false, Date.now() - startTime, error.message);
    }
  }

  /**
   * Test de validación ETag
   */
  private async testETagValidation(): Promise<void> {
    const testName = 'ETag Validation';
    const startTime = Date.now();
    
    try {
      const testFile = 'etag-test.json';
      const testData1 = { id: 'test', version: 1 };
      const testData2 = { id: 'test', version: 2 };
      
      // Escribir datos iniciales
      const result1 = await this.fileManager.writeJSON(testFile, testData1, {
        ensureDirectory: true
      });
      
      // Intentar escribir con ETag incorrecto (debería fallar)
      let conflictDetected = false;
      try {
        await this.fileManager.writeJSON(testFile, testData2, {
          validateEtag: 'wrong-etag'
        });
      } catch (error) {
        conflictDetected = error.name === 'FileConflictError';
      }
      
      // Escribir con ETag correcto (debería funcionar)
      const result2 = await this.fileManager.writeJSON(testFile, testData2, {
        validateEtag: result1.metadata.etag
      });
      
      const success = conflictDetected && result2.success;
      
      this.addTestResult(testName, success, Date.now() - startTime, {
        conflictDetected,
        secondWriteSuccess: result2.success
      });
      
    } catch (error) {
      this.addTestResult(testName, false, Date.now() - startTime, error.message);
    }
  }

  /**
   * Test de escrituras concurrentes masivas
   */
  private async testConcurrentWrites(): Promise<void> {
    const testName = 'Concurrent Writes';
    const startTime = Date.now();
    
    try {
      const concurrentOperations = 10;
      const testFile = 'concurrent-test.json';
      
      // Crear múltiples operaciones de escritura concurrentes
      const promises = Array.from({ length: concurrentOperations }, (_, i) => 
        this.fileManager.writeJSON(`${testFile}-${i}`, {
          id: `test-${i}`,
          timestamp: Date.now(),
          writer: `process-${i}`
        }, { ensureDirectory: true })
      );
      
      const results = await Promise.all(promises);
      const allSuccessful = results.every(r => r.success);
      
      // Verificar que todos los archivos fueron creados correctamente
      let filesVerified = 0;
      for (let i = 0; i < concurrentOperations; i++) {
        try {
          const data = await this.fileManager.readJSON(`${testFile}-${i}`);
          if (data.data.id === `test-${i}`) {
            filesVerified++;
          }
        } catch {
          // Archivo no creado correctamente
        }
      }
      
      const success = allSuccessful && filesVerified === concurrentOperations;
      
      this.addTestResult(testName, success, Date.now() - startTime, {
        operations: concurrentOperations,
        successful: results.filter(r => r.success).length,
        filesVerified
      });
      
    } catch (error) {
      this.addTestResult(testName, false, Date.now() - startTime, error.message);
    }
  }

  /**
   * Test de lecturas concurrentes
   */
  private async testConcurrentReads(): Promise<void> {
    const testName = 'Concurrent Reads';
    const startTime = Date.now();
    
    try {
      const testFile = 'read-test.json';
      const testData = { id: 'test', content: 'concurrent read test' };
      
      // Crear archivo para leer
      await this.fileManager.writeJSON(testFile, testData, {
        ensureDirectory: true
      });
      
      // Múltiples lecturas concurrentes
      const concurrentReads = 20;
      const promises = Array.from({ length: concurrentReads }, () => 
        this.fileManager.readJSON(testFile)
      );
      
      const results = await Promise.all(promises);
      const allSuccessful = results.every(r => 
        JSON.stringify(r.data) === JSON.stringify(testData)
      );
      
      this.addTestResult(testName, allSuccessful, Date.now() - startTime, {
        reads: concurrentReads,
        successful: results.length
      });
      
    } catch (error) {
      this.addTestResult(testName, false, Date.now() - startTime, error.message);
    }
  }

  /**
   * Test de operaciones mixtas
   */
  private async testMixedOperations(): Promise<void> {
    const testName = 'Mixed Operations';
    const startTime = Date.now();
    
    try {
      const testFile = 'mixed-test.json';
      const initialData = { id: 'test', counter: 0 };
      
      // Crear archivo inicial
      await this.fileManager.writeJSON(testFile, initialData, {
        ensureDirectory: true
      });
      
      // Mezclar lecturas y escrituras
      const operations = [];
      
      // 10 lecturas
      for (let i = 0; i < 10; i++) {
        operations.push(this.fileManager.readJSON(testFile));
      }
      
      // 5 escrituras
      for (let i = 0; i < 5; i++) {
        operations.push(this.fileManager.writeJSON(`${testFile}-write-${i}`, {
          id: `write-${i}`,
          timestamp: Date.now()
        }));
      }
      
      const results = await Promise.all(operations);
      
      // Verificar que todas las operaciones fueron exitosas
      const readsSuccessful = results.slice(0, 10).every(r => r.data && r.data.id === 'test');
      const writesSuccessful = results.slice(10).every(r => r.success);
      
      const success = readsSuccessful && writesSuccessful;
      
      this.addTestResult(testName, success, Date.now() - startTime, {
        readsSuccessful,
        writesSuccessful,
        totalOperations: results.length
      });
      
    } catch (error) {
      this.addTestResult(testName, false, Date.now() - startTime, error.message);
    }
  }

  /**
   * Test de integridad de datos
   */
  private async testDataIntegrity(): Promise<void> {
    const testName = 'Data Integrity';
    const startTime = Date.now();
    
    try {
      const testFile = 'integrity-test.json';
      const iterations = 50;
      let integrityMaintained = true;
      
      // Escribir y leer múltiples veces verificando integridad
      for (let i = 0; i < iterations; i++) {
        const testData = {
          id: `test-${i}`,
          iteration: i,
          timestamp: Date.now(),
          hash: this.generateSimpleHash(`test-${i}-${Date.now()}`)
        };
        
        const writeResult = await this.fileManager.writeJSON(testFile, testData, {
          ensureDirectory: true
        });
        
        const readResult = await this.fileManager.readJSON(testFile);
        
        if (!writeResult.success || 
            JSON.stringify(readResult.data) !== JSON.stringify(testData)) {
          integrityMaintained = false;
          break;
        }
      }
      
      this.addTestResult(testName, integrityMaintained, Date.now() - startTime, {
        iterations,
        integrityMaintained
      });
      
    } catch (error) {
      this.addTestResult(testName, false, Date.now() - startTime, error.message);
    }
  }

  /**
   * Test de rollback en errores
   */
  private async testRollbackOnError(): Promise<void> {
    const testName = 'Rollback on Error';
    const startTime = Date.now();
    
    try {
      const testFile = 'rollback-test.json';
      const initialData = { id: 'test', version: 1 };
      
      // Crear archivo inicial
      await this.fileManager.writeJSON(testFile, initialData, {
        ensureDirectory: true,
        createBackup: true
      });
      
      // Simular error durante escritura (forzar falla de validación ETag)
      let rollbackWorked = false;
      try {
        await this.fileManager.writeJSON(testFile, { id: 'test', version: 2 }, {
          validateEtag: 'wrong-etag'
        });
      } catch (error) {
        // Verificar que el archivo original no fue modificado
        const currentData = await this.fileManager.readJSON(testFile);
        rollbackWorked = JSON.stringify(currentData.data) === JSON.stringify(initialData);
      }
      
      this.addTestResult(testName, rollbackWorked, Date.now() - startTime, {
        rollbackWorked
      });
      
    } catch (error) {
      this.addTestResult(testName, false, Date.now() - startTime, error.message);
    }
  }

  /**
   * Test de manejo de carga
   */
  private async testLoadHandling(): Promise<void> {
    const testName = 'Load Handling';
    const startTime = Date.now();
    
    try {
      const operationsCount = 100;
      const promises = [];
      
      // Generar carga mixta
      for (let i = 0; i < operationsCount; i++) {
        if (i % 3 === 0) {
          // Escritura
          promises.push(this.fileManager.writeJSON(`load-test-${i}.json`, {
            id: `load-${i}`,
            timestamp: Date.now()
          }, { ensureDirectory: true }));
        } else {
          // Lectura (crear archivo primero si no existe)
          const file = `load-test-${Math.floor(i / 3) * 3}.json`;
          promises.push(this.fileManager.readJSON(file).catch(() => ({ data: null })));
        }
      }
      
      const results = await Promise.all(promises);
      const successRate = results.filter(r => 
        (r.success !== undefined && r.success) || r.data !== null
      ).length / results.length;
      
      const success = successRate > 0.95; // 95% success rate
      
      this.addTestResult(testName, success, Date.now() - startTime, {
        operations: operationsCount,
        successRate: Math.round(successRate * 100) / 100,
        opsPerSecond: Math.round(operationsCount / ((Date.now() - startTime) / 1000))
      });
      
    } catch (error) {
      this.addTestResult(testName, false, Date.now() - startTime, error.message);
    }
  }

  /**
   * Test de performance del caché
   */
  private async testCachePerformance(): Promise<void> {
    const testName = 'Cache Performance';
    const startTime = Date.now();
    
    try {
      const testData = { id: 'cache-test', content: 'test data' };
      const cacheKey = 'cache-test-key';
      const iterations = 1000;
      
      // Test de set/get básico
      this.cacheManager.set(cacheKey, testData);
      const cachedData = this.cacheManager.get(cacheKey);
      
      // Test de múltiples operaciones
      let hits = 0;
      for (let i = 0; i < iterations; i++) {
        this.cacheManager.set(`key-${i}`, { id: i, data: `test-${i}` });
        const retrieved = this.cacheManager.get(`key-${i}`);
        if (retrieved && retrieved.id === i) {
          hits++;
        }
      }
      
      const stats = this.cacheManager.getStats();
      const success = JSON.stringify(cachedData) === JSON.stringify(testData) &&
                     hits === iterations &&
                     stats.hitRate > 0.95;
      
      this.addTestResult(testName, success, Date.now() - startTime, {
        hits,
        iterations,
        hitRate: stats.hitRate,
        cacheSize: stats.size
      });
      
    } catch (error) {
      this.addTestResult(testName, false, Date.now() - startTime, error.message);
    }
  }

  /**
   * Test de validación bajo carga
   */
  private async testValidationUnderLoad(): Promise<void> {
    const testName = 'Validation Under Load';
    const startTime = Date.now();
    
    try {
      const testData = {
        authors: [{ id: 'author1', name: 'Test Author', role: 'Writer' }],
        categories: [{ id: 'cat1', name: 'Test Category', slug: 'test-category' }],
        articles: [{
          id: 'article1',
          title: 'Test Article',
          author_id: 'author1',
          category: 'cat1',
          status: 'published'
        }]
      };
      
      const validations = [];
      const validationCount = 50;
      
      // Múltiples validaciones concurrentes
      for (let i = 0; i < validationCount; i++) {
        validations.push(this.validator.validate(testData, 'newsletter', {
          migrationMode: true,
          autoFix: true
        }));
      }
      
      const results = await Promise.all(validations);
      const successRate = results.filter(r => r.valid || r.stats.compatibilityLevel !== 'low').length / results.length;
      
      const success = successRate > 0.9; // 90% success rate
      
      this.addTestResult(testName, success, Date.now() - startTime, {
        validations: validationCount,
        successRate: Math.round(successRate * 100) / 100,
        averageErrors: results.reduce((sum, r) => sum + r.errors.length, 0) / results.length
      });
      
    } catch (error) {
      this.addTestResult(testName, false, Date.now() - startTime, error.message);
    }
  }

  /**
   * Agregar resultado de test
   */
  private addTestResult(name: string, passed: boolean, duration: number, details?: any): void {
    this.testResults.push({
      name,
      passed,
      duration,
      error: passed ? undefined : details,
      details: passed ? details : undefined
    });
  }

  /**
   * Generar hash simple para tests
   */
  private generateSimpleHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  /**
   * Imprimir resultados de tests
   */
  private printTestResults(suite: ConcurrencyTestSuite): void {
    console.log('\n' + '='.repeat(80));
    console.log('📊 RESULTADOS DE TESTS DE CONCURRENCIA');
    console.log('='.repeat(80));
    
    console.log(`\n📈 RESUMEN: ${suite.summary}`);
    console.log(`⏱️  Duración total: ${suite.totalDuration}ms`);
    
    if (suite.passedTests === suite.totalTests) {
      console.log('🎉 TODOS LOS TESTS PASARON');
    } else {
      console.log(`⚠️  ${suite.totalTests - suite.passedTests} tests fallaron`);
    }
    
    console.log('\n📋 DETALLES POR TEST:');
    for (const test of suite.tests) {
      const status = test.passed ? '✅' : '❌';
      const duration = `${test.duration}ms`;
      console.log(`   ${status} ${test.name.padEnd(25)} (${duration})`);
      
      if (!test.passed && test.error) {
        console.log(`      Error: ${test.error}`);
      }
      
      if (test.details) {
        const details = typeof test.details === 'object' 
          ? Object.entries(test.details).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(', ')
          : String(test.details);
        console.log(`      ${details}`);
      }
    }
    
    console.log('\n' + '='.repeat(80));
  }
}

// Función helper para ejecutar tests
export async function runConcurrencyTests(): Promise<ConcurrencyTestSuite> {
  const tester = new ConcurrencyTester();
  return await tester.runAllTests();
}