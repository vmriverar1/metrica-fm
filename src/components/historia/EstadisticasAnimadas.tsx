'use client';

import React, { useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';

interface Estadistica {
  id: number;
  numero: number;
  sufijo?: string;
  label: string;
  descripcion: string;
  icon: string;
}

const estadisticas: Estadistica[] = [
  {
    id: 1,
    numero: 200,
    sufijo: '+',
    label: 'Proyectos Exitosos',
    descripcion: 'Infraestructura que transforma comunidades',
    icon: '🏗️'
  },
  {
    id: 2,
    numero: 14,
    label: 'Años de Experiencia',
    descripcion: 'Liderando el sector desde 2010',
    icon: '📅'
  },
  {
    id: 3,
    numero: 50,
    sufijo: '+',
    label: 'Profesionales Expertos',
    descripcion: 'El mejor talento del país',
    icon: '👥'
  },
  {
    id: 4,
    numero: 98,
    sufijo: '%',
    label: 'Satisfacción del Cliente',
    descripcion: 'Compromiso con la excelencia',
    icon: '⭐'
  }
];

export default function EstadisticasAnimadas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [counters, setCounters] = useState<number[]>(estadisticas.map(() => 0));

  useGSAP(() => {
    if (!containerRef.current) return;

    // Animación de entrada
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        // Animar las tarjetas
        gsap.from('.stat-card', {
          y: 60,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out'
        });

        // Animar los contadores
        estadisticas.forEach((stat, index) => {
          const counter = { value: 0 };
          gsap.to(counter, {
            value: stat.numero,
            duration: 2,
            delay: index * 0.1,
            ease: 'power2.out',
            onUpdate: () => {
              setCounters(prev => {
                const newCounters = [...prev];
                newCounters[index] = Math.round(counter.value);
                return newCounters;
              });
            }
          });
        });

        // Animar los iconos
        gsap.from('.stat-icon', {
          scale: 0,
          rotation: -180,
          duration: 1,
          stagger: 0.1,
          ease: 'back.out(1.7)',
          delay: 0.3
        });
      }
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {estadisticas.map((stat, index) => (
        <div
          key={stat.id}
          className="stat-card relative bg-card rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group"
        >
          {/* Fondo con gradiente */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Icono */}
          <div className="stat-icon text-6xl mb-4">
            {stat.icon}
          </div>

          {/* Número animado */}
          <div className="relative mb-2">
            <span className="text-5xl font-alliance-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {counters[index]}
              {stat.sufijo}
            </span>
          </div>

          {/* Label */}
          <h4 className="text-xl font-alliance-extrabold text-foreground mb-2">
            {stat.label}
          </h4>

          {/* Descripción */}
          <p className="text-sm font-alliance-medium text-muted-foreground">
            {stat.descripcion}
          </p>

          {/* Efecto de partículas en hover */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-accent/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  left: `${20 + i * 15}%`,
                  top: '100%',
                  animation: 'particle-rise 2s ease-out infinite',
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes particle-rise {
          0% {
            transform: translateY(0) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
            transform: translateY(-20px) scale(1);
          }
          100% {
            transform: translateY(-100px) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}