'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Calendar, Ruler } from 'lucide-react';
import { ProjectCardProps, getCategoryColor, getCategoryBgColor, getCategoryLabel } from '@/types/portfolio';
import { cn } from '@/lib/utils';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ExtendedProjectCardProps extends ProjectCardProps {
  className?: string;
  priority?: boolean;
  index?: number;
}

export default function ProjectCard({ 
  title, 
  location, 
  type, 
  image, 
  slug, 
  area, 
  year, 
  onHover,
  className,
  priority = false,
  index = 0
}: ExtendedProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Simplified GSAP setup
  useEffect(() => {
    // Temporarily disabled
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [index]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHover?.(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHover?.(false);
    setMousePosition({ x: 0, y: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calcular offset del mouse desde el centro
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Limitar el efecto magnético a un rango suave
    const maxOffset = 8;
    const offsetX = (mouseX / rect.width) * maxOffset;
    const offsetY = (mouseY / rect.height) * maxOffset;
    
    setMousePosition({ x: offsetX, y: offsetY });
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "group relative overflow-hidden rounded-xl aspect-[4/3] cursor-pointer",
        "transition-all duration-700 ease-out hover:shadow-2xl",
        className
      )}
      style={{
        transform: isHovered 
          ? `translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0) scale(1.02)` 
          : 'translate3d(0, 0, 0) scale(1)',
        boxShadow: isHovered 
          ? `0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 30px rgba(0, 123, 196, 0.3)`
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <Link href={`/portfolio/${type}/${slug}`} className="block h-full">
        {/* Imagen principal */}
        <div ref={imageRef} className="relative h-full w-full overflow-hidden">
          {image && image.trim() !== '' ? (
            <Image
              src={image}
              alt={title}
              fill
              className={cn(
                "object-cover transition-all duration-700 ease-out",
                isHovered ? "scale-110" : "scale-100"
              )}
              priority={priority}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <div className="text-gray-500 text-center">
                <div className="text-2xl mb-2">🏗️</div>
                <div className="text-sm">Sin imagen disponible</div>
              </div>
            </div>
          )}
          
          {/* Overlay gradient */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-t transition-opacity duration-500",
            "from-black/80 via-black/40 to-transparent",
            isHovered ? "opacity-90" : "opacity-70"
          )} />
          
          {/* Category badge */}
          <div className="absolute top-4 left-4 z-10">
            <span className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm",
              "border border-white/20 text-white",
              getCategoryBgColor(type),
              "transition-all duration-300",
              isHovered && "scale-105"
            )}>
              {getCategoryLabel(type)}
            </span>
          </div>
          
          {/* Borde luminoso en hover */}
          <div className={cn(
            "absolute inset-0 rounded-xl transition-opacity duration-500",
            "border-2 border-transparent",
            isHovered && "border-accent/50"
          )} />
        </div>
        
        {/* Contenido de información */}
        <div 
          ref={contentRef}
          className="absolute bottom-0 left-0 right-0 p-6 z-10"
        >
          {/* Título */}
          <h3 className={cn(
            "text-white font-bold text-xl mb-3 leading-tight",
            "transition-all duration-300",
            isHovered ? "opacity-100" : "opacity-95"
          )}>
            {title}
          </h3>
          
          {/* Metadata */}
          <div className={cn(
            "space-y-2 transition-all duration-500",
            isHovered ? "opacity-100 translate-y-0" : "opacity-80 translate-y-1"
          )}>
            {/* Ubicación */}
            <div className="flex items-center gap-2 text-white/90 text-sm">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
            
            {/* Año y área */}
            <div className="flex items-center gap-4 text-white/80 text-sm">
              {year && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{year}</span>
                </div>
              )}
              {area && (
                <div className="flex items-center gap-1">
                  <Ruler className="w-4 h-4" />
                  <span>{area}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Indicador de hover */}
          <div className={cn(
            "mt-4 flex items-center text-white/90 text-sm font-medium",
            "transition-all duration-300",
            isHovered ? "opacity-100 translate-x-2" : "opacity-0 translate-x-0"
          )}>
            <span>Ver proyecto</span>
            <svg 
              className="w-4 h-4 ml-2 transition-transform duration-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
        
        {/* Efecto de brillo en hover */}
        <div className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-700",
          "bg-gradient-to-r from-transparent via-white/10 to-transparent",
          "transform -translate-x-full",
          isHovered && "opacity-100 translate-x-full"
        )} 
        style={{
          animation: isHovered ? 'shimmer 1.5s ease-out' : 'none'
        }}
        />
      </Link>
    </div>
  );
}