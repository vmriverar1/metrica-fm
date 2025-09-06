'use client';

import React from 'react';

interface FloatingElementsProps {
  velocity: number;
  activeIndex: number;
}

export default function FloatingElements({ velocity, activeIndex }: FloatingElementsProps) {
  return (
    <div className="fixed inset-0 pointer-events-none z-5">
      {/* Líneas de velocidad */}
      <div 
        className="absolute inset-0 opacity-0 transition-opacity duration-300"
        style={{ 
          opacity: velocity > 1 ? velocity * 0.1 : 0,
        }}
      >
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute h-px bg-white/20"
            style={{
              top: `${Math.random() * 100}%`,
              left: 0,
              right: 0,
              transform: `scaleX(${0.5 + Math.random() * 0.5})`,
              transformOrigin: 'left center'
            }}
          />
        ))}
      </div>

      {/* Elementos geométricos flotantes */}
      <div className="absolute inset-0">
        {/* Círculos */}
        <div
          className="absolute w-40 h-40 rounded-full border border-accent/20"
          style={{
            top: '20%',
            left: `${10 + activeIndex * 5}%`,
            transform: `translate(-50%, -50%) scale(${1 + velocity * 0.1})`,
            transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
        
        {/* Cuadrados */}
        <div
          className="absolute w-20 h-20 border border-primary/20 rotate-45"
          style={{
            bottom: '30%',
            right: `${10 + activeIndex * 5}%`,
            transform: `translate(50%, 50%) rotate(${45 + activeIndex * 30}deg)`,
            transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />

        {/* Triángulos */}
        <div
          className="absolute w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-b-[50px] border-b-accent/20"
          style={{
            top: '60%',
            left: `${50 + activeIndex * 3}%`,
            transform: `translate(-50%, -50%) rotate(${activeIndex * 60}deg)`,
            transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </div>

      {/* Partículas dinámicas */}
      <div className="absolute inset-0">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/50 rounded-full"
            style={{
              left: `${(activeIndex * 15 + i * 10) % 100}%`,
              top: `${Math.sin(activeIndex + i) * 50 + 50}%`,
              transform: `scale(${1 + Math.sin(activeIndex + i) * 0.5})`,
              transition: 'all 2s ease-out'
            }}
          />
        ))}
      </div>

      {/* Gradientes móviles */}
      <div 
        className="absolute w-96 h-96 rounded-full blur-3xl"
        style={{
          background: activeIndex % 2 === 0 ? 'radial-gradient(circle, rgba(0,123,196,0.1) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(0,63,111,0.1) 0%, transparent 70%)',
          top: '50%',
          left: `${20 + activeIndex * 10}%`,
          transform: 'translate(-50%, -50%)',
          transition: 'all 2s ease-out'
        }}
      />
    </div>
  );
}