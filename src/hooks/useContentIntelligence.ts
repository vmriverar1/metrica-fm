'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { BlogPost } from '@/types/blog';
import { JobPosting } from '@/types/careers';
import { useAdvancedAnalytics } from './useAdvancedAnalytics';
import { usePerformanceMonitor } from './usePerformanceMonitor';

export type ContentItem = BlogPost | JobPosting;

interface ContentMetrics {
  id: string;
  views: number;
  timeSpent: number;
  engagementRate: number;
  shareCount: number;
  favoriteCount: number;
  commentCount: number;
  conversionRate: number;
  qualityScore: number;
  trendingScore: number;
  lastUpdated: number;
}

interface TrendingItem {
  item: ContentItem;
  metrics: ContentMetrics;
  trendDirection: 'up' | 'down' | 'stable';
  changePercentage: number;
  ranking: number;
}

interface ContentInsights {
  topPerformers: TrendingItem[];
  emergingTrends: TrendingItem[];
  underperformers: TrendingItem[];
  categoryBreakdown: Record<string, number>;
  timeBasedTrends: Array<{
    period: string;
    views: number;
    engagement: number;
  }>;
  userBehaviorPatterns: {
    averageTimeSpent: number;
    bounceRate: number;
    conversionRate: number;
    peakHours: number[];
  };
}

interface ContentScoringCriteria {
  recency: number; // Weight for freshness
  engagement: number; // Weight for user engagement
  quality: number; // Weight for content quality signals
  performance: number; // Weight for technical performance
  social: number; // Weight for social signals
}

const DEFAULT_SCORING_CRITERIA: ContentScoringCriteria = {
  recency: 0.2,
  engagement: 0.3,
  quality: 0.25,
  performance: 0.15,
  social: 0.1
};

