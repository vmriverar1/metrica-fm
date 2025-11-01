// FASE 5D: SEO Provider Component
// Componente para inyectar structured data y optimizar SEO

'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { structuredData, injectStructuredData } from '@/lib/seo/structured-data';

interface SEOProviderProps {
  pageType: string;
  data?: any;
  children: React.ReactNode;
}

export function SEOProvider({ pageType, data, children }: SEOProviderProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Generate and inject structured data
    const schemas = structuredData.generatePageSchemas(pageType, data);

    // Remove existing structured data
    const existingSchemas = document.querySelectorAll('script[type="application/ld+json"]');
    existingSchemas.forEach(script => script.remove());

    // Inject new structured data
    schemas.forEach(schema => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schema, null, 0);
      document.head.appendChild(script);
    });

    // Track SEO metrics
    if (window.gtag) {
      window.gtag('event', 'seo_data_injected', {
        event_category: 'SEO',
        event_label: pageType,
        custom_map: {
          schemas_count: schemas.length,
          page_type: pageType,
          pathname,
        },
      });
    }

    console.log(`[SEO] Injected ${schemas.length} structured data schemas for ${pageType}`);

  }, [pageType, data, pathname]);

  return <>{children}</>;
}

// Server-side SEO injection for better performance
export function injectServerSideSEO(pageType: string, data?: any): string {
  const schemas = structuredData.generatePageSchemas(pageType, data);
  return injectStructuredData(schemas);
}

// Component for dynamic meta tag updates
export function DynamicMetaTags({ title, description, image, noIndex = false }: {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
}) {
  useEffect(() => {
    // Update title
    if (title) {
      document.title = title;
    }

    // Update meta description
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]') as HTMLMetaElement;
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.name = 'description';
        document.head.appendChild(metaDescription);
      }
      metaDescription.content = description;
    }

    // Update Open Graph tags
    if (title) {
      updateMetaProperty('og:title', title);
      updateMetaProperty('twitter:title', title);
    }

    if (description) {
      updateMetaProperty('og:description', description);
      updateMetaProperty('twitter:description', description);
    }

    if (image) {
      updateMetaProperty('og:image', image);
      updateMetaProperty('twitter:image', image);
    }

    // Update robots
    if (noIndex) {
      updateMetaName('robots', 'noindex, nofollow');
    }

  }, [title, description, image, noIndex]);

  return null;
}

function updateMetaProperty(property: string, content: string) {
  let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('property', property);
    document.head.appendChild(meta);
  }
  meta.content = content;
}

function updateMetaName(name: string, content: string) {
  let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = name;
    document.head.appendChild(meta);
  }
  meta.content = content;
}

// Component for sitemap generation hints
export function SitemapHints({ lastModified, priority = '0.8', changefreq = 'weekly' }: {
  lastModified?: string;
  priority?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
}) {
  useEffect(() => {
    // Store sitemap data for server-side generation
    const sitemapData = {
      url: window.location.href,
      lastModified: lastModified || new Date().toISOString(),
      priority,
      changefreq,
    };

    // Store in sessionStorage for sitemap generation
    const existingData = JSON.parse(sessionStorage.getItem('sitemap-data') || '[]');
    const updatedData = existingData.filter((item: any) => item.url !== sitemapData.url);
    updatedData.push(sitemapData);
    sessionStorage.setItem('sitemap-data', JSON.stringify(updatedData));

  }, [lastModified, priority, changefreq]);

  return null;
}

// Hook for monitoring Core Web Vitals impact on SEO
export function useSEOPerformanceTracking() {
  useEffect(() => {
    // Track page load impact on SEO
    const trackSEOMetrics = () => {
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');

        const metrics = {
          domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.navigationStart,
          firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
          largestContentfulPaint: 0, // Will be set by Web Vitals
          cumulativeLayoutShift: 0, // Will be set by Web Vitals
        };

        // Report SEO-relevant performance metrics
        if (window.gtag) {
          window.gtag('event', 'seo_performance_metrics', {
            event_category: 'SEO Performance',
            custom_map: {
              ...metrics,
              url: window.location.pathname,
            },
          });
        }

        // Log for debugging
        console.log('[SEO Performance]', {
          url: window.location.pathname,
          ...metrics,
        });
      }
    };

    // Track after page load
    if (document.readyState === 'complete') {
      trackSEOMetrics();
    } else {
      window.addEventListener('load', trackSEOMetrics);
      return () => window.removeEventListener('load', trackSEOMetrics);
    }
  }, []);
}

// Component for handling 404 SEO
export function NotFoundSEO() {
  return (
    <DynamicMetaTags
      title="Página No Encontrada | Métrica FM"
      description="La página que buscas no existe. Descubre nuestros servicios de ingeniería y construcción en Perú."
      noIndex={true}
    />
  );
}

// Component for search results SEO
export function SearchResultsSEO({ query, resultsCount }: { query: string; resultsCount: number }) {
  return (
    <DynamicMetaTags
      title={`Resultados para "${query}" | Métrica FM`}
      description={`Encontramos ${resultsCount} resultados para "${query}" en nuestros servicios de ingeniería y construcción.`}
      noIndex={resultsCount === 0}
    />
  );
}