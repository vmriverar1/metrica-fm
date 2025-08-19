/**
 * FASE 6: React Hooks para Performance Service
 * 
 * Hooks especializados para integrar el sistema de optimización
 * de performance con componentes React.
 * 
 * Features:
 * - usePerformanceMonitoring: Monitoreo en tiempo real
 * - useSmartCache: Cache inteligente para componentes
 * - useLazyLoading: Lazy loading automático
 * - useDebounce: Debouncing optimizado
 * - usePrefetch: Prefetching inteligente
 * - useWebVitals: Monitoreo de Web Vitals
 * - useOptimizedQuery: Optimización automática de queries
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import PerformanceService, { 
  PerformanceMetrics, 
  BundleAnalysis, 
  QueryOptimization,
  CacheConfig 
} from '@/lib/performance-service';

// Tipos para hooks
export interface UsePerformanceOptions {
  enableMonitoring?: boolean;
  enableAutoOptimization?: boolean;
  refreshInterval?: number;
}

export interface UseCacheOptions<T> {
  key: string;
  cacheName?: 'api' | 'images' | 'static' | 'user';
  ttl?: number;
  enabled?: boolean;
}

export interface UseLazyLoadingOptions {
  threshold?: number;
  rootMargin?: string;
  delay?: number;
  trackVisibility?: boolean;
}

export interface UseDebounceOptions {
  delay: number;
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

export interface UsePrefetchOptions {
  priority?: 'high' | 'medium' | 'low';
  condition?: boolean;
  delay?: number;
}

export interface PerformanceHookResult {
  metrics: PerformanceMetrics[];
  cacheStats: Record<string, any>;
  bundleAnalysis: BundleAnalysis;
  score: number;
  status: 'excellent' | 'good' | 'needs-improvement' | 'poor';
  recommendations: string[];
  isMonitoring: boolean;
  refreshData: () => void;
  clearCaches: () => void;
}

/**
 * Hook principal para monitoreo de performance
 */
export function usePerformanceMonitoring(options: UsePerformanceOptions = {}): PerformanceHookResult {
  const {
    enableMonitoring = true,
    enableAutoOptimization = true,
    refreshInterval = 30000 // 30 segundos
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [cacheStats, setCacheStats] = useState<Record<string, any>>({});
  const [bundleAnalysis, setBundleAnalysis] = useState<BundleAnalysis | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const refreshData = useCallback(() => {
    const recentMetrics = PerformanceService.getRecentMetrics(60);
    const stats = PerformanceService.getCacheStats();
    const analysis = PerformanceService.analyzeBundleSize();

    setMetrics(recentMetrics);
    setCacheStats(stats);
    setBundleAnalysis(analysis);
  }, []);

  useEffect(() => {
    if (enableMonitoring) {
      // Initialize performance service
      PerformanceService.initialize();
      setIsMonitoring(true);

      // Initial data load
      refreshData();

      // Set up refresh interval
      const interval = setInterval(refreshData, refreshInterval);

      return () => {
        clearInterval(interval);
        setIsMonitoring(false);
      };
    }
  }, [enableMonitoring, refreshInterval, refreshData]);

  const clearCaches = useCallback(() => {
    PerformanceService.clearAllCaches();
    refreshData();
  }, [refreshData]);

  // Calculate performance score and status
  const performanceReport = useMemo(() => {
    if (!bundleAnalysis) {
      return { score: 0, status: 'poor' as const, recommendations: [] };
    }

    return PerformanceService.generatePerformanceReport();
  }, [metrics, cacheStats, bundleAnalysis]);

  return {
    metrics,
    cacheStats,
    bundleAnalysis: bundleAnalysis!,
    score: performanceReport.overview.score,
    status: performanceReport.overview.status,
    recommendations: performanceReport.recommendations,
    isMonitoring,
    refreshData,
    clearCaches
  };
}

/**
 * Hook para cache inteligente
 */
export function useSmartCache<T>(
  fetcher: () => Promise<T>,
  options: UseCacheOptions<T>
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  cached: boolean;
} {
  const {
    key,
    cacheName = 'api',
    ttl,
    enabled = true
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [cached, setCached] = useState(false);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const result = await PerformanceService.cacheApiCall(
        key,
        fetcher,
        cacheName,
        ttl
      );
      
      setData(result);
      
      // Check if result was from cache
      const cache = PerformanceService.getCache(cacheName);
      const cachedResult = cache.get(key);
      setCached(!!cachedResult);
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, cacheName, ttl, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh: fetchData,
    cached
  };
}

/**
 * Hook para lazy loading con Intersection Observer
 */
export function useLazyLoading(options: UseLazyLoadingOptions = {}): {
  ref: React.RefObject<HTMLElement>;
  isVisible: boolean;
  hasLoaded: boolean;
} {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    delay = 100,
    trackVisibility = true
  } = options;

  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = PerformanceService.createLazyLoader({
      threshold,
      rootMargin,
      delay,
      trackVisibility
    });

    // Custom handler for visibility change
    const handleLazyLoad = () => {
      setIsVisible(true);
      setHasLoaded(true);
    };

    element.addEventListener('lazy-loaded', handleLazyLoad);
    observer.observe(element);

    return () => {
      element.removeEventListener('lazy-loaded', handleLazyLoad);
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, delay, trackVisibility]);

  return {
    ref,
    isVisible,
    hasLoaded
  };
}

/**
 * Hook para debouncing optimizado
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  options: UseDebounceOptions
): T {
  const {
    delay,
    leading = false,
    trailing = true,
    maxWait
  } = options;

  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const maxWaitTimeoutRef = useRef<NodeJS.Timeout>();
  const lastCallTimeRef = useRef<number>(0);
  const lastInvokeTimeRef = useRef<number>(0);
  const argsRef = useRef<Parameters<T>>();
  const resultRef = useRef<ReturnType<T>>();

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useMemo(() => {
    const invokeFunc = () => {
      const args = argsRef.current!;
      lastInvokeTimeRef.current = Date.now();
      resultRef.current = callbackRef.current(...args);
      return resultRef.current;
    };

    const leadingEdge = (time: number) => {
      lastInvokeTimeRef.current = time;
      timeoutRef.current = setTimeout(timerExpired, delay);
      return leading ? invokeFunc() : resultRef.current;
    };

    const remainingWait = (time: number) => {
      const timeSinceLastCall = time - lastCallTimeRef.current;
      const timeSinceLastInvoke = time - lastInvokeTimeRef.current;
      const timeWaiting = delay - timeSinceLastCall;

      return maxWait !== undefined
        ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
        : timeWaiting;
    };

    const shouldInvoke = (time: number) => {
      const timeSinceLastCall = time - lastCallTimeRef.current;
      const timeSinceLastInvoke = time - lastInvokeTimeRef.current;

      return (
        lastCallTimeRef.current === 0 ||
        timeSinceLastCall >= delay ||
        timeSinceLastCall < 0 ||
        (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
      );
    };

    const timerExpired = () => {
      const time = Date.now();
      if (shouldInvoke(time)) {
        return trailingEdge(time);
      }
      timeoutRef.current = setTimeout(timerExpired, remainingWait(time));
    };

    const trailingEdge = (time: number) => {
      timeoutRef.current = undefined;
      if (trailing && argsRef.current) {
        return invokeFunc();
      }
      argsRef.current = undefined;
      return resultRef.current;
    };

    const debounced = ((...args: Parameters<T>) => {
      const time = Date.now();
      const isInvoking = shouldInvoke(time);

      lastCallTimeRef.current = time;
      argsRef.current = args;

      if (isInvoking) {
        if (timeoutRef.current === undefined) {
          return leadingEdge(time);
        }
        if (maxWait !== undefined) {
          timeoutRef.current = setTimeout(timerExpired, delay);
          maxWaitTimeoutRef.current = setTimeout(timerExpired, maxWait);
          return leading ? invokeFunc() : resultRef.current;
        }
      }

      if (timeoutRef.current === undefined) {
        timeoutRef.current = setTimeout(timerExpired, delay);
      }

      return resultRef.current;
    }) as T;

    debounced.cancel = () => {
      if (timeoutRef.current !== undefined) {
        clearTimeout(timeoutRef.current);
      }
      if (maxWaitTimeoutRef.current !== undefined) {
        clearTimeout(maxWaitTimeoutRef.current);
      }
      lastInvokeTimeRef.current = 0;
      lastCallTimeRef.current = 0;
      argsRef.current = undefined;
      timeoutRef.current = undefined;
      maxWaitTimeoutRef.current = undefined;
    };

    debounced.flush = () => {
      return timeoutRef.current === undefined ? resultRef.current : trailingEdge(Date.now());
    };

    return debounced;
  }, [delay, leading, trailing, maxWait]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (maxWaitTimeoutRef.current) {
        clearTimeout(maxWaitTimeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * Hook para prefetching inteligente
 */
export function usePrefetch(
  urls: string | string[],
  options: UsePrefetchOptions = {}
): {
  prefetch: () => void;
  prefetched: boolean;
} {
  const {
    priority = 'medium',
    condition = true,
    delay = 0
  } = options;

  const [prefetched, setPrefetched] = useState(false);
  const urlArray = Array.isArray(urls) ? urls : [urls];

  const prefetch = useCallback(() => {
    if (!condition || prefetched) return;

    const doPrefetch = () => {
      urlArray.forEach(url => {
        PerformanceService.prefetchResource(url, priority);
      });
      setPrefetched(true);
    };

    if (delay > 0) {
      setTimeout(doPrefetch, delay);
    } else {
      doPrefetch();
    }
  }, [urlArray, priority, condition, prefetched, delay]);

  useEffect(() => {
    if (condition) {
      prefetch();
    }
  }, [condition, prefetch]);

  return {
    prefetch,
    prefetched
  };
}

/**
 * Hook para monitoreo de Web Vitals
 */
export function useWebVitals(): {
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  fcp: number | null;
  ttfb: number | null;
  score: number;
} {
  const [metrics, setMetrics] = useState({
    lcp: null as number | null,
    fid: null as number | null,
    cls: null as number | null,
    fcp: null as number | null,
    ttfb: null as number | null
  });

  useEffect(() => {
    // This would integrate with web-vitals library in production
    // For now, we'll simulate the metrics
    const mockMetrics = {
      lcp: Math.random() * 3000 + 1000, // 1-4s
      fid: Math.random() * 200 + 50,    // 50-250ms
      cls: Math.random() * 0.2,         // 0-0.2
      fcp: Math.random() * 2000 + 500,  // 0.5-2.5s
      ttfb: Math.random() * 500 + 100   // 100-600ms
    };

    const timer = setTimeout(() => {
      setMetrics(mockMetrics);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Calculate overall score based on Core Web Vitals
  const score = useMemo(() => {
    if (!metrics.lcp || !metrics.fid || !metrics.cls) return 0;

    let totalScore = 100;

    // LCP scoring (good: <2.5s, needs improvement: 2.5-4s, poor: >4s)
    if (metrics.lcp > 4000) totalScore -= 40;
    else if (metrics.lcp > 2500) totalScore -= 20;

    // FID scoring (good: <100ms, needs improvement: 100-300ms, poor: >300ms)
    if (metrics.fid > 300) totalScore -= 30;
    else if (metrics.fid > 100) totalScore -= 15;

    // CLS scoring (good: <0.1, needs improvement: 0.1-0.25, poor: >0.25)
    if (metrics.cls > 0.25) totalScore -= 30;
    else if (metrics.cls > 0.1) totalScore -= 15;

    return Math.max(0, totalScore);
  }, [metrics]);

  return {
    ...metrics,
    score
  };
}

/**
 * Hook para optimización automática de queries
 */
export function useOptimizedQuery<T>(
  queryFn: () => Promise<T>,
  query: string,
  dependencies: any[] = []
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  optimization: QueryOptimization | null;
  rerun: () => void;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [optimization, setOptimization] = useState<QueryOptimization | null>(null);

  const executeQuery = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Analyze query for optimizations
      const queryOptimization = PerformanceService.optimizeQuery(query);
      setOptimization(queryOptimization);

      // Execute the query
      const result = await queryFn();
      setData(result);

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Query failed'));
    } finally {
      setLoading(false);
    }
  }, [queryFn, query]);

  useEffect(() => {
    executeQuery();
  }, [executeQuery, ...dependencies]);

  return {
    data,
    loading,
    error,
    optimization,
    rerun: executeQuery
  };
}

/**
 * Hook para métricas de performance de componentes
 */
export function useComponentPerformance(componentName: string) {
  const renderStartRef = useRef<number>();
  const [renderTime, setRenderTime] = useState<number>(0);
  const [renderCount, setRenderCount] = useState<number>(0);

  useEffect(() => {
    renderStartRef.current = performance.now();
    setRenderCount(prev => prev + 1);
  });

  useEffect(() => {
    if (renderStartRef.current) {
      const endTime = performance.now();
      const duration = endTime - renderStartRef.current;
      setRenderTime(duration);
      
      // Log performance metrics
      PerformanceService.recordMetric(`component_render_${componentName}`, duration);
    }
  });

  return {
    renderTime,
    renderCount,
    componentName
  };
}