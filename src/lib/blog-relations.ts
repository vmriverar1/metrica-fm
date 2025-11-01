/**
 * Servicio para manejar relaciones entre artículos, autores y categorías del blog
 * Permite hacer cross-reference entre las colecciones de Firestore
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Inicializar Firebase Admin si no está ya inicializado
let firebaseApp: any;
try {
  firebaseApp = require('firebase-admin').app();
} catch (error) {
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
  };

  firebaseApp = initializeApp({
    credential: cert(serviceAccount as any)
  });
}

const db = getFirestore(firebaseApp);

export interface ArticleWithRelations {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string;
  tags: string[];
  featured: boolean;
  status: string;
  reading_time?: number;
  views?: number;
  likes?: number;
  created_at: any;
  updated_at: any;
  published_at?: any;
  publishedAt?: any;

  // IDs de relaciones
  author_id: string;
  category_id: string;

  // Datos relacionados (populated)
  author?: {
    id: string;
    name: string;
    email: string;
    role: string;
    bio: string;
    avatar: string;
    linkedin?: string;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    color?: string;
    icon?: string;
  };
}

export class BlogRelationsService {

  /**
   * Obtiene todos los artículos con sus relaciones (author y category)
   */
  async getArticlesWithRelations(filters?: {
    category_id?: string;
    author_id?: string;
    featured?: boolean;
    status?: string;
    limit?: number;
  }): Promise<ArticleWithRelations[]> {
    try {
      // Construir query de artículos
      let articlesQuery = db.collection('blog_articles');

      if (filters?.category_id) {
        articlesQuery = articlesQuery.where('category_id', '==', filters.category_id);
      }

      if (filters?.author_id) {
        articlesQuery = articlesQuery.where('author_id', '==', filters.author_id);
      }

      if (filters?.featured !== undefined) {
        articlesQuery = articlesQuery.where('featured', '==', filters.featured);
      }

      if (filters?.status) {
        articlesQuery = articlesQuery.where('status', '==', filters.status);
      }

      // Ordenar por fecha de publicación (temporalmente comentado por índices)
      // articlesQuery = articlesQuery.orderBy('created_at', 'desc');

      if (filters?.limit) {
        articlesQuery = articlesQuery.limit(filters.limit);
      }

      const articlesSnapshot = await articlesQuery.get();
      const articles = articlesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ArticleWithRelations[];

      // Obtener IDs únicos de autores y categorías
      const authorIds = [...new Set(articles.map(a => a.author_id).filter(Boolean))];
      const categoryIds = [...new Set(articles.map(a => a.category_id).filter(Boolean))];

      // Obtener datos de autores en batch
      const authorsMap = new Map();
      if (authorIds.length > 0) {
        const authorsPromises = authorIds.map(id => db.collection('blog_authors').doc(id).get());
        const authorsSnapshots = await Promise.all(authorsPromises);

        authorsSnapshots.forEach((snapshot, index) => {
          if (snapshot.exists) {
            authorsMap.set(authorIds[index], {
              id: snapshot.id,
              ...snapshot.data()
            });
          }
        });
      }

      // Obtener datos de categorías en batch
      const categoriesMap = new Map();
      if (categoryIds.length > 0) {
        const categoriesPromises = categoryIds.map(id => db.collection('blog_categories').doc(id).get());
        const categoriesSnapshots = await Promise.all(categoriesPromises);

        categoriesSnapshots.forEach((snapshot, index) => {
          if (snapshot.exists) {
            categoriesMap.set(categoryIds[index], {
              id: snapshot.id,
              ...snapshot.data()
            });
          }
        });
      }

      // Combinar artículos con sus datos relacionados
      const articlesWithRelations = articles.map(article => ({
        ...article,
        // Normalizar excerpt - usar en orden de prioridad
        excerpt: article.excerpt ||
                (article.content?.excerpt) ||
                (article as any).short_description ||
                (article as any).description ||
                this.generateExcerpt(
                  typeof article.content === 'string' ? article.content : article.content?.body || ''
                ),
        // Normalizar featured field
        featured: article.featured === null ? false : Boolean(article.featured),
        // Normalizar reading_time
        reading_time: article.reading_time ||
                     (article.content?.reading_time) ||
                     this.calculateReadingTime(
                       typeof article.content === 'string' ? article.content : article.content?.body || ''
                     ),
        author: authorsMap.get(article.author_id) || null,
        category: categoriesMap.get(article.category_id) || null
      }));

      console.log(`📰 Articles with relations loaded: ${articlesWithRelations.length}`);
      return articlesWithRelations;

    } catch (error) {
      console.error('Error loading articles with relations:', error);
      throw error;
    }
  }

  /**
   * Obtiene un artículo específico con sus relaciones
   */
  async getArticleWithRelations(articleId: string): Promise<ArticleWithRelations | null> {
    try {
      const articleDoc = await db.collection('blog_articles').doc(articleId).get();

      if (!articleDoc.exists) {
        return null;
      }

      const articleData = {
        id: articleDoc.id,
        ...articleDoc.data()
      } as ArticleWithRelations;

      // Obtener datos del autor
      if (articleData.author_id) {
        const authorDoc = await db.collection('blog_authors').doc(articleData.author_id).get();
        if (authorDoc.exists) {
          articleData.author = {
            id: authorDoc.id,
            ...authorDoc.data()
          } as any;
        }
      }

      // Obtener datos de la categoría
      if (articleData.category_id) {
        const categoryDoc = await db.collection('blog_categories').doc(articleData.category_id).get();
        if (categoryDoc.exists) {
          articleData.category = {
            id: categoryDoc.id,
            ...categoryDoc.data()
          } as any;
        }
      }

      return articleData;

    } catch (error) {
      console.error('Error loading article with relations:', error);
      throw error;
    }
  }

  /**
   * Obtiene un artículo por slug con sus relaciones
   */
  async getArticleBySlugWithRelations(slug: string): Promise<ArticleWithRelations | null> {
    try {
      const query = db.collection('blog_articles').where('slug', '==', slug).limit(1);
      const snapshot = await query.get();

      if (snapshot.empty) {
        return null;
      }

      const articleDoc = snapshot.docs[0];
      return await this.getArticleWithRelations(articleDoc.id);

    } catch (error) {
      console.error('Error loading article by slug with relations:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las categorías disponibles
   */
  async getCategories(): Promise<any[]> {
    try {
      const snapshot = await db.collection('blog_categories').orderBy('name').get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error loading categories:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los autores disponibles
   */
  async getAuthors(): Promise<any[]> {
    try {
      const snapshot = await db.collection('blog_authors').orderBy('name').get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error loading authors:', error);
      throw error;
    }
  }

  /**
   * Genera un excerpt automático desde el contenido del artículo
   */
  private generateExcerpt(content: any, maxLength: number = 160): string {
    if (!content) return '';

    // Convertir a string si no lo es
    const contentStr = typeof content === 'string' ? content : String(content);

    // Limpiar HTML y markdown básico
    const cleanContent = contentStr
      .replace(/<[^>]*>/g, '') // Remover HTML tags
      .replace(/#{1,6}\s/g, '') // Remover markdown headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remover markdown bold
      .replace(/\*(.*?)\*/g, '$1') // Remover markdown italic
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remover markdown links
      .replace(/\n\s*\n/g, ' ') // Remover múltiples saltos de línea
      .replace(/\s+/g, ' ') // Normalizar espacios
      .trim();

    // Truncar al límite de caracteres
    if (cleanContent.length <= maxLength) {
      return cleanContent;
    }

    // Encontrar el último espacio antes del límite
    const truncated = cleanContent.substring(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');

    if (lastSpaceIndex > 0) {
      return truncated.substring(0, lastSpaceIndex) + '...';
    }

    return truncated + '...';
  }

  /**
   * Calcula el tiempo estimado de lectura basado en el contenido
   */
  private calculateReadingTime(content: any, wordsPerMinute: number = 200): number {
    if (!content) return 5; // Tiempo por defecto

    // Convertir a string si no lo es
    const contentStr = typeof content === 'string' ? content : String(content);

    // Limpiar HTML y markdown básico
    const cleanContent = contentStr
      .replace(/<[^>]*>/g, '') // Remover HTML tags
      .replace(/#{1,6}\s/g, '') // Remover markdown headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remover markdown bold
      .replace(/\*(.*?)\*/g, '$1') // Remover markdown italic
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remover markdown links
      .replace(/\n\s*\n/g, ' ') // Remover múltiples saltos de línea
      .replace(/\s+/g, ' ') // Normalizar espacios
      .trim();

    // Contar palabras
    const words = cleanContent.split(' ').filter(word => word.length > 0).length;

    // Calcular tiempo de lectura en minutos
    const readingTime = Math.ceil(words / wordsPerMinute);

    // Mínimo 1 minuto, máximo razonable 30 minutos
    return Math.max(1, Math.min(readingTime, 30));
  }
}

// Export singleton instance
export const blogRelationsService = new BlogRelationsService();