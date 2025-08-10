'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { BlogPost } from '@/types/blog';
import { JobPosting } from '@/types/careers';
import { useAdvancedCache } from './useAdvancedCache';
import { useAdvancedAnalytics } from './useAdvancedAnalytics';

export type RecommendationItem = BlogPost | JobPosting;

interface UserPreferences {
  interests: string[];
  experience: string[];
  location?: string;
  industry?: string[];
  readingTime?: 'short' | 'medium' | 'long';
  jobType?: 'full-time' | 'part-time' | 'contract' | 'internship';
}

interface RecommendationScore {
  item: RecommendationItem;
  score: number;
  reasons: string[];
  confidence: number;
}

interface RecommendationContext {
  userBehavior: {
    viewedItems: string[];
    favoriteItems: string[];
    searchHistory: string[];
    timeSpent: Record<string, number>;
    interactions: Record<string, number>;
  };
  sessionData: {
    currentItem?: string;
    categoryPreference: Record<string, number>;
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    device: 'mobile' | 'tablet' | 'desktop';
  };
}

export function useSmartRecommendations(
  type: 'blog' | 'careers',
  currentItem?: RecommendationItem,
  preferences?: UserPreferences
) {
  const [recommendations, setRecommendations] = useState<RecommendationScore[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<RecommendationContext | null>(null);

  const cache = useAdvancedCache();
  const analytics = useAdvancedAnalytics(type === 'blog' ? 'blog' : 'careers');

  // Initialize recommendation context
  useEffect(() => {
    const userBehavior = getUserBehaviorFromStorage();
    const sessionData = getCurrentSessionData();
    
    setContext({
      userBehavior,
      sessionData
    });
  }, []);

  // Get user behavior from localStorage
  const getUserBehaviorFromStorage = useCallback((): RecommendationContext['userBehavior'] => {
    const defaultBehavior = {
      viewedItems: [],
      favoriteItems: [],
      searchHistory: [],
      timeSpent: {},
      interactions: {}
    };

    try {
      const stored = localStorage.getItem(`${type}_user_behavior`);
      return stored ? { ...defaultBehavior, ...JSON.parse(stored) } : defaultBehavior;
    } catch {
      return defaultBehavior;
    }
  }, [type]);

  // Get current session data
  const getCurrentSessionData = useCallback((): RecommendationContext['sessionData'] => {
    const hour = new Date().getHours();
    const timeOfDay = 
      hour < 12 ? 'morning' : 
      hour < 17 ? 'afternoon' : 
      hour < 21 ? 'evening' : 'night';

    const device = 
      window.innerWidth < 768 ? 'mobile' :
      window.innerWidth < 1024 ? 'tablet' : 'desktop';

    return {
      currentItem: currentItem?.id,
      categoryPreference: {},
      timeOfDay,
      device
    };
  }, [currentItem]);

  // Content-based filtering
  const getContentBasedScore = useCallback((
    item: RecommendationItem, 
    target: RecommendationItem
  ): number => {
    let score = 0;
    
    // Category similarity
    if (type === 'blog') {
      const blogItem = item as BlogPost;
      const targetBlog = target as BlogPost;
      if (blogItem.category === targetBlog.category) score += 0.3;
      
      // Tags overlap
      const commonTags = blogItem.tags.filter(tag => 
        targetBlog.tags.includes(tag)
      ).length;
      score += (commonTags / Math.max(blogItem.tags.length, targetBlog.tags.length)) * 0.2;
    } else {
      const jobItem = item as JobPosting;
      const targetJob = target as JobPosting;
      if (jobItem.department === targetJob.department) score += 0.3;
      if (jobItem.level === targetJob.level) score += 0.2;
      
      // Skills overlap
      const commonSkills = jobItem.requirements.filter(req => 
        targetJob.requirements.includes(req)
      ).length;
      score += (commonSkills / Math.max(jobItem.requirements.length, targetJob.requirements.length)) * 0.2;
    }

    return Math.min(score, 1);
  }, [type]);

  // Collaborative filtering based on user behavior
  const getCollaborativeScore = useCallback((
    item: RecommendationItem,
    userBehavior: RecommendationContext['userBehavior']
  ): number => {
    let score = 0;
    
    // Recently viewed items influence
    if (userBehavior.viewedItems.includes(item.id)) {
      score += 0.1; // Small boost for previously viewed
    }
    
    // Favorite items boost related content
    if (userBehavior.favoriteItems.includes(item.id)) {
      score += 0.4;
    }
    
    // Time spent indicates interest
    const timeSpent = userBehavior.timeSpent[item.id] || 0;
    if (timeSpent > 120000) { // 2+ minutes
      score += 0.2;
    } else if (timeSpent > 60000) { // 1+ minute
      score += 0.1;
    }
    
    // Interaction count
    const interactions = userBehavior.interactions[item.id] || 0;
    score += Math.min(interactions * 0.05, 0.15);
    
    return Math.min(score, 1);
  }, []);

  // Context-based scoring
  const getContextualScore = useCallback((
    item: RecommendationItem,
    sessionData: RecommendationContext['sessionData']
  ): number => {
    let score = 0;
    
    if (type === 'blog') {
      const blogItem = item as BlogPost;
      
      // Reading time preferences based on time of day
      const readingMinutes = blogItem.readingTime;
      if (sessionData.timeOfDay === 'morning' && readingMinutes <= 3) score += 0.1;
      if (sessionData.timeOfDay === 'afternoon' && readingMinutes <= 7) score += 0.1;
      if (sessionData.timeOfDay === 'evening' && readingMinutes >= 5) score += 0.1;
      
      // Device optimization
      if (sessionData.device === 'mobile' && readingMinutes <= 5) score += 0.05;
      
    } else {
      const jobItem = item as JobPosting;
      
      // Job type preferences
      if (sessionData.timeOfDay === 'evening' && jobItem.type === 'remote') score += 0.1;
      if (sessionData.device === 'mobile' && jobItem.location.includes('Lima')) score += 0.05;
    }
    
    return Math.min(score, 1);
  }, [type]);

  // Preference-based scoring
  const getPreferenceScore = useCallback((
    item: RecommendationItem,
    userPreferences: UserPreferences
  ): number => {
    let score = 0;
    
    if (type === 'blog') {
      const blogItem = item as BlogPost;
      
      // Interest alignment
      const matchedInterests = userPreferences.interests.filter(interest =>
        blogItem.tags.some(tag => tag.toLowerCase().includes(interest.toLowerCase())) ||
        blogItem.category.toLowerCase().includes(interest.toLowerCase())
      ).length;
      score += (matchedInterests / userPreferences.interests.length) * 0.3;
      
      // Reading time preference
      const readingMinutes = blogItem.readingTime;
      if (userPreferences.readingTime === 'short' && readingMinutes <= 3) score += 0.2;
      if (userPreferences.readingTime === 'medium' && readingMinutes >= 3 && readingMinutes <= 7) score += 0.2;
      if (userPreferences.readingTime === 'long' && readingMinutes > 7) score += 0.2;
      
    } else {
      const jobItem = item as JobPosting;
      
      // Experience level match
      if (userPreferences.experience.includes(jobItem.level)) score += 0.3;
      
      // Location preference
      if (userPreferences.location && jobItem.location.includes(userPreferences.location)) {
        score += 0.2;
      }
      
      // Job type preference
      if (userPreferences.jobType === jobItem.type) score += 0.2;
      
      // Industry alignment
      if (userPreferences.industry?.some(ind => 
        jobItem.department.toLowerCase().includes(ind.toLowerCase())
      )) {
        score += 0.2;
      }
    }
    
    return Math.min(score, 1);
  }, [type]);

  // Generate recommendations
  const generateRecommendations = useCallback(async (
    items: RecommendationItem[],
    limit = 6
  ) => {
    if (!context) return;
    
    setIsLoading(true);
    
    try {
      const scores: RecommendationScore[] = [];
      
      for (const item of items) {
        // Skip current item
        if (currentItem && item.id === currentItem.id) continue;
        
        let totalScore = 0;
        const reasons: string[] = [];
        
        // Content-based filtering
        if (currentItem) {
          const contentScore = getContentBasedScore(item, currentItem);
          totalScore += contentScore * 0.4; // 40% weight
          if (contentScore > 0.2) {
            reasons.push(type === 'blog' ? 'Contenido relacionado' : 'Posición similar');
          }
        }
        
        // Collaborative filtering
        const collaborativeScore = getCollaborativeScore(item, context.userBehavior);
        totalScore += collaborativeScore * 0.3; // 30% weight
        if (collaborativeScore > 0.1) {
          reasons.push('Basado en tu historial');
        }
        
        // Contextual scoring
        const contextualScore = getContextualScore(item, context.sessionData);
        totalScore += contextualScore * 0.15; // 15% weight
        if (contextualScore > 0.05) {
          reasons.push('Recomendado para este momento');
        }
        
        // Preference-based scoring
        if (preferences) {
          const preferenceScore = getPreferenceScore(item, preferences);
          totalScore += preferenceScore * 0.15; // 15% weight
          if (preferenceScore > 0.1) {
            reasons.push('Match con tus intereses');
          }
        }
        
        // Add randomness to prevent filter bubbles
        const randomBoost = Math.random() * 0.1;
        totalScore += randomBoost;
        
        // Calculate confidence based on number of signals
        const confidence = Math.min(
          (reasons.length / 3) * 0.7 + 
          (context.userBehavior.viewedItems.length / 10) * 0.3,
          1
        );
        
        scores.push({
          item,
          score: totalScore,
          reasons: reasons.length > 0 ? reasons : ['Contenido destacado'],
          confidence
        });
      }
      
      // Sort by score and limit results
      const topRecommendations = scores
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
      
      setRecommendations(topRecommendations);
      
      // Track recommendation generation
      analytics.trackEvent('recommendations_generated', {
        type,
        count: topRecommendations.length,
        averageScore: topRecommendations.reduce((acc, r) => acc + r.score, 0) / topRecommendations.length,
        averageConfidence: topRecommendations.reduce((acc, r) => acc + r.confidence, 0) / topRecommendations.length
      });
      
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [context, currentItem, preferences, type, getContentBasedScore, getCollaborativeScore, getContextualScore, getPreferenceScore, analytics]);

  // Track recommendation interaction
  const trackRecommendationClick = useCallback((recommendation: RecommendationScore, position: number) => {
    analytics.trackEvent('recommendation_clicked', {
      itemId: recommendation.item.id,
      score: recommendation.score,
      confidence: recommendation.confidence,
      position,
      reasons: recommendation.reasons
    });
    
    // Update user behavior
    const updatedBehavior = {
      ...context?.userBehavior,
      viewedItems: [...(context?.userBehavior.viewedItems || []), recommendation.item.id].slice(-50), // Keep last 50
      interactions: {
        ...context?.userBehavior.interactions,
        [recommendation.item.id]: (context?.userBehavior.interactions?.[recommendation.item.id] || 0) + 1
      }
    };
    
    localStorage.setItem(`${type}_user_behavior`, JSON.stringify(updatedBehavior));
  }, [analytics, context, type]);

  // Update user preferences
  const updateUserPreferences = useCallback((newPreferences: Partial<UserPreferences>) => {
    const updated = { ...preferences, ...newPreferences };
    localStorage.setItem(`${type}_preferences`, JSON.stringify(updated));
    
    analytics.trackEvent('preferences_updated', {
      type,
      updatedFields: Object.keys(newPreferences)
    });
  }, [preferences, type, analytics]);

  // Get trending items (most engaged with recently)
  const getTrendingItems = useCallback((items: RecommendationItem[], limit = 5) => {
    const trendingScores = items.map(item => {
      const views = context?.userBehavior.viewedItems.filter(id => id === item.id).length || 0;
      const interactions = context?.userBehavior.interactions[item.id] || 0;
      const timeSpent = context?.userBehavior.timeSpent[item.id] || 0;
      
      // Simple trending algorithm based on recent engagement
      const trendingScore = (views * 0.3) + (interactions * 0.4) + (timeSpent / 60000 * 0.3);
      
      return {
        item,
        score: trendingScore,
        reasons: ['Trending ahora'],
        confidence: Math.min(trendingScore / 10, 1)
      };
    });
    
    return trendingScores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }, [context]);

  return {
    recommendations,
    isLoading,
    generateRecommendations,
    trackRecommendationClick,
    updateUserPreferences,
    getTrendingItems,
    context
  };
}

// Hook for personalized content discovery
export function usePersonalizedDiscovery(type: 'blog' | 'careers') {
  const [discoveryItems, setDiscoveryItems] = useState<RecommendationScore[]>([]);
  const analytics = useAdvancedAnalytics(type === 'blog' ? 'blog' : 'careers');
  
  const generatePersonalizedFeed = useCallback((
    items: RecommendationItem[],
    preferences?: UserPreferences
  ) => {
    // Mix of recommendations, trending, and fresh content
    const recommendations = useSmartRecommendations(type, undefined, preferences);
    
    // Simple personalized feed algorithm
    const feed = items.map(item => ({
      item,
      score: Math.random(), // Simplified for demo
      reasons: ['Recomendado para ti'],
      confidence: 0.7
    }));
    
    setDiscoveryItems(feed.slice(0, 12));
    
    analytics.trackEvent('personalized_feed_generated', {
      type,
      itemCount: feed.length
    });
  }, [type, analytics]);
  
  return {
    discoveryItems,
    generatePersonalizedFeed
  };
}