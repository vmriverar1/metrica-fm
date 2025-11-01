'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from 'next/image';
import {
  Target,
  Users,
  Lightbulb,
  Shield,
  TrendingUp,
  X,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon
} from 'lucide-react';

// Componente de skeleton loading para imágenes
const ImageSkeleton = ({ className }: { className?: string }) => (
  <div className={`absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
  </div>
);

// Registrar plugins
gsap.registerPlugin(ScrollTrigger);

// Mapeo de iconos por nombre
const iconMap = {
  Target,
  Users,
  Lightbulb,
  Shield,
  TrendingUp
};

interface Value {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  size: string;
  images: string[];
  image_descriptions: string[];
}

interface ValuesGalleryProps {
  title?: string;
  subtitle?: string;
  values?: Value[];
}

interface ValueModalProps {
  value: Value | null;
  onClose: () => void;
}

function ValueModal({ value, onClose }: ValueModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!value) return null;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % value.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + value.images.length) % value.images.length);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.4, ease: "backOut" }}
          className="relative max-w-6xl w-full max-h-[90vh] bg-white rounded-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header con ícono */}
          <div 
            className="absolute top-0 left-0 right-0 p-6 z-10 bg-gradient-to-b from-black/50 to-transparent"
          >
            <div className="flex items-center justify-between text-white">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: value.color }}
              >
                {React.createElement((iconMap as any)[value.icon] || Target, { size: 24 })}
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Imagen principal */}
          <div className="relative w-full h-[60vh] bg-gray-100">
            {value.images[currentImageIndex] && value.images[currentImageIndex].trim() !== '' ? (
              <Image
                src={value.images[currentImageIndex]}
                alt="Value representation"
                fill
                className="object-cover object-center"
                sizes="90vw"
                priority
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  console.error('Modal image failed to load:', value.images[currentImageIndex]);

                  // Sistema de fallback para el modal
                  if (!target.dataset.modalFallbackTried) {
                    target.dataset.modalFallbackTried = "1";
                    target.src = `https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop&crop=center`;
                  } else {
                    target.src = `https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=600&fit=crop&crop=center`;
                  }
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <ImageIcon className="w-16 h-16 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay imagen disponible</p>
                </div>
              </div>
            )}
            
            {/* Controles de navegación */}
            {value.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <ChevronLeft size={24} className="text-white" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <ChevronRight size={24} className="text-white" />
                </button>
              </>
            )}
          </div>

          {/* Descripción de la imagen actual */}
          {value.image_descriptions && value.image_descriptions[currentImageIndex] && (
            <motion.div 
              key={currentImageIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="px-6 py-4 bg-white border-b border-gray-100"
            >
              <p className="text-sm text-gray-600 leading-relaxed italic">
                {value.image_descriptions[currentImageIndex]}
              </p>
            </motion.div>
          )}

          {/* Galería de miniaturas */}
          <div className="p-6 bg-gray-50">
            <div className="flex gap-4 justify-center overflow-x-auto">
              {value.images.filter(img => img && img.trim() !== '').map((image, index) => (
                <motion.button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 ${
                    index === currentImageIndex ? 'ring-4' : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    ringColor: index === currentImageIndex ? value.color : 'transparent'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Image
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover object-center"
                    sizes="80px"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      if (!target.dataset.thumbFallbackTried) {
                        target.dataset.thumbFallbackTried = "1";
                        target.src = `https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=200&fit=crop&crop=center`;
                      } else {
                        target.src = `https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=200&h=200&fit=crop&crop=center`;
                      }
                    }}
                  />
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function ValuesGallery({ title, subtitle, values }: ValuesGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedValue, setSelectedValue] = useState<Value | null>(null);

  useGSAP(() => {
    // Animación de entrada más simple y rápida
    gsap.fromTo('.value-card', 
      { 
        opacity: 0, 
        y: 30
      },
      { 
        opacity: 1, 
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".values-grid",
          start: "top 90%",
          toggleActions: "play none none reverse"
        }
      }
    );

    // Parallax desactivado para evitar espacios vacíos
    // const images = gsap.utils.toArray<HTMLElement>('.value-image');
    // images.slice(0, 3).forEach((image) => {
    //   gsap.to(image, {
    //     yPercent: -15,
    //     ease: "none",
    //     scrollTrigger: {
    //       trigger: image,
    //       start: "top bottom",
    //       end: "bottom top",
    //       scrub: true
    //     }
    //   });
    // });

  }, { scope: containerRef });

  // Todas las imágenes son del mismo tamaño en cuadrícula uniforme
  const getGridSize = (size: string) => {
    return 'md:col-span-1 md:row-span-1';
  };

  const getImageHeight = (size: string) => {
    return 'h-[280px] md:h-[320px]';
  };

  return (
    <section ref={containerRef} className="py-20 px-4 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .value-image {
          background-size: cover !important;
          background-position: center !important;
          background-repeat: no-repeat !important;
          width: 100% !important;
          height: 100% !important;
        }
        .value-card > div {
          position: relative;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
      <div className="container mx-auto max-w-7xl">
        
        {/* Título de la Sección */}
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-[#003F6F] mb-6"
          >
            {title || 'Nuestros Valores'}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            {subtitle || 'Los principios que guían cada decisión y definen nuestra identidad como empresa líder en la dirección integral de proyectos'}
          </motion.p>
        </div>
        
        {/* Cuadrícula Uniforme de Valores */}
        <div className="values-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {(values || []).map((value, index) => {
            const IconComponent = (iconMap as any)[value.icon] || Target;

            // Debug: verificar qué imágenes están llegando
            console.log(`Value ${index}:`, {
              title: value.title,
              hasImages: !!value.images,
              imagesLength: value.images?.length,
              firstImage: value.images?.[0],
              allImages: value.images
            });
            
            return (
              <motion.div
                key={value.id}
                className={`value-card group cursor-pointer ${getGridSize(value.size)}`}
                onClick={() => setSelectedValue(value)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`relative ${getImageHeight(value.size)} rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 bg-gray-200`}>
                  {/* Skeleton loading */}
                  <ImageSkeleton />
                  
                  {/* Imagen principal con background-image para garantizar cobertura completa */}
                  <div
                    className="value-image absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-110"
                    style={{
                      backgroundImage: Array.isArray(value.images) && value.images.length > 0 && value.images[0] && value.images[0].trim() !== ''
                        ? `url('${encodeURI(value.images[0])}')`
                        : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundColor: value.color + '20',
                      width: '100%',
                      height: '100%'
                    }}
                  >
                    {/* Imagen oculta para detectar errores de carga */}
                    {Array.isArray(value.images) && value.images.length > 0 && value.images[0] && value.images[0].trim() !== '' && (
                      <img
                        src={value.images[0]}
                        alt={`Value ${index + 1}`}
                        className="opacity-0 absolute inset-0 w-full h-full pointer-events-none"
                        onLoad={(e) => {
                          // Ocultar skeleton cuando la imagen carga
                          const skeleton = e.currentTarget.parentElement?.parentElement?.querySelector('.absolute.inset-0.bg-gradient-to-r');
                          if (skeleton) {
                            skeleton.classList.add('opacity-0');
                          }
                        }}
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          const parent = target.parentElement as HTMLDivElement;
                          console.error('Image failed to load:', value.images[0]);

                          // Aplicar fallback al div padre
                          if (!parent.dataset.fallbackTried) {
                            parent.dataset.fallbackTried = "1";
                            parent.style.backgroundImage = `url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop&crop=center)`;
                            target.src = `https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop&crop=center`;
                          } else if (parent.dataset.fallbackTried === "1") {
                            parent.dataset.fallbackTried = "2";
                            parent.style.backgroundImage = `url(https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&h=400&fit=crop&crop=center)`;
                            target.src = `https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&h=400&fit=crop&crop=center`;
                          } else {
                            // Mostrar placeholder con ícono
                            parent.style.backgroundImage = 'none';
                            parent.style.backgroundColor = value.color + '20';
                            parent.innerHTML = `<div class="absolute inset-0 flex items-center justify-center"><div class="text-6xl opacity-50">📷</div></div>`;
                          }
                        }}
                      />
                    )}

                    {/* Si no hay imagen, mostrar placeholder */}
                    {(!Array.isArray(value.images) || value.images.length === 0 || !value.images[0] || value.images[0].trim() === '') && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-6xl opacity-50">📷</div>
                      </div>
                    )}
                  </div>

                  {/* Overlay con gradiente */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />

                  {/* Texto explicativo en hover */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                    <div className="text-white">
                      <div className="flex items-center gap-3 mb-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm"
                          style={{ backgroundColor: value.color }}
                        >
                          <IconComponent size={20} className="text-white" />
                        </div>
                        <h3 className="text-xl font-bold">{value.title}</h3>
                      </div>
                      <p className="text-sm leading-relaxed text-white/90 line-clamp-3">
                        {value.description}
                      </p>
                    </div>
                  </div>

                  {/* Ícono flotante (solo visible cuando no hay hover) */}
                  <div className="absolute top-4 right-4 opacity-100 group-hover:opacity-0 transition-all duration-300">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg border-2 border-white/30"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                    >
                      <IconComponent 
                        size={24} 
                        className="text-white"
                      />
                    </div>
                  </div>

                  {/* Efecto de brillo en hover */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                    style={{
                      background: `linear-gradient(45deg, transparent 30%, ${value.color}40 50%, transparent 70%)`
                    }}
                  />

                  {/* Indicador de múltiples imágenes */}
                  {value.images.length > 1 && (
                    <div className="absolute bottom-4 left-4 flex space-x-1">
                      {value.images.slice(0, 4).map((_, dotIndex) => (
                        <div
                          key={dotIndex}
                          className="w-2 h-2 rounded-full bg-white/60 group-hover:bg-white/90 transition-colors duration-300"
                        />
                      ))}
                      {value.images.length > 4 && (
                        <div className="text-white/80 text-xs ml-1 group-hover:text-white transition-colors duration-300">
                          +{value.images.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      <ValueModal 
        value={selectedValue} 
        onClose={() => setSelectedValue(null)} 
      />
    </section>
  );
}