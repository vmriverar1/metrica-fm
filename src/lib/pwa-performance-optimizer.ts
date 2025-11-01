'use client';

import { PWAJsonReader } from './pwa-json-reader';

interface PreloadConfig {
  critical: string[];
  important: string[];
  lazy: string[];
}

interface LoadPriority {
  path: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  condition?: () => boolean;
  delay?: number;
}

class PWAPerformanceOptimizer {
  private loadedPaths = new Set<string>();
  private loadingPromises = new Map<string, Promise<any>>();
  private performanceMetrics = new Map<string, number>();
  
  // Performance-optimized preload configuration
  private static readonly PRELOAD_CONFIG: PreloadConfig = {
    critical: [
      '/api/admin/pages/home'
    ],
    important: [
      '/api/admin/pages/portfolio',
      '/api/admin/megamenu'
    ],
    lazy: [
      '/api/admin/pages/compromiso',
      '/api/admin/pages/clientes'
    ]
  };

  // Smart preloader that loads based on priority and network conditions
  async smartPreload(): Promise<void> {
    const networkInfo = this.getNetworkInfo();
    const loadOrder = this.calculateLoadOrder(networkInfo);
    
    console.log('[PWAOptimizer] Starting smart preload with network:', networkInfo);
    
    // Load critical content immediately
    await this.loadBatch(loadOrder.filter(item => item.priority === 'critical'));
    
    // Load important content with small delay
    setTimeout(() => {
      this.loadBatch(loadOrder.filter(item => item.priority === 'high'));
    }, 500);
    
    // Load medium priority content when network is good
    if (networkInfo.effectiveType !== 'slow-2g' && networkInfo.effectiveType !== '2g') {
      setTimeout(() => {
        this.loadBatch(loadOrder.filter(item => item.priority === 'medium'));
      }, 2000);
    }
    
    // Load low priority content only on fast connections
    if (networkInfo.effectiveType === '4g' || networkInfo.downlink > 2) {
      setTimeout(() => {
        this.loadBatch(loadOrder.filter(item => item.priority === 'low'));
      }, 5000);
    }
  }

  // Intelligent lazy loading with intersection observer
  setupIntelligentLazyLoading(): void {
    if (typeof window === 'undefined') return;
    
    // Set up intersection observer for route-based lazy loading
    const routeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const route = entry.target.getAttribute('data-route');
          if (route) {
            this.preloadForRoute(route);
          }
        }
      });
    }, { 
      rootMargin: '200px' // Start loading 200px before element is visible
    });

    // Observe navigation elements
    document.querySelectorAll('[data-route]').forEach(el => {
      routeObserver.observe(el);
    });

    // Set up hover-based preloading for better UX
    document.addEventListener('mouseover', this.handleHoverPreload.bind(this));
    document.addEventListener('touchstart', this.handleTouchPreload.bind(this));
  }

  // Load content based on user's current route
  private async preloadForRoute(route: string): Promise<void> {
    const routeMap: Record<string, string[]> = {
      '/portfolio': ['/api/admin/pages/portfolio'],
      '/about': ['/api/admin/pages/compromiso', '/api/admin/pages/clientes'],
      '/blog': ['/api/admin/pages/blog'],
      '/contact': ['/api/admin/pages/contact']
    };

    const paths = routeMap[route] || [];
    await this.loadBatch(paths.map(path => ({ path, priority: 'medium' as const })));
  }

  // Handle hover-based preloading
  private handleHoverPreload(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const link = target.closest('a[href]') as HTMLAnchorElement;
    
    if (link && link.origin === window.location.origin) {
      const path = link.pathname;
      this.preloadForRoute(path);
    }
  }

  // Handle touch-based preloading for mobile
  private handleTouchPreload(event: TouchEvent): void {
    const target = event.target as HTMLElement;
    const link = target.closest('a[href]') as HTMLAnchorElement;
    
    if (link && link.origin === window.location.origin) {
      const path = link.pathname;
      this.preloadForRoute(path);
    }
  }

  // Load a batch of JSON files with performance tracking
  private async loadBatch(items: LoadPriority[]): Promise<void> {
    const promises = items
      .filter(item => !this.loadedPaths.has(item.path))
      .filter(item => !item.condition || item.condition())
      .map(item => this.loadWithMetrics(item.path));

    await Promise.all(promises);
  }

  // Load with performance metrics
  private async loadWithMetrics(path: string): Promise<any> {
    if (this.loadingPromises.has(path)) {
      return this.loadingPromises.get(path);
    }

    const startTime = performance.now();
    
    const promise = fetch(path, {
        cache: 'no-cache',
        headers: { 'Content-Type': 'application/json' }
      })
      .then(async response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} for ${path}`);
        }
        const result = await response.json();
        return result.data?.content || result.data || result;
      })
      .then(data => {
        const loadTime = performance.now() - startTime;
        this.performanceMetrics.set(path, loadTime);
        this.loadedPaths.add(path);

        console.log(`[PWAOptimizer] Loaded ${path} in ${loadTime.toFixed(2)}ms`);
        return data;
      })
      .catch(error => {
        console.warn(`[PWAOptimizer] Failed to load ${path}:`, error);
        // Return empty object instead of throwing to prevent cascade failures
        return {};
      })
      .finally(() => {
        this.loadingPromises.delete(path);
      });

    this.loadingPromises.set(path, promise);
    return promise;
  }

  // Get network information for optimization decisions
  private getNetworkInfo(): NetworkInformation {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    return {
      effectiveType: connection?.effectiveType || '4g',
      downlink: connection?.downlink || 10,
      rtt: connection?.rtt || 50,
      saveData: connection?.saveData || false
    };
  }

  // Calculate optimal load order based on network conditions
  private calculateLoadOrder(networkInfo: NetworkInformation): LoadPriority[] {
    const { critical, important, lazy } = PWAPerformanceOptimizer.PRELOAD_CONFIG;
    
    const loadOrder: LoadPriority[] = [];
    
    // Critical - always load first
    critical.forEach(path => {
      loadOrder.push({ path, priority: 'critical' });
    });
    
    // Important - adjust based on network
    important.forEach(path => {
      const priority = networkInfo.effectiveType === 'slow-2g' ? 'medium' : 'high';
      loadOrder.push({ path, priority });
    });
    
    // Lazy - only on good connections
    lazy.forEach(path => {
      const priority = networkInfo.downlink > 1 ? 'low' : 'medium';
      const condition = () => !networkInfo.saveData && networkInfo.downlink > 0.5;
      loadOrder.push({ path, priority, condition });
    });
    
    return loadOrder;
  }

  // Get performance metrics for analytics
  getPerformanceMetrics(): Record<string, number> {
    return Object.fromEntries(this.performanceMetrics);
  }

  // Check if path is already loaded
  isLoaded(path: string): boolean {
    return this.loadedPaths.has(path);
  }

  // Force reload with cache invalidation
  async forceReload(path: string): Promise<any> {
    this.loadedPaths.delete(path);
    await PWAJsonReader.invalidateOnEdit(path);
    return this.loadWithMetrics(path);
  }

  // Clear all metrics and loaded paths (useful for testing)
  reset(): void {
    this.loadedPaths.clear();
    this.loadingPromises.clear();
    this.performanceMetrics.clear();
  }

  // Get loading statistics
  getStats(): {
    totalLoaded: number;
    currentlyLoading: number;
    averageLoadTime: number;
    fastestLoad: number;
    slowestLoad: number;
  } {
    const loadTimes = Array.from(this.performanceMetrics.values());
    
    return {
      totalLoaded: this.loadedPaths.size,
      currentlyLoading: this.loadingPromises.size,
      averageLoadTime: loadTimes.length > 0 ? loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length : 0,
      fastestLoad: loadTimes.length > 0 ? Math.min(...loadTimes) : 0,
      slowestLoad: loadTimes.length > 0 ? Math.max(...loadTimes) : 0
    };
  }
}

interface NetworkInformation {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

// Global instance
export const pwaOptimizer = new PWAPerformanceOptimizer();

// React hook for using the optimizer
export function usePWAOptimizer() {
  return {
    smartPreload: () => pwaOptimizer.smartPreload(),
    setupLazyLoading: () => pwaOptimizer.setupIntelligentLazyLoading(),
    getStats: () => pwaOptimizer.getStats(),
    getMetrics: () => pwaOptimizer.getPerformanceMetrics(),
    isLoaded: (path: string) => pwaOptimizer.isLoaded(path),
    forceReload: (path: string) => pwaOptimizer.forceReload(path)
  };
}