/**
 * Image optimization utilities for Métrica FM
 * Provides responsive images, lazy loading, and performance optimization
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';

// Image optimization configuration
export const IMAGE_OPTIMIZATION = {
  // Quality settings for different contexts
  quality: {
    thumbnail: 60,
    small: 70,
    medium: 80,
    large: 85,
    hero: 90,
  },
  
  // Responsive breakpoints
  breakpoints: {
    xs: 320,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
  
  // Common aspect ratios
  aspectRatios: {
    square: '1:1',
    portrait: '3:4',
    landscape: '4:3',
    wide: '16:9',
    ultrawide: '21:9',
  },
  
  // Blur data URLs for different aspect ratios
  blurDataUrls: {
    square: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==',
    landscape: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAGAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==',
  }
};

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): [React.RefObject<HTMLElement>, boolean] {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [options]);

  return [ref, isIntersecting];
}

// Progressive image loading hook
export function useProgressiveImage(src: string, placeholder?: string) {
  const [currentSrc, setCurrentSrc] = useState(placeholder || '');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!src) return;

    const img = new window.Image();
    
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoading(false);
      setHasError(false);
    };
    
    img.onerror = () => {
      setIsLoading(false);
      setHasError(true);
    };
    
    img.src = src;
  }, [src]);

  return { currentSrc, isLoading, hasError };
}

// Generate responsive image sizes
export function generateSizes(breakpoints: Record<string, string>): string {
  const entries = Object.entries(breakpoints);
  
  return entries
    .map(([breakpoint, size], index) => {
      if (index === entries.length - 1) {
        return size; // Default size without media query
      }
      return `(max-width: ${IMAGE_OPTIMIZATION.breakpoints[breakpoint as keyof typeof IMAGE_OPTIMIZATION.breakpoints]}px) ${size}`;
    })
    .join(', ');
}

// Generate srcSet for responsive images
export function generateSrcSet(
  baseSrc: string, 
  widths: number[] = [320, 640, 768, 1024, 1280, 1536]
): string {
  return widths
    .map(width => {
      const params = new URLSearchParams({
        w: width.toString(),
        q: '75'
      });
      return `${baseSrc}?${params} ${width}w`;
    })
    .join(', ');
}

// Optimized Image component with lazy loading
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  aspectRatio?: keyof typeof IMAGE_OPTIMIZATION.aspectRatios;
  quality?: keyof typeof IMAGE_OPTIMIZATION.quality;
  priority?: boolean;
  lazy?: boolean;
  className?: string;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  aspectRatio,
  quality = 'medium',
  priority = false,
  lazy = true,
  className = '',
  sizes,
  onLoad,
  onError,
  fallbackSrc,
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [ref, isVisible] = useIntersectionObserver();

  const shouldLoad = priority || !lazy || isVisible;
  
  const qualityValue = IMAGE_OPTIMIZATION.quality[quality];
  const blurDataURL = aspectRatio ? 
    IMAGE_OPTIMIZATION.blurDataUrls[aspectRatio] || 
    IMAGE_OPTIMIZATION.blurDataUrls.landscape : 
    IMAGE_OPTIMIZATION.blurDataUrls.landscape;

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  // Use fallback if main image fails
  const imageSrc = hasError && fallbackSrc ? fallbackSrc : src;

  return (
    <div 
      ref={ref as React.RefObject<HTMLDivElement>} 
      className={`relative overflow-hidden ${className}`}
      style={{
        aspectRatio: aspectRatio ? IMAGE_OPTIMIZATION.aspectRatios[aspectRatio] : undefined
      }}
    >
      {shouldLoad ? (
        <Image
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          quality={qualityValue}
          priority={priority}
          sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
          placeholder="blur"
          blurDataURL={blurDataURL}
          className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${width && height ? '' : 'object-cover w-full h-full'}`}
          onLoad={handleLoad}
          onError={handleError}
        />
      ) : (
        <div 
          className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"
          aria-label={`${alt} (cargando)`}
        />
      )}
    </div>
  );
}

// Image gallery with lazy loading and progressive enhancement
interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
    width?: number;
    height?: number;
  }>;
  columns?: number;
  gap?: string;
  aspectRatio?: keyof typeof IMAGE_OPTIMIZATION.aspectRatios;
  quality?: keyof typeof IMAGE_OPTIMIZATION.quality;
}

export function ImageGallery({ 
  images, 
  columns = 3, 
  gap = '1rem',
  aspectRatio = 'landscape',
  quality = 'medium'
}: ImageGalleryProps) {
  return (
    <div 
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap
      }}
    >
      {images.map((image, index) => (
        <figure key={index} className="group cursor-pointer">
          <OptimizedImage
            src={image.src}
            alt={image.alt}
            aspectRatio={aspectRatio}
            quality={quality}
            lazy={index > 6} // Load first 6 images immediately
            className="transition-transform duration-300 group-hover:scale-105"
          />
          {image.caption && (
            <figcaption className="mt-2 text-sm text-muted-foreground text-center">
              {image.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}

// Image carousel with touch support
interface ImageCarouselProps {
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
  aspectRatio?: keyof typeof IMAGE_OPTIMIZATION.aspectRatios;
  autoPlay?: boolean;
  interval?: number;
}

export function ImageCarousel({ 
  images, 
  aspectRatio = 'wide',
  autoPlay = false,
  interval = 5000
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, interval, images.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(false);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!images.length) return null;

  return (
    <div className="relative group">
      {/* Main image */}
      <OptimizedImage
        src={images[currentIndex].src}
        alt={images[currentIndex].alt}
        aspectRatio={aspectRatio}
        quality="large"
        priority={currentIndex === 0}
        className="w-full"
      />

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Imagen anterior"
          >
            ←
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Siguiente imagen"
          >
            →
          </button>
        </>
      )}

      {/* Dots indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Caption */}
      {images[currentIndex].caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <p className="text-white text-sm">{images[currentIndex].caption}</p>
        </div>
      )}
    </div>
  );
}

// Performance monitoring for images
export function useImagePerformance() {
  const [metrics, setMetrics] = useState({
    totalImages: 0,
    loadedImages: 0,
    failedImages: 0,
    averageLoadTime: 0,
  });

  const trackImageLoad = useCallback((loadTime: number) => {
    setMetrics(prev => ({
      ...prev,
      totalImages: prev.totalImages + 1,
      loadedImages: prev.loadedImages + 1,
      averageLoadTime: ((prev.averageLoadTime * prev.loadedImages) + loadTime) / (prev.loadedImages + 1)
    }));
  }, []);

  const trackImageError = useCallback(() => {
    setMetrics(prev => ({
      ...prev,
      totalImages: prev.totalImages + 1,
      failedImages: prev.failedImages + 1
    }));
  }, []);

  return {
    metrics,
    trackImageLoad,
    trackImageError
  };
}

export default {
  IMAGE_OPTIMIZATION,
  useIntersectionObserver,
  useProgressiveImage,
  generateSizes,
  generateSrcSet,
  OptimizedImage,
  ImageGallery,
  ImageCarousel,
  useImagePerformance,
};