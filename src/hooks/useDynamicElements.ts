'use client';

import { useState, useEffect, useCallback } from 'react';
import { BaseCardElement, ElementType, UseDynamicElementsOptions, UseDynamicElementsReturn } from '@/types/dynamic-elements';

export function useDynamicElements<T extends BaseCardElement>(
  type: ElementType,
  options: UseDynamicElementsOptions = {}
): UseDynamicElementsReturn<T> {
  const { autoLoad = true } = options;
  
  const [elements, setElements] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para realizar peticiones a la API
  const apiRequest = async (url: string, options: RequestInit = {}): Promise<any> => {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Error ${response.status}: ${response.statusText}`);
    }

    return data;
  };

  // Cargar elementos
  const refetch = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiRequest(`/api/admin/dynamic-elements/${type}`);
      
      if (data.success && Array.isArray(data.data)) {
        // Ordenar por campo order
        const sortedElements = data.data.sort((a: T, b: T) => {
          const orderA = a.order || 0;
          const orderB = b.order || 0;
          return orderA - orderB;
        });
        
        setElements(sortedElements);
      } else {
        throw new Error('Formato de respuesta inválido');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error cargando elementos:', err);
    } finally {
      setLoading(false);
    }
  }, [type]);

  // Crear elemento
  const create = useCallback(async (elementData: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<void> => {
    try {
      setError(null);

      const data = await apiRequest(`/api/admin/dynamic-elements/${type}`, {
        method: 'POST',
        body: JSON.stringify(elementData),
      });

      if (data.success && data.data) {
        setElements(prev => {
          const newElements = [...prev, data.data];
          // Reordenar por order
          return newElements.sort((a, b) => (a.order || 0) - (b.order || 0));
        });
      } else {
        throw new Error(data.error || 'Error al crear elemento');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    }
  }, [type]);

  // Actualizar elemento
  const update = useCallback(async (id: string, elementData: Partial<T>): Promise<void> => {
    try {
      setError(null);

      const data = await apiRequest(`/api/admin/dynamic-elements/${type}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(elementData),
      });

      if (data.success && data.data) {
        setElements(prev => {
          const newElements = prev.map(element => 
            element.id === id ? data.data : element
          );
          // Reordenar por order
          return newElements.sort((a, b) => (a.order || 0) - (b.order || 0));
        });
      } else {
        throw new Error(data.error || 'Error al actualizar elemento');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    }
  }, [type]);

  // Eliminar elemento
  const deleteElement = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);

      const data = await apiRequest(`/api/admin/dynamic-elements/${type}/${id}`, {
        method: 'DELETE',
      });

      if (data.success) {
        setElements(prev => prev.filter(element => element.id !== id));
      } else {
        throw new Error(data.error || 'Error al eliminar elemento');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    }
  }, [type]);

  // Reordenar elementos
  const reorder = useCallback(async (reorderedElements: T[]): Promise<void> => {
    try {
      setError(null);

      // Actualizar estado local optimistamente
      const previousElements = elements;
      setElements(reorderedElements);

      const data = await apiRequest(`/api/admin/dynamic-elements/${type}`, {
        method: 'PATCH',
        body: JSON.stringify({
          action: 'reorder',
          elements: reorderedElements
        }),
      });

      if (!data.success) {
        // Rollback en caso de error
        setElements(previousElements);
        throw new Error(data.error || 'Error al reordenar elementos');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    }
  }, [type, elements]);

  // Cargar elementos al montar el hook
  useEffect(() => {
    if (autoLoad) {
      refetch();
    }
  }, [autoLoad, refetch]);

  // Retornar la interfaz del hook
  return {
    elements,
    loading,
    error,
    refetch,
    create,
    update,
    delete: deleteElement,
    reorder,
  };
}

// Hook específico para estadísticas (para mantener compatibilidad)
export function useStatistics() {
  return useDynamicElements('statistics');
}

// Hook específico para pilares
export function usePillars() {
  return useDynamicElements('pillars');
}

// Hook específico para políticas  
export function usePolicies() {
  return useDynamicElements('policies');
}

// Hook específico para servicios
export function useServices() {
  return useDynamicElements('services');
}

// Hook específico para proyectos
export function useProjects() {
  return useDynamicElements('projects');
}

// Hook con opciones de paginación (para el futuro)
export function useDynamicElementsWithPagination<T extends BaseCardElement>(
  type: ElementType,
  options: UseDynamicElementsOptions & { page?: number; limit?: number } = {}
) {
  const { page = 1, limit = 10, ...restOptions } = options;
  
  // Por ahora devolvemos todos los elementos, pero en el futuro
  // se puede implementar paginación real en el servidor
  const result = useDynamicElements<T>(type, restOptions);
  
  // Simular paginación en el cliente
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedElements = result.elements.slice(startIndex, endIndex);
  
  return {
    ...result,
    elements: paginatedElements,
    pagination: {
      page,
      limit,
      total: result.elements.length,
      pages: Math.ceil(result.elements.length / limit),
    },
  };
}

export default useDynamicElements;