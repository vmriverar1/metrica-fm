'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { TrendingUp, Calendar, Users, Star, ArrowRight } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';

const stats = [
  { icon: TrendingUp, end: 200, label: 'Proyectos Exitosos', suffix: '+' },
  { icon: Calendar, end: 14, label: 'Años de Experiencia', suffix: '' },
  { icon: Users, end: 50, label: 'Profesionales Especializados', suffix: '+' },
  { icon: Star, end: 98, label: 'Satisfacción del Cliente', suffix: '%' },
];

const StatCard = ({ stat, index }: { stat: typeof stats[0], index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLParagraphElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  
  useGSAP(() => {
    if (!cardRef.current || !numberRef.current) return;
    
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: cardRef.current,
        start: 'top 95%',
        toggleActions: 'play none none reverse'
      }
    });
    
    // Animate card entrance
    tl.from(cardRef.current, {
      y: 60,
      opacity: 0,
      duration: 0.8,
      delay: index * 0.1,
      ease: 'power3.out'
    })
    // Animate icon
    .from(iconRef.current, {
      scale: 0,
      rotation: 180,
      duration: 0.6,
      ease: 'back.out(1.7)'
    }, '-=0.4')
    // Counter animation
    .to(numberRef.current, {
      textContent: stat.end,
      duration: 2,
      ease: 'power2.out',
      snap: { textContent: 1 },
      onUpdate: function() {
        if (numberRef.current) {
          numberRef.current.textContent = Math.floor(Number(numberRef.current.textContent)) + stat.suffix;
        }
      }
    }, '-=0.4');
    
    // Hover animation for icon
    if (iconRef.current && cardRef.current) {
      const iconElement = iconRef.current.querySelector('svg');
      if (iconElement) {
        const iconHover = gsap.to(iconElement, {
          scale: 1.2,
          duration: 0.3,
          paused: true,
          ease: 'power2.out'
        });
        
        cardRef.current.addEventListener('mouseenter', () => iconHover.play());
        cardRef.current.addEventListener('mouseleave', () => iconHover.reverse());
      }
    }
    
  }, { scope: cardRef });
  
  return (
    <div ref={cardRef} className="text-center p-4 cursor-pointer transition-colors hover:bg-accent/5">
      <div ref={iconRef} className="inline-block">
        <stat.icon className="h-12 w-12 text-accent mx-auto mb-4" />
      </div>
      <p ref={numberRef} className="text-4xl font-alliance-extrabold text-foreground">
        0{stat.suffix}
      </p>
      <p className="text-foreground/70 mt-2 font-alliance-medium">{stat.label}</p>
    </div>
  );
};

export default function CierreTransform() {
  const sectionRef = useRef<HTMLElement>(null);
  
  useGSAP(() => {
    if (!sectionRef.current) return;
    
    // Animación de entrada para el título
    gsap.from('.section-title', {
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      },
      y: 40,
      opacity: 0,
      duration: 1,
      ease: 'power3.out'
    });
    
  }, { scope: sectionRef });
  
  return (
    <>
      <section ref={sectionRef} id="cierre-transform-section" className="relative py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-4xl md:text-5xl font-alliance-extrabold text-center text-primary mb-16">
            Nuestra Trayectoria
          </h2>
          
          <div className="w-[80vw] md:w-[65vw] mx-auto">
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-border/10 shadow-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border/50">
                {stats.map((stat, index) => (
                  <StatCard key={stat.label} stat={stat} index={index} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
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