// FASE 5E: Resource Hints Optimization
// Sistema estratégico de preload, prefetch, preconnect para Firebase App Hosting

export interface ResourceHint {
  type: 'preload' | 'prefetch' | 'preconnect' | 'dns-prefetch' | 'modulepreload';
  href: string;
  as?: 'script' | 'style' | 'font' | 'image' | 'document' | 'video' | 'audio';
  crossorigin?: 'anonymous' | 'use-credentials';
  media?: string;
  priority?: 'high' | 'low' | 'auto';
}

export interface ResourceHintConfig {
  critical: ResourceHint[];
  important: ResourceHint[];
  optional: ResourceHint[];
  prefetch: ResourceHint[];
}

// Configuración de resource hints por página
export const RESOURCE_HINT_CONFIGS: Record<string, ResourceHintConfig> = {
  homepage: {
    critical: [
      // Critical fonts - highest priority
      {
        type: 'preload',
        href: '/fonts/Alliance No.2 Medium.otf',
        as: 'font',
        crossorigin: 'anonymous',
        priority: 'high',
      },
      {
        type: 'preload',
        href: '/fonts/Alliance No.2 ExtraBold.otf',
        as: 'font',
        crossorigin: 'anonymous',
        priority: 'high',
      },
      // Critical CSS and JS
      {
        type: 'preload',
        href: '/_next/static/css/app.css',
        as: 'style',
        priority: 'high',
      },
      // Hero image
      {
        type: 'preload',
        href: '/images/hero-background.webp',
        as: 'image',
        priority: 'high',
      },
    ],
    important: [
      // Main JavaScript bundle
      {
        type: 'modulepreload',
        href: '/_next/static/chunks/main.js',
      },
      // Framework chunk
      {
        type: 'modulepreload',
        href: '/_next/static/chunks/framework.js',
      },
      // Company logo
      {
        type: 'preload',
        href: '/icons/icon-192x192.png',
        as: 'image',
      },
    ],
    optional: [
      // External connections
      {
        type: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        type: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: 'anonymous',
      },
      {
        type: 'preconnect',
        href: 'https://images.unsplash.com',
      },
      // DNS prefetch for less critical resources
      {
        type: 'dns-prefetch',
        href: 'https://picsum.photos',
      },
      {
        type: 'dns-prefetch',
        href: 'https://via.placeholder.com',
      },
    ],
    prefetch: [
      // Portfolio page - likely next navigation
      {
        type: 'prefetch',
        href: '/portfolio',
        as: 'document',
      },
      // Portfolio CSS
      {
        type: 'prefetch',
        href: '/_next/static/css/portfolio.css',
        as: 'style',
      },
    ],
  },

  portfolio: {
    critical: [
      // Fonts for portfolio grid
      {
        type: 'preload',
        href: '/fonts/Alliance No.2 Medium.otf',
        as: 'font',
        crossorigin: 'anonymous',
      },
      {
        type: 'preload',
        href: '/fonts/Alliance No.2 ExtraBold.otf',
        as: 'font',
        crossorigin: 'anonymous',
      },
      // First portfolio images
      {
        type: 'preload',
        href: '/images/projects/project-1-thumb.webp',
        as: 'image',
      },
      {
        type: 'preload',
        href: '/images/projects/project-2-thumb.webp',
        as: 'image',
      },
    ],
    important: [
      // Portfolio JavaScript
      {
        type: 'modulepreload',
        href: '/_next/static/chunks/portfolio.js',
      },
    ],
    optional: [
      {
        type: 'preconnect',
        href: 'https://images.unsplash.com',
      },
    ],
    prefetch: [
      // Services page
      {
        type: 'prefetch',
        href: '/services',
        as: 'document',
      },
      // Individual project pages
      {
        type: 'prefetch',
        href: '/portfolio/proyecto-residencial-san-isidro',
        as: 'document',
      },
    ],
  },

  services: {
    critical: [
      // Service page fonts
      {
        type: 'preload',
        href: '/fonts/Alliance No.2 Medium.otf',
        as: 'font',
        crossorigin: 'anonymous',
      },
      // Service icons
      {
        type: 'preload',
        href: '/images/services/gerencia-proyectos.webp',
        as: 'image',
      },
    ],
    important: [],
    optional: [
      {
        type: 'preconnect',
        href: 'https://images.unsplash.com',
      },
    ],
    prefetch: [
      {
        type: 'prefetch',
        href: '/contact',
        as: 'document',
      },
    ],
  },

  contact: {
    critical: [
      // Contact form resources
      {
        type: 'preload',
        href: '/fonts/Alliance No.2 Medium.otf',
        as: 'font',
        crossorigin: 'anonymous',
      },
    ],
    important: [
      // Contact form JavaScript
      {
        type: 'modulepreload',
        href: '/_next/static/chunks/contact.js',
      },
    ],
    optional: [
      // Maps API
      {
        type: 'preconnect',
        href: 'https://maps.googleapis.com',
      },
      {
        type: 'dns-prefetch',
        href: 'https://maps.gstatic.com',
      },
    ],
    prefetch: [
      {
        type: 'prefetch',
        href: '/',
        as: 'document',
      },
    ],
  },
};

export class ResourceHintManager {
  private injectedHints: Set<string> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeResourceHints();
    }
  }

  private initializeResourceHints(): void {
    // Remove existing hints on navigation
    window.addEventListener('beforeunload', () => {
      this.cleanupHints();
    });
  }

  // Generate HTML for resource hints
  generateResourceHintsHTML(page: string): string[] {
    const config = RESOURCE_HINT_CONFIGS[page] || RESOURCE_HINT_CONFIGS.homepage;
    const allHints = [
      ...config.critical,
      ...config.important,
      ...config.optional,
    ];

    return allHints.map(hint => this.generateHintHTML(hint));
  }

  private generateHintHTML(hint: ResourceHint): string {
    let attributes = `rel="${hint.type}" href="${hint.href}"`;

    if (hint.as) attributes += ` as="${hint.as}"`;
    if (hint.crossorigin) attributes += ` crossorigin="${hint.crossorigin}"`;
    if (hint.media) attributes += ` media="${hint.media}"`;
    if (hint.priority && hint.type === 'preload') attributes += ` fetchpriority="${hint.priority}"`;

    return `<link ${attributes}>`;
  }

  // Inject hints dynamically
  injectResourceHints(page: string): void {
    const config = RESOURCE_HINT_CONFIGS[page] || RESOURCE_HINT_CONFIGS.homepage;

    // Critical hints first (synchronously)
    config.critical.forEach(hint => {
      this.injectHint(hint, true);
    });

    // Important hints (next tick)
    requestAnimationFrame(() => {
      config.important.forEach(hint => {
        this.injectHint(hint, false);
      });
    });

    // Optional hints (idle time)
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        config.optional.forEach(hint => {
          this.injectHint(hint, false);
        });
      }, { timeout: 2000 });
    } else {
      setTimeout(() => {
        config.optional.forEach(hint => {
          this.injectHint(hint, false);
        });
      }, 100);
    }

    // Prefetch hints (after main content loads)
    window.addEventListener('load', () => {
      setTimeout(() => {
        config.prefetch.forEach(hint => {
          this.injectHint(hint, false);
        });
      }, 1000);
    }, { once: true });
  }

  private injectHint(hint: ResourceHint, isHighPriority: boolean): void {
    const hintKey = `${hint.type}-${hint.href}`;

    if (this.injectedHints.has(hintKey)) {
      return; // Already injected
    }

    const link = document.createElement('link');
    link.rel = hint.type;
    link.href = hint.href;

    if (hint.as) link.setAttribute('as', hint.as);
    if (hint.crossorigin) link.setAttribute('crossorigin', hint.crossorigin);
    if (hint.media) link.setAttribute('media', hint.media);
    if (hint.priority && hint.type === 'preload') {
      link.setAttribute('fetchpriority', hint.priority);
    }

    // Add to head
    if (isHighPriority) {
      // Insert at the beginning for high priority
      document.head.insertBefore(link, document.head.firstChild);
    } else {
      document.head.appendChild(link);
    }

    this.injectedHints.add(hintKey);

    // Track resource hint usage
    if (window.gtag) {
      window.gtag('event', 'resource_hint_injected', {
        event_category: 'Performance',
        event_label: hint.type,
        custom_map: {
          resource: hint.href,
          type: hint.type,
          priority: isHighPriority ? 'high' : 'normal',
        },
      });
    }
  }

  // Intelligent prefetching based on user behavior
  enableIntelligentPrefetching(): void {
    // Prefetch on hover with delay
    this.setupHoverPrefetching();

    // Prefetch based on viewport intersection
    this.setupViewportPrefetching();

    // Prefetch based on user patterns
    this.setupPatternBasedPrefetching();
  }

  private setupHoverPrefetching(): void {
    let hoverTimer: NodeJS.Timeout;

    document.addEventListener('mouseover', (event) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;

      if (!link || !this.shouldPrefetch(link.href)) return;

      hoverTimer = setTimeout(() => {
        this.prefetchResource(link.href, 'document');
      }, 100); // 100ms delay to avoid excessive prefetching
    });

    document.addEventListener('mouseout', () => {
      clearTimeout(hoverTimer);
    });
  }

  private setupViewportPrefetching(): void {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const link = entry.target as HTMLAnchorElement;
          if (this.shouldPrefetch(link.href)) {
            this.prefetchResource(link.href, 'document');
            observer.unobserve(link); // Prefetch only once
          }
        }
      });
    }, {
      rootMargin: '50px', // Start prefetching 50px before entering viewport
    });

    // Observe all links
    document.querySelectorAll('a[href]').forEach(link => {
      observer.observe(link);
    });
  }

  private setupPatternBasedPrefetching(): void {
    // Track page visits in session storage
    const visitedPages = JSON.parse(sessionStorage.getItem('visited-pages') || '[]');
    const currentPath = window.location.pathname;

    // Add current page to visited
    if (!visitedPages.includes(currentPath)) {
      visitedPages.push(currentPath);
      sessionStorage.setItem('visited-pages', JSON.stringify(visitedPages));
    }

    // Predict next likely pages based on patterns
    const nextPages = this.predictNextPages(currentPath, visitedPages);

    // Prefetch predicted pages
    nextPages.forEach(page => {
      setTimeout(() => {
        this.prefetchResource(page, 'document');
      }, 2000); // Delay to avoid competing with main content
    });
  }

  private shouldPrefetch(href: string): boolean {
    const url = new URL(href, window.location.origin);

    // Only prefetch same-origin links
    if (url.origin !== window.location.origin) return false;

    // Don't prefetch current page
    if (url.pathname === window.location.pathname) return false;

    // Don't prefetch admin pages
    if (url.pathname.startsWith('/admin')) return false;

    // Check if already prefetched
    return !this.injectedHints.has(`prefetch-${href}`);
  }

  private prefetchResource(href: string, as: string): void {
    const hintKey = `prefetch-${href}`;
    if (this.injectedHints.has(hintKey)) return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    link.setAttribute('as', as);

    document.head.appendChild(link);
    this.injectedHints.add(hintKey);

    console.log(`[Resource Hints] Prefetched: ${href}`);
  }

  private predictNextPages(currentPath: string, visitHistory: string[]): string[] {
    const predictions: string[] = [];

    // Navigation patterns
    const patterns: Record<string, string[]> = {
      '/': ['/portfolio', '/services'],
      '/portfolio': ['/services', '/contact'],
      '/services': ['/portfolio', '/contact'],
      '/contact': ['/portfolio', '/'],
    };

    // Add pattern-based predictions
    if (patterns[currentPath]) {
      predictions.push(...patterns[currentPath]);
    }

    // Add popular pages if not recently visited
    const popularPages = ['/portfolio', '/services'];
    popularPages.forEach(page => {
      if (!visitHistory.includes(page) && page !== currentPath) {
        predictions.push(page);
      }
    });

    return [...new Set(predictions)]; // Remove duplicates
  }

  private cleanupHints(): void {
    // Remove prefetch hints on navigation to free up memory
    document.querySelectorAll('link[rel="prefetch"]').forEach(link => {
      link.remove();
    });

    // Clear tracking
    Array.from(this.injectedHints).forEach(hint => {
      if (hint.startsWith('prefetch-')) {
        this.injectedHints.delete(hint);
      }
    });
  }

  // Performance monitoring
  measureResourceHintImpact(): void {
    if ('performance' in window) {
      // Track resource loading times
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          if (entry.name.includes('preload') || entry.name.includes('prefetch')) {
            console.log(`[Resource Hint Performance] ${entry.name}: ${entry.duration}ms`);
          }
        });
      });

      observer.observe({ entryTypes: ['navigation', 'resource'] });
    }
  }
}

// Singleton instance
let resourceHintManager: ResourceHintManager | null = null;

export function getResourceHintManager(): ResourceHintManager {
  if (!resourceHintManager) {
    resourceHintManager = new ResourceHintManager();
  }
  return resourceHintManager;
}

// Utility functions
export function generateResourceHintsHTML(page: string): string {
  const manager = getResourceHintManager();
  return manager.generateResourceHintsHTML(page).join('\n');
}

export function initializeResourceHints(page: string): void {
  const manager = getResourceHintManager();
  manager.injectResourceHints(page);
  manager.enableIntelligentPrefetching();
  manager.measureResourceHintImpact();
}

// React hooks
export function useResourceHints(page: string) {
  const manager = getResourceHintManager();

  return {
    generateHTML: () => manager.generateResourceHintsHTML(page),
    initialize: () => {
      manager.injectResourceHints(page);
      manager.enableIntelligentPrefetching();
    },
  };
}