'use client';

import React, { useRef, MouseEvent } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Target, Users, Search, BarChart, Shield, UserCheck } from 'lucide-react';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';

const pillars = [
  {
    icon: Target,
    title: 'Planificación Estratégica',
    description: 'Definimos la hoja de ruta para el éxito del proyecto, optimizando plazos y recursos desde el inicio.',
  },
  {
    icon: Users,
    title: 'Coordinación Multidisciplinaria',
    description: 'Integramos equipos de diseño, construcción y fiscalización para una ejecución sin fisuras.',
  },
  {
    icon: Search,
    title: 'Supervisión Técnica',
    description: 'Garantizamos que cada etapa de la construcción cumpla con los más altos estándares de ingeniería.',
  },
  {
    icon: BarChart,
    title: 'Control de Calidad y Costos',
    description: 'Implementamos un riguroso control para asegurar la calidad de los materiales y la eficiencia del presupuesto.',
  },
  {
    icon: Shield,
    title: 'Gestión de Riesgos',
    description: 'Identificamos y mitigamos proactivamente los posibles riesgos que puedan afectar al proyecto.',
  },
  {
    icon: UserCheck,
    title: 'Representación del Cliente',
    description: 'Actuamos como sus ojos y oídos en el campo, defendiendo sus intereses en cada decisión.',
  },
];

const PillarCard = ({ pillar, index }: { pillar: (typeof pillars)[0], index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  
  // Enhanced 3D card effect with GSAP
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 25;
    const y = (e.clientY - top - height / 2) / 25;
    
    gsap.to(cardRef.current, {
      rotationY: x,
      rotationX: -y,
      scale: 1.05,
      duration: 0.3,
      ease: 'power2.out',
      transformPerspective: 1000
    });
    
    // Animate icon separately
    if (iconRef.current) {
      gsap.to(iconRef.current, {
        rotationY: x * 2,
        rotationX: -y * 2,
        scale: 1.1,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      rotationY: 0,
      rotationX: 0,
      scale: 1,
      duration: 0.5,
      ease: 'power3.out'
    });
    
    if (iconRef.current) {
      gsap.to(iconRef.current, {
        rotationY: 0,
        rotationX: 0,
        scale: 1,
        duration: 0.5,
        ease: 'power3.out'
      });
    }
  };
  
  useGSAP(() => {
    // Entrance animation
    gsap.fromTo(cardRef.current,
      {
        opacity: 0,
        y: 100,
        rotationY: -45,
        scale: 0.8
      },
      {
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        opacity: 1,
        y: 0,
        rotationY: 0,
        scale: 1,
        duration: 1,
        delay: index * 0.15,
        ease: 'power3.out'
      }
    );
    
    // Icon animation
    if (iconRef.current) {
      gsap.fromTo(iconRef.current,
        {
          scale: 0,
          rotation: -180
        },
        {
          scrollTrigger: {
            trigger: cardRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          },
          scale: 1,
          rotation: 0,
          duration: 0.8,
          delay: index * 0.15 + 0.3,
          ease: 'back.out(1.7)'
        }
      );
    }
  }, { scope: cardRef });

  return (
    <Card
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="pillar-card group relative w-[320px] shrink-0 transform-gpu bg-card/80 backdrop-blur-sm border-primary/20 hover:border-accent transition-colors duration-300"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="absolute -inset-px rounded-lg bg-gradient-to-r from-primary to-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
      <div className="relative">
        <CardHeader className="flex flex-row items-center gap-4">
          <div ref={iconRef} className="icon-wrapper">
            <pillar.icon className="h-10 w-10 text-accent transition-colors duration-300 group-hover:text-white" />
          </div>
          <CardTitle className="font-headline text-xl text-foreground transition-colors duration-300 group-hover:text-white">{pillar.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground/80 transition-colors duration-300 group-hover:text-white/90">{pillar.description}</p>
        </CardContent>
      </div>
    </Card>
  );
};

export default function Pillars() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  useGSAP(() => {
    // Section entrance animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    });
    
    // Animate title
    tl.from('.pillars-title', {
      y: 100,
      opacity: 0,
      skewY: 5,
      duration: 1,
      ease: 'power3.out'
    })
    .from('.pillars-subtitle', {
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.5');
    
    // Add continuous subtle animation to title
    gsap.to('.pillars-title', {
      y: -5,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut'
    });
    
    // Horizontal scroll animation on scroll
    if (scrollContainerRef.current) {
      const cards = scrollContainerRef.current.querySelectorAll('.pillar-card');
      const totalWidth = cards.length * 320 + (cards.length - 1) * 32; // card width + gap
      
      gsap.to(scrollContainerRef.current, {
        x: () => -(totalWidth - window.innerWidth + 100),
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${totalWidth}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });
    }
  }, { scope: containerRef });
  
  // Auto-scroll functionality
  useGSAP(() => {
    let autoScrollTween: gsap.core.Tween | null = null;
    
    const startAutoScroll = () => {
      if (!scrollContainerRef.current) return;
      
      autoScrollTween = gsap.to(scrollContainerRef.current, {
        x: -2000,
        duration: 20,
        ease: 'none',
        repeat: -1
      });
    };
    
    const stopAutoScroll = () => {
      if (autoScrollTween) {
        autoScrollTween.kill();
      }
    };
    
    // Start auto-scroll when section is in view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            startAutoScroll();
          } else {
            stopAutoScroll();
          }
        });
      },
      { threshold: 0.5 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      observer.disconnect();
      stopAutoScroll();
    };
  }, { scope: containerRef });

  return (
    <section ref={sectionRef} id="pillars" className="py-24 bg-background overflow-hidden">
      <div ref={containerRef} className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="pillars-title font-headline text-4xl md:text-5xl font-bold">¿Qué es DIP?</h2>
          <p className="pillars-subtitle mt-4 max-w-2xl mx-auto text-lg text-foreground/70">
            Nuestra Dirección Integral de Proyectos (DIP) se fundamenta en seis pilares clave para garantizar la excelencia.
          </p>
        </div>
        <div 
          ref={scrollContainerRef} 
          className="flex gap-8 pb-8 scrollbar-hide" 
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {pillars.map((pillar, index) => (
            <PillarCard key={index} pillar={pillar} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}