// FASE 4A: Offline-First Strategies
// Configuración avanzada para PWA con capacidades offline

export interface OfflineStrategy {
  cacheName: string;
  strategy: 'CacheFirst' | 'NetworkFirst' | 'StaleWhileRevalidate' | 'NetworkOnly';
  expiration?: {
    maxEntries?: number;
    maxAgeSeconds?: number;
    purgeOnQuotaError?: boolean;
  };
}

export interface BackgroundSyncConfig {
  queueName: string;
  maxRetentionTime: number; // 24 hours
  fallbackAction?: () => Promise<void>;
}

// Estrategias de cache optimizadas para Firebase App Hosting
export const OFFLINE_CACHE_STRATEGIES: Record<string, OfflineStrategy> = {
  // Páginas críticas - Cache First
  staticPages: {
    cacheName: 'static-pages-v1',
    strategy: 'CacheFirst',
    expiration: {
      maxEntries: 30,
      maxAgeSeconds: 24 * 60 * 60, // 24 horas
      purgeOnQuotaError: true,
    },
  },

  // Portfolio data - Stale While Revalidate
  portfolioData: {
    cacheName: 'portfolio-data-v1',
    strategy: 'StaleWhileRevalidate',
    expiration: {
      maxEntries: 100,
      maxAgeSeconds: 2 * 60 * 60, // 2 horas
      purgeOnQuotaError: true,
    },
  },

  // Imágenes - Cache First con expiración larga
  images: {
    cacheName: 'images-v1',
    strategy: 'CacheFirst',
    expiration: {
      maxEntries: 200,
      maxAgeSeconds: 7 * 24 * 60 * 60, // 7 días
      purgeOnQuotaError: true,
    },
  },

  // API Routes - Network First
  apiRoutes: {
    cacheName: 'api-routes-v1',
    strategy: 'NetworkFirst',
    expiration: {
      maxEntries: 50,
      maxAgeSeconds: 30 * 60, // 30 minutos
      purgeOnQuotaError: true,
    },
  },

  // Firestore bundles - Cache First
  bundles: {
    cacheName: 'firestore-bundles-v1',
    strategy: 'CacheFirst',
    expiration: {
      maxEntries: 20,
      maxAgeSeconds: 4 * 60 * 60, // 4 horas
      purgeOnQuotaError: true,
    },
  },
};

// Background Sync para operaciones críticas
export const BACKGROUND_SYNC_QUEUES: Record<string, BackgroundSyncConfig> = {
  // Contact form submissions
  contactForms: {
    queueName: 'contact-forms',
    maxRetentionTime: 24 * 60 * 60 * 1000, // 24 horas
  },

  // Newsletter subscriptions
  newsletterSignups: {
    queueName: 'newsletter-signups',
    maxRetentionTime: 48 * 60 * 60 * 1000, // 48 horas
  },

  // Portfolio analytics tracking
  analytics: {
    queueName: 'portfolio-analytics',
    maxRetentionTime: 7 * 24 * 60 * 60 * 1000, // 7 días
  },

  // Admin operations
  adminOperations: {
    queueName: 'admin-operations',
    maxRetentionTime: 12 * 60 * 60 * 1000, // 12 horas
  },
};

// URL patterns para diferentes estrategias
export const OFFLINE_URL_PATTERNS = {
  staticPages: [
    '/',
    '/portfolio',
    '/services',
    '/about',
    '/contact',
  ],

  apiRoutes: [
    '/api/portfolio/**',
    '/api/contact/**',
    '/api/newsletter/**',
  ],

  images: [
    '/images/**',
    '/icons/**',
    '/screenshots/**',
    'https://metrica-dip.com/**',
    'https://images.unsplash.com/**',
    'https://picsum.photos/**',
  ],

  bundles: [
    '/api/bundles/**',
    '/api/cache/**',
  ],
};

// Configuración de offline fallbacks
export const OFFLINE_FALLBACKS = {
  page: '/offline',
  image: '/images/offline-placeholder.svg',
  font: '/fonts/fallback.woff2',
};

// Configuración para push notifications
export interface PushNotificationConfig {
  vapidPublicKey: string;
  subscriptionEndpoint: string;
  notificationIcon: string;
  badgeIcon: string;
}

export const PUSH_NOTIFICATION_CONFIG: Partial<PushNotificationConfig> = {
  notificationIcon: '/icons/icon-192x192.png',
  badgeIcon: '/icons/badge-72x72.png',
};

// Utility para determinar si una request es crítica
export function isCriticalRequest(url: string): boolean {
  const criticalPatterns = [
    '/api/portfolio/featured',
    '/api/portfolio/categories',
    '/api/bundles/homepage',
    '/manifest.json',
  ];

  return criticalPatterns.some(pattern => url.includes(pattern));
}

// Utility para calcular cache priority
export function calculateCachePriority(url: string): number {
  if (url.includes('/api/bundles/')) return 100;
  if (url.includes('/api/portfolio/featured')) return 90;
  if (url.includes('/api/portfolio/categories')) return 80;
  if (url.includes('/api/portfolio/')) return 70;
  if (url.includes('.json')) return 60;
  if (url.match(/\.(jpg|jpeg|png|webp|svg)$/)) return 50;
  if (url.includes('/api/')) return 40;
  return 30;
}

// Offline sync status tracking
export interface OfflineSyncStatus {
  isOnline: boolean;
  pendingRequests: number;
  lastSyncTime: Date | null;
  failedRequests: string[];
}

export function getOfflineSyncStatus(): OfflineSyncStatus {
  return {
    isOnline: navigator.onLine,
    pendingRequests: 0, // Will be updated by SW
    lastSyncTime: null, // Will be updated by SW
    failedRequests: [], // Will be updated by SW
  };
}