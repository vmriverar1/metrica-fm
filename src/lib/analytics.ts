/**
 * Analytics and Performance Monitoring for Métrica FM
 * Provides performance metrics, error tracking, and user analytics
 */

import React from 'react';

// Performance monitoring
class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private observers: PerformanceObserver[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers();
    }
  }

  private initializeObservers(): void {
    // Core Web Vitals observer
    if ('PerformanceObserver' in window) {
      try {
        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric('LCP', entry.startTime);
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);

        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric('FID', entry.processingStart - entry.startTime);
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);

        // Cumulative Layout Shift
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          this.recordMetric('CLS', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);

      } catch (error) {
        console.warn('Performance monitoring initialization failed:', error);
      }
    }
  }

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);

    // Send to analytics if enabled
    this.sendToAnalytics(name, value);
  }

  getMetric(name: string): number[] | undefined {
    return this.metrics.get(name);
  }

  getAverageMetric(name: string): number | undefined {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return undefined;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private sendToAnalytics(name: string, value: number): void {
    // Send to Google Analytics 4 if available
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'web_vital', {
        name: name,
        value: value,
        custom_map: { metric_name: name }
      });
    }

    // Log for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance metric ${name}:`, value);
    }
  }

  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
  }
}

// Error tracking
interface ErrorEvent {
  message: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  error?: Error;
  timestamp: number;
  url: string;
  userAgent: string;
  userId?: string;
}

class ErrorTracker {
  private errors: ErrorEvent[] = [];
  private maxErrors = 50;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeErrorHandlers();
    }
  }

  private initializeErrorHandlers(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.trackError({
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });
    });
  }

  trackError(errorEvent: Omit<ErrorEvent, 'timestamp' | 'url' | 'userAgent'> & Partial<Pick<ErrorEvent, 'timestamp' | 'url' | 'userAgent'>>): void {
    const fullErrorEvent: ErrorEvent = {
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      ...errorEvent
    };

    this.errors.push(fullErrorEvent);

    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Send to error tracking service
    this.sendErrorToService(fullErrorEvent);
  }

  private sendErrorToService(errorEvent: ErrorEvent): void {
    // Send to error tracking service (e.g., Sentry, LogRocket)
    if (process.env.NODE_ENV === 'production') {
      // Example implementation
      console.error('Error tracked:', errorEvent);
    }
  }

  getErrors(): ErrorEvent[] {
    return [...this.errors];
  }

  clearErrors(): void {
    this.errors = [];
  }
}

// User analytics
class UserAnalytics {
  private sessionId: string;
  private userId?: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeTracking();
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private initializeTracking(): void {
    if (typeof window === 'undefined') return;

    // Track page views
    this.trackPageView();

    // Track user interactions
    this.initializeInteractionTracking();
  }

  trackPageView(page?: string): void {
    const pageUrl = page || (typeof window !== 'undefined' ? window.location.pathname : '');
    
    this.sendEvent('page_view', {
      page: pageUrl,
      timestamp: Date.now(),
      session_id: this.sessionId,
      user_id: this.userId
    });
  }

  trackEvent(eventName: string, properties?: Record<string, any>): void {
    this.sendEvent(eventName, {
      ...properties,
      timestamp: Date.now(),
      session_id: this.sessionId,
      user_id: this.userId
    });
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  private initializeInteractionTracking(): void {
    // Track clicks on important elements
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      
      if (target.matches('button, a[href], [role="button"]')) {
        this.trackEvent('click', {
          element: target.tagName.toLowerCase(),
          text: target.textContent?.trim().substring(0, 100),
          href: target.getAttribute('href'),
          className: target.className
        });
      }
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      this.trackEvent('form_submit', {
        form_name: form.name || form.id || 'unnamed',
        action: form.action
      });
    });
  }

  private sendEvent(eventName: string, properties: Record<string, any>): void {
    // Send to Google Analytics 4 if available
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', eventName, properties);
    }

    // Log for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Analytics event ${eventName}:`, properties);
    }
  }
}

// Singleton instances
export const performanceMonitor = new PerformanceMonitor();
export const errorTracker = new ErrorTracker();
export const userAnalytics = new UserAnalytics();

// Utility functions
export function initializeAnalytics(): void {
  if (typeof window === 'undefined') return;

  // Initialize Google Analytics if GA_MEASUREMENT_ID is provided
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (gaId) {
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    script.async = true;
    document.head.appendChild(script);

    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(...args: any[]) {
      (window as any).dataLayer.push(args);
    }
    (window as any).gtag = gtag;

    gtag('js', new Date());
    gtag('config', gaId, {
      page_title: document.title,
      page_location: window.location.href,
    });
  }
}

// React hooks
export function usePageTracking(): void {
  React.useEffect(() => {
    userAnalytics.trackPageView();
  }, []);
}

export function useErrorTracking(): {
  trackError: (error: Error, context?: string) => void;
  errors: ErrorEvent[];
} {
  const [errors, setErrors] = React.useState<ErrorEvent[]>([]);

  const trackError = React.useCallback((error: Error, context?: string) => {
    errorTracker.trackError({
      message: error.message,
      error,
      filename: context
    });
    setErrors(errorTracker.getErrors());
  }, []);

  React.useEffect(() => {
    setErrors(errorTracker.getErrors());
  }, []);

  return { trackError, errors };
}

// Cleanup on app unmount
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    performanceMonitor.cleanup();
  });
}