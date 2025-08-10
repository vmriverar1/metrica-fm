'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  fcp: number | null; // First Contentful Paint
  ttfb: number | null; // Time to First Byte
  
  // Custom metrics
  pageLoadTime: number | null;
  domInteractive: number | null;
  resourceCount: number;
  cacheHitRate: number;
  
  // User interaction metrics
  scrollDepth: number;
  timeOnPage: number;
  bounceRate: boolean;
  
  // Page-specific metrics
  articleReadingProgress?: number;
  jobApplicationStarted?: boolean;
  searchPerformed?: boolean;
}

interface PerformanceBenchmark {
  good: number;
  needsImprovement: number;
  poor: number;
}

const BENCHMARKS: Record<keyof Pick<PerformanceMetrics, 'lcp' | 'fid' | 'cls' | 'fcp' | 'ttfb'>, PerformanceBenchmark> = {
  lcp: { good: 2500, needsImprovement: 4000, poor: Infinity },
  fid: { good: 100, needsImprovement: 300, poor: Infinity },
  cls: { good: 0.1, needsImprovement: 0.25, poor: Infinity },
  fcp: { good: 1800, needsImprovement: 3000, poor: Infinity },
  ttfb: { good: 800, needsImprovement: 1800, poor: Infinity }
};

export function usePerformanceMonitor(pageType: 'blog' | 'careers' | 'job' | 'article') {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null,
    pageLoadTime: null,
    domInteractive: null,
    resourceCount: 0,
    cacheHitRate: 0,
    scrollDepth: 0,
    timeOnPage: 0,
    bounceRate: false
  });

  const startTime = useRef<number>(Date.now());
  const scrollDepthRef = useRef<number>(0);
  const hasInteracted = useRef<boolean>(false);
  const observersRef = useRef<{ [key: string]: PerformanceObserver }>({});

  // Initialize performance monitoring
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initializeMonitoring = () => {
      // Measure Core Web Vitals
      measureCoreWebVitals();
      
      // Measure navigation timing
      measureNavigationTiming();
      
      // Track user interactions
      trackUserInteractions();
      
      // Measure resource loading
      measureResourceLoading();
      
      // Track scroll depth
      trackScrollDepth();
      
      // Track time on page
      trackTimeOnPage();
    };

    // Wait for page to be fully loaded
    if (document.readyState === 'complete') {
      initializeMonitoring();
    } else {
      window.addEventListener('load', initializeMonitoring);
    }

    return () => {
      window.removeEventListener('load', initializeMonitoring);
      Object.values(observersRef.current).forEach(observer => {
        observer.disconnect();
      });
    };
  }, []);

  const measureCoreWebVitals = useCallback(() => {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          const lastEntry = entries[entries.length - 1] as any;
          setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
        }
      });

      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        observersRef.current.lcp = lcpObserver;
      } catch (e) {
        console.warn('LCP measurement not supported');
      }

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          const firstEntry = entries[0] as any;
          setMetrics(prev => ({ ...prev, fid: firstEntry.processingStart - firstEntry.startTime }));
        }
      });

      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
        observersRef.current.fid = fidObserver;
      } catch (e) {
        console.warn('FID measurement not supported');
      }

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            setMetrics(prev => ({ ...prev, cls: clsValue }));
          }
        });
      });

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        observersRef.current.cls = clsObserver;
      } catch (e) {
        console.warn('CLS measurement not supported');
      }
    }
  }, []);

  const measureNavigationTiming = useCallback(() => {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        const fcp = performance.getEntriesByType('paint')
          .find((entry: any) => entry.name === 'first-contentful-paint')?.startTime || null;

        setMetrics(prev => ({
          ...prev,
          fcp,
          ttfb: navigation.responseStart - navigation.fetchStart,
          pageLoadTime: navigation.loadEventEnd - navigation.fetchStart,
          domInteractive: navigation.domInteractive - navigation.fetchStart
        }));
      }
    }
  }, []);

  const measureResourceLoading = useCallback(() => {
    if ('performance' in window) {
      const resources = performance.getEntriesByType('resource');
      setMetrics(prev => ({ ...prev, resourceCount: resources.length }));
    }
  }, []);

  const trackUserInteractions = useCallback(() => {
    const handleInteraction = () => {
      hasInteracted.current = true;
    };

    ['click', 'keydown', 'scroll', 'touchstart'].forEach(event => {
      window.addEventListener(event, handleInteraction, { once: true, passive: true });
    });
  }, []);

  const trackScrollDepth = useCallback(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = Math.round((scrollTop / documentHeight) * 100);
      
      if (scrollPercentage > scrollDepthRef.current) {
        scrollDepthRef.current = scrollPercentage;
        setMetrics(prev => ({ ...prev, scrollDepth: scrollPercentage }));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const trackTimeOnPage = useCallback(() => {
    const interval = setInterval(() => {
      const timeOnPage = Date.now() - startTime.current;
      setMetrics(prev => ({ ...prev, timeOnPage }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Page-specific tracking methods
  const trackArticleReadingProgress = useCallback((progress: number) => {
    setMetrics(prev => ({ ...prev, articleReadingProgress: progress }));
  }, []);

  const trackJobApplicationStart = useCallback(() => {
    setMetrics(prev => ({ ...prev, jobApplicationStarted: true }));
  }, []);

  const trackSearchPerformed = useCallback(() => {
    setMetrics(prev => ({ ...prev, searchPerformed: true }));
  }, []);

  // Performance scoring
  const getPerformanceScore = useCallback(() => {
    const scores: number[] = [];

    Object.entries(BENCHMARKS).forEach(([key, benchmark]) => {
      const value = metrics[key as keyof typeof BENCHMARKS];
      if (value !== null) {
        if (value <= benchmark.good) scores.push(90);
        else if (value <= benchmark.needsImprovement) scores.push(50);
        else scores.push(10);
      }
    });

    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b) / scores.length) : 0;
  }, [metrics]);

  // Get recommendations
  const getRecommendations = useCallback(() => {
    const recommendations: string[] = [];

    if (metrics.lcp && metrics.lcp > BENCHMARKS.lcp.needsImprovement) {
      recommendations.push('Optimize Largest Contentful Paint: Consider image optimization and server response times');
    }

    if (metrics.fid && metrics.fid > BENCHMARKS.fid.needsImprovement) {
      recommendations.push('Improve First Input Delay: Minimize JavaScript execution and use code splitting');
    }

    if (metrics.cls && metrics.cls > BENCHMARKS.cls.needsImprovement) {
      recommendations.push('Reduce Cumulative Layout Shift: Set dimensions for images and reserve space for ads');
    }

    if (metrics.ttfb && metrics.ttfb > BENCHMARKS.ttfb.needsImprovement) {
      recommendations.push('Improve Time to First Byte: Optimize server response and use CDN');
    }

    if (metrics.resourceCount > 50) {
      recommendations.push('Reduce resource count: Combine files and use resource bundling');
    }

    if (metrics.scrollDepth < 25 && metrics.timeOnPage > 10000) {
      recommendations.push('Improve content engagement: Content might not be engaging enough');
    }

    return recommendations;
  }, [metrics]);

  // Send performance data (for analytics)
  const sendPerformanceData = useCallback(() => {
    if (typeof window === 'undefined') return;

    const data = {
      ...metrics,
      pageType,
      url: window.location.pathname,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      performanceScore: getPerformanceScore()
    };

    // In a real app, send to analytics service
    console.log('Performance data:', data);
    
    // Example: send to your analytics endpoint
    // fetch('/api/analytics/performance', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // });
  }, [metrics, pageType, getPerformanceScore]);

  // Auto-send data before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      setMetrics(prev => ({
        ...prev,
        bounceRate: !hasInteracted.current,
        timeOnPage: Date.now() - startTime.current
      }));
      sendPerformanceData();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Also send data every 30 seconds for long sessions
    const interval = setInterval(sendPerformanceData, 30000);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(interval);
    };
  }, [sendPerformanceData]);

  return {
    metrics,
    getPerformanceScore,
    getRecommendations,
    trackArticleReadingProgress,
    trackJobApplicationStart,
    trackSearchPerformed,
    sendPerformanceData
  };
}

