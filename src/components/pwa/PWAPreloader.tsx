'use client';

import { useEffect } from 'react';
import { PWAJsonReader } from '@/lib/pwa-json-reader';
import { pwaOptimizer } from '@/lib/pwa-performance-optimizer';
import { pwaUsageOptimizer } from '@/lib/pwa-usage-optimizer';
import { pwaAnalytics } from '@/lib/pwa-analytics';

interface PWAPreloaderProps {
  criticalPaths?: string[];
  preloadDelay?: number; // Delay in ms to avoid blocking initial render
}

const DEFAULT_CRITICAL_PATHS = [
  '/api/admin/pages/home',
  '/api/admin/pages/portfolio',
  '/api/admin/megamenu'
];

export default function PWAPreloader({ 
  criticalPaths = DEFAULT_CRITICAL_PATHS,
  preloadDelay = 1000 
}: PWAPreloaderProps) {
  
  useEffect(() => {
    const initializePerformanceSystems = async () => {
      // Only run in browser
      if (typeof window === 'undefined') return;
      
      // Wait for initial render to complete
      await new Promise(resolve => setTimeout(resolve, preloadDelay));
      
      try {
        console.log('[PWAPreloader] Initializing performance optimization systems...');

        // Initialize intelligent preloading with error handling
        try {
          await pwaOptimizer.smartPreload();
        } catch (error) {
          console.warn('[PWAPreloader] Smart preload failed, continuing...', error);
        }

        // Set up lazy loading for interactive elements
        try {
          pwaOptimizer.setupIntelligentLazyLoading();
        } catch (error) {
          console.warn('[PWAPreloader] Lazy loading setup failed, continuing...', error);
        }

        // Track the preload completion
        try {
          pwaAnalytics.trackPWAEvent('preloader_initialized');
        } catch (error) {
          console.warn('[PWAPreloader] Analytics tracking failed, continuing...', error);
        }

        // Apply usage-based optimizations
        try {
          pwaUsageOptimizer.applyOptimizations();
        } catch (error) {
          console.warn('[PWAPreloader] Usage optimizations failed, continuing...', error);
        }

        console.log('[PWAPreloader] Performance systems initialized (with fallbacks)');

        // Broadcast completion with enhanced data
        try {
          const channel = new BroadcastChannel('metrica-json-updates');
          channel.postMessage({
            type: 'PRELOAD_COMPLETED',
            timestamp: Date.now(),
            paths: criticalPaths,
            performanceMode: 'safe'
          });
          channel.close();
        } catch (error) {
          console.warn('[PWAPreloader] Broadcast failed, continuing...', error);
        }

      } catch (error) {
        console.error('[PWAPreloader] Error during performance initialization:', error);

        // Fallback to basic preloading
        await basicPreload(criticalPaths);
      }
    };

    const basicPreload = async (paths: string[]) => {
      console.log('[PWAPreloader] Falling back to basic preload...');

      const BATCH_SIZE = 3;
      const batches: string[][] = [];

      for (let i = 0; i < paths.length; i += BATCH_SIZE) {
        batches.push(paths.slice(i, i + BATCH_SIZE));
      }

      for (const batch of batches) {
        const promises = batch.map(async (path: string) => {
          try {
            // Use regular fetch for API endpoints instead of PWAJsonReader
            const response = await fetch(path, {
              cache: 'no-cache',
              headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
              await response.json(); // Consume the response to complete the preload
              console.log(`[PWAPreloader] ✓ Preloaded ${path}`);
            } else {
              console.warn(`[PWAPreloader] ✗ HTTP ${response.status} for ${path}`);
            }
            return path;
          } catch (error) {
            console.warn(`[PWAPreloader] ✗ Failed to preload ${path}:`, error);
            return null;
          }
        });

        await Promise.all(promises);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    };

    initializePerformanceSystems();
  }, [criticalPaths, preloadDelay]);

  // This component doesn't render anything
  return null;
}

// Hook version for use in other components
export function usePWAPreloader(criticalPaths?: string[], preloadDelay?: number) {
  useEffect(() => {
    // Use the PWAPreloader functionality directly
    PWAPreloader({ criticalPaths, preloadDelay });
  }, [criticalPaths, preloadDelay]);
}