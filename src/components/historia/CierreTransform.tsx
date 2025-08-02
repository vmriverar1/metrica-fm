'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { ArrowRight } from 'lucide-react';

export default function CierreTransform() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const heroWrapperRef = useRef<HTMLDivElement>(null);
  const heroImageWrapperRef = useRef<HTMLDivElement>(null);
  const heroBackgroundRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const heroOverlayRef = useRef<HTMLDivElement>(null);
  const newContentRef = useRef<HTMLDivElement>(null);
  const countersRef = useRef<HTMLDivElement>(null);
  const [counters, setCounters] = useState({
    proyectos: 0,
    años: 0,
    profesionales: 0,
    satisfaccion: 0
  });

  useGSAP(() => {
    if (!sectionRef.current || !heroImageWrapperRef.current) return;

    // Configuración inicial
    gsap.set(newContentRef.current, { opacity: 0 });
    
    // Timeline principal con efecto hero transform
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=100%",
        scrub: 1,
        pin: true,
        anticipatePin: 1,
      }
    });
    
    // Configurar posición inicial
    gsap.set(heroImageWrapperRef.current, {
      position: "absolute",
      left: "50%",
      top: "50%",
      xPercent: -50,
      yPercent: -50,
      transformOrigin: "center center"
    });
    
    // Transformación del hero
    tl.to(heroImageWrapperRef.current, {
      scaleX: 0.6,
      scaleY: 0.45,
      yPercent: -27.5,
      ease: "power2.inOut"
    }, 0);
    
    // Zoom del fondo
    tl.to(heroBackgroundRef.current, {
      scale: 1.1,
      ease: "none"
    }, 0);
    
    // Fade out del contenido original
    tl.to(heroContentRef.current, {
      opacity: 0,
      y: -50,
      ease: "power2.in",
      duration: 0.5
    }, 0);
    
    // Fade in del nuevo contenido
    tl.fromTo(newContentRef.current, 
      {
        opacity: 0,
        y: 30
      },
      {
        opacity: 1,
        y: 0,
        ease: "power2.out",
        duration: 0.8
      }, 
      0.3
    );

    // Animar contadores
    ScrollTrigger.create({
      trigger: countersRef.current,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.to(counters, {
          proyectos: 200,
          años: 14,
          profesionales: 50,
          satisfaccion: 98,
          duration: 2,
          ease: 'power2.out',
          onUpdate: function() {
            setCounters({
              proyectos: Math.floor(this.targets()[0].proyectos),
              años: Math.floor(this.targets()[0].años),
              profesionales: Math.floor(this.targets()[0].profesionales),
              satisfaccion: Math.floor(this.targets()[0].satisfaccion)
            });
          }
        });
      }
    });

  }, { scope: sectionRef });

  return (
    <>
      {/* Sección de transformación tipo hero */}
      <section ref={sectionRef} className="relative">
        <div ref={containerRef} className="relative min-h-screen bg-background">
          <div ref={heroWrapperRef} className="relative h-screen w-full overflow-hidden">
            <div ref={heroImageWrapperRef} className="w-full h-full">
              <div ref={heroBackgroundRef} className="relative w-full h-full">
                <Image
                  src="https://metrica-dip.com/images/slider-inicio-es/05.jpg"
                  alt="Métrica - Trayectoria"
                  fill
                  className="object-cover"
                  priority
                />
                <div ref={heroOverlayRef} className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
              </div>
              
              {/* Contenido original que desaparece */}
              <div ref={heroContentRef} className="absolute inset-0 flex items-center justify-center z-10">
                <div className="text-center px-4">
                  <h2 className="text-5xl md:text-7xl font-alliance-extrabold text-white mb-4">
                    14 Años de Historia
                  </h2>
                  <p className="text-xl md:text-2xl text-white/80">
                    Continuamos escribiendo nuevos capítulos
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Nuevo contenido con contadores */}
          <div 
            ref={newContentRef}
            className="absolute inset-0 flex items-center justify-center z-20"
          >
            <div ref={countersRef} className="text-center">
              <h2 className="text-5xl md:text-7xl font-alliance-extrabold text-primary mb-12">
                Nuestra Trayectoria
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 px-8">
                {/* Proyectos */}
                <div className="text-center">
                  <div className="text-6xl md:text-7xl font-alliance-extrabold text-primary mb-2">
                    {counters.proyectos}+
                  </div>
                  <div className="text-lg md:text-xl text-muted-foreground font-alliance-medium">
                    Proyectos<br />Exitosos
                  </div>
                </div>

                {/* Años */}
                <div className="text-center">
                  <div className="text-6xl md:text-7xl font-alliance-extrabold text-primary mb-2">
                    {counters.años}
                  </div>
                  <div className="text-lg md:text-xl text-muted-foreground font-alliance-medium">
                    Años de<br />Experiencia
                  </div>
                </div>

                {/* Profesionales */}
                <div className="text-center">
                  <div className="text-6xl md:text-7xl font-alliance-extrabold text-primary mb-2">
                    {counters.profesionales}+
                  </div>
                  <div className="text-lg md:text-xl text-muted-foreground font-alliance-medium">
                    Profesionales<br />Especializados
                  </div>
                </div>

                {/* Satisfacción */}
                <div className="text-center">
                  <div className="text-6xl md:text-7xl font-alliance-extrabold text-primary mb-2">
                    {counters.satisfaccion}%
                  </div>
                  <div className="text-lg md:text-xl text-muted-foreground font-alliance-medium">
                    Satisfacción<br />del Cliente
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final - Sección separada */}
      <section className="relative bg-background py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl md:text-5xl font-alliance-extrabold text-primary mb-8">
            ¿Listo para construir el futuro juntos?
          </h3>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Únete a más de 200 proyectos exitosos que han transformado la infraestructura del Perú.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              href="/services"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-full font-alliance-medium hover:bg-primary/90 transition-all duration-300 hover:scale-105"
            >
              <span>Conoce nuestros servicios</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
            
            <Link 
              href="/contact"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-accent text-white rounded-full font-alliance-medium hover:bg-accent/90 transition-all duration-300 hover:scale-105"
            >
              <span>Contáctanos</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}