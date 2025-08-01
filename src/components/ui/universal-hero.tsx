'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';

interface UniversalHeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  backgroundImage?: string;
  overlay?: boolean;
  className?: string;
}

export default function UniversalHero({ 
  title, 
  subtitle, 
  description,
  backgroundImage = 'https://metrica-dip.com/images/slider-inicio-es/01.jpg',
  overlay = true,
  className = ''
}: UniversalHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const shadeRef = useRef<HTMLDivElement>(null);
  const [typedTitle, setTypedTitle] = useState('');
  
  // Efecto de escritura para el título
  useEffect(() => {
    let charIndex = 0;
    const typeWriter = setInterval(() => {
      if (charIndex < title.length) {
        setTypedTitle(title.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typeWriter);
      }
    }, 80);

    return () => clearInterval(typeWriter);
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
        <Image
          src={backgroundImage}
          alt={title}
          fill
          className="object-cover"
          priority
        />
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
          className="absolute inset-0 w-full h-full bg-black/40" 
          style={{ zIndex: 2 }} 
        />
      )}


      {/* Contenido principal centrado */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center" style={{ zIndex: 5 }}>
        <div 
          ref={textRef} 
          className="relative text-center px-4 max-w-4xl mx-auto"
          style={{ marginTop: '0px' }}
        >
          {/* Título con texto blanco */}
          <h1 className="text-6xl md:text-8xl tracking-tight text-white mb-4 font-black">
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
            <p className="max-w-3xl mx-auto text-xl md:text-2xl text-white/90 font-bold border-t border-white/20 pt-4 mt-4">
              {subtitle}
            </p>
          )}

          {/* Año de fondo sutil */}
          <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 text-8xl lg:text-9xl font-alliance-extrabold text-white/5 pointer-events-none select-none -z-10">
            2025
          </div>
        </div>
      </div>

      {/* Indicador de scroll */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce" style={{ zIndex: 10 }}>
        <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>

      {/* Efectos decorativos */}
      <div className="absolute top-1/4 left-10 w-20 h-20 border-2 border-accent/20 rounded-full animate-pulse" style={{ zIndex: 6 }} />
      <div className="absolute bottom-1/4 right-10 w-32 h-32 border-2 border-primary/20 rotate-45 animate-pulse" style={{ zIndex: 6 }} />

    </section>
  );
}