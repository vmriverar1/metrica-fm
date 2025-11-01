'use client';

import React, { useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import PanoramicScene from './PanoramicScene';
import EmergentCard from './EmergentCard';

const serviciosData = [
  {
    id: 'planificacion',
    titulo: 'Planificación Estratégica',
    descripcion: 'Transformamos visiones en roadmaps ejecutables',
    color: '#003F6F',
    ambiente: 'corporate',
    imagen: 'https://metrica-dip.com/images/slider-inicio-es/01.jpg'
  },
  {
    id: 'gestion',
    titulo: 'Gestión de Proyectos',
    descripcion: 'Lideramos la ejecución con precisión y eficiencia',
    color: '#00A8E8',
    ambiente: 'construction',
    imagen: 'https://metrica-dip.com/images/slider-inicio-es/02.jpg'
  },
  {
    id: 'supervision',
    titulo: 'Supervisión Técnica',
    descripcion: 'Garantizamos calidad en cada detalle',
    color: '#D0D0D0',
    ambiente: 'technical',
    imagen: 'https://metrica-dip.com/images/slider-inicio-es/03.jpg'
  },
  {
    id: 'consultoria',
    titulo: 'Consultoría Especializada',
    descripcion: 'Asesoramiento experto para decisiones críticas',
    color: '#9D9D9C',
    ambiente: 'consulting',
    imagen: 'https://metrica-dip.com/images/slider-inicio-es/04.jpg'
  },
  {
    id: 'ingenieria',
    titulo: 'Ingeniería de Detalle',
    descripcion: 'Diseños técnicos de precisión milimétrica',
    color: '#646363',
    ambiente: 'engineering',
    imagen: 'https://metrica-dip.com/images/slider-inicio-es/05.jpg'
  },
  {
    id: 'innovacion',
    titulo: 'Innovación y Tecnología',
    descripcion: 'Soluciones vanguardistas para el futuro',
    color: '#1D1D1B',
    ambiente: 'innovation',
    imagen: 'https://metrica-dip.com/images/slider-inicio-es/06.jpg'
  }
];

export default function ServiceUniverse() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeService, setActiveService] = useState(0);

  useGSAP(() => {
    if (!sectionRef.current || !containerRef.current) return;

    const section = sectionRef.current;
    const container = containerRef.current;
    
    // Pin la sección durante el scroll de los servicios
    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: `+=${serviciosData.length * window.innerHeight}`,
      pin: true,
      anticipatePin: 1,
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;
        const serviceIndex = Math.floor(progress * serviciosData.length);
        const serviceProgress = (progress * serviciosData.length) % 1;
        
        if (serviceIndex !== activeService && serviceIndex < serviciosData.length) {
          setActiveService(serviceIndex);
        }

        // Rotar el contenedor 180° entre servicios
        const totalRotation = progress * 180 * (serviciosData.length - 1);
        gsap.to(container, {
          rotationY: totalRotation,
          duration: 0.5,
          ease: 'power2.out'
        });

        // Morphing de colores de fondo
        const currentService = serviciosData[serviceIndex] || serviciosData[serviciosData.length - 1];
        const nextService = serviciosData[serviceIndex + 1];
        
        if (nextService && serviceProgress > 0.7) {
          // Transición de color suave
          const mixProgress = (serviceProgress - 0.7) / 0.3;
          gsap.to(section, {
            backgroundColor: gsap.utils.interpolate(currentService.color + '20', nextService.color + '20', mixProgress),
            duration: 0.3
          });
        } else {
          gsap.to(section, {
            backgroundColor: currentService.color + '20',
            duration: 0.3
          });
        }
      }
    });

    // Animación de entrada inicial
    gsap.from('.service-universe-title', {
      y: 100,
      opacity: 0,
      duration: 1.5,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        once: true
      }
    });

  }, { scope: sectionRef });

  return (
    <section 
      ref={sectionRef} 
      className="relative h-screen overflow-hidden"
      style={{ perspective: '1200px' }}
    >
      {/* Título de sección */}
      <div className="service-universe-title absolute top-16 left-1/2 transform -translate-x-1/2 z-30 text-center">
        <h2 className="text-4xl lg:text-6xl font-alliance-extrabold text-white drop-shadow-lg">
          Nuestros Servicios
        </h2>
        <p className="text-lg font-alliance-medium text-white/90 mt-4">
          Cada servicio, un universo de posibilidades
        </p>
      </div>

      {/* Contenedor principal con transformaciones 3D */}
      <div 
        ref={containerRef}
        className="absolute inset-0"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {serviciosData.map((servicio, index) => (
          <div
            key={servicio.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === activeService ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Escena panorámica de fondo */}
            <PanoramicScene 
              servicio={servicio}
              isActive={index === activeService}
            />
            
            {/* Card emergente del servicio */}
            <div className="absolute inset-0 flex items-center justify-center">
              <EmergentCard 
                servicio={servicio}
                isActive={index === activeService}
                delay={index * 0.2}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Indicador de progreso */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <div className="flex space-x-3">
          {serviciosData.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === activeService 
                  ? 'bg-white scale-125' 
                  : 'bg-white/40'
              }`}
            />
          ))}
        </div>
        <p className="text-center text-white/80 font-alliance-light mt-4 text-sm">
          {activeService + 1} / {serviciosData.length}
        </p>
      </div>

      {/* Overlay de transición */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
        style={{
          background: `radial-gradient(circle at center, transparent 40%, ${serviciosData[activeService]?.color}40 100%)`
        }}
      />
    </section>
  );
}