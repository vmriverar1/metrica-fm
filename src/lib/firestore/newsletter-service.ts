/**
 * Servicios Firestore para Newsletter/Blog
 * Implementación completa de CRUD para autores, categorías y artículos
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
  Autor,
  AutorData,
  Categoria,
  CategoriaData,
  Articulo,
  ArticuloData,
  ArticuloConRelaciones,
  NewsletterFilters,
  NewsletterStats,
  CRUDResponse,
  validateAutorData,
  validateCategoriaData,
  validateArticuloData,
  generateSlug,
  calculateReadingTime,
  generateURL,
  generateExcerpt
} from '@/types/newsletter';
import { BLOG_AUTHORS_FALLBACK, BLOG_CATEGORIES_FALLBACK, BLOG_ARTICLES_FALLBACK, withFallback } from './fallbacks';

// ==========================================
// SERVICIO DE AUTORES
// ==========================================

export class AutoresService {
  private collectionRef = collection(db, COLLECTIONS.AUTHORS);

  async getAll(): Promise<Autor[]> {
    return withFallback(
      async () => {
        const querySnapshot = await getDocs(
          query(this.collectionRef, orderBy('created_at', 'desc'))
        );

        const authors = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Autor));

        return authors.length > 0 ? authors : BLOG_AUTHORS_FALLBACK;
      },
      BLOG_AUTHORS_FALLBACK,
      'Blog Authors'
    );
  }

  // Alias para compatibilidad con los hooks
  async listarTodos(): Promise<Autor[]> {
    return this.getAll();
  }

  async crear(data: AutorData): Promise<{ exito: boolean; mensaje: string }> {
    const result = await this.create(data);
    return {
      exito: result.success,
      mensaje: result.message
    };
  }

  async actualizar(id: string, data: Partial<AutorData>): Promise<{ exito: boolean; mensaje: string }> {
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

  async obtenerPorId(id: string): Promise<Autor | null> {
    return this.getById(id);
  }

  async getById(id: string): Promise<Autor | null> {
    try {
      const docRef = doc(this.collectionRef, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Autor;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching author by ID:', error);
      throw new Error('Error al cargar autor');
    }
  }

  async create(data: AutorData): Promise<CRUDResponse<string>> {
    try {
      // Validar datos
      const errors = validateAutorData(data);
      if (errors.length > 0) {
        return {
          success: false,
          message: 'Datos inválidos',
          error: errors.join(', ')
        };
      }

      // Preparar datos para Firestore
      const autorData = {
        ...data,
        articles_count: 0,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      };

      const docRef = await addDoc(this.collectionRef, autorData);

      return {
        success: true,
        message: 'Autor creado exitosamente',
        data: docRef.id
      };
    } catch (error) {
      console.error('Error creating author:', error);
      return {
        success: false,
        message: 'Error al crear autor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async update(id: string, data: Partial<AutorData>): Promise<CRUDResponse<void>> {
    try {
      const docRef = doc(this.collectionRef, id);
      
      // Verificar que el autor existe
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        return {
          success: false,
          message: 'Autor no encontrado'
        };
      }

      const updateData = {
        ...data,
        updated_at: Timestamp.now()
      };

      await updateDoc(docRef, updateData);

      return {
        success: true,
        message: 'Autor actualizado exitosamente'
      };
    } catch (error) {
      console.error('Error updating author:', error);
      return {
        success: false,
        message: 'Error al actualizar autor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async delete(id: string): Promise<CRUDResponse<void>> {
    try {
      // Verificar si el autor tiene artículos asociados
      const articulosQuery = query(
        collection(db, COLLECTIONS.ARTICLES),
        where('author_id', '==', id)
      );
      const articulosSnapshot = await getDocs(articulosQuery);

      if (!articulosSnapshot.empty) {
        return {
          success: false,
          message: 'No se puede eliminar el autor porque tiene artículos asociados'
        };
      }

      const docRef = doc(this.collectionRef, id);
      await deleteDoc(docRef);

      return {
        success: true,
        message: 'Autor eliminado exitosamente'
      };
    } catch (error) {
      console.error('Error deleting author:', error);
      return {
        success: false,
        message: 'Error al eliminar autor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}

// ==========================================
// SERVICIO DE CATEGORÍAS
// ==========================================

export class CategoriasService {
  private collectionRef = collection(db, COLLECTIONS.CATEGORIES);

  async getAll(): Promise<Categoria[]> {
    return withFallback(
      async () => {
        const querySnapshot = await getDocs(
          query(this.collectionRef, orderBy('name', 'asc'))
        );

        const categories = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Categoria));

        return categories.length > 0 ? categories : BLOG_CATEGORIES_FALLBACK;
      },
      BLOG_CATEGORIES_FALLBACK,
      'Blog Categories'
    );
  }

  // Alias para compatibilidad con los hooks
  async listarTodas(): Promise<Categoria[]> {
    return this.getAll();
  }

  async crear(data: CategoriaData): Promise<{ exito: boolean; mensaje: string }> {
    const result = await this.create(data);
    return {
      exito: result.success,
      mensaje: result.message
    };
  }

  async actualizar(id: string, data: Partial<CategoriaData>): Promise<{ exito: boolean; mensaje: string }> {
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

  async obtenerPorId(id: string): Promise<Categoria | null> {
    return this.getById(id);
  }

  async getById(id: string): Promise<Categoria | null> {
    try {
      const docRef = doc(this.collectionRef, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Categoria;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching category by ID:', error);
      throw new Error('Error al cargar categoría');
    }
  }

  async getBySlug(slug: string): Promise<Categoria | null> {
    try {
      const q = query(this.collectionRef, where('slug', '==', slug));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Categoria;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching category by slug:', error);
      throw new Error('Error al cargar categoría');
    }
  }

  async create(data: CategoriaData): Promise<CRUDResponse<string>> {
    try {
      // Validar datos
      const errors = validateCategoriaData(data);
      if (errors.length > 0) {
        return {
          success: false,
          message: 'Datos inválidos',
          error: errors.join(', ')
        };
      }

      // Verificar que el slug no existe
      const existingCategory = await this.getBySlug(data.slug);
      if (existingCategory) {
        return {
          success: false,
          message: 'Ya existe una categoría con ese slug'
        };
      }

      // Preparar datos para Firestore
      const categoriaData = {
        ...data,
        articles_count: 0,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      };

      const docRef = await addDoc(this.collectionRef, categoriaData);

      return {
        success: true,
        message: 'Categoría creada exitosamente',
        data: docRef.id
      };
    } catch (error) {
      console.error('Error creating category:', error);
      return {
        success: false,
        message: 'Error al crear categoría',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async update(id: string, data: Partial<CategoriaData>): Promise<CRUDResponse<void>> {
    try {
      const docRef = doc(this.collectionRef, id);
      
      // Verificar que la categoría existe
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        return {
          success: false,
          message: 'Categoría no encontrada'
        };
      }

      const updateData = {
        ...data,
        updated_at: Timestamp.now()
      };

      await updateDoc(docRef, updateData);

      return {
        success: true,
        message: 'Categoría actualizada exitosamente'
      };
    } catch (error) {
      console.error('Error updating category:', error);
      return {
        success: false,
        message: 'Error al actualizar categoría',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async delete(id: string): Promise<CRUDResponse<void>> {
    try {
      // Verificar si la categoría tiene artículos asociados
      const articulosQuery = query(
        collection(db, COLLECTIONS.ARTICLES),
        where('category_id', '==', id)
      );
      const articulosSnapshot = await getDocs(articulosQuery);

      if (!articulosSnapshot.empty) {
        return {
          success: false,
          message: 'No se puede eliminar la categoría porque tiene artículos asociados'
        };
      }

      const docRef = doc(this.collectionRef, id);
      await deleteDoc(docRef);

      return {
        success: true,
        message: 'Categoría eliminada exitosamente'
      };
    } catch (error) {
      console.error('Error deleting category:', error);
      return {
        success: false,
        message: 'Error al eliminar categoría',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}

// ==========================================
// SERVICIO DE ARTÍCULOS
// ==========================================

export class ArticulosService {
  private collectionRef = collection(db, COLLECTIONS.ARTICLES);

  // Alias para compatibilidad con los hooks
  async listarTodos(filters?: NewsletterFilters): Promise<ArticuloConRelaciones[]> {
    const result = await this.getAll(filters);
    // Cross-reference con autores y categorías
    return this.populateRelations(result.data);
  }

  // Método para poblar las relaciones de autor y categoría
  private async populateRelations(articles: Articulo[]): Promise<ArticuloConRelaciones[]> {

    if (articles.length === 0) {
      return [];
    }

    // Obtener todos los IDs únicos de autores y categorías
    const authorIds = [...new Set(articles.map(a => a.author_id).filter(Boolean))];
    const categoryIds = [...new Set(articles.map(a => a.category_id).filter(Boolean))];


    // Cargar autores y categorías en paralelo
    const [authors, categories] = await Promise.all([
      this.loadAuthors(authorIds),
      this.loadCategories(categoryIds)
    ]);


    // Crear mapas para búsqueda rápida
    const authorsMap = new Map(authors.map(author => [author.id, author]));
    const categoriesMap = new Map(categories.map(category => [category.id, category]));

    // Combinar datos
    const articlesWithRelations = articles.map(article => ({
      ...article,
      author: authorsMap.get(article.author_id),
      category: categoriesMap.get(article.category_id)
    }));

    return articlesWithRelations;
  }

  // Cargar múltiples autores por IDs
  private async loadAuthors(authorIds: string[]): Promise<Autor[]> {
    if (authorIds.length === 0) return [];

    try {
      const authorsCollection = collection(db, COLLECTIONS.AUTHORS);
      const authorsQuery = query(authorsCollection, where('__name__', 'in', authorIds));
      const authorsSnapshot = await getDocs(authorsQuery);

      return authorsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Autor));
    } catch (error) {
      console.error('Error loading authors:', error);
      return [];
    }
  }

  // Cargar múltiples categorías por IDs
  private async loadCategories(categoryIds: string[]): Promise<Categoria[]> {
    if (categoryIds.length === 0) return [];

    try {
      const categoriesCollection = collection(db, COLLECTIONS.CATEGORIES);
      const categoriesQuery = query(categoriesCollection, where('__name__', 'in', categoryIds));
      const categoriesSnapshot = await getDocs(categoriesQuery);

      return categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Categoria));
    } catch (error) {
      console.error('Error loading categories:', error);
      return [];
    }
  }

  async crear(data: ArticuloData): Promise<{ exito: boolean; mensaje: string }> {
    const result = await this.create(data);
    return result;
  }

  async actualizar(id: string, data: Partial<ArticuloData>): Promise<{ exito: boolean; mensaje: string }> {
    const result = await this.update(id, data);
    return result;
  }

  async eliminar(id: string): Promise<{ exito: boolean; mensaje: string }> {
    const result = await this.delete(id);
    return result;
  }

  async obtenerPorId(id: string): Promise<Articulo | null> {
    return this.getById(id);
  }

  async obtenerPorSlug(slug: string): Promise<Articulo | null> {
    return this.getBySlug(slug);
  }

  async buscar(query: string): Promise<Articulo[]> {
    const result = await this.getAll({ searchQuery: query });
    return result.data;
  }

  async getAll(filters?: NewsletterFilters): Promise<{
    data: Articulo[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      let q = query(this.collectionRef, orderBy('created_at', 'desc'));

      // Aplicar filtros
      if (filters?.category) {
        q = query(q, where('category_id', '==', filters.category));
      }

      if (filters?.author_id) {
        q = query(q, where('author_id', '==', filters.author_id));
      }

      if (filters?.featured !== undefined) {
        q = query(q, where('featured', '==', filters.featured));
      }

      // Aplicar límite
      const limitValue = filters?.limit || 50;
      q = query(q, limit(limitValue + 1)); // +1 para saber si hay más

      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs;


      const hasMore = docs.length > limitValue;
      const articles = docs
        .slice(0, limitValue)
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data
          } as Articulo;
        });

      // Filtro por texto si se especifica
      let filteredArticles = articles;
      if (filters?.searchQuery) {
        const searchLower = filters.searchQuery.toLowerCase();
        filteredArticles = articles.filter(article =>
          article.title.toLowerCase().includes(searchLower) ||
          article.excerpt.toLowerCase().includes(searchLower) ||
          article.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      // Si no hay artículos, usar fallback
      if (filteredArticles.length === 0 && !filters?.searchQuery) {
        console.warn('⚠️ [FALLBACK] Blog Articles: Sin datos, usando fallback');
        return {
          data: BLOG_ARTICLES_FALLBACK,
          total: BLOG_ARTICLES_FALLBACK.length,
          hasMore: false
        };
      }

      return {
        data: filteredArticles,
        total: filteredArticles.length,
        hasMore: hasMore && !filters?.searchQuery
      };
    } catch (error) {
      console.error('❌ [ERROR] Blog Articles:', error);
      console.warn('⚠️ [FALLBACK] Blog Articles: Error detectado, usando fallback');
      return {
        data: BLOG_ARTICLES_FALLBACK,
        total: BLOG_ARTICLES_FALLBACK.length,
        hasMore: false
      };
    }
  }

  async getById(id: string): Promise<Articulo | null> {
    try {
      const docRef = doc(this.collectionRef, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Articulo;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching article by ID:', error);
      throw new Error('Error al cargar artículo');
    }
  }

  async getBySlug(slug: string): Promise<Articulo | null> {
    try {
      const q = query(this.collectionRef, where('slug', '==', slug));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Articulo;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching article by slug:', error);
      throw new Error('Error al cargar artículo');
    }
  }

  async getConRelaciones(id: string): Promise<ArticuloConRelaciones | null> {
    try {
      console.log('getConRelaciones: Loading article with ID:', id);
      const articulo = await this.getById(id);
      console.log('getConRelaciones: Article loaded:', !!articulo, articulo?.title);

      if (!articulo) {
        console.log('getConRelaciones: Article not found');
        return null;
      }

      console.log('getConRelaciones: Loading relations for author_id:', articulo.author_id, 'category_id:', articulo.category_id);
      const [autor, categoria] = await Promise.all([
        autoresService.getById(articulo.author_id),
        categoriasService.getById(articulo.category_id)
      ]);

      console.log('getConRelaciones: Relations loaded - Author:', !!autor, autor?.name, 'Category:', !!categoria, categoria?.name);

      const result = {
        ...articulo,
        author: autor || undefined,
        category: categoria || undefined
      };

      console.log('getConRelaciones: Final result prepared with title:', result.title);
      return result;
    } catch (error) {
      console.error('Error fetching article with relations:', error);
      throw new Error('Error al cargar artículo con relaciones');
    }
  }

  async getFeatured(): Promise<Articulo[]> {
    try {
      const q = query(
        this.collectionRef,
        where('featured', '==', true),
        orderBy('published_date', 'desc'),
        limit(6)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Articulo));
    } catch (error) {
      console.error('Error fetching featured articles:', error);
      throw new Error('Error al cargar artículos destacados');
    }
  }

  async create(data: ArticuloData): Promise<CRUDResponse<string>> {
    try {
      // Validar datos
      const errors = validateArticuloData(data);
      if (errors.length > 0) {
        return {
          exito: false,
          mensaje: 'Datos inválidos',
          error: errors.join(', ')
        };
      }

      // Verificar que el slug no existe
      const existingArticle = await this.getBySlug(data.slug);
      if (existingArticle) {
        return {
          exito: false,
          mensaje: 'Ya existe un artículo con ese slug'
        };
      }

      // Verificar que el autor y categoría existen
      const [autor, categoria] = await Promise.all([
        autoresService.getById(data.author_id),
        categoriasService.getById(data.category_id)
      ]);

      if (!autor) {
        console.log('Author not found:', data.author_id);
        return { exito: false, mensaje: `Autor no encontrado: ${data.author_id}` };
      }

      if (!categoria) {
        console.log('Category not found:', data.category_id);
        return { exito: false, mensaje: `Categoría no encontrada: ${data.category_id}` };
      }

      // Usar batch para mantener consistencia
      const batch = writeBatch(db);

      // Preparar datos del artículo
      const articuloData: any = {
        ...data,
        excerpt: data.excerpt?.trim() || generateExcerpt(data.content),
        reading_time: data.reading_time || calculateReadingTime(data.content),
        url: data.url || generateURL(categoria.slug, data.slug),
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      };

      // Solo agregar published_date si es válida
      if (data.published_date) {
        try {
          const publishedDate = data.published_date instanceof Date
            ? data.published_date
            : new Date(data.published_date);

          // Verificar que la fecha sea válida
          if (!isNaN(publishedDate.getTime())) {
            articuloData.published_date = Timestamp.fromDate(publishedDate);
          } else {
            // Usar fecha actual si la fecha proporcionada es inválida
            articuloData.published_date = Timestamp.now();
          }
        } catch (error) {
          // Usar fecha actual si hay error
          articuloData.published_date = Timestamp.now();
        }
      } else {
        // Usar fecha actual si no se proporciona fecha
        articuloData.published_date = Timestamp.now();
      }

      // Crear artículo
      const articleRef = doc(this.collectionRef);
      batch.set(articleRef, articuloData);

      // Incrementar contadores
      const authorRef = doc(db, COLLECTIONS.AUTHORS, data.author_id);
      const categoryRef = doc(db, COLLECTIONS.CATEGORIES, data.category_id);
      batch.update(authorRef, { articles_count: increment(1) });
      batch.update(categoryRef, { articles_count: increment(1) });

      await batch.commit();

      return {
        exito: true,
        mensaje: 'Artículo creado exitosamente',
        data: articleRef.id
      };
    } catch (error) {
      console.error('Error creating article:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return {
        exito: false,
        mensaje: `Error al crear artículo: ${errorMessage}`
      };
    }
  }

  async update(id: string, data: Partial<ArticuloData>): Promise<CRUDResponse<void>> {
    try {
      const docRef = doc(this.collectionRef, id);
      
      // Verificar que el artículo existe
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        return {
          exito: false,
          mensaje: 'Artículo no encontrado'
        };
      }

      const updateData: any = {
        ...data,
        updated_at: Timestamp.now()
      };

      // Convertir fecha si es necesaria
      if (data.published_date) {
        try {
          const publishedDate = data.published_date instanceof Date
            ? data.published_date
            : new Date(data.published_date);

          // Verificar que la fecha sea válida
          if (!isNaN(publishedDate.getTime())) {
            updateData.published_date = Timestamp.fromDate(publishedDate);
          }
          // Si la fecha es inválida, no la actualizamos (mantener la existente)
        } catch (error) {
          // Si hay error, no actualizamos la fecha (mantener la existente)
          console.warn('Error al procesar published_date:', error);
        }
      }

      // Recalcular tiempo de lectura si cambió el contenido
      if (data.content) {
        updateData.reading_time = calculateReadingTime(data.content);

        // Si no hay extracto o está vacío, generar uno automáticamente
        if (!data.excerpt || !data.excerpt.trim()) {
          updateData.excerpt = generateExcerpt(data.content);
        }
      }

      // Si se actualiza el extracto explícitamente pero está vacío, generar uno
      if (data.excerpt !== undefined && !data.excerpt.trim() && data.content) {
        updateData.excerpt = generateExcerpt(data.content);
      }

      await updateDoc(docRef, updateData);

      return {
        exito: true,
        mensaje: 'Artículo actualizado exitosamente'
      };
    } catch (error) {
      console.error('Error updating article:', error);
      return {
        exito: false,
        mensaje: 'Error al actualizar artículo',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async delete(id: string): Promise<CRUDResponse<void>> {
    try {
      const docRef = doc(this.collectionRef, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return {
          exito: false,
          mensaje: 'Artículo no encontrado'
        };
      }

      const articleData = docSnap.data() as Articulo;

      // Usar batch para mantener consistencia
      const batch = writeBatch(db);

      // Eliminar artículo
      batch.delete(docRef);

      // Decrementar contadores
      const authorRef = doc(db, COLLECTIONS.AUTHORS, articleData.author_id);
      const categoryRef = doc(db, COLLECTIONS.CATEGORIES, articleData.category_id);
      batch.update(authorRef, { articles_count: increment(-1) });
      batch.update(categoryRef, { articles_count: increment(-1) });

      await batch.commit();

      return {
        exito: true,
        mensaje: 'Artículo eliminado exitosamente'
      };
    } catch (error) {
      console.error('Error deleting article:', error);
      return {
        exito: false,
        mensaje: 'Error al eliminar artículo',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}

// ==========================================
// SERVICIO DE ESTADÍSTICAS
// ==========================================

export class NewsletterStatsService {
  // Alias para compatibilidad con los hooks
  async obtenerEstadisticas(): Promise<NewsletterStats> {
    return this.getStats();
  }

  async getStats(): Promise<NewsletterStats> {
    try {
      const [autoresSnapshot, categoriasSnapshot, articulosSnapshot] = await Promise.all([
        getDocs(collection(db, COLLECTIONS.AUTHORS)),
        getDocs(collection(db, COLLECTIONS.CATEGORIES)),
        getDocs(collection(db, COLLECTIONS.ARTICLES))
      ]);

      const autores = autoresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Autor));
      const categorias = categoriasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Categoria));
      const articulos = articulosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Articulo));

      // Calcular estadísticas
      const totalFeaturedArticles = articulos.filter(a => a.featured).length;
      const totalFeaturedAuthors = autores.filter(a => a.featured).length;
      const averageReadingTime = articulos.length > 0
        ? Math.round(articulos.reduce((sum, a) => sum + a.reading_time, 0) / articulos.length)
        : 0;

      // Tags populares
      const tagCounts: Record<string, number> = {};
      articulos.forEach(article => {
        article.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

      const popularTags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Artículos por categoría
      const categoryArticles: Record<string, number> = {};
      articulos.forEach(article => {
        const categoria = categorias.find(c => c.id === article.category_id);
        if (categoria) {
          categoryArticles[categoria.name] = (categoryArticles[categoria.name] || 0) + 1;
        }
      });

      const articlesByCategory = Object.entries(categoryArticles)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);

      // Artículos por autor
      const authorArticles: Record<string, number> = {};
      articulos.forEach(article => {
        const autor = autores.find(a => a.id === article.author_id);
        if (autor) {
          authorArticles[autor.name] = (authorArticles[autor.name] || 0) + 1;
        }
      });

      const articlesByAuthor = Object.entries(authorArticles)
        .map(([author, count]) => ({ author, count }))
        .sort((a, b) => b.count - a.count);

      return {
        total_articles: articulos.length,
        total_authors: autores.length,
        total_categories: categorias.length,
        total_featured_articles: totalFeaturedArticles,
        total_featured_authors: totalFeaturedAuthors,
        average_reading_time: averageReadingTime,
        last_updated: new Date(),
        popular_tags: popularTags,
        articles_by_category: articlesByCategory,
        articles_by_author: articlesByAuthor
      };
    } catch (error) {
      console.error('Error fetching newsletter stats:', error);
      throw new Error('Error al cargar estadísticas');
    }
  }
}

// ==========================================
// INSTANCIAS DE LOS SERVICIOS
// ==========================================

export const autoresService = new AutoresService();
export const categoriasService = new CategoriasService();
export const articulosService = new ArticulosService();
export const newsletterStatsService = new NewsletterStatsService();