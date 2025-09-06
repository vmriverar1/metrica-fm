'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { ArrowDown, Users, MapPin, Building2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CareersData } from '@/hooks/useCareersData';

// Mapeo de iconos por nombre
const iconMap = {
  Users,
  MapPin,
  Building2,
  Clock,
  ArrowDown
};

interface CareersHeroProps {
  heroData: CareersData['hero'];
}

export default function CareersHero({ heroData }: CareersHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const shadeRef = useRef<HTMLDivElement>(null);
  const [typedTitle, setTypedTitle] = useState('');
  
  // Efecto de escritura para el título
  useEffect(() => {
    if (!heroData.typing_effect.enabled) {
      setTypedTitle(heroData.title);
      return;
    }
    
    let charIndex = 0;
    const typeWriter = setInterval(() => {
      if (charIndex < heroData.title.length) {
        setTypedTitle(heroData.title.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typeWriter);
      }
    }, heroData.typing_effect.speed || 80);

    return () => clearInterval(typeWriter);
  }, [heroData.title, heroData.typing_effect]);

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
          src={heroData.background.image}
          alt="Equipo Métrica FM"
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
        className="absolute inset-0 w-full h-full"
        style={{ 
          backgroundColor: heroData.background.overlay_color,
          opacity: heroData.background.overlay_opacity,
          zIndex: 2 
        }} 
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
              {React.createElement((iconMap as any)[heroData.badge.icon] || Users, { className: 'w-4 h-4 mr-2' })}
              {heroData.badge.text}
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
            {heroData.subtitle}
          </p>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 max-w-4xl mx-auto">
            {heroData.stats.map((stat, index) => {
              const IconComponent = (iconMap as any)[stat.icon] || Building2;
              return (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-white/80 font-medium">
                    {stat.label}
                  </div>
                  <div className="text-xs text-white/60 mt-1">
                    {stat.description}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Call to Actions - Botónes mejorados */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-gradient-to-r from-[#007bc4] to-[#007bc4]/80 hover:from-[#007bc4]/90 hover:to-[#007bc4] text-white font-bold px-8 py-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <Link href={heroData.cta.primary.href}>
                {heroData.cta.primary.text}
                <span className="ml-2">→</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-white/10 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-black hover:border-white font-semibold px-8 py-4 transition-all duration-300">
              <Link href={heroData.cta.secondary.href}>
                {heroData.cta.secondary.text}
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