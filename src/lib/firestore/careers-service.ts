/**
 * Servicios Firestore para Careers/Jobs
 * Implementación completa de CRUD para departamentos y trabajos
 * Siguiendo el mismo patrón que newsletter-service.ts
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
  limit,
  startAfter,
  Timestamp,
  writeBatch,
  increment,
  DocumentReference,
  QueryDocumentSnapshot,
  DocumentSnapshot
} from 'firebase/firestore';

import { db, COLLECTIONS } from '@/lib/firebase/config';
import {
  Department,
  JobPosting,
  JobPostingWithRelations,
  JobCategory,
  JobType,
  JobLevel,
  JobStatus
} from '@/types/careers';
import { CAREERS_FALLBACK, withFallback } from './fallbacks';

// Interface para datos de entrada (sin ID, dates automáticos)
interface DepartmentData {
  name: string;
  description: string;
  slug: string;
  color: string;
  icon: string;
  active: boolean;
}

interface JobPostingData {
  title: string;
  slug: string;
  category: JobCategory;
  departmentId: string;
  authorId: string;
  description: string;
  requirements: string;
  benefits: string;
  type: JobType;
  level: JobLevel;
  status: JobStatus;
  featured: boolean;
  urgent: boolean;
  location: string;
  remote: boolean;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  postedAt?: Date;
  deadline?: Date;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
  };
  tags: string;
}

// Interface para respuestas CRUD
interface CRUDResponse {
  success: boolean;
  message: string;
  data?: any;
}

// ==========================================
// SERVICIO DE DEPARTAMENTOS
// ==========================================

export class DepartmentsService {
  private collectionRef = collection(db, COLLECTIONS.CAREER_DEPARTMENTS);

  async getAll(): Promise<Department[]> {
    return withFallback(
      async () => {
        console.log('🔍 [DepartmentsService] Cargando departamentos desde colección:', COLLECTIONS.CAREER_DEPARTMENTS);

        const querySnapshot = await getDocs(this.collectionRef);
        console.log('📊 [DepartmentsService] Documentos encontrados:', querySnapshot.size);

        const departments = querySnapshot.docs.map(doc => {
          const data = doc.data();
          console.log(`📄 [DepartmentsService] Documento ${doc.id}:`, data);

          return {
            id: doc.id,
            ...data
          } as Department;
        });

        return departments.length > 0 ? departments : CAREERS_FALLBACK.departments;
      },
      CAREERS_FALLBACK.departments,
      'Career Departments'
    );
  }

  async listarTodos(): Promise<Department[]> {
    return this.getAll();
  }

  async crear(data: DepartmentData): Promise<{ exito: boolean; mensaje: string }> {
    const result = await this.create(data);
    return {
      exito: result.success,
      mensaje: result.message
    };
  }

  async actualizar(id: string, data: Partial<DepartmentData>): Promise<{ exito: boolean; mensaje: string }> {
    const result = await this.update(id, data);
    return {
      exito: result.success,
      mensaje: result.message
    };
  }

  async eliminar(id: string): Promise<{ exito: boolean; mensaje: string }> {
    const result = await this.delete(id);
    return {
      exito: result.success,
      mensaje: result.message
    };
  }

  async obtenerPorId(id: string): Promise<Department | null> {
    return this.getById(id);
  }

  async create(data: DepartmentData): Promise<CRUDResponse> {
    try {
      const departmentData = {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await addDoc(this.collectionRef, departmentData);

      return {
        success: true,
        message: 'Departamento creado exitosamente'
      };
    } catch (error) {
      console.error('Error creating department:', error);
      return {
        success: false,
        message: 'Error al crear departamento'
      };
    }
  }

  async getById(id: string): Promise<Department | null> {
    try {
      const docRef = doc(this.collectionRef, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate(),
          updatedAt: docSnap.data().updatedAt?.toDate()
        } as Department;
      }

      return null;
    } catch (error) {
      console.error('Error fetching department by ID:', error);
      throw new Error('Error al cargar departamento');
    }
  }

  async update(id: string, data: Partial<DepartmentData>): Promise<CRUDResponse> {
    try {
      const docRef = doc(this.collectionRef, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });

      return {
        success: true,
        message: 'Departamento actualizado exitosamente'
      };
    } catch (error) {
      console.error('Error updating department:', error);
      return {
        success: false,
        message: 'Error al actualizar departamento'
      };
    }
  }

  async delete(id: string): Promise<CRUDResponse> {
    try {
      const docRef = doc(this.collectionRef, id);
      await deleteDoc(docRef);

      return {
        success: true,
        message: 'Departamento eliminado exitosamente'
      };
    } catch (error) {
      console.error('Error deleting department:', error);
      return {
        success: false,
        message: 'Error al eliminar departamento'
      };
    }
  }

  async getActive(): Promise<Department[]> {
    try {
      const querySnapshot = await getDocs(
        query(
          this.collectionRef,
          where('active', '==', true),
          orderBy('name')
        )
      );

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      } as Department));
    } catch (error) {
      console.error('Error fetching active departments:', error);
      throw new Error('Error al cargar departamentos activos');
    }
  }

  async getBySlug(slug: string): Promise<Department | null> {
    try {
      const q = query(this.collectionRef, where('slug', '==', slug));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      } as Department;
    } catch (error) {
      console.error('Error fetching department by slug:', error);
      throw new Error('Error al cargar departamento por slug');
    }
  }
}

// ==========================================
// SERVICIO DE TRABAJOS
// ==========================================

export class JobsService {
  private collectionRef = collection(db, COLLECTIONS.CAREER_POSITIONS);

  async getAll(): Promise<JobPosting[]> {
    return withFallback(
      async () => {
        console.log('🔍 [JobsService] Cargando trabajos desde colección:', COLLECTIONS.CAREER_POSITIONS);

        const querySnapshot = await getDocs(this.collectionRef);
        console.log('📊 [JobsService] Documentos encontrados:', querySnapshot.size);

        const jobs = querySnapshot.docs.map(doc => {
          const data = doc.data();
          console.log(`📄 [JobsService] Documento ${doc.id}:`, data);

          return {
            id: doc.id,
            ...data
          } as JobPosting;
        });

        return jobs.length > 0 ? jobs : CAREERS_FALLBACK.positions;
      },
      CAREERS_FALLBACK.positions,
      'Career Positions'
    );
  }

  async listarTodos(): Promise<JobPosting[]> {
    return this.getAll();
  }

  async crear(data: JobPostingData): Promise<{ exito: boolean; mensaje: string }> {
    const result = await this.create(data);
    return {
      exito: result.success,
      mensaje: result.message
    };
  }

  async actualizar(id: string, data: Partial<JobPostingData>): Promise<{ exito: boolean; mensaje: string }> {
    const result = await this.update(id, data);
    return {
      exito: result.success,
      mensaje: result.message
    };
  }

  async eliminar(id: string): Promise<{ exito: boolean; mensaje: string }> {
    const result = await this.delete(id);
    return {
      exito: result.success,
      mensaje: result.message
    };
  }

  async obtenerPorId(id: string): Promise<JobPosting | null> {
    return this.getById(id);
  }

  async create(data: JobPostingData): Promise<CRUDResponse> {
    try {
      const jobData: any = {
        ...data,
        postedAt: data.postedAt ? Timestamp.fromDate(data.postedAt) : Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      // Solo agregar deadline si está definido
      if (data.deadline) {
        jobData.deadline = Timestamp.fromDate(data.deadline);
      }

      await addDoc(this.collectionRef, jobData);

      return {
        success: true,
        message: 'Trabajo creado exitosamente'
      };
    } catch (error) {
      console.error('Error creating job:', error);
      return {
        success: false,
        message: 'Error al crear trabajo'
      };
    }
  }

  async getById(id: string): Promise<JobPosting | null> {
    try {
      const docRef = doc(this.collectionRef, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          postedAt: docSnap.data().postedAt?.toDate(),
          deadline: docSnap.data().deadline?.toDate(),
          createdAt: docSnap.data().createdAt?.toDate(),
          updatedAt: docSnap.data().updatedAt?.toDate()
        } as JobPosting;
      }

      return null;
    } catch (error) {
      console.error('Error fetching job by ID:', error);
      throw new Error('Error al cargar trabajo');
    }
  }

  async update(id: string, data: Partial<JobPostingData>): Promise<CRUDResponse> {
    try {
      const docRef = doc(this.collectionRef, id);
      const updateData: any = {
        ...data,
        updatedAt: Timestamp.now()
      };

      // Convert dates if provided
      if (data.postedAt) {
        updateData.postedAt = Timestamp.fromDate(data.postedAt);
      }
      if (data.deadline) {
        updateData.deadline = Timestamp.fromDate(data.deadline);
      }

      await updateDoc(docRef, updateData);

      return {
        success: true,
        message: 'Trabajo actualizado exitosamente'
      };
    } catch (error) {
      console.error('Error updating job:', error);
      return {
        success: false,
        message: 'Error al actualizar trabajo'
      };
    }
  }

  async delete(id: string): Promise<CRUDResponse> {
    try {
      const docRef = doc(this.collectionRef, id);
      await deleteDoc(docRef);

      return {
        success: true,
        message: 'Trabajo eliminado exitosamente'
      };
    } catch (error) {
      console.error('Error deleting job:', error);
      return {
        success: false,
        message: 'Error al eliminar trabajo'
      };
    }
  }

  // Método para obtener con relaciones (similar al newsletter)
  async getConRelaciones(id: string): Promise<JobPostingWithRelations | null> {
    try {
      const job = await this.getById(id);
      if (!job) return null;

      // Obtener department
      const departmentsService = new DepartmentsService();
      const department = await departmentsService.getById(job.departmentId);

      // Para el autor, por ahora usaremos datos mock (se puede integrar con usuarios después)
      const author = {
        id: job.authorId,
        name: 'Admin User',
        email: 'admin@metrica-dip.com'
      };

      return {
        ...job,
        department: department!,
        author
      };
    } catch (error) {
      console.error('Error fetching job with relations:', error);
      throw new Error('Error al cargar trabajo con relaciones');
    }
  }

  async getBySlug(slug: string): Promise<JobPosting | null> {
    try {
      const q = query(this.collectionRef, where('slug', '==', slug));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        postedAt: doc.data().postedAt?.toDate(),
        deadline: doc.data().deadline?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      } as JobPosting;
    } catch (error) {
      console.error('Error fetching job by slug:', error);
      throw new Error('Error al cargar trabajo por slug');
    }
  }

  async getByStatus(status: JobStatus): Promise<JobPosting[]> {
    try {
      const q = query(
        this.collectionRef,
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        postedAt: doc.data().postedAt?.toDate(),
        deadline: doc.data().deadline?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      } as JobPosting));
    } catch (error) {
      console.error('Error fetching jobs by status:', error);
      throw new Error('Error al cargar trabajos por estado');
    }
  }

  async getActive(): Promise<JobPosting[]> {
    return this.getByStatus('active');
  }

  async getFeatured(): Promise<JobPosting[]> {
    try {
      const q = query(
        this.collectionRef,
        where('status', '==', 'active'),
        where('featured', '==', true),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        postedAt: doc.data().postedAt?.toDate(),
        deadline: doc.data().deadline?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      } as JobPosting));
    } catch (error) {
      console.error('Error fetching featured jobs:', error);
      throw new Error('Error al cargar trabajos destacados');
    }
  }

  async getByCategory(category: JobCategory): Promise<JobPosting[]> {
    try {
      const q = query(
        this.collectionRef,
        where('category', '==', category),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        postedAt: doc.data().postedAt?.toDate(),
        deadline: doc.data().deadline?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      } as JobPosting));
    } catch (error) {
      console.error('Error fetching jobs by category:', error);
      throw new Error('Error al cargar trabajos por categoría');
    }
  }
}

// Instancias exportadas para uso directo
export const DepartamentosService = DepartmentsService;
export const TrabajosService = JobsService;

// Instancias por defecto
export const departmentsService = new DepartmentsService();
export const jobsService = new JobsService();