'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import VideoWithFallback from './VideoWithFallback';

interface ButtonProps {
  text: string;
  href: string;
}


interface MediaAsset {
  type: 'image' | 'video';
  primary_url?: string;
  fallback_url?: string;
  overlay_opacity?: number;
}

interface MetadataProps {
  stats?: string[];
  centerText?: string;
}

interface UniversalHeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  backgroundImage?: string;
  background?: MediaAsset;
  overlay?: boolean;
  className?: string;
  primaryButton?: ButtonProps;
  secondaryButton?: ButtonProps;
  metadata?: MetadataProps;
  hideText?: boolean;
}

export default function UniversalHero({
  title,
  subtitle,
  description,
  backgroundImage = 'https://metrica-dip.com/images/slider-inicio-es/01.jpg',
  background,
  overlay = true,
  className = '',
  primaryButton,
  secondaryButton,
  metadata,
  hideText = false
}: UniversalHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const shadeRef = useRef<HTMLDivElement>(null);
  // SIMPLIFICADO: Mostrar el título completo sin animación de escritura
  // Para evitar loops infinitos en el blog
  const [typedTitle, setTypedTitle] = useState(title);
  
  useEffect(() => {
    setTypedTitle(title);
  }, [title]);


  useGSAP(() => {
    if (!sectionRef.current) return;

    // Animación inicial de entrada
    const mainTl = gsap.timeline();
    
    mainTl.from(backgroundRef.current, {
      scale: 1.3,
      duration: 2,
      ease: 'power3.out'
    })
    .from(textRef.current, {
      y: 100,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.out'
    }, 0.8);

    // Efectos de scroll basados en la lógica del HTML original
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      
      // Shade/overlay opacity (igual que HTML original)
      const shadeOpacity = scrollTop / 500;
      if (shadeRef.current) {
        gsap.set(shadeRef.current, {
          opacity: Math.min(shadeOpacity, 0.8)
        });
      }
      
      // Background scale (igual que HTML original)
      const scaleValue = scrollTop * 0.0004 + 1;
      if (backgroundRef.current) {
        gsap.set(backgroundRef.current, {
          scale: scaleValue,
          transformOrigin: 'center center'
        });
      }
      
      // Text movement (igual que HTML original)
      const textOffset = scrollTop * 0.2 + 1;
      if (textRef.current) {
        textRef.current.style.marginTop = `${textOffset}px`;
        textRef.current.style.transform = `translateY(${textOffset}px)`;
      }
    };

    // Agregar listener de scroll
    window.addEventListener('scroll', handleScroll);

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };

  }, { scope: sectionRef });

  return (
    <section 
      ref={sectionRef} 
      className={`relative h-screen overflow-hidden ${className}`}
    >
      {/* Background fijo (como en HTML original) */}
      <div 
        ref={backgroundRef}
        className="absolute inset-0 w-full h-full"
        style={{ 
          transform: 'scale(1)',
          zIndex: 1
        }}
      >
        {background ? (
          <VideoWithFallback
            primary={background.type === 'video' ? background.primary_url : undefined}
            fallback={background.fallback_url || backgroundImage}
            alt={title}
            priority
          />
        ) : (
          <VideoWithFallback
            fallback={backgroundImage}
            alt={title}
            priority
          />
        )}
      </div>

      {/* Shade/overlay progresivo (como en HTML original) */}
      <div 
        ref={shadeRef}
        className="absolute inset-0 w-full h-full bg-black"
        style={{ 
          opacity: 0,
          zIndex: 3
        }}
      />

      {/* Overlay base inicial */}
      {overlay && (
        <div 
          className="absolute inset-0 w-full h-full bg-black" 
          style={{ 
            zIndex: 2,
            opacity: background?.overlay_opacity || 0.4
          }} 
        />
      )}



      {/* Contenido principal centrado */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center" style={{ zIndex: 5 }}>
        <div
          ref={textRef}
          className="relative text-center px-4 max-w-6xl mx-auto"
          style={{ marginTop: '0px' }}
        >
          {/* Título con texto blanco - ocultar si hideText es true */}
          {!hideText && (
            <>
              <h1 className="text-6xl md:text-7xl tracking-tight text-white mb-4 font-black">
                {title === 'Qué Hacemos' ? (
                  <>
                    <span className="block text-white font-black" style={{ textShadow: '0 0 30px rgba(255, 255, 255, 0.3)' }}>
                      {typedTitle}
                    </span>
                  </>
                ) : title === 'Nuestra Historia' ? (
                  <>
                    <span className="block text-white font-black" style={{ textShadow: '0 0 30px rgba(255, 255, 255, 0.3)' }}>
                      Nuestra
                    </span>
                    <span className="block font-black">Historia</span>
                  </>
                ) : (
                  <span className="block font-black">
                    {typedTitle}
                    <span className="animate-pulse text-white">|</span>
                  </span>
                )}
              </h1>

              {subtitle && (
                <p className="max-w-5xl mx-auto text-xl md:text-2xl text-white/90 font-bold border-t border-white/20 pt-4 mt-4">
                  {subtitle}
                </p>
              )}
            </>
          )}

          {/* Buttons */}
          {(primaryButton || secondaryButton) && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              {primaryButton && (
                <Button size="lg" asChild className="px-8">
                  <Link href={primaryButton.href}>
                    {primaryButton.text}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              )}
              {secondaryButton && (
                <Button variant="outline" size="lg" asChild className="px-8 border-white text-white bg-black/20 backdrop-blur-sm hover:bg-white hover:text-foreground">
                  <Link href={secondaryButton.href}>
                    {secondaryButton.text}
                  </Link>
                </Button>
              )}
            </div>
          )}

          {/* Stats */}
          {metadata?.stats && (
            <div className="flex flex-wrap items-center justify-center gap-8 mt-12 pt-8 border-t border-white/20">
              {metadata.stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-white">{stat}</div>
                </div>
              ))}
            </div>
          )}

          {/* Center Text */}
          {metadata?.centerText && (
            <div className="mt-12 pt-8 border-t border-white/20">
              <div className="text-center">
                <p className="text-xl md:text-2xl font-bold text-white/90 tracking-wider uppercase">
                  {metadata.centerText}
                </p>
              </div>
            </div>
          )}

          {/* Año de fondo sutil */}
          <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 text-8xl lg:text-9xl font-alliance-extrabold text-white/5 pointer-events-none select-none -z-10">
            2025
          </div>
        </div>
      </div>

      {/* Indicador de scroll */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce" style={{ zIndex: 10 }}>
        <div className="flex flex-col items-center gap-2">
          <span className="text-white/70 text-sm font-alliance-medium tracking-wider">DESLIZA</span>
          <svg 
            className="w-6 h-6 text-white/70" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 14l-7 7m0 0l-7-7m7 7V3" 
            />
          </svg>
        </div>
      </div>

      {/* Efectos decorativos */}
      <div className="absolute top-1/4 left-10 w-20 h-20 border-2 border-accent/20 rounded-full animate-pulse" style={{ zIndex: 6 }} />
      <div className="absolute bottom-1/4 right-10 w-32 h-32 border-2 border-primary/20 rotate-45 animate-pulse" style={{ zIndex: 6 }} />

    </section>
  );
}