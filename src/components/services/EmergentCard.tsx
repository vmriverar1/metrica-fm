'use client';

import React, { useRef, useEffect } from 'react';
import { gsap } from '@/lib/gsap';
import ContextualAnimation from './ContextualAnimation';

interface Servicio {
  id: string;
  titulo: string;
  descripcion: string;
  color: string;
  ambiente: string;
  imagen: string;
}

interface EmergentCardProps {
  servicio: Servicio;
  isActive: boolean;
  delay: number;
}

export default function EmergentCard({ servicio, isActive, delay }: EmergentCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !cardRef.current) return;

    const card = cardRef.current;
    const tl = gsap.timeline({ delay });

    // Animación de emergencia desde el centro
    tl.from(card, {
      scale: 0,
      rotation: 180,
      duration: 1.2,
      ease: 'back.out(1.7)'
    })
    .from(iconRef.current, {
      scale: 0,
      rotation: -180,
      duration: 0.8,
      ease: 'elastic.out(1, 0.5)'
    }, 0.4)
    .from('.card-text-line', {
      y: 30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out'
    }, 0.6);

    // Efectos de hover/floating continuo
    const floatTl = gsap.timeline({ repeat: -1, yoyo: true });
    floatTl.to(card, {
      y: -10,
      rotation: 2,
      duration: 3,
      ease: 'sine.inOut'
    });

    return () => {
      tl.kill();
      floatTl.kill();
    };
  }, [isActive, delay]);

  const getServiceIcon = (ambiente: string) => {
    switch (ambiente) {
      case 'corporate':
        return (
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-primary rounded-sm" />
              <div className="absolute top-2 right-2 w-3 h-3 bg-primary rounded-full animate-pulse" />
            </div>
          </div>
        );
      case 'construction':
        return (
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
              <div className="w-6 h-8 bg-accent/60" />
              <div className="absolute top-3 left-6 w-4 h-1 bg-accent" />
              <div className="absolute top-5 left-6 w-3 h-1 bg-accent" />
            </div>
          </div>
        );
      case 'technical':
        return (
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gray-200/20 flex items-center justify-center">
              <div className="w-8 h-0.5 bg-white" />
              <div className="w-6 h-0.5 bg-white absolute top-7" />
              <div className="w-4 h-0.5 bg-white absolute top-9" />
              <div className="absolute bottom-4 right-4 w-2 h-2 border border-white animate-ping" />
            </div>
          </div>
        );
      case 'consulting':
        return (
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gray-300/20 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full border-2 border-white" />
              <div className="absolute top-3 right-3 w-3 h-3 bg-white rounded-full" />
              <div className="absolute bottom-3 left-3 w-2 h-2 border border-white rotate-45" />
            </div>
          </div>
        );
      case 'engineering':
        return (
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gray-400/20 flex items-center justify-center">
              <div className="w-0 h-0 border-l-4 border-r-4 border-b-6 border-transparent border-b-white" />
              <div className="absolute bottom-4 w-8 h-0.5 bg-white" />
              <div className="absolute top-3 right-3 w-3 h-3 bg-white/50 rounded-full animate-pulse" />
            </div>
          </div>
        );
      case 'innovation':
        return (
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-black/20 flex items-center justify-center">
              <div className="w-4 h-4 bg-accent rounded-full animate-pulse" />
              <div className="w-8 h-8 border border-accent/50 rounded-full absolute animate-ping" />
              <div className="absolute top-2 right-2 w-2 h-2 bg-white animate-pulse" />
            </div>
          </div>
        );
      default:
        return <div className="w-16 h-16 rounded-full bg-primary/20" />;
    }
  };

  return (
    <div 
      ref={cardRef}
      className="relative max-w-md mx-auto"
    >
      {/* Card principal */}
      <div 
        className="backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20"
        style={{
          background: `linear-gradient(135deg, ${servicio.color}20 0%, rgba(255,255,255,0.1) 100%)`
        }}
      >
        {/* Icono del servicio */}
        <div ref={iconRef} className="flex justify-center mb-6">
          {getServiceIcon(servicio.ambiente)}
        </div>

        {/* Animación contextual */}
        <div className="flex justify-center mb-6">
          <ContextualAnimation ambiente={servicio.ambiente} isActive={isActive} />
        </div>

        {/* Contenido de texto */}
        <div ref={textRef} className="text-center">
          <h3 className="card-text-line text-2xl font-alliance-extrabold text-white mb-4">
            {servicio.titulo}
          </h3>
          <p className="card-text-line text-lg font-alliance-medium text-white/90 mb-6">
            {servicio.descripcion}
          </p>
          
          {/* Frase inspiradora */}
          <div className="card-text-line italic text-white/70 font-alliance-light">
            "{getInspirationalQuote(servicio.ambiente)}"
          </div>
        </div>

        {/* Elementos decorativos */}
        <div className="absolute top-4 right-4 w-2 h-2 bg-white/50 rounded-full animate-pulse" />
        <div className="absolute bottom-4 left-4 w-3 h-3 border border-white/30 rotate-45" />
        
        {/* Efecto de glow */}
        <div 
          className="absolute inset-0 rounded-2xl opacity-50 blur-xl -z-10"
          style={{ backgroundColor: servicio.color }}
        />
      </div>

      {/* Partículas orbitales */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/60 rounded-full animate-spin"
            style={{
              top: `${20 + i * 10}%`,
              left: `${10 + (i % 2) * 80}%`,
              animationDuration: `${8 + i * 2}s`,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}

function getInspirationalQuote(ambiente: string): string {
  switch (ambiente) {
    case 'corporate':
      return 'La estrategia es el puente entre la visión y la realidad';
    case 'construction':
      return 'Cada proyecto es una historia de transformación';
    case 'technical':
      return 'La precisión técnica es nuestra firma';
    case 'consulting':
      return 'El conocimiento compartido multiplica el éxito';
    case 'engineering':
      return 'En cada detalle reside la excelencia';
    case 'innovation':
      return 'El futuro se construye con ideas audaces';
    default:
      return 'Transformando ideas en realidad';
  }
}