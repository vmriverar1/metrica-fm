'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';

interface FinalImageProps {
  isActive: boolean;
  finalImage?: string;
}

export default function FinalImage({ isActive, finalImage }: FinalImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current || !isActive) return;

    const ctx = gsap.context(() => {
      // Animación de entrada simple
      const tl = gsap.timeline({ delay: 0.2 });

      // Solo animar las partículas
      tl.from('.final-particle', {
        scale: 0,
        opacity: 0,
        duration: 2,
        stagger: {
          each: 0.1,
          from: 'random'
        },
        ease: 'power2.out'
      });
    }, containerRef);

    return () => ctx.revert();
  }, { dependencies: [isActive], scope: containerRef });

  // No renderizar si no hay imagen
  if (!finalImage) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen flex overflow-hidden flex-shrink-0"
    >
      {/* Imagen de cierre - 60% como las demás */}
      <div className="relative w-[60%] h-full">
        <Image
          src={finalImage}
          alt="Métrica FM"
          fill
          className="object-cover"
          priority
        />
        
        {/* Partículas decorativas sutiles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="final-particle absolute rounded-full"
              style={{
                width: `${12 + i * 4}px`,
                height: `${12 + i * 4}px`,
                backgroundColor: i % 2 === 0 ? '#00A8E8' : '#003F6F',
                opacity: 0.2,
                left: `${15 + i * 10}%`,
                top: `${25 + (i * 8) % 50}%`,
                filter: 'blur(2px)'
              }}
            />
          ))}
        </div>
      </div>

      {/* Espacio vacío - 40% para mantener consistencia visual */}
      <div className="relative w-[40%] h-full bg-background">
        {/* Solo gradiente sutil */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-background transition-opacity duration-1000" />
      </div>
    </div>
  );
}