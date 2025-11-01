'use client';

interface OfflineCacheConfig {
  name: string;
  version: string;
  maxAge: number; // milliseconds
  maxEntries: number;
}

interface CachedItem {
  url: string;
  data: any;
  timestamp: number;
  expires: number;
}

export class OfflineCacheManager {
  private config: OfflineCacheConfig;
  private dbName: string;
  private dbVersion: number = 1;

  constructor(config: OfflineCacheConfig) {
    this.config = config;
    this.dbName = `metrica-offline-${config.name}`;
  }

  // Initialize IndexedDB for offline storage
  private async initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('cache')) {
          const store = db.createObjectStore('cache', { keyPath: 'url' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('expires', 'expires', { unique: false });
        }
      };
    });
  }

  // Store content for offline use
  async storeOfflineContent(url: string, data: any): Promise<void> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');

      const item: CachedItem = {
        url,
        data,
        timestamp: Date.now(),
        expires: Date.now() + this.config.maxAge
      };

      store.put(item);

      // Clean up expired entries
      await this.cleanExpiredEntries();
      
    } catch (error) {
      console.error('Error storing offline content:', error);
    }
  }

  // Retrieve content from offline cache
  async getOfflineContent<T>(url: string): Promise<T | null> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');

      return new Promise((resolve, reject) => {
        const request = store.get(url);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const item: CachedItem | undefined = request.result;
          
          if (!item) {
            resolve(null);
            return;
          }

          // Check if expired
          if (Date.now() > item.expires) {
            this.removeOfflineContent(url);
            resolve(null);
            return;
          }

          resolve(item.data);
        };
      });
    } catch (error) {
      console.error('Error retrieving offline content:', error);
      return null;
    }
  }

  // Remove specific content from offline cache
  async removeOfflineContent(url: string): Promise<void> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      
      store.delete(url);
    } catch (error) {
      console.error('Error removing offline content:', error);
    }
  }

  // Clean expired entries
  private async cleanExpiredEntries(): Promise<void> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const index = store.index('expires');

      const now = Date.now();
      const range = IDBKeyRange.upperBound(now);
      
      index.openCursor(range).onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
    } catch (error) {
      console.error('Error cleaning expired entries:', error);
    }
  }

  // Get cache statistics
  async getCacheStats(): Promise<{
    totalEntries: number;
    totalSize: number;
    oldestEntry: number | null;
    newestEntry: number | null;
  }> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');

      return new Promise((resolve, reject) => {
        let totalEntries = 0;
        let totalSize = 0;
        let oldestEntry: number | null = null;
        let newestEntry: number | null = null;

        store.openCursor().onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          
          if (cursor) {
            const item: CachedItem = cursor.value;
            totalEntries++;
            totalSize += JSON.stringify(item.data).length;

            if (!oldestEntry || item.timestamp < oldestEntry) {
              oldestEntry = item.timestamp;
            }
            if (!newestEntry || item.timestamp > newestEntry) {
              newestEntry = item.timestamp;
            }

            cursor.continue();
          } else {
            resolve({ totalEntries, totalSize, oldestEntry, newestEntry });
          }
        };
      });
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return { totalEntries: 0, totalSize: 0, oldestEntry: null, newestEntry: null };
    }
  }

  // Clear all offline cache
  async clearOfflineCache(): Promise<void> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      
      store.clear();
    } catch (error) {
      console.error('Error clearing offline cache:', error);
    }
  }

  // Pre-cache essential content for offline use
  static async preloadEssentialContent(): Promise<void> {
    const essentialPages = [
      '/',
      '/portfolio',
      '/about/cultura',
      '/services',
      '/contact'
    ];

    const essentialAPIs = [
      '/api/admin/pages/home',
      '/api/admin/pages/portfolio',
      '/api/admin/megamenu'
    ];

    const pageCache = new OfflineCacheManager({
      name: 'pages',
      version: '1.0.0',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      maxEntries: 20
    });

    const jsonCache = new OfflineCacheManager({
      name: 'json',
      version: '1.0.0',
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
      maxEntries: 50
    });

    // Preload pages
    for (const page of essentialPages) {
      try {
        const response = await fetch(page, { cache: 'no-cache' });
        if (response.ok) {
          const html = await response.text();
          await pageCache.storeOfflineContent(page, html);
        }
      } catch (error) {
        console.log(`Failed to preload page ${page}:`, error);
      }
    }

    // Preload APIs
    for (const apiPath of essentialAPIs) {
      try {
        const response = await fetch(apiPath, { cache: 'no-cache' });
        if (response.ok) {
          const data = await response.json();
          await jsonCache.storeOfflineContent(apiPath, data);
        }
      } catch (error) {
        console.log(`Failed to preload API ${apiPath}:`, error);
      }
    }

    console.log('[OfflineCacheManager] Essential content preloaded');
  }
}

// Pre-configured cache instances
export const offlinePageCache = new OfflineCacheManager({
  name: 'pages',
  version: '1.0.0',
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  maxEntries: 20
});

export const offlineJSONCache = new OfflineCacheManager({
  name: 'json',
  version: '1.0.0',
  maxAge: 2 * 60 * 60 * 1000, // 2 hours
  maxEntries: 50
});

export const offlineMediaCache = new OfflineCacheManager({
  name: 'media',
  version: '1.0.0',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  maxEntries: 100
});