'use client';

import { useEffect, useRef, useState } from 'react';

interface DynamicLogoGridProps {
  logos: string[];
  title: string;
  subtitle: string;
}

export default function DynamicLogoGrid({ logos, title, subtitle }: DynamicLogoGridProps) {
  const textBlockRef = useRef<HTMLDivElement>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [hiddenIndices, setHiddenIndices] = useState<Set<number>>(new Set());

  // Función para detectar si un logo está realmente detrás del texto
  const isLogoBeindText = (logoRect: DOMRect, textRect: DOMRect, isMobile: boolean): boolean => {
    // Verificar superposición horizontal
    const hasHorizontalOverlap = !(
      logoRect.right < textRect.left ||
      logoRect.left > textRect.right
    );

    if (!hasHorizontalOverlap) return false;

    // CLAVE: Solo ocultar si el logo está en la misma altura o DEBAJO del texto
    // En mobile, ser más conservador (solo ocultar los que realmente coinciden verticalmente)
    if (isMobile) {
      // En mobile: solo ocultar si el centro del logo está dentro del área vertical del texto
      // o muy cerca (±20px de margen)
      const logoCenterY = logoRect.top + logoRect.height / 2;
      const margin = 20;
      return logoCenterY >= (textRect.top - margin) && logoCenterY <= (textRect.bottom + margin);
    } else {
      // En desktop/tablet: ocultar si hay cualquier superposición vertical
      // PERO solo si el logo NO está completamente arriba del texto
      const isCompletelyAbove = logoRect.bottom < textRect.top;
      if (isCompletelyAbove) return false;

      // Tiene superposición vertical
      return !(logoRect.bottom < textRect.top || logoRect.top > textRect.bottom);
    }
  };

  // Función para calcular qué logos están siendo tapados
  const calculateHiddenLogos = () => {
    if (!textBlockRef.current || !gridContainerRef.current) return;

    const textRect = textBlockRef.current.getBoundingClientRect();
    const logoElements = gridContainerRef.current.querySelectorAll('[data-logo-index]');
    const newHiddenIndices = new Set<number>();

    // Detectar si es mobile (ancho < 768px)
    const isMobile = window.innerWidth < 768;

    logoElements.forEach((logoEl) => {
      const logoRect = logoEl.getBoundingClientRect();
      const index = parseInt(logoEl.getAttribute('data-logo-index') || '0', 10);

      if (isLogoBeindText(logoRect, textRect, isMobile)) {
        newHiddenIndices.add(index);
      }
    });

    // Solo actualizar si hay cambios
    if (newHiddenIndices.size !== hiddenIndices.size ||
        ![...newHiddenIndices].every(i => hiddenIndices.has(i))) {
      setHiddenIndices(newHiddenIndices);
    }
  };

  useEffect(() => {
    // Esperar a que las animaciones terminen antes de calcular
    const initialTimeout = setTimeout(() => {
      calculateHiddenLogos();
    }, 3000); // Esperar 3 segundos (después de todas las animaciones)

    // ResizeObserver para detectar cambios de tamaño
    const resizeObserver = new ResizeObserver(() => {
      calculateHiddenLogos();
    });

    if (gridContainerRef.current) {
      resizeObserver.observe(gridContainerRef.current);
    }

    // Listener para cambios de tamaño de ventana
    const handleResize = () => {
      calculateHiddenLogos();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(initialTimeout);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Recalcular cuando hiddenIndices cambie
  useEffect(() => {
    console.log('[DynamicLogoGrid] Hidden logos:', hiddenIndices.size, 'indices:', [...hiddenIndices]);
  }, [hiddenIndices]);

  // Función para generar índices en patrón espiral (horario desde esquina superior izquierda)
  const generateSpiralIndices = (rows: number, cols: number): number[] => {
    const spiral: number[] = [];
    let top = 0, bottom = rows - 1;
    let left = 0, right = cols - 1;

    while (top <= bottom && left <= right) {
      // Ir hacia la derecha (→)
      for (let i = left; i <= right; i++) {
        spiral.push(top * cols + i);
      }
      top++;

      // Ir hacia abajo (↓)
      for (let i = top; i <= bottom; i++) {
        spiral.push(i * cols + right);
      }
      right--;

      // Ir hacia la izquierda (←)
      if (top <= bottom) {
        for (let i = right; i >= left; i--) {
          spiral.push(bottom * cols + i);
        }
        bottom--;
      }

      // Ir hacia arriba (↑)
      if (left <= right) {
        for (let i = bottom; i >= top; i--) {
          spiral.push(i * cols + left);
        }
        left++;
      }
    }

    return spiral;
  };

  // Generar array de logos en orden espiral para grid 11x11
  const maxGridSize = 121; // 11x11 grid for xl screens
  const spiralIndices = generateSpiralIndices(11, 11);
  const gridLogos: string[] = new Array(maxGridSize);

  // Distribuir logos siguiendo el patrón espiral
  for (let i = 0; i < maxGridSize; i++) {
    if (logos.length > 0) {
      const spiralIndex = spiralIndices[i];
      gridLogos[spiralIndex] = logos[i % logos.length];
    }
  }

  return (
    <section className="relative h-screen w-screen bg-gradient-to-br from-primary/10 via-background to-accent/5 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      {/* Dark overlay for header visibility */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/50 via-black/30 to-transparent z-10"></div>

      <div className="relative w-full h-full flex items-center justify-center p-4">
        {/* Grid dinámico que ocupa todo el viewport */}
        <div
          ref={gridContainerRef}
          className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 xl:grid-cols-11 gap-2 sm:gap-3 md:gap-4 w-full h-full max-w-full max-h-full items-center justify-items-center"
        >
          {gridLogos.map((logoUrl, i) => {
            const delay = i * 0.02;
            const isHidden = hiddenIndices.has(i);

            return (
              <div
                key={`logo-${i}`}
                data-logo-index={i}
                className={`group relative w-full h-full flex items-center justify-center animate-fadeInUp transition-opacity duration-300 ${
                  isHidden ? '!opacity-0 pointer-events-none' : ''
                }`}
                style={{
                  animationDelay: `${delay}s`,
                  animationFillMode: 'both',
                  opacity: isHidden ? 0 : undefined
                }}
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-2 sm:p-3 transition-all duration-300 group-hover:shadow-lg group-hover:scale-110 group-hover:border-primary/30">
                  <div className="w-full h-full relative flex items-center justify-center">
                    <img
                      src={logoUrl}
                      alt={`Logo cliente ${i + 1}`}
                      className="max-w-full max-h-full object-contain filter transition-all duration-300 group-hover:brightness-110"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Texto central absoluto */}
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div
            ref={textBlockRef}
            className="text-center px-6 py-8 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl animate-fadeInScale pointer-events-auto"
            style={{ animationDelay: '0.8s', animationFillMode: 'both' }}
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-primary mb-4 leading-tight">
              {title}
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-xs sm:max-w-sm lg:max-w-md mx-auto leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-fadeInUp"
        style={{ animationDelay: '2.5s', animationFillMode: 'both', opacity: 0 }}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          {/* <span className="text-sm font-medium">Scroll para ver más</span>
          <div className="w-1 h-8 bg-primary/30 rounded-full animate-pulse"/> */}
        </div>
      </div>
    </section>
  );
}
