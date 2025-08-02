'use client';

import React, { useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import TimelineHorizontal from './TimelineHorizontal';
import CierreTransform from './CierreTransform';

export default function TimelineTransformWrapper() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    console.log('=== INICIANDO SETUP DE SCROLLTRIGGER ===');
    
    // Buscar elementos por ID
    const timelineSection = document.getElementById('timeline-horizontal-section');
    const cierreSection = document.getElementById('cierre-transform-section');
    
    console.log('Timeline section:', timelineSection);
    console.log('Cierre section:', cierreSection);
    
    if (!timelineSection || !cierreSection) {
      console.error('ERROR: No se encontraron las secciones necesarias');
      return;
    }

    console.log('Elementos encontrados correctamente');

    // Verificar el estado inicial
    console.log('Width inicial del timeline:', window.getComputedStyle(timelineSection).width);

    // Crear la animación
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: cierreSection,
        start: 'top 90%',     // Cuando el 10% superior de cierre es visible
        end: 'top 50%',       // Termina cuando llega a la mitad
        scrub: 1,             // Sincronizado con scroll
        markers: false,
        id: 'shrink-timeline',
        onUpdate: (self) => {
          console.log(`ScrollTrigger Progress: ${(self.progress * 100).toFixed(1)}%`);
        },
        onEnter: () => {
          console.log('>>> onEnter: El trigger ha entrado al viewport');
        },
        onLeave: () => {
          console.log('>>> onLeave: El trigger ha salido del viewport');
        },
        onEnterBack: () => {
          console.log('>>> onEnterBack: Volviendo al trigger');
        },
        onLeaveBack: () => {
          console.log('>>> onLeaveBack: Saliendo del trigger hacia arriba');
        }
      }
    });

    // Configurar el timeline para la transformación
    gsap.set(timelineSection, {
      transformOrigin: 'center bottom'
    });

    // Buscar el progress indicator
    const progressIndicator = timelineSection.querySelector('.progress-indicator');
    
    // Animación usando scale en lugar de width para mantener el centrado
    tl.to(timelineSection, {
      scaleX: 0.65,
      scaleY: 0.45,
      duration: 1,
      ease: 'power2.inOut',
      onStart: () => {
        console.log('ANIMACIÓN INICIADA: Escalando timeline a 65% ancho y 45% alto');
      },
      onComplete: () => {
        console.log('ANIMACIÓN COMPLETADA: Timeline transformado');
      }
    });
    
    // Hacer desaparecer el progress indicator al mismo tiempo
    if (progressIndicator) {
      tl.to(progressIndicator, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: 'power2.in'
      }, 0);
    }

    // Verificar que ScrollTrigger esté funcionando
    console.log('ScrollTriggers activos:', ScrollTrigger.getAll().length);

    // Refresh después de un momento por si hay problemas de timing
    setTimeout(() => {
      ScrollTrigger.refresh();
      console.log('ScrollTrigger refreshed');
    }, 500);

  }, { scope: wrapperRef });

  return (
    <div ref={wrapperRef} className="relative">
      {/* Timeline que se achicará */}
      <TimelineHorizontal />
      
      {/* Sección que activa la transformación */}
      <CierreTransform />
    </div>
  );
}