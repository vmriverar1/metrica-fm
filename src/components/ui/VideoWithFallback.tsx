'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

// Utility function to get proxied video URL (moved from hero-transform)
const getProxiedVideoUrl = (url: string): string => {
  if (!url) return url;
  
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Don't proxy YouTube/Vimeo (they use embeds)
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be') || hostname.includes('vimeo.com')) {
      return url;
    }
    
    // Don't proxy local URLs
    if (hostname === 'localhost' || hostname === '127.0.0.1' || url.startsWith('/')) {
      return url;
    }
    
    // Use proxy for external direct video files
    if (url.match(/\.(mp4|webm|ogg|mov|avi)(\?.*)?$/i)) {
      return `/api/proxy/video?url=${encodeURIComponent(url)}`;
    }
    
    return url;
  } catch {
    return url;
  }
};

interface VideoWithFallbackProps {
  primaryVideoUrl?: string;
  fallbackVideoUrl?: string;
  fallbackImageUrl?: string;
  alt?: string;
  className?: string;
  priority?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  onVideoError?: () => void;
  onVideoLoad?: () => void;
  showLoadingState?: boolean;
}

export default function VideoWithFallback({
  primaryVideoUrl,
  fallbackVideoUrl,
  fallbackImageUrl,
  alt = 'Background media',
  className = 'w-full h-full object-cover',
  priority = false,
  autoPlay = true,
  loop = true,
  muted = true,
  playsInline = true,
  onVideoError,
  onVideoLoad,
  showLoadingState = true
}: VideoWithFallbackProps) {
  const [hasVideoError, setHasVideoError] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [showFallback, setShowFallback] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Reset states when URLs change
  useEffect(() => {
    setHasVideoError(false);
    setIsVideoLoading(true);
    setShowFallback(false);
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // If no video URLs provided, show fallback immediately
    if (!primaryVideoUrl && !fallbackVideoUrl) {
      setShowFallback(true);
      setIsVideoLoading(false);
      return;
    }

    // Set timeout for video loading (3 seconds)
    timeoutRef.current = setTimeout(() => {
      if (isVideoLoading && !hasVideoError) {
        console.warn('Video loading timeout, switching to fallback');
        setShowFallback(true);
        setIsVideoLoading(false);
      }
    }, 3000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [primaryVideoUrl, fallbackVideoUrl]);

  const handleVideoError = () => {
    console.warn('Video failed to load, switching to fallback');
    setHasVideoError(true);
    setShowFallback(true);
    setIsVideoLoading(false);
    onVideoError?.();
  };

  const handleVideoLoad = () => {
    setIsVideoLoading(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onVideoLoad?.();
  };

  const handleVideoCanPlay = () => {
    setIsVideoLoading(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  // Show fallback if no videos or error occurred or timeout
  const shouldShowFallback = !primaryVideoUrl && !fallbackVideoUrl || hasVideoError || showFallback;

  // Show loading state
  const shouldShowLoading = showLoadingState && isVideoLoading && !shouldShowFallback;

  return (
    <div className="relative w-full h-full">
      {/* Loading State */}
      {shouldShowLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-accent/90 flex items-center justify-center z-10">
          <div className="text-white text-center">
            <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm">Cargando contenido...</p>
          </div>
        </div>
      )}

      {/* Video Element */}
      {(primaryVideoUrl || fallbackVideoUrl) && !shouldShowFallback && (
        <video
          ref={videoRef}
          className={className}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline={playsInline}
          onError={handleVideoError}
          onLoadedData={handleVideoLoad}
          onCanPlay={handleVideoCanPlay}
          style={{
            opacity: isVideoLoading ? 0 : 1,
            transition: 'opacity 0.3s ease-in-out'
          }}
        >
          {primaryVideoUrl && (
            <source 
              src={getProxiedVideoUrl(primaryVideoUrl)} 
              type="video/mp4" 
            />
          )}
          {fallbackVideoUrl && (
            <source 
              src={getProxiedVideoUrl(fallbackVideoUrl)} 
              type="video/mp4" 
            />
          )}
          Su navegador no soporta el elemento de video.
        </video>
      )}

      {/* Fallback Image or Gradient */}
      {shouldShowFallback && (
        <div className="absolute inset-0">
          {fallbackImageUrl ? (
            <Image
              src={fallbackImageUrl}
              alt={alt}
              fill
              className="object-cover"
              priority={priority}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/90 to-accent/90" />
          )}
        </div>
      )}
    </div>
  );
}

// Export utility function for use in other components
export { getProxiedVideoUrl };