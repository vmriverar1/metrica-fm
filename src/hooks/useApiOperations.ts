'use client';

import { useState, useCallback } from 'react';
import { useNotification } from '@/contexts/NotificationContext';

interface ApiOperationOptions {
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (data?: any) => void;
  onError?: (error: Error) => void;
  showLoading?: boolean;
}

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

export const useApiOperations = () => {
  const [loading, setLoading] = useState(false);
  const { success, error: showError } = useNotification();

  const executeOperation = useCallback(async <T = any>(
    operation: () => Promise<Response>,
    options: ApiOperationOptions = {}
  ): Promise<ApiResponse<T>> => {
    const {
      successMessage,
      errorMessage,
      onSuccess,
      onError,
      showLoading = true
    } = options;

    try {
      if (showLoading) {
        setLoading(true);
      }

      const response = await operation();
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Error ${response.status}: ${response.statusText}`);
      }

      if (successMessage) {
        success(successMessage);
      }

      if (onSuccess) {
        onSuccess(data);
      }

      return { data, success: true };
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Error desconocido');
      
      if (errorMessage || !options.onError) {
        showError(
          errorMessage || 'Error en la operación',
          errorObj.message
        );
      }

      if (onError) {
        onError(errorObj);
      }

      return { error: errorObj.message, success: false };
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [success, showError]);

  // CRUD operations helpers
  const create = useCallback(async <T = any>(
    url: string, 
    data: any, 
    options: ApiOperationOptions = {}
  ): Promise<ApiResponse<T>> => {
    return executeOperation(
      () => fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }),
      {
        successMessage: 'Elemento creado exitosamente',
        errorMessage: 'Error al crear elemento',
        ...options
      }
    );
  }, [executeOperation]);

  const update = useCallback(async <T = any>(
    url: string, 
    data: any, 
    options: ApiOperationOptions = {}
  ): Promise<ApiResponse<T>> => {
    return executeOperation(
      () => fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }),
      {
        successMessage: 'Elemento actualizado exitosamente',
        errorMessage: 'Error al actualizar elemento',
        ...options
      }
    );
  }, [executeOperation]);

  const remove = useCallback(async <T = any>(
    url: string, 
    options: ApiOperationOptions = {}
  ): Promise<ApiResponse<T>> => {
    return executeOperation(
      () => fetch(url, { method: 'DELETE' }),
      {
        successMessage: 'Elemento eliminado exitosamente',
        errorMessage: 'Error al eliminar elemento',
        ...options
      }
    );
  }, [executeOperation]);

  const fetch = useCallback(async <T = any>(
    url: string, 
    options: ApiOperationOptions = {}
  ): Promise<ApiResponse<T>> => {
    return executeOperation(
      () => window.fetch(url),
      {
        errorMessage: 'Error al cargar datos',
        showLoading: false, // Usually we handle fetch loading separately
        ...options
      }
    );
  }, [executeOperation]);

  // Batch operations
  const batchOperation = useCallback(async <T = any>(
    operations: Array<() => Promise<Response>>,
    options: ApiOperationOptions = {}
  ): Promise<ApiResponse<T[]>> => {
    try {
      setLoading(true);
      
      const responses = await Promise.allSettled(
        operations.map(op => op().then(res => res.json()))
      );
      
      const failures = responses.filter(r => r.status === 'rejected');
      
      if (failures.length > 0) {
        throw new Error(`${failures.length} operaciones fallaron`);
      }
      
      const data = responses
        .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
        .map(r => r.value);
      
      if (options.successMessage) {
        success(options.successMessage);
      }
      
      if (options.onSuccess) {
        options.onSuccess(data);
      }
      
      return { data, success: true };
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Error en operación batch');
      
      showError(
        options.errorMessage || 'Error en operaciones múltiples',
        errorObj.message
      );
      
      if (options.onError) {
        options.onError(errorObj);
      }
      
      return { error: errorObj.message, success: false };
    } finally {
      setLoading(false);
    }
  }, [success, showError]);

  return {
    loading,
    executeOperation,
    create,
    update,
    remove,
    fetch,
    batchOperation
  };
};

// Specific hooks for different entities
export const usePortfolioOperations = () => {
  const api = useApiOperations();
  
  return {
    ...api,
    createProject: (data: any) => api.create('/api/admin/portfolio/projects', data, {
      successMessage: 'Proyecto creado exitosamente'
    }),
    updateProject: (id: string, data: any) => api.update(`/api/admin/portfolio/projects/${id}`, data, {
      successMessage: 'Proyecto actualizado exitosamente'
    }),
    deleteProject: (id: string) => api.remove(`/api/admin/portfolio/projects/${id}`, {
      successMessage: 'Proyecto eliminado exitosamente'
    })
  };
};

export const useCareersOperations = () => {
  const api = useApiOperations();
  
  return {
    ...api,
    createJob: (data: any) => api.create('/api/admin/careers/jobs', data, {
      successMessage: 'Empleo creado exitosamente'
    }),
    updateJob: (id: string, data: any) => api.update(`/api/admin/careers/jobs/${id}`, data, {
      successMessage: 'Empleo actualizado exitosamente'
    }),
    deleteJob: (id: string) => api.remove(`/api/admin/careers/jobs/${id}`, {
      successMessage: 'Empleo eliminado exitosamente'
    }),
    createDepartment: (data: any) => api.create('/api/admin/careers/departments', data, {
      successMessage: 'Departamento creado exitosamente'
    }),
    updateDepartment: (id: string, data: any) => api.update(`/api/admin/careers/departments/${id}`, data, {
      successMessage: 'Departamento actualizado exitosamente'
    }),
    deleteDepartment: (id: string) => api.remove(`/api/admin/careers/departments/${id}`, {
      successMessage: 'Departamento eliminado exitosamente'
    })
  };
};

export const useNewsletterOperations = () => {
  const api = useApiOperations();
  
  return {
    ...api,
    createArticle: (data: any) => api.create('/api/admin/newsletter/articles', data, {
      successMessage: 'Artículo creado exitosamente'
    }),
    updateArticle: (id: string, data: any) => api.update(`/api/admin/newsletter/articles/${id}`, data, {
      successMessage: 'Artículo actualizado exitosamente'
    }),
    deleteArticle: (id: string) => api.remove(`/api/admin/newsletter/articles/${id}`, {
      successMessage: 'Artículo eliminado exitosamente'
    }),
    publishArticle: (id: string) => api.update(`/api/admin/newsletter/articles/${id}`, { status: 'published' }, {
      successMessage: 'Artículo publicado exitosamente'
    }),
    unpublishArticle: (id: string) => api.update(`/api/admin/newsletter/articles/${id}`, { status: 'draft' }, {
      successMessage: 'Artículo despublicado exitosamente'
    }),
    createAuthor: (data: any) => api.create('/api/admin/newsletter/authors', data, {
      successMessage: 'Autor creado exitosamente'
    }),
    updateAuthor: (id: string, data: any) => api.update(`/api/admin/newsletter/authors/${id}`, data, {
      successMessage: 'Autor actualizado exitosamente'
    }),
    deleteAuthor: (id: string) => api.remove(`/api/admin/newsletter/authors/${id}`, {
      successMessage: 'Autor eliminado exitosamente'
    }),
    createCategory: (data: any) => api.create('/api/admin/newsletter/categories', data, {
      successMessage: 'Categoría creada exitosamente'
    }),
    updateCategory: (id: string, data: any) => api.update(`/api/admin/newsletter/categories/${id}`, data, {
      successMessage: 'Categoría actualizada exitosamente'
    }),
    deleteCategory: (id: string) => api.remove(`/api/admin/newsletter/categories/${id}`, {
      successMessage: 'Categoría eliminada exitosamente'
    })
  };
};