export function useContentIntelligence(type: 'blog' | 'careers') {
  const [contentMetrics, setContentMetrics] = useState<Map<string, ContentMetrics>>(new Map());
  const [insights, setInsights] = useState<ContentInsights | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analytics = useAdvancedAnalytics(type === 'blog' ? 'blog' : 'careers');
  const performanceMonitor = usePerformanceMonitor(type === 'blog' ? 'blog' : 'careers');

  // Initialize metrics from localStorage
  useEffect(() => {
    loadMetricsFromStorage();
  }, [type]);

  const loadMetricsFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(`${type}_content_metrics`);
      if (stored) {
        const metricsData = JSON.parse(stored);
        const metricsMap = new Map<string, ContentMetrics>();
        
        Object.entries(metricsData).forEach(([id, metrics]) => {
          metricsMap.set(id, metrics as ContentMetrics);
        });
        
        setContentMetrics(metricsMap);
      }
    } catch (error) {
      console.error('Error loading content metrics:', error);
    }
  }, [type]);

  const saveMetricsToStorage = useCallback((metrics: Map<string, ContentMetrics>) => {
    try {
      const metricsObject = Object.fromEntries(metrics);
      localStorage.setItem(`${type}_content_metrics`, JSON.stringify(metricsObject));
    } catch (error) {
      console.error('Error saving content metrics:', error);
    }
  }, [type]);

  // Track content interaction
  const trackContentInteraction = useCallback((
    itemId: string,
    interactionType: 'view' | 'engage' | 'share' | 'favorite' | 'comment' | 'convert',
    value: number = 1
  ) => {
    setContentMetrics(prev => {
      const newMetrics = new Map(prev);
      const existing = newMetrics.get(itemId) || {
        id: itemId,
        views: 0,
        timeSpent: 0,
        engagementRate: 0,
        shareCount: 0,
        favoriteCount: 0,
        commentCount: 0,
        conversionRate: 0,
        qualityScore: 0,
        trendingScore: 0,
        lastUpdated: Date.now()
      };

      const updated: ContentMetrics = {
        ...existing,
        lastUpdated: Date.now()
      };

      switch (interactionType) {
        case 'view':
          updated.views += value;
          break;
        case 'engage':
          updated.timeSpent += value;
          updated.engagementRate = calculateEngagementRate(updated);
          break;
        case 'share':
          updated.shareCount += value;
          break;
        case 'favorite':
          updated.favoriteCount += value;
          break;
        case 'comment':
          updated.commentCount += value;
          break;
        case 'convert':
          updated.conversionRate = (updated.conversionRate * updated.views + value) / (updated.views + 1);
          break;
      }

      newMetrics.set(itemId, updated);
      saveMetricsToStorage(newMetrics);
      return newMetrics;
    });

    // Track in analytics
    analytics.trackEvent('content_interaction', {
      itemId,
      interactionType,
      value,
      contentType: type
    });
  }, [analytics, type, saveMetricsToStorage]);

  // Calculate engagement rate
  const calculateEngagementRate = useCallback((metrics: ContentMetrics): number => {
    if (metrics.views === 0) return 0;
    
    const engagementActions = metrics.shareCount + metrics.favoriteCount + metrics.commentCount;
    const timeEngagement = Math.min(metrics.timeSpent / (metrics.views * 30000), 1); // 30s = good engagement
    
    return (engagementActions / metrics.views * 0.6) + (timeEngagement * 0.4);
  }, []);

  // Calculate quality score based on multiple signals
  const calculateQualityScore = useCallback((
    item: ContentItem,
    metrics: ContentMetrics,
    performanceData?: any
  ): number => {
    let qualityScore = 0;

    // Content length and structure quality
    if (type === 'blog') {
      const blogPost = item as BlogPost;
      const wordCount = blogPost.content.split(' ').length;
      
      // Optimal length scoring
      if (wordCount >= 800 && wordCount <= 2500) qualityScore += 0.2;
      else if (wordCount >= 500) qualityScore += 0.1;
      
      // Has featured image
      if (blogPost.featuredImage) qualityScore += 0.1;
      
      // Has multiple tags
      if (blogPost.tags.length >= 3) qualityScore += 0.1;
      
    } else {
      const jobPost = item as JobPosting;
      
      // Complete job description
      if (jobPost.description.length > 200) qualityScore += 0.2;
      
      // Multiple requirements
      if (jobPost.requirements.length >= 3) qualityScore += 0.1;
      
      // Benefits listed
      if (jobPost.benefits && jobPost.benefits.length > 0) qualityScore += 0.1;
    }

    // Engagement quality
    if (metrics.engagementRate > 0.1) qualityScore += 0.2;
    if (metrics.engagementRate > 0.05) qualityScore += 0.1;

    // Social proof
    if (metrics.shareCount > 5) qualityScore += 0.15;
    if (metrics.favoriteCount > 10) qualityScore += 0.1;

    // Performance quality
    if (performanceData?.lcp && performanceData.lcp < 2500) qualityScore += 0.05;

    return Math.min(qualityScore, 1);
  }, [type]);

  // Calculate trending score
  const calculateTrendingScore = useCallback((
    item: ContentItem,
    metrics: ContentMetrics,
    criteria: ContentScoringCriteria = DEFAULT_SCORING_CRITERIA
  ): number => {
    const now = Date.now();
    const daysSinceCreated = (now - new Date(item.createdAt || item.publishedAt || now).getTime()) / (1000 * 60 * 60 * 24);
    const daysSinceUpdate = (now - metrics.lastUpdated) / (1000 * 60 * 60 * 24);

    // Recency score (newer is better, with decay)
    const recencyScore = Math.max(0, Math.exp(-daysSinceCreated / 30)); // 30-day half-life

    // Engagement score (recent engagement is weighted more)
    const recentEngagementDecay = Math.max(0, Math.exp(-daysSinceUpdate / 7)); // 7-day half-life
    const engagementScore = metrics.engagementRate * recentEngagementDecay;

    // Quality score
    const qualityScore = calculateQualityScore(item, metrics);

    // Performance score (from performance monitor)
    const performanceScore = performanceMonitor.getPerformanceScore() / 100;

    // Social signals score
    const socialScore = Math.min(
      (metrics.shareCount * 0.1 + metrics.favoriteCount * 0.05 + metrics.commentCount * 0.15) / 10,
      1
    );

    // Velocity score (how fast it's gaining traction)
    const velocityScore = Math.min(metrics.views / Math.max(daysSinceCreated, 1) / 100, 1);

    // Combined score
    const trendingScore = 
      recencyScore * criteria.recency +
      engagementScore * criteria.engagement +
      qualityScore * criteria.quality +
      performanceScore * criteria.performance +
      socialScore * criteria.social +
      velocityScore * 0.1; // Small boost for velocity

    return Math.min(trendingScore, 1);
  }, [calculateQualityScore, performanceMonitor]);

  // Generate content insights
  const generateInsights = useCallback(async (items: ContentItem[]) => {
    setIsAnalyzing(true);

    try {
      const trendingItems: TrendingItem[] = [];
      const categoryBreakdown: Record<string, number> = {};
      let totalViews = 0;
      let totalEngagement = 0;

      // Process each item
      for (const item of items) {
        const metrics = contentMetrics.get(item.id) || {
          id: item.id,
          views: 0,
          timeSpent: 0,
          engagementRate: 0,
          shareCount: 0,
          favoriteCount: 0,
          commentCount: 0,
          conversionRate: 0,
          qualityScore: 0,
          trendingScore: 0,
          lastUpdated: Date.now()
        };

        // Calculate updated scores
        const qualityScore = calculateQualityScore(item, metrics);
        const trendingScore = calculateTrendingScore(item, metrics);

        const updatedMetrics: ContentMetrics = {
          ...metrics,
          qualityScore,
          trendingScore
        };

        // Update metrics
        contentMetrics.set(item.id, updatedMetrics);

        // Create trending item
        const trendingItem: TrendingItem = {
          item,
          metrics: updatedMetrics,
          trendDirection: determineTrendDirection(updatedMetrics),
          changePercentage: calculateChangePercentage(updatedMetrics),
          ranking: 0 // Will be set after sorting
        };

        trendingItems.push(trendingItem);

        // Update category breakdown
        const category = type === 'blog' ? (item as BlogPost).category : (item as JobPosting).department;
        categoryBreakdown[category] = (categoryBreakdown[category] || 0) + updatedMetrics.views;

        totalViews += updatedMetrics.views;
        totalEngagement += updatedMetrics.engagementRate;
      }

      // Sort and rank
      trendingItems.sort((a, b) => b.metrics.trendingScore - a.metrics.trendingScore);
      trendingItems.forEach((item, index) => {
        item.ranking = index + 1;
      });

      // Categorize items
      const topPerformers = trendingItems.slice(0, 5);
      const emergingTrends = trendingItems.filter(item => 
        item.metrics.trendingScore > 0.3 && 
        item.changePercentage > 20 &&
        !topPerformers.includes(item)
      ).slice(0, 5);
      const underperformers = trendingItems.filter(item => 
        item.metrics.trendingScore < 0.1 && 
        item.metrics.views > 10
      ).slice(-5);

      // Generate time-based trends (mock data for demo)
      const timeBasedTrends = generateTimeBasedTrends();

      const insights: ContentInsights = {
        topPerformers,
        emergingTrends,
        underperformers,
        categoryBreakdown,
        timeBasedTrends,
        userBehaviorPatterns: {
          averageTimeSpent: totalViews > 0 ? 
            Array.from(contentMetrics.values()).reduce((acc, m) => acc + m.timeSpent, 0) / totalViews : 0,
          bounceRate: calculateBounceRate(),
          conversionRate: totalViews > 0 ? 
            Array.from(contentMetrics.values()).reduce((acc, m) => acc + m.conversionRate, 0) / totalViews : 0,
          peakHours: [9, 14, 20] // Mock data
        }
      };

      setInsights(insights);
      saveMetricsToStorage(contentMetrics);

      analytics.trackEvent('insights_generated', {
        type,
        itemCount: items.length,
        topPerformerCount: topPerformers.length,
        emergingTrendCount: emergingTrends.length
      });

    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [contentMetrics, type, calculateQualityScore, calculateTrendingScore, analytics, saveMetricsToStorage]);

  // Helper functions
  const determineTrendDirection = useCallback((metrics: ContentMetrics): 'up' | 'down' | 'stable' => {
    // Simplified trend direction based on recent activity
    const recentActivity = Date.now() - metrics.lastUpdated;
    if (recentActivity < 24 * 60 * 60 * 1000 && metrics.trendingScore > 0.3) return 'up';
    if (metrics.trendingScore < 0.1) return 'down';
    return 'stable';
  }, []);

  const calculateChangePercentage = useCallback((metrics: ContentMetrics): number => {
    // Mock calculation - in real app, compare with previous period
    return Math.random() * 100 - 50; // -50% to +50%
  }, []);

  const calculateBounceRate = useCallback((): number => {
    const metricsArray = Array.from(contentMetrics.values());
    if (metricsArray.length === 0) return 0;
    
    const quickExits = metricsArray.filter(m => m.timeSpent < 15000).length; // Less than 15s
    return quickExits / metricsArray.length;
  }, [contentMetrics]);

  const generateTimeBasedTrends = useCallback(() => {
    // Mock time-based data - in real app, aggregate from historical data
    return [
      { period: '6h ago', views: 120, engagement: 0.15 },
      { period: '12h ago', views: 180, engagement: 0.22 },
      { period: '18h ago', views: 95, engagement: 0.18 },
      { period: '24h ago', views: 150, engagement: 0.20 }
    ];
  }, []);

  // Get trending items for display
  const getTrendingItems = useCallback((limit = 10): TrendingItem[] => {
    if (!insights) return [];
    return insights.topPerformers.slice(0, limit);
  }, [insights]);

  // Get content recommendations based on performance
  const getPerformanceBasedRecommendations = useCallback((item: ContentItem): string[] => {
    const metrics = contentMetrics.get(item.id);
    if (!metrics) return [];

    const recommendations: string[] = [];

    if (metrics.engagementRate < 0.05) {
      recommendations.push('Mejorar el engagement con CTAs más claros');
      recommendations.push('Agregar elementos interactivos');
    }

    if (metrics.shareCount < 3 && metrics.views > 100) {
      recommendations.push('Optimizar para compartir en redes sociales');
      recommendations.push('Agregar botones de compartir más visibles');
    }

    if (type === 'blog' && metrics.timeSpent / metrics.views < 60000) { // Less than 1 minute average
      recommendations.push('Mejorar la estructura del contenido');
      recommendations.push('Agregar elementos visuales para mantener atención');
    }

    if (type === 'careers' && metrics.conversionRate < 0.05) {
      recommendations.push('Simplificar el proceso de aplicación');
      recommendations.push('Mejorar la descripción del puesto');
    }

    return recommendations;
  }, [contentMetrics, type]);

  return {
    contentMetrics,
    insights,
    isAnalyzing,
    trackContentInteraction,
    generateInsights,
    getTrendingItems,
    getPerformanceBasedRecommendations,
    calculateQualityScore,
    calculateTrendingScore
  };
}

// Specialized hook for content calendar and planning
export function useContentCalendar(type: 'blog' | 'careers') {
  const [contentCalendar, setContentCalendar] = useState<Array<{
    date: Date;
    suggestedTopics: string[];
    optimalTiming: string;
    estimatedPerformance: number;
  }>>([]);

  const generateContentCalendar = useCallback((days = 30) => {
    const calendar = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Mock content suggestions based on type and trends
      const suggestedTopics = type === 'blog' ? [
        'Tendencias de construcción sostenible',
        'Nuevas regulaciones de construcción',
        'Casos de éxito en proyectos',
        'Innovaciones tecnológicas BIM'
      ] : [
        'Ingeniero Civil Senior',
        'Project Manager Retail',
        'Arquitecto Comercial',
        'Especialista en Sostenibilidad'
      ];

      calendar.push({
        date,
        suggestedTopics: [suggestedTopics[i % suggestedTopics.length]],
        optimalTiming: getOptimalTiming(date),
        estimatedPerformance: Math.random() * 0.8 + 0.2 // 20-100%
      });
    }

    setContentCalendar(calendar);
  }, [type]);

  const getOptimalTiming = (date: Date): string => {
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 2 || dayOfWeek === 3) return '09:00'; // Tuesday/Wednesday morning
    if (dayOfWeek === 5) return '15:00'; // Friday afternoon
    return '10:00'; // Default
  };

  return {
    contentCalendar,
    generateContentCalendar
  };
}