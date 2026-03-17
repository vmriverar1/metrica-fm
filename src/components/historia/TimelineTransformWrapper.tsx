'use client';

import React, { useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import TimelineHorizontal from './TimelineHorizontal';
import CierreTransform from './CierreTransform';

interface TimelineTransformWrapperProps {
  historiaData?: any;
}

export default function TimelineTransformWrapper({ historiaData }: TimelineTransformWrapperProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Buscar elementos por ID
    const timelineSection = document.getElementById('timeline-horizontal-section');
    const cierreSection = document.getElementById('cierre-transform-section');

    if (!timelineSection || !cierreSection) {
      return;
    }

    // Crear la animación
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: cierreSection,
        start: 'top 90%',     // Cuando el 10% superior de cierre es visible
        end: 'top 50%',       // Termina cuando llega a la mitad
        scrub: true,          // Sincronizado con scroll - true es más robusto que 1
        markers: false,
        id: 'shrink-timeline',
      }
    });

    // Configurar el timeline para la transformación
    gsap.set(timelineSection, {
      transformOrigin: 'center bottom'
    });

    // Buscar el progress indicator y asegurar estado inicial
    const progressIndicator = timelineSection.querySelector('.progress-indicator');
    
    // Asegurar que el progress indicator esté visible inicialmente
    if (progressIndicator) {
      gsap.set(progressIndicator, { opacity: 1, y: 0 });
    }
    
    // Animación usando scale en lugar de width para mantener el centrado
    tl.to(timelineSection, {
      scaleX: 0.65,
      scaleY: 0.45,
      duration: 1,
      ease: 'power2.inOut',
    });
    
    // Hacer desaparecer el progress indicator al mismo tiempo - con reversibilidad
    if (progressIndicator) {
      tl.to(progressIndicator, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: 'power2.inOut'
      }, 0);
    }

    // Crear un trigger separado para restaurar el progress indicator cuando regresamos
    ScrollTrigger.create({
      trigger: timelineSection,
      start: 'bottom bottom', // Cuando el bottom del timeline toca el bottom del viewport
      end: 'top top',         // Hasta que el top del timeline toca el top del viewport
      onEnter: () => {
        if (progressIndicator) {
          gsap.to(progressIndicator, {
            opacity: 1,
            y: 0,
            duration: 0.3,
            ease: 'power2.out'
          });
        }
      },
      onEnterBack: () => {
        if (progressIndicator) {
          gsap.to(progressIndicator, {
            opacity: 1,
            y: 0,
            duration: 0.3,
            ease: 'power2.out'
          });
        }
      },
      markers: false,
      id: 'restore-progress-indicator'
    });

    // Refresh después de un momento por si hay problemas de timing
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);

  }, { scope: wrapperRef });

  return (
    <div ref={wrapperRef} className="relative">
      {/* Timeline que se achicará */}
      <TimelineHorizontal historiaData={historiaData} />
      
      {/* Sección que activa la transformación */}
      <CierreTransform historiaData={historiaData} />
    </div>
  );
}