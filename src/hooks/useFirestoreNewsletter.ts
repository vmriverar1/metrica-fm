/**
 * Hooks React para gestionar Newsletter/Blog con Firestore
 * Compatible con la interfaz existente de BlogService
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  AutoresService, 
  CategoriasService, 
  ArticulosService,
  NewsletterStatsService 
} from '@/lib/firestore/newsletter-service';
import { isDemoMode } from '@/lib/firebase/config';
import { 
  Autor, 
  Categoria, 
  Articulo,
  ArticuloConRelaciones,
  NewsletterFilters 
} from '@/types/newsletter';

// Mapeo de tipos Newsletter → Blog para compatibilidad
import { BlogPost, Author, BlogStats, BlogFilters } from '@/types/blog';

/**
 * Convertir tipos de Newsletter a Blog para compatibilidad
 */
function convertAutorToAuthor(autor: Autor): Author {
  return {
    id: autor.id,
    name: autor.name,
    role: autor.role,
    bio: autor.bio,
    avatar: autor.avatar,
    email: autor.email,
    linkedin: autor.social?.linkedin
  };
}

function convertArticuloToBlogPost(articulo: ArticuloConRelaciones): BlogPost {
  return {
    id: articulo.id,
    title: articulo.title,
    slug: articulo.slug,
    category: articulo.categoria.slug as any,
    tags: articulo.tags || [],
    author: convertAutorToAuthor(articulo.autor),
    publishedAt: articulo.published_date.toDate(),
    updatedAt: articulo.updated_at.toDate(),
    readingTime: articulo.reading_time,
    excerpt: articulo.excerpt,
    content: articulo.content,
    featuredImage: articulo.featured_image,
    seo: {
      metaTitle: articulo.seo?.meta_title || articulo.title,
      metaDescription: articulo.seo?.meta_description || articulo.excerpt,
      keywords: articulo.seo?.keywords || [],
      schemaType: 'Article' as const
    },
    featured: articulo.featured,
    status: articulo.status === 'published' ? 'published' : 'draft'
  };
}

