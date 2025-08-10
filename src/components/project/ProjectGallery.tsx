'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ImageIcon } from 'lucide-react';
import { Project, GalleryImage } from '@/types/portfolio';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProjectGalleryProps {
  project: Project;
}

type GalleryStage = 'inicio' | 'proceso' | 'final';

export default function ProjectGallery({ project }: ProjectGalleryProps) {
  const [activeTab, setActiveTab] = useState<GalleryStage>('inicio');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);

  const tabs: { id: GalleryStage; label: string; description: string }[] = [
    { id: 'inicio', label: 'Inicio', description: 'Fase inicial del proyecto' },
    { id: 'proceso', label: 'Desarrollo', description: 'Proceso de construcción' },
    { id: 'final', label: 'Finalización', description: 'Proyecto completado' }
  ];

  // Filtrar imágenes por etapa
  const getImagesByStage = (stage: GalleryStage): GalleryImage[] => {
    return project.gallery
      .filter(img => img.stage === stage)
      .sort((a, b) => a.order - b.order);
  };

  const currentImages = getImagesByStage(activeTab);

  const openLightbox = (image: GalleryImage, index: number) => {
    setSelectedImage(image);
    setSelectedIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setSelectedImage(null);
    document.body.style.overflow = 'unset';
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (!currentImages.length) return;
    
    let newIndex;
    if (direction === 'prev') {
      newIndex = selectedIndex > 0 ? selectedIndex - 1 : currentImages.length - 1;
    } else {
      newIndex = selectedIndex < currentImages.length - 1 ? selectedIndex + 1 : 0;
    }
    
    setSelectedIndex(newIndex);
    setSelectedImage(currentImages[newIndex]);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      
      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          navigateLightbox('prev');
          break;
        case 'ArrowRight':
          navigateLightbox('next');
          break;
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [lightboxOpen, selectedIndex]);

  const getGridLayout = (stage: GalleryStage, imageCount: number) => {
    if (imageCount === 0) return '';
    
    switch (stage) {
      case 'inicio':
        return imageCount === 1 ? 'grid-cols-1 max-w-4xl mx-auto' : 'grid-cols-1 md:grid-cols-2 gap-6';
      case 'proceso':
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4';
      case 'final':
        return imageCount === 1 ? 'grid-cols-1 max-w-4xl mx-auto' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4';
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4';
    }
  };

  return (
    <>
      <section className="py-16 px-4">
        <div className="container mx-auto">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Galería del Proyecto
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explora cada etapa de desarrollo desde la concepción hasta la finalización
            </p>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex justify-center mb-12"
          >
            <div className="bg-muted rounded-lg p-2 flex gap-1">
              {tabs.map((tab) => {
                const imageCount = getImagesByStage(tab.id).length;
                
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? 'default' : 'ghost'}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "px-6 py-3 rounded-lg transition-all duration-300",
                      activeTab === tab.id 
                        ? "bg-background shadow-sm text-foreground" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className="text-center">
                      <div className="font-medium">{tab.label}</div>
                      <div className="text-xs opacity-70">
                        {imageCount} {imageCount === 1 ? 'imagen' : 'imágenes'}
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </motion.div>

          {/* Gallery grid */}
          <div ref={galleryRef} className="min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className={cn(
                  "grid",
                  getGridLayout(activeTab, currentImages.length)
                )}
              >
                {currentImages.map((image, index) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={cn(
                      "relative group cursor-pointer overflow-hidden rounded-lg",
                      "hover:shadow-xl transition-all duration-300"
                    )}
                    onClick={() => openLightbox(image, index)}
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <Image
                        src={image.url}
                        alt={image.caption || `${project.title} - ${activeTab}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
                      
                      {/* Hover content */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
                          <ZoomIn className="w-6 h-6 text-gray-800" />
                        </div>
                      </div>
                      
                      {/* Caption */}
                      {image.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                          <p className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {image.caption}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Empty state */}
            {currentImages.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No hay imágenes disponibles</h3>
                <p className="text-muted-foreground">
                  Las imágenes de esta etapa estarán disponibles próximamente.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 p-2 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation buttons */}
            {currentImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateLightbox('prev');
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateLightbox('next');
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Image */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-5xl max-h-[80vh] mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedImage.url}
                alt={selectedImage.caption || project.title}
                fill
                className="object-contain"
                priority
                sizes="(max-width: 768px) 90vw, 80vw"
              />
              
              {/* Caption */}
              {selectedImage.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <p className="text-white text-center">{selectedImage.caption}</p>
                </div>
              )}
            </motion.div>

            {/* Image counter */}
            {currentImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
                {selectedIndex + 1} de {currentImages.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}