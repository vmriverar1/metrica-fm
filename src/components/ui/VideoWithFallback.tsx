'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';

interface VideoWithFallbackProps {
  primary?: string;
  fallback?: string;
  alt?: string;
  className?: string;
  priority?: boolean;
}

export default function VideoWithFallback({ 
  primary, 
  fallback, 
  alt = 'Background', 
  className = '',
  priority = false 
}: VideoWithFallbackProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Si no hay video primario o hay error, mostrar fallback
  const shouldShowFallback = !primary || hasError || isLoading;

  const handleVideoError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleVideoLoad = () => {
    setIsLoading(false);
  };

  const handleVideoCanPlay = () => {
    setIsLoading(false);
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Video principal */}
      {primary && !hasError && (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onError={handleVideoError}
          onLoadStart={handleVideoLoad}
          onCanPlay={handleVideoCanPlay}
          onLoadedData={handleVideoCanPlay}
        >
          <source src={primary} type="video/mp4" />
        </video>
      )}
      
      {/* Imagen de fallback */}
      {shouldShowFallback && fallback && (
        <Image
          src={fallback}
          alt={alt}
          fill
          className={`object-cover transition-opacity duration-500 ${
            isLoading && primary ? 'opacity-100' : 'opacity-100'
          }`}
          priority={priority}
          sizes="100vw"
        />
      )}
      
      {/* Fallback de color si no hay ni video ni imagen */}
      {!primary && !fallback && (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary to-accent" />
      )}
    </div>
  );
}