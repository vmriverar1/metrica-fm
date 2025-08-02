'use client';

import { useState, useEffect, useCallback } from 'react';
import { Project } from '@/types/portfolio';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface ProjectCache {
  projects: CacheEntry<Project[]> | null;
  projectDetails: { [key: string]: CacheEntry<Project> };
}

const CACHE_TTL = 1000 * 60 * 30; // 30 minutes
const CACHE_KEY = 'portfolio_cache';

export function useProjectCache() {
  const [cache, setCache] = useState<ProjectCache>({
    projects: null,
    projectDetails: {}
  });

  // Load cache from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsedCache = JSON.parse(cached);
        
        // Clean expired entries
        const now = Date.now();
        const cleanedCache: ProjectCache = {
          projects: parsedCache.projects && 
            parsedCache.projects.timestamp + parsedCache.projects.ttl > now 
            ? parsedCache.projects 
            : null,
          projectDetails: Object.fromEntries(
            Object.entries(parsedCache.projectDetails || {}).filter(
              ([_, entry]: [string, any]) => entry.timestamp + entry.ttl > now
            )
          )
        };
        
        setCache(cleanedCache);
      }
    } catch (error) {
      console.error('Error loading cache:', error);
    }
  }, []);

  // Save cache to localStorage
  const saveCache = useCallback((newCache: ProjectCache) => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(newCache));
      setCache(newCache);
    } catch (error) {
      console.error('Error saving cache:', error);
    }
  }, []);

  // Cache projects list
  const cacheProjects = useCallback((projects: Project[]) => {
    const newCache: ProjectCache = {
      ...cache,
      projects: {
        data: projects,
        timestamp: Date.now(),
        ttl: CACHE_TTL
      }
    };
    saveCache(newCache);
  }, [cache, saveCache]);

  // Cache individual project
  const cacheProject = useCallback((project: Project) => {
    const newCache: ProjectCache = {
      ...cache,
      projectDetails: {
        ...cache.projectDetails,
        [project.id]: {
          data: project,
          timestamp: Date.now(),
          ttl: CACHE_TTL
        }
      }
    };
    saveCache(newCache);
  }, [cache, saveCache]);

  // Get cached projects
  const getCachedProjects = useCallback((): Project[] | null => {
    const now = Date.now();
    if (cache.projects && cache.projects.timestamp + cache.projects.ttl > now) {
      return cache.projects.data;
    }
    return null;
  }, [cache.projects]);

  // Get cached project by ID
  const getCachedProject = useCallback((id: string): Project | null => {
    const now = Date.now();
    const cached = cache.projectDetails[id];
    if (cached && cached.timestamp + cached.ttl > now) {
      return cached.data;
    }
    return null;
  }, [cache.projectDetails]);

  // Preload project images
  const preloadImages = useCallback((projects: Project[]) => {
    if (typeof window === 'undefined') return;

    projects.forEach(project => {
      // Preload featured image
      const img = new window.Image();
      img.src = project.featuredImage;
      
      // Preload first few gallery images
      project.gallery?.slice(0, 3).forEach(galleryImg => {
        const galleryImage = new window.Image();
        galleryImage.src = galleryImg.thumbnail || galleryImg.url;
      });
    });
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(CACHE_KEY);
    setCache({
      projects: null,
      projectDetails: {}
    });
  }, []);

  // Get cache stats
  const getCacheStats = useCallback(() => {
    const now = Date.now();
    const projectsValid = cache.projects && cache.projects.timestamp + cache.projects.ttl > now;
    const validProjectDetails = Object.values(cache.projectDetails).filter(
      entry => entry.timestamp + entry.ttl > now
    ).length;

    return {
      hasValidProjects: !!projectsValid,
      cachedProjectsCount: projectsValid ? cache.projects!.data.length : 0,
      cachedProjectDetailsCount: validProjectDetails,
      totalCacheSize: JSON.stringify(cache).length
    };
  }, [cache]);

  return {
    cacheProjects,
    cacheProject,
    getCachedProjects,
    getCachedProject,
    preloadImages,
    clearCache,
    getCacheStats
  };
}