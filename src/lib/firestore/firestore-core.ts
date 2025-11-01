/**
 * Servicio central de Firestore - Corazón de todas las operaciones CRUD
 * Proporciona métodos genéricos para leer, crear, editar y eliminar datos
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  writeBatch,
  QueryDocumentSnapshot,
  WhereFilterOp,
  OrderByDirection
} from 'firebase/firestore';

import { db } from '@/lib/firebase/config';

// Verificar si tenemos credenciales válidas para Firestore
const hasValidFirestoreCredentials = (
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID.includes('demo-project') &&
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  !process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes('demo')
);

// Interfaces para respuestas
export interface FirestoreResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface QueryFilter {
  field: string;
  operator: WhereFilterOp;
  value: any;
}

export interface QueryOrder {
  field: string;
  direction?: OrderByDirection;
}

export interface QueryOptions {
  filters?: QueryFilter[];
  orderBy?: QueryOrder[];
  limitTo?: number;
  startAfterDoc?: QueryDocumentSnapshot;
}

/**
 * Servicio central para todas las operaciones de Firestore
 */
export class FirestoreCore {

  /**
   * ========================================
   * OPERACIONES DE LECTURA
   * ========================================
   */

  /**
   * Obtiene un documento por ID
   */
  static async getDocumentById<T = any>(
    collectionName: string,
    documentId: string
  ): Promise<FirestoreResponse<T>> {
    if (!hasValidFirestoreCredentials) {
      return {
        success: false,
        message: 'Credenciales de Firestore no válidas',
        error: 'NO_CREDENTIALS'
      };
    }

    try {
      console.log(`🔍 [FirestoreCore] Obteniendo documento: ${collectionName}/${documentId}`);

      const docRef = doc(db, collectionName, documentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const docData = docSnap.data() as Record<string, any>;
        const data = {
          id: docSnap.id,
          ...docData,
          // Convertir timestamps automáticamente
          createdAt: docData.createdAt?.toDate?.() || null,
          updatedAt: docData.updatedAt?.toDate?.() || null
        } as T;

        console.log(`✅ [FirestoreCore] Documento encontrado: ${documentId}`);
        return {
          success: true,
          message: 'Documento obtenido exitosamente',
          data
        };
      }

      console.warn(`⚠️ [FirestoreCore] Documento no encontrado: ${documentId}`);
      return {
        success: false,
        message: 'Documento no encontrado',
        error: 'NOT_FOUND'
      };
    } catch (error) {
      console.error(`❌ [FirestoreCore] Error obteniendo documento:`, error);
      return {
        success: false,
        message: 'Error al obtener documento',
        error: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      };
    }
  }

  /**
   * Obtiene múltiples documentos con filtros y opciones
   */
  static async getDocuments<T = any>(
    collectionName: string,
    options: QueryOptions = {}
  ): Promise<FirestoreResponse<T[]>> {
    if (!hasValidFirestoreCredentials) {
      return {
        success: false,
        message: 'Credenciales de Firestore no válidas',
        error: 'NO_CREDENTIALS'
      };
    }

    try {
      console.log(`🔍 [FirestoreCore] Obteniendo documentos de: ${collectionName}`);

      const collectionRef = collection(db, collectionName);
      let queryRef: any = collectionRef;

      // Aplicar filtros
      if (options.filters) {
        for (const filter of options.filters) {
          queryRef = query(queryRef, where(filter.field, filter.operator, filter.value));
        }
      }

      // Aplicar ordenamiento
      if (options.orderBy) {
        for (const order of options.orderBy) {
          queryRef = query(queryRef, orderBy(order.field, order.direction || 'asc'));
        }
      }

      // Aplicar límite
      if (options.limitTo) {
        queryRef = query(queryRef, limit(options.limitTo));
      }

      // Aplicar paginación
      if (options.startAfterDoc) {
        queryRef = query(queryRef, startAfter(options.startAfterDoc));
      }

      const querySnapshot = await getDocs(queryRef);
      const documents = querySnapshot.docs.map(doc => {
        const docData = doc.data() as Record<string, any>;
        return {
          id: doc.id,
          ...docData,
          // Convertir timestamps automáticamente
          createdAt: docData.createdAt?.toDate?.() || null,
          updatedAt: docData.updatedAt?.toDate?.() || null
        } as T;
      });

      console.log(`✅ [FirestoreCore] ${documents.length} documentos obtenidos de ${collectionName}`);
      return {
        success: true,
        message: `${documents.length} documentos obtenidos exitosamente`,
        data: documents
      };
    } catch (error) {
      console.error(`❌ [FirestoreCore] Error obteniendo documentos:`, error);
      return {
        success: false,
        message: 'Error al obtener documentos',
        error: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      };
    }
  }

  /**
   * ========================================
   * OPERACIONES DE CREACIÓN
   * ========================================
   */

  /**
   * Crea un nuevo documento con ID automático
   */
  static async createDocument<T = any>(
    collectionName: string,
    data: any
  ): Promise<FirestoreResponse<T>> {
    if (!hasValidFirestoreCredentials) {
      return {
        success: false,
        message: 'Credenciales de Firestore no válidas',
        error: 'NO_CREDENTIALS'
      };
    }

    try {
      console.log(`📝 [FirestoreCore] Creando documento en: ${collectionName}`);

      const collectionRef = collection(db, collectionName);
      const documentData = {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collectionRef, documentData);

      console.log(`✅ [FirestoreCore] Documento creado con ID: ${docRef.id}`);
      return {
        success: true,
        message: 'Documento creado exitosamente',
        data: { id: docRef.id, ...documentData } as T
      };
    } catch (error) {
      console.error(`❌ [FirestoreCore] Error creando documento:`, error);
      return {
        success: false,
        message: 'Error al crear documento',
        error: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      };
    }
  }

  /**
   * Crea un documento con ID específico
   */
  static async createDocumentWithId<T = any>(
    collectionName: string,
    documentId: string,
    data: any,
    merge: boolean = false
  ): Promise<FirestoreResponse<T>> {
    if (!hasValidFirestoreCredentials) {
      return {
        success: false,
        message: 'Credenciales de Firestore no válidas',
        error: 'NO_CREDENTIALS'
      };
    }

    try {
      console.log(`📝 [FirestoreCore] Creando documento: ${collectionName}/${documentId}`);

      const docRef = doc(db, collectionName, documentId);
      const documentData = {
        ...data,
        createdAt: merge ? data.createdAt || Timestamp.now() : Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await setDoc(docRef, documentData, { merge });

      console.log(`✅ [FirestoreCore] Documento creado: ${documentId}`);
      return {
        success: true,
        message: 'Documento creado exitosamente',
        data: { id: documentId, ...documentData } as T
      };
    } catch (error) {
      console.error(`❌ [FirestoreCore] Error creando documento:`, error);
      return {
        success: false,
        message: 'Error al crear documento',
        error: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      };
    }
  }

  /**
   * ========================================
   * OPERACIONES DE ACTUALIZACIÓN
   * ========================================
   */

  /**
   * Actualiza un documento existente
   */
  static async updateDocument<T = any>(
    collectionName: string,
    documentId: string,
    data: any
  ): Promise<FirestoreResponse<T>> {
    if (!hasValidFirestoreCredentials) {
      return {
        success: false,
        message: 'Credenciales de Firestore no válidas',
        error: 'NO_CREDENTIALS'
      };
    }

    try {
      console.log(`✏️ [FirestoreCore] Actualizando documento: ${collectionName}/${documentId}`);

      const docRef = doc(db, collectionName, documentId);
      const updateData = {
        ...data,
        updatedAt: Timestamp.now()
      };

      await updateDoc(docRef, updateData);

      console.log(`✅ [FirestoreCore] Documento actualizado: ${documentId}`);
      return {
        success: true,
        message: 'Documento actualizado exitosamente'
      };
    } catch (error) {
      console.error(`❌ [FirestoreCore] Error actualizando documento:`, error);
      return {
        success: false,
        message: 'Error al actualizar documento',
        error: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      };
    }
  }

  /**
   * Reemplaza completamente un documento (equivale a setDoc con merge: false)
   * Preserva createdAt si existe en el documento actual
   */
  static async replaceDocument<T = any>(
    collectionName: string,
    documentId: string,
    data: any
  ): Promise<FirestoreResponse<T>> {
    if (!hasValidFirestoreCredentials) {
      return {
        success: false,
        message: 'Credenciales de Firestore no válidas',
        error: 'NO_CREDENTIALS'
      };
    }

    try {
      console.log(`🔄 [FirestoreCore] Reemplazando documento: ${collectionName}/${documentId}`);

      const docRef = doc(db, collectionName, documentId);

      // Intentar obtener el documento actual para preservar createdAt
      let createdAt = Timestamp.now();
      try {
        const existingDoc = await getDoc(docRef);
        if (existingDoc.exists() && existingDoc.data()?.createdAt) {
          createdAt = existingDoc.data().createdAt;
        }
      } catch (error) {
        // Si no podemos obtener el documento actual, usamos timestamp nuevo
        console.warn(`⚠️ [FirestoreCore] No se pudo obtener createdAt existente, usando nuevo timestamp`);
      }

      const documentData = {
        ...data,
        createdAt: data.createdAt || createdAt, // Preservar si viene en data o usar el existente/nuevo
        updatedAt: Timestamp.now()
      };

      await setDoc(docRef, documentData);

      console.log(`✅ [FirestoreCore] Documento reemplazado: ${documentId}`);
      return {
        success: true,
        message: 'Documento reemplazado exitosamente',
        data: { id: documentId, ...documentData } as T
      };
    } catch (error) {
      console.error(`❌ [FirestoreCore] Error reemplazando documento:`, error);
      return {
        success: false,
        message: 'Error al reemplazar documento',
        error: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      };
    }
  }

  /**
   * ========================================
   * OPERACIONES DE ELIMINACIÓN
   * ========================================
   */

  /**
   * Elimina un documento
   */
  static async deleteDocument(
    collectionName: string,
    documentId: string
  ): Promise<FirestoreResponse> {
    if (!hasValidFirestoreCredentials) {
      return {
        success: false,
        message: 'Credenciales de Firestore no válidas',
        error: 'NO_CREDENTIALS'
      };
    }

    try {
      console.log(`🗑️ [FirestoreCore] Eliminando documento: ${collectionName}/${documentId}`);

      const docRef = doc(db, collectionName, documentId);
      await deleteDoc(docRef);

      console.log(`✅ [FirestoreCore] Documento eliminado: ${documentId}`);
      return {
        success: true,
        message: 'Documento eliminado exitosamente'
      };
    } catch (error) {
      console.error(`❌ [FirestoreCore] Error eliminando documento:`, error);
      return {
        success: false,
        message: 'Error al eliminar documento',
        error: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      };
    }
  }

  /**
   * ========================================
   * OPERACIONES ESPECIALES
   * ========================================
   */

  /**
   * Verifica si un documento existe
   */
  static async documentExists(
    collectionName: string,
    documentId: string
  ): Promise<FirestoreResponse<boolean>> {
    if (!hasValidFirestoreCredentials) {
      return {
        success: false,
        message: 'Credenciales de Firestore no válidas',
        error: 'NO_CREDENTIALS'
      };
    }

    try {
      const docRef = doc(db, collectionName, documentId);
      const docSnap = await getDoc(docRef);

      return {
        success: true,
        message: docSnap.exists() ? 'Documento existe' : 'Documento no existe',
        data: docSnap.exists()
      };
    } catch (error) {
      console.error(`❌ [FirestoreCore] Error verificando existencia:`, error);
      return {
        success: false,
        message: 'Error al verificar existencia del documento',
        error: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      };
    }
  }

  /**
   * Cuenta documentos en una colección (con filtros opcionales)
   */
  static async countDocuments(
    collectionName: string,
    filters: QueryFilter[] = []
  ): Promise<FirestoreResponse<number>> {
    try {
      const result = await this.getDocuments(collectionName, { filters });

      if (result.success) {
        return {
          success: true,
          message: `Conteo completado: ${result.data?.length || 0} documentos`,
          data: result.data?.length || 0
        };
      }

      return {
        success: false,
        message: 'Error al contar documentos',
        error: result.error
      };
    } catch (error) {
      console.error(`❌ [FirestoreCore] Error contando documentos:`, error);
      return {
        success: false,
        message: 'Error al contar documentos',
        error: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      };
    }
  }

  /**
   * Operación de escritura por lotes
   */
  static async batchWrite(
    operations: Array<{
      type: 'create' | 'update' | 'delete';
      collection: string;
      documentId?: string;
      data?: any;
    }>
  ): Promise<FirestoreResponse> {
    if (!hasValidFirestoreCredentials) {
      return {
        success: false,
        message: 'Credenciales de Firestore no válidas',
        error: 'NO_CREDENTIALS'
      };
    }

    try {
      console.log(`📦 [FirestoreCore] Ejecutando operación por lotes: ${operations.length} operaciones`);

      const batch = writeBatch(db);

      for (const operation of operations) {
        switch (operation.type) {
          case 'create':
            if (operation.documentId) {
              const createRef = doc(db, operation.collection, operation.documentId);
              batch.set(createRef, {
                ...operation.data,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
              });
            }
            break;

          case 'update':
            if (operation.documentId) {
              const updateRef = doc(db, operation.collection, operation.documentId);
              batch.update(updateRef, {
                ...operation.data,
                updatedAt: Timestamp.now()
              });
            }
            break;

          case 'delete':
            if (operation.documentId) {
              const deleteRef = doc(db, operation.collection, operation.documentId);
              batch.delete(deleteRef);
            }
            break;
        }
      }

      await batch.commit();

      console.log(`✅ [FirestoreCore] Operación por lotes completada`);
      return {
        success: true,
        message: `Operación por lotes completada: ${operations.length} operaciones`
      };
    } catch (error) {
      console.error(`❌ [FirestoreCore] Error en operación por lotes:`, error);
      return {
        success: false,
        message: 'Error en operación por lotes',
        error: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      };
    }
  }

  /**
   * ========================================
   * MÉTODOS DE UTILIDAD
   * ========================================
   */

  /**
   * Convierte un timestamp de Firestore a Date
   */
  static timestampToDate(timestamp: any): Date | null {
    if (!timestamp || typeof timestamp.toDate !== 'function') {
      return null;
    }
    return timestamp.toDate();
  }

  /**
   * Convierte una Date a Timestamp de Firestore
   */
  static dateToTimestamp(date: Date): any {
    return Timestamp.fromDate(date);
  }

  /**
   * Obtiene el timestamp actual
   */
  static now(): any {
    return Timestamp.now();
  }
}

// Exportar instancia singleton para uso directo
export const firestoreCore = FirestoreCore;
export default FirestoreCore;