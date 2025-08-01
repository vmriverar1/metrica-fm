'use client';

import React from 'react';

interface Hito {
  id: number;
  year: string;
  title: string;
}

interface ProgressIndicatorProps {
  progress: number;
  hitos: Hito[];
  activeIndex: number;
  onDotClick: (index: number) => void;
}

export default function ProgressIndicator({ 
  progress, 
  hitos, 
  activeIndex,
  onDotClick 
}: ProgressIndicatorProps) {
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-background/80 backdrop-blur-sm border-t border-border">
      <div className="relative h-20 flex items-center">
        {/* Barra de progreso de fondo */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-muted" />
        
        {/* Barra de progreso activa */}
        <div 
          className="absolute top-0 left-0 h-1 bg-accent transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />

        {/* Indicadores de hitos */}
        <div className="relative w-full max-w-7xl mx-auto px-8">
          <div className="flex justify-between items-center h-20">
            {hitos.map((hito, index) => {
              const position = (index / (hitos.length - 1)) * 100;
              const isActive = index === activeIndex;
              const isPassed = (index / (hitos.length - 1)) * 100 <= progress;

              return (
                <button
                  key={hito.id}
                  onClick={() => onDotClick(index)}
                  className="group relative flex flex-col items-center gap-2 transition-all duration-300"
                  style={{ 
                    position: index === 0 || index === hitos.length - 1 ? 'relative' : 'absolute',
                    left: index === 0 || index === hitos.length - 1 ? 'auto' : `${position}%`,
                    transform: index === 0 || index === hitos.length - 1 ? 'none' : 'translateX(-50%)'
                  }}
                >
                  {/* Año */}
                  <span className={`text-sm font-alliance-medium transition-all duration-300 ${
                    isActive ? 'text-accent font-alliance-extrabold' : 
                    isPassed ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {hito.year}
                  </span>

                  {/* Punto indicador */}
                  <div className="relative">
                    <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      isActive ? 'bg-accent scale-150' : 
                      isPassed ? 'bg-foreground' : 'bg-muted-foreground'
                    }`} />
                    
                    {/* Pulse effect para el activo */}
                    {isActive && (
                      <div className="absolute inset-0 w-3 h-3 rounded-full bg-accent animate-ping" />
                    )}
                  </div>

                  {/* Título en hover */}
                  <span className={`absolute bottom-full mb-2 text-xs font-alliance-medium whitespace-nowrap transition-all duration-300 ${
                    isActive ? 'opacity-100 text-foreground' : 'opacity-0 group-hover:opacity-100 text-muted-foreground'
                  }`}>
                    {hito.title}
                  </span>

                  {/* Línea vertical al hacer hover */}
                  <div className={`absolute bottom-full mb-8 w-px h-screen bg-accent/20 transition-opacity duration-300 ${
                    isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Porcentaje de progreso */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2">
          <span className="text-sm font-alliance-medium text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
    </div>
  );
}