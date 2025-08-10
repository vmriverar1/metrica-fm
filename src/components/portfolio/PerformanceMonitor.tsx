'use client';

import React, { useEffect, useState } from 'react';
import { useProjectCache } from '@/hooks/useProjectCache';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  imageLoadCount: number;
  cacheHitRate: number;
  memoryUsage?: number;
  networkRequests: number;
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  showStats?: boolean;
}

export default function PerformanceMonitor({ 
  enabled = process.env.NODE_ENV === 'development',
  showStats = false 
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    imageLoadCount: 0,
    cacheHitRate: 0,
    networkRequests: 0
  });
  const [isVisible, setIsVisible] = useState(false);
  const { getCacheStats } = useProjectCache();

  useEffect(() => {
    if (!enabled) return;

    let imageLoadCount = 0;
    let networkRequests = 0;
    const startTime = performance.now();

    // Monitor image loading
    const imageObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name.includes('image') || entry.name.includes('.jpg') || entry.name.includes('.png')) {
          imageLoadCount++;
        }
      });
      setMetrics(prev => ({ ...prev, imageLoadCount }));
    });

    // Monitor network requests
    const networkObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      networkRequests += entries.length;
      setMetrics(prev => ({ ...prev, networkRequests }));
    });

    // Monitor navigation timing
    const navigationObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (entry.entryType === 'navigation') {
          const loadTime = entry.loadEventEnd - entry.navigationStart;
          const renderTime = entry.domContentLoadedEventEnd - entry.navigationStart;
          setMetrics(prev => ({ ...prev, loadTime, renderTime }));
        }
      });
    });

    // Register observers
    try {
      imageObserver.observe({ entryTypes: ['resource'] });
      networkObserver.observe({ entryTypes: ['resource'] });
      navigationObserver.observe({ entryTypes: ['navigation'] });
    } catch (error) {
      console.warn('PerformanceObserver not supported:', error);
    }

    // Monitor memory usage (if available)
    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMetrics(prev => ({ 
          ...prev, 
          memoryUsage: memory.usedJSHeapSize / 1024 / 1024 // MB
        }));
      }
    };

    const memoryInterval = setInterval(updateMemoryUsage, 5000);

    // Calculate cache hit rate
    const updateCacheStats = () => {
      const cacheStats = getCacheStats();
      const cacheHitRate = cacheStats.cachedProjectsCount > 0 
        ? (cacheStats.cachedProjectDetailsCount / cacheStats.cachedProjectsCount) * 100 
        : 0;
      setMetrics(prev => ({ ...prev, cacheHitRate }));
    };

    const cacheInterval = setInterval(updateCacheStats, 3000);

    // Keyboard shortcut to toggle stats
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      imageObserver.disconnect();
      networkObserver.disconnect();
      navigationObserver.disconnect();
      clearInterval(memoryInterval);
      clearInterval(cacheInterval);
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [enabled, getCacheStats]);

  // Auto-optimize based on metrics
  useEffect(() => {
    if (!enabled) return;

    // Warn if load time is too high
    if (metrics.loadTime > 3000) {
      console.warn('⚠️ High load time detected:', metrics.loadTime + 'ms');
    }

    // Warn if too many network requests
    if (metrics.networkRequests > 50) {
      console.warn('⚠️ High number of network requests:', metrics.networkRequests);
    }

    // Suggest optimizations
    if (metrics.imageLoadCount > 20 && metrics.cacheHitRate < 50) {
      console.info('💡 Consider implementing more aggressive image caching');
    }
  }, [metrics, enabled]);

  if (!enabled || (!isVisible && !showStats)) return null;

  const formatTime = (ms: number) => `${ms.toFixed(0)}ms`;
  const formatMemory = (mb: number) => `${mb.toFixed(1)}MB`;
  const formatPercent = (percent: number) => `${percent.toFixed(1)}%`;

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black/90 text-white p-4 rounded-lg font-mono text-xs max-w-xs">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-accent">Performance</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white/60 hover:text-white text-lg leading-none"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Load Time:</span>
          <span className={metrics.loadTime > 3000 ? 'text-red-400' : 'text-green-400'}>
            {formatTime(metrics.loadTime)}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Render Time:</span>
          <span className={metrics.renderTime > 2000 ? 'text-orange-400' : 'text-green-400'}>
            {formatTime(metrics.renderTime)}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Images:</span>
          <span className={metrics.imageLoadCount > 20 ? 'text-orange-400' : 'text-white'}>
            {metrics.imageLoadCount}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Network:</span>
          <span className={metrics.networkRequests > 50 ? 'text-red-400' : 'text-white'}>
            {metrics.networkRequests}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Cache Hit:</span>
          <span className={metrics.cacheHitRate > 70 ? 'text-green-400' : 'text-orange-400'}>
            {formatPercent(metrics.cacheHitRate)}
          </span>
        </div>
        
        {metrics.memoryUsage && (
          <div className="flex justify-between">
            <span>Memory:</span>
            <span className={metrics.memoryUsage > 100 ? 'text-orange-400' : 'text-white'}>
              {formatMemory(metrics.memoryUsage)}
            </span>
          </div>
        )}
      </div>
      
      <div className="mt-2 pt-2 border-t border-white/20 text-white/60 text-xs">
        Ctrl+Shift+P to toggle
      </div>
    </div>
  );
}

// Hook to get performance recommendations
export function usePerformanceRecommendations() {
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    const analyzePerformance = () => {
      const recs: string[] = [];
      
      // Check connection type
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
          recs.push('Slow connection detected - consider reducing image quality');
        }
      }

      // Check device memory
      if ('deviceMemory' in navigator) {
        const memory = (navigator as any).deviceMemory;
        if (memory <= 4) {
          recs.push('Low memory device - reduce concurrent image loading');
        }
      }

      // Check if user prefers reduced motion
      if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        recs.push('User prefers reduced motion - minimize animations');
      }

      // Check if user is on a mobile device
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        recs.push('Mobile device detected - optimize for touch interactions');
      }

      setRecommendations(recs);
    };

    analyzePerformance();
  }, []);

  return recommendations;
}