// Hook para obtener todos los artículos
export function useArticulos(filtros: NewsletterFilters = {}) {
  const [articulos, setArticulos] = useState<ArticuloConRelaciones[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarArticulos = useCallback(async () => {
    if (isDemoMode) {
      // En modo demo, devolver array vacío o datos simulados
      setArticulos([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await ArticulosService.listarTodos(filtros);
      setArticulos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando artículos');
      console.error('Error cargando artículos:', err);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    cargarArticulos();
  }, [cargarArticulos]);

  return {
    articulos,
    loading,
    error,
    refrescar: cargarArticulos
  };
}

// Hook para obtener autores
export function useAutores() {
  const [autores, setAutores] = useState<Autor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarAutores = useCallback(async () => {
    if (isDemoMode) {
      setAutores([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await AutoresService.listarTodos();
      setAutores(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando autores');
      console.error('Error cargando autores:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarAutores();
  }, [cargarAutores]);

  return {
    autores,
    loading,
    error,
    refrescar: cargarAutores
  };
}

// Hook para obtener categorías
export function useCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarCategorias = useCallback(async () => {
    if (isDemoMode) {
      setCategorias([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await CategoriasService.listarTodas();
      setCategorias(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando categorías');
      console.error('Error cargando categorías:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarCategorias();
  }, [cargarCategorias]);

  return {
    categorias,
    loading,
    error,
    refrescar: cargarCategorias
  };
}

// Hook para estadísticas del newsletter
export function useNewsletterStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarStats = useCallback(async () => {
    if (isDemoMode) {
      // Stats simuladas en modo demo
      setStats({
        totalArticulos: 0,
        totalAutores: 0,
        totalCategorias: 0,
        articulosPublicados: 0,
        articulosBorrador: 0
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await NewsletterStatsService.obtenerEstadisticas();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando estadísticas');
      console.error('Error cargando estadísticas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarStats();
  }, [cargarStats]);

  return {
    stats,
    loading,
    error,
    refrescar: cargarStats
  };
}

// Hook para operaciones CRUD de artículos
export function useArticuloCRUD() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crearArticulo = useCallback(async (datos: Omit<Articulo, 'id' | 'created_at' | 'updated_at'>) => {
    if (isDemoMode) {
      console.log('Crear artículo simulado:', datos);
      return 'demo-id';
    }

    try {
      setLoading(true);
      setError(null);
      const id = await ArticulosService.crear(datos);
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creando artículo');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const actualizarArticulo = useCallback(async (id: string, datos: Partial<Articulo>) => {
    if (isDemoMode) {
      console.log('Actualizar artículo simulado:', id, datos);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await ArticulosService.actualizar(id, datos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error actualizando artículo');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const eliminarArticulo = useCallback(async (id: string) => {
    if (isDemoMode) {
      console.log('Eliminar artículo simulado:', id);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await ArticulosService.eliminar(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error eliminando artículo');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    crearArticulo,
    actualizarArticulo,
    eliminarArticulo,
    loading,
    error
  };
}

// Hook para operaciones CRUD de autores
export function useAutorCRUD() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crearAutor = useCallback(async (datos: Omit<Autor, 'id' | 'created_at' | 'updated_at'>) => {
    if (isDemoMode) {
      console.log('Crear autor simulado:', datos);
      return 'demo-id';
    }

    try {
      setLoading(true);
      setError(null);
      const id = await AutoresService.crear(datos);
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creando autor');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const actualizarAutor = useCallback(async (id: string, datos: Partial<Autor>) => {
    if (isDemoMode) {
      console.log('Actualizar autor simulado:', id, datos);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await AutoresService.actualizar(id, datos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error actualizando autor');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const eliminarAutor = useCallback(async (id: string) => {
    if (isDemoMode) {
      console.log('Eliminar autor simulado:', id);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await AutoresService.eliminar(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error eliminando autor');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    crearAutor,
    actualizarAutor,
    eliminarAutor,
    loading,
    error
  };
}

// Hook para operaciones CRUD de categorías
export function useCategoriaCRUD() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crearCategoria = useCallback(async (datos: Omit<Categoria, 'id' | 'created_at' | 'updated_at'>) => {
    if (isDemoMode) {
      console.log('Crear categoría simulada:', datos);
      return 'demo-id';
    }

    try {
      setLoading(true);
      setError(null);
      const id = await CategoriasService.crear(datos);
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creando categoría');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const actualizarCategoria = useCallback(async (id: string, datos: Partial<Categoria>) => {
    if (isDemoMode) {
      console.log('Actualizar categoría simulada:', id, datos);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await CategoriasService.actualizar(id, datos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error actualizando categoría');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const eliminarCategoria = useCallback(async (id: string) => {
    if (isDemoMode) {
      console.log('Eliminar categoría simulada:', id);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await CategoriasService.eliminar(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error eliminando categoría');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria,
    loading,
    error
  };
}

// Hook principal que combina todo - compatible con useBlogService
export function useFirestoreNewsletter(filtros: NewsletterFilters = {}) {
  const { articulos, loading: articulosLoading, error: articulosError, refrescar: refrescarArticulos } = useArticulos(filtros);
  const { autores, loading: autoresLoading, refrescar: refrescarAutores } = useAutores();
  const { categorias, loading: categoriasLoading, refrescar: refrescarCategorias } = useCategorias();
  const { stats, loading: statsLoading, refrescar: refrescarStats } = useNewsletterStats();

  // Convertir datos para compatibilidad con BlogService
  const posts: BlogPost[] = articulos.map(convertArticuloToBlogPost);
  const authors: Author[] = autores.map(convertAutorToAuthor);
  
  // Convertir stats para compatibilidad con BlogStats
  const blogStats: BlogStats | null = stats ? {
    totalPosts: stats.totalArticulos || 0,
    publishedPosts: stats.articulosPublicados || 0,
    draftPosts: stats.articulosBorrador || 0,
    totalAuthors: stats.totalAutores || 0,
    totalCategories: stats.totalCategorias || 0,
    avgReadingTime: 5, // Calcular esto después
    totalViews: 0, // Si implementamos views
    lastUpdated: new Date()
  } : null;

  const refresh = useCallback(async () => {
    await Promise.all([
      refrescarArticulos(),
      refrescarAutores(),
      refrescarCategorias(),
      refrescarStats()
    ]);
  }, [refrescarArticulos, refrescarAutores, refrescarCategorias, refrescarStats]);

  const getPostBySlug = useCallback(async (slug: string): Promise<BlogPost | null> => {
    if (isDemoMode) return null;
    
    try {
      const articulo = await ArticulosService.obtenerPorSlug(slug);
      return articulo ? convertArticuloToBlogPost(articulo) : null;
    } catch (err) {
      console.error('Error obteniendo artículo por slug:', err);
      return null;
    }
  }, []);

  return {
    // Datos compatibles con BlogService
    posts,
    authors,
    categories: categorias,
    stats: blogStats,
    
    // Estados de carga
    loading: articulosLoading,
    categoriesLoading: categoriasLoading,
    authorsLoading: autoresLoading,
    statsLoading: statsLoading,
    
    // Error principal
    error: articulosError,
    
    // Acciones
    refresh,
    getPostBySlug,
    
    // Datos originales de Firestore para el admin
    articulos,
    autores,
    categorias: categorias,
    statsOriginales: stats
  };
}