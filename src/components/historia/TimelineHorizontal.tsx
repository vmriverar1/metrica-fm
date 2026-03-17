'use client';

import React, { useRef, useState, useEffect } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import HitoFullScreen from './HitoFullScreen';
import ProgressIndicator from './ProgressIndicator';
import HitoPanel from './HitoPanel';
import FloatingElements from './FloatingElements';
import FinalImage from './FinalImage';

interface TimelineHorizontalProps {
  historiaData?: any;
}

// Función optimizada para generar datos extendidos dinámicamente
const generateExtendedData = (timelineEvents: any[]) => {
  const hitosExtendidos: { [key: number]: any } = {};
  
  timelineEvents.forEach((event, index) => {
    const eventIndex = index + 1;
    hitosExtendidos[eventIndex] = {
      longDescription: event.description || 'Descripción no disponible',
      achievements: [
        { number: event.metrics?.team_size?.toString() || '0', label: 'Profesionales' },
        { number: event.metrics?.projects?.toString() || '0', label: 'Proyectos' },
        { number: event.metrics?.investment || 'N/A', label: 'Inversión' },
        { number: `${event.year}`, label: 'Año' }
      ],
      gallery: event.gallery && event.gallery.length > 0 
        ? event.gallery.filter(img => img && img.trim() !== '') 
        : [event.image, event.image_fallback].filter(img => img && img.trim() !== ''),
      quote: event.impact || '',
      quoteAuthor: 'Métrica FM'
    };
  });
  
  return hitosExtendidos;
};

// Función para crear fallback mínimo si no hay datos
const getEmptyTimeline = () => ({
  hitosExtendidos: {},
  hitosData: []
});

export default function TimelineHorizontal({ historiaData }: TimelineHorizontalProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [velocity, setVelocity] = useState(0);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  
  // Usar SOLO datos del JSON - sin fallbacks hardcodeados
  const timelineEvents = historiaData?.timeline_events || [];
  
  // Generar datos extendidos dinámicamente
  const hitosExtendidos = timelineEvents.length > 0 
    ? generateExtendedData(timelineEvents) 
    : {};
  
  // Crear hitos dinámicos basados ÚNICAMENTE en el JSON
  const hitosData = timelineEvents.length > 0
    ? timelineEvents.map((event: any, index: number) => ({
        id: index + 1,
        year: event.year.toString(),
        title: event.title || 'Sin título',
        subtitle: event.subtitle || 'Sin subtítulo',
        description: event.description || '',
        image: event.image || event.image_fallback || '',
        highlights: Array.isArray(event.achievements) && event.achievements.length > 0
          ? event.achievements.slice(0, 3)
          : []
      }))
    : [];
    
  // Referencias para funcionalidad auxiliar
  const isInSectionRef = useRef(false);

  useGSAP(() => {
    if (!sectionRef.current || !wrapperRef.current) return;

    const section = sectionRef.current;
    const wrapper = wrapperRef.current;
    const totalWidth = (hitosData.length - 1) * 100; // Porcentaje total de desplazamiento
    
    // Animación de revelado cuando entramos a la sección
    if (revealRef.current) {
      const revealTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 80%', // Empieza más tarde
          end: 'top top',   // Termina cuando el timeline está completamente visible
          scrub: 1,
          onUpdate: undefined,
          onEnter: () => {
            // Optional: handle when entering the trigger
          },
          onLeave: () => {
            if (revealRef.current) {
              gsap.set(revealRef.current, { display: 'none' });
            }
          },
          onEnterBack: () => {
            if (revealRef.current) {
              gsap.set(revealRef.current, { display: 'block', opacity: 1 });
            }
          },
          onLeaveBack: undefined
        }
      });

      // Primera parte: el overlay se mantiene negro sólido
      revealTimeline
        .set(revealRef.current, { opacity: 1, display: 'block' })
        .to(revealRef.current, {
          opacity: 0.9,
          duration: 0.3,
          ease: 'power2.in'
        })
        .to(revealRef.current, {
          opacity: 0,
          duration: 0.7,
          ease: 'power2.out'
        });
    }

    // Timeline principal con ScrollTrigger - Scroll horizontal fluido
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${window.innerHeight * hitosData.length}`, // Incluir imagen final: n transiciones
        scrub: 1, // Scroll fluido sin interrupciones
        pin: true,
        // SIN SNAP - movimiento completamente fluido
        onUpdate: (self) => {
          const newProgress = self.progress * 100;
          setProgress(newProgress);
          
          // Actualizar índice activo basado en progreso, incluyendo imagen final
          const exactIndex = self.progress * hitosData.length;
          const roundedIndex = Math.round(exactIndex);
          const clampedIndex = Math.max(0, Math.min(roundedIndex, hitosData.length));
          
          // Solo actualizar si cambió el índice redondeado
          if (clampedIndex !== activeIndex) {
            setActiveIndex(clampedIndex);
          }
          
          // Velocidad para otros efectos (sin blur)
          const currentVelocity = Math.abs(self.getVelocity() / 1000);
          setVelocity(Math.min(currentVelocity, 3));
        },
        onScrubComplete: () => {
          setVelocity(0);
        }
      }
    });

    // Guardar referencia al ScrollTrigger
    scrollTriggerRef.current = tl.scrollTrigger ?? null;

    // Animación horizontal del timeline - Fluida y continua (incluye imagen final)
    tl.to(wrapper, {
      x: () => `-${(hitosData.length - 0.4) * window.innerWidth}px`, // Termina justo después de mostrar la imagen final completa
      ease: 'none', // Linear para movimiento fluido constante
      duration: 1
    });
    
    
  }, { scope: sectionRef });


  const handleDotClick = (index: number) => {
    // Navegación por dots - Permite saltar a cualquier hito específico
    const st = scrollTriggerRef.current;
    if (!st || index === activeIndex) return;

    const targetProgress = index / hitosData.length; // Ajustado para incluir imagen final
    const targetScroll = st.start + (st.end - st.start) * targetProgress;
    
    // Scroll suave hacia la posición del hito seleccionado
    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
  };

  // Si no hay datos del JSON, mostrar mensaje informativo
  if (hitosData.length === 0) {
    return (
      <section 
        id="timeline-horizontal-section"
        className="relative bg-background overflow-hidden flex items-center justify-center"
        style={{ height: '100vh' }}
      >
        <div className="text-center">
          <div className="mb-4">
            <h2 className="text-3xl font-bold text-foreground mb-2">Timeline no disponible</h2>
            <p className="text-foreground/70">No se encontraron eventos históricos en el archivo JSON.</p>
            <p className="text-sm text-foreground/50 mt-2">
              Por favor, configure los eventos en el administrador.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      ref={sectionRef} 
      id="timeline-horizontal-section"
      className="relative bg-background overflow-hidden"
      style={{ height: '100vh' }}
    >
        {/* Capa de revelado negro con degradado que se desvanece */}
        <div 
          ref={revealRef}
          className="absolute inset-0 z-40 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, transparent 0%, rgba(0,0,0,0.4) 15%, rgba(0,0,0,0.8) 30%, black 50%, black 100%)'
          }}
        />

        {/* Efectos de transición cinematográfica */}
        <div className="fixed inset-0 pointer-events-none z-10">
        {/* Barras cinematográficas */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Viñeta */}
        <div className="absolute inset-0 bg-radial-gradient" style={{
          background: 'radial-gradient(circle at center, transparent 50%, rgba(0,0,0,0.3) 100%)'
        }} />
      </div>

      {/* Elementos flotantes que acompañan el movimiento */}
      <FloatingElements velocity={velocity} activeIndex={activeIndex} />
      {/* Progress Indicator - Contenedor para animación de transformación */}
      <div className="progress-indicator">
        <ProgressIndicator 
          progress={progress} 
          hitos={hitosData} 
          activeIndex={activeIndex}
          onDotClick={handleDotClick}
        />
      </div>

      {/* Timeline Wrapper - Sin efectos de blur */}
      <div 
        ref={wrapperRef}
        className="flex h-full"
        // Width se maneja automáticamente por flex y los hijos w-screen
      >
        {hitosData.map((hito, index) => (
          <HitoFullScreen 
            key={hito.id} 
            hito={hito} 
            index={index}
            isActive={index === activeIndex}
            showPanel={showPanel && index === activeIndex}
            onTogglePanel={() => setShowPanel(!showPanel)}
          />
        ))}
        
        {/* Imagen final */}
        <FinalImage
          isActive={activeIndex === hitosData.length}
          finalImage={historiaData?.final_image}
        />
      </div>

      {/* Overlay oscuro cuando el panel está abierto */}
      {showPanel && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] transition-opacity duration-300"
          onClick={() => setShowPanel(false)}
        />
      )}

      {/* Panel lateral con información detallada */}
      {hitosData.map((hito, index) => (
        <HitoPanel
          key={hito.id}
          isActive={index === activeIndex && showPanel}
          hitoData={hitosExtendidos[hito.id as keyof typeof hitosExtendidos]}
          color={index % 2 === 0 ? '#00A8E8' : '#003F6F'}
          onClose={() => setShowPanel(false)}
        />
      ))}
    </section>
  );
}