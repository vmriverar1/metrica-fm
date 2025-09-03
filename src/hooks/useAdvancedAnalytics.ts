'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
// Performance monitoring and cache imports removed

interface AnalyticsEvent {
  name: string;
  properties: Record<string, any>;
  timestamp: number;
  sessionId: string;
  userId?: string;
  pageUrl: string;
  referrer: string;
  userAgent: string;
}

interface UserSession {
  sessionId: string;
  startTime: number;
  lastActivity: number;
  pageViews: number;
  events: AnalyticsEvent[];
  duration: number;
  bounced: boolean;
}

interface ContentEngagement {
  contentId: string;
  contentType: 'blog' | 'job' | 'article';
  timeSpent: number;
  scrollDepth: number;
  interactionCount: number;
  shareCount: number;
  bookmarkCount: number;
  conversionScore: number;
}

interface SearchAnalytics {
  query: string;
  resultsCount: number;
  clickThroughRate: number;
  refinements: number;
  abandonmentRate: number;
  conversionRate: number;
}

interface FunnelStep {
  name: string;
  users: number;
  dropoffRate: number;
  conversionRate: number;
}

export function useAdvancedAnalytics(pageType: 'blog' | 'careers' | 'article' | 'job' | 'home') {
  const [session, setSession] = useState<UserSession | null>(null);
  const [contentEngagement, setContentEngagement] = useState<ContentEngagement | null>(null);
  const [funnelData, setFunnelData] = useState<FunnelStep[]>([]);
  
  // Performance and cache monitoring removed
  
  const startTime = useRef<number>(Date.now());
  const interactionCount = useRef<number>(0);
  const eventsQueue = useRef<AnalyticsEvent[]>([]);

  // Initialize session
  useEffect(() => {
    const sessionId = generateSessionId();
    const newSession: UserSession = {
      sessionId,
      startTime: Date.now(),
      lastActivity: Date.now(),
      pageViews: 1,
      events: [],
      duration: 0,
      bounced: true
    };

    setSession(newSession);
    
    // Track page view
    trackEvent('page_view', {
      pageType,
      url: window.location.pathname,
      title: document.title,
      performanceScore: performanceMonitor.getPerformanceScore()
    });

    return () => {
      // Flush events on unmount
      flushEvents();
    };
  }, [pageType]);

  // Initialize content engagement tracking
  useEffect(() => {
    if (pageType === 'article' || pageType === 'job') {
      const contentId = getContentIdFromUrl();
      if (contentId) {
        setContentEngagement({
          contentId,
          contentType: pageType === 'article' ? 'article' : 'job',
          timeSpent: 0,
          scrollDepth: 0,
          interactionCount: 0,
          shareCount: 0,
          bookmarkCount: 0,
          conversionScore: 0
        });
      }
    }
  }, [pageType]);

  // Generate unique session ID
  const generateSessionId = useCallback(() => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }, []);

  // Get content ID from URL
  const getContentIdFromUrl = useCallback(() => {
    const pathname = window.location.pathname;
    const segments = pathname.split('/');
    return segments[segments.length - 1] || null;
  }, []);

  // Track events
  const trackEvent = useCallback((eventName: string, properties: Record<string, any> = {}) => {
    if (!session) return;

    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        pageType,
        abTestVariant: null,
        cacheHitRate: 0,
        performanceScore: 0
      },
      timestamp: Date.now(),
      sessionId: session.sessionId,
      pageUrl: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent
    };

    eventsQueue.current.push(event);
    
    setSession(prev => prev ? {
      ...prev,
      events: [...prev.events, event],
      lastActivity: Date.now(),
      bounced: prev.events.length > 0 ? false : prev.bounced
    } : prev);

    // A/B testing removed

    // Auto-flush events every 10 events or 30 seconds
    if (eventsQueue.current.length >= 10) {
      flushEvents();
    }
  }, [session, pageType]);

  // Flush events to analytics service
  const flushEvents = useCallback(async () => {
    if (eventsQueue.current.length === 0) return;

    const events = [...eventsQueue.current];
    eventsQueue.current = [];

    try {
      // In a real app, send to your analytics service
      console.log('Flushing analytics events:', events);
      
      // Example API call:
      // await fetch('/api/analytics/events', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(events)
      // });

      // For demo, store in localStorage
      const existingEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      localStorage.setItem('analytics_events', JSON.stringify([...existingEvents, ...events]));
      
    } catch (error) {
      console.error('Failed to flush analytics events:', error);
      // Re-queue events on failure
      eventsQueue.current = [...events, ...eventsQueue.current];
    }
  }, []);

  // Auto-flush every 30 seconds
  useEffect(() => {
    const interval = setInterval(flushEvents, 30000);
    return () => clearInterval(interval);
  }, [flushEvents]);

  // Content engagement tracking
  const trackContentEngagement = useCallback((type: string, value?: any) => {
    if (!contentEngagement) return;

    let updates: Partial<ContentEngagement> = {};
    
    switch (type) {
      case 'scroll':
        updates.scrollDepth = Math.max(contentEngagement.scrollDepth, value || 0);
        break;
      case 'time':
        updates.timeSpent = Date.now() - startTime.current;
        break;
      case 'interaction':
        updates.interactionCount = contentEngagement.interactionCount + 1;
        interactionCount.current++;
        break;
      case 'share':
        updates.shareCount = contentEngagement.shareCount + 1;
        break;
      case 'bookmark':
        updates.bookmarkCount = contentEngagement.bookmarkCount + 1;
        break;
    }

    // Calculate engagement score
    const timeScore = Math.min((updates.timeSpent || contentEngagement.timeSpent) / 60000, 1) * 25; // Max 25 points for time
    const scrollScore = (updates.scrollDepth || contentEngagement.scrollDepth) * 0.25; // Max 25 points for scroll
    const interactionScore = Math.min((updates.interactionCount || contentEngagement.interactionCount) * 10, 25); // Max 25 points
    const socialScore = ((updates.shareCount || contentEngagement.shareCount) + (updates.bookmarkCount || contentEngagement.bookmarkCount)) * 12.5; // Max 25 points

    updates.conversionScore = timeScore + scrollScore + interactionScore + socialScore;

    setContentEngagement(prev => prev ? { ...prev, ...updates } : prev);
    
    trackEvent('content_engagement', {
      contentId: contentEngagement.contentId,
      engagementType: type,
      value,
      score: updates.conversionScore
    });
  }, [contentEngagement, trackEvent]);

  // Search analytics
  const trackSearch = useCallback((query: string, resultsCount: number) => {
    trackEvent('search_performed', {
      query: query.toLowerCase().trim(),
      resultsCount,
      hasResults: resultsCount > 0
    });
  }, [trackEvent]);

  const trackSearchClick = useCallback((query: string, resultId: string, position: number) => {
    trackEvent('search_click', {
      query: query.toLowerCase().trim(),
      resultId,
      position,
      clickThroughRate: position <= 3 ? 'high' : position <= 10 ? 'medium' : 'low'
    });
  }, [trackEvent]);

  // Funnel tracking
  const trackFunnelStep = useCallback((stepName: string, completed: boolean = true) => {
    trackEvent('funnel_step', {
      step: stepName,
      completed,
      pageType
    });

    if (pageType === 'careers') {
      updateCareersFunnel(stepName, completed);
    } else if (pageType === 'blog') {
      updateBlogFunnel(stepName, completed);
    }
  }, [trackEvent, pageType]);

  const updateCareersFunnel = useCallback((step: string, completed: boolean) => {
    const funnelSteps = [
      'job_view',
      'application_start',
      'cv_upload',
      'form_complete',
      'application_submit'
    ];

    // Update funnel data (simplified for demo)
    setFunnelData(prev => {
      const existing = prev.find(f => f.name === step);
      if (existing) {
        return prev.map(f => f.name === step ? {
          ...f,
          users: f.users + (completed ? 1 : 0)
        } : f);
      } else {
        return [...prev, {
          name: step,
          users: completed ? 1 : 0,
          dropoffRate: 0,
          conversionRate: 0
        }];
      }
    });
  }, []);

  const updateBlogFunnel = useCallback((step: string, completed: boolean) => {
    const funnelSteps = [
      'article_view',
      'content_read_25',
      'content_read_50',
      'content_read_75',
      'content_complete',
      'comment_made',
      'article_shared'
    ];

    // Update funnel data (simplified for demo)
    setFunnelData(prev => {
      const existing = prev.find(f => f.name === step);
      if (existing) {
        return prev.map(f => f.name === step ? {
          ...f,
          users: f.users + (completed ? 1 : 0)
        } : f);
      } else {
        return [...prev, {
          name: step,
          users: completed ? 1 : 0,
          dropoffRate: 0,
          conversionRate: 0
        }];
      }
    });
  }, []);

  // User behavior insights
  const generateInsights = useCallback(() => {
    if (!session || !contentEngagement) return null;

    const insights = [];
    
    // Session insights
    if (session.duration > 300000) { // 5+ minutes
      insights.push('Long session - user is highly engaged');
    }
    
    if (session.pageViews > 3) {
      insights.push('Multiple page views - exploring content');
    }

    // Content insights
    if (contentEngagement.scrollDepth > 75) {
      insights.push('High scroll depth - content is engaging');
    }

    if (contentEngagement.timeSpent > 120000) { // 2+ minutes
      insights.push('Extended reading time - quality content');
    }

    if (contentEngagement.interactionCount > 5) {
      insights.push('High interaction rate - user is actively engaged');
    }

    // Performance insights removed

    return insights;
  }, [session, contentEngagement]);

  // Real-time metrics
  const getRealTimeMetrics = useCallback(() => {
    return {
      activeSession: !!session,
      sessionDuration: session ? Date.now() - session.startTime : 0,
      pageViews: session?.pageViews || 0,
      eventsCount: session?.events.length || 0,
      contentEngagementScore: contentEngagement?.conversionScore || 0,
      performanceScore: 0,
      cacheHitRate: 0,
      currentFunnel: funnelData
    };
  }, [session, contentEngagement, funnelData]);

  // Export session data
  const exportSessionData = useCallback(() => {
    const data = {
      session,
      contentEngagement,
      funnelData,
      performance: null,
      abTestVariant: null,
      insights: generateInsights(),
      realTimeMetrics: getRealTimeMetrics()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-session-${session?.sessionId || 'unknown'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [session, contentEngagement, funnelData, generateInsights, getRealTimeMetrics]);

  return {
    // Core tracking
    trackEvent,
    trackContentEngagement,
    trackSearch,
    trackSearchClick,
    trackFunnelStep,
    
    // Data
    session,
    contentEngagement,
    funnelData,
    
    // Insights
    generateInsights,
    getRealTimeMetrics,
    
    // Utilities
    flushEvents,
    exportSessionData
  };
}

// Global analytics context
export function useGlobalAnalytics() {
  const [globalMetrics, setGlobalMetrics] = useState({
    totalSessions: 0,
    totalPageViews: 0,
    averageSessionDuration: 0,
    bounceRate: 0,
    conversionRate: 0
  });

  const updateGlobalMetrics = useCallback(() => {
    // In a real app, fetch from analytics API
    const mockData = {
      totalSessions: 1247,
      totalPageViews: 4892,
      averageSessionDuration: 245000,
      bounceRate: 0.32,
      conversionRate: 0.078
    };
    
    setGlobalMetrics(mockData);
  }, []);

  useEffect(() => {
    updateGlobalMetrics();
    const interval = setInterval(updateGlobalMetrics, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [updateGlobalMetrics]);

  return {
    globalMetrics,
    updateGlobalMetrics
  };
}