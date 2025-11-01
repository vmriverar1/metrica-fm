/**
 * Servicio Base Firestore Unificado
 * CRUD genérico para todas las colecciones del sistema
 * Reutilizable para Newsletter, Portfolio, Careers y futuros sistemas
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy as firestoreOrderBy,
  limit,
  startAfter,
  Timestamp,
  writeBatch,
  increment,
  DocumentReference,
  QueryDocumentSnapshot,
  DocumentSnapshot,
  Query,
  WhereFilterOp,
  OrderByDirection
} from 'firebase/firestore';

import { db } from '@/lib/firebase/config';

// Tipos base para el servicio genérico
export interface BaseEntity {
  id: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface BaseData {
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

export interface FilterCondition {
  field: string;
  operator: WhereFilterOp;
  value: any;
}

export interface OrderCondition {
  field: string;
  direction: OrderByDirection;
}

export interface PaginationOptions {
  limit?: number;
  startAfter?: QueryDocumentSnapshot;
}

export interface PaginatedResult<T> {
  items: T[];
  lastDocument: QueryDocumentSnapshot | null;
  hasMore: boolean;
  total?: number;
}

export interface SearchOptions {
  fields: string[];
  query: string;
  caseSensitive?: boolean;
}

export interface CRUDResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Servicio Base Genérico para operaciones CRUD en Firestore
 */
