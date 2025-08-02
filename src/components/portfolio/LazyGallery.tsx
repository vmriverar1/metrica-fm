'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { GalleryImage } from '@/types/portfolio';
import OptimizedImage from './OptimizedImage';
import { cn } from '@/lib/utils';

interface LazyGalleryProps {
  images: GalleryImage[];
  currentStage: 'inicio' | 'proceso' | 'final';
  className?: string;
}

export default function LazyGallery({ 
  images, 
  currentStage, 
  className 
}: LazyGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 6 });
  const galleryRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Filter images by current stage
  const stageImages = images
    .filter(img => img.stage === currentStage)
    .sort((a, b) => a.order - b.order);

  // Intersection Observer for progressive loading
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            
            // Load more images when approaching the end
            if (index >= visibleRange.end - 2) {
              setVisibleRange(prev => ({
                ...prev,
                end: Math.min(prev.end + 6, stageImages.length)
              }));
            }
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '100px'
      }
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, [visibleRange.end, stageImages.length]);

  // Track loaded images
  const handleImageLoad = useCallback((imageId: string) => {
    setLoadedImages(prev => new Set([...prev, imageId]));
  }, []);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImage === null) return;

      switch (e.key) {
        case 'Escape':
          setSelectedImage(null);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setSelectedImage(prev => 
            prev === null ? null : prev > 0 ? prev - 1 : stageImages.length - 1
          );
          break;
        case 'ArrowRight':
          e.preventDefault();
          setSelectedImage(prev => 
            prev === null ? null : prev < stageImages.length - 1 ? prev + 1 : 0
          );
          break;
      }
    };

    if (selectedImage !== null) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage, stageImages.length]);

  // Preload adjacent images in lightbox
  useEffect(() => {
    if (selectedImage === null) return;

    const preloadAdjacent = (index: number) => {
      const img = new Image();
      img.src = stageImages[index]?.url;
    };

    // Preload previous and next images
    if (selectedImage > 0) preloadAdjacent(selectedImage - 1);
    if (selectedImage < stageImages.length - 1) preloadAdjacent(selectedImage + 1);
  }, [selectedImage, stageImages]);

  const visibleImages = stageImages.slice(visibleRange.start, visibleRange.end);

  if (stageImages.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No hay imágenes disponibles para esta etapa</p>
      </div>
    );
  }

  return (
    <>
      <div ref={galleryRef} className={cn("grid gap-4", className)}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleImages.map((image, index) => (
            <motion.div
              key={image.id}
              data-index={visibleRange.start + index}
              ref={(el) => {
                if (el && observerRef.current) {
                  observerRef.current.observe(el);
                }
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1,
                ease: "easeOut"
              }}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg cursor-pointer"
              onClick={() => setSelectedImage(visibleRange.start + index)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <OptimizedImage
                src={image.thumbnail || image.url}
                alt={image.caption || `Imagen ${index + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-all duration-300 group-hover:scale-110"
                onLoad={() => handleImageLoad(image.id)}
              />
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
              
              {/* Zoom icon */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/90 rounded-full p-2">
                  <ZoomIn className="w-6 h-6 text-gray-900" />
                </div>
              </div>
              
              {/* Caption overlay */}
              {image.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <p className="text-white text-sm font-medium">
                    {image.caption}
                  </p>
                </div>
              )}
              
              {/* Loading indicator */}
              {!loadedImages.has(image.id) && (
                <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Load more indicator */}
        {visibleRange.end < stageImages.length && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span>Cargando más imágenes...</span>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={() => setSelectedImage(null)}
          >
            {/* Close button */}
            <button
              className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation buttons */}
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors disabled:opacity-50"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(prev => 
                  prev === null ? null : prev > 0 ? prev - 1 : stageImages.length - 1
                );
              }}
              disabled={stageImages.length <= 1}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors disabled:opacity-50"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(prev => 
                  prev === null ? null : prev < stageImages.length - 1 ? prev + 1 : 0
                );
              }}
              disabled={stageImages.length <= 1}
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Main image */}
            <motion.div
              key={selectedImage}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-7xl max-h-[90vh] mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <OptimizedImage
                src={stageImages[selectedImage].url}
                alt={stageImages[selectedImage].caption || `Imagen ${selectedImage + 1}`}
                width={1200}
                height={800}
                className="object-contain max-h-[90vh] w-auto"
                priority
                quality={90}
              />
              
              {/* Caption */}
              {stageImages[selectedImage].caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <p className="text-white text-lg font-medium text-center">
                    {stageImages[selectedImage].caption}
                  </p>
                </div>
              )}
            </motion.div>

            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 text-white px-4 py-2 rounded-full text-sm">
              {selectedImage + 1} / {stageImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}