'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

// Performance optimization hook for services page
export function useServiceOptimization() {
  const [isVisible, setIsVisible] = useState(false);
  const [loadingState, setLoadingState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Detect network conditions
  useEffect(() => {
    if (typeof window !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      setNetworkInfo({
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        saveData: connection.saveData
      });

      const handleConnectionChange = () => {
        setNetworkInfo({
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          saveData: connection.saveData
        });
      };

      connection.addEventListener('change', handleConnectionChange);
      return () => connection.removeEventListener('change', handleConnectionChange);
    }
  }, []);

  // Intersection observer for lazy loading
  const createObserver = useCallback((callback: (isVisible: boolean) => void) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          callback(entry.isIntersecting);
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    return observerRef.current;
  }, []);

  // Preload critical resources
  const preloadResources = useCallback((resources: string[]) => {
    resources.forEach((resource) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      
      if (resource.endsWith('.jpg') || resource.endsWith('.png') || resource.endsWith('.webp')) {
        link.as = 'image';
      } else if (resource.endsWith('.css')) {
        link.as = 'style';
      } else if (resource.endsWith('.js')) {
        link.as = 'script';
      }
      
      document.head.appendChild(link);
    });
  }, []);

  // Debounced function for performance
  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  }, []);

  // Throttled function for performance
  const throttle = useCallback((func: Function, limit: number) => {
    let inThrottle: boolean;
    return (...args: any[]) => {
      if (!inThrottle) {
        func.apply(null, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }, []);

  // Image optimization based on network
  const getOptimizedImageUrl = useCallback((url: string, width: number, height: number) => {
    if (!networkInfo) return url;

    const isSlowConnection = networkInfo.effectiveType === 'slow-2g' || networkInfo.effectiveType === '2g';
    const isSaveData = networkInfo.saveData;

    if (isSlowConnection || isSaveData) {
      // Return lower quality/smaller images for slow connections
      return url.replace(/\.(jpg|png|webp)/, '_low.$1');
    }

    // Use WebP if supported
    if (typeof window !== 'undefined' && 'createImageBitmap' in window) {
      return url.replace(/\.(jpg|png)/, '.webp');
    }

    return url;
  }, [networkInfo]);

  // Component lazy loading helper
  const shouldLoadComponent = useCallback((priority: 'high' | 'medium' | 'low') => {
    if (!networkInfo) return true;

    const isSlowConnection = networkInfo.effectiveType === 'slow-2g' || networkInfo.effectiveType === '2g';
    
    if (isSlowConnection) {
      return priority === 'high';
    }

    return true;
  }, [networkInfo]);

  // Resource hints
  const addResourceHints = useCallback(() => {
    const hints = [
      { rel: 'dns-prefetch', href: '//images.unsplash.com' },
      { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://www.google-analytics.com' }
    ];

    hints.forEach((hint) => {
      const link = document.createElement('link');
      link.rel = hint.rel;
      link.href = hint.href;
      document.head.appendChild(link);
    });
  }, []);

  // Critical CSS inline
  const inlineCriticalCSS = useCallback((css: string) => {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    document.head.appendChild(style);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    isVisible,
    loadingState,
    networkInfo,
    createObserver,
    preloadResources,
    debounce,
    throttle,
    getOptimizedImageUrl,
    shouldLoadComponent,
    addResourceHints,
    inlineCriticalCSS,
    setLoadingState
  };
}

// Mobile optimization hook
export function useMobileOptimization() {
  const [isMobile, setIsMobile] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [touchSupport, setTouchSupport] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
      setTouchSupport('ontouchstart' in window);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  // Mobile-specific optimizations
  const mobileOptimizations = {
    // Reduce animations on mobile to save battery
    shouldReduceMotion: isMobile && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    
    // Touch-friendly interactions
    getTouchProps: () => touchSupport ? {
      'touch-action': 'manipulation',
      style: { cursor: 'pointer' }
    } : {},
    
    // Viewport optimizations
    getViewportMeta: () => ({
      name: 'viewport',
      content: 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes'
    }),
    
    // Mobile-specific CSS classes
    getMobileClasses: (baseClasses: string) => {
      let classes = baseClasses;
      if (isMobile) {
        classes += ' mobile-optimized';
      }
      if (orientation === 'landscape') {
        classes += ' landscape-mode';
      }
      return classes;
    }
  };

  return {
    isMobile,
    orientation,
    touchSupport,
    ...mobileOptimizations
  };
}

// A/B Testing hook for services page
export function useServiceABTesting() {
  const [variant, setVariant] = useState<'A' | 'B'>('A');
  const [testId, setTestId] = useState<string>('');

  useEffect(() => {
    // Get or create user test group
    let userGroup = localStorage.getItem('metrica_ab_group');
    if (!userGroup) {
      userGroup = Math.random() < 0.5 ? 'A' : 'B';
      localStorage.setItem('metrica_ab_group', userGroup);
    }
    setVariant(userGroup as 'A' | 'B');

    // Set test ID for this session
    const currentTestId = `services_cta_test_${Date.now()}`;
    setTestId(currentTestId);

    // Track test participation
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'ab_test_participation', {
        event_category: 'experiment',
        event_label: 'services_cta_test',
        custom_parameter_1: userGroup,
        custom_parameter_2: currentTestId
      });
    }
  }, []);

  const trackVariantConversion = useCallback((conversionType: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'ab_test_conversion', {
        event_category: 'experiment',
        event_label: 'services_cta_test',
        value: 1,
        custom_parameter_1: variant,
        custom_parameter_2: testId,
        custom_parameter_3: conversionType
      });
    }
  }, [variant, testId]);

  // Different variants for testing
  const getVariantConfig = () => {
    return {
      A: {
        ctaText: 'Consulta Gratuita',
        ctaColor: 'bg-primary hover:bg-primary/90',
        heroSubtitle: '15+ años liderando proyectos de infraestructura que transforman el Perú'
      },
      B: {
        ctaText: 'Solicitar Propuesta',
        ctaColor: 'bg-accent hover:bg-accent/90',
        heroSubtitle: 'Expertos en convertir tu visión en realidad con resultados garantizados'
      }
    }[variant];
  };

  return {
    variant,
    testId,
    trackVariantConversion,
    getVariantConfig
  };
}