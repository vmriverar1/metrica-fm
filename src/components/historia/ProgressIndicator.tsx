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
    <div className="fixed bottom-8 inset-x-0 z-30 animate-[fadeInUp_1s_ease-out_1.5s_both]">
      <div className="flex justify-center">
        <div className="relative">
        {/* Contenedor principal con diseño minimalista */}
        <div className="flex items-center gap-3 bg-black/20 backdrop-blur-xl rounded-full px-6 py-3 shadow-2xl border border-white/10 relative">
          {/* Efecto de brillo sutil */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-200%] animate-[shimmer_3s_ease-in-out_infinite] rounded-full" />
          
          {/* Año actual grande a la izquierda */}
          <div className="pr-6 border-r border-white/20">
            <span className="text-2xl font-alliance-extrabold text-white tabular-nums">
              {hitos[activeIndex]?.year}
            </span>
          </div>

          {/* Navegación minimalista con líneas */}
          <div className="flex items-center gap-1 overflow-visible">
            {hitos.map((hito, index) => {
              const isActive = index === activeIndex;
              const isPassed = index < activeIndex;
              
              return (
                <button
                  key={hito.id}
                  onClick={() => onDotClick(index)}
                  className="group relative p-2 transition-all duration-300"
                  aria-label={`Ir a ${hito.year} - ${hito.title}`}
                >
                  {/* Línea base para cada hito */}
                  <div 
                    className={`
                      h-px transition-all duration-500 ease-out
                      ${isActive ? 'w-16 bg-white' : isPassed ? 'w-8 bg-white/60' : 'w-8 bg-white/30'}
                      ${isActive ? '' : 'group-hover:w-12 group-hover:bg-white/80'}
                    `}
                  />
                  
                  {/* Indicador vertical activo */}
                  {isActive && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="w-px h-4 bg-white animate-pulse" />
                    </div>
                  )}
                  
                  {/* Tooltip elegante en hover */}
                  <div className={`
                    absolute bottom-full mb-6 left-1/2 -translate-x-1/2 z-50
                    bg-black/90 backdrop-blur-sm rounded-lg px-4 py-3
                    transition-all duration-300 pointer-events-none
                    ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'}
                  `}>
                    <div className="text-sm font-alliance-medium text-white whitespace-nowrap">
                      {hito.title}
                    </div>
                    <div className="text-xs font-alliance-light text-white/70 mt-1">
                      {hito.year}
                    </div>
                    {/* Flecha del tooltip */}
                    <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-0 h-0 
                      border-l-[6px] border-l-transparent
                      border-r-[6px] border-r-transparent
                      border-t-[6px] border-t-black/90" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Contador de progreso circular minimalista */}
          <div className="pl-6 border-l border-white/20">
            <div className="relative w-10 h-10">
              <svg className="w-10 h-10 -rotate-90">
                {/* Círculo de fondo */}
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  className="fill-none stroke-white/20"
                  strokeWidth="2"
                />
                {/* Círculo de progreso */}
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  className="fill-none stroke-white transition-all duration-500 ease-out"
                  strokeWidth="2"
                  strokeDasharray={`${2 * Math.PI * 16}`}
                  strokeDashoffset={`${2 * Math.PI * 16 * (1 - progress / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              {/* Número de hito actual */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-alliance-extrabold text-white">
                  {activeIndex + 1}/{hitos.length}
                </span>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}