export class BaseFirestoreService<T extends BaseEntity, TData extends BaseData = BaseData> {
  protected collectionName: string;
  protected collectionRef;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
    this.collectionRef = collection(db, collectionName);
  }

  // ==========================================
  // OPERACIONES CRUD BÁSICAS
  // ==========================================

  /**
   * Obtener todos los documentos con filtros opcionales
   */
  async getAll(
    filters?: FilterCondition[],
    orderBy?: OrderCondition[],
    pagination?: PaginationOptions
  ): Promise<T[]> {
    try {
      let q: Query = this.collectionRef;

      // Aplicar filtros
      if (filters) {
        filters.forEach(filter => {
          q = query(q, where(filter.field, filter.operator, filter.value));
        });
      }

      // Aplicar ordenamiento
      if (orderBy) {
        orderBy.forEach(order => {
          q = query(q, firestoreOrderBy(order.field, order.direction));
        });
      }

      // Aplicar paginación
      if (pagination?.limit) {
        q = query(q, limit(pagination.limit));
      }

      if (pagination?.startAfter) {
        q = query(q, startAfter(pagination.startAfter));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
    } catch (error) {
      console.error(`Error getting all ${this.collectionName}:`, error);
      throw new Error(`Failed to fetch ${this.collectionName}`);
    }
  }

  /**
   * Obtener documento por ID
   */
  async getById(id: string): Promise<T | null> {
    try {
      const docRef = doc(this.collectionRef, id);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        return null;
      }

      return {
        id: snapshot.id,
        ...snapshot.data()
      } as T;
    } catch (error) {
      console.error(`Error getting ${this.collectionName} by ID ${id}:`, error);
      throw new Error(`Failed to fetch ${this.collectionName} with ID ${id}`);
    }
  }

  /**
   * Crear nuevo documento
   */
  async create(data: TData): Promise<CRUDResponse<string>> {
    try {
      const now = Timestamp.now();
      const documentData = {
        ...data,
        created_at: now,
        updated_at: now
      };

      const docRef = await addDoc(this.collectionRef, documentData);

      return {
        success: true,
        data: docRef.id,
        message: `${this.collectionName} created successfully`
      };
    } catch (error) {
      console.error(`Error creating ${this.collectionName}:`, error);
      return {
        success: false,
        error: `Failed to create ${this.collectionName}`,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Actualizar documento existente
   */
  async update(id: string, data: Partial<TData>): Promise<CRUDResponse<void>> {
    try {
      const docRef = doc(this.collectionRef, id);
      const updateData = {
        ...data,
        updated_at: Timestamp.now()
      };

      await updateDoc(docRef, updateData);

      return {
        success: true,
        message: `${this.collectionName} updated successfully`
      };
    } catch (error) {
      console.error(`Error updating ${this.collectionName} ${id}:`, error);
      return {
        success: false,
        error: `Failed to update ${this.collectionName}`,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Eliminar documento
   */
  async delete(id: string): Promise<CRUDResponse<void>> {
    try {
      const docRef = doc(this.collectionRef, id);
      await deleteDoc(docRef);

      return {
        success: true,
        message: `${this.collectionName} deleted successfully`
      };
    } catch (error) {
      console.error(`Error deleting ${this.collectionName} ${id}:`, error);
      return {
        success: false,
        error: `Failed to delete ${this.collectionName}`,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ==========================================
  // OPERACIONES AVANZADAS
  // ==========================================

  /**
   * Búsqueda por campos múltiples (simulada)
   * Nota: Firestore no tiene full-text search nativo
   */
  async search(searchTerm: string, searchFields: string[]): Promise<T[]> {
    try {
      // Esta es una implementación básica
      // Para búsqueda real, se recomienda usar Algolia o ElasticSearch
      const allItems = await this.getAll();

      return allItems.filter(item => {
        return searchFields.some(field => {
          const fieldValue = (item as any)[field];
          if (typeof fieldValue === 'string') {
            return fieldValue.toLowerCase().includes(searchTerm.toLowerCase());
          }
          return false;
        });
      });
    } catch (error) {
      console.error(`Error searching ${this.collectionName}:`, error);
      throw new Error(`Failed to search ${this.collectionName}`);
    }
  }

  /**
   * Paginación avanzada con conteo total
   */
  async paginate(
    options: PaginationOptions,
    filters?: FilterCondition[],
    orderBy?: OrderCondition[]
  ): Promise<PaginatedResult<T>> {
    try {
      const items = await this.getAll(filters, orderBy, options);

      // Para obtener hasMore, intentamos obtener un documento más
      const hasMoreQuery = await this.getAll(
        filters,
        orderBy,
        {
          limit: (options.limit || 10) + 1,
          startAfter: options.startAfter
        }
      );

      return {
        items: items.slice(0, options.limit || 10),
        lastDocument: items.length > 0 ?
          ({ id: items[items.length - 1].id } as QueryDocumentSnapshot) : null,
        hasMore: hasMoreQuery.length > (options.limit || 10)
      };
    } catch (error) {
      console.error(`Error paginating ${this.collectionName}:`, error);
      throw new Error(`Failed to paginate ${this.collectionName}`);
    }
  }

  /**
   * Contar documentos con filtros
   */
  async count(filters?: FilterCondition[]): Promise<number> {
    try {
      const items = await this.getAll(filters);
      return items.length;
    } catch (error) {
      console.error(`Error counting ${this.collectionName}:`, error);
      return 0;
    }
  }

  /**
   * Actualizar múltiples documentos en batch
   */
  async batchUpdate(updates: { id: string; data: Partial<TData> }[]): Promise<CRUDResponse<void>> {
    try {
      const batch = writeBatch(db);
      const now = Timestamp.now();

      updates.forEach(update => {
        const docRef = doc(this.collectionRef, update.id);
        batch.update(docRef, {
          ...update.data,
          updated_at: now
        });
      });

      await batch.commit();

      return {
        success: true,
        message: `Batch update completed for ${updates.length} ${this.collectionName} documents`
      };
    } catch (error) {
      console.error(`Error in batch update for ${this.collectionName}:`, error);
      return {
        success: false,
        error: `Failed to batch update ${this.collectionName}`,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Incrementar campo numérico
   */
  async incrementField(id: string, field: string, value: number = 1): Promise<CRUDResponse<void>> {
    try {
      const docRef = doc(this.collectionRef, id);
      await updateDoc(docRef, {
        [field]: increment(value),
        updated_at: Timestamp.now()
      });

      return {
        success: true,
        message: `${field} incremented by ${value}`
      };
    } catch (error) {
      console.error(`Error incrementing ${field} in ${this.collectionName}:`, error);
      return {
        success: false,
        error: `Failed to increment ${field}`,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ==========================================
  // UTILIDADES
  // ==========================================

  /**
   * Verificar si un documento existe
   */
  async exists(id: string): Promise<boolean> {
    try {
      const docRef = doc(this.collectionRef, id);
      const snapshot = await getDoc(docRef);
      return snapshot.exists();
    } catch (error) {
      console.error(`Error checking existence of ${this.collectionName} ${id}:`, error);
      return false;
    }
  }

  /**
   * Obtener referencia del documento
   */
  getDocRef(id?: string): DocumentReference {
    return id ? doc(this.collectionRef, id) : doc(this.collectionRef);
  }

  /**
   * Obtener nombre de la colección
   */
  getCollectionName(): string {
    return this.collectionName;
  }
}