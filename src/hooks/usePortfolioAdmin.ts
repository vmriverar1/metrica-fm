'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api-client';
import { FirestoreCore } from '@/lib/firestore/firestore-core';

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  category_id?: string;
  status: string;
  featured: boolean;
  featured_order?: number;
  featured_image: string;
  gallery: string[];
  client: string;
  location: string;
  start_date: string;
  end_date: string;
  investment: string;
  area: string;
  team?: string;
  duration?: string;
  tags: string[];
  order: number;
  created_at?: any;
  updated_at?: any;
  full_description?: string;
  technical_details?: string;
  meta_description?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  projects_count?: number;
}

// Hook para manejar proyectos
export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar proyectos
  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/admin/portfolio/projects');
      if (response.success) {
        setProjects(response.data.projects || []);
      } else {
        setError(response.error || 'Error loading projects');
      }
    } catch (err) {
      console.error('Error loading projects:', err);
      setError('Error loading projects');
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener proyecto por ID
  const getById = useCallback(async (id: string): Promise<Project | null> => {
    try {
      const response = await apiClient.get(`/api/admin/portfolio/projects/${id}`);

      if (response.success) {
        return response.data;
      }
      return null;
    } catch (err) {
      console.error('Error loading project:', err);
      return null;
    }
  }, []);

  // Obtener proyecto por slug
  const getBySlug = useCallback(async (slug: string): Promise<Project | null> => {
    try {
      const response = await apiClient.get(`/api/portfolio/projects?slug=${slug}`);
      if (response.success && response.data.projects?.length > 0) {
        return response.data.projects[0];
      }
      return null;
    } catch (err) {
      console.error('Error loading project by slug:', err);
      return null;
    }
  }, []);

  // Crear proyecto
  const create = useCallback(async (data: Partial<Project>) => {
    try {
      const response = await apiClient.post('/api/admin/portfolio/projects', data);
      if (response.success) {
        await loadProjects(); // Recargar lista
      }
      return response;
    } catch (err) {
      console.error('Error creating project:', err);
      return { success: false, error: 'Error creating project' };
    }
  }, [loadProjects]);

  // Actualizar proyecto
  const update = useCallback(async (id: string, data: Partial<Project>) => {
    try {
      const response = await apiClient.put(`/api/admin/portfolio/projects/${id}`, data);
      if (response.success) {
        await loadProjects(); // Recargar lista
      }
      return response;
    } catch (err) {
      console.error('Error updating project:', err);
      return { success: false, error: 'Error updating project' };
    }
  }, [loadProjects]);

  // Eliminar proyecto
  const remove = useCallback(async (id: string) => {
    try {
      const response = await apiClient.delete(`/api/admin/portfolio/projects/${id}`);
      if (response.success) {
        await loadProjects(); // Recargar lista
      }
      return response;
    } catch (err) {
      console.error('Error deleting project:', err);
      return { success: false, error: 'Error deleting project' };
    }
  }, [loadProjects]);

  // Cargar proyectos al montar
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return {
    projects,
    loading,
    error,
    getById,
    getBySlug,
    create,
    update,
    remove,
    refresh: loadProjects
  };
}

// Hook para manejar categorías
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar categorías directamente desde Firestore
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);

      const result = await FirestoreCore.getDocuments('portfolio_categories');

      if (result.success && result.data) {
        setCategories(result.data);
        setError(null);
      } else {
        console.error('❌ [Categories] Error cargando desde Firestore:', result.error);
        setError(result.error || 'Error loading categories');
        setCategories([]);
      }
    } catch (err) {
      console.error('❌ [Categories] Error loading categories:', err);
      setError('Error loading categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener categoría por ID desde Firestore
  const getById = useCallback(async (id: string): Promise<Category | null> => {
    try {
      const result = await FirestoreCore.getDocumentById('portfolio_categories', id);

      if (result.success && result.data) {
        return result.data as Category;
      }

      return null;
    } catch (err) {
      console.error('❌ [Categories] Error loading category:', err);
      return null;
    }
  }, []);

  // Crear categoría en Firestore
  const create = useCallback(async (data: Partial<Category>) => {
    try {
      const result = await FirestoreCore.createDocumentWithId(
        'portfolio_categories',
        data.id || data.slug || '',
        data,
        true
      );

      if (result.success) {
        await loadCategories(); // Recargar lista
        return { success: true, data: result.data };
      }

      return { success: false, error: result.error };
    } catch (err) {
      console.error('Error creating category:', err);
      return { success: false, error: 'Error creating category' };
    }
  }, [loadCategories]);

  // Actualizar categoría en Firestore
  const update = useCallback(async (id: string, data: Partial<Category>) => {
    try {
      const result = await FirestoreCore.updateDocument('portfolio_categories', id, data);

      if (result.success) {
        await loadCategories(); // Recargar lista
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (err) {
      console.error('Error updating category:', err);
      return { success: false, error: 'Error updating category' };
    }
  }, [loadCategories]);

  // Eliminar categoría de Firestore
  const remove = useCallback(async (id: string) => {
    try {
      const result = await FirestoreCore.deleteDocument('portfolio_categories', id);

      if (result.success) {
        await loadCategories(); // Recargar lista
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (err) {
      console.error('Error deleting category:', err);
      return { success: false, error: 'Error deleting category' };
    }
  }, [loadCategories]);

  // Cargar categorías al montar
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    loading,
    error,
    getById,
    create,
    update,
    remove,
    refresh: loadCategories
  };
}