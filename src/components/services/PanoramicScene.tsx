'use client';

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import { gsap } from '@/lib/gsap';

interface Servicio {
  id: string;
  titulo: string;
  descripcion: string;
  color: string;
  ambiente: string;
  imagen: string;
}

interface PanoramicSceneProps {
  servicio: Servicio;
  isActive: boolean;
}

export default function PanoramicScene({ servicio, isActive }: PanoramicSceneProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !sceneRef.current) return;

    const scene = sceneRef.current;

    // Animación de entrada de la escena
    const tl = gsap.timeline();
    
    tl.from(scene, {
      scale: 0.8,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.out'
    })
    .from('.scene-particles', {
      scale: 0,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'back.out(1.7)'
    }, 0.3);

    // Efecto de parallax continuo
    const parallaxTl = gsap.timeline({ repeat: -1, yoyo: true });
    parallaxTl.to(imageRef.current, {
      x: 20,
      y: -10,
      duration: 8,
      ease: 'sine.inOut'
    });

    return () => {
      tl.kill();
      parallaxTl.kill();
    };
  }, [isActive]);

  const getAmbientElements = (ambiente: string) => {
    switch (ambiente) {
      case 'corporate':
        return (
          <>
            <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-primary/60 rounded-full scene-particles animate-pulse" />
            <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-primary/40 rounded-full scene-particles animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-1/3 left-1/3 w-5 h-5 bg-primary/30 rounded-full scene-particles animate-pulse" style={{ animationDelay: '2s' }} />
          </>
        );
      case 'construction':
        return (
          <>
            <div className="absolute top-1/5 right-1/5 w-6 h-1 bg-accent/70 scene-particles animate-bounce" />
            <div className="absolute bottom-1/4 left-1/5 w-1 h-6 bg-accent/60 scene-particles animate-bounce" style={{ animationDelay: '0.5s' }} />
            <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-accent/50 rotate-45 scene-particles animate-spin" style={{ animationDuration: '3s' }} />
          </>
        );
      case 'technical':
        return (
          <>
            <div className="absolute top-1/6 left-1/6 w-8 h-0.5 bg-white/60 scene-particles" />
            <div className="absolute top-1/4 left-1/6 w-6 h-0.5 bg-white/40 scene-particles" />
            <div className="absolute top-1/3 left-1/6 w-4 h-0.5 bg-white/30 scene-particles" />
            <div className="absolute bottom-1/4 right-1/5 w-2 h-2 border border-white/50 scene-particles animate-ping" />
          </>
        );
      case 'consulting':
        return (
          <>
            <div className="absolute top-1/4 right-1/4 w-6 h-6 border-2 border-white/40 rounded-full scene-particles" />
            <div className="absolute bottom-1/3 left-1/4 w-4 h-4 border border-white/30 scene-particles rotate-45" />
            <div className="absolute top-1/2 right-1/3 w-1 h-8 bg-white/20 scene-particles" />
          </>
        );
      case 'engineering':
        return (
          <>
            <div className="absolute top-1/5 left-1/3 scene-particles">
              <div className="w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-white/50" />
            </div>
            <div className="absolute bottom-1/4 right-1/4 w-6 h-6 bg-gradient-to-br from-white/30 to-transparent scene-particles animate-pulse" />
            <div className="absolute top-1/3 right-1/5 scene-particles">
              <div className="w-4 h-4 bg-white/20 transform rotate-45" />
            </div>
          </>
        );
      case 'innovation':
        return (
          <>
            <div className="absolute top-1/4 left-1/4 scene-particles">
              <div className="w-3 h-3 bg-accent animate-pulse rounded-full" />
              <div className="w-5 h-5 border border-accent/50 rounded-full absolute -top-1 -left-1 animate-ping" />
            </div>
            <div className="absolute bottom-1/3 right-1/3 scene-particles">
              <div className="w-2 h-2 bg-white animate-pulse" />
              <div className="w-4 h-4 border border-white/30 absolute -top-1 -left-1 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      ref={sceneRef}
      className="absolute inset-0 overflow-hidden"
    >
      {/* Imagen de fondo con efecto parallax */}
      <div 
        ref={imageRef}
        className="absolute inset-0 scale-110"
      >
        <Image
          src={servicio.imagen}
          alt={servicio.titulo}
          fill
          className="object-cover"
          priority={isActive}
        />
        
        {/* Overlay con color del servicio */}
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${servicio.color}80 0%, transparent 50%, ${servicio.color}40 100%)`
          }}
        />
      </div>

      {/* Elementos ambientales según el tipo de servicio */}
      <div ref={particlesRef} className="absolute inset-0">
        {getAmbientElements(servicio.ambiente)}
      </div>

      {/* Efectos de luz dinámicos */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Haz de luz principal */}
        <div 
          className="absolute top-0 left-1/4 w-1 h-full opacity-20 animate-pulse"
          style={{
            background: `linear-gradient(to bottom, ${servicio.color}, transparent 60%)`,
            animationDuration: '4s'
          }}
        />
        
        {/* Haz de luz secundario */}
        <div 
          className="absolute top-0 right-1/3 w-0.5 h-full opacity-15 animate-pulse"
          style={{
            background: `linear-gradient(to bottom, white, transparent 40%)`,
            animationDuration: '6s',
            animationDelay: '2s'
          }}
        />
      </div>

      {/* Grid técnico sutil */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(${servicio.color} 1px, transparent 1px),
              linear-gradient(90deg, ${servicio.color} 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Viñeta cinematográfica */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, transparent 30%, ${servicio.color}40 100%)`
        }}
      />
    </div>
  );
}