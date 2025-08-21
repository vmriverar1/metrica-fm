'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { Info, X } from 'lucide-react';

interface Hito {
  id: number;
  year: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  image_fallback?: string;
  highlights: string[];
}

interface HitoFullScreenProps {
  hito: Hito;
  index: number;
  isActive: boolean;
  showPanel?: boolean;
  onTogglePanel?: () => void;
}

export default function HitoFullScreen({ hito, index, isActive, showPanel = false, onTogglePanel }: HitoFullScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [imageSrc, setImageSrc] = useState(hito.image);
  const [imageError, setImageError] = useState(false);

  useGSAP(() => {
    if (!containerRef.current || !contentRef.current || !isActive) return;

    const ctx = gsap.context(() => {
      // Timeline para las animaciones
      const tl = gsap.timeline({ delay: 0.2 });

      // Año grande
      tl.from('.year-bg', {
        scale: 0.8,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      });

      // Contenido principal con mejores animaciones
      tl.from(contentRef.current.children, {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        clearProps: 'all' // Limpia estilos inline después
      }, '-=0.6');

      // Highlights con entrada más dinámica
      tl.from('.highlight-item', {
        x: -30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        clearProps: 'all'
      }, '-=0.4');

      // Partículas animadas
      if (containerRef.current.querySelector('.particle-float')) {
        tl.from('.particle-float', {
          scale: 0,
          opacity: 0,
          duration: 1,
          stagger: {
            each: 0.02,
            from: 'random'
          },
          ease: 'power1.out'
        }, '-=1');
      }
    }, containerRef);

    return () => ctx.revert();
  }, { dependencies: [isActive], scope: containerRef });

  // Efecto parallax en elementos
  useGSAP(() => {
    if (!containerRef.current) return;

    const parallaxElements = containerRef.current.querySelectorAll('.parallax-layer, .parallax-element');
    
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      parallaxElements.forEach((element) => {
        const speed = parseFloat(element.getAttribute('data-speed') || '1');
        const x = (clientX - innerWidth / 2) * speed * 0.01;
        const y = (clientY - innerHeight / 2) * speed * 0.01;
        
        gsap.to(element, {
          x,
          y,
          duration: 0.5,
          ease: 'power2.out'
        });
      });
    };

    if (isActive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, { dependencies: [isActive], scope: containerRef });

  return (
    <div 
      ref={containerRef}
      className="relative w-screen h-screen flex overflow-hidden flex-shrink-0"
    >
      {/* Imagen de fondo con parallax - 60% (lado izquierdo - original) */}
      <div className="relative w-[60%] h-full">
        {/* Capa 1: Imagen principal */}
        <div className="absolute inset-0 parallax-layer" data-speed="0.5">
          <Image
            src={imageSrc}
            alt={hito.title}
            fill
            className="object-cover"
            priority={index < 2}
            onError={() => {
              if (!imageError && hito.image_fallback) {
                setImageError(true);
                setImageSrc(hito.image_fallback);
              }
            }}
          />
        </div>
        
        {/* Capa 2: Elementos flotantes decorativos */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute parallax-element opacity-20"
              data-speed={0.2 + i * 0.1}
              style={{
                width: `${20 + i * 10}px`,
                height: `${20 + i * 10}px`,
                backgroundColor: index % 2 === 0 ? '#E84E0F' : '#003F6F',
                borderRadius: '50%',
                filter: 'blur(2px)',
                left: `${20 + i * 15}%`,
                top: `${30 + i * 10}%`
              }}
            />
          ))}
        </div>
        
        {/* Overlay gradiente con máscara animada */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background/80 transition-opacity duration-1000" />
        
        {/* Año gigante con efecto parallax */}
        <div className="year-bg absolute inset-0 flex items-center justify-center pointer-events-none parallax-layer" data-speed="0.8">
          <span 
            className="text-[40vh] font-alliance-extrabold leading-none opacity-10"
            style={{ color: index % 2 === 0 ? '#E84E0F' : '#003F6F' }}
          >
            {hito.year}
          </span>
        </div>
        
        {/* Efecto de partículas dinámicas */}
        {isActive && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="particle-float absolute w-1 h-1 bg-white/30 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${5 + Math.random() * 5}s`
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Contenido - 40% (lado derecho - original) */}
      <div className="relative w-[40%] h-full flex items-center">
        <div 
          ref={contentRef}
          className="px-16 py-12 max-w-xl"
        >
          {/* Año */}
          <div className="mb-4">
            <span 
              className="text-6xl font-alliance-extrabold"
              style={{ color: index % 2 === 0 ? '#E84E0F' : '#003F6F' }}
            >
              {hito.year}
            </span>
          </div>

          {/* Título */}
          <h2 className="text-5xl font-alliance-extrabold text-foreground mb-2">
            {hito.title}
          </h2>

          {/* Subtítulo */}
          <p className="text-2xl font-alliance-medium text-muted-foreground mb-8">
            {hito.subtitle}
          </p>

          {/* Descripción */}
          <p className="text-lg font-alliance-medium text-foreground/80 leading-relaxed mb-12">
            {hito.description}
          </p>

          {/* Highlights */}
          <div className="space-y-3">
            {hito.highlights.map((highlight, idx) => (
              <div 
                key={idx}
                className="highlight-item flex items-center gap-3"
              >
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: index % 2 === 0 ? '#E84E0F' : '#003F6F' }}
                />
                <span className="text-base font-alliance-medium text-foreground/70">
                  {highlight}
                </span>
              </div>
            ))}
          </div>

          {/* Botón para mostrar más información */}
          <button
            onClick={onTogglePanel}
            className="mt-8 flex items-center gap-2 px-6 py-3 rounded-full border-2 transition-all duration-300 hover:scale-105"
            style={{ 
              borderColor: index % 2 === 0 ? '#E84E0F' : '#003F6F',
              color: index % 2 === 0 ? '#E84E0F' : '#003F6F'
            }}
          >
            {showPanel ? (
              <>
                <X className="w-5 h-5" />
                <span className="font-alliance-medium">Cerrar detalles</span>
              </>
            ) : (
              <>
                <Info className="w-5 h-5" />
                <span className="font-alliance-medium">Ver más detalles</span>
              </>
            )}
          </button>
        </div>

        {/* Línea decorativa vertical */}
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-40 opacity-20"
          style={{ backgroundColor: index % 2 === 0 ? '#E84E0F' : '#003F6F' }}
        />
      </div>

      {/* Efecto de transición para el siguiente hito */}
      {index < 5 && (
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background/20 to-transparent pointer-events-none" />
      )}
    </div>
  );
}