// Hook for A/B testing
export function useABTesting() {
  const [variant, setVariant] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    // Initialize A/B test variant
    const savedVariant = localStorage.getItem('ab_test_variant');
    if (savedVariant) {
      setVariant(savedVariant);
    } else {
      // Randomly assign variant
      const variants = ['A', 'B'];
      const randomVariant = variants[Math.floor(Math.random() * variants.length)];
      setVariant(randomVariant);
      localStorage.setItem('ab_test_variant', randomVariant);
    }
  }, []);

  const trackEvent = useCallback((eventName: string, data?: any) => {
    if (!variant) return;

    const eventData = {
      variant,
      timestamp: Date.now(),
      data
    };

    setTestResults(prev => {
      const updated = new Map(prev);
      const existingEvents = updated.get(eventName) || [];
      updated.set(eventName, [...existingEvents, eventData]);
      return updated;
    });

    // In a real app, send to analytics
    console.log('A/B Test Event:', eventName, eventData);
  }, [variant]);

  const getVariant = useCallback((testName: string, variants: string[]) => {
    if (!variant) return variants[0];
    
    // Use hash of test name and user variant for consistent assignment
    const hash = testName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return variants[Math.abs(hash) % variants.length];
  }, [variant]);

  return {
    variant,
    trackEvent,
    getVariant,
    testResults: Object.fromEntries(testResults)
  };
}

// Hook for resource optimization
export function useResourceOptimization() {
  const [connectionType, setConnectionType] = useState<string>('unknown');
  const [saveData, setSaveData] = useState<boolean>(false);

  useEffect(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setConnectionType(connection.effectiveType || 'unknown');
      setSaveData(connection.saveData || false);

      const updateConnection = () => {
        setConnectionType(connection.effectiveType || 'unknown');
        setSaveData(connection.saveData || false);
      };

      connection.addEventListener('change', updateConnection);
      return () => connection.removeEventListener('change', updateConnection);
    }
  }, []);

  const shouldLoadHighQualityImages = useCallback(() => {
    if (saveData) return false;
    return ['4g'].includes(connectionType);
  }, [connectionType, saveData]);

  const shouldPreloadContent = useCallback(() => {
    if (saveData) return false;
    return ['4g'].includes(connectionType);
  }, [connectionType, saveData]);

  const getOptimalImageQuality = useCallback(() => {
    if (saveData) return 'low';
    if (['slow-2g', '2g'].includes(connectionType)) return 'low';
    if (['3g'].includes(connectionType)) return 'medium';
    return 'high';
  }, [connectionType, saveData]);

  return {
    connectionType,
    saveData,
    shouldLoadHighQualityImages,
    shouldPreloadContent,
    getOptimalImageQuality
  };
}