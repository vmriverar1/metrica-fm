'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import VideoWithFallback from './VideoWithFallback'

export interface MediaAsset {
  type: 'image' | 'video'
  primary_url?: string
  fallback_url?: string
  alt?: string
  loading_placeholder?: string
}

interface OptimizedMediaProps {
  media: MediaAsset
  priority?: boolean
  className?: string
  sizes?: string
  fill?: boolean
  width?: number
  height?: number
}

export default function OptimizedMedia({
  media,
  priority = false,
  className = '',
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw",
  fill = true,
  width,
  height
}: OptimizedMediaProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
  }

  // Video handling
  if (media.type === 'video') {
    return (
      <VideoWithFallback
        primary={media.primary_url}
        fallback={media.fallback_url || '/img/placeholder.jpg'}
        alt={media.alt || 'Video background'}
        className={className}
        priority={priority}
      />
    )
  }

  // Image handling with optimization
  const imageSrc = hasError 
    ? (media.fallback_url || '/img/placeholder.jpg')
    : (media.primary_url || media.fallback_url || '/img/placeholder.jpg')

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
          {media.loading_placeholder && (
            <div className="text-gray-400 text-sm font-medium">
              {media.loading_placeholder}
            </div>
          )}
        </div>
      )}
      
      <Image
        src={imageSrc}
        alt={media.alt || 'Optimized media'}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        className={`object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        priority={priority}
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
        quality={85} // Balanced quality vs size
      />
    </div>
  )
}

// Utility function to create MediaAsset from legacy props
export function createMediaAsset(
  src?: string,
  fallback?: string,
  alt?: string,
  type: 'image' | 'video' = 'image'
): MediaAsset {
  return {
    type,
    primary_url: src,
    fallback_url: fallback,
    alt,
    loading_placeholder: type === 'video' ? 'Cargando video...' : 'Cargando imagen...'
  }
}

// Hook for progressive image loading
export function useProgressiveImage(src: string, placeholder?: string) {
  const [currentSrc, setCurrentSrc] = useState(placeholder || '/img/placeholder.jpg')
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (!src) return
    
    const img = new window.Image()
    img.onload = () => {
      setCurrentSrc(src)
      setLoading(false)
    }
    img.onerror = () => {
      setLoading(false)
    }
    img.src = src
  }, [src])
  
  return { src: currentSrc, loading }
}