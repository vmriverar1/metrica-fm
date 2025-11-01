'use client';

import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, Home, BookOpen, Briefcase, Phone, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
// Removed invalid import

export default function OfflinePage() {
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);
  const [cachedPages, setCachedPages] = useState<string[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [cacheStats, setCacheStats] = useState<any>(null);

  useEffect(() => {
    // Check what pages are available offline
    const checkCachedContent = async () => {
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys();
          const availablePages: string[] = [];
          
          for (const cacheName of cacheNames) {
            if (cacheName.includes('metrica-pages-cache') || cacheName.includes('metrica-home-cache')) {
              const cache = await caches.open(cacheName);
              const requests = await cache.keys();
              
              for (const request of requests) {
                const url = new URL(request.url);
                if (url.pathname !== '/offline') {
                  availablePages.push(url.pathname);
                }
              }
            }
          }
          
          setCachedPages([...new Set(availablePages)]);
        } catch (error) {
          console.error('Error checking cached content:', error);
        }
      }
    };

    checkCachedContent();
  }, []);

  // Monitor online status
  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();

    // Auto-redirect when back online
    if (isOnline) {
      setTimeout(() => {
        router.back();
      }, 1000);
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [isOnline, router]);

  const handleRetry = async () => {
    setIsRetrying(true);
    
    try {
      // Try to fetch a small resource to test connectivity
      await fetch('/manifest.json', { 
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000)
      });
      
      // If successful, go back
      router.back();
    } catch (error) {
      console.log('Still offline');
    } finally {
      setIsRetrying(false);
    }
  };

  const navigateToPage = (path: string) => {
    router.push(path);
  };

  const getPageIcon = (path: string) => {
    if (path === '/' || path.includes('home')) return <Home className="w-4 h-4" />;
    if (path.includes('portfolio')) return <Briefcase className="w-4 h-4" />;
    if (path.includes('blog')) return <BookOpen className="w-4 h-4" />;
    if (path.includes('contact')) return <Phone className="w-4 h-4" />;
    return <ArrowLeft className="w-4 h-4" />;
  };

  const getPageName = (path: string) => {
    if (path === '/') return 'Inicio';
    if (path.includes('portfolio')) return 'Portfolio';
    if (path.includes('about')) return 'Nosotros';
    if (path.includes('blog')) return 'Blog';
    if (path.includes('contact')) return 'Contacto';
    if (path.includes('services')) return 'Servicios';
    return path.replace('/', '').replace('-', ' ');
  };

  if (isOnline) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-6">
            <RefreshCw className="w-12 h-12 text-green-500 mx-auto animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Reconectado
          </h1>
          <p className="text-muted-foreground">
            Regresando al contenido...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">M</span>
              </div>
              <span className="font-semibold text-foreground">Métrica FM</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm">
              <WifiOff className="w-4 h-4" />
              Sin conexión
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Main message */}
          <div className="text-center mb-12">
            <div className="mb-6">
              <WifiOff className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Sin conexión a Internet
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              No te preocupes, puedes seguir navegando el contenido disponible offline o intentar reconectar.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleRetry}
                disabled={isRetrying}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Reintentando...' : 'Reintentar conexión'}
              </button>
              
              <button 
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Ir atrás
              </button>
            </div>
          </div>

          {/* Available offline content */}
          {cachedPages.length > 0 && (
            <div className="bg-card rounded-lg border p-6 mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Contenido disponible offline
              </h2>
              <p className="text-muted-foreground mb-6">
                Estas páginas están disponibles sin conexión a internet:
              </p>
              
              <div className="grid gap-3">
                {cachedPages.slice(0, 6).map((path) => (
                  <button
                    key={path}
                    onClick={() => navigateToPage(path)}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors text-left"
                  >
                    {getPageIcon(path)}
                    <div>
                      <div className="font-medium text-foreground">{getPageName(path)}</div>
                      <div className="text-sm text-muted-foreground">{path}</div>
                    </div>
                  </button>
                ))}
              </div>
              
              {cachedPages.length > 6 && (
                <div className="mt-4 text-center">
                  <span className="text-sm text-muted-foreground">
                    y {cachedPages.length - 6} páginas más disponibles offline
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Cache stats for development */}
          {process.env.NODE_ENV === 'development' && cacheStats && (
            <div className="bg-muted rounded-lg p-4 text-sm">
              <h3 className="font-semibold mb-2">Cache Info (Dev)</h3>
              <div className="space-y-1 text-muted-foreground">
                <div>Total entries: {cacheStats.totalEntries}</div>
                <div>Valid entries: {cacheStats.validEntries}</div>
                <div>Cached paths: {cacheStats.cachePaths?.length || 0}</div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t bg-card/50">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
          <p className="text-sm">
            Métrica FM - Funcionalidad offline habilitada
          </p>
        </div>
      </footer>
    </div>
  );
}