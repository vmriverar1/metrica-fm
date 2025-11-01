/**
 * Hooks React para administración de Careers/Jobs con Firestore
 * Específicamente diseñados para el panel admin CRUD
 * Siguiendo el mismo patrón que useNewsletterAdmin.ts
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Department,
  JobPosting,
  JobPostingWithRelations,
  JobCategory,
  JobType,
  JobLevel,
  JobStatus
} from '@/types/careers';

// Interface para datos de entrada
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
  postedAt: Date;
  deadline: Date;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
  };
  tags: string;
}

// Interface para respuestas CRUD
interface CRUDResponse {
  exito: boolean;
  mensaje: string;
  data?: any;
}

// Importación dinámica de servicios para evitar errores en SSR
let DepartmentsService: any;
let JobsService: any;

async function initializeServices() {
  if (!DepartmentsService) {
    const services = await import('@/lib/firestore/careers-service');
    DepartmentsService = services.departmentsService;
    JobsService = services.jobsService;
  }
}

// ==========================================
// HOOKS PARA DEPARTAMENTOS
// ==========================================

export interface UseDepartmentsResult {
  departments: Department[];
  loading: boolean;
  error: string | null;
  create: (data: DepartmentData) => Promise<CRUDResponse>;
  update: (id: string, data: Partial<DepartmentData>) => Promise<CRUDResponse>;
  remove: (id: string) => Promise<CRUDResponse>;
  refresh: () => Promise<void>;
  getById: (id: string) => Promise<Department | null>;
}

export function useDepartments(): UseDepartmentsResult {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar todos los departamentos
  const loadDepartments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await initializeServices();
      const data = await DepartmentsService.listarTodos();
      setDepartments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading departments');
      console.error('Error loading departments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear departamento
  const create = useCallback(async (data: DepartmentData): Promise<CRUDResponse> => {
    try {
      await initializeServices();
      const response = await DepartmentsService.crear(data);
      if (response.exito) {
        await loadDepartments(); // Refrescar lista
      }
      return response;
    } catch (err) {
      console.error('Error creating department:', err);
      return {
        exito: false,
        mensaje: err instanceof Error ? err.message : 'Error creating department'
      };
    }
  }, [loadDepartments]);

  // Actualizar departamento
  const update = useCallback(async (id: string, data: Partial<DepartmentData>): Promise<CRUDResponse> => {
    try {
      await initializeServices();
      const response = await DepartmentsService.actualizar(id, data);
      if (response.exito) {
        await loadDepartments(); // Refrescar lista
      }
      return response;
    } catch (err) {
      console.error('Error updating department:', err);
      return {
        exito: false,
        mensaje: err instanceof Error ? err.message : 'Error updating department'
      };
    }
  }, [loadDepartments]);

  // Eliminar departamento
  const remove = useCallback(async (id: string): Promise<CRUDResponse> => {
    try {
      await initializeServices();
      const response = await DepartmentsService.eliminar(id);
      if (response.exito) {
        await loadDepartments(); // Refrescar lista
      }
      return response;
    } catch (err) {
      console.error('Error deleting department:', err);
      return {
        exito: false,
        mensaje: err instanceof Error ? err.message : 'Error deleting department'
      };
    }
  }, [loadDepartments]);

  // Obtener departamento por ID
  const getById = useCallback(async (id: string): Promise<Department | null> => {
    try {
      await initializeServices();
      return await DepartmentsService.obtenerPorId(id);
    } catch (err) {
      console.error('Error getting department by ID:', err);
      return null;
    }
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  return {
    departments,
    loading,
    error,
    create,
    update,
    remove,
    refresh: loadDepartments,
    getById
  };
}

// ==========================================
// HOOKS PARA TRABAJOS
// ==========================================

export interface UseJobsResult {
  jobs: JobPosting[];
  loading: boolean;
  error: string | null;
  create: (data: JobPostingData) => Promise<CRUDResponse>;
  update: (id: string, data: Partial<JobPostingData>) => Promise<CRUDResponse>;
  remove: (id: string) => Promise<CRUDResponse>;
  refresh: () => Promise<void>;
  getById: (id: string) => Promise<JobPosting | null>;
  getBySlug: (slug: string) => Promise<JobPosting | null>;
  getConRelaciones: (id: string) => Promise<JobPostingWithRelations | null>;
}

export function useJobs(): UseJobsResult {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar todos los trabajos
  const loadJobs = useCallback(async () => {
    try {
      console.log('🔄 [useJobs] Iniciando carga de trabajos...');
      setLoading(true);
      setError(null);
      await initializeServices();
      console.log('📦 [useJobs] Servicios inicializados, llamando a listarTodos...');
      const data = await JobsService.listarTodos();
      console.log('📋 [useJobs] Trabajos recibidos:', data);
      setJobs(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading jobs';
      setError(errorMessage);
      console.error('❌ [useJobs] Error loading jobs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear trabajo
  const create = useCallback(async (data: JobPostingData): Promise<CRUDResponse> => {
    try {
      await initializeServices();
      const response = await JobsService.crear(data);
      if (response.exito) {
        await loadJobs(); // Refrescar lista
      }
      return response;
    } catch (err) {
      console.error('Error creating job:', err);
      return {
        exito: false,
        mensaje: err instanceof Error ? err.message : 'Error creating job'
      };
    }
  }, [loadJobs]);

  // Actualizar trabajo
  const update = useCallback(async (id: string, data: Partial<JobPostingData>): Promise<CRUDResponse> => {
    try {
      await initializeServices();
      const response = await JobsService.actualizar(id, data);
      if (response.exito) {
        await loadJobs(); // Refrescar lista
      }
      return response;
    } catch (err) {
      console.error('Error updating job:', err);
      return {
        exito: false,
        mensaje: err instanceof Error ? err.message : 'Error updating job'
      };
    }
  }, [loadJobs]);

  // Eliminar trabajo
  const remove = useCallback(async (id: string): Promise<CRUDResponse> => {
    try {
      await initializeServices();
      const response = await JobsService.eliminar(id);
      if (response.exito) {
        await loadJobs(); // Refrescar lista
      }
      return response;
    } catch (err) {
      console.error('Error deleting job:', err);
      return {
        exito: false,
        mensaje: err instanceof Error ? err.message : 'Error deleting job'
      };
    }
  }, [loadJobs]);

  // Obtener trabajo por ID
  const getById = useCallback(async (id: string): Promise<JobPosting | null> => {
    try {
      await initializeServices();
      return await JobsService.obtenerPorId(id);
    } catch (err) {
      console.error('Error getting job by ID:', err);
      return null;
    }
  }, []);

  // Obtener trabajo por slug
  const getBySlug = useCallback(async (slug: string): Promise<JobPosting | null> => {
    try {
      await initializeServices();
      return await JobsService.getBySlug(slug);
    } catch (err) {
      console.error('Error getting job by slug:', err);
      return null;
    }
  }, []);

  // Obtener trabajo con relaciones
  const getConRelaciones = useCallback(async (id: string): Promise<JobPostingWithRelations | null> => {
    try {
      await initializeServices();
      return await JobsService.getConRelaciones(id);
    } catch (err) {
      console.error('Error getting job with relations:', err);
      return null;
    }
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  return {
    jobs,
    loading,
    error,
    create,
    update,
    remove,
    refresh: loadJobs,
    getById,
    getBySlug,
    getConRelaciones
  };
}

// ==========================================
// HOOKS COMBINADOS PARA ADMINISTRACIÓN
// ==========================================

export interface UseCareersAdminResult {
  // Departamentos
  departments: Department[];
  departmentsLoading: boolean;
  departmentsError: string | null;
  createDepartment: (data: DepartmentData) => Promise<CRUDResponse>;
  updateDepartment: (id: string, data: Partial<DepartmentData>) => Promise<CRUDResponse>;
  removeDepartment: (id: string) => Promise<CRUDResponse>;
  refreshDepartments: () => Promise<void>;
  getDepartmentById: (id: string) => Promise<Department | null>;

  // Trabajos
  jobs: JobPosting[];
  jobsLoading: boolean;
  jobsError: string | null;
  createJob: (data: JobPostingData) => Promise<CRUDResponse>;
  updateJob: (id: string, data: Partial<JobPostingData>) => Promise<CRUDResponse>;
  removeJob: (id: string) => Promise<CRUDResponse>;
  refreshJobs: () => Promise<void>;
  getJobById: (id: string) => Promise<JobPosting | null>;
  getJobConRelaciones: (id: string) => Promise<JobPostingWithRelations | null>;

  // Estado global
  globalLoading: boolean;
  hasErrors: boolean;
}

export function useCareersAdmin(): UseCareersAdminResult {
  const {
    departments,
    loading: departmentsLoading,
    error: departmentsError,
    create: createDepartment,
    update: updateDepartment,
    remove: removeDepartment,
    refresh: refreshDepartments,
    getById: getDepartmentById
  } = useDepartments();

  const {
    jobs,
    loading: jobsLoading,
    error: jobsError,
    create: createJob,
    update: updateJob,
    remove: removeJob,
    refresh: refreshJobs,
    getById: getJobById,
    getConRelaciones: getJobConRelaciones
  } = useJobs();

  const globalLoading = departmentsLoading || jobsLoading;
  const hasErrors = !!(departmentsError || jobsError);

  return {
    departments,
    departmentsLoading,
    departmentsError,
    createDepartment,
    updateDepartment,
    removeDepartment,
    refreshDepartments,
    getDepartmentById,

    jobs,
    jobsLoading,
    jobsError,
    createJob,
    updateJob,
    removeJob,
    refreshJobs,
    getJobById,
    getJobConRelaciones,

    globalLoading,
    hasErrors
  };
}

// ==========================================
// HELPER HOOKS ESPECÍFICOS
// ==========================================

// Hook para obtener solo departamentos activos
export function useActiveDepartments() {
  const [activeDepartments, setActiveDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActiveDepartments = async () => {
      try {
        await initializeServices();
        const departments = await DepartmentsService.getActive();
        setActiveDepartments(departments);
      } catch (error) {
        console.error('Error loading active departments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadActiveDepartments();
  }, []);

  return { activeDepartments, loading };
}

// Hook para obtener trabajos por estado
export function useJobsByStatus(status: JobStatus) {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJobsByStatus = async () => {
      try {
        await initializeServices();
        const jobsData = await JobsService.getByStatus(status);
        setJobs(jobsData);
      } catch (error) {
        console.error(`Error loading jobs with status ${status}:`, error);
      } finally {
        setLoading(false);
      }
    };

    loadJobsByStatus();
  }, [status]);

  return { jobs, loading };
}

// Aliases para mantener consistencia con nombres en español
export const useDepartamentos = useDepartments;
export const useTrabajos = useJobs;
export const useCareersAdministracion = useCareersAdmin;