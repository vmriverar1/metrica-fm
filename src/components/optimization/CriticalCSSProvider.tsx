// FASE 5B: Critical CSS Provider Component
// Componente para inyectar critical CSS de forma optimizada

'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { CriticalCSSExtractor } from '@/lib/critical-css/extract-critical';

interface CriticalCSSProviderProps {
  children: React.ReactNode;
}

export function CriticalCSSProvider({ children }: CriticalCSSProviderProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Remove existing critical CSS after main CSS loads
    const removeCriticalCSS = () => {
      const criticalCSS = document.getElementById('critical-css');
      if (criticalCSS) {
        // Wait for main CSS to load before removing critical CSS
        setTimeout(() => {
          criticalCSS.remove();
        }, 100);
      }
    };

    // Check if main CSS is loaded
    const checkMainCSS = () => {
      const hasMainCSS = Array.from(document.styleSheets).some(sheet => {
        try {
          return sheet.href && sheet.href.includes('/_next/static/css/');
        } catch {
          return false;
        }
      });

      if (hasMainCSS) {
        removeCriticalCSS();
      } else {
        // Retry after a short delay
        setTimeout(checkMainCSS, 50);
      }
    };

    // Start checking after component mounts
    requestAnimationFrame(checkMainCSS);

    // Fallback - remove after 2 seconds regardless
    const fallbackTimer = setTimeout(removeCriticalCSS, 2000);

    return () => {
      clearTimeout(fallbackTimer);
    };
  }, [pathname]);

  return <>{children}</>;
}

// Server-side critical CSS injection
export function injectCriticalCSS(pathname: string, userAgent?: string): string {
  if (!CriticalCSSExtractor.shouldInlineCriticalCSS(userAgent)) {
    return '';
  }

  const extractor = new CriticalCSSExtractor(pathname);
  return extractor.generateInlineStyles();
}

// Resource hints injection
export function injectResourceHints(): string {
  const fontPreloads = CriticalCSSExtractor.generateFontPreloadLinks();
  const resourceHints = CriticalCSSExtractor.generateResourceHints();

  return [...fontPreloads, ...resourceHints].join('\n');
}

// Font optimization component
export function FontOptimization() {
  useEffect(() => {
    // Font loading optimization
    if ('fonts' in document) {
      // Preload critical fonts
      const fontPromises = [
        new FontFace('Alliance No.2', 'url(/fonts/Alliance\\ No.2\\ Medium.otf)', {
          weight: '500',
          display: 'swap',
        }).load(),
        new FontFace('Alliance No.2', 'url(/fonts/Alliance\\ No.2\\ ExtraBold.otf)', {
          weight: '800',
          display: 'swap',
        }).load(),
      ];

      Promise.allSettled(fontPromises).then((results) => {
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            document.fonts.add(result.value);
            console.log(`Font ${index + 1} loaded successfully`);
          } else {
            console.warn(`Font ${index + 1} failed to load:`, result.reason);
          }
        });
      });
    }

    // Remove font loading class when fonts are ready
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        document.documentElement.classList.remove('font-loading');
        document.documentElement.classList.add('fonts-loaded');
      });
    }
  }, []);

  return null;
}

// Performance observer for critical CSS metrics
export function useCriticalCSSMetrics() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Measure critical CSS impact
    const measureCriticalPath = () => {
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');

        const metrics = {
          domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.navigationStart,
          firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
          criticalCSSSize: document.getElementById('critical-css')?.innerHTML.length || 0,
        };

        // Report to performance monitoring
        if (window.gtag) {
          window.gtag('event', 'critical_css_performance', {
            event_category: 'Performance',
            custom_map: metrics,
          });
        }

        console.log('[Critical CSS Metrics]', metrics);
      }
    };

    // Measure after page load
    if (document.readyState === 'complete') {
      measureCriticalPath();
    } else {
      window.addEventListener('load', measureCriticalPath);
      return () => window.removeEventListener('load', measureCriticalPath);
    }
  }, []);
}

// Component to lazy load non-critical CSS
export function NonCriticalCSS() {
  useEffect(() => {
    // Load non-critical CSS after critical path
    const loadNonCriticalCSS = () => {
      const nonCriticalStyles = [
        // Load Tailwind components and utilities after critical path
        '/_next/static/css/components.css',
        '/_next/static/css/utilities.css',
      ];

      nonCriticalStyles.forEach((href, index) => {
        setTimeout(() => {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = href;
          link.media = 'print';
          link.onload = () => {
            if (link.media !== 'all') {
              link.media = 'all';
            }
          };
          document.head.appendChild(link);
        }, index * 100); // Stagger loading
      });
    };

    // Load after critical path is complete
    if (document.readyState === 'complete') {
      loadNonCriticalCSS();
    } else {
      window.addEventListener('load', loadNonCriticalCSS);
      return () => window.removeEventListener('load', loadNonCriticalCSS);
    }
  }, []);

  return null;
}