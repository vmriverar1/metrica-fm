/**
 * Portfolio Firestore Service - Optimized for Firebase App Hosting
 * Implementación completa de CRUD para categorías, proyectos e imágenes del portfolio
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
  PortfolioCategory,
  PortfolioCategoryData,
  PortfolioProjectFirestore,
  PortfolioProjectData,
  PortfolioImageFirestore,
  PortfolioImageData,
  PortfolioProjectWithCategory,
  PortfolioProjectWithImages,
  PortfolioProjectComplete,
  PortfolioCategoryWithProjects,
  PortfolioFilters,
  PortfolioStats,
  CRUDResponse,
  validateCategoryData,
  validateProjectData,
  validateImageData,
  generateSlug,
  parseInvestment,
  parseArea
} from '@/types/portfolio-firestore';
import { PORTFOLIO_CATEGORIES_FALLBACK, PORTFOLIO_PROJECTS_FALLBACK, withFallback } from './fallbacks';

// ==========================================
// SERVICIO DE CATEGORÍAS PORTFOLIO
// ==========================================

export class PortfolioCategoriesService {
  private static collection = collection(db, COLLECTIONS.PORTFOLIO_CATEGORIES);

  static async obtenerTodas(): Promise<PortfolioCategory[]> {
    return withFallback(
      async () => {
        const q = query(this.collection, orderBy('order', 'asc'));
        const snapshot = await getDocs(q);
        const categories = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as PortfolioCategory));
        return categories.length > 0 ? categories : PORTFOLIO_CATEGORIES_FALLBACK;
      },
      PORTFOLIO_CATEGORIES_FALLBACK,
      'Portfolio Categories'
    );
  }

  static async obtenerPorId(id: string): Promise<PortfolioCategory | null> {
    try {
      const docRef = doc(this.collection, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return {
        id: docSnap.id,
        ...docSnap.data()
      } as PortfolioCategory;
    } catch (error) {
      console.error('Error obteniendo categoría:', error);
      throw new Error('Failed to fetch portfolio category');
    }
  }

  static async obtenerPorSlug(slug: string): Promise<PortfolioCategory | null> {
    try {
      const q = query(this.collection, where('slug', '==', slug));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as PortfolioCategory;
    } catch (error) {
      console.error('Error obteniendo categoría por slug:', error);
      throw new Error('Failed to fetch portfolio category by slug');
    }
  }

  static async crear(data: PortfolioCategoryData): Promise<string> {
    try {
      if (!validateCategoryData(data)) {
        throw new Error('Invalid category data');
      }

      // Verificar que el slug es único
      const existingCategory = await this.obtenerPorSlug(data.slug);
      if (existingCategory) {
        throw new Error('A category with this slug already exists');
      }

      const categoryData: Omit<PortfolioCategory, 'id'> = {
        ...data,
        projects_count: 0,
        featured: data.featured || false,
        order: data.order || 0,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      };

      const docRef = await addDoc(this.collection, categoryData);
      return docRef.id;
    } catch (error) {
      console.error('Error creando categoría:', error);
      throw error;
    }
  }

  static async actualizar(id: string, data: Partial<PortfolioCategoryData>): Promise<void> {
    try {
      const docRef = doc(this.collection, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Category not found');
      }

      // Si se actualiza el slug, verificar que es único
      if (data.slug) {
        const existingCategory = await this.obtenerPorSlug(data.slug);
        if (existingCategory && existingCategory.id !== id) {
          throw new Error('A category with this slug already exists');
        }
      }

      const updateData = {
        ...data,
        updated_at: Timestamp.now()
      };

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error actualizando categoría:', error);
      throw error;
    }
  }

  static async eliminar(id: string): Promise<void> {
    try {
      // Verificar que no hay proyectos en esta categoría
      const projects = await PortfolioProjectsService.obtenerPorCategoria(id, 1);
      if (projects.length > 0) {
        throw new Error('Cannot delete category with existing projects');
      }

      const docRef = doc(this.collection, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error eliminando categoría:', error);
      throw error;
    }
  }

  static async incrementarContadorProyectos(categoryId: string, increment: number = 1): Promise<void> {
    try {
      const docRef = doc(this.collection, categoryId);
      await updateDoc(docRef, {
        projects_count: increment(increment),
        updated_at: Timestamp.now()
      });
    } catch (error) {
      console.error('Error actualizando contador de proyectos:', error);
      throw error;
    }
  }
}

// ==========================================
// SERVICIO DE PROYECTOS PORTFOLIO
// ==========================================

export class PortfolioProjectsService {
  private static collection = collection(db, COLLECTIONS.PORTFOLIO_PROJECTS);

  static async obtenerTodos(filters?: PortfolioFilters): Promise<PortfolioProjectFirestore[]> {
    return withFallback(
      async () => {
        let q = query(this.collection, orderBy('created_at', 'desc'));

        // Aplicar filtros
        if (filters?.category) {
          q = query(q, where('category_id', '==', filters.category));
        }
        if (filters?.status) {
          q = query(q, where('status', '==', filters.status));
        }
        if (filters?.featured !== undefined) {
          q = query(q, where('featured', '==', filters.featured));
        }
        if (filters?.year) {
          q = query(q, where('year', '==', filters.year));
        }

        // Aplicar límite
        if (filters?.limit) {
          q = query(q, limit(filters.limit));
        }

        const snapshot = await getDocs(q);
        const projects = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as PortfolioProjectFirestore));

        return projects.length > 0 ? projects : PORTFOLIO_PROJECTS_FALLBACK;
      },
      PORTFOLIO_PROJECTS_FALLBACK,
      'Portfolio Projects'
    );
  }

  static async obtenerPorId(id: string): Promise<PortfolioProjectFirestore | null> {
    try {
      const docRef = doc(this.collection, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return {
        id: docSnap.id,
        ...docSnap.data()
      } as PortfolioProjectFirestore;
    } catch (error) {
      console.error('Error obteniendo proyecto:', error);
      throw new Error('Failed to fetch portfolio project');
    }
  }

  static async obtenerPorSlug(slug: string): Promise<PortfolioProjectComplete | null> {
    try {
      const q = query(this.collection, where('slug', '==', slug));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      const projectDoc = snapshot.docs[0];
      const project = {
        id: projectDoc.id,
        ...projectDoc.data()
      } as PortfolioProjectFirestore;

      // Obtener información de la categoría
      const category = await PortfolioCategoriesService.obtenerPorId(project.category_id);
      if (!category) {
        throw new Error('Category not found for project');
      }

      // Obtener imágenes del proyecto
      const images = await PortfolioImagesService.obtenerPorProyecto(project.id);

      return {
        ...project,
        category_info: {
          id: category.id,
          name: category.name,
          slug: category.slug,
          color: category.color,
          icon: category.icon
        },
        images
      };
    } catch (error) {
      console.error('Error obteniendo proyecto por slug:', error);
      throw new Error('Failed to fetch portfolio project by slug');
    }
  }

  static async obtenerPorCategoria(categoryId: string, limitCount?: number): Promise<PortfolioProjectFirestore[]> {
    try {
      let q = query(
        this.collection,
        where('category_id', '==', categoryId),
        orderBy('created_at', 'desc')
      );

      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PortfolioProjectFirestore));
    } catch (error) {
      console.error('Error obteniendo proyectos por categoría:', error);
      throw new Error('Failed to fetch projects by category');
    }
  }

  static async obtenerDestacados(limitCount: number = 6): Promise<PortfolioProjectWithCategory[]> {
    try {
      const q = query(
        this.collection,
        where('featured', '==', true),
        orderBy('created_at', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PortfolioProjectFirestore));

      // Enriquecer con información de categorías
      const enrichedProjects: PortfolioProjectWithCategory[] = [];
      for (const project of projects) {
        const category = await PortfolioCategoriesService.obtenerPorId(project.category_id);
        if (category) {
          enrichedProjects.push({
            ...project,
            category_info: {
              id: category.id,
              name: category.name,
              slug: category.slug,
              color: category.color,
              icon: category.icon
            }
          });
        }
      }

      return enrichedProjects;
    } catch (error) {
      console.error('Error obteniendo proyectos destacados:', error);
      throw new Error('Failed to fetch featured projects');
    }
  }

  static async crear(data: PortfolioProjectData): Promise<string> {
    try {
      if (!validateProjectData(data)) {
        throw new Error('Invalid project data');
      }

      // Verificar que la categoría existe
      const category = await PortfolioCategoriesService.obtenerPorId(data.category_id);
      if (!category) {
        throw new Error('Category not found');
      }

      // Verificar que el slug es único
      const existingProject = await this.obtenerPorSlug(data.slug);
      if (existingProject) {
        throw new Error('A project with this slug already exists');
      }

      const projectData: Omit<PortfolioProjectFirestore, 'id'> = {
        ...data,
        featured: data.featured || false,
        images_count: 0,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      };

      const batch = writeBatch(db);

      // Crear proyecto
      const projectRef = doc(this.collection);
      batch.set(projectRef, projectData);

      // Incrementar contador en categoría
      const categoryRef = doc(collection(db, COLLECTIONS.PORTFOLIO_CATEGORIES), data.category_id);
      batch.update(categoryRef, {
        projects_count: increment(1),
        updated_at: Timestamp.now()
      });

      await batch.commit();
      return projectRef.id;
    } catch (error) {
      console.error('Error creando proyecto:', error);
      throw error;
    }
  }

  static async actualizar(id: string, data: Partial<PortfolioProjectData>): Promise<void> {
    try {
      const docRef = doc(this.collection, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Project not found');
      }

      const currentProject = docSnap.data() as PortfolioProjectFirestore;

      // Si se cambia la categoría, actualizar contadores
      if (data.category_id && data.category_id !== currentProject.category_id) {
        const newCategory = await PortfolioCategoriesService.obtenerPorId(data.category_id);
        if (!newCategory) {
          throw new Error('New category not found');
        }

        const batch = writeBatch(db);

        // Decrementar categoría anterior
        const oldCategoryRef = doc(collection(db, COLLECTIONS.PORTFOLIO_CATEGORIES), currentProject.category_id);
        batch.update(oldCategoryRef, {
          projects_count: increment(-1),
          updated_at: Timestamp.now()
        });

        // Incrementar nueva categoría
        const newCategoryRef = doc(collection(db, COLLECTIONS.PORTFOLIO_CATEGORIES), data.category_id);
        batch.update(newCategoryRef, {
          projects_count: increment(1),
          updated_at: Timestamp.now()
        });

        // Actualizar proyecto
        batch.update(docRef, {
          ...data,
          updated_at: Timestamp.now()
        });

        await batch.commit();
      } else {
        // Actualización simple sin cambio de categoría
        await updateDoc(docRef, {
          ...data,
          updated_at: Timestamp.now()
        });
      }
    } catch (error) {
      console.error('Error actualizando proyecto:', error);
      throw error;
    }
  }

  static async eliminar(id: string): Promise<void> {
    try {
      const docRef = doc(this.collection, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Project not found');
      }

      const project = docSnap.data() as PortfolioProjectFirestore;

      // Eliminar todas las imágenes del proyecto
      const images = await PortfolioImagesService.obtenerPorProyecto(id);

      const batch = writeBatch(db);

      // Eliminar imágenes
      for (const image of images) {
        const imageRef = doc(collection(db, COLLECTIONS.PORTFOLIO_IMAGES), image.id);
        batch.delete(imageRef);
      }

      // Eliminar proyecto
      batch.delete(docRef);

      // Decrementar contador en categoría
      const categoryRef = doc(collection(db, COLLECTIONS.PORTFOLIO_CATEGORIES), project.category_id);
      batch.update(categoryRef, {
        projects_count: increment(-1),
        updated_at: Timestamp.now()
      });

      await batch.commit();
    } catch (error) {
      console.error('Error eliminando proyecto:', error);
      throw error;
    }
  }
}

// ==========================================
// SERVICIO DE IMÁGENES PORTFOLIO
// ==========================================

export class PortfolioImagesService {
  private static collection = collection(db, COLLECTIONS.PORTFOLIO_IMAGES);

  static async obtenerPorProyecto(projectId: string): Promise<PortfolioImageFirestore[]> {
    try {
      const q = query(
        this.collection,
        where('project_id', '==', projectId),
        orderBy('order', 'asc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PortfolioImageFirestore));
    } catch (error) {
      console.error('Error obteniendo imágenes del proyecto:', error);
      throw new Error('Failed to fetch project images');
    }
  }

  static async crear(data: PortfolioImageData): Promise<string> {
    try {
      if (!validateImageData(data)) {
        throw new Error('Invalid image data');
      }

      // Verificar que el proyecto existe
      const project = await PortfolioProjectsService.obtenerPorId(data.project_id);
      if (!project) {
        throw new Error('Project not found');
      }

      const imageData: Omit<PortfolioImageFirestore, 'id'> = {
        ...data,
        featured: data.featured || false,
        order: data.order || 0,
        created_at: Timestamp.now()
      };

      const batch = writeBatch(db);

      // Crear imagen
      const imageRef = doc(this.collection);
      batch.set(imageRef, imageData);

      // Incrementar contador en proyecto
      const projectRef = doc(collection(db, COLLECTIONS.PORTFOLIO_PROJECTS), data.project_id);
      batch.update(projectRef, {
        images_count: increment(1),
        updated_at: Timestamp.now()
      });

      await batch.commit();
      return imageRef.id;
    } catch (error) {
      console.error('Error creando imagen:', error);
      throw error;
    }
  }

  static async actualizar(id: string, data: Partial<PortfolioImageData>): Promise<void> {
    try {
      const docRef = doc(this.collection, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Image not found');
      }

      await updateDoc(docRef, data);
    } catch (error) {
      console.error('Error actualizando imagen:', error);
      throw error;
    }
  }

  static async eliminar(id: string): Promise<void> {
    try {
      const docRef = doc(this.collection, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Image not found');
      }

      const image = docSnap.data() as PortfolioImageFirestore;

      const batch = writeBatch(db);

      // Eliminar imagen
      batch.delete(docRef);

      // Decrementar contador en proyecto
      const projectRef = doc(collection(db, COLLECTIONS.PORTFOLIO_PROJECTS), image.project_id);
      batch.update(projectRef, {
        images_count: increment(-1),
        updated_at: Timestamp.now()
      });

      await batch.commit();
    } catch (error) {
      console.error('Error eliminando imagen:', error);
      throw error;
    }
  }
}

// ==========================================
// SERVICIO DE ESTADÍSTICAS
// ==========================================

export class PortfolioStatsService {
  static async obtenerEstadisticas(): Promise<PortfolioStats> {
    try {
      const [categories, projects] = await Promise.all([
        PortfolioCategoriesService.obtenerTodas(),
        PortfolioProjectsService.obtenerTodos()
      ]);

      const stats: PortfolioStats = {
        total_categories: categories.length,
        total_projects: projects.length,
        total_images: 0,
        featured_projects: projects.filter(p => p.featured).length,
        completed_projects: projects.filter(p => p.status === 'completado').length,
        total_investment_value: 0,
        total_area_value: 0,
        projects_by_category: {},
        projects_by_year: {},
        projects_by_status: {
          completado: 0,
          en_curso: 0,
          planificado: 0
        }
      };

      // Calcular estadísticas
      for (const project of projects) {
        // Por categoría
        const category = categories.find(c => c.id === project.category_id);
        if (category) {
          stats.projects_by_category[category.name] = (stats.projects_by_category[category.name] || 0) + 1;
        }

        // Por año
        stats.projects_by_year[project.year] = (stats.projects_by_year[project.year] || 0) + 1;

        // Por status
        stats.projects_by_status[project.status]++;

        // Totales
        stats.total_images += project.images_count;
        stats.total_investment_value += parseInvestment(project.budget);
        stats.total_area_value += parseArea(project.area);
      }

      return stats;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw new Error('Failed to fetch portfolio statistics');
    }
  }
}