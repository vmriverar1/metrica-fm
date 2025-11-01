/**
 * useMediaLibrary Hook
 * Manages main library data fetching and state
 */

import { useState, useCallback } from 'react';
import apiClient from '@/lib/api-client';
import type { ImageInfo, UseMediaLibraryReturn } from '../types';

export function useMediaLibrary(): UseMediaLibraryReturn {
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [directories, setDirectories] = useState<string[]>([]);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get('/api/admin/media/images');

      if (response.success && response.data?.images) {
        const fetchedImages = response.data.images.map((img: any) => ({
          ...img,
          lastModified: typeof img.lastModified === 'string'
            ? img.lastModified
            : new Date(img.lastModified).toISOString(),
        }));

        // Sort by most recent first
        const sortedImages = fetchedImages.sort((a: ImageInfo, b: ImageInfo) => {
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
        });

        setImages(sortedImages);

        // Extract unique directories
        const dirs = new Set<string>();
        sortedImages.forEach((img: ImageInfo) => {
          if (img.folder) {
            dirs.add(img.folder);
          }
        });
        setDirectories(Array.from(dirs).sort());

        console.log(`[UnifiedMediaLibrary] Loaded ${sortedImages.length} images from API`);
      } else {
        console.warn('[UnifiedMediaLibrary] No images found in API response');
        setImages([]);
        setDirectories([]);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error fetching images');
      console.error('[UnifiedMediaLibrary] Error fetching images:', error);
      setError(error);
      setImages([]);
      setDirectories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshLibrary = useCallback(async () => {
    console.log('[UnifiedMediaLibrary] Refreshing library...');
    await fetchImages();
  }, [fetchImages]);

  return {
    images,
    loading,
    error,
    fetchImages,
    refreshLibrary,
    directories,
  };
}
