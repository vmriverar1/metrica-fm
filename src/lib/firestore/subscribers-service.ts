/**
 * Servicio de Suscriptores
 * Gestiona la colección de suscriptores del newsletter
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
  orderBy,
  Timestamp,
  QueryDocumentSnapshot
} from 'firebase/firestore';

import { db } from '@/lib/firebase/config';
import { FirestoreCore } from './firestore-core';

export interface Subscriber {
  id: string;
  email: string;
  name?: string;
  status: 'active' | 'unsubscribed' | 'bounced';
  subscribed_at: Timestamp;
  unsubscribed_at?: Timestamp;
  source?: string; // De dónde vino la suscripción (landing, popup, etc.)
  tags?: string[]; // Etiquetas para segmentación
  metadata?: Record<string, any>;
}

export interface SubscriberData {
  email: string;
  name?: string;
  status?: 'active' | 'unsubscribed' | 'bounced';
  source?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface EmailConfig {
  id: string;
  recipients: string[]; // Emails que recibirán notificaciones
  notify_on_subscribe: boolean;
  notify_on_unsubscribe: boolean;
  updated_at: Timestamp;
}

export class SubscribersService {
  private static readonly COLLECTION = 'subscribers';
  private static readonly CONFIG_DOC = 'email_config';
  private static readonly CONFIG_COLLECTION = 'config';

  /**
   * Obtener todos los suscriptores
   */
  static async getAll(): Promise<Subscriber[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        orderBy('subscribed_at', 'desc')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Subscriber));
    } catch (error) {
      console.error('Error getting subscribers:', error);
      throw error;
    }
  }

  /**
   * Obtener suscriptores activos
   */
  static async getActive(): Promise<Subscriber[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('status', '==', 'active'),
        orderBy('subscribed_at', 'desc')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Subscriber));
    } catch (error) {
      console.error('Error getting active subscribers:', error);
      throw error;
    }
  }

  /**
   * Obtener un suscriptor por ID
   */
  static async getById(id: string): Promise<Subscriber | null> {
    try {
      const docRef = doc(db, this.COLLECTION, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Subscriber;
      }

      return null;
    } catch (error) {
      console.error('Error getting subscriber:', error);
      throw error;
    }
  }

  /**
   * Obtener suscriptor por email
   */
  static async getByEmail(email: string): Promise<Subscriber | null> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('email', '==', email.toLowerCase())
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as Subscriber;
    } catch (error) {
      console.error('Error getting subscriber by email:', error);
      throw error;
    }
  }

  /**
   * Agregar nuevo suscriptor
   */
  static async add(data: SubscriberData): Promise<string> {
    try {
      // Verificar si ya existe
      const existing = await this.getByEmail(data.email);
      if (existing) {
        // Si existe pero está desuscrito, reactivar
        if (existing.status === 'unsubscribed') {
          await this.update(existing.id, {
            status: 'active',
            unsubscribed_at: undefined
          });
          return existing.id;
        }
        throw new Error('El email ya está suscrito');
      }

      const docRef = await addDoc(collection(db, this.COLLECTION), {
        ...data,
        email: data.email.toLowerCase(),
        status: data.status || 'active',
        subscribed_at: Timestamp.now(),
        tags: data.tags || [],
        metadata: data.metadata || {}
      });

      return docRef.id;
    } catch (error) {
      console.error('Error adding subscriber:', error);
      throw error;
    }
  }

  /**
   * Actualizar suscriptor
   */
  static async update(id: string, data: Partial<SubscriberData>): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, id);
      const updateData: any = { ...data };

      // Si se está desuscribiendo, agregar timestamp
      if (data.status === 'unsubscribed' && !updateData.unsubscribed_at) {
        updateData.unsubscribed_at = Timestamp.now();
      }

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating subscriber:', error);
      throw error;
    }
  }

  /**
   * Eliminar suscriptor
   */
  static async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      throw error;
    }
  }

  /**
   * Desuscribir por email
   */
  static async unsubscribe(email: string): Promise<void> {
    try {
      const subscriber = await this.getByEmail(email);
      if (!subscriber) {
        throw new Error('Suscriptor no encontrado');
      }

      await this.update(subscriber.id, {
        status: 'unsubscribed'
      });
    } catch (error) {
      console.error('Error unsubscribing:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas
   */
  static async getStats(): Promise<{
    total: number;
    active: number;
    unsubscribed: number;
    bounced: number;
  }> {
    try {
      const all = await this.getAll();

      return {
        total: all.length,
        active: all.filter(s => s.status === 'active').length,
        unsubscribed: all.filter(s => s.status === 'unsubscribed').length,
        bounced: all.filter(s => s.status === 'bounced').length
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      throw error;
    }
  }

  // ==================== EMAIL CONFIG ====================

  /**
   * Obtener configuración de emails
   */
  static async getEmailConfig(): Promise<EmailConfig | null> {
    try {
      const result = await FirestoreCore.getDocumentById<EmailConfig>(
        this.CONFIG_COLLECTION,
        this.CONFIG_DOC
      );

      if (result.success && result.data) {
        return result.data;
      }

      // Retornar config por defecto si no existe
      return {
        id: this.CONFIG_DOC,
        recipients: [],
        notify_on_subscribe: true,
        notify_on_unsubscribe: false,
        updated_at: Timestamp.now()
      };
    } catch (error) {
      console.error('Error getting email config:', error);
      throw error;
    }
  }

  /**
   * Actualizar o crear configuración de emails
   */
  static async updateEmailConfig(data: Partial<EmailConfig>): Promise<void> {
    try {
      const configData = {
        recipients: data.recipients || [],
        notify_on_subscribe: data.notify_on_subscribe ?? true,
        notify_on_unsubscribe: data.notify_on_unsubscribe ?? false,
        updated_at: Timestamp.now()
      };

      // Usar createDocumentWithId con merge: true para crear o actualizar
      const result = await FirestoreCore.createDocumentWithId(
        this.CONFIG_COLLECTION,
        this.CONFIG_DOC,
        configData,
        true // merge: true para actualizar si existe, crear si no existe
      );

      if (!result.success) {
        throw new Error(result.error || 'Error al actualizar configuración');
      }
    } catch (error) {
      console.error('Error updating email config:', error);
      throw error;
    }
  }

  /**
   * Crear configuración de emails si no existe (ahora usa updateEmailConfig)
   */
  static async createEmailConfig(data: Partial<EmailConfig>): Promise<void> {
    // Simplemente llamar a updateEmailConfig ya que ahora hace merge
    return this.updateEmailConfig(data);
  }
}
