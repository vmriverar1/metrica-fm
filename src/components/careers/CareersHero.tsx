'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { useCareers } from '@/contexts/CareersContext';
import { getCareersStats } from '@/types/careers';
import { ArrowDown, Users, MapPin, Building2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CareersHero() {
  const { jobCount } = useCareers();
  const stats = getCareersStats();
  
  const sectionRef = useRef<HTMLElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const shadeRef = useRef<HTMLDivElement>(null);
  const [typedTitle, setTypedTitle] = useState('');
  
  const title = 'Únete a Métrica DIP';
  
  // Efecto de escritura para el título
  useEffect(() => {
    let charIndex = 0;
    const typeWriter = setInterval(() => {
      if (charIndex < title.length) {
        setTypedTitle(title.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typeWriter);
      }
    }, 80);

    return () => clearInterval(typeWriter);
  }, [title]);

  useGSAP(() => {
    if (!sectionRef.current) return;

    // Animación inicial de entrada
    const mainTl = gsap.timeline();
    
    mainTl.from(backgroundRef.current, {
      scale: 1.3,
      duration: 2,
      ease: 'power3.out'
    })
    .from(textRef.current, {
      y: 100,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.out'
    }, 0.8);

    // Efectos de scroll
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      
      // Shade/overlay opacity
      const shadeOpacity = scrollTop / 500;
      if (shadeRef.current) {
        gsap.set(shadeRef.current, {
          opacity: Math.min(shadeOpacity, 0.8)
        });
      }
      
      // Background scale
      const scaleValue = scrollTop * 0.0004 + 1;
      if (backgroundRef.current) {
        gsap.set(backgroundRef.current, {
          scale: scaleValue,
          transformOrigin: 'center center'
        });
      }
      
      // Text movement
      const textOffset = scrollTop * 0.2 + 1;
      if (textRef.current) {
        textRef.current.style.marginTop = `${textOffset}px`;
        textRef.current.style.transform = `translateY(${textOffset}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);

  }, { scope: sectionRef });

  return (
    <section 
      ref={sectionRef} 
      className="relative h-screen overflow-hidden"
    >
      {/* Background Image */}
      <div 
        ref={backgroundRef}
        className="absolute inset-0 w-full h-full"
        style={{ 
          transform: 'scale(1)',
          zIndex: 1
        }}
      >
        <Image
          src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&h=800"
          alt="Equipo Métrica DIP"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Shade/overlay progresivo */}
      <div 
        ref={shadeRef}
        className="absolute inset-0 w-full h-full bg-black"
        style={{ 
          opacity: 0,
          zIndex: 3
        }}
      />

      {/* Overlay base inicial - más oscuro para mejor contraste */}
      <div 
        className="absolute inset-0 w-full h-full bg-black/70" 
        style={{ zIndex: 2 }} 
      />

      {/* Contenido principal */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center" style={{ zIndex: 5 }}>
        <div 
          ref={textRef} 
          className="relative text-center px-4 max-w-5xl mx-auto"
          style={{ marginTop: '0px' }}
        >
          {/* Badge principal */}
          <div className="mb-6">
            <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm font-medium">
              <Users className="w-4 h-4 mr-2" />
              Construye tu carrera con nosotros
            </Badge>
          </div>

          {/* Título principal */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl tracking-tight text-white mb-6 font-black">
            <span className="block text-white font-black" style={{ textShadow: '0 0 30px rgba(255, 255, 255, 0.3)' }}>
              {typedTitle}
              <span className="animate-pulse text-white">|</span>
            </span>
          </h1>
          
          {/* Subtítulo */}
          <p className="max-w-3xl mx-auto text-xl md:text-2xl text-white/90 font-medium mb-8">
            Forma parte del equipo líder en gestión integral de proyectos de infraestructura en Perú
          </p>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {stats.totalPositions}
              </div>
              <div className="text-sm text-white/80 font-medium">
                Posiciones Abiertas
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {stats.totalCategories}
              </div>
              <div className="text-sm text-white/80 font-medium">
                Áreas Profesionales
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {stats.topLocations.length}
              </div>
              <div className="text-sm text-white/80 font-medium">
                Ubicaciones
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                15+
              </div>
              <div className="text-sm text-white/80 font-medium">
                Años de Experiencia
              </div>
            </div>
          </div>

          {/* Call to Actions - Botónes mejorados */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-gradient-to-r from-[#E84E0F] to-[#E84E0F]/80 hover:from-[#E84E0F]/90 hover:to-[#E84E0F] text-white font-bold px-8 py-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <Link href="#careers-content">
                Ver Oportunidades
                <span className="ml-2">→</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-white/10 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-black hover:border-white font-semibold px-8 py-4 transition-all duration-300">
              <Link href="#company-benefits">
                Conoce los Beneficios
              </Link>
            </Button>
          </div>


          {/* Año de fondo sutil */}
          <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 text-8xl lg:text-9xl font-alliance-extrabold text-white/5 pointer-events-none select-none -z-10">
            2025
          </div>
        </div>
      </div>

      {/* Features destacadas */}
      <div className="absolute bottom-20 left-0 right-0 px-4" style={{ zIndex: 6 }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-white" />
                <div>
                  <div className="text-white font-medium text-sm">Crecimiento Profesional</div>
                  <div className="text-white/70 text-xs">Desarrollo continuo de carrera</div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-white" />
                <div>
                  <div className="text-white font-medium text-sm">Proyectos de Impacto</div>
                  <div className="text-white/70 text-xs">Infraestructura que transforma</div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-white" />
                <div>
                  <div className="text-white font-medium text-sm">Balance Vida-Trabajo</div>
                  <div className="text-white/70 text-xs">Flexibilidad y bienestar</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Indicador de scroll */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce" style={{ zIndex: 10 }}>
        <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>

      {/* Efectos decorativos */}
      <div className="absolute top-1/4 left-10 w-20 h-20 border-2 border-accent/20 rounded-full animate-pulse" style={{ zIndex: 6 }} />
      <div className="absolute bottom-1/4 right-10 w-32 h-32 border-2 border-primary/20 rotate-45 animate-pulse" style={{ zIndex: 6 }} />
    </section>
  );
}