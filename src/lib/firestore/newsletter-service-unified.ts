/**
 * Servicio Newsletter Unificado
 * Extiende BaseFirestoreService con funcionalidades específicas de Newsletter/Blog
 * Reutiliza arquitectura base para máxima eficiencia
 */

import { Timestamp, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { BaseFirestoreService, BaseEntity, BaseData, FilterCondition, CRUDResponse } from '@/lib/firestore/base-service';
import { COLLECTIONS } from '@/lib/firebase/config';

// Tipos específicos de Newsletter
export interface NewsletterCategory extends BaseEntity {
  name: string;
  slug: string;
  description: string;
  icon?: string;
  color?: string;
  featured_image?: string;
  articles_count: number;
  total_views: number;
  avg_reading_time: number;
  featured: boolean;
  order: number;
}

export interface NewsletterCategoryData extends BaseData {
  name: string;
  slug: string;
  description: string;
  icon?: string;
  color?: string;
  featured_image?: string;
  articles_count?: number;
  total_views?: number;
  avg_reading_time?: number;
  featured?: boolean;
  order?: number;
}

export interface NewsletterArticle extends BaseEntity {
  title: string;
  slug: string;
  category_id: string;
  author: {
    name: string;
    email: string;
    avatar?: string;
    bio?: string;
  };
  content: {
    excerpt: string;
    body: string;
    reading_time: number;
    word_count: number;
  };
  images: {
    featured: string;
    thumbnail: string;
    gallery?: ArticleImage[];
  };
  tags: string[];
  featured: boolean;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  published_at?: Timestamp;
  scheduled_at?: Timestamp;
  last_modified_at: Timestamp;
  seo: {
    title: string;
    description: string;
    keywords: string[];
    canonical_url?: string;
  };
  metrics: {
    views: number;
    shares: number;
    comments: number;
    reading_completion_rate: number;
    avg_time_on_page: number;
    last_updated: Timestamp;
  };
  newsletter_settings: {
    include_in_newsletter: boolean;
    newsletter_priority: number;
    send_notification: boolean;
  };
}

export interface NewsletterArticleData extends BaseData {
  title: string;
  slug: string;
  category_id: string;
  author: {
    name: string;
    email: string;
    avatar?: string;
    bio?: string;
  };
  content: {
    excerpt: string;
    body: string;
    reading_time?: number;
    word_count?: number;
  };
  images: {
    featured: string;
    thumbnail: string;
    gallery?: ArticleImage[];
  };
  tags?: string[];
  featured?: boolean;
  status?: 'draft' | 'published' | 'scheduled' | 'archived';
  published_at?: Timestamp;
  scheduled_at?: Timestamp;
  last_modified_at?: Timestamp;
  seo?: {
    title: string;
    description: string;
    keywords: string[];
    canonical_url?: string;
  };
  metrics?: {
    views: number;
    shares: number;
    comments: number;
    reading_completion_rate: number;
    avg_time_on_page: number;
    last_updated: Timestamp;
  };
  newsletter_settings?: {
    include_in_newsletter: boolean;
    newsletter_priority: number;
    send_notification: boolean;
  };
}

export interface ArticleImage {
  id: string;
  url: string;
  thumbnail: string;
  caption?: string;
  alt: string;
  order: number;
}

export interface NewsletterSubscriber extends BaseEntity {
  email: string;
  name?: string;
  preferences: {
    categories: string[];
    frequency: 'daily' | 'weekly' | 'monthly';
    format: 'html' | 'text';
  };
  status: 'active' | 'unsubscribed' | 'bounced' | 'complained';
  subscribed_at: Timestamp;
  unsubscribed_at?: Timestamp;
  last_email_sent?: Timestamp;
  engagement: {
    open_rate: number;
    click_rate: number;
    total_opens: number;
    total_clicks: number;
  };
  source: 'website' | 'social' | 'referral' | 'manual';
  verified: boolean;
}

export interface NewsletterSubscriberData extends BaseData {
  email: string;
  name?: string;
  preferences: {
    categories: string[];
    frequency: 'daily' | 'weekly' | 'monthly';
    format: 'html' | 'text';
  };
  status?: 'active' | 'unsubscribed' | 'bounced' | 'complained';
  subscribed_at?: Timestamp;
  unsubscribed_at?: Timestamp;
  last_email_sent?: Timestamp;
  engagement?: {
    open_rate: number;
    click_rate: number;
    total_opens: number;
    total_clicks: number;
  };
  source?: 'website' | 'social' | 'referral' | 'manual';
  verified?: boolean;
}

export interface NewsletterStats {
  totalArticles: number;
  publishedArticles: number;
  totalSubscribers: number;
  activeSubscribers: number;
  totalViews: number;
  categoriesCount: number;
  featuredArticles: number;
  articlesByCategory: Record<string, number>;
  articlesByStatus: Record<string, number>;
  averageReadingTime: number;
  topCategories: Array<{
    id: string;
    name: string;
    articles_count: number;
    total_views: number;
  }>;
  recentActivity: {
    newArticles: number;
    newSubscribers: number;
    totalViews: number;
    period: string;
  };
}

/**
 * Servicio de Categorías de Newsletter
 */
export class NewsletterCategoryService extends BaseFirestoreService<NewsletterCategory, NewsletterCategoryData> {
  constructor() {
    super(COLLECTIONS.NEWSLETTER_CATEGORIES);
  }

  /**
   * Obtener categorías con contador de artículos actualizado
   */
  async getCategoriesWithArticleCount(): Promise<NewsletterCategory[]> {
    try {
      const categories = await this.getAll(
        undefined,
        [{ field: 'order', direction: 'asc' }]
      );

      // Actualizar contadores en paralelo
      const categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
          const articleCount = await this.getArticleCountForCategory(category.id);
          const categoryStats = await this.getCategoryStats(category.id);
          return {
            ...category,
            articles_count: articleCount,
            total_views: categoryStats.total_views,
            avg_reading_time: categoryStats.avg_reading_time
          };
        })
      );

      return categoriesWithCount;
    } catch (error) {
      console.error('Error getting categories with article count:', error);
      throw new Error('Failed to fetch categories with article count');
    }
  }

  /**
   * Obtener categorías destacadas para home
   */
  async getFeaturedCategories(): Promise<NewsletterCategory[]> {
    try {
      return await this.getAll(
        [{ field: 'featured', operator: '==', value: true }],
        [{ field: 'order', direction: 'asc' }]
      );
    } catch (error) {
      console.error('Error getting featured categories:', error);
      throw new Error('Failed to fetch featured categories');
    }
  }

  /**
   * Reordenar categorías
   */
  async reorderCategories(orderMap: { id: string; order: number }[]): Promise<CRUDResponse<void>> {
    try {
      const updates = orderMap.map(item => ({
        id: item.id,
        data: { order: item.order }
      }));

      return await this.batchUpdate(updates);
    } catch (error) {
      console.error('Error reordering categories:', error);
      return {
        success: false,
        error: 'Failed to reorder categories',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Actualizar métricas de una categoría
   */
  async updateCategoryMetrics(categoryId: string): Promise<CRUDResponse<void>> {
    try {
      const articles = await newsletterArticleService.getArticlesByCategory(categoryId);
      const publishedArticles = articles.filter(article => article.status === 'published');

      const totalViews = publishedArticles.reduce((sum, article) =>
        sum + (article.metrics.views || 0), 0
      );

      const totalReadingTime = publishedArticles.reduce((sum, article) =>
        sum + (article.content.reading_time || 0), 0
      );

      const avgReadingTime = publishedArticles.length > 0
        ? Math.floor(totalReadingTime / publishedArticles.length)
        : 0;

      return await this.update(categoryId, {
        articles_count: articles.length,
        total_views: totalViews,
        avg_reading_time: avgReadingTime
      });
    } catch (error) {
      console.error('Error updating category metrics:', error);
      return {
        success: false,
        error: 'Failed to update category metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Obtener categoría por slug
   */
  async getCategoryBySlug(slug: string): Promise<NewsletterCategory | null> {
    try {
      const categories = await this.getAll([
        { field: 'slug', operator: '==', value: slug }
      ]);

      return categories.length > 0 ? categories[0] : null;
    } catch (error) {
      console.error('Error getting category by slug:', error);
      return null;
    }
  }

  // Métodos privados para métricas
  private async getArticleCountForCategory(categoryId: string): Promise<number> {
    try {
      const articlesCount = await newsletterArticleService.count([
        { field: 'category_id', operator: '==', value: categoryId }
      ]);
      return articlesCount;
    } catch (error) {
      console.error('Error counting articles for category:', error);
      return 0;
    }
  }

  private async getCategoryStats(categoryId: string): Promise<{ total_views: number; avg_reading_time: number }> {
    try {
      const articles = await newsletterArticleService.getArticlesByCategory(categoryId);
      const publishedArticles = articles.filter(article => article.status === 'published');

      const totalViews = publishedArticles.reduce((sum, article) => sum + (article.metrics.views || 0), 0);
      const totalReadingTime = publishedArticles.reduce((sum, article) => sum + (article.content.reading_time || 0), 0);
      const avgReadingTime = publishedArticles.length > 0 ? Math.floor(totalReadingTime / publishedArticles.length) : 0;

      return { total_views: totalViews, avg_reading_time: avgReadingTime };
    } catch (error) {
      console.error('Error getting category stats:', error);
      return { total_views: 0, avg_reading_time: 0 };
    }
  }
}

/**
 * Servicio de Artículos de Newsletter
 */
export class NewsletterArticleService extends BaseFirestoreService<NewsletterArticle, NewsletterArticleData> {
  constructor() {
    super(COLLECTIONS.NEWSLETTER_ARTICLES);
  }

  /**
   * Obtener artículos por categoría
   */
  async getArticlesByCategory(categoryId: string): Promise<NewsletterArticle[]> {
    try {
      return await this.getAll(
        [{ field: 'category_id', operator: '==', value: categoryId }],
        [{ field: 'published_at', direction: 'desc' }]
      );
    } catch (error) {
      console.error('Error getting articles by category:', error);
      throw new Error('Failed to fetch articles by category');
    }
  }

  /**
   * Obtener artículos publicados
   */
  async getPublishedArticles(limitCount?: number): Promise<NewsletterArticle[]> {
    try {
      return await this.getAll(
        [{ field: 'status', operator: '==', value: 'published' }],
        [{ field: 'published_at', direction: 'desc' }],
        limitCount ? { limit: limitCount } : undefined
      );
    } catch (error) {
      console.error('Error getting published articles:', error);
      throw new Error('Failed to fetch published articles');
    }
  }

  /**
   * Obtener artículos destacados
   */
  async getFeaturedArticles(limitCount: number = 6): Promise<NewsletterArticle[]> {
    try {
      return await this.getAll(
        [
          { field: 'featured', operator: '==', value: true },
          { field: 'status', operator: '==', value: 'published' }
        ],
        [{ field: 'published_at', direction: 'desc' }],
        { limit: limitCount }
      );
    } catch (error) {
      console.error('Error getting featured articles:', error);
      throw new Error('Failed to fetch featured articles');
    }
  }

  /**
   * Obtener artículos recientes
   */
  async getRecentArticles(limitCount: number = 10): Promise<NewsletterArticle[]> {
    try {
      return await this.getAll(
        [{ field: 'status', operator: '==', value: 'published' }],
        [{ field: 'published_at', direction: 'desc' }],
        { limit: limitCount }
      );
    } catch (error) {
      console.error('Error getting recent articles:', error);
      throw new Error('Failed to fetch recent articles');
    }
  }

  /**
   * Obtener artículo por slug
   */
  async getArticleBySlug(slug: string): Promise<NewsletterArticle | null> {
    try {
      const articles = await this.getAll([
        { field: 'slug', operator: '==', value: slug }
      ]);

      if (articles.length > 0) {
        // Incrementar contador de vistas
        await this.incrementField(articles[0].id, 'metrics.views');
        await this.update(articles[0].id, {
          'metrics.last_updated': Timestamp.now()
        });
        return articles[0];
      }

      return null;
    } catch (error) {
      console.error('Error getting article by slug:', error);
      return null;
    }
  }

  /**
   * Buscar artículos por término
   */
  async searchArticles(searchTerm: string): Promise<NewsletterArticle[]> {
    try {
      return await this.search(searchTerm, [
        'title',
        'content.excerpt',
        'content.body',
        'author.name',
        'tags'
      ]);
    } catch (error) {
      console.error('Error searching articles:', error);
      throw new Error('Failed to search articles');
    }
  }

  /**
   * Obtener artículos por autor
   */
  async getArticlesByAuthor(authorEmail: string): Promise<NewsletterArticle[]> {
    try {
      return await this.getAll([
        { field: 'author.email', operator: '==', value: authorEmail },
        { field: 'status', operator: '==', value: 'published' }
      ]);
    } catch (error) {
      console.error('Error getting articles by author:', error);
      throw new Error('Failed to fetch articles by author');
    }
  }

  /**
   * Obtener artículos por tag
   */
  async getArticlesByTag(tag: string): Promise<NewsletterArticle[]> {
    try {
      return await this.getAll([
        { field: 'tags', operator: 'array-contains', value: tag },
        { field: 'status', operator: '==', value: 'published' }
      ]);
    } catch (error) {
      console.error('Error getting articles by tag:', error);
      throw new Error('Failed to fetch articles by tag');
    }
  }

  /**
   * Obtener artículos relacionados
   */
  async getRelatedArticles(articleId: string, categoryId: string, tags: string[], limitCount: number = 3): Promise<NewsletterArticle[]> {
    try {
      // Primero buscar por misma categoría
      let relatedArticles = await this.getAll(
        [
          { field: 'category_id', operator: '==', value: categoryId },
          { field: 'status', operator: '==', value: 'published' }
        ],
        [{ field: 'published_at', direction: 'desc' }],
        { limit: limitCount + 5 } // Obtener más para filtrar
      );

      // Filtrar el artículo actual
      relatedArticles = relatedArticles.filter(article => article.id !== articleId);

      // Si hay tags, priorizar artículos con tags similares
      if (tags.length > 0) {
        const articlesWithSimilarTags = relatedArticles.filter(article =>
          article.tags.some(tag => tags.includes(tag))
        );

        if (articlesWithSimilarTags.length >= limitCount) {
          return articlesWithSimilarTags.slice(0, limitCount);
        }
      }

      return relatedArticles.slice(0, limitCount);
    } catch (error) {
      console.error('Error getting related articles:', error);
      throw new Error('Failed to fetch related articles');
    }
  }

  /**
   * Obtener estadísticas de newsletter
   */
  async getNewsletterStats(): Promise<NewsletterStats> {
    try {
      const [articles, categories, subscribers] = await Promise.all([
        this.getAll(),
        newsletterCategoryService.getAll(),
        newsletterSubscriberService.getAll()
      ]);

      const publishedArticles = articles.filter(article => article.status === 'published');
      const activeSubscribers = subscribers.filter(sub => sub.status === 'active');
      const featuredArticles = articles.filter(article => article.featured).length;

      const totalViews = publishedArticles.reduce((sum, article) =>
        sum + (article.metrics.views || 0), 0
      );

      // Artículos por categoría
      const articlesByCategory = articles.reduce((acc, article) => {
        acc[article.category_id] = (acc[article.category_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Artículos por estado
      const articlesByStatus = articles.reduce((acc, article) => {
        acc[article.status] = (acc[article.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Promedio de tiempo de lectura
      const totalReadingTime = publishedArticles.reduce((sum, article) =>
        sum + (article.content.reading_time || 0), 0
      );
      const averageReadingTime = publishedArticles.length > 0
        ? Math.floor(totalReadingTime / publishedArticles.length)
        : 0;

      // Top categorías
      const topCategories = await Promise.all(
        categories.slice(0, 5).map(async (category) => {
          const categoryArticles = articles.filter(article => article.category_id === category.id);
          const categoryViews = categoryArticles.reduce((sum, article) => sum + (article.metrics.views || 0), 0);

          return {
            id: category.id,
            name: category.name,
            articles_count: categoryArticles.length,
            total_views: categoryViews
          };
        })
      );

      // Actividad reciente (últimos 7 días)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoTimestamp = Timestamp.fromDate(sevenDaysAgo);

      const newArticles = articles.filter(article =>
        article.created_at && article.created_at.toDate() >= sevenDaysAgo
      ).length;

      const newSubscribers = subscribers.filter(sub =>
        sub.subscribed_at.toDate() >= sevenDaysAgo
      ).length;

      return {
        totalArticles: articles.length,
        publishedArticles: publishedArticles.length,
        totalSubscribers: subscribers.length,
        activeSubscribers: activeSubscribers.length,
        totalViews,
        categoriesCount: categories.length,
        featuredArticles,
        articlesByCategory,
        articlesByStatus,
        averageReadingTime,
        topCategories: topCategories.sort((a, b) => b.total_views - a.total_views),
        recentActivity: {
          newArticles,
          newSubscribers,
          totalViews: publishedArticles
            .filter(article => article.created_at && article.created_at.toDate() >= sevenDaysAgo)
            .reduce((sum, article) => sum + (article.metrics.views || 0), 0),
          period: 'last_7_days'
        }
      };
    } catch (error) {
      console.error('Error getting newsletter stats:', error);
      throw new Error('Failed to fetch newsletter statistics');
    }
  }

  /**
   * Incrementar vistas de artículo
   */
  async incrementViews(articleId: string): Promise<CRUDResponse<void>> {
    try {
      await this.incrementField(articleId, 'metrics.views');
      await this.update(articleId, {
        'metrics.last_updated': Timestamp.now()
      });

      return {
        success: true,
        message: 'Article views incremented successfully'
      };
    } catch (error) {
      console.error('Error incrementing article views:', error);
      return {
        success: false,
        error: 'Failed to increment article views',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Programar artículo para publicación
   */
  async scheduleArticle(articleId: string, publishDate: Date): Promise<CRUDResponse<void>> {
    try {
      return await this.update(articleId, {
        status: 'scheduled',
        scheduled_at: Timestamp.fromDate(publishDate),
        last_modified_at: Timestamp.now()
      });
    } catch (error) {
      console.error('Error scheduling article:', error);
      return {
        success: false,
        error: 'Failed to schedule article',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Publicar artículo programado
   */
  async publishScheduledArticle(articleId: string): Promise<CRUDResponse<void>> {
    try {
      return await this.update(articleId, {
        status: 'published',
        published_at: Timestamp.now(),
        last_modified_at: Timestamp.now()
      });
    } catch (error) {
      console.error('Error publishing scheduled article:', error);
      return {
        success: false,
        error: 'Failed to publish scheduled article',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

/**
 * Servicio de Suscriptores de Newsletter
 */
export class NewsletterSubscriberService extends BaseFirestoreService<NewsletterSubscriber, NewsletterSubscriberData> {
  constructor() {
    super(COLLECTIONS.NEWSLETTER_SUBSCRIBERS);
  }

  /**
   * Suscribir nuevo email
   */
  async subscribe(email: string, preferences?: Partial<NewsletterSubscriberData['preferences']>): Promise<CRUDResponse<string>> {
    try {
      // Verificar si ya existe
      const existing = await this.getByEmail(email);
      if (existing) {
        if (existing.status === 'unsubscribed') {
          // Reactivar suscripción
          const result = await this.update(existing.id, {
            status: 'active',
            subscribed_at: Timestamp.now(),
            unsubscribed_at: undefined,
            preferences: preferences ? { ...existing.preferences, ...preferences } : existing.preferences
          });
          return {
            success: result.success,
            data: existing.id,
            message: 'Subscription reactivated successfully'
          };
        } else {
          return {
            success: false,
            error: 'Email already subscribed',
            message: 'This email is already subscribed to the newsletter'
          };
        }
      }

      // Crear nueva suscripción
      const subscriberData: NewsletterSubscriberData = {
        email,
        preferences: {
          categories: [],
          frequency: 'weekly',
          format: 'html',
          ...preferences
        },
        status: 'active',
        subscribed_at: Timestamp.now(),
        engagement: {
          open_rate: 0,
          click_rate: 0,
          total_opens: 0,
          total_clicks: 0
        },
        source: 'website',
        verified: false
      };

      return await this.create(subscriberData);
    } catch (error) {
      console.error('Error subscribing email:', error);
      return {
        success: false,
        error: 'Failed to subscribe email',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Desuscribir email
   */
  async unsubscribe(email: string): Promise<CRUDResponse<void>> {
    try {
      const subscriber = await this.getByEmail(email);
      if (!subscriber) {
        return {
          success: false,
          error: 'Subscriber not found',
          message: 'Email not found in subscriber list'
        };
      }

      return await this.update(subscriber.id, {
        status: 'unsubscribed',
        unsubscribed_at: Timestamp.now()
      });
    } catch (error) {
      console.error('Error unsubscribing email:', error);
      return {
        success: false,
        error: 'Failed to unsubscribe email',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Obtener suscriptor por email
   */
  async getByEmail(email: string): Promise<NewsletterSubscriber | null> {
    try {
      const subscribers = await this.getAll([
        { field: 'email', operator: '==', value: email }
      ]);

      return subscribers.length > 0 ? subscribers[0] : null;
    } catch (error) {
      console.error('Error getting subscriber by email:', error);
      return null;
    }
  }

  /**
   * Obtener suscriptores activos
   */
  async getActiveSubscribers(): Promise<NewsletterSubscriber[]> {
    try {
      return await this.getAll([
        { field: 'status', operator: '==', value: 'active' }
      ]);
    } catch (error) {
      console.error('Error getting active subscribers:', error);
      throw new Error('Failed to fetch active subscribers');
    }
  }

  /**
   * Obtener suscriptores por frecuencia
   */
  async getSubscribersByFrequency(frequency: 'daily' | 'weekly' | 'monthly'): Promise<NewsletterSubscriber[]> {
    try {
      return await this.getAll([
        { field: 'status', operator: '==', value: 'active' },
        { field: 'preferences.frequency', operator: '==', value: frequency }
      ]);
    } catch (error) {
      console.error('Error getting subscribers by frequency:', error);
      throw new Error('Failed to fetch subscribers by frequency');
    }
  }

  /**
   * Actualizar engagement de suscriptor
   */
  async updateEngagement(subscriberId: string, engagement: Partial<NewsletterSubscriber['engagement']>): Promise<CRUDResponse<void>> {
    try {
      const subscriber = await this.getById(subscriberId);
      if (!subscriber) {
        return {
          success: false,
          error: 'Subscriber not found'
        };
      }

      const updatedEngagement = {
        ...subscriber.engagement,
        ...engagement
      };

      // Recalcular rates
      if (updatedEngagement.total_opens > 0) {
        updatedEngagement.open_rate = Number((updatedEngagement.total_opens / (updatedEngagement.total_opens + 1) * 100).toFixed(2));
      }
      if (updatedEngagement.total_clicks > 0) {
        updatedEngagement.click_rate = Number((updatedEngagement.total_clicks / (updatedEngagement.total_opens || 1) * 100).toFixed(2));
      }

      return await this.update(subscriberId, {
        engagement: updatedEngagement
      });
    } catch (error) {
      console.error('Error updating subscriber engagement:', error);
      return {
        success: false,
        error: 'Failed to update subscriber engagement',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Servicio de Autores
export class NewsletterAuthorService extends BaseFirestoreService<any> {
  constructor() {
    super(COLLECTIONS.NEWSLETTER_AUTHORS || 'blog_authors');
  }

  // Buscar autor por email
  async getByEmail(email: string): Promise<CRUDResponse<any>> {
    try {
      const result = await this.getAll([{ field: 'email', operator: '==', value: email }]);

      if (result.success && result.data.length > 0) {
        return {
          success: true,
          data: result.data[0]
        };
      }

      return {
        success: false,
        error: 'Author not found',
        message: `No author found with email: ${email}`
      };
    } catch (error) {
      console.error('Error getting author by email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Obtener autores destacados
  async getFeatured(): Promise<CRUDResponse<any[]>> {
    try {
      return await this.getAll([{ field: 'featured', operator: '==', value: true }]);
    } catch (error) {
      console.error('Error getting featured authors:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Instancias de servicios exportadas
export const newsletterCategoryService = new NewsletterCategoryService();
export const newsletterArticleService = new NewsletterArticleService();
export const newsletterSubscriberService = new NewsletterSubscriberService();
export const autoresService = new NewsletterAuthorService();