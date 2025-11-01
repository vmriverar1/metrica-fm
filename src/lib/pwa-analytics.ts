'use client';

interface PWAMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface PerformanceReport {
  session: {
    id: string;
    startTime: number;
    duration: number;
    pageViews: number;
    isOffline: boolean;
    userAgent: string;
    viewport: { width: number; height: number };
  };
  cache: {
    hits: number;
    misses: number;
    hitRate: number;
    totalSize: number;
    compressionRatio: number;
    invalidations: number;
  };
  network: {
    effectiveType: string;
    downlink: number;
    rtt: number;
    totalRequests: number;
    failedRequests: number;
    averageResponseTime: number;
  };
  pwa: {
    installPromptShown: number;
    installAccepted: number;
    installRejected: number;
    offlinePageViews: number;
    serviceWorkerUpdates: number;
    backgroundSync: number;
  };
  performance: {
    jsonLoadTimes: Record<string, number>;
    routeLoadTimes: Record<string, number>;
    memoryUsage: number;
    cacheStorage: number;
  };
}

class PWAAnalytics {
  private metrics: PWAMetric[] = [];
  private sessionId: string;
  private sessionStart: number;
  private pageViews = 0;
  private cacheStats = { hits: 0, misses: 0, invalidations: 0 };
  private networkStats = { requests: 0, failures: 0, totalResponseTime: 0 };
  private pwaStats = { 
    installShown: 0, installAccepted: 0, installRejected: 0, 
    offlineViews: 0, swUpdates: 0, backgroundSync: 0 
  };

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStart = Date.now();
    this.initializeTracking();
  }

  private generateSessionId(): string {
    return `pwa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeTracking(): void {
    if (typeof window === 'undefined') return;

    // Track page views
    this.trackPageView();
    
    // Listen to navigation changes
    window.addEventListener('popstate', () => this.trackPageView());
    
    // Track PWA events
    this.setupPWAEventListeners();
    
    // Track performance metrics
    this.setupPerformanceTracking();
    
    // Track network changes
    this.setupNetworkTracking();

    // Send analytics periodically
    setInterval(() => this.sendAnalytics(), 30000); // Every 30 seconds
    
    // Send analytics before page unload
    window.addEventListener('beforeunload', () => this.sendAnalytics());
  }

  private setupPWAEventListeners(): void {
    // Install prompt events
    window.addEventListener('beforeinstallprompt', () => {
      this.trackPWAEvent('install_prompt_shown');
      this.pwaStats.installShown++;
    });

    // Listen to custom PWA events via BroadcastChannel
    const pwaChannel = new BroadcastChannel('metrica-pwa-analytics');
    pwaChannel.addEventListener('message', (event) => {
      const { type, data } = event.data;
      
      switch (type) {
        case 'INSTALL_ACCEPTED':
          this.trackPWAEvent('install_accepted');
          this.pwaStats.installAccepted++;
          break;
        case 'INSTALL_REJECTED':
          this.trackPWAEvent('install_rejected');
          this.pwaStats.installRejected++;
          break;
        case 'OFFLINE_PAGE_VIEW':
          this.trackPWAEvent('offline_page_view');
          this.pwaStats.offlineViews++;
          break;
        case 'SW_UPDATE':
          this.trackPWAEvent('service_worker_update');
          this.pwaStats.swUpdates++;
          break;
        case 'CACHE_HIT':
          this.cacheStats.hits++;
          break;
        case 'CACHE_MISS':
          this.cacheStats.misses++;
          break;
        case 'CACHE_INVALIDATION':
          this.cacheStats.invalidations++;
          break;
      }
    });
  }

  private setupPerformanceTracking(): void {
    // Track Core Web Vitals
    this.trackWebVitals();
    
    // Track memory usage
    this.trackMemoryUsage();
    
    // Track cache storage usage
    this.trackCacheStorage();
  }

  private trackWebVitals(): void {
    // First Contentful Paint
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          this.trackMetric('fcp', entry.startTime);
        }
        
        if (entry.name === 'largest-contentful-paint') {
          this.trackMetric('lcp', entry.startTime);
        }
      });
    });
    
    try {
      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
    } catch (error) {
      console.log('[PWAAnalytics] Performance observer not supported');
    }

    // Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as any[]) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      this.trackMetric('cls', clsValue);
    });
    
    try {
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.log('[PWAAnalytics] Layout shift observer not supported');
    }
  }

  private trackMemoryUsage(): void {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      this.trackMetric('memory_used', memInfo.usedJSHeapSize);
      this.trackMetric('memory_total', memInfo.totalJSHeapSize);
    }
  }

  private async trackCacheStorage(): Promise<void> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        this.trackMetric('storage_quota', estimate.quota || 0);
        this.trackMetric('storage_usage', estimate.usage || 0);
      } catch (error) {
        console.log('[PWAAnalytics] Storage estimate not available');
      }
    }
  }

  private setupNetworkTracking(): void {
    // Override fetch to track network requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      this.networkStats.requests++;
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        this.networkStats.totalResponseTime += (endTime - startTime);
        
        if (!response.ok) {
          this.networkStats.failures++;
        }
        
        return response;
      } catch (error) {
        this.networkStats.failures++;
        throw error;
      }
    };
  }

  // Public methods for tracking specific events
  trackMetric(name: string, value: number, metadata?: Record<string, any>): void {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
      metadata
    });
  }

  trackPageView(): void {
    this.pageViews++;
    this.trackMetric('page_view', 1, {
      path: window.location.pathname,
      referrer: document.referrer,
      timestamp: Date.now()
    });
  }

  trackPWAEvent(event: string, metadata?: Record<string, any>): void {
    this.trackMetric('pwa_event', 1, {
      event,
      ...metadata
    });
  }

  trackJSONLoad(path: string, loadTime: number, fromCache: boolean): void {
    this.trackMetric('json_load', loadTime, {
      path,
      fromCache,
      timestamp: Date.now()
    });
  }

  trackRouteLoad(route: string, loadTime: number): void {
    this.trackMetric('route_load', loadTime, {
      route,
      timestamp: Date.now()
    });
  }

  // Generate comprehensive performance report
  generateReport(): PerformanceReport {
    const now = Date.now();
    const sessionDuration = now - this.sessionStart;
    
    // Calculate averages and aggregations
    const jsonLoadTimes: Record<string, number> = {};
    const routeLoadTimes: Record<string, number> = {};
    
    this.metrics.forEach(metric => {
      if (metric.name === 'json_load' && metric.metadata?.path) {
        jsonLoadTimes[metric.metadata.path] = metric.value;
      }
      if (metric.name === 'route_load' && metric.metadata?.route) {
        routeLoadTimes[metric.metadata.route] = metric.value;
      }
    });

    const networkInfo = this.getNetworkInfo();
    const memoryMetric = this.metrics.find(m => m.name === 'memory_used');
    const storageMetric = this.metrics.find(m => m.name === 'storage_usage');

    return {
      session: {
        id: this.sessionId,
        startTime: this.sessionStart,
        duration: sessionDuration,
        pageViews: this.pageViews,
        isOffline: !navigator.onLine,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      },
      cache: {
        hits: this.cacheStats.hits,
        misses: this.cacheStats.misses,
        hitRate: this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses) || 0,
        totalSize: storageMetric?.value || 0,
        compressionRatio: 0, // Will be calculated by cache compressor
        invalidations: this.cacheStats.invalidations
      },
      network: {
        effectiveType: networkInfo.effectiveType,
        downlink: networkInfo.downlink,
        rtt: networkInfo.rtt,
        totalRequests: this.networkStats.requests,
        failedRequests: this.networkStats.failures,
        averageResponseTime: this.networkStats.requests > 0 ?
          this.networkStats.totalResponseTime / this.networkStats.requests : 0
      },
      pwa: {
        installPromptShown: this.pwaStats.installShown,
        installAccepted: this.pwaStats.installAccepted,
        installRejected: this.pwaStats.installRejected,
        offlinePageViews: this.pwaStats.offlineViews,
        serviceWorkerUpdates: this.pwaStats.swUpdates,
        backgroundSync: this.pwaStats.backgroundSync
      },
      performance: {
        jsonLoadTimes,
        routeLoadTimes,
        memoryUsage: memoryMetric?.value || 0,
        cacheStorage: storageMetric?.value || 0
      }
    };
  }

  private getNetworkInfo() {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    return {
      effectiveType: connection?.effectiveType || '4g',
      downlink: connection?.downlink || 10,
      rtt: connection?.rtt || 50
    };
  }

  // Send analytics to server (or localStorage for development)
  private async sendAnalytics(): Promise<void> {
    const report = this.generateReport();
    
    if (process.env.NODE_ENV === 'development') {
      // Store in localStorage for development
      const reports = JSON.parse(localStorage.getItem('pwa-analytics') || '[]');
      reports.push(report);
      
      // Keep only last 10 reports
      if (reports.length > 10) {
        reports.splice(0, reports.length - 10);
      }
      
      localStorage.setItem('pwa-analytics', JSON.stringify(reports));
      console.log('[PWAAnalytics] Report saved to localStorage:', report);
    } else {
      // Send to analytics server
      try {
        await fetch('/api/analytics/pwa', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(report)
        });
      } catch (error) {
        console.log('[PWAAnalytics] Failed to send analytics:', error);
      }
    }

    // Clear old metrics to prevent memory issues
    this.clearOldMetrics();
  }

  private clearOldMetrics(): void {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    this.metrics = this.metrics.filter(metric => metric.timestamp > oneHourAgo);
  }

  // Get current analytics summary
  getSummary(): {
    sessionDuration: number;
    pageViews: number;
    cacheHitRate: number;
    networkFailureRate: number;
    averageJsonLoadTime: number;
  } {
    const sessionDuration = Date.now() - this.sessionStart;
    const totalCacheRequests = this.cacheStats.hits + this.cacheStats.misses;
    const cacheHitRate = totalCacheRequests > 0 ? this.cacheStats.hits / totalCacheRequests : 0;
    const networkFailureRate = this.networkStats.requests > 0 ? 
      this.networkStats.failures / this.networkStats.requests : 0;
    
    const jsonLoadMetrics = this.metrics.filter(m => m.name === 'json_load');
    const averageJsonLoadTime = jsonLoadMetrics.length > 0 ?
      jsonLoadMetrics.reduce((sum, m) => sum + m.value, 0) / jsonLoadMetrics.length : 0;

    return {
      sessionDuration,
      pageViews: this.pageViews,
      cacheHitRate,
      networkFailureRate,
      averageJsonLoadTime
    };
  }

  // Get stored analytics reports (development only)
  static getStoredReports(): PerformanceReport[] {
    if (process.env.NODE_ENV === 'development') {
      return JSON.parse(localStorage.getItem('pwa-analytics') || '[]');
    }
    return [];
  }

  // Clear stored analytics reports
  static clearStoredReports(): void {
    if (process.env.NODE_ENV === 'development') {
      localStorage.removeItem('pwa-analytics');
    }
  }
}

// Global analytics instance
export const pwaAnalytics = new PWAAnalytics();

// React hook for using analytics
export function usePWAAnalytics() {
  return {
    trackMetric: (name: string, value: number, metadata?: Record<string, any>) => 
      pwaAnalytics.trackMetric(name, value, metadata),
    trackPageView: () => pwaAnalytics.trackPageView(),
    trackPWAEvent: (event: string, metadata?: Record<string, any>) => 
      pwaAnalytics.trackPWAEvent(event, metadata),
    trackJSONLoad: (path: string, loadTime: number, fromCache: boolean) =>
      pwaAnalytics.trackJSONLoad(path, loadTime, fromCache),
    trackRouteLoad: (route: string, loadTime: number) =>
      pwaAnalytics.trackRouteLoad(route, loadTime),
    getSummary: () => pwaAnalytics.getSummary(),
    generateReport: () => pwaAnalytics.generateReport()
  };
}

export type { PerformanceReport, PWAMetric };