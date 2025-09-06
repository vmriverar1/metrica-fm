'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

// Analytics tracking for services page
export function useServiceAnalytics() {
  const pathname = usePathname();
  const [sessionData, setSessionData] = useState({
    startTime: Date.now(),
    interactions: [] as Array<{
      type: string;
      element: string;
      timestamp: number;
      data?: any;
    }>,
    scrollDepth: 0,
    timeOnPage: 0
  });

  // Track page view
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Google Analytics 4
      if (window.gtag) {
        window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
          page_title: 'Servicios - Métrica FM',
          page_location: window.location.href,
          custom_map: {
            custom_parameter_1: 'service_page_view'
          }
        });
      }

      // Custom analytics
      trackEvent('page_view', 'services_page', {
        path: pathname,
        timestamp: Date.now(),
        user_agent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`
      });
    }
  }, [pathname]);

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);
      
      if (scrollPercent > sessionData.scrollDepth) {
        setSessionData(prev => ({
          ...prev,
          scrollDepth: scrollPercent
        }));

        // Track milestone scroll depths
        if ([25, 50, 75, 90].includes(scrollPercent)) {
          trackEvent('scroll_depth', `${scrollPercent}_percent`, {
            section: getCurrentSection(),
            time_to_scroll: Date.now() - sessionData.startTime
          });
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sessionData.scrollDepth, sessionData.startTime]);

  // Track time on page
  useEffect(() => {
    const interval = setInterval(() => {
      const timeOnPage = Math.round((Date.now() - sessionData.startTime) / 1000);
      setSessionData(prev => ({
        ...prev,
        timeOnPage
      }));

      // Track time milestones
      if ([30, 60, 180, 300].includes(timeOnPage)) {
        trackEvent('time_on_page', `${timeOnPage}_seconds`, {
          engagement_level: getEngagementLevel(timeOnPage),
          interactions_count: sessionData.interactions.length
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionData.startTime, sessionData.interactions.length]);

  const trackEvent = (action: string, category: string, data?: any) => {
    setSessionData(prev => ({
      ...prev,
      interactions: [...prev.interactions, {
        type: action,
        element: category,
        timestamp: Date.now(),
        data
      }]
    }));

    // Google Analytics 4
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, {
        event_category: 'services',
        event_label: category,
        custom_parameter_1: JSON.stringify(data)
      });
    }

    // Send to custom analytics endpoint
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          category,
          page: 'services',
          data,
          session_id: getSessionId(),
          timestamp: Date.now()
        })
      }).catch(err => console.warn('Analytics error:', err));
    }
  };

  const getCurrentSection = () => {
    const sections = [
      'hero',
      'service-matrix', 
      'value-props',
      'project-showcase',
      'knowledge-hub',
      'contact-form'
    ];

    for (const section of sections) {
      const element = document.getElementById(section);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.top <= 200 && rect.bottom >= 200) {
          return section;
        }
      }
    }
    return 'unknown';
  };

  const getEngagementLevel = (timeOnPage: number) => {
    if (timeOnPage < 30) return 'low';
    if (timeOnPage < 120) return 'medium';
    if (timeOnPage < 300) return 'high';
    return 'very_high';
  };

  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('metrica_session_id');
    if (!sessionId) {
      sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
      sessionStorage.setItem('metrica_session_id', sessionId);
    }
    return sessionId;
  };

  return {
    trackEvent,
    sessionData
  };
}

// Service-specific event tracking hooks
export function useServiceInteractionTracking() {
  const { trackEvent } = useServiceAnalytics();

  const trackServiceClick = (serviceId: string, serviceName: string) => {
    trackEvent('service_click', serviceId, {
      service_name: serviceName,
      interaction_type: 'service_selection'
    });
  };

  const trackFilterChange = (filterId: string, filterValue: string) => {
    trackEvent('filter_change', filterId, {
      filter_value: filterValue,
      interaction_type: 'filter_selection'
    });
  };

  const trackProjectView = (projectId: string, projectName: string) => {
    trackEvent('project_view', projectId, {
      project_name: projectName,
      interaction_type: 'project_interest'
    });
  };

  const trackFormStep = (step: number, stepName: string) => {
    trackEvent('form_step', `step_${step}`, {
      step_name: stepName,
      interaction_type: 'form_progression'
    });
  };

  const trackFormSubmit = (formData: any) => {
    trackEvent('form_submit', 'contact_form', {
      service_selected: formData.service,
      budget_range: formData.budget,
      timeline: formData.timeline,
      interaction_type: 'conversion'
    });
  };

  const trackCTAClick = (ctaId: string, ctaText: string, destination: string) => {
    trackEvent('cta_click', ctaId, {
      cta_text: ctaText,
      destination,
      interaction_type: 'navigation'
    });
  };

  const trackKnowledgeClick = (contentId: string, contentType: string, contentTitle: string) => {
    trackEvent('knowledge_click', contentId, {
      content_type: contentType,
      content_title: contentTitle,
      interaction_type: 'content_engagement'
    });
  };

  return {
    trackServiceClick,
    trackFilterChange,
    trackProjectView,
    trackFormStep,
    trackFormSubmit,
    trackCTAClick,
    trackKnowledgeClick
  };
}

// Performance monitoring hook
function usePerformanceTracking() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Core Web Vitals tracking
    const trackWebVitals = () => {
      // Largest Contentful Paint (LCP)
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (window.gtag) {
            window.gtag('event', 'web_vitals', {
              event_category: 'performance',
              event_label: 'LCP',
              value: Math.round(entry.startTime),
              custom_parameter_1: 'services_page'
            });
          }
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (window.gtag) {
            window.gtag('event', 'web_vitals', {
              event_category: 'performance',
              event_label: 'FID',
              value: Math.round(entry.processingStart - entry.startTime),
              custom_parameter_1: 'services_page'
            });
          }
        }
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        
        if (window.gtag) {
          window.gtag('event', 'web_vitals', {
            event_category: 'performance',
            event_label: 'CLS',
            value: Math.round(clsValue * 1000),
            custom_parameter_1: 'services_page'
          });
        }
      }).observe({ entryTypes: ['layout-shift'] });
    };

    // Resource loading tracking
    const trackResourceLoading = () => {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        const metrics = {
          dns_lookup: Math.round(navigation.domainLookupEnd - navigation.domainLookupStart),
          connection_time: Math.round(navigation.connectEnd - navigation.connectStart),
          request_time: Math.round(navigation.responseStart - navigation.requestStart),
          response_time: Math.round(navigation.responseEnd - navigation.responseStart),
          dom_processing: Math.round(navigation.domContentLoadedEventStart - navigation.responseEnd),
          load_complete: Math.round(navigation.loadEventEnd - navigation.navigationStart)
        };

        // Track each metric
        Object.entries(metrics).forEach(([metric, value]) => {
          if (window.gtag) {
            window.gtag('event', 'page_timing', {
              event_category: 'performance',
              event_label: metric,
              value,
              custom_parameter_1: 'services_page'
            });
          }
        });
      });
    };

    trackWebVitals();
    trackResourceLoading();
  }, []);

  return null; // This is a monitoring component, doesn't render anything
}

// Export analytics utils
declare global {
  interface Window {
    gtag?: (command: string, targetId: string, config?: any) => void;
  }
}

export default function ServiceAnalytics() {
  useServiceAnalytics();
  usePerformanceTracking();
  
  return null;
}