/**
 * Motor de Migración Unificado
 * Sistema reutilizable para migrar datos JSON a Firestore
 * Compatible con Newsletter, Portfolio, Careers y futuros sistemas
 */

import { Timestamp, writeBatch, collection, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

// Tipos para el motor de migración
export interface MigrationConfig {
  systemName: string;
  collections: CollectionConfig[];
  dryRun?: boolean;
  batchSize?: number;
}

export interface CollectionConfig {
  name: string;
  data: any[];
  transformer: (item: any, context?: MigrationContext) => any;
  validator: (item: any) => ValidationResult;
  dependencies?: string[]; // Colecciones que deben migrarse primero
}

export interface MigrationContext {
  systemName: string;
  collectionName: string;
  totalItems: number;
  currentIndex: number;
  idMapping: Map<string, string>; // originalId -> firestoreId
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface MigrationResult {
  success: boolean;
  systemName: string;
  collections: CollectionMigrationResult[];
  totalItems: number;
  migratedItems: number;
  errors: string[];
  warnings: string[];
  duration: number;
  timestamp: Date;
}

export interface CollectionMigrationResult {
  name: string;
  originalCount: number;
  migratedCount: number;
  errors: string[];
  warnings: string[];
  idMapping: { [originalId: string]: string };
}

export interface RelationshipRule {
  parentCollection: string;
  childCollection: string;
  relationField: string;
  calculateMetrics?: boolean;
}

/**
 * Motor de Migración Unificado
 */
export class UnifiedMigrator {
  private idMappings = new Map<string, Map<string, string>>(); // collection -> (originalId -> firestoreId)
  private batchSize: number;

  constructor(batchSize: number = 20) {
    this.batchSize = batchSize;
  }

  /**
   * Ejecutar migración completa de un sistema
   */
  async migrateSystem(config: MigrationConfig): Promise<MigrationResult> {
    console.log(`🚀 Starting migration for system: ${config.systemName}`);
    const startTime = Date.now();

    const result: MigrationResult = {
      success: false,
      systemName: config.systemName,
      collections: [],
      totalItems: 0,
      migratedItems: 0,
      errors: [],
      warnings: [],
      duration: 0,
      timestamp: new Date()
    };

    try {
      // Calcular total de items
      result.totalItems = config.collections.reduce((sum, col) => sum + col.data.length, 0);

      // Ordenar colecciones por dependencias
      const sortedCollections = this.sortCollectionsByDependencies(config.collections);

      // Migrar cada colección
      for (const collectionConfig of sortedCollections) {
        console.log(`📦 Migrating collection: ${collectionConfig.name}`);

        const collectionResult = await this.migrateCollection(collectionConfig, {
          systemName: config.systemName,
          collectionName: collectionConfig.name,
          totalItems: collectionConfig.data.length,
          currentIndex: 0,
          idMapping: this.getCollectionIdMapping(collectionConfig.name)
        }, config.dryRun);

        result.collections.push(collectionResult);
        result.migratedItems += collectionResult.migratedCount;
        result.errors.push(...collectionResult.errors);
        result.warnings.push(...collectionResult.warnings);

        // Store ID mapping for future collections
        this.setCollectionIdMapping(collectionConfig.name, collectionResult.idMapping);
      }

      result.success = result.errors.length === 0;
      result.duration = Date.now() - startTime;

      console.log(`✅ Migration completed for ${config.systemName}:`, {
        success: result.success,
        totalItems: result.totalItems,
        migratedItems: result.migratedItems,
        errors: result.errors.length,
        warnings: result.warnings.length,
        duration: `${result.duration}ms`
      });

      return result;
    } catch (error) {
      result.errors.push(`Fatal error during migration: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.duration = Date.now() - startTime;
      result.success = false;

      console.error('❌ Migration failed:', error);
      return result;
    }
  }

  /**
   * Migrar una colección individual
   */
  async migrateCollection(
    config: CollectionConfig,
    context: MigrationContext,
    dryRun: boolean = false
  ): Promise<CollectionMigrationResult> {
    const result: CollectionMigrationResult = {
      name: config.name,
      originalCount: config.data.length,
      migratedCount: 0,
      errors: [],
      warnings: [],
      idMapping: {}
    };

    try {
      // Validar datos antes de migrar
      const validationResults = config.data.map((item, index) => ({
        index,
        item,
        validation: config.validator(item)
      }));

      // Filtrar items válidos
      const validItems = validationResults.filter(({ validation }) => validation.isValid);
      const invalidItems = validationResults.filter(({ validation }) => !validation.isValid);

      // Reportar items inválidos
      invalidItems.forEach(({ index, validation }) => {
        result.errors.push(`Item ${index}: ${validation.errors.join(', ')}`);
      });

      // Reportar warnings
      validationResults.forEach(({ index, validation }) => {
        validation.warnings.forEach(warning => {
          result.warnings.push(`Item ${index}: ${warning}`);
        });
      });

      if (!dryRun && validItems.length > 0) {
        // Migrar en batches
        const batches = this.createBatches(validItems, this.batchSize);

        for (const batch of batches) {
          await this.migrateBatch(batch, config, context, result);
        }
      }

      result.migratedCount = validItems.length;

      console.log(`📦 Collection ${config.name} migration completed:`, {
        original: result.originalCount,
        migrated: result.migratedCount,
        errors: result.errors.length,
        warnings: result.warnings.length
      });

      return result;
    } catch (error) {
      result.errors.push(`Collection migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }
  }

  /**
   * Migrar un batch de documentos
   */
  private async migrateBatch(
    batchItems: { index: number; item: any; validation: ValidationResult }[],
    config: CollectionConfig,
    context: MigrationContext,
    result: CollectionMigrationResult
  ): Promise<void> {
    const batch = writeBatch(db);
    const collectionRef = collection(db, config.name);

    batchItems.forEach(({ item, index }) => {
      try {
        // Transformar datos
        const transformedItem = config.transformer(item, {
          ...context,
          currentIndex: index
        });

        // Crear documento
        const docRef = doc(collectionRef);
        const documentData = {
          ...transformedItem,
          created_at: Timestamp.now(),
          updated_at: Timestamp.now()
        };

        batch.set(docRef, documentData);

        // Mapear IDs si existe originalId
        if (item.id || item.originalId) {
          const originalId = item.id || item.originalId;
          result.idMapping[originalId] = docRef.id;
        }
      } catch (error) {
        result.errors.push(`Error processing item ${index}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

    // Ejecutar batch
    await batch.commit();
  }

  /**
   * Calcular métricas agregadas después de migración
   */
  async calculateRelations(relationships: RelationshipRule[]): Promise<void> {
    console.log('🔗 Calculating relationships and metrics...');

    for (const relationship of relationships) {
      await this.calculateRelationshipMetrics(relationship);
    }
  }

  /**
   * Calcular métricas de una relación específica
   */
  private async calculateRelationshipMetrics(rule: RelationshipRule): Promise<void> {
    try {
      console.log(`🔗 Processing relationship: ${rule.parentCollection} -> ${rule.childCollection}`);

      // Obtener todos los documentos padre
      const parentCollection = collection(db, rule.parentCollection);
      const parentSnapshot = await getDocs(parentCollection);

      const batch = writeBatch(db);
      let batchCount = 0;

      for (const parentDoc of parentSnapshot.docs) {
        // Contar documentos hijos relacionados
        const childCollection = collection(db, rule.childCollection);
        const childSnapshot = await getDocs(childCollection);

        const relatedCount = childSnapshot.docs.filter(childDoc => {
          const childData = childDoc.data();
          return childData[rule.relationField] === parentDoc.id;
        }).length;

        // Actualizar contador en documento padre
        if (rule.calculateMetrics) {
          batch.update(parentDoc.ref, {
            [`${rule.childCollection.replace(/s$/, '')}_count`]: relatedCount,
            updated_at: Timestamp.now()
          });
          batchCount++;
        }

        // Ejecutar batch cuando esté lleno
        if (batchCount >= this.batchSize) {
          await batch.commit();
          batchCount = 0;
        }
      }

      // Ejecutar batch final
      if (batchCount > 0) {
        await batch.commit();
      }
    } catch (error) {
      console.error(`Error calculating relationship metrics for ${rule.parentCollection} -> ${rule.childCollection}:`, error);
    }
  }

  /**
   * Validar migración comparando conteos
   */
  async validateMigration(
    collectionName: string,
    expectedCount: number,
    tolerance: number = 0
  ): Promise<ValidationResult> {
    try {
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);
      const actualCount = snapshot.size;

      const difference = Math.abs(actualCount - expectedCount);
      const isValid = difference <= tolerance;

      return {
        isValid,
        errors: isValid ? [] : [`Expected ${expectedCount} documents, found ${actualCount} (difference: ${difference})`],
        warnings: difference > 0 && difference <= tolerance ? [`Small count difference: expected ${expectedCount}, found ${actualCount}`] : []
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: []
      };
    }
  }

  /**
   * Rollback de migración (eliminar documentos migrados)
   */
  async rollback(collectionNames: string[]): Promise<void> {
    console.log('🔄 Starting rollback...');

    for (const collectionName of collectionNames) {
      try {
        console.log(`🗑️ Rolling back collection: ${collectionName}`);

        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);

        const batches = this.createDocumentBatches(snapshot.docs, this.batchSize);

        for (const batch of batches) {
          const deleteBatch = writeBatch(db);
          batch.forEach(doc => deleteBatch.delete(doc.ref));
          await deleteBatch.commit();
        }

        console.log(`✅ Rolled back ${snapshot.size} documents from ${collectionName}`);
      } catch (error) {
        console.error(`Error rolling back ${collectionName}:`, error);
      }
    }

    // Clear ID mappings
    this.idMappings.clear();
  }

  // ==========================================
  // UTILIDADES PRIVADAS
  // ==========================================

  private sortCollectionsByDependencies(collections: CollectionConfig[]): CollectionConfig[] {
    const sorted: CollectionConfig[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (collection: CollectionConfig) => {
      if (visiting.has(collection.name)) {
        throw new Error(`Circular dependency detected involving ${collection.name}`);
      }
      if (visited.has(collection.name)) {
        return;
      }

      visiting.add(collection.name);

      // Visit dependencies first
      if (collection.dependencies) {
        for (const depName of collection.dependencies) {
          const depCollection = collections.find(c => c.name === depName);
          if (depCollection) {
            visit(depCollection);
          }
        }
      }

      visiting.delete(collection.name);
      visited.add(collection.name);
      sorted.push(collection);
    };

    collections.forEach(visit);
    return sorted;
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  private createDocumentBatches(docs: any[], batchSize: number): any[][] {
    return this.createBatches(docs, batchSize);
  }

  private getCollectionIdMapping(collectionName: string): Map<string, string> {
    if (!this.idMappings.has(collectionName)) {
      this.idMappings.set(collectionName, new Map());
    }
    return this.idMappings.get(collectionName)!;
  }

  private setCollectionIdMapping(collectionName: string, mapping: { [originalId: string]: string }): void {
    const mapObj = this.getCollectionIdMapping(collectionName);
    Object.entries(mapping).forEach(([originalId, firestoreId]) => {
      mapObj.set(originalId, firestoreId);
    });
  }
}