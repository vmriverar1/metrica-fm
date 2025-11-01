// FASE 4D: Web Vitals Performance Monitoring
// Sistema de monitoreo de Core Web Vitals y métricas de rendimiento

import { getCLS, getFCP, getFID, getLCP, getTTFB } from 'web-vitals';

export interface WebVitalsMetric {
  id: string;
  name: 'CLS' | 'FCP' | 'FID' | 'LCP' | 'TTFB';
  value: number;
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  entries: PerformanceEntry[];
  url: string;
  timestamp: number;
  userAgent: string;
  connection?: {
    effectiveType: string;
    downlink: number;
  };
}

export interface PerformanceReport {
  sessionId: string;
  metrics: WebVitalsMetric[];
  pageLoadTime: number;
  domContentLoadedTime: number;
  firstPaintTime?: number;
  navigationTiming: PerformanceTiming;
  resourceTiming: PerformanceResourceTiming[];
  customMetrics: { [key: string]: number };
  errors: PerformanceError[];
  timestamp: number;
}

export interface PerformanceError {
  message: string;
  source: string;
  line: number;
  column: number;
  error: string;
  timestamp: number;
  url: string;
}

class PerformanceMonitor {
  private sessionId: string;
  private metrics: WebVitalsMetric[] = [];
  private errors: PerformanceError[] = [];
  private customMetrics: { [key: string]: number } = {};
  private reportingEndpoint: string;
  private reportingEnabled: boolean;

  constructor(options: {
    reportingEndpoint?: string;
    enabled?: boolean;
  } = {}) {
    this.sessionId = this.generateSessionId();
    this.reportingEndpoint = options.reportingEndpoint || '/api/performance/report';
    this.reportingEnabled = options.enabled ?? true;

    if (typeof window !== 'undefined' && this.reportingEnabled) {
      this.initializeWebVitals();
      this.initializeErrorTracking();
      this.initializeNavigationTiming();
    }
  }

  private generateSessionId(): string {
    return `perf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeWebVitals(): void {
    const sendToAnalytics = (metric: WebVitalsMetric) => {
      this.metrics.push(metric);
      this.reportMetric(metric);
    };

    const createMetricHandler = (name: WebVitalsMetric['name']) => (metric: any) => {
      const connection = (navigator as any).connection;
      const webVitalsMetric: WebVitalsMetric = {
        id: metric.id,
        name,
        value: metric.value,
        delta: metric.delta,
        rating: metric.rating,
        entries: metric.entries,
        url: window.location.href,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        connection: connection ? {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
        } : undefined,
      };
      sendToAnalytics(webVitalsMetric);
    };

    // Core Web Vitals
    getCLS(createMetricHandler('CLS'));
    getFCP(createMetricHandler('FCP'));
    getFID(createMetricHandler('FID'));
    getLCP(createMetricHandler('LCP'));
    getTTFB(createMetricHandler('TTFB'));
  }

  private initializeErrorTracking(): void {
    window.addEventListener('error', (event) => {
      const error: PerformanceError = {
        message: event.message,
        source: event.filename || '',
        line: event.lineno || 0,
        column: event.colno || 0,
        error: event.error?.stack || event.error?.toString() || 'Unknown error',
        timestamp: Date.now(),
        url: window.location.href,
      };
      this.errors.push(error);
    });

    window.addEventListener('unhandledrejection', (event) => {
      const error: PerformanceError = {
        message: 'Unhandled Promise Rejection',
        source: '',
        line: 0,
        column: 0,
        error: event.reason?.stack || event.reason?.toString() || 'Unknown rejection',
        timestamp: Date.now(),
        url: window.location.href,
      };
      this.errors.push(error);
    });
  }

  private initializeNavigationTiming(): void {
    window.addEventListener('load', () => {
      // Wait for navigation timing to be available
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.customMetrics.domContentLoadedTime = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
          this.customMetrics.pageLoadTime = navigation.loadEventEnd - navigation.navigationStart;

          // First Paint
          const paintEntries = performance.getEntriesByType('paint');
          const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
          if (firstPaint) {
            this.customMetrics.firstPaintTime = firstPaint.startTime;
          }
        }
      }, 100);
    });
  }

  private async reportMetric(metric: WebVitalsMetric): Promise<void> {
    if (!this.reportingEnabled) return;

    try {
      // Send to API endpoint
      await fetch(this.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          metric,
          timestamp: Date.now(),
        }),
      });

      // Also send to Firebase Analytics if available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'web_vital', {
          event_category: 'Web Vitals',
          event_label: metric.name,
          value: Math.round(metric.value),
          custom_map: {
            metric_rating: metric.rating,
            metric_delta: metric.delta,
          },
        });
      }
    } catch (error) {
      console.error('Failed to report metric:', error);
    }
  }

  public trackCustomMetric(name: string, value: number): void {
    this.customMetrics[name] = value;
  }

  public startTimer(name: string): () => void {
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      this.trackCustomMetric(name, duration);
    };
  }

  public async generateReport(): Promise<PerformanceReport> {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

    return {
      sessionId: this.sessionId,
      metrics: this.metrics,
      pageLoadTime: navigation?.loadEventEnd - navigation?.navigationStart || 0,
      domContentLoadedTime: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart || 0,
      firstPaintTime: this.customMetrics.firstPaintTime,
      navigationTiming: navigation?.toJSON() as PerformanceTiming,
      resourceTiming: resources.map(r => r.toJSON() as PerformanceResourceTiming),
      customMetrics: this.customMetrics,
      errors: this.errors,
      timestamp: Date.now(),
    };
  }

  public async sendReport(): Promise<void> {
    if (!this.reportingEnabled) return;

    const report = await this.generateReport();

    try {
      await fetch(`${this.reportingEndpoint}/full`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      });
    } catch (error) {
      console.error('Failed to send performance report:', error);
    }
  }

  public getMetrics(): WebVitalsMetric[] {
    return [...this.metrics];
  }

  public getCustomMetrics(): { [key: string]: number } {
    return { ...this.customMetrics };
  }

  public getErrors(): PerformanceError[] {
    return [...this.errors];
  }

  // Utility methods for specific Firebase App Hosting metrics
  public trackFirestoreOperation(operation: string, duration: number, readCount: number): void {
    this.trackCustomMetric(`firestore_${operation}_duration`, duration);
    this.trackCustomMetric(`firestore_${operation}_reads`, readCount);
  }

  public trackCacheHit(cacheType: string, hit: boolean): void {
    const metricName = `cache_${cacheType}_${hit ? 'hit' : 'miss'}`;
    this.customMetrics[metricName] = (this.customMetrics[metricName] || 0) + 1;
  }

  public trackBundleSize(bundleName: string, size: number): void {
    this.trackCustomMetric(`bundle_${bundleName}_size`, size);
  }
}

// Global instance
let performanceMonitor: PerformanceMonitor | null = null;

export function initializePerformanceMonitoring(options?: {
  reportingEndpoint?: string;
  enabled?: boolean;
}): PerformanceMonitor {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor(options);
  }
  return performanceMonitor;
}

export function getPerformanceMonitor(): PerformanceMonitor | null {
  return performanceMonitor;
}

// React Hook for performance monitoring
export function usePerformanceMonitoring() {
  const monitor = getPerformanceMonitor();

  const trackOperation = (name: string, operation: () => Promise<any>) => {
    if (!monitor) return operation();

    const stopTimer = monitor.startTimer(name);
    return operation().finally(() => stopTimer());
  };

  const trackCustomMetric = (name: string, value: number) => {
    monitor?.trackCustomMetric(name, value);
  };

  const trackFirestoreRead = (operation: string, readCount: number) => {
    monitor?.trackCustomMetric(`firestore_reads_${operation}`, readCount);
  };

  return {
    trackOperation,
    trackCustomMetric,
    trackFirestoreRead,
    monitor,
  };
}

// Utility functions for Web Vitals thresholds
export function getWebVitalThresholds() {
  return {
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    FID: { good: 100, poor: 300 },
    LCP: { good: 2500, poor: 4000 },
    TTFB: { good: 800, poor: 1800 },
  };
}

export function classifyWebVital(name: WebVitalsMetric['name'], value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = getWebVitalThresholds()[name];
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
}