// Service Worker for Métrica FM PWA
// Provides offline capabilities, caching, and background sync

const CACHE_NAME = 'metrica-fm-v1.0.0';
const STATIC_CACHE_NAME = 'metrica-fm-static-v1.0.0';
const RUNTIME_CACHE_NAME = 'metrica-fm-runtime-v1.0.0';

// Resources to cache on install
const STATIC_RESOURCES = [
  '/',
  '/manifest.json',
  '/offline',
  '/_next/static/css/',
  '/_next/static/chunks/',
];

// Runtime caching patterns
const CACHE_STRATEGIES = {
  images: {
    cacheName: 'metrica-fm-images',
    strategy: 'CacheFirst',
    maxEntries: 100,
    maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
  },
  api: {
    cacheName: 'metrica-fm-api',
    strategy: 'NetworkFirst',
    maxEntries: 50,
    maxAgeSeconds: 24 * 60 * 60, // 1 day
  },
  pages: {
    cacheName: 'metrica-fm-pages',
    strategy: 'NetworkFirst',
    maxEntries: 30,
    maxAgeSeconds: 24 * 60 * 60, // 1 day
  }
};

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        return cache.addAll(STATIC_RESOURCES.filter(url => !url.endsWith('/')));
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE_NAME && 
                cacheName !== RUNTIME_CACHE_NAME &&
                !Object.values(CACHE_STRATEGIES).some(strategy => strategy.cacheName === cacheName)) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Claim all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Skip chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle different resource types
  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
  } else if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request));
  } else if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
  } else {
    event.respondWith(handleOtherRequest(request));
  }
});

// Handle image requests with cache-first strategy
async function handleImageRequest(request) {
  const cache = await caches.open(CACHE_STRATEGIES.images.cacheName);
  
  try {
    // Try cache first
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Fetch from network
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('Failed to fetch image:', request.url, error);
    
    // Return fallback image if available
    const fallbackImage = await cache.match('/icons/icon-192x192.png');
    if (fallbackImage) {
      return fallbackImage;
    }
    
    // Return empty response as last resort
    return new Response('', { status: 408, statusText: 'Request timeout' });
  }
}

// Handle API requests with network-first strategy
async function handleAPIRequest(request) {
  const cache = await caches.open(CACHE_STRATEGIES.api.cacheName);
  
  try {
    // Try network first
    const networkResponse = await fetch(request, { timeout: 5000 });
    
    // Cache successful GET requests
    if (networkResponse.ok && request.method === 'GET') {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('API request failed, trying cache:', request.url, error);
    
    // Try cache as fallback
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for GET requests
    if (request.method === 'GET') {
      return new Response(JSON.stringify({
        error: 'Offline',
        message: 'No network connection available'
      }), {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    throw error;
  }
}

// Handle navigation requests with network-first strategy
async function handleNavigationRequest(request) {
  const cache = await caches.open(CACHE_STRATEGIES.pages.cacheName);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('Navigation request failed, trying cache:', request.url, error);
    
    // Try cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Try cached home page as fallback
    const homeResponse = await cache.match('/');
    if (homeResponse) {
      return homeResponse;
    }
    
    // Return offline page as last resort
    try {
      const offlineResponse = await cache.match('/offline');
      if (offlineResponse) {
        return offlineResponse;
      }
    } catch (offlineError) {
      console.warn('No offline page available');
    }
    
    // Return basic offline response
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Sin conexión - Métrica FM</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
              padding: 2rem; 
              text-align: center; 
              background: #003F6F;
              color: white;
              margin: 0;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container { max-width: 400px; }
            h1 { color: #007bc4; margin-bottom: 1rem; }
            button { 
              background: #007bc4; 
              color: white; 
              border: none; 
              padding: 0.75rem 1.5rem; 
              border-radius: 0.5rem; 
              cursor: pointer;
              margin-top: 1rem;
            }
            button:hover { background: #005c94; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Sin conexión</h1>
            <p>No hay conexión a internet disponible. Por favor, verifica tu conexión y vuelve a intentar.</p>
            <button onclick="window.location.reload()">Reintentar</button>
          </div>
        </body>
      </html>
    `, {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
}

// Handle other requests (CSS, JS, etc.)
async function handleOtherRequest(request) {
  try {
    // Try network first for fresh content
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Try cache as fallback
    const cache = await caches.open(RUNTIME_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Also try static cache
    const staticCache = await caches.open(STATIC_CACHE_NAME);
    const staticCachedResponse = await staticCache.match(request);
    
    if (staticCachedResponse) {
      return staticCachedResponse;
    }
    
    throw error;
  }
}

// Handle messages from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Handle background sync
async function doBackgroundSync() {
  try {
    // Process any queued offline actions here
    console.log('Processing background sync tasks...');
    
    // Example: sync form submissions, analytics, etc.
    // This would integrate with your app's offline queue
    
  } catch (error) {
    console.error('Background sync failed:', error);
    throw error; // This will retry the sync later
  }
}

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  const options = {
    body: 'Tienes nuevas actualizaciones de Métrica FM',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver más',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/icons/xmark.png'
      },
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Métrica FM', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'explore') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('Service Worker loaded